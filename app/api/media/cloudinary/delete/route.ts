import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/http";
import { deleteCloudinaryResources } from "@/lib/providers/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireUserId();
  if (auth.response) return auth.response;

  const body = (await req.json().catch(() => ({}))) as { publicIds?: string[] };
  const ids = (body.publicIds ?? []).filter((id) => typeof id === "string" && id.length > 0);

  if (ids.length === 0) {
    return NextResponse.json({ ok: false, error: "No images selected." }, { status: 400 });
  }

  try {
    const result = await deleteCloudinaryResources(ids);
    const deleted = Object.values(result.deleted).filter((v) => v === "deleted").length;
    return NextResponse.json({ ok: true, deleted, total: ids.length });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Delete failed" },
      { status: 500 },
    );
  }
}
