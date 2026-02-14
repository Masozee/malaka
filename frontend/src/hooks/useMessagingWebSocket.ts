'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from '@/contexts/websocket-context'
import { useAuth } from '@/contexts/auth-context'
import { queryKeys } from '@/lib/query-client'
import { parseMessageContent, type DecryptedMessage, type AttachmentMeta } from '@/services/messaging'
import type { ChatMessagePayload, TypingIndicatorPayload } from '@/lib/websocket'

interface UseMessagingWebSocketOptions {
  activeConversationId: string | null
}

export function useMessagingWebSocket({ activeConversationId }: UseMessagingWebSocketOptions) {
  const { user } = useAuth()
  const { subscribe, unsubscribe, sendMessage: wsSend } = useWebSocket()
  const queryClient = useQueryClient()

  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())
  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Handle incoming chat messages — update TanStack Query cache
  useEffect(() => {
    const handleChatMessage = (payload: unknown) => {
      const data = payload as ChatMessagePayload
      if (!user?.id) return

      // Dedup: skip messages from own sender (optimistic path already handled these)
      if (data.sender_id === user.id) return

      const plaintext = data.encrypted_content
      const parsed_content = parseMessageContent(plaintext)

      const attachment_metas: AttachmentMeta[] | undefined = data.attachments?.map(a => ({
        id: a.id,
        conversation_id: data.conversation_id,
        uploader_id: data.sender_id,
        file_name: a.file_name,
        original_name: a.original_name,
        content_type: a.content_type,
        file_size: a.file_size,
        storage_key: '',
        file_category: a.file_category,
        width: a.width,
        height: a.height,
        created_at: data.created_at,
        url: a.url,
      }))

      const msg: DecryptedMessage = {
        id: data.message_id,
        conversation_id: data.conversation_id,
        sender_id: data.sender_id,
        encrypted_content: data.encrypted_content,
        nonce: data.nonce || '',
        sender_public_key_id: data.sender_public_key_id,
        created_at: data.created_at,
        sender_username: data.sender_username,
        plaintext,
        parsed_content,
        attachment_metas,
      }

      // Append to active conversation's message cache
      if (data.conversation_id === activeConversationId) {
        const msgKey = queryKeys.messaging.messages.list(data.conversation_id)
        queryClient.setQueryData<DecryptedMessage[]>(msgKey, old => {
          if (!old) return [msg]
          // Prevent duplicates
          if (old.some(m => m.id === msg.id)) return old
          return [...old, msg]
        })
      }

      // Invalidate conversations and unread count
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.unreadCount })
    }

    subscribe('chat_message', handleChatMessage)
    return () => unsubscribe('chat_message', handleChatMessage)
  }, [subscribe, unsubscribe, activeConversationId, user?.id, queryClient])

  // Handle typing indicators — local state only
  useEffect(() => {
    const handleTyping = (payload: unknown) => {
      const data = payload as TypingIndicatorPayload

      if (data.is_typing) {
        setTypingUsers(prev => {
          const next = new Map(prev)
          next.set(data.user_id, data.conversation_id)
          return next
        })

        const existing = typingTimeoutsRef.current.get(data.user_id)
        if (existing) clearTimeout(existing)
        typingTimeoutsRef.current.set(
          data.user_id,
          setTimeout(() => {
            setTypingUsers(prev => {
              const next = new Map(prev)
              next.delete(data.user_id)
              return next
            })
          }, 3000)
        )
      } else {
        setTypingUsers(prev => {
          const next = new Map(prev)
          next.delete(data.user_id)
          return next
        })
      }
    }

    subscribe('typing_indicator', handleTyping)
    return () => unsubscribe('typing_indicator', handleTyping)
  }, [subscribe, unsubscribe])

  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    wsSend('typing_indicator', { conversation_id: conversationId, is_typing: isTyping })
  }, [wsSend])

  return { typingUsers, sendTypingIndicator }
}
