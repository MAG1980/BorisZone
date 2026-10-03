import { actionBtnClass } from '@/lib/uiClasses'
import { cn } from '@/lib/utils'

interface Props {
  /** Номер только что пройденного круга. */
  round: number
  /** Сколько вопросов круга ушло в повтор (в круге это же число ошибок). */
  pendingCount: number
  onContinue: () => void
  onClose: () => void
}

/**
 * Экран между кругами: круг закрыт, но есть промахи, которые нужно повторить.
 * Числа выведены и через двоеточие, и в кнопке — чтобы формулировка не
 * зависела от склонения количества вопросов.
 */
export const QuizBreak = ({
  round,
  pendingCount,
  onContinue,
  onClose,
}: Props) => {
  return (
    <div className="flex grow flex-col items-center justify-center gap-4 p-6">
      <h3 className="text-2xl font-bold text-white">Круг {round} пройден</h3>
      <p className="text-xl font-semibold text-red-300">
        Ошибок в круге: {pendingCount}
      </p>
      <p className="text-lg text-slate-300">
        Повторим эти вопросы — викторина завершится, когда круг пройдёт без
        ошибок.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button className={actionBtnClass} onClick={onContinue}>
          Повторить ошибки ({pendingCount})
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
