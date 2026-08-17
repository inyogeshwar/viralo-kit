import { and, eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";

const WINDOW_MS = 24 * 60 * 60 * 1000;
const HUMAN_AGENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function isWithinMessagingWindow(lastUserMessageAt: Date | null): {
  within24h: boolean;
  within7Days: boolean;
  expiresAt: Date | null;
} {
  if (!lastUserMessageAt) return { within24h: false, within7Days: false, expiresAt: null };
  const now = Date.now();
  const lastMsg = lastUserMessageAt.getTime();
  return {
    within24h: now - lastMsg < WINDOW_MS,
    within7Days: now - lastMsg < HUMAN_AGENT_WINDOW_MS,
    expiresAt: new Date(lastMsg + WINDOW_MS),
  };
}

export async function getLastUserMessageAt(
  accountId: string,
  senderIgsid: string,
): Promise<Date | null> {
  const db = getDb();
  if (!db) return null;

  const lastMsg = await db.query.messages.findFirst({
    where: and(
      eq(schema.messages.accountId, accountId),
      eq(schema.messages.fromUserId, senderIgsid),
      eq(schema.messages.isFromUs, false),
    ),
    orderBy: (msgs, { desc }) => [desc(msgs.createdAt)],
  });

  return lastMsg?.createdAt ?? null;
}

export async function canReplyInWindow(
  accountId: string,
  senderIgsid: string,
): Promise<{ canReply: boolean; needsHumanAgent: boolean; expiresAt: Date | null }> {
  const lastAt = await getLastUserMessageAt(accountId, senderIgsid);
  const window = isWithinMessagingWindow(lastAt);
  return {
    canReply: window.within24h || window.within7Days,
    needsHumanAgent: !window.within24h && window.within7Days,
    expiresAt: window.expiresAt,
  };
}
