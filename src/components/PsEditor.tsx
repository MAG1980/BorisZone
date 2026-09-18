import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import type { PsList } from '@/data/types/psList'
import type { ResList } from '@/data/types/res'
import { savePsList } from '@/lib/psDb'

interface PsEditorProps {
  initialList: PsList
  resList: ResList
  /** Название редактируемой зоны (для заголовка окна). */
  zoneName: string
  onSaved: (list: PsList) => void
  onClose: () => void
}

const nextId = (list: PsList): number =>
  list.reduce((max, ps) => Math.max(max, ps.id), 0) + 1

export const PsEditor = ({
  initialList,
  resList,
  zoneName,
  onSaved,
  onClose,
}: PsEditorProps) => {
  const [list, setList] = useState<PsList>(initialList)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastAddedId, setLastAddedId] = useState<number | null>(null)
  const lastRowRef = useRef<HTMLInputElement>(null)

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
    const id = nextId(list)
    const resId = resList[0]?.id ?? 0
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
        <div className="flex justify-between items-center p-4 border-b border-slate-600">
          <h2 className="text-2xl font-bold text-white">
            Редактор подстанций: {zoneName}
          </h2>
          <button
            className="text-white bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded"
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>

        {error && (
          <div className="bg-red-600 text-white px-4 py-2">{error}</div>
        )}

        <div className="overflow-auto grow p-4">
          <table className="w-full text-white text-left border-collapse">
            <thead className="sticky top-0 bg-slate-800">
              <tr>
                <th className="p-2 w-16">ID</th>
                <th className="p-2">Название (name)</th>
                <th className="p-2">Район (resId)</th>
                <th className="p-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((ps) => (
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
