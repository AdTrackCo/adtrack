import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SampleDataBanner } from '@/components/common/SampleDataBanner'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

const presets = [
  'Analyze my top 5 creatives this month',
  'Why is my ROAS dropping?',
  'Suggest 10 new hook ideas for my product',
  'Compare identity vs pain angle performance',
  'Write 5 ad copy variations for this creative',
  'Which audiences should I test next?',
  "Diagnose this campaign's performance",
]

const insights = [
  'Your identity-angle creatives outperform pain-angle by 3.2x ROAS this month.',
  'Creative #47 shows fatigue signals — frequency >4.2, CTR dropped 38%.',
  'Thursday–Saturday spend delivers 2.1x ROAS vs Monday–Wednesday.',
  'Meta retargeting audiences are outperforming prospecting by 2.8x ROAS this week.',
]

function canned(prompt: string): string {
  const p = prompt.toLowerCase()
  if (p.includes('top 5') || p.includes('analyze')) {
    return "Your top 5 creatives this month lean heavily on Identity and Social Proof angles, averaging 4.8x ROAS vs a 3.1x account average. Pattern-interrupt hooks in the first 3 seconds are driving the CTR advantage — I'd recommend allocating 20-30% more budget toward that angle/hook combination while monitoring frequency to avoid early fatigue."
  }
  if (p.includes('roas') && p.includes('drop')) {
    return "Blended ROAS is down largely because TikTok CPMs rose 22% week-over-week while conversion rate held flat — that's a cost problem, not a creative problem. Two of your top TOFU creatives are also showing frequency above 4.0, which typically precedes a CTR decline. I'd refresh those two first."
  }
  if (p.includes('hook')) {
    return "Here are 10 hook ideas: 1) 'The $40K mistake I made before I tracked this' 2) 'Stop guessing which ad is making you money' 3) 'I ran 200 ad tests so you don't have to' 4) 'This one metric predicts if your ad will scale' 5) 'Why your best-looking ad is losing money' 6) '9,000 advertisers switched off spreadsheets' 7) 'The 3-second rule that saved my ad account' 8) 'What top 1% media buyers check every morning' 9) 'I fired my agency after finding this' 10) 'The dashboard that ended my Sunday spreadsheet ritual'"
  }
  if (p.includes('identity') && p.includes('pain')) {
    return "Identity-angle creatives are outperforming Pain-angle by 3.2x ROAS this month (4.6x vs 1.4x), though Pain angle drives a 28% lower CPA on cold traffic. Recommendation: use Pain angle for TOFU prospecting and Identity angle for MOFU/BOFU retargeting where trust is already established."
  }
  if (p.includes('audience')) {
    return "Based on current performance, I'd test: a 1% lookalike sourced from 30-day purchasers (currently your best-performing seed audience), a broad 18-34 interest stack for TOFU efficiency testing, and a cart-abandoner retargeting window shortened to 7 days — your current 14-day window is showing diminishing returns past day 9."
  }
  return "Here's my take: focus on your highest-frequency creatives first since fatigue compounds quickly, then double down on the angle/platform combinations already outperforming your account average. Want me to pull the specific numbers behind any of this?"
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Heads up before we start: I'm a preview, not a working AI. I'm not connected to a language model and I can't see your creatives, campaigns, or metrics. My replies are pre-written examples that match on keywords — treat every number in them as made up. This page shows what the assistant will do once it's connected for real.",
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  function send(text: string) {
    if (!text.trim()) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setThinking(true)
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', text: canned(text) }])
      setThinking(false)
    }, 900)
  }

  return (
    <div>
      <PageHeader title="AI Assistant" description="Preview of context-aware analysis across creatives, campaigns, and ad sets." />

      <SampleDataBanner tone="warning">
        This assistant is a demo. No AI model is connected and it cannot read your account — every response is
        pre-written sample text, and all figures it quotes are invented. Don't act on anything it says.
      </SampleDataBanner>

      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] h-[calc(100vh-180px)]">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user' ? 'bg-[var(--color-violet)] text-white' : 'bg-[var(--color-elevated)] text-[var(--color-text-primary)]'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-[var(--color-elevated)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[var(--color-violet)] animate-pulse" /> Thinking…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[var(--color-border)] p-3">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {presets.slice(0, 3).map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="text-[11px] rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-text-secondary)] hover:border-[var(--color-violet)] hover:text-[var(--color-text-primary)] transition-base"
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ask about a campaign, creative, or metric… (@mention supported)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send(input)}
              />
              <Button variant="primary" size="icon" onClick={() => send(input)}>
                <Send size={14} />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preset Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="w-full text-left text-xs rounded-lg px-3 py-2 text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)] transition-base"
                >
                  {p}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Insights</CardTitle>
              <span className="text-[10px] text-[var(--color-warning)]">Sample</span>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {insights.map((ins, i) => (
                <div key={i} className="rounded-lg border border-[var(--color-violet)]/20 bg-[var(--color-violet)]/5 p-3 text-xs flex gap-2">
                  <Sparkles size={13} className="text-[var(--color-violet)] shrink-0 mt-0.5" />
                  <span>{ins}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
