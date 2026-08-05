# Connecting Ad Platforms

The OAuth backend is built and deployed-ready. What's left is the part only you can do: registering AdTrack as a developer app with each platform and passing their review. This document is the checklist.

## Why this can't be automated

Ad platforms hand out access to advertising data very carefully. Every one of them requires:

1. **A developer app registered to a verified business** — not an individual
2. **A client secret** that must live server-side only. If a secret is ever shipped in browser JavaScript, the platform will revoke it, so this can't be done in the frontend
3. **App review** — a human at Meta/Google/TikTok reviews what your app does before granting access to ad data

That's why the "Connect" buttons currently return an error explaining setup is needed. That's honest behavior, not a bug.

## What's already built

| Piece | Location | Status |
|---|---|---|
| OAuth start endpoint | `supabase/functions/oauth-start/` | Ready |
| OAuth callback + token exchange | `supabase/functions/oauth-callback/` | Ready |
| AES-GCM token encryption | `supabase/functions/_shared/crypto.ts` | Ready |
| Per-platform endpoints/scopes | `supabase/functions/_shared/platforms.ts` | Ready |
| `integrations` + `oauth_states` tables with RLS | `supabase/migrations/` | Ready |
| Frontend connect flow | `src/lib/integrationsService.ts` | Ready |
| Data sync jobs | — | Not built yet (needs a working connection first) |

## One-time backend setup

```bash
# 1. Install the Supabase CLI and link your project
npm install -g supabase
supabase link --project-ref lzuipesfohgslyktcoed

# 2. Run both migrations (or paste them into the SQL editor)
supabase db push

# 3. Generate a token encryption key and set core secrets
openssl rand -base64 32          # copy the output
supabase secrets set TOKEN_ENCRYPTION_KEY='<paste here>'
supabase secrets set APP_ORIGIN='https://adtrack-five.vercel.app'

# 4. Deploy the functions
supabase functions deploy oauth-start
supabase functions deploy oauth-callback
```

Your OAuth redirect URI — needed by every platform below — is:

```
https://lzuipesfohgslyktcoed.supabase.co/functions/v1/oauth-callback
```

## Per-platform setup

Start with **Meta**. It covers Facebook and Instagram, which is where most advertisers spend, and it's the longest lead time — so getting it in review early is worth doing.

### Meta (Facebook + Instagram)

**Realistic timeline: 1–4 weeks**, mostly waiting on review.

1. Create a Meta Business account at business.facebook.com if you don't have one
2. Go to developers.facebook.com → My Apps → Create App → type **Business**
3. Add the **Marketing API** product
4. Under App Settings → Basic, note your App ID and App Secret
5. Add the redirect URI above under Facebook Login → Settings → Valid OAuth Redirect URIs
6. Complete **Business Verification** (requires business documents — this is the slow part)
7. Submit for **App Review** requesting `ads_read`. You'll need to record a screencast showing what your app does with the data
8. Once approved:
   ```bash
   supabase secrets set META_CLIENT_ID='...' META_CLIENT_SECRET='...'
   ```

Note: before approval you can still test against ad accounts you personally own — Meta allows this in development mode. Good for verifying the plumbing works while review is pending.

### Google Ads

**Timeline: 1–3 weeks.** Requires a developer token in addition to OAuth.

1. Google Cloud Console → create a project → enable the **Google Ads API**
2. Create OAuth 2.0 credentials (Web application), add the redirect URI
3. Apply for a **developer token** in your Google Ads account under Tools → API Center
4. Basic access needs an application describing your use case
5. ```bash
   supabase secrets set GOOGLE_CLIENT_ID='...' GOOGLE_CLIENT_SECRET='...' GOOGLE_DEVELOPER_TOKEN='...'
   ```

### TikTok Ads

**Timeline: about 1 week.**

1. business-api.tiktok.com → Developer Portal → create an app
2. Request the `ad.report` and `advertiser.read` scopes
3. Add the redirect URI
4. ```bash
   supabase secrets set TIKTOK_CLIENT_ID='...' TIKTOK_CLIENT_SECRET='...'
   ```

### Snapchat, Pinterest, X, Amazon

Same pattern — register an app, add the redirect URI, request ad-read scopes, set the corresponding secrets (`SNAPCHAT_CLIENT_ID`, `PINTEREST_CLIENT_ID`, etc. as named in `_shared/platforms.ts`). These are generally faster to approve than Meta and Google because they want the API adoption.

### Roku

Roku doesn't offer self-serve API access. It requires a direct partnership conversation with their ad sales team. Realistically this is a later-stage integration once you have customers asking for it.

## After the first connection works

Once one platform authenticates end to end, the next build step is the sync layer: a scheduled Edge Function that pulls campaigns, ad sets, ads and daily metrics into the `campaigns` / `ad_sets` / `ads` / `metrics` tables, normalizing each platform's fields into the shared schema. That's the piece that makes the Dashboard, Analytics and Creative Library show real numbers instead of sample data.

I'd recommend building that against Meta specifically, then generalizing — every platform's API differs enough that abstracting too early tends to produce the wrong abstraction.
