/**
 * Per-platform OAuth configuration.
 *
 * Client IDs/secrets are read from Supabase Edge Function secrets — they must
 * NEVER be shipped in frontend code. Set them with:
 *   supabase secrets set META_CLIENT_ID=... META_CLIENT_SECRET=...
 */

export interface PlatformConfig {
  id: string
  label: string
  authUrl: string
  tokenUrl: string
  scopes: string
  clientIdEnv: string
  clientSecretEnv: string
  /** Some platforms require extra params on the auth request. */
  extraAuthParams?: Record<string, string>
}

export const PLATFORMS: Record<string, PlatformConfig> = {
  meta: {
    id: 'meta',
    label: 'Meta',
    authUrl: 'https://www.facebook.com/v21.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v21.0/oauth/access_token',
    // ads_read is the permission that requires App Review + Business Verification.
    scopes: 'ads_read,ads_management,business_management',
    clientIdEnv: 'META_CLIENT_ID',
    clientSecretEnv: 'META_CLIENT_SECRET',
  },
  google: {
    id: 'google',
    label: 'Google Ads',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: 'https://www.googleapis.com/auth/adwords',
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    // Required to receive a refresh_token from Google.
    extraAuthParams: { access_type: 'offline', prompt: 'consent' },
  },
  tiktok: {
    id: 'tiktok',
    label: 'TikTok Ads',
    authUrl: 'https://business-api.tiktok.com/portal/auth',
    tokenUrl: 'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/',
    scopes: 'ad.report,advertiser.read',
    clientIdEnv: 'TIKTOK_CLIENT_ID',
    clientSecretEnv: 'TIKTOK_CLIENT_SECRET',
  },
  snapchat: {
    id: 'snapchat',
    label: 'Snapchat Ads',
    authUrl: 'https://accounts.snapchat.com/login/oauth2/authorize',
    tokenUrl: 'https://accounts.snapchat.com/login/oauth2/access_token',
    scopes: 'snapchat-marketing-api',
    clientIdEnv: 'SNAPCHAT_CLIENT_ID',
    clientSecretEnv: 'SNAPCHAT_CLIENT_SECRET',
  },
  pinterest: {
    id: 'pinterest',
    label: 'Pinterest Ads',
    authUrl: 'https://www.pinterest.com/oauth/',
    tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
    scopes: 'ads:read',
    clientIdEnv: 'PINTEREST_CLIENT_ID',
    clientSecretEnv: 'PINTEREST_CLIENT_SECRET',
  },
  x: {
    id: 'x',
    label: 'X Ads',
    authUrl: 'https://x.com/i/oauth2/authorize',
    tokenUrl: 'https://api.x.com/2/oauth2/token',
    scopes: 'tweet.read users.read offline.access',
    clientIdEnv: 'X_CLIENT_ID',
    clientSecretEnv: 'X_CLIENT_SECRET',
  },
  amazon: {
    id: 'amazon',
    label: 'Amazon Ads',
    authUrl: 'https://www.amazon.com/ap/oa',
    tokenUrl: 'https://api.amazon.com/auth/o2/token',
    scopes: 'advertising::campaign_management',
    clientIdEnv: 'AMAZON_CLIENT_ID',
    clientSecretEnv: 'AMAZON_CLIENT_SECRET',
  },
}

export function getPlatform(id: string): PlatformConfig {
  const platform = PLATFORMS[id.toLowerCase()]
  if (!platform) throw new Error(`Unknown platform: ${id}`)
  return platform
}

export function getCredentials(config: PlatformConfig): { clientId: string; clientSecret: string } {
  const clientId = Deno.env.get(config.clientIdEnv)
  const clientSecret = Deno.env.get(config.clientSecretEnv)

  if (!clientId || !clientSecret) {
    throw new Error(
      `${config.label} is not configured. Set ${config.clientIdEnv} and ${config.clientSecretEnv} as Supabase secrets.`
    )
  }
  return { clientId, clientSecret }
}
