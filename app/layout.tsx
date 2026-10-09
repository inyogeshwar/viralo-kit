import { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";


export const metadata: Metadata = {
  title: {
    default: "ViraloKit — Professional Instagram Creator Studio & AI Publishing",
    template: "%s | ViraloKit Creator Studio",
  },
  description:
    "Publish Instagram carousels with AI captions, 100% verified Meta Graph API insights, and 25 GB isolated cloud storage — free forever.",
  keywords: [
    "Instagram Creator Studio",
    "Instagram Scheduler",
    "Instagram Carousel Publisher",
    "Meta Graph API v23.0",
    "Instagram Analytics",
    "Instagram Insights",
    "AI Caption Generator",
    "Social Media Automation",
    "Instagram Growth Tool",
    "ViraloKit",
  ],
  authors: [{ name: "ViraloKit Engineering Team" }],
  creator: "ViraloKit",
  publisher: "ViraloKit",
  metadataBase: new URL("https://viralokit.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ViraloKit — Professional Instagram Creator Studio",
    description:
      "Publish multi-slide carousels, schedule posts, audit live Meta Graph API analytics, and craft viral captions with AI.",
    url: "https://viralokit.vercel.app",
    siteName: "ViraloKit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ViraloKit — Professional Instagram Creator Studio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ViraloKit — Professional Instagram Creator Studio",
    description:
      "Publish single & carousel posts to Instagram, analyze performance with official Meta insights, and generate viral captions with AI.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "article:author": "ViraloKit Engineering Team",
    "article:publisher": "ViraloKit",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
