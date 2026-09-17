import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import type { ZoneList } from '@/data/types/zone'

interface Props {
  zonesList: ZoneList
  activeZoneId: number | null
  onChange: (zoneId: number) => void
  onEditPs: () => void
}

/** Кастомный выпадающий список выбора активной зоны. */
export const ZoneSelect = ({
  zonesList,
  activeZoneId,
  onChange,
  onEditPs,
}: Props) => {
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

  // Открывает редактор подстанций и закрывает выпадающий список.
  const handleEdit = (action: () => void) => {
    setOpen(false)
    action()
  }

  return (
    <div ref={rootRef} className="relative flex">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          'flex min-w-[17rem] items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-700 px-4 py-2 text-lg font-semibold text-white shadow transition hover:bg-slate-600 focus:outline-none focus:ring-blue-400',
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
          className="absolute left-0 z-20 max-h-72 w-full min-w-[17rem] overflow-auto rounded-lg bg-slate-700 shadow-xl ring-1 ring-white/10"
        >
          {zonesList.map((zone) => {
            const selected = zone.id === activeZoneId
            return (
              <li key={zone.id} role="option" aria-selected={selected}>
                <div
                  className={clsx(
                    'flex w-full items-center gap-1',
                    selected && 'bg-blue-600/30'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(zone.id)}
                    className={clsx(
                      'flex grow items-center gap-2 px-4 py-4 text-left text-lg font-semibold text-white transition hover:bg-slate-600',
                      selected && 'text-blue-200'
                    )}
                  >
                    <span className="truncate">{zone.name}</span>
                  </button>
                  {selected && (
                    <svg
                      viewBox="0 0 20 20"
                      className="h-4 w-4 shrink-0 text-blue-200"
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
                  <button
                    type="button"
                    onClick={() => handleEdit(onEditPs)}
                    aria-label="Редактор подстанций"
                    title="Редактор подстанций"
                    className="mr-1 rounded-md p-2 text-slate-300 transition hover:bg-slate-600 hover:text-white"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 0 1-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 0 1 .947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 0 1 2.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 0 1 2.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 0 1 .947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 0 1-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 0 1-2.287-.947ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
