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
import { barcodeService, BarcodePrintJob } from '@/services/inventory'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    PrinterIcon,
    Search01Icon,
    Download01Icon,
    PlusSignIcon,
    File01Icon,
    CheckmarkCircle01Icon,
    AlertCircleIcon,
    EyeIcon,
    PencilEdit01Icon
} from '@hugeicons/core-free-icons'

const statusColors: Record<string, { label: string; color: string }> = {
    queued: { label: 'Queued', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
    printing: { label: 'Printing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
    paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' }
}

const barcodeTypeColors: Record<string, string> = {
    ean13: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    code128: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    qr: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
    datamatrix: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
    code39: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200'
}

export default function BarcodePrintPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [data, setData] = useState<BarcodePrintJob[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
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

    const stats = useMemo(() => {
        const total = data.length
        const printing = data.filter(job => job.status === 'printing').length
        const completed = data.filter(job => job.status === 'completed').length
        const failed = data.filter(job => job.status === 'failed').length
        return { total, printing, completed, failed }
    }, [data])

    const handleBatchExport = (items: BarcodePrintJob[]) => {
        const headers = ['Job #', 'Job Name', 'Type', 'Priority', 'Printed', 'Total', 'Printer', 'Status']
        const rows = items.map(item => [
            item.jobNumber,
            item.jobName,
            item.barcodeType,
            item.priority,
            item.printedLabels,
            item.totalLabels,
            item.printerName,
            item.status
        ])
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `barcode-print-jobs-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const columns: TanStackColumn<BarcodePrintJob>[] = useMemo(() => [
        {
            id: 'jobInfo',
            header: 'Job Information',
            accessorKey: 'jobNumber',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <Link
                        href={`/inventory/barcode-print/${row.original.id}`}
                        className="font-medium text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {row.original.jobNumber}
                    </Link>
                    <span className="text-xs text-muted-foreground">{row.original.jobName}</span>
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
                    <Badge className={`${barcodeTypeColors[type] || ''} border-0 uppercase`}>
                        {type}
                    </Badge>
                )
            }
        },
        {
            id: 'priority',
            header: 'Priority',
            accessorKey: 'priority',
            cell: ({ row }) => (
                <span className="text-sm capitalize">{row.original.priority}</span>
            )
        },
        {
            id: 'progress',
            header: 'Progress',
            accessorKey: 'printedLabels',
            cell: ({ row }) => {
                const total = row.original.totalLabels || 1
                const progress = (row.original.printedLabels / total) * 100
                const color = row.original.status === 'failed' ? 'bg-red-600' : 'bg-blue-600'
                return (
                    <div className="w-full min-w-[100px] flex flex-col gap-1">
                        <div className="flex justify-between text-xs">
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
                <span className="text-sm text-muted-foreground truncate max-w-[150px] block" title={row.original.printerName}>
                    {row.original.printerName}
                </span>
            )
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const config = statusColors[row.original.status] || statusColors.queued
                return (
                    <Badge className={`${config.color} border-0 whitespace-nowrap`}>
                        {config.label}
                    </Badge>
                )
            }
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
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={File01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Printing</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.printing}</p>
                            </div>
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={PrinterIcon} className="h-5 w-5 text-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                            </div>
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                            </div>
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search print jobs..."
                            className="pl-9 h-9 bg-white dark:bg-gray-900"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-9" onClick={() => handleBatchExport(filteredData)}>
                            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                            Export All
                        </Button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-muted-foreground">Loading print jobs...</div>
                    </div>
                ) : (
                    <TanStackDataTable
                        data={filteredData}
                        columns={columns}
                        enableRowSelection
                        showColumnToggle={false}
                        onBatchExport={handleBatchExport}
                        customActions={[
                            {
                                label: 'View',
                                icon: EyeIcon,
                                onClick: (item) => router.push(`/inventory/barcode-print/${item.id}`),
                            },
                            {
                                label: 'Edit',
                                icon: PencilEdit01Icon,
                                onClick: (item) => router.push(`/inventory/barcode-print/${item.id}/edit`),
                            }
                        ]}
                    />
                )}
            </div>
        </TwoLevelLayout>
    )
}
