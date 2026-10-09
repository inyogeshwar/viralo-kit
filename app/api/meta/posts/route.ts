import { NextResponse } from "next/server";
import { fetchRecentMedia } from "@/lib/meta/insights";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";
import { sanitizeErrorMessage } from "@/lib/security/sanitize";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required.", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 25, 50) : 25;

  try {
    const credentials = await getUserInstagramCredentials(user.id);
    if (!credentials) {
      return NextResponse.json({ posts: [], total: 0, fetchedAt: new Date().toISOString() });
    }
    const posts = await fetchRecentMedia(limit, credentials.instagramUserId, credentials.accessToken);

    return NextResponse.json({
      posts,
      total: posts.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: sanitizeErrorMessage(err, "Failed to fetch Instagram posts.") },
      { status: 500 }
    );
  }
}
