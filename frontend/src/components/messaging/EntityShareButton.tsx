'use client'

import { useState } from 'react'
import type { EntityRef, EntityType } from '@/services/messaging'
import { ShareToChat } from './ShareToChat'

interface EntityShareButtonProps {
  entityType: EntityType
  entityId: string
  title: string
  subtitle?: string
  status?: string
  statusColor?: string
  url: string
}

export function EntityShareButton({
  entityType,
  entityId,
  title,
  subtitle,
  status,
  statusColor,
  url,
}: EntityShareButtonProps) {
  const [showModal, setShowModal] = useState(false)

  const entityRef: EntityRef = {
    type: entityType,
    id: entityId,
    title,
    subtitle,
    status,
    status_color: statusColor,
    url,
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Share to chat"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>

      {showModal && (
        <ShareToChat
          entityRef={entityRef}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
