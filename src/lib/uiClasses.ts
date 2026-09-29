/**
 * Общие стили кнопок панели инструментов.
 * Вынесены в отдельный модуль, чтобы Toolbar и его дочерние компоненты
 * (например, EditMenu) использовали одну стилистику без циклических импортов.
 */

/** Кнопка действия в тулбаре. */
export const actionBtnClass =
  'rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-500 active:scale-95 sm:px-4 sm:text-base md:text-lg'

/** Кнопка опасного действия (сброс данных) — та же геометрия, красный цвет. */
export const actionBtnDangerClass =
  'rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-500 active:scale-95 sm:px-4 sm:text-base md:text-lg'
