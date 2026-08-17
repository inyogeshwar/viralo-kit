const MOCK_MODE = process.env.MOCK_MODE === "true";

export const env = {
  mockMode: MOCK_MODE,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL ?? "",
  encryptionKey: process.env.ENCRYPTION_KEY ?? "",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  },
  meta: {
    clientId: process.env.META_CLIENT_ID ?? "",
    clientSecret: process.env.META_CLIENT_SECRET ?? "",
    apiVersion: process.env.META_API_VERSION ?? "v23.0",
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? "",
    model: process.env.GEMINI_MODEL ?? "gemini-3.5-flash",
  },
  instagramScopes: [
    "instagram_basic",
    "instagram_content_publish",
    "instagram_manage_insights",
  ],
} as const;

export function isFullyConfigured() {
  return {
    clerk: Boolean(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
    ),
    database: Boolean(env.databaseUrl),
    cloudinary: Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret),
    meta: Boolean(env.meta.clientId && env.meta.clientSecret),
    gemini: Boolean(env.gemini.apiKey),
  };
}
