import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimiter, RATE_LIMIT_TIERS, getClientIp, type RateLimitTier } from "@/lib/security/rate-limit";
import { config as appConfig } from "@/lib/config";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request.headers);

  // 1. PRODUCTION RATE LIMITING (Layer 1 Defense against abuse and DoS)
  if (pathname.startsWith("/api/")) {
    let tier: RateLimitTier = RATE_LIMIT_TIERS.GENERAL_API;

    if (pathname.startsWith("/api/auth/")) {
      tier = RATE_LIMIT_TIERS.AUTH;
    } else if (pathname.startsWith("/api/ai/")) {
      tier = RATE_LIMIT_TIERS.AI_PROXY;
    } else if (pathname.startsWith("/api/cloudinary/")) {
      tier = RATE_LIMIT_TIERS.UPLOADS;
    }

    const rateCheck = rateLimiter.check(`${tier.tierName}:${ip}`, tier.limit, tier.windowMs);

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please slow down and try again later.",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: rateCheck.resetInSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.resetInSeconds),
            "X-RateLimit-Limit": String(rateCheck.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateCheck.resetInSeconds),
          },
        }
      );
    }
  }

  // 2. SUPABASE SESSION VALIDATION
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    appConfig.supabase.url,
    appConfig.supabase.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedRoutes = [
    "/dashboard",
    "/create",
    "/posts",
    "/analytics",
    "/ai-analysis",
    "/settings",
  ];

  const isPageProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isApiProtected =
    pathname.startsWith("/api/meta") ||
    pathname.startsWith("/api/cloudinary") ||
    pathname.startsWith("/api/ai");

  if (isApiProtected && !user) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }
  }

  if (isPageProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/create/:path*",
    "/posts/:path*",
    "/analytics/:path*",
    "/ai-analysis/:path*",
    "/settings/:path*",
    "/api/auth/:path*",
    "/api/meta/:path*",
    "/api/cloudinary/:path*",
    "/api/ai/:path*",
  ],
};
