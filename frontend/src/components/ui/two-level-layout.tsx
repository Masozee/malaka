"use client"

import * as React from "react"
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
  // Master Data icons
  Palette,
  Shirt,
  Network,
  Box,
  Ruler,
  ScanLine,
  DollarSign,
  Image,
  Truck,
  Warehouse,
  Map,
  UserCheck,
  // Sales icons
  CreditCard,
  Store,
  RefreshCw,
  Gift,
  TrendingUp,
  // Production icons
  Cog,
  ClipboardList,
  CheckCircle,
  // Inventory icons
  ArrowLeftRight,
  PackageCheck,
  Plus,
  Minus,
  Search,
  // Accounting icons
  BookOpen,
  Receipt,
  PiggyBank,
  FileText,
  Target,
  Building,
  // HR icons
  Calendar,
  Clock,
  Award,
  GraduationCap,
  // Procurement icons
  ShoppingBag,
  FileInput,
  FileCheck,
  MessageSquare,
  Star,
  HandHeart,
  // Reporting icons
  PieChart,
  LineChart,
  BarChart3,
  FileSpreadsheet,
  PanelLeft,
  // Help icons
  HelpCircle,
  ExternalLink,
  LogOut,
  ArrowRight,
  Quote
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import { useSessionActivity } from "@/hooks/useSessionActivity"

interface LayoutProps {
  children: React.ReactNode
}

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  items?: SubMenuItem[]
}

interface SubMenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  keywords?: string[]
  count?: number
}

const menuData: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    href: "/dashboard"
  },
  {
    id: "master-data",
    label: "Master Data",
    icon: Database,
    items: [
      { id: "companies", label: "Companies", icon: Building2, href: "/master-data/companies", count: 24 },
      { id: "users", label: "Users", icon: UserCheck, href: "/master-data/users", count: 156 },
      { id: "customers", label: "Customers", icon: Users, href: "/master-data/customers", count: 3289 },
      { id: "divisions", label: "Divisions", icon: Network, href: "/master-data/divisions", count: 6 },
      { id: "depstores", label: "Dept Stores", icon: Store, href: "/master-data/depstores", count: 12 },
      { id: "master-data-settings", label: "Settings", icon: Settings, href: "/master-data/settings" }
    ]
  },
  {
    id: "products",
    label: "Products",
    icon: Shirt,
    items: [
      { id: "articles", label: "Articles", icon: Shirt, href: "/master-data/articles", count: 2847 },
      { id: "classifications", label: "Classifications", icon: Network, href: "/products/classifications", count: 18 },
      { id: "colors", label: "Colors", icon: Palette, href: "/master-data/colors", count: 42 },
      { id: "models", label: "Models", icon: Box, href: "/products/models", count: 89 },
      { id: "sizes", label: "Sizes", icon: Ruler, href: "/products/sizes", count: 28 },
      { id: "barcodes", label: "Barcodes", icon: ScanLine, href: "/master-data/barcodes" },
      { id: "prices", label: "Prices", icon: DollarSign, href: "/master-data/prices", count: 1543 },
      { id: "gallery", label: "Gallery", icon: Image, href: "/master-data/gallery-images", count: 456 },
      { id: "products-settings", label: "Settings", icon: Settings, href: "/products/settings" }
    ]
  },
  {
    id: "sales",
    label: "Sales",
    icon: ShoppingCart,
    href: "/sales",
    items: [
      { id: "pos", label: "Point of Sale", icon: CreditCard, href: "/sales/pos", count: 142 },
      { id: "online-sales", label: "Online Sales", icon: TrendingUp, href: "/sales/online", count: 789 },
      { id: "direct-sales", label: "Direct Sales", icon: Store, href: "/sales/direct", count: 234 },
      { id: "quotations", label: "Quotations", icon: Quote, href: "/sales/quotations", count: 89 },
      { id: "orders", label: "Sales Orders", icon: FileText, href: "/sales/orders", count: 567 },
      { id: "returns", label: "Returns", icon: RefreshCw, href: "/sales/returns", count: 23 },
      { id: "consignment", label: "Consignment", icon: Package, href: "/sales/consignment", count: 45 },
      { id: "promotions", label: "Promotions", icon: Gift, href: "/sales/promotions", count: 8 },
      { id: "targets", label: "Sales Targets", icon: Target, href: "/sales/targets" },
      { id: "competitors", label: "Competitors", icon: BarChart, href: "/sales/competitors" },
      { id: "reconciliation", label: "Reconciliation", icon: CheckCircle, href: "/sales/reconciliation", count: 12 },
      { id: "sales-settings", label: "Settings", icon: Settings, href: "/sales/settings" }
    ]
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    href: "/inventory",
    items: [
      { id: "stock-control", label: "Stock Control", icon: Package, href: "/inventory/stock-control", count: 1247 },
      { id: "raw-materials", label: "Raw Materials", icon: Box, href: "/inventory/raw-materials", count: 156 },
      { id: "goods-receipt", label: "Goods Receipt", icon: PackageCheck, href: "/inventory/goods-receipt", count: 34 },
      { id: "stock-transfer", label: "Stock Transfer", icon: ArrowLeftRight, href: "/inventory/stock-transfer", count: 16 },
      { id: "goods-issue", label: "Goods Issue", icon: Minus, href: "/inventory/goods-issue", count: 78 },
      { id: "adjustments", label: "Adjustments", icon: Plus, href: "/inventory/adjustments", count: 5 },
      { id: "stock-opname", label: "Stock Opname", icon: Search, href: "/inventory/stock-opname", count: 3 },
      { id: "return-supplier", label: "Return Supplier", icon: RefreshCw, href: "/inventory/return-supplier", count: 7 },
      { id: "barcode-print", label: "Barcode Print", icon: ScanLine, href: "/inventory/barcode-print" },
      { id: "inventory-settings", label: "Settings", icon: Settings, href: "/inventory/settings" }
    ]
  },
  {
    id: "production",
    label: "Production",
    icon: Factory,
    href: "/production",
    items: [
      { id: "suppliers", label: "Suppliers", icon: Truck, href: "/production/suppliers", count: 67 },
      { id: "warehouses", label: "Warehouses", icon: Warehouse, href: "/production/warehouses", count: 8 },
      { id: "purchase-orders", label: "Purchase Orders", icon: FileText, href: "/production/purchase-orders", count: 89 },
      { id: "work-orders", label: "Work Orders", icon: Cog, href: "/production/work-orders", count: 45 },
      { id: "quality-control", label: "Quality Control", icon: CheckCircle, href: "/production/quality-control", count: 12 },
      { id: "material-planning", label: "Material Planning", icon: Package, href: "/production/material-planning", count: 15 },
      { id: "analytics", label: "Analytics", icon: BarChart3, href: "/production/analytics" },
      { id: "production-settings", label: "Settings", icon: Settings, href: "/production/settings" }
    ]
  },
  {
    id: "procurement",
    label: "Procurement",
    icon: ShoppingBag,
    href: "/procurement",
    items: [
      { id: "suppliers", label: "Suppliers", icon: Truck, href: "/procurement/suppliers", count: 45 },
      { id: "purchase-requests", label: "Purchase Requests", icon: FileInput, href: "/procurement/purchase-requests", count: 23 },
      { id: "purchase-orders", label: "Purchase Orders", icon: FileCheck, href: "/procurement/purchase-orders", count: 67 },
      { id: "rfq", label: "RFQ (Quotations)", icon: MessageSquare, href: "/procurement/rfq", count: 12 },
      { id: "vendor-evaluation", label: "Vendor Evaluation", icon: Star, href: "/procurement/vendor-evaluation", count: 8 },
      { id: "contracts", label: "Contracts", icon: HandHeart, href: "/procurement/contracts", count: 15 },
      { id: "analytics", label: "Analytics", icon: BarChart3, href: "/procurement/analytics" },
      { id: "procurement-settings", label: "Settings", icon: Settings, href: "/procurement/settings" }
    ]
  },
  {
    id: "shipping",
    label: "Shipping",
    icon: Map,
    href: "/shipping",
    items: [
      { id: "couriers", label: "Couriers", icon: Map, href: "/shipping/couriers", count: 15 },
      { id: "shipment-management", label: "Shipment Management", icon: Package, href: "/shipping/management" },
      { id: "airwaybill", label: "Airwaybill", icon: FileText, href: "/shipping/airwaybill" },
      { id: "outbound-scanning", label: "Outbound Scanning", icon: ScanLine, href: "/shipping/outbound" },
      { id: "manifest", label: "Manifest", icon: ClipboardList, href: "/shipping/manifest" },
      { id: "shipping-invoices", label: "Shipping Invoices", icon: Receipt, href: "/shipping/invoices" },
      { id: "shipping-settings", label: "Settings", icon: Settings, href: "/shipping/settings" }
    ]
  },
  {
    id: "accounting",
    label: "Accounting",
    icon: Calculator,
    href: "/accounting",
    items: [
      { id: "general-ledger", label: "General Ledger", icon: BookOpen, href: "/accounting/general-ledger" },
      { id: "journal-entries", label: "Journal Entries", icon: FileText, href: "/accounting/journal" },
      { id: "trial-balance", label: "Trial Balance", icon: BarChart, href: "/accounting/trial-balance" },
      { id: "cash-bank", label: "Cash & Bank", icon: PiggyBank, href: "/accounting/cash-bank" },
      { id: "invoices", label: "Invoices", icon: Receipt, href: "/accounting/invoices" },
      { id: "cost-centers", label: "Cost Centers", icon: Target, href: "/accounting/cost-centers" },
      { id: "fixed-assets", label: "Fixed Assets", icon: Building, href: "/accounting/fixed-assets" },
      { id: "currency", label: "Currency", icon: DollarSign, href: "/accounting/currency" },
      { id: "accounting-settings", label: "Settings", icon: Settings, href: "/accounting/settings" }
    ]
  },
  {
    id: "hr",
    label: "HR Management",
    icon: Users,
    href: "/hr",
    items: [
      { id: "employees", label: "Employees", icon: Users, href: "/hr/employees" },
      { id: "payroll", label: "Payroll", icon: DollarSign, href: "/hr/payroll" },
      { id: "attendance", label: "Attendance", icon: Clock, href: "/hr/attendance" },
      { id: "leave", label: "Leave Management", icon: Calendar, href: "/hr/leave" },
      { id: "performance", label: "Performance", icon: Award, href: "/hr/performance" },
      { id: "training", label: "Training", icon: GraduationCap, href: "/hr/training" },
      { id: "spg-stores", label: "SPG Stores", icon: Store, href: "/hr/spg-stores" },
      { id: "hr-settings", label: "Settings", icon: Settings, href: "/hr/settings" }
    ]
  },
  {
    id: "reporting",
    label: "Reporting",
    icon: BarChart,
    href: "/reports",
    items: [
      { id: "dashboard", label: "BI Dashboard", icon: PieChart, href: "/reports/dashboard" },
      { id: "sales-reports", label: "Sales Reports", icon: LineChart, href: "/reports/sales" },
      { id: "inventory-reports", label: "Inventory Reports", icon: Package, href: "/reports/inventory" },
      { id: "financial-reports", label: "Financial Reports", icon: Calculator, href: "/reports/financial" },
      { id: "production-reports", label: "Production Reports", icon: Factory, href: "/reports/production" },
      { id: "hr-reports", label: "HR Reports", icon: Users, href: "/reports/hr" },
      { id: "custom-reports", label: "Custom Reports", icon: FileSpreadsheet, href: "/reports/custom" },
      { id: "static-reports", label: "Static Reports", icon: FileText, href: "/reports/static" },
      { id: "olap", label: "OLAP Analysis", icon: BarChart3, href: "/reports/olap" },
      { id: "reporting-settings", label: "Settings", icon: Settings, href: "/reports/settings" }
    ]
  }
]

// Dummy notification data
const notifications = [
  {
    id: 1,
    title: "New Order Received",
    message: "Order #12345 from ACME Corp needs processing",
    time: "2 min ago",
    type: "order",
    unread: true
  },
  {
    id: 2,
    title: "Low Stock Alert",
    message: "Nike Air Max 270 stock is running low (5 units left)",
    time: "15 min ago",
    type: "inventory",
    unread: true
  },
  {
    id: 3,
    title: "Payment Received",
    message: "Payment of Rp 2,450,000 confirmed for Invoice #INV-001",
    time: "1 hour ago",
    type: "payment",
    unread: false
  },
  {
    id: 4,
    title: "Production Complete",
    message: "Work Order #WO-789 has been completed",
    time: "2 hours ago",
    type: "production",
    unread: false
  },
  {
    id: 5,
    title: "System Maintenance",
    message: "Scheduled maintenance will occur tonight at 2 AM",
    time: "1 day ago",
    type: "system",
    unread: false
  }
]

export function TwoLevelLayout({ children }: LayoutProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null)
  const [isSecondSidebarCollapsed, setIsSecondSidebarCollapsed] = React.useState(false)
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [showProfilePopup, setShowProfilePopup] = React.useState(false)
  
  // Initialize session activity tracking
  useSessionActivity({
    inactivityTimeout: 30 * 60 * 1000, // 30 minutes
    sessionWarningTime: 5 * 60 * 1000   // 5 minutes
  })

  // Auto-set active menu based on pathname
  React.useEffect(() => {
    const currentMenu = menuData.find(menu => {
      if (menu.href && pathname === menu.href) return true
      if (menu.items) {
        return menu.items.some(item => pathname.startsWith(item.href))
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
        <div className="h-[54px] border-b border-gray-300 dark:border-gray-600 flex items-center justify-center">
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
              const Icon = menu.icon
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
                      <Icon className={`h-4 w-4 ${isActive ? 'text-black' : 'text-gray-600 dark:text-gray-300'}`} />
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
                      <Icon className={`h-4 w-4 ${isActive ? 'text-black' : 'text-gray-600 dark:text-gray-300'}`} />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
        
        {/* Bottom Section - Calendar, Theme Toggle, Settings, Bell and User Avatar */}
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
              <Calendar className={`h-4 w-4 ${pathname === '/calendar' ? 'text-black' : 'text-gray-600 dark:text-gray-300'}`} />
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
              <Settings className={`h-4 w-4 ${pathname === '/settings' ? 'text-black' : 'text-gray-600 dark:text-gray-300'}`} />
            </Link>
            
            {/* Notifications Button with Badge */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications)
                }}
                className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Notifications"
              >
                <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute bottom-full left-12 mb-2 w-80 bg-white dark:bg-gray-800 rounded-lg  border border-gray-200 dark:border-gray-700 z-50 animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {notifications.filter(n => n.unread).length} unread
                      </span>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                          notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.unread ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
                    <button className="w-full text-xs text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile Popup */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowProfilePopup(!showProfilePopup)
                }}
                className="w-full flex items-center justify-center p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 hover:scale-110 hover:"
                title="User Profile"
              >
                {user ? (
                  <div className="h-4 w-4 rounded-full bg-blue-600 flex items-center justify-center transition-all duration-300 hover:bg-blue-700 hover: hover:scale-125 hover:ring-2 hover:ring-blue-300">
                    <span className="text-[8px] text-white font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-300 transition-all duration-300 hover:text-blue-600 hover:scale-110" />
                )}
              </button>
              
              {/* Profile Popup */}
              {showProfilePopup && user && (
                <div className="absolute bottom-full left-12 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg  border border-gray-200 dark:border-gray-700 z-[9999] animate-in slide-in-from-left-2 fade-in-0 duration-200"
                     style={{ pointerEvents: 'auto' }}>
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
                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowProfilePopup(false)
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <User className="h-4 w-4 flex-shrink-0" />
                      Profile
                    </Link>
                    
                    <Link
                      href="/settings"
                      onClick={() => setShowProfilePopup(false)}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <Settings className="h-4 w-4 flex-shrink-0" />
                      Settings
                    </Link>
                    
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    
                    <button
                      onClick={() => {
                        setShowProfilePopup(false)
                        logout()
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Second Level Sidebar - Detailed Menu Items */}
      {activeMenu && activeMenuData?.items && (
        <aside className={`${
          isSecondSidebarCollapsed ? 'w-12' : 'w-64'
        } ml-12 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 flex flex-col transition-all duration-300 z-10 fixed left-0 top-0 h-screen`}>
          {/* Header with Toggle - Aligned with first sidebar header */}
          <div className="h-[54px] px-4 border-b border-gray-300 dark:border-gray-600 flex items-center justify-between">
            {!isSecondSidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <activeMenuData.icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="font-medium text-gray-900 dark:text-gray-100">{activeMenuData.label}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSecondSidebarCollapsed(!isSecondSidebarCollapsed)}
              className="h-8 w-8 p-0"
            >
              {isSecondSidebarCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Sub Navigation */}
          <nav className="flex-1 p-2">
            <ul className="space-y-1">
              {activeMenuData.items.map((item) => {
                const Icon = item.icon
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
                        <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-black' : ''}`} />
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
                  <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Need Help?</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Get support, tutorials, and documentation for {activeMenuData.label.toLowerCase()}.
                </p>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors">
                    <span className="text-gray-700 dark:text-gray-300">View Guide</span>
                    <ExternalLink className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button className="w-full flex items-center justify-between px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors">
                    <span className="text-gray-700 dark:text-gray-300">Contact Support</span>
                    <ExternalLink className="h-3 w-3 text-gray-500 dark:text-gray-400" />
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
          ? isSecondSidebarCollapsed ? 'ml-24' : 'ml-80'
          : 'ml-12'
      } transition-all duration-300`}>
        {children}
      </main>

      {/* Click outside handlers */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false)
          }}
        />
      )}
      {showProfilePopup && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => {
            setShowProfilePopup(false)
          }}
        />
      )}
    </div>
  )
}