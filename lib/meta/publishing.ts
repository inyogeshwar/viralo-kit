import { config, getMetaGraphUrl } from "@/lib/config";
import { PublishResult } from "./types";

export class MetaApiError extends Error {
  code?: number | string;
  subcode?: number;
  constructor(message: string, code?: number | string, subcode?: number) {
    super(message);
    this.name = "MetaApiError";
    this.code = code;
    this.subcode = subcode;
  }
}

async function postMeta(path: string, body: Record<string, string>, accessToken: string) {
  const url = getMetaGraphUrl(path);
  const params = new URLSearchParams({
    ...body,
    access_token: accessToken,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    const err = data.error || {};
    const errMsg = err.error_user_msg || err.message || `Meta API error on ${path}`;
    console.error(`[postMeta] Error on ${path}: code=${err.code}, subcode=${err.error_subcode}, message=${errMsg}`);
    throw new MetaApiError(
      errMsg,
      err.code,
      err.error_subcode
    );
  }

  return data;
}

async function getMeta(path: string, params: Record<string, string>, accessToken: string) {
  const url = getMetaGraphUrl(path);
  const searchParams = new URLSearchParams({
    ...params,
    access_token: accessToken,
  });

  const response = await fetch(`${url}?${searchParams.toString()}`);
  const data = await response.json();
  if (!response.ok || data.error) {
    const err = data.error || {};
    throw new MetaApiError(
      err.message || `Meta API error on ${path}`,
      err.code,
      err.error_subcode
    );
  }

  return data;
}

// Poll container status until ready (FINISHED) or failed (ERROR)
async function waitForContainer(
  containerId: string,
  accessToken: string,
  maxAttempts = 15,
  delayMs = 1200
): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const data = await getMeta(containerId, { fields: "status_code" }, accessToken);
      const status = data.status_code;
      if (status === "FINISHED") {
        return;
      }
      if (status === "ERROR" || status === "EXPIRED") {
        throw new MetaApiError(`Media container processing failed with status: ${status}`);
      }
    } catch (err: any) {
      if (err instanceof MetaApiError && err.message.includes("Media container processing failed")) {
        throw err;
      }
      // Non-terminal error or transient status check error: continue polling
    }
    await new Promise((res) => setTimeout(res, delayMs));
  }
}

export async function publishSingleImage(
  imageUrl: string,
  caption: string,
  userId: string,
  accessToken: string
): Promise<PublishResult> {
  if (!userId || !accessToken) {
    throw new MetaApiError("Missing Instagram credentials. Please connect your account in Settings.");
  }

  // 1. Create Media Container
  const container = await postMeta(
    `${userId}/media`,
    {
      image_url: imageUrl,
      caption: caption || "",
    },
    accessToken
  );

  const containerId = container.id;

  // 2. Poll for container readiness
  await waitForContainer(containerId, accessToken);

  // 3. Publish Container
  const published = await postMeta(
    `${userId}/media_publish`,
    {
      creation_id: containerId,
    },
    accessToken
  );

  const mediaId = published.id;

  // 4. Fetch live permalink
  let permalink: string | undefined;
  try {
    const mediaDetails = await getMeta(mediaId, { fields: "permalink" }, accessToken);
    permalink = mediaDetails.permalink;
  } catch {
    // Non-critical if permalink fetch takes time to populate
  }

  return {
    type: "IMAGE",
    containerId,
    mediaId,
    permalink,
    publishedAt: new Date().toISOString(),
    publicUrls: [imageUrl],
  };
}

export async function publishCarousel(
  imageUrls: string[],
  caption: string,
  userId: string,
  accessToken: string
): Promise<PublishResult> {
  if (!userId || !accessToken) {
    throw new MetaApiError("Missing Instagram credentials. Please connect your account in Settings.");
  }

  if (!imageUrls || imageUrls.length < 2 || imageUrls.length > 10) {
    throw new MetaApiError("Instagram carousels require between 2 and 10 images.");
  }

  console.log(`[publishCarousel] Creating ${imageUrls.length} child containers in parallel...`);

  // 1. Create child containers in parallel for speed
  const childContainerIds = await Promise.all(
    imageUrls.map(async (url) => {
      const child = await postMeta(
        `${userId}/media`,
        {
          image_url: url,
          is_carousel_item: "true",
        },
        accessToken
      );
      return child.id as string;
    })
  );

  console.log(`[publishCarousel] Child containers created:`, childContainerIds);

  // 2. Poll child containers in parallel
  await Promise.all(
    childContainerIds.map((childId) => waitForContainer(childId, accessToken, 15, 1000))
  );

  console.log(`[publishCarousel] All child containers ready. Creating parent container...`);

  // 3. Create parent carousel container
  const carouselContainer = await postMeta(
    `${userId}/media`,
    {
      media_type: "CAROUSEL",
      children: childContainerIds.join(","),
      caption: caption || "",
    },
    accessToken
  );

  const carouselContainerId = carouselContainer.id;
  console.log(`[publishCarousel] Parent container created: ${carouselContainerId}. Polling...`);

  // 4. Poll parent container
  await waitForContainer(carouselContainerId, accessToken, 15, 1000);

  console.log(`[publishCarousel] Publishing parent container: ${carouselContainerId}...`);

  // 5. Publish Carousel
  const published = await postMeta(
    `${userId}/media_publish`,
    {
      creation_id: carouselContainerId,
    },
    accessToken
  );

  const mediaId = published.id;
  console.log(`[publishCarousel] Live published with mediaId: ${mediaId}`);

  // 6. Fetch live permalink
  let permalink: string | undefined;
  try {
    const mediaDetails = await getMeta(mediaId, { fields: "permalink" }, accessToken);
    permalink = mediaDetails.permalink;
  } catch {
    // Non-critical
  }

  return {
    type: "CAROUSEL",
    containerId: carouselContainerId,
    mediaId,
    permalink,
    publishedAt: new Date().toISOString(),
    publicUrls: imageUrls,
  };
}

export async function publishReel(
  videoUrl: string,
  caption: string,
  userId: string,
  accessToken: string
): Promise<PublishResult> {
  if (!userId || !accessToken) {
    throw new MetaApiError("Missing Instagram credentials.");
  }

  // 1. Create Media Container for Reel
  const container = await postMeta(
    `${userId}/media`,
    {
      media_type: "REELS",
      video_url: videoUrl,
      caption: caption || "",
      share_to_feed: "true",
    },
    accessToken
  );

  const containerId = container.id;

  // 2. Poll for processing completion
  await waitForContainer(containerId, accessToken, 30, 2000);

  // 3. Publish
  const published = await postMeta(
    `${userId}/media_publish`,
    { creation_id: containerId },
    accessToken
  );

  const mediaId = published.id;
  let permalink: string | undefined;
  try {
    const mediaDetails = await getMeta(mediaId, { fields: "permalink" }, accessToken);
    permalink = mediaDetails.permalink;
  } catch {}

  return {
    type: "REELS",
    containerId,
    mediaId,
    permalink,
    publishedAt: new Date().toISOString(),
    publicUrls: [videoUrl],
  };
}

export async function publishStory(
  mediaUrl: string,
  isVideo: boolean,
  userId: string,
  accessToken: string
): Promise<PublishResult> {
  if (!userId || !accessToken) {
    throw new MetaApiError("Missing Instagram credentials.");
  }

  // 1. Create Media Container for Story
  const payload: Record<string, string> = { media_type: "STORIES" };
  if (isVideo) {
    payload.video_url = mediaUrl;
  } else {
    payload.image_url = mediaUrl;
  }

  const container = await postMeta(`${userId}/media`, payload, accessToken);
  const containerId = container.id;

  // 2. Poll for processing
  await waitForContainer(containerId, accessToken, 30, 2000);

  // 3. Publish
  const published = await postMeta(
    `${userId}/media_publish`,
    { creation_id: containerId },
    accessToken
  );

  const mediaId = published.id;
  
  return {
    type: "STORIES",
    containerId,
    mediaId,
    publishedAt: new Date().toISOString(),
    publicUrls: [mediaUrl],
  };
}

