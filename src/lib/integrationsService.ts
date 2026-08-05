import { supabase, isSupabaseConfigured } from './supabase'

export interface Integration {
  platform: string
  status: 'connected' | 'disconnected' | 'syncing' | 'error'
  syncFrequency: string
  lastSyncedAt: string | null
  accountLabel: string | null
}

export class PlatformNotConfiguredError extends Error {}

export async function listIntegrations(): Promise<Integration[]> {
  if (!isSupabaseConfigured) return []

  const { data, error } = await supabase
    .from('integrations')
    .select('platform, status, sync_frequency, last_synced_at, account_label')

  // Table may not exist until migrations are run — treat as "nothing connected".
  if (error) return []

  return (data || []).map((row) => ({
    platform: row.platform,
    status: row.status,
    syncFrequency: row.sync_frequency,
    lastSyncedAt: row.last_synced_at,
    accountLabel: row.account_label,
  }))
}

/**
 * Kicks off the OAuth handshake. Requires the oauth-start Edge Function to be
 * deployed and that platform's client credentials to be set as Supabase
 * secrets — otherwise this throws with a clear explanation.
 */
export async function startOAuth(platformId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('oauth-start', {
    body: { platform: platformId.toLowerCase() },
  })

  if (error) {
    throw new PlatformNotConfiguredError(
      `${platformId} isn't connectable yet. The OAuth backend needs to be deployed and ${platformId} developer credentials added. See INTEGRATIONS.md.`
    )
  }
  if (data?.error) throw new PlatformNotConfiguredError(data.error)
  if (!data?.url) throw new Error('No authorization URL returned.')

  return data.url as string
}

export async function disconnectPlatform(platform: string): Promise<void> {
  const { error } = await supabase.from('integrations').delete().eq('platform', platform)
  if (error) throw new Error(error.message)
}
