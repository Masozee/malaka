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
import { Progress } from '@/components/ui/progress'
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
import { WorkOrder } from '@/types/production'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

const statusConfig: Record<string, { label: string, color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' },
  paused: { label: 'Paused', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' }
}

const priorityConfig: Record<string, { label: string, color: string }> = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
  normal: { label: 'Normal', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
  high: { label: 'High', color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300' },
  urgent: { label: 'Urgent', color: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' }
}

export default function WorkOrdersPage() {
  const router = useRouter()
  const [data, setData] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await ProductionService.getWorkOrders()
        // Handle different response structures based on service implementation
        const orders = (response.data as any)?.data || response.data || []
        setData(Array.isArray(orders) ? orders : [])
      } catch (error) {
        console.error('Failed to fetch work orders:', error)
        // Use mock data fallback if API fails
        const { mockWorkOrders } = await import('@/services/production')
        setData(mockWorkOrders)
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
      item.workOrderNumber.toLowerCase().includes(lower) ||
      item.productName.toLowerCase().includes(lower) ||
      item.productCode.toLowerCase().includes(lower)
    )
  }, [data, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const total = data.length
    const active = data.filter(i => ['scheduled', 'in_progress'].includes(i.status)).length
    const completed = data.filter(i => i.status === 'completed').length
    const delayed = data.filter(i => {
      if (!i.plannedEndDate) return false
      return new Date(i.plannedEndDate) < new Date() && i.status !== 'completed'
    }).length
    return { total, active, completed, delayed }
  }, [data])

  const columns: TanStackColumn<WorkOrder>[] = useMemo(() => [
    {
      id: 'info',
      header: 'Work Order',
      accessorKey: 'workOrderNumber',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link
            href={`/production/work-orders/${row.original.id}`}
            className="font-bold text-sm text-foreground hover:underline"
          >
            {row.original.workOrderNumber}
          </Link>
          <span className="text-[10px] text-muted-foreground">{row.original.type}</span>
        </div>
      )
    },
    {
      id: 'product',
      header: 'Product',
      accessorKey: 'productName',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-foreground">{row.original.productName}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.productCode}</span>
        </div>
      )
    },
    {
      id: 'quantity',
      header: 'Quantity',
      accessorKey: 'quantity',
      cell: ({ row }) => (
        <div className="text-center">
          <span className="font-medium text-foreground">{row.original.quantity}</span>
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
      id: 'progress',
      header: 'Efficiency',
      accessorKey: 'efficiency',
      cell: ({ row }) => (
        <div className="w-full min-w-[100px] flex flex-col gap-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{row.original.efficiency}%</span>
          </div>
          <Progress value={row.original.efficiency} className="h-1.5" />
        </div>
      )
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
              <DropdownMenuItem onClick={() => router.push(`/production/work-orders/${row.original.id}`)}>
                <HugeiconsIcon icon={EyeIcon} className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/production/work-orders/${row.original.id}/edit`)}>
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
        title="Work Orders"
        description="Manage production work orders and track progress"
        breadcrumbs={[
          { label: 'Production', href: '/production' },
          { label: 'Work Orders' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              Schedule
            </Button>
            <Link href="/production/work-orders/new">
              <Button>
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                New Work Order
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
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delayed</p>
                <p className="text-2xl font-bold text-destructive">{stats.delayed}</p>
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