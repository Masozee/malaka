'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable, AdvancedColumn } from '@/components/ui/advanced-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

import type { PayrollPeriod, PayrollItem } from '@/types/hr'
import { mockPayrollPeriods, mockPayrollItems } from '@/services/hr'

export default function PayrollProcessPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([])
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'calculating' | 'reviewing' | 'processing' | 'completed'>('idle')
  const [processProgress, setProcessProgress] = useState(0)

  useEffect(() => {
    setMounted(true)
    const currentPeriod = mockPayrollPeriods.find(p => p.status === 'processing')
    if (currentPeriod) {
      setSelectedPeriod(currentPeriod.id)
      setPayrollItems(mockPayrollItems.filter(item => item.payrollPeriodId === currentPeriod.id))
      setProcessingStatus('reviewing')
      setProcessProgress(60)
    }
  }, [])

  const breadcrumbs = [
    { label: 'Human Resources', href: '/hr' },
    { label: 'Payroll', href: '/hr/payroll' },
    { label: 'Process', href: '/hr/payroll/process' }
  ]

  const currentPeriod = mockPayrollPeriods.find(p => p.id === selectedPeriod)

  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriod(periodId)
    setPayrollItems(mockPayrollItems.filter(item => item.payrollPeriodId === periodId))
    setProcessingStatus('idle')
    setProcessProgress(0)
  }

  const handleCalculatePayroll = () => {
    setProcessingStatus('calculating')
    setProcessProgress(0)
    
    // Simulate calculation progress
    const interval = setInterval(() => {
      setProcessProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setProcessingStatus('reviewing')
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const handleProcessPayroll = () => {
    setProcessingStatus('processing')
    setProcessProgress(0)
    
    // Simulate processing
    const interval = setInterval(() => {
      setProcessProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setProcessingStatus('completed')
          return 100
        }
        return prev + 15
      })
    }, 300)
  }

  const getStatusBadge = (status: PayrollItem['status']) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft', color: 'gray' },
      calculated: { variant: 'default' as const, label: 'Calculated', color: 'blue' },
      approved: { variant: 'default' as const, label: 'Approved', color: 'green' },
      paid: { variant: 'outline' as const, label: 'Paid', color: 'purple' }
    }
    return statusConfig[status] || { variant: 'secondary' as const, label: status, color: 'gray' }
  }

  const summaryStats = {
    totalEmployees: payrollItems.length,
    totalGrossPay: payrollItems.reduce((sum, item) => sum + item.grossPay, 0),
    totalDeductions: payrollItems.reduce((sum, item) => sum + item.totalDeductions, 0),
    totalNetPay: payrollItems.reduce((sum, item) => sum + item.netPay, 0),
    calculatedItems: payrollItems.filter(item => item.status === 'calculated').length,
    approvedItems: payrollItems.filter(item => item.status === 'approved').length,
    paidItems: payrollItems.filter(item => item.status === 'paid').length
  }

  const payrollColumns: AdvancedColumn<PayrollItem>[] = [
    {
      key: 'employee',
      title: 'Employee',
      render: (_value: unknown, item: PayrollItem) => (
        <div>
          <div className="font-medium">{item.employee.name}</div>
          <div className="text-xs text-muted-foreground">{item.employee.employeeId} • {item.employee.position}</div>
        </div>
      )
    },
    {
      key: 'basicSalary',
      title: 'Basic Salary',
      render: (_value: unknown, item: PayrollItem) =>
        mounted && item && item.basicSalary !== undefined ? `Rp ${item.basicSalary.toLocaleString('id-ID')}` : ''
    },
    {
      key: 'grossPay',
      title: 'Gross Pay',
      render: (_value: unknown, item: PayrollItem) =>
        mounted && item && item.grossPay !== undefined ? `Rp ${item.grossPay.toLocaleString('id-ID')}` : ''
    },
    {
      key: 'totalDeductions',
      title: 'Deductions',
      render: (_value: unknown, item: PayrollItem) =>
        mounted && item && item.totalDeductions !== undefined ? `Rp ${item.totalDeductions.toLocaleString('id-ID')}` : ''
    },
    {
      key: 'netPay',
      title: 'Net Pay',
      render: (_value: unknown, item: PayrollItem) => (
        <div className="font-semibold text-green-600">
          {mounted && item && item.netPay !== undefined ? `Rp ${item.netPay.toLocaleString('id-ID')}` : ''}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (_value: unknown, item: PayrollItem) => {
        const { variant, label } = getStatusBadge(item.status)
        return <Badge variant={variant}>{label}</Badge>
      }
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Process Payroll"
          description="Calculate and process employee payroll for selected period"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Preview Report
              </Button>
              <Button variant="outline" size="sm">
                <DownloadSimple className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          }
        />

        {/* Period Selection */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Select Payroll Period</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose the period you want to process
              </p>
            </div>
            <div className="w-64">
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {mockPayrollPeriods.map((period) => {
                    const monthNames = [
                      'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'
                    ]
                    return (
                      <SelectItem key={period.id} value={period.id}>
                        {monthNames[period.month - 1]} {period.year}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Processing Status */}
        {currentPeriod && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Processing Status</h3>
                <Badge variant={currentPeriod.status === 'completed' ? 'default' : 'secondary'}>
                  {currentPeriod.status.charAt(0).toUpperCase() + currentPeriod.status.slice(1)}
                </Badge>
              </div>

              {/* Progress Bar */}
              {processingStatus !== 'idle' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {processingStatus === 'calculating' && 'Calculating payroll...'}
                      {processingStatus === 'reviewing' && 'Ready for review'}
                      {processingStatus === 'processing' && 'Processing payments...'}
                      {processingStatus === 'completed' && 'Processing completed'}
                    </span>
                    <span>{processProgress}%</span>
                  </div>
                  <Progress value={processProgress} className="h-2" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {processingStatus === 'idle' && (
                  <Button onClick={handleCalculatePayroll}>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Payroll
                  </Button>
                )}
                {processingStatus === 'reviewing' && (
                  <>
                    <Button onClick={handleProcessPayroll}>
                      <Play className="h-4 w-4 mr-2" />
                      Process Payroll
                    </Button>
                    <Button variant="outline" onClick={handleCalculatePayroll}>
                      <Calculator className="h-4 w-4 mr-2" />
                      Recalculate
                    </Button>
                  </>
                )}
                {processingStatus === 'processing' && (
                  <Button variant="outline" disabled>
                    <Pause className="h-4 w-4 mr-2" />
                    Processing...
                  </Button>
                )}
                {processingStatus === 'completed' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Payroll processed successfully</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Summary Statistics */}
        {payrollItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold mt-1">{summaryStats.totalEmployees}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gross Pay</p>
                  <p className="text-2xl font-bold mt-1">
                    {mounted ? `Rp ${summaryStats.totalGrossPay.toLocaleString('id-ID')}` : ''}
                  </p>
                </div>
                <CurrencyDollar className="h-8 w-8 text-green-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Deductions</p>
                  <p className="text-2xl font-bold mt-1">
                    {mounted ? `Rp ${summaryStats.totalDeductions.toLocaleString('id-ID')}` : ''}
                  </p>
                </div>
                <WarningCircle className="h-8 w-8 text-orange-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Pay</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">
                    {mounted ? `Rp ${summaryStats.totalNetPay.toLocaleString('id-ID')}` : ''}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </Card>
          </div>
        )}

        {/* Payroll Items Table */}
        {payrollItems.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Payroll Details</h2>
            <AdvancedDataTable
              data={payrollItems}
              columns={payrollColumns}
              searchPlaceholder="Search employees..."
              pagination={{
                current: 1,
                pageSize: 10,
                total: payrollItems.length,
                onChange: () => {}
              }}
            />
          </div>
        )}

        {/* No Period Selected */}
        {!selectedPeriod && (
          <Card className="p-12 text-center">
            <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Period Selected</h3>
            <p className="text-muted-foreground">
              Please select a payroll period above to begin processing
            </p>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}