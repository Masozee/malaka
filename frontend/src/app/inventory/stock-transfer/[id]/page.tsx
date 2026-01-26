'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  Download01Icon,
  PencilEdit01Icon,
  PrinterIcon,
  ArrowRight01Icon,
  Store01Icon,
  Calendar01Icon,
  TruckDeliveryIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  AlertCircleIcon,
  UserIcon,
  File01Icon,
  PackageIcon,
  InformationCircleIcon
} from '@hugeicons/core-free-icons'

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

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: Clock01Icon },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200', icon: Clock01Icon },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200', icon: CheckmarkCircle01Icon },
  in_transit: { label: 'In Transit', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200', icon: TruckDeliveryIcon },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200', icon: CheckmarkCircle01Icon },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200', icon: AlertCircleIcon }
}

const priorityConfig = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
  medium: { label: 'Medium', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
  high: { label: 'High', color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' },
  urgent: { label: 'Urgent', color: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' }
}

export default function StockTransferDetailPage() {
  const params = useParams()
  const router = useRouter()
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
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

  const itemColumns: TanStackColumn<TransferItem>[] = useMemo(() => [
    {
      id: 'product',
      header: 'Product',
      accessorKey: 'product_code',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-blue-600 dark:text-blue-400">{row.original.product_name}</span>
          <span className="text-xs text-muted-foreground">{row.original.product_code}</span>
        </div>
      )
    },
    {
      id: 'category',
      header: 'Category',
      accessorKey: 'category',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.category}</div>
      )
    },
    {
      id: 'size_color',
      header: 'Size / Color',
      accessorKey: 'size',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.size} / {row.original.color}
        </div>
      )
    },
    {
      id: 'quantity',
      header: 'Quantity',
      accessorKey: 'quantity',
      cell: ({ row }) => (
        <div className="text-center font-medium bg-muted py-1 rounded-md">{row.original.quantity}</div>
      )
    },
    {
      id: 'cost',
      header: 'Total Cost',
      accessorKey: 'total_cost',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {((row.original.total_cost || 0)).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const isPending = row.original.status === 'pending'
        return (
          <Badge variant={isPending ? 'outline' : 'default'} className="capitalize">
            {row.original.status}
          </Badge>
        )
      }
    }
  ], [])

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Stock Transfer"
          breadcrumbs={[{ label: 'Inventory' }, { label: 'Stock Transfer' }]}
        />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </TwoLevelLayout>
    )
  }

  if (!transfer) {
    return (
      <TwoLevelLayout>
        <Header
          title="Stock Transfer Not Found"
          breadcrumbs={[{ label: 'Inventory' }, { label: 'Stock Transfer' }]}
        />
        <div className="flex flex-col justify-center items-center h-64 p-6">
          <HugeiconsIcon icon={InformationCircleIcon} className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Transfer not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/inventory/stock-transfer')}>
            Back to List
          </Button>
        </div>
      </TwoLevelLayout>
    )
  }

  const status = statusConfig[transfer.status] || statusConfig.pending
  const priority = priorityConfig[transfer.priority] || priorityConfig.medium

  return (
    <TwoLevelLayout>
      <Header
        title={transfer.transfer_number}
        description="Stock transfer details and item tracking"
        breadcrumbs={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Stock Transfer', href: '/inventory/stock-transfer' },
          { label: transfer.transfer_number }
        ]}
        actions={
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={PrinterIcon} className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
              Export
            </Button>
            {transfer.status !== 'completed' && transfer.status !== 'cancelled' && (
              <Link href={`/inventory/stock-transfer/${transfer.id}/edit`}>
                <Button size="sm">
                  <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                  Edit Transfer
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={() => router.push('/inventory/stock-transfer')}>
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Transfer Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5 text-blue-600" />
                Transfer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Transfer Number</label>
                  <p className="mt-1 font-mono text-sm font-semibold">{transfer.transfer_number}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                  <div className="mt-1">
                    <Badge className={`${status.color} border-0 flex items-center gap-1 w-fit`}>
                      <HugeiconsIcon icon={status.icon} className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</label>
                  <p className="mt-1 text-sm capitalize">{transfer.transfer_type.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</label>
                  <div className="mt-1">
                    <Badge className={`${priority.color} border-0 hover:bg-opacity-80`}>
                      {priority.label}
                    </Badge>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/50 rounded-lg border border-dashed">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <HugeiconsIcon icon={Store01Icon} className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Origin</span>
                    </div>
                    <p className="text-sm font-medium">{transfer.from_location}</p>
                    <p className="text-xs text-muted-foreground">{transfer.from_location_code}</p>
                    {transfer.from_address && <p className="text-xs text-muted-foreground mt-1 max-w-xs">{transfer.from_address}</p>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <HugeiconsIcon icon={Store01Icon} className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">Destination</span>
                    </div>
                    <p className="text-sm font-medium">{transfer.to_location}</p>
                    <p className="text-xs text-muted-foreground">{transfer.to_location_code}</p>
                    {transfer.to_address && <p className="text-xs text-muted-foreground mt-1 max-w-xs">{transfer.to_address}</p>}
                  </div>
                </div>

                {transfer.reason && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reason</label>
                    <p className="mt-1 text-sm">{transfer.reason}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details & People */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Items</span>
                  <span className="font-semibold">{transfer.total_items} types</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Quantity</span>
                  <span className="font-semibold">{transfer.total_quantity} units</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Estimated Value</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {((transfer.estimated_value || 0)).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground w-24">Date:</span>
                  <span>{new Date(transfer.transfer_date).toLocaleDateString()}</span>
                </div>
                {transfer.actual_delivery_date && (
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={TruckDeliveryIcon} className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground w-24">Delivered:</span>
                    <span>{new Date(transfer.actual_delivery_date).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={UserIcon} className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground w-24">Requested:</span>
                  <span className="truncate">{transfer.requested_by}</span>
                </div>
                {transfer.approved_by && (
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground w-24">Approved:</span>
                    <span className="truncate">{transfer.approved_by}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transfer Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HugeiconsIcon icon={PackageIcon} className="h-5 w-5 text-gray-500" />
              Transfer Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TanStackDataTable
              data={transfer.items}
              columns={itemColumns}
              pagination={{
                pageSize: 20,
                pageIndex: 0,
                totalRows: transfer.items.length,
                onPageChange: () => { }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </TwoLevelLayout>
  )
}