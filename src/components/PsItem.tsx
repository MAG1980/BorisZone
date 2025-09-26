import type { Ps } from '../data/types/ps'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

export const PsItem = ({ ps }: { ps: Ps }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: ps.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="flex justify-center items-center bg-cyan-300 text-blue-800 text-pretty p-1 rounded-md  min-h-[80px]"
    >
      {ps.name}
    </div>
  )
}
