'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'malaka-finance-bookmarks'

function readBookmarks(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeBookmarks(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  queueMicrotask(() => window.dispatchEvent(new Event('finance-bookmarks-changed')))
}

export function useFinanceBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([])

  useEffect(() => {
    setBookmarks(readBookmarks())

    const onStorage = () => setBookmarks(readBookmarks())
    window.addEventListener('finance-bookmarks-changed', onStorage)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('finance-bookmarks-changed', onStorage)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
      writeBookmarks(next)
      return next
    })
  }, [])

  const isBookmarked = useCallback((id: string) => bookmarks.includes(id), [bookmarks])

  return { bookmarks, toggleBookmark, isBookmarked }
}
