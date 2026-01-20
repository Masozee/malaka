"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { 
  ArrowLeft, 
  Book, 
  Home,
  FileText,
  Users,
  Settings,
  HelpCircle,
  Database,
  ShoppingCart,
  Package,
  Factory,
  ShoppingBag,
  Map,
  Calculator,
  BarChart,
  Building2,
  Shirt,
  ChevronRight
} from "lucide-react"

interface GuidelinesLayoutProps {
  children: React.ReactNode
}

interface GuidelineSection {
  id: string
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface ModuleSection {
  id: string
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const guidelineSections: GuidelineSection[] = [
  {
    id: "overview",
    title: "System Overview",
    href: "/guidelines/overview",
    icon: Home
  },
  {
    id: "getting-started",
    title: "Getting Started",
    href: "/guidelines/getting-started", 
    icon: Book
  },
  {
    id: "user-roles",
    title: "User Roles & Permissions",
    href: "/guidelines/user-roles",
    icon: Users
  },
  {
    id: "administration",
    title: "System Administration",
    href: "/guidelines/administration",
    icon: Settings
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    href: "/guidelines/troubleshooting",
    icon: HelpCircle
  }
]

const moduleSections: ModuleSection[] = [
  {
    id: "master-data",
    title: "Master Data",
    href: "/guidelines/modules/master-data",
    icon: Database
  },
  {
    id: "products",
    title: "Products",
    href: "/guidelines/modules/products",
    icon: Shirt
  },
  {
    id: "sales",
    title: "Sales",
    href: "/guidelines/modules/sales",
    icon: ShoppingCart
  },
  {
    id: "inventory",
    title: "Inventory",
    href: "/guidelines/modules/inventory",
    icon: Package
  },
  {
    id: "production",
    title: "Production",
    href: "/guidelines/modules/production",
    icon: Factory
  },
  {
    id: "procurement",
    title: "Procurement",
    href: "/guidelines/modules/procurement",
    icon: ShoppingBag
  },
  {
    id: "shipping",
    title: "Shipping",
    href: "/guidelines/modules/shipping",
    icon: Map
  },
  {
    id: "accounting",
    title: "Accounting",
    href: "/guidelines/modules/accounting",
    icon: Calculator
  },
  {
    id: "hr",
    title: "HR Management",
    href: "/guidelines/modules/hr",
    icon: Users
  },
  {
    id: "reporting",
    title: "Reports & Analytics",
    href: "/guidelines/modules/reporting",
    icon: BarChart
  }
]

export function GuidelinesLayout({ children }: GuidelinesLayoutProps) {
  const pathname = usePathname()
  const isHomePage = pathname === "/guidelines"
  const showSidebar = !isHomePage

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-none flex h-16 items-center px-8">
          <div className="flex items-center space-x-6">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to System</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <Link 
              href="/guidelines/overview"
              className="flex items-center space-x-3 group"
            >
              <Book className="h-6 w-6 text-primary" />
              <div>
                <span className="font-bold text-lg">Malaka ERP</span>
                <div className="text-xs text-muted-foreground -mt-1">Guidelines</div>
              </div>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link 
                href="/guidelines/getting-started" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Getting Started
              </Link>
              <Link 
                href="/guidelines/modules" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Modules
              </Link>
              <Link 
                href="/guidelines/troubleshooting" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Help
              </Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <aside className="w-64 min-h-screen border-r bg-muted/30 shrink-0">
            <nav className="p-4 space-y-6">
              {/* Main Guidelines */}
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  Guidelines
                </h3>
                <div className="space-y-1">
                  {guidelineSections.map((section) => {
                    const Icon = section.icon
                    const isActive = pathname === section.href
                    
                    return (
                      <Link
                        key={section.id}
                        href={section.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{section.title}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Module Guides */}
              <div>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  Module Guides
                </h3>
                <div className="space-y-1">
                  {moduleSections.map((module) => {
                    const Icon = module.icon
                    const isActive = pathname === module.href
                    
                    return (
                      <Link
                        key={module.id}
                        href={module.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{module.title}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container max-w-none py-12 px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <Book className="h-6 w-6 text-primary" />
                <div>
                  <div className="font-bold text-lg">Malaka ERP</div>
                  <div className="text-xs text-muted-foreground">Guidelines</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Comprehensive documentation and guides for mastering the Malaka ERP system.
              </p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>Version 2.0.0</span>
                <span>•</span>
                <span>Updated Aug 2025</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Getting Started</h3>
              <div className="space-y-3">
                <Link href="/guidelines/overview" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  System Overview
                </Link>
                <Link href="/guidelines/getting-started" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Quick Start Guide
                </Link>
                <Link href="/guidelines/user-roles" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  User Roles
                </Link>
                <Link href="/guidelines/administration" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Administration
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Module Guides</h3>
              <div className="space-y-3">
                <Link href="/guidelines/modules/master-data" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Master Data
                </Link>
                <Link href="/guidelines/modules/products" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Products
                </Link>
                <Link href="/guidelines/modules/sales" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sales
                </Link>
                <Link href="/guidelines/modules" className="block text-sm text-primary hover:underline transition-colors">
                  View All Modules →
                </Link>
              </div>
            </div>
              
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium mb-1">Email Support</div>
                  <div className="text-muted-foreground">support@malaka-erp.com</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium mb-1">Phone Support</div>
                  <div className="text-muted-foreground">+62-21-1234-5678</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium mb-1">Business Hours</div>
                  <div className="text-muted-foreground">Mon-Fri, 9AM-6PM WIB</div>
                </div>
                <Link href="/guidelines/troubleshooting" className="block text-sm text-primary hover:underline transition-colors">
                  Troubleshooting Guide →
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2025 Malaka ERP. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Back to System
              </Link>
              <span>•</span>
              <Link href="/guidelines/overview" className="hover:text-foreground transition-colors">
                Guidelines Home
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}