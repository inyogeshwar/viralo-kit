interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

function getBucket(key: string, maxTokens: number, refillMs: number): Bucket {
  let bucket = buckets.get(key);
  const now = Date.now();
  if (!bucket) {
    bucket = { tokens: maxTokens, lastRefill: now };
    buckets.set(key, bucket);
    return bucket;
  }
  const elapsed = now - bucket.lastRefill;
  const refill = Math.floor(elapsed / refillMs);
  if (refill > 0) {
    bucket.tokens = Math.min(maxTokens, bucket.tokens + refill);
    bucket.lastRefill = now;
  }
  return bucket;
}

export async function acquireRateLimit(
  accountId: string,
  type: "text" | "video" | "conversations" | "private_reply",
): Promise<boolean> {
  const limits: Record<string, { max: number; refillMs: number }> = {
    text: { max: 100, refillMs: 1000 },
    video: { max: 10, refillMs: 1000 },
    conversations: { max: 2, refillMs: 1000 },
    private_reply: { max: 750, refillMs: 3600000 },
  };
  const cfg = limits[type] ?? limits.text;
  const bucket = getBucket(`${accountId}:${type}`, cfg.max, cfg.refillMs);
  if (bucket.tokens > 0) {
    bucket.tokens--;
    return true;
  }
  return false;
}

export function getRateLimitStatus(
  accountId: string,
  type: "text" | "video" | "conversations" | "private_reply",
) {
  const limits: Record<string, { max: number; refillMs: number }> = {
    text: { max: 100, refillMs: 1000 },
    video: { max: 10, refillMs: 1000 },
    conversations: { max: 2, refillMs: 1000 },
    private_reply: { max: 750, refillMs: 3600000 },
  };
  const cfg = limits[type] ?? limits.text;
  const bucket = getBucket(`${accountId}:${type}`, cfg.max, cfg.refillMs);
  return { remaining: bucket.tokens, max: cfg.max };
}
