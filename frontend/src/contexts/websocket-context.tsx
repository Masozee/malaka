'use client'

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useToast, toast } from '@/components/ui/toast'
import { authService } from '@/services/auth'
import {
  MalakaWSClient,
  getWSUrl,
  type WSConnectionState,
  type WSMessageType,
  type NotificationPayload,
  type DashboardPayload,
  type RecordLockPayload,
} from '@/lib/websocket'

interface WebSocketContextType {
  isConnected: boolean
  connectionState: WSConnectionState
  onlineUsers: number
  subscribe: (type: WSMessageType, handler: (payload: unknown) => void) => void
  unsubscribe: (type: WSMessageType, handler: (payload: unknown) => void) => void
  sendMessage: (type: WSMessageType, payload: unknown) => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

interface WebSocketProviderProps {
  children: React.ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { isAuthenticated } = useAuth()
  const { addToast } = useToast()
  const clientRef = useRef<MalakaWSClient | null>(null)
  const [connectionState, setConnectionState] = useState<WSConnectionState>('disconnected')
  const [onlineUsers, setOnlineUsers] = useState(0)

  // Connect when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      if (clientRef.current) {
        clientRef.current.close()
        clientRef.current = null
      }
      setConnectionState('disconnected')
      setOnlineUsers(0)
      return
    }

    const token = authService.getToken()
    if (!token) return

    const wsUrl = getWSUrl()
    const client = new MalakaWSClient(wsUrl, token)
    clientRef.current = client

    // Track connection state
    client.onStateChange((state) => {
      setConnectionState(state)
    })

    // Handle real-time notifications → show toast
    client.on('notification', (payload) => {
      const notif = payload as NotificationPayload
      const toastType = notif.priority === 'urgent' || notif.priority === 'high' ? 'warning' : 'info'
      addToast(toast[toastType](notif.title, notif.message))
    })

    // Handle dashboard updates → update online user count
    client.on('dashboard_update', (payload) => {
      const data = payload as DashboardPayload
      setOnlineUsers(data.online_users)
    })

    client.connect()

    return () => {
      client.close()
      clientRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const subscribe = useCallback((type: WSMessageType, handler: (payload: unknown) => void) => {
    clientRef.current?.on(type, handler)
  }, [])

  const unsubscribe = useCallback((type: WSMessageType, handler: (payload: unknown) => void) => {
    clientRef.current?.off(type, handler)
  }, [])

  const sendMessage = useCallback((type: WSMessageType, payload: unknown) => {
    clientRef.current?.send({
      type,
      payload: payload as undefined,
      timestamp: new Date().toISOString(),
    })
  }, [])

  const value: WebSocketContextType = {
    isConnected: connectionState === 'connected',
    connectionState,
    onlineUsers,
    subscribe,
    unsubscribe,
    sendMessage,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}
