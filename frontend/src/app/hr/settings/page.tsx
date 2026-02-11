"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Dollar01Icon,
  File01Icon,
  Calendar01Icon,
  UserGroupIcon,
  ChartColumnIcon,
  MortarboardIcon,
  Settings01Icon,
  Delete01Icon,
  AlertCircleIcon,
  ArrowTurnBackwardIcon,
  FloppyDiskIcon,
  PlusSignIcon
} from '@hugeicons/core-free-icons'

interface SettingItem {
  id: string
  label: string
  description?: string
  type: 'toggle' | 'input' | 'select' | 'number'
  value: any
  options?: { label: string; value: any }[]
}

interface PayrollComponent {
  id: string
  name: string
  type: 'addition' | 'deduction'
  amount: number
  isPercentage: boolean
  isTaxable: boolean
  isActive: boolean
  description?: string
}

interface TabGear {
  [key: string]: SettingItem[]
}

export default function HRGearPage() {
  const [activeTab, setActiveTab] = React.useState("payroll")
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  // Payroll Components State
  const [payrollComponents, setPayrollComponents] = React.useState<PayrollComponent[]>([
    {
      id: "basic_salary",
      name: "Basic Salary",
      type: "addition",
      amount: 0,
      isPercentage: false,
      isTaxable: true,
      isActive: true,
      description: "Base salary for employee"
    },
    {
      id: "transport_allowance",
      name: "Transport Allowance",
      type: "addition",
      amount: 300000,
      isPercentage: false,
      isTaxable: false,
      isActive: true,
      description: "Monthly transport allowance"
    },
    {
      id: "meal_allowance",
      name: "Meal Allowance",
      type: "addition",
      amount: 25000,
      isPercentage: false,
      isTaxable: false,
      isActive: true,
      description: "Daily meal allowance"
    },
    {
      id: "overtime_pay",
      name: "Overtime Pay",
      type: "addition",
      amount: 150,
      isPercentage: true,
      isTaxable: true,
      isActive: true,
      description: "Overtime pay (percentage of hourly rate)"
    },
    {
      id: "night_shift_allowance",
      name: "Night Shift Allowance",
      type: "addition",
      amount: 50000,
      isPercentage: false,
      isTaxable: false,
      isActive: true,
      description: "Additional pay for night shift"
    },
    {
      id: "income_tax",
      name: "Income Tax (PPh 21)",
      type: "deduction",
      amount: 0,
      isPercentage: true,
      isTaxable: false,
      isActive: true,
      description: "Income tax deduction"
    },
    {
      id: "jamsostek",
      name: "Jamsostek",
      type: "deduction",
      amount: 2,
      isPercentage: true,
      isTaxable: false,
      isActive: true,
      description: "Social security contribution"
    },
    {
      id: "bpjs_kesehatan",
      name: "BPJS Kesehatan",
      type: "deduction",
      amount: 1,
      isPercentage: true,
      isTaxable: false,
      isActive: true,
      description: "Health insurance contribution"
    }
  ])

  const [tabGear, setTabGear] = React.useState<TabGear>({
    // Payroll Components Tab
    payroll: [
      {
        id: "basic_salary_component",
        label: "Basic Salary Component",
        description: "Define basic salary calculation method",
        type: "select",
        value: "monthly_fixed",
        options: [
          { label: "Monthly Fixed", value: "monthly_fixed" },
          { label: "Hourly Rate", value: "hourly" },
          { label: "Daily Rate", value: "daily" }
        ]
      }
    ],

    // Tax Gear Tab
    tax: [
      {
        id: "enable_income_tax",
        label: "Enable Income Tax Deduction",
        description: "Automatically calculate and deduct income tax",
        type: "toggle",
        value: true
      },
      {
        id: "tax_calculation_method",
        label: "Tax Calculation Method",
        description: "Method for calculating income tax",
        type: "select",
        value: "progressive",
        options: [
          { label: "Progressive (PPh 21)", value: "progressive" },
          { label: "Flat Rate", value: "flat" }
        ]
      },
      {
        id: "ptkp_status",
        label: "Default PTKP Status",
        description: "Default tax-free income status for new employees",
        type: "select",
        value: "TK/0",
        options: [
          { label: "TK/0 - Single, No Dependents", value: "TK/0" },
          { label: "TK/1 - Single, 1 Dependent", value: "TK/1" },
          { label: "K/0 - Married, No Dependents", value: "K/0" },
          { label: "K/1 - Married, 1 Dependent", value: "K/1" },
          { label: "K/2 - Married, 2 Dependents", value: "K/2" },
          { label: "K/3 - Married, 3 Dependents", value: "K/3" }
        ]
      },
      {
        id: "jamsostek_employee_rate",
        label: "Jamsostek Employee Rate (%)",
        description: "Employee contribution rate for Jamsostek",
        type: "number",
        value: 2
      },
      {
        id: "jamsostek_employer_rate",
        label: "Jamsostek Employer Rate (%)",
        description: "Employer contribution rate for Jamsostek",
        type: "number",
        value: 3.7
      },
      {
        id: "bpjs_kesehatan_employee",
        label: "BPJS Kesehatan Employee Rate (%)",
        description: "Employee contribution for BPJS Kesehatan",
        type: "number",
        value: 1
      },
      {
        id: "bpjs_kesehatan_employer",
        label: "BPJS Kesehatan Employer Rate (%)",
        description: "Employer contribution for BPJS Kesehatan",
        type: "number",
        value: 4
      }
    ],

    // Leave Approval Tab
    leave: [
      {
        id: "require_manager_approval",
        label: "Require Manager Approval",
        description: "All leave requests must be approved by direct manager",
        type: "toggle",
        value: true
      },
      {
        id: "require_hr_approval",
        label: "Require HR Approval",
        description: "Leave requests also need HR department approval",
        type: "toggle",
        value: false
      },
      {
        id: "auto_approval_threshold",
        label: "Auto-Approval Threshold (Days)",
        description: "Automatically approve leave requests under this number of days",
        type: "number",
        value: 1
      },
      {
        id: "advance_notice_days",
        label: "Minimum Advance Notice (Days)",
        description: "Minimum days in advance for leave requests",
        type: "number",
        value: 3
      },
      {
        id: "annual_leave_entitlement",
        label: "Annual Leave Entitlement (Days)",
        description: "Default annual leave days per employee",
        type: "number",
        value: 12
      },
      {
        id: "sick_leave_entitlement",
        label: "Sick Leave Entitlement (Days)",
        description: "Annual sick leave days per employee",
        type: "number",
        value: 12
      },
      {
        id: "maternity_leave_days",
        label: "Maternity Leave (Days)",
        description: "Maternity leave entitlement",
        type: "number",
        value: 90
      },
      {
        id: "paternity_leave_days",
        label: "Paternity Leave (Days)",
        description: "Paternity leave entitlement",
        type: "number",
        value: 2
      },
      {
        id: "carry_forward_leave",
        label: "Allow Carry Forward",
        description: "Allow unused leave to be carried to next year",
        type: "toggle",
        value: true
      },
      {
        id: "max_carry_forward_days",
        label: "Max Carry Forward Days",
        description: "Maximum days that can be carried forward",
        type: "number",
        value: 6
      }
    ],

    // Employee Management Tab
    employees: [
      {
        id: "auto_employee_id",
        label: "Auto Employee ID Generation",
        description: "Automatically generate employee IDs",
        type: "toggle",
        value: true
      },
      {
        id: "employee_id_prefix",
        label: "Employee ID Prefix",
        description: "Prefix for employee IDs (e.g., EMP-, STF-)",
        type: "input",
        value: "EMP-"
      },
      {
        id: "probation_period_days",
        label: "Default Probation Period (Days)",
        description: "Standard probation period for new employees",
        type: "number",
        value: 90
      },
      {
        id: "retirement_age",
        label: "Retirement Age",
        description: "Standard retirement age",
        type: "number",
        value: 60
      },
      {
        id: "require_medical_checkup",
        label: "Require Medical Checkup",
        description: "Require medical checkup for new employees",
        type: "toggle",
        value: true
      },
      {
        id: "background_check_required",
        label: "Background Check Required",
        description: "Require background verification",
        type: "toggle",
        value: true
      },
      {
        id: "contract_renewal_notice_days",
        label: "Contract Renewal Notice (Days)",
        description: "Days before contract expiry to send renewal notice",
        type: "number",
        value: 30
      }
    ],

    // Attendance Tab
    attendance: [
      {
        id: "biometric_attendance",
        label: "Biometric Attendance Required",
        description: "Require biometric verification for attendance",
        type: "toggle",
        value: true
      },
      {
        id: "flexible_working_hours",
        label: "Flexible Working Hours",
        description: "Allow flexible working schedules",
        type: "toggle",
        value: false
      },
      {
        id: "core_hours_start",
        label: "Core Hours Start Time",
        description: "Start time for mandatory presence",
        type: "input",
        value: "09:00"
      },
      {
        id: "core_hours_end",
        label: "Core Hours End Time",
        description: "End time for mandatory presence",
        type: "input",
        value: "15:00"
      },
      {
        id: "late_arrival_grace_minutes",
        label: "Late Arrival Grace Period (Minutes)",
        description: "Grace period before marking as late",
        type: "number",
        value: 15
      },
      {
        id: "overtime_calculation",
        label: "Automatic Overtime Calculation",
        description: "Calculate overtime hours automatically",
        type: "toggle",
        value: true
      },
      {
        id: "minimum_overtime_minutes",
        label: "Minimum Overtime (Minutes)",
        description: "Minimum overtime duration to be counted",
        type: "number",
        value: 30
      },
      {
        id: "weekend_overtime_rate",
        label: "Weekend Overtime Rate",
        description: "Overtime rate multiplier for weekends",
        type: "number",
        value: 2.0
      }
    ],

    // Performance Tab
    performance: [
      {
        id: "performance_review_cycle",
        label: "Performance Review Cycle",
        description: "Frequency of performance reviews",
        type: "select",
        value: "annual",
        options: [
          { label: "Quarterly", value: "quarterly" },
          { label: "Semi-Annual", value: "semiannual" },
          { label: "Annual", value: "annual" }
        ]
      },
      {
        id: "goal_setting_required",
        label: "Goal Setting Required",
        description: "Require goal setting for all employees",
        type: "toggle",
        value: true
      },
      {
        id: "self_assessment_enabled",
        label: "Enable Self-Assessment",
        description: "Allow employees to perform self-assessment",
        type: "toggle",
        value: true
      },
      {
        id: "360_feedback_enabled",
        label: "Enable 360-Degree Feedback",
        description: "Enable feedback from peers and subordinates",
        type: "toggle",
        value: false
      },
      {
        id: "performance_rating_scale",
        label: "Performance Rating Scale",
        description: "Scale used for performance ratings",
        type: "select",
        value: "5_point",
        options: [
          { label: "5-Point Scale", value: "5_point" },
          { label: "4-Point Scale", value: "4_point" },
          { label: "10-Point Scale", value: "10_point" }
        ]
      },
      {
        id: "min_rating_for_promotion",
        label: "Minimum Rating for Promotion",
        description: "Minimum performance rating required for promotion",
        type: "number",
        value: 4
      }
    ]
  })

  const tabs = [
    { id: "payroll", label: "Payroll Components", icon: Dollar01Icon },
    { id: "tax", label: "Tax Gear", icon: File01Icon },
    { id: "leave", label: "Leave Approval", icon: Calendar01Icon },
    { id: "employees", label: "Employee Management", icon: UserGroupIcon },
    { id: "attendance", label: "Attendance", icon: ChartColumnIcon },
    { id: "performance", label: "Performance", icon: MortarboardIcon }
  ]

  const handleSettingChange = (tabId: string, settingId: string, value: any) => {
    setTabGear(prev => ({
      ...prev,
      [tabId]: prev[tabId].map(setting => 
        setting.id === settingId ? { ...setting, value } : setting
      )
    }))
    setHasUnsavedChanges(true)
  }

  const handlePayrollComponentChange = (componentId: string, field: keyof PayrollComponent, value: any) => {
    setPayrollComponents(prev => prev.map(component =>
      component.id === componentId ? { ...component, [field]: value } : component
    ))
    setHasUnsavedChanges(true)
  }

  const addPayrollComponent = () => {
    const newComponent: PayrollComponent = {
      id: `custom_${Date.now()}`,
      name: "New Component",
      type: "addition",
      amount: 0,
      isPercentage: false,
      isTaxable: true,
      isActive: true,
      description: ""
    }
    setPayrollComponents(prev => [...prev, newComponent])
    setHasUnsavedChanges(true)
  }

  const removePayrollComponent = (componentId: string) => {
    setPayrollComponents(prev => prev.filter(component => component.id !== componentId))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Saving HR settings:', tabGear)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    // Reset to default values
    setTabGear(prev => {
      const resetGear = { ...prev }
      Object.keys(resetGear).forEach(tabId => {
        resetGear[tabId] = resetGear[tabId].map(setting => ({
          ...setting,
          value: getDefaultValue(setting.id)
        }))
      })
      return resetGear
    })
    setHasUnsavedChanges(false)
  }

  const getDefaultValue = (settingId: string): any => {
    const defaults: Record<string, any> = {
      // Payroll defaults
      basic_salary_component: "monthly_fixed",
      overtime_rate_multiplier: 1.5,
      holiday_pay_multiplier: 2.0,
      night_shift_allowance: 50000,
      transport_allowance: 300000,
      meal_allowance: 25000,
      bonus_calculation_method: "performance_based",

      // Tax defaults
      enable_income_tax: true,
      tax_calculation_method: "progressive",
      ptkp_status: "TK/0",
      jamsostek_employee_rate: 2,
      jamsostek_employer_rate: 3.7,
      bpjs_kesehatan_employee: 1,
      bpjs_kesehatan_employer: 4,

      // Leave defaults
      require_manager_approval: true,
      require_hr_approval: false,
      auto_approval_threshold: 1,
      advance_notice_days: 3,
      annual_leave_entitlement: 12,
      sick_leave_entitlement: 12,
      maternity_leave_days: 90,
      paternity_leave_days: 2,
      carry_forward_leave: true,
      max_carry_forward_days: 6,

      // Employee defaults
      auto_employee_id: true,
      employee_id_prefix: "EMP-",
      probation_period_days: 90,
      retirement_age: 60,
      require_medical_checkup: true,
      background_check_required: true,
      contract_renewal_notice_days: 30,

      // Attendance defaults
      biometric_attendance: true,
      flexible_working_hours: false,
      core_hours_start: "09:00",
      core_hours_end: "15:00",
      late_arrival_grace_minutes: 15,
      overtime_calculation: true,
      minimum_overtime_minutes: 30,
      weekend_overtime_rate: 2.0,

      // Performance defaults
      performance_review_cycle: "annual",
      goal_setting_required: true,
      self_assessment_enabled: true,
      "360_feedback_enabled": false,
      performance_rating_scale: "5_point",
      min_rating_for_promotion: 4
    }
    return defaults[settingId]
  }

  const renderPayrollComponentRow = (component: PayrollComponent) => {
    return (
      <div key={component.id} className="grid grid-cols-12 gap-4 items-center p-4 border rounded-lg bg-card">
        {/* Active Toggle */}
        <div className="col-span-1 flex justify-center">
          <Switch
            checked={component.isActive}
            onCheckedChange={(checked) => handlePayrollComponentChange(component.id, 'isActive', checked)}
          />
        </div>

        {/* Component Name */}
        <div className="col-span-2">
          <Input
            value={component.name}
            onChange={(e) => handlePayrollComponentChange(component.id, 'name', e.target.value)}
            placeholder="Component name"
            className="text-sm"
          />
        </div>

        {/* Type (Addition/Deduction) */}
        <div className="col-span-2">
          <Select
            value={component.type}
            onValueChange={(value) => handlePayrollComponentChange(component.id, 'type', value as 'addition' | 'deduction')}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="addition">Addition</SelectItem>
              <SelectItem value="deduction">Deduction</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amount */}
        <div className="col-span-2">
          <Input
            type="number"
            value={component.amount}
            onChange={(e) => handlePayrollComponentChange(component.id, 'amount', parseFloat(e.target.value) || 0)}
            placeholder="Amount"
            className="text-sm"
          />
        </div>

        {/* Percentage Toggle */}
        <div className="col-span-1 flex flex-col items-center">
          <Label className="text-xs mb-1">%</Label>
          <Switch
            checked={component.isPercentage}
            onCheckedChange={(checked) => handlePayrollComponentChange(component.id, 'isPercentage', checked)}
          />
        </div>

        {/* Taxable Toggle */}
        <div className="col-span-1 flex flex-col items-center">
          <Label className="text-xs mb-1">Tax</Label>
          <Switch
            checked={component.isTaxable}
            onCheckedChange={(checked) => handlePayrollComponentChange(component.id, 'isTaxable', checked)}
          />
        </div>

        {/* Description */}
        <div className="col-span-2">
          <Input
            value={component.description || ''}
            onChange={(e) => handlePayrollComponentChange(component.id, 'description', e.target.value)}
            placeholder="Description"
            className="text-sm"
          />
        </div>

        {/* Remove Button */}
        <div className="col-span-1 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removePayrollComponent(component.id)}
            className="text-destructive hover:text-destructive"
            disabled={['basic_salary', 'income_tax', 'jamsostek', 'bpjs_kesehatan'].includes(component.id)}
          >
            <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  const renderSettingControl = (tabId: string, setting: SettingItem) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">{setting.label}</Label>
              {setting.description && (
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              )}
            </div>
            <Switch
              checked={setting.value}
              onCheckedChange={(checked) => handleSettingChange(tabId, setting.id, checked)}
            />
          </div>
        )
      
      case 'input':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{setting.label}</Label>
            {setting.description && (
              <p className="text-sm text-muted-foreground">{setting.description}</p>
            )}
            <Input
              type="text"
              value={setting.value}
              onChange={(e) => handleSettingChange(tabId, setting.id, e.target.value)}
            />
          </div>
        )
      
      case 'number':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{setting.label}</Label>
            {setting.description && (
              <p className="text-sm text-muted-foreground">{setting.description}</p>
            )}
            <Input
              type="number"
              value={setting.value}
              onChange={(e) => handleSettingChange(tabId, setting.id, parseFloat(e.target.value) || 0)}
            />
          </div>
        )
      
      case 'select':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{setting.label}</Label>
            {setting.description && (
              <p className="text-sm text-muted-foreground">{setting.description}</p>
            )}
            <Select
              value={setting.value}
              onValueChange={(value) => handleSettingChange(tabId, setting.id, value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {setting.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      
      default:
        return null
    }
  }

  const breadcrumbs = [
    { label: "HR Management", href: "/hr" },
    { label: "Gear" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="HR Management Gear"
          breadcrumbs={breadcrumbs}
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Header with Save/Reset */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HugeiconsIcon icon={Settings01Icon} className="h-5 w-5" />
              <h2 className="text-lg font-semibold">HR Configuration</h2>
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
                onClick={handleReset}
                disabled={isLoading || !hasUnsavedChanges}
                className="flex items-center space-x-2"
              >
                <HugeiconsIcon icon={ArrowTurnBackwardIcon} className="h-4 w-4" />
                <span>Reset</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading || !hasUnsavedChanges}
                className="flex items-center space-x-2"
              >
                <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4" />
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          </div>

          {/* Tabbed Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
              {tabs.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2 px-3">
                    <HugeiconsIcon icon={tab.icon} className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <HugeiconsIcon icon={tab.icon} className="h-5 w-5" />
                          <CardTitle>{tab.label}</CardTitle>
                        </div>
                        <CardDescription>
                          Configure {tab.label.toLowerCase()} settings for your HR management system
                        </CardDescription>
                      </div>
                      {tab.id === 'payroll' && (
                        <Button
                          onClick={addPayrollComponent}
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
                          <span>Add Component</span>
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {tab.id === 'payroll' ? (
                      <>
                        {/* Payroll Components Header */}
                        <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-muted-foreground border-b pb-2">
                          <div className="col-span-1 text-center">Active</div>
                          <div className="col-span-2">Name</div>
                          <div className="col-span-2">Type</div>
                          <div className="col-span-2">Amount</div>
                          <div className="col-span-1 text-center">%</div>
                          <div className="col-span-1 text-center">Taxable</div>
                          <div className="col-span-2">Description</div>
                          <div className="col-span-1 text-center">Action</div>
                        </div>
                        
                        {/* Payroll Components List */}
                        <div className="space-y-4">
                          {payrollComponents.map(component => renderPayrollComponentRow(component))}
                        </div>

                        {/* Regular Gear for Payroll Tab */}
                        {tabGear[tab.id]?.length > 0 && (
                          <>
                            <Separator />
                            <div className="space-y-6">
                              <h4 className="text-sm font-medium">General Gear</h4>
                              {tabGear[tab.id]?.map((setting, index) => (
                                <div key={setting.id}>
                                  {renderSettingControl(tab.id, setting)}
                                  {index < tabGear[tab.id].length - 1 && (
                                    <Separator className="mt-6" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      /* Other Tabs Regular Gear */
                      tabGear[tab.id]?.map((setting, index) => (
                        <div key={setting.id}>
                          {renderSettingControl(tab.id, setting)}
                          {index < tabGear[tab.id].length - 1 && (
                            <Separator className="mt-6" />
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </TwoLevelLayout>
  )
}