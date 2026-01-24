"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { ModuleGear } from "@/components/ui/module-settings"
import { apiClient } from "@/lib/api"

interface SettingItem {
  id: string
  label: string
  description?: string
  type: 'toggle' | 'input' | 'select' | 'number'
  value: unknown
  options?: { label: string; value: string }[]
  category: string
}

const DEFAULT_SETTINGS: SettingItem[] = [
  {
    id: "auto_po_approval",
    label: "Auto PO Approval",
    description: "Automatically approve purchase orders below threshold",
    type: "toggle" as const,
    value: false,
    category: "Purchase Orders"
  },
  {
    id: "po_approval_threshold",
    label: "PO Approval Threshold",
    description: "Amount requiring manual approval (IDR)",
    type: "number" as const,
    value: 5000000,
    category: "Purchase Orders"
  },
  {
    id: "pr_approval_level",
    label: "PR Approval Level",
    description: "Minimum role level to approve purchase requests (1: Staff, 2: Supervisor, 3: Manager, 4: Director)",
    type: "select" as const,
    value: "2",
    options: [
      { label: "Staff", value: "1" },
      { label: "Supervisor", value: "2" },
      { label: "Manager", value: "3" },
      { label: "Director", value: "4" }
    ],
    category: "Purchase Requests"
  },
  {
    id: "require_multiple_approvers",
    label: "Require Multiple Approvers",
    description: "Require at least 2 approvers for each purchase request",
    type: "toggle" as const,
    value: false,
    category: "Purchase Requests"
  },
  {
    id: "vendor_evaluation_required",
    label: "Vendor Evaluation Required",
    description: "Require vendor evaluation before approving suppliers",
    type: "toggle" as const,
    value: true,
    category: "Vendor Management"
  },
  {
    id: "contract_expiry_warning_days",
    label: "Contract Expiry Warning (Days)",
    description: "Days before contract expiry to show warning",
    type: "number" as const,
    value: 30,
    category: "Contracts"
  }
]

export default function ProcurementSettingsPage() {
  const [settings, setSettings] = React.useState<SettingItem[]>(DEFAULT_SETTINGS)
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = React.useState(false)

  const handleSettingChange = (settingId: string, value: unknown) => {
    setSettings(prev => prev.map(setting =>
      setting.id === settingId ? { ...setting, value } : setting
    ))
    setHasUnsavedChanges(true)
    setSaveError(null)
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    setIsLoading(true)
    setSaveError(null)
    setSaveSuccess(false)

    let successCount = 0
    let failCount = 0

    try {
      // Try to save each setting to backend API
      for (const setting of settings) {
        try {
          await apiClient.put(`/api/v1/settings/procurement/${setting.id}`, {
            value: String(setting.value),
            change_reason: 'Updated from procurement settings page'
          })
          successCount++
        } catch (err: unknown) {
          failCount++
          const error = err as { status?: number; message?: string }
          if (error?.status === 401 || error?.message?.includes('UNAUTHORIZED')) {
            setSaveError('Authentication required. Please login to save settings.')
            break
          }
        }
      }

      if (failCount === 0) {
        setHasUnsavedChanges(false)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else if (successCount > 0) {
        setSaveError(`Partially saved: ${successCount} succeeded, ${failCount} failed`)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaveError('Failed to save settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS)
    setHasUnsavedChanges(true)
    setSaveError(null)
    setSaveSuccess(false)
  }

  // Load settings from backend API on mount
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await apiClient.get<{ data: Record<string, unknown> }>('/api/v1/settings/public')
        const apiSettings = response.data || response

        if (apiSettings && typeof apiSettings === 'object') {
          setSettings(prev => prev.map(setting => {
            const apiValue = apiSettings[setting.id]
            if (apiValue !== undefined) {
              // Handle type conversion
              if (setting.type === 'toggle') {
                return { ...setting, value: apiValue === true || apiValue === 'true' }
              } else if (setting.type === 'number') {
                return { ...setting, value: Number(apiValue) }
              } else if (setting.type === 'select') {
                return { ...setting, value: String(apiValue) }
              }
              return { ...setting, value: apiValue }
            }
            return setting
          }))
        }
      } catch (error) {
        console.error('Failed to load settings from API:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const breadcrumbs = [
    { label: "Procurement", href: "/procurement" },
    { label: "Settings" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Procurement Settings" breadcrumbs={breadcrumbs} />
        <div className="flex-1 overflow-auto p-6">
          {saveError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {saveError}
            </div>
          )}
          {saveSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              Settings saved successfully!
            </div>
          )}
          <ModuleGear
            moduleName="Procurement"
            moduleId="procurement"
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
