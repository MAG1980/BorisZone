import type { PropsWithChildren } from 'react'
import { useDraggable } from '@dnd-kit/core'

export const Draggable = ({ children }: PropsWithChildren) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable',
  })

  const style = transform
    ? {
        transform: `translate3D(${transform.x}ps, ${transform.y}px,0)`,
      }
    : undefined
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      Drag Me{children}
    </div>
  )
}
