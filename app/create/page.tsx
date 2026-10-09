"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  UploadCloud,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Trash2,
  MoveLeft,
  MoveRight,
  Send,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Wand2,
  Hash,
  AlertCircle,
  Calendar,
  Bookmark,
  Plus,
  X,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { InstagramPostPreview } from "@/components/instagram/post-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageAnalysisResult } from "@/lib/ai/image-analysis";

function sanitizeCaption(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && (trimmed.includes('"caption"') || trimmed.includes("'caption'"))) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && parsed.caption) return String(parsed.caption);
    } catch {
      const match = trimmed.match(/"caption"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"(?:cta|hashtags)"|"$|(?<!\\)")/);
      if (match && match[1]) {
        return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').trim();
      }
    }
  }
  return text;
}

export default function CreatePostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [postType, setPostType] = useState<"IMAGE" | "CAROUSEL" | "REELS" | "STORIES">("IMAGE");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "9:16">("4:5");
  const [images, setImages] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>(["#digitalmarketing", "#contentcreator"]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [scheduledFor, setScheduledFor] = useState<string>("");

  // AI & Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [selectedTone, setSelectedTone] = useState("Creator");
  const [selectedModel, setSelectedModel] = useState("openrouter/free");
  const [publishStatus, setPublishStatus] = useState<
    "idle" | "uploading" | "creating_container" | "processing" | "publishing" | "published" | "failed"
  >("idle");

  // Fetch Connected Account Info
  const { data: accountData } = useQuery({
    queryKey: ["meta-account"],
    queryFn: async () => {
      const res = await fetch("/api/meta/account");
      return res.json();
    },
  });

  // Fetch Dynamic Free Models
  const { data: modelsData, isLoading: isModelsLoading } = useQuery({
    queryKey: ["ai-models"],
    queryFn: async () => {
      const res = await fetch("/api/ai/models");
      return res.json();
    },
  });

  // Client-side image optimizer to stay well below Vercel's 4.5MB limit
  const optimizeImageForUpload = async (file: File): Promise<File | Blob> => {
    if (file.size <= 1.2 * 1024 * 1024) return file;

    if (!file.type.startsWith("image/")) return file;
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const maxDimension = 1920;
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" }));
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.88
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      img.src = objectUrl;
    });
  };

  // Process files one-by-one to prevent Vercel 4.5MB request payload limit
  const processAndUploadFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    if (postType === "IMAGE" && fileList.length > 1) {
      toast.info("Switched to Carousel mode for multiple images.");
      setPostType("CAROUSEL");
    }

    if (postType === "CAROUSEL" && images.length + fileList.length > 10) {
      toast.error("Instagram carousels support a maximum of 10 images.");
      return;
    }
    
    if ((postType === "REELS" || postType === "STORIES" || postType === "IMAGE") && fileList.length > 1) {
      toast.error(`Only 1 file can be uploaded for ${postType}.`);
      return;
    }

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        toast.loading(`Uploading slide ${i + 1} of ${fileList.length}...`, { id: "upload-toast" });

        const optimized = await optimizeImageForUpload(file);
        const formData = new FormData();
        formData.append("file", optimized);

        const res = await fetch("/api/cloudinary/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const rawText = await res.text();
          let errText = `Upload failed for ${file.name}`;
          try {
            const parsed = JSON.parse(rawText);
            errText = parsed.error || errText;
          } catch {
            if (rawText.includes("Request Entity Too Large") || res.status === 413) {
              errText = `Image "${file.name}" is too large. Please select a smaller image.`;
            }
          }
          throw new Error(errText);
        }

        const data = await res.json();
        if (data.assets && data.assets.length > 0) {
          for (const asset of data.assets) {
            if (asset.secureUrl) newUrls.push(asset.secureUrl);
          }
        }
      }

      if (postType === "IMAGE" || postType === "REELS" || postType === "STORIES") {
        setImages([newUrls[0]]);
      } else {
        setImages((prev) => [...prev, ...newUrls].slice(0, 10));
      }

      toast.success(`Successfully uploaded ${newUrls.length} image(s)!`, { id: "upload-toast" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload images.", { id: "upload-toast" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processAndUploadFiles(e.target.files);
    }
  };

  // Reordering carousel slides
  const moveImage = (index: number, direction: "left" | "right") => {
    const newIndex = direction === "left" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[newIndex];
    copy[newIndex] = temp;
    setImages(copy);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePurgeFromCloudinary = async () => {
    try {
      toast.loading("Purging images from Cloudinary to free CDN space...", { id: "purge-cdn" });
      const res = await fetch("/api/cloudinary/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_all" }),
      });
      const data = await res.json();
      if (data.success) {
        setImages([]);
        toast.success(data.message || "All uploads purged from Cloudinary! CDN quota freed.", { id: "purge-cdn" });
      } else {
        toast.error(data.error || "Failed to purge CDN media", { id: "purge-cdn" });
      }
    } catch {
      toast.error("Network error while purging CDN storage", { id: "purge-cdn" });
    }
  };

  // AI Image Analysis
  const handleAnalyzeImage = async () => {
    if (images.length === 0) {
      toast.error("Please upload an image first to analyze.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: images[0],
          modelId: selectedModel,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to analyze image");
      }

      setAnalysisResult(data);
      toast.success("AI Image Analysis complete!");
    } catch (err: any) {
      toast.error(err?.message || "AI Analysis unavailable. Check keys or try another model.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI Caption Generation
  const handleGenerateCaption = async (action: string = "generate") => {
    setIsGeneratingCaption(true);
    try {
      const context = analysisResult
        ? `Subject: ${analysisResult.subject}. Mood: ${analysisResult.mood}. Style: ${analysisResult.style}. Keywords: ${analysisResult.keywords.join(", ")}`
        : "Visual creator Instagram post.";

      const res = await fetch("/api/ai/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          tone: selectedTone,
          action,
          currentCaption: caption,
          modelId: selectedModel,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Caption generation failed");
      }

      const cleanCaption = sanitizeCaption(data.caption);
      setCaption(cleanCaption);
      if (Array.isArray(data.hashtags) && data.hashtags.length > 0) {
        setHashtags(data.hashtags);
      }
      toast.success("Caption generated with AI!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate caption.");
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  // Publish Post Flow
  const handlePublish = async () => {
    if (images.length === 0) {
      toast.error("Please upload at least one image before publishing.");
      return;
    }

    if (postType === "CAROUSEL" && images.length < 2) {
      toast.error("Instagram carousel posts require at least 2 images (up to 10).");
      return;
    }

    if (!accountData?.connected) {
      toast.error("No Instagram account connected. Please visit Settings to connect.");
      return;
    }

    setPublishStatus("uploading");

    try {
      setPublishStatus("creating_container");
      // Sanitize and append hashtags to caption if not already present
      const cleanUserCaption = sanitizeCaption(caption);
      let finalCaption = cleanUserCaption;
      if (hashtags.length > 0 && !finalCaption.includes("#")) {
        finalCaption = `${finalCaption}\n\n${hashtags.join(" ")}`;
      }

      setPublishStatus("processing");
      const res = await fetch("/api/meta/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaType: postType,
          caption: finalCaption,
          imageUrls: images,
          scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Publishing rejected by Meta Graph API");
      }

      setPublishStatus("published");
      toast.success("Successfully published to Instagram!");
      setTimeout(() => {
        router.push("/posts");
      }, 1500);
    } catch (err: any) {
      setPublishStatus("failed");
      toast.error(err?.message || "Failed to publish post.");
    }
  };

  const addHashtag = (rawTag: string) => {
    let clean = rawTag.trim();
    if (!clean) return;
    if (!clean.startsWith("#")) clean = `#${clean}`;
    if (!hashtags.includes(clean)) {
      setHashtags((prev) => [...prev, clean]);
      toast.success(`Added ${clean}`);
    }
    setCustomTagInput("");
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(
        "postgram_post_draft",
        JSON.stringify({
          postType,
          aspectRatio,
          images,
          caption,
          hashtags,
          selectedTone,
          savedAt: new Date().toISOString(),
        })
      );
      toast.success("Draft saved to browser storage!");
    } catch {
      toast.error("Failed to save draft locally.");
    }
  };

  const tones = ["Creator", "Aesthetic", "Minimal", "Casual", "Professional", "Hinglish", "Hindi", "English"];
  const suggestedTags = ["#growth", "#creatorlife", "#instatips", "#aesthetic", "#reelstrending", "#foryou"];

  return (
    <div className="flex min-h-screen bg-[#050505] overflow-hidden relative text-zinc-100 font-sans selection:bg-pink-500 selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Header
          accountUsername={accountData?.username}
          isConnected={accountData?.connected}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 relative z-10">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-pink-600/10 to-transparent blur-[120px] pointer-events-none" />
          
          {/* Top Bar: Title & Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 border border-pink-500/25 px-2.5 py-0.5 rounded-full">
                  Post Studio
                </span>
                <span className="text-[11px] text-zinc-500">• Meta Graph v23.0 Verified</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-headline flex items-center gap-2">
                Create & Publish
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Craft, analyze, and publish high-definition carousels and posts to @{accountData?.username || "Instagram"}.
              </p>
            </div>

            {/* Quick Top Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                className="glass-panel text-xs gap-1.5 text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700"
              >
                <Bookmark className="w-3.5 h-3.5 text-zinc-400" />
                <span>Save Draft</span>
              </Button>

              <div className="relative flex items-center group">
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  title="Schedule this post for later"
                  className="glass-panel text-[11px] text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700 bg-transparent px-3 py-1.5 h-8 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer w-40"
                />
              </div>

              <Button
                size="sm"
                onClick={handlePublish}
                disabled={
                  images.length === 0 ||
                  (postType === "CAROUSEL" && images.length < 2) ||
                  (publishStatus !== "idle" && publishStatus !== "failed")
                }
                className="primary-gradient-bg glow-primary text-white text-xs font-semibold gap-1.5 border-0 hover:opacity-95 shadow-lg transition-all"
              >
                {publishStatus === "creating_container" ||
                publishStatus === "processing" ||
                publishStatus === "publishing" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{scheduledFor ? "Schedule Post" : "Publish Now"}</span>
              </Button>
            </div>
          </div>

          {/* Publishing Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Media Upload & AI Studio (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Media Assets Section */}
              <div className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-6 sm:p-7 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                  <div>
                    <h2 className="text-base font-bold text-white font-headline flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-pink-400" />
                      <span>Media Assets</span>
                      {images.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] py-0.5 px-2 bg-pink-500/10 text-pink-300 border-pink-500/20">
                          {images.length} {postType === "CAROUSEL" ? "/ 10 slides" : "selected"}
                        </Badge>
                      )}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">Upload high-resolution images or carousels (25 GB isolated CDN)</p>
                  </div>

                  {/* Post Type Selector (Single Image vs Carousel) */}
                  <div className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl self-start sm:self-auto">
                    <button
                      onClick={() => {
                        setPostType("IMAGE");
                        if (images.length > 1) setImages([images[0]]);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        postType === "IMAGE"
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Single</span>
                    </button>

                    <button
                      onClick={() => setPostType("CAROUSEL")}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        postType === "CAROUSEL"
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Carousel</span>
                    </button>

                    <button
                      onClick={() => {
                        setPostType("REELS");
                        if (images.length > 1) setImages([images[0]]);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        postType === "REELS"
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Reels</span>
                    </button>

                    <button
                      onClick={() => {
                        setPostType("STORIES");
                        if (images.length > 1) setImages([images[0]]);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        postType === "STORIES"
                          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md font-semibold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Stories</span>
                    </button>
                  </div>
                </div>

                {/* Aspect Ratio Selector Pills */}
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="text-zinc-400 text-xs font-medium flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                    Preview Aspect Ratio:
                  </span>
                  <div className="flex items-center gap-2">
                    {(["1:1", "4:5", "9:16"] as const).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                          aspectRatio === ratio
                            ? "bg-pink-500/20 text-pink-300 border border-pink-500/50 shadow-sm font-semibold"
                            : "bg-[#141414] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20"
                        }`}
                      >
                        {ratio === "1:1" && "1:1 Square"}
                        {ratio === "4:5" && "4:5 Portrait"}
                        {ratio === "9:16" && "9:16 Story"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dotted Upload Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      processAndUploadFiles(e.dataTransfer.files);
                    }
                  }}
                  className="border-2 border-dashed border-zinc-700/80 hover:border-pink-500/60 bg-gradient-to-b from-zinc-900/40 via-zinc-950/50 to-zinc-900/30 hover:bg-zinc-900/40 rounded-2xl p-7 text-center cursor-pointer transition-all duration-300 group shadow-inner"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={postType === "REELS" ? "video/*" : postType === "STORIES" ? "image/*,video/*" : "image/*"}
                    multiple={postType === "CAROUSEL"}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500/15 to-purple-500/15 border border-pink-500/25 flex items-center justify-center mx-auto mb-3 text-pink-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(244,82,173,0.3)] transition-all">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-pink-400" />
                    ) : (
                      <UploadCloud className="w-6 h-6" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-zinc-200">
                    {isUploading ? "Uploading to Cloudinary CDN..." : "Drag and drop your media here"}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Supports JPG, PNG, WEBP, MP4
                    {postType === "CAROUSEL" && " • Select 2 to 10 images for carousel"}
                    {postType === "REELS" && " • Select 1 video for reels"}
                    {postType === "STORIES" && " • Select 1 image or video for stories"}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3.5 bg-zinc-900/80 border-zinc-700/80 hover:border-pink-500/50 text-xs text-zinc-200 pointer-events-none group-hover:border-pink-500/60"
                  >
                    Browse Files
                  </Button>
                </div>

                {/* Uploaded Thumbnails Carousel Manager */}
                {images.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-400">
                        {postType === "CAROUSEL" ? "Reorder or remove slides:" : "Selected Image:"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePurgeFromCloudinary}
                          className="text-[11px] text-zinc-400 hover:text-red-400 border-zinc-800 hover:border-red-500/40 h-6 px-2 gap-1"
                          title="Permanently delete uploaded images from Cloudinary to keep 25 GB CDN storage free"
                        >
                          <Trash2 className="w-3 h-3 text-zinc-500 hover:text-red-400" />
                          <span>Purge from Cloudinary</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setImages([])}
                          className="text-[11px] text-zinc-400 hover:text-white h-6 px-2"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                      {images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 aspect-square shadow-md"
                        >
                          {img.toLowerCase().endsWith(".mp4") || img.toLowerCase().endsWith(".mov") ? (
                            <video src={img} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                          ) : (
                            <img src={img} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                          )}

                          <span className="absolute top-1 left-1 bg-black/75 backdrop-blur-sm rounded px-1.5 text-[10px] font-bold text-white">
                            #{idx + 1}
                          </span>

                          {/* Hover overlay controls */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                            {postType === "CAROUSEL" && idx > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveImage(idx, "left");
                                }}
                                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white"
                                title="Move Left"
                              >
                                <MoveLeft className="w-3 h-3" />
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(idx);
                              }}
                              className="p-1 rounded bg-red-600 hover:bg-red-500 text-white"
                              title="Remove"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>

                            {postType === "CAROUSEL" && idx < images.length - 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveImage(idx, "right");
                                }}
                                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white"
                                title="Move Right"
                              >
                                <MoveRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Vision Analysis Trigger Button */}
                {images.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      <span>Deep visual analysis with OpenRouter multimodal AI</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAnalyzeImage}
                      disabled={isAnalyzing}
                      className="text-xs gap-1.5 text-pink-300 border-pink-500/30 hover:bg-pink-500/10"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5 text-pink-400" />
                      )}
                      <span>{isAnalyzing ? "Analyzing..." : "Analyze Image"}</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* AI Image Analysis Breakdown Results */}
              {analysisResult && (
                <div className="glass-panel rounded-2xl p-5 border-pink-500/30 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      <h3 className="text-sm font-semibold text-white">AI Visual Analysis</h3>
                      <Badge variant="default" className="text-[10px] py-0 px-1.5 bg-gradient-to-r from-pink-500 to-purple-600">
                        Multimodal Verified
                      </Badge>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {analysisResult.model}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-0.5">Subject</span>
                        <span className="text-zinc-200 font-medium">{analysisResult.subject}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                        <span className="text-zinc-500 text-[10px] uppercase font-bold block mb-0.5">Style & Mood</span>
                        <span className="text-zinc-200 font-medium">
                          {analysisResult.style} • {analysisResult.mood}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5">
                      <span className="text-zinc-500 text-[10px] uppercase font-bold block">Keywords</span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.keywords.map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-zinc-400">
                        Alt Text: <span className="text-zinc-300 italic">{analysisResult.altText}</span>
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setCaption(analysisResult.suggestedCaption);
                          setHashtags(analysisResult.suggestedHashtags);
                          toast.success("Applied AI caption and hashtags!");
                        }}
                        className="text-xs h-7 gap-1"
                      >
                        Apply to Studio
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Caption & Details Studio */}
              <div className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-6 sm:p-7 space-y-6 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h2 className="text-base font-bold text-white font-headline">Caption & AI Engine</h2>
                    <Badge variant="secondary" className="text-[10px] py-0.5 px-2 bg-purple-500/10 text-purple-300 border-purple-500/20">
                      Multi-Model Ready
                    </Badge>
                  </div>

                  {/* Free AI Model Picker */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-zinc-400 text-[11px]">Model:</span>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-pink-500 cursor-pointer"
                    >
                      <option value="openrouter/free">Auto — Intelligent Free Router</option>
                      {modelsData?.freeTextModels?.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.name.replace(/\s*\(free\)/gi, "")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tone Picker */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-medium">Caption Tone & Style:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {tones.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTone(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                          selectedTone === t
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-md"
                            : "bg-[#141414] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Caption Textarea with Character Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-medium">Caption Editor</span>
                    <span className={caption.length > 2200 ? "text-red-400 font-bold" : "text-zinc-400"}>
                      {caption.length} / 2,200 characters
                    </span>
                  </div>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write your Instagram caption here or click Generate with AI..."
                    rows={5}
                    className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/80 focus:ring-2 focus:ring-pink-500/20 resize-y leading-relaxed transition-all"
                  />
                </div>

                {/* Quick AI Action Modifiers */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleGenerateCaption("generate")}
                    disabled={isGeneratingCaption}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs h-9 px-4 rounded-xl gap-2 font-medium cursor-pointer shadow-md shadow-pink-500/20"
                  >
                    {isGeneratingCaption ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5" />
                    )}
                    <span>Generate with AI</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleGenerateCaption("shorten")}
                    disabled={isGeneratingCaption || !caption}
                    className="text-xs h-9 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-200 cursor-pointer"
                  >
                    Shorten
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleGenerateCaption("improve")}
                    disabled={isGeneratingCaption || !caption}
                    className="text-xs h-9 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-200 cursor-pointer"
                  >
                    Improve
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleGenerateCaption("add_cta")}
                    disabled={isGeneratingCaption || !caption}
                    className="text-xs h-9 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-200 cursor-pointer"
                  >
                    Add CTA
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleGenerateCaption("add_hashtags")}
                    disabled={isGeneratingCaption}
                    className="text-xs h-9 px-3 rounded-xl gap-1 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-200 cursor-pointer"
                  >
                    <Hash className="w-3 h-3 text-pink-400" />
                    AI Hashtags
                  </Button>
                </div>

                {/* Interactive Hashtag Manager */}
                <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-pink-400" />
                      Hashtag Manager ({hashtags.length})
                    </span>
                    {hashtags.length > 0 && (
                      <button
                        onClick={() => setHashtags([])}
                        className="text-[11px] text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        Clear tags
                      </button>
                    )}
                  </div>

                  {/* Interactive Chip List */}
                  <div className="flex flex-wrap items-center gap-2">
                    {hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141414] border border-white/[0.1] text-xs text-pink-300 group hover:border-pink-500/40 transition-colors"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeHashtag(tag)}
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.1] transition-colors cursor-pointer"
                          title="Remove hashtag"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}

                    {/* Quick Add Tag Input */}
                    <div className="inline-flex items-center gap-1.5">
                      <input
                        type="text"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addHashtag(customTagInput);
                          }
                        }}
                        placeholder="+ Add tag..."
                        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-3.5 py-1 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-pink-500 w-32"
                      />
                      {customTagInput.trim() && (
                        <button
                          type="button"
                          onClick={() => addHashtag(customTagInput)}
                          className="p-1 rounded-full bg-pink-600 hover:bg-pink-500 text-white cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] text-zinc-500">
                    <span>Suggested:</span>
                    {suggestedTags.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => addHashtag(t)}
                        className="hover:text-pink-400 transition-colors cursor-pointer"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Instagram Preview & Publishing (5 Cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
              {/* Device Preview Card */}
              <div className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-white font-headline">Live Phone Preview</h3>
                  </div>
                  <Badge variant="secondary" className="text-[10px] py-0.5 px-2 bg-black/60 text-zinc-400 border border-white/[0.1]">
                    {aspectRatio}
                  </Badge>
                </div>

                <div className="flex flex-col items-center">
                  <InstagramPostPreview
                    username={accountData?.username || "creator_handle"}
                    avatarUrl={accountData?.profilePictureUrl}
                    mediaType={postType}
                    imageUrls={images}
                    caption={sanitizeCaption(caption)}
                    hashtags={hashtags}
                    aspectRatio={aspectRatio}
                  />
                </div>
              </div>

              {/* Publish Control Card */}
              <div className="glass-card bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4 shadow-2xl">
                {publishStatus !== "idle" && (
                  <div className="p-4 bg-black/60 rounded-2xl border border-white/[0.08] text-xs space-y-2.5">
                    <div className="flex items-center gap-2 font-medium">
                      {publishStatus === "published" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : publishStatus === "failed" ? (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                      )}
                      <span className="capitalize text-zinc-200">
                        {publishStatus === "creating_container"
                          ? "Creating Meta Media Container..."
                          : publishStatus === "processing"
                          ? "Polling Instagram Container Status..."
                          : publishStatus === "publishing"
                          ? "Publishing Container to Live Feed..."
                          : publishStatus === "published"
                          ? "Confirmed Published by Meta!"
                          : publishStatus === "failed"
                          ? "Publishing Failed"
                          : "Preparing Media..."}
                      </span>
                    </div>

                    {/* Step Progress Bar */}
                    <div className="w-full bg-[#141414] rounded-full h-2 overflow-hidden border border-white/[0.05]">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-600 h-full transition-all duration-500 rounded-full"
                        style={{
                          width:
                            publishStatus === "uploading"
                              ? "25%"
                              : publishStatus === "creating_container"
                              ? "50%"
                              : publishStatus === "processing"
                              ? "75%"
                              : publishStatus === "publishing"
                              ? "90%"
                              : publishStatus === "published"
                              ? "100%"
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  onClick={handlePublish}
                  disabled={
                    images.length === 0 ||
                    (postType === "CAROUSEL" && images.length < 2) ||
                    (publishStatus !== "idle" && publishStatus !== "failed")
                  }
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 text-white font-bold text-sm gap-2 h-12 rounded-xl shadow-2xl shadow-pink-500/20 transition-all cursor-pointer"
                >
                  {publishStatus === "creating_container" ||
                  publishStatus === "processing" ||
                  publishStatus === "publishing" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>
                    {postType === "CAROUSEL"
                      ? scheduledFor ? `Schedule Carousel (${images.length} slides)` : `Publish Carousel (${images.length} slides)`
                      : scheduledFor ? "Schedule to Instagram" : "Publish to Instagram"}
                  </span>
                </Button>

                <p className="text-[11px] text-zinc-500 text-center">
                  Official Meta Graph API v23.0 • Direct server-side token connection
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
