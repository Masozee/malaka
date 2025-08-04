"use client"

import { 
  Home, 
  Database, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart, 
  Settings,
  Building2,
  Bell,
  User,
  Factory,
  Calculator,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface LayoutProps {
  children: React.ReactNode
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
            <Building2 className="h-6 w-6 text-black dark:text-white" />
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
                <Home className="h-5 w-5 text-black dark:text-white" />
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
                <Calendar className="h-5 w-5 text-black dark:text-white" />
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
                <Database className="h-5 w-5 text-black dark:text-white" />
              </Link>
            </li>
            
            <li>
              <button 
                className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Sales"
              >
                <ShoppingCart className="h-5 w-5 text-black dark:text-white" />
              </button>
            </li>
            
            <li>
              <button 
                className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Inventory"
              >
                <Package className="h-5 w-5 text-black dark:text-white" />
              </button>
            </li>
            
            <li>
              <button 
                className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Production"
              >
                <Factory className="h-5 w-5 text-black dark:text-white" />
              </button>
            </li>
            
            <li>
              <button 
                className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Accounting"
              >
                <Calculator className="h-5 w-5 text-black dark:text-white" />
              </button>
            </li>
            
            <li>
              <button 
                className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="HR Management"
              >
                <Users className="h-5 w-5 text-black dark:text-white" />
              </button>
            </li>
            
            <li>
              <button 
                className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Reporting"
              >
                <BarChart className="h-5 w-5 text-black dark:text-white" />
              </button>
            </li>
            
            <li>
              <button 
                className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Settings"
              >
                <Settings className="h-5 w-5 text-black dark:text-white" />
              </button>
            </li>
          </ul>
        </nav>
        
        {/* Bottom Section - Bell and User Avatar */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <button 
              className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-black dark:text-white" />
            </button>
            <button 
              className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="User Profile"
            >
              <User className="h-5 w-5 text-black dark:text-white" />
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
