import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL ?? "";

if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and set your Neon database URL, then run `npx drizzle-kit push`.",
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
