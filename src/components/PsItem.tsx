import type { Ps } from '@/data/types/ps'
import { useDraggable } from '@dnd-kit/core'
import { clsx } from 'clsx'

interface Props {
  ps: Ps
  className?: string
  variant?: 'danger' | 'success' | 'default'
  active?: boolean
}

export const PsItem = ({
  ps,
  className,
  variant = 'default',
  active = false,
}: Props) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: ps.id,
  })

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  }

  const baseStyles = clsx(
    'flex justify-center items-center text-blue-800 text-pretty p-1 rounded-md max-w-[150px] min-h-[70px]',
    { 'bg-yellow-500': active }
  )

  const variants = {
    default: 'bg-cyan-300',
    danger: 'bg-red-500 text-white',
    success: 'bg-teal-500 text-white',
  }
  const classes = clsx('text-sm', baseStyles, variants[variant], className)

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={classes}
    >
      {ps.name}
    </div>
  )
}
