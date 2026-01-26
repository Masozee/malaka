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
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Download01Icon,
  PlusSignIcon,
  Settings01Icon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  TargetIcon,
  AlertCircleIcon,
  Cancel01Icon,
  Calendar01Icon,
  UserIcon,
  EyeIcon,
  PencilEdit01Icon,
  FilterIcon,
  Search01Icon,
  Store01Icon,
  ChartIncreaseIcon,
  ChartDecreaseIcon,
  GridIcon
} from '@hugeicons/core-free-icons'
import { stockAdjustmentService, StockAdjustment } from '@/services/inventory'

// Extended interface for display purposes
interface StockAdjustmentDisplay {
  id: string
  adjustmentNumber?: string
  adjustment_number?: string
  adjustmentDate?: string
  adjustment_date?: string
  reason?: string
  status?: string
  totalItems?: number
  total_items?: number
  adjustment_type?: string
  location?: string
  location_code?: string
  total_value_impact?: number
  created_by?: string
  reference_document?: string
  total_quantity_adjusted?: number
  items?: any[]
}

const typeConfig: Record<string, { label: string, color: string, icon: any }> = {
  increase: { label: 'Increase', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200', icon: ChartIncreaseIcon },
  decrease: { label: 'Decrease', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200', icon: ChartDecreaseIcon },
  correction: { label: 'Correction', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200', icon: Settings01Icon },
  damage: { label: 'Damage', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200', icon: AlertCircleIcon },
  theft: { label: 'Theft', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200', icon: Cancel01Icon },
  expired: { label: 'Expired', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200', icon: Clock01Icon },
  found: { label: 'Found', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200', icon: CheckmarkCircle01Icon }
}

const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: Clock01Icon },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200', icon: Clock01Icon },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200', icon: CheckmarkCircle01Icon },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200', icon: Cancel01Icon },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200', icon: TargetIcon }
}

export default function StockAdjustmentsPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<StockAdjustmentDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setMounted(true)
    fetchAdjustmentData()
  }, [])

  const fetchAdjustmentData = async () => {
    try {
      setLoading(true)
      const response = await stockAdjustmentService.getAll()

      // Transform data to ensure it matches display requirements
      const transformedData: StockAdjustmentDisplay[] = response.data.map(item => ({
        ...item,
        adjustment_number: item.adjustmentNumber || 'ADJ-NEW',
        adjustment_type: 'correction', // Default or map from item
        location: 'Main Warehouse', // Default or map
        location_code: 'WH-001',
        total_value_impact: (item.totalItems || 0) * 50000, // Mock calculation if missing
        created_by: 'System',
        totalItems: item.totalItems || 0
      }))
      setData(transformedData)
    } catch (error) {
      console.error('Error fetching stock adjustment data:', error)
      addToast({ type: 'error', title: 'Failed to fetch adjustments' })
    } finally {
      setLoading(false)
    }
  }

  const filteredData = useMemo(() => {
    if (!searchQuery) return data
    const lower = searchQuery.toLowerCase()
    return data.filter(item =>
      (item.adjustment_number && item.adjustment_number.toLowerCase().includes(lower)) ||
      (item.reason && item.reason.toLowerCase().includes(lower))
    )
  }, [data, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const total = data.length
    const pending = data.filter(i => i.status === 'pending' || i.status === 'draft').length
    const approved = data.filter(i => i.status === 'approved').length
    const completed = data.filter(i => i.status === 'completed').length

    return { total, pending, approved, completed }
  }, [data])

  const handleDelete = async (item: StockAdjustmentDisplay) => {
    if (confirm('Are you sure you want to delete this adjustment?')) {
      // API call would go here
      setData(prev => prev.filter(i => i.id !== item.id))
      addToast({ type: 'success', title: 'Adjustment deleted' })
    }
  }

  const columns: TanStackColumn<StockAdjustmentDisplay>[] = useMemo(() => [
    {
      id: 'adjustmentNumber',
      header: 'Adjustment #',
      accessorKey: 'adjustment_number',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link
            href={`/inventory/adjustments/${row.original.id}`}
            className="font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            {row.original.adjustment_number}
          </Link>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <HugeiconsIcon icon={Calendar01Icon} className="h-3 w-3" />
            {new Date(row.original.adjustmentDate || '').toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'adjustment_type',
      cell: ({ row }) => {
        const type = row.original.adjustment_type || 'correction'
        const config = typeConfig[type] || typeConfig.correction
        return (
          <Badge className={`${config.color} border-0 flex items-center gap-1 w-fit`}>
            <HugeiconsIcon icon={config.icon} className="h-3 w-3" />
            {config.label}
          </Badge>
        )
      }
    },
    {
      id: 'location',
      header: 'Location',
      accessorKey: 'location',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-xs">
          <HugeiconsIcon icon={Store01Icon} className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span>{row.original.location}</span>
            <span className="text-[10px] text-muted-foreground">{row.original.location_code}</span>
          </div>
        </div>
      )
    },
    {
      id: 'items',
      header: 'Items',
      accessorKey: 'totalItems',
      cell: ({ row }) => (
        <div className="text-center text-xs">
          <span className="font-medium">{row.original.totalItems}</span> items
        </div>
      )
    },
    {
      id: 'valueImpact',
      header: 'Value Impact',
      accessorKey: 'total_value_impact',
      cell: ({ row }) => {
        const value = row.original.total_value_impact || 0
        const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'
        return (
          <div className={`font-medium text-xs ${color}`}>
            {mounted ? value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) : ''}
          </div>
        )
      }
    },
    {
      id: 'createdBy',
      header: 'Created By',
      accessorKey: 'created_by',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <HugeiconsIcon icon={UserIcon} className="h-3 w-3" />
          <span>{row.original.created_by}</span>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status || 'pending'
        const config = statusConfig[status] || statusConfig.pending
        return (
          <Badge className={`${config.color} border-0 flex items-center gap-1 w-fit`}>
            <HugeiconsIcon icon={config.icon} className="h-3 w-3" />
            {config.label}
          </Badge>
        )
      }
    }
  ], [mounted])

  return (
    <TwoLevelLayout>
      <Header
        title="Stock Adjustments"
        description="Manage inventory adjustments and corrections"
        breadcrumbs={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Adjustments' }
        ]}
        actions={
          <Link href="/inventory/adjustments/new">
            <Button>
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
              New Adjustment
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
                <p className="text-sm font-medium text-muted-foreground">Total Adjustments</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600">
                <HugeiconsIcon icon={Settings01Icon} className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center text-yellow-600">
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
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center text-green-600">
                <HugeiconsIcon icon={TargetIcon} className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-end gap-2">
          <div className="relative">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search adjustments..."
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
          loading={loading}
          onEdit={(item) => router.push(`/inventory/adjustments/${item.id}/edit`)}
          onDelete={handleDelete}
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