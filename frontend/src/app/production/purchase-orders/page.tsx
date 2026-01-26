'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search01Icon,
  FilterIcon,
  Download01Icon,
  PlusSignIcon,
  EyeIcon,
  PencilEdit01Icon,
  MoreVerticalIcon,
  Calendar01Icon,
  Delete02Icon
} from '@hugeicons/core-free-icons'
import { ProductionService } from '@/services/production'
import { PurchaseOrder } from '@/types/production'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

const statusConfig: Record<string, { label: string, color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
  confirmed: { label: 'Confirmed', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200' },
  partial: { label: 'Partial', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' }
}

const priorityConfig: Record<string, { label: string, color: string }> = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
  normal: { label: 'Normal', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
  high: { label: 'High', color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' },
  urgent: { label: 'Urgent', color: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' }
}

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const [data, setData] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await ProductionService.getPurchaseOrders()
        const items = (response.data as any)?.data || (response as any).data || []
        setData(Array.isArray(items) ? items : [])
      } catch (error) {
        console.error('Failed to fetch purchase orders:', error)
        // Fallback to mock data
        const { mockPurchaseOrders } = await import('@/services/production')
        setData(mockPurchaseOrders)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    if (!searchQuery) return data
    const lower = searchQuery.toLowerCase()
    return data.filter(item =>
      item.orderNumber.toLowerCase().includes(lower) ||
      item.supplier.name.toLowerCase().includes(lower)
    )
  }, [data, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const total = data.length
    const totalValue = data.reduce((sum, i) => sum + (i.totalAmount || 0), 0)
    const pending = data.filter(i => ['draft', 'sent', 'confirmed', 'partial'].includes(i.status)).length
    const delivered = data.filter(i => i.status === 'delivered').length
    return { total, totalValue, pending, delivered }
  }, [data])

  const columns: TanStackColumn<PurchaseOrder>[] = useMemo(() => [
    {
      id: 'info',
      header: 'Order #',
      accessorKey: 'orderNumber',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link
            href={`/production/purchase-orders/${row.original.id}`}
            className="font-bold text-sm text-foreground hover:underline"
          >
            {row.original.orderNumber}
          </Link>
          <span className="text-[10px] text-muted-foreground">
            {new Date(row.original.orderDate).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      id: 'supplier',
      header: 'Supplier',
      accessorKey: 'supplier',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-foreground">{row.original.supplier.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.supplier.code}</span>
        </div>
      )
    },
    {
      id: 'expectedDate',
      header: 'Expected',
      accessorKey: 'expectedDate',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>{new Date(row.original.expectedDate).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'totalAmount',
      cell: ({ row }) => (
        <div className="font-medium text-right text-foreground">
          {row.original.totalAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
        </div>
      )
    },
    {
      id: 'priority',
      header: 'Priority',
      accessorKey: 'priority',
      cell: ({ row }) => {
        const config = priorityConfig[row.original.priority]
        return (
          <Badge className={`${config.color} border-0 capitalize`}>
            {config.label}
          </Badge>
        )
      }
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const config = statusConfig[row.original.status]
        return (
          <Badge className={`${config.color} border-0 capitalize`}>
            {config.label}
          </Badge>
        )
      }
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/production/purchase-orders/${row.original.id}`)}>
                <HugeiconsIcon icon={EyeIcon} className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/production/purchase-orders/${row.original.id}/edit`)}>
                <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 h-4 w-4" />
                Edit Order
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => { }}>
                <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ], [router])

  return (
    <TwoLevelLayout>
      <Header
        title="Purchase Orders"
        description="Manage procurement and raw material orders"
        breadcrumbs={[
          { label: 'Production', href: '/production' },
          { label: 'Purchase Orders' }
        ]}
        actions={
          <div className="flex gap-2">
            <Link href="/production/purchase-orders/new">
              <Button>
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold truncate text-foreground" title={stats.totalValue.toLocaleString()}>
                  {stats.totalValue > 1000000000
                    ? `${(stats.totalValue / 1000000000).toFixed(1)}B`
                    : `${(stats.totalValue / 1000000).toFixed(1)}M`}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-end gap-2">
          <div className="relative">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-9 w-64"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Table */}
        <TanStackDataTable
          data={filteredData}
          columns={columns}
          pagination={{
            pageSize: 10,
            pageIndex: 0,
            totalRows: filteredData.length,
            onPageChange: () => { }
          }}
        />
      </div>
    </TwoLevelLayout>
  )
}