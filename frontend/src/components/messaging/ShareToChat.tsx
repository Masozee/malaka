'use client'

import { useState, useEffect, useCallback } from 'react'
import { messagingService, buildMessageContent, type Conversation, type EntityRef } from '@/services/messaging'

interface ShareToChatProps {
  entityRef: EntityRef
  onClose: () => void
}

export function ShareToChat({ entityRef, onClose }: ShareToChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    messagingService.listConversations().then(convs => {
      setConversations(convs)
      setIsLoading(false)
    })
  }, [])

  const filteredConversations = conversations.filter(conv => {
    const name = conv.is_group
      ? conv.name || ''
      : conv.other_user?.full_name || conv.other_user?.email || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const handleSend = useCallback(async () => {
    if (!selectedConvId) return
    setIsSending(true)

    const content = buildMessageContent(message || undefined, undefined, [entityRef])
    const sent = await messagingService.sendMessage(selectedConvId, content)

    setIsSending(false)
    if (sent) {
      onClose()
    }
  }, [selectedConvId, message, entityRef, onClose])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Share to Chat</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview card */}
        <div className="px-4 pt-4">
          <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                {entityRef.type.replace(/_/g, ' ')}
              </span>
              {entityRef.status && (
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {entityRef.status}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{entityRef.title}</p>
            {entityRef.subtitle && (
              <p className="text-[11px] text-gray-500 mt-0.5">{entityRef.subtitle}</p>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Optional message */}
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Add a message (optional)..."
            className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
            rows={2}
          />

          {/* Conversation search */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
          />

          {/* Conversation list */}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {isLoading ? (
              <p className="text-sm text-gray-500 text-center py-4">Loading...</p>
            ) : filteredConversations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No conversations found</p>
            ) : (
              filteredConversations.map(conv => {
                const isGroup = conv.is_group
                const name = isGroup
                  ? conv.name || 'Unnamed Group'
                  : conv.other_user?.full_name || conv.other_user?.email || 'Unknown'
                const isSelected = conv.id === selectedConvId

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-center ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-300 dark:ring-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium mr-2.5 flex-shrink-0 ${
                      isGroup
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                    }`}>
                      {name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {name}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {isGroup ? 'Group' : conv.other_user?.email || ''}
                      </p>
                    </div>
                    {isSelected && (
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!selectedConvId || isSending}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
