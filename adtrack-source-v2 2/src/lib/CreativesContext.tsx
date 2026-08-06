import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CreativeSet } from '@/types'
import { listCreativeSets, MissingTablesError } from './creativesService'
import { generateCreativeSets } from './mockData'
import { useAuth } from './AuthContext'

const sampleSets = generateCreativeSets(40)

interface CreativesState {
  /** What the UI should render — real rows if any exist, otherwise sample data. */
  creatives: CreativeSet[]
  /** True when `creatives` is sample data rather than the user's own. */
  isSample: boolean
  /** Count of the user's real creatives, regardless of what's displayed. */
  realCount: number
  loading: boolean
  /** Set when the DB migration hasn't been run yet. */
  setupError: string | null
  error: string | null
  refresh: () => Promise<void>
}

const CreativesContext = createContext<CreativesState | undefined>(undefined)

export function CreativesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [real, setReal] = useState<CreativeSet[]>([])
  const [loading, setLoading] = useState(true)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setReal([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const rows = await listCreativeSets()
      setReal(rows)
      setSetupError(null)
    } catch (err) {
      if (err instanceof MissingTablesError) {
        setSetupError(err.message)
      } else {
        setError(err instanceof Error ? err.message : 'Could not load creatives.')
      }
      setReal([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const hasReal = real.length > 0

  return (
    <CreativesContext.Provider
      value={{
        creatives: hasReal ? real : sampleSets,
        isSample: !hasReal,
        realCount: real.length,
        loading,
        setupError,
        error,
        refresh,
      }}
    >
      {children}
    </CreativesContext.Provider>
  )
}

export function useCreatives() {
  const ctx = useContext(CreativesContext)
  if (!ctx) throw new Error('useCreatives must be used within CreativesProvider')
  return ctx
}
