'use client'

import { useState, useEffect } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search01Icon,
  Building01Icon,
  Dollar01Icon,
  Calendar01Icon,
  MoreHorizontalIcon,
  Package01Icon,
  ChartDecreaseIcon,
  AlertCircleIcon,
  Location01Icon,
  UserIcon,
  Settings01Icon,
  Tag01Icon,
  PackageSearchIcon,
  PackageAddIcon,
  MoneyExchange03Icon,
  StackStarIcon,
  Download01Icon,
  PlusSignIcon,
  Clock01Icon,
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { fixedAssetService, type FixedAsset as APIFixedAsset } from '@/services/accounting'
import { apiClient } from '@/lib/api'

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
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [maintenanceOpen, setMaintenanceOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [depSchedule, setDepSchedule] = useState<Record<string, any[]>>({})
  const [depLoading, setDepLoading] = useState(false)

  // Add asset form state
  const [formData, setFormData] = useState({
    asset_name: '',
    description: '',
    category: 'EQUIPMENT',
    acquisition_date: '',
    cost: '',
    salvage_value: '',
    useful_life: '',
    depreciation_method: 'STRAIGHT_LINE',
    current_location: '',
    serial_number: '',
    status: 'ACTIVE',
  })

  const resetForm = () => {
    setFormData({
      asset_name: '',
      description: '',
      category: 'EQUIPMENT',
      acquisition_date: '',
      cost: '',
      salvage_value: '',
      useful_life: '',
      depreciation_method: 'STRAIGHT_LINE',
      current_location: '',
      serial_number: '',
      status: 'ACTIVE',
    })
  }

  const openDrawer = (asset: FixedAsset) => {
    setSelectedAsset(asset)
    setDrawerOpen(true)
  }

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

  async function handleCreateAsset() {
    try {
      setSubmitting(true)
      const payload = {
        company_id: apiClient.getCompanyId() || '',
        asset_name: formData.asset_name,
        description: formData.description,
        category: formData.category,
        acquisition_date: formData.acquisition_date
          ? new Date(formData.acquisition_date + 'T00:00:00Z').toISOString()
          : undefined,
        cost: parseFloat(formData.cost) || 0,
        salvage_value: parseFloat(formData.salvage_value) || 0,
        useful_life: parseInt(formData.useful_life) || 1,
        depreciation_method: formData.depreciation_method,
        current_location: formData.current_location,
        serial_number: formData.serial_number,
        status: formData.status,
      }
      await fixedAssetService.create(payload)
      setAddDialogOpen(false)
      resetForm()
      loadAssets()
    } catch (err) {
      console.error('Failed to create asset:', err)
      alert('Failed to create asset. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleExport() {
    const headers = ['Asset Code', 'Asset Name', 'Category', 'Location', 'Status', 'Condition', 'Purchase Date', 'Purchase Cost', 'Book Value', 'Accumulated Depreciation', 'Salvage Value', 'Useful Life (Years)', 'Depreciation Method', 'Serial Number']
    const rows = filteredAssets.map(a => [
      a.asset_code,
      a.asset_name,
      getCategoryLabel(a.category),
      a.location,
      a.status,
      a.condition,
      a.purchase_date,
      a.purchase_cost,
      a.current_book_value,
      a.accumulated_depreciation,
      a.salvage_value,
      a.useful_life_years,
      a.depreciation_method.replace(/_/g, ' '),
      a.serial_number || '',
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fixed-assets-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function openMaintenanceSchedule() {
    setMaintenanceOpen(true)
    setDepLoading(true)
    try {
      const schedules: Record<string, any[]> = {}
      const activeAssets = assets.filter(a => a.status === 'active')
      for (const asset of activeAssets.slice(0, 20)) {
        try {
          const schedule = await fixedAssetService.getDepreciationSchedule(asset.id)
          if (schedule && schedule.length > 0) {
            schedules[asset.id] = schedule
          }
        } catch {
          // Skip assets with no schedule
        }
      }
      setDepSchedule(schedules)
    } catch (err) {
      console.error('Failed to load depreciation schedules:', err)
    } finally {
      setDepLoading(false)
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
      render: (_: unknown, asset: FixedAsset) => {
        const { variant, label } = getStatusBadge(asset.status)
        return (
          <div className="space-y-1">
            <Badge variant={variant} className="text-[10px] px-1.5 py-0">{label}</Badge>
            <button
              onClick={() => openDrawer(asset)}
              className="font-mono text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline block"
            >
              {asset.asset_code}
            </button>
          </div>
        )
      }
    },
    {
      key: 'asset_name',
      title: 'Asset Name',
      render: (_: unknown, asset: FixedAsset) => (
        <div>
          <button
            onClick={() => openDrawer(asset)}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
          >
            {asset.asset_name}
          </button>
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
      key: 'condition',
      title: 'Condition',
      render: (_: unknown, asset: FixedAsset) => {
        const { variant, label } = getConditionBadge(asset.condition)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'id',
      title: '',
      render: (_: unknown, asset: FixedAsset) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openDrawer(asset)}>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Asset</DropdownMenuItem>
            <DropdownMenuItem>Export Report</DropdownMenuItem>
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
            <Button variant="outline" size="sm" onClick={openMaintenanceSchedule}>
              <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 mr-1.5" />
              Depreciation Schedule
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-1.5" />
              Export
            </Button>
            <Button onClick={() => setAddDialogOpen(true)}>
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-1.5" />
              Add Asset
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Statistics (max 4 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold">{summaryStats.totalAssets}</p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center border">
                <HugeiconsIcon icon={PackageSearchIcon} className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Purchase Value</p>
                <p className="text-2xl font-bold">
                  {mounted ? `Rp ${(summaryStats.totalValue / 1000000000).toFixed(1)}B` : ''}
                </p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center border">
                <HugeiconsIcon icon={PackageAddIcon} className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Book Value</p>
                <p className="text-2xl font-bold">
                  {mounted ? `Rp ${(summaryStats.totalBookValue / 1000000000).toFixed(1)}B` : ''}
                </p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center border">
                <HugeiconsIcon icon={MoneyExchange03Icon} className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Assets</p>
                <p className="text-2xl font-bold">{summaryStats.criticalAssets}</p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center border">
                <HugeiconsIcon icon={StackStarIcon} className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="building">Building</SelectItem>
                <SelectItem value="machinery">Machinery</SelectItem>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="computer">Computer</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Condition</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground">
              {filteredAssets.length} of {assets.length} items
            </div>
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

        {/* Content */}
        <div className="border rounded-sm">
          <AdvancedDataTable
            data={filteredAssets}
            columns={columns}
            loading={loading}
          />
        </div>

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

      {/* Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
          {selectedAsset && (() => {
            const asset = selectedAsset
            const depRate = asset.purchase_cost > 0 ? (asset.accumulated_depreciation / asset.purchase_cost) * 100 : 0
            const { variant: statusVariant, label: statusLabel } = getStatusBadge(asset.status)
            const { variant: condVariant, label: condLabel } = getConditionBadge(asset.condition)
            const remaining = Math.max(asset.purchase_cost - asset.accumulated_depreciation - asset.salvage_value, 0)
            const yearsRemaining = asset.annual_depreciation > 0 ? (remaining / asset.annual_depreciation).toFixed(1) : '0'

            return (
              <>
                <SheetHeader>
                  <SheetTitle className="text-lg">{asset.asset_name}</SheetTitle>
                  <SheetDescription>{asset.description || 'Fixed asset details'}</SheetDescription>
                </SheetHeader>

                <div className="space-y-6 px-4 pb-6">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono">{asset.asset_code}</Badge>
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                    <Badge variant={condVariant}>{condLabel}</Badge>
                  </div>

                  {/* Value Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-sm p-3">
                      <p className="text-sm text-muted-foreground">Purchase Cost</p>
                      <p className="text-lg font-bold">{mounted ? formatCurrency(asset.purchase_cost) : ''}</p>
                    </div>
                    <div className="bg-muted/50 rounded-sm p-3">
                      <p className="text-sm text-muted-foreground">Book Value</p>
                      <p className="text-lg font-bold">{mounted ? formatCurrency(asset.current_book_value) : ''}</p>
                    </div>
                    <div className="bg-muted/50 rounded-sm p-3">
                      <p className="text-sm text-muted-foreground">Salvage Value</p>
                      <p className="text-lg font-bold">{mounted ? formatCurrency(asset.salvage_value) : ''}</p>
                    </div>
                    <div className="bg-muted/50 rounded-sm p-3">
                      <p className="text-sm text-muted-foreground">Annual Depr.</p>
                      <p className="text-lg font-bold">{mounted ? formatCurrency(asset.annual_depreciation) : ''}</p>
                    </div>
                  </div>

                  {/* Depreciation Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Depreciation Progress</span>
                      <span className="font-medium">{mounted ? `${depRate.toFixed(1)}%` : ''}</span>
                    </div>
                    <Progress value={Math.min(depRate, 100)} className="h-2.5" />
                    <p className="text-sm text-muted-foreground">
                      {mounted ? formatCurrency(asset.accumulated_depreciation) : ''} accumulated
                      {' · '}{yearsRemaining} years remaining
                    </p>
                  </div>

                  {/* Details */}
                  <div className="border rounded-sm">
                    <div className="px-4 py-3 border-b bg-muted/30">
                      <h4 className="text-sm font-semibold">Details</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">General information about this asset</p>
                    </div>
                    <div className="px-4 py-2 divide-y">
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <HugeiconsIcon icon={Tag01Icon} className="h-4 w-4" />
                          Category
                        </span>
                        <span className="text-sm font-medium capitalize">{getCategoryLabel(asset.category)}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <HugeiconsIcon icon={Location01Icon} className="h-4 w-4" />
                          Location
                        </span>
                        <span className="text-sm font-medium">{asset.location || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4" />
                          Depreciation Method
                        </span>
                        <span className="text-sm font-medium capitalize">{asset.depreciation_method.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
                          Useful Life
                        </span>
                        <span className="text-sm font-medium">{asset.useful_life_years} years</span>
                      </div>
                      {asset.serial_number && (
                        <div className="flex items-center justify-between py-2.5">
                          <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <HugeiconsIcon icon={Package01Icon} className="h-4 w-4" />
                            Serial Number
                          </span>
                          <span className="text-sm font-medium font-mono">{asset.serial_number}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <HugeiconsIcon icon={Dollar01Icon} className="h-4 w-4" />
                          Purchase Date
                        </span>
                        <span className="text-sm font-medium">{mounted ? formatDate(asset.purchase_date) : ''}</span>
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
                        <span className="text-sm">{mounted ? formatDate(asset.created_at) : ''}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
                          Updated
                        </span>
                        <span className="text-sm">{mounted ? formatDate(asset.updated_at) : ''}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )
          })()}
        </SheetContent>
      </Sheet>
      {/* Add Asset Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Fixed Asset</DialogTitle>
            <DialogDescription>Register a new fixed asset to the system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="asset_name">Asset Name *</Label>
              <Input
                id="asset_name"
                placeholder="e.g. Office Laptop Dell XPS"
                value={formData.asset_name}
                onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the asset"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUILDING">Building</SelectItem>
                    <SelectItem value="MACHINERY">Machinery</SelectItem>
                    <SelectItem value="VEHICLE">Vehicle</SelectItem>
                    <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                    <SelectItem value="COMPUTER">Computer</SelectItem>
                    <SelectItem value="FURNITURE">Furniture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="acquisition_date">Acquisition Date *</Label>
                <Input
                  id="acquisition_date"
                  type="date"
                  value={formData.acquisition_date}
                  onChange={(e) => setFormData({ ...formData, acquisition_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Cost (Rp) *</Label>
                <Input
                  id="cost"
                  type="number"
                  placeholder="0"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salvage_value">Salvage Value (Rp)</Label>
                <Input
                  id="salvage_value"
                  type="number"
                  placeholder="0"
                  value={formData.salvage_value}
                  onChange={(e) => setFormData({ ...formData, salvage_value: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="useful_life">Useful Life (Years) *</Label>
                <Input
                  id="useful_life"
                  type="number"
                  placeholder="5"
                  value={formData.useful_life}
                  onChange={(e) => setFormData({ ...formData, useful_life: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depreciation_method">Depreciation Method</Label>
                <Select value={formData.depreciation_method} onValueChange={(v) => setFormData({ ...formData, depreciation_method: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STRAIGHT_LINE">Straight Line</SelectItem>
                    <SelectItem value="DECLINING_BALANCE">Declining Balance</SelectItem>
                    <SelectItem value="UNITS_OF_PRODUCTION">Units of Production</SelectItem>
                    <SelectItem value="SUM_OF_YEARS_DIGITS">Sum of Years Digits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_location">Location</Label>
                <Input
                  id="current_location"
                  placeholder="e.g. Head Office"
                  value={formData.current_location}
                  onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input
                  id="serial_number"
                  placeholder="e.g. SN-12345"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setAddDialogOpen(false); resetForm() }}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateAsset}
                disabled={submitting || !formData.asset_name || !formData.acquisition_date || !formData.cost}
              >
                {submitting ? 'Creating...' : 'Create Asset'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Depreciation Schedule Sheet */}
      <Sheet open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
        <SheetContent side="right" className="sm:max-w-2xl w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg">Depreciation Schedule</SheetTitle>
            <SheetDescription>Depreciation overview for active fixed assets</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            {depLoading ? (
              <div className="py-12 text-center text-muted-foreground">Loading depreciation data...</div>
            ) : assets.filter(a => a.status === 'active').length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">No active assets found.</div>
            ) : (
              assets.filter(a => a.status === 'active').map((asset) => {
                const depRate = asset.purchase_cost > 0 ? (asset.accumulated_depreciation / asset.purchase_cost) * 100 : 0
                const remaining = Math.max(asset.purchase_cost - asset.accumulated_depreciation - asset.salvage_value, 0)
                const yearsLeft = asset.annual_depreciation > 0 ? (remaining / asset.annual_depreciation).toFixed(1) : '0'
                const schedule = depSchedule[asset.id]

                return (
                  <div key={asset.id} className="border rounded-sm">
                    <div className="px-4 py-3 border-b bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold">{asset.asset_name}</h4>
                          <p className="text-xs text-muted-foreground font-mono">{asset.asset_code}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">{asset.depreciation_method.replace(/_/g, ' ')}</Badge>
                      </div>
                    </div>
                    <div className="px-4 py-3 space-y-3">
                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Cost</p>
                          <p className="font-medium">{mounted ? formatCurrency(asset.purchase_cost) : ''}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Accumulated</p>
                          <p className="font-medium">{mounted ? formatCurrency(asset.accumulated_depreciation) : ''}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Book Value</p>
                          <p className="font-medium">{mounted ? formatCurrency(asset.current_book_value) : ''}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Annual Depr.</p>
                          <p className="font-medium">{mounted ? formatCurrency(asset.annual_depreciation) : ''}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{depRate.toFixed(1)}% depreciated</span>
                          <span className="text-muted-foreground">{yearsLeft} years remaining</span>
                        </div>
                        <Progress value={Math.min(depRate, 100)} className="h-2" />
                      </div>
                      {schedule && schedule.length > 0 && (
                        <div className="border-t pt-2">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Schedule History</p>
                          <div className="space-y-1">
                            {schedule.slice(0, 5).map((entry: any, i: number) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{mounted ? formatDate(entry.period_start || entry.date) : ''}</span>
                                <span>{mounted ? formatCurrency(entry.depreciation_amount || entry.amount) : ''}</span>
                                <span className="text-muted-foreground">BV: {mounted ? formatCurrency(entry.book_value_after || entry.book_value) : ''}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </SheetContent>
      </Sheet>
    </TwoLevelLayout>
  )
}