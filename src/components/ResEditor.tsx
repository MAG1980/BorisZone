import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import type { ResList } from '@/data/types/res'
import type { ZoneList } from '@/data/types/zone'
import { saveResList } from '@/lib/psDb'

interface ResEditorProps {
  initialList: ResList
  zonesList: ZoneList
  /**
   * Зона, из которой открыт редактор: она выбирается в фильтре по зоне,
   * и в ней же создаются новые районы (если не задана — фильтр «Все зоны»).
   */
  initialZoneId?: number
  onSaved: (list: ResList) => void
  onClose: () => void
}

const nextId = (list: ResList): number =>
  list.reduce((max, res) => Math.max(max, res.id), 0) + 1

export const ResEditor = ({
  initialList,
  zonesList,
  initialZoneId,
  onSaved,
  onClose,
}: ResEditorProps) => {
  const [list, setList] = useState<ResList>(initialList)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastAddedId, setLastAddedId] = useState<number | null>(null)
  const lastRowRef = useRef<HTMLInputElement>(null)
  /** Фильтр по зоне: null — все зоны (по умолчанию — зона, из которой открыт редактор). */
  const [filterZoneId, setFilterZoneId] = useState<number | null>(
    initialZoneId ?? null
  )

  /** Зона, из которой открыт редактор. */
  const initialZone = zonesList.find((z) => z.id === initialZoneId) ?? null

  /** Есть ли в этой зоне районы (по текущему, ещё не сохранённому списку). */
  const hasZoneRes = list.some((res) => res.zoneId === initialZoneId)

  /**
   * Зона, о которой показываем подсказку «пока нет районов»: та, из которой
   * открыт редактор. Подсказка видна, только пока эта же зона выбрана в фильтре, —
   * при смене зоны она исчезает.
   */
  const noResHintZone =
    initialZone && filterZoneId === initialZone.id && !hasZoneRes
      ? initialZone
      : null

  /** Районы с учётом фильтра по зоне. */
  const visibleList =
    filterZoneId === null
      ? list
      : list.filter((res) => res.zoneId === filterZoneId)

  /** Выбран ли фильтр по зоне (для счётчика и пустого состояния). */
  const filterActive = filterZoneId !== null

  const updateName = (id: number, value: string) => {
    setList((prev) =>
      prev.map((res) => (res.id === id ? { ...res, name: value } : res))
    )
  }

  const updateZone = (id: number, zoneId: number) => {
    setList((prev) =>
      prev.map((res) => (res.id === id ? { ...res, zoneId } : res))
    )
  }

  const addRow = () => {
    const id = nextId(list)
    // Новый район относится к зоне, выбранной в фильтре.
    const zoneId = filterZoneId ?? zonesList[0]?.id ?? 0
    setList((prev) => [...prev, { id, name: '', zoneId }])
    setLastAddedId(id)
  }

  // Прокручиваем и фокусируем только что добавленную строку,
  // иначе она теряется в конце длинного списка.
  useEffect(() => {
    if (lastAddedId == null) return
    lastRowRef.current?.scrollIntoView({ block: 'nearest' })
    lastRowRef.current?.focus()
  }, [lastAddedId])

  const removeRow = (id: number) => {
    setList((prev) => prev.filter((res) => res.id !== id))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const cleaned = list.filter((res) => res.name.trim() !== '')
      await saveResList(cleaned)
      onSaved(cleaned)
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex flex-wrap justify-between items-center gap-3 p-4 border-b border-slate-600">
          <h2 className="text-2xl font-bold text-white">
            Редактор районов (РЭС)
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="res-editor-zone-filter"
              className="text-lg font-semibold text-white"
            >
              Зона:
            </label>
            <select
              id="res-editor-zone-filter"
              value={filterZoneId ?? ''}
              onChange={(e) =>
                setFilterZoneId(
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              className="rounded-lg border border-white/10 bg-slate-700 px-3 py-2 text-lg font-semibold text-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Все зоны</option>
              {zonesList.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
            <button
              className="text-white bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded"
              onClick={onClose}
            >
              Закрыть
            </button>
          </div>
        </div>

        {noResHintZone && (
          <div className="bg-amber-500/15 px-4 py-2 text-amber-200 border-b border-slate-600">
            В зоне «{noResHintZone.name}» пока нет районов электрических сетей.
            Добавьте район — он будет создан в этой зоне, затем сохраните
            изменения.
          </div>
        )}

        {error && (
          <div className="bg-red-600 text-white px-4 py-2">{error}</div>
        )}

        <div className="overflow-auto grow p-4">
          <table className="w-full text-white text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800">
              <tr>
                <th className="p-2 w-16">ID</th>
                <th className="p-2">Район электрической сети</th>
                <th className="p-2">Зона ОС ДС ЦУС</th>
                <th className="p-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {visibleList.map((res) => (
                <tr
                  key={res.id}
                  className={clsx(
                    'border-t border-slate-700',
                    res.id === lastAddedId && 'bg-slate-700'
                  )}
                >
                  <td className="p-2">{res.id}</td>
                  <td className="p-2">
                    <input
                      ref={res.id === lastAddedId ? lastRowRef : undefined}
                      className="w-full bg-slate-700 rounded px-2 py-1 text-white"
                      value={res.name}
                      onChange={(e) => updateName(res.id, e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <select
                      className="w-full bg-slate-700 rounded px-2 py-1 text-white"
                      value={res.zoneId}
                      onChange={(e) =>
                        updateZone(res.id, Number(e.target.value))
                      }
                    >
                      {zonesList.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <button
                      className="text-red-400 hover:text-red-300"
                      onClick={() => removeRow(res.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
              {filterActive && visibleList.length === 0 && (
                <tr>
                  <td className="p-2 text-slate-400" colSpan={4}>
                    Ничего не найдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center p-4 border-t border-slate-600">
          <button
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
            onClick={addRow}
          >
            + Добавить район
          </button>
          <div className="flex gap-2">
            <span className="text-slate-300 self-center">
              Всего: {list.length}
              {filterActive && ` · показано: ${visibleList.length}`}
            </span>
            <button
              className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded disabled:opacity-50"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
