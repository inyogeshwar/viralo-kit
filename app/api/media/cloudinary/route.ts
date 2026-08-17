import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/http";
import { listCloudinaryResources } from "@/lib/providers/cloudinary";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  try {
    const data = await listCloudinaryResources("social-copilot", 100);
    return NextResponse.json({ ok: true, ...data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Failed to list media" },
      { status: 500 },
    );
  }
}
