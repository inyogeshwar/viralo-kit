import { NextRequest, NextResponse } from "next/server";

import { getDb, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { jsonError, requireUserId } from "@/lib/http";
import { encryptToken } from "@/lib/crypto";
import { InstagramError, InstagramProvider } from "@/lib/providers/instagram";
import { ensureWorkspace, listAccounts } from "@/lib/workspace";

export const dynamic = "force-dynamic";

function publicAccount(account: {
  id: string;
  igUserId: string;
  username: string | null;
  name: string | null;
  profilePictureUrl: string | null;
  tokenType: string;
  isActive: boolean;
}) {
  return {
    id: account.id,
    igUserId: account.igUserId,
    username: account.username,
    name: account.name,
    profilePictureUrl: account.profilePictureUrl,
    tokenType: account.tokenType,
    isActive: account.isActive,
  };
}

export async function GET() {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const workspace = await ensureWorkspace(auth.userId, {});
  const accounts = await listAccounts(workspace.id);
  const activeId = accounts.find((a) => a.isActive)?.id ?? accounts[0]?.id ?? null;

  return NextResponse.json({
    ok: true,
    mock: env.mockMode,
    activeId,
    accounts: accounts.map((a) => publicAccount(a)),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    igUserId?: string;
    accessToken?: string;
  };
  const igUserId = body.igUserId?.trim() ?? "";
  const accessToken = body.accessToken?.trim() ?? "";
  if (!igUserId || !accessToken) {
    return jsonError("igUserId and accessToken are required.");
  }

  const workspace = await ensureWorkspace(auth.userId, {});

  if (env.mockMode) {
    return NextResponse.json({
      ok: true,
      mock: true,
      message: "Mock mode: account connection is simulated. Set MOCK_MODE=false to connect for real.",
    });
  }

  const db = getDb();
  if (!db) return jsonError("Database is not configured (set DATABASE_URL).");

  let info: { id: string; username?: string; name?: string };
  try {
    const data = await new InstagramProvider({ igUserId, accessToken }).getAccountInfo();
    info = {
      id: String(data["id"] ?? igUserId),
      username: data["username"] as string | undefined,
      name: data["name"] as string | undefined,
    };
  } catch (err) {
    if (err instanceof InstagramError) {
      return jsonError(`Token validation failed: ${err.message}`, 400);
    }
    throw err;
  }

  const inserted = await db
    .insert(schema.socialAccounts)
    .values({
      workspaceId: workspace.id,
      igUserId: info.id || igUserId,
      username: info.username ?? null,
      name: info.name ?? null,
      tokenType: "dev",
      accessToken: encryptToken(accessToken),
    })
    .returning();

  return NextResponse.json({ ok: true, account: publicAccount(inserted[0]) });
}
