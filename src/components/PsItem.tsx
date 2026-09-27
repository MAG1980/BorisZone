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
 * Стили чипа: базис — доля строки минус половина зазора, поэтому в ряд
 * всегда помещается целое число чипов без переполнения.
 * 320–359px — половина строки: 2 чипа в ряд (подписи не рвутся).
 * От 360px — треть строки: 3 чипа в ряд (≈122px при viewport 425px,
 * ≈105px в самой узкой колонке РЭС на 768px).
 * grow дотягивает неполный ряд до краёв. Уменьшенный шрифт и перенос
 * длинных слов.
 * В диапазоне 320–767px отступы чипа увеличены до p-2, а высота уменьшена
 * до min-h-[48px] (на десктопе — p-1 и min-h-[70px]).
 *
 * На десктопе (≥768px) ширина не фиксированная 140px, а потолок
 * md:max-w-[140px] сохраняет прежний вид на широких экранах.
 */
export const psItemCompactClass =
  'basis-[calc(50%_-_0.25rem)] min-[360px]:basis-[calc(33.333%_-_0.25rem)] grow min-w-0 break-words text-xs md:text-sm md:w-auto md:max-w-[140px]'

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
    'flex justify-center items-center text-blue-800 text-pretty p-2 md:p-1 rounded-md w-[140px] min-h-[48px] md:min-h-[70px]',
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
