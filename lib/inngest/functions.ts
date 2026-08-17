import { and, eq, lte, or } from "drizzle-orm";

import { inngest } from "@/lib/inngest/client";
import { getDb, schema } from "@/lib/db";
import { decryptToken } from "@/lib/crypto";
import { InstagramProvider } from "@/lib/providers/instagram";

export const publishScheduledPost = inngest.createFunction(
  {
    id: "publish-scheduled-post",
    triggers: [{ event: "post/schedule" }],
  },
  async ({ event, step }) => {
    const { postId } = event.data;

    const db = getDb();
    if (!db) throw new Error("Database not configured");

    const post = await db.query.posts.findFirst({
      where: and(eq(schema.posts.id, postId), eq(schema.posts.status, "scheduled")),
    });

    if (!post) return { skipped: true, reason: "Post not found or not scheduled" };

    const account = await db.query.socialAccounts.findFirst({
      where: eq(schema.socialAccounts.id, post.accountId),
    });

    if (!account) throw new Error("Account not found");

    const token = decryptToken(account.accessToken);
    const provider = new InstagramProvider({ igUserId: account.igUserId, accessToken: token });

    await step.run("mark-processing", async () => {
      await db!
        .update(schema.posts)
        .set({ status: "processing", updatedAt: new Date() })
        .where(eq(schema.posts.id, postId));
    });

    let result: Record<string, unknown> | null = null;
    let error: string | null = null;

    try {
      if (post.mediaType === "reel" && post.mediaUrls?.[0]) {
        result = await provider.publishReel(post.mediaUrls[0], post.caption ?? "");
      } else if (post.mediaType === "carousel" && post.mediaUrls && post.mediaUrls.length > 1) {
        result = await provider.publishCarousel(post.mediaUrls, post.caption ?? "");
      } else if (post.mediaUrls?.[0]) {
        result = await provider.publishImage(post.mediaUrls[0], post.caption ?? "");
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }

    await step.run("update-post-status", async () => {
      await db!.update(schema.posts).set({
        status: error ? "failed" : "published",
        publishedAt: error ? null : new Date(),
        mediaId: (result?.mediaId as string) ?? null,
        permalink: (result?.permalink as string) ?? null,
        error,
        updatedAt: new Date(),
      }).where(eq(schema.posts.id, postId));
    });

    return { postId, status: error ? "failed" : "published", error };
  }
);

export const checkScheduledPosts = inngest.createFunction(
  {
    id: "check-scheduled-posts",
    triggers: [{ event: "cron/check-scheduled" }],
  },
  async ({ step }) => {
    const db = getDb();
    if (!db) return;

    const now = new Date();
    const scheduledPosts = await db.query.posts.findMany({
      where: and(
        eq(schema.posts.status, "scheduled"),
        or(
          lte(schema.posts.scheduledAt, now),
        )
      ),
    });

    for (const post of scheduledPosts) {
      await step.sendEvent("trigger-publish", {
        name: "post/schedule",
        data: { postId: post.id },
      });
    }

    return { triggered: scheduledPosts.length };
  }
);
