import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    
    const { error } = await supabase
      .from("instagram_accounts")
      .delete()
      .eq("user_id", user.id);
      
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to disconnect account:", err);
    return NextResponse.json(
      { error: "Failed to disconnect account", code: "DISCONNECT_ERROR" },
      { status: 500 }
    );
  }
}
