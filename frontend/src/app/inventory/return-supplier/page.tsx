'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { returnSupplierService, ReturnSupplier } from '@/services/inventory'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search01Icon,
  FilterIcon,
  Download01Icon,
  PlusSignIcon,
  ReloadIcon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  PackageIcon,
  ArrowLeft01Icon,
  EyeIcon
} from '@hugeicons/core-free-icons'

const statusColors: Record<string, string> = {
  initiated: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  received: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  processed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
}

const reasonColors: Record<string, string> = {
  defective: 'bg-red-100 text-red-800',
  'wrong-specification': 'bg-orange-100 text-orange-800',
  overshipped: 'bg-purple-100 text-purple-800',
  damaged: 'bg-red-100 text-red-800',
  expired: 'bg-yellow-100 text-yellow-800',
  'quality-issue': 'bg-pink-100 text-pink-800'
}

export default function ReturnSupplierPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [data, setData] = useState<ReturnSupplier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await returnSupplierService.getAll()
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch return suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = useMemo(() => {
    if (!searchQuery) return data
    const lower = searchQuery.toLowerCase()
    return data.filter(item =>
      item.returnNumber.toLowerCase().includes(lower) ||
      item.supplierName.toLowerCase().includes(lower) ||
      item.originalPO.toLowerCase().includes(lower)
    )
  }, [data, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const total = data.length
    const initiated = data.filter(i => i.status === 'initiated').length
    const approved = data.filter(i => i.status === 'approved').length
    const processed = data.filter(i => i.status === 'processed').length
    return { total, initiated, approved, processed }
  }, [data])

  const columns: TanStackColumn<ReturnSupplier>[] = useMemo(() => [
    {
      id: 'returnNumber',
      accessorKey: 'returnNumber',
      header: 'Return #',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
            {row.original.returnNumber}
          </span>
          <span className="text-[10px] text-muted-foreground">{row.original.supplierName}</span>
        </div>
      )
    },
    {
      id: 'originalPO',
      accessorKey: 'originalPO',
      header: 'PO Reference',
      cell: ({ row }) => (
        <span className="font-medium text-xs">{row.original.originalPO}</span>
      )
    },
    {
      id: 'reason',
      accessorKey: 'returnReason',
      header: 'Reason',
      cell: ({ row }) => {
        const reason = row.original.returnReason
        return (
          <Badge className={`${reasonColors[reason]} border-0 capitalize whitespace-nowrap`}>
            {reason.replace('-', ' ')}
          </Badge>
        )
      }
    },
    {
      id: 'items',
      accessorKey: 'totalItems',
      header: 'Items',
      cell: ({ row }) => (
        <div className="text-center text-xs">
          <span className="font-medium">{row.original.totalItems}</span> types
          <div className="text-xs text-muted-foreground">
            {row.original.totalQuantity} qty
          </div>
        </div>
      )
    },
    {
      id: 'value',
      accessorKey: 'totalValue',
      header: 'Value',
      cell: ({ row }) => (
        <div className="flex flex-col text-right">
          <span className="font-medium text-xs">
            {mounted ? row.original.totalValue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Refund: {mounted ? row.original.expectedRefund.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
          </span>
        </div>
      )
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge className={`${statusColors[status]} border-0 capitalize`}>
            {status}
          </Badge>
        )
      }
    },
    {
      id: 'date',
      accessorKey: 'returnDate',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {mounted ? new Date(row.original.returnDate).toLocaleDateString('id-ID') : ''}
        </span>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm">
          <HugeiconsIcon icon={EyeIcon} className="h-4 w-4" />
        </Button>
      )
    }
  ], [mounted])


  return (
    <TwoLevelLayout>
      <Header
        title="Return to Supplier"
        description="Manage returns and refunds from suppliers"
        breadcrumbs={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Return Supplier' }
        ]}
        actions={
          <Link href="/inventory/return-supplier/new">
            <Button>
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
              New Return
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Returns</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600">
                <HugeiconsIcon icon={ReloadIcon} className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Initiated</p>
                <p className="text-2xl font-bold text-gray-600">{stats.initiated}</p>
              </div>
              <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600">
                <HugeiconsIcon icon={Clock01Icon} className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processed</p>
                <p className="text-2xl font-bold text-green-600">{stats.processed}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center text-green-600">
                <HugeiconsIcon icon={PackageIcon} className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-end gap-2">
          <div className="relative">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search returns..."
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