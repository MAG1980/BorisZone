import type { ZoneList } from './types/zone'

/** Зона по умолчанию (Борисоглебская) — используется при миграции старых РЭС. */
export const DEFAULT_ZONE_ID = 3

/** Сид-данные зон. */
export const zonesList: ZoneList = [
  { id: 1, name: 'Лискинская зона' },
  { id: 2, name: 'Воронежская зона' },
  { id: 3, name: 'Борисоглебская зона' },
  { id: 4, name: 'Калачеевская зона' },
]
