"use client"

import * as React from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { SidebarProvider } from "@/contexts/sidebar-context"
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
  Factory01Icon,
  CalculatorIcon,
  // Master Data icons
  ColorsIcon,
  Shirt01Icon,
  HierarchyIcon,
  CubeIcon,
  RulerIcon,
  BarcodeScanIcon,
  Dollar01Icon,
  Image01Icon,
  TruckIcon,
  WarehouseIcon,
  MapsIcon,
  UserCheck01Icon,
  // Sales icons
  CreditCardIcon,
  StoreIcon,
  RefreshIcon,
  GiftIcon,
  ChartIncreaseIcon,
  // Production icons
  ClipboardIcon,
  CheckmarkCircle01Icon,
  // Inventory icons
  ArrowLeftRightIcon,
  PlusSignIcon,
  MinusSignIcon,
  Search01Icon,
  // Accounting icons
  BookOpen01Icon,
  ReceiptDollarIcon,
  PiggyBankIcon,
  FileIcon,
  TargetIcon,
  Building02Icon,
  // HR icons
  Calendar01Icon,
  Clock01Icon,
  Medal01Icon,
  GraduationScrollIcon,
  // Procurement icons
  ShoppingBag01Icon,
  FileUploadIcon,
  SealIcon,
  Chat01Icon,
  StarIcon,
  Agreement01Icon,
  // Reporting icons
  PieChart01Icon,
  ChartLineData01Icon,
  Xls01Icon,
  SidebarLeftIcon,
  // Help icons
  HelpCircleIcon,
  Share01Icon,
  LogoutIcon,
  ArrowRightIcon,
  QuotesIcon,
  MoreVerticalIcon
} from '@hugeicons/core-free-icons'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useSessionActivity } from "@/hooks/useSessionActivity"
import { notificationService, Notification } from "@/services/notifications"

interface LayoutProps {
  children: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconType = any

interface MenuItem {
  id: string
  label: string
  icon: IconType
  href?: string
  items?: SubMenuItem[]
}

interface SubMenuItem {
  id: string
  label: string
  icon: IconType
  href: string
  keywords?: string[]
  count?: number
}

// Icon wrapper component for consistent rendering
function Icon({ icon, className, strokeWidth }: { icon: IconType; className?: string; strokeWidth?: number }) {
  return <HugeiconsIcon icon={icon} className={className} strokeWidth={strokeWidth} />
}

const menuData: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home01Icon,
    items: [
      { id: "overview", label: "Overview", icon: Home01Icon, href: "/dashboard" },
      { id: "analytics", label: "Analytics", icon: ChartColumnIcon, href: "/dashboard/analytics" },
      { id: "sales-dashboard", label: "Sales Dashboard", icon: ChartIncreaseIcon, href: "/sales/dashboard" },
      { id: "reports-dashboard", label: "Reports Dashboard", icon: PieChart01Icon, href: "/reports/dashboard" }
    ]
  },
  {
    id: "master-data",
    label: "Master Data",
    icon: Database01Icon,
    items: [
      { id: "companies", label: "Companies", icon: Building01Icon, href: "/master-data/companies", count: 24 },
      { id: "users", label: "Users", icon: UserCheck01Icon, href: "/master-data/users", count: 156 },
      { id: "customers", label: "Customers", icon: UserGroupIcon, href: "/master-data/customers", count: 3289 },
      { id: "divisions", label: "Divisions", icon: HierarchyIcon, href: "/master-data/divisions", count: 6 },
      { id: "depstores", label: "Dept Stores", icon: StoreIcon, href: "/master-data/depstores", count: 12 },
      { id: "master-data-settings", label: "Settings", icon: SettingsIcon, href: "/master-data/settings" }
    ]
  },
  {
    id: "products",
    label: "Products",
    icon: Shirt01Icon,
    items: [
      { id: "articles", label: "Articles", icon: Shirt01Icon, href: "/master-data/articles", count: 2847 },
      { id: "classifications", label: "Classifications", icon: HierarchyIcon, href: "/products/classifications", count: 18 },
      { id: "colors", label: "Colors", icon: ColorsIcon, href: "/master-data/colors", count: 42 },
      { id: "models", label: "Models", icon: CubeIcon, href: "/products/models", count: 89 },
      { id: "sizes", label: "Sizes", icon: RulerIcon, href: "/products/sizes", count: 28 },
      { id: "barcodes", label: "Barcodes", icon: BarcodeScanIcon, href: "/master-data/barcodes" },
      { id: "prices", label: "Prices", icon: Dollar01Icon, href: "/master-data/prices", count: 1543 },
      { id: "gallery", label: "Gallery", icon: Image01Icon, href: "/master-data/gallery-images", count: 456 },
      { id: "products-settings", label: "Settings", icon: SettingsIcon, href: "/products/settings" }
    ]
  },
  {
    id: "sales",
    label: "Sales",
    icon: ShoppingCartIcon,
    href: "/sales",
    items: [
      { id: "pos", label: "Point of Sale", icon: CreditCardIcon, href: "/sales/pos", count: 142 },
      { id: "online-sales", label: "Online Sales", icon: ChartIncreaseIcon, href: "/sales/online", count: 789 },
      { id: "direct-sales", label: "Direct Sales", icon: StoreIcon, href: "/sales/direct", count: 234 },
      { id: "quotations", label: "Quotations", icon: QuotesIcon, href: "/sales/quotations", count: 89 },
      { id: "orders", label: "Sales Orders", icon: FileIcon, href: "/sales/orders", count: 567 },
      { id: "returns", label: "Returns", icon: RefreshIcon, href: "/sales/returns", count: 23 },
      { id: "consignment", label: "Consignment", icon: Package01Icon, href: "/sales/consignment", count: 45 },
      { id: "promotions", label: "Promotions", icon: GiftIcon, href: "/sales/promotions", count: 8 },
      { id: "targets", label: "Sales Targets", icon: TargetIcon, href: "/sales/targets" },
      { id: "competitors", label: "Competitors", icon: ChartColumnIcon, href: "/sales/competitors" },
      { id: "reconciliation", label: "Reconciliation", icon: CheckmarkCircle01Icon, href: "/sales/reconciliation", count: 12 },
      { id: "sales-settings", label: "Settings", icon: SettingsIcon, href: "/sales/settings" }
    ]
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package01Icon,
    href: "/inventory",
    items: [
      { id: "stock-control", label: "Stock Control", icon: Package01Icon, href: "/inventory/stock-control", count: 1247 },
      { id: "raw-materials", label: "Raw Materials", icon: CubeIcon, href: "/inventory/raw-materials", count: 156 },
      { id: "goods-receipt", label: "Goods Receipt", icon: Package01Icon, href: "/inventory/goods-receipt", count: 34 },
      { id: "stock-transfer", label: "Stock Transfer", icon: ArrowLeftRightIcon, href: "/inventory/stock-transfer", count: 16 },
      { id: "goods-issue", label: "Goods Issue", icon: MinusSignIcon, href: "/inventory/goods-issue", count: 78 },
      { id: "adjustments", label: "Adjustments", icon: PlusSignIcon, href: "/inventory/adjustments", count: 5 },
      { id: "stock-opname", label: "Stock Opname", icon: Search01Icon, href: "/inventory/stock-opname", count: 3 },
      { id: "return-supplier", label: "Return Supplier", icon: RefreshIcon, href: "/inventory/return-supplier", count: 7 },
      { id: "barcode-print", label: "Barcode Print", icon: BarcodeScanIcon, href: "/inventory/barcode-print" },
      { id: "inventory-settings", label: "Settings", icon: SettingsIcon, href: "/inventory/settings" }
    ]
  },
  {
    id: "production",
    label: "Production",
    icon: Factory01Icon,
    href: "/production",
    items: [
      { id: "suppliers", label: "Suppliers", icon: TruckIcon, href: "/production/suppliers", count: 67 },
      { id: "warehouses", label: "Warehouses", icon: WarehouseIcon, href: "/production/warehouses", count: 8 },
      { id: "purchase-orders", label: "Purchase Orders", icon: FileIcon, href: "/production/purchase-orders", count: 89 },
      { id: "work-orders", label: "Work Orders", icon: SettingsIcon, href: "/production/work-orders", count: 45 },
      { id: "quality-control", label: "Quality Control", icon: CheckmarkCircle01Icon, href: "/production/quality-control", count: 12 },
      { id: "material-planning", label: "Material Planning", icon: Package01Icon, href: "/production/material-planning", count: 15 },
      { id: "analytics", label: "Analytics", icon: ChartColumnIcon, href: "/production/analytics" },
      { id: "production-settings", label: "Settings", icon: SettingsIcon, href: "/production/settings" }
    ]
  },
  {
    id: "procurement",
    label: "Procurement",
    icon: ShoppingBag01Icon,
    href: "/procurement",
    items: [
      { id: "suppliers", label: "Suppliers", icon: TruckIcon, href: "/procurement/suppliers", count: 45 },
      { id: "purchase-requests", label: "Purchase Requests", icon: FileUploadIcon, href: "/procurement/purchase-requests", count: 23 },
      { id: "purchase-orders", label: "Purchase Orders", icon: SealIcon, href: "/procurement/purchase-orders", count: 67 },
      { id: "rfq", label: "RFQ (Quotations)", icon: Chat01Icon, href: "/procurement/rfq", count: 12 },
      { id: "vendor-evaluation", label: "Vendor Evaluation", icon: StarIcon, href: "/procurement/vendor-evaluation", count: 8 },
      { id: "contracts", label: "Contracts", icon: Agreement01Icon, href: "/procurement/contracts", count: 15 },
      { id: "analytics", label: "Analytics", icon: ChartColumnIcon, href: "/procurement/analytics" },
      { id: "procurement-settings", label: "Settings", icon: SettingsIcon, href: "/procurement/settings" }
    ]
  },
  {
    id: "shipping",
    label: "Shipping",
    icon: MapsIcon,
    href: "/shipping",
    items: [
      { id: "couriers", label: "Couriers", icon: MapsIcon, href: "/shipping/couriers", count: 15 },
      { id: "shipment-management", label: "Shipment Management", icon: Package01Icon, href: "/shipping/management" },
      { id: "airwaybill", label: "Airwaybill", icon: FileIcon, href: "/shipping/airwaybill" },
      { id: "outbound-scanning", label: "Outbound Scanning", icon: BarcodeScanIcon, href: "/shipping/outbound" },
      { id: "manifest", label: "Manifest", icon: ClipboardIcon, href: "/shipping/manifest" },
      { id: "shipping-invoices", label: "Shipping Invoices", icon: ReceiptDollarIcon, href: "/shipping/invoices" },
      { id: "shipping-settings", label: "Settings", icon: SettingsIcon, href: "/shipping/settings" }
    ]
  },
  {
    id: "accounting",
    label: "Accounting",
    icon: CalculatorIcon,
    href: "/accounting",
    items: [
      { id: "general-ledger", label: "General Ledger", icon: BookOpen01Icon, href: "/accounting/general-ledger" },
      { id: "journal-entries", label: "Journal Entries", icon: FileIcon, href: "/accounting/journal" },
      { id: "trial-balance", label: "Trial Balance", icon: ChartColumnIcon, href: "/accounting/trial-balance" },
      { id: "cash-bank", label: "Cash & Bank", icon: PiggyBankIcon, href: "/accounting/cash-bank" },
      { id: "invoices", label: "Invoices", icon: ReceiptDollarIcon, href: "/accounting/invoices" },
      { id: "cost-centers", label: "Cost Centers", icon: TargetIcon, href: "/accounting/cost-centers" },
      { id: "fixed-assets", label: "Fixed Assets", icon: Building02Icon, href: "/accounting/fixed-assets" },
      { id: "currency", label: "Currency", icon: Dollar01Icon, href: "/accounting/currency" },
      { id: "accounting-settings", label: "Settings", icon: SettingsIcon, href: "/accounting/settings" }
    ]
  },
  {
    id: "hr",
    label: "HR Management",
    icon: UserGroupIcon,
    href: "/hr",
    items: [
      { id: "employees", label: "Employees", icon: UserGroupIcon, href: "/hr/employees" },
      { id: "payroll", label: "Payroll", icon: Dollar01Icon, href: "/hr/payroll" },
      { id: "attendance", label: "Attendance", icon: Clock01Icon, href: "/hr/attendance" },
      { id: "leave", label: "Leave Management", icon: Calendar01Icon, href: "/hr/leave" },
      { id: "performance", label: "Performance", icon: Medal01Icon, href: "/hr/performance" },
      { id: "training", label: "Training", icon: GraduationScrollIcon, href: "/hr/training" },
      { id: "spg-stores", label: "SPG Stores", icon: StoreIcon, href: "/hr/spg-stores" },
      { id: "hr-settings", label: "Settings", icon: SettingsIcon, href: "/hr/settings" }
    ]
  },
  {
    id: "reporting",
    label: "Reporting",
    icon: ChartColumnIcon,
    href: "/reports",
    items: [
      { id: "dashboard", label: "BI Dashboard", icon: PieChart01Icon, href: "/reports/dashboard" },
      { id: "sales-reports", label: "Sales Reports", icon: ChartLineData01Icon, href: "/reports/sales" },
      { id: "inventory-reports", label: "Inventory Reports", icon: Package01Icon, href: "/reports/inventory" },
      { id: "financial-reports", label: "Financial Reports", icon: CalculatorIcon, href: "/reports/financial" },
      { id: "production-reports", label: "Production Reports", icon: Factory01Icon, href: "/reports/production" },
      { id: "hr-reports", label: "HR Reports", icon: UserGroupIcon, href: "/reports/hr" },
      { id: "custom-reports", label: "Custom Reports", icon: Xls01Icon, href: "/reports/custom" },
      { id: "static-reports", label: "Static Reports", icon: FileIcon, href: "/reports/static" },
      { id: "olap", label: "OLAP Analysis", icon: ChartColumnIcon, href: "/reports/olap" },
      { id: "reporting-settings", label: "Settings", icon: SettingsIcon, href: "/reports/settings" }
    ]
  }
]

export function TwoLevelLayout({ children }: LayoutProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null)
  const [isSecondSidebarCollapsed, setIsSecondSidebarCollapsed] = React.useState(false)
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [isLoadingNotifications, setIsLoadingNotifications] = React.useState(false)

  // Initialize session activity tracking
  useSessionActivity({
    inactivityTimeout: 30 * 60 * 1000, // 30 minutes
    sessionWarningTime: 5 * 60 * 1000   // 5 minutes
  })

  // Fetch notifications
  const fetchNotifications = React.useCallback(async () => {
    if (!user) return

    setIsLoadingNotifications(true)
    try {
      const response = await notificationService.listNotifications({
        limit: 10,
        include_read: true
      })
      setNotifications(response.notifications || [])
      setUnreadCount(response.unread_count || 0)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoadingNotifications(false)
    }
  }, [user])

  // Load notifications on mount and periodically
  React.useEffect(() => {
    fetchNotifications()

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Handle marking notification as read
  const handleMarkAsRead = async (id: string) => {
    const success = await notificationService.markAsRead(id)
    if (success) {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, status: 'read' as const } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  // Handle marking all as read
  const handleMarkAllAsRead = async () => {
    const success = await notificationService.markAllAsRead()
    if (success) {
      setNotifications(prev =>
        prev.map(n => ({ ...n, status: 'read' as const }))
      )
      setUnreadCount(0)
    }
  }

  // Auto-set active menu based on pathname
  React.useEffect(() => {
    const currentMenu = menuData.find(menu => {
      // Special case for home page and dashboard - always show dashboard menu
      if ((pathname === '/' || pathname === '/dashboard') && menu.id === 'dashboard') return true
      if (menu.href && pathname === menu.href) return true
      if (menu.items) {
        return menu.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
      }
      return false
    })
    if (currentMenu) {
      setActiveMenu(currentMenu.id)
    }
  }, [pathname])

  const handleMenuClick = (menuId: string) => {
    if (activeMenu === menuId) {
      setActiveMenu(null)
    } else {
      setActiveMenu(menuId)
      setIsSecondSidebarCollapsed(false)
    }
  }

  const activeMenuData = menuData.find(menu => menu.id === activeMenu)


  // Function to format count for display
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* First Level Sidebar - Main Modules */}
      <aside className="fixed left-0 top-0 h-screen w-12 bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 flex flex-col z-20">
        {/* Header - Aligned with combined navbar height */}
        <div className="h-[54px] flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Malaka ERP"
            className="h-6 w-6 object-contain"
          />
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-1">
          <ul className="space-y-2">
            {menuData.map((menu) => {
              const isActive = activeMenu === menu.id || (menu.href && pathname === menu.href)

              return (
                <li key={menu.id}>
                  {menu.href ? (
                    <Link
                      href={menu.href}
                      className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                        isActive
                          ? ' '
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      style={isActive ? { backgroundColor: '#cfff04' } : {}}
                      title={menu.label}
                    >
                      <Icon icon={menu.icon} className={`h-4 w-4 ${isActive ? 'text-black' : 'text-gray-600 dark:text-gray-300'}`} strokeWidth={2} />
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleMenuClick(menu.id)}
                      className={`w-full flex items-center justify-center p-2 rounded-md transition-colors ${
                        isActive
                          ? ' '
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      style={isActive ? { backgroundColor: '#cfff04' } : {}}
                      title={menu.label}
                    >
                      <Icon icon={menu.icon} className={`h-4 w-4 ${isActive ? 'text-black' : 'text-gray-600 dark:text-gray-300'}`} strokeWidth={2} />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
        
        {/* Bottom Section - Calendar, Theme Toggle, Gear, Bell and User Avatar */}
        <div className="p-1 border-t border-gray-300 dark:border-gray-600 relative">
          <div className="space-y-1">
            {/* Calendar Icon */}
            <Link
              href="/calendar"
              className={`w-full flex items-center justify-center p-2 rounded-md transition-colors ${
                pathname === '/calendar'
                  ? ' '
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              style={pathname === '/calendar' ? { backgroundColor: '#cfff04' } : {}}
              title="Calendar"
            >
              <Icon icon={Calendar01Icon} className={`h-4 w-4 ${pathname === '/calendar' ? 'text-black' : 'text-gray-600 dark:text-gray-300'}`} strokeWidth={2} />
            </Link>

            {/* Theme Toggle */}
            <div className="w-full flex items-center justify-center p-2">
              <ThemeToggle />
            </div>


            {/* Settings */}
            <Link
              href="/settings"
              className={`w-full flex items-center justify-center p-2 rounded-md transition-colors ${
                pathname === '/settings'
                  ? ' '
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              style={pathname === '/settings' ? { backgroundColor: '#cfff04' } : {}}
              title="Settings"
            >
              <Icon icon={SettingsIcon} className={`h-4 w-4 ${pathname === '/settings' ? 'text-black' : 'text-gray-600 dark:text-gray-300'}`} strokeWidth={2} />
            </Link>

            {/* Notifications Button with Badge */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  if (!showNotifications) {
                    fetchNotifications()
                  }
                }}
                className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Notifications"
              >
                <Icon icon={Notification01Icon} className="h-4 w-4 text-gray-600 dark:text-gray-300" strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute bottom-full left-12 mb-2 w-80 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 z-50 animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {unreadCount} unread
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {isLoadingNotifications ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Loading...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Icon icon={Notification01Icon} className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No notifications yet
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const isUnread = notification.status === 'unread'
                        return (
                          <div
                            key={notification.id}
                            onClick={() => {
                              if (isUnread) {
                                handleMarkAsRead(notification.id)
                              }
                              if (notification.action_url) {
                                window.location.href = notification.action_url
                              }
                            }}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                              isUnread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                isUnread ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {notification.title}
                                  </p>
                                  {notification.priority === 'urgent' && (
                                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-600 rounded">
                                      Urgent
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {notificationService.formatTimeAgo(notification.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                    <Link
                      href="/notifications"
                      className="w-full text-xs text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 block"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              title="Logout"
            >
              <Icon icon={LogoutIcon} className="h-4 w-4 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400" strokeWidth={2} />
            </button>
          </div>
        </div>
      </aside>

      {/* Second Level Sidebar - Detailed Menu Items */}
      {activeMenu && activeMenuData?.items && (
        <aside className={`${
          isSecondSidebarCollapsed ? 'w-12' : 'w-64'
        } ml-12 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 flex flex-col transition-all duration-300 z-10 fixed left-0 top-0 h-screen font-[family-name:var(--font-noto-sans)]`}>
          {/* Header - Aligned with first sidebar header */}
          <div className="h-[54px] px-4 border-b border-gray-300 dark:border-gray-600 flex items-center justify-between">
            {!isSecondSidebarCollapsed ? (
              <>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{activeMenuData.label}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Icon icon={MoreVerticalIcon} className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/${activeMenu}/settings`} className="flex items-center">
                        <Icon icon={SettingsIcon} className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/reports" className="flex items-center">
                        <Icon icon={ChartColumnIcon} className="mr-2 h-4 w-4" />
                        Reports
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mx-auto">
                    <Icon icon={MoreVerticalIcon} className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="right">
                  <DropdownMenuItem asChild>
                    <Link href={`/${activeMenu}/settings`} className="flex items-center">
                      <Icon icon={SettingsIcon} className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/reports" className="flex items-center">
                      <Icon icon={ChartColumnIcon} className="mr-2 h-4 w-4" />
                      Reports
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Sub Navigation */}
          <nav className="flex-1 p-2">
            <ul className="space-y-1">
              {activeMenuData.items.map((item) => {
                const isActive = pathname === item.href

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`flex items-center ${
                        isSecondSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2'
                      } rounded-lg transition-colors ${
                        isActive
                          ? 'text-black  '
                          : 'hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      style={isActive ? { backgroundColor: '#cfff04' } : {}}
                      title={isSecondSidebarCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon icon={item.icon} className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-black' : ''}`} />
                        {!isSecondSidebarCollapsed && (
                          <span className="text-sm font-medium">{item.label}</span>
                        )}
                      </div>
                      {!isSecondSidebarCollapsed && item.count && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                          {formatCount(item.count)}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Help Card - Bottom section */}
          {!isSecondSidebarCollapsed && (
            <div className="p-3 border-t border-gray-300 dark:border-gray-600">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 ">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon icon={HelpCircleIcon} className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Need Help?</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Get support, tutorials, and documentation for {activeMenuData.label.toLowerCase()}.
                </p>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors">
                    <span className="text-gray-700 dark:text-gray-300">View Guide</span>
                    <Icon icon={Share01Icon} className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors">
                    <span className="text-gray-700 dark:text-gray-300">Contact Support</span>
                    <Icon icon={Share01Icon} className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      )}
      
      {/* Main Content */}
      <main className={`flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 ${
        activeMenu && activeMenuData?.items
          ? isSecondSidebarCollapsed ? 'ml-24' : 'ml-[304px]'
          : 'ml-12'
      } transition-all duration-300`}>
        <SidebarProvider
          collapsed={isSecondSidebarCollapsed}
          onToggle={() => setIsSecondSidebarCollapsed(!isSecondSidebarCollapsed)}
        >
          {children}
        </SidebarProvider>
      </main>

      {/* Click outside handler for notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false)
          }}
        />
      )}
    </div>
  )
}