export interface MockAccount {
  id: string;
  workspaceId: string;
  platform: string;
  igUserId: string;
  username: string;
  name: string;
  profilePictureUrl: string | null;
  tokenType: "dev";
  accessToken: string;
  isActive: boolean;
  createdAt: Date;
}

export const mockAccounts: MockAccount[] = [
  {
    id: "mock-account-1",
    workspaceId: "mock-workspace",
    platform: "instagram",
    igUserId: "17841441536072453",
    username: "jay_gurudeventerprises",
    name: "Jay Gurudev Enterprises",
    profilePictureUrl: null,
    tokenType: "dev",
    accessToken: "mock-token-1",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "mock-account-2",
    workspaceId: "mock-workspace",
    platform: "instagram",
    igUserId: "17841400000000001",
    username: "demo_account",
    name: "Demo Account",
    profilePictureUrl: null,
    tokenType: "dev",
    accessToken: "mock-token-2",
    isActive: false,
    createdAt: new Date(),
  },
];

export function mockAccountAnalytics() {
  return {
    account: {
      id: "17841441536072453",
      username: "jay_gurudeventerprises",
      name: "Jay Gurudev Enterprises",
      followersCount: 1280,
      mediaCount: 24,
    },
    insights: {
      reach: 3420,
      profileViews: 210,
      accountsEngaged: 96,
      totalInteractions: 110,
    },
  };
}

export function mockMediaAnalytics(limit = 10) {
  const rows = [
    ["CAROUSEL_ALBUM", "Carousel post", 520, 61, 3, 12, 76],
    ["IMAGE", "Single image", 270, 30, 1, 5, 36],
    ["IMAGE", "PFP post", 410, 48, 2, 9, 59],
    ["IMAGE", "Mahadev wallpaper", 335, 39, 2, 7, 48],
  ] as const;
  return rows.slice(0, limit).map((row, i) => ({
    id: `mock_media_${i + 1}`,
    mediaType: row[0],
    caption: row[1],
    timestamp: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
    permalink: `https://www.instagram.com/p/MOCK-${i + 1}/`,
    thumbnailUrl: null,
    mediaUrl: null,
    insights: {
      reach: row[2],
      likes: row[3],
      comments: row[4],
      saved: row[5],
      totalInteractions: row[6],
    },
  }));
}

export function mockPublishResult(
  mediaType: "image" | "carousel" | "reel",
  mediaUrls: string[],
) {
  if (mediaType === "reel") {
    return {
      mediaType,
      containerId: "mock_reel_1",
      mediaId: "mock_media_reel",
      permalink: "https://www.instagram.com/reel/MOCK-REEL/",
      mediaUrls,
    };
  }
  if (mediaType === "image") {
    return {
      mediaType,
      containerId: "mock_container_1",
      mediaId: "mock_media_1",
      permalink: "https://www.instagram.com/p/MOCK-IMAGE/",
      mediaUrls,
    };
  }
  return {
    mediaType,
    containerId: "mock_carousel_1",
    childContainerIds: mediaUrls.map((_, i) => `mock_child_${i + 1}`),
    mediaId: "mock_media_1",
    permalink: "https://www.instagram.com/p/MOCK-CAROUSEL/",
    mediaUrls,
  };
}

export function mockPosts(limit = 10) {
  const statuses = ["published", "scheduled", "draft", "failed"] as const;
  return Array.from({ length: limit }, (_, i) => ({
    id: `mock_post_${i + 1}`,
    accountId: "mock-account-1",
    accountUsername: "jay_gurudeventerprises",
    platform: "instagram",
    mediaType: i % 3 === 0 ? "carousel" : "image",
    caption: `Mock post ${i + 1} — sample caption with #hashtags`,
    mediaUrls: [],
    status: statuses[i % statuses.length],
    scheduledAt: new Date(Date.now() + (i + 1) * 86400000),
    publishedAt: i % 2 ? null : new Date(Date.now() - i * 86400000),
    permalink: `https://www.instagram.com/p/MOCK-${i + 1}/`,
    createdAt: new Date(Date.now() - i * 86400000),
  }));
}
