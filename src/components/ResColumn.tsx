import { clsx } from 'clsx'
import { Droppable } from './Droppable'
import { PsItem } from './PsItem'
import type { Res } from '@/data/types/res'
import type { Ps } from '@/data/types/ps'

interface Props {
  res: Res
  psList: Ps[]
  answers: Ps[]
  activePsId: number | null
  resNameById: (resId: number) => string
}

/** Колонка одного РЭС: заголовок и зона для перетаскивания подстанций. */
export const ResColumn = ({
  res,
  psList,
  answers,
  activePsId,
  resNameById,
}: Props) => {
  const matches =
    !!psList.length &&
    psList.length === answers.length &&
    psList.every((ps) => answers.includes(ps))

  return (
    <div
      className={clsx(
        'col-span-3 flex flex-col bg-blue-500 rounded-lg p-3 gap-2',
        matches && 'bg-teal-500'
      )}
    >
      <div className="flex justify-center items-center px-2 py-3 ">
        {res.name}
      </div>
      <Droppable id={res.name} className={'grow p-1 rounded-lg bg-white'}>
        <div className="grid grid-cols-4 gap-1  rounded-lg  ">
          {psList.map((ps) => (
            <PsItem
              key={ps.id}
              ps={ps}
              variant={
                resNameById(ps.resId) === res.name ? 'success' : 'danger'
              }
              active={ps.id === activePsId}
            />
          ))}
        </div>
      </Droppable>
    </div>
  )
}
