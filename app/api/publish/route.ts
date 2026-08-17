import { NextRequest, NextResponse } from "next/server";

import { getDb, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { jsonError, requireUserId } from "@/lib/http";
import { decryptToken } from "@/lib/crypto";
import { mockPublishResult } from "@/lib/mock";
import { InstagramError, InstagramProvider } from "@/lib/providers/instagram";
import { MediaHostError, uploadBuffer } from "@/lib/providers/cloudinary";
import { getDashboardContext } from "@/lib/context";
import { listAccounts } from "@/lib/workspace";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const formData = await req.formData();
  const mediaType = (formData.get("mediaType") as string) ?? "image";
  const caption = (formData.get("caption") as string) ?? "";
  const scheduledAtRaw = (formData.get("scheduledAt") as string) ?? "";
  const files = formData.getAll("images").filter((f): f is File => f instanceof File);

  if (mediaType !== "image" && mediaType !== "carousel" && mediaType !== "reel") {
    return jsonError("mediaType must be 'image', 'carousel', or 'reel'.");
  }
  if (!files.length) return jsonError("Select at least one file.");
  if (mediaType === "image" && files.length !== 1) {
    return jsonError("A single image post takes exactly one image.");
  }
  if (mediaType === "carousel" && (files.length < 2 || files.length > 10)) {
    return jsonError("A carousel needs between 2 and 10 images.");
  }
  if (mediaType === "reel" && files.length !== 1) {
    return jsonError("A reel takes exactly one video file.");
  }

  const scheduledAt = scheduledAtRaw ? new Date(scheduledAtRaw) : null;
  const isScheduled = scheduledAt instanceof Date && scheduledAt.getTime() > Date.now();

  const ctx = await getDashboardContext();
  const { workspace } = ctx;

  const requestedAccountId = (formData.get("accountId") as string) ?? "";
  const accounts = await listAccounts(workspace.id);
  const account =
    (requestedAccountId
      ? accounts.find((a) => a.id === requestedAccountId)
      : undefined) ??
    accounts.find((a) => a.isActive) ??
    accounts[0] ??
    null;

  if (!account) return jsonError("Connect an Instagram account first.");

  if (env.mockMode) {
    const urls = files.map((f, i) =>
      `https://res.cloudinary.com/mock/image/upload/social-copilot/mock-${i + 1}-${f.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
    );
    const result = mockPublishResult(mediaType, urls);
    return NextResponse.json({
      ok: true,
      mock: true,
      result,
      post: {
        mediaType,
        caption,
        mediaUrls: urls,
        status: isScheduled ? "scheduled" : "published",
        scheduledAt: scheduledAt?.toISOString() ?? null,
        accountUsername: account.username,
      },
    });
  }

  const db = getDb();
  if (!db) return jsonError("Database is not configured (set DATABASE_URL).");

  const token = decryptToken(account.accessToken);
  const provider = new InstagramProvider({ igUserId: account.igUserId, accessToken: token });

  let mediaUrls: string[];
  try {
    const uploaded = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      uploaded.push(await uploadBuffer(buffer, file.name));
    }
    mediaUrls = uploaded.map((u) => u.url);
  } catch (err) {
    if (err instanceof MediaHostError) return jsonError(err.message, 502);
    throw err;
  }

  let publishResult: Record<string, unknown> | null = null;
  let status: "published" | "scheduled" | "failed" = isScheduled ? "scheduled" : "published";
  let error: string | null = null;

  if (!isScheduled) {
    try {
      if (mediaType === "reel") {
        publishResult = await provider.publishReel(mediaUrls[0], caption);
      } else if (mediaType === "image") {
        publishResult = await provider.publishImage(mediaUrls[0], caption);
      } else {
        publishResult = await provider.publishCarousel(mediaUrls, caption);
      }
    } catch (err) {
      status = "failed";
      error = err instanceof InstagramError ? err.message : String(err);
    }
  }

  const values: typeof schema.posts.$inferInsert = {
    workspaceId: workspace.id,
    accountId: account.id,
    platform: "instagram",
    mediaType,
    caption,
    mediaUrls,
    status,
    scheduledAt: scheduledAt ?? null,
    publishedAt: status === "published" ? new Date() : null,
    containerId: (publishResult?.containerId as string) ?? null,
    mediaId: (publishResult?.mediaId as string) ?? null,
    permalink: (publishResult?.permalink as string) ?? null,
    error,
  };
  const inserted = await db.insert(schema.posts).values(values).returning();

  const message = error
    ? `Publish failed: ${error}`
    : isScheduled
      ? `Scheduled for ${formatDateTime(scheduledAt!.toISOString())}`
      : "Published to Instagram";

  return NextResponse.json({
    ok: true,
    result: publishResult,
    post: inserted[0],
    message,
    scheduled: isScheduled,
  });
}
