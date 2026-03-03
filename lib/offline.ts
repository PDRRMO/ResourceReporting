import type { Resource } from './database.types'

const CACHE_KEY = 'resources_cache'
const CACHE_TIMESTAMP_KEY = 'resources_cache_timestamp'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// ============================================
// CACHE OPERATIONS
// ============================================

export function cacheResources(resources: Resource[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CACHE_KEY, JSON.stringify(resources))
  localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
}

export function getCachedResources(): Resource[] | null {
  if (typeof window === 'undefined') return null

  const cached = localStorage.getItem(CACHE_KEY)
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)

  if (!cached || !timestamp) return null

  // Check if cache is expired
  if (Date.now() - parseInt(timestamp) > CACHE_DURATION) {
    return null
  }

  return JSON.parse(cached)
}

export function clearResourceCache(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CACHE_KEY)
  localStorage.removeItem(CACHE_TIMESTAMP_KEY)
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
// OFFLINE QUEUE (for pending changes)
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
  // Try online first
  if (isOnline()) {
    try {
      const resources = await fetchOnline()
      cacheResources(resources)
      return { resources, isOffline: false, isStale: false }
    } catch (error) {
      console.error('Failed to fetch online, falling back to cache:', error)
      const cached = getCachedResources()
      if (cached) {
        return { resources: cached, isOffline: false, isStale: true }
      }
      throw error
    }
  }

  // Offline - use cache
  const cached = getCachedResources()
  if (cached) {
    return { resources: cached, isOffline: true, isStale: true }
  }

  return { resources: [], isOffline: true, isStale: true }
}
