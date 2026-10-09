import { NextResponse } from "next/server";
import { refreshLongLivedAccessToken } from "@/lib/meta/token";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required.", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const credentials = await getUserInstagramCredentials(user.id);
  if (!credentials) {
    return NextResponse.json(
      { error: "No connected Instagram account found.", code: "NO_ACCOUNT" },
      { status: 403 }
    );
  }

  try {
    const result = await refreshLongLivedAccessToken(credentials.accessToken);
    // Return sanitized status without exposing secret token value directly
    return NextResponse.json({
      success: true,
      data: {
        refreshed: true,
        tokenType: result.token_type,
        expiresInSeconds: result.expires_in,
        expiresInDays: Math.floor(result.expires_in / 86400),
        message: "Long-lived Instagram token refreshed successfully. Valid for 60 days.",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REFRESH_FAILED",
          message: err?.message || "Failed to refresh token",
        },
      },
      { status: 400 }
    );
  }
}
