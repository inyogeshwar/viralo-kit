import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptToken } from "@/lib/security/encryption";
import { getMediaComments, replyToComment } from "@/lib/meta/interactions";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // max 5 min for Vercel Cron

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = await createClient();

    // 1. Fetch active instagram accounts
    const { data: accounts, error: accountErr } = await supabase
      .from("instagram_accounts")
      .select("instagram_user_id, access_token_encrypted, username");

    if (accountErr || !accounts) {
      throw new Error("Failed to fetch instagram accounts");
    }

    const results = [];

    // 2. Process each account
    for (const account of accounts) {
      try {
        const accessToken = decryptToken(account.access_token_encrypted);

        // Fetch recent posts for this account that have an instagram_media_id
        const { data: recentPosts } = await supabase
          .from("posts")
          .select("instagram_media_id, caption")
          .eq("instagram_account_id", account.instagram_user_id)
          .not("instagram_media_id", "is", null)
          .order("created_at", { ascending: false })
          .limit(3); // Only check latest 3 posts to save API limits

        if (!recentPosts) continue;

        for (const post of recentPosts) {
          try {
            // Fetch comments for the post
            const comments = await getMediaComments(post.instagram_media_id, accessToken);
            
            for (const comment of comments) {
              // Ignore comments from the account owner
              if (comment.from?.id === account.instagram_user_id) continue;
              if (comment.username && account.username && comment.username === account.username) continue;

              // Check if we already replied to this comment
              const { data: existingReply } = await supabase
                .from("auto_replies")
                .select("id")
                .eq("comment_id", comment.id)
                .single();

              if (existingReply) continue; // Already replied

              // We found a new comment! Generate an AI reply.
              const systemPrompt = `You are an AI assistant managing the Instagram account @${account.username || "Creator"}. 
A user commented on a post. Write a short, engaging, and friendly reply (max 1-2 sentences). 
Do NOT use hashtags. Feel free to use 1 relevant emoji.
Context of the post caption: "${post.caption}"`;

              const userPrompt = `Comment from ${comment.from?.username || "user"}: "${comment.text}"`;

              const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                },
                body: JSON.stringify({
                  model: "openrouter/free",
                  messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                  ]
                }),
              });

              if (!aiRes.ok) throw new Error("AI Reply Generation Failed");
              const aiData = await aiRes.json();
              const replyText = aiData.choices?.[0]?.message?.content?.trim();

              if (!replyText) throw new Error("Empty AI response");

              // Post the reply to Instagram
              await replyToComment(comment.id, replyText, accessToken);

              // Record the reply in the database
              await supabase.from("auto_replies").insert({
                comment_id: comment.id,
                instagram_account_id: account.instagram_user_id,
                reply_text: replyText
              });

              results.push({
                commentId: comment.id,
                status: "replied",
                reply: replyText
              });
            }
          } catch (postErr: any) {
            console.error(`Failed checking comments for post ${post.instagram_media_id}:`, postErr.message);
          }
        }
      } catch (accErr: any) {
        console.error(`Failed processing account ${account.instagram_user_id}:`, accErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (err: any) {
    console.error("Cron auto-reply error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
