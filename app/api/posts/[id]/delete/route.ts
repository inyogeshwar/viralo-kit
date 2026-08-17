import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { jsonError, requireUserId } from "@/lib/http";
import { decryptToken } from "@/lib/crypto";
import { InstagramProvider } from "@/lib/providers/instagram";
import { env } from "@/lib/env";
import { getDashboardContext } from "@/lib/context";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const { id } = await params;
  const ctx = await getDashboardContext();
  const db = getDb();
  if (!db) return jsonError("Database not configured.");

  const post = await db
    .select()
    .from(schema.posts)
    .where(and(eq(schema.posts.id, id), eq(schema.posts.workspaceId, ctx.workspace.id)))
    .limit(1);

  if (!post.length) return jsonError("Post not found.", 404);
  const p = post[0];

  // Optionally delete from Instagram if media exists
  if (p.mediaId && !env.mockMode) {
    try {
      const account = ctx.accounts.find((a) => a.id === p.accountId);
      if (account) {
        const provider = new InstagramProvider({
          igUserId: account.igUserId,
          accessToken: decryptToken(account.accessToken),
        });
        await provider.deleteMedia(p.mediaId);
      }
    } catch {
      // IG delete may fail for old posts — swallow and still delete from DB
    }
  }

  await db.delete(schema.posts).where(eq(schema.posts.id, id));

  return NextResponse.json({ ok: true });
}
