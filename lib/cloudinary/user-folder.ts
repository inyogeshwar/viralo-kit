import { CurrentUser } from "@/lib/auth/current-user";
import { config, getMetaGraphUrl } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export interface UserFolderInfo {
  folder: string;
  prefix: string;
  userIdentifier: string;
  isIgUsername: boolean;
}

// In-memory cache for resolved server-side Instagram username
let cachedDefaultIgUsername: string | null = null;
let cachedDefaultIgFetchTime = 0;

/**
 * Resolves the Instagram username for the server-configured account.
 * Caches the result in-memory for 1 hour to prevent redundant Meta API calls.
 */
async function getDefaultIgUsername(): Promise<string | null> {
  const now = Date.now();
  if (cachedDefaultIgUsername && now - cachedDefaultIgFetchTime < 60 * 60 * 1000) {
    return cachedDefaultIgUsername;
  }

  const userId = config.meta.defaultUserId;
  const accessToken = config.meta.defaultAccessToken;
  if (!userId || !accessToken) return null;

  try {
    const profileUrl = `${getMetaGraphUrl(userId)}?fields=id,username&access_token=${encodeURIComponent(accessToken)}`;
    const res = await fetch(profileUrl);
    const data = await res.json();
    if (res.ok && data?.username) {
      cachedDefaultIgUsername = String(data.username).trim();
      cachedDefaultIgFetchTime = now;
      return cachedDefaultIgUsername;
    }
  } catch (err) {
    console.warn("Failed to fetch Instagram username for Cloudinary folder:", err);
  }

  return null;
}

function sanitizeForPath(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/^@+/, "") // remove leading @
    .replace(/[^a-z0-9_.-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 50);
}

/**
 * Computes the isolated Cloudinary folder path for a given user using their USERNAME.
 * Never uses raw numeric Meta/Instagram IDs in folder names.
 *
 * Output format: "postgram/users/ig_{instagram_username}" or "postgram/users/u_{username}"
 * Example: "postgram/users/ig_jay_gurudeventerprises"
 */
export async function getUserCloudinaryFolder(
  user: CurrentUser,
  customUsername?: string | null
): Promise<UserFolderInfo> {
  // 1. Explicitly passed Instagram username (e.g. from client request)
  if (customUsername && typeof customUsername === "string" && customUsername.trim().length > 0) {
    const cleanUser = sanitizeForPath(customUsername);
    if (cleanUser.length > 0) {
      return {
        folder: `postgram/users/ig_${cleanUser}`,
        prefix: `postgram/users/ig_${cleanUser}/`,
        userIdentifier: cleanUser,
        isIgUsername: true,
      };
    }
  }

  // 2. Query Supabase PostgreSQL database for connected account username
  try {
    const supabase = await createClient();
    const { data: account } = await supabase
      .from("instagram_accounts")
      .select("username")
      .eq("user_id", user.id)
      .maybeSingle();

    if (account?.username) {
      const cleanUser = sanitizeForPath(account.username);
      if (cleanUser.length > 0) {
        return {
          folder: `postgram/users/ig_${cleanUser}`,
          prefix: `postgram/users/ig_${cleanUser}/`,
          userIdentifier: cleanUser,
          isIgUsername: true,
        };
      }
    }
  } catch (err) {
    // Database query fallback
  }

  // 3. Resolve default Instagram account's username from Meta Graph API
  const defaultIgUser = await getDefaultIgUsername();
  if (defaultIgUser) {
    const cleanUser = sanitizeForPath(defaultIgUser);
    if (cleanUser.length > 0) {
      return {
        folder: `postgram/users/ig_${cleanUser}`,
        prefix: `postgram/users/ig_${cleanUser}/`,
        userIdentifier: cleanUser,
        isIgUsername: true,
      };
    }
  }

  // 4. Fallback: User email prefix or friendly name (no numeric IDs)
  let fallbackName = user.email ? user.email.split("@")[0] : user.name || "creator";
  const cleanFallback = sanitizeForPath(fallbackName);

  return {
    folder: `postgram/users/u_${cleanFallback || "creator"}`,
    prefix: `postgram/users/u_${cleanFallback || "creator"}/`,
    userIdentifier: cleanFallback || "creator",
    isIgUsername: false,
  };
}

/**
 * Validates that a target folder prefix belongs exclusively to the authenticated user.
 * Prevents unauthorized deletion of other users' assets or root directory.
 */
export function validateFolderOwnership(
  targetPrefix: string,
  userFolderInfo: UserFolderInfo
): boolean {
  if (!targetPrefix || typeof targetPrefix !== "string") return false;

  // Must start strictly with "postgram/users/"
  if (!targetPrefix.startsWith("postgram/users/")) return false;

  // Cannot be the base directory
  if (
    targetPrefix === "postgram/users/" ||
    targetPrefix === "postgram/users" ||
    targetPrefix === "postgram"
  ) {
    return false;
  }

  // Must match the user's exact folder or prefix
  return (
    targetPrefix === userFolderInfo.folder ||
    targetPrefix === userFolderInfo.prefix ||
    targetPrefix.startsWith(userFolderInfo.prefix)
  );
}
