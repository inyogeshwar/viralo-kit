"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarClock, Copy, Check, Loader2, Send, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Account {
  id: string;
  igUserId: string;
  username: string | null;
}

interface CaptionResult {
  shortDescription: string;
  title: string;
  body: string;
  keywords: string[];
  hashtags: string[];
  raw: string;
}

export default function ComposePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "carousel" | "reel">("image");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [subject, setSubject] = useState("");
  const [tone, setTone] = useState("");
  const [schedule, setSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [aiResult, setAiResult] = useState<CaptionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setAccounts(data.accounts ?? []);
          if (data.activeId) setAccountId(data.activeId);
        }
      })
      .catch(() => undefined);
  }, []);

  const onFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list);
    if (mediaType === "image" && next.length > 1) next.splice(1);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  }, [mediaType]);

  async function generateCaption() {
    if (!subject.trim() && files.length === 0) return;
    setAiBusy(true);
    setMessage(null);
    setAiResult(null);
    try {
      const images = [];
      for (const file of files.slice(0, 4)) {
        const dataUrl: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        images.push({ mimeType: file.type || "image/jpeg", data: dataUrl.split(",")[1] ?? "" });
      }
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaType, subject, tone, images }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Generation failed");
      const result: CaptionResult = {
        shortDescription: data.shortDescription ?? "",
        title: data.title ?? "",
        body: data.body ?? data.caption ?? "",
        keywords: data.keywords ?? [],
        hashtags: data.hashtags ?? [],
        raw: data.raw ?? "",
      };
      setAiResult(result);
      // Build full caption for the text area
      const fullCaption = [result.body, ...result.hashtags].join("\n\n");
      setCaption(fullCaption);
    } catch (err) {
      setMessage({ kind: "error", text: String(err instanceof Error ? err.message : err) });
    } finally {
      setAiBusy(false);
    }
  }

  function copyFullCaption() {
    const text = aiResult ? [aiResult.shortDescription, "", aiResult.title, "", aiResult.body, "", aiResult.hashtags.join(" ")].join("\n") : caption;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function publishNow() {
    if (!files.length || !accountId) return;
    setBusy(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.set("mediaType", mediaType);
      formData.set("caption", caption);
      formData.set("accountId", accountId);
      if (schedule && scheduledAt) formData.set("scheduledAt", new Date(scheduledAt).toISOString());
      for (const file of files) formData.append("images", file);

      const res = await fetch("/api/publish", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Publish failed");
      setMessage({ kind: "ok", text: data.message });
    } catch (err) {
      setMessage({ kind: "error", text: String(err instanceof Error ? err.message : err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Compose</h1>
        <p className="text-sm text-muted-foreground">
          Create an image, carousel, or reel post and publish it to Instagram.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Post details</CardTitle>
            <CardDescription>What and where to publish.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Account</Label>
                <Select value={accountId || undefined} onValueChange={setAccountId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        @{account.username ?? account.igUserId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Post type</Label>
                <Select
                  value={mediaType}
                  onValueChange={(v) => setMediaType(v as "image" | "carousel" | "reel")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Single image</SelectItem>
                    <SelectItem value="carousel">Carousel (2–10)</SelectItem>
                    <SelectItem value="reel">Reel / Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="images">Images</Label>
              <Input
                id="images"
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4"
                multiple
                onChange={(e) => onFiles(e.target.files)}
              />
              <p className="text-xs text-muted-foreground">
                {mediaType === "image" ? "Pick one image." : mediaType === "reel" ? "Pick a video or cover image." : "Pick 2 to 10 images."}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Your caption with hashtags..."
                className="min-h-32"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-2">
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="AI subject, e.g. 'How to grow on Instagram'"
                />
                <Input
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="Tone (e.g. motivational, funny)"
                  className="w-full sm:w-44"
                />
              </div>
              <Button type="button" variant="outline" onClick={generateCaption} disabled={aiBusy || (!subject.trim() && files.length === 0)} className="shrink-0">
                {aiBusy ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Sparkles className="mr-1.5 size-3.5" />}
                Generate
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Schedule</p>
                  <p className="text-xs text-muted-foreground">Publish at a later time.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={schedule}
                onChange={(e) => setSchedule(e.target.checked)}
                className="size-4"
              />
            </div>

            {schedule ? (
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            ) : null}

            <div className="flex gap-2">
              <Button onClick={publishNow} disabled={busy || !files.length || !accountId} className="flex-1">
                {busy ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Send className="mr-1.5 size-3.5" />}
                {schedule ? "Schedule post" : "Publish to Instagram"}
              </Button>
              {aiResult && (
                <Button variant="outline" onClick={copyFullCaption} type="button">
                  {copied ? <Check className="mr-1.5 size-3.5" /> : <Copy className="mr-1.5 size-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </div>

            {message ? (
              <div
                className={`rounded-lg border px-4 py-2.5 text-sm ${
                  message.kind === "ok"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                }`}
              >
                {message.text}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {aiResult && (aiResult.shortDescription || aiResult.title) ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">AI Generated Caption</CardTitle>
                  <Badge variant="secondary" className="text-[10px]">3-part format</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiResult.shortDescription && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Short Description</p>
                    <p className="text-sm font-semibold">{aiResult.shortDescription}</p>
                  </div>
                )}
                {aiResult.title && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Title</p>
                    <p className="text-sm font-bold">{aiResult.title}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Caption</p>
                  <p className="whitespace-pre-line text-sm">{aiResult.body}</p>
                </div>
                {aiResult.keywords.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Keywords ({aiResult.keywords.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {aiResult.keywords.map((kw, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {aiResult.hashtags.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hashtags</p>
                    <div className="flex flex-wrap gap-1">
                      {aiResult.hashtags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Selected images in order.</CardDescription>
            </CardHeader>
            <CardContent>
              {previews.length === 0 ? (
                <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground sm:h-64">
                  Select images to preview
                </div>
              ) : mediaType === "reel" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previews[0]}
                  alt="Preview"
                  className="aspect-[9/16] w-full max-w-[240px] rounded-lg object-cover mx-auto"
                />
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {previews.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
              {mediaType === "carousel" ? (
                <div className="mt-3 flex gap-1">
                  {Array.from({ length: files.length }).map((_, i) => (
                    <Badge key={i} variant="secondary">
                      {i + 1}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
