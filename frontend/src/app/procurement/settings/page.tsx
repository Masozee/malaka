"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { ModuleSettings } from "@/components/ui/module-settings"

export default function ProcurementSettingsPage() {
  const [settings, setSettings] = React.useState([
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
      description: "Amount requiring manual approval",
      type: "number" as const,
      value: 5000000,
      category: "Purchase Orders"
    },
    {
      id: "vendor_evaluation_required",
      label: "Vendor Evaluation Required",
      description: "Require vendor evaluation before approving suppliers",
      type: "toggle" as const,
      value: true,
      category: "Vendor Management"
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
    await new Promise(resolve => setTimeout(resolve, 1000))
    setHasUnsavedChanges(false)
    setIsLoading(false)
  }

  const handleReset = () => {
    setHasUnsavedChanges(false)
  }

  const breadcrumbs = [
    { label: "Procurement", href: "/procurement" },
    { label: "Settings" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Procurement Settings" breadcrumbs={breadcrumbs} />
        <div className="flex-1 overflow-auto p-6">
          <ModuleSettings
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