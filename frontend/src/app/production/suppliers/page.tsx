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
  Mail01Icon,
  CallIcon,
  Globe02Icon,
  StarIcon,
  Delete02Icon
} from '@hugeicons/core-free-icons'
import { ProductionService } from '@/services/production'
import { Supplier } from '@/types/production'
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
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' }
}

export default function SuppliersPage() {
  const router = useRouter()
  const [data, setData] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await ProductionService.getSuppliers()
        const items = (response.data as any)?.data || (response as any).data || []
        setData(Array.isArray(items) ? items : [])
      } catch (error) {
        console.error('Failed to fetch suppliers:', error)
        const { mockSuppliers } = await import('@/services/production')
        setData(mockSuppliers)
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
      item.email.toLowerCase().includes(lower) ||
      item.city.toLowerCase().includes(lower)
    )
  }, [data, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const total = data.length
    const active = data.filter(i => i.status === 'active').length
    const totalValue = data.reduce((sum, i) => sum + (i.totalValue || 0), 0)
    const avgRating = total > 0 ? data.reduce((sum, i) => sum + (i.rating || 0), 0) / total : 0
    return { total, active, totalValue, avgRating }
  }, [data])

  const columns: TanStackColumn<Supplier>[] = useMemo(() => [
    {
      id: 'info',
      header: 'Supplier',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link
            href={`/production/suppliers/${row.original.id}`}
            className="font-bold text-sm text-foreground hover:underline"
          >
            {row.original.name}
          </Link>
          <span className="text-[10px] text-muted-foreground">{row.original.code}</span>
        </div>
      )
    },
    {
      id: 'contact',
      header: 'Contact',
      accessorKey: 'email',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-sm">
            <span>{row.original.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{row.original.phone}</span>
          </div>
        </div>
      )
    },
    {
      id: 'location',
      header: 'Location',
      accessorKey: 'city',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm">
          <span>{row.original.city}, {row.original.country}</span>
        </div>
      )
    },
    {
      id: 'orders',
      header: 'Orders',
      accessorKey: 'totalOrders',
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.original.totalOrders}</div>
      )
    },
    {
      id: 'rating',
      header: 'Rating',
      accessorKey: 'rating',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <HugeiconsIcon icon={StarIcon} className="h-4 w-4 text-yellow-500 fill-current" />
          <span className="font-medium">{row.original.rating}</span>
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
              <DropdownMenuItem onClick={() => router.push(`/production/suppliers/${row.original.id}`)}>
                <HugeiconsIcon icon={EyeIcon} className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/production/suppliers/${row.original.id}/edit`)}>
                <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 h-4 w-4" />
                Edit Supplier
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
        title="Suppliers"
        description="Manage raw material suppliers and partners"
        breadcrumbs={[
          { label: 'Production', href: '/production' },
          { label: 'Suppliers' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              Import
            </Button>
            <Link href="/production/suppliers/new">
              <Button>
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                Add Supplier
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
                <p className="text-sm font-medium text-muted-foreground">Total Suppliers</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders Value</p>
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
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-foreground">{stats.avgRating.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-end gap-2">
          <div className="relative">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
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