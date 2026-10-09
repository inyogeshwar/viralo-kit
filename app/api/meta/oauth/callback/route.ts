import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { config, getMetaGraphUrl } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { encryptToken } from "@/lib/security/encryption";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(`${config.app.url}/settings?error=Authentication+required`);
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorMessage = searchParams.get("error_message");

  if (error) {
    console.error("Meta OAuth Error:", error, errorMessage);
    return NextResponse.redirect(`${config.app.url}/settings?error=${encodeURIComponent(errorMessage || error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${config.app.url}/settings?error=Missing+authorization+code`);
  }

  const cookieState = request.cookies.get("oauth_state")?.value;
  if (!state || state !== cookieState) {
    return NextResponse.redirect(`${config.app.url}/settings?error=Invalid+state+parameter`);
  }

  try {
    const { appId, appSecret } = config.meta;
    const redirectUri = `${config.app.url}/api/meta/oauth/callback`;

    // 1. Exchange code for short-lived access token
    const tokenUrl = `${getMetaGraphUrl("oauth/access_token")}?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${encodeURIComponent(code)}`;
    const tokenRes = await fetch(tokenUrl, { method: "GET" });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      throw new Error(tokenData.error?.message || "Failed to exchange authorization code.");
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange for long-lived access token
    const exchangeUrl = `${getMetaGraphUrl("oauth/access_token")}?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${encodeURIComponent(shortLivedToken)}`;
    const exchangeRes = await fetch(exchangeUrl, { method: "GET" });
    const exchangeData = await exchangeRes.json();

    if (!exchangeRes.ok || exchangeData.error) {
      throw new Error(exchangeData.error?.message || "Failed to get long-lived token.");
    }

    const longLivedToken = exchangeData.access_token;
    const expiresIn = exchangeData.expires_in || 5184000;

    // 3. Get Instagram Business Account ID
    const accountsUrl = `${getMetaGraphUrl("me/accounts")}?fields=instagram_business_account{id,username,profile_picture_url}&access_token=${encodeURIComponent(longLivedToken)}`;
    const accountsRes = await fetch(accountsUrl);
    const accountsData = await accountsRes.json();

    if (!accountsRes.ok || accountsData.error) {
      throw new Error(accountsData.error?.message || "Failed to fetch Facebook pages.");
    }

    // Find the first page with a connected Instagram Professional account
    let igAccount = null;
    if (accountsData.data && Array.isArray(accountsData.data)) {
      for (const page of accountsData.data) {
        if (page.instagram_business_account?.id) {
          igAccount = page.instagram_business_account;
          break;
        }
      }
    }

    if (!igAccount) {
      return NextResponse.redirect(`${config.app.url}/settings?error=No+connected+Instagram+Professional+account+found`);
    }

    // 4. Save to Database
    const supabase = await createClient();

    const encryptedToken = encryptToken(longLivedToken);
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const { data: existingAccount } = await supabase
      .from("instagram_accounts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingAccount) {
      const { error: updateError } = await supabase
        .from("instagram_accounts")
        .update({
          instagram_user_id: igAccount.id,
          username: igAccount.username || null,
          profile_picture_url: igAccount.profile_picture_url || null,
          access_token_encrypted: encryptedToken,
          token_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      
      if (updateError) throw new Error(updateError.message);
    } else {
      const { error: insertError } = await supabase
        .from("instagram_accounts")
        .insert({
          user_id: user.id,
          instagram_user_id: igAccount.id,
          username: igAccount.username || null,
          profile_picture_url: igAccount.profile_picture_url || null,
          access_token_encrypted: encryptedToken,
          token_expires_at: expiresAt,
        });
        
      if (insertError) throw new Error(insertError.message);
    }

    // Success: clear cookie and redirect
    const response = NextResponse.redirect(`${config.app.url}/settings?success=Account+connected`);
    response.cookies.delete("oauth_state");
    return response;

  } catch (err: any) {
    console.error("Meta OAuth Callback Error:", err);
    return NextResponse.redirect(`${config.app.url}/settings?error=${encodeURIComponent(err?.message || "Failed to connect account")}`);
  }
}
