import type { MouseEvent } from 'react'
import type { Ps } from '@/data/types/ps'
import { useDraggable } from '@dnd-kit/core'
import { clsx } from 'clsx'
import { cn } from '@/lib/utils'

interface Props {
  ps: Ps
  className?: string
  variant?: 'danger' | 'success' | 'default'
  active?: boolean
  /** Вызывается по ПКМ, чтобы показать подсказку с названием РЭС. */
  onShowHint?: (ps: Ps, e: MouseEvent) => void
}

/**
 * Компактные стили чипа для мобильных: не шире половины строки (по 2 чипа
 * в ряд), уменьшенный шрифт и перенос длинных слов. На десктопе отключаются.
 */
export const psItemCompactClass =
  'max-w-[calc(50%_-_0.125rem)] md:max-w-none min-w-0 break-words text-xs md:text-sm'

export const PsItem = ({
  ps,
  className,
  variant = 'default',
  active = false,
  onShowHint,
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
    'flex justify-center items-center text-blue-800 text-pretty p-1 rounded-md w-[140px] min-h-[70px]',
    { 'bg-yellow-500': active }
  )

  const variants = {
    default: 'bg-cyan-300',
    danger: 'bg-red-500 text-white',
    success: 'bg-teal-500 text-white',
  }
  const classes = cn('text-sm', baseStyles, variants[variant], className)

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={classes}
      onContextMenu={(e) => {
        if (!onShowHint) return
        e.preventDefault()
        onShowHint(ps, e)
      }}
    >
      {ps.name}
    </div>
  )
}
