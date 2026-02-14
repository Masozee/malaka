'use client'

import { useState, useEffect } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search01Icon,
  TargetIcon,
  CheckmarkCircle01Icon,
  Dollar01Icon,
  ChartIncreaseIcon,
  ChartDecreaseIcon,
  Cancel01Icon,
  UserIcon,
  Calendar01Icon,
  Building01Icon,
  PencilEdit01Icon,
  MoreHorizontalIcon,
} from '@hugeicons/core-free-icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable, type AdvancedColumn } from '@/components/ui/advanced-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

import type { CostCenter } from '@/types/accounting'
import { apiClient } from '@/lib/api'

export default function CostCentersPage() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedCC, setSelectedCC] = useState<CostCenter | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchCostCenters()
  }, [])

  const fetchCostCenters = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get<{ success: boolean; message: string; data: CostCenter[] }>(
        '/api/v1/accounting/cost-centers/'
      )
      if (response.success && Array.isArray(response.data)) {
        setCostCenters(response.data)
      } else {
        throw new Error(response.message || 'Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching cost centers:', err)
      setError(err instanceof Error ? err.message : 'Failed to load cost centers')
      setCostCenters([])
    } finally {
      setLoading(false)
    }
  }

  const openDrawer = (cc: CostCenter) => {
    setSelectedCC(cc)
    setDrawerOpen(true)
  }

  const formatCurrency = (amount: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      COST: { label: 'Cost Center', class: 'border-blue-200 text-blue-700' },
      REVENUE: { label: 'Revenue Center', class: 'border-green-200 text-green-700' },
      PROFIT: { label: 'Profit Center', class: 'border-purple-200 text-purple-700' },
    }
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.COST
    return (
      <Badge variant="outline" className={config.class}>
        {config.label}
      </Badge>
    )
  }

  // Filter
  const filteredCostCenters = costCenters.filter((cc) => {
    if (!cc) return false
    if (
      searchTerm &&
      !cc.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !cc.code?.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && !cc.is_active) return false
      if (statusFilter === 'inactive' && cc.is_active) return false
    }
    return true
  })

  // Summary stats
  const summaryStats = {
    totalCostCenters: costCenters.length,
    activeCostCenters: costCenters.filter((cc) => cc?.is_active).length,
    totalBudget: costCenters.reduce((sum, cc) => sum + (cc?.budget_amount || 0), 0),
    totalActual: costCenters.reduce((sum, cc) => sum + (cc?.actual_amount || 0), 0),
  }

  const columns: AdvancedColumn<CostCenter>[] = [
    {
      key: 'code',
      title: 'Code',
      render: (_: unknown, cc: CostCenter) => (
        <button
          onClick={() => openDrawer(cc)}
          className="font-mono font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {cc?.code || ''}
        </button>
      ),
    },
    {
      key: 'name',
      title: 'Cost Center',
      render: (_: unknown, cc: CostCenter) => (
        <div>
          <button
            onClick={() => openDrawer(cc)}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
          >
            {cc?.name || ''}
          </button>
          {cc?.description && <div className="text-xs text-gray-500">{cc.description}</div>}
        </div>
      ),
    },
    {
      key: 'type',
      title: 'Type',
      render: (_: unknown, cc: CostCenter) => getTypeBadge(cc?.type || 'COST'),
    },
    {
      key: 'manager_id',
      title: 'Manager',
      render: (_: unknown, cc: CostCenter) => (
        <span className="text-sm">{cc?.manager_id || 'Not assigned'}</span>
      ),
    },
    {
      key: 'budget_amount',
      title: 'Budget vs Actual',
      render: (_: unknown, cc: CostCenter) => {
        if (!mounted || !cc) return <div className="text-sm text-gray-500">Loading...</div>
        const budgetAmount = cc.budget_amount || 0
        const actualAmount = cc.actual_amount || 0
        const utilization = budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : 0
        return (
          <div className="space-y-1 min-w-[160px]">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-medium">{formatCurrency(budgetAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Actual:</span>
              <span className="font-medium">{formatCurrency(actualAmount)}</span>
            </div>
            <Progress value={Math.min(utilization, 100)} className="h-2" />
            <div className="text-sm text-center text-gray-500">{utilization.toFixed(1)}% utilized</div>
          </div>
        )
      },
    },
    {
      key: 'variance_amount',
      title: 'Variance',
      render: (_: unknown, cc: CostCenter) => {
        if (!mounted || !cc) return <div className="text-sm text-gray-500">Loading...</div>
        const variance = cc.variance_amount || 0
        const isOver = variance > 0
        return (
          <div className={`text-center ${isOver ? 'text-red-600' : 'text-green-600'}`}>
            <div className="font-medium text-sm">
              {isOver ? '+' : ''}
              {formatCurrency(Math.abs(variance))}
            </div>
            <div className="text-sm">{isOver ? 'Over Budget' : 'Under Budget'}</div>
          </div>
        )
      },
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (_: unknown, cc: CostCenter) => getStatusBadge(cc?.is_active || false),
    },
    {
      key: 'id',
      title: '',
      render: (_: unknown, cc: CostCenter) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openDrawer(cc)}>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Cost Center</DropdownMenuItem>
            <DropdownMenuItem>Export Budget Report</DropdownMenuItem>
            {!cc?.is_active && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">Delete Cost Center</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const breadcrumbs = [
    { label: 'Accounting', href: '/accounting' },
    { label: 'Cost Centers', href: '/accounting/cost-centers' },
  ]

  // Drawer computed values
  const drawerCC = selectedCC
  const drawerBudget = drawerCC?.budget_amount || 0
  const drawerActual = drawerCC?.actual_amount || 0
  const drawerVariance = drawerCC?.variance_amount || 0
  const drawerUtilization = drawerBudget > 0 ? (drawerActual / drawerBudget) * 100 : 0
  const drawerIsOver = drawerVariance > 0

  return (
    <TwoLevelLayout>
      <Header
        title="Cost Centers"
        description="Manage cost centers and departmental budgets"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button>Add Cost Center</Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center">
                <HugeiconsIcon icon={TargetIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost Centers</p>
                <p className="text-2xl font-bold">{summaryStats.totalCostCenters}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Centers</p>
                <p className="text-2xl font-bold">{summaryStats.activeCostCenters}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center">
                <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{mounted ? formatCurrency(summaryStats.totalBudget) : ''}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center">
                <HugeiconsIcon icon={ChartIncreaseIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actual Spending</p>
                <p className="text-2xl font-bold">{mounted ? formatCurrency(summaryStats.totalActual) : ''}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <HugeiconsIcon icon={Cancel01Icon} className="h-6 w-6 text-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">Error Loading Cost Centers</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
              <Button
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={fetchCostCenters}
              >
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                placeholder="Search cost centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              {filteredCostCenters.length} of {costCenters.length} items
            </div>
          </div>
        </div>

        {/* Table */}
        <AdvancedDataTable data={filteredCostCenters} columns={columns} loading={loading} />
      </div>

      {/* Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
          {drawerCC && (
            <>
              <SheetHeader>
                <SheetTitle className="text-lg">{drawerCC.name}</SheetTitle>
                <SheetDescription>{drawerCC.description || 'Cost center details'}</SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-4 pb-6">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {drawerCC.code}
                  </Badge>
                  {getTypeBadge(drawerCC.type || 'COST')}
                  {drawerCC.is_active ? (
                    <Badge className="bg-green-100 text-green-800">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      <HugeiconsIcon icon={Cancel01Icon} className="h-3 w-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </div>

                {/* Budget Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-sm p-3">
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="text-lg font-bold">{mounted ? formatCurrency(drawerBudget) : ''}</p>
                  </div>
                  <div className="bg-muted/50 rounded-sm p-3">
                    <p className="text-sm text-muted-foreground">Actual</p>
                    <p className="text-lg font-bold">{mounted ? formatCurrency(drawerActual) : ''}</p>
                  </div>
                  <div className={`rounded-sm p-3 ${drawerIsOver ? 'bg-red-50' : 'bg-green-50'}`}>
                    <p className="text-sm text-muted-foreground">Variance</p>
                    <p className={`text-lg font-bold ${drawerIsOver ? 'text-red-600' : 'text-green-600'}`}>
                      {mounted
                        ? `${drawerIsOver ? '+' : ''}${formatCurrency(Math.abs(drawerVariance))}`
                        : ''}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-sm p-3">
                    <p className="text-sm text-muted-foreground">Utilization</p>
                    <p className="text-lg font-bold">{mounted ? `${drawerUtilization.toFixed(1)}%` : ''}</p>
                  </div>
                </div>

                {/* Budget Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget Utilization</span>
                    <span className="font-medium">{mounted ? `${drawerUtilization.toFixed(1)}%` : ''}</span>
                  </div>
                  <Progress value={Math.min(drawerUtilization, 100)} className="h-2.5" />
                  <p
                    className={`text-sm ${drawerIsOver ? 'text-red-600' : 'text-green-600'} font-medium`}
                  >
                    {drawerIsOver ? 'Over budget' : 'Under budget'} by{' '}
                    {mounted ? formatCurrency(Math.abs(drawerVariance)) : ''}
                  </p>
                </div>

                {/* Details */}
                <div className="border rounded-sm">
                  <div className="px-4 py-3 border-b bg-muted/30">
                    <h4 className="text-sm font-semibold">Details</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">General information about this cost center</p>
                  </div>
                  <div className="px-4 py-2 divide-y">
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <HugeiconsIcon icon={Building01Icon} className="h-4 w-4" />
                        Code
                      </span>
                      <span className="text-sm font-medium font-mono">{drawerCC.code}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <HugeiconsIcon icon={TargetIcon} className="h-4 w-4" />
                        Type
                      </span>
                      <span className="text-sm font-medium">{drawerCC.type}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
                        Manager
                      </span>
                      <span className="text-sm font-medium">{drawerCC.manager_id || 'Not assigned'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <HugeiconsIcon icon={Dollar01Icon} className="h-4 w-4" />
                        Remaining
                      </span>
                      <span
                        className={`text-sm font-bold ${drawerIsOver ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {mounted ? formatCurrency(Math.max(drawerBudget - drawerActual, 0)) : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activity */}
                <div className="border rounded-sm">
                  <div className="px-4 py-3 border-b bg-muted/30">
                    <h4 className="text-sm font-semibold">Activity</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Creation and modification history</p>
                  </div>
                  <div className="px-4 py-2 divide-y">
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
                        Created
                      </span>
                      <span className="text-sm">{mounted ? formatDate(drawerCC.created_at) : ''}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
                        Updated
                      </span>
                      <span className="text-sm">{mounted ? formatDate(drawerCC.updated_at) : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </TwoLevelLayout>
  )
}
