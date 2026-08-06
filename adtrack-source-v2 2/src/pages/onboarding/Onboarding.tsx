import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '@/lib/OnboardingContext'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/utils'
import { Check, Loader2 } from 'lucide-react'

const roleOptions = ['Solo brand owner', 'Media buyer', 'Agency', 'Creative strategist']
const spendOptions = ['$0–$5K', '$5K–$50K', '$50K–$500K', '$500K+']
const platformOptions = ['Meta', 'Google', 'TikTok', 'Snapchat', 'Pinterest', 'YouTube', 'X', 'Amazon', 'Roku']
const challengeOptions = ['Tracking performance', 'Managing creatives', 'Scaling what works', 'Team collaboration', 'Reporting to clients']
const brandCountOptions = ['Just one', '2–5', '6–20', '20+']
const kpiOptions = ['ROAS', 'CPA', 'CPL', 'Revenue', 'Brand awareness']

const connectPlatforms = [
  { id: 'Meta', recommended: true },
  { id: 'Google', recommended: false },
  { id: 'TikTok', recommended: false },
]

function OptionGrid({
  options,
  selected,
  onSelect,
  multi = false,
}: {
  options: string[]
  selected: string | string[]
  onSelect: (v: string) => void
  multi?: boolean
}) {
  const isSelected = (opt: string) => (multi ? (selected as string[]).includes(opt) : selected === opt)
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={cn(
            'text-left rounded-lg border px-4 py-3 text-sm transition-base',
            isSelected(opt)
              ? 'border-[var(--color-violet)] bg-[var(--color-violet)]/10 text-[var(--color-text-primary)]'
              : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-white/20'
          )}
        >
          <span className="flex items-center justify-between">
            {opt}
            {isSelected(opt) && <Check size={14} className="text-[var(--color-violet)]" />}
          </span>
        </button>
      ))}
    </div>
  )
}

export function Onboarding() {
  const navigate = useNavigate()
  const { survey, setSurvey, connectPlatform, completeOnboarding } = useOnboarding()
  const [step, setStep] = useState(0)
  const [importing, setImporting] = useState(false)

  const totalSteps = 8 // 6 survey + connect + import
  const progressPct = ((step + 1) / totalSteps) * 100

  useEffect(() => {
    if (step === 7) {
      setImporting(true)
      const t = setTimeout(() => {
        setImporting(false)
        completeOnboarding()
        navigate('/dashboard')
      }, 2200)
      return () => clearTimeout(t)
    }
  }, [step])

  function next() {
    setStep((s) => Math.min(s + 1, totalSteps - 1))
  }

  const togglePlatform = (p: string) => {
    const current = survey.platforms.includes(p) ? survey.platforms.filter((x) => x !== p) : [...survey.platforms, p]
    setSurvey({ platforms: current })
  }

  const steps = [
    {
      title: 'What best describes you?',
      body: <OptionGrid options={roleOptions} selected={survey.role} onSelect={(v) => setSurvey({ role: v })} />,
      canNext: !!survey.role,
    },
    {
      title: 'How much do you spend on ads monthly?',
      body: <OptionGrid options={spendOptions} selected={survey.spend} onSelect={(v) => setSurvey({ spend: v })} />,
      canNext: !!survey.spend,
    },
    {
      title: 'Which platforms do you advertise on?',
      body: <OptionGrid options={platformOptions} selected={survey.platforms} onSelect={togglePlatform} multi />,
      canNext: survey.platforms.length > 0,
    },
    {
      title: "What's your biggest challenge right now?",
      body: <OptionGrid options={challengeOptions} selected={survey.challenge} onSelect={(v) => setSurvey({ challenge: v })} />,
      canNext: !!survey.challenge,
    },
    {
      title: 'How many brands do you manage?',
      body: <OptionGrid options={brandCountOptions} selected={survey.brandCount} onSelect={(v) => setSurvey({ brandCount: v })} />,
      canNext: !!survey.brandCount,
    },
    {
      title: "What's your primary KPI?",
      body: <OptionGrid options={kpiOptions} selected={survey.primaryKpi} onSelect={(v) => setSurvey({ primaryKpi: v })} />,
      canNext: !!survey.primaryKpi,
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-[var(--color-violet)] text-xl leading-none">◆</span>
          <span className="text-xl font-light">
            <span className="text-[var(--color-violet)] font-medium">A</span>dTrack
          </span>
        </div>

        <Progress value={progressPct} className="mb-8" />

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 animate-slide-up" key={step}>
          {step < 6 && (
            <>
              <h2 className="text-lg font-light mb-6">{steps[step].title}</h2>
              {steps[step].body}
              <div className="mt-8 flex justify-between items-center">
                <span className="text-xs text-[var(--color-text-secondary)] mono">{step + 1} / 6</span>
                <Button variant="primary" disabled={!steps[step].canNext} onClick={next}>
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <h2 className="text-lg font-light mb-1">Connect your first platform</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">1 of 3 recommended steps</p>
              <div className="space-y-3">
                {connectPlatforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      connectPlatform(p.id)
                      next()
                    }}
                    className="w-full flex items-center justify-between rounded-lg border border-[var(--color-border)] hover:border-[var(--color-violet)] px-4 py-3.5 text-sm transition-base"
                  >
                    <span className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-md bg-[var(--color-violet)]/10 flex items-center justify-center text-[var(--color-violet)] text-xs font-medium">
                        {p.id[0]}
                      </span>
                      {p.id}
                    </span>
                    {p.recommended && (
                      <span className="text-[11px] text-[var(--color-violet)] bg-[var(--color-violet)]/10 rounded-full px-2 py-0.5">
                        Recommended
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <button onClick={next} className="mt-6 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] w-full text-center">
                Skip for now
              </button>
            </>
          )}

          {step === 7 && (
            <div className="text-center py-8">
              <Loader2 size={28} className="animate-spin text-[var(--color-violet)] mx-auto mb-4" />
              <p className="text-sm">{importing ? 'Syncing your campaigns…' : 'Done!'}</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">Importing the last 30 days of campaign data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
