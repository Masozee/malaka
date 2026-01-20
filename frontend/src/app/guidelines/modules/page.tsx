"use client"

import * as React from "react"
import Link from "next/link"
import { GuidelinesLayout } from "@/components/ui/guidelines-layout"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ModuleGuidesOverviewPage() {
  return (
    <GuidelinesLayout>
      <div className="container py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="secondary">Intermediate</Badge>
            <Badge variant="outline">2 hours total</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-4">Module Guides Overview</h1>
          <p className="text-xl text-muted-foreground">
            Each ERP module is designed to handle specific aspects of your business operations. 
            Use the sidebar to navigate to detailed guides for each module.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>How to Use Module Guides</h2>
          <p>
            The Module Guides section provides comprehensive documentation for each ERP module. 
            Each guide includes:
          </p>

          <ul>
            <li><strong>Module Overview</strong> - Purpose and key concepts</li>
            <li><strong>Getting Started</strong> - Basic setup and configuration</li>
            <li><strong>Key Features</strong> - Detailed feature explanations</li>
            <li><strong>Common Workflows</strong> - Step-by-step procedures</li>
            <li><strong>Best Practices</strong> - Recommendations and tips</li>
            <li><strong>Troubleshooting</strong> - Common issues and solutions</li>
          </ul>

          <h2>Module Categories</h2>
          
          <h3>Foundation Modules</h3>
          <p>Start with these modules to establish your basic data structure:</p>
          <ul>
            <li><strong>Master Data</strong> - Core business entities (customers, suppliers, etc.)</li>
            <li><strong>Products</strong> - Product catalog and classification</li>
          </ul>

          <h3>Operational Modules</h3>
          <p>Daily business operations and transactions:</p>
          <ul>
            <li><strong>Sales</strong> - Sales transactions and order management</li>
            <li><strong>Inventory</strong> - Stock control and warehouse management</li>
            <li><strong>Procurement</strong> - Purchasing and supplier management</li>
            <li><strong>Shipping</strong> - Logistics and delivery coordination</li>
          </ul>

          <h3>Management Modules</h3>
          <p>Advanced business management and planning:</p>
          <ul>
            <li><strong>Production</strong> - Manufacturing and work order management</li>
            <li><strong>Accounting</strong> - Financial management and reporting</li>
            <li><strong>HR Management</strong> - Employee and human resource operations</li>
          </ul>

          <h3>Analytics Module</h3>
          <p>Business intelligence and reporting:</p>
          <ul>
            <li><strong>Reports & Analytics</strong> - Business intelligence and custom reporting</li>
          </ul>

          <h2>Learning Path Recommendation</h2>
          
          <h3>Phase 1: Foundation (Week 1)</h3>
          <p>
            Begin with Master Data and Products modules. These provide the foundation 
            for all other modules and should be set up first.
          </p>

          <h3>Phase 2: Core Operations (Week 2-3)</h3>
          <p>
            Learn Sales, Inventory, and Procurement modules. These handle your 
            day-to-day business operations and build upon the foundation data.
          </p>

          <h3>Phase 3: Advanced Features (Week 4-5)</h3>
          <p>
            Explore Production, Accounting, and HR Management modules based on 
            your business needs. These provide advanced functionality.
          </p>

          <h3>Phase 4: Analytics and Optimization (Week 6)</h3>
          <p>
            Master the Reports & Analytics module to gain insights into your 
            business operations and make data-driven decisions.
          </p>

          <h2>Getting Help</h2>
          <p>
            If you need assistance with any module:
          </p>
          <ul>
            <li>Check the Troubleshooting section for common issues</li>
            <li>Review the module's specific troubleshooting guide</li>
            <li>Contact support with specific questions</li>
            <li>Schedule training sessions for complex modules</li>
          </ul>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 my-8">
            <h4 className="text-blue-900 dark:text-blue-100 font-semibold mb-2">💡 Pro Tip</h4>
            <p className="text-blue-800 dark:text-blue-200">
              Use the sidebar navigation to jump directly to any module guide. 
              Each module guide is self-contained and can be read independently, 
              though following the recommended learning path will provide the best experience.
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href="/guidelines/getting-started">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Getting Started
            </Link>
          </Button>
          <Button asChild>
            <Link href="/guidelines/user-roles">
              User Roles & Permissions
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </GuidelinesLayout>
  )
}