interface Props {
  errorCount: number
  onReset: () => void
}

/** Счётчик ошибок с кнопкой сброса. */
export const ErrorCounter = ({ errorCount, onReset }: Props) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="text-sm font-bold text-white md:text-base">
        Количество ошибок
        <span className="ml-2 rounded-full bg-white px-4 py-2 text-base text-red-500 md:px-6 md:py-4">
          {errorCount}
        </span>
      </div>
      <button
        className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white shadow transition hover:bg-blue-500 active:scale-95 md:px-4 md:py-3 md:text-3xl"
        onClick={onReset}
      >
        Сбросить счётчик ошибок
      </button>
    </div>
  )
}
