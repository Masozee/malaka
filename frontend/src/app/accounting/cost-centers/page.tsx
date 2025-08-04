'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable, type AdvancedColumn } from '@/components/ui/advanced-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { 
  Target,
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  BarChart3,
  DollarSign,
  TrendingUp,
  Users,
  Building,
  Search,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import type { CostCenter } from '@/types/accounting'
import { apiClient } from '@/lib/api'

export default function CostCentersPage() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchCostCenters()
  }, [])

  const fetchCostCenters = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching cost centers from /api/v1/accounting/cost-centers/')
      const response = await apiClient.get<{success: boolean, message: string, data: CostCenter[]}>('/api/v1/accounting/cost-centers/')
      
      if (response.success && Array.isArray(response.data)) {
        setCostCenters(response.data)
        console.log(`Loaded ${response.data.length} cost centers successfully`)
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

  const formatCurrency = (amount: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return 'Rp 0'
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      : <Badge variant="secondary" className="bg-red-100 text-red-800">Inactive</Badge>
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'COST': { variant: 'outline' as const, label: 'Cost Center', class: 'border-blue-200 text-blue-700' },
      'REVENUE': { variant: 'outline' as const, label: 'Revenue Center', class: 'border-green-200 text-green-700' },
      'PROFIT': { variant: 'outline' as const, label: 'Profit Center', class: 'border-purple-200 text-purple-700' }
    }
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.COST
    return <Badge variant={config.variant} className={config.class}>{config.label}</Badge>
  }

  // Filter cost centers with null safety
  const filteredCostCenters = costCenters.filter(cc => {
    if (!cc) return false
    if (searchTerm && !cc.name?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !cc.code?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && !cc.is_active) return false
      if (statusFilter === 'inactive' && cc.is_active) return false
    }
    return true
  })

  // Calculate summary stats with null safety
  const summaryStats = {
    totalCostCenters: costCenters.length,
    activeCostCenters: costCenters.filter(cc => cc?.is_active).length,
    totalBudget: costCenters.reduce((sum, cc) => sum + (cc?.budget_amount || 0), 0),
    totalActual: costCenters.reduce((sum, cc) => sum + (cc?.actual_amount || 0), 0)
  }

  const columns: AdvancedColumn<CostCenter>[] = [
    {
      key: 'code',
      title: 'Code',
      render: (_: unknown, cc: CostCenter) => (
        <div className="font-medium">{cc?.code || ''}</div>
      )
    },
    {
      key: 'name',
      title: 'Cost Center',
      render: (_: unknown, cc: CostCenter) => (
        <div>
          <div className="font-medium">{cc?.name || ''}</div>
          {cc?.description && (
            <div className="text-sm text-gray-500">{cc.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      render: (value: unknown, cc: CostCenter) => getTypeBadge(cc?.type || 'COST')
    },
    {
      key: 'manager_id',
      title: 'Manager',
      render: (_: unknown, cc: CostCenter) => (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{cc?.manager_id || 'Not assigned'}</span>
        </div>
      )
    },
    {
      key: 'budget_amount',
      title: 'Budget vs Actual',
      render: (value: unknown, cc: CostCenter) => {
        if (!mounted || !cc) return <div className="text-sm text-gray-500">Loading...</div>
        
        const budgetAmount = cc.budget_amount || 0
        const actualAmount = cc.actual_amount || 0
        const utilization = budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : 0
        
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Budget:</span>
              <span className="font-medium">{formatCurrency(budgetAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Actual:</span>
              <span className="font-medium">{formatCurrency(actualAmount)}</span>
            </div>
            <Progress value={Math.min(utilization, 100)} className="h-2" />
            <div className="text-xs text-center text-gray-500">
              {utilization.toFixed(1)}% utilized
            </div>
          </div>
        )
      }
    },
    {
      key: 'variance_amount',
      title: 'Variance',
      render: (value: unknown, cc: CostCenter) => {
        if (!mounted || !cc) return <div className="text-sm text-gray-500">Loading...</div>
        
        const variance = cc.variance_amount || 0
        const isPositive = variance > 0
        
        return (
          <div className={`text-center ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
            <div className="font-medium">
              {isPositive ? '+' : ''}{formatCurrency(Math.abs(variance))}
            </div>
            <div className="text-xs">
              {isPositive ? 'Over Budget' : 'Under Budget'}
            </div>
          </div>
        )
      }
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (value: unknown, cc: CostCenter) => getStatusBadge(cc?.is_active || false)
    },
    {
      key: 'id',
      title: 'Actions',
      render: (_: unknown, cc: CostCenter) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/accounting/cost-centers/${cc?.id || ''}`} className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/accounting/cost-centers/${cc?.id || ''}/edit`} className="flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Edit Cost Center
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Export Budget Report
            </DropdownMenuItem>
            {!cc?.is_active && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Cost Center
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  const breadcrumbs = [
    { label: 'Accounting', href: '/accounting' },
    { label: 'Cost Centers', href: '/accounting/cost-centers' }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Cost Centers"
        description="Manage cost centers and departmental budgets"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Budget Report
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button asChild>
              <Link href="/accounting/cost-centers/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Cost Center
              </Link>
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100 text-blue-700">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cost Centers</p>
                <p className="text-2xl font-bold">{summaryStats.totalCostCenters}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-green-100 text-green-700">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Centers</p>
                <p className="text-2xl font-bold">{summaryStats.activeCostCenters}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-purple-100 text-purple-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold">{mounted ? formatCurrency(summaryStats.totalBudget) : 'Rp 0'}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-orange-100 text-orange-700">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Actual Spending</p>
                <p className="text-2xl font-bold">{mounted ? formatCurrency(summaryStats.totalActual) : 'Rp 0'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">Error Loading Cost Centers</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" onClick={fetchCostCenters}>
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Filters (no outer border) */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Toggle & Sort */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {loading ? 'Loading cost centers from API...' : 
               error ? 'Error loading cost centers from API' : 
               `Loaded ${costCenters.length} cost centers from backend API`}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredCostCenters.length} of {costCenters.length} items
          </div>
        </div>

        {/* Content - Table without Card wrapper */}
        <AdvancedDataTable
          data={filteredCostCenters}
          columns={columns}
          loading={loading}
        />
      </div>
    </TwoLevelLayout>
  )
}