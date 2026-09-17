import { ZoneSelect } from './ZoneSelect.tsx'
import { EditMenu } from './EditMenu.tsx'
import { ErrorCounter } from './ErrorCounter.tsx'
import type { ZoneList } from '@/data/types/zone'

interface Props {
  zonesList: ZoneList
  activeZoneId: number | null
  onZoneChange: (zoneId: number) => void
  onShuffle: () => void
  onOrder: () => void
  onFillAnswers: () => void
  onEditPs: () => void
  onEditRes: () => void
  onResetDb: () => void
  errorCount: number | null
  onResetErrors: () => void
}

/** Верхняя панель: выбор зоны, действия, меню редактирования, счётчик ошибок и подсказка. */
export const Toolbar = ({
  zonesList,
  activeZoneId,
  onZoneChange,
  onShuffle,
  onOrder,
  onFillAnswers,
  onEditPs,
  onEditRes,
  onResetDb,
  errorCount,
  onResetErrors,
}: Props) => {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-800/60 p-3 shadow-lg ring-1 ring-white/10">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <ZoneSelect
            zonesList={zonesList}
            activeZoneId={activeZoneId}
            onChange={onZoneChange}
            onEditPs={onEditPs}
          />
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-lg font-semibold text-white shadow transition hover:bg-blue-500 active:scale-95"
            onClick={onShuffle}
          >
            Перемешать
          </button>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-lg font-semibold text-white shadow transition hover:bg-blue-500 active:scale-95"
            onClick={onOrder}
          >
            Расставить по порядку
          </button>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-lg font-semibold text-white shadow transition hover:bg-blue-500 active:scale-95"
            onClick={onFillAnswers}
          >
            Заполнить правильными ответами
          </button>
          <EditMenu
            onEditPs={onEditPs}
            onEditRes={onEditRes}
            onResetDb={onResetDb}
          />
        </div>
        {!!errorCount && (
          <ErrorCounter errorCount={errorCount} onReset={onResetErrors} />
        )}
      </div>
    </div>
  )
}
