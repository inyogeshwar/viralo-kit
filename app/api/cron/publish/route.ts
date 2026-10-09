import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publishSingleImage, publishCarousel, publishReel, publishStory } from "@/lib/meta/publishing";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // max 5 min for Vercel Cron

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = await createClient();

    // 1. Fetch scheduled posts that are due
    const { data: posts, error: fetchError } = await supabase
      .from("posts")
      .select(`
        id,
        user_id,
        media_type,
        caption,
        instagram_account_id,
        post_media (
          secure_url,
          position
        )
      `)
      .eq("status", "scheduled")
      .lte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true })
      .limit(10); // Process 10 at a time to prevent timeout

    if (fetchError) {
      throw fetchError;
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: "No scheduled posts due." });
    }

    const results = [];

    // 2. Process each post
    for (const post of posts) {
      try {
        // Mark as processing
        await supabase
          .from("posts")
          .update({ status: "processing" })
          .eq("id", post.id);

        const credentials = await getUserInstagramCredentials(post.user_id);
        if (!credentials) {
          throw new Error("No Instagram credentials found for user.");
        }

        const media = (post.post_media as any[]).sort((a, b) => a.position - b.position);
        const imageUrls = media.map(m => m.secure_url);

        let result;
        if (post.media_type === "IMAGE") {
          result = await publishSingleImage(imageUrls[0], post.caption || "", credentials.instagramUserId, credentials.accessToken);
        } else if (post.media_type === "CAROUSEL") {
          result = await publishCarousel(imageUrls, post.caption || "", credentials.instagramUserId, credentials.accessToken);
        } else if (post.media_type === "REELS") {
          result = await publishReel(imageUrls[0], post.caption || "", credentials.instagramUserId, credentials.accessToken);
        } else if (post.media_type === "STORIES") {
          const isVideo = imageUrls[0].toLowerCase().includes('.mp4') || imageUrls[0].toLowerCase().includes('.mov');
          result = await publishStory(imageUrls[0], isVideo, credentials.instagramUserId, credentials.accessToken);
        }

        if (!result) {
          throw new Error("Unsupported media type.");
        }

        // Update post with success
        await supabase
          .from("posts")
          .update({
            status: "published",
            instagram_media_id: result.mediaId,
            permalink: result.permalink || null,
            published_at: result.publishedAt ? new Date(result.publishedAt).toISOString() : new Date().toISOString(),
          })
          .eq("id", post.id);

        results.push({ id: post.id, status: "success" });
      } catch (err: any) {
        // Update post with failure
        await supabase
          .from("posts")
          .update({ status: "failed" })
          .eq("id", post.id);

        results.push({ id: post.id, status: "failed", error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (err: any) {
    console.error("Cron publish error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
