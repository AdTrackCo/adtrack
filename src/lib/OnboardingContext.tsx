import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface SurveyAnswers {
  role: string
  spend: string
  platforms: string[]
  challenge: string
  brandCount: string
  primaryKpi: string
}

interface OnboardingState {
  onboardingComplete: boolean
  survey: SurveyAnswers
  connectedPlatform: string | null
  setSurvey: (s: Partial<SurveyAnswers>) => void
  connectPlatform: (platform: string) => void
  completeOnboarding: () => void
  bannerDismissed: boolean
  dismissBanner: () => void
  resetOnboarding: () => void
}

const defaultSurvey: SurveyAnswers = {
  role: '',
  spend: '',
  platforms: [],
  challenge: '',
  brandCount: '',
  primaryKpi: '',
}

const STORAGE_KEY = 'adtrack_onboarding'

const OnboardingContext = createContext<OnboardingState | undefined>(undefined)

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return { onboardingComplete: false, survey: defaultSurvey, connectedPlatform: null, bannerDismissed: false }
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value: OnboardingState = {
    onboardingComplete: state.onboardingComplete,
    survey: state.survey,
    connectedPlatform: state.connectedPlatform,
    bannerDismissed: state.bannerDismissed,
    setSurvey: (s) => setState((prev: typeof state) => ({ ...prev, survey: { ...prev.survey, ...s } })),
    connectPlatform: (platform) => setState((prev: typeof state) => ({ ...prev, connectedPlatform: platform })),
    completeOnboarding: () => setState((prev: typeof state) => ({ ...prev, onboardingComplete: true })),
    dismissBanner: () => setState((prev: typeof state) => ({ ...prev, bannerDismissed: true })),
    resetOnboarding: () => setState({ onboardingComplete: false, survey: defaultSurvey, connectedPlatform: null, bannerDismissed: false }),
  }

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}
