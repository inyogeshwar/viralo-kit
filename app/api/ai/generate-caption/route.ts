import { NextResponse } from "next/server";
import { z } from "zod";
import { generateCaptionWithAi, CaptionTone, CaptionAction } from "@/lib/ai/caption-generator";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

import { sanitizePromptInput, sanitizeErrorMessage } from "@/lib/security/sanitize";

const captionSchema = z.object({
  context: z.string().max(1000).default(""),
  tone: z
    .enum(["Professional", "Aesthetic", "Casual", "Minimal", "Creator", "Hinglish", "Hindi", "English"])
    .default("Creator"),
  action: z.enum(["generate", "shorten", "improve", "add_cta", "add_hashtags"]).default("generate"),
  currentCaption: z.string().max(2200).default(""),
  modelId: z.string().max(100).default("openrouter/free"),
  enableGeminiFallback: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to generate captions.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = captionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid request parameters", details: validated.error.flatten() }, { status: 400 });
    }

    const { context, tone, action, currentCaption, modelId, enableGeminiFallback } = validated.data;

    // Sanitize user inputs to neutralize prompt injection attacks
    const sanitizedContext = sanitizePromptInput(context, 1000);
    const sanitizedCaption = sanitizePromptInput(currentCaption, 2200);

    const result = await generateCaptionWithAi({
      context: sanitizedContext,
      tone: tone as CaptionTone,
      action: action as CaptionAction,
      currentCaption: sanitizedCaption,
      modelId,
      enableGeminiFallback,
    });

    // Record in DB if available
    const supabase = await createClient();
    if (user) {
      try {
        await supabase.from("ai_generations").insert({
          user_id: user.id,
          provider: result.provider,
          model: result.model,
          generation_type: "caption",
          input_metadata: { tone, action, contextLength: sanitizedContext.length },
          output: JSON.stringify(result),
        });
      } catch (err) {
        console.warn("DB save caption error:", err);
      }
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Caption generation error:", err);
    return NextResponse.json(
      { error: sanitizeErrorMessage(err, "AI caption generator is temporarily unavailable.") },
      { status: 500 }
    );
  }
}
