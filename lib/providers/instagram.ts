import { env } from "@/lib/env";

export const GRAPH_BASE = "https://graph.facebook.com";

export class InstagramError extends Error {
  code: number | string;
  statusCode?: number;

  constructor(code: number | string, message: string, statusCode?: number) {
    super(message);
    this.name = "InstagramError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

function raiseApiError(statusCode: number, body: unknown) {
  let code: number | string = statusCode;
  let message = "Unknown Instagram API error";
  if (body && typeof body === "object") {
    const err = (body as { error?: { code?: number | string; message?: string } }).error;
    if (err) {
      code = err.code ?? statusCode;
      message = err.message ?? message;
    }
  }
  throw new InstagramError(code, message, statusCode);
}

async function graphGet(url: string) {
  const res = await fetch(url, { method: "GET" });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) raiseApiError(res.status, data);
  return data as Record<string, unknown>;
}

async function graphPost(
  url: string,
  params: Record<string, string>,
  token: string,
) {
  const body = new URLSearchParams({ ...params, access_token: token });
  const res = await fetch(url, { method: "POST", body });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) raiseApiError(res.status, data);
  return data as Record<string, unknown>;
}

export interface InstagramCredentials {
  igUserId: string;
  accessToken: string;
}

export class InstagramProvider {
  private igUserId: string;
  private accessToken: string;

  constructor({ igUserId, accessToken }: InstagramCredentials) {
    this.igUserId = igUserId;
    this.accessToken = accessToken;
  }

  private base(path: string) {
    const node = path ? `${this.igUserId}/${path}` : this.igUserId;
    return `${GRAPH_BASE}/${env.meta.apiVersion}/${node}`;
  }

  private async post(path: string, params: Record<string, string>) {
    return graphPost(this.base(path), params, this.accessToken);
  }

  private async get(path: string, params: Record<string, string>) {
    const url = `${this.base(path)}?${new URLSearchParams({
      ...params,
      access_token: this.accessToken,
    }).toString()}`;
    return graphGet(url);
  }

  private async getNode(path: string, params: Record<string, string>) {
    const url = `${GRAPH_BASE}/${env.meta.apiVersion}/${path}?${new URLSearchParams({
      ...params,
      access_token: this.accessToken,
    }).toString()}`;
    return graphGet(url);
  }

  async deleteMedia(mediaId: string) {
    const url = `${GRAPH_BASE}/${env.meta.apiVersion}/${mediaId}?access_token=${this.accessToken}`;
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      raiseApiError(res.status, body);
    }
    return (await res.json()) as { success: boolean };
  }

  async subscribeToWebhooks(subscribedFields = "comments,messages") {
    const url = `${GRAPH_BASE}/${env.meta.apiVersion}/me/subscribed_apps`;
    return graphPost(url, { subscribed_fields: subscribedFields }, this.accessToken);
  }

  async getAccountInfo() {
    return this.get("", { fields: "id,username,name" });
  }

  async createImageContainer(imageUrl: string, caption = "") {
    const data = await this.post("media", { image_url: imageUrl, caption });
    return data["id"] as string;
  }

  async createCarouselItemContainer(imageUrl: string) {
    const data = await this.post("media", {
      image_url: imageUrl,
      is_carousel_item: "true",
    });
    return data["id"] as string;
  }

  async createCarouselContainer(childContainerIds: string[], caption = "") {
    const data = await this.post("media", {
      media_type: "CAROUSEL",
      children: childContainerIds.join(","),
      caption,
    });
    return data["id"] as string;
  }

  async publishContainer(containerId: string) {
    const data = await this.post("media_publish", { creation_id: containerId });
    return (data["id"] as string) ?? null;
  }

  async publishImage(imageUrl: string, caption = "") {
    const containerId = await this.createImageContainer(imageUrl, caption);
    return {
      mediaType: "image",
      containerId,
      mediaId: await this.publishContainer(containerId),
    };
  }

  async publishCarousel(imageUrls: string[], caption = "") {
    const childIds: string[] = [];
    for (const url of imageUrls) {
      childIds.push(await this.createCarouselItemContainer(url));
    }
    const carouselId = await this.createCarouselContainer(childIds, caption);
    return {
      mediaType: "carousel",
      containerId: carouselId,
      childContainerIds: childIds,
      mediaId: await this.publishContainer(carouselId),
    };
  }

  static MEDIA_INSIGHT_METRICS: Record<string, string> = {
    IMAGE: "reach,likes,comments,shares,saved,total_interactions",
    CAROUSEL: "reach,likes,comments,shares,saved,total_interactions",
    CAROUSEL_ALBUM: "reach,likes,comments,shares,saved,total_interactions",
    VIDEO: "reach,likes,comments,shares,saved,total_interactions,plays",
    REELS: "reach,likes,comments,shares,saved,total_interactions,plays",
  };

  private static normalizeInsights(data: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const items = (data["data"] as Array<Record<string, unknown>> | undefined) ?? [];
    for (const item of items) {
      const name = item["name"] as string;
      const total = item["total_value"];
      if (total && typeof total === "object") {
        result[name] = (total as { value?: unknown }).value;
        continue;
      }
      const values = (item["values"] as Array<{ value?: unknown }> | undefined) ?? [];
      if (values.length) {
        let value = values[values.length - 1].value;
        if (value && typeof value === "object") {
          value = (value as { value?: unknown }).value;
        }
        result[name] = value;
      }
    }
    return result;
  }

  async getAccountAnalytics() {
    let account: Record<string, unknown> = {};
    const insights: Record<string, unknown> = {};
    try {
      const data = await this.get("", {
        fields: "id,username,name,media_count,followers_count",
      });
      account = {
        id: data["id"],
        username: data["username"],
        name: data["name"],
        mediaCount: data["media_count"],
        followersCount: data["followers_count"],
      };
    } catch (err) {
      if (!(err instanceof InstagramError)) throw err;
    }
    try {
      const data = await this.get("insights", {
        metric: "reach,follower_count",
        period: "day",
      });
      Object.assign(insights, InstagramProvider.normalizeInsights(data));
    } catch (err) {
      if (!(err instanceof InstagramError)) throw err;
    }
    try {
      const data = await this.get("insights", {
        metric: "profile_views,accounts_engaged,total_interactions",
        period: "day",
        metric_type: "total_value",
      });
      Object.assign(insights, InstagramProvider.normalizeInsights(data));
    } catch (err) {
      if (!(err instanceof InstagramError)) throw err;
    }
    return { account, insights };
  }

  async getRecentMedia(limit = 10) {
    const data = await this.get("media", {
      fields: "id,media_type,caption,timestamp,permalink,thumbnail_url,media_url",
      limit: String(limit),
    });
    return (data["data"] as Array<Record<string, unknown>>) ?? [];
  }

  async getMediaInsights(mediaId: string, mediaType = "IMAGE") {
    const metrics =
      InstagramProvider.MEDIA_INSIGHT_METRICS[mediaType] ??
      "reach,likes,comments,shares,saved,total_interactions";
    const data = await this.getNode(`${mediaId}/insights`, { metric: metrics });
    return InstagramProvider.normalizeInsights(data);
  }
}

// --- Instagram Login (with Facebook) OAuth helpers ---

export function buildInstagramAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: env.meta.clientId,
    redirect_uri: `${env.appUrl}/api/instagram/callback`,
    state,
    response_type: "code",
    scope: env.instagramScopes.join(","),
  });
  return `https://www.facebook.com/${env.meta.apiVersion}/dialog/oauth?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string) {
  const url = `${GRAPH_BASE}/${env.meta.apiVersion}/oauth/access_token`;
  const params = new URLSearchParams({
    client_id: env.meta.clientId,
    client_secret: env.meta.clientSecret,
    redirect_uri: `${env.appUrl}/api/instagram/callback`,
    code,
  });
  const res = await fetch(url, { method: "POST", body: params });
  const data = await res.json();
  if (!res.ok) raiseApiError(res.status, data);
  return (data as { access_token: string }).access_token;
}

export async function exchangeForLongLivedToken(shortLivedToken: string) {
  const url = `${GRAPH_BASE}/${env.meta.apiVersion}/oauth/access_token`;
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: env.meta.clientId,
    client_secret: env.meta.clientSecret,
    fb_exchange_token: shortLivedToken,
  });
  const res = await fetch(url, { method: "POST", body: params });
  const data = await res.json();
  if (!res.ok) raiseApiError(res.status, data);
  return (data as { access_token: string }).access_token;
}

export interface IgBusinessAccount {
  igUserId: string;
  username?: string;
  name?: string;
  profilePictureUrl?: string;
}

export async function findIgBusinessAccount(token: string) {
  const url = `${GRAPH_BASE}/${env.meta.apiVersion}/me/accounts?fields=id,name,instagram_business_account{id,username,profile_picture_url}&access_token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { method: "GET" });
  const data = await res.json();
  if (!res.ok) raiseApiError(res.status, data);
  const pages = (data["data"] as Array<{
    id: string;
    name?: string;
    instagram_business_account?: { id: string; username?: string; profile_picture_url?: string };
  }>) ?? [];
  const first = pages.find((page) => page.instagram_business_account);
  if (!first?.instagram_business_account) {
    throw new InstagramError(
      "NO_IG_ACCOUNT",
      "This Facebook account has no linked Instagram Business/Creator account.",
    );
  }
  const ig = first.instagram_business_account;
  return {
    igUserId: ig.id,
    username: ig.username,
    name: ig.username ?? first.name,
    profilePictureUrl: ig.profile_picture_url,
  } satisfies IgBusinessAccount;
}
