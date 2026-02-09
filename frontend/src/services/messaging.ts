/**
 * Messaging API Service
 * Type-safe API calls for E2E encrypted messaging endpoints.
 */

import { apiClient } from '@/lib/api'

// --- Types ---

export interface UserPublicKey {
  id: string
  user_id: string
  public_key_jwk: JsonWebKey
  key_fingerprint: string
  device_label: string
  created_at: string
  revoked_at?: string
}

export interface Conversation {
  id: string
  company_id: string
  is_group: boolean
  name?: string
  created_by?: string
  created_at: string
  updated_at: string
  last_message?: EncryptedMessage
  unread_count: number
  other_user?: ParticipantInfo
  participants?: ParticipantInfo[]
}

export interface EncryptedMessage {
  id: string
  conversation_id: string
  sender_id: string
  encrypted_content: string
  nonce: string
  sender_public_key_id?: string
  created_at: string
  deleted_at?: string
  sender_username: string
}

export interface AttachmentMeta {
  id: string
  message_id?: string
  conversation_id: string
  uploader_id: string
  file_name: string
  original_name: string
  content_type: string
  file_size: number
  storage_key: string
  file_category: 'image' | 'document'
  width?: number
  height?: number
  created_at: string
  url: string
}

export interface EntityRef {
  type: EntityType
  id: string
  title: string
  subtitle?: string
  status?: string
  status_color?: string
  url: string
}

export type EntityType =
  | 'sales_order'
  | 'purchase_order'
  | 'purchase_request'
  | 'invoice'
  | 'journal_entry'
  | 'employee'
  | 'article'
  | 'work_order'
  | 'quality_control'
  | 'goods_receipt'
  | 'stock_transfer'
  | 'supplier'
  | 'customer'
  | 'contract'

export interface MessageContent {
  text?: string
  attachments?: string[]
  entity_refs?: EntityRef[]
}

export interface DecryptedMessage extends EncryptedMessage {
  plaintext: string
  parsed_content?: MessageContent
  attachment_metas?: AttachmentMeta[]
}

// --- Message content utilities ---

export function parseMessageContent(plaintext: string): MessageContent {
  try {
    const parsed = JSON.parse(plaintext)
    if (typeof parsed === 'object' && parsed !== null &&
        ('text' in parsed || 'attachments' in parsed || 'entity_refs' in parsed)) {
      return parsed as MessageContent
    }
  } catch {
    // Not JSON, treat as plain text
  }
  return { text: plaintext }
}

export function buildMessageContent(
  text?: string,
  attachmentIds?: string[],
  entityRefs?: EntityRef[]
): string {
  const hasAttachments = attachmentIds && attachmentIds.length > 0
  const hasEntityRefs = entityRefs && entityRefs.length > 0

  // If only text and nothing else, return plain string for backward compat
  if (!hasAttachments && !hasEntityRefs) {
    return text || ''
  }

  const content: MessageContent = {}
  if (text) content.text = text
  if (hasAttachments) content.attachments = attachmentIds
  if (hasEntityRefs) content.entity_refs = entityRefs
  return JSON.stringify(content)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export interface ParticipantInfo {
  user_id: string
  username: string
  email: string
  full_name: string
  role?: string
}

export interface CompanyUser extends ParticipantInfo {
  has_public_key: boolean
}

// --- Service ---

class MessagingService {
  private baseUrl = '/api/v1/messaging'

  // --- Public Key endpoints ---

  async upsertPublicKey(publicKeyJWK: JsonWebKey, keyFingerprint: string, deviceLabel = 'default'): Promise<UserPublicKey | null> {
    try {
      return await apiClient.put<UserPublicKey>(`${this.baseUrl}/keys`, {
        public_key_jwk: publicKeyJWK,
        key_fingerprint: keyFingerprint,
        device_label: deviceLabel,
      })
    } catch (error) {
      console.error('Failed to upsert public key:', error)
      return null
    }
  }

  async getMyPublicKey(): Promise<UserPublicKey | null> {
    try {
      return await apiClient.get<UserPublicKey>(`${this.baseUrl}/keys/me`, undefined, { cache: false })
    } catch {
      return null
    }
  }

  async getPublicKey(userId: string): Promise<UserPublicKey | null> {
    try {
      return await apiClient.get<UserPublicKey>(`${this.baseUrl}/keys/${userId}`, undefined, { cache: false })
    } catch {
      return null
    }
  }

  // --- Conversation endpoints ---

  async listConversations(type?: 'personal' | 'group', limit = 50, offset = 0): Promise<Conversation[]> {
    try {
      const params: Record<string, string> = {
        limit: limit.toString(),
        offset: offset.toString(),
      }
      if (type) {
        params.type = type
      }
      return await apiClient.get<Conversation[]>(this.baseUrl + '/conversations', params, { cache: false })
    } catch (error) {
      console.error('Failed to list conversations:', error)
      return []
    }
  }

  async getOrCreateConversation(recipientId: string): Promise<Conversation | null> {
    try {
      return await apiClient.post<Conversation>(`${this.baseUrl}/conversations`, {
        recipient_id: recipientId,
      })
    } catch (error) {
      console.error('Failed to get/create conversation:', error)
      return null
    }
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      return await apiClient.get<Conversation>(`${this.baseUrl}/conversations/${conversationId}`, undefined, { cache: false })
    } catch (error) {
      console.error('Failed to get conversation:', error)
      return null
    }
  }

  async markConversationRead(conversationId: string): Promise<boolean> {
    try {
      await apiClient.post(`${this.baseUrl}/conversations/${conversationId}/read`)
      return true
    } catch {
      return false
    }
  }

  // --- Message endpoints ---

  async listMessages(conversationId: string, limit = 50, offset = 0): Promise<EncryptedMessage[]> {
    try {
      return await apiClient.get<EncryptedMessage[]>(
        `${this.baseUrl}/conversations/${conversationId}/messages`,
        { limit: limit.toString(), offset: offset.toString() },
        { cache: false }
      )
    } catch (error) {
      console.error('Failed to list messages:', error)
      return []
    }
  }

  async sendMessage(conversationId: string, content: string, attachmentIds?: string[]): Promise<EncryptedMessage | null> {
    try {
      const body: Record<string, unknown> = { content }
      if (attachmentIds && attachmentIds.length > 0) {
        body.attachment_ids = attachmentIds
      }
      return await apiClient.post<EncryptedMessage>(
        `${this.baseUrl}/conversations/${conversationId}/messages`,
        body
      )
    } catch (error) {
      console.error('Failed to send message:', error)
      return null
    }
  }

  async uploadAttachment(conversationId: string, file: File): Promise<AttachmentMeta | null> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      return await apiClient.post<AttachmentMeta>(
        `${this.baseUrl}/conversations/${conversationId}/attachments`,
        formData
      )
    } catch (error) {
      console.error('Failed to upload attachment:', error)
      return null
    }
  }

  async getAttachment(attachmentId: string): Promise<AttachmentMeta | null> {
    try {
      return await apiClient.get<AttachmentMeta>(`${this.baseUrl}/attachments/${attachmentId}`)
    } catch {
      return null
    }
  }

  // --- Conversation actions ---

  async clearMessages(conversationId: string): Promise<boolean> {
    try {
      await apiClient.post(`${this.baseUrl}/conversations/${conversationId}/clear`)
      return true
    } catch (error) {
      console.error('Failed to clear messages:', error)
      return false
    }
  }

  async archiveConversation(conversationId: string): Promise<boolean> {
    try {
      await apiClient.post(`${this.baseUrl}/conversations/${conversationId}/archive`)
      return true
    } catch (error) {
      console.error('Failed to archive conversation:', error)
      return false
    }
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      await apiClient.post(`${this.baseUrl}/conversations/${conversationId}/delete`)
      return true
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      return false
    }
  }

  // --- Group chat ---

  async createGroup(name: string, participantIds: string[]): Promise<Conversation | null> {
    try {
      return await apiClient.post<Conversation>(`${this.baseUrl}/conversations/group`, {
        name,
        participant_ids: participantIds,
      })
    } catch (error) {
      console.error('Failed to create group:', error)
      return null
    }
  }

  async getGroupMembers(conversationId: string): Promise<ParticipantInfo[]> {
    try {
      return await apiClient.get<ParticipantInfo[]>(
        `${this.baseUrl}/conversations/${conversationId}/members`,
        undefined,
        { cache: false }
      )
    } catch (error) {
      console.error('Failed to get group members:', error)
      return []
    }
  }

  async addGroupMembers(conversationId: string, userIds: string[]): Promise<boolean> {
    try {
      await apiClient.post(`${this.baseUrl}/conversations/${conversationId}/members`, {
        user_ids: userIds,
      })
      return true
    } catch (error) {
      console.error('Failed to add group members:', error)
      return false
    }
  }

  async removeGroupMember(conversationId: string, userId: string): Promise<boolean> {
    try {
      await apiClient.post(`${this.baseUrl}/conversations/${conversationId}/members/remove`, {
        user_id: userId,
      })
      return true
    } catch (error) {
      console.error('Failed to remove group member:', error)
      return false
    }
  }

  async leaveGroup(conversationId: string): Promise<boolean> {
    try {
      await apiClient.post(`${this.baseUrl}/conversations/${conversationId}/leave`)
      return true
    } catch (error) {
      console.error('Failed to leave group:', error)
      return false
    }
  }

  async updateGroupName(conversationId: string, name: string): Promise<boolean> {
    try {
      await apiClient.post(`${this.baseUrl}/conversations/${conversationId}/name`, { name })
      return true
    } catch (error) {
      console.error('Failed to update group name:', error)
      return false
    }
  }

  // --- Unread count ---

  async getUnreadCount(): Promise<number> {
    try {
      const res = await apiClient.get<{ count: number }>(`${this.baseUrl}/unread-count`, undefined, { cache: false })
      return res.count
    } catch {
      return 0
    }
  }

  // --- Company users ---

  async getCompanyUsers(): Promise<ParticipantInfo[]> {
    try {
      return await apiClient.get<ParticipantInfo[]>(`${this.baseUrl}/users`, undefined, { cache: false })
    } catch (error) {
      console.error('Failed to fetch company users:', error)
      return []
    }
  }
}

export const messagingService = new MessagingService()
export default messagingService
