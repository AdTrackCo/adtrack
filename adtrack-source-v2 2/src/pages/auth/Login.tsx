import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { Input, Label } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/AuthContext'
import { toast } from 'sonner'

export function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      toast.error(error, { duration: 8000 })
      return
    }
    navigate('/dashboard')
  }

  return (
    <AuthLayout>
      <h2 className="text-base font-medium mb-1">Welcome back</h2>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">Log in to your command center.</p>
      {import.meta.env.VITE_PREVIEW === 'true' && (
        <div className="mb-5 rounded-lg border border-[var(--color-violet)]/30 bg-[var(--color-violet)]/5 px-3 py-2.5">
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            <span className="text-[var(--color-violet)]">Preview mode</span> — enter any email and password to explore the app with sample data.
          </p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@brand.com" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Logging in…' : 'Log In'}
        </Button>
      </form>
      <p className="text-xs text-[var(--color-text-secondary)] text-center mt-6">
        Don't have an account?{' '}
        <Link to="/signup" className="text-[var(--color-violet)] hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
