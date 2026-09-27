import type { MouseEvent } from 'react'
import { DragOverlay } from '@dnd-kit/core'
import { Droppable } from './Droppable.tsx'
import { PsItem, psItemCompactClass } from './PsItem.tsx'
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
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <DragOverlay>
        {/*Компонент, который отображается в процессе перемещения.*/}
        {activePs ? <PsItem ps={activePs} /> : null}
      </DragOverlay>
      {/* Верхний блок (колонки РЭС). Высота строго по контенту: строки равны
          высоте колонки (auto-rows-min), блок не растягивается (grow-0) и не
          сжимается (shrink-0), поэтому 3 РЭС занимают одну строку, 10 — четыре,
          и высота всегда равна списку РЭС. Всю оставшуюся высоту забирает
          нижний блок (grow). На десктопе — как прежде: перенос и вертикальная
          прокрутка. */}
      <div className="grid grid-cols-3 auto-rows-min md:auto-rows-auto grow-0 md:grow shrink-0 md:shrink basis-auto justify-center flex-wrap gap-1 p-2 text-white md:min-h-[120px] md:flex md:overflow-y-auto">
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

      {/* Нижний блок (all): забирает всю высоту, оставшуюся после блока РЭС
          (grow), поэтому подстраивается под число районов в зоне. min-h-0 +
          shrink позволяют сжаться, если содержимое не помещается. */}
      <Droppable
        id={'all'}
        className={
          'min-h-0 md:min-h-[120px] w-full grow basis-auto shrink overflow-auto p-2 bg-blue-800 rounded-lg'
        }
      >
        <div className="flex justify-center flex-wrap gap-1">
          {psList.all.map((ps) => (
            <PsItem
              key={ps.id}
              ps={ps}
              active={ps.id === activePs?.id}
              onShowHint={onShowHint}
              className={psItemCompactClass}
            />
          ))}
        </div>
      </Droppable>
    </div>
  )
}
