import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { API_BASE_URL } from '@/constants/theme';
import { getSecureItem } from '@/utils/storage';

export interface WsMessage {
  type: string;
  payload: any;
  timestamp: string;
}

interface UseChatSocketOptions {
  onChatMessage?: (payload: any) => void;
  onTypingIndicator?: (payload: any) => void;
  onNotification?: (payload: any) => void;
  enabled?: boolean;
}

export function useChatSocket(options: UseChatSocketOptions) {
  const { onChatMessage, onTypingIndicator, onNotification, enabled = true } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const pingTimerRef = useRef<ReturnType<typeof setInterval>>();

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const token = await getSecureItem('accessToken');
    if (!token) return;

    // Convert https:// to wss:// or http:// to ws://
    const wsBase = API_BASE_URL.replace(/^https/, 'wss').replace(/^http/, 'ws');
    const wsUrl = `${wsBase}/ws?token=${token}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Start ping interval (every 30s)
        pingTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          switch (msg.type) {
            case 'chat_message':
              onChatMessage?.(msg.payload);
              break;
            case 'typing_indicator':
              onTypingIndicator?.(msg.payload);
              break;
            case 'notification':
              onNotification?.(msg.payload);
              break;
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        cleanup();
        // Reconnect after 3s
        reconnectTimerRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // Retry after 5s
      reconnectTimerRef.current = setTimeout(connect, 5000);
    }
  }, [onChatMessage, onTypingIndicator, onNotification]);

  const cleanup = useCallback(() => {
    if (pingTimerRef.current) clearInterval(pingTimerRef.current);
    pingTimerRef.current = undefined;
  }, []);

  const disconnect = useCallback(() => {
    cleanup();
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = undefined;
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [cleanup]);

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'typing_indicator',
          payload: { conversation_id: conversationId, is_typing: isTyping },
        })
      );
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    connect();

    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') connect();
      else if (state === 'background') disconnect();
    };
    const sub = AppState.addEventListener('change', handleAppState);

    return () => {
      disconnect();
      sub.remove();
    };
  }, [enabled, connect, disconnect]);

  return { sendTyping, disconnect, reconnect: connect };
}
