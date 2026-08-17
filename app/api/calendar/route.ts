import { NextResponse } from "next/server";

import { getDb, schema } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/http";
import { getDashboardContext } from "@/lib/context";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return NextResponse.json({ ok: true, posts: [] });

  const rows = await db.query.posts.findMany({
    where: and(
      eq(schema.posts.workspaceId, ctx.workspace.id),
    ),
    orderBy: (posts, { asc }) => [asc(posts.scheduledAt)],
    limit: 100,
  });

  const posts = rows.map((r) => ({
    id: r.id,
    caption: r.caption,
    mediaType: r.mediaType,
    status: r.status,
    scheduledAt: r.scheduledAt?.toISOString() ?? null,
    accountUsername: ctx.accounts.find((a) => a.id === r.accountId)?.username ?? null,
  }));

  return NextResponse.json({ ok: true, posts });
}

export async function PATCH(req: Request) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "No DB" }, { status: 500 });

  const body = await req.json();
  const { postId, scheduledAt } = body;

  if (!postId || !scheduledAt) {
    return NextResponse.json({ ok: false, error: "Missing postId or scheduledAt" }, { status: 400 });
  }

  await db
    .update(schema.posts)
    .set({ scheduledAt: new Date(scheduledAt), updatedAt: new Date() })
    .where(
      and(eq(schema.posts.id, postId), eq(schema.posts.workspaceId, ctx.workspace.id)),
    );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "No DB" }, { status: 500 });

  const body = await req.json();
  const { postId } = body;

  if (!postId) {
    return NextResponse.json({ ok: false, error: "Missing postId" }, { status: 400 });
  }

  await db
    .update(schema.posts)
    .set({ status: "draft", scheduledAt: null, updatedAt: new Date() })
    .where(
      and(eq(schema.posts.id, postId), eq(schema.posts.workspaceId, ctx.workspace.id)),
    );

  return NextResponse.json({ ok: true });
}
