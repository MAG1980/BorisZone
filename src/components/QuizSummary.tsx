import { scorePercent } from '@/lib/quiz'
import { actionBtnClass } from '@/lib/uiClasses'
import { cn } from '@/lib/utils'

interface Props {
  /** Всего вопросов в викторине. */
  total: number
  /** Правильных ответов. */
  correctCount: number
  onRestart: () => void
  onClose: () => void
}

/** Оценка результата: цвет и текст зависят от доли правильных ответов. */
const verdict = (percent: number) => {
  if (percent === 100) {
    return { text: 'ни одной ошибки', className: 'text-teal-300' }
  }
  if (percent >= 80) {
    return { text: 'хороший результат', className: 'text-teal-300' }
  }
  if (percent >= 50) {
    return { text: 'есть над чем поработать', className: 'text-yellow-300' }
  }
  return { text: 'стоит повторить районы зоны', className: 'text-red-300' }
}

/** Итоговый экран викторины: счёт, процент и кнопки перезапуска/закрытия. */
export const QuizSummary = ({
  total,
  correctCount,
  onRestart,
  onClose,
}: Props) => {
  const percent = scorePercent(correctCount, total)
  const { text, className } = verdict(percent)

  return (
    <div className="flex grow flex-col items-center justify-center gap-4 p-6">
      <h3 className="text-2xl font-bold text-white">Викторина пройдена</h3>
      <p className="text-5xl font-bold text-white">
        {correctCount}
        <span className="text-slate-400"> / {total}</span>
      </p>
      <p className={cn('text-xl font-semibold', className)}>
        {percent}% верных ответов — {text}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button className={actionBtnClass} onClick={onRestart}>
          Пройти заново
        </button>
        <button
          className={cn(actionBtnClass, 'bg-slate-600 hover:bg-slate-500')}
          onClick={onClose}
        >
          Закрыть
        </button>
      </div>
    </div>
  )
}
