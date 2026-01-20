"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { ModuleSettings } from "@/components/ui/module-settings"

export default function ShippingSettingsPage() {
  const [settings, setSettings] = React.useState([
    {
      id: "auto_courier_selection",
      label: "Auto Courier Selection",
      description: "Automatically select best courier based on destination and cost",
      type: "toggle" as const,
      value: true,
      category: "Shipping Operations"
    },
    {
      id: "real_time_tracking",
      label: "Real-time Tracking",
      description: "Enable real-time shipment tracking integration",
      type: "toggle" as const,
      value: true,
      category: "Shipping Operations"
    },
    {
      id: "insurance_required",
      label: "Insurance Required",
      description: "Require insurance for high-value shipments",
      type: "toggle" as const,
      value: false,
      category: "Risk Management"
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
    { label: "Shipping", href: "/shipping" },
    { label: "Settings" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Shipping Settings" breadcrumbs={breadcrumbs} />
        <div className="flex-1 overflow-auto p-6">
          <ModuleSettings
            moduleName="Shipping"
            moduleId="shipping"
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