import { ZoneSelect } from './ZoneSelect.tsx'
import { EditMenu } from './EditMenu.tsx'
import { ErrorCounter } from './ErrorCounter.tsx'
import { useIsMobile } from '@/lib/useIsMobile'
import type { ZoneList } from '@/data/types/zone'

interface Props {
  zonesList: ZoneList
  activeZoneId: number | null
  onZoneChange: (zoneId: number) => void
  onShuffle: () => void
  onOrder: () => void
  onFillAnswers: () => void
  onEditPs: (zoneId?: number) => void
  onEditRes: () => void
  onResetDb: () => void
  errorCount: number | null
  onResetErrors: () => void
}

/** Общая адаптивная стилизация кнопок действия в тулбаре. */
const actionBtnClass =
  'rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-500 active:scale-95 sm:px-4 sm:text-base md:text-lg'

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
  // На мобильных устройствах редактирование недоступно — скрываем кнопки.
  const isMobile = useIsMobile()

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-800/60 p-2 shadow-lg ring-1 ring-white/10 sm:gap-4 sm:p-3">
      <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <ZoneSelect
            zonesList={zonesList}
            activeZoneId={activeZoneId}
            onChange={onZoneChange}
            onEditPs={onEditPs}
            editEnabled={!isMobile}
          />
          <button className={actionBtnClass} onClick={onShuffle}>
            Перемешать
          </button>
          <button className={actionBtnClass} onClick={onOrder}>
            Расставить по порядку
          </button>
          <button className={actionBtnClass} onClick={onFillAnswers}>
            Заполнить правильными ответами
          </button>
          {!isMobile && (
            <EditMenu
              onEditPs={onEditPs}
              onEditRes={onEditRes}
              onResetDb={onResetDb}
            />
          )}
        </div>
        {!!errorCount && (
          <ErrorCounter errorCount={errorCount} onReset={onResetErrors} />
        )}
      </div>
    </div>
  )
}
