import { env } from "@/lib/env";

export interface CaptionPrompt {
  mediaType: "image" | "carousel" | "reel";
  subject?: string;
  tone?: string;
  platform?: string;
  includeHashtags?: boolean;
  images?: Array<{ mimeType: string; data: string }>;
}

export interface CaptionResult {
  shortDescription: string;
  title: string;
  body: string;
  keywords: string[];
  hashtags: string[];
  raw: string;
}

const GENERATE_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models";

export class AiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiError";
  }
}

export async function generateCaption(prompt: CaptionPrompt): Promise<CaptionResult> {
  if (!env.gemini.apiKey) {
    return mockCaption(prompt);
  }

  const isReel = prompt.mediaType === "reel";
  const isCarousel = prompt.mediaType === "carousel";
  const contentFormat = isReel ? "Reel/video" : isCarousel ? "multi-slide carousel" : "single image post";

  const systemPrompt = `You are an expert Instagram copywriter and social media growth strategist. You write captions that stop the scroll, drive engagement, and build community.

RULES:
- Always generate in EXACTLY this 3-part structure (use the section headers exactly as shown)
- Part 1 must be a SHORT hook (under 10 words) that creates curiosity
- Part 2 must be a TITLE that clearly states the topic
- Part 3 must be the full caption body with line breaks for readability
- End with 15-20 relevant keywords (comma-separated, on one line starting with "Keywords:")
- End with 3-5 relevant hashtags (on one line starting with "Hashtags:")
- Use single sentence paragraphs with line breaks between them
- Maximum 3 emojis total, placed only at the end
- CTA must ask viewers to save, comment, or share
- Keep total under 2,200 characters
- Do NOT use markdown formatting (no bold, no bullets, no numbered lists)
- Write in ${prompt.tone || "conversational, engaging"} tone`;

  const imageInstructions = prompt.images?.length
    ? `\n\nThe user has attached ${prompt.images.length} image(s). Analyze them carefully — describe what you SEE in the image (subject, scene, mood, text, colors, objects). Write the caption based on the ACTUAL visual content, not just the topic.`
    : "";

  const userPrompt = `Generate an Instagram ${contentFormat} caption.

Topic/Subject: ${prompt.subject || "general content"}
Content type: ${contentFormat}
${imageInstructions}

Output EXACTLY in this format:

[Short Description]
(1 line, under 10 words, creates curiosity)

[Title]
(Clear topic title)

[Caption Body]
(2-4 short paragraphs with line breaks, punchy and conversational, ending with a CTA)

Keywords:
(keyword1, keyword2, ... up to 20 relevant keywords)

Hashtags:
(#hashtag1 #hashtag2 ... 3-5 relevant hashtags)`;

  const parts: unknown[] = [{ text: `${systemPrompt}\n\n${userPrompt}` }];
  for (const image of prompt.images ?? []) {
    parts.push({
      inlineData: {
        mimeType: image.mimeType || "image/jpeg",
        data: image.data,
      },
    });
  }

  const url = `${GENERATE_ENDPOINT}/${env.gemini.model}:generateContent`;
  const body = JSON.stringify({
    contents: [{ role: "user", parts }],
    generationConfig: { temperature: 0.8, maxOutputTokens: 800 },
  });

  let data: Record<string, unknown> | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.gemini.apiKey,
      },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      const status = res.status;
      const retryable = status === 429 || status >= 500;
      if (retryable && attempt < 3) {
        const retryAfter = Number(res.headers.get("Retry-After") ?? 0);
        await new Promise((r) => setTimeout(r, retryAfter * 1000 || attempt * 1500));
        continue;
      }
      let detail = text.slice(0, 300);
      try {
        const parsed = JSON.parse(text) as { error?: { message?: string; status?: string } };
        if (parsed.error?.message) detail = `${parsed.error.status ? `${parsed.error.status}: ` : ""}${parsed.error.message}`;
      } catch {
        /* keep raw body */
      }
      throw new AiError(`Gemini request failed (${status}): ${detail}`);
    }

    data = (await res.json()) as Record<string, unknown>;
    break;
  }

  const candidates = data?.candidates as
    | Array<{ content?: { parts?: Array<{ text?: string }> } }>
    | undefined;
  const raw = candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new AiError("Gemini returned an empty response.");
  return parseCaption(raw.trim());
}

function parseCaption(raw: string): CaptionResult {
  const shortDesc = extractSection(raw, "[Short Description]", "[Title]");
  const title = extractSection(raw, "[Title]", "[Caption Body]");
  const bodySection = extractSection(raw, "[Caption Body]", "Keywords:");
  const keywordsLine = extractLine(raw, "Keywords:");
  const hashtagsLine = extractLine(raw, "Hashtags:");

  const keywords = keywordsLine
    .split(/[,|]/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
    .slice(0, 20);

  const hashtags = (hashtagsLine.match(/#[\w]+/g) ?? [])
    .slice(0, 5);

  return {
    shortDescription: shortDesc || "",
    title: title || "",
    body: bodySection || raw,
    keywords,
    hashtags,
    raw,
  };
}

function extractSection(text: string, from: string, to: string): string {
  const startIdx = text.indexOf(from);
  if (startIdx === -1) return "";
  const contentStart = startIdx + from.length;
  const endIdx = text.indexOf(to, contentStart);
  const section = endIdx === -1 ? text.slice(contentStart) : text.slice(contentStart, endIdx);
  return section.trim();
}

function extractLine(text: string, marker: string): string {
  const idx = text.indexOf(marker);
  if (idx === -1) return "";
  const afterMarker = text.slice(idx + marker.length);
  const lineEnd = afterMarker.indexOf("\n");
  return lineEnd === -1 ? afterMarker.trim() : afterMarker.slice(0, lineEnd).trim();
}

function mockCaption(prompt: CaptionPrompt): CaptionResult {
  const subject = prompt.subject || "your content";
  const raw = [
    `[Short Description]`,
    `${subject.charAt(0).toUpperCase() + subject.slice(1)} made simple`,
    ``,
    `[Title]`,
    `How to ${subject} like a pro`,
    ``,
    `[Caption Body]`,
    `Stop scrolling — this one's a game changer.`,
    ``,
    `Here's what most people get wrong about ${subject}. The secret? Start small, stay consistent, and let the results speak.`,
    ``,
    `Save this for later and tag someone who needs to see this 🔥`,
    ``,
    `Keywords: ${subject}, instagram, tips, growth, social media, content, strategy, viral, engagement, reels, algorithm, digital marketing, creator, online, community`,
    ``,
    `Hashtags: #instatips #growthmindset #contentcreator #socialmediamarketing #viral`,
  ].join("\n");

  return {
    shortDescription: `${subject.charAt(0).toUpperCase() + subject.slice(1)} made simple`,
    title: `How to ${subject} like a pro`,
    body: `Stop scrolling — this one's a game changer.\n\nHere's what most people get wrong about ${subject}. The secret? Start small, stay consistent, and let the results speak.\n\nSave this for later and tag someone who needs to see this 🔥`,
    keywords: [subject, "instagram", "tips", "growth", "social media", "content", "strategy", "viral", "engagement", "reels", "algorithm", "digital marketing", "creator", "online", "community"],
    hashtags: ["#instatips", "#growthmindset", "#contentcreator", "#socialmediamarketing", "#viral"],
    raw,
  };
}
