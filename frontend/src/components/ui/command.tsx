"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  ShoppingCartIcon,
  Package01Icon,
  UserGroupIcon,
  ChartBarLineIcon,
  SettingsIcon,
  CalculatorIcon,
  Dollar01Icon,
  FileIcon,
  ChartIncreaseIcon,
  Clock01Icon,
  LocationIcon,
  Analytics02Icon,
  DatabaseAddIcon,
  SquareArrowLeftRightIcon,
  ThreeDViewIcon,
  CalculateIcon,
  ChartUpIcon,
  HierarchyIcon,
  CubeIcon,
  RulerIcon,
  ColorsIcon,
  TruckIcon,
} from "@hugeicons/core-free-icons"

import { useRouter } from "next/navigation"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const commands = [
  {
    group: "Navigation",
    items: [
      { label: "Dashboard", icon: Analytics02Icon, href: "/dashboard", keywords: ["home", "dashboard", "overview"] },
      { label: "Master Data", icon: DatabaseAddIcon, href: "/master-data", keywords: ["master", "data", "companies", "articles"] },
      { label: "Companies", icon: DatabaseAddIcon, href: "/master-data/companies", keywords: ["companies", "company", "organization"] },
      { label: "Articles", icon: DatabaseAddIcon, href: "/master-data/articles", keywords: ["articles", "products", "shoes", "items"] },
      { label: "Colors", icon: ColorsIcon, href: "/master-data/colors", keywords: ["colors", "variants", "palette"] },
      { label: "Classifications", icon: HierarchyIcon, href: "/master-data/classifications", keywords: ["classifications", "categories", "types"] },
      { label: "Models", icon: CubeIcon, href: "/master-data/models", keywords: ["models", "designs", "variants"] },
      { label: "Sizes", icon: RulerIcon, href: "/master-data/sizes", keywords: ["sizes", "measurements", "dimensions"] },
    ]
  },
  {
    group: "Sales & Commerce",
    items: [
      { label: "Sales Management", icon: SquareArrowLeftRightIcon, href: "/sales", keywords: ["sales", "orders", "customers", "pos"] },
      { label: "Sales Orders", icon: ShoppingCartIcon, href: "/sales/orders", keywords: ["sales", "orders", "checkout"] },
      { label: "Online Sales", icon: ChartUpIcon, href: "/sales/online-orders", keywords: ["online", "ecommerce", "web", "digital"] },
      { label: "Sales Returns", icon: ShoppingCartIcon, href: "/sales/returns", keywords: ["returns", "refunds", "exchanges"] },
      { label: "Promotions", icon: ChartUpIcon, href: "/sales/promotions", keywords: ["promotions", "discounts", "campaigns", "marketing"] },
    ]
  },
  {
    group: "Production & Manufacturing",
    items: [
      { label: "Production", icon: ThreeDViewIcon, href: "/production", keywords: ["production", "manufacturing", "planning", "scheduling"] },
      { label: "Work Orders", icon: ThreeDViewIcon, href: "/production/work-orders", keywords: ["work", "orders", "manufacturing", "jobs"] },
      { label: "Quality Control", icon: ThreeDViewIcon, href: "/production/quality-control", keywords: ["quality", "control", "inspection", "testing"] },
      { label: "Bill of Materials", icon: Package01Icon, href: "/production/bill-of-materials", keywords: ["material", "planning", "mrp", "bom", "requirements"] },
      { label: "Production Planning", icon: ChartBarLineIcon, href: "/production/planning", keywords: ["production", "planning", "scheduling"] },
    ]
  },
  {
    group: "Inventory & Warehouse",
    items: [
      { label: "Inventory", icon: Package01Icon, href: "/inventory", keywords: ["inventory", "stock", "warehouse", "items"] },
      { label: "Stock Transfer", icon: LocationIcon, href: "/inventory/transfers", keywords: ["transfer", "movement", "relocation", "stock"] },
      { label: "Goods Receipt", icon: Package01Icon, href: "/inventory/goods-receipt", keywords: ["receipt", "receiving", "incoming", "delivery"] },
      { label: "Stock Adjustments", icon: Package01Icon, href: "/inventory/stock-adjustments", keywords: ["adjustments", "corrections", "variance"] },
      { label: "Stock Opname", icon: Package01Icon, href: "/inventory/stock-opname", keywords: ["opname", "counting", "physical", "audit"] },
    ]
  },
  {
    group: "Accounting",
    items: [
      { label: "Accounting", icon: CalculatorIcon, href: "/accounting", keywords: ["accounting", "ledger", "gl", "accounts"] },
      { label: "General Ledger", icon: CalculatorIcon, href: "/accounting/general-ledger", keywords: ["ledger", "gl", "accounts"] },
      { label: "Journal Entries", icon: FileIcon, href: "/accounting/journal", keywords: ["journal", "entries", "debit", "credit"] },
      { label: "Trial Balance", icon: CalculateIcon, href: "/accounting/trial-balance", keywords: ["trial", "balance", "accounts", "summary"] },
      { label: "Cash & Bank", icon: Dollar01Icon, href: "/accounting/cash-bank", keywords: ["cash", "bank", "payments", "receipts"] },
      { label: "Fixed Assets", icon: CalculateIcon, href: "/accounting/fixed-assets", keywords: ["fixed", "assets", "depreciation"] },
      { label: "Cost Centers", icon: CalculateIcon, href: "/accounting/cost-centers", keywords: ["cost", "centers", "allocation", "budget"] },
    ]
  },
  {
    group: "Finance",
    items: [
      { label: "Finance", icon: Dollar01Icon, href: "/finance", keywords: ["finance", "treasury", "budgeting"] },
      { label: "Cash & Treasury", icon: Dollar01Icon, href: "/finance/cash-treasury", keywords: ["cash", "treasury", "liquidity"] },
      { label: "Budgeting", icon: CalculateIcon, href: "/finance/budgeting", keywords: ["budget", "allocation", "variance"] },
      { label: "Loan & Financing", icon: Dollar01Icon, href: "/finance/loan-financing", keywords: ["loan", "credit", "financing", "repayment"] },
      { label: "Finance Reports", icon: FileIcon, href: "/finance/reports", keywords: ["financial", "reports", "statements"] },
    ]
  },
  {
    group: "Tax",
    items: [
      { label: "Tax", icon: CalculatorIcon, href: "/tax", keywords: ["tax", "pajak", "ppn", "pph"] },
      { label: "Output Tax (VAT Out)", icon: ChartUpIcon, href: "/tax/output-tax", keywords: ["output", "vat", "ppn", "keluaran", "sales"] },
      { label: "Input Tax (VAT In)", icon: ChartIncreaseIcon, href: "/tax/input-tax", keywords: ["input", "vat", "ppn", "masukan", "purchase"] },
      { label: "Withholding Tax", icon: CalculateIcon, href: "/tax/withholding-tax", keywords: ["withholding", "pph", "21", "23", "26"] },
      { label: "Tax Reporting", icon: FileIcon, href: "/tax/reporting", keywords: ["reporting", "filing", "spt", "efiling"] },
    ]
  },
  {
    group: "Human Resources",
    items: [
      { label: "HR Management", icon: UserGroupIcon, href: "/hr", keywords: ["hr", "employees", "staff", "personnel"] },
      { label: "Employees", icon: UserGroupIcon, href: "/hr/employees", keywords: ["employees", "staff", "personnel"] },
      { label: "Payroll", icon: Dollar01Icon, href: "/hr/payroll", keywords: ["payroll", "salary", "wages", "compensation"] },
      { label: "Attendance", icon: Clock01Icon, href: "/hr/attendance", keywords: ["attendance", "time", "tracking", "biometric"] },
      { label: "Leave Management", icon: Clock01Icon, href: "/hr/leave", keywords: ["leave", "vacation", "absence", "time off"] },
      { label: "Performance", icon: ChartIncreaseIcon, href: "/hr/performance", keywords: ["performance", "review", "evaluation", "appraisal"] },
    ]
  },
  {
    group: "Procurement",
    items: [
      { label: "Procurement", icon: Package01Icon, href: "/procurement", keywords: ["procurement", "purchasing", "vendor"] },
      { label: "Purchase Requests", icon: FileIcon, href: "/procurement/purchase-requests", keywords: ["purchase", "request", "pr"] },
      { label: "Purchase Orders", icon: FileIcon, href: "/procurement/purchase-orders", keywords: ["purchase", "order", "po"] },
      { label: "Suppliers", icon: TruckIcon, href: "/master-data/suppliers", keywords: ["suppliers", "vendors", "partners"] },
    ]
  },
  {
    group: "Shipping & Logistics",
    items: [
      { label: "Shipping", icon: TruckIcon, href: "/shipping", keywords: ["shipping", "logistics", "delivery"] },
      { label: "Outbound Shipments", icon: TruckIcon, href: "/shipping/outbound", keywords: ["outbound", "shipments", "delivery"] },
      { label: "Airwaybill", icon: FileIcon, href: "/shipping/airwaybill", keywords: ["airwaybill", "awb", "tracking"] },
      { label: "Couriers", icon: TruckIcon, href: "/shipping/couriers", keywords: ["couriers", "delivery", "services"] },
    ]
  },
  {
    group: "System",
    items: [
      { label: "Users", icon: UserGroupIcon, href: "/master-data/users", keywords: ["users", "permissions", "roles", "access"] },
      { label: "Roles & Permissions", icon: UserGroupIcon, href: "/master-data/roles", keywords: ["roles", "permissions", "rbac"] },
      { label: "Settings", icon: SettingsIcon, href: "/settings", keywords: ["settings", "configuration", "preferences", "setup"] },
    ]
  }
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = React.useState("")
  const router = useRouter()

  const filteredCommands = React.useMemo(() => {
    if (!search) return commands

    return commands.map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(search.toLowerCase()))
      )
    })).filter(group => group.items.length > 0)
  }, [search])

  const handleSelect = (href: string) => {
    if (href !== "#") {
      router.push(href)
    }
    onOpenChange(false)
    setSearch("")
  }

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0  max-w-[750px] max-h-[80vh]">
        <DialogHeader className="px-6 pb-0 pt-6">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Quick Navigation
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center border-b px-4 pb-4">
          <HugeiconsIcon icon={Search01Icon} className="mr-3 h-5 w-5 shrink-0 opacity-50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for pages, features, modules..."
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none border-0 focus-visible:ring-0 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Search for pages"
          />
          <kbd className="pointer-events-none ml-auto hidden h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[11px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden pb-4">
          {filteredCommands.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            filteredCommands.map((group) => (
              <div key={group.group} className="overflow-hidden p-1">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleSelect(item.href)}
                      className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <HugeiconsIcon icon={item.icon} className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}