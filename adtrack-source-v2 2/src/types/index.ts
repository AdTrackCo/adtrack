export type Platform =
  | 'Meta'
  | 'Google'
  | 'TikTok'
  | 'Snapchat'
  | 'Pinterest'
  | 'YouTube'
  | 'X'
  | 'Amazon'
  | 'Roku'

export type CreativeStatus = 'Live' | 'Paused' | 'Draft' | 'Rejected' | 'In Review' | 'Archived' | 'Testing'
export type CreativeFormat = 'Image' | 'Video' | 'Carousel'
export type FunnelStage = 'TOFU' | 'MOFU' | 'BOFU'
export type Angle =
  | 'Pain'
  | 'Identity'
  | 'Social Proof'
  | 'Curiosity'
  | 'Urgency'
  | 'Comparison'
  | 'Founder Story'
  | 'UGC'
export type HookType =
  | 'QuestionHook'
  | 'StatHook'
  | 'PatternInterrupt'
  | 'Testimonial'
  | 'BeforeAfter'
  | 'Controversial'
  | 'ListHook'
  | 'ProblemAgitate'

export interface CreativeVariant {
  id: string
  placementLabel: string
  width: number
  height: number
  assetType: 'image' | 'video'
  assetUrl?: string
}

export interface CreativeSet {
  id: string
  name: string
  platform: Platform
  format: CreativeFormat
  funnelStage: FunnelStage
  angle: Angle
  hookType: HookType
  version: number
  status: CreativeStatus
  roas: number
  ctr: number
  spend: number
  impressions: number
  clicks: number
  conversions: number
  complianceScore: number
  hookText: string
  primaryText: string
  headline: string
  description: string
  cta: string
  notes: string
  variants: CreativeVariant[]
  thumbnailUrl?: string
  createdAt: string
}

export interface StatPoint {
  date: string
  current: number
  previous: number
}

export interface AlertItem {
  id: string
  type: 'fatigue' | 'budget' | 'ctr' | 'policy'
  severity: 'warning' | 'danger'
  title: string
  description: string
  timestamp: string
}

export interface Campaign {
  id: string
  name: string
  platform: Platform
  status: 'Active' | 'Paused' | 'Ended' | 'Draft'
  objective: string
  spend: number
  roas: number
  roasTarget: number
  startDate: string
  adSets: AdSet[]
}

export interface AdSet {
  id: string
  name: string
  status: 'Active' | 'Paused'
  spend: number
  roas: number
  ads: Ad[]
}

export interface Ad {
  id: string
  name: string
  status: 'Active' | 'Paused'
  spend: number
  roas: number
}

export interface Audience {
  id: string
  name: string
  platform: Platform
  type: 'Broad' | 'Custom' | 'Lookalike'
  estimatedSize: number
  source: string
  roas: number
  cpa: number
  ctr: number
}

export interface ABTest {
  id: string
  name: string
  hypothesis: string
  variablesTested: string
  variantA: string
  variantB: string
  status: 'Running' | 'Completed' | 'Draft'
  confidence: number
  lift: number
  winner: 'A' | 'B' | null
  learnings: string
  startDate: string
  endDate?: string
}
