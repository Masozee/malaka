"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { ModuleSettings } from "@/components/ui/module-settings"

interface SettingItem {
  id: string
  label: string
  description?: string
  type: 'toggle' | 'input' | 'select' | 'number'
  value: any
  options?: { label: string; value: any }[]
  category: string
}

export default function SalesSettingsPage() {
  const [settings, setSettings] = React.useState<SettingItem[]>([
    // Order Management
    {
      id: "auto_order_numbering",
      label: "Auto Order Numbering",
      description: "Automatically generate order numbers",
      type: "toggle",
      value: true,
      category: "Order Management"
    },
    {
      id: "order_prefix",
      label: "Order Number Prefix",
      description: "Prefix for order numbers (e.g., SO-, ORD-)",
      type: "input",
      value: "SO-",
      category: "Order Management"
    },
    {
      id: "order_approval_required",
      label: "Order Approval Required",
      description: "Require approval for orders above certain amount",
      type: "toggle",
      value: false,
      category: "Order Management"
    },
    {
      id: "approval_threshold",
      label: "Approval Threshold Amount",
      description: "Minimum amount requiring approval",
      type: "number",
      value: 1000000,
      category: "Order Management"
    },

    // Pricing & Discounts
    {
      id: "dynamic_pricing",
      label: "Dynamic Pricing",
      description: "Enable dynamic pricing based on customer tier",
      type: "toggle",
      value: true,
      category: "Pricing & Discounts"
    },
    {
      id: "max_discount_percent",
      label: "Maximum Discount (%)",
      description: "Maximum discount percentage allowed",
      type: "number",
      value: 50,
      category: "Pricing & Discounts"
    },
    {
      id: "bulk_discount",
      label: "Automatic Bulk Discounts",
      description: "Apply discounts automatically for bulk orders",
      type: "toggle",
      value: true,
      category: "Pricing & Discounts"
    },
    {
      id: "loyalty_discounts",
      label: "Loyalty Program Discounts",
      description: "Enable loyalty program discounts",
      type: "toggle",
      value: true,
      category: "Pricing & Discounts"
    },

    // Payment & Billing
    {
      id: "payment_terms",
      label: "Default Payment Terms",
      description: "Default payment terms for new customers",
      type: "select",
      value: "30",
      options: [
        { label: "Cash on Delivery", value: "cod" },
        { label: "Net 15 Days", value: "15" },
        { label: "Net 30 Days", value: "30" },
        { label: "Net 60 Days", value: "60" }
      ],
      category: "Payment & Billing"
    },
    {
      id: "auto_invoice_generation",
      label: "Auto Invoice Generation",
      description: "Automatically generate invoices on order confirmation",
      type: "toggle",
      value: true,
      category: "Payment & Billing"
    },
    {
      id: "multiple_payment_methods",
      label: "Multiple Payment Methods",
      description: "Allow multiple payment methods per transaction",
      type: "toggle",
      value: true,
      category: "Payment & Billing"
    },
    {
      id: "credit_limit_check",
      label: "Credit Limit Checking",
      description: "Check customer credit limits before order processing",
      type: "toggle",
      value: true,
      category: "Payment & Billing"
    },

    // Inventory Integration
    {
      id: "real_time_inventory",
      label: "Real-time Inventory Check",
      description: "Check inventory availability in real-time",
      type: "toggle",
      value: true,
      category: "Inventory Integration"
    },
    {
      id: "auto_reserve_stock",
      label: "Auto Stock Reservation",
      description: "Automatically reserve stock on order creation",
      type: "toggle",
      value: true,
      category: "Inventory Integration"
    },
    {
      id: "backorder_handling",
      label: "Backorder Handling",
      description: "Allow backorders for out-of-stock items",
      type: "toggle",
      value: false,
      category: "Inventory Integration"
    },

    // Reporting & Analytics
    {
      id: "daily_sales_report",
      label: "Daily Sales Reports",
      description: "Generate daily sales summary reports",
      type: "toggle",
      value: true,
      category: "Reporting & Analytics"
    },
    {
      id: "sales_targets_tracking",
      label: "Sales Targets Tracking",
      description: "Track individual and team sales targets",
      type: "toggle",
      value: true,
      category: "Reporting & Analytics"
    },
    {
      id: "commission_calculation",
      label: "Auto Commission Calculation",
      description: "Automatically calculate sales commissions",
      type: "toggle",
      value: false,
      category: "Reporting & Analytics"
    },

    // Customer Management
    {
      id: "customer_credit_scoring",
      label: "Customer Credit Scoring",
      description: "Enable automatic customer credit scoring",
      type: "toggle",
      value: false,
      category: "Customer Management"
    },
    {
      id: "customer_tier_auto_upgrade",
      label: "Auto Customer Tier Upgrade",
      description: "Automatically upgrade customer tiers based on purchase history",
      type: "toggle",
      value: true,
      category: "Customer Management"
    }
  ])

  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSettingChange = (settingId: string, value: any) => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId ? { ...setting, value } : setting
    ))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Saving sales settings:', settings)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSettings(prev => prev.map(setting => ({
      ...setting,
      value: getDefaultValue(setting.id)
    })))
    setHasUnsavedChanges(false)
  }

  const getDefaultValue = (settingId: string) => {
    const defaults: Record<string, any> = {
      auto_order_numbering: true,
      order_prefix: "SO-",
      order_approval_required: false,
      approval_threshold: 1000000,
      dynamic_pricing: true,
      max_discount_percent: 50,
      bulk_discount: true,
      loyalty_discounts: true,
      payment_terms: "30",
      auto_invoice_generation: true,
      multiple_payment_methods: true,
      credit_limit_check: true,
      real_time_inventory: true,
      auto_reserve_stock: true,
      backorder_handling: false,
      daily_sales_report: true,
      sales_targets_tracking: true,
      commission_calculation: false,
      customer_credit_scoring: false,
      customer_tier_auto_upgrade: true
    }
    return defaults[settingId]
  }

  const breadcrumbs = [
    { label: "Sales", href: "/sales" },
    { label: "Settings" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Sales Settings"
          breadcrumbs={breadcrumbs}
        />

        <div className="flex-1 overflow-auto p-6">
          <ModuleSettings
            moduleName="Sales"
            moduleId="sales"
            settings={settings}
            onSettingChange={handleSettingChange}
            onSave={handleSave}
            onReset={handleReset}
            isLoading={isLoading}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>
      </div>
    </TwoLevelLayout>
  )
}