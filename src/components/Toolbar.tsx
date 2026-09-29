import { ZoneSelect } from './ZoneSelect.tsx'
import { EditMenu } from './EditMenu.tsx'
import { ErrorCounter } from './ErrorCounter.tsx'
import { useIsMobile } from '@/lib/useIsMobile'
import { actionBtnClass } from '@/lib/uiClasses'
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

/**
 * Верхняя панель: выбор зоны, действия, меню редактирования, счётчик ошибок и подсказка.
 * На мобильных (<768px) остаётся только выбор зоны — действия, редактирование
 * и счётчик ошибок по-прежнему недоступны.
 */
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
  const isMobile = useIsMobile()

  return (
    <>
      {/* Мобильные (<768px): только выбор зоны, остальные действия недоступны.
          sm:-классы ZoneSelect переопределены, иначе на 640–767px селект
          перестал бы растягиваться (там sm:w-auto + sm:min-w-[17rem]). */}
      <div className="flex shrink-0 items-center rounded-xl bg-slate-800/60 p-2 shadow-lg ring-1 ring-white/10 md:hidden [&_button]:w-full [&>div]:w-full sm:[&_button]:w-auto sm:[&>div]:w-auto">
        <ZoneSelect
          zonesList={zonesList}
          activeZoneId={activeZoneId}
          onChange={onZoneChange}
          onEditPs={onEditPs}
          editEnabled={false}
        />
      </div>

      {/* Десктоп (≥768px): полный тулбар. */}
      <div className="hidden shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-800/60 p-2 shadow-lg ring-1 ring-white/10 sm:gap-4 sm:p-3 md:flex">
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
    </>
  )
}
