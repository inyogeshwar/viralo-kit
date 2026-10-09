"use client";

import React, { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostPreviewProps {
  username?: string;
  avatarUrl?: string | null;
  mediaType: "IMAGE" | "CAROUSEL" | "REELS" | "STORIES";
  imageUrls: string[];
  caption: string;
  hashtags?: string[];
  aspectRatio?: "1:1" | "4:5" | "9:16";
  className?: string;
}

export function InstagramPostPreview({
  username = "your_handle",
  avatarUrl,
  mediaType,
  imageUrls,
  caption,
  hashtags = [],
  aspectRatio = "4:5",
  className,
}: PostPreviewProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const images = imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80"];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // Extract hashtags from caption or combine with passed hashtags
  const displayHashtags = Array.from(
    new Set([
      ...hashtags,
      ...(caption.match(/#[a-zA-Z0-9_]+/g) || []),
    ])
  );

  return (
    <div className={cn("w-full max-w-sm mx-auto flex flex-col items-center", className)}>
      {/* Lumina Device Shell */}
      <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-[2.2rem] p-3.5 shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Device Frame */}
        <div className="w-full bg-black border-[5px] border-zinc-900 rounded-[1.8rem] relative overflow-hidden flex flex-col shadow-inner">
          {/* Top Notch Area */}
          <div className="h-5 bg-black flex justify-center items-start pt-1 z-20">
            <div className="w-24 h-3.5 bg-zinc-900 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-zinc-950/80 mr-3" />
              <div className="w-2.5 h-1.5 rounded-full bg-zinc-800" />
            </div>
          </div>

          {/* Instagram App Top Header */}
          <div className="px-3 py-2 border-b border-zinc-900 flex justify-between items-center bg-black z-10">
            <span className="text-white text-xs font-bold tracking-tight">Instagram</span>
            <span className="text-[11px] text-zinc-400 font-medium">New Post</span>
            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
          </div>

          {/* Post Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-950 bg-black">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-600 to-purple-800 flex items-center justify-center text-[10px] font-bold text-white">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-white hover:underline cursor-pointer block leading-none">
                  {username}
                </span>
                <p className="text-[9px] text-zinc-500 leading-tight mt-0.5">Original audio</p>
              </div>
            </div>
            <button className="text-zinc-400 hover:text-white transition-colors">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Main Media Container */}
          <div
            className={cn(
              "relative w-full bg-zinc-950 overflow-hidden group transition-all duration-300",
              aspectRatio === "1:1" && "aspect-square",
              aspectRatio === "4:5" && "aspect-[4/5]",
              aspectRatio === "9:16" && "aspect-[9/16]"
            )}
          >
            <img
              src={images[activeSlide] || images[0]}
              alt="Post Preview"
              className="w-full h-full object-cover transition-transform duration-300"
            />

            {/* Carousel controls & counter */}
            {mediaType === "CAROUSEL" && images.length > 1 && (
              <>
                {/* Slide counter pill */}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-medium text-white/90">
                  {activeSlide + 1}/{images.length}
                </div>

                {/* Left/Right click triggers */}
                <button
                  onClick={handlePrev}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white opacity-80 hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white opacity-80 hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Action Bar */}
          <div className="px-3 pt-2 pb-1 bg-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={cn("transition-transform active:scale-125", isLiked ? "text-red-500 fill-red-500" : "text-white hover:text-zinc-300")}
                >
                  <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                </button>
                <button className="text-white hover:text-zinc-300 transition-colors">
                  <MessageCircle className="w-4 h-4 -scale-x-100" />
                </button>
                <button className="text-white hover:text-zinc-300 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Carousel Dot Indicators */}
              {mediaType === "CAROUSEL" && images.length > 1 && (
                <div className="flex items-center gap-1">
                  {images.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-full transition-all duration-300",
                        i === activeSlide ? "w-1.5 h-1.5 bg-blue-500 scale-110" : "w-1 h-1 bg-zinc-600"
                      )}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={() => setIsSaved(!isSaved)}
                className={cn("transition-transform active:scale-125", isSaved ? "text-white fill-white" : "text-white hover:text-zinc-300")}
              >
                <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
              </button>
            </div>

            {/* Likes line */}
            <p className="text-[11px] font-semibold text-white mt-1.5">
              {isLiked ? "1,248 likes" : "1,247 likes"}
            </p>

            {/* Caption Area */}
            <div className="mt-1 text-[11px] leading-relaxed space-y-1">
              <p className="break-words">
                <span className="font-semibold text-white mr-1.5">{username}</span>
                <span className="text-zinc-300">
                  {caption || "Your generated caption will appear here in real-time as you type or use AI."}
                </span>
              </p>

              {/* Hashtags */}
              {displayHashtags.length > 0 && (
                <p className="text-blue-400 text-[10px] flex flex-wrap gap-1">
                  {displayHashtags.map((tag, idx) => (
                    <span key={idx} className="hover:underline cursor-pointer">
                      {tag.startsWith("#") ? tag : `#${tag}`}
                    </span>
                  ))}
                </p>
              )}
            </div>

            {/* Comments count */}
            <p className="mt-1 text-[10px] text-zinc-500 cursor-pointer hover:text-zinc-400">
              View all 42 comments
            </p>
          </div>

          {/* Instagram-style Nav Bar */}
          <div className="h-9 border-t border-zinc-900 bg-black flex justify-around items-center px-2 mt-auto">
            <div className="w-3.5 h-3.5 rounded-sm border border-zinc-600" />
            <div className="w-3.5 h-3.5 rounded-full border border-zinc-600" />
            <div className="w-3.5 h-3.5 rounded-sm border border-zinc-600 flex items-center justify-center text-[8px] text-zinc-500 font-bold">+</div>
            <div className="w-4 h-4 rounded-full bg-zinc-800 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-700" />
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 text-center">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Mobile Preview
          </span>
        </div>
      </div>
    </div>
  );
}
