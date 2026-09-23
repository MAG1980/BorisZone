import type { MouseEvent } from 'react'
import { DragOverlay } from '@dnd-kit/core'
import { Droppable } from './Droppable.tsx'
import { PsItem } from './PsItem.tsx'
import { ResColumn } from './ResColumn.tsx'
import type { Ps } from '@/data/types/ps'
import type { ResList } from '@/data/types/res'

interface Props {
  zoneRes: ResList
  psList: Record<string, Ps[]>
  answers: Record<string, Ps[]>
  activePs: Ps | null
  onShowHint?: (ps: Ps, e: MouseEvent) => void
}

/** Игровое поле: колонки РЭС и нижний контейнер «all». */
export const GameBoard = ({
  zoneRes,
  psList,
  answers,
  activePs,
  onShowHint,
}: Props) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <DragOverlay>
        {/*Компонент, который отображается в процессе перемещения.*/}
        {activePs ? <PsItem ps={activePs} /> : null}
      </DragOverlay>
      <div className="flex min-h-0 flex-1 content-start justify-center flex-wrap gap-1 overflow-auto p-2 text-white">
        {zoneRes.map((res) => (
          <ResColumn
            key={res.id}
            res={res}
            psList={psList[String(res.id)] ?? []}
            answers={answers[String(res.id)] ?? []}
            activePsId={activePs?.id ?? null}
            onShowHint={onShowHint}
          />
        ))}
      </div>

      <Droppable
        id={'all'}
        className={
          'max-h-[35%] w-full shrink-0 overflow-auto p-2 bg-blue-800 rounded-lg'
        }
      >
        <div className="flex justify-center flex-wrap gap-1">
          {psList.all.map((ps) => (
            <PsItem
              key={ps.id}
              ps={ps}
              active={ps.id === activePs?.id}
              onShowHint={onShowHint}
            />
          ))}
        </div>
      </Droppable>
    </div>
  )
}
