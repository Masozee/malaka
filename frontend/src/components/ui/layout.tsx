"use client"

import { HugeiconsIcon } from '@hugeicons/react'
import {
  Home01Icon,
  Database01Icon,
  ShoppingCartIcon,
  Package01Icon,
  UserGroupIcon,
  ChartColumnIcon,
  SettingsIcon,
  Building01Icon,
  Notification01Icon,
  UserIcon,
  Factory01Icon,
  CalculatorIcon,
  Calendar01Icon
} from '@hugeicons/core-free-icons'

import Link from "next/link"
import { usePathname } from "next/navigation"

interface LayoutProps {
  children: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Icon({ icon, className }: { icon: any; className?: string }) {
  return <HugeiconsIcon icon={icon} className={className} />
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  return (
    <div className="flex min-h-screen w-full">
      {/* Icon-only Sidebar */}
      <aside className="w-16 bg-white dark:bg-gray-900 border-r border-black dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center">
            <Icon icon={Building01Icon} className="h-6 w-6 text-black dark:text-white" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <ul className="space-y-2">
            <li>
              <Link
                href="/dashboard"
                className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Dashboard"
              >
                <Icon icon={Home01Icon} className="h-5 w-5 text-black dark:text-white" />
              </Link>
            </li>

            <li>
              <Link
                href="/calendar"
                className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
                  pathname === '/calendar'
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Calendar"
              >
                <Icon icon={Calendar01Icon} className="h-5 w-5 text-black dark:text-white" />
              </Link>
            </li>

            <li>
              <Link
                href="/master-data"
                className={`flex items-center justify-center p-3 rounded-lg transition-colors ${
                  pathname.startsWith('/master-data')
                    ? 'bg-gray-200 dark:bg-gray-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Master Data"
              >
                <Icon icon={Database01Icon} className="h-5 w-5 text-black dark:text-white" />
              </Link>
            </li>

            <li>
              <button
                className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Sales"
              >
                <Icon icon={ShoppingCartIcon} className="h-5 w-5 text-black dark:text-white" />
              </button>
            </li>

            <li>
              <button
                className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Inventory"
              >
                <Icon icon={Package01Icon} className="h-5 w-5 text-black dark:text-white" />
              </button>
            </li>

            <li>
              <button
                className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Production"
              >
                <Icon icon={Factory01Icon} className="h-5 w-5 text-black dark:text-white" />
              </button>
            </li>

            <li>
              <button
                className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Accounting"
              >
                <Icon icon={CalculatorIcon} className="h-5 w-5 text-black dark:text-white" />
              </button>
            </li>

            <li>
              <button
                className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="HR Management"
              >
                <Icon icon={UserGroupIcon} className="h-5 w-5 text-black dark:text-white" />
              </button>
            </li>

            <li>
              <button
                className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Reporting"
              >
                <Icon icon={ChartColumnIcon} className="h-5 w-5 text-black dark:text-white" />
              </button>
            </li>

            <li>
              <button
                className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Settings"
              >
                <Icon icon={SettingsIcon} className="h-5 w-5 text-black dark:text-white" />
              </button>
            </li>
          </ul>
        </nav>

        {/* Bottom Section - Notification and User Avatar */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <button
              className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Notifications"
            >
              <Icon icon={Notification01Icon} className="h-5 w-5 text-black dark:text-white" />
            </button>
            <button
              className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="User Profile"
            >
              <Icon icon={UserIcon} className="h-5 w-5 text-black dark:text-white" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </div>
  )
}
