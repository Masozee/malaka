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
import { QualityControl } from '@/types/production'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

const statusConfig: Record<string, { label: string, color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  testing: { label: 'Testing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
  passed: { label: 'Passed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
  conditional: { label: 'Conditional', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' }
}

export default function QualityControlPage() {
  const router = useRouter()
  const [data, setData] = useState<QualityControl[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await ProductionService.getQualityControls()
        // Handle paginated response structure
        const items = (response.data as any)?.data || (response as any).data || []
        setData(Array.isArray(items) ? items : [])
      } catch (error) {
        console.error('Failed to fetch QC data:', error)
        // Fallback to mock data
        const { mockQualityControls } = await import('@/services/production')
        setData(mockQualityControls)
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
      item.qcNumber.toLowerCase().includes(lower) ||
      item.productName.toLowerCase().includes(lower) ||
      item.referenceNumber.toLowerCase().includes(lower)
    )
  }, [data, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const total = data.length
    const passed = data.filter(i => i.status === 'passed').length
    const failed = data.filter(i => i.status === 'failed').length
    const active = data.filter(i => i.status === 'testing').length
    const avgScore = total > 0 ? data.reduce((sum, i) => sum + (i.overallScore || 0), 0) / total : 0

    return { total, passed, failed, active, avgScore }
  }, [data])

  const columns: TanStackColumn<QualityControl>[] = useMemo(() => [
    {
      id: 'info',
      header: 'QC Number',
      accessorKey: 'qcNumber',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link
            href={`/production/quality-control/${row.original.id}`}
            className="font-bold text-xs text-foreground hover:underline"
          >
            {row.original.qcNumber}
          </Link>
          <span className="text-[10px] text-muted-foreground capitalize">{row.original.type}</span>
        </div>
      )
    },
    {
      id: 'product',
      header: 'Product',
      accessorKey: 'productName',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-xs text-foreground">{row.original.productName}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.productCode}</span>
        </div>
      )
    },
    {
      id: 'reference',
      header: 'Reference',
      accessorKey: 'referenceNumber',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">{row.original.referenceNumber}</span>
          <span className="text-[10px] text-muted-foreground capitalize">{row.original.referenceType}</span>
        </div>
      )
    },
    {
      id: 'inspection',
      header: 'Tested',
      accessorKey: 'quantityTested',
      cell: ({ row }) => (
        <div className="text-center">
          <span className="text-xs text-foreground">{row.original.quantityTested}</span>
          <span className="text-muted-foreground text-xs ml-1">/ {row.original.sampleSize}</span>
        </div>
      )
    },
    {
      id: 'score',
      header: 'Score',
      accessorKey: 'overallScore',
      cell: ({ row }) => {
        const score = row.original.overallScore || 0
        return (
          <div className="w-full min-w-[80px] flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{score.toFixed(1)}/10</span>
            </div>
            <Progress value={score * 10} className="h-1.5" />
          </div>
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
              <DropdownMenuItem onClick={() => router.push(`/production/quality-control/${row.original.id}`)}>
                <HugeiconsIcon icon={EyeIcon} className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/production/quality-control/${row.original.id}/edit`)}>
                <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 h-4 w-4" />
                Edit Inspection
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
        title="Quality Control"
        description="Manage quality inspections and test results"
        breadcrumbs={[
          { label: 'Production', href: '/production' },
          { label: 'Quality Control' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              Schedule
            </Button>
            <Link href="/production/quality-control/new">
              <Button>
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                New Inspection
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
                <p className="text-sm font-medium text-muted-foreground">Total Inspections</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Testing</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Passed</p>
                <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.avgScore.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-end gap-2">
          <div className="relative">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inspections..."
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