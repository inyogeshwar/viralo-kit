import { and, eq, desc } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { decryptToken } from "@/lib/crypto";
import { InstagramProvider } from "@/lib/providers/instagram";
import { acquireRateLimit } from "@/lib/rate-limiter";
import { canReplyInWindow } from "@/lib/messaging-window";
import { withBotDisclosure } from "@/lib/bot-disclosure";

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  triggerValue: string | null;
  matchType: string;
  channel: string;
  responseType: string;
  responseText: string;
  responsePayload: unknown;
  delayMs: number;
  priority: number;
  triggerCount: number;
}

export function matchTextAgainstRules(
  text: string,
  rules: AutomationRule[],
): AutomationRule[] {
  const lower = text.toLowerCase().trim();
  const matches: AutomationRule[] = [];

  for (const rule of rules) {
    if (rule.trigger === "all_dms" || rule.trigger === "all_comments") {
      matches.push(rule);
      continue;
    }

    if (rule.trigger === "keyword" && rule.triggerValue) {
      const keywords = rule.triggerValue.split(",").map((k) => k.trim().toLowerCase());
      let matched = false;

      for (const kw of keywords) {
        if (!kw) continue;
        switch (rule.matchType) {
          case "exact":
            matched = lower === kw;
            break;
          case "starts_with":
            matched = lower.startsWith(kw);
            break;
          case "regex":
            try {
              matched = new RegExp(kw, "i").test(text);
            } catch {
              matched = lower.includes(kw);
            }
            break;
          default: // contains
            matched = lower.includes(kw);
        }
        if (matched) break;
      }

      if (matched) matches.push(rule);
    }
  }

  return matches.sort((a, b) => b.priority - a.priority);
}

export async function processDmAautomation(
  accountId: string,
  senderIgsid: string,
  messageText: string,
  _messageId: string,
) {
  const db = getDb();
  if (!db) return;

  const account = await db.query.socialAccounts.findFirst({
    where: eq(schema.socialAccounts.id, accountId),
  });
  if (!account) return;

  // Rate limit check
  const canProceed = await acquireRateLimit(accountId, "text");
  if (!canProceed) return;

  // Check messaging window
  const windowStatus = await canReplyInWindow(accountId, senderIgsid);
  if (!windowStatus.canReply) return;

  const rules = await db.query.autoReplyRules.findMany({
    where: and(
      eq(schema.autoReplyRules.accountId, accountId),
      eq(schema.autoReplyRules.isActive, true),
    ),
    orderBy: [desc(schema.autoReplyRules.priority)],
  });

  const dmRules = rules.filter((r) => r.channel === "dm");
  const matched = matchTextAgainstRules(messageText, dmRules);
  if (!matched.length) return;

  const bestMatch = matched[0];
  const token = decryptToken(account.accessToken);
  const provider = new InstagramProvider({ igUserId: account.igUserId, accessToken: token });

  if (bestMatch.delayMs > 0) {
    await provider.sendSenderAction(senderIgsid, "typing_on");
    await new Promise((r) => setTimeout(r, bestMatch.delayMs));
  }

  const disclosureEnabled = true;

  try {
    if (bestMatch.responseType === "quick_reply" && bestMatch.responsePayload) {
      const payload = bestMatch.responsePayload as {
        text?: string;
        replies?: Array<{ title: string; payload: string; imageUrl?: string }>;
      };
      const responseText = withBotDisclosure(
        payload.text ?? bestMatch.responseText,
        disclosureEnabled,
      );
      await provider.sendQuickReplies(
        senderIgsid,
        responseText,
        payload.replies ?? [],
      );
    } else if (bestMatch.responseType === "button_template" && bestMatch.responsePayload) {
      const payload = bestMatch.responsePayload as {
        text?: string;
        buttons?: Array<{ type: string; url?: string; title: string; payload?: string }>;
      };
      const responseText = withBotDisclosure(
        payload.text ?? bestMatch.responseText,
        disclosureEnabled,
      );
      await provider.sendButtonTemplate(
        senderIgsid,
        responseText,
        (payload.buttons ?? []) as Parameters<InstagramProvider["sendButtonTemplate"]>[2],
      );
    } else {
      const responseText = withBotDisclosure(bestMatch.responseText, disclosureEnabled);
      // Use human agent tag if outside 24h window but within 7 days
      if (windowStatus.needsHumanAgent) {
        await provider.sendTextMessageHumanAgent(senderIgsid, responseText);
      } else {
        await provider.sendTextMessage(senderIgsid, responseText, {
          messagingType: "RESPONSE",
        });
      }
    }

    await db
      .update(schema.autoReplyRules)
      .set({
        lastTriggeredAt: new Date(),
        triggerCount: (bestMatch as unknown as { triggerCount: number }).triggerCount + 1,
      })
      .where(eq(schema.autoReplyRules.id, bestMatch.id));
  } catch {
    // Silently fail — don't crash webhook
  }
}

export async function processCommentAutomation(
  accountId: string,
  commentId: string,
  commentText: string,
  _mediaId: string,
) {
  const db = getDb();
  if (!db) return;

  const account = await db.query.socialAccounts.findFirst({
    where: eq(schema.socialAccounts.id, accountId),
  });
  if (!account) return;

  const rules = await db.query.autoReplyRules.findMany({
    where: and(
      eq(schema.autoReplyRules.accountId, accountId),
      eq(schema.autoReplyRules.isActive, true),
    ),
    orderBy: [desc(schema.autoReplyRules.priority)],
  });

  const commentRules = rules.filter((r) => r.channel === "comment" || r.channel === "private_reply");
  const matched = matchTextAgainstRules(commentText, commentRules);
  if (!matched.length) return;

  const bestMatch = matched[0];
  const token = decryptToken(account.accessToken);
  const provider = new InstagramProvider({ igUserId: account.igUserId, accessToken: token });

  const disclosureEnabled = true;

  try {
    const responseText = withBotDisclosure(bestMatch.responseText, disclosureEnabled);
    if (bestMatch.channel === "private_reply") {
      // Rate limit for private replies
      const canProceed = await acquireRateLimit(accountId, "private_reply");
      if (!canProceed) return;
      await provider.sendPrivateReply(commentId, responseText);
    } else {
      await provider.replyToComment(commentId, responseText);
    }

    await db
      .update(schema.autoReplyRules)
      .set({
        lastTriggeredAt: new Date(),
        triggerCount: (bestMatch as unknown as { triggerCount: number }).triggerCount + 1,
      })
      .where(eq(schema.autoReplyRules.id, bestMatch.id));
  } catch {
    // Silently fail
  }
}
