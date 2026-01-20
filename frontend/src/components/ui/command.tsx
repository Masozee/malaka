"use client"

import * as React from "react"
import { Search, Home, Database, ShoppingCart, Package, Users, BarChart, Settings, Factory, Calculator, DollarSign, FileText, TrendingUp, Clock, MapPin } from "lucide-react"
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
      { label: "Dashboard", icon: Home, href: "/dashboard", keywords: ["home", "dashboard", "overview"] },
      { label: "Master Data", icon: Database, href: "/master-data", keywords: ["master", "data", "companies", "articles"] },
      { label: "Companies", icon: Database, href: "/master-data/companies", keywords: ["companies", "company", "organization"] },
      { label: "Articles", icon: Database, href: "/master-data/articles", keywords: ["articles", "products", "shoes", "items"] },
      { label: "Colors", icon: Database, href: "/master-data/colors", keywords: ["colors", "variants", "palette"] },
      { label: "Classifications", icon: Database, href: "/master-data/classifications", keywords: ["classifications", "categories", "types"] },
      { label: "Models", icon: Database, href: "/master-data/models", keywords: ["models", "designs", "variants"] },
      { label: "Sizes", icon: Database, href: "/master-data/sizes", keywords: ["sizes", "measurements", "dimensions"] },
    ]
  },
  {
    group: "Sales & Commerce",
    items: [
      { label: "Sales Management", icon: ShoppingCart, href: "#", keywords: ["sales", "orders", "customers", "pos"] },
      { label: "Point of Sale", icon: ShoppingCart, href: "#", keywords: ["pos", "retail", "checkout", "payment"] },
      { label: "Online Sales", icon: TrendingUp, href: "#", keywords: ["online", "ecommerce", "web", "digital"] },
      { label: "Customer Returns", icon: ShoppingCart, href: "#", keywords: ["returns", "refunds", "exchanges"] },
      { label: "Promotions", icon: TrendingUp, href: "#", keywords: ["promotions", "discounts", "campaigns", "marketing"] },
    ]
  },
  {
    group: "Production & Manufacturing",
    items: [
      { label: "Production Planning", icon: Factory, href: "#", keywords: ["production", "manufacturing", "planning", "scheduling"] },
      { label: "Work Orders", icon: Factory, href: "#", keywords: ["work", "orders", "manufacturing", "jobs"] },
      { label: "Quality Control", icon: Factory, href: "#", keywords: ["quality", "control", "inspection", "testing"] },
      { label: "Material Planning", icon: Package, href: "#", keywords: ["material", "planning", "mrp", "requirements"] },
      { label: "Production Reports", icon: BarChart, href: "#", keywords: ["production", "reports", "efficiency", "output"] },
    ]
  },
  {
    group: "Inventory & Warehouse",
    items: [
      { label: "Inventory Control", icon: Package, href: "#", keywords: ["inventory", "stock", "warehouse", "items"] },
      { label: "Stock Transfer", icon: MapPin, href: "#", keywords: ["transfer", "movement", "relocation", "stock"] },
      { label: "Goods Receipt", icon: Package, href: "#", keywords: ["receipt", "receiving", "incoming", "delivery"] },
      { label: "Stock Adjustments", icon: Package, href: "#", keywords: ["adjustments", "corrections", "variance"] },
      { label: "Stock Opname", icon: Package, href: "#", keywords: ["opname", "counting", "physical", "audit"] },
    ]
  },
  {
    group: "Finance & Accounting",
    items: [
      { label: "General Ledger", icon: Calculator, href: "#", keywords: ["ledger", "gl", "accounts", "journal"] },
      { label: "Accounts Receivable", icon: DollarSign, href: "#", keywords: ["receivable", "ar", "collections", "invoices"] },
      { label: "Accounts Payable", icon: DollarSign, href: "#", keywords: ["payable", "ap", "vendors", "bills"] },
      { label: "Cash Management", icon: DollarSign, href: "#", keywords: ["cash", "bank", "payments", "receipts"] },
      { label: "Financial Reports", icon: FileText, href: "#", keywords: ["financial", "reports", "statements", "balance"] },
      { label: "Trial Balance", icon: Calculator, href: "#", keywords: ["trial", "balance", "accounts", "summary"] },
      { label: "Cost Centers", icon: Calculator, href: "#", keywords: ["cost", "centers", "allocation", "budget"] },
    ]
  },
  {
    group: "Human Resources",
    items: [
      { label: "Employee Management", icon: Users, href: "#", keywords: ["employees", "staff", "personnel", "hr"] },
      { label: "Payroll Processing", icon: DollarSign, href: "#", keywords: ["payroll", "salary", "wages", "compensation"] },
      { label: "Attendance Tracking", icon: Clock, href: "#", keywords: ["attendance", "time", "tracking", "biometric"] },
      { label: "Leave Management", icon: Clock, href: "#", keywords: ["leave", "vacation", "absence", "time off"] },
      { label: "Performance Review", icon: TrendingUp, href: "#", keywords: ["performance", "review", "evaluation", "appraisal"] },
    ]
  },
  {
    group: "Reports & Analytics",
    items: [
      { label: "Business Intelligence", icon: BarChart, href: "#", keywords: ["bi", "analytics", "intelligence", "insights"] },
      { label: "Sales Reports", icon: TrendingUp, href: "#", keywords: ["sales", "reports", "performance", "revenue"] },
      { label: "Inventory Reports", icon: Package, href: "#", keywords: ["inventory", "reports", "stock", "levels"] },
      { label: "Financial Analysis", icon: Calculator, href: "#", keywords: ["financial", "analysis", "ratios", "performance"] },
      { label: "Custom Reports", icon: FileText, href: "#", keywords: ["custom", "reports", "builder", "designer"] },
    ]
  },
  {
    group: "System",
    items: [
      { label: "User Management", icon: Users, href: "#", keywords: ["users", "permissions", "roles", "access"] },
      { label: "System Settings", icon: Settings, href: "#", keywords: ["settings", "configuration", "preferences", "setup"] },
      { label: "Data Import/Export", icon: Database, href: "#", keywords: ["import", "export", "data", "migration"] },
      { label: "Backup & Restore", icon: Database, href: "#", keywords: ["backup", "restore", "recovery", "archive"] },
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
          <Search className="mr-3 h-5 w-5 shrink-0 opacity-50" aria-hidden="true" />
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
                  const Icon = item.icon
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleSelect(item.href)}
                      className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
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