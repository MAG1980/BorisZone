import { useRef } from 'react'
import { actionBtnClass, actionBtnDangerClass } from '@/lib/uiClasses'
import { cn } from '@/lib/utils'

interface Props {
  onEditPs: () => void
  onEditRes: () => void
  onResetDb: () => void
}

/** Пункт меню: геометрия кнопки тулбара, выравнивание по левому краю. */
const itemClass = cn('w-full text-left', actionBtnClass)

/** Пункт «Сброс» — та же геометрия, но красный (cn снимает конфликт bg-*). */
const dangerItemClass = cn('w-full text-left', actionBtnDangerClass)

/** Выпадающее меню «Редактировать» на базе <details>. Закрывается после выбора пункта. */
export const EditMenu = ({ onEditPs, onEditRes, onResetDb }: Props) => {
  const ref = useRef<HTMLDetailsElement>(null)

  const handle = (action: () => void) => {
    action()
    if (ref.current) ref.current.open = false
  }

  return (
    <details ref={ref} className="relative">
      {/* Кнопка оформлена как остальные кнопки тулбара (actionBtnClass). */}
      <summary
        className={cn('cursor-pointer list-none select-none', actionBtnClass)}
      >
        Редактировать
      </summary>
      <div className="absolute left-0 z-20 mt-2 flex min-w-full flex-col gap-2 rounded-lg border border-white/10 bg-slate-800 p-2 shadow-xl">
        <button className={itemClass} onClick={() => handle(onEditPs)}>
          Подстанции
        </button>
        <button className={itemClass} onClick={() => handle(onEditRes)}>
          Районы
        </button>
        <button className={dangerItemClass} onClick={() => handle(onResetDb)}>
          Сброс
        </button>
      </div>
    </details>
  )
}
