import { NextResponse } from "next/server";
import { detectAccountCapabilities } from "@/lib/meta/capabilities";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";

import { sanitizeErrorMessage } from "@/lib/security/sanitize";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to view account capabilities.", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  try {
    const credentials = await getUserInstagramCredentials(user.id);
    if (!credentials) {
      return NextResponse.json({
        connected: false,
        reason: "No Instagram account connected.",
      });
    }

    const capabilities = await detectAccountCapabilities(credentials.instagramUserId, credentials.accessToken);
    return NextResponse.json(capabilities);
  } catch (err: any) {
    return NextResponse.json(
      {
        connected: false,
        reason: sanitizeErrorMessage(err, "Failed to detect Instagram capabilities."),
      },
      { status: 500 }
    );
  }
}
