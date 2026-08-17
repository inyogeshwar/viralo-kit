import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://viralo-kit.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPages = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${APP_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${APP_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${APP_URL}/terms-of-service`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${APP_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${APP_URL}/refund-policy`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${APP_URL}/cookie-policy`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  return publicPages;
}
