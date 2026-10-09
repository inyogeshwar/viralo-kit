import { NextResponse } from "next/server";
import { z } from "zod";
import { publishSingleImage, publishCarousel, publishReel, publishStory } from "@/lib/meta/publishing";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";

import { isSafePublicUrl, sanitizeErrorMessage } from "@/lib/security/sanitize";

const publishSchema = z.object({
  mediaType: z.enum(["IMAGE", "CAROUSEL", "REELS", "STORIES"]),
  caption: z.string().max(2200).default(""),
  imageUrls: z.array(z.string().url().max(2000)).min(1).max(10),
  scheduledFor: z.string().datetime().optional(),
});

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to publish to Instagram.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const credentials = await getUserInstagramCredentials(user.id);
    if (!credentials) {
      return NextResponse.json(
        { error: "No connected Instagram account found. Please connect your account in Settings.", code: "NO_ACCOUNT" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = publishSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { mediaType, caption, imageUrls, scheduledFor } = validated.data;

    // Security Problem #3 & #8: SSRF validation for all image URLs
    for (const url of imageUrls) {
      if (!isSafePublicUrl(url)) {
        return NextResponse.json(
          { error: "One or more image URLs are invalid or restricted. Only public HTTPS URLs are permitted." },
          { status: 400 }
        );
      }
    }

    // If scheduled for the future
    if (scheduledFor && new Date(scheduledFor) > new Date()) {
      const supabase = await createClient();
      try {
        const { data: post, error: postError } = await supabase
          .from("posts")
          .insert({
            user_id: user.id,
            instagram_account_id: credentials.instagramUserId,
            media_type: mediaType,
            caption: caption,
            status: "scheduled",
            scheduled_for: scheduledFor,
          })
          .select("id")
          .single();

        if (postError) throw postError;

        if (post) {
          const mediaRows = imageUrls.map((url, i) => ({
            post_id: post.id,
            cloudinary_public_id: "direct_url",
            secure_url: url,
            position: i,
          }));
          
          await supabase.from("post_media").insert(mediaRows);
        }

        return NextResponse.json({
          success: true,
          status: "scheduled",
          message: "Post scheduled successfully.",
        });
      } catch (err: any) {
        throw new Error("Failed to save scheduled post: " + err.message);
      }
    }

    let result;
    if (mediaType === "IMAGE") {
      if (imageUrls.length < 1) {
        return NextResponse.json({ error: "Single image post requires 1 image URL." }, { status: 400 });
      }
      result = await publishSingleImage(imageUrls[0], caption, credentials.instagramUserId, credentials.accessToken);
    } else if (mediaType === "CAROUSEL") {
      if (imageUrls.length < 2 || imageUrls.length > 10) {
        return NextResponse.json(
          { error: "Instagram carousel requires between 2 and 10 images." },
          { status: 400 }
        );
      }
      result = await publishCarousel(imageUrls, caption, credentials.instagramUserId, credentials.accessToken);
    } else if (mediaType === "REELS") {
      if (imageUrls.length < 1) {
        return NextResponse.json({ error: "Reel requires 1 video URL." }, { status: 400 });
      }
      result = await publishReel(imageUrls[0], caption, credentials.instagramUserId, credentials.accessToken);
    } else if (mediaType === "STORIES") {
      if (imageUrls.length < 1) {
        return NextResponse.json({ error: "Story requires 1 media URL." }, { status: 400 });
      }
      // Simplistic check for video extension, ideally passed from frontend
      const isVideo = imageUrls[0].toLowerCase().includes('.mp4') || imageUrls[0].toLowerCase().includes('.mov');
      result = await publishStory(imageUrls[0], isVideo, credentials.instagramUserId, credentials.accessToken);
    }
    
    if (!result) {
      return NextResponse.json({ error: "Unsupported media type." }, { status: 400 });
    }

    // Save to Supabase DB if configured
    const supabase = await createClient();
    if (user) {
      try {
        const { data: post, error: postError } = await supabase
          .from("posts")
          .insert({
            user_id: user.id,
            instagram_account_id: credentials.instagramUserId,
            instagram_media_id: result.mediaId,
            media_type: mediaType,
            caption: caption,
            status: "published",
            permalink: result.permalink || null,
            published_at: result.publishedAt ? new Date(result.publishedAt).toISOString() : null,
          })
          .select("id")
          .single();

        if (postError) throw postError;

        if (post) {
          // Insert media items
          const mediaRows = result.publicUrls.map((url, i) => ({
            post_id: post.id,
            cloudinary_public_id: "direct_url",
            secure_url: url,
            position: i,
          }));
          
          const { error: mediaError } = await supabase
            .from("post_media")
            .insert(mediaRows);
            
          if (mediaError) throw mediaError;
        }
      } catch (dbErr) {
        console.warn("Supabase DB post save error (non-fatal):", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      post: result,
      status: "published",
    });
  } catch (err: any) {
    console.error("Publishing error:", err);
    return NextResponse.json(
      {
        success: false,
        error: sanitizeErrorMessage(err, "Failed to publish media to Instagram."),
        status: "failed",
      },
      { status: 500 }
    );
  }
}
