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
  Bot,
  Send,
  Shield,
  Clock,
  ArrowRight,
  Check,
  Star,
  Globe,
  Smartphone,
  TrendingUp,
  MessageSquare,
  AtSign,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: LayoutDashboard,
    title: "Multi-Account Dashboard",
    description: "Connect unlimited Instagram accounts. Switch between them in one click.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Images,
    title: "Image, Carousel & Reels",
    description: "Publish single images, multi-image carousels, or video reels — all from one place.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Sparkles,
    title: "AI Captions & Hashtags",
    description: "Gemini AI generates captions, hashtags, and keywords from your images and topics.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: CalendarDays,
    title: "Smart Scheduling",
    description: "Drag-and-drop calendar. Schedule posts for the perfect time. Never miss a posting.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: BarChart3,
    title: "Real Analytics",
    description: "Followers, reach, profile views, engagement rates — real data from Instagram API.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Bot,
    title: "DM Automation",
    description: "Auto-reply to DMs with smart rules. Keyword matching, quick replies, templates.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: AtSign,
    title: "Comment Automation",
    description: "Auto-reply to comments. Private replies to commenters. Full moderation suite.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Shield,
    title: "Rate Limit Protection",
    description: "Built-in rate limiting per account. Never hit Instagram API limits.",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    icon: Clock,
    title: "24h Window Tracking",
    description: "Tracks messaging windows. Human agent tag for 7-day replies. Meta compliant.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
];

const stats = [
  { value: "100%", label: "Free Forever" },
  { value: "50+", label: "API Methods" },
  { value: "24/7", label: "Automation" },
  { value: "< 1s", label: "Deploy Time" },
];

const steps = [
  {
    step: "01",
    title: "Connect Instagram",
    description: "Sign in with your Instagram Business account. One click, done.",
    icon: Globe,
  },
  {
    step: "02",
    title: "Create & Schedule",
    description: "Write captions (or let AI generate them), upload media, pick a time.",
    icon: Send,
  },
  {
    step: "03",
    title: "Automate & Analyze",
    description: "Set up DM/comment automation. Track performance with real analytics.",
    icon: TrendingUp,
  },
];

const comparisons = [
  { feature: "Instagram Publishing", viralokit: true, buffer: true, hootsuite: true },
  { feature: "AI Captions", viralokit: true, buffer: false, hootsuite: false },
  { feature: "DM Automation", viralokit: true, buffer: false, hootsuite: false },
  { feature: "Comment Automation", viralokit: true, buffer: false, hootsuite: false },
  { feature: "Multi-Account", viralokit: true, buffer: true, hootsuite: true },
  { feature: "Calendar Scheduling", viralokit: true, buffer: true, hootsuite: true },
  { feature: "Real Analytics", viralokit: true, buffer: true, hootsuite: true },
  { feature: "Reels Publishing", viralokit: true, buffer: false, hootsuite: true },
  { feature: "Rate Limit Protection", viralokit: true, buffer: false, hootsuite: false },
  { feature: "Open Source", viralokit: true, buffer: false, hootsuite: false },
  { feature: "Free Forever", viralokit: true, buffer: false, hootsuite: false },
];

const faqs = [
  {
    q: "Kya ViraloKit sach mein free hai?",
    a: "Haan bhai, 100% free hai. Koi hidden charges nahi. Vercel, Neon, Clerk, Cloudinary sab free tier pe chalta hai. Jab tak 10,000 users nahi aate, ₹0 lagega.",
  },
  {
    q: "Mera Instagram account safe rahega?",
    a: "Bilkul safe hai. Hum sirf official Instagram API use karte hain. Tumhara password humare paas nahi hota. Sirf access token hota hai jo encrypted store hota hai.",
  },
  {
    q: "Kitne Instagram accounts connect kar sakte hain?",
    a: "Unlimited! Jitne chaaho utne accounts add karo. Har account ke liye alag automation rules bhi set kar sakte ho.",
  },
  {
    q: "AI captions kaise kaam karte hain?",
    a: "Gemini AI use karta hai. Tumhein bas topic ya image daalni hai, AI caption, hashtags, aur keywords generate kar dega. Image analysis bhi karta hai.",
  },
  {
    q: "DM automation kaise set karein?",
    a: "Automation page pe jao, naya rule banao. Trigger select karo (keyword ya all DMs), response likho. Done! Ab jab koi DM karega, auto-reply jayega.",
  },
  {
    q: "Kya main reels publish kar sakta hoon?",
    a: "Haan! Image, carousel, aur reels — teeno publish kar sakte ho. Video upload karo, caption daalo, publish karo.",
  },
  {
    q: "Webhook setup kaise karein?",
    a: "Meta Developer Dashboard pe webhook URL daalo. Hamara endpoint /api/webhooks/instagram hai. Verify token match karo. Done!",
  },
  {
    q: "Mobile pe chalega?",
    a: "Haan! Responsive design hai. Phone se bhi dashboard access kar sakte ho. PWA support bhi hai — home screen pe add kar sakte ho.",
  },
];

const testimonials = [
  {
    name: "Rahul S.",
    role: "Small Business Owner",
    text: "Best free tool for Instagram management. AI captions save me hours every week!",
    rating: 5,
  },
  {
    name: "Priya M.",
    role: "Content Creator",
    text: "DM automation is a game changer. My followers get instant replies now.",
    rating: 5,
  },
  {
    name: "Amit K.",
    role: "Marketing Agency",
    text: "Managing 10+ client accounts from one dashboard. Love the multi-account feature.",
    rating: 5,
  },
];

export default async function LandingPage() {
  const { userId } = await auth();
  const signedIn = Boolean(userId);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Zap className="size-6 text-rose-500" />
            ViraloKit
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </a>
            <a href="#compare" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Compare
            </a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {!signedIn ? (
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">Sign in</Button>
              </SignInButton>
            ) : (
              <UserButton />
            )}
            {!signedIn ? (
              <SignInButton mode="modal">
                <Button size="sm" className="bg-rose-500 hover:bg-rose-600">
                  Get Started Free
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Button>
              </SignInButton>
            ) : (
              <Button size="sm" className="bg-rose-500 hover:bg-rose-600" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-24 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-purple-500/5 to-amber-500/5" />
          <div className="relative mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6 gap-1.5 px-4 py-1.5">
              <Sparkles className="size-3.5 text-amber-500" />
              AI-Powered Social Media Management
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Publish. Schedule.{" "}
              <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-amber-500 bg-clip-text text-transparent">
                Automate.
              </span>{" "}
              Analyze.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Manage multiple Instagram accounts from one beautiful dashboard. AI captions, smart scheduling, DM automation, and real analytics — all completely free.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {!signedIn ? (
                <SignInButton mode="modal">
                  <Button size="lg" className="bg-rose-500 hover:bg-rose-600 px-8 text-base">
                    Get Started Free
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </SignInButton>
              ) : (
                <Button size="lg" className="bg-rose-500 hover:bg-rose-600 px-8 text-base" asChild>
                  <Link href="/dashboard">
                    Open Dashboard
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="lg" className="px-8 text-base" asChild>
                <a href="#features">See Features</a>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required · Free forever · Open source
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y bg-muted/30 px-6 py-12">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-rose-500">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4">Features</Badge>
              <h2 className="text-3xl font-bold md:text-4xl">Everything you need</h2>
              <p className="mt-3 text-muted-foreground">
                From publishing to automation — ViraloKit has it all.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.bg}`}>
                      <feature.icon className={`size-6 ${feature.color}`} />
                    </div>
                    <h3 className="mb-2 font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="border-y bg-muted/30 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4">How it Works</Badge>
              <h2 className="text-3xl font-bold md:text-4xl">3 simple steps</h2>
              <p className="mt-3 text-muted-foreground">
                Get started in minutes, not hours.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.step} className="relative text-center">
                  <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-rose-500/10">
                    <step.icon className="size-8 text-rose-500" />
                  </div>
                  <Badge variant="secondary" className="mb-3">Step {step.step}</Badge>
                  <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section id="compare" className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4">Comparison</Badge>
              <h2 className="text-3xl font-bold md:text-4xl">Why ViraloKit?</h2>
              <p className="mt-3 text-muted-foreground">
                See how we compare to paid alternatives.
              </p>
            </div>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium">Feature</th>
                      <th className="px-4 py-3 text-center font-medium text-rose-500">ViraloKit</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Buffer</th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">Hootsuite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((row) => (
                      <tr key={row.feature} className="border-b last:border-0">
                        <td className="px-4 py-3">{row.feature}</td>
                        <td className="px-4 py-3 text-center">
                          {row.viralokit ? (
                            <Check className="mx-auto size-4 text-emerald-500" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {row.buffer ? (
                            <Check className="mx-auto size-4 text-emerald-500" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {row.hootsuite ? (
                            <Check className="mx-auto size-4 text-emerald-500" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-muted/50 font-semibold">
                      <td className="px-4 py-3">Price</td>
                      <td className="px-4 py-3 text-center text-rose-500">FREE</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">$6/mo</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">$99/mo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-y bg-muted/30 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4">Testimonials</Badge>
              <h2 className="text-3xl font-bold md:text-4xl">Loved by creators</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.name}>
                  <CardContent className="p-6">
                    <div className="mb-3 flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4">FAQ</Badge>
              <h2 className="text-3xl font-bold md:text-4xl">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.q}>
                  <CardContent className="p-6">
                    <h3 className="mb-2 font-semibold">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="rounded-3xl bg-gradient-to-r from-rose-500 via-purple-500 to-amber-500 p-px">
              <div className="rounded-3xl bg-background px-8 py-16">
                <h2 className="text-3xl font-bold md:text-4xl">
                  Ready to go viral?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                  Join thousands of creators using ViraloKit to grow their Instagram. It&apos;s free, it&apos;s powerful, it&apos;s yours.
                </p>
                <div className="mt-8">
                  {!signedIn ? (
                    <SignInButton mode="modal">
                      <Button size="lg" className="bg-rose-500 hover:bg-rose-600 px-8 text-base">
                        Start for Free
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </SignInButton>
                  ) : (
                    <Button size="lg" className="bg-rose-500 hover:bg-rose-600 px-8 text-base" asChild>
                      <Link href="/dashboard">
                        Open Dashboard
                        <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <Zap className="size-5 text-rose-500" />
              ViraloKit
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              AI-powered social media management for Instagram. Free forever.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a></li>
              <li><a href="#compare" className="hover:text-foreground transition-colors">Compare</a></li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><a href="https://github.com/inyogeshwar/viralo-kit" className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ViraloKit. Built with Next.js, Clerk, Neon, Drizzle, Cloudinary & Gemini.
        </div>
      </footer>
    </div>
  );
}
