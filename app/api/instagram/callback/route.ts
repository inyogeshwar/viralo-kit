import { NextRequest, NextResponse } from "next/server";

import { getDb, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { encryptToken } from "@/lib/crypto";
import {
  InstagramError,
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  findIgBusinessAccount,
} from "@/lib/providers/instagram";
import { ensureWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const base = "/accounts";
  if (error) {
    return NextResponse.redirect(`${base}?error=${encodeURIComponent(error)}`);
  }
  if (!code || !state) {
    return NextResponse.redirect(`${base}?error=missing_code`);
  }

  try {
    const shortToken = await exchangeCodeForToken(code);
    const longToken = await exchangeForLongLivedToken(shortToken);
    const ig = await findIgBusinessAccount(longToken);

    if (env.mockMode || !getDb()) {
      return NextResponse.redirect(`${base}?error=${encodeURIComponent("Database not configured (DATABASE_URL).")}`);
    }

    const workspace = await ensureWorkspace(state, {});
    await getDb()!.insert(schema.socialAccounts).values({
      workspaceId: workspace.id,
      igUserId: ig.igUserId,
      username: ig.username ?? null,
      name: ig.name ?? null,
      profilePictureUrl: ig.profilePictureUrl ?? null,
      accessToken: encryptToken(longToken),
      tokenType: "oauth",
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    });

    return NextResponse.redirect(`${base}?connected=1`);
  } catch (err) {
    if (err instanceof InstagramError) {
      return NextResponse.redirect(
        `${base}?error=${encodeURIComponent(err.message.slice(0, 200))}`,
      );
    }
    throw err;
  }
}
