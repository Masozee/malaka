'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { barcodeService, BarcodePrintJob } from '@/services/inventory'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PrinterIcon,
  Search01Icon,
  FilterIcon,
  Download01Icon,
  PlusSignIcon,
  File01Icon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Settings01Icon,
  QrCodeIcon,
  EyeIcon
} from '@hugeicons/core-free-icons'

const statusColors: Record<string, string> = {
  queued: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  printing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200'
}

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  normal: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  high: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
  urgent: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
}

const barcodeTypeColors: Record<string, string> = {
  ean13: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  code128: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  qr: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  datamatrix: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
  code39: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200'
}

export default function BarcodePrintPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [data, setData] = useState<BarcodePrintJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await barcodeService.getAll()
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch barcode jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = useMemo(() => {
    if (!searchQuery) return data
    const lower = searchQuery.toLowerCase()
    return data.filter(item =>
      item.jobNumber.toLowerCase().includes(lower) ||
      item.jobName.toLowerCase().includes(lower) ||
      item.printerName.toLowerCase().includes(lower)
    )
  }, [data, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const total = data.length
    const printing = data.filter(job => job.status === 'printing').length
    const completed = data.filter(job => job.status === 'completed').length
    const failed = data.filter(job => job.status === 'failed').length
    return { total, printing, completed, failed }
  }, [data])

  const columns: TanStackColumn<BarcodePrintJob>[] = useMemo(() => [
    {
      id: 'jobInfo',
      header: 'Job Information',
      accessorKey: 'jobNumber',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
            {row.original.jobNumber}
          </span>
          <span className="text-[10px] text-muted-foreground">{row.original.jobName}</span>
        </div>
      )
    },
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'barcodeType',
      cell: ({ row }) => {
        const type = row.original.barcodeType
        return (
          <Badge className={`${barcodeTypeColors[type]} border-0 uppercase`}>
            {type}
          </Badge>
        )
      }
    },
    {
      id: 'priority',
      header: 'Priority',
      accessorKey: 'priority',
      cell: ({ row }) => {
        const priority = row.original.priority
        return (
          <Badge className={`${priorityColors[priority]} border-0 capitalize`}>
            {priority}
          </Badge>
        )
      }
    },
    {
      id: 'progress',
      header: 'Progress',
      accessorKey: 'printedLabels',
      cell: ({ row }) => {
        const progress = (row.original.printedLabels / row.original.totalLabels) * 100
        const color = row.original.status === 'failed' ? 'bg-red-600' : 'bg-blue-600'
        return (
          <div className="w-full min-w-[100px] flex flex-col gap-1">
            <div className="flex justify-between text-[10px]">
              <span>{row.original.printedLabels} / {row.original.totalLabels}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className={`${color} h-1.5 rounded-full transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )
      }
    },
    {
      id: 'printer',
      header: 'Printer',
      accessorKey: 'printerName',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-xs">
          <HugeiconsIcon icon={PrinterIcon} className="h-4 w-4 text-muted-foreground" />
          <span className="truncate max-w-[150px]" title={row.original.printerName}>
            {row.original.printerName}
          </span>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
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
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <HugeiconsIcon icon={EyeIcon} className="h-4 w-4" />
          </Button>
        </div>

      )
    }

  ], [])

  return (
    <TwoLevelLayout>
      <Header
        title="Barcode Print Management"
        description="Manage print jobs and printer configurations"
        breadcrumbs={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Barcode Print' }
        ]}
        actions={
          <Button>
            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
            New Print Job
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600">
                <HugeiconsIcon icon={File01Icon} className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Printing</p>
                <p className="text-2xl font-bold text-blue-600">{stats.printing}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600">
                <HugeiconsIcon icon={PrinterIcon} className="h-6 w-6" />
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
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <div className="h-10 w-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-600">
                <HugeiconsIcon icon={AlertCircleIcon} className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-end gap-2">
          <div className="relative">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search print jobs..."
              className="pl-9 w-64"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4 mr-2" />
            Printers
          </Button>
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={QrCodeIcon} className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 mr-2" />
            Filters
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