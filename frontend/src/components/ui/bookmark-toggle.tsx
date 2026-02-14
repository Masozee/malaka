'use client'

import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import { StarIcon, FavouriteIcon } from '@hugeicons/core-free-icons'
import { useFinanceBookmarks } from '@/hooks/useFinanceBookmarks'

interface BookmarkToggleProps {
  itemId: string
  size?: 'sm' | 'default'
}

export function BookmarkToggle({ itemId, size = 'default' }: BookmarkToggleProps) {
  const { isBookmarked, toggleBookmark } = useFinanceBookmarks()
  const active = isBookmarked(itemId)

  return (
    <Button
      variant="ghost"
      size={size === 'sm' ? 'sm' : 'icon'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleBookmark(itemId)
      }}
      className={size === 'sm' ? 'h-8 w-8 p-0' : 'h-9 w-9'}
      title={active ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      <HugeiconsIcon
        icon={active ? FavouriteIcon : StarIcon}
        className={`h-4 w-4 ${active ? 'text-yellow-500' : 'text-muted-foreground'}`}
      />
    </Button>
  )
}
