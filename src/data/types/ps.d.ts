export type Ps = {
  id: number
  name: string
  /** Внешний ключ на таблицу РЭС (Res.id). */
  resId: number
} & { [key: string]: string | number }
