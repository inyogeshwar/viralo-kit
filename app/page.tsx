import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, UserButton } from "@clerk/nextjs";
import {
  BarChart3,
  CalendarDays,
  Images,
  LayoutDashboard,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: LayoutDashboard,
    title: "Multi-account dashboard",
    description: "Connect many Instagram accounts and switch between them in one click.",
  },
  {
    icon: Images,
    title: "Image & carousel publishing",
    description: "Upload to Cloudinary, then publish through Instagram's container flow.",
  },
  {
    icon: BarChart3,
    title: "Real analytics",
    description: "Followers, reach, profile views, and per-post insights — only what the API returns.",
  },
  {
    icon: Sparkles,
    title: "AI captions",
    description: "Generate captions and hashtags with Gemini right inside the composer.",
  },
  {
    icon: CalendarDays,
    title: "Calendar & scheduling",
    description: "Plan posts on a calendar; schedule the exact date and time.",
  },
  {
    icon: Users,
    title: "Workspace-first",
    description: "Owners, admins, members, viewers — team-ready schema from day one.",
  },
];

export default async function LandingPage() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2 text-lg font-bold">
          <Zap className="size-5 text-rose-500" />
          InstaPilot
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          {!signedIn ? (
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Sign in
              </Button>
            </SignInButton>
          ) : (
            <UserButton />
          )}
        </nav>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-br from-purple-600 via-rose-500 to-amber-400 px-6 py-20 text-center text-white">
          <p className="mx-auto mb-4 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur">
            AI-powered visual social media management
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
            Publish. Schedule. Analyze. Repeat.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
            Manage multiple Instagram accounts from one beautiful dashboard — with AI captions and
            real analytics. Zero-cost hosting on Vercel.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
          {!signedIn ? (
            <SignInButton mode="modal">
              <Button size="lg" className="bg-white text-rose-600 hover:bg-white/90">
                Get started free
              </Button>
            </SignInButton>
          ) : (
            <Button size="lg" className="bg-white text-rose-600 hover:bg-white/90" asChild>
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          )}
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-6 px-6 py-16 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="size-6 text-rose-500" />
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        InstaPilot — built with Next.js, Clerk, Neon, Drizzle, Cloudinary & Gemini.
      </footer>
    </div>
  );
}
