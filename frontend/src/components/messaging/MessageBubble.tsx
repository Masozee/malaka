'use client'

import { useState } from 'react'
import type { DecryptedMessage } from '@/services/messaging'
import { parseMessageContent } from '@/services/messaging'
import { ImagePreview } from './ImagePreview'
import { DocumentCard } from './DocumentCard'
import { EntityRefCard } from './EntityRefCard'

interface MessageBubbleProps {
  msg: DecryptedMessage
  isMine: boolean
  accentColor?: 'blue' | 'purple'
  showSender?: boolean
  onDelete?: (messageId: string) => void
}

export function MessageBubble({ msg, isMine, accentColor = 'blue', showSender = false, onDelete }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Soft-deleted message
  if (msg.deleted_at) {
    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-[70%] px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          {showSender && !isMine && (
            <p className={`text-[11px] font-medium mb-0.5 ${accentColor === 'purple' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {msg.sender_username}
            </p>
          )}
          <p className="text-sm italic text-gray-400 dark:text-gray-500">This message was deleted</p>
          <p className="text-[10px] mt-1 text-gray-300 dark:text-gray-600">
            {new Date(msg.created_at).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    )
  }

  const content = msg.parsed_content ?? parseMessageContent(msg.plaintext)
  const attachments = msg.attachment_metas ?? []
  const imageAttachments = attachments.filter(a => a.file_category === 'image')
  const docAttachments = attachments.filter(a => a.file_category === 'document')
  const entityRefs = content.entity_refs ?? []

  const hasText = !!content.text
  const hasDoc = docAttachments.length > 0
  const hasEntity = entityRefs.length > 0
  const hasBubbleContent = hasText || hasDoc || hasEntity

  const bgClass = isMine
    ? accentColor === 'purple'
      ? 'bg-purple-600 text-white rounded-br-md'
      : 'bg-blue-600 text-white rounded-br-md'
    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'

  const timeClass = isMine
    ? accentColor === 'purple' ? 'text-purple-200' : 'text-blue-200'
    : 'text-gray-400'

  const senderColor = isMine
    ? accentColor === 'purple' ? 'text-purple-200' : 'text-blue-200'
    : accentColor === 'purple' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'

  const imageOnlyTimeClass = 'text-gray-400'

  return (
    <div
      className={`group flex items-end gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Delete action — appears on hover for own messages */}
      {isMine && onDelete && (
        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowMenu(prev => !prev)}
            className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="More"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 bottom-full mb-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <button
                onClick={() => {
                  onDelete(msg.id)
                  setShowMenu(false)
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Delete message
              </button>
            </div>
          )}
        </div>
      )}

      <div className="max-w-[70%] space-y-1">
        {/* Sender name (group chats) */}
        {showSender && !isMine && (
          <p className={`text-[11px] font-medium ${senderColor}`}>
            {msg.sender_username}
          </p>
        )}

        {/* Image attachments — rendered above the bubble */}
        {imageAttachments.length > 0 && (
          <div className="space-y-1.5">
            {imageAttachments.map(att => (
              <ImagePreview key={att.id} attachment={att} isMine={isMine} />
            ))}
          </div>
        )}

        {/* Bubble: text, docs, entity refs */}
        {hasBubbleContent ? (
          <div className={`px-4 py-2 rounded-2xl ${bgClass}`}>
            {/* Document attachments */}
            {docAttachments.length > 0 && (
              <div className="space-y-1.5 mb-1">
                {docAttachments.map(att => (
                  <DocumentCard key={att.id} attachment={att} isMine={isMine} />
                ))}
              </div>
            )}

            {/* Entity ref cards */}
            {entityRefs.length > 0 && (
              <div className="space-y-1.5 mb-1">
                {entityRefs.map((ref, i) => (
                  <EntityRefCard key={`${ref.type}-${ref.id}-${i}`} entityRef={ref} isMine={isMine} />
                ))}
              </div>
            )}

            {/* Text content */}
            {content.text && (
              <p className="text-sm whitespace-pre-wrap break-words">{content.text}</p>
            )}

            <p className={`text-[10px] mt-1 ${timeClass}`}>
              {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        ) : (
          /* Image-only message: show time below images without a bubble */
          <p className={`text-[10px] ${isMine ? 'text-right' : 'text-left'} ${imageOnlyTimeClass}`}>
            {new Date(msg.created_at).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  )
}
