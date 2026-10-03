import type { ResList } from '@/data/types/res'
import type { QuizQuestion } from '@/lib/quiz'
import { actionBtnClass } from '@/lib/uiClasses'
import { cn } from '@/lib/utils'

interface Props {
  question: QuizQuestion
  /** РЭС активной зоны — варианты ответа. */
  resOptions: ResList
  /** Выбранный ответ; null — ответ ещё не дан. */
  chosenResId: number | null
  onAnswer: (resId: number) => void
  onNext: () => void
}

/**
 * Текущий вопрос викторины: подстанция и кнопки со всеми РЭС зоны.
 * После верного ответа кнопка «Далее» не нужна — переход выполняет
 * родитель (автопереход), поэтому она показывается только после промаха,
 * чтобы пользователь успел прочитать правильный ответ.
 */
export const QuizQuestionView = ({
  question,
  resOptions,
  chosenResId,
  onAnswer,
  onNext,
}: Props) => {
  const answered = chosenResId !== null
  const isCorrect = answered && chosenResId === question.resId

  /** Подпись под вариантами: приглашение, подтверждение или разбор промаха. */
  const feedback = !answered
    ? { text: 'Выберите район', className: 'text-slate-300' }
    : isCorrect
      ? { text: 'Верно! Следующий вопрос…', className: 'text-teal-300' }
      : {
          text: `Неверно. Правильный ответ: ${question.resName}`,
          className: 'text-red-300',
        }

  return (
    <>
      <div className="grow overflow-auto p-4 text-left">
        <p className="text-sm font-semibold tracking-wide text-slate-400 uppercase">
          К какому РЭС относится подстанция?
        </p>
        <p className="mt-2 text-2xl font-bold text-white md:text-3xl">
          {question.psName}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
          {resOptions.map((res) => {
            const isChosen = chosenResId === res.id
            const isRight = answered && res.id === question.resId
            return (
              <button
                key={res.id}
                type="button"
                disabled={answered}
                onClick={() => onAnswer(res.id)}
                className={cn(
                  actionBtnClass,
                  'w-full',
                  isRight && 'bg-teal-600 hover:bg-teal-600',
                  isChosen && !isRight && 'bg-red-600 hover:bg-red-600',
                  answered && !isRight && !isChosen && 'opacity-50'
                )}
              >
                {res.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-600 p-4">
        <p className={cn('text-lg font-semibold', feedback.className)}>
          {feedback.text}
        </p>
        {answered && !isCorrect && (
          <button className={actionBtnClass} onClick={onNext}>
            Далее
          </button>
        )}
      </div>
    </>
  )
}
