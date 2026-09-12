import { useEffect, useState } from 'react'
import type { PsList } from '@/data/types/psList'
import type { ResList } from '@/data/types/res'
import { getPsList, getResList } from './psDb'

interface UsePsDbResult {
  psDb: PsList
  resList: ResList
  loading: boolean
  error: Error | null
  setPsDb: (list: PsList) => void
  setResList: (list: ResList) => void
}

/** Загружает базу подстанций и список РЭС из IndexedDB при монтировании. */
export const usePsDb = (): UsePsDbResult => {
  const [psDb, setPsDb] = useState<PsList>([])
  const [resList, setResList] = useState<ResList>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([getPsList(), getResList()])
      .then(([ps, res]) => {
        if (cancelled) return
        setPsDb(ps)
        setResList(res)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { psDb, resList, loading, error, setPsDb, setResList }
}
