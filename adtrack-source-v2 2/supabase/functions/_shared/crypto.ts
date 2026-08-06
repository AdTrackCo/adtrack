/**
 * AES-GCM encryption for OAuth tokens at rest.
 *
 * Requires a 32-byte key, base64-encoded, stored as the TOKEN_ENCRYPTION_KEY
 * Supabase secret. Generate one with:
 *   openssl rand -base64 32
 */

function getKeyMaterial(): Uint8Array {
  const raw = Deno.env.get('TOKEN_ENCRYPTION_KEY')
  if (!raw) throw new Error('TOKEN_ENCRYPTION_KEY secret is not set.')

  const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0))
  if (bytes.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes.')
  return bytes
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', getKeyMaterial(), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await importKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)

  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)

  // Store as base64(iv):base64(ciphertext)
  const ivB64 = btoa(String.fromCharCode(...iv))
  const ctB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
  return `${ivB64}:${ctB64}`
}

export async function decrypt(payload: string): Promise<string> {
  const [ivB64, ctB64] = payload.split(':')
  if (!ivB64 || !ctB64) throw new Error('Malformed encrypted token.')

  const key = await importKey()
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0))
  const ciphertext = Uint8Array.from(atob(ctB64), (c) => c.charCodeAt(0))

  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  return new TextDecoder().decode(plaintext)
}
