'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable, type AdvancedColumn } from '@/components/ui/advanced-data-table'
import { 
  ArrowRightLeft,
  Edit,
  MapPin,
  User,
  Package,
  Building,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Download,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

// Mock transfer item interface
interface TransferItem {
  id: string
  product_code: string
  product_name: string
  category: string
  size: string  
  color: string
  quantity: number
  unit_cost: number
  total_cost: number
  status: 'pending' | 'transferred' | 'received'
}

// Extended transfer interface for detail view
interface StockTransferDetail {
  id: string
  transfer_number: string
  transfer_type: 'warehouse_to_warehouse' | 'warehouse_to_store' | 'store_to_store' | 'return_to_warehouse'
  from_location: string
  from_location_code: string
  from_address?: string
  to_location: string
  to_location_code: string
  to_address?: string
  transfer_date: string
  requested_by: string
  approved_by?: string
  received_by?: string
  status: 'draft' | 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  total_items: number
  total_quantity: number
  estimated_value: number
  actual_delivery_date?: string
  notes?: string
  reason: string
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
  items: TransferItem[]
}

// Mock data for transfer detail
const mockTransferDetail: StockTransferDetail = {
  id: '1',
  transfer_number: 'TRF-2024-001',
  transfer_type: 'warehouse_to_store',
  from_location: 'Main Warehouse Jakarta',
  from_location_code: 'WH-JKT-001',
  from_address: 'Jl. Industri Raya No. 123, Jakarta Barat 11510',
  to_location: 'Store Plaza Indonesia',
  to_location_code: 'ST-PI-001',
  to_address: 'Plaza Indonesia, Jl. M.H. Thamrin Kav. 28-30, Jakarta Pusat 10350',
  transfer_date: '2024-07-25T08:00:00Z',
  requested_by: 'Ahmad Store Manager',
  approved_by: 'Budi Warehouse Manager',
  received_by: '',
  status: 'in_transit',
  priority: 'high',
  total_items: 15,
  total_quantity: 245,
  estimated_value: 125750000,
  reason: 'Stock replenishment for weekend sale',
  notes: 'Handle with care - contains premium items',
  created_by: 'Ahmad Store',
  updated_by: 'Budi Warehouse',
  created_at: '2024-07-24T14:30:00Z',
  updated_at: '2024-07-25T09:15:00Z',
  items: [
    {
      id: '1',
      product_code: 'SPT-001-BLK-42',
      product_name: 'Sport Running Shoes Black',
      category: 'Sports Shoes',
      size: '42',
      color: 'Black',
      quantity: 25,
      unit_cost: 450000,
      total_cost: 11250000,
      status: 'transferred'
    },
    {
      id: '2', 
      product_code: 'CAS-002-BRN-40',
      product_name: 'Casual Leather Shoes Brown',
      category: 'Casual Shoes',
      size: '40',
      color: 'Brown',
      quantity: 18,
      unit_cost: 650000,
      total_cost: 11700000,
      status: 'transferred'
    },
    {
      id: '3',
      product_code: 'FML-003-BLK-38',
      product_name: 'Formal Office Shoes Black',
      category: 'Formal Shoes', 
      size: '38',
      color: 'Black',
      quantity: 12,
      unit_cost: 750000,
      total_cost: 9000000,
      status: 'transferred'
    },
    {
      id: '4',
      product_code: 'SPT-004-WHT-41',
      product_name: 'Sport Tennis Shoes White',
      category: 'Sports Shoes',
      size: '41',
      color: 'White',
      quantity: 30,
      unit_cost: 520000,
      total_cost: 15600000,
      status: 'pending'
    },
    {
      id: '5',
      product_code: 'BOT-005-BLK-43',
      product_name: 'Work Boots Black',
      category: 'Boots',
      size: '43',
      color: 'Black',
      quantity: 15,
      unit_cost: 850000,
      total_cost: 12750000,
      status: 'pending'
    }
  ]
}

export default function StockTransferDetailPage() {
  const params = useParams()
  const [mounted, setMounted] = useState(false)
  const [transfer, setTransfer] = useState<StockTransferDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch transfer detail data
  const fetchTransferDetail = async () => {
    try {
      setLoading(true)
      // For now, use mock data since backend might not have full implementation
      // In production, this would be:
      // const response = await stockTransferService.getById(params.id as string)
      // setTransfer(response)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTransfer(mockTransferDetail)
    } catch (error) {
      console.error('Error fetching transfer detail:', error)
      setTransfer(mockTransferDetail) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchTransferDetail()
    }
  }, [params.id])

  const formatDate = (dateString: string): string => {
    if (!mounted) return ''
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const getItemStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'outline' as const, label: 'Pending' },
      transferred: { variant: 'default' as const, label: 'Transferred' },
      received: { variant: 'default' as const, label: 'Received' }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status }
  }

  const breadcrumbs = [
    { label: 'Inventory', href: '/inventory' },
    { label: 'Stock Transfer', href: '/inventory/stock-transfer' },
    { label: transfer?.transfer_number || 'Detail', href: `/inventory/stock-transfer/${params.id}` }
  ]

  const itemColumns: AdvancedColumn<TransferItem>[] = [
    {
      key: 'product_code',
      title: 'Product Code',
      sortable: true,
      width: '140px',
      render: (value: unknown) => (
        <div className="font-medium">{value as string}</div>
      )
    },
    {
      key: 'product_name',
      title: 'Product Name',
      sortable: true,
      render: (value: unknown, item: TransferItem) => (
        <div>
          <div className="font-medium">{value as string}</div>
          <div className="text-sm text-muted-foreground">{item.category}</div>
        </div>
      )
    },
    {
      key: 'size',
      title: 'Size',
      width: '80px',
      render: (value: unknown) => (
        <div className="text-center font-medium">{value as string}</div>
      )
    },
    {
      key: 'color',
      title: 'Color',
      width: '100px',
      render: (value: unknown) => (
        <div className="text-center">{value as string}</div>
      )
    },
    {
      key: 'quantity',
      title: 'Qty',
      sortable: true,
      width: '80px',
      render: (value: unknown) => (
        <div className="text-center font-medium">{value as number}</div>
      )
    },
    {
      key: 'unit_cost',
      title: 'Unit Cost',
      sortable: true,
      width: '120px',
      render: (value: unknown) => (
        <div className="text-right">{formatCurrency(value as number)}</div>
      )
    },
    {
      key: 'total_cost',
      title: 'Total Cost',
      sortable: true,
      width: '120px',
      render: (value: unknown) => (
        <div className="text-right font-medium">{formatCurrency(value as number)}</div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      width: '120px',
      render: (value: unknown) => {
        const { variant, label } = getItemStatusBadge(value as string)
        return <Badge variant={variant}>{label}</Badge>
      }
    }
  ]

  if (loading) {
    return (
      <TwoLevelLayout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading transfer details...</p>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  if (!transfer) {
    return (
      <TwoLevelLayout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Transfer not found</p>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const { variant: statusVariant, label: statusLabel, icon: StatusIcon } = getStatusBadge(transfer.status)
  const { variant: priorityVariant, label: priorityLabel } = getPriorityBadge(transfer.priority)

  return (
    <TwoLevelLayout>
      <Header 
        title={transfer.transfer_number}
        description="Stock transfer details and item tracking"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {transfer.status !== 'completed' && transfer.status !== 'cancelled' && (
              <Button size="sm" asChild>
                <Link href={`/inventory/stock-transfer/${transfer.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Transfer
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/inventory/stock-transfer">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Transfer Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <ArrowRightLeft className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Transfer Information</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Transfer Number:</span>
                <span className="text-sm font-medium">{transfer.transfer_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Type:</span>
                <span className="text-sm">{transfer.transfer_type.replace(/_/g, ' ').toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <div className="flex items-center space-x-1">
                  <StatusIcon className="h-4 w-4" />
                  <Badge variant={statusVariant}>{statusLabel}</Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Priority:</span>
                <Badge variant={priorityVariant}>{priorityLabel}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Transfer Date:</span>
                <span className="text-sm">{formatDate(transfer.transfer_date)}</span>
              </div>
              {transfer.actual_delivery_date && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Delivered:</span>
                  <span className="text-sm">{formatDate(transfer.actual_delivery_date)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Location Information */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold">Locations</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Building className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">From:</span>
                </div>
                <div className="pl-6">
                  <div className="font-medium">{transfer.from_location}</div>
                  <div className="text-sm text-muted-foreground">{transfer.from_location_code}</div>
                  {transfer.from_address && (
                    <div className="text-sm text-muted-foreground mt-1">{transfer.from_address}</div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Building className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">To:</span>
                </div>
                <div className="pl-6">
                  <div className="font-medium">{transfer.to_location}</div>
                  <div className="text-sm text-muted-foreground">{transfer.to_location_code}</div>
                  {transfer.to_address && (
                    <div className="text-sm text-muted-foreground mt-1">{transfer.to_address}</div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Summary Statistics */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Package className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold">Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Items:</span>
                <span className="text-lg font-bold">{transfer.total_items}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Quantity:</span>
                <span className="text-lg font-bold">{transfer.total_quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Estimated Value:</span>
                <span className="text-lg font-bold text-green-600">
                  {mounted ? `${(transfer.estimated_value / 1000000).toFixed(1)}M` : ''}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* People & Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* People Involved */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold">People Involved</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Requested by:</span>
                <span className="text-sm font-medium">{transfer.requested_by}</span>
              </div>
              {transfer.approved_by && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Approved by:</span>
                  <span className="text-sm font-medium">{transfer.approved_by}</span>
                </div>
              )}
              {transfer.received_by && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Received by:</span>
                  <span className="text-sm font-medium">{transfer.received_by}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created by:</span>
                <span className="text-sm">{transfer.created_by}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last updated by:</span>
                <span className="text-sm">{transfer.updated_by}</span>
              </div>
            </div>
          </Card>

          {/* Reason & Notes */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold">Reason & Notes</h3>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Reason:</span>
                <p className="text-sm mt-1">{transfer.reason}</p>
              </div>
              {transfer.notes && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Notes:</span>
                  <p className="text-sm mt-1">{transfer.notes}</p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="text-sm">{formatDate(transfer.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last updated:</span>
                <span className="text-sm">{formatDate(transfer.updated_at)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Transfer Items */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Transfer Items</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              {transfer.items.length} items
            </div>
          </div>
          
          <AdvancedDataTable
            data={transfer.items}
            columns={itemColumns}
            loading={false}
            pagination={{
              current: 1,
              pageSize: 20,
              total: transfer.items.length,
              onChange: () => {}
            }}
            searchPlaceholder="Search transfer items..."
            exportEnabled={true}
            rowSelection={false}
          />
        </Card>
      </div>
    </TwoLevelLayout>
  )
}