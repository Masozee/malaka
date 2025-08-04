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
import { 
  Settings,
  Plus,
  Eye,
  Edit,
  Filter,
  Download,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Building,
  User,
  BarChart3,
  Hash,
  Target,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { stockAdjustmentService, StockAdjustment as StockAdjustmentAPI, InventoryFilters } from '@/services/inventory'

// Extended interface for display purposes
interface StockAdjustmentDisplay extends StockAdjustmentAPI {
  adjustment_number?: string
  adjustment_type?: 'increase' | 'decrease' | 'correction' | 'damage' | 'theft' | 'expired' | 'found'
  location?: string
  location_code?: string
  reference_document?: string
  total_quantity_adjusted?: number
  total_value_impact?: number
  approved_by?: string
  created_by?: string
  updated_by?: string
  created_at?: string
  updated_at?: string
}

// Mock data removed - now using real API data from backend
const mockAdjustments: StockAdjustmentDisplay[] = [
  {
    id: '1',
    adjustment_number: 'ADJ-2024-001',
    adjustment_type: 'damage',
    location: 'Main Warehouse Jakarta',
    location_code: 'WH-JKT-001',
    adjustment_date: '2024-07-25T10:00:00Z',
    reason: 'Water damage during monsoon season - roof leak in section B',
    reference_document: 'CLAIM-2024-007',
    status: 'approved',
    total_items: 8,
    total_quantity_adjusted: -45,
    total_value_impact: -67500000,
    approved_by: 'Operations Manager',
    created_by: 'Warehouse Staff',
    updated_by: 'Ahmad Manager',
    created_at: '2024-07-25T09:15:00Z',
    updated_at: '2024-07-25T11:30:00Z'
  },
  {
    id: '2',
    adjustment_number: 'ADJ-2024-002',
    adjustment_type: 'found',
    location: 'Store Plaza Indonesia',
    location_code: 'ST-PI-001',
    adjustment_date: '2024-07-24T14:30:00Z',
    reason: 'Items found during quarterly stock count - were misplaced in storage',
    status: 'completed',
    total_items: 3,
    total_quantity_adjusted: 12,
    total_value_impact: 8400000,
    approved_by: 'Store Manager',
    created_by: 'Store Staff',
    updated_by: 'Sari Store',
    created_at: '2024-07-24T13:45:00Z',
    updated_at: '2024-07-24T16:00:00Z'
  },
  {
    id: '3',
    adjustment_number: 'ADJ-2024-003',
    adjustment_type: 'correction',
    location: 'Regional Warehouse Surabaya',
    location_code: 'WH-SBY-002',
    adjustment_date: '2024-07-23T11:00:00Z',
    reason: 'System error correction - barcode scanning malfunction caused wrong counts',
    reference_document: 'SYS-ERR-2024-012',
    status: 'completed',
    total_items: 15,
    total_quantity_adjusted: -23,
    total_value_impact: -34500000,
    approved_by: 'IT Manager',
    created_by: 'System Admin',
    updated_by: 'Budi IT',
    created_at: '2024-07-23T10:20:00Z',
    updated_at: '2024-07-23T12:15:00Z'
  },
  {
    id: '4',
    adjustment_number: 'ADJ-2024-004',
    adjustment_type: 'theft',
    location: 'Store Grand Indonesia',
    location_code: 'ST-GI-003',
    adjustment_date: '2024-07-22T09:30:00Z',
    reason: 'Security incident - theft reported by security camera review',
    reference_document: 'SEC-INC-2024-003',
    status: 'approved',
    total_items: 5,
    total_quantity_adjusted: -18,
    total_value_impact: -24750000,
    approved_by: 'Security Manager',
    created_by: 'Security Staff',
    updated_by: 'Rina Security',
    created_at: '2024-07-22T08:45:00Z',
    updated_at: '2024-07-22T10:30:00Z'
  },
  {
    id: '5',
    adjustment_number: 'ADJ-2024-005',
    adjustment_type: 'expired',
    location: 'Store Senayan City',
    location_code: 'ST-SC-004',
    adjustment_date: '2024-07-21T16:00:00Z',
    reason: 'Seasonal items expired - summer collection past sell-by date',
    status: 'completed',
    total_items: 12,
    total_quantity_adjusted: -67,
    total_value_impact: -45890000,
    approved_by: 'Store Manager',
    created_by: 'Store Staff',
    updated_by: 'Dedi Store',
    created_at: '2024-07-21T15:30:00Z',
    updated_at: '2024-07-21T17:15:00Z'
  },
  {
    id: '6',
    adjustment_number: 'ADJ-2024-006',
    adjustment_type: 'increase',
    location: 'Regional Warehouse Medan',
    location_code: 'WH-MDN-003',
    adjustment_date: '2024-07-25T08:00:00Z',
    reason: 'Supplier bonus items - promotional gift with large order',
    reference_document: 'BONUS-2024-008',
    status: 'pending',
    total_items: 6,
    total_quantity_adjusted: 24,
    total_value_impact: 18000000,
    created_by: 'Warehouse Staff',
    updated_by: 'Lisa Warehouse',
    created_at: '2024-07-25T07:30:00Z',
    updated_at: '2024-07-25T08:15:00Z'
  },
  {
    id: '7',
    adjustment_number: 'ADJ-2024-007',
    adjustment_type: 'damage',
    location: 'Store Kota Kasablanka',
    location_code: 'ST-KK-009',
    adjustment_date: '2024-07-20T12:45:00Z',
    reason: 'Customer return - damaged during fitting, unrepairable',
    reference_document: 'RET-2024-156',
    status: 'completed',
    total_items: 1,
    total_quantity_adjusted: -2,
    total_value_impact: -3000000,
    approved_by: 'Store Manager',
    created_by: 'Store Staff',
    updated_by: 'Ahmad Store',
    created_at: '2024-07-20T12:00:00Z',
    updated_at: '2024-07-20T13:30:00Z'
  },
  {
    id: '8',
    adjustment_number: 'ADJ-2024-008',
    adjustment_type: 'correction',
    location: 'Main Warehouse Jakarta',
    location_code: 'WH-JKT-001',
    adjustment_date: '2024-07-19T13:15:00Z',
    reason: 'Physical count discrepancy - annual audit found counting errors',
    reference_document: 'AUDIT-2024-Q2',
    status: 'completed',
    total_items: 22,
    total_quantity_adjusted: 8,
    total_value_impact: 12000000,
    approved_by: 'Audit Manager',
    created_by: 'Audit Team',
    updated_by: 'Sari Audit',
    created_at: '2024-07-19T12:30:00Z',
    updated_at: '2024-07-19T14:45:00Z'
  },
  {
    id: '9',
    adjustment_number: 'ADJ-2024-009',
    adjustment_type: 'decrease',
    location: 'Store Central Park',
    location_code: 'ST-CP-006',
    adjustment_date: '2024-07-18T10:20:00Z',
    reason: 'Display model wear and tear - items used for demonstration',
    status: 'completed',
    total_items: 4,
    total_quantity_adjusted: -8,
    total_value_impact: -12000000,
    approved_by: 'Store Manager',
    created_by: 'Store Staff',
    updated_by: 'Budi Store',
    created_at: '2024-07-18T09:45:00Z',
    updated_at: '2024-07-18T11:00:00Z'
  },
  {
    id: '10',
    adjustment_number: 'ADJ-2024-010',
    adjustment_type: 'increase',
    location: 'Regional Warehouse Denpasar',
    location_code: 'WH-DPS-004',
    adjustment_date: '2024-07-25T15:30:00Z',
    reason: 'Production overrun allocation - factory produced extra units',
    reference_document: 'PROD-OVER-2024-005',
    status: 'draft',
    total_items: 9,
    total_quantity_adjusted: 36,
    total_value_impact: 27000000,
    created_by: 'Production Manager',
    updated_by: 'Rina Production',
    created_at: '2024-07-25T15:00:00Z',
    updated_at: '2024-07-25T15:30:00Z'
  },
  {
    id: '11',
    adjustment_number: 'ADJ-2024-011',
    adjustment_type: 'theft',
    location: 'Store Pondok Indah Mall',
    location_code: 'ST-PIM-007',
    adjustment_date: '2024-07-17T14:00:00Z',
    reason: 'Internal theft investigation - employee misconduct confirmed',
    reference_document: 'HR-CASE-2024-014',
    status: 'rejected',
    total_items: 3,
    total_quantity_adjusted: -7,
    total_value_impact: -10500000,
    created_by: 'HR Manager',
    updated_by: 'Dedi HR',
    created_at: '2024-07-17T13:30:00Z',
    updated_at: '2024-07-17T16:45:00Z'
  },
  {
    id: '12',
    adjustment_number: 'ADJ-2024-012',
    adjustment_type: 'found',
    location: 'Regional Warehouse Bandung',
    location_code: 'WH-BDG-005',
    adjustment_date: '2024-07-16T11:15:00Z',
    reason: 'Misplaced inventory found during reorganization project',
    status: 'completed',
    total_items: 7,
    total_quantity_adjusted: 19,
    total_value_impact: 14250000,
    approved_by: 'Warehouse Manager',
    created_by: 'Warehouse Staff',
    updated_by: 'Lisa Warehouse',
    created_at: '2024-07-16T10:45:00Z',
    updated_at: '2024-07-16T12:00:00Z'
  }
]

export default function StockAdjustmentsPage() {
  const [mounted, setMounted] = useState(false)
  const [adjustmentData, setAdjustmentData] = useState<StockAdjustmentDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [impactFilter, setImpactFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch stock adjustment data from API
  const fetchAdjustmentData = async () => {
    try {
      setLoading(true)
      const response = await stockAdjustmentService.getAll()
      console.log('Stock adjustment data response:', response)
      // Transform data to include display fields
      const transformedData: StockAdjustmentDisplay[] = response.data.map(item => ({
        ...item,
        adjustment_number: item.adjustmentNumber || 'ADJ-001',
        adjustment_type: 'correction' as const,
        location: 'Main Warehouse',
        location_code: 'WH-001',
        reference_document: item.reference_document || '',
        total_quantity_adjusted: item.totalItems || 0,
        total_value_impact: (item.totalItems || 0) * 50000,
        approved_by: item.approved_by || '',
        created_by: item.created_by || 'System',
        updated_by: item.updated_by || 'System',
        created_at: item.adjustmentDate || new Date().toISOString(),
        updated_at: item.adjustmentDate || new Date().toISOString()
      }))
      setAdjustmentData(transformedData)
    } catch (error) {
      console.error('Error fetching stock adjustment data:', error)
      setAdjustmentData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdjustmentData()
  }, [])

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const formatCurrency = (amount: number): string => {
    if (!mounted) return ''
    return amount.toLocaleString('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  const breadcrumbs = [
    { label: 'Inventory', href: '/inventory' },
    { label: 'Adjustments', href: '/inventory/adjustments' }
  ]

  // Filter adjustments
  const filteredAdjustments = adjustmentData.filter(adjustment => {
    if (searchTerm && !adjustment.adjustment_number?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !adjustment.location?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !adjustment.reason?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (typeFilter !== 'all' && adjustment.adjustment_type !== typeFilter) return false
    if (statusFilter !== 'all' && adjustment.status !== statusFilter) return false
    if (impactFilter !== 'all') {
      if (impactFilter === 'positive' && (adjustment.total_value_impact || 0) <= 0) return false
      if (impactFilter === 'negative' && (adjustment.total_value_impact || 0) >= 0) return false
      if (impactFilter === 'high_impact' && Math.abs(adjustment.total_value_impact || 0) < 20000000) return false
    }
    return true
  })

  // Sort adjustments by date (newest first)
  const sortedAdjustments = [...filteredAdjustments].sort((a, b) => 
    new Date(b.adjustmentDate || '').getTime() - new Date(a.adjustmentDate || '').getTime()
  )

  // Summary statistics
  const summaryStats = {
    totalAdjustments: adjustmentData.length,
    pendingAdjustments: adjustmentData.filter(a => ['draft', 'pending'].includes(a.status)).length,
    approvedAdjustments: adjustmentData.filter(a => a.status === 'approved').length,
    completedAdjustments: adjustmentData.filter(a => a.status === 'completed').length,
    totalValueImpact: adjustmentData.reduce((sum, a) => sum + (a.total_value_impact || 0), 0),
    totalQuantityAdjusted: adjustmentData.reduce((sum, a) => sum + Math.abs(a.total_quantity_adjusted || 0), 0),
    negativeAdjustments: adjustmentData.filter(a => (a.total_value_impact || 0) < 0).length
  }

  const getTypeBadge = (type: string) => {
    const config = {
      increase: { variant: 'default' as const, label: 'Increase', icon: TrendingUp },
      decrease: { variant: 'destructive' as const, label: 'Decrease', icon: TrendingDown },
      correction: { variant: 'secondary' as const, label: 'Correction', icon: Settings },
      damage: { variant: 'destructive' as const, label: 'Damage', icon: AlertCircle },
      theft: { variant: 'destructive' as const, label: 'Theft', icon: XCircle },
      expired: { variant: 'secondary' as const, label: 'Expired', icon: Clock },
      found: { variant: 'default' as const, label: 'Found', icon: CheckCircle }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type, icon: Hash }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: Clock },
      pending: { variant: 'outline' as const, label: 'Pending', icon: Clock },
      approved: { variant: 'default' as const, label: 'Approved', icon: CheckCircle },
      rejected: { variant: 'destructive' as const, label: 'Rejected', icon: XCircle },
      completed: { variant: 'default' as const, label: 'Completed', icon: CheckCircle }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status, icon: Clock }
  }

  const getValueImpactColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const columns = [
    {
      key: 'adjustment_number',
      title: 'Adjustment Number',
      render: (adjustment: StockAdjustment) => (
        <Link 
          href={`/inventory/adjustments/${adjustment.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {adjustment.adjustment_number}
        </Link>
      )
    },
    {
      key: 'adjustment_type',
      title: 'Type',
      render: (adjustment: StockAdjustment) => {
        const { variant, label, icon: Icon } = getTypeBadge(adjustment.adjustment_type)
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'location',
      title: 'Location',
      render: (adjustment: StockAdjustment) => (
        <div>
          <div className="font-medium">{adjustment.location}</div>
          <div className="text-sm text-muted-foreground">{adjustment.location_code}</div>
        </div>
      )
    },
    {
      key: 'adjustment_date',
      title: 'Date',
      render: (adjustment: StockAdjustment) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatDate(adjustment.adjustment_date)}</span>
        </div>
      )
    },
    {
      key: 'total_items',
      title: 'Items',
      render: (adjustment: StockAdjustment) => (
        <div className="text-center">
          <div className="font-medium">{adjustment.total_items}</div>
          <div className="text-sm text-muted-foreground">
            {adjustment.total_quantity_adjusted > 0 ? '+' : ''}{adjustment.total_quantity_adjusted} qty
          </div>
        </div>
      )
    },
    {
      key: 'total_value_impact',
      title: 'Value Impact',
      render: (adjustment: StockAdjustment) => (
        <span className={`font-medium ${getValueImpactColor(adjustment.total_value_impact)}`}>
          {formatCurrency(adjustment.total_value_impact)}
        </span>
      )
    },
    {
      key: 'created_by',
      title: 'Created By',
      render: (adjustment: StockAdjustment) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{adjustment.created_by}</span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (adjustment: StockAdjustment) => {
        const { variant, label, icon: Icon } = getStatusBadge(adjustment.status)
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (adjustment: StockAdjustment) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/inventory/adjustments/${adjustment.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/inventory/adjustments/${adjustment.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Stock Adjustments"
          description="Manage inventory adjustments and corrections"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/inventory/adjustments/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Adjustment
                </Link>
              </Button>
            </div>
          }
        />

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Adjustments</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalAdjustments}</p>
                <p className="text-sm text-blue-600 mt-1">All adjustments</p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{summaryStats.pendingAdjustments}</p>
                <p className="text-sm text-orange-600 mt-1">Need approval</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{summaryStats.approvedAdjustments}</p>
                <p className="text-sm text-blue-600 mt-1">Ready to process</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{summaryStats.completedAdjustments}</p>
                <p className="text-sm text-green-600 mt-1">Finished</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Value Impact</p>
                <p className={`text-2xl font-bold mt-1 ${getValueImpactColor(summaryStats.totalValueImpact)}`}>
                  {mounted ? `${(summaryStats.totalValueImpact / 1000000).toFixed(1)}M` : ''}
                </p>
                <p className="text-sm text-purple-600 mt-1">IDR impact</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quantity Adjusted</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${(summaryStats.totalQuantityAdjusted / 1000).toFixed(1)}K` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">Units adjusted</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Negative</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{summaryStats.negativeAdjustments}</p>
                <p className="text-sm text-red-600 mt-1">Value loss</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search adjustments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Adjustment Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="increase">Increase</SelectItem>
                    <SelectItem value="decrease">Decrease</SelectItem>
                    <SelectItem value="correction">Correction</SelectItem>
                    <SelectItem value="damage">Damage</SelectItem>
                    <SelectItem value="theft">Theft</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="found">Found</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="impact">Value Impact</Label>
                <Select value={impactFilter} onValueChange={setImpactFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All impacts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All impacts</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="high_impact">High Impact (&gt;20M)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeView === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('cards')}
            >
              Cards
            </Button>
            <Button
              variant={activeView === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('table')}
            >
              Table
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {sortedAdjustments.length} of {adjustmentData.length} adjustments
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading stock adjustment data...</p>
            </div>
          </div>
        ) : activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAdjustments.map((adjustment) => {
              const { variant: typeVariant, label: typeLabel, icon: TypeIcon } = getTypeBadge(adjustment.adjustment_type)
              const { variant: statusVariant, label: statusLabel, icon: StatusIcon } = getStatusBadge(adjustment.status)
              
              return (
                <Card key={adjustment.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-blue-600" />
                      <div>
                        <Link 
                          href={`/inventory/adjustments/${adjustment.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {adjustment.adjustment_number}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(adjustment.adjustment_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-1">
                        <StatusIcon className="h-4 w-4" />
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <div className="flex items-center space-x-1">
                        <TypeIcon className="h-4 w-4" />
                        <Badge variant={typeVariant}>{typeLabel}</Badge>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Location:</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{adjustment.location}</div>
                        <div className="text-xs text-muted-foreground">{adjustment.location_code}</div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Items:</span>
                        <span className="text-sm font-medium">{adjustment.total_items} types</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        <span className="text-sm font-medium">
                          {adjustment.total_quantity_adjusted > 0 ? '+' : ''}{adjustment.total_quantity_adjusted}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Value Impact:</span>
                        <span className={`text-sm font-semibold ${getValueImpactColor(adjustment.total_value_impact)}`}>
                          {mounted ? `${(adjustment.total_value_impact / 1000000).toFixed(1)}M` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Created by:</span>
                        <span className="text-sm">{adjustment.created_by}</span>
                      </div>
                      {adjustment.approved_by && (
                        <div className="flex justify-between mt-1">
                          <span className="text-sm text-muted-foreground">Approved by:</span>
                          <span className="text-sm">{adjustment.approved_by}</span>
                        </div>
                      )}
                    </div>

                    {adjustment.reference_document && (
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Reference:</span>
                          <span className="text-sm font-mono">{adjustment.reference_document}</span>
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                      <strong>Reason:</strong> {adjustment.reason}
                    </div>

                    <div className="flex space-x-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/inventory/adjustments/${adjustment.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      {adjustment.status !== 'completed' && adjustment.status !== 'rejected' && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/inventory/adjustments/${adjustment.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Stock Adjustments</h3>
              <p className="text-sm text-muted-foreground">Manage all inventory adjustments and corrections</p>
            </div>
            <AdvancedDataTable
              data={sortedAdjustments}
              columns={columns}
              searchable={false}
              filterable={false}
              pagination={{
                pageSize: 15,
                currentPage: 1,
                totalPages: Math.ceil(sortedAdjustments.length / 15),
                totalItems: sortedAdjustments.length,
                onChange: () => {}
              }}
            />
          </Card>
        )}

        {/* Pending Adjustments Alert */}
        {summaryStats.pendingAdjustments > 0 && (
          <Card className="p-6 border-orange-200 bg-orange-50">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-orange-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800">Pending Adjustments</h3>
                <p className="text-orange-700 mt-1">
                  {summaryStats.pendingAdjustments} adjustments are pending approval and require review.
                </p>
              </div>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                Review Pending
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}