import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://viralo-kit.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/compose/", "/calendar/", "/inbox/", "/automation/", "/accounts/", "/analytics/", "/settings/", "/media/"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
