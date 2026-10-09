import { createBrowserClient } from "@supabase/ssr";
import { config } from "@/lib/config";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || config.supabase.url;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || config.supabase.anonKey;
  return createBrowserClient(url, anonKey);
}

