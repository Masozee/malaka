'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import {
  messagingService,
  parseMessageContent,
  buildMessageContent,
  type Conversation,
  type DecryptedMessage,
  type AttachmentMeta,
  type EntityRef,
  type ParticipantInfo,
} from '@/services/messaging'

// ─── Queries ────────────────────────────────────────────────────────

export function useConversations(type?: 'personal' | 'group') {
  return useQuery({
    queryKey: queryKeys.messaging.conversations.list(type),
    queryFn: async (): Promise<Conversation[]> => {
      let convs: Conversation[]
      if (type) {
        convs = await messagingService.listConversations(type)
      } else {
        const [personal, groups] = await Promise.all([
          messagingService.listConversations('personal'),
          messagingService.listConversations('group'),
        ])
        const convMap = new Map<string, Conversation>()
        personal.forEach(c => convMap.set(c.id, c))
        groups.forEach(c => convMap.set(c.id, c))
        convs = Array.from(convMap.values())
      }
      convs.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      return convs
    },
    staleTime: 30 * 1000,
  })
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: queryKeys.messaging.messages.list(conversationId || ''),
    queryFn: async (): Promise<DecryptedMessage[]> => {
      if (!conversationId) return []
      const raw = await messagingService.listMessages(conversationId)

      // API returns newest first; reverse for chronological display
      const mapped: DecryptedMessage[] = raw.map(m => {
        const plaintext = m.encrypted_content
        const parsed_content = parseMessageContent(plaintext)
        return { ...m, plaintext, parsed_content }
      }).reverse()

      // Batch-load attachment metadata
      const allAttIds = mapped.flatMap(m => m.parsed_content?.attachments ?? [])
      if (allAttIds.length > 0) {
        const attMap = new Map<string, AttachmentMeta>()
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

      return mapped
    },
    enabled: !!conversationId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.messaging.unreadCount,
    queryFn: () => messagingService.getUnreadCount(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

export function useCompanyUsers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.messaging.companyUsers,
    queryFn: () => messagingService.getCompanyUsers(),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useGroupMembers(conversationId: string | null) {
  return useQuery({
    queryKey: queryKeys.messaging.groupMembers(conversationId || ''),
    queryFn: () => messagingService.getGroupMembers(conversationId!),
    enabled: !!conversationId,
  })
}

// ─── Mutations with optimistic updates ──────────────────────────────

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      conversationId: string
      recipientId: string
      text: string
      attachmentIds?: string[]
      entityRefs?: EntityRef[]
      attachmentMetas?: AttachmentMeta[]
    }) => {
      const content = buildMessageContent(params.text, params.attachmentIds, params.entityRefs)
      const sent = await messagingService.sendMessage(params.conversationId, content, params.attachmentIds)
      if (!sent) throw new Error('Failed to send message')
      return { sent, content, attachmentMetas: params.attachmentMetas }
    },
    onMutate: async (params) => {
      const msgKey = queryKeys.messaging.messages.list(params.conversationId)
      await queryClient.cancelQueries({ queryKey: msgKey })

      const previous = queryClient.getQueryData<DecryptedMessage[]>(msgKey)

      const content = buildMessageContent(params.text, params.attachmentIds, params.entityRefs)
      const parsed_content = parseMessageContent(content)
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`

      const optimistic: DecryptedMessage = {
        id: tempId,
        conversation_id: params.conversationId,
        sender_id: '__self__', // placeholder, page replaces with real user id for isMine check
        encrypted_content: content,
        nonce: '',
        created_at: new Date().toISOString(),
        sender_username: '',
        plaintext: content,
        parsed_content,
        attachment_metas: params.attachmentMetas,
      }

      queryClient.setQueryData<DecryptedMessage[]>(msgKey, old => [...(old || []), optimistic])

      return { previous, tempId }
    },
    onError: (_err, params, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.messaging.messages.list(params.conversationId),
          context.previous
        )
      }
    },
    onSuccess: (data, params, context) => {
      const msgKey = queryKeys.messaging.messages.list(params.conversationId)
      // Replace optimistic message with server message
      queryClient.setQueryData<DecryptedMessage[]>(msgKey, old => {
        if (!old) return old
        return old.map(m => {
          if (m.id === context?.tempId) {
            const parsed_content = parseMessageContent(data.sent.encrypted_content)
            return {
              ...data.sent,
              plaintext: data.sent.encrypted_content,
              parsed_content,
              attachment_metas: data.attachmentMetas,
            }
          }
          return m
        })
      })
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations.all })
    },
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { messageId: string; conversationId: string }) => {
      const success = await messagingService.deleteMessage(params.messageId)
      if (!success) throw new Error('Failed to delete message')
      return success
    },
    onMutate: async (params) => {
      const msgKey = queryKeys.messaging.messages.list(params.conversationId)
      await queryClient.cancelQueries({ queryKey: msgKey })
      const previous = queryClient.getQueryData<DecryptedMessage[]>(msgKey)

      queryClient.setQueryData<DecryptedMessage[]>(msgKey, old =>
        old?.map(m =>
          m.id === params.messageId ? { ...m, deleted_at: new Date().toISOString() } : m
        )
      )

      return { previous }
    },
    onError: (_err, params, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.messaging.messages.list(params.conversationId),
          context.previous
        )
      }
    },
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations.all })
    },
  })
}

// ─── Mutations (invalidation only) ──────────────────────────────────

export function useClearChat() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const success = await messagingService.clearMessages(conversationId)
      if (!success) throw new Error('Failed to clear chat')
    },
    onSuccess: (_data, conversationId) => {
      queryClient.setQueryData(queryKeys.messaging.messages.list(conversationId), [])
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations.all })
    },
  })
}

export function useArchiveConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const success = await messagingService.archiveConversation(conversationId)
      if (!success) throw new Error('Failed to archive conversation')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations.all })
    },
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const success = await messagingService.deleteConversation(conversationId)
      if (!success) throw new Error('Failed to delete conversation')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations.all })
    },
  })
}

export function useStartConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (recipientId: string) => messagingService.getOrCreateConversation(recipientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations.all })
    },
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { name: string; participantIds: string[] }) =>
      messagingService.createGroup(params.name, params.participantIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations.all })
    },
  })
}

export function useAddGroupMembers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { conversationId: string; userIds: string[] }) =>
      messagingService.addGroupMembers(params.conversationId, params.userIds),
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.groupMembers(params.conversationId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations.all })
    },
  })
}

export function useRemoveGroupMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { conversationId: string; userId: string }) =>
      messagingService.removeGroupMember(params.conversationId, params.userId),
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.groupMembers(params.conversationId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations.all })
    },
  })
}

export function useLeaveGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => messagingService.leaveGroup(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations.all })
    },
  })
}

export function useUpdateGroupName() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { conversationId: string; name: string }) =>
      messagingService.updateGroupName(params.conversationId, params.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations.all })
    },
  })
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => messagingService.markConversationRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.unreadCount })
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations.all })
    },
  })
}

export function useUploadAttachment() {
  return useMutation({
    mutationFn: (params: { conversationId: string; file: File }) =>
      messagingService.uploadAttachment(params.conversationId, params.file),
  })
}
