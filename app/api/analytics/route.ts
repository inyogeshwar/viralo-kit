import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { jsonError, requireUserId } from "@/lib/http";
import { decryptToken } from "@/lib/crypto";
import { mockAccountAnalytics, mockMediaAnalytics } from "@/lib/mock";
import { InstagramError, InstagramProvider } from "@/lib/providers/instagram";
import { getDashboardContext } from "@/lib/context";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const scope = (req.nextUrl.searchParams.get("scope") ?? "account") as "account" | "media";
  const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit")) || 10, 1), 25);

  const ctx = await getDashboardContext();
  const account = ctx.activeAccount;
  if (!account) return jsonError("Connect an Instagram account first.");

  if (env.mockMode) {
    if (scope === "media") {
      return NextResponse.json({ ok: true, mock: true, media: mockMediaAnalytics(limit) });
    }
    return NextResponse.json({ ok: true, mock: true, ...mockAccountAnalytics() });
  }

  const token = decryptToken(account.accessToken);
  const provider = new InstagramProvider({ igUserId: account.igUserId, accessToken: token });

  try {
    if (scope === "media") {
      const media = await provider.getRecentMedia(limit);
      for (const item of media) {
        try {
          item["insights"] = await provider.getMediaInsights(
            item["id"] as string,
            (item["media_type"] as string) ?? "IMAGE",
          );
        } catch (err) {
          if (err instanceof InstagramError) {
            item["insights"] = { error: err.message };
          } else {
            throw err;
          }
        }
      }
      return NextResponse.json({ ok: true, media });
    }
    const data = await provider.getAccountAnalytics();
    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    if (err instanceof InstagramError) return jsonError(err.message, 502);
    throw err;
  }
}
