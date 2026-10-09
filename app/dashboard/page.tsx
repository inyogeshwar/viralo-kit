"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  PlusSquare,
  BarChart3,
  Sparkles,
  Users,
  Eye,
  HeartHandshake,
  Image as ImageIcon,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { CapabilityBadges } from "@/components/instagram/capability-badges";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatDate } from "@/lib/utils";
import { InstagramMediaItem } from "@/lib/meta/types";
import { PostInsightsModal } from "@/components/posts/post-insights-modal";

// Animation Variants
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function DashboardPage() {
  const [selectedPostForInsights, setSelectedPostForInsights] = useState<InstagramMediaItem | null>(null);

  const { data: authData } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      return res.json();
    },
  });

  const {
    data: capabilities,
    isLoading: isCapLoading,
    refetch: refetchCap,
  } = useQuery({
    queryKey: ["meta-account"],
    queryFn: async () => {
      const res = await fetch("/api/meta/account");
      return res.json();
    },
  });

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["meta-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/meta/analytics");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: Boolean(capabilities?.connected),
  });

  const username = capabilities?.username || "Creator";

  return (
    <div className="flex min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-pink-500 selection:text-white overflow-hidden relative">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-pink-600/10 to-transparent blur-[120px] pointer-events-none" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0 z-10 relative">
        <Header
          user={authData?.user}
          accountUsername={capabilities?.username}
          isConnected={capabilities?.connected}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8">
            
            {/* Welcome Glassmorphic Hero */}
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2rem] glass-card p-6 sm:p-10 shadow-2xl border border-white/10 group">
              {/* Dynamic hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-purple-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-pink-500/40 bg-pink-500/10 text-pink-300 text-xs font-semibold backdrop-blur-md"
                  >
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                    <span>Meta Graph v23.0 Connected</span>
                  </motion.div>
                  
                  <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-headline leading-tight">
                    {capabilities?.connected ? (
                      <>
                        Welcome back, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">@{username}</span>
                      </>
                    ) : (
                      <>
                        Welcome to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">ViraloKit</span>
                      </>
                    )}
                  </h1>
                  <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
                    {capabilities?.connected
                      ? "Your Instagram Professional studio is live. High-definition carousels, 25 GB isolated CDN, and multi-model AI are ready."
                      : "Connect your Instagram Professional account to enable zero-cost publishing, real-time telemetry, and AI captioning."}
                  </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <Link href="/create">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="h-12 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-sm shadow-[0_0_20px_rgba(236,72,153,0.3)] border-none transition-all cursor-pointer gap-2">
                        <PlusSquare className="w-5 h-5" />
                        <span>Create Post</span>
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/analytics">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="secondary" className="h-12 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 font-medium text-sm backdrop-blur-md transition-all cursor-pointer gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-400" />
                        <span>Analytics</span>
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <CapabilityBadges
                capabilities={capabilities}
                isLoading={isCapLoading}
                onRefresh={() => refetchCap()}
              />
            </motion.div>

            {/* Bento Stat Telemetry Cards */}
            <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Total Followers", value: formatNumber(capabilities?.followersCount ?? analytics?.account?.followersCount), icon: Users, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", hover: "hover:border-pink-500/50", sub: "Official Graph v23.0 Sync" },
                { title: "Total Media", value: formatNumber(capabilities?.mediaCount ?? analytics?.account?.mediaCount), icon: ImageIcon, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", hover: "hover:border-purple-500/50", sub: "Images & Carousels" },
                { title: "Audience Reach", value: formatNumber(analytics?.insights?.reach), icon: Eye, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", hover: "hover:border-indigo-500/50", sub: "28-Day Window" },
                { title: "Total Interactions", value: formatNumber(analytics?.insights?.totalInteractions), icon: HeartHandshake, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", hover: "hover:border-emerald-500/50", sub: "Likes + Comments + Saves" },
              ].map((stat, i) => (
                <motion.div key={i} variants={fadeUp} whileHover={{ y: -4 }}>
                  <Card className={`bg-white/5 backdrop-blur-xl border-white/10 ${stat.hover} transition-all duration-300 rounded-2xl group shadow-lg overflow-hidden relative`}>
                    <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity`} />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                      <span className="text-xs font-medium text-zinc-400">{stat.title}</span>
                      <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center border ${stat.border} group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1 relative z-10">
                      <div className="text-3xl font-bold text-white tracking-tight font-headline">
                        {stat.value || "—"}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                        <Activity className={`w-3 h-3 ${stat.color}`} />
                        <span>{stat.sub}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Recent Published Media Preview */}
            <motion.div variants={fadeUp} className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white font-headline">Recent Published Posts</h2>
                  <p className="text-xs text-zinc-400 mt-1">Direct media feed fetched from Meta Graph API</p>
                </div>
                <Link href="/posts">
                  <Button variant="ghost" className="text-sm gap-2 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 rounded-xl transition-colors cursor-pointer">
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              {isAnalyticsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse border border-white/10" />
                  ))}
                </div>
              ) : analytics?.recentMedia && analytics.recentMedia.length > 0 ? (
                <motion.div variants={staggerContainer} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {analytics.recentMedia.slice(0, 4).map((post: any) => (
                    <motion.div
                      key={post.id}
                      variants={fadeUp}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPostForInsights(post)}
                      className="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 aspect-square cursor-pointer hover:border-pink-500/50 transition-all duration-300 shadow-xl"
                    >
                      <img
                        src={post.media_url || post.thumbnail_url}
                        alt={post.caption || "Post"}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Glassmorphic overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-between">
                        <div className="flex justify-end transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                          <Badge className="text-[10px] py-1 px-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full">
                            {post.media_type}
                          </Badge>
                        </div>
                        <div className="space-y-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-150">
                          <p className="text-white line-clamp-2 text-sm font-medium leading-snug drop-shadow-md">
                            {post.caption || "No caption"}
                          </p>
                          <div className="flex items-center justify-between text-xs text-zinc-300">
                            <span>{formatDate(post.timestamp)}</span>
                            <span className="text-pink-400 font-bold flex items-center gap-1.5 bg-pink-500/20 px-2 py-1 rounded-md backdrop-blur-sm">
                              <BarChart3 className="w-3.5 h-3.5" />
                              Insights
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div variants={fadeUp} className="p-16 text-center bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent pointer-events-none" />
                  <div className="relative z-10 space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-400 flex items-center justify-center mx-auto shadow-inner">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl text-white font-headline tracking-tight">No Published Posts Yet</h3>
                      <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                        Create and publish your first image or carousel post directly to Instagram using ViraloKit's studio.
                      </p>
                    </div>
                    <Link href="/create">
                      <Button className="bg-white text-black hover:bg-zinc-200 font-bold px-8 h-12 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        Create New Post
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {selectedPostForInsights && (
          <PostInsightsModal
            post={selectedPostForInsights}
            onClose={() => setSelectedPostForInsights(null)}
          />
        )}
      </AnimatePresence>

      <MobileNav />
    </div>
  );
}
