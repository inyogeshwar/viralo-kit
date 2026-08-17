import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { jsonError, requireUserId } from "@/lib/http";
import { buildInstagramAuthUrl } from "@/lib/providers/instagram";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  if (!env.meta.clientId || !env.meta.clientSecret) {
    return jsonError(
      "META_CLIENT_ID and META_CLIENT_SECRET are not set. See .env.example and the KB guide.",
    );
  }

  return NextResponse.redirect(buildInstagramAuthUrl(auth.userId));
}
