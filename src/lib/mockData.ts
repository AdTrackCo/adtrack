import type {
  CreativeSet,
  Platform,
  StatPoint,
  AlertItem,
  Campaign,
  Audience,
  ABTest,
  Angle,
  HookType,
  FunnelStage,
  CreativeFormat,
  CreativeStatus,
} from '@/types'

const platforms: Platform[] = ['Meta', 'Google', 'TikTok', 'Snapchat', 'Pinterest', 'YouTube', 'X', 'Amazon', 'Roku']
const angles: Angle[] = ['Pain', 'Identity', 'Social Proof', 'Curiosity', 'Urgency', 'Comparison', 'Founder Story', 'UGC']
const hooks: HookType[] = ['QuestionHook', 'StatHook', 'PatternInterrupt', 'Testimonial', 'BeforeAfter', 'Controversial', 'ListHook', 'ProblemAgitate']
const stages: FunnelStage[] = ['TOFU', 'MOFU', 'BOFU']
const formats: CreativeFormat[] = ['Image', 'Video', 'Carousel']
const statuses: CreativeStatus[] = ['Live', 'Paused', 'Draft', 'Rejected', 'In Review', 'Testing']

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const rand = seededRandom(42)
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}
function num(min: number, max: number, decimals = 2): number {
  return Number((rand() * (max - min) + min).toFixed(decimals))
}
function pad(n: number) {
  return n.toString().padStart(2, '0')
}

const placementPresets: Record<Platform, { label: string; w: number; h: number }[]> = {
  Meta: [
    { label: 'Feed Square', w: 1080, h: 1080 },
    { label: 'Story/Reels', w: 1080, h: 1920 },
    { label: 'Link Ad', w: 1200, h: 628 },
  ],
  TikTok: [{ label: 'In-Feed', w: 1080, h: 1920 }],
  Google: [
    { label: 'Medium Rectangle', w: 300, h: 250 },
    { label: 'Leaderboard', w: 728, h: 90 },
  ],
  Snapchat: [{ label: 'Snap Ad', w: 1080, h: 1920 }],
  Pinterest: [
    { label: 'Standard Pin', w: 1000, h: 1500 },
    { label: 'Story Pin', w: 1080, h: 1920 },
  ],
  YouTube: [{ label: 'In-Stream', w: 1280, h: 720 }],
  X: [{ label: 'Timeline', w: 1200, h: 675 }],
  Amazon: [{ label: 'Sponsored Brand', w: 1200, h: 628 }],
  Roku: [{ label: 'OTT Video', w: 1920, h: 1080 }],
}

export function generateCreativeSets(count = 40): CreativeSet[] {
  const sets: CreativeSet[] = []
  for (let i = 0; i < count; i++) {
    const platform = pick(platforms)
    const stage = pick(stages)
    const angle = pick(angles)
    const hook = pick(hooks)
    const version = Math.ceil(rand() * 4)
    const day = pad(Math.ceil(rand() * 28))
    const month = pad(Math.ceil(rand() * 12))
    const year = 2026
    const name = `${year}${month}${day}_${platform.toUpperCase()}_${stage}_${angle.replace(/\s/g, '')}_${hook}_v${version}`
    const presets = placementPresets[platform] || placementPresets.Meta
    const variantCount = Math.max(1, Math.floor(rand() * presets.length) + 1)
    const variants = presets.slice(0, variantCount).map((p, idx) => ({
      id: `${i}-${idx}`,
      placementLabel: p.label,
      width: p.w,
      height: p.h,
      assetType: rand() > 0.7 ? ('video' as const) : ('image' as const),
    }))
    sets.push({
      id: `creative-${i}`,
      name,
      platform,
      format: pick(formats),
      funnelStage: stage,
      angle,
      hookType: hook,
      version,
      status: pick(statuses),
      roas: num(0.8, 6.5),
      ctr: num(0.5, 4.5),
      spend: num(200, 18000),
      impressions: Math.floor(num(5000, 500000, 0)),
      clicks: Math.floor(num(100, 8000, 0)),
      conversions: Math.floor(num(5, 400, 0)),
      complianceScore: Math.floor(num(60, 100, 0)),
      hookText: hookTextFor(angle, hook),
      primaryText: 'Stop guessing what actually works. See real performance data behind every creative, every angle, every platform — all in one place.',
      headline: 'The Command Center For Serious Advertisers',
      description: 'Track ROAS, creative fatigue, and testing results without the spreadsheet chaos.',
      cta: pick(['Shop Now', 'Learn More', 'Sign Up', 'Get Started', 'Download']),
      notes: '',
      variants,
      createdAt: `${year}-${month}-${day}`,
    })
  }
  return sets.sort((a, b) => b.roas - a.roas)
}

function hookTextFor(angle: Angle, hook: HookType): string {
  const map: Record<string, string> = {
    Pain: "Tired of guessing which ad is actually making you money?",
    Identity: "Built for media buyers who refuse to run on gut feel.",
    'Social Proof': "9,000+ advertisers switched off spreadsheets this year.",
    Curiosity: "The one metric most advertisers never check.",
    Urgency: "Your top creative is fatiguing right now — here's the fix.",
    Comparison: "Spreadsheets vs. AdTrack: there's no comparison.",
    'Founder Story': "I built this after losing $40K to a creative I didn't know was dead.",
    UGC: "\"I finally know which hook is driving revenue.\" — real user",
  }
  return map[angle] || `${hook}: a question worth asking.`
}

export function generateRoasTrend(days = 30): StatPoint[] {
  const points: StatPoint[] = []
  const start = new Date('2026-07-02')
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    points.push({
      date: d.toISOString().slice(5, 10),
      current: num(2.2, 4.8, 2),
      previous: num(1.8, 4.2, 2),
    })
  }
  return points
}

export const platformSpend = [
  { name: 'Meta', value: 48200, color: 'var(--color-violet)' },
  { name: 'Google', value: 27650, color: 'var(--color-teal)' },
  { name: 'TikTok', value: 15300, color: 'var(--color-warning)' },
  { name: 'Snapchat', value: 6100, color: 'var(--color-success)' },
]

export const alerts: AlertItem[] = [
  {
    id: 'a1',
    type: 'fatigue',
    severity: 'warning',
    title: 'Creative Fatigue Detected',
    description: '20240611_META_TOFU_Pain_QuestionHook_v2 — frequency 4.3, CTR down 34% over 7 days.',
    timestamp: '2h ago',
  },
  {
    id: 'a2',
    type: 'budget',
    severity: 'danger',
    title: 'Budget Overrun',
    description: 'TikTok — Summer Launch campaign has spent 118% of planned weekly budget.',
    timestamp: '5h ago',
  },
  {
    id: 'a3',
    type: 'ctr',
    severity: 'warning',
    title: 'CTR Drop',
    description: 'Google Search — Brand campaign CTR fell from 3.8% to 2.1% week over week.',
    timestamp: '1d ago',
  },
  {
    id: 'a4',
    type: 'policy',
    severity: 'danger',
    title: 'Ad Disapproved',
    description: 'Meta rejected "20240705_META_BOFU_Urgency_StatHook_v1" — Personal Attributes policy.',
    timestamp: '1d ago',
  },
]

export function generateCampaigns(count = 12): Campaign[] {
  const objectives = ['Conversions', 'Traffic', 'Awareness', 'Lead Generation', 'App Installs']
  const campaigns: Campaign[] = []
  for (let i = 0; i < count; i++) {
    const platform = pick(platforms)
    const roasTarget = num(2, 4)
    campaigns.push({
      id: `camp-${i}`,
      name: `${platform} — ${pick(['Summer Launch', 'Evergreen Prospecting', 'Retargeting Push', 'Q3 Scaling', 'Brand Awareness', 'BFCM Prep'])}`,
      platform,
      status: pick(['Active', 'Active', 'Active', 'Paused', 'Ended', 'Draft']),
      objective: pick(objectives),
      spend: num(1000, 60000),
      roas: num(1.2, 6),
      roasTarget,
      startDate: `2026-0${Math.ceil(rand() * 7)}-0${Math.ceil(rand() * 9)}`,
      adSets: Array.from({ length: Math.ceil(rand() * 3) + 1 }, (_, j) => ({
        id: `camp-${i}-adset-${j}`,
        name: `Ad Set ${j + 1} — ${pick(['Lookalike 1%', 'Broad', 'Retargeting 30d', 'Interest Stack'])}`,
        status: pick(['Active', 'Paused'] as const),
        spend: num(200, 8000),
        roas: num(1, 6),
        ads: Array.from({ length: Math.ceil(rand() * 3) + 1 }, (_, k) => ({
          id: `camp-${i}-adset-${j}-ad-${k}`,
          name: `Ad ${k + 1}`,
          status: pick(['Active', 'Paused'] as const),
          spend: num(50, 3000),
          roas: num(0.8, 6),
        })),
      })),
    })
  }
  return campaigns
}

export function generateAudiences(count = 14): Audience[] {
  const list: Audience[] = []
  for (let i = 0; i < count; i++) {
    const type = pick(['Broad', 'Custom', 'Lookalike'] as const)
    list.push({
      id: `aud-${i}`,
      name: type === 'Lookalike'
        ? `LAL 1% — ${pick(['Purchasers 30d', 'ATC 60d', 'All Site Visitors'])}`
        : type === 'Custom'
        ? `Custom — ${pick(['Email List', 'Website Visitors 30d', 'Cart Abandoners', 'Past Purchasers'])}`
        : `Broad — ${pick(['18-34 All Genders', 'Interest: Fitness', 'Interest: Beauty'])}`,
      platform: pick(platforms),
      type,
      estimatedSize: Math.floor(num(15000, 8000000, 0)),
      source: pick(['Website Pixel', 'Customer List', 'App Events', 'Engagement']),
      roas: num(1, 6),
      cpa: num(8, 65),
      ctr: num(0.5, 4),
    })
  }
  return list
}

export function generateABTests(count = 8): ABTest[] {
  const list: ABTest[] = []
  for (let i = 0; i < count; i++) {
    const status = pick(['Running', 'Completed', 'Completed', 'Draft'] as const)
    const confidence = status === 'Completed' ? num(85, 99, 0) : num(40, 80, 0)
    list.push({
      id: `test-${i}`,
      name: `${pick(angles)} vs ${pick(angles)} — ${pick(['Hook Copy', 'Thumbnail', 'CTA', 'Opening Frame'])}`,
      hypothesis: 'Leading with a pattern-interrupt hook will outperform a direct pain-point hook for cold traffic.',
      variablesTested: pick(['Hook Copy', 'Thumbnail', 'CTA Button', 'First 3 Seconds']),
      variantA: 'Control',
      variantB: 'Variant B',
      status,
      confidence,
      lift: num(-15, 55, 0),
      winner: status === 'Completed' ? pick(['A', 'B'] as const) : null,
      learnings: status === 'Completed' ? 'Pattern-interrupt hooks lifted CTR meaningfully but did not move ROAS at the same rate — likely a top-funnel effect.' : '',
      startDate: '2026-07-01',
      endDate: status === 'Completed' ? '2026-07-15' : undefined,
    })
  }
  return list
}

export { platforms, angles, hooks, stages, formats, statuses, placementPresets }
