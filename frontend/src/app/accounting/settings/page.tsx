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

export default function AccountingSettingsPage() {
  const [settings, setSettings] = React.useState<SettingItem[]>([
    // General Accounting
    {
      id: "fiscal_year_start",
      label: "Fiscal Year Start Month",
      description: "Month when fiscal year begins",
      type: "select",
      value: "1",
      options: Array.from({length: 12}, (_, i) => ({
        label: new Date(0, i).toLocaleString('default', { month: 'long' }),
        value: String(i + 1)
      })),
      category: "General Accounting"
    },
    {
      id: "base_currency",
      label: "Base Currency",
      description: "Primary currency for accounting operations",
      type: "select",
      value: "IDR",
      options: [
        { label: "Indonesian Rupiah (IDR)", value: "IDR" },
        { label: "US Dollar (USD)", value: "USD" },
        { label: "Euro (EUR)", value: "EUR" },
        { label: "Singapore Dollar (SGD)", value: "SGD" }
      ],
      category: "General Accounting"
    },
    {
      id: "multi_currency_support",
      label: "Multi-Currency Support",
      description: "Enable multi-currency transactions",
      type: "toggle",
      value: true,
      category: "General Accounting"
    },
    {
      id: "auto_exchange_rates",
      label: "Auto Exchange Rate Updates",
      description: "Automatically update exchange rates daily",
      type: "toggle",
      value: true,
      category: "General Accounting"
    },

    // Journal Entries
    {
      id: "auto_journal_entries",
      label: "Automatic Journal Entries",
      description: "Generate journal entries automatically for transactions",
      type: "toggle",
      value: true,
      category: "Journal Entries"
    },
    {
      id: "require_journal_approval",
      label: "Journal Entry Approval",
      description: "Require approval for journal entries above threshold",
      type: "toggle",
      value: true,
      category: "Journal Entries"
    },
    {
      id: "journal_approval_limit",
      label: "Journal Approval Limit",
      description: "Amount requiring approval for journal entries",
      type: "number",
      value: 10000000,
      category: "Journal Entries"
    },
    {
      id: "journal_numbering",
      label: "Journal Entry Numbering",
      description: "Format for journal entry numbers",
      type: "select",
      value: "auto",
      options: [
        { label: "Automatic Sequential", value: "auto" },
        { label: "Date-based (YYYYMM-XXX)", value: "date_based" },
        { label: "Manual Entry", value: "manual" }
      ],
      category: "Journal Entries"
    },

    // Cost Centers
    {
      id: "cost_center_mandatory",
      label: "Cost Center Mandatory",
      description: "Require cost center for all transactions",
      type: "toggle",
      value: false,
      category: "Cost Centers"
    },
    {
      id: "auto_cost_allocation",
      label: "Automatic Cost Allocation",
      description: "Automatically allocate costs to departments",
      type: "toggle",
      value: false,
      category: "Cost Centers"
    },

    // Fixed Assets
    {
      id: "auto_depreciation",
      label: "Automatic Depreciation",
      description: "Calculate depreciation automatically",
      type: "toggle",
      value: true,
      category: "Fixed Assets"
    },
    {
      id: "depreciation_method",
      label: "Default Depreciation Method",
      description: "Default method for calculating depreciation",
      type: "select",
      value: "straight_line",
      options: [
        { label: "Straight Line", value: "straight_line" },
        { label: "Declining Balance", value: "declining_balance" },
        { label: "Sum of Years Digits", value: "sum_years_digits" }
      ],
      category: "Fixed Assets"
    },
    {
      id: "asset_capitalization_threshold",
      label: "Asset Capitalization Threshold",
      description: "Minimum amount to capitalize as asset",
      type: "number",
      value: 5000000,
      category: "Fixed Assets"
    },

    // Cash Management
    {
      id: "bank_reconciliation_auto",
      label: "Automatic Bank Reconciliation",
      description: "Enable automatic bank statement reconciliation",
      type: "toggle",
      value: false,
      category: "Cash Management"
    },
    {
      id: "cash_flow_forecasting",
      label: "Cash Flow Forecasting",
      description: "Enable cash flow forecasting features",
      type: "toggle",
      value: true,
      category: "Cash Management"
    },

    // Reporting & Compliance
    {
      id: "monthly_closing_required",
      label: "Monthly Period Closing",
      description: "Require formal month-end closing process",
      type: "toggle",
      value: true,
      category: "Reporting & Compliance"
    },
    {
      id: "audit_trail",
      label: "Comprehensive Audit Trail",
      description: "Maintain detailed audit trail for all transactions",
      type: "toggle",
      value: true,
      category: "Reporting & Compliance"
    },
    {
      id: "tax_reporting",
      label: "Automatic Tax Reporting",
      description: "Generate tax reports automatically",
      type: "toggle",
      value: true,
      category: "Reporting & Compliance"
    },
    {
      id: "financial_statement_auto",
      label: "Auto Financial Statements",
      description: "Generate financial statements automatically",
      type: "toggle",
      value: true,
      category: "Reporting & Compliance"
    },

    // Integration
    {
      id: "bank_integration",
      label: "Bank System Integration",
      description: "Enable integration with bank systems",
      type: "toggle",
      value: false,
      category: "Integration"
    },
    {
      id: "tax_authority_integration",
      label: "Tax Authority Integration",
      description: "Enable integration with tax authority systems",
      type: "toggle",
      value: false,
      category: "Integration"
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
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Saving accounting settings:', settings)
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
      fiscal_year_start: "1",
      base_currency: "IDR",
      multi_currency_support: true,
      auto_exchange_rates: true,
      auto_journal_entries: true,
      require_journal_approval: true,
      journal_approval_limit: 10000000,
      journal_numbering: "auto",
      cost_center_mandatory: false,
      auto_cost_allocation: false,
      auto_depreciation: true,
      depreciation_method: "straight_line",
      asset_capitalization_threshold: 5000000,
      bank_reconciliation_auto: false,
      cash_flow_forecasting: true,
      monthly_closing_required: true,
      audit_trail: true,
      tax_reporting: true,
      financial_statement_auto: true,
      bank_integration: false,
      tax_authority_integration: false
    }
    return defaults[settingId]
  }

  const breadcrumbs = [
    { label: "Accounting", href: "/accounting" },
    { label: "Settings" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Accounting Settings"
          breadcrumbs={breadcrumbs}
        />

        <div className="flex-1 overflow-auto p-6">
          <ModuleSettings
            moduleName="Accounting"
            moduleId="accounting"
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