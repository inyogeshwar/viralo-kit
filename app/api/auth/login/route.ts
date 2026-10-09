import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const redirectUri = process.env.NODE_ENV === "production" 
    ? "https://viralokit.vercel.app/api/auth/callback" 
    : "http://localhost:3000/api/auth/callback";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUri,
    },
  });

  if (data?.url) {
    return NextResponse.redirect(data.url);
  }

  return NextResponse.redirect(new URL("/", url.origin));
}
