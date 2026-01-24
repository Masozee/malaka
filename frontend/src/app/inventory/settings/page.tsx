"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { ModuleGear } from "@/components/ui/module-settings"

interface SettingItem {
  id: string
  label: string
  description?: string
  type: 'toggle' | 'input' | 'select' | 'number'
  value: any
  options?: { label: string; value: any }[]
  category: string
}

export default function InventoryGearPage() {
  const [settings, setGear] = React.useState<SettingItem[]>([
    // Stock Management
    {
      id: "auto_reorder_point",
      label: "Auto Reorder Point Calculation",
      description: "Automatically calculate reorder points based on sales history",
      type: "toggle",
      value: true,
      category: "Stock Management"
    },
    {
      id: "low_stock_threshold",
      label: "Low Stock Threshold (%)",
      description: "Percentage of max stock to trigger low stock alert",
      type: "number",
      value: 20,
      category: "Stock Management"
    },
    {
      id: "negative_stock_allowed",
      label: "Allow Negative Stock",
      description: "Allow stock levels to go below zero",
      type: "toggle",
      value: false,
      category: "Stock Management"
    },
    {
      id: "stock_valuation_method",
      label: "Stock Valuation Method",
      description: "Method for calculating stock value",
      type: "select",
      value: "fifo",
      options: [
        { label: "FIFO (First In, First Out)", value: "fifo" },
        { label: "LIFO (Last In, First Out)", value: "lifo" },
        { label: "Weighted Average", value: "weighted_average" },
        { label: "Standard Cost", value: "standard_cost" }
      ],
      category: "Stock Management"
    },

    // Warehouse Operations
    {
      id: "multi_warehouse_support",
      label: "Multi-Warehouse Support",
      description: "Enable operations across multiple warehouses",
      type: "toggle",
      value: true,
      category: "Warehouse Operations"
    },
    {
      id: "warehouse_transfer_approval",
      label: "Warehouse Transfer Approval",
      description: "Require approval for inter-warehouse transfers",
      type: "toggle",
      value: false,
      category: "Warehouse Operations"
    },
    {
      id: "location_tracking",
      label: "Location Tracking",
      description: "Track exact storage locations within warehouses",
      type: "toggle",
      value: true,
      category: "Warehouse Operations"
    },
    {
      id: "bin_location_mandatory",
      label: "Bin Location Mandatory",
      description: "Require bin location for all stock movements",
      type: "toggle",
      value: false,
      category: "Warehouse Operations"
    },

    // Barcode & Scanning
    {
      id: "barcode_scanning",
      label: "Barcode Scanning",
      description: "Enable barcode scanning for inventory operations",
      type: "toggle",
      value: true,
      category: "Barcode & Scanning"
    },
    {
      id: "auto_generate_barcodes",
      label: "Auto Generate Barcodes",
      description: "Automatically generate barcodes for new items",
      type: "toggle",
      value: true,
      category: "Barcode & Scanning"
    },
    {
      id: "barcode_format",
      label: "Barcode Format",
      description: "Standard barcode format to use",
      type: "select",
      value: "ean13",
      options: [
        { label: "EAN-13", value: "ean13" },
        { label: "UPC-A", value: "upca" },
        { label: "Code 128", value: "code128" },
        { label: "Code 39", value: "code39" }
      ],
      category: "Barcode & Scanning"
    },

    // Batch & Serial Tracking
    {
      id: "batch_tracking",
      label: "Batch Tracking",
      description: "Enable batch/lot tracking for inventory items",
      type: "toggle",
      value: true,
      category: "Batch & Serial Tracking"
    },
    {
      id: "serial_number_tracking",
      label: "Serial Number Tracking",
      description: "Enable serial number tracking for high-value items",
      type: "toggle",
      value: false,
      category: "Batch & Serial Tracking"
    },
    {
      id: "expiry_date_tracking",
      label: "Expiry Date Tracking",
      description: "Track expiry dates for perishable items",
      type: "toggle",
      value: true,
      category: "Batch & Serial Tracking"
    },
    {
      id: "expiry_alert_days",
      label: "Expiry Alert (Days)",
      description: "Number of days before expiry to show alert",
      type: "number",
      value: 30,
      category: "Batch & Serial Tracking"
    },

    // Cost Management
    {
      id: "landed_cost_calculation",
      label: "Landed Cost Calculation",
      description: "Include shipping and handling in item costs",
      type: "toggle",
      value: true,
      category: "Cost Management"
    },
    {
      id: "standard_costing",
      label: "Standard Costing",
      description: "Use standard costs for inventory valuation",
      type: "toggle",
      value: false,
      category: "Cost Management"
    },
    {
      id: "cost_variance_tracking",
      label: "Cost Variance Tracking",
      description: "Track variances between standard and actual costs",
      type: "toggle",
      value: false,
      category: "Cost Management"
    },

    // Cycle Counting
    {
      id: "cycle_counting",
      label: "Cycle Counting",
      description: "Enable regular cycle counting procedures",
      type: "toggle",
      value: true,
      category: "Cycle Counting"
    },
    {
      id: "cycle_count_frequency",
      label: "Cycle Count Frequency",
      description: "Default frequency for cycle counting",
      type: "select",
      value: "monthly",
      options: [
        { label: "Weekly", value: "weekly" },
        { label: "Monthly", value: "monthly" },
        { label: "Quarterly", value: "quarterly" },
        { label: "Annually", value: "annually" }
      ],
      category: "Cycle Counting"
    },
    {
      id: "variance_tolerance",
      label: "Variance Tolerance (%)",
      description: "Acceptable variance percentage for cycle counts",
      type: "number",
      value: 5,
      category: "Cycle Counting"
    },

    // Integration & Automation
    {
      id: "auto_stock_adjustment",
      label: "Auto Stock Adjustments",
      description: "Automatically adjust stock based on system calculations",
      type: "toggle",
      value: false,
      category: "Integration & Automation"
    },
    {
      id: "real_time_updates",
      label: "Real-time Stock Updates",
      description: "Update stock levels in real-time across all modules",
      type: "toggle",
      value: true,
      category: "Integration & Automation"
    },
    {
      id: "supplier_integration",
      label: "Supplier System Integration",
      description: "Enable integration with supplier inventory systems",
      type: "toggle",
      value: false,
      category: "Integration & Automation"
    }
  ])

  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSettingChange = (settingId: string, value: any) => {
    setGear(prev => prev.map(setting => 
      setting.id === settingId ? { ...setting, value } : setting
    ))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Saving inventory settings:', settings)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setGear(prev => prev.map(setting => ({
      ...setting,
      value: getDefaultValue(setting.id)
    })))
    setHasUnsavedChanges(false)
  }

  const getDefaultValue = (settingId: string) => {
    const defaults: Record<string, any> = {
      auto_reorder_point: true,
      low_stock_threshold: 20,
      negative_stock_allowed: false,
      stock_valuation_method: "fifo",
      multi_warehouse_support: true,
      warehouse_transfer_approval: false,
      location_tracking: true,
      bin_location_mandatory: false,
      barcode_scanning: true,
      auto_generate_barcodes: true,
      barcode_format: "ean13",
      batch_tracking: true,
      serial_number_tracking: false,
      expiry_date_tracking: true,
      expiry_alert_days: 30,
      landed_cost_calculation: true,
      standard_costing: false,
      cost_variance_tracking: false,
      cycle_counting: true,
      cycle_count_frequency: "monthly",
      variance_tolerance: 5,
      auto_stock_adjustment: false,
      real_time_updates: true,
      supplier_integration: false
    }
    return defaults[settingId]
  }

  const breadcrumbs = [
    { label: "Inventory", href: "/inventory" },
    { label: "Gear" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Inventory Gear"
          breadcrumbs={breadcrumbs}
        />

        <div className="flex-1 overflow-auto p-6">
          <ModuleGear
            moduleName="Inventory"
            moduleId="inventory"
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