/**
 * Begins the OAuth handshake for an ad platform.
 *
 * The browser calls this with a platform id; it returns the platform's consent
 * URL. A signed `state` value ties the callback back to the calling user and
 * protects against CSRF.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { getPlatform, getCredentials } from '../_shared/platforms.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Not authenticated.' }, 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) return json({ error: 'Not authenticated.' }, 401)

    const { platform: platformId } = await req.json()
    const platform = getPlatform(platformId)
    const { clientId } = getCredentials(platform)

    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`

    // state = random nonce + user id, persisted so the callback can verify it.
    const nonce = crypto.randomUUID()
    const state = `${nonce}.${platform.id}`

    const { error: stateError } = await supabase.from('oauth_states').insert({
      nonce,
      user_id: userData.user.id,
      platform: platform.id,
    })
    if (stateError) return json({ error: `Could not start OAuth: ${stateError.message}` }, 500)

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: platform.scopes,
      state,
      ...(platform.extraAuthParams ?? {}),
    })

    return json({ url: `${platform.authUrl}?${params.toString()}` })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unexpected error.' }, 400)
  }
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
