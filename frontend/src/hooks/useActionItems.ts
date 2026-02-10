'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useWebSocket } from '@/contexts/websocket-context'
import { getActionItems, type ActionItemsData } from '@/services/action-items'

const POLL_INTERVAL = 60000 // 60 seconds

interface UseActionItemsReturn {
  actionItems: ActionItemsData
  getModuleTotal: (moduleId: string) => number
  getItemCount: (moduleId: string, itemId: string) => number
}

export function useActionItems(): UseActionItemsReturn {
  const { subscribe, unsubscribe } = useWebSocket()
  const [actionItems, setActionItems] = useState<ActionItemsData>({})
  const mountedRef = useRef(true)

  const fetchActionItems = useCallback(async () => {
    try {
      const data = await getActionItems()
      if (mountedRef.current) {
        setActionItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch action items:', error)
    }
  }, [])

  // Initial fetch + polling
  useEffect(() => {
    mountedRef.current = true
    fetchActionItems()

    const interval = setInterval(fetchActionItems, POLL_INTERVAL)

    return () => {
      mountedRef.current = false
      clearInterval(interval)
    }
  }, [fetchActionItems])

  // Refresh on notification events (something changed)
  useEffect(() => {
    const handler = () => {
      fetchActionItems()
    }

    subscribe('notification', handler)
    return () => unsubscribe('notification', handler)
  }, [subscribe, unsubscribe, fetchActionItems])

  const getModuleTotal = useCallback((moduleId: string): number => {
    const moduleData = actionItems[moduleId]
    if (!moduleData) return 0
    return Object.values(moduleData).reduce((sum, count) => sum + count, 0)
  }, [actionItems])

  const getItemCount = useCallback((moduleId: string, itemId: string): number => {
    return actionItems[moduleId]?.[itemId] ?? 0
  }, [actionItems])

  return {
    actionItems,
    getModuleTotal,
    getItemCount,
  }
}
