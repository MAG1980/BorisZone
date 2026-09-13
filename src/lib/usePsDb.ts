import { useEffect, useState } from 'react'
import type { PsList } from '@/data/types/psList'
import type { ResList } from '@/data/types/res'
import type { ZoneList } from '@/data/types/zone'
import { getPsList, getResList, getZonesList } from './psDb'

interface UsePsDbResult {
  psDb: PsList
  resList: ResList
  zonesList: ZoneList
  loading: boolean
  error: Error | null
  setPsDb: (list: PsList) => void
  setResList: (list: ResList) => void
  setZonesList: (list: ZoneList) => void
}

/** Загружает базу подстанций и список РЭС из IndexedDB при монтировании. */
export const usePsDb = (): UsePsDbResult => {
  const [psDb, setPsDb] = useState<PsList>([])
  const [resList, setResList] = useState<ResList>([])
  const [zonesList, setZonesList] = useState<ZoneList>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([getPsList(), getResList(), getZonesList()])
      .then(([ps, res, zones]) => {
        if (cancelled) return
        setPsDb(ps)
        setResList(res)
        setZonesList(zones)
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

  return {
    psDb,
    resList,
    zonesList,
    loading,
    error,
    setPsDb,
    setResList,
    setZonesList,
  }
}
