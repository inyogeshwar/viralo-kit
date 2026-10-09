import { config, getMetaGraphUrl } from "@/lib/config";

export interface DeleteItemResult {
  mediaId: string;
  status: "deleted" | "failed";
  reason?: string;
}

export interface BulkDeleteSummary {
  totalRequested: number;
  totalDeleted: number;
  totalFailed: number;
  results: DeleteItemResult[];
}

export async function deleteInstagramMedia(
  mediaId: string,
  accessToken: string
): Promise<{ success: boolean; reason?: string }> {
  if (!accessToken) {
    return {
      success: false,
      reason: "Missing Instagram credentials. Please connect your account in Settings.",
    };
  }

  const url = `${getMetaGraphUrl(mediaId)}?access_token=${encodeURIComponent(accessToken)}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      const code = data.error?.code;
      const message = data.error?.message || "Instagram API rejected deletion request.";

      // Human-readable categorization
      if (code === 10 || code === 200 || code === 190) {
        return {
          success: false,
          reason: "Meta Graph API restricts deleting published Instagram posts via third-party apps for account safety. Please delete directly in the Instagram app or Meta Business Suite.",
        };
      }
      if (code === 100) {
        return {
          success: false,
          reason: "Invalid media ID or this media object cannot be deleted via API.",
        };
      }
      return {
        success: false,
        reason: "Meta Graph API policy requires deleting published posts directly in the Instagram app or Meta Business Suite.",
      };
    }

    if (data.success === true) {
      return { success: true };
    }

    return {
      success: false,
      reason: "Instagram API returned an unexpected response during deletion.",
    };
  } catch (err: any) {
    return {
      success: false,
      reason: err?.message || "Network error communicating with Instagram Graph API.",
    };
  }
}

export async function bulkDeleteInstagramMedia(
  mediaIds: string[],
  accessToken: string
): Promise<BulkDeleteSummary> {
  const results: DeleteItemResult[] = [];
  let totalDeleted = 0;
  let totalFailed = 0;

  for (let i = 0; i < mediaIds.length; i++) {
    const mediaId = mediaIds[i];
    const outcome = await deleteInstagramMedia(mediaId, accessToken);

    if (outcome.success) {
      totalDeleted++;
      results.push({
        mediaId,
        status: "deleted",
      });
    } else {
      totalFailed++;
      results.push({
        mediaId,
        status: "failed",
        reason: outcome.reason || "Deletion failed",
      });
    }

    // Rate-limit pacing: 150ms between requests to respect Meta API thresholds
    if (i < mediaIds.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  return {
    totalRequested: mediaIds.length,
    totalDeleted,
    totalFailed,
    results,
  };
}
