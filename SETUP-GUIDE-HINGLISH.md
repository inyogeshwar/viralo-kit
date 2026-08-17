# ViraloKit - Full Setup Guide (Hinglish Version) 🇮🇳

> Bhai, ye guide padh aur project ko live kar. Step by step sab kuch bataya hai.

---

## Table of Contents
1. [Pehle Samajh Kya Hai ViraloKit](#1-pehle-samajh-kya-hai-viralokit)
2. [Requirements Kya Kya Chahiye](#2-requirements-kya-kya-chahiye)
3. [GitHub Se Clone Karo](#3-github-se-clone-karo)
4. [Dependencies Install Karo](#4-dependencies-install-karo)
5. [Environment Variables Setup Karo](#5-environment-variables-setup-karo)
6. [Database Setup (Neon)](#6-database-setup-neon)
7. [Clerk Auth Setup](#7-clerk-auth-setup)
8. [Cloudinary Setup (Media)](#8-cloudinary-setup-media)
9. [Meta/Instagram API Setup](#9-metag-instagram-api-setup)
10. [Gemini AI Setup](#10-gemini-ai-setup)
11. [Sentry Setup (Error Tracking)](#11-sentry-setup-error-tracking)
12. [Inngest Setup (Background Jobs)](#12-inngest-setup-background-jobs)
13. [Run Karo Locally](#13-rano-karo-locally)
14. [Vercel Pe Deploy Karo](#14-vercel-pe-deploy-karo)
15. [Instagram Webhook Setup](#15-instagram-webhook-setup)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. Pehle Samajh Kya Hai ViraloKit

Bhai, ViraloKit ek **AI-powered social media management SaaS** hai. Isme kya kya hai:

| Feature | Kya Karta Hai |
|---------|---------------|
| **Instagram Publishing** | Image, Carousel, Reel publish karo |
| **AI Captions** | Gemini AI se caption generate karo |
| **Multi-Account** | Ek se zyada Instagram account manage karo |
| **Scheduling** | Post ko baad mein schedule karo |
| **Calendar** | Drag-and-drop se reschedule karo |
| **Analytics** | Account insights aur post insights dekho |
| **DM Automation** | Auto-reply to DMs with keywords |
| **Comment Automation** | Auto-reply to comments |
| **Inbox** | Comments aur messages ek jagah dekho |
| **Webhooks** | Real-time notifications lo |

---

## 2. Requirements Kya Kya Chahiye

```
✅ Node.js 18+ (recommended: 20)
✅ npm ya yarn
✅ Git
✅ Vercel account (free)
✅ Neon database (free)
✅ Clerk account (free)
✅ Cloudinary account (free)
✅ Meta Developer account (free)
✅ Google AI Studio account (free)
```

---

## 3. GitHub Se Clone Karo

```bash
# Repository clone karo
git clone https://github.com/inyogeshwar/viralo-kit.git

# Project directory mein jao
cd viralo-kit

# Check karo sahi hai ya nahi
ls
# README.md dikhega, package.json dikhega — matlab sahi hai
```

---

## 4. Dependencies Install Karo

```bash
# Sab packages install ho jayenge
npm install

# Agar error aaye toh:
npm install --legacy-peer-deps

# Verify karo
npm run build
# "Compiled successfully" aana chahiye
```

---

## 5. Environment Variables Setup Karo

```bash
# .env.example ko copy karo
cp .env.example .env.local

# Ab .env.local open karo aur sab values bharo
```

### .env.local Mein Kya Daalna Hai:

```env
# ===========================
# APP SETTINGS
# ===========================
NEXT_PUBLIC_APP_URL=http://localhost:3000
MOCK_MODE=true  # Pehle true rakho, baad mein false

# ===========================
# CLERK (Authentication)
# ===========================
# https://clerk.com se login karo
# Create Application karo
# Settings > API Keys mein jao
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# ===========================
# NEON DATABASE
# ===========================
# https://neon.tech se login karo
# Create Project karo
# Connection Details > PostgreSQL mein se URL copy karo
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require

# ===========================
# CLOUDINARY (Media Storage)
# ===========================
# https://cloudinary.com se login karo
# Dashboard mein sab kuch dikhega
CLOUDINARY_CLOUD_NAME=inyogcloud
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# ===========================
# META / INSTAGRAM API
# ===========================
# https://developers.facebook.com se login karo
# App create karo (Instagram API setup with Instagram Login)
META_CLIENT_ID=  # Instagram App ID daalo
META_CLIENT_SECRET=  # Instagram App Secret daalo
META_API_VERSION=v21.0

# ===========================
# GEMINI AI (Caption Generation)
# ===========================
# https://aistudio.google.com se API key lo
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash

# ===========================
# INSTAGRAM WEBHOOKS
# ===========================
# Koi bhi random string daal do
INSTAGRAM_VERIFY_TOKEN=ViraloKit-my-secret-token-123

# ===========================
# ENCRYPTION (Tokens secure rakhne ke liye)
# ===========================
# 32 character ka random string generate karo
# Node.js mein: require('crypto').randomBytes(32).toString('hex')
ENCRYPTION_KEY=...

# ===========================
# INNGEST (Background Jobs)
# ===========================
# https://inngest.com se login karo
# Create Team > Create App karo
# Event Key copy karo
INNGEST_EVENT_KEY=...

# ===========================
# SENTRY (Error Tracking)
# ===========================
# https://sentry.io se login karo
# Create Project > Next.js select karo
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug

# ===========================
# GOOGLE TAG MANAGER
# ===========================
# https://tagmanager.google.com se login karo
# Container create karo > GTM-XXXXXXX copy karo
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

---

## 6. Database Setup (Neon)

```bash
# Step 1: Neon pe login karo
# https://neon.tech

# Step 2: Create Project karo
# - Project name: viralo-kit
# - Region: AWS ap-southeast-1 (ya apna nearest)

# Step 3: Connection Details kholo
# PostgreSQL tab pe jao
# URL copy karo aur .env.local mein daalo

# Step 4: Database tables automatically ban jayengi
# Jab pehli baar run karoge, Drizzle ORM create kar dega
```

### Agar Tables Nahi Bani Toh:

```bash
# Manual migration run karo
npx drizzle-kit push
```

---

## 7. Clerk Auth Setup

```bash
# Step 1: Clerk pe login karo
# https://clerk.com

# Step 2: Create Application karo
# - Application name: ViraloKit
# - Sign-in methods: Email, Google (optional)

# Step 3: API Keys lo
# Dashboard > Settings > API Keys
# - Publishable Key (pk_test_...)
# - Secret Key (sk_test_...)

# Step 4: .env.local mein daalo

# Step 5: Redirect URLs set karo
# Dashboard > Paths
# - Sign-in URL: /sign-in
# - Sign-up URL: /sign-up
# - After sign-in: /dashboard
# - After sign-up: /dashboard
```

---

## 8. Cloudinary Setup (Media)

```bash
# Step 1: Cloudinary pe login karo
# https://cloudinary.com

# Step 2: Dashboard mein sab dikhega
# - Cloud Name
# - API Key
# - API Secret

# Step 3: .env.local mein daalo

# Step 4: Upload folder set karo (optional)
# Settings > Upload > Upload presets
# - viralo-kit-upload create karo
```

---

## 9. Meta/Instagram API Setup

### Ye Sabse Important Hai, Dhyan Se Karo!

```bash
# Step 1: Meta Developer Account banao
# https://developers.facebook.com

# Step 2: App Create Karo
# - Go to My Apps > Create App
# - App type: Business
# - App name: ViraloKit

# Step 3: Instagram API Setup Karo
# - App Dashboard > Products
# - "Instagram" add karo
# - "Instagram API setup with Instagram login" select karo

# Step 4: Instagram App ID Lo
# - Settings > Basic > Instagram App ID
# - Ye META_CLIENT_ID hoga

# Step 5: App Secret Lo
# - Settings > Basic > App Secret
# - Ye META_CLIENT_SECRET hoga

# Step 6: Redirect URI Set Karo
# - Instagram > API setup with Instagram login
# - Valid OAuth Redirect URIs mein daalo:
#   https://your-app.vercel.app/api/instagram/callback
#   http://localhost:3000/api/instagram/callback

# Step 7: Webhook URL Set Karo
# - Instagram > API setup with Instagram login
# - Webhook URL: https://your-app.vercel.app/api/webhooks/instagram
# - Verify Token: jo .env.local mein daala tha

# Step 8: Permissions Request Karo
# - instagram_business_basic
# - instagram_business_content_publish
# - instagram_business_manage_messages
# - instagram_business_manage_comments

# Step 9: App Publish Karo (Development Mode Se Live)
# - App Review > Permissions and Features
# - Sab permissions request karo
# - App Review submit karo
```

### Important Notes:

```
⚠️  DEVELOPMENT MODE:
- Sirf tumhare app ke testers kaam karenge
- Instagram account ko tester mein add karo

⚠️  PRODUCTION MODE:
- App Review approve hona chahiye
- Sab log use kar sakenge

⚠️  TOKENS:
- Short-lived token: 1 ghante ki validity
- Long-lived token: 60 din ki validity
- Hum long-lived token use karte hain
```

---

## 10. Gemini AI Setup

```bash
# Step 1: Google AI Studio pe jao
# https://aistudio.google.com

# Step 2: API Key Generate Karo
# - Get API Key > Create API Key
# - Copy karo

# Step 3: .env.local mein daalo
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash

# Step 4: Test Karo
# - Compose page pe jao
# - "Generate" button dabao
# - AI caption generate hona chahiye
```

---

## 11. Sentry Setup (Error Tracking)

```bash
# Step 1: Sentry pe login karo
# https://sentry.io

# Step 2: Create Project karo
# - Platform: Next.js
# - Project name: viralo-kit

# Step 3: DSN Copy Karo
# - Settings > Client Keys (DSN)
# - Copy karo

# Step 4: .env.local mein daalo
NEXT_PUBLIC_SENTRY_DSN=...
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug

# Step 5: Source Maps Upload Karo (Optional)
# Build ke baad:
npx @sentry/wizard@latest -i nextjs
```

---

## 12. Inngest Setup (Background Jobs)

```bash
# Step 1: Inngest pe login karo
# https://inngest.com

# Step 2: Create Team karo
# - Team name: ViraloKit

# Step 3: Create App karo
# - App name: ViraloKit
# - App URL: https://your-app.vercel.app

# Step 4: Event Key Copy Karo
# - Settings > Keys
# - Event Key copy karo

# Step 5: .env.local mein daalo
INNGEST_EVENT_KEY=...

# Step 6: Sync Karo
# - App Dashboard > Sync
# - "Sync functions" click karo
# - Functions detect ho jayengi:
#   - publish-scheduled-post
#   - check-scheduled-posts

# Step 7: Cron Setup Karo (Optional)
# - check-scheduled-posts ko 5 minute pe trigger karo
# - Inngest Dashboard > Functions > check-scheduled-posts
# - Cron expression: */5 * * * *
```

---

## 13. Run Karo Locally

```bash
# Development server start karo
npm run dev

# Browser mein kholo
# http://localhost:3000

# Agar kuch error aaye toh:
# 1. .env.local check karo — sab values sahi hain?
# 2. npm run build karo — errors dikhte hain
# 3. Terminal mein error messages dekho
```

### Mock Mode Mein Test Karo:

```bash
# .env.local mein:
MOCK_MODE=true

# Ab sab kuch mock hoga:
# - Instagram API calls nahi jayengi
# - Cloudinary upload nahi hoga
# - Sab local hoga
# - Perfect for development
```

---

## 14. Vercel Pe Deploy Karo

### Step 1: GitHub Pe Push Karo

```bash
git add -A
git commit -m "Initial setup"
git push origin main
```

### Step 2: Vercel Pe Import Karo

```bash
# https://vercel.com se login karo
# - New Project > Import Git Repository
# - inyogeshwar/viralo-kit select karo
# - Framework Preset: Next.js (auto-detect)
# - Root Directory: . (default)
# - Build Command: npm run build (default)
# - Output Directory: .next (default)
```

### Step 3: Environment Variables Daalo

```bash
# Vercel Dashboard > Settings > Environment Variables
# Sab .env.local ke values yahan bhi daalo

# Production ke liye:
MOCK_MODE=false
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Step 4: Deploy Karo

```bash
# "Deploy" button dabao
# 2-3 minute wait karo
# Done! Live ho gaya
```

### Step 5: Custom Domain Lagao (Optional)

```bash
# Vercel Dashboard > Settings > Domains
# - Add Domain
# - apna domain daalo
# - DNS settings follow karo
```

---

## 15. Instagram Webhook Setup

### Local Testing Ke Liye (ngrok):

```bash
# ngrok install karo
# https://ngrok.com

# Terminal mein:
ngrok http 3000

# URL milega:
# https://xxxx-xx-xx-xx-xx.ngrok-free.app

# Ab Meta Developer Dashboard mein:
# Webhook URL: https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/webhooks/instagram
# Verify Token: ViraloKit-my-secret-token-123
```

### Production Ke Liye:

```bash
# Vercel URL use karo:
# https://your-app.vercel.app/api/webhooks/instagram
# Verify Token: same as .env.local
```

---

## 16. Troubleshooting

### Build Error Aata Hai:

```bash
# Check karo Node.js version
node --version
# 18+ hona chahiye

# Clean install karo
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

### Database Connection Error:

```bash
# Neon dashboard mein jao
# Connection pooler use karo (transaction mode)
# URL mein ?sslmode=require hona chahiye
```

### Instagram OAuth Error:

```bash
# Redirect URI sahi hai?
# - https://your-app.vercel.app/api/instagram/callback
# - http://localhost:3000/api/instagram/callback

# App ID sahi hai?
# - Instagram App ID daalo, Facebook App ID nahi

# Permissions sahi hain?
# - instagram_business_basic
# - instagram_business_content_publish
# - instagram_business_manage_messages
# - instagram_business_manage_comments
```

### Webhook Verify Nahi Ho Raha:

```bash
# Verify Token match hona chahiye:
# - .env.local mein INSTAGRAM_VERIFY_TOKEN
# - Meta Dashboard mein Verify Token
# - Dono same hone chahiye
```

### AI Caption Generate Nahi Ho Raha:

```bash
# Gemini API key sahi hai?
# - https://aistudio.google.com pe check karo
# - API key enable hai?
# - Quota exceed toh nahi hua?
```

---

## Quick Reference Commands

```bash
# Development
npm run dev          # Dev server start
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting

# Database
npx drizzle-kit push        # Schema push
npx drizzle-kit generate    # Migration generate
npx drizzle-kit studio      # Database viewer

# Deployment
git add -A
git commit -m "feature name"
git push origin main
# Vercel auto-deploy ho jayega
```

---

## Support

```bash
# Agar koi issue aaye:
# 1. README.md padho
# 2. GitHub Issues dekho
# 3. https://github.com/inyogeshwar/viralo-kit/issues pe issue create karo
```

---

## Tech Stack Summary

```
Framework:     Next.js 15 + React 19
Auth:          Clerk
Database:      Neon PostgreSQL + Drizzle ORM
AI:            Gemini 2.0 Flash
Media:         Cloudinary
Scheduler:     Inngest
Error Track:   Sentry
Analytics:     Vercel Analytics + Speed Insights
SEO:           OG Tags + Sitemap + Robots.txt
PWA:           Manifest + Service Worker
Marketing:     Google Tag Manager
Icons:         Lucide + Font Awesome
Fonts:         Google Fonts (Geist)
Hosting:       Vercel
```

---

> Bhai, ye sab kar le toh ViraloKit live ho jayega. Koi issue aaye toh seedha pooch! 🚀
