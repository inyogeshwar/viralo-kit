import { createClient } from "@/lib/supabase/server";
import { decryptToken } from "@/lib/security/encryption";

export interface UserInstagramCredentials {
  instagramUserId: string;
  accessToken: string;
  username: string | null;
}

/**
 * Retrieves and decrypts the connected Instagram account credentials
 * for a given user.
 */
export async function getUserInstagramCredentials(
  userId: string
): Promise<UserInstagramCredentials | null> {
  const supabase = await createClient();

  try {
    const { data: account, error } = await supabase
      .from("instagram_accounts")
      .select("instagram_user_id, access_token_encrypted, username")
      .eq("user_id", userId)
      .single();

    if (error || !account) {
      return null;
    }

    const accessToken = decryptToken(account.access_token_encrypted);

    return {
      instagramUserId: account.instagram_user_id,
      accessToken,
      username: account.username,
    };
  } catch (err) {
    console.error("Failed to retrieve user Instagram credentials:", err);
    return null;
  }
}
