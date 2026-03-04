import type { Resource } from './database.types'

const DB_NAME = 'resource_mapping_cache'
const DB_VERSION = 1
const STORE_NAME = 'resources'
const TIMESTAMP_STORE = 'metadata'

let db: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db && db.version > 0) {
      resolve(db)
      return
    }

    db = null

    if (typeof window === 'undefined') {
      reject(new Error('Window is undefined'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
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

    // Clear existing resources
    resourcesStore.clear()
    
    // Add all resources
    resources.forEach(resource => {
      resourcesStore.add(resource)
    })

    // Update timestamp
    timestampStore.put({ key: 'cache_timestamp', value: Date.now() })

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (error) {
    console.error('Error caching resources:', error)
  }
}

export async function getCachedResources(): Promise<Resource[] | null> {
  if (typeof window === 'undefined') return null

  try {
    const database = await openDB()
    const tx = database.transaction([STORE_NAME, TIMESTAMP_STORE], 'readonly')
    
    const resourcesStore = tx.objectStore(STORE_NAME)
    const timestampStore = tx.objectStore(TIMESTAMP_STORE)

    const resourcesRequest = resourcesStore.getAll()
    const timestampRequest = timestampStore.get('cache_timestamp')

    const [resources, timestampRecord] = await new Promise<[Resource[], { key: string; value: number } | undefined]>((resolve, reject) => {
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

    // Check if cache is expired
    if (Date.now() - timestampRecord.value > CACHE_DURATION) {
      return resources
    }

    return resources
  } catch (error) {
    console.error('Error getting cached resources:', error)
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
    })
  } catch (error) {
    console.error('Error clearing cache:', error)
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
// OFFLINE QUEUE (for pending changes) - Still using localStorage for simplicity
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

// 3. In fetchResourcesWithFallback, distinguish "expired cache" from "no cache"
export async function fetchResourcesWithFallback(
  fetchOnline: () => Promise<Resource[]>
): Promise<{ resources: Resource[]; isOffline: boolean; isStale: boolean }> {
  if (isOnline()) {
    try {
      const resources = await fetchOnline()
      await cacheResources(resources)
      return { resources, isOffline: false, isStale: false }
    } catch (error) {
      console.error('Failed to fetch online, falling back to cache:', error)
      const cached = await getCachedResources()
      // ✅ Return whatever cache exists (even stale), don't re-throw and loop
      return { resources: cached ?? [], isOffline: false, isStale: true }
    }
  }

  const cached = await getCachedResources()
  // ✅ Return empty array instead of looping when truly nothing cached
  return { resources: cached ?? [], isOffline: true, isStale: true }
}