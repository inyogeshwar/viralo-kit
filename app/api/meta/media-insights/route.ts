import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { fetchMediaInsights } from "@/lib/meta/insights";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";
import { sanitizeErrorMessage } from "@/lib/security/sanitize";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get("mediaId");

    if (!mediaId || !/^[0-9_]+$/.test(mediaId)) {
      return NextResponse.json(
        { error: "Valid numeric mediaId is required", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    const likeCount = searchParams.get("likeCount");
    const commentsCount = searchParams.get("commentsCount");
    const permalink = searchParams.get("permalink") || undefined;

    const mediaItem = {
      id: mediaId,
      like_count: likeCount !== null ? parseInt(likeCount, 10) : undefined,
      comments_count: commentsCount !== null ? parseInt(commentsCount, 10) : undefined,
      permalink,
    };

    const credentials = await getUserInstagramCredentials(user.id);
    if (!credentials) {
      return NextResponse.json(
        { error: "No connected Instagram account found", code: "NO_ACCOUNT" },
        { status: 403 }
      );
    }

    const insights = await fetchMediaInsights(mediaId, credentials.accessToken, mediaItem);

    return NextResponse.json({
      success: true,
      insights,
    });
  } catch (error: any) {
    console.error("Error in /api/meta/media-insights:", error?.message || "Internal error");
    return NextResponse.json(
      { error: sanitizeErrorMessage(error, "Failed to fetch media insights"), code: "META_INSIGHTS_ERROR" },
      { status: 500 }
    );
  }
}
