import { env } from "@/lib/env";
import { decryptToken } from "@/lib/crypto";
import { mockAccountAnalytics, mockMediaAnalytics } from "@/lib/mock";
import { InstagramProvider } from "@/lib/providers/instagram";
import type { AccountRow } from "@/lib/workspace";

export interface AccountAnalytics {
  account: Record<string, unknown>;
  insights: Record<string, unknown>;
}

export async function getAccountAnalytics(account: AccountRow): Promise<AccountAnalytics> {
  if (env.mockMode) return mockAccountAnalytics();
  const provider = new InstagramProvider({
    igUserId: account.igUserId,
    accessToken: decryptToken(account.accessToken),
  });
  return provider.getAccountAnalytics();
}

export async function getMediaAnalytics(account: AccountRow, limit = 10) {
  if (env.mockMode) return mockMediaAnalytics(limit);
  const provider = new InstagramProvider({
    igUserId: account.igUserId,
    accessToken: decryptToken(account.accessToken),
  });
  const media = await provider.getRecentMedia(limit);
  for (const item of media) {
    try {
      item["insights"] = await provider.getMediaInsights(
        item["id"] as string,
        (item["media_type"] as string) ?? "IMAGE",
      );
    } catch {
      item["insights"] = {};
    }
  }
  return media;
}

export async function listPosts(workspaceId: string, limit = 20) {
  const db = (await import("@/lib/db")).getDb();
  if (!db) {
    const { mockPosts } = await import("@/lib/mock");
    return mockPosts(limit);
  }
  const { schema } = await import("@/lib/db");
  const { desc, eq } = await import("drizzle-orm");
  const rows = await db
    .select({
      id: schema.posts.id,
      accountId: schema.posts.accountId,
      accountUsername: schema.socialAccounts.username,
      platform: schema.posts.platform,
      mediaType: schema.posts.mediaType,
      caption: schema.posts.caption,
      status: schema.posts.status,
      scheduledAt: schema.posts.scheduledAt,
      publishedAt: schema.posts.publishedAt,
      permalink: schema.posts.permalink,
      mediaUrls: schema.posts.mediaUrls,
      createdAt: schema.posts.createdAt,
    })
    .from(schema.posts)
    .leftJoin(schema.socialAccounts, eq(schema.posts.accountId, schema.socialAccounts.id))
    .where(eq(schema.posts.workspaceId, workspaceId))
    .orderBy(desc(schema.posts.createdAt))
    .limit(limit);
  return rows;
}
