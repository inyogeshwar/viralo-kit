"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Instagram,
  Sparkles,
  ArrowRight,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ChevronLeft,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard";
  const urlError = searchParams.get("error");

  const [authMode, setAuthMode] = useState<"magic-link" | "password">("magic-link");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const formatErrorMessage = (msg: string) => {
    if (msg.includes("Unsupported provider") || msg.includes("provider is not enabled") || msg.includes("validation_failed")) {
      return "Google OAuth is not enabled in your Supabase project yet. Please use the Magic Link or Password tab below to sign in, or enable Google under Authentication > Providers in your Supabase Dashboard.";
    }
    return msg;
  };

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    urlError ? { type: "error", text: formatErrorMessage(decodeURIComponent(urlError)) } : null
  );

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setMessage(null);
      const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "https://viralokit.vercel.app";
      const redirectUri = `${redirectOrigin}/api/auth/callback?next=${encodeURIComponent(nextUrl)}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
        },
      });

      if (error) {
        setMessage({ type: "error", text: formatErrorMessage(error.message) });
        setIsGoogleLoading(false);
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initiate Google sign in";
      setMessage({ type: "error", text: formatErrorMessage(errorMessage) });
      setIsGoogleLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      setMessage(null);
      const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "https://viralokit.vercel.app";
      const redirectUri = `${redirectOrigin}/api/auth/callback?next=${encodeURIComponent(nextUrl)}`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUri,
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: `Check your inbox! We've sent a secure login link to ${email}.`,
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send magic link";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsLoading(true);
      setMessage(null);

      if (isSignUp) {
        const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "https://viralokit.vercel.app";
        const redirectUri = `${redirectOrigin}/api/auth/callback?next=${encodeURIComponent(nextUrl)}`;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUri,
          },
        });

        if (error) {
          setMessage({ type: "error", text: error.message });
        } else if (data.session) {
          router.push(nextUrl);
        } else {
          setMessage({
            type: "success",
            text: "Account created! Please check your email to confirm your account.",
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage({ type: "error", text: error.message });
        } else {
          router.push(nextUrl);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Authentication failed";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform duration-300">
            <Instagram className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5 font-headline">
              ViraloKit
            </span>
            <span className="text-[11px] text-zinc-400 block -mt-1 font-medium tracking-wider uppercase">
              Creator Studio
            </span>
          </div>
        </Link>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Welcome to your Studio
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Publish carousels, schedule posts & track Meta Graph API insights
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="relative rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
        {/* Subtle top edge glow */}
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />

        {/* Notifications & Status */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 border ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
              )}
              <span className="leading-relaxed">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google OAuth Button */}
        <Button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
          className="w-full h-12 bg-white hover:bg-zinc-100 text-zinc-900 font-medium rounded-xl flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.99] border-0"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-zinc-700" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0e0e13] px-3 text-zinc-500 font-medium tracking-wider">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex rounded-xl bg-zinc-950/70 p-1 border border-zinc-800/80 mb-5 text-xs">
          <button
            type="button"
            onClick={() => {
              setAuthMode("magic-link");
              setMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              authMode === "magic-link"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Magic Link</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              setMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              authMode === "password"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            <span>Password</span>
          </button>
        </div>

        {/* Magic Link Form */}
        {authMode === "magic-link" && (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label htmlFor="magic-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="magic-email"
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/30 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-11 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 active:scale-[0.99] border-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send Login Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
            <p className="text-[11px] text-zinc-500 text-center">
              We&apos;ll send a secure one-click sign-in link to your email.
            </p>
          </form>
        )}

        {/* Password Form */}
        {authMode === "password" && (
          <form onSubmit={handlePasswordAuth} className="space-y-4">
            <div>
              <label htmlFor="pwd-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="pwd-email"
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="pwd-pass" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  id="pwd-pass"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/30 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full h-11 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 active:scale-[0.99] border-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? "Create Studio Account" : "Sign In to Studio"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage(null);
                }}
                className="text-xs text-zinc-400 hover:text-pink-400 transition-colors cursor-pointer"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Create one"}
              </button>
            </div>
          </form>
        )}

        {/* Security badge */}
        <div className="mt-8 pt-6 border-t border-zinc-800/60 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400/80" />
          <span>Encrypted with Supabase Auth &amp; Official Meta API</span>
        </div>
      </div>

      {/* Back to home */}
      <div className="text-center mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to viraloKit.com</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Ambience Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-pink-600/15 via-purple-600/15 to-transparent blur-[160px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-blue-600/10 via-purple-600/10 to-transparent blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Suspense
          fallback={
            <div className="p-8 text-center text-zinc-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
              <span>Loading Studio Login...</span>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
