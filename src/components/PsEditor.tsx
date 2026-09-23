import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import type { PsList } from '@/data/types/psList'
import type { ResList } from '@/data/types/res'
import type { ZoneList } from '@/data/types/zone'
import { savePsList } from '@/lib/psDb'

interface PsEditorProps {
  /** Редактируемый список подстанций (все зоны). */
  initialList: PsList
  /** Все РЭС — для выбора района у подстанции и фильтра по РЭС. */
  resList: ResList
  /** Все зоны — для фильтра по зоне. */
  zonesList: ZoneList
  /** Зона, из которой открыт редактор (значение фильтра по зоне по умолчанию). */
  zoneId?: number
  /**
   * Вызывается, когда ПС добавить некуда: в выбранной зоне нет ни одного РЭС.
   * App открывает редактор районов для этой зоны.
   */
  onRequestEditRes: (zoneId?: number) => void
  onSaved: (list: PsList) => void
  onClose: () => void
}

const nextId = (list: PsList): number =>
  list.reduce((max, ps) => Math.max(max, ps.id), 0) + 1

export const PsEditor = ({
  initialList,
  resList,
  zonesList,
  zoneId,
  onRequestEditRes,
  onSaved,
  onClose,
}: PsEditorProps) => {
  const [list, setList] = useState<PsList>(initialList)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastAddedId, setLastAddedId] = useState<number | null>(null)
  const lastRowRef = useRef<HTMLInputElement>(null)
  /** Фильтр по зоне: null — все зоны (по умолчанию — зона, из которой открыт редактор). */
  const [filterZoneId, setFilterZoneId] = useState<number | null>(
    zoneId ?? null
  )
  /** Фильтр по РЭС: null — все РЭС выбранной зоны. */
  const [filterResId, setFilterResId] = useState<number | null>(null)

  /** РЭС, доступные в фильтре: при выбранной зоне — только РЭС этой зоны. */
  const filterResOptions =
    filterZoneId === null
      ? resList
      : resList.filter((res) => res.zoneId === filterZoneId)

  /** id РЭС, попадающих под фильтр по зоне. */
  const zoneResIds = new Set(filterResOptions.map((res) => res.id))

  /** Подстанции с учётом фильтров по зоне и РЭС. */
  const visibleList = list.filter((ps) => {
    if (filterResId !== null) return ps.resId === filterResId
    if (filterZoneId !== null) return zoneResIds.has(ps.resId)
    return true
  })

  /** Выбран ли хотя бы один фильтр (для счётчика и пустого состояния). */
  const filterActive = filterZoneId !== null || filterResId !== null

  /** Смена фильтра по зоне сбрасывает фильтр по РЭС: он относится к другой зоне. */
  const handleZoneFilterChange = (nextZoneId: number | null) => {
    setFilterZoneId(nextZoneId)
    setFilterResId(null)
  }

  const updateField = (
    id: number,
    field: 'name' | 'resId',
    value: string | number
  ) => {
    setList((prev) =>
      prev.map((ps) => (ps.id === id ? { ...ps, [field]: value } : ps))
    )
  }

  const addRow = () => {
    // РЭС для новой ПС: выбранный в фильтре, иначе — первый РЭС под фильтром по зоне.
    const resId = filterResId ?? filterResOptions[0]?.id
    // В выбранной зоне нет ни одного РЭС: добавлять ПС некуда — открываем
    // редактор районов, чтобы сначала создать район в этой зоне.
    if (resId === undefined) {
      onRequestEditRes(filterZoneId ?? undefined)
      return
    }
    const id = nextId(list)
    // Сбрасываем фильтр по РЭС, иначе добавленная строка может быть не видна.
    setFilterResId(null)
    setList((prev) => [...prev, { id, name: '', resId }])
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
    setList((prev) => prev.filter((ps) => ps.id !== id))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const cleaned = list.filter((ps) => ps.name.trim() !== '')
      await savePsList(cleaned)
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
          <h2 className="text-2xl font-bold text-white">Редактор подстанций</h2>
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="ps-editor-zone-filter"
              className="text-lg font-semibold text-white"
            >
              Зона:
            </label>
            <select
              id="ps-editor-zone-filter"
              value={filterZoneId ?? ''}
              onChange={(e) =>
                handleZoneFilterChange(
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
            <label
              htmlFor="ps-editor-res-filter"
              className="text-lg font-semibold text-white"
            >
              РЭС:
            </label>
            <select
              id="ps-editor-res-filter"
              value={filterResId ?? ''}
              onChange={(e) =>
                setFilterResId(
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              className="rounded-lg border border-white/10 bg-slate-700 px-3 py-2 text-lg font-semibold text-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Все РЭС</option>
              {filterResOptions.map((res) => (
                <option key={res.id} value={res.id}>
                  {res.name}
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

        {error && (
          <div className="bg-red-600 text-white px-4 py-2">{error}</div>
        )}

        <div className="overflow-auto grow p-4">
          <table className="w-full text-white text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800">
              <tr>
                <th className="p-2 w-16">ID</th>
                <th className="p-2">Название подстанции</th>
                <th className="p-2">Район электрической сети</th>
                <th className="p-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {visibleList.map((ps) => (
                <tr
                  key={ps.id}
                  className={clsx(
                    'border-t border-slate-700',
                    ps.id === lastAddedId && 'bg-slate-700'
                  )}
                >
                  <td className="p-2">{ps.id}</td>
                  <td className="p-2">
                    <input
                      ref={ps.id === lastAddedId ? lastRowRef : undefined}
                      className="w-full bg-slate-700 rounded px-2 py-1 text-white"
                      value={ps.name}
                      onChange={(e) =>
                        updateField(ps.id, 'name', e.target.value)
                      }
                    />
                  </td>
                  <td className="p-2">
                    <select
                      className="w-full bg-slate-700 rounded px-2 py-1 text-white"
                      value={ps.resId}
                      onChange={(e) =>
                        updateField(ps.id, 'resId', Number(e.target.value))
                      }
                    >
                      {resList.map((res) => (
                        <option key={res.id} value={res.id}>
                          {res.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <button
                      className="text-red-400 hover:text-red-300"
                      onClick={() => removeRow(ps.id)}
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
            + Добавить
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
