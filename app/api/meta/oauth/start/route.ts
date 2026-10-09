import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { config } from "@/lib/config";
import crypto from "crypto";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to connect Instagram account.", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { appId } = config.meta;
  if (!appId) {
    return NextResponse.json(
      { error: "Meta App ID is not configured.", code: "MISSING_CONFIG" },
      { status: 500 }
    );
  }

  // Generate state to prevent CSRF
  const state = crypto.randomBytes(16).toString("hex");

  const redirectUri = `${config.app.url}/api/meta/oauth/callback`;
  const scopes = [
    "instagram_basic",
    "instagram_content_publish",
    "instagram_manage_insights",
    "pages_show_list",
    "pages_read_engagement",
    "public_profile",
  ].join(",");

  const authUrl = `https://www.facebook.com/${config.meta.apiVersion}/dialog/oauth?client_id=${appId}&display=page&extras={"setup":{"channel":"IG_API_ONBOARDING"}}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${state}`;

  const response = NextResponse.redirect(authUrl);
  
  // Set state in HttpOnly cookie to verify in callback
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  return response;
}
