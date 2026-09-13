export type Res = {
  id: number
  name: string
  /** Внешний ключ на таблицу зон (Zone.id). */
  zoneId: number
}

export type ResList = Res[]
