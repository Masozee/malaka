'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { returnSupplierService, ReturnSupplier } from '@/services/inventory'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    Search01Icon,
    Download01Icon,
    PlusSignIcon,
    ReloadIcon,
    EyeIcon,
    PencilEdit01Icon
} from '@hugeicons/core-free-icons'

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
            (item.returnNumber && item.returnNumber.toLowerCase().includes(lower)) ||
            (item.supplierName && item.supplierName.toLowerCase().includes(lower)) ||
            (item.reason && item.reason.toLowerCase().includes(lower))
        )
    }, [data, searchQuery])

    const stats = useMemo(() => {
        const total = data.length
        return { total }
    }, [data])

    const handleBatchExport = (items: ReturnSupplier[]) => {
        const headers = ['Return Number', 'Supplier', 'Reason', 'Return Date']
        const rows = items.map(item => [
            item.returnNumber,
            item.supplierName || '-',
            item.reason || '-',
            item.returnDate ? new Date(item.returnDate).toLocaleDateString('id-ID') : '-'
        ])
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `return-supplier-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const columns: TanStackColumn<ReturnSupplier>[] = useMemo(() => [
        {
            id: 'returnNumber',
            accessorKey: 'returnNumber',
            header: 'Return',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <Link
                        href={`/inventory/return-supplier/${row.original.id}`}
                        className="font-medium text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        {row.original.returnNumber}
                    </Link>
                    {row.original.returnDate && (
                        <span className="text-xs text-muted-foreground">
                            {mounted ? new Date(row.original.returnDate).toLocaleDateString('id-ID') : ''}
                        </span>
                    )}
                </div>
            )
        },
        {
            id: 'supplier',
            accessorKey: 'supplierName',
            header: 'Supplier',
            cell: ({ row }) => (
                <span className="text-sm font-medium">
                    {row.original.supplierName || '-'}
                </span>
            )
        },
        {
            id: 'reason',
            accessorKey: 'reason',
            header: 'Reason',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                    {row.original.reason || '-'}
                </span>
            )
        },
        {
            id: 'date',
            accessorKey: 'returnDate',
            header: 'Return Date',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {mounted && row.original.returnDate
                        ? new Date(row.original.returnDate).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })
                        : '-'}
                </span>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Returns</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={ReloadIcon} className="h-5 w-5 text-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search returns..."
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
                        <div className="text-muted-foreground">Loading returns...</div>
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
                                onClick: (item) => router.push(`/inventory/return-supplier/${item.id}`),
                            },
                            {
                                label: 'Edit',
                                icon: PencilEdit01Icon,
                                onClick: (item) => router.push(`/inventory/return-supplier/${item.id}/edit`),
                            }
                        ]}
                    />
                )}
            </div>
        </TwoLevelLayout>
    )
}
