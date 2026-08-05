import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from './AuthLayout'
import { Input, Label } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/AuthContext'
import { toast } from 'sonner'
import { Mail, CheckCircle2 } from 'lucide-react'

export function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error, needsConfirmation } = await signUp(email, password, fullName)
    setLoading(false)

    if (error) {
      toast.error(error, { duration: 8000 })
      return
    }

    // Email confirmation turned off in Supabase — the user is already signed in.
    if (!needsConfirmation) {
      toast.success('Account created ✓')
      navigate('/onboarding')
      return
    }

    toast.success('Verification email sent ✓')
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout>
        <div className="text-center py-4">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[var(--color-violet)]/10 flex items-center justify-center">
            <Mail size={22} className="text-[var(--color-violet)]" />
          </div>
          <h2 className="text-base font-medium mb-2">Check your inbox</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            We sent a confirmation link to <span className="text-[var(--color-text-primary)]">{email}</span> via Resend. Click it to verify your account.
          </p>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate('/onboarding')}
          >
            <CheckCircle2 size={15} /> I've verified — continue
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h2 className="text-base font-medium mb-1">Create your account</h2>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">Start running ads with clarity.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jordan Ibarra" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@brand.com" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>
      <p className="text-xs text-[var(--color-text-secondary)] text-center mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-[var(--color-violet)] hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
