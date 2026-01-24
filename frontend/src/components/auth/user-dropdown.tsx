'use client'

import { useState } from 'react'
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, Settings01Icon, Logout01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { useAuth } from '@/contexts/auth-context'

import { useRouter } from 'next/navigation'

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  if (!user) return null

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(false)
    router.push('/profile')
  }

  const handleGearClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(false)
    router.push('/settings')
  }

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOpen(false)
    logout()
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        onMouseEnter={() => setIsOpen(true)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`User menu for ${user.username}`}
      >
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center" aria-hidden="true">
          <span className="text-white font-semibold text-sm">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {user.username}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {user.role}
          </span>
        </div>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg  z-[9999]"
          onMouseLeave={() => setIsOpen(false)}
          style={{ pointerEvents: 'auto' }}
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {user.username}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </div>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="py-2" role="menu" aria-orientation="vertical">
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              role="menuitem"
            >
              <HugeiconsIcon icon={UserIcon} className="h-4 w-4 flex-shrink-0" />
              Profile
            </button>

            <button
              onClick={handleGearClick}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              role="menuitem"
            >
              <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4 flex-shrink-0" />
              Gear
            </button>

            <hr className="my-2 border-gray-200 dark:border-gray-700" aria-hidden="true" />

            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              role="menuitem"
            >
              <HugeiconsIcon icon={Logout01Icon} className="h-4 w-4 flex-shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setIsOpen(false)}
          style={{ pointerEvents: 'auto' }}
        />
      )}
    </div>
  )
}