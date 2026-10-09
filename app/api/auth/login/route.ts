import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/dashboard";
  const baseUrl = process.env.NODE_ENV === "production" 
    ? "https://viralokit.vercel.app" 
    : url.origin;
  const redirectUri = `${baseUrl}/api/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUri,
    },
  });

  if (data?.url) {
    return NextResponse.redirect(data.url);
  }

  const errorMsg = encodeURIComponent(error?.message || "oauth_failed");
  return NextResponse.redirect(new URL(`/login?error=${errorMsg}`, url.origin));
}
