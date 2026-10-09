import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchAccountAnalytics } from "@/lib/meta/insights";
import { generateAccountAnalysisWithAi } from "@/lib/ai/account-analysis";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getUserInstagramCredentials } from "@/lib/meta/user-account";
import { createClient } from "@/lib/supabase/server";

import { sanitizeErrorMessage } from "@/lib/security/sanitize";

const auditSchema = z.object({
  modelId: z.string().max(100).default("openrouter/free"),
  enableGeminiFallback: z.boolean().default(true),
  language: z.enum(["English", "Hinglish", "Hindi"]).default("English"),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to run account audit.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const rawBody = await request.json().catch(() => ({}));
    const validated = auditSchema.safeParse(rawBody);
    const { modelId, enableGeminiFallback, language } = validated.success
      ? validated.data
      : { modelId: "openrouter/free", enableGeminiFallback: true, language: "English" as const };

    const credentials = await getUserInstagramCredentials(user.id);
    if (!credentials) {
      return NextResponse.json(
        { error: "No connected Instagram account found to audit. Please connect your account first." },
        { status: 400 }
      );
    }
    // 1. Fetch real Meta analytics
    const analytics = await fetchAccountAnalytics(credentials.instagramUserId, credentials.accessToken);
    if (!analytics) {
      return NextResponse.json(
        { error: "No connected Instagram account found to audit. Please connect your account first." },
        { status: 400 }
      );
    }

    // 2. Run strategic AI audit with language preference
    const audit = await generateAccountAnalysisWithAi(analytics, modelId, enableGeminiFallback, language);

    // 3. Save generation record
    const supabase = await createClient();
    if (user) {
      try {
        await supabase.from("ai_generations").insert({
          user_id: user.id,
          provider: audit.provider,
          model: audit.model,
          generation_type: "account_audit",
          input_metadata: { username: analytics.account.username },
          output: JSON.stringify(audit),
        });
      } catch (err) {
        console.warn("DB save audit error:", err);
      }
    }

    return NextResponse.json({
      audit,
      account: analytics.account,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Account audit API error:", err);
    return NextResponse.json(
      { error: sanitizeErrorMessage(err, "Failed to generate AI account analysis.") },
      { status: 500 }
    );
  }
}
