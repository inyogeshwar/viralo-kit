import { NextRequest, NextResponse } from "next/server";

import { jsonError, requireUserId } from "@/lib/http";
import { AiError, generateCaption } from "@/lib/providers/ai";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    mediaType?: "image" | "carousel" | "reel";
    subject?: string;
    tone?: string;
    includeHashtags?: boolean;
    images?: Array<{ mimeType?: string; data?: string }>;
  };

  const images = (body.images ?? [])
    .filter((img) => typeof img.data === "string" && img.data.length > 0)
    .slice(0, 4)
    .map((img) => ({
      mimeType: img.mimeType || "image/jpeg",
      data: img.data as string,
    }));

  if (!body.subject && images.length === 0) {
    return jsonError("Add an AI subject or select an image first.");
  }

  try {
    const result = await generateCaption({
      mediaType: body.mediaType === "carousel" ? "carousel" : body.mediaType === "reel" ? "reel" : "image",
      subject: body.subject,
      tone: body.tone,
      includeHashtags: body.includeHashtags,
      images,
    });
    return NextResponse.json({
      ok: true,
      ...result,
      caption: result.body,
    });
  } catch (err) {
    if (err instanceof AiError) return jsonError(err.message, 502);
    throw err;
  }
}
