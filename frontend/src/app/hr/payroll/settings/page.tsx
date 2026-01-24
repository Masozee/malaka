'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

import type { PayrollSettings } from '@/types/hr'
import { mockPayrollSettings } from '@/services/hr'

export default function PayrollSettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [settings, setGear] = useState<PayrollSettings>(mockPayrollSettings)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Human Resources', href: '/hr' },
    { label: 'Payroll', href: '/hr/payroll' },
    { label: 'Gear', href: '/hr/payroll/settings' }
  ]

  const handleSettingChange = (key: string, value: any) => {
    if (key.includes('.')) {
      const [parentKey, childKey] = key.split('.')
      setGear(prev => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey as keyof PayrollSettings] as any,
          [childKey]: value
        }
      }))
    } else {
      setGear(prev => ({ ...prev, [key]: value }))
    }
    setHasChanges(true)
  }

  const handleSave = () => {
    // Here you would typically make an API call to save the settings
    console.log('Saving settings:', settings)
    setHasChanges(false)
    // Show success message
  }

  const handleReset = () => {
    setGear(mockPayrollSettings)
    setHasChanges(false)
  }

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Payroll Gear"
          description="Configure payroll calculation rules and company policies"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Changes
                </Button>
              )}
              <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
                <FloppyDisk className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          }
        />

        {/* Company Information */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <BuildingOffice className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Company Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => handleSettingChange('companyName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payPeriod">Pay Period</Label>
              <Select value={settings.payPeriod} onValueChange={(value) => handleSettingChange('payPeriod', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Working Hours Configuration */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Clock className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Working Hours & Overtime</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="workingDays">Working Days per Month</Label>
              <Input
                id="workingDays"
                type="number"
                value={settings.workingDays}
                onChange={(e) => handleSettingChange('workingDays', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workingHours">Working Hours per Day</Label>
              <Input
                id="workingHours"
                type="number"
                value={settings.workingHours}
                onChange={(e) => handleSettingChange('workingHours', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overtimeRate">Overtime Rate Multiplier</Label>
              <Input
                id="overtimeRate"
                type="number"
                step="0.1"
                value={settings.overtimeRate}
                onChange={(e) => handleSettingChange('overtimeRate', parseFloat(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                e.g., 1.5 means 150% of regular rate
              </p>
            </div>
          </div>
        </Card>

        {/* Tax Gear */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Percent className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-semibold">Tax & Deduction Rates</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="incomeTaxRate">Income Tax Rate (%)</Label>
              <Input
                id="incomeTaxRate"
                type="number"
                step="0.1"
                value={settings.taxGear.incomeTaxRate}
                onChange={(e) => handleSettingChange('taxGear.incomeTaxRate', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialSecurityRate">Social Security Rate (%)</Label>
              <Input
                id="socialSecurityRate"
                type="number"
                step="0.1"
                value={settings.taxGear.socialSecurityRate}
                onChange={(e) => handleSettingChange('taxGear.socialSecurityRate', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="healthInsuranceRate">Health Insurance Rate (%)</Label>
              <Input
                id="healthInsuranceRate"
                type="number"
                step="0.1"
                value={settings.taxGear.healthInsuranceRate}
                onChange={(e) => handleSettingChange('taxGear.healthInsuranceRate', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These rates will be applied to all employees. Individual tax brackets and exemptions can be configured per employee in their profile.
            </p>
          </div>
        </Card>

        {/* Allowance Gear */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <CurrencyDollar className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Standard Allowances</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="transportAllowance">Transport Allowance (Rp)</Label>
              <Input
                id="transportAllowance"
                type="number"
                value={settings.allowanceGear.transportAllowance}
                onChange={(e) => handleSettingChange('allowanceGear.transportAllowance', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mealAllowance">Meal Allowance (Rp)</Label>
              <Input
                id="mealAllowance"
                type="number"
                value={settings.allowanceGear.mealAllowance}
                onChange={(e) => handleSettingChange('allowanceGear.mealAllowance', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="housingAllowance">Housing Allowance (Rp)</Label>
              <Input
                id="housingAllowance"
                type="number"
                value={settings.allowanceGear.housingAllowance}
                onChange={(e) => handleSettingChange('allowanceGear.housingAllowance', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Default Allowances:</strong> These amounts will be automatically applied to new employees. You can override them for individual employees as needed.
            </p>
          </div>
        </Card>

        {/* Calculation Preview */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Calculator className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold">Calculation Preview</h2>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Sample Calculation (Basic Salary: Rp 10,000,000)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h5 className="font-medium text-green-600 mb-2">Earnings</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Basic Salary:</span>
                    <span className="font-mono">{mounted ? `Rp ${(10000000).toLocaleString('id-ID')}` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transport Allowance:</span>
                    <span className="font-mono">{mounted ? `Rp ${settings.allowanceGear.transportAllowance.toLocaleString('id-ID')}` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Meal Allowance:</span>
                    <span className="font-mono">{mounted ? `Rp ${settings.allowanceGear.mealAllowance.toLocaleString('id-ID')}` : ''}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Gross Pay:</span>
                    <span className="font-mono">
                      {mounted ? `Rp ${(10000000 + settings.allowanceGear.transportAllowance + settings.allowanceGear.mealAllowance).toLocaleString('id-ID')}` : ''}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-red-600 mb-2">Deductions</h5>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Income Tax ({settings.taxGear.incomeTaxRate}%):</span>
                    <span className="font-mono">{mounted ? `Rp ${(10000000 * settings.taxGear.incomeTaxRate / 100).toLocaleString('id-ID')}` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Social Security ({settings.taxGear.socialSecurityRate}%):</span>
                    <span className="font-mono">{mounted ? `Rp ${(10000000 * settings.taxGear.socialSecurityRate / 100).toLocaleString('id-ID')}` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Health Insurance ({settings.taxGear.healthInsuranceRate}%):</span>
                    <span className="font-mono">{mounted ? `Rp ${(10000000 * settings.taxGear.healthInsuranceRate / 100).toLocaleString('id-ID')}` : ''}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total Deductions:</span>
                    <span className="font-mono">
                      {mounted ? `Rp ${(10000000 * (settings.taxGear.incomeTaxRate + settings.taxGear.socialSecurityRate + settings.taxGear.healthInsuranceRate) / 100).toLocaleString('id-ID')}` : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-bold">
              <span>Net Pay:</span>
              <span className="text-green-600 font-mono">
                {mounted ? `Rp ${(10000000 + settings.allowanceGear.transportAllowance + settings.allowanceGear.mealAllowance - (10000000 * (settings.taxGear.incomeTaxRate + settings.taxGear.socialSecurityRate + settings.taxGear.healthInsuranceRate) / 100)).toLocaleString('id-ID')}` : ''}
              </span>
            </div>
          </div>
        </Card>

        {/* Save Notice */}
        {hasChanges && (
          <Card className="p-4 border-orange-200 bg-orange-50">
            <div className="flex items-center space-x-2 text-orange-800">
              <Gear className="h-5 w-5" />
              <p className="font-medium">Unsaved Changes</p>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              You have unsaved changes. Don't forget to save your settings before leaving this page.
            </p>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}