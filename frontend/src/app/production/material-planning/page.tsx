'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Filter, 
  Download, 
  Calendar,
  AlertTriangle,
  TrendingUp,
  Clock,
  Truck,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { mockProductionPlans } from '@/services/production'
import type { ProductionPlan, ProductionPlanFilters } from '@/types/production'

// Mock data for material requirements
const mockMaterialRequirements = [
  {
    id: '1',
    materialCode: 'LEATHER-001',
    materialName: 'Premium Leather Black',
    currentStock: 45,
    requiredQuantity: 120,
    shortfall: 75,
    unitCost: 150000,
    totalCost: 11250000,
    supplier: 'PT Bahan Baku Indonesia',
    leadTime: 7,
    status: 'shortage' as const,
    category: 'Raw Material'
  },
  {
    id: '2',
    materialCode: 'SOLE-001',
    materialName: 'Rubber Sole Premium',
    currentStock: 200,
    requiredQuantity: 150,
    shortfall: 0,
    unitCost: 85000,
    totalCost: 0,
    supplier: 'Sole & Rubber Co',
    leadTime: 5,
    status: 'sufficient' as const,
    category: 'Components'
  },
  {
    id: '3',
    materialCode: 'THREAD-001',
    materialName: 'Synthetic Thread Brown',
    currentStock: 25,
    requiredQuantity: 80,
    shortfall: 55,
    unitCost: 45000,
    totalCost: 2475000,
    supplier: 'Thread Supplies Ltd',
    leadTime: 3,
    status: 'shortage' as const,
    category: 'Consumables'
  }
]

export default function MaterialPlanningPage() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [planTypeFilter, setPlanTypeFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'plans' | 'requirements'>('plans')

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Production', href: '/production' },
    { label: 'Material Planning', href: '/production/material-planning' }
  ]

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  // Filter production plans
  const filteredPlans = (mockProductionPlans || []).filter(plan => {
    if (searchTerm && !plan?.planName?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !plan?.planNumber?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (statusFilter !== 'all' && plan?.status !== statusFilter) return false
    if (planTypeFilter !== 'all' && plan?.planType !== planTypeFilter) return false
    return true
  })

  // Filter material requirements
  const filteredRequirements = (mockMaterialRequirements || []).filter(req => {
    if (searchTerm && !req?.materialName?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !req?.materialCode?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  // Get unique values for filters
  const statuses = Array.from(new Set((mockProductionPlans || []).map(plan => plan?.status).filter(Boolean)))
  const planTypes = Array.from(new Set((mockProductionPlans || []).map(plan => plan?.planType).filter(Boolean)))

  const getStatusBadge = (status: ProductionPlan['status']) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      approved: { variant: 'outline' as const, label: 'Approved' },
      active: { variant: 'default' as const, label: 'Active' },
      completed: { variant: 'default' as const, label: 'Completed' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' }
    }
    return statusConfig[status] || { variant: 'secondary' as const, label: status }
  }

  const getMaterialStatusBadge = (status: string) => {
    const statusConfig = {
      sufficient: { variant: 'default' as const, label: 'Sufficient', color: 'text-green-600' },
      shortage: { variant: 'destructive' as const, label: 'Shortage', color: 'text-red-600' },
      critical: { variant: 'destructive' as const, label: 'Critical', color: 'text-red-700' }
    }
    return statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status, color: 'text-muted-foreground' }
  }

  // Summary statistics for plans
  const planStats = {
    total: filteredPlans.length,
    active: filteredPlans.filter(p => p?.status === 'active').length,
    completed: filteredPlans.filter(p => p?.status === 'completed').length,
    totalValue: filteredPlans.reduce((sum, plan) => sum + (plan?.totalValue || 0), 0)
  }

  // Summary statistics for materials
  const materialStats = {
    total: filteredRequirements.length,
    shortage: filteredRequirements.filter(m => m?.status === 'shortage').length,
    sufficient: filteredRequirements.filter(m => m?.status === 'sufficient').length,
    totalShortfallCost: filteredRequirements.reduce((sum, req) => sum + (req?.totalCost || 0), 0)
  }

  const planColumns = [
    {
      key: 'planNumber' as keyof ProductionPlan,
      title: 'Plan',
      render: (plan: ProductionPlan) => (
        <div>
          <div className="font-medium">{plan?.planNumber || ''}</div>
          <div className="text-sm text-muted-foreground">{plan?.planName || ''}</div>
        </div>
      )
    },
    {
      key: 'planType' as keyof ProductionPlan,
      title: 'Type',
      render: (plan: ProductionPlan) => (
        <span className="capitalize">{plan?.planType || ''}</span>
      )
    },
    {
      key: 'status' as keyof ProductionPlan,
      title: 'Status',
      render: (plan: ProductionPlan) => {
        if (!plan?.status) return ''
        const { variant, label } = getStatusBadge(plan.status)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'dates' as keyof ProductionPlan,
      title: 'Period',
      render: (plan: ProductionPlan) => (
        <div>
          <div className="text-sm">{formatDate(plan?.startDate)}</div>
          <div className="text-sm text-muted-foreground">to {formatDate(plan?.endDate)}</div>
        </div>
      )
    },
    {
      key: 'totalProducts' as keyof ProductionPlan,
      title: 'Products',
      render: (plan: ProductionPlan) => (
        <div className="text-center">
          <div className="font-medium">{plan?.totalProducts || 0}</div>
          <div className="text-sm text-muted-foreground">products</div>
        </div>
      )
    },
    {
      key: 'totalQuantity' as keyof ProductionPlan,
      title: 'Quantity',
      render: (plan: ProductionPlan) => (
        <div className="text-center">
          <div className="font-medium">{plan?.totalQuantity || 0}</div>
          <div className="text-sm text-muted-foreground">units</div>
        </div>
      )
    },
    {
      key: 'totalValue' as keyof ProductionPlan,
      title: 'Value',
      render: (plan: ProductionPlan) => (
        <div className="font-medium">{formatCurrency(plan?.totalValue)}</div>
      )
    },
    {
      key: 'actions' as keyof ProductionPlan,
      title: 'Actions',
      render: (plan: ProductionPlan) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/production/material-planning/${plan?.id || ''}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/production/material-planning/${plan?.id || ''}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const requirementColumns = [
    {
      key: 'material',
      title: 'Material',
      render: (req: typeof mockMaterialRequirements[0]) => (
        <div>
          <div className="font-medium">{req?.materialName || ''}</div>
          <div className="text-sm text-muted-foreground">{req?.materialCode || ''} • {req?.category || ''}</div>
        </div>
      )
    },
    {
      key: 'stock',
      title: 'Stock Status',
      render: (req: typeof mockMaterialRequirements[0]) => (
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm">Current: {req?.currentStock || 0}</span>
            <span className="text-sm text-muted-foreground">Required: {req?.requiredQuantity || 0}</span>
          </div>
          <Progress 
            value={req?.requiredQuantity > 0 ? ((req?.currentStock || 0) / req.requiredQuantity) * 100 : 0} 
            className="h-2" 
          />
        </div>
      )
    },
    {
      key: 'shortfall',
      title: 'Shortfall',
      render: (req: typeof mockMaterialRequirements[0]) => (
        <div>
          {(req?.shortfall || 0) > 0 ? (
            <>
              <div className="font-medium text-red-600">{req?.shortfall || 0} units</div>
              <div className="text-sm text-muted-foreground">{formatCurrency(req?.totalCost)}</div>
            </>
          ) : (
            <div className="text-green-600 font-medium">Sufficient</div>
          )}
        </div>
      )
    },
    {
      key: 'supplier',
      title: 'Supplier',
      render: (req: typeof mockMaterialRequirements[0]) => (
        <div>
          <div className="font-medium">{req?.supplier || ''}</div>
          <div className="text-sm text-muted-foreground">{req?.leadTime || 0} days lead time</div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (req: typeof mockMaterialRequirements[0]) => {
        const { variant, label } = getMaterialStatusBadge(req?.status || 'sufficient')
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (req: typeof mockMaterialRequirements[0]) => (
        <div className="flex items-center space-x-2">
          {(req?.shortfall || 0) > 0 && (
            <Button variant="outline" size="sm">
              <Truck className="h-4 w-4 mr-1" />
              Order
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Material Planning"
          description="Plan material requirements and manage production schedules"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                MRP Report
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/production/material-planning/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Plan
                </Link>
              </Button>
            </div>
          }
        />

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold mt-1">{planStats.active}</p>
                <p className="text-sm text-blue-600 mt-1">of {planStats.total} total</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Material Shortages</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{materialStats.shortage}</p>
                <p className="text-sm text-red-600 mt-1">Need attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plan Value</p>
                <p className="text-2xl font-bold mt-1">{mounted ? `Rp ${(planStats.totalValue / 1000000).toFixed(1)}M` : ''}</p>
                <p className="text-sm text-green-600 mt-1">Total production</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Purchase Required</p>
                <p className="text-2xl font-bold mt-1">{mounted ? `Rp ${(materialStats.totalShortfallCost / 1000000).toFixed(1)}M` : ''}</p>
                <p className="text-sm text-orange-600 mt-1">For shortfalls</p>
              </div>
              <Truck className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search plans or materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {activeTab === 'plans' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {mounted && statuses.map((status) => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="planType">Plan Type</Label>
                    <Select value={planTypeFilter} onValueChange={setPlanTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {mounted && planTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'plans' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('plans')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Production Plans
          </Button>
          <Button
            variant={activeTab === 'requirements' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('requirements')}
          >
            <Package className="h-4 w-4 mr-2" />
            Material Requirements
          </Button>
        </div>

        {/* Data Tables */}
        {activeTab === 'plans' && (
          <Card>
            <AdvancedDataTable
              data={filteredPlans}
              columns={planColumns}
              searchable={false}
              filterable={false}
              pagination={{
                pageSize: 10,
                currentPage: 1,
                totalPages: Math.ceil(filteredPlans.length / 10),
                totalItems: filteredPlans.length,
                onChange: () => {}
              }}
            />
          </Card>
        )}

        {activeTab === 'requirements' && (
          <Card>
            <AdvancedDataTable
              data={filteredRequirements}
              columns={requirementColumns}
              searchable={false}
              filterable={false}
              pagination={{
                pageSize: 10,
                currentPage: 1,
                totalPages: Math.ceil(filteredRequirements.length / 10),
                totalItems: filteredRequirements.length,
                onChange: () => {}
              }}
            />
          </Card>
        )}

        {/* Material Shortage Alert */}
        {materialStats.shortage > 0 && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">Material Shortage Alert</h3>
                <p className="text-red-700 mt-1">
                  {materialStats.shortage} materials are in shortage and require immediate procurement. 
                  Total purchase value needed: {formatCurrency(materialStats.totalShortfallCost)}
                </p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                <Truck className="h-4 w-4 mr-2" />
                Create Purchase Orders
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}