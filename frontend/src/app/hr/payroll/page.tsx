'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable, AdvancedColumn } from '@/components/ui/advanced-data-table'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  UserMultiple02Icon,
  DollarCircleIcon,
  ArrowUpRight01Icon,
  Calculator01Icon,
  FileEditIcon,
  Settings01Icon,
  Time04Icon
} from '@hugeicons/core-free-icons'

import type { PayrollPeriod } from '@/types/hr'
import { HRService } from '@/services/hr'
import { formatCurrency, formatDate, formatPeriod } from '@/lib/payroll-utils'

export default function PayrollDashboard() {
  const [mounted, setMounted] = useState(false)
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)

    const fetchPayrollPeriods = async () => {
      try {
        setLoading(true)
        const response = await HRService.getPayrollPeriods()
        setPayrollPeriods(response.data)
      } catch (error) {
        console.error('Error fetching payroll periods:', error)
        setPayrollPeriods([])
      } finally {
        setLoading(false)
      }
    }

    fetchPayrollPeriods()
  }, [])

  const breadcrumbs = [
    { label: 'Human Resources', href: '/hr' },
    { label: 'Payroll', href: '/hr/payroll' }
  ]

  const currentPeriod = payrollPeriods.find(p => p.status === 'processing') || payrollPeriods[0]

  const kpiCards = [
    {
      title: 'Total Employees',
      value: currentPeriod?.totalEmployees || 0,
      change: '+2 from last month',
      changeType: 'positive' as const,
      icon: UserMultiple02Icon
    },
    {
      title: 'Gross Payroll',
      value: formatCurrency(currentPeriod?.totalGrossPay, mounted),
      change: '+5.2% from last month',
      changeType: 'positive' as const,
      icon: DollarCircleIcon
    },
    {
      title: 'Net Payroll',
      value: formatCurrency(currentPeriod?.totalNetPay, mounted),
      change: '+4.8% from last month',
      changeType: 'positive' as const,
      icon: ArrowUpRight01Icon
    },
    {
      title: 'Average Salary',
      value: currentPeriod?.totalEmployees
        ? formatCurrency(Math.round((currentPeriod?.totalNetPay || 0) / currentPeriod.totalEmployees), mounted)
        : '',
      change: '+2.1% from last month',
      changeType: 'positive' as const,
      icon: Calculator01Icon
    }
  ]

  const quickActions = [
    {
      title: 'Process Payroll',
      description: 'Calculate and process current month payroll',
      icon: Calculator01Icon,
      href: '/hr/payroll/process'
    },
    {
      title: 'Payroll Reports',
      description: 'View detailed payroll reports and history',
      icon: FileEditIcon,
      href: '/hr/payroll/history'
    },
    {
      title: 'Payroll Settings',
      description: 'Configure tax rates, allowances, and policies',
      icon: Settings01Icon,
      href: '/hr/payroll/settings'
    }
  ]

  const getStatusBadge = (status: PayrollPeriod['status']) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      processing: { variant: 'default' as const, label: 'Processing' },
      completed: { variant: 'default' as const, label: 'Completed' },
      locked: { variant: 'outline' as const, label: 'Locked' }
    }
    return statusConfig[status] || { variant: 'secondary' as const, label: status }
  }

  const periodColumns: AdvancedColumn<PayrollPeriod>[] = [
    {
      key: 'month',
      title: 'Period',
      render: (_value: unknown, period: PayrollPeriod) => formatPeriod(period?.month, period?.year, mounted)
    },
    {
      key: 'status',
      title: 'Status',
      render: (_value: unknown, period: PayrollPeriod) => {
        if (!period?.status) return null
        const { variant, label } = getStatusBadge(period.status)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'totalEmployees',
      title: 'Employees',
      render: (_value: unknown, period: PayrollPeriod) => (period.totalEmployees ?? 0).toString()
    },
    {
      key: 'totalGrossPay',
      title: 'Gross Pay',
      render: (_value: unknown, period: PayrollPeriod) => formatCurrency(period?.totalGrossPay, mounted)
    },
    {
      key: 'totalNetPay',
      title: 'Net Pay',
      render: (_value: unknown, period: PayrollPeriod) => (
        <div className="font-semibold text-green-600">
          {formatCurrency(period?.totalNetPay, mounted)}
        </div>
      )
    },
    {
      key: 'processedAt',
      title: 'Processed',
      render: (_value: unknown, period: PayrollPeriod) =>
        formatDate(period?.processedAt, mounted) || '-'
    }
  ]

  if (loading) {
    return (
      <TwoLevelLayout>
        <div className="flex-1 space-y-6">
          <Header
            title="Payroll Dashboard"
            description="Manage employee payroll and compensation"
            breadcrumbs={breadcrumbs}
          />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading payroll data...</p>
            </div>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  return (
    <TwoLevelLayout>
      <Header
        title="Payroll Dashboard"
        description="Manage employee payroll and compensation"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={FileEditIcon} className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm">
              <HugeiconsIcon icon={Calculator01Icon} className="h-4 w-4 mr-2" />
              Process Payroll
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  <p className="text-sm text-green-600 mt-1">{card.change}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                  <HugeiconsIcon icon={card.icon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50">
                    <HugeiconsIcon icon={action.icon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Payroll Periods */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Payroll Periods</h2>
          <AdvancedDataTable
            data={payrollPeriods}
            columns={periodColumns}
            pagination={{
              current: 1,
              pageSize: 10,
              total: payrollPeriods.length,
              onChange: () => { }
            }}
          />
        </div>
      </div>
    </TwoLevelLayout>
  )
}