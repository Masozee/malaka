'use client'

import type { AttachmentMeta } from '@/services/messaging'
import { formatFileSize } from '@/services/messaging'

interface DocumentCardProps {
  attachment: AttachmentMeta
  isMine: boolean
}

const FILE_ICONS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'text/plain': 'TXT',
  'text/csv': 'CSV',
  'application/zip': 'ZIP',
  'application/x-rar-compressed': 'RAR',
}

function getFileLabel(contentType: string, fileName: string): string {
  if (FILE_ICONS[contentType]) return FILE_ICONS[contentType]
  const ext = fileName.split('.').pop()?.toUpperCase()
  return ext || 'FILE'
}

export function DocumentCard({ attachment, isMine }: DocumentCardProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  const href = attachment.url.startsWith('http') ? attachment.url : `${apiUrl}${attachment.url}`
  const label = getFileLabel(attachment.content_type, attachment.file_name)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      download={attachment.original_name}
      className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
        isMine
          ? 'border-white/20 hover:bg-white/10'
          : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
        isMine
          ? 'bg-white/20 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
      }`}>
        {label}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm truncate ${isMine ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
          {attachment.original_name}
        </p>
        <p className={`text-[11px] ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
          {formatFileSize(attachment.file_size)}
        </p>
      </div>
      <svg className={`w-4 h-4 flex-shrink-0 ${isMine ? 'text-white/60' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </a>
  )
}
