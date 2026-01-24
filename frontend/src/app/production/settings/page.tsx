"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { ModuleGear } from "@/components/ui/module-settings"

export default function ProductionGearPage() {
  const [settings, setGear] = React.useState([
    {
      id: "auto_work_order_scheduling",
      label: "Auto Work Order Scheduling",
      description: "Automatically schedule work orders based on capacity",
      type: "toggle" as const,
      value: false,
      category: "Production Planning"
    },
    {
      id: "quality_control_mandatory",
      label: "Quality Control Mandatory",
      description: "Require quality control for all production outputs",
      type: "toggle" as const,
      value: true,
      category: "Quality Control"
    },
    {
      id: "material_consumption_tracking",
      label: "Material Consumption Tracking",
      description: "Track material consumption in real-time",
      type: "toggle" as const,
      value: true,
      category: "Material Management"
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
    await new Promise(resolve => setTimeout(resolve, 1000))
    setHasUnsavedChanges(false)
    setIsLoading(false)
  }

  const handleReset = () => {
    setHasUnsavedChanges(false)
  }

  const breadcrumbs = [
    { label: "Production", href: "/production" },
    { label: "Gear" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Production Gear" breadcrumbs={breadcrumbs} />
        <div className="flex-1 overflow-auto p-6">
          <ModuleGear
            moduleName="Production"
            moduleId="production"
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