import { actionBtnClass } from '@/lib/uiClasses'

interface Props {
  errorCount: number
  onReset: () => void
}

/** Счётчик ошибок с кнопкой сброса. */
export const ErrorCounter = ({ errorCount, onReset }: Props) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="text-sm font-bold text-white md:text-base">
        Ошибки:
        <span className="ml-2 rounded-full bg-white px-1 py-1 text-base text-red-500 md:px-6 md:py-4">
          {errorCount}
        </span>
      </div>
      <button className={actionBtnClass} onClick={onReset}>
        Сброс
      </button>
    </div>
  )
}
