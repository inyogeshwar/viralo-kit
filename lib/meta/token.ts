import { config } from "@/lib/config";

export interface RefreshTokenResult {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Refreshes an Instagram long-lived user access token.
 * Long-lived access tokens are valid for 60 days and can be refreshed
 * once they are at least 24 hours old.
 * Mirrors the n8n production token refresh flow.
 */
export async function refreshLongLivedAccessToken(accessToken: string): Promise<RefreshTokenResult> {
  if (!accessToken) {
    throw new Error("No access token provided.");
  }

  // 1. Try Instagram Graph API refresh endpoint
  try {
    const igUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(accessToken)}`;
    const igRes = await fetch(igUrl, { method: "GET" });
    const igData = await igRes.json();

    if (igRes.ok && !igData.error && igData.access_token) {
      return {
        access_token: igData.access_token,
        token_type: igData.token_type || "bearer",
        expires_in: igData.expires_in || 5184000,
      };
    }
  } catch {
    // Continue to fallback
  }

  // 2. Fallback to Facebook Graph API exchange token if app credentials exist
  if (config.meta.appId && config.meta.appSecret) {
    const fbUrl = `https://graph.facebook.com/${config.meta.apiVersion}/oauth/access_token?grant_type=fb_exchange_token&client_id=${config.meta.appId}&client_secret=${config.meta.appSecret}&fb_exchange_token=${encodeURIComponent(accessToken)}`;
    const fbRes = await fetch(fbUrl, { method: "GET" });
    const fbData = await fbRes.json();

    if (fbRes.ok && !fbData.error && fbData.access_token) {
      return {
        access_token: fbData.access_token,
        token_type: fbData.token_type || "bearer",
        expires_in: fbData.expires_in || 5184000,
      };
    }

    throw new Error(fbData.error?.message || "Token refresh failed with Meta Graph API.");
  }

  throw new Error("Could not refresh token. Ensure token is at least 24 hours old or verify app credentials.");
}
