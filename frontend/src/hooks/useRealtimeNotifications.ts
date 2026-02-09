'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useWebSocket } from '@/contexts/websocket-context'
import { notificationService, type Notification } from '@/services/notifications'
import type { NotificationPayload } from '@/lib/websocket'

interface UseRealtimeNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refresh: () => Promise<void>
}

export function useRealtimeNotifications(limit = 20): UseRealtimeNotificationsReturn {
  const { subscribe, unsubscribe } = useWebSocket()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(true)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const result = await notificationService.listNotifications({ limit, offset: 0, include_read: true })
      if (mountedRef.current) {
        setNotifications(result.notifications)
        setUnreadCount(result.unread_count)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [limit])

  // Listen for real-time notifications via WebSocket
  useEffect(() => {
    const handler = (payload: unknown) => {
      const notif = payload as NotificationPayload

      // Convert WS payload to Notification type
      const newNotification: Notification = {
        id: notif.id,
        user_id: notif.user_id,
        title: notif.title,
        message: notif.message,
        type: notif.type as Notification['type'],
        priority: notif.priority as Notification['priority'],
        status: 'unread',
        action_url: notif.action_url,
        reference_type: notif.reference_type,
        reference_id: notif.reference_id,
        metadata: notif.metadata,
        sender_name: notif.sender_name,
        created_at: notif.created_at,
      }

      setNotifications((prev) => [newNotification, ...prev].slice(0, limit))
      setUnreadCount((prev) => prev + 1)
    }

    subscribe('notification', handler)
    return () => unsubscribe('notification', handler)
  }, [subscribe, unsubscribe, limit])

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true
    fetchNotifications()
    return () => {
      mountedRef.current = false
    }
  }, [fetchNotifications])

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'read' as const } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' as const })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }, [])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  }
}
