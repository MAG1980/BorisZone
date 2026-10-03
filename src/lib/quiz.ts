import type { Ps } from '@/data/types/ps'
import type { ResList } from '@/data/types/res'
import { shuffleArray } from './shuffle'

/** Вопрос викторины: к какому РЭС относится подстанция. */
export interface QuizQuestion {
  psId: number
  psName: string
  /** id правильного РЭС. */
  resId: number
  /** Название правильного РЭС — показывается в разборе ответа. */
  resName: string
}

/**
 * Состояние викторины. Дискриминированный union: пока идут вопросы,
 * известен текущий индекс и выбранный на нём ответ; после последнего
 * вопроса состояние переключается на `finished`.
 */
export type QuizState =
  | {
      kind: 'question'
      questions: QuizQuestion[]
      /** Индекс текущего вопроса. */
      index: number
      /** Выбранный ответ на текущем вопросе; null — ответ ещё не дан. */
      chosenResId: number | null
      correctCount: number
    }
  | {
      kind: 'finished'
      questions: QuizQuestion[]
      correctCount: number
    }

export type QuizAction =
  | { type: 'answer'; resId: number }
  | { type: 'next' }
  | { type: 'restart' }

/** Начальное состояние: вопросы в переданном порядке, активен первый. */
export const createQuizState = (questions: QuizQuestion[]): QuizState => ({
  kind: 'question',
  questions,
  index: 0,
  chosenResId: null,
  correctCount: 0,
})

/** Собирает вопросы по ПС зоны, перемешивая порядок подстанций. */
export const buildQuizQuestions = (
  zonePs: Ps[],
  resList: ResList
): QuizQuestion[] =>
  shuffleArray(zonePs).map((ps) => {
    const res = resList.find((item) => item.id === ps.resId)
    return {
      psId: ps.id,
      psName: ps.name,
      resId: ps.resId,
      resName: res?.name ?? '',
    }
  })

/**
 * Редьюсер викторины.
 * `answer` — фиксирует выбранный вариант (повторный ответ на тот же вопрос
 * игнорируется, чтобы счёт нельзя было накрутить);
 * `next` — переходит к следующему вопросу или завершает викторину;
 * `restart` — начинает заново с теми же вопросами в новом порядке.
 */
export const quizReducer = (
  state: QuizState,
  action: QuizAction
): QuizState => {
  switch (action.type) {
    case 'answer': {
      if (state.kind !== 'question' || state.chosenResId !== null) return state
      const correct = state.questions[state.index].resId === action.resId
      return {
        ...state,
        chosenResId: action.resId,
        correctCount: correct ? state.correctCount + 1 : state.correctCount,
      }
    }
    case 'next': {
      if (state.kind !== 'question' || state.chosenResId === null) return state
      const nextIndex = state.index + 1
      if (nextIndex >= state.questions.length) {
        return {
          kind: 'finished',
          questions: state.questions,
          correctCount: state.correctCount,
        }
      }
      return { ...state, index: nextIndex, chosenResId: null }
    }
    case 'restart':
      return createQuizState(shuffleArray(state.questions))
  }
}

/** Текущий вопрос; null — викторина завершена. */
export const currentQuestion = (state: QuizState): QuizQuestion | null =>
  state.kind === 'question' ? state.questions[state.index] : null

/** Доля правильных ответов в процентах (0–100). */
export const scorePercent = (correctCount: number, total: number): number =>
  total === 0 ? 0 : Math.round((correctCount / total) * 100)
