# AdTrack

Premium dark-themed SaaS command center for advertisers — full frontend with all 12 modules, running on realistic mock data, with Supabase wired for auth, creative sets, and comments.

## Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## What's real vs. mock

- **Auth** — real Supabase email/password auth (falls back to a local mock session if Supabase env vars are missing, so the app always runs).
- **Creative comments** — writes to Supabase (`creative_comments` table) once you run the migration below; falls back to browser local storage otherwise.
- **Everything else** (campaigns, analytics, audiences, testing lab, budget, reports, compliance, AI assistant) — realistic generated mock data. The schema for all of it already exists in `supabase/migrations/0001_init.sql` so you can wire it up module by module later.
- **Ad platform OAuth (Meta, Google, TikTok, etc.)** — UI only. The Integrations Hub (Settings → Integrations) lets you "connect" a platform, which just flips local state — there's no live OAuth handshake yet. Wiring a real one requires creating an app in that platform's developer portal and adding a server-side token exchange (can't be done from the browser alone for security).
- **AI Assistant** — canned responses that react to keywords in your prompt. Swap in a real Claude or OpenAI call once you have an API key (see `src/pages/AIAssistant.tsx`, the `canned()` function is the only thing to replace).

## Supabase setup

1. In the Supabase SQL editor, run `supabase/migrations/0001_init.sql`. This creates every core table from the spec (`creative_sets`, `creative_variants`, `campaigns`, `metrics`, `audiences`, `ab_tests`, `alerts`, `reports`, `integrations`, `brands`, `user_preferences`) with Row Level Security so each user only sees their own rows, plus the `creative-assets` storage bucket.
2. Your project URL and anon key are already in `.env` (not committed to git). If you rotate the key, update `.env`.
3. Email confirmation on signup uses whatever email provider is configured in your Supabase project's Auth settings (Resend SMTP per the spec) — set that up in Supabase → Authentication → Email Templates / SMTP Settings.

## Deploying

This is a static Vite app — it builds to `dist/` and can be deployed to Vercel, Netlify, or Cloudflare Pages:

```bash
npm run build
```

Set the same two environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in your host's dashboard.

## Stack

React + Vite + TypeScript, Tailwind CSS v4, Radix UI primitives, Recharts, Lucide icons, Supabase (auth + Postgres + storage), Sonner toasts, React Router.
