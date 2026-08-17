# ViraloKit — AI Social Media Management

AI-powered visual social media management (a "Creator OS"). Manage multiple Instagram accounts from one dashboard — publish images and carousels, schedule posts, analyze real analytics, and generate AI captions.

Stack: **Next.js 16 + TypeScript + Tailwind + shadcn/ui · Clerk · Neon Postgres + Drizzle · Cloudinary · Gemini**.

> This is the SaaS evolution of the proven Flask publisher in the knowledge base
> (`examples/instagram-pilot-web`). The publishing, analytics, and OAuth logic is ported from it.

## Features (Phase 1+2 core)

- Clerk auth (Google/GitHub/email) with a personal workspace
- Connect multiple Instagram accounts via **OAuth** or a **dev-token** fallback
- Publish **images and carousels** through Instagram's container API, via Cloudinary upload
- **Schedule** posts (publish-now works today; background scheduler is Phase 3 with Inngest)
- **Real analytics**: account metrics + per-post insights, and a fallback mock dataset
- **AI captions** via Gemini (mock fallback when no key is set)
- Mock mode: run the whole app with **zero accounts/keys** to try the UI

## Quick start (no Instagram/DB/media/AI accounts needed)

```bash
cp .env.example .env.local
npm install
npm run dev
```

You only need **Clerk keys** to sign in (Step 1 below). Without `DATABASE_URL`, `CLOUDINARY_*`,
`META_*`, or `GEMINI_API_KEY`, the app runs in **mock mode**: two demo Instagram accounts,
fake publish results, and sample analytics — so you can click through the whole UI.

## Setting up real services (5-minute setup)

1. **Clerk (auth)** — create an app at [clerk.com](https://dashboard.clerk.com) (Student plan is free).
   Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
   Add `http://localhost:3000` (and your Vercel URL) as allowed origins.
2. **Neon Postgres (database)** — create a project at [neon.tech](https://neon.tech).
   Copy the pooled connection string to `DATABASE_URL`.
   Run migrations: `npm run db:push` (or `npm run db:generate` for a SQL file).
3. **Cloudinary (media)** — create a free account at [cloudinary.com](https://cloudinary.com).
   Copy `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
4. **Meta app (Instagram OAuth)** — at [developers.facebook.com](https://developers.facebook.com) create a
   business app, add the Instagram Graph API product, and get an app secret.
   Set `META_CLIENT_ID`, `META_CLIENT_SECRET`, `META_API_VERSION=v23.0`, and
   `INSTAGRAM_REDIRECT_URI=https://<your-domain>/api/instagram/callback`.
   For OAuth you need a Meta developer account; until then use the **dev-token** path
   (Settings > Meta for Developers > Instagram > get a long-lived token from your Instagram account).
5. **Gemini (AI)** — get a free API key at [aistudio.google.com](https://aistudio.google.com).
   Set `GEMINI_API_KEY`.

Full list of variables is in [.env.example](.env.example).

## Environment variables

See [.env.example](.env.example). Secrets are only ever read server-side and are never
exposed to the client. `MOCK_MODE=true` (or a missing `DATABASE_URL`) switches to mock data.

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build (typecheck included)
npm run start        # serve production build
npm run db:push      # push Drizzle schema to Neon
npm run db:generate  # generate SQL migration
npm run db:studio    # open Drizzle Studio
```

## Architecture

```
User → Workspace → Social Accounts → Posts → Media → (Automations, Phase 3)
```

- `lib/db/schema.ts` — Drizzle schema: users, workspaces, workspace_members (Owner/Admin/Member/Viewer),
  social_accounts, posts, media_assets
- `lib/providers/instagram.ts` — Instagram Graph API: containers, publish, OAuth, analytics
- `lib/providers/cloudinary.ts` — image upload
- `lib/providers/ai.ts` — Gemini caption generation
- `lib/crypto.ts` — AES-256-GCM encryption for Instagram tokens at rest
- `lib/workspace.ts`, `lib/context.ts`, `lib/analytics.ts` — server-side data access
- `app/api/*` — route handlers; `app/(dashboard)/*` — authenticated UI

## Zero-cost hosting: Vercel

1. Push this folder to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Add all variables from `.env.example` in Project Settings → Environment Variables
   (the Vercel domain goes into `NEXT_PUBLIC_APP_URL`, `INSTAGRAM_REDIRECT_URI`, and Clerk allowed origins).
4. Deploy. Hobby plan is free and includes a Postgres-less serverless runtime;
   keep the database on Neon's free tier.

## Roadmap

- Phase 3: Inngest background scheduler, reels/video publishing, calendar drag-and-drop
- Phase 4: Team members, automations (AI reposting), billing (Clerk B2B)
- More platforms: Pinterest, Facebook, X, YouTube, Reddit, Threads, TikTok, LinkedIn
- Mobile: PWA (free) or Flutter/React Native later
