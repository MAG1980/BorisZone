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
  resNameById: (resId: number) => string
  onShowHint?: (ps: Ps, e: MouseEvent) => void
}

/** Игровое поле: колонки РЭС и нижний контейнер «all». */
export const GameBoard = ({
  zoneRes,
  psList,
  answers,
  activePs,
  resNameById,
  onShowHint,
}: Props) => {
  return (
    <div className="grid content-between grid-cols-12 auto-rows-max gap-3 h-[90vh]">
      <DragOverlay>
        {/*Компонент, который отображается в процессе перемещения.*/}
        {activePs ? <PsItem ps={activePs} /> : null}
      </DragOverlay>
      <div className="col-span-12 auto-rows-[minmax(232px,auto)] grid-cols-subgrid grid justify-around text-white gap-2">
        {zoneRes.map((res) => (
          <ResColumn
            key={res.name}
            res={res}
            psList={psList[res.name] ?? []}
            answers={answers[res.name] ?? []}
            activePsId={activePs?.id ?? null}
            resNameById={resNameById}
            onShowHint={onShowHint}
          />
        ))}
      </div>

      <Droppable
        id={'all'}
        className={'col-span-12 grid-cols-subgrid p-2 bg-blue-800 rounded-lg'}
      >
        <div className="grid grid-cols-16 gap-1">
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
