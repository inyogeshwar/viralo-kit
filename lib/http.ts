import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function requireUserId(): Promise<
  { userId: string; response: null } | { userId: null; response: NextResponse }
> {
  const { userId } = await auth();
  if (!userId) {
    return {
      userId: null,
      response: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { userId, response: null };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}
