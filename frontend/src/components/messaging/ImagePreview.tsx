'use client'

import { useState } from 'react'
import type { AttachmentMeta } from '@/services/messaging'

interface ImagePreviewProps {
  attachment: AttachmentMeta
  isMine: boolean
}

export function ImagePreview({ attachment, isMine }: ImagePreviewProps) {
  const [showLightbox, setShowLightbox] = useState(false)
  const [imgError, setImgError] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  const src = attachment.url.startsWith('http') ? attachment.url : `${apiUrl}${attachment.url}`

  if (imgError) {
    return (
      <div className="rounded-lg bg-gray-200 dark:bg-gray-700 p-3 text-xs text-gray-500 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Failed to load image
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowLightbox(true)}
        className="block rounded-lg overflow-hidden max-w-[280px] cursor-pointer hover:opacity-90 transition-opacity"
      >
        <img
          src={src}
          alt={attachment.original_name}
          onError={() => setImgError(true)}
          className="max-w-full h-auto rounded-lg"
          style={{ maxHeight: 300 }}
          loading="lazy"
        />
      </button>

      {showLightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={src}
            alt={attachment.original_name}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded"
            onClick={e => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <span className="text-white/70 text-sm">{attachment.original_name}</span>
            <a
              href={src}
              download={attachment.original_name}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-white/70 hover:text-white text-sm underline"
            >
              Download
            </a>
          </div>
        </div>
      )}
    </>
  )
}
