import { supabase, isSupabaseConfigured } from './supabase'

export type MetricsPreference = 'manual' | 'sync' | 'ask'

export interface NotificationSettings {
  creativeFatigue: boolean
  budgetOverrun: boolean
  adDisapproval: boolean
  weeklyDigest: boolean
  scheduledReports: boolean
}

export const defaultNotificationSettings: NotificationSettings = {
  creativeFatigue: true,
  budgetOverrun: true,
  adDisapproval: true,
  weeklyDigest: true,
  scheduledReports: true,
}

export interface UserPreferences {
  metricsPreference: MetricsPreference
  notificationSettings: NotificationSettings
}

export const defaultPreferences: UserPreferences = {
  metricsPreference: 'ask',
  notificationSettings: defaultNotificationSettings,
}

function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return error.code === '42P01' || error.code === 'PGRST205'
}

export async function getPreferences(): Promise<UserPreferences> {
  if (!isSupabaseConfigured) return defaultPreferences

  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return defaultPreferences

  const { data, error } = await supabase
    .from('user_preferences')
    .select('metrics_preference, notification_settings')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  // No row yet is normal for a new account — fall back to defaults silently.
  if (error || !data) return defaultPreferences

  const row = data as { metrics_preference: MetricsPreference; notification_settings: Partial<NotificationSettings> }

  return {
    metricsPreference: row.metrics_preference ?? 'ask',
    // Merge so a setting added later doesn't come back undefined for existing users.
    notificationSettings: { ...defaultNotificationSettings, ...(row.notification_settings || {}) },
  }
}

export async function savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw new Error('You must be signed in to save preferences.')

  const payload: Record<string, unknown> = { user_id: userData.user.id, updated_at: new Date().toISOString() }
  if (prefs.metricsPreference) payload.metrics_preference = prefs.metricsPreference
  if (prefs.notificationSettings) payload.notification_settings = prefs.notificationSettings

  const { error } = await supabase.from('user_preferences').upsert(payload, { onConflict: 'user_id' })

  if (error) {
    if (isMissingTable(error)) {
      throw new Error('The user_preferences table is missing. Run supabase/migrations/0001_init.sql.')
    }
    throw new Error(error.message)
  }
}

/** Updates the display name stored on the auth user record. */
export async function updateFullName(fullName: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } })
  if (error) throw new Error(error.message)
}
