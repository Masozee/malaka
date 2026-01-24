"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Settings01Icon,
  FloppyDiskIcon,
  RotateLeft01Icon,
  AlertCircleIcon
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface SettingItem {
  id: string
  label: string
  description?: string
  type: 'toggle' | 'input' | 'select' | 'number'
  value: any
  options?: { label: string; value: any }[]
  category: string
}

interface ModuleGearProps {
  moduleName: string
  moduleId: string
  settings: SettingItem[]
  onSettingChange: (settingId: string, value: any) => void
  onSave: () => void
  onReset: () => void
  isLoading?: boolean
  hasUnsavedChanges?: boolean
}

export function ModuleGear({
  moduleName,
  moduleId,
  settings,
  onSettingChange,
  onSave,
  onReset,
  isLoading = false,
  hasUnsavedChanges = false
}: ModuleGearProps) {
  // Group settings by category
  const settingsByCategory = React.useMemo(() => {
    return settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(setting)
      return acc
    }, {} as Record<string, SettingItem[]>)
  }, [settings])

  const renderSettingControl = (setting: SettingItem) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={setting.id}
              checked={setting.value}
              onCheckedChange={(checked) => onSettingChange(setting.id, checked)}
            />
            <Label htmlFor={setting.id} className="text-sm">
              {setting.label}
            </Label>
          </div>
        )
      
      case 'input':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.id} className="text-sm font-medium">
              {setting.label}
            </Label>
            <Input
              id={setting.id}
              type="text"
              value={setting.value}
              onChange={(e) => onSettingChange(setting.id, e.target.value)}
              placeholder={setting.description}
            />
          </div>
        )
      
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.id} className="text-sm font-medium">
              {setting.label}
            </Label>
            <Input
              id={setting.id}
              type="number"
              value={setting.value}
              onChange={(e) => onSettingChange(setting.id, parseInt(e.target.value))}
              placeholder={setting.description}
            />
          </div>
        )
      
      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.id} className="text-sm font-medium">
              {setting.label}
            </Label>
            <select
              id={setting.id}
              value={setting.value}
              onChange={(e) => onSettingChange(setting.id, e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {setting.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HugeiconsIcon icon={Settings01Icon} className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{moduleName} Gear</h2>
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="ml-2">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={onReset}
            disabled={isLoading || !hasUnsavedChanges}
            className="flex items-center space-x-2"
          >
            <HugeiconsIcon icon={RotateLeft01Icon} className="h-4 w-4" />
            <span>Reset</span>
          </Button>
          <Button
            onClick={onSave}
            disabled={isLoading || !hasUnsavedChanges}
            className="flex items-center space-x-2"
          >
            <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4" />
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </div>

      {/* Gear by Category */}
      {Object.entries(settingsByCategory).map(([category, categoryGear]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base">{category}</CardTitle>
            <CardDescription>
              Configure {category.toLowerCase()} options for the {moduleName.toLowerCase()} module
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryGear.map((setting, index) => (
              <div key={setting.id}>
                <div className="space-y-2">
                  {renderSettingControl(setting)}
                  {setting.description && setting.type === 'toggle' && (
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  )}
                </div>
                {index < categoryGear.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}