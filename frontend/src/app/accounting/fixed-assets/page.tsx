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
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

import Link from 'next/link'

// Fixed Asset types and interfaces
interface FixedAsset {
  id: string
  asset_code: string
  asset_name: string
  description: string
  category: 'building' | 'machinery' | 'vehicle' | 'equipment' | 'furniture' | 'computer'
  location: string
  purchase_date: string
  purchase_cost: number
  salvage_value: number
  useful_life_years: number
  depreciation_method: 'straight_line' | 'declining_balance' | 'units_of_production'
  current_book_value: number
  accumulated_depreciation: number
  annual_depreciation: number
  status: 'active' | 'disposed' | 'maintenance' | 'idle'
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
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

const mockFixedAssets: FixedAsset[] = [
  {
    id: '1',
    asset_code: 'FA-001',
    asset_name: 'Pabrik Produksi Utama',
    description: 'Gedung pabrik untuk produksi sepatu',
    category: 'building',
    location: 'Jakarta Factory',
    purchase_date: '2020-01-15',
    purchase_cost: 5000000000,
    salvage_value: 500000000,
    useful_life_years: 30,
    depreciation_method: 'straight_line',
    current_book_value: 4400000000,
    accumulated_depreciation: 600000000,
    annual_depreciation: 150000000,
    status: 'active',
    condition: 'good',
    last_maintenance_date: '2024-06-15',
    next_maintenance_date: '2024-12-15',
    vendor: 'PT Konstruksi Jakarta',
    serial_number: 'BLDG-001',
    created_by: 'admin',
    created_at: '2020-01-15T08:00:00Z',
    updated_at: '2024-07-25T10:00:00Z'
  },
  {
    id: '2',
    asset_code: 'FA-002',
    asset_name: 'Mesin Cutting Kulit',
    description: 'Mesin untuk memotong kulit sepatu',
    category: 'machinery',
    location: 'Production Floor A',
    purchase_date: '2022-03-10',
    purchase_cost: 850000000,
    salvage_value: 85000000,
    useful_life_years: 10,
    depreciation_method: 'straight_line',
    current_book_value: 689000000,
    accumulated_depreciation: 161000000,
    annual_depreciation: 76500000,
    status: 'active',
    condition: 'excellent',
    last_maintenance_date: '2024-07-01',
    next_maintenance_date: '2024-08-01',
    vendor: 'Machinery Solutions Ltd',
    serial_number: 'MCH-CUT-001',
    model: 'CutMaster 3000',
    warranty_expiry: '2025-03-10',
    created_by: 'admin',
    created_at: '2022-03-10T09:00:00Z',
    updated_at: '2024-07-25T11:00:00Z'
  },
  {
    id: '3',
    asset_code: 'FA-003',
    asset_name: 'Mesin Jahit Industrial',
    description: 'Mesin jahit untuk produksi sepatu',
    category: 'machinery',
    location: 'Production Floor B',
    purchase_date: '2021-06-20',
    purchase_cost: 450000000,
    salvage_value: 45000000,
    useful_life_years: 8,
    depreciation_method: 'straight_line',
    current_book_value: 303750000,
    accumulated_depreciation: 146250000,
    annual_depreciation: 50625000,
    status: 'maintenance',
    condition: 'good',
    last_maintenance_date: '2024-07-20',
    next_maintenance_date: '2024-08-20',
    vendor: 'Sewing Tech Indonesia',
    serial_number: 'SEW-IND-001',
    model: 'Industrial Stitch Pro',
    warranty_expiry: '2023-06-20',
    created_by: 'admin',
    created_at: '2021-06-20T10:00:00Z',
    updated_at: '2024-07-25T12:00:00Z'
  },
  {
    id: '4',
    asset_code: 'FA-004',
    asset_name: 'Truk Pengiriman',
    description: 'Truk untuk pengiriman produk',
    category: 'vehicle',
    location: 'Warehouse Parking',
    purchase_date: '2023-02-15',
    purchase_cost: 650000000,
    salvage_value: 130000000,
    useful_life_years: 8,
    depreciation_method: 'straight_line',
    current_book_value: 567500000,
    accumulated_depreciation: 82500000,
    annual_depreciation: 65000000,
    status: 'active',
    condition: 'good',
    last_maintenance_date: '2024-07-10',
    next_maintenance_date: '2024-10-10',
    vendor: 'PT Hino Motors',
    serial_number: 'TRK-001',
    model: 'Hino Dutro 130 HD',
    warranty_expiry: '2026-02-15',
    created_by: 'admin',
    created_at: '2023-02-15T08:30:00Z',
    updated_at: '2024-07-25T13:00:00Z'
  },
  {
    id: '5',
    asset_code: 'FA-005',
    asset_name: 'Komputer Kantor',
    description: 'Set komputer untuk administrasi',
    category: 'computer',
    location: 'Admin Office',
    purchase_date: '2023-08-01',
    purchase_cost: 45000000,
    salvage_value: 4500000,
    useful_life_years: 4,
    depreciation_method: 'straight_line',
    current_book_value: 35437500,
    accumulated_depreciation: 9562500,
    annual_depreciation: 10125000,
    status: 'active',
    condition: 'excellent',
    vendor: 'PT Komputer Indonesia',
    serial_number: 'PC-ADM-001',
    model: 'Dell OptiPlex 3090',
    warranty_expiry: '2026-08-01',
    created_by: 'admin',
    created_at: '2023-08-01T14:00:00Z',
    updated_at: '2024-07-25T14:00:00Z'
  },
  {
    id: '6',
    asset_code: 'FA-006',
    asset_name: 'Meja Kantor Executive',
    description: 'Set meja kantor untuk manajemen',
    category: 'furniture',
    location: 'Executive Office',
    purchase_date: '2022-11-10',
    purchase_cost: 25000000,
    salvage_value: 2500000,
    useful_life_years: 10,
    depreciation_method: 'straight_line',
    current_book_value: 21375000,
    accumulated_depreciation: 3625000,
    annual_depreciation: 2250000,
    status: 'active',
    condition: 'good',
    vendor: 'Furniture Plaza',
    serial_number: 'FURN-EXE-001',
    model: 'Executive Desk L-Shape',
    created_by: 'admin',
    created_at: '2022-11-10T09:00:00Z',
    updated_at: '2024-07-25T15:00:00Z'
  },
  {
    id: '7',
    asset_code: 'FA-007',
    asset_name: 'Conveyor Belt System',
    description: 'Sistem conveyor untuk lini produksi',
    category: 'equipment',
    location: 'Production Floor A',
    purchase_date: '2021-09-05',
    purchase_cost: 320000000,
    salvage_value: 32000000,
    useful_life_years: 12,
    depreciation_method: 'straight_line',
    current_book_value: 248000000,
    accumulated_depreciation: 72000000,
    annual_depreciation: 24000000,
    status: 'active',
    condition: 'fair',
    last_maintenance_date: '2024-06-30',
    next_maintenance_date: '2024-09-30',
    vendor: 'Conveyor Systems Ltd',
    serial_number: 'CNV-001',
    model: 'Belt Conveyor 5M',
    created_by: 'admin',
    created_at: '2021-09-05T11:00:00Z',
    updated_at: '2024-07-25T16:00:00Z'
  },
  {
    id: '8',
    asset_code: 'FA-008',
    asset_name: 'Generator Backup',
    description: 'Generator cadangan untuk listrik',
    category: 'equipment',
    location: 'Utility Room',
    purchase_date: '2020-12-01',
    purchase_cost: 180000000,
    salvage_value: 18000000,
    useful_life_years: 15,
    depreciation_method: 'straight_line',
    current_book_value: 140400000,
    accumulated_depreciation: 39600000,
    annual_depreciation: 10800000,
    status: 'idle',
    condition: 'good',
    last_maintenance_date: '2024-05-15',
    next_maintenance_date: '2024-11-15',
    vendor: 'Power Gen Indonesia',
    serial_number: 'GEN-BCK-001',
    model: 'PowerGen 500KVA',
    created_by: 'admin',
    created_at: '2020-12-01T16:00:00Z',
    updated_at: '2024-07-25T17:00:00Z'
  }
]

export default function FixedAssetsPage() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [conditionFilter, setConditionFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

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
  const filteredAssets = mockFixedAssets.filter(asset => {
    if (searchTerm && !asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !asset.asset_code.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (categoryFilter !== 'all' && asset.category !== categoryFilter) return false
    if (statusFilter !== 'all' && asset.status !== statusFilter) return false
    if (conditionFilter !== 'all' && asset.condition !== conditionFilter) return false
    return true
  })

  // Summary statistics
  const summaryStats = {
    totalAssets: mockFixedAssets.length,
    totalValue: mockFixedAssets.reduce((sum, asset) => sum + asset.purchase_cost, 0),
    totalBookValue: mockFixedAssets.reduce((sum, asset) => sum + asset.current_book_value, 0),
    totalDepreciation: mockFixedAssets.reduce((sum, asset) => sum + asset.accumulated_depreciation, 0),
    activeAssets: mockFixedAssets.filter(asset => asset.status === 'active').length,
    maintenanceAssets: mockFixedAssets.filter(asset => asset.status === 'maintenance').length,
    criticalAssets: mockFixedAssets.filter(asset => asset.condition === 'critical' || asset.condition === 'poor').length
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
            <Button variant="ghost" size="sm">
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
  const categoryStats = mockFixedAssets.reduce((acc, asset) => {
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
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32">
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
              <SelectTrigger className="w-32">
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
              <SelectTrigger className="w-32">
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
            {filteredAssets.length} of {mockFixedAssets.length} items
          </div>
        </div>

        {/* Content - Table without Card wrapper */}
        <AdvancedDataTable
          data={filteredAssets}
          columns={columns}
          loading={false}
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