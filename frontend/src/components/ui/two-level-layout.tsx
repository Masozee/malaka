"use client"

import * as React from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import { SidebarProvider, SecondarySidebarSlotProvider, useSecondarySidebarSlot } from "@/contexts/sidebar-context"
import {
  Home01Icon,
  Database01Icon,
  ShoppingCartIcon,
  Package01Icon,
  UserGroupIcon,
  ChartColumnIcon,
  SettingsIcon,
  Building01Icon,
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
  ArrowRightIcon,
  QuotesIcon,
  MoreVerticalIcon,
  Analytics02Icon,
  DatabaseAddIcon,
  SquareArrowLeftRightIcon,
  ThreeDViewIcon,
  Upload05Icon,
  CalculateIcon,
  ChartUpIcon,
  Analytics01Icon,
  FileLockedIcon,
  UserShield01Icon,
  // Finance icons
  MoneySendSquareIcon,
  BankIcon,
  CoinsIcon,
  Invoice01Icon,
  CreditCardValidationIcon,
  ChartBreakoutSquareIcon,
  // Tax icons
  TaxesIcon,
  FileExportIcon,
  FileImportIcon,
  DocumentValidationIcon,
  FileSearchIcon,
  DatabaseIcon,
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
import { useWebSocket } from "@/contexts/websocket-context"
import { useSessionActivity } from "@/hooks/useSessionActivity"
import { useActionItems } from "@/hooks/useActionItems"

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
  group?: string
}

// Icon wrapper component for consistent rendering
function Icon({ icon, className, strokeWidth }: { icon: IconType; className?: string; strokeWidth?: number }) {
  return <HugeiconsIcon icon={icon} className={className} strokeWidth={strokeWidth} />
}

const menuData: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Analytics02Icon,
    href: "/dashboard",
    items: [
      { id: "overview", label: "Overview", icon: Analytics01Icon, href: "/dashboard" },
      { id: "analytics", label: "Analytics", icon: ChartColumnIcon, href: "/dashboard/analytics" },
      { id: "sales-dashboard", label: "Sales Dashboard", icon: ChartUpIcon, href: "/sales/dashboard" },
      { id: "reports-dashboard", label: "BI Dashboard", icon: PieChart01Icon, href: "/reports/dashboard", group: "Reports" },
      { id: "sales-reports", label: "Sales Reports", icon: ChartLineData01Icon, href: "/reports/sales" },
      { id: "inventory-reports", label: "Inventory Reports", icon: Package01Icon, href: "/reports/inventory" },
      { id: "financial-reports", label: "Financial Reports", icon: CalculatorIcon, href: "/reports/financial" },
      { id: "production-reports", label: "Production Reports", icon: Factory01Icon, href: "/reports/production" },
      { id: "hr-reports", label: "HR Reports", icon: UserGroupIcon, href: "/reports/hr" },
      { id: "custom-reports", label: "Custom Reports", icon: Xls01Icon, href: "/reports/custom" },
      { id: "static-reports", label: "Static Reports", icon: FileIcon, href: "/reports/static" },
      { id: "olap", label: "OLAP Analysis", icon: ChartColumnIcon, href: "/reports/olap" },
    ]
  },
  {
    id: "master-data",
    label: "Master Data",
    icon: DatabaseAddIcon,
    href: "/master-data",
    items: [
      { id: "companies", label: "Companies", icon: Building01Icon, href: "/master-data/companies", count: 24 },
      { id: "users", label: "Users", icon: UserCheck01Icon, href: "/master-data/users", count: 156 },
      { id: "customers", label: "Customers", icon: UserGroupIcon, href: "/master-data/customers", count: 3289 },
      { id: "divisions", label: "Divisions", icon: HierarchyIcon, href: "/master-data/divisions", count: 6 },
      { id: "depstores", label: "Dept Stores", icon: StoreIcon, href: "/master-data/depstores", count: 12 },
      { id: "roles", label: "Roles & Permissions", icon: UserShield01Icon, href: "/master-data/roles" },
      { id: "master-data-settings", label: "Settings", icon: SettingsIcon, href: "/master-data/settings" }
    ]
  },
  {
    id: "products",
    label: "Products",
    icon: Shirt01Icon,
    href: "/products",
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
    icon: SquareArrowLeftRightIcon,
    href: "/sales",
    items: [
      { id: "pos", label: "Point of Sale", icon: CreditCardIcon, href: "/sales/pos", count: 142 },
      { id: "online-sales", label: "Online Sales", icon: ChartUpIcon, href: "/sales/online", count: 789 },
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
    icon: ThreeDViewIcon,
    href: "/production",
    items: [
      { id: "suppliers", label: "Suppliers", icon: TruckIcon, href: "/production/suppliers", count: 67 },
      { id: "warehouses", label: "Warehouses", icon: WarehouseIcon, href: "/production/warehouses", count: 8 },
      { id: "purchase-orders", label: "Purchase Orders", icon: FileIcon, href: "/production/purchase-orders", count: 89 },
      { id: "bill-of-materials", label: "Bill of Materials", icon: HierarchyIcon, href: "/production/bill-of-materials" },
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
    icon: Upload05Icon,
    href: "/procurement",
    items: [
      { id: "suppliers", label: "Suppliers", icon: TruckIcon, href: "/procurement/suppliers", count: 45 },
      { id: "purchase-requests", label: "Purchase Requests", icon: FileUploadIcon, href: "/procurement/purchase-requests", count: 23 },
      { id: "purchase-orders", label: "Purchase Orders", icon: SealIcon, href: "/procurement/purchase-orders", count: 67 },
      { id: "rfq", label: "RFQ (Quotations)", icon: Chat01Icon, href: "/procurement/rfq", count: 12 },
      { id: "vendor-evaluation", label: "Vendor Evaluation", icon: StarIcon, href: "/procurement/vendor-evaluation", count: 8 },
      { id: "contracts", label: "Contracts", icon: FileLockedIcon, href: "/procurement/contracts", count: 15 },
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
    icon: CalculateIcon,
    href: "/accounting",
    items: [
      { id: "chart-of-accounts", label: "Chart of Accounts", icon: HierarchyIcon, href: "/accounting/chart-of-accounts" },
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
    id: "finance",
    label: "Finance",
    icon: MoneySendSquareIcon,
    href: "/finance",
    items: [
      { id: "finance-dashboard", label: "Dashboard", icon: Analytics01Icon, href: "/finance" },
      { id: "cash-treasury", label: "Cash & Treasury", icon: BankIcon, href: "/finance/cash-treasury" },
      { id: "budgeting", label: "Budgeting", icon: ClipboardIcon, href: "/finance/budgeting" },
      { id: "cost-control", label: "Cost Control", icon: TargetIcon, href: "/finance/cost-control" },
      { id: "working-capital", label: "Working Capital", icon: CoinsIcon, href: "/finance/working-capital" },
      { id: "loan-financing", label: "Loan & Financing", icon: CreditCardValidationIcon, href: "/finance/loan-financing" },
      { id: "capex-investment", label: "CapEx & Investment", icon: ChartBreakoutSquareIcon, href: "/finance/capex-investment" },
      { id: "financial-planning", label: "Financial Planning", icon: ChartLineData01Icon, href: "/finance/financial-planning" },
      { id: "finance-reports", label: "Finance Reports", icon: PieChart01Icon, href: "/finance/reports" },
    ]
  },
  {
    id: "tax",
    label: "Tax",
    icon: TaxesIcon,
    href: "/tax",
    items: [
      { id: "tax-dashboard", label: "Tax Dashboard", icon: Analytics01Icon, href: "/tax" },
      { id: "output-tax", label: "Output Tax (VAT Out)", icon: FileExportIcon, href: "/tax/output-tax" },
      { id: "input-tax", label: "Input Tax (VAT In)", icon: FileImportIcon, href: "/tax/input-tax" },
      { id: "withholding-tax", label: "Withholding Tax (PPh)", icon: Invoice01Icon, href: "/tax/withholding-tax" },
      { id: "tax-reporting", label: "Tax Reporting & Filing", icon: DocumentValidationIcon, href: "/tax/reporting" },
      { id: "tax-reconciliation", label: "Tax Reconciliation", icon: FileSearchIcon, href: "/tax/reconciliation" },
      { id: "tax-master-data", label: "Tax Master Data", icon: DatabaseIcon, href: "/tax/master-data" },
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
]

export function TwoLevelLayout({ children }: LayoutProps) {
  return (
    <SecondarySidebarSlotProvider>
      <TwoLevelLayoutInner>{children}</TwoLevelLayoutInner>
    </SecondarySidebarSlotProvider>
  )
}

function TwoLevelLayoutInner({ children }: LayoutProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { subscribe, unsubscribe } = useWebSocket()
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null)
  const [isSecondSidebarCollapsed, setIsSecondSidebarCollapsed] = React.useState(false)
  const { slotContent } = useSecondarySidebarSlot()
  const { getModuleTotal, getItemCount } = useActionItems()
  const [msgUnreadCount, setMsgUnreadCount] = React.useState(0)

  // Initialize session activity tracking
  useSessionActivity({
    inactivityTimeout: 30 * 60 * 1000, // 30 minutes
    sessionWarningTime: 5 * 60 * 1000   // 5 minutes
  })

  // Fetch unread message count on mount, on route change, and on WebSocket events
  // Also play notification sound for incoming chat messages (centralized here since this layout is always mounted)
  React.useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('malaka_auth_token') : null
        if (!token) return
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/messaging/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const json = await res.json()
          setMsgUnreadCount(json.data?.count ?? json.count ?? 0)
        }
      } catch { /* ignore */ }
    }
    fetchUnread()
    // Poll every 60s as a fallback
    const interval = setInterval(fetchUnread, 60000)

    const handleChatMessage = (payload: unknown) => {
      fetchUnread()
      // Play sound for messages from others
      const data = payload as { sender_id?: string }
      if (data.sender_id && data.sender_id !== user?.id) {
        try {
          const audio = new Audio('/notifications.wav')
          audio.volume = 0.5
          audio.play().catch(() => {})
        } catch { /* Audio not supported */ }
      }
    }
    subscribe('chat_message', handleChatMessage)

    return () => {
      clearInterval(interval)
      unsubscribe('chat_message', handleChatMessage)
    }
  }, [subscribe, unsubscribe, pathname, user?.id])

  // Auto-set active menu based on pathname
  React.useEffect(() => {
    const currentMenu = menuData.find(menu => {
      // Special case for home page and dashboard - always show dashboard menu
      if ((pathname === '/' || pathname === '/dashboard') && menu.id === 'dashboard') return true
      if (menu.href && (pathname === menu.href || pathname.startsWith(menu.href + '/'))) return true
      if (menu.items) {
        return menu.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'))
      }
      return false
    })

    if (currentMenu) {
      setActiveMenu(currentMenu.id)
    } else {
      // Handle known routes that don't satisfy the above but are valid sidebar items
      if (pathname.startsWith('/messages')) setActiveMenu('messages')
      else if (pathname.startsWith('/calendar')) setActiveMenu('calendar')
      else if (pathname.startsWith('/settings')) setActiveMenu('settings')
      else setActiveMenu(null)
    }
  }, [pathname])

  const handleMenuClick = (menuId: string) => {
    if (activeMenu === menuId) {
      // Don't toggle off if it's a main nav item like messages
      if (['messages', 'calendar', 'settings'].includes(menuId)) return
      setActiveMenu(null)
    } else {
      setActiveMenu(menuId)
      setIsSecondSidebarCollapsed(false)
    }
  }

  // Get data for active menu, with fallbacks for standalone items
  const activeMenuData = React.useMemo(() => {
    const found = menuData.find(menu => menu.id === activeMenu)
    if (found) return found

    // Fallbacks for items that aren't in the main loop but need sidebar headers
    if (activeMenu === 'messages') return { id: 'messages', label: 'Messages', icon: Chat01Icon }
    if (activeMenu === 'calendar') return { id: 'calendar', label: 'Calendar', icon: Calendar01Icon }
    if (activeMenu === 'settings') return { id: 'settings', label: 'Settings', icon: SettingsIcon }

    return undefined
  }, [activeMenu])

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
      <aside className="fixed left-0 top-0 h-screen w-12 bg-gray-100 dark:bg-gray-800 flex flex-col z-20">
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
              const moduleTotal = getModuleTotal(menu.id)

              return (
                <li key={menu.id}>
                  {menu.href ? (
                    <Link
                      href={menu.href}
                      onClick={() => {
                        setActiveMenu(menu.id)
                        setIsSecondSidebarCollapsed(false)
                      }}
                      className={`relative flex items-center justify-center p-2 rounded-md transition-colors ${isActive
                        ? 'bg-blue-600 dark:bg-blue-400'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      title={menu.label}
                    >
                      <Icon icon={menu.icon} className={`h-[18px] w-[18px] ${isActive ? 'text-white dark:text-gray-950' : 'text-gray-600 dark:text-gray-300'}`} strokeWidth={2} />
                      {moduleTotal > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-red-500 rounded-full border border-gray-100 dark:border-gray-800" />
                      )}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleMenuClick(menu.id)}
                      className={`relative w-full flex items-center justify-center p-2 rounded-md transition-colors ${isActive
                        ? 'bg-blue-600 dark:bg-blue-400'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      title={menu.label}
                    >
                      <Icon icon={menu.icon} className={`h-[18px] w-[18px] ${isActive ? 'text-white dark:text-gray-950' : 'text-gray-600 dark:text-gray-300'}`} strokeWidth={2} />
                      {moduleTotal > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-red-500 rounded-full border border-gray-100 dark:border-gray-800" />
                      )}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom Section - Calendar, Messages, Dark Mode, Settings */}
        <div className="p-1 border-t border-gray-300 dark:border-gray-600 relative">
          <div className="space-y-1">
            {/* Calendar */}
            <Link
              href="/calendar"
              className={`w-full flex items-center justify-center p-2 rounded-md transition-colors ${pathname === '/calendar'
                ? 'bg-blue-600 dark:bg-blue-400'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              title="Calendar"
            >
              <Icon icon={Calendar01Icon} className={`h-[18px] w-[18px] ${pathname === '/calendar' ? 'text-white dark:text-gray-950' : 'text-gray-600 dark:text-gray-300'}`} strokeWidth={2} />
            </Link>

            {/* Messages */}
            <Link
              href="/messages"
              className={`w-full flex items-center justify-center p-2 rounded-md transition-colors relative ${pathname.startsWith('/messages')
                ? 'bg-blue-600 dark:bg-blue-400'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              title="Messages"
            >
              <Icon icon={Chat01Icon} className={`h-[18px] w-[18px] ${pathname.startsWith('/messages') ? 'text-white dark:text-gray-950' : 'text-gray-600 dark:text-gray-300'}`} strokeWidth={2} />
              {msgUnreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {msgUnreadCount > 99 ? '99+' : msgUnreadCount}
                </span>
              )}
            </Link>

            {/* Dark Mode Toggle */}
            <div className="w-full flex items-center justify-center p-2">
              <ThemeToggle />
            </div>

            {/* Settings */}
            <Link
              href="/settings"
              className={`w-full flex items-center justify-center p-2 rounded-md transition-colors ${pathname === '/settings'
                ? 'bg-blue-600 dark:bg-blue-400'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              title="Settings"
            >
              <Icon icon={SettingsIcon} className={`h-[18px] w-[18px] ${pathname === '/settings' ? 'text-white dark:text-gray-950' : 'text-gray-600 dark:text-gray-300'}`} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Second Level Sidebar - Detailed Menu Items */}
      {((activeMenu && activeMenuData?.items) || slotContent) && (
        <aside className={`${isSecondSidebarCollapsed ? 'w-12' : 'w-64'
          } ml-12 bg-gray-50 dark:bg-gray-800 flex flex-col transition-all duration-300 z-10 fixed left-0 top-0 h-screen font-[family-name:var(--font-noto-sans)]`}>
          {/* Header - Aligned with first sidebar header */}
          {activeMenuData && (
            <div className="h-[54px] px-4 border-b border-gray-300 dark:border-gray-600 flex items-center justify-between">
              {!isSecondSidebarCollapsed ? (
                <>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{activeMenuData.label}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
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
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 mx-auto">
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
          )}

          {/* Sub Navigation */}
          {activeMenuData?.items && (
            <nav className={slotContent ? 'p-2' : 'flex-1 p-2'}>
              <ul className="space-y-1">
                {activeMenuData.items.map((item) => {
                  const isActive = pathname === item.href
                  const badgeCount = activeMenu ? getItemCount(activeMenu, item.id) : 0

                  return (
                    <li key={item.id}>
                      {item.group && !isSecondSidebarCollapsed && (
                        <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{item.group}</p>
                      )}
                      <Link
                        href={item.href}
                        className={`flex items-center ${isSecondSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2'
                          } rounded-lg transition-colors ${isActive
                            ? 'bg-blue-600 dark:bg-blue-400 text-white dark:text-gray-950'
                            : 'hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        title={isSecondSidebarCollapsed ? item.label : undefined}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon icon={item.icon} className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-white dark:text-gray-950' : ''}`} />
                          {!isSecondSidebarCollapsed && (
                            <span className="text-sm font-medium">{item.label}</span>
                          )}
                        </div>
                        {!isSecondSidebarCollapsed && badgeCount > 0 ? (
                          <span className={`flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full px-1 ${isActive ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
                            }`}>
                            {badgeCount}
                          </span>
                        ) : !isSecondSidebarCollapsed && item.count ? (
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                            {formatCount(item.count)}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          )}

          {/* Dynamic slot content (e.g. conversation list for chat) */}
          {slotContent && !isSecondSidebarCollapsed && (
            <div className={`flex-1 overflow-y-auto ${activeMenuData?.items ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}>
              {slotContent}
            </div>
          )}

          {/* Help Card - Bottom section */}
          {!isSecondSidebarCollapsed && activeMenuData && (
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
      <main className={`flex-1 flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-900 ${((activeMenu && activeMenuData?.items) || slotContent)
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
    </div>
  )
}