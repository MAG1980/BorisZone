import { scorePercent } from '@/lib/quiz'
import { actionBtnClass } from '@/lib/uiClasses'
import { cn } from '@/lib/utils'

interface Props {
  /** Сколько всего вопросов (ПС) в зоне. */
  total: number
  /** Сколько кругов потребовалось, чтобы пройти викторину без ошибок. */
  rounds: number
  /** Всего неверных ответов за викторину (с учётом повторов). */
  wrongCount: number
  /** Сколько ПС ошибались хотя бы раз. */
  everWrongCount: number
  onRestart: () => void
  onClose: () => void
}

/** Оценка результата: цвет и текст зависят от доли ответов без ошибок. */
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

/** Итоговый экран: круги, ошибки и доля верных ответов с первого раза. */
export const QuizSummary = ({
  total,
  rounds,
  wrongCount,
  everWrongCount,
  onRestart,
  onClose,
}: Props) => {
  const firstTry = Math.max(total - everWrongCount, 0)
  const percent = scorePercent(firstTry, total)
  const { text, className } = verdict(percent)

  /** Строка статистики: подпись — значение. */
  const stats = [
    { label: 'Кругов', value: String(rounds) },
    { label: 'Ошибок всего', value: String(wrongCount) },
    {
      label: 'Верно с первого раза',
      value: `${firstTry} из ${total} (${percent}%)`,
    },
  ]

  return (
    <div className="flex grow flex-col items-center justify-center gap-4 p-6">
      <h3 className="text-2xl font-bold text-white">Викторина пройдена</h3>
      <dl className="flex flex-col gap-1 text-lg">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-6">
            <dt className="text-slate-300">{label}:</dt>
            <dd className="font-semibold text-white">{value}</dd>
          </div>
        ))}
      </dl>
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
