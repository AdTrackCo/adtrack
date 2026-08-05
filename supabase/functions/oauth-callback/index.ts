/**
 * Handles the OAuth redirect back from an ad platform.
 *
 * Exchanges the authorization code for tokens using the client secret (which
 * only ever exists server-side), encrypts them, stores them against the user,
 * then redirects the browser back into the app.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { getPlatform, getCredentials } from '../_shared/platforms.ts'
import { encrypt } from '../_shared/crypto.ts'

Deno.serve(async (req) => {
  const appOrigin = Deno.env.get('APP_ORIGIN') ?? ''
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const oauthError = url.searchParams.get('error_description') || url.searchParams.get('error')

  if (oauthError) return redirect(appOrigin, `Connection cancelled: ${oauthError}`)
  if (!code || !state) return redirect(appOrigin, 'Missing authorization code.')

  const [nonce, platformId] = state.split('.')

  try {
    const platform = getPlatform(platformId)
    const { clientId, clientSecret } = getCredentials(platform)

    // Service-role client: this runs server-side with no user JWT available.
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify and consume the state nonce.
    const { data: stateRow, error: stateError } = await admin
      .from('oauth_states')
      .select('user_id, platform, created_at')
      .eq('nonce', nonce)
      .maybeSingle()

    if (stateError || !stateRow) return redirect(appOrigin, 'Invalid or expired connection request.')
    await admin.from('oauth_states').delete().eq('nonce', nonce)

    // Reject states older than 10 minutes.
    if (Date.now() - new Date(stateRow.created_at).getTime() > 10 * 60 * 1000) {
      return redirect(appOrigin, 'Connection request expired. Please try again.')
    }

    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`

    const tokenResponse = await fetch(platform.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokenBody = await tokenResponse.json()
    if (!tokenResponse.ok || !tokenBody.access_token) {
      const detail = tokenBody.error_description || tokenBody.error || 'token exchange failed'
      return redirect(appOrigin, `Could not connect ${platform.label}: ${detail}`)
    }

    const accessEncrypted = await encrypt(tokenBody.access_token)
    const refreshEncrypted = tokenBody.refresh_token ? await encrypt(tokenBody.refresh_token) : null

    const { error: upsertError } = await admin.from('integrations').upsert(
      {
        user_id: stateRow.user_id,
        platform: platform.label,
        status: 'connected',
        access_token_encrypted: accessEncrypted,
        refresh_token_encrypted: refreshEncrypted,
        account_label: 'default',
        last_synced_at: null,
      },
      { onConflict: 'user_id,platform,account_label' }
    )

    if (upsertError) return redirect(appOrigin, `Could not save connection: ${upsertError.message}`)

    return redirect(appOrigin, null, platform.label)
  } catch (err) {
    return redirect(appOrigin, err instanceof Error ? err.message : 'Unexpected error.')
  }
})

function redirect(origin: string, error: string | null, connected?: string): Response {
  const target = new URL(`${origin}/settings`)
  if (error) target.searchParams.set('oauth_error', error)
  if (connected) target.searchParams.set('connected', connected)
  return Response.redirect(target.toString(), 302)
}
