'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWebSocket } from '@/contexts/websocket-context'
import { useAuth } from '@/contexts/auth-context'
import type { RecordLockPayload } from '@/lib/websocket'

interface UseRecordLockReturn {
  isLockedByOther: boolean
  lockedBy: string | null // email of the user who holds the lock
}

/**
 * Hook to manage record-level locking awareness via WebSocket.
 * Sends a lock on mount and unlock on unmount.
 * Listens for lock/unlock messages from other users.
 */
export function useRecordLock(entityType: string, entityId: string | undefined): UseRecordLockReturn {
  const { subscribe, unsubscribe, sendMessage, isConnected } = useWebSocket()
  const { user } = useAuth()
  const [lockedBy, setLockedBy] = useState<string | null>(null)

  // Acquire lock on mount, release on unmount
  useEffect(() => {
    if (!entityId || !isConnected) return

    sendMessage('record_lock', {
      entity_type: entityType,
      entity_id: entityId,
    })

    return () => {
      sendMessage('record_unlock', {
        entity_type: entityType,
        entity_id: entityId,
      })
    }
  }, [entityType, entityId, isConnected, sendMessage])

  // Listen for lock/unlock events from other users
  useEffect(() => {
    if (!entityId) return

    const lockHandler = (payload: unknown) => {
      const lock = payload as RecordLockPayload
      if (lock.entity_type === entityType && lock.entity_id === entityId && lock.user_id !== user?.id) {
        setLockedBy(lock.user_email)
      }
    }

    const unlockHandler = (payload: unknown) => {
      const lock = payload as RecordLockPayload
      if (lock.entity_type === entityType && lock.entity_id === entityId) {
        setLockedBy(null)
      }
    }

    subscribe('record_lock', lockHandler)
    subscribe('record_unlock', unlockHandler)

    return () => {
      unsubscribe('record_lock', lockHandler)
      unsubscribe('record_unlock', unlockHandler)
    }
  }, [entityType, entityId, user?.id, subscribe, unsubscribe])

  return {
    isLockedByOther: lockedBy !== null,
    lockedBy,
  }
}
