import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  isDemoUser: boolean;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Creator";
  
  return {
    id: user.id,
    email: user.email || "",
    name,
    avatarUrl: user.user_metadata?.avatar_url || null,
    isDemoUser: false,
  };
}
