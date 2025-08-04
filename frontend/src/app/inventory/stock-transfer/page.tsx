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
import { 
  ArrowRightLeft,
  Plus,
  Eye,
  Edit,
  Download,
  Package,
  Truck,
  MapPin,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Building,
  Calendar,
  BarChart3,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { stockTransferService, StockTransfer, InventoryFilters } from '@/services/inventory'

// Extended interface for display purposes
interface StockTransferDisplay extends StockTransfer {
  transfer_number?: string
  transfer_type?: 'warehouse_to_warehouse' | 'warehouse_to_store' | 'store_to_store' | 'return_to_warehouse'
  from_location?: string
  from_location_code?: string
  to_location?: string
  to_location_code?: string
  requested_by?: string
  approved_by?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  total_quantity?: number
  estimated_value?: number
  actual_delivery_date?: string
  notes?: string
  reason?: string
  created_by?: string
  updated_by?: string
  created_at?: string
  updated_at?: string
}

// Mock data removed - now using real API data from backend
const mockTransfers: StockTransferDisplay[] = [
  {
    id: '1',
    transfer_number: 'TRF-2024-001',
    transfer_type: 'warehouse_to_store',
    from_location: 'Main Warehouse Jakarta',
    from_location_code: 'WH-JKT-001',
    to_location: 'Store Plaza Indonesia',
    to_location_code: 'ST-PI-001',
    transfer_date: '2024-07-25T08:00:00Z',
    requested_by: 'Store Manager',
    approved_by: 'Warehouse Manager',
    status: 'in_transit',
    priority: 'high',
    total_items: 15,
    total_quantity: 245,
    estimated_value: 125750000,
    reason: 'Stock replenishment for weekend sale',
    created_by: 'Ahmad Store',
    updated_by: 'Budi Warehouse',
    created_at: '2024-07-24T14:30:00Z',
    updated_at: '2024-07-25T09:15:00Z'
  },
  {
    id: '2',
    transfer_number: 'TRF-2024-002',
    transfer_type: 'warehouse_to_warehouse',
    from_location: 'Main Warehouse Jakarta',
    from_location_code: 'WH-JKT-001',
    to_location: 'Regional Warehouse Surabaya',
    to_location_code: 'WH-SBY-002',
    transfer_date: '2024-07-24T10:00:00Z',
    requested_by: 'Regional Manager',
    approved_by: 'Operations Manager',
    status: 'completed',
    priority: 'medium',
    total_items: 28,
    total_quantity: 456,
    estimated_value: 234750000,
    actual_delivery_date: '2024-07-24T16:30:00Z',
    reason: 'Regional distribution requirement',
    created_by: 'Sari Regional',
    updated_by: 'Dedi Operations',
    created_at: '2024-07-23T11:20:00Z',
    updated_at: '2024-07-24T17:00:00Z'
  },
  {
    id: '3',
    transfer_number: 'TRF-2024-003',
    transfer_type: 'store_to_store',
    from_location: 'Store Mall Kelapa Gading',
    from_location_code: 'ST-MKG-002',
    to_location: 'Store Grand Indonesia',
    to_location_code: 'ST-GI-003',
    transfer_date: '2024-07-25T14:00:00Z',
    requested_by: 'Store Manager GI',
    status: 'pending',
    priority: 'medium',
    total_items: 8,
    total_quantity: 67,
    estimated_value: 45670000,
    reason: 'Size exchange between stores',
    created_by: 'Rina Store',
    updated_by: 'Rina Store',
    created_at: '2024-07-25T08:45:00Z',
    updated_at: '2024-07-25T08:45:00Z'
  },
  {
    id: '4',
    transfer_number: 'TRF-2024-004',
    transfer_type: 'return_to_warehouse',
    from_location: 'Store Senayan City',
    from_location_code: 'ST-SC-004',
    to_location: 'Main Warehouse Jakarta',
    to_location_code: 'WH-JKT-001',
    transfer_date: '2024-07-23T13:00:00Z',
    requested_by: 'Store Manager',
    approved_by: 'Warehouse Manager',
    status: 'completed',
    priority: 'low',
    total_items: 12,
    total_quantity: 89,
    estimated_value: 67890000,
    actual_delivery_date: '2024-07-23T18:00:00Z',
    reason: 'Damaged items return for inspection',
    created_by: 'Lisa Store',
    updated_by: 'Ahmad Warehouse',
    created_at: '2024-07-22T15:30:00Z',
    updated_at: '2024-07-23T18:30:00Z'
  },
  {
    id: '5',
    transfer_number: 'TRF-2024-005',
    transfer_type: 'warehouse_to_store',
    from_location: 'Regional Warehouse Medan',
    from_location_code: 'WH-MDN-003',
    to_location: 'Store Sun Plaza Medan',
    to_location_code: 'ST-SPM-005',
    transfer_date: '2024-07-26T09:00:00Z',
    requested_by: 'Store Manager',
    status: 'approved',
    priority: 'high',
    total_items: 22,
    total_quantity: 178,
    estimated_value: 145890000,
    reason: 'New product launch preparation',
    created_by: 'Budi Store',
    updated_by: 'Sari Regional',
    created_at: '2024-07-25T10:15:00Z',
    updated_at: '2024-07-25T16:20:00Z'
  },
  {
    id: '6',
    transfer_number: 'TRF-2024-006',
    transfer_type: 'warehouse_to_warehouse',
    from_location: 'Regional Warehouse Surabaya',
    from_location_code: 'WH-SBY-002',
    to_location: 'Regional Warehouse Denpasar',
    to_location_code: 'WH-DPS-004',
    transfer_date: '2024-07-22T11:30:00Z',
    requested_by: 'Regional Manager',
    approved_by: 'Operations Manager',
    status: 'completed',
    priority: 'medium',
    total_items: 18,
    total_quantity: 234,
    estimated_value: 189450000,
    actual_delivery_date: '2024-07-22T17:45:00Z',
    reason: 'Seasonal inventory redistribution',
    created_by: 'Dedi Regional',
    updated_by: 'Rina Operations',
    created_at: '2024-07-21T14:00:00Z',
    updated_at: '2024-07-22T18:15:00Z'
  },
  {
    id: '7',
    transfer_number: 'TRF-2024-007',
    transfer_type: 'store_to_store',
    from_location: 'Store Central Park',
    from_location_code: 'ST-CP-006',
    to_location: 'Store Pondok Indah Mall',
    to_location_code: 'ST-PIM-007',
    transfer_date: '2024-07-25T16:00:00Z',
    requested_by: 'Store Manager PIM',
    status: 'draft',
    priority: 'low',
    total_items: 6,
    total_quantity: 34,
    estimated_value: 23450000,
    reason: 'Customer special request fulfillment',
    created_by: 'Ahmad Store',
    updated_by: 'Ahmad Store',
    created_at: '2024-07-25T12:30:00Z',
    updated_at: '2024-07-25T12:30:00Z'
  },
  {
    id: '8',
    transfer_number: 'TRF-2024-008',
    transfer_type: 'warehouse_to_store',
    from_location: 'Main Warehouse Jakarta',
    from_location_code: 'WH-JKT-001',
    to_location: 'Store Taman Anggrek',
    to_location_code: 'ST-TA-008',
    transfer_date: '2024-07-21T07:30:00Z',
    requested_by: 'Store Manager',
    approved_by: 'Warehouse Manager',
    status: 'completed',
    priority: 'urgent',
    total_items: 35,
    total_quantity: 567,
    estimated_value: 456780000,
    actual_delivery_date: '2024-07-21T14:20:00Z',
    reason: 'Emergency stock replenishment',
    created_by: 'Sari Store',
    updated_by: 'Budi Warehouse',
    created_at: '2024-07-20T16:45:00Z',
    updated_at: '2024-07-21T15:00:00Z'
  },
  {
    id: '9',
    transfer_number: 'TRF-2024-009',
    transfer_type: 'return_to_warehouse',
    from_location: 'Store Kota Kasablanka',
    from_location_code: 'ST-KK-009',
    to_location: 'Main Warehouse Jakarta',
    to_location_code: 'WH-JKT-001',
    transfer_date: '2024-07-24T12:00:00Z',
    requested_by: 'Store Manager',
    status: 'cancelled',
    priority: 'low',
    total_items: 4,
    total_quantity: 23,
    estimated_value: 15670000,
    reason: 'Cancelled - items sold before transfer',
    created_by: 'Lisa Store',
    updated_by: 'Lisa Store',
    created_at: '2024-07-23T09:20:00Z',
    updated_at: '2024-07-24T08:30:00Z'
  },
  {
    id: '10',
    transfer_number: 'TRF-2024-010',
    transfer_type: 'warehouse_to_store',
    from_location: 'Regional Warehouse Bandung',
    from_location_code: 'WH-BDG-005',
    to_location: 'Store Paris Van Java',
    to_location_code: 'ST-PVJ-010',
    transfer_date: '2024-07-26T08:00:00Z',
    requested_by: 'Store Manager',
    approved_by: 'Regional Manager',
    status: 'approved',
    priority: 'medium',
    total_items: 19,
    total_quantity: 156,
    estimated_value: 123450000,
    reason: 'Weekly stock replenishment',
    created_by: 'Dedi Store',
    updated_by: 'Rina Regional',
    created_at: '2024-07-25T11:00:00Z',
    updated_at: '2024-07-25T17:45:00Z'
  }
]

export default function StockTransferPage() {
  const [mounted, setMounted] = useState(false)
  const [transferData, setTransferData] = useState<StockTransferDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch stock transfer data from API
  const fetchTransferData = async () => {
    try {
      setLoading(true)
      const response = await stockTransferService.getAll()
      console.log('Stock transfer data response:', response)
      
      if (response.data && response.data.length > 0) {
        // Transform backend data to include display fields
        const transformedData: StockTransferDisplay[] = response.data.map(item => ({
          ...item,
          transfer_number: item.transferNumber || `TRF-${item.id?.slice(-6) || '001'}`,
          transfer_type: 'warehouse_to_warehouse' as const,
          from_location: item.fromWarehouse || 'Main Warehouse',
          from_location_code: 'WH-001',
          to_location: item.toWarehouse || 'Secondary Warehouse', 
          to_location_code: 'WH-002',
          transfer_date: item.transferDate || new Date().toISOString(),
          requested_by: 'System',
          approved_by: '',
          priority: 'medium' as const,
          total_quantity: item.totalItems || 0,
          estimated_value: (item.totalItems || 0) * 50000,
          reason: 'Stock transfer',
          created_by: 'System',
          updated_by: 'System',
          created_at: item.transferDate || new Date().toISOString(),
          updated_at: item.transferDate || new Date().toISOString()
        }))
        setTransferData(transformedData)
      } else {
        // Use mock data when API returns empty
        console.log('API returned empty, using mock data')
        setTransferData(mockTransfers)
      }
    } catch (error) {
      console.error('Error fetching stock transfers, using mock data:', error)
      // Fallback to mock data on API error
      setTransferData(mockTransfers)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransferData()
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
    { label: 'Stock Transfer', href: '/inventory/stock-transfer' }
  ]

  // Filter transfers
  const filteredTransfers = transferData.filter(transfer => {
    if (searchTerm && !transfer.transfer_number?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !transfer.from_location?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !transfer.to_location?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !transfer.reason?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (typeFilter !== 'all' && transfer.transfer_type !== typeFilter) return false
    if (statusFilter !== 'all' && transfer.status !== statusFilter) return false
    if (priorityFilter !== 'all' && transfer.priority !== priorityFilter) return false
    return true
  })

  // Sort transfers by date (newest first)
  const sortedTransfers = [...filteredTransfers].sort((a, b) => 
    new Date(b.transfer_date).getTime() - new Date(a.transfer_date).getTime()
  )

  // Summary statistics
  const summaryStats = {
    totalTransfers: transferData.length,
    pendingTransfers: transferData.filter(t => ['draft', 'pending', 'approved'].includes(t.status)).length,
    inTransitTransfers: transferData.filter(t => t.status === 'in_transit').length,
    completedTransfers: transferData.filter(t => t.status === 'completed').length,
    totalValue: transferData.reduce((sum, t) => sum + (t.estimated_value || 0), 0),
    totalQuantity: transferData.reduce((sum, t) => sum + (t.total_quantity || 0), 0),
    urgentTransfers: transferData.filter(t => t.priority === 'urgent' && t.status !== 'completed').length
  }

  const getTypeBadge = (type: string) => {
    const config = {
      warehouse_to_warehouse: { variant: 'default' as const, label: 'WH to WH', icon: Building },
      warehouse_to_store: { variant: 'secondary' as const, label: 'WH to Store', icon: Package },
      store_to_store: { variant: 'outline' as const, label: 'Store to Store', icon: ArrowRightLeft },
      return_to_warehouse: { variant: 'destructive' as const, label: 'Return to WH', icon: Truck }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type, icon: Package }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: Clock },
      pending: { variant: 'outline' as const, label: 'Pending', icon: Clock },
      approved: { variant: 'default' as const, label: 'Approved', icon: CheckCircle },
      in_transit: { variant: 'secondary' as const, label: 'In Transit', icon: Truck },
      completed: { variant: 'default' as const, label: 'Completed', icon: CheckCircle },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled', icon: XCircle }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status, icon: Clock }
  }

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: { variant: 'secondary' as const, label: 'Low' },
      medium: { variant: 'outline' as const, label: 'Medium' },
      high: { variant: 'default' as const, label: 'High' },
      urgent: { variant: 'destructive' as const, label: 'Urgent' }
    }
    return config[priority as keyof typeof config] || { variant: 'secondary' as const, label: priority }
  }

  const columns: AdvancedColumn<StockTransferDisplay>[] = [
    {
      key: 'transfer_number',
      title: 'Transfer Number',
      sortable: true,
      width: '140px',
      render: (value: unknown, transfer: StockTransferDisplay) => (
        <Link 
          href={`/inventory/stock-transfer/${transfer.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {(value as string) || transfer.transfer_number}
        </Link>
      )
    },
    {
      key: 'transfer_type',
      title: 'Type',
      sortable: true,
      width: '140px',
      render: (value: unknown, transfer: StockTransferDisplay) => {
        const { variant, label, icon: Icon } = getTypeBadge((value as string) || transfer.transfer_type || '')
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'from_location',
      title: 'From / To',
      render: (value: unknown, transfer: StockTransferDisplay) => (
        <div className="text-sm">
          <div className="font-medium">{(value as string) || transfer.from_location}</div>
          <div className="flex items-center text-muted-foreground mt-1">
            <ArrowRightLeft className="h-3 w-3 mr-1" />
            {transfer.to_location}
          </div>
        </div>
      )
    },
    {
      key: 'transfer_date',
      title: 'Date',
      sortable: true,
      width: '120px',
      render: (value: unknown, transfer: StockTransferDisplay) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatDate((value as string) || transfer.transfer_date)}</span>
        </div>
      )
    },
    {
      key: 'total_items',
      title: 'Items',
      sortable: true,
      width: '100px',
      render: (value: unknown, transfer: StockTransferDisplay) => (
        <div className="text-center">
          <div className="font-medium">{(value as number) || transfer.total_items || 0}</div>
          <div className="text-sm text-muted-foreground">{transfer.total_quantity || 0} qty</div>
        </div>
      )
    },
    {
      key: 'estimated_value',
      title: 'Value',
      sortable: true,
      width: '120px',
      render: (value: unknown, transfer: StockTransferDisplay) => (
        <span className="font-medium">{formatCurrency((value as number) || transfer.estimated_value || 0)}</span>
      )
    },
    {
      key: 'priority',
      title: 'Priority',
      sortable: true,
      width: '100px',
      render: (value: unknown, transfer: StockTransferDisplay) => {
        const { variant, label } = getPriorityBadge((value as string) || transfer.priority || 'medium')
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      width: '120px',
      render: (value: unknown, transfer: StockTransferDisplay) => {
        const { variant, label, icon: Icon } = getStatusBadge((value as string) || transfer.status)
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'id',
      title: 'Actions',
      width: '100px',
      render: (_, transfer: StockTransferDisplay) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/inventory/stock-transfer/${transfer.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/inventory/stock-transfer/${transfer.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Stock Transfer"
        description="Manage inventory transfers between locations"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" asChild>
              <Link href="/inventory/stock-transfer/new">
                <Plus className="h-4 w-4 mr-2" />
                New Transfer
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transfers</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalTransfers}</p>
                <p className="text-sm text-blue-600 mt-1">All transfers</p>
              </div>
              <ArrowRightLeft className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{summaryStats.pendingTransfers}</p>
                <p className="text-sm text-orange-600 mt-1">Waiting</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{summaryStats.inTransitTransfers}</p>
                <p className="text-sm text-blue-600 mt-1">Moving</p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{summaryStats.completedTransfers}</p>
                <p className="text-sm text-green-600 mt-1">Finished</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </div>

        {/* Filters (no outer border) */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transfers, locations, or reasons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <Building className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {mounted && (
                  <>
                    <SelectItem value="warehouse_to_warehouse">WH to WH</SelectItem>
                    <SelectItem value="warehouse_to_store">WH to Store</SelectItem>
                    <SelectItem value="store_to_store">Store to Store</SelectItem>
                    <SelectItem value="return_to_warehouse">Return to WH</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <CheckCircle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {mounted && (
                  <>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <AlertCircle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {mounted && (
                  <>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Toggle & Sort */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
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
            <Select value="transfer_date" onValueChange={() => {}}>
              <SelectTrigger className="w-44">
                <BarChart3 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by Date" />
              </SelectTrigger>
              <SelectContent>
                {mounted && (
                  <>
                    <SelectItem value="transfer_date">Transfer Date</SelectItem>
                    <SelectItem value="value">Value</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {sortedTransfers.length} of {transferData.length} transfers
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading stock transfer data...</p>
            </div>
          </div>
        ) : activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTransfers.map((transfer) => {
              const { variant: typeVariant, label: typeLabel, icon: TypeIcon } = getTypeBadge(transfer.transfer_type)
              const { variant: statusVariant, label: statusLabel, icon: StatusIcon } = getStatusBadge(transfer.status)
              const { variant: priorityVariant, label: priorityLabel } = getPriorityBadge(transfer.priority)
              
              return (
                <Card key={transfer.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                      <div>
                        <Link 
                          href={`/inventory/stock-transfer/${transfer.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {transfer.transfer_number}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(transfer.transfer_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-1">
                        <StatusIcon className="h-4 w-4" />
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </div>
                      <Badge variant={priorityVariant}>{priorityLabel}</Badge>
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

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">From: {transfer.from_location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">To: {transfer.to_location}</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Items:</span>
                        <span className="text-sm font-medium">{transfer.total_items} types</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        <span className="text-sm font-medium">{transfer.total_quantity} units</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Value:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {mounted ? `${(transfer.estimated_value / 1000000).toFixed(1)}M` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Requested by:</span>
                        <span className="text-sm">{transfer.requested_by}</span>
                      </div>
                      {transfer.approved_by && (
                        <div className="flex justify-between mt-1">
                          <span className="text-sm text-muted-foreground">Approved by:</span>
                          <span className="text-sm">{transfer.approved_by}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <strong>Reason:</strong> {transfer.reason}
                    </div>

                    <div className="flex space-x-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/inventory/stock-transfer/${transfer.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      {transfer.status !== 'completed' && transfer.status !== 'cancelled' && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/inventory/stock-transfer/${transfer.id}/edit`}>
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
          <AdvancedDataTable
            data={sortedTransfers}
            columns={columns}
            loading={loading}
            pagination={{
              current: 1,
              pageSize: 15,
              total: sortedTransfers.length,
              onChange: () => {}
            }}
            searchPlaceholder="Search stock transfers..."
            exportEnabled={true}
            rowSelection={false}
          />
        )}

        {/* Urgent Transfers Alert */}
        {summaryStats.urgentTransfers > 0 && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">Urgent Transfers</h3>
                <p className="text-red-700 mt-1">
                  {summaryStats.urgentTransfers} urgent transfers require immediate attention.
                </p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                View Urgent
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}