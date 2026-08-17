import type { Metadata } from "next";
import { Zap, Heart, Globe, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "About — InstaPilot",
  description: "Learn about InstaPilot — the AI-powered social media management platform.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="prose prose-neutral dark:prose-invert mb-16">
        <h1>About InstaPilot</h1>
        <p className="text-lg text-muted-foreground">
          AI-powered social media management for modern creators and businesses.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <Zap className="mb-3 size-8 text-rose-500" />
          <h3 className="mb-2 text-lg font-semibold">AI-Powered</h3>
          <p className="text-sm text-muted-foreground">
            Generate engaging captions, hashtags, and content ideas powered by Google Gemini AI.
            Analyze images and get relevant content suggestions automatically.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <Globe className="mb-3 size-8 text-blue-500" />
          <h3 className="mb-2 text-lg font-semibold">Multi-Account</h3>
          <p className="text-sm text-muted-foreground">
            Manage multiple Instagram accounts from a single dashboard. Switch between accounts
            seamlessly and publish to any connected profile.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <Shield className="mb-3 size-8 text-green-500" />
          <h3 className="mb-2 text-lg font-semibold">Secure</h3>
          <p className="text-sm text-muted-foreground">
            All tokens are encrypted with AES-256. We use industry-standard security practices
            and never store passwords. Your data is always protected.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <Heart className="mb-3 size-8 text-purple-500" />
          <h3 className="mb-2 text-lg font-semibold">Real-Time</h3>
          <p className="text-sm text-muted-foreground">
            Get instant notifications for comments and direct messages via Instagram webhooks.
            Stay on top of your engagement without constantly checking your phone.
          </p>
        </div>
      </div>

      <div className="mt-16 rounded-xl border bg-card p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold">Our Mission</h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          We believe managing social media should be simple, not overwhelming. InstaPilot combines
          the power of AI with intuitive design to help creators and businesses focus on what matters
          most — creating great content and building their audience.
        </p>
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          Built with Next.js, Clerk, Cloudinary, Gemini AI, and Instagram Graph API.
        </p>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} InstaPilot. All rights reserved.
        </p>
      </div>
    </div>
  );
}
