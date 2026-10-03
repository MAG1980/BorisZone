import { useEffect, useReducer } from 'react'
import type { ResList } from '@/data/types/res'
import {
  createQuizState,
  currentAnswerIsCorrect,
  quizReducer,
  type QuizQuestion,
} from '@/lib/quiz'
import { shuffleArray } from '@/lib/shuffle'
import { actionBtnClass } from '@/lib/uiClasses'
import { cn } from '@/lib/utils'
import { QuizBreak } from './QuizBreak.tsx'
import { QuizQuestionView } from './QuizQuestion.tsx'
import { QuizSummary } from './QuizSummary.tsx'

/** Пауза перед автопереходом — чтобы пользователь увидел зелёный отклик. */
const CORRECT_ADVANCE_MS = 500

interface Props {
  /** Название активной зоны — показывается в шапке. */
  zoneName: string
  /** Все ПС активной зоны (список приходит уже перемешанным из App). */
  questions: QuizQuestion[]
  /** РЭС активной зоны — варианты ответа. */
  resOptions: ResList
  onClose: () => void
}

/**
 * Викторина в пределах активной зоны: показывается подстанция, нужно выбрать
 * её район из кнопок со всеми РЭС зоны. Верный ответ уводит к следующему
 * вопросу автоматически, промах — по кнопке «Далее». Вопросы, где были
 * ошибки, повторяются кругами, пока весь круг не пройдёт без ошибок.
 * Игровое поле и счётчик ошибок игры викторина не трогает — у неё свой счёт.
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

  // Верный ответ не требует нажатия «Далее»: ждём короткую паузу и переходим
  // сами. Пока ответ не выбран или он неверный — таймер не запускается.
  const advanceAfterCorrect = currentAnswerIsCorrect(state)
  useEffect(() => {
    if (!advanceAfterCorrect) return
    const timer = window.setTimeout(
      () => dispatch({ type: 'next' }),
      CORRECT_ADVANCE_MS
    )
    return () => window.clearTimeout(timer)
  }, [advanceAfterCorrect])

  /** Прогресс в шапке: круг и номер вопроса, итог круга или число кругов. */
  const progressLabel =
    state.kind === 'question'
      ? [
          state.round > 1 ? `Круг ${state.round}` : null,
          `Вопрос ${state.index + 1} из ${state.questions.length}`,
        ]
          .filter(Boolean)
          .join(' · ')
      : state.kind === 'intermediate'
        ? `Круг ${state.round} пройден`
        : `Кругов: ${state.rounds}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-600 p-4">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-white">Викторина</h2>
            <p className="text-sm text-slate-300">{zoneName}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Счётчик неправильных ответов за викторину (как ErrorCounter игры). */}
            <span className="text-sm font-bold text-white md:text-base">
              Ошибки:
              <span className="ml-1 rounded-full bg-white px-2 py-1 text-base text-red-500">
                {state.wrongCount}
              </span>
            </span>
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

        {state.kind === 'question' && (
          <QuizQuestionView
            question={state.questions[state.index]}
            resOptions={resOptions}
            chosenResId={state.chosenResId}
            onAnswer={(resId) => dispatch({ type: 'answer', resId })}
            onNext={() => dispatch({ type: 'next' })}
          />
        )}

        {state.kind === 'intermediate' && (
          <QuizBreak
            round={state.round}
            pendingCount={state.pending.length}
            onContinue={() =>
              dispatch({
                type: 'continue',
                questions: shuffleArray(state.pending),
              })
            }
            onClose={onClose}
          />
        )}

        {state.kind === 'finished' && (
          <QuizSummary
            total={questions.length}
            rounds={state.rounds}
            wrongCount={state.wrongCount}
            everWrongCount={state.everWrongIds.length}
            onRestart={() =>
              dispatch({ type: 'restart', questions: shuffleArray(questions) })
            }
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}
