import type { ResList } from './types/res'

/**
 * Сид-данные районов электрических сетей (РЭС).
 * zoneId: 1 — Лискинская, 2 — Воронежская, 3 — Борисоглебская, 4 — Калачеевская.
 * Имена РЭС уникальны (используются как ключи контейнеров в игре).
 */
export const resList: ResList = [
  // ── zoneId 3: Борисоглебская зона ──
  { id: 1, name: 'Аннинский', zoneId: 3 },
  { id: 2, name: 'Борисоглебский', zoneId: 3 },
  { id: 3, name: 'Грибановский', zoneId: 3 },
  { id: 4, name: 'Новохопёрский', zoneId: 3 },
  { id: 5, name: 'Поворинский', zoneId: 3 },
  { id: 6, name: 'Таловский', zoneId: 3 },
  { id: 7, name: 'Терновский', zoneId: 3 },
  { id: 8, name: 'Эртильский', zoneId: 3 },

  // ── zoneId 1: Лискинская зона ──
  { id: 9, name: 'Бобровский', zoneId: 1 },
  { id: 10, name: 'Каменский', zoneId: 1 },
  { id: 11, name: 'Кантемировский', zoneId: 1 },
  { id: 12, name: 'Лискинский', zoneId: 1 },
  { id: 13, name: 'Каширский', zoneId: 1 },
  { id: 14, name: 'Ольховатский', zoneId: 1 },
  { id: 15, name: 'Острогожский', zoneId: 1 },
  { id: 16, name: 'Россошанский', zoneId: 1 },
  { id: 17, name: 'Подгоренский', zoneId: 1 },
  { id: 18, name: 'Нововоронежский', zoneId: 1 },

  // ── zoneId 2: Воронежская зона ──
  { id: 19, name: 'ВУ СПС', zoneId: 2 },
  { id: 20, name: 'Верхнехавский', zoneId: 2 },
  { id: 21, name: 'Каширский', zoneId: 2 },
  { id: 22, name: 'Нижнедевицкий', zoneId: 2 },
  { id: 23, name: 'Новоусманский', zoneId: 2 },
  { id: 24, name: 'Панинский', zoneId: 2 },
  { id: 25, name: 'Рамонский', zoneId: 2 },
  { id: 26, name: 'Репьевский', zoneId: 2 },
  { id: 27, name: 'Семилукский', zoneId: 2 },
  { id: 28, name: 'Хохольский', zoneId: 2 },
  { id: 37, name: 'Нововоронежский', zoneId: 2 },

  // ── zoneId 4: Калачеевская зона ──
  { id: 29, name: 'Богучарский', zoneId: 4 },
  { id: 30, name: 'Бутурлиновский', zoneId: 4 },
  { id: 31, name: 'Верхнемамонский', zoneId: 4 },
  { id: 32, name: 'Воробьевский', zoneId: 4 },
  { id: 33, name: 'Калачеевский', zoneId: 4 },
  { id: 34, name: 'Павловский', zoneId: 4 },
  { id: 35, name: 'Петропавловский', zoneId: 4 },
]
