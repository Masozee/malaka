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
  UserCircleIcon,
  Delete02Icon
} from '@hugeicons/core-free-icons'
import { ProductionService } from '@/services/production'
import { Warehouse } from '@/types/production'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

const statusConfig: Record<string, { label: string, color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  maintenance: { label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' }
}

const typeConfig: Record<string, { label: string, color: string }> = {
  main: { label: 'Main', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
  satellite: { label: 'Satellite', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200' },
  transit: { label: 'Transit', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' },
  quarantine: { label: 'Quarantine', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' }
}

export default function WarehousesPage() {
  const router = useRouter()
  const [data, setData] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await ProductionService.getWarehouses()
        const items = (response.data as any)?.data || (response as any).data || []
        setData(Array.isArray(items) ? items : [])
      } catch (error) {
        console.error('Failed to fetch warehouses:', error)
        const { mockWarehouses } = await import('@/services/production')
        setData(mockWarehouses)
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
      item.name.toLowerCase().includes(lower) ||
      item.code.toLowerCase().includes(lower) ||
      item.city.toLowerCase().includes(lower) ||
      item.manager.toLowerCase().includes(lower)
    )
  }, [data, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const total = data.length
    const totalCapacity = data.reduce((sum, i) => sum + (i.capacity || 0), 0)
    const totalStock = data.reduce((sum, i) => sum + (i.current_stock || 0), 0)
    const avgUtilization = total > 0
      ? data.reduce((sum, w) => sum + (w.capacity > 0 ? (w.current_stock / w.capacity) * 100 : 0), 0) / total
      : 0
    return { total, totalCapacity, totalStock, avgUtilization }
  }, [data])

  const columns: TanStackColumn<Warehouse>[] = useMemo(() => [
    {
      id: 'info',
      header: 'Warehouse',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link
            href={`/production/warehouses/${row.original.id}`}
            className="font-bold text-xs text-foreground hover:underline"
          >
            {row.original.name}
          </Link>
          <span className="text-[10px] text-muted-foreground">{row.original.code}</span>
        </div>
      )
    },
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'type',
      cell: ({ row }) => {
        const config = typeConfig[row.original.type] || { label: row.original.type, color: 'bg-gray-100' }
        return (
          <Badge className={`${config.color} border-0 capitalize`}>
            {config.label}
          </Badge>
        )
      }
    },
    {
      id: 'location',
      header: 'Location',
      accessorKey: 'city',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-foreground">{row.original.city}</span>
          <span className="text-[10px] text-muted-foreground truncate max-w-[150px]" title={row.original.address}>
            {row.original.address}
          </span>
        </div>
      )
    },
    {
      id: 'capacity',
      header: 'Capacity',
      accessorKey: 'capacity',
      cell: ({ row }) => {
        const util = row.original.capacity > 0 ? (row.original.current_stock / row.original.capacity) * 100 : 0
        return (
          <div className="w-full min-w-[100px] flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{row.original.current_stock} / {row.original.capacity}</span>
            </div>
            <Progress value={util} className="h-1.5" />
            <div className="text-[10px] text-muted-foreground">{util.toFixed(1)}%</div>
          </div>
        )
      }
    },
    {
      id: 'manager',
      header: 'Manager',
      accessorKey: 'manager',
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-xs text-foreground">
            <HugeiconsIcon icon={UserCircleIcon} className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.manager}</span>
          </div>
          <span className="text-[10px] text-muted-foreground ml-4.5">{row.original.phone}</span>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const config = statusConfig[row.original.status] || { label: row.original.status, color: 'bg-gray-100' }
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
              <DropdownMenuItem onClick={() => router.push(`/production/warehouses/${row.original.id}`)}>
                <HugeiconsIcon icon={EyeIcon} className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/production/warehouses/${row.original.id}/edit`)}>
                <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 h-4 w-4" />
                Edit Warehouse
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
        title="Warehouses"
        description="Manage warehouse operations and storage facilities"
        breadcrumbs={[
          { label: 'Production', href: '/production' },
          { label: 'Warehouses' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              Report
            </Button>
            <Link href="/production/warehouses/new">
              <Button>
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                Add Warehouse
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
                <p className="text-sm font-medium text-muted-foreground">Total Warehouses</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Capacity</p>
                <p className="text-2xl font-bold truncate text-foreground" title={stats.totalCapacity.toLocaleString()}>
                  {stats.totalCapacity.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-bold truncate text-foreground" title={stats.totalStock.toLocaleString()}>
                  {stats.totalStock.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Utilization</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgUtilization.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-end gap-2">
          <div className="relative">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search warehouses..."
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