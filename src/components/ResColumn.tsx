import type { MouseEvent } from 'react'
import { clsx } from 'clsx'
import { useIsMobile } from '@/lib/useIsMobile'
import { Droppable } from './Droppable.tsx'
import { PsItem, psItemCompactClass } from './PsItem.tsx'
import type { Res } from '@/data/types/res'
import type { Ps } from '@/data/types/ps'

interface Props {
  res: Res
  psList: Ps[]
  answers: Ps[]
  activePsId: number | null
  onShowHint?: (ps: Ps, e: MouseEvent) => void
}

/** Колонка одного РЭС: заголовок и зона для перетаскивания подстанций. Ширину задаёт grid-контейнер в GameBoard: на мобильных (<768px) 3 колонки в ряд, на ≥768px — 2 колонки шириной до 460px, поэтому собственных ограничений по ширине у колонки нет. Высота — по строке сетки: от 768px колонка растягивается до высоты соседа по строке (выравнивание по умолчанию, align-items: stretch), поэтому в ряду нет «рваного» низа; белую зону дропа забирает остаток высоты (grow), и она держит минимум в один чип (md:min-h-[70px]), чтобы даже пустое РЭС можно было принять подстанцию. Отступ колонки — p-2 (на десктопе — p-3), а колонка не выпускает содержимое за свои границы, поэтому все РЭС зоны видны одновременно. Минимальная высота колонки совпадает с высотой чипа PsItem: min-h-[48px] до 768px и min-h-[70px] на десктопе; название РЭС полностью помещается внутрь колонки. */
export const ResColumn = ({
  res,
  psList,
  answers,
  activePsId,
  onShowHint,
}: Props) => {
  const isMobile = useIsMobile()

  const matches =
    !!psList.length &&
    psList.length === answers.length &&
    psList.every((ps) => answers.includes(ps))

  return (
    <div
      className={clsx(
        'flex flex-col min-h-[48px] md:min-h-[70px] overflow-hidden bg-blue-500 rounded-lg p-2 gap-2 md:p-3',
        matches && 'bg-teal-500'
      )}
    >
      <div className="flex min-h-0 justify-center items-center overflow-hidden px-1 py-1 text-[10px] leading-tight break-words text-center md:px-2 md:py-3 md:text-base">
        {res.name}
      </div>
      {/* На мобильных (< 768px) зона дропа с чипами не отображается.
          min-h — высота одного чипа: колонка больше не растягивается
          по самой высокой в строке, и без этого минимума у пустого РЭС
          не осталось бы заметной зоны для перетаскивания. */}
      {!isMobile && (
        <Droppable
          id={String(res.id)}
          className={'grow p-1 rounded-lg bg-white md:min-h-[70px]'}
        >
          <div className="flex flex-wrap justify-center gap-1 rounded-lg">
            {psList.map((ps) => (
              <PsItem
                key={ps.id}
                ps={ps}
                variant={ps.resId === res.id ? 'success' : 'danger'}
                active={ps.id === activePsId}
                onShowHint={onShowHint}
                className={psItemCompactClass}
              />
            ))}
          </div>
        </Droppable>
      )}
    </div>
  )
}
