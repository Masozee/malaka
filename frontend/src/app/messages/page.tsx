'use client'

import { useState, useEffect, useRef, Suspense, useCallback } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/contexts/auth-context'
import { useSecondarySidebarSlot } from '@/contexts/sidebar-context'
import { useMessaging } from '@/hooks/useMessaging'
import { messagingService, type ParticipantInfo, type AttachmentMeta } from '@/services/messaging'
import { MessageBubble } from '@/components/messaging/MessageBubble'
import { AttachmentUploader } from '@/components/messaging/AttachmentUploader'
import { useSearchParams } from 'next/navigation'

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <TwoLevelLayout>
        <Header
          title="Personal Chat"
          compact
          breadcrumbs={[
            { label: "Chat", href: "/messages" },
            { label: "Personal Chat" }
          ]}
        />
        <div className="flex-1 overflow-auto p-6">
          <Suspense fallback={<div className="flex items-center justify-center h-96"><div className="text-gray-500">Loading...</div></div>}>
            <MessagesContent />
          </Suspense>
        </div>
      </TwoLevelLayout>
    </ProtectedRoute>
  )
}

// Conversation list injected into the second sidebar
function ConversationsSidebar({
  conversations,
  activeConversationId,
  isLoading,
  onSelectConversation,
  onNewConversation,
}: {
  conversations: ReturnType<typeof useMessaging>['conversations']
  activeConversationId: string | null
  isLoading: boolean
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conversations</span>
        <button
          onClick={onNewConversation}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="px-3 py-4 text-center text-gray-500 text-xs">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="px-3 py-4 text-center text-gray-500 text-xs">
            No conversations yet
          </div>
        ) : (
          conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full text-left px-3 py-2.5 hover:bg-white dark:hover:bg-gray-700 transition-colors ${
                conv.id === activeConversationId ? 'bg-white dark:bg-gray-700' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xs font-medium flex-shrink-0">
                  {(conv.other_user?.full_name || conv.other_user?.email || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {conv.other_user?.full_name || conv.other_user?.email || 'Unknown'}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-blue-600 text-white rounded-full flex-shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">
                    {conv.other_user?.email || ''}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

function MessagesContent() {
  const { user } = useAuth()
  const { setSlotContent } = useSecondarySidebarSlot()
  const {
    conversations,
    activeConversationId,
    messages,
    typingUsers,
    isLoading,
    loadMessages,
    sendMessage,
    sendTypingIndicator,
    startConversation,
    clearChat,
    archiveConversation,
    deleteConversation,
    uploadAttachment,
  } = useMessaging('personal')

  const searchParams = useSearchParams()
  const [inputText, setInputText] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState<AttachmentMeta[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [showContactPicker, setShowContactPicker] = useState(false)
  const [contacts, setContacts] = useState<ParticipantInfo[]>([])
  const [contactSearch, setContactSearch] = useState('')
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: 'clear' | 'archive' | 'delete'; label: string } | null>(null)
  const actionMenuRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Inject conversation list into the second sidebar
  useEffect(() => {
    setSlotContent(
      <ConversationsSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        isLoading={isLoading}
        onSelectConversation={loadMessages}
        onNewConversation={() => setShowContactPicker(true)}
      />
    )
    return () => setSlotContent(null)
  }, [conversations, activeConversationId, isLoading, loadMessages, setSlotContent])

  // Auto-open conversation from URL param
  useEffect(() => {
    const convId = searchParams.get('conversation')
    if (convId && convId !== activeConversationId) {
      loadMessages(convId)
    }
  }, [searchParams, activeConversationId, loadMessages])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load contacts when picker opens
  useEffect(() => {
    if (showContactPicker) {
      messagingService.getCompanyUsers().then(setContacts)
    }
  }, [showContactPicker])

  // Close action menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setShowActionMenu(false)
      }
    }
    if (showActionMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActionMenu])

  const handleConfirmAction = useCallback(async () => {
    if (!confirmAction || !activeConversationId) return
    if (confirmAction.type === 'clear') {
      await clearChat(activeConversationId)
    } else if (confirmAction.type === 'archive') {
      await archiveConversation(activeConversationId)
    } else if (confirmAction.type === 'delete') {
      await deleteConversation(activeConversationId)
    }
    setConfirmAction(null)
  }, [confirmAction, activeConversationId, clearChat, archiveConversation, deleteConversation])

  const activeConversation = conversations.find(c => c.id === activeConversationId)
  const otherUser = activeConversation?.other_user

  const handleSend = async () => {
    if ((!inputText.trim() && pendingAttachments.length === 0) || !activeConversationId || !otherUser) return

    const text = inputText.trim()
    const attIds = pendingAttachments.map(a => a.id)
    setInputText('')
    setPendingAttachments([])

    const success = await sendMessage(activeConversationId, otherUser.user_id, text, attIds.length > 0 ? attIds : undefined)
    if (!success) {
      setInputText(text)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTyping = () => {
    if (!activeConversationId) return
    sendTypingIndicator(activeConversationId, true)

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      sendTypingIndicator(activeConversationId, false)
    }, 2000)
  }

  const handleStartConversation = async (contact: ParticipantInfo) => {
    const conv = await startConversation(contact.user_id)
    if (conv) {
      loadMessages(conv.id)
    }
    setShowContactPicker(false)
  }

  const filteredContacts = contacts.filter(c =>
    c.full_name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(contactSearch.toLowerCase())
  )

  const isTypingInActive = Array.from(typingUsers.entries()).some(
    ([, convId]) => convId === activeConversationId
  )

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Chat view - full width since conversations are in the sidebar */}
        <div className="flex-1 flex flex-col">
          {!activeConversationId ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="mt-2 text-sm">Select a conversation or start a new one</p>
                <p className="text-xs text-gray-400 mt-1">Messages are end-to-end encrypted</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-medium mr-3">
                    {(otherUser?.full_name || otherUser?.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {otherUser?.full_name || otherUser?.email || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isTypingInActive ? 'Typing...' : 'End-to-end encrypted'}
                    </p>
                  </div>
                </div>

                {/* 3-dot action menu */}
                <div className="relative" ref={actionMenuRef}>
                  <button
                    onClick={() => setShowActionMenu(prev => !prev)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {showActionMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <button
                        onClick={() => {
                          setConfirmAction({ type: 'clear', label: 'Clear all messages in this conversation?' })
                          setShowActionMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Clear chat
                      </button>
                      <button
                        onClick={() => {
                          setConfirmAction({ type: 'archive', label: 'Archive this conversation? It will be hidden from your list.' })
                          setShowActionMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Archive conversation
                      </button>
                      <button
                        onClick={() => {
                          setConfirmAction({ type: 'delete', label: 'Delete this conversation? This cannot be undone.' })
                          setShowActionMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Delete conversation
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isMine={msg.sender_id === user?.id}
                    accentColor="blue"
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {activeConversationId && (
                  <AttachmentUploader
                    conversationId={activeConversationId}
                    onUploadComplete={(metas) => setPendingAttachments(prev => [...prev, ...metas])}
                    onUploading={setIsUploadingFiles}
                    uploadAttachment={uploadAttachment}
                    accentColor="blue"
                  />
                )}
                <div className="flex items-end gap-2 mt-1">
                  <textarea
                    value={inputText}
                    onChange={e => {
                      setInputText(e.target.value)
                      handleTyping()
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 max-h-32"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={(!inputText.trim() && pendingAttachments.length === 0) || isUploadingFiles}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    Send
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  End-to-end encrypted
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-sm shadow-xl p-6">
            <p className="text-sm text-gray-900 dark:text-gray-100 mb-4">{confirmAction.label}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${
                  confirmAction.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact picker modal */}
      {showContactPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">New Conversation</h3>
              <button
                onClick={() => setShowContactPicker(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <input
                type="text"
                value={contactSearch}
                onChange={e => setContactSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 mb-3"
              />
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredContacts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No users found</p>
                ) : (
                  filteredContacts.map(contact => (
                    <button
                      key={contact.user_id}
                      onClick={() => handleStartConversation(contact)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-medium mr-3">
                        {(contact.full_name || contact.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {contact.full_name || contact.username}
                        </p>
                        <p className="text-xs text-gray-500">{contact.email}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
