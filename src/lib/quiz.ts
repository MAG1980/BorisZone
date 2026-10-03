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
 * Состояние викторины. Викторина идёт кругами: первый круг — все ПС зоны,
 * каждый следующий — только вопросы, отвеченные неверно в предыдущем круге.
 * `question` — идёт круг; `intermediate` — круг закрыт, но остались ошибки;
 * `finished` — круг закрыт без ошибок (викторина пройдена).
 */
export type QuizState =
  | {
      kind: 'question'
      /** Номер круга, начиная с 1. */
      round: number
      /** Вопросы текущего круга в порядке показа. */
      questions: QuizQuestion[]
      /** Индекс текущего вопроса. */
      index: number
      /** Ответ на текущий вопрос; null — ответ ещё не дан. */
      chosenResId: number | null
      /** Промахи текущего круга — из них собирается следующий круг. */
      pending: QuizQuestion[]
      /** id ПС, в которых ошибались хотя бы раз за викторину. */
      everWrongIds: number[]
      /** Всего неверных ответов за викторину (с учётом повторов). */
      wrongCount: number
    }
  | {
      kind: 'intermediate'
      /** Номер только что пройденного круга. */
      round: number
      pending: QuizQuestion[]
      everWrongIds: number[]
      wrongCount: number
    }
  | {
      kind: 'finished'
      /** Сколько кругов потребовалось, чтобы пройти без ошибок. */
      rounds: number
      everWrongIds: number[]
      wrongCount: number
    }

/**
 * Действия викторины. Перемешивание живёт вне редьюсера (он остаётся чистым):
 * список вопросов для нового круга приходит в действии уже перемешанным.
 */
export type QuizAction =
  | { type: 'answer'; resId: number }
  | { type: 'next' }
  | { type: 'continue'; questions: QuizQuestion[] }
  | { type: 'restart'; questions: QuizQuestion[] }

/** Начальное состояние: первый круг из переданных вопросов. */
export const createQuizState = (questions: QuizQuestion[]): QuizState => ({
  kind: 'question',
  round: 1,
  questions,
  index: 0,
  chosenResId: null,
  pending: [],
  everWrongIds: [],
  wrongCount: 0,
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
 * игнорируется, чтобы счёт нельзя было накрутить), при промахе пополняет
 * список вопросов на повтор и счётчик ошибок;
 * `next` — переходит к следующему вопросу, а когда круг закончился —
 * показывает итог круга (`intermediate`) либо завершает викторину (`finished`);
 * `continue` — начинает следующий круг по вопросам с промахами;
 * `restart` — начинает викторину заново с полного списка.
 */
export const quizReducer = (
  state: QuizState,
  action: QuizAction
): QuizState => {
  switch (action.type) {
    case 'answer': {
      if (state.kind !== 'question' || state.chosenResId !== null) return state
      const question = state.questions[state.index]
      if (question.resId === action.resId) {
        return { ...state, chosenResId: action.resId }
      }
      return {
        ...state,
        chosenResId: action.resId,
        pending: [...state.pending, question],
        everWrongIds: state.everWrongIds.includes(question.psId)
          ? state.everWrongIds
          : [...state.everWrongIds, question.psId],
        wrongCount: state.wrongCount + 1,
      }
    }
    case 'next': {
      if (state.kind !== 'question' || state.chosenResId === null) return state
      const nextIndex = state.index + 1
      if (nextIndex < state.questions.length) {
        return { ...state, index: nextIndex, chosenResId: null }
      }
      // Круг закрыт: без промахов — викторина пройдена, иначе — повтор.
      if (state.pending.length === 0) {
        return {
          kind: 'finished',
          rounds: state.round,
          everWrongIds: state.everWrongIds,
          wrongCount: state.wrongCount,
        }
      }
      return {
        kind: 'intermediate',
        round: state.round,
        pending: state.pending,
        everWrongIds: state.everWrongIds,
        wrongCount: state.wrongCount,
      }
    }
    case 'continue': {
      // Пустой круг повторов не запускаем: завершать викторину — задача `next`.
      if (state.kind !== 'intermediate' || action.questions.length === 0) {
        return state
      }
      return {
        kind: 'question',
        round: state.round + 1,
        questions: action.questions,
        index: 0,
        chosenResId: null,
        pending: [],
        everWrongIds: state.everWrongIds,
        wrongCount: state.wrongCount,
      }
    }
    case 'restart':
      return createQuizState(action.questions)
  }
}

/** Верен ли уже выбранный ответ на текущий вопрос (для автоперехода дальше). */
export const currentAnswerIsCorrect = (state: QuizState): boolean =>
  state.kind === 'question' &&
  state.chosenResId !== null &&
  state.questions[state.index].resId === state.chosenResId

/** Доля части от целого в процентах (0–100). */
export const scorePercent = (part: number, total: number): number =>
  total === 0 ? 0 : Math.round((part / total) * 100)
