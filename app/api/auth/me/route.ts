import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";

import { config } from "@/lib/config";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";

export async function GET() {
  const user = await getCurrentUser();
  const credentials = user ? await getUserInstagramCredentials(user.id) : null;

  return NextResponse.json({
    user,
    systemStatus: {
      authKitConfigured: Boolean(config.supabase.url && config.supabase.anonKey),
      databaseConfigured: Boolean(config.supabase.url && config.supabase.anonKey),
      instagramConfigured: Boolean(credentials),
      cloudinaryConfigured: Boolean(
        config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret
      ),
      openRouterConfigured: Boolean(config.ai.openRouterKey),
      geminiConfigured: Boolean(config.ai.geminiKey),
      apiVersion: config.meta.apiVersion,
    },
  });
}
