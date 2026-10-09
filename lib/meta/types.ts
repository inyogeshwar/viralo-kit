export interface AccountCapabilities {
  connected: boolean;
  userId: string | null;
  username: string | null;
  name: string | null;
  profilePictureUrl?: string | null;
  followersCount?: number | null;
  mediaCount?: number | null;
  canPublish: boolean;
  canPublishCarousel: boolean;
  canFetchInsights: boolean;
  canDeleteMedia: boolean;
  publishingLimit?: {
    quotaUsage: number;
    configType?: string;
  };
  reason?: string;
}

export interface PublishResult {
  type: "IMAGE" | "CAROUSEL" | "REELS" | "STORIES";
  containerId: string;
  mediaId: string;
  permalink?: string;
  publishedAt: string;
  publicUrls: string[];
}

export interface InstagramMediaItem {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS" | "STORIES";
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp: string;
  like_count?: number | null;
  comments_count?: number | null;
}

export interface NormalizedAccountAnalytics {
  account: {
    id: string;
    username: string;
    name?: string;
    followersCount: number | null;
    followsCount: number | null;
    mediaCount: number | null;
    profilePictureUrl?: string | null;
  };
  insights: {
    reach: number | null;
    impressions: number | null;
    profileViews: number | null;
    totalInteractions: number | null;
    accountsEngaged: number | null;
    followerGrowth: number | null;
  };
  recentMedia: InstagramMediaItem[];
  topPosts: InstagramMediaItem[];
  summaryMetrics?: {
    totalLikes: number;
    totalComments: number;
    totalInteractions: number;
    averageEngagementRate: string;
  };
  demographics?: {
    audienceCity?: Record<string, number>;
    audienceCountry?: Record<string, number>;
    audienceGenderAge?: Record<string, number>;
    onlineFollowers?: Record<string, number>;
  };
  snapshotsTimestamp: string;
}

export interface InstagramPostInsights {
  mediaId: string;
  views: {
    total: number;
    followersPercent: number;
    nonFollowersPercent: number;
    fromHome: number;
    fromProfile: number;
    fromOther: number;
    viewers: number;
  };
  interactions: {
    total: number;
    followersPercent: number;
    nonFollowersPercent: number;
    postInteractions: number;
    likes: number;
    shares: number;
    saves: number;
    comments: number;
    accountsEngaged: number;
  };
  profile: {
    activity: number;
    visits: number;
    externalLinkTaps: number;
    businessAddressTaps: number;
    follows: number;
  };
  boostUrl?: string;
}

