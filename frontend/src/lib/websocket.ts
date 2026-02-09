/**
 * Malaka WebSocket Client
 * Handles connection, reconnection with exponential backoff, heartbeat, and typed message dispatch.
 */

export type WSMessageType =
  | 'notification'
  | 'dashboard_update'
  | 'record_lock'
  | 'record_unlock'
  | 'presence'
  | 'chat_message'
  | 'typing_indicator'
  | 'ping'
  | 'pong'

export interface WSMessage {
  type: WSMessageType
  payload?: unknown
  timestamp: string
}

export interface NotificationPayload {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  priority: string
  action_url?: string
  reference_type?: string
  reference_id?: string
  metadata?: Record<string, unknown>
  sender_name?: string
  created_at: string
}

export interface DashboardPayload {
  online_users: number
}

export interface RecordLockPayload {
  entity_type: string
  entity_id: string
  user_id: string
  user_email: string
}

export interface ChatAttachmentPayload {
  id: string
  file_name: string
  original_name: string
  content_type: string
  file_size: number
  file_category: 'image' | 'document'
  width?: number
  height?: number
  url: string
}

export interface ChatMessagePayload {
  message_id: string
  conversation_id: string
  sender_id: string
  sender_username: string
  encrypted_content: string
  nonce: string
  sender_public_key_id?: string
  created_at: string
  attachments?: ChatAttachmentPayload[]
}

export interface TypingIndicatorPayload {
  conversation_id: string
  user_id: string
  is_typing: boolean
}

export type WSConnectionState = 'connecting' | 'connected' | 'disconnecting' | 'disconnected'

type MessageHandler = (payload: unknown) => void
type StateChangeHandler = (state: WSConnectionState) => void

const MAX_RECONNECT_ATTEMPTS = 10
const MAX_RECONNECT_DELAY = 30000 // 30s
const INITIAL_RECONNECT_DELAY = 1000 // 1s
const HEARTBEAT_INTERVAL = 30000 // 30s
const HEARTBEAT_TIMEOUT = 10000 // 10s

export class MalakaWSClient {
  private ws: WebSocket | null = null
  private url: string
  private token: string
  private handlers = new Map<WSMessageType, Set<MessageHandler>>()
  private stateHandlers = new Set<StateChangeHandler>()
  private state: WSConnectionState = 'disconnected'
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private heartbeatTimeout: ReturnType<typeof setTimeout> | null = null
  private intentionalClose = false

  constructor(url: string, token: string) {
    this.url = url
    this.token = token
  }

  connect(): void {
    if (this.state === 'connecting' || this.state === 'connected') return

    this.intentionalClose = false
    this.setState('connecting')

    const wsUrl = `${this.url}?token=${encodeURIComponent(this.token)}`
    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      this.setState('connected')
      this.reconnectAttempts = 0
      this.startHeartbeat()
    }

    this.ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data)
        this.handleMessage(msg)
      } catch {
        // Ignore malformed messages
      }
    }

    this.ws.onclose = () => {
      this.stopHeartbeat()
      this.setState('disconnected')

      if (!this.intentionalClose) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = () => {
      // Error will trigger onclose, which handles reconnection
    }
  }

  close(): void {
    this.intentionalClose = true
    this.setState('disconnecting')
    this.stopHeartbeat()
    this.clearReconnect()
    this.reconnectAttempts = 0

    if (this.ws) {
      this.ws.close(1000, 'Client closing')
      this.ws = null
    }

    this.setState('disconnected')
  }

  send(message: WSMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  on(type: WSMessageType, handler: MessageHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler)
  }

  off(type: WSMessageType, handler: MessageHandler): void {
    this.handlers.get(type)?.delete(handler)
  }

  onStateChange(handler: StateChangeHandler): void {
    this.stateHandlers.add(handler)
  }

  offStateChange(handler: StateChangeHandler): void {
    this.stateHandlers.delete(handler)
  }

  getState(): WSConnectionState {
    return this.state
  }

  private setState(newState: WSConnectionState): void {
    if (this.state === newState) return
    this.state = newState
    this.stateHandlers.forEach((h) => h(newState))
  }

  private handleMessage(msg: WSMessage): void {
    // Handle pong for heartbeat
    if (msg.type === 'pong') {
      this.clearHeartbeatTimeout()
      return
    }

    const handlers = this.handlers.get(msg.type)
    if (handlers) {
      handlers.forEach((h) => h(msg.payload))
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: new Date().toISOString() })
        this.heartbeatTimeout = setTimeout(() => {
          // No pong received, connection is likely dead
          this.ws?.close()
        }, HEARTBEAT_TIMEOUT)
      }
    }, HEARTBEAT_INTERVAL)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    this.clearHeartbeatTimeout()
  }

  private clearHeartbeatTimeout(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('[WS] Max reconnect attempts reached')
      return
    }

    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts),
      MAX_RECONNECT_DELAY
    )

    this.reconnectAttempts++
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

/**
 * Build the WebSocket URL from the current environment.
 */
export function getWSUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws'
  const host = apiUrl.replace(/^https?:\/\//, '')
  return `${wsProtocol}://${host}/api/v1/ws`
}
