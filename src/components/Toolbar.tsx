import { ZoneSelect } from './ZoneSelect.tsx'
import { EditMenu } from './EditMenu.tsx'
import { ErrorCounter } from './ErrorCounter.tsx'
import { HintTooltip } from './HintTooltip.tsx'
import type { Ps } from '@/data/types/ps'
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
  activePs: Ps | null
  activePsResName: string
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
  activePs,
  activePsResName,
}: Props) => {
  return (
    <div className="flex justify-between items-center h-[7vh]">
      <div className="flex gap-4 items-center">
        <ZoneSelect
          zonesList={zonesList}
          activeZoneId={activeZoneId}
          onChange={onZoneChange}
        />
        <div className="flex gap-2">
          <button
            className="text-3xl font-bold text-white bg-blue-600 px-4 py-3"
            onClick={onShuffle}
          >
            Перемешать
          </button>
          <button
            className="text-3xl font-bold text-white bg-blue-600 px-4 py-3"
            onClick={onOrder}
          >
            Расставить по порядку
          </button>
          <button
            className="text-3xl font-bold text-white bg-blue-600 px-4 py-3"
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

      <div>
        {activePs && (
          <HintTooltip activePs={activePs} resName={activePsResName} />
        )}
      </div>
    </div>
  )
}
