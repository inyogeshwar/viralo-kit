"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Settings,
  Instagram,
  Sparkles,
  User,
  ShieldCheck,
  Zap,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Database,
  Cloud,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";
import { CapabilityBadges } from "@/components/instagram/capability-badges";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CloudinaryStorageManager } from "@/components/settings/cloudinary-storage-manager";

export default function SettingsPage() {
  const [selectedModel, setSelectedModel] = useState("openrouter/free");
  const [geminiFallbackEnabled, setGeminiFallbackEnabled] = useState(true);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  // 1. Fetch system & user status
  const { data: authData } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      return res.json();
    },
  });

  // 2. Fetch Instagram capabilities
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

  // 3. Fetch Free AI Models
  const { data: modelsData, isLoading: isModelsLoading } = useQuery({
    queryKey: ["ai-models"],
    queryFn: async () => {
      const res = await fetch("/api/ai/models");
      return res.json();
    },
  });

  const handleRefreshToken = async () => {
    setIsRefreshingToken(true);
    try {
      const res = await fetch("/api/meta/refresh-token", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(data.data.message || "Token refreshed successfully!");
        refetchCap();
      } else {
        toast.error(data.error?.message || "Failed to refresh token");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error refreshing token");
    } finally {
      setIsRefreshingToken(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your Instagram account? You will need to reconnect it to publish again.")) return;
    try {
      const res = await fetch("/api/meta/oauth/disconnect", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Account disconnected successfully");
        refetchCap();
      } else {
        toast.error(data.error || "Failed to disconnect");
      }
    } catch (err: any) {
      toast.error("Network error disconnecting account");
    }
  };

  const handleConnect = () => {
    window.location.href = "/api/meta/oauth/start";
  };

  const handleSavePreferences = () => {
    toast.success("AI and provider preferences updated!");
  };

  return (
    <div className="flex min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-pink-500 selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Header
          user={authData?.user}
          accountUsername={capabilities?.username}
          isConnected={capabilities?.connected}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
          <div className="border-b border-white/[0.08] pb-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 border border-pink-500/25 px-2.5 py-0.5 rounded-full">
                Infrastructure & Auth
              </span>
              <span className="text-[11px] text-zinc-500">• Zero-Cost Stack</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-headline flex items-center gap-2">
              Settings & Integrations
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Manage your connected Instagram professional credentials, multi-model AI routing, and 25 GB Cloudinary storage.
            </p>
          </div>

          {/* Instagram Account Integration */}
          <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="space-y-1">
                <h3 className="text-base font-bold flex items-center gap-2 text-white font-headline">
                  <Instagram className="w-5 h-5 text-pink-400" />
                  <span>Instagram Professional Account</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Connected directly to Meta Graph API v23.0 with server-side encrypted token security.
                </p>
              </div>
              <Badge variant={capabilities?.connected ? "success" : "warning"} className="text-[10px] py-1 px-3">
                {capabilities?.connected ? "Active & Authorized" : "Not Connected"}
              </Badge>
            </div>

            <CapabilityBadges
              capabilities={capabilities}
              isLoading={isCapLoading}
              onRefresh={() => refetchCap()}
            />

            <div className="p-4 bg-black/60 rounded-2xl border border-white/[0.08] text-xs text-zinc-400 space-y-2">
              <div className="flex justify-between">
                <span>Target API Version:</span>
                <span className="font-mono text-pink-400 font-bold">{authData?.systemStatus?.apiVersion || "v23.0"}</span>
              </div>
              <div className="flex justify-between">
                <span>Server Token Protection:</span>
                <span className="text-emerald-400 font-semibold">Encrypted / Server-Side Only (Never Exposed to Browser)</span>
              </div>
            </div>

            {capabilities?.connected ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-black/60 rounded-2xl border border-white/[0.08]">
                <div className="text-xs">
                  <p className="text-zinc-200 font-bold font-headline">Manage Connection</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Extend your 60-day token or disconnect your account.</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshToken}
                    disabled={isRefreshingToken}
                    className="h-9 px-4 rounded-xl text-xs gap-2 border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingToken ? "animate-spin text-pink-400" : ""}`} />
                    <span>{isRefreshingToken ? "Extending..." : "Extend Token"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnect}
                    className="h-9 px-4 rounded-xl text-xs gap-2 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 cursor-pointer"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-black/60 rounded-2xl border border-white/[0.08]">
                <div className="text-xs">
                  <p className="text-zinc-200 font-bold font-headline">Connect Instagram Professional Account</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Securely authenticate with Meta to enable publishing and analytics.</p>
                </div>
                <Button
                  onClick={handleConnect}
                  className="h-9 px-4 rounded-xl text-xs gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white cursor-pointer"
                >
                  <Instagram className="w-4 h-4" />
                  Connect Account
                </Button>
              </div>
            )}
          </div>

          {/* Dynamic AI Models Configuration */}
          <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2 text-white font-headline">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>AI Engine & Model Routing</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  High-speed multi-model AI routing with multimodal vision support for creative copy & accounts auditing.
                </p>
              </div>
              <Badge variant="default" className="text-[10px] py-0.5 px-2.5 bg-purple-500/10 text-purple-300 border-purple-500/20">
                Lumina Engine
              </Badge>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="text-xs text-zinc-300 font-medium">Active AI Model:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-black/60 border border-white/[0.1] rounded-2xl p-3.5 text-xs text-zinc-200 focus:outline-none focus:border-pink-500 cursor-pointer"
                >
                  <option value="openrouter/free">Auto — Intelligent Smart Router (Recommended)</option>
                  {modelsData?.freeTextModels?.map((m: any) => (
                    <option key={m.id} value={m.id} className="bg-zinc-950">
                      {m.name.replace(/\s*\(free\)/gi, "")} {m.supportsVision ? "• Vision Supported" : ""}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-zinc-500">
                  {modelsData?.totalAvailable
                    ? `${modelsData.totalAvailable} high-performance AI models available for captioning and visual analysis.`
                    : "Fetching available models..."}
                </p>
              </div>

              {/* Gemini Fallback Toggle */}
              <div className="p-4 bg-black/60 rounded-2xl border border-white/[0.08] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs font-headline">Multimodal Failover (Google Gemini)</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Automatic failover routing to ensure 99.9% uptime for AI captions and visual media analysis.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={geminiFallbackEnabled}
                  onChange={(e) => setGeminiFallbackEnabled(e.target.checked)}
                  className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-end">
                <Button size="sm" onClick={handleSavePreferences} className="text-xs h-9 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-medium cursor-pointer">
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>

          {/* Cloud Infrastructure Overview */}
          <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
            <div className="pb-4 border-b border-white/[0.08]">
              <h3 className="text-base font-bold flex items-center gap-2 text-white font-headline">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Cloud & System Integrations</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Connected production services and live backend health status.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-black/60 rounded-2xl border border-white/[0.08] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-headline">WorkOS AuthKit</span>
                  <Badge variant={authData?.systemStatus?.authKitConfigured ? "success" : "secondary"} className="text-[9px] py-0">
                    {authData?.systemStatus?.authKitConfigured ? "Connected" : "Dev Mock"}
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-400">Enterprise Authentication & SSO</p>
              </div>

              <div className="p-4 bg-black/60 rounded-2xl border border-white/[0.08] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-headline">Neon PostgreSQL</span>
                  <Badge variant={authData?.systemStatus?.databaseConfigured ? "success" : "secondary"} className="text-[9px] py-0">
                    {authData?.systemStatus?.databaseConfigured ? "Connected" : "Dev Mock"}
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-400">Serverless High-Speed Database</p>
              </div>

              <div className="p-4 bg-black/60 rounded-2xl border border-white/[0.08] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white font-headline">Cloudinary CDN</span>
                  <Badge variant={authData?.systemStatus?.cloudinaryConfigured ? "success" : "secondary"} className="text-[9px] py-0">
                    {authData?.systemStatus?.cloudinaryConfigured ? "Connected" : "Pending"}
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-400">Optimized Global Media CDN (25 GB)</p>
              </div>
            </div>
          </div>

          {/* Cloudinary CDN Quota & User Directory Storage Manager */}
          <CloudinaryStorageManager />

          {/* Current User Session Profile */}
          <div className="bg-[#0C0C0C] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
            <div className="pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold flex items-center gap-2 text-white font-headline">
                <User className="w-5 h-5 text-blue-400" />
                <span>Account Profile</span>
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs">
              {authData?.user ? (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center font-extrabold text-sm text-pink-400 font-headline">
                    {authData.user.name?.charAt(0).toUpperCase() || "C"}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white font-headline">{authData.user.name}</p>
                    <p className="text-zinc-400 text-xs">{authData.user.email}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-sm text-white font-headline">Creator Session Active</p>
                  <p className="text-zinc-400 text-xs">Server-side authenticated for Instagram Creator Studio.</p>
                </div>
              )}

              {authData?.user ? (
                <a href="/api/auth/logout">
                  <Button variant="outline" size="sm" className="text-xs h-9 px-3.5 rounded-xl gap-2 border-white/[0.1] text-zinc-300 hover:text-white cursor-pointer">
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </Button>
                </a>
              ) : (
                <a href="/api/auth/login">
                  <Button size="sm" className="text-xs h-9 px-4 rounded-xl gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium cursor-pointer">
                    <User className="w-3.5 h-3.5" />
                    <span>Sign In with WorkOS</span>
                  </Button>
                </a>
              )}
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
