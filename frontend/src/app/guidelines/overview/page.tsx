"use client"

import * as React from "react"
import Link from "next/link"
import { GuidelinesLayout } from "@/components/ui/guidelines-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight,
  ArrowLeft,
  Building,
  Users,
  Package,
  DollarSign,
  BarChart,
  Settings,
  Shield,
  Globe
} from "lucide-react"

export default function GuidelinesOverviewPage() {
  return (
    <GuidelinesLayout>
      <div className="container py-8 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link href="/guidelines" className="text-muted-foreground hover:text-foreground">
            Guidelines
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">System Overview</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="default" className="bg-green-500">Beginner</Badge>
            <Badge variant="outline">15 min read</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-4">System Overview</h1>
          <p className="text-xl text-muted-foreground">
            Welcome to Malaka ERP! This guide provides a comprehensive overview of the system architecture, 
            key features, and fundamental concepts you need to understand before diving deeper.
          </p>
        </div>

        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Table of Contents</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="space-y-2">
              <a href="#what-is-malaka-erp" className="block text-primary hover:underline">
                1. What is Malaka ERP?
              </a>
              <a href="#key-modules" className="block text-primary hover:underline">
                2. Key Modules
              </a>
              <a href="#system-architecture" className="block text-primary hover:underline">
                3. System Architecture
              </a>
              <a href="#user-interface" className="block text-primary hover:underline">
                4. User Interface Overview
              </a>
              <a href="#security-access" className="block text-primary hover:underline">
                5. Security & Access Control
              </a>
              <a href="#next-steps" className="block text-primary hover:underline">
                6. Next Steps
              </a>
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section id="what-is-malaka-erp" className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is Malaka ERP?</h2>
            <p className="text-muted-foreground mb-6">
              Malaka ERP is a comprehensive Enterprise Resource Planning system specifically designed for 
              shoe manufacturing and retail businesses. It integrates all aspects of your business operations 
              into a unified platform, providing real-time visibility and control over your entire organization.
            </p>
            
            <Card className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">Key Benefits</h3>
                <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                  <li>• Streamlined business processes across all departments</li>
                  <li>• Real-time data visibility and reporting</li>
                  <li>• Improved inventory management and stock control</li>
                  <li>• Enhanced financial tracking and accounting</li>
                  <li>• Better customer relationship management</li>
                  <li>• Increased operational efficiency and productivity</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <section id="key-modules" className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Key Modules</h2>
            <p className="text-muted-foreground mb-6">
              Malaka ERP consists of integrated modules that work together to manage different aspects 
              of your business operations:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="hover: transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-blue-500" />
                    <span>Inventory Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Track stock levels, manage warehouses, handle goods receipt and issue, 
                    perform stock transfers and cycle counting.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover: transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <span>Sales Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Handle POS transactions, direct sales, online orders, returns, 
                    and sales reporting with comprehensive analytics.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover: transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart className="h-5 w-5 text-purple-500" />
                    <span>Financial Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Manage accounting, financial reporting, cost centers, 
                    fixed assets, and multi-currency operations.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover: transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-orange-500" />
                    <span>Human Resources</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Employee management, attendance tracking, payroll processing, 
                    performance management, and training coordination.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover: transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-red-500" />
                    <span>Production Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Work order management, quality control, material planning, 
                    and production analytics for manufacturing operations.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover: transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-indigo-500" />
                    <span>Master Data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Centralized management of customers, suppliers, products, 
                    users, and other foundational business data.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="system-architecture" className="mb-12">
            <h2 className="text-2xl font-bold mb-4">System Architecture</h2>
            <p className="text-muted-foreground mb-6">
              Malaka ERP is built on a modern, scalable architecture that ensures reliability, 
              performance, and security:
            </p>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Technical Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Frontend</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• React.js with Next.js framework</li>
                      <li>• TypeScript for type safety</li>
                      <li>• Tailwind CSS for styling</li>
                      <li>• Responsive design for all devices</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Backend</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Go-based REST API server</li>
                      <li>• PostgreSQL database</li>
                      <li>• Redis for caching and sessions</li>
                      <li>• Microservices architecture</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="user-interface" className="mb-12">
            <h2 className="text-2xl font-bold mb-4">User Interface Overview</h2>
            <p className="text-muted-foreground mb-6">
              The Malaka ERP interface is designed for efficiency and ease of use:
            </p>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Navigation Structure</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Two-Level Sidebar:</strong> Main modules on the left, sub-items in the expandable second sidebar</li>
                  <li>• <strong>Breadcrumb Navigation:</strong> Always know where you are in the system</li>
                  <li>• <strong>Quick Search:</strong> Find records across all modules instantly</li>
                  <li>• <strong>Dashboard Views:</strong> Customizable widgets and KPI displays</li>
                  <li>• <strong>Theme Support:</strong> Light and dark mode options</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <section id="security-access" className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Security & Access Control</h2>
            <p className="text-muted-foreground mb-6">
              Security is built into every aspect of Malaka ERP:
            </p>

            <Card className="mb-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100">Security Features</h3>
                </div>
                <ul className="space-y-2 text-amber-800 dark:text-amber-200">
                  <li>• Role-based access control (RBAC)</li>
                  <li>• JWT authentication with refresh tokens</li>
                  <li>• Comprehensive audit trails</li>
                  <li>• Data encryption at rest and in transit</li>
                  <li>• Session management and automatic logout</li>
                  <li>• Password policies and two-factor authentication</li>
                </ul>
              </CardContent>
            </Card>
          </section>

          <section id="next-steps" className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
            <p className="text-muted-foreground mb-6">
              Now that you understand the system overview, here's what to explore next:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover: transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Getting Started Guide</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Learn how to set up your account and configure basic settings.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/guidelines/getting-started">
                      Start Setup Guide
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover: transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Module Guides</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Deep dive into specific modules relevant to your role.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/guidelines/modules">
                      Explore Modules
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href="/guidelines">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Guidelines
            </Link>
          </Button>
          <Button asChild>
            <Link href="/guidelines/getting-started">
              Getting Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </GuidelinesLayout>
  )
}