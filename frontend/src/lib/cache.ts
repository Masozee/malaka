/**
 * Frontend Caching Layer
 * Implements browser-based caching for API responses
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class FrontendCache {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  size(): number {
    return this.cache.size
  }
}

export const frontendCache = new FrontendCache()

// Cache key generators
export const cacheKeys = {
  masterdata: (type: string) => `masterdata:${type}`,
  employee: (id: string) => `employee:${id}`,
  employees: (params: Record<string, any>) => `employees:${JSON.stringify(params)}`,
  inventory: (warehouseId: string) => `inventory:${warehouseId}`,
  articles: (params: Record<string, any>) => `articles:${JSON.stringify(params)}`,
}

// Cache TTL constants (in milliseconds)
export const cacheTTL = {
  masterdata: 15 * 60 * 1000, // 15 minutes
  userProfile: 10 * 60 * 1000, // 10 minutes
  employees: 5 * 60 * 1000,    // 5 minutes
  inventory: 2 * 60 * 1000,    // 2 minutes
  realtime: 30 * 1000,         // 30 seconds
}