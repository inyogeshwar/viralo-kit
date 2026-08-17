import { NextResponse } from "next/server";

import { getDb, schema } from "@/lib/db";
import { jsonError, requireUserId } from "@/lib/http";
import { decryptToken } from "@/lib/crypto";
import { InstagramProvider } from "@/lib/providers/instagram";
import { getDashboardContext } from "@/lib/context";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const body = (await req.json().catch(() => ({}))) as { accountId?: string };
  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return jsonError("Database not configured.");

  const account = ctx.accounts.find((a) => a.id === body.accountId);
  if (!account) return jsonError("Account not found.");

  try {
    const provider = new InstagramProvider({
      igUserId: account.igUserId,
      accessToken: decryptToken(account.accessToken),
    });
    const result = await provider.subscribeToWebhooks();

    await db
      .update(schema.socialAccounts)
      .set({ lastSyncAt: new Date() })
      .where(eq(schema.socialAccounts.id, account.id));

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Subscription failed", 502);
  }
}
