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
    <div className="flex min-h-0 flex-1 flex-col gap-2 md:flex-row">
      <DragOverlay>
        {/*Компонент, который отображается в процессе перетаскивания.*/}
        {activePs ? <PsItem ps={activePs} /> : null}
      </DragOverlay>
      {/* Блок РЭС — grid на любом разрешении: высота строк всегда по контенту
          (auto-rows-min), поэтому блок занимает ровно столько, сколько занимают
          колонки. На мобильных 3 колонки в ряд, от 768px — md:grid-cols-2:
          2 колонки шириной до 460px, для чего блок просит 940px (2 × 460px +
          gap-1 + p-2) и сжимается только при нехватке места — справа размещается
          список подстанций (md:flex-row у контейнера поля). От 768px колонки
          выравниваются по высоте соседа по строке (выравнивание по умолчанию,
          align-items: stretch), поэтому в ряду нет «рваного» низа: низкая
          ResColumn добирает высоту до самой высокой. От 768px блок занимает всю
          высоту строки и прокручивается внутри себя (md:overflow-y-auto): если РЭС
          в зоне больше, чем помещается по высоте, нижние ряды не обрезаются,
          а доступны через прокрутку. */}
      <div className="grid grid-cols-3 auto-rows-min grow-0 shrink-0 basis-auto gap-1 p-2 text-white md:basis-[940px] md:shrink md:grid-cols-2 md:overflow-y-auto">
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

      {/* Список подстанций (все ПС зоны). На мобильных — под блоком РЭС и
          забирает остаток высоты, поэтому сжимается первым и прокручивается
          внутри себя, а блок РЭС всегда виден целиком. От 768px — справа от
          блока РЭС: держит минимум 22rem (md:basis-[22rem] + md:shrink-0) и
          добирает всю ширину, оставшуюся после блока РЭС; высоту берёт по
          строке и прокручивает содержимое внутри себя. */}
      <Droppable
        id={'all'}
        className={
          'min-h-0 w-full grow basis-auto shrink overflow-auto p-2 bg-blue-800 rounded-lg md:shrink-0 md:basis-[22rem]'
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
