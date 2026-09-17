import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import type { ZoneList } from '@/data/types/zone'

interface Props {
  zonesList: ZoneList
  activeZoneId: number | null
  onChange: (zoneId: number) => void
}

/** Кастомный выпадающий список выбора активной зоны. */
export const ZoneSelect = ({ zonesList, activeZoneId, onChange }: Props) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const activeZone = zonesList.find((z) => z.id === activeZoneId) ?? null

  // Закрытие по клику вне компонента и по Escape.
  useEffect(() => {
    if (!open) return
    const handlePointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const handleSelect = (zoneId: number) => {
    onChange(zoneId)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative flex">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          'flex min-w-[12rem] items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-700 px-4 py-2 text-lg font-semibold text-white shadow transition hover:bg-slate-600 focus:outline-none focus:ring-blue-400',
          open && 'ring-blue-400'
        )}
      >
        <span className="truncate">
          {activeZone ? activeZone.name : 'Выберите зону'}
        </span>
        <svg
          viewBox="0 0 20 20"
          className={clsx(
            'h-5 w-5 shrink-0 transition-transform',
            open && 'rotate-180'
          )}
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 z-20 max-h-72 w-full min-w-[12rem] overflow-auto rounded-lg bg-slate-700 shadow-xl ring-1 ring-white/10"
        >
          {zonesList.map((zone) => {
            const selected = zone.id === activeZoneId
            return (
              <li key={zone.id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => handleSelect(zone.id)}
                  className={clsx(
                    'flex w-full items-center justify-between gap-2 px-4 py-4 text-left text-lg font-semibold text-white transition hover:bg-slate-600',
                    selected && 'bg-blue-600/30 text-blue-200'
                  )}
                >
                  <span className="truncate">{zone.name}</span>
                  {selected && (
                    <svg
                      viewBox="0 0 20 20"
                      className="h-4 w-4 shrink-0"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.5a1 1 0 0 1-1.42 0l-3.5-3.5a1 1 0 1 1 1.414-1.414L8.5 12.086l6.79-6.79a1 1 0 0 1 1.414-.006Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
