import { NextRequest, NextResponse } from "next/server";

import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { processDmAautomation, processCommentAutomation } from "@/lib/automation";

export const dynamic = "force-dynamic";

const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN ?? "ViraloKit-verify-token";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  // Acknowledge immediately
  const response = new NextResponse("EVENT_RECEIVED", { status: 200 });

  // Process asynchronously
  processWebhookEvent(body).catch(console.error);

  return response;
}

async function processWebhookEvent(body: Record<string, unknown>) {
  const db = getDb();
  if (!db) return;

  const entries = body["entry"] as Array<Record<string, unknown>> | undefined;
  if (!entries) return;

  for (const entry of entries) {
    const accountId = String(entry["id"] ?? "");
    const changes = entry["changes"] as Array<Record<string, unknown>> | undefined;
    if (!changes) continue;

    // Find the social account by igUserId
    const accounts = await db
      .select()
      .from(schema.socialAccounts)
      .where(eq(schema.socialAccounts.igUserId, accountId))
      .limit(1);

    if (!accounts.length) continue;
    const account = accounts[0];

    for (const change of changes) {
      const field = String(change["field"] ?? "");
      const value = change["value"] as Record<string, unknown> | undefined;
      if (!value) continue;

      // Store raw webhook event
      await db.insert(schema.webhookEvents).values({
        workspaceId: account.workspaceId,
        accountId: account.id,
        field,
        payload: change as Record<string, unknown>,
      });

      // Parse comment events
      if (field === "comments") {
        const commentId = String(value["id"] ?? "");
        const text = String(value["text"] ?? "");
        const from = value["from"] as Record<string, string> | undefined;
        const mediaId = String(value["media_id"] ?? value["post_id"] ?? "");

        if (commentId && text) {
          await db
            .insert(schema.comments)
            .values({
              workspaceId: account.workspaceId,
              accountId: account.id,
              igCommentId: commentId,
              mediaId: mediaId || null,
              text,
              fromUsername: from?.["username"] ?? null,
              fromUserId: from?.["id"] ?? null,
            })
            .onConflictDoNothing();

          // Trigger comment automation
          processCommentAutomation(account.id, commentId, text, mediaId).catch(console.error);
        }
      }

      // Parse message events
      if (field === "messages") {
        const messageData = value["message"] as Record<string, unknown> | undefined;
        if (messageData) {
          const msgId = String(messageData["mid"] ?? messageData["id"] ?? "");
          const text = String(messageData["text"] ?? "");
          const senderObj = value["sender"] as Record<string, unknown> | undefined;
          const senderId = String(senderObj?.["id"] ?? "");
          const threadId = String(messageData["thread_id"] ?? "");

          if (msgId) {
            const isFromUs = senderId === account.igUserId;
            await db
              .insert(schema.messages)
              .values({
                workspaceId: account.workspaceId,
                accountId: account.id,
                igMessageId: msgId,
                igThreadId: threadId || null,
                text: text || null,
                fromUsername: isFromUs ? account.username : null,
                fromUserId: senderId || null,
                isFromUs,
              })
              .onConflictDoNothing();

            // Trigger DM automation (only for incoming messages, not our own)
            if (!isFromUs && text) {
              processDmAautomation(account.id, senderId, text, msgId).catch(console.error);
            }
          }
        }
      }
    }
  }
}
