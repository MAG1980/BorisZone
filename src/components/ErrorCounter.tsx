interface Props {
  errorCount: number
  onReset: () => void
}

/** Счётчик ошибок с кнопкой сброса. */
export const ErrorCounter = ({ errorCount, onReset }: Props) => {
  return (
    <div className="flex items-center gap-2">
      <div className="text-white font-bold">
        Количество ошибок
        <span className="ml-2 bg-white text-red-500  rounded-full py-4 px-6">
          {errorCount}
        </span>
      </div>
      <button
        className="text-3xl font-bold text-white bg-blue-600 px-4 py-3"
        onClick={onReset}
      >
        Сбросить счётчик ошибок
      </button>
    </div>
  )
}
