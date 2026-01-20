/**
 * Optimized API Hook
 * Custom hook for data fetching with caching, loading states, and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/lib/api'
import { frontendCache, cacheTTL } from '@/lib/cache'

interface UseApiOptions {
  cache?: boolean
  ttl?: number
  dependencies?: any[]
  enabled?: boolean
}

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  mutate: (newData: T) => void
}

export function useApi<T>(
  endpoint: string,
  params?: Record<string, unknown>,
  options: UseApiOptions = {}
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const optionsRef = useRef(options)
  optionsRef.current = options

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await apiClient.get<T>(endpoint, params, {
        cache: optionsRef.current.cache,
        ttl: optionsRef.current.ttl
      })

      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [endpoint, JSON.stringify(params)])

  const mutate = useCallback((newData: T) => {
    setData(newData)
    // Update cache if caching is enabled
    if (options.cache !== false) {
      const cacheKey = `GET:${endpoint}${params ? '?' + new URLSearchParams(params as any).toString() : ''}`
      frontendCache.set(cacheKey, newData, options.ttl || cacheTTL.userProfile)
    }
  }, [endpoint, params, options.cache, options.ttl])

  useEffect(() => {
    if (options.enabled === false) return
    
    fetchData()
  }, [fetchData, ...(options.dependencies || [])])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate
  }
}

// Specialized hooks
export function useMasterData<T>(type: string) {
  return useApi<T>(`/api/masterdata/${type}`, undefined, {
    cache: true,
    ttl: cacheTTL.masterdata
  })
}

export function useEmployees(params?: Record<string, unknown>) {
  return useApi<any>('/api/hr/employees', params, {
    cache: true,
    ttl: cacheTTL.employees,
    dependencies: [JSON.stringify(params)]
  })
}

export function useArticles(params?: Record<string, unknown>) {
  return useApi<any>('/api/masterdata/articles', params, {
    cache: true,
    ttl: cacheTTL.masterdata,
    dependencies: [JSON.stringify(params)]
  })
}