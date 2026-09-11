import { useEffect, useState } from 'react'
import type { PsList } from '@/data/types/psList'
import { getPsList } from './psDb'

interface UsePsDbResult {
  psDb: PsList
  loading: boolean
  error: Error | null
}

/** Загружает базу подстанций из IndexedDB при монтировании. */
export const usePsDb = (): UsePsDbResult => {
  const [psDb, setPsDb] = useState<PsList>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    getPsList()
      .then((list) => {
        if (!cancelled) setPsDb(list)
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

  return { psDb, loading, error }
}
