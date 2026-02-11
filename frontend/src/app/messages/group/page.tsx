'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * Redirect /messages/group to /messages.
 * Preserves ?conversation= param so deep-links still work.
 */
export default function GroupChatRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const convId = searchParams.get('conversation')
    if (convId) {
      router.replace(`/messages?conversation=${convId}`)
    } else {
      router.replace('/messages')
    }
  }, [router, searchParams])

  return null
}
