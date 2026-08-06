import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { RefreshCw, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input, Label, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/lib/AuthContext'
import { platforms } from '@/lib/mockData'
import { listIntegrations, startOAuth, disconnectPlatform, type Integration } from '@/lib/integrationsService'
import { cn } from '@/lib/utils'

const tabs = ['Profile', 'Team', 'Notifications', 'Integrations', 'Brand Profiles', 'Billing'] as const
type Tab = (typeof tabs)[number]

function ProfileTab() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="max-w-lg space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input defaultValue={(user?.user_metadata as any)?.full_name || ''} />
          </div>
          <div>
            <Label>Email</Label>
            <Input defaultValue={user?.email || ''} disabled />
          </div>
          <div>
            <Label>Metrics Preference</Label>
            <Select
              defaultValue={localStorage.getItem('adtrack_metrics_pref') || 'ask'}
              onChange={(e) => localStorage.setItem('adtrack_metrics_pref', e.target.value)}
            >
              <option value="manual">Manual Entry</option>
              <option value="sync">Platform Sync</option>
              <option value="ask">Ask every time</option>
            </Select>
          </div>
          <Button variant="primary" onClick={() => toast.success('Profile updated ✓')}>
            Save Changes
          </Button>
        </div>
      </Card>

      <Card className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Sign Out</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Log out of AdTrack on this device.</p>
        </div>
        <Button variant="outline" onClick={() => void handleSignOut()}>
          Sign Out
        </Button>
      </Card>
    </div>
  )
}

function TeamTab() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const you = {
    name: (user?.user_metadata as any)?.full_name || user?.email || 'You',
    email: user?.email || '',
    role: 'Admin',
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-lg border border-[var(--color-violet)]/30 bg-[var(--color-violet)]/5 px-4 py-3">
        <p className="text-[11px] text-[var(--color-text-secondary)]">
          Team invites aren't wired to a real system yet — there's no email sent and no invited account gets access. This
          needs a <span className="mono text-[var(--color-text-primary)]">team_members</span> table, an invite email flow, and
          role-based access checks before it's real.
        </p>
      </div>
      <Card className="p-5">
        <p className="text-sm font-medium mb-3">Invite a Team Member</p>
        <div className="flex gap-2">
          <Input placeholder="teammate@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select className="w-32">
            <option>Viewer</option>
            <option>Editor</option>
            <option>Admin</option>
          </Select>
          <Button
            variant="secondary"
            onClick={() => {
              if (!email) return
              toast('Invites aren\'t wired to a real backend yet — nothing was sent.')
              setEmail('')
            }}
          >
            Invite
          </Button>
        </div>
      </Card>
      <Card className="divide-y divide-[var(--color-border)]">
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <p className="text-sm">{you.name}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{you.email}</p>
          </div>
          <Badge tone="violet">{you.role}</Badge>
        </div>
      </Card>
    </div>
  )
}

function NotificationsTab() {
  const items = [
    'Creative fatigue alerts',
    'Budget overrun alerts',
    'Ad disapproval notifications',
    'Weekly AI insights digest',
    'Scheduled report delivery',
  ]
  return (
    <Card className="max-w-lg divide-y divide-[var(--color-border)]">
      {items.map((label) => (
        <label key={label} className="flex items-center justify-between px-5 py-3.5 cursor-pointer">
          <span className="text-sm">{label}</span>
          <input type="checkbox" defaultChecked className="accent-[var(--color-violet)] h-4 w-4" />
        </label>
      ))}
    </Card>
  )
}

function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setIntegrations(await listIntegrations())
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()

    // The OAuth callback redirects back here with a result in the query string.
    const params = new URLSearchParams(window.location.search)
    const oauthError = params.get('oauth_error')
    const connected = params.get('connected')
    if (oauthError) toast.error(oauthError, { duration: 10000 })
    if (connected) toast.success(`${connected} connected ✓`)
    if (oauthError || connected) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [load])

  async function handleConnect(p: string) {
    setConnecting(p)
    try {
      const url = await startOAuth(p)
      window.location.href = url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Could not connect ${p}.`, { duration: 12000 })
      setConnecting(null)
    }
  }

  async function handleDisconnect(p: string) {
    try {
      await disconnectPlatform(p)
      await load()
      toast.success(`${p} disconnected`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not disconnect.')
    }
  }

  return (
    <>
      <div className="mb-5 rounded-lg border border-[var(--color-violet)]/30 bg-[var(--color-violet)]/5 px-4 py-3">
        <p className="text-xs font-medium mb-1">Platform connections need setup before they work</p>
        <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
          Each platform requires a developer app registered under your business, plus approval from that platform, before
          it can return ad data. The backend is built and waiting — see INTEGRATIONS.md for the steps per platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {platforms.map((p) => {
        const record = integrations.find((i) => i.platform === p)
        const connected = record?.status === 'connected'
        return (
          <Card key={p} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-md bg-[var(--color-violet)]/10 flex items-center justify-center text-[var(--color-violet)] text-xs font-medium">
                  {p[0]}
                </div>
                <span className="text-sm">{p}</span>
              </div>
              <Badge tone={connected ? 'success' : 'muted'}>{connected ? 'Connected' : 'Disconnected'}</Badge>
            </div>

            {connected ? (
              <>
                <Select className="mb-2 text-xs h-8" defaultValue={record?.syncFrequency}>
                  <option value="hourly">Sync: Hourly</option>
                  <option value="6h">Sync: Every 6 hours</option>
                  <option value="daily">Sync: Daily</option>
                </Select>
                <p className="text-[10px] text-[var(--color-text-secondary)] mb-3">
                  {record?.lastSyncedAt ? `Last synced ${new Date(record.lastSyncedAt).toLocaleString()}` : 'Not synced yet'}
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" disabled>
                    <RefreshCw size={12} /> Sync Now
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void handleDisconnect(p)}>
                    Disconnect
                  </Button>
                </div>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => void handleConnect(p)}
                disabled={connecting === p || loading}
              >
                {connecting === p ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" /> Connecting…
                  </>
                ) : (
                  <>
                    <Plus size={12} /> Connect via OAuth
                  </>
                )}
              </Button>
            )}
          </Card>
        )
      })}
      </div>
    </>
  )
}

function BrandProfilesTab() {
  return (
    <div className="max-w-2xl">
      <Card className="p-8 text-center">
        <p className="text-sm font-medium mb-1">No brand profiles yet</p>
        <p className="text-xs text-[var(--color-text-secondary)] mb-4 max-w-sm mx-auto">
          Multi-brand support needs a <span className="mono">brands</span> table wired up (the schema already exists in
          the migration) — this is UI-only until that's connected.
        </p>
        <Button variant="outline" size="sm" onClick={() => toast('Brand profiles aren\'t wired to the database yet.')}>
          <Plus size={13} /> Add Brand Profile
        </Button>
      </Card>
    </div>
  )
}

function BillingTab() {
  return (
    <div className="max-w-lg">
      <Card className="p-8 text-center">
        <p className="text-sm font-medium mb-1">Billing isn't set up yet</p>
        <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
          AdTrack isn't charging anyone yet, so there's no real plan, payment method, or invoice history to show. Once
          Stripe is connected, your subscription details will appear here for real.
        </p>
      </Card>
    </div>
  )
}

export function Settings() {
  const [tab, setTab] = useState<Tab>('Profile')

  return (
    <div>
      <PageHeader title="Settings" description="Manage your profile, team, integrations, and billing." />
      <div className="px-6 md:px-8 pt-4 flex items-center gap-1 border-b border-[var(--color-border)] overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-3 py-2 text-xs whitespace-nowrap border-b-2 -mb-px transition-base',
              tab === t ? 'border-[var(--color-violet)] text-[var(--color-text-primary)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8">
        {tab === 'Profile' && <ProfileTab />}
        {tab === 'Team' && <TeamTab />}
        {tab === 'Notifications' && <NotificationsTab />}
        {tab === 'Integrations' && <IntegrationsTab />}
        {tab === 'Brand Profiles' && <BrandProfilesTab />}
        {tab === 'Billing' && <BillingTab />}
      </div>
    </div>
  )
}
