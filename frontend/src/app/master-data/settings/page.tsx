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

export default function MasterDataSettingsPage() {
  const [settings, setSettings] = React.useState<SettingItem[]>([
    // Data Management
    {
      id: "auto_generate_codes",
      label: "Auto-generate Entity Codes",
      description: "Automatically generate unique codes for new entities",
      type: "toggle",
      value: true,
      category: "Data Management"
    },
    {
      id: "code_prefix",
      label: "Code Prefix Format",
      description: "Prefix format for generated codes (e.g., CMP-, USR-, CUS-)",
      type: "input",
      value: "AUTO-",
      category: "Data Management"
    },
    {
      id: "duplicate_check",
      label: "Duplicate Detection",
      description: "Enable duplicate detection for names and codes",
      type: "toggle",
      value: true,
      category: "Data Management"
    },
    {
      id: "bulk_operations",
      label: "Allow Bulk Operations",
      description: "Enable bulk import/export and batch operations",
      type: "toggle",
      value: true,
      category: "Data Management"
    },

    // User Interface
    {
      id: "records_per_page",
      label: "Records Per Page",
      description: "Number of records to display per page",
      type: "select",
      value: 25,
      options: [
        { label: "10 records", value: 10 },
        { label: "25 records", value: 25 },
        { label: "50 records", value: 50 },
        { label: "100 records", value: 100 }
      ],
      category: "User Interface"
    },
    {
      id: "default_view",
      label: "Default View Mode",
      description: "Default view mode for listing pages",
      type: "select",
      value: "table",
      options: [
        { label: "Table View", value: "table" },
        { label: "Card View", value: "cards" }
      ],
      category: "User Interface"
    },
    {
      id: "show_counts",
      label: "Show Record Counts",
      description: "Display record counts in navigation menu",
      type: "toggle",
      value: true,
      category: "User Interface"
    },
    {
      id: "enable_search",
      label: "Enable Quick Search",
      description: "Show quick search bar in all listing pages",
      type: "toggle",
      value: true,
      category: "User Interface"
    },

    // Data Validation
    {
      id: "required_fields_validation",
      label: "Strict Field Validation",
      description: "Enable strict validation for required fields",
      type: "toggle",
      value: true,
      category: "Data Validation"
    },
    {
      id: "email_validation",
      label: "Email Format Validation",
      description: "Validate email addresses format",
      type: "toggle",
      value: true,
      category: "Data Validation"
    },
    {
      id: "phone_validation",
      label: "Phone Number Validation",
      description: "Validate phone number formats",
      type: "toggle",
      value: true,
      category: "Data Validation"
    },
    {
      id: "min_code_length",
      label: "Minimum Code Length",
      description: "Minimum length for entity codes",
      type: "number",
      value: 3,
      category: "Data Validation"
    },

    // Security & Access
    {
      id: "audit_trail",
      label: "Enable Audit Trail",
      description: "Track all changes to master data records",
      type: "toggle",
      value: true,
      category: "Security & Access"
    },
    {
      id: "role_based_access",
      label: "Role-based Access Control",
      description: "Enable role-based permissions for master data",
      type: "toggle",
      value: true,
      category: "Security & Access"
    },
    {
      id: "data_encryption",
      label: "Sensitive Data Encryption",
      description: "Encrypt sensitive master data fields",
      type: "toggle",
      value: true,
      category: "Security & Access"
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
      console.log('Saving master data settings:', settings)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    // Reset to default values
    setSettings(prev => prev.map(setting => ({
      ...setting,
      value: getDefaultValue(setting.id)
    })))
    setHasUnsavedChanges(false)
  }

  const getDefaultValue = (settingId: string) => {
    // Define default values for each setting
    const defaults: Record<string, any> = {
      auto_generate_codes: true,
      code_prefix: "AUTO-",
      duplicate_check: true,
      bulk_operations: true,
      records_per_page: 25,
      default_view: "table",
      show_counts: true,
      enable_search: true,
      required_fields_validation: true,
      email_validation: true,
      phone_validation: true,
      min_code_length: 3,
      audit_trail: true,
      role_based_access: true,
      data_encryption: true
    }
    return defaults[settingId]
  }

  const breadcrumbs = [
    { label: "Master Data", href: "/master-data" },
    { label: "Settings" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Master Data Settings"
          breadcrumbs={breadcrumbs}
        />

        <div className="flex-1 overflow-auto p-6">
          <ModuleSettings
            moduleName="Master Data"
            moduleId="master-data"
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