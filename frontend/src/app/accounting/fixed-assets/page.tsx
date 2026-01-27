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
import { fixedAssetService, type FixedAsset as APIFixedAsset } from '@/services/accounting'

import Link from 'next/link'

// Fixed Asset types and interfaces (extended for UI)
interface FixedAsset {
  id: string
  asset_code: string
  asset_name: string
  description: string
  category: string
  location: string
  purchase_date: string
  purchase_cost: number
  salvage_value: number
  useful_life_years: number
  depreciation_method: string
  current_book_value: number
  accumulated_depreciation: number
  annual_depreciation: number
  status: string
  condition: string
  last_maintenance_date?: string
  next_maintenance_date?: string
  vendor: string
  warranty_expiry?: string
  serial_number?: string
  model?: string
  created_by: string
  created_at: string
  updated_at: string
}

// Transform API response to UI format
function transformAsset(apiAsset: APIFixedAsset): FixedAsset {
  const purchaseCost = apiAsset.cost || 0
  const salvageValue = apiAsset.salvage_value || 0
  const usefulLife = apiAsset.useful_life || 1
  const accumulatedDepreciation = apiAsset.accumulated_depreciation || 0
  const bookValue = apiAsset.book_value || (purchaseCost - accumulatedDepreciation)
  const annualDepreciation = usefulLife > 0 ? (purchaseCost - salvageValue) / usefulLife : 0

  // Map status from API to UI
  const statusMap: Record<string, string> = {
    'ACTIVE': 'active',
    'DISPOSED': 'disposed',
    'SOLD': 'disposed',
    'LOST': 'disposed',
    'DAMAGED': 'maintenance'
  }

  // Derive condition from book value ratio
  const valueRatio = purchaseCost > 0 ? bookValue / purchaseCost : 0
  let condition = 'good'
  if (valueRatio > 0.8) condition = 'excellent'
  else if (valueRatio > 0.5) condition = 'good'
  else if (valueRatio > 0.3) condition = 'fair'
  else if (valueRatio > 0.1) condition = 'poor'
  else condition = 'critical'

  // Map category
  const categoryMap: Record<string, string> = {
    'BUILDING': 'building',
    'MACHINERY': 'machinery',
    'VEHICLE': 'vehicle',
    'EQUIPMENT': 'equipment',
    'FURNITURE': 'furniture',
    'COMPUTER': 'computer'
  }

  return {
    id: apiAsset.id,
    asset_code: apiAsset.asset_code || '',
    asset_name: apiAsset.asset_name,
    description: apiAsset.description || '',
    category: categoryMap[apiAsset.category?.toUpperCase()] || apiAsset.category?.toLowerCase() || 'equipment',
    location: apiAsset.current_location || '',
    purchase_date: apiAsset.acquisition_date?.split('T')[0] || '',
    purchase_cost: purchaseCost,
    salvage_value: salvageValue,
    useful_life_years: usefulLife,
    depreciation_method: apiAsset.depreciation_method?.toLowerCase().replace(/_/g, '_') || 'straight_line',
    current_book_value: bookValue,
    accumulated_depreciation: accumulatedDepreciation,
    annual_depreciation: annualDepreciation,
    status: statusMap[apiAsset.status] || 'active',
    condition: condition,
    vendor: '',
    serial_number: apiAsset.serial_number || '',
    created_by: 'system',
    created_at: apiAsset.created_at,
    updated_at: apiAsset.updated_at
  }
}

export default function FixedAssetsPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assets, setAssets] = useState<FixedAsset[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [conditionFilter, setConditionFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
    loadAssets()
  }, [])

  async function loadAssets() {
    try {
      setLoading(true)
      setError(null)
      const response = await fixedAssetService.getAll()
      if (response.success && response.data) {
        const transformedAssets = response.data.map(transformAsset)
        setAssets(transformedAssets)
      }
    } catch (err) {
      console.error('Failed to load fixed assets:', err)
      setError('Failed to load fixed assets. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const breadcrumbs = [
    { label: 'Accounting', href: '/accounting' },
    { label: 'Fixed Assets', href: '/accounting/fixed-assets' }
  ]

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    if (searchTerm && !asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (categoryFilter !== 'all' && asset.category !== categoryFilter) return false
    if (statusFilter !== 'all' && asset.status !== statusFilter) return false
    if (conditionFilter !== 'all' && asset.condition !== conditionFilter) return false
    return true
  })

  // Summary statistics
  const summaryStats = {
    totalAssets: assets.length,
    totalValue: assets.reduce((sum, asset) => sum + asset.purchase_cost, 0),
    totalBookValue: assets.reduce((sum, asset) => sum + asset.current_book_value, 0),
    totalDepreciation: assets.reduce((sum, asset) => sum + asset.accumulated_depreciation, 0),
    activeAssets: assets.filter(asset => asset.status === 'active').length,
    maintenanceAssets: assets.filter(asset => asset.status === 'maintenance').length,
    criticalAssets: assets.filter(asset => asset.condition === 'critical' || asset.condition === 'poor').length
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'building': return 'Building'
      case 'machinery': return 'Machinery'
      case 'vehicle': return 'Vehicle'
      case 'computer': return 'Computer'
      case 'equipment': return 'Equipment'
      case 'furniture': return 'Furniture'
      default: return 'Other'
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      active: { variant: 'default' as const, label: 'Active' },
      disposed: { variant: 'destructive' as const, label: 'Disposed' },
      maintenance: { variant: 'secondary' as const, label: 'Maintenance' },
      idle: { variant: 'outline' as const, label: 'Idle' }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status }
  }

  const getConditionBadge = (condition: string) => {
    const config = {
      excellent: { variant: 'default' as const, label: 'Excellent', color: 'text-green-600' },
      good: { variant: 'default' as const, label: 'Good', color: 'text-blue-600' },
      fair: { variant: 'secondary' as const, label: 'Fair', color: 'text-yellow-600' },
      poor: { variant: 'destructive' as const, label: 'Poor', color: 'text-orange-600' },
      critical: { variant: 'destructive' as const, label: 'Critical', color: 'text-red-600' }
    }
    return config[condition as keyof typeof config] || { variant: 'secondary' as const, label: condition, color: 'text-gray-600' }
  }

  const getMaintenanceStatus = (asset: FixedAsset) => {
    if (!asset.next_maintenance_date) return null
    const nextDate = new Date(asset.next_maintenance_date)
    const today = new Date()
    const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 3600 * 24))

    if (daysUntil < 0) return { status: 'overdue', label: 'Overdue', color: 'text-red-600' }
    if (daysUntil <= 7) return { status: 'due_soon', label: 'Due Soon', color: 'text-orange-600' }
    if (daysUntil <= 30) return { status: 'upcoming', label: 'Upcoming', color: 'text-yellow-600' }
    return { status: 'scheduled', label: 'Scheduled', color: 'text-green-600' }
  }

  const columns: AdvancedColumn<FixedAsset>[] = [
    {
      key: 'asset_code',
      title: 'Asset Code',
      render: (_: unknown, asset: FixedAsset) => (
        <div className="font-mono text-xs font-medium">{asset.asset_code}</div>
      )
    },
    {
      key: 'asset_name',
      title: 'Asset Name',
      render: (_: unknown, asset: FixedAsset) => (
        <div>
          <div className="font-medium">{asset.asset_name}</div>
          <div className="text-xs text-muted-foreground">{asset.description}</div>
        </div>
      )
    },
    {
      key: 'category',
      title: 'Category',
      render: (_: unknown, asset: FixedAsset) => {
        return (
          <div className="flex items-center space-x-2">
            <span className="capitalize">{getCategoryLabel(asset.category)}</span>
          </div>
        )
      }
    },
    {
      key: 'location',
      title: 'Location',
      render: (_: unknown, asset: FixedAsset) => (
        <div className="text-xs">{asset.location}</div>
      )
    },
    {
      key: 'purchase_cost',
      title: 'Value',
      render: (_: unknown, asset: FixedAsset) => (
        <div className="space-y-1">
          <div className="text-xs">
            <span className="text-muted-foreground">Purchase:</span>
            <span className="font-medium ml-1">{formatCurrency(asset.purchase_cost)}</span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Current:</span>
            <span className="font-medium ml-1">{formatCurrency(asset.current_book_value)}</span>
          </div>
        </div>
      )
    },
    {
      key: 'accumulated_depreciation',
      title: 'Depreciation',
      render: (_: unknown, asset: FixedAsset) => {
        if (!mounted) return <div className="text-xs text-gray-500">Loading...</div>
        const depreciationRate = asset.purchase_cost > 0 ? (asset.accumulated_depreciation / asset.purchase_cost) * 100 : 0
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Accumulated:</span>
              <span className="font-medium">{formatCurrency(asset.accumulated_depreciation)}</span>
            </div>
            <Progress value={depreciationRate} className="h-2" />
            <div className="text-xs text-center text-muted-foreground">
              {depreciationRate.toFixed(1)}% depreciated
            </div>
          </div>
        )
      }
    },
    {
      key: 'next_maintenance_date',
      title: 'Maintenance',
      render: (_: unknown, asset: FixedAsset) => {
        if (!mounted) return <div className="text-xs text-gray-500">Loading...</div>
        const maintenanceStatus = getMaintenanceStatus(asset)
        return (
          <div>
            {asset.next_maintenance_date ? (
              <div>
                <div className="text-xs">{formatDate(asset.next_maintenance_date)}</div>
                {maintenanceStatus && (
                  <div className={`text-xs ${maintenanceStatus.color}`}>
                    {maintenanceStatus.label}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground text-xs">No schedule</span>
            )}
          </div>
        )
      }
    },
    {
      key: 'condition',
      title: 'Condition',
      render: (_: unknown, asset: FixedAsset) => {
        const { variant, label } = getConditionBadge(asset.condition)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'status',
      title: 'Status',
      render: (_: unknown, asset: FixedAsset) => {
        const { variant, label } = getStatusBadge(asset.status)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'id',
      title: 'Actions',
      render: (_: unknown, asset: FixedAsset) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" aria-label={`Actions for asset ${asset.asset_name}`}>
              ...
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/accounting/fixed-assets/${asset.id}`} className="flex items-center">
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/accounting/fixed-assets/${asset.id}/edit`} className="flex items-center">
                Edit Asset
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Schedule Maintenance
            </DropdownMenuItem>
            <DropdownMenuItem>
              Export Report
            </DropdownMenuItem>
            {asset.status !== 'disposed' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Dispose Asset
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  // Category summary
  const categoryStats = assets.reduce((acc, asset) => {
    if (!acc[asset.category]) {
      acc[asset.category] = { count: 0, value: 0, bookValue: 0 }
    }
    acc[asset.category].count += 1
    acc[asset.category].value += asset.purchase_cost
    acc[asset.category].bookValue += asset.current_book_value
    return acc
  }, {} as Record<string, { count: number, value: number, bookValue: number }>)

  return (
    <TwoLevelLayout>
      <Header
        title="Fixed Assets"
        description="Manage fixed assets, depreciation, and maintenance schedules"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Maintenance Schedule
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button asChild>
              <Link href="/accounting/fixed-assets/new">
                Add Asset
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Statistics (max 4 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold">{summaryStats.totalAssets}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
              <div>
                <p className="text-sm font-medium text-gray-600">Purchase Value</p>
                <p className="text-2xl font-bold">
                  {mounted ? `Rp ${(summaryStats.totalValue / 1000000000).toFixed(1)}B` : ''}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
              <div>
                <p className="text-sm font-medium text-gray-600">Book Value</p>
                <p className="text-2xl font-bold">
                  {mounted ? `Rp ${(summaryStats.totalBookValue / 1000000000).toFixed(1)}B` : ''}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Assets</p>
                <p className="text-2xl font-bold">{summaryStats.criticalAssets}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters (no outer border) */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-3"
                aria-label="Search assets"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32" aria-label="Filter by category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="building">Building</SelectItem>
                <SelectItem value="machinery">Machinery</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="computer">Computer</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="w-32" aria-label="Filter by condition">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All conditions</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Toggle & Sort */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Manage all fixed assets and track depreciation
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredAssets.length} of {assets.length} items
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
            <Button variant="outline" size="sm" onClick={loadAssets} className="mt-2">
              Retry
            </Button>
          </div>
        )}

        {/* Content - Table without Card wrapper */}
        <AdvancedDataTable
          data={filteredAssets}
          columns={columns}
          loading={loading}
        />

        {/* Critical Assets Alert */}
        {summaryStats.criticalAssets > 0 && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 rounded-full bg-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">Critical Assets Alert</h3>
                <p className="text-red-700 mt-1">
                  {summaryStats.criticalAssets} assets are in poor or critical condition and require immediate attention.
                </p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Schedule Maintenance
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}