import { useEffect } from 'react'

/** Через сколько миллисекунд подсказка закроется автоматически. */
const AUTO_CLOSE_MS = 3000

interface Props {
  psName: string
  resName: string
  /** Координаты курсора (clientX/clientY) в момент вызова. */
  x: number
  y: number
  onClose: () => void
}

/** Всплывающая подсказка с названием РЭС. Появляется по ПКМ у курсора. */
export const PsHint = ({ psName, resName, x, y, onClose }: Props) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    // Закрываем при скролле (capture — ловим и внутренние скроллы).
    const handleScroll = () => onClose()
    // Закрываем по клику в любом месте. ПКМ не порождает click, поэтому
    // сама подсказка не закроется в момент открытия.
    const handleClick = () => onClose()
    // Автозакрытие через AUTO_CLOSE_MS.
    const timer = window.setTimeout(onClose, AUTO_CLOSE_MS)

    window.addEventListener('keydown', handleKey)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('click', handleClick)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('click', handleClick)
    }
  }, [onClose])

  return (
    <div
      role="tooltip"
      className="fixed z-50 max-w-xs rounded-md bg-blue-600 px-4 py-3 text-white shadow-lg"
      style={{ left: x, top: y }}
    >
      <p className="text-xl font-bold">{resName}</p>
      <p className="text-sm opacity-80">{psName}</p>
    </div>
  )
}
