import type { MouseEvent } from 'react'
import { clsx } from 'clsx'
import { Droppable } from './Droppable.tsx'
import { PsItem } from './PsItem.tsx'
import type { Res } from '@/data/types/res'
import type { Ps } from '@/data/types/ps'

interface Props {
  res: Res
  psList: Ps[]
  answers: Ps[]
  activePsId: number | null
  onShowHint?: (ps: Ps, e: MouseEvent) => void
}

/** Колонка одного РЭС: заголовок и зона для перетаскивания подстанций. */
export const ResColumn = ({
  res,
  psList,
  answers,
  activePsId,
  onShowHint,
}: Props) => {
  const matches =
    !!psList.length &&
    psList.length === answers.length &&
    psList.every((ps) => answers.includes(ps))

  return (
    <div
      className={clsx(
        'flex flex-col w-[460px] bg-blue-500 rounded-lg p-3 gap-2',
        matches && 'bg-teal-500'
      )}
    >
      <div className="flex justify-center items-center px-2 py-3 ">
        {res.name}
      </div>
      <Droppable id={String(res.id)} className={'grow p-1 rounded-lg bg-white'}>
        <div className="flex flex-wrap gap-1  rounded-lg  ">
          {psList.map((ps) => (
            <PsItem
              key={ps.id}
              ps={ps}
              variant={ps.resId === res.id ? 'success' : 'danger'}
              active={ps.id === activePsId}
              onShowHint={onShowHint}
            />
          ))}
        </div>
      </Droppable>
    </div>
  )
}
