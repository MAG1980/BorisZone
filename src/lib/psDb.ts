import type { Ps } from '@/data/types/ps'
import type { PsList } from '@/data/types/psList'
import { psDb as seed } from '@/data/psDb'

const DB_NAME = 'boriszone'
const DB_VERSION = 1
const STORE = 'ps'

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
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  return dbPromise
}

/** Записывает массив подстанций в store (перезаписывает по keyPath id). */
const writeAll = (db: IDBDatabase, list: PsList): Promise<void> =>
  new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    list.forEach((ps) => store.put(ps))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

/** Читает все подстанции из store. */
const readAll = (db: IDBDatabase): Promise<PsList> =>
  new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result as PsList)
    request.onerror = () => reject(request.error)
  })

/**
 * Возвращает список подстанций из IndexedDB.
 * При первом запуске (пустая база) заполняет её сид-данными из data/psDb.ts.
 */
export const getPsList = async (): Promise<PsList> => {
  const db = await openDb()
  const existing = await readAll(db)

  if (existing.length === 0) {
    await writeAll(db, seed)
    return seed
  }

  return existing
}

/** Полностью перезаписывает базу подстанций. */
export const savePsList = async (list: PsList): Promise<void> => {
  const db = await openDb()
  const tx = db.transaction(STORE, 'readwrite')
  tx.objectStore(STORE).clear()

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })

  await writeAll(db, list)
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
