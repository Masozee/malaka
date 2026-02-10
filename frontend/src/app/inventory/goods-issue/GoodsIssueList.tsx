'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    PackageIcon,
    Search01Icon,
    Download01Icon,
    PlusSignIcon,
    EyeIcon,
    PencilEdit01Icon,
    CheckmarkCircle01Icon,
    Clock01Icon
} from '@hugeicons/core-free-icons'
import { GoodsIssue } from '@/services/inventory'

interface GoodsIssueListProps {
    data: GoodsIssue[]
    loading: boolean
}

const statusConfig: Record<string, { label: string, color: string }> = {
    Draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
    Pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' },
    Completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
    Canceled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
}

export default function GoodsIssueList({ data, loading }: GoodsIssueListProps) {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const filteredData = useMemo(() => {
        if (!searchQuery) return data
        const lower = searchQuery.toLowerCase()
        return data.filter(item =>
            (item.issueNumber && item.issueNumber.toLowerCase().includes(lower)) ||
            (item.warehouseName && item.warehouseName.toLowerCase().includes(lower)) ||
            (item.warehouseCode && item.warehouseCode.toLowerCase().includes(lower)) ||
            (item.notes && item.notes.toLowerCase().includes(lower)) ||
            (item.status && item.status.toLowerCase().includes(lower))
        )
    }, [data, searchQuery])

    const stats = useMemo(() => {
        const total = data.length
        const draft = data.filter(i => i.status === 'Draft').length
        const pending = data.filter(i => i.status === 'Pending').length
        const completed = data.filter(i => i.status === 'Completed').length
        return { total, draft, pending, completed }
    }, [data])

    const handleBatchExport = (items: GoodsIssue[]) => {
        const headers = ['Issue Number', 'Warehouse', 'Issue Date', 'Status', 'Notes']
        const rows = items.map(item => [
            item.issueNumber,
            `${item.warehouseName} (${item.warehouseCode})`,
            item.issueDate ? new Date(item.issueDate).toLocaleDateString('id-ID') : '-',
            item.status,
            item.notes || '-'
        ])
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `goods-issues-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const columns: TanStackColumn<GoodsIssue>[] = useMemo(() => [
        {
            id: 'issueNumber',
            header: 'Issue',
            accessorKey: 'issueNumber',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <Link
                        href={`/inventory/goods-issue/${row.original.id}`}
                        className="font-medium text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {row.original.issueNumber}
                    </Link>
                    {row.original.issueDate && (
                        <span className="text-xs text-muted-foreground">
                            {mounted ? new Date(row.original.issueDate).toLocaleDateString('id-ID') : ''}
                        </span>
                    )}
                </div>
            )
        },
        {
            id: 'warehouse',
            header: 'Warehouse',
            accessorKey: 'warehouseName',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{row.original.warehouseName || '-'}</span>
                    <span className="text-xs text-muted-foreground">{row.original.warehouseCode}</span>
                </div>
            )
        },
        {
            id: 'notes',
            header: 'Notes',
            accessorKey: 'notes',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                    {row.original.notes || '-'}
                </span>
            )
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const config = statusConfig[row.original.status] || statusConfig.Draft
                return (
                    <Badge className={`${config.color} border-0 whitespace-nowrap`}>
                        {config.label}
                    </Badge>
                )
            }
        }
    ], [mounted])

    return (
        <TwoLevelLayout>
            <Header
                title="Goods Issue"
                description="Process outgoing inventory and shipments"
                breadcrumbs={[
                    { label: 'Inventory', href: '/inventory' },
                    { label: 'Goods Issue' }
                ]}
                actions={
                    <Link href="/inventory/goods-issue/new">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            New Issue
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
                                <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={PackageIcon} className="h-5 w-5 text-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
                            </div>
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-foreground" />
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
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search issues..."
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
                        <div className="text-muted-foreground">Loading goods issues...</div>
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
                                onClick: (item) => router.push(`/inventory/goods-issue/${item.id}`),
                            },
                            {
                                label: 'Edit',
                                icon: PencilEdit01Icon,
                                onClick: (item) => router.push(`/inventory/goods-issue/${item.id}/edit`),
                            }
                        ]}
                    />
                )}
            </div>
        </TwoLevelLayout>
    )
}
