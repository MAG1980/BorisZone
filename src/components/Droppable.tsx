import type { FC, ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'

interface DroppableProps {
  id: string
  className: string
  children: ReactNode
}

export const Droppable: FC<DroppableProps> = ({ id, className, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id })
  const style = {
    opacity: isOver ? 0.5 : 1,
  }
  return (
    <div ref={setNodeRef} className={className} style={style}>
      {children}
    </div>
  )
}
