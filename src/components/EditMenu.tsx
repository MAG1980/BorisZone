import { useRef } from 'react'

interface Props {
  onEditPs: () => void
  onEditRes: () => void
  onResetDb: () => void
}

/** Выпадающее меню «Редактировать» на базе <details>. Закрывается после выбора пункта. */
export const EditMenu = ({ onEditPs, onEditRes, onResetDb }: Props) => {
  const ref = useRef<HTMLDetailsElement>(null)

  const handle = (action: () => void) => {
    action()
    if (ref.current) ref.current.open = false
  }

  return (
    <details ref={ref} className="relative">
      <summary className="text-3xl font-bold text-white bg-teal-600 px-4 py-3 rounded cursor-pointer list-none select-none">
        Редактировать
      </summary>
      <div className="absolute z-10 flex flex-col bg-teal-600 rounded mt-1 overflow-hidden shadow-lg">
        <button
          className="text-3xl font-bold text-white px-4 py-3 text-left hover:bg-teal-700"
          onClick={() => handle(onEditPs)}
        >
          Подстанции
        </button>
        <button
          className="text-3xl font-bold text-white px-4 py-3 text-left hover:bg-teal-700"
          onClick={() => handle(onEditRes)}
        >
          Районы
        </button>
        <button
          className="text-3xl font-bold text-white bg-red-600 px-4 py-3 text-left hover:bg-red-700"
          onClick={() => handle(onResetDb)}
        >
          Сброс
        </button>
      </div>
    </details>
  )
}
