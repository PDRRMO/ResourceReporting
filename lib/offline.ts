import type { Resource } from './database.types'

const DB_NAME = 'resource_mapping_cache'
const DB_VERSION = 1
const STORE_NAME = 'resources'
const TIMESTAMP_STORE = 'metadata'

let db: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is undefined'))
      return
    }

    // ✅ Only reuse db if it's open — check readyState isn't 'done' (closed)
    if (db) {
      try {
        // Accessing .name on a closed db throws in some browsers
        const _ = db.name
        resolve(db)
        return
      } catch {
        // db reference is stale/closed, reset it
        db = null
      }
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result

      // ✅ Reset our reference if the connection closes unexpectedly
      db.onclose = () => {
        db = null
      }
      db.onerror = () => {
        db = null
      }

      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'resource_id' })
      }

      if (!database.objectStoreNames.contains(TIMESTAMP_STORE)) {
        database.createObjectStore(TIMESTAMP_STORE, { keyPath: 'key' })
      }
    }
  })
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// ============================================
// CACHE OPERATIONS (Async with IndexedDB)
// ============================================

export async function cacheResources(resources: Resource[]): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const database = await openDB()
    const tx = database.transaction([STORE_NAME, TIMESTAMP_STORE], 'readwrite')

    const resourcesStore = tx.objectStore(STORE_NAME)
    const timestampStore = tx.objectStore(TIMESTAMP_STORE)

    resourcesStore.clear()

    resources.forEach(resource => {
      resourcesStore.add(resource)
    })

    timestampStore.put({ key: 'cache_timestamp', value: Date.now() })

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(new Error('Transaction aborted'))
    })
  } catch (error) {
    console.error('Error caching resources:', error)
    // ✅ Reset db so next call gets a fresh connection
    db = null
  }
}

export async function getCachedResources(): Promise<{
  resources: Resource[]
  isExpired: boolean
} | null> {
  if (typeof window === 'undefined') return null

  try {
    const database = await openDB()
    const tx = database.transaction([STORE_NAME, TIMESTAMP_STORE], 'readonly')

    const resourcesStore = tx.objectStore(STORE_NAME)
    const timestampStore = tx.objectStore(TIMESTAMP_STORE)

    const resourcesRequest = resourcesStore.getAll()
    const timestampRequest = timestampStore.get('cache_timestamp')

    const [resources, timestampRecord] = await new Promise<
      [Resource[], { key: string; value: number } | undefined]
    >((resolve, reject) => {
      resourcesRequest.onsuccess = () => {
        timestampRequest.onsuccess = () => {
          resolve([resourcesRequest.result, timestampRequest.result])
        }
        timestampRequest.onerror = () => reject(timestampRequest.error)
      }
      resourcesRequest.onerror = () => reject(resourcesRequest.error)
    })

    if (!resources || resources.length === 0) return null
    if (!timestampRecord) return null

    const isExpired = Date.now() - timestampRecord.value > CACHE_DURATION

    // ✅ Always return what we have — let the caller decide what to do with stale data
    return { resources, isExpired }
  } catch (error) {
    console.error('Error getting cached resources:', error)
    // ✅ Reset db so next call gets a fresh connection
    db = null
    return null
  }
}

export async function clearResourceCache(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const database = await openDB()
    const tx = database.transaction([STORE_NAME, TIMESTAMP_STORE], 'readwrite')

    tx.objectStore(STORE_NAME).clear()
    tx.objectStore(TIMESTAMP_STORE).clear()

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(new Error('Transaction aborted'))
    })
  } catch (error) {
    console.error('Error clearing cache:', error)
    db = null
  }
}

// ============================================
// ONLINE/OFFLINE DETECTION
// ============================================

export function isOnline(): boolean {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

export function onOnline(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('online', callback)
  return () => window.removeEventListener('online', callback)
}

export function onOffline(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('offline', callback)
  return () => window.removeEventListener('offline', callback)
}

// ============================================
// OFFLINE QUEUE — localStorage for simplicity
// ============================================

interface QueuedAction {
  id: string
  type: 'create' | 'update' | 'delete'
  table: string
  data: any
  timestamp: number
}

const QUEUE_KEY = 'offline_queue'

export function queueOfflineAction(action: Omit<QueuedAction, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return
  const queue = getOfflineQueue()
  queue.push({
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  })
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function getOfflineQueue(): QueuedAction[] {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
}

export function clearOfflineQueue(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(QUEUE_KEY, '[]')
}

export function removeFromQueue(id: string): void {
  if (typeof window === 'undefined') return
  const queue = getOfflineQueue()
  const filtered = queue.filter((action) => action.id !== id)
  localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered))
}

// ============================================
// HYBRID DATA FETCH (Online with Offline Fallback)
// ============================================

export async function fetchResourcesWithFallback(
  fetchOnline: () => Promise<Resource[]>
): Promise<{ resources: Resource[]; isOffline: boolean; isStale: boolean }> {

  if (isOnline()) {
    try {
      const resources = await fetchOnline()
      // ✅ Fire and forget — don't await, don't let cache failure block the return
      cacheResources(resources).catch(console.error)
      return { resources, isOffline: false, isStale: false }
    } catch (error) {
      console.error('Failed to fetch online, falling back to cache:', error)

      // ✅ Return stale cache instead of throwing — breaks the retry loop
      const cached = await getCachedResources()
      if (cached) {
        return { resources: cached.resources, isOffline: false, isStale: true }
      }

      // ✅ Nothing cached at all — return empty, don't throw
      return { resources: [], isOffline: false, isStale: true }
    }
  }

  // Offline path
  const cached = await getCachedResources()
  if (cached) {
    return { resources: cached.resources, isOffline: true, isStale: true }
  }

  // ✅ Truly nothing — return empty array, never throw
  return { resources: [], isOffline: true, isStale: true }
}