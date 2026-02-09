'use client'

import { useRef, useState } from 'react'
import type { AttachmentMeta } from '@/services/messaging'
import { formatFileSize } from '@/services/messaging'

interface PendingFile {
  file: File
  preview?: string
  status: 'uploading' | 'done' | 'error'
  meta?: AttachmentMeta
}

interface AttachmentUploaderProps {
  conversationId: string
  onUploadComplete: (attachments: AttachmentMeta[]) => void
  onUploading: (isUploading: boolean) => void
  uploadAttachment: (conversationId: string, file: File) => Promise<AttachmentMeta | null>
  accentColor?: 'blue' | 'purple'
}

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,text/csv,application/zip'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export function AttachmentUploader({
  conversationId,
  onUploadComplete,
  onUploading,
  uploadAttachment,
  accentColor = 'blue',
}: AttachmentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''

    const validFiles = files.filter(f => {
      if (f.size > MAX_FILE_SIZE) {
        alert(`${f.name} is too large (max 10 MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    const newPending: PendingFile[] = validFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'uploading' as const,
    }))

    setPendingFiles(prev => [...prev, ...newPending])
    onUploading(true)

    const completedMetas: AttachmentMeta[] = []

    for (let i = 0; i < validFiles.length; i++) {
      const meta = await uploadAttachment(conversationId, validFiles[i])
      setPendingFiles(prev => {
        const updated = [...prev]
        const idx = updated.findIndex(p => p.file === validFiles[i])
        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            status: meta ? 'done' : 'error',
            meta: meta ?? undefined,
          }
        }
        return updated
      })
      if (meta) completedMetas.push(meta)
    }

    onUploading(false)
    if (completedMetas.length > 0) {
      onUploadComplete(completedMetas)
    }
  }

  const removePending = (index: number) => {
    setPendingFiles(prev => {
      const item = prev[index]
      if (item.preview) URL.revokeObjectURL(item.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const clearAll = () => {
    pendingFiles.forEach(p => { if (p.preview) URL.revokeObjectURL(p.preview) })
    setPendingFiles([])
  }

  const accentClasses = accentColor === 'purple'
    ? 'text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
    : 'text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={`p-2 rounded-lg transition-colors ${accentClasses}`}
        title="Attach file"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>

      {/* Pending attachments strip */}
      {pendingFiles.length > 0 && (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {pendingFiles.map((pf, i) => (
            <div
              key={i}
              className={`relative group flex items-center gap-2 px-2 py-1.5 rounded-lg border text-xs ${
                pf.status === 'error'
                  ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                  : pf.status === 'uploading'
                  ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 animate-pulse'
                  : 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
              }`}
            >
              {pf.preview ? (
                <img src={pf.preview} alt="" className="w-8 h-8 object-cover rounded" />
              ) : (
                <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[9px] font-bold text-gray-500">
                  {pf.file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                </div>
              )}
              <div className="max-w-[120px]">
                <p className="truncate text-gray-700 dark:text-gray-300">{pf.file.name}</p>
                <p className="text-gray-400">{formatFileSize(pf.file.size)}</p>
              </div>
              <button
                onClick={() => removePending(i)}
                className="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {pendingFiles.some(f => f.status === 'done' || f.status === 'error') && (
            <button
              onClick={clearAll}
              className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}
