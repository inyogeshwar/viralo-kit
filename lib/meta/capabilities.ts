import { config, getMetaGraphUrl } from "@/lib/config";
import { AccountCapabilities } from "./types";

export async function detectAccountCapabilities(
  userId: string,
  accessToken: string
): Promise<AccountCapabilities> {
  if (!userId || !accessToken) {
    return {
      connected: false,
      userId: null,
      username: null,
      name: null,
      canPublish: false,
      canPublishCarousel: false,
      canFetchInsights: false,
      canDeleteMedia: false,
      reason: "No Instagram account credentials configured. Connect an account in Settings.",
    };
  }

  let username: string | null = null;
  let name: string | null = null;
  let profilePictureUrl: string | null = null;
  let followersCount: number | null = null;
  let mediaCount: number | null = null;
  let canPublish = false;
  let canPublishCarousel = false;
  let canFetchInsights = false;
  let canDeleteMedia = false;
  let publishingLimit: { quotaUsage: number; configType?: string } | undefined;

  try {
    // 1. Fetch user profile
    const profileUrl = `${getMetaGraphUrl(userId)}?fields=id,username,name,profile_picture_url,followers_count,media_count&access_token=${encodeURIComponent(accessToken)}`;
    const profileRes = await fetch(profileUrl);
    const profileData = await profileRes.json();

    if (!profileRes.ok || profileData.error) {
      const errMsg = profileData.error?.message || "Invalid Instagram User ID or Access Token";
      return {
        connected: false,
        userId,
        username: null,
        name: null,
        canPublish: false,
        canPublishCarousel: false,
        canFetchInsights: false,
        canDeleteMedia: false,
        reason: errMsg,
      };
    }

    username = profileData.username || null;
    name = profileData.name || null;
    profilePictureUrl = profileData.profile_picture_url || null;
    followersCount = typeof profileData.followers_count === "number" ? profileData.followers_count : null;
    mediaCount = typeof profileData.media_count === "number" ? profileData.media_count : null;

    // 2. Check publishing capabilities & limits
    try {
      const limitUrl = `${getMetaGraphUrl(`${userId}/content_publishing_limit`)}?fields=quota_usage,config&access_token=${encodeURIComponent(accessToken)}`;
      const limitRes = await fetch(limitUrl);
      const limitData = await limitRes.json();

      if (limitRes.ok && !limitData.error) {
        canPublish = true;
        canPublishCarousel = true;
        if (limitData.data && limitData.data[0]) {
          publishingLimit = {
            quotaUsage: limitData.data[0].quota_usage ?? 0,
            configType: limitData.data[0].config?.quota_total ? `Max ${limitData.data[0].config.quota_total}/day` : undefined,
          };
        }
      } else {
        // If content_publishing_limit is not available, check basic permissions
        canPublish = true;
        canPublishCarousel = true;
      }
    } catch {
      canPublish = true;
      canPublishCarousel = true;
    }

    // 3. Check insights capability
    try {
      const insightsTestUrl = `${getMetaGraphUrl(`${userId}/insights`)}?metric=reach&period=day&access_token=${encodeURIComponent(accessToken)}`;
      const insightsRes = await fetch(insightsTestUrl);
      const insightsData = await insightsRes.json();
      if (insightsRes.ok && !insightsData.error) {
        canFetchInsights = true;
      }
    } catch {
      canFetchInsights = false;
    }

    // 4. Deletion capability:
    // Meta Graph API explicitly blocks third-party deletion of feed media/posts for account integrity
    canDeleteMedia = false;

    return {
      connected: true,
      userId,
      username,
      name,
      profilePictureUrl,
      followersCount,
      mediaCount,
      canPublish,
      canPublishCarousel,
      canFetchInsights,
      canDeleteMedia,
      publishingLimit,
    };
  } catch (err: any) {
    return {
      connected: false,
      userId,
      username: null,
      name: null,
      canPublish: false,
      canPublishCarousel: false,
      canFetchInsights: false,
      canDeleteMedia: false,
      reason: err?.message || "Network error connecting to Meta Graph API",
    };
  }
}
