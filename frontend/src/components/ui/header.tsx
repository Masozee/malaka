"use client"

import * as React from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowRightIcon,
  Search01Icon,
  SidebarLeftIcon,
  Notification01Icon,
  UserIcon,
  Settings01Icon,
  Logout01Icon,
  UserCircleIcon,
} from '@hugeicons/core-free-icons'
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/ui/command"
import { useSidebar } from "@/contexts/sidebar-context"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'warning' | 'success' | 'error'
}

interface HeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
}

export function Header({ title, description, breadcrumbs, actions }: HeaderProps) {
  const sidebar = useSidebar()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  // Mock notifications - in production, fetch from API
  const [notifications] = React.useState<Notification[]>([
    {
      id: '1',
      title: 'New Order Received',
      message: 'Order #12345 has been placed',
      time: '5 min ago',
      read: false,
      type: 'info'
    },
    {
      id: '2',
      title: 'Low Stock Alert',
      message: 'Product SKU-001 is running low',
      time: '1 hour ago',
      read: false,
      type: 'warning'
    },
    {
      id: '3',
      title: 'Payment Received',
      message: 'Invoice #INV-2024-001 paid',
      time: '2 hours ago',
      read: true,
      type: 'success'
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'success': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      {/* Combined Navbar with Breadcrumb, Command, and Profile */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side - Toggle Button and Breadcrumbs */}
          <div className="flex-1 flex items-center space-x-3">
            {/* Sidebar Toggle Button */}
            {sidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={sidebar.toggleSecondSidebar}
                className="h-8 w-8 p-0"
                aria-label="Toggle sidebar"
              >
                <HugeiconsIcon icon={SidebarLeftIcon} className="h-4 w-4" />
              </Button>
            )}

            {/* Separator */}
            {sidebar && breadcrumbs && breadcrumbs.length > 0 && (
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" aria-hidden="true" />
            )}

            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-1">
                  {breadcrumbs.map((item, index) => (
                    <li key={index} className="flex items-center">
                      {index > 0 && <HugeiconsIcon icon={ArrowRightIcon} className="h-4 w-4 mx-1" aria-hidden="true" />}
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-gray-900 dark:text-gray-100 font-medium" aria-current="page">{item.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>

          {/* Right Side - Search, Notifications, Profile */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Command Palette Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandOpen(true)}
              className="relative h-8 w-8 p-0 xl:h-8 xl:w-64 xl:px-3 xl:py-2"
              aria-label="Open search (⌘K)"
            >
              <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 xl:mr-2" aria-hidden="true" />
              <span className="hidden xl:inline-flex">Search</span>
              <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex" aria-hidden="true">
                ⌘K
              </kbd>
            </Button>

            {/* Separator */}
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" aria-hidden="true" />

            {/* Notifications */}
            {mounted && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-8 w-8 p-0"
                    aria-label="Notifications"
                  >
                    <HugeiconsIcon icon={Notification01Icon} className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">Notifications</h4>
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer ${!notification.read ? 'bg-muted/30' : ''
                            }`}
                        >
                          <div className="flex items-start gap-2">
                            <Badge className={`${getNotificationColor(notification.type)} text-[10px] px-1.5 py-0`}>
                              {notification.type}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{notification.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      View all notifications
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Separator */}
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" aria-hidden="true" />

            {/* Profile Dropdown */}
            {mounted && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 rounded-full p-0"
                    title={user?.username || 'User'}
                  >
                    <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center">
                      <HugeiconsIcon icon={UserIcon} className="h-4 w-4 text-primary" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.username || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <HugeiconsIcon icon={UserCircleIcon} className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <HugeiconsIcon icon={Logout01Icon} className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Page Title Section */}
      <header className="bg-white dark:bg-gray-900 px-6 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
            {description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </header>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
