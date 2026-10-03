import { useEffect, useReducer } from 'react'
import type { ResList } from '@/data/types/res'
import {
  createQuizState,
  currentQuestion,
  quizReducer,
  type QuizQuestion,
} from '@/lib/quiz'
import { actionBtnClass } from '@/lib/uiClasses'
import { cn } from '@/lib/utils'
import { QuizSummary } from './QuizSummary.tsx'

interface Props {
  /** Название активной зоны — показывается в шапке. */
  zoneName: string
  /** Перемешанные ПС активной зоны (см. buildQuizQuestions). */
  questions: QuizQuestion[]
  /** РЭС активной зоны — варианты ответа. */
  resOptions: ResList
  onClose: () => void
}

/**
 * Викторина в пределах активной зоны: показывается подстанция, нужно выбрать
 * её район из кнопок со всеми РЭС зоны. Ответ проверяется сразу, после
 * последнего вопроса выводится результат. Игровое поле и счётчик ошибок
 * викторина не трогает — у неё собственный протокол.
 */
export const Quiz = ({ zoneName, questions, resOptions, onClose }: Props) => {
  const [state, dispatch] = useReducer(quizReducer, questions, createQuizState)

  // Escape закрывает викторину (как в PsHint и ZoneSelect).
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const question = currentQuestion(state)
  const total = state.questions.length
  const answered = state.kind === 'question' && state.chosenResId !== null
  const chosenResId = state.kind === 'question' ? state.chosenResId : null
  const isCorrect =
    answered && question !== null && question.resId === chosenResId
  const isLast = state.kind === 'question' && state.index === total - 1

  /** Прогресс в шапке: номер текущего вопроса или итоговая длина. */
  const progressLabel =
    state.kind === 'question'
      ? `Вопрос ${state.index + 1} из ${total}`
      : `Вопросов: ${total}`

  /** Подпись под вариантами: пока не отвечено — приглашение, после — разбор. */
  const feedback = !answered
    ? { text: 'Выберите район', className: 'text-slate-300' }
    : isCorrect
      ? { text: 'Верно!', className: 'text-teal-300' }
      : {
          text: `Неверно. Правильный ответ: ${question?.resName ?? ''}`,
          className: 'text-red-300',
        }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-600 p-4">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-white">Викторина</h2>
            <p className="text-sm text-slate-300">{zoneName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-white">
              {progressLabel}
            </span>
            <button
              className={cn(actionBtnClass, 'bg-slate-600 hover:bg-slate-500')}
              onClick={onClose}
            >
              Закрыть
            </button>
          </div>
        </div>

        {state.kind === 'finished' || question === null ? (
          <QuizSummary
            total={total}
            correctCount={state.correctCount}
            onRestart={() => dispatch({ type: 'restart' })}
            onClose={onClose}
          />
        ) : (
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
                      onClick={() =>
                        dispatch({ type: 'answer', resId: res.id })
                      }
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
              <button
                className={cn(
                  actionBtnClass,
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
                disabled={!answered}
                onClick={() => dispatch({ type: 'next' })}
              >
                {isLast ? 'Результат' : 'Далее'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
