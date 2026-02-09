'use client'

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
}

export function MessageBubble({ msg, isMine, accentColor = 'blue', showSender = false }: MessageBubbleProps) {
  const content = msg.parsed_content ?? parseMessageContent(msg.plaintext)
  const attachments = msg.attachment_metas ?? []
  const imageAttachments = attachments.filter(a => a.file_category === 'image')
  const docAttachments = attachments.filter(a => a.file_category === 'document')
  const entityRefs = content.entity_refs ?? []

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

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${bgClass}`}>
        {showSender && !isMine && (
          <p className={`text-[11px] font-medium mb-0.5 ${senderColor}`}>
            {msg.sender_username}
          </p>
        )}

        {/* Image attachments */}
        {imageAttachments.length > 0 && (
          <div className="space-y-1.5 mb-1">
            {imageAttachments.map(att => (
              <ImagePreview key={att.id} attachment={att} isMine={isMine} />
            ))}
          </div>
        )}

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
    </div>
  )
}
