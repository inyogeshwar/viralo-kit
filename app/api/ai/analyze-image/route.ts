import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeImageWithAi } from "@/lib/ai/image-analysis";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

import { isSafePublicUrl, sanitizeErrorMessage } from "@/lib/security/sanitize";

const requestSchema = z.object({
  imageUrl: z.string().url().max(2000),
  modelId: z.string().max(100).default("openrouter/free"),
  enableGeminiFallback: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to analyze images.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = requestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid image URL", details: validated.error.flatten() }, { status: 400 });
    }

    const { imageUrl, modelId, enableGeminiFallback } = validated.data;

    // Security Problem #3 & #8: SSRF validation for external image URLs
    if (!isSafePublicUrl(imageUrl)) {
      return NextResponse.json(
        { error: "Invalid or restricted image URL. Only public HTTPS URLs are permitted." },
        { status: 400 }
      );
    }

    const analysis = await analyzeImageWithAi(imageUrl, modelId, enableGeminiFallback);

    // Save record to Supabase if DB available
    const supabase = await createClient();
    if (user) {
      try {
        await supabase.from("ai_generations").insert({
          user_id: user.id,
          provider: analysis.provider,
          model: analysis.model,
          generation_type: "image_analysis",
          input_metadata: { imageUrl },
          output: JSON.stringify(analysis),
        });
      } catch (err) {
        console.warn("Supabase DB ai_generation save error:", err);
      }
    }

    return NextResponse.json(analysis);
  } catch (err: any) {
    console.error("AI image analysis error:", err);
    return NextResponse.json(
      { error: sanitizeErrorMessage(err, "AI image analysis service temporarily unavailable.") },
      { status: 500 }
    );
  }
}
