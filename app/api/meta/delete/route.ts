import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteInstagramMedia, bulkDeleteInstagramMedia } from "@/lib/meta/deletion";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";

import { sanitizeErrorMessage } from "@/lib/security/sanitize";

const deleteSchema = z.object({
  mediaId: z.string().regex(/^[0-9_]+$/, "Invalid Instagram media ID format").max(50).optional(),
  mediaIds: z.array(z.string().regex(/^[0-9_]+$/, "Invalid Instagram media ID format").max(50)).max(50).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to delete posts.", code: "UNAUTHORIZED" },
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

    const body = await request.json();
    const validated = deleteSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid request parameters", details: validated.error.flatten() }, { status: 400 });
    }

    const { mediaId, mediaIds } = validated.data;
    const supabase = await createClient();

    // 1. Bulk deletion
    if (mediaIds && mediaIds.length > 0) {
      const summary = await bulkDeleteInstagramMedia(mediaIds, credentials.accessToken);

      // Update local DB for successful items strictly scoped to authenticated user
      if (user) {
        for (const item of summary.results) {
          if (item.status === "deleted") {
            try {
              await supabase
                .from("posts")
                .update({ status: "deleted", updated_at: new Date().toISOString() })
                .eq("instagram_media_id", item.mediaId)
                .eq("user_id", user.id);
            } catch (err) {
              console.warn("DB update failed for deleted post:", err);
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        summary,
      });
    }

    // 2. Single deletion
    if (mediaId) {
      const outcome = await deleteInstagramMedia(mediaId, credentials.accessToken);

      if (outcome.success) {
        if (user) {
          try {
            await supabase
              .from("posts")
              .update({ status: "deleted", updated_at: new Date().toISOString() })
              .eq("instagram_media_id", mediaId)
              .eq("user_id", user.id);
          } catch (err) {
            console.warn("DB update failed for single deleted post:", err);
          }
        }

        return NextResponse.json({
          success: true,
          mediaId,
          status: "deleted",
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            mediaId,
            status: "delete_failed",
            reason: outcome.reason || "Deletion failed on Instagram Graph API.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ error: "Must provide either mediaId or mediaIds." }, { status: 400 });
  } catch (err: any) {
    console.error("Deletion API error:", err);
    return NextResponse.json(
      { error: sanitizeErrorMessage(err, "Failed to process deletion.") },
      { status: 500 }
    );
  }
}
