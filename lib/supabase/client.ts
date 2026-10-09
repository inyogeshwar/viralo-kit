import { createBrowserClient } from "@supabase/ssr";
import { config } from "@/lib/config";

function clean(val?: string): string {
  if (!val) return "";
  return val.replace(/[\u200B-\u200D\uFEFF]/g, "").trim().replace(/^["']|["']$/g, "");
}

export function createClient() {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL || config.supabase.url);
  const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || config.supabase.anonKey);
  return createBrowserClient(url, anonKey);
}

