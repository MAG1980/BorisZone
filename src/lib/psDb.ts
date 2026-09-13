import type { Ps } from '@/data/types/ps'
import type { PsList } from '@/data/types/psList'
import type { Res, ResList } from '@/data/types/res'
import type { Zone, ZoneList } from '@/data/types/zone'
import { psDb as seed } from '@/data/psDb'
import { resList as seedRes } from '@/data/resList'
import { zonesList as seedZones, DEFAULT_ZONE_ID } from '@/data/zonesList'

const DB_NAME = 'boriszone'
const DB_VERSION = 3
const STORE = 'ps'
const RES_STORE = 'res'
const ZONE_STORE = 'zones'

let dbPromise: Promise<IDBDatabase> | null = null

/** Открывает соединение с IndexedDB (создаёт store при необходимости). */
const openDb = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
      // Отдельная таблица для названий РЭС.
      if (!db.objectStoreNames.contains(RES_STORE)) {
        db.createObjectStore(RES_STORE, { keyPath: 'id' })
      }
      // Отдельная таблица для зон.
      if (!db.objectStoreNames.contains(ZONE_STORE)) {
        db.createObjectStore(ZONE_STORE, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  return dbPromise
}

/** Записывает массив записей в указанный store (перезаписывает по keyPath id). */
const writeAll = <T>(
  db: IDBDatabase,
  store: string,
  list: T[]
): Promise<void> =>
  new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    const os = tx.objectStore(store)
    list.forEach((item) => os.put(item))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

/** Читает все записи из указанного store. */
const readAll = <T>(db: IDBDatabase, store: string): Promise<T[]> =>
  new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly')
    const os = tx.objectStore(store)
    const request = os.getAll()
    request.onsuccess = () => resolve(request.result as T[])
    request.onerror = () => reject(request.error)
  })

/** Полностью очищает store. */
const clearStore = (db: IDBDatabase, store: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

/**
 * Мигрирует старые записи подстанций, где РЭС хранился строкой (resName),
 * в новую структуру с внешним ключом resId.
 */
const migrateLegacyPs = (list: PsList): { list: PsList; changed: boolean } => {
  let changed = false
  const migrated = list.map((ps) => {
    const legacy = ps as Ps & { resName?: string }
    if (typeof legacy.resId === 'number') return ps
    changed = true
    const res = seedRes.find((r) => r.name === legacy.resName)
    const rest: Record<string, unknown> = { ...legacy }
    delete rest.resName
    return { ...(rest as Ps), resId: res?.id ?? seedRes[0].id }
  })
  return { list: migrated, changed }
}

/**
 * Мигрирует старые записи РЭС без привязки к зоне,
 * проставляя зону по умолчанию (Борисоглебскую).
 */
const migrateLegacyRes = (
  list: ResList
): { list: ResList; changed: boolean } => {
  let changed = false
  const migrated = list.map((res) => {
    if (typeof (res as Res).zoneId === 'number') return res
    changed = true
    return { ...res, zoneId: DEFAULT_ZONE_ID }
  })
  return { list: migrated, changed }
}

/**
 * Возвращает список подстанций из IndexedDB.
 * При первом запуске (пустая база) заполняет её сид-данными из data/psDb.ts.
 */
export const getPsList = async (): Promise<PsList> => {
  const db = await openDb()
  const existing = await readAll<Ps>(db, STORE)

  if (existing.length === 0) {
    await writeAll(db, STORE, seed)
    return seed
  }

  // Совместимость со старым форматом (resName вместо resId).
  const { list, changed } = migrateLegacyPs(existing)
  if (changed) {
    await savePsList(list)
  }

  return list
}

/** Полностью перезаписывает базу подстанций. */
export const savePsList = async (list: PsList): Promise<void> => {
  const db = await openDb()
  await clearStore(db, STORE)
  await writeAll(db, STORE, list)
}

/**
 * Возвращает список РЭС из отдельной таблицы IndexedDB.
 * При первом запуске (пустая таблица) заполняет её сид-данными из data/resList.ts.
 */
export const getResList = async (): Promise<ResList> => {
  const db = await openDb()
  const existing = await readAll<Res>(db, RES_STORE)

  if (existing.length === 0) {
    await writeAll(db, RES_STORE, seedRes)
    return seedRes
  }

  // Совместимость со старым форматом (без zoneId).
  const { list, changed } = migrateLegacyRes(existing)
  if (changed) {
    await saveResList(list)
  }

  return list
}

/** Полностью перезаписывает таблицу РЭС. */
export const saveResList = async (list: ResList): Promise<void> => {
  const db = await openDb()
  await clearStore(db, RES_STORE)
  await writeAll(db, RES_STORE, list)
}

/** Сбрасывает таблицу РЭС к исходным (сид) данным. */
export const resetResDb = async (): Promise<ResList> => {
  await saveResList(seedRes)
  return seedRes
}

/**
 * Возвращает список зон из IndexedDB.
 * При первом запуске (пустая таблица) заполняет её сид-данными из data/zonesList.ts.
 */
export const getZonesList = async (): Promise<ZoneList> => {
  const db = await openDb()
  const existing = await readAll<Zone>(db, ZONE_STORE)

  if (existing.length === 0) {
    await writeAll(db, ZONE_STORE, seedZones)
    return seedZones
  }

  return existing
}

/** Полностью перезаписывает таблицу зон. */
export const saveZonesList = async (list: ZoneList): Promise<void> => {
  const db = await openDb()
  await clearStore(db, ZONE_STORE)
  await writeAll(db, ZONE_STORE, list)
}

/** Сбрасывает таблицу зон к исходным (сид) данным. */
export const resetZonesDb = async (): Promise<ZoneList> => {
  await saveZonesList(seedZones)
  return seedZones
}

/** Сбрасывает базу подстанций, таблицу РЭС и зоны к исходным данным. */
export const resetPsDb = async (): Promise<PsList> => {
  await savePsList(seed)
  await resetResDb()
  await resetZonesDb()
  return seed
}

/** Одиночная подстанция по id. */
export const getPsById = async (id: number): Promise<Ps | undefined> => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(id)
    request.onsuccess = () => resolve(request.result as Ps | undefined)
    request.onerror = () => reject(request.error)
  })
}
