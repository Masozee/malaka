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
import { MessagesSidebar } from '@/components/messaging/MessagesSidebar'

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <TwoLevelLayout>
        <Header
          title="Messages"
          compact
          breadcrumbs={[
            { label: "Messages" }
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

function MessagesContent() {
  const { user } = useAuth()
  const { setSlotContent } = useSecondarySidebarSlot()

  // Single hook instance for ALL conversations (no type filter)
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
  } = useMessaging()

  const searchParams = useSearchParams()
  const [inputText, setInputText] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState<AttachmentMeta[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)
  const [uploadResetKey, setUploadResetKey] = useState(0)
  const [showContactPicker, setShowContactPicker] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showAddMembers, setShowAddMembers] = useState(false)
  const [showRenameGroup, setShowRenameGroup] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ type: 'clear' | 'archive' | 'delete' | 'leave'; label: string } | null>(null)
  const [members, setMembers] = useState<ParticipantInfo[]>([])
  const [contacts, setContacts] = useState<ParticipantInfo[]>([])
  const [contactSearch, setContactSearch] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [groupName, setGroupName] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const actionMenuRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const attachTriggerRef = useRef<(() => void) | null>(null)

  // No more router.push — just load messages for any conversation type
  const handleSelectConversation = useCallback((conv: any) => {
    loadMessages(conv.id)
  }, [loadMessages])

  // Inject conversation list into the second sidebar
  useEffect(() => {
    setSlotContent(
      <MessagesSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        isLoading={isLoading}
        onSelectConversation={handleSelectConversation}
        onNewChat={() => setShowContactPicker(true)}
        onNewGroup={() => setShowCreateGroup(true)}
      />
    )
    return () => setSlotContent(null)
  }, [conversations, activeConversationId, isLoading, handleSelectConversation, setSlotContent])

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

  // Load contacts when picker or group creation opens
  useEffect(() => {
    if (showContactPicker || showCreateGroup || showAddMembers) {
      messagingService.getCompanyUsers().then(setContacts)
      setSelectedContacts([])
      setContactSearch('')
      setGroupName('')
    }
  }, [showContactPicker, showCreateGroup, showAddMembers])

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
    } else if (confirmAction.type === 'leave') {
      await leaveGroup(activeConversationId)
    }
    setConfirmAction(null)
  }, [confirmAction, activeConversationId, clearChat, archiveConversation, deleteConversation, leaveGroup])

  const activeConversation = conversations.find(c => c.id === activeConversationId)
  const isGroup = activeConversation?.is_group
  const otherUser = activeConversation?.other_user
  const isAdmin = activeConversation?.participants?.find(p => p.user_id === user?.id)?.role === 'admin'

  // Derive accent color based on conversation type
  const accentColor = isGroup ? 'purple' : 'blue'

  const handleSend = async () => {
    if ((!inputText.trim() && pendingAttachments.length === 0) || !activeConversationId) return

    const text = inputText.trim()
    const attIds = pendingAttachments.map(a => a.id)
    const attMetas = [...pendingAttachments]
    setInputText('')
    setPendingAttachments([])
    setUploadResetKey(k => k + 1)

    const recipientId = isGroup ? '' : (otherUser?.user_id || '')
    const success = await sendMessage(activeConversationId, recipientId, text, attIds.length > 0 ? attIds : undefined, undefined, attMetas.length > 0 ? attMetas : undefined)
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

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedContacts.length === 0) return
    const conv = await createGroup(groupName.trim(), selectedContacts)
    if (conv) {
      loadMessages(conv.id)
    }
    setShowCreateGroup(false)
  }

  const handleShowMembers = async () => {
    if (!activeConversationId) return
    const m = await getGroupMembers(activeConversationId)
    setMembers(m)
    setShowMembers(true)
  }

  const handleAddMembers = async () => {
    if (!activeConversationId || selectedContacts.length === 0) return
    await addGroupMembers(activeConversationId, selectedContacts)
    setShowAddMembers(false)
    const m = await getGroupMembers(activeConversationId)
    setMembers(m)
  }

  const handleRemoveMember = async (userId: string) => {
    if (!activeConversationId) return
    await removeGroupMember(activeConversationId, userId)
    const m = await getGroupMembers(activeConversationId)
    setMembers(m)
  }

  const handleRenameGroup = async () => {
    if (!activeConversationId || !newGroupName.trim()) return
    await updateGroupName(activeConversationId, newGroupName.trim())
    setShowRenameGroup(false)
  }

  const toggleContactSelection = (userId: string) => {
    setSelectedContacts(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const filteredContacts = contacts.filter(c =>
    (c.full_name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(contactSearch.toLowerCase())) &&
    (showAddMembers ? !members.some(m => m.user_id === c.user_id) : true)
  )

  const isTypingInActive = Array.from(typingUsers.entries()).some(
    ([, convId]) => convId === activeConversationId
  )

  // Chat header display name / avatar
  const chatName = isGroup
    ? (activeConversation?.name || 'Unnamed Group')
    : (otherUser?.full_name || otherUser?.email || 'Unknown')
  const chatInitial = (chatName[0] || '?').toUpperCase()
  const chatSubtext = isGroup
    ? (isTypingInActive ? 'Someone is typing...' : `${activeConversation?.participants?.length || 0} members`)
    : (isTypingInActive ? 'Typing...' : (otherUser?.email || ''))
  const avatarColor = isGroup
    ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300'
    : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
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
              {/* Chat header — adapts for personal vs group */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div
                  className={`flex items-center ${isGroup ? 'cursor-pointer' : ''}`}
                  onClick={isGroup ? handleShowMembers : undefined}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${avatarColor}`}>
                    {chatInitial}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{chatName}</p>
                    <p className="text-xs text-gray-500">{chatSubtext}</p>
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
                      {isGroup && (
                        <button
                          onClick={() => { handleShowMembers(); setShowActionMenu(false) }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          View members
                        </button>
                      )}
                      {isGroup && isAdmin && (
                        <>
                          <button
                            onClick={() => { setShowAddMembers(true); setShowActionMenu(false) }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Add members
                          </button>
                          <button
                            onClick={() => {
                              setNewGroupName(activeConversation?.name || '')
                              setShowRenameGroup(true)
                              setShowActionMenu(false)
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Rename group
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setConfirmAction({ type: 'clear', label: isGroup ? 'Clear all messages in this group?' : 'Clear all messages in this conversation?' })
                          setShowActionMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Clear chat
                      </button>
                      {!isGroup && (
                        <button
                          onClick={() => {
                            setConfirmAction({ type: 'archive', label: 'Archive this conversation? It will be hidden from your list.' })
                            setShowActionMenu(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Archive conversation
                        </button>
                      )}
                      {isGroup && (
                        <button
                          onClick={() => {
                            setConfirmAction({ type: 'leave', label: 'Leave this group? You will no longer receive messages.' })
                            setShowActionMenu(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Leave group
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setConfirmAction({ type: 'delete', label: isGroup ? 'Delete this group? This cannot be undone.' : 'Delete this conversation? This cannot be undone.' })
                          setShowActionMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {isGroup ? 'Delete group' : 'Delete conversation'}
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
                    accentColor={accentColor}
                    showSender={isGroup}
                    onDelete={(messageId) => deleteMessage(messageId)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {activeConversationId && (
                  <AttachmentUploader
                    key={uploadResetKey}
                    conversationId={activeConversationId}
                    onUploadComplete={(metas) => setPendingAttachments(prev => [...prev, ...metas])}
                    onUploading={setIsUploadingFiles}
                    uploadAttachment={uploadAttachment}
                    triggerRef={attachTriggerRef}
                    accentColor={accentColor}
                  />
                )}
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => attachTriggerRef.current?.()}
                    className={`p-2 rounded-lg border transition-colors flex-shrink-0 ${isGroup
                      ? 'text-purple-500 hover:text-purple-600 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                      : 'text-blue-500 hover:text-blue-600 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                    title="Attach file"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <textarea
                    value={inputText}
                    onChange={e => {
                      setInputText(e.target.value)
                      handleTyping()
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className={`flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 ${isGroup ? 'focus:ring-purple-500' : 'focus:ring-blue-500'} dark:bg-gray-800 dark:text-gray-100 max-h-32`}
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={(!inputText.trim() && pendingAttachments.length === 0) || isUploadingFiles}
                    className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium ${isGroup ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
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
                className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${confirmAction.type === 'clear'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact picker modal (new DM) */}
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

      {/* Create group modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Create Group</h3>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <input
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="Group name"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-gray-100"
              />
              <input
                type="text"
                value={contactSearch}
                onChange={e => setContactSearch(e.target.value)}
                placeholder="Search members..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-gray-100"
              />
              {selectedContacts.length > 0 && (
                <p className="text-xs text-gray-500">{selectedContacts.length} selected</p>
              )}
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredContacts.map(contact => (
                  <button
                    key={contact.user_id}
                    onClick={() => toggleContactSelection(contact.user_id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors flex items-center ${selectedContacts.includes(contact.user_id)
                      ? 'bg-purple-50 dark:bg-purple-900/30 ring-1 ring-purple-300 dark:ring-purple-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 text-xs font-medium mr-2 flex-shrink-0">
                      {(contact.full_name || contact.email)[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {contact.full_name || contact.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                    </div>
                    {selectedContacts.includes(contact.user_id) && (
                      <svg className="w-4 h-4 text-purple-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedContacts.length === 0}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members modal */}
      {showMembers && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Members ({members.length})
              </h3>
              <button
                onClick={() => setShowMembers(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto space-y-1">
              {members.map(member => (
                <div key={member.user_id} className="flex items-center p-2 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 text-sm font-medium mr-3 flex-shrink-0">
                    {(member.full_name || member.email)[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {member.full_name || member.username}
                      </p>
                      {member.role === 'admin' && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded">
                          Admin
                        </span>
                      )}
                      {member.user_id === user?.id && (
                        <span className="text-[10px] text-gray-400">You</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{member.email}</p>
                  </div>
                  {isAdmin && member.user_id !== user?.id && (
                    <button
                      onClick={() => handleRemoveMember(member.user_id)}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 flex-shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isAdmin && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => { setShowMembers(false); setShowAddMembers(true) }}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Add Members
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add members modal */}
      {showAddMembers && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Add Members</h3>
              <button
                onClick={() => setShowAddMembers(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <input
                type="text"
                value={contactSearch}
                onChange={e => setContactSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-gray-100"
              />
              {selectedContacts.length > 0 && (
                <p className="text-xs text-gray-500">{selectedContacts.length} selected</p>
              )}
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredContacts.map(contact => (
                  <button
                    key={contact.user_id}
                    onClick={() => toggleContactSelection(contact.user_id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors flex items-center ${selectedContacts.includes(contact.user_id)
                      ? 'bg-purple-50 dark:bg-purple-900/30 ring-1 ring-purple-300 dark:ring-purple-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 text-xs font-medium mr-2 flex-shrink-0">
                      {(contact.full_name || contact.email)[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {contact.full_name || contact.username}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                    </div>
                    {selectedContacts.includes(contact.user_id) && (
                      <svg className="w-4 h-4 text-purple-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={handleAddMembers}
                disabled={selectedContacts.length === 0}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Add Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename group modal */}
      {showRenameGroup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-sm shadow-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Rename Group</h3>
            <input
              type="text"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              placeholder="New group name"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-gray-100 mb-4"
              onKeyDown={e => { if (e.key === 'Enter') handleRenameGroup() }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRenameGroup(false)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameGroup}
                disabled={!newGroupName.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
