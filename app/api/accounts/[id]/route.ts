import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { requireUserId } from "@/lib/http";
import { ensureWorkspace, listAccounts } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const { id } = await ctx.params;
  const workspace = await ensureWorkspace(auth.userId, {});

  if (env.mockMode) {
    return NextResponse.json({
      ok: true,
      mock: true,
      activeId: null,
      message: "Mock mode: removal is simulated.",
    });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "Database not configured." }, { status: 500 });

  await db
    .delete(schema.socialAccounts)
    .where(and(eq(schema.socialAccounts.id, id), eq(schema.socialAccounts.workspaceId, workspace.id)));

  const remaining = await listAccounts(workspace.id);
  const activeId = remaining.find((a) => a.isActive)?.id ?? remaining[0]?.id ?? null;

  return NextResponse.json({ ok: true, activeId });
}
