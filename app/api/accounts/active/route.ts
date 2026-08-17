import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { jsonError, requireUserId } from "@/lib/http";
import { ensureWorkspace, setActiveAccount } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const body = (await req.json().catch(() => ({}))) as { id?: string };
  const accountId = body.id;
  if (!accountId) return jsonError("id is required.");

  if (env.mockMode) {
    const workspace = await ensureWorkspace(auth.userId, {});
    await setActiveAccount(workspace.id, accountId);
    return NextResponse.json({ ok: true, activeId: accountId });
  }

  const workspace = await ensureWorkspace(auth.userId, {});
  const ok = await setActiveAccount(workspace.id, accountId);
  if (!ok) return jsonError("Account not found.", 404);

  const db = getDb();
  const account = db
    ? await db.query.socialAccounts.findFirst({
        where: eq(schema.socialAccounts.id, accountId),
      })
    : null;

  return NextResponse.json({
    ok: true,
    activeId: accountId,
    account: account
      ? {
          id: account.id,
          igUserId: account.igUserId,
          username: account.username,
          name: account.name,
        }
      : null,
  });
}
