import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from './supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

/**
 * Supabase errors aren't always plain strings — depending on the failure they
 * can be AuthError instances, plain objects, or network errors. Previously we
 * passed these straight to toast(), which rendered a useless "{}".
 */
function readableError(err: unknown): string {
  if (!err) return 'Something went wrong. Please try again.'
  if (typeof err === 'string') return err
  if (err instanceof Error && err.message) return err.message

  const anyErr = err as Record<string, unknown>
  for (const key of ['message', 'error_description', 'msg', 'error', 'hint']) {
    const value = anyErr[key]
    if (typeof value === 'string' && value.trim()) return value
  }

  if (typeof anyErr.status === 'number') {
    return `Request failed (status ${anyErr.status}). Check your Supabase settings and try again.`
  }

  try {
    const serialized = JSON.stringify(err)
    if (serialized && serialized !== '{}') return serialized
  } catch {
    /* fall through */
  }
  return 'Could not reach the authentication service. Please try again.'
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Local mock-mode fallback so the app is fully usable even before Supabase
// email confirmation / auth is fully configured on the project.
const MOCK_USER_KEY = 'adtrack_mock_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(MOCK_USER_KEY)
      if (stored) setUser(JSON.parse(stored))
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signUp(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured) {
      const mockUser = { id: crypto.randomUUID(), email, user_metadata: { full_name: fullName } } as unknown as User
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser))
      setUser(mockUser)
      return { error: null, needsConfirmation: false }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) return { error: readableError(error), needsConfirmation: false }

      // When email confirmation is disabled in Supabase, a session comes back
      // immediately and the user is already logged in — no inbox step needed.
      const needsConfirmation = !data.session
      return { error: null, needsConfirmation }
    } catch (err) {
      return { error: readableError(err), needsConfirmation: false }
    }
  }

  async function signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      const mockUser = { id: crypto.randomUUID(), email, user_metadata: { full_name: email.split('@')[0] } } as unknown as User
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser))
      setUser(mockUser)
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error ? readableError(error) : null }
    } catch (err) {
      return { error: readableError(err) }
    }
  }

  async function signOut() {
    if (!isSupabaseConfigured) {
      localStorage.removeItem(MOCK_USER_KEY)
      setUser(null)
      return
    }
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
