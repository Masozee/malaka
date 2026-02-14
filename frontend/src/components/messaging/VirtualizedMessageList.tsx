'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { DecryptedMessage } from '@/services/messaging'
import { MessageBubble } from './MessageBubble'

interface VirtualizedMessageListProps {
  messages: DecryptedMessage[]
  currentUserId: string
  accentColor: 'blue' | 'purple'
  showSender: boolean
  onDelete: (messageId: string) => void
}

export function VirtualizedMessageList({
  messages,
  currentUserId,
  accentColor,
  showSender,
  onDelete,
}: VirtualizedMessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const prevMessageCountRef = useRef(0)
  const isNearBottomRef = useRef(true)

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
    measureElement: (element) => {
      return element.getBoundingClientRect().height
    },
  })

  // Check if user is near bottom of scroll
  const checkNearBottom = useCallback(() => {
    const el = parentRef.current
    if (!el) return true
    const threshold = 200
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  }, [])

  // Auto-scroll to bottom on new messages (only if near bottom)
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      if (isNearBottomRef.current) {
        // Small delay to let virtualizer measure
        requestAnimationFrame(() => {
          virtualizer.scrollToIndex(messages.length - 1, { align: 'end', behavior: 'smooth' })
        })
      }
    }
    prevMessageCountRef.current = messages.length
  }, [messages.length, virtualizer])

  // Scroll to end on initial load / conversation switch
  useEffect(() => {
    if (messages.length > 0) {
      // Use instant scroll for conversation switch
      requestAnimationFrame(() => {
        virtualizer.scrollToIndex(messages.length - 1, { align: 'end' })
      })
    }
    // Reset when message list identity changes (new conversation)
    prevMessageCountRef.current = messages.length
    isNearBottomRef.current = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length === 0 ? 'empty' : messages[0]?.conversation_id])

  const handleScroll = useCallback(() => {
    isNearBottomRef.current = checkNearBottom()
  }, [checkNearBottom])

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div
      ref={parentRef}
      className="flex-1 overflow-y-auto p-4"
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map(virtualItem => {
          const msg = messages[virtualItem.index]
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className="py-1.5">
                <MessageBubble
                  msg={msg}
                  isMine={msg.sender_id === currentUserId || msg.sender_id === '__self__'}
                  accentColor={accentColor}
                  showSender={showSender}
                  onDelete={onDelete}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
