import type { Ps } from '../data/types/ps'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const PsItem = ({ ps }: { ps: Ps }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: ps.id })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="flex justify-center items-center bg-cyan-300 text-blue-800 text-pretty p-1 rounded-md"
    >
      {ps.name}
    </div>
  )
}
