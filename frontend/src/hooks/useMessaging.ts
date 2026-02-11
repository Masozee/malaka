'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useWebSocket } from '@/contexts/websocket-context'
import { messagingService, parseMessageContent, buildMessageContent, type Conversation, type DecryptedMessage, type ParticipantInfo, type EntityRef, type AttachmentMeta } from '@/services/messaging'
import type { ChatMessagePayload, TypingIndicatorPayload } from '@/lib/websocket'

export function useMessaging(type?: 'personal' | 'group') {
  const { user } = useAuth()
  const { subscribe, unsubscribe, sendMessage: wsSend } = useWebSocket()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<DecryptedMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const typingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const conversationsRef = useRef<Conversation[]>([])
  const initialLoadDoneRef = useRef(false)

  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/notifications.wav')
      audio.volume = 0.5
      audio.play().catch(() => {})
    } catch {
      // Audio not supported
    }
  }, [])

  // Load conversations
  const loadConversations = useCallback(async () => {
    // Only show loading spinner on initial load to prevent flickering
    if (!initialLoadDoneRef.current) {
      setIsLoading(true)
    }
    let convs: Conversation[] = []

    if (type) {
      convs = await messagingService.listConversations(type)
    } else {
      // Fetch both types if no specific type is requested
      const [personal, groups] = await Promise.all([
        messagingService.listConversations('personal'),
        messagingService.listConversations('group')
      ])
      // Use a Map to deduplicate by ID just in case
      const convMap = new Map<string, Conversation>()
      personal.forEach(c => convMap.set(c.id, c))
      groups.forEach(c => convMap.set(c.id, c))
      convs = Array.from(convMap.values())
    }

    // Sort by updated_at desc
    convs.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    conversationsRef.current = convs
    setConversations(convs)
    setIsLoading(false)
    initialLoadDoneRef.current = true
  }, [type])

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    const count = await messagingService.getUnreadCount()
    setUnreadCount(count)
  }, [])

  useEffect(() => {
    if (!user?.id) return
    loadConversations()
    loadUnreadCount()
  }, [user?.id, loadConversations, loadUnreadCount])

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    // Verify the conversation exists in our list first
    const conv = conversationsRef.current.find(c => c.id === conversationId)
    if (!conv) {
      // Conversation may have been deleted; refresh list and bail
      loadConversations()
      return
    }

    setActiveConversationId(conversationId)
    const raw = await messagingService.listMessages(conversationId)

    // API returns newest first; reverse for chronological display
    const mapped: DecryptedMessage[] = raw.map(m => {
      const plaintext = m.encrypted_content
      const parsed_content = parseMessageContent(plaintext)
      return { ...m, plaintext, parsed_content }
    }).reverse()

    // Batch-load attachment metadata for messages that reference attachments
    const allAttIds = mapped.flatMap(m => m.parsed_content?.attachments ?? [])
    const attMap = new Map<string, AttachmentMeta>()
    if (allAttIds.length > 0) {
      const results = await Promise.allSettled(
        [...new Set(allAttIds)].map(id => messagingService.getAttachment(id))
      )
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value) {
          attMap.set(r.value.id, r.value)
        }
      })
      mapped.forEach(m => {
        const ids = m.parsed_content?.attachments
        if (ids && ids.length > 0) {
          m.attachment_metas = ids.map(id => attMap.get(id)).filter(Boolean) as AttachmentMeta[]
        }
      })
    }

    setMessages(mapped)

    // Mark conversation read
    await messagingService.markConversationRead(conversationId)
    loadUnreadCount()
    loadConversations()
  }, [loadUnreadCount, loadConversations])

  // Send a message
  const sendMessageToConversation = useCallback(async (
    conversationId: string,
    _recipientId: string,
    plaintext: string,
    attachmentIds?: string[],
    entityRefs?: EntityRef[],
    attachmentMetas?: AttachmentMeta[]
  ): Promise<boolean> => {
    const content = buildMessageContent(plaintext, attachmentIds, entityRefs)
    const sent = await messagingService.sendMessage(conversationId, content, attachmentIds)
    if (sent) {
      const parsed_content = parseMessageContent(content)
      const decrypted: DecryptedMessage = { ...sent, plaintext: content, parsed_content, attachment_metas: attachmentMetas }
      setMessages(prev => [...prev, decrypted])
      loadConversations()
      return true
    }
    return false
  }, [loadConversations])

  // Handle incoming chat messages via WebSocket
  useEffect(() => {
    const handleChatMessage = (payload: unknown) => {
      const data = payload as ChatMessagePayload
      if (!user?.id) return

      const plaintext = data.encrypted_content
      const parsed_content = parseMessageContent(plaintext)
      // Map WS attachment payloads to AttachmentMeta
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

      // If this message is for the active conversation, append
      if (data.conversation_id === activeConversationId) {
        setMessages(prev => [...prev, msg])
        messagingService.markConversationRead(data.conversation_id)
      }

      // Play notification sound for messages from others
      if (data.sender_id !== user.id) {
        playNotificationSound()
      }

      // Refresh conversation list and unread count
      loadConversations()
      loadUnreadCount()
    }

    subscribe('chat_message', handleChatMessage)
    return () => unsubscribe('chat_message', handleChatMessage)
  }, [subscribe, unsubscribe, activeConversationId, user?.id, loadConversations, loadUnreadCount, playNotificationSound])

  // Handle typing indicators via WebSocket
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

  // Send typing indicator
  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    wsSend('typing_indicator', { conversation_id: conversationId, is_typing: isTyping })
  }, [wsSend])

  // Soft-delete a single message
  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    const success = await messagingService.deleteMessage(messageId)
    if (success) {
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, deleted_at: new Date().toISOString() } : m
      ))
      loadConversations()
    }
    return success
  }, [loadConversations])

  // Clear all messages in a conversation
  const clearChat = useCallback(async (conversationId: string): Promise<boolean> => {
    const success = await messagingService.clearMessages(conversationId)
    if (success) {
      if (conversationId === activeConversationId) {
        setMessages([])
      }
      loadConversations()
    }
    return success
  }, [activeConversationId, loadConversations])

  // Archive a conversation
  const archiveConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    const success = await messagingService.archiveConversation(conversationId)
    if (success) {
      if (conversationId === activeConversationId) {
        setActiveConversationId(null)
        setMessages([])
      }
      loadConversations()
    }
    return success
  }, [activeConversationId, loadConversations])

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    const success = await messagingService.deleteConversation(conversationId)
    if (success) {
      if (conversationId === activeConversationId) {
        setActiveConversationId(null)
        setMessages([])
      }
      loadConversations()
    }
    return success
  }, [activeConversationId, loadConversations])

  // Start a new 1-on-1 conversation
  const startConversation = useCallback(async (recipientId: string): Promise<Conversation | null> => {
    const conv = await messagingService.getOrCreateConversation(recipientId)
    if (conv) {
      await loadConversations()
    }
    return conv
  }, [loadConversations])

  // --- Group operations ---

  const createGroup = useCallback(async (name: string, participantIds: string[]): Promise<Conversation | null> => {
    const conv = await messagingService.createGroup(name, participantIds)
    if (conv) {
      await loadConversations()
    }
    return conv
  }, [loadConversations])

  const getGroupMembers = useCallback(async (conversationId: string): Promise<ParticipantInfo[]> => {
    return messagingService.getGroupMembers(conversationId)
  }, [])

  const addGroupMembers = useCallback(async (conversationId: string, userIds: string[]): Promise<boolean> => {
    const success = await messagingService.addGroupMembers(conversationId, userIds)
    if (success) loadConversations()
    return success
  }, [loadConversations])

  const removeGroupMember = useCallback(async (conversationId: string, userId: string): Promise<boolean> => {
    const success = await messagingService.removeGroupMember(conversationId, userId)
    if (success) loadConversations()
    return success
  }, [loadConversations])

  const leaveGroup = useCallback(async (conversationId: string): Promise<boolean> => {
    const success = await messagingService.leaveGroup(conversationId)
    if (success) {
      if (conversationId === activeConversationId) {
        setActiveConversationId(null)
        setMessages([])
      }
      loadConversations()
    }
    return success
  }, [activeConversationId, loadConversations])

  const updateGroupName = useCallback(async (conversationId: string, name: string): Promise<boolean> => {
    const success = await messagingService.updateGroupName(conversationId, name)
    if (success) loadConversations()
    return success
  }, [loadConversations])

  // Upload a file attachment
  const uploadAttachment = useCallback(async (conversationId: string, file: File): Promise<AttachmentMeta | null> => {
    return messagingService.uploadAttachment(conversationId, file)
  }, [])

  return {
    conversations,
    activeConversationId,
    messages,
    typingUsers,
    unreadCount,
    isLoading,
    loadMessages,
    sendMessage: sendMessageToConversation,
    sendTypingIndicator,
    startConversation,
    loadConversations,
    deleteMessage,
    clearChat,
    archiveConversation,
    deleteConversation,
    uploadAttachment,
    // Group operations
    createGroup,
    getGroupMembers,
    addGroupMembers,
    removeGroupMember,
    leaveGroup,
    updateGroupName,
  }
}
