'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    PencilEdit01Icon,
    PrinterIcon,
    Download01Icon,
    Search01Icon,
    ArrowLeft01Icon,
    CheckmarkCircle01Icon,
    Clock01Icon,
    AlertCircleIcon,
    Calendar01Icon
} from '@hugeicons/core-free-icons'
import { stockOpnameService, StockOpname } from '@/services/inventory'

// Local interface for opname items (not available from backend list endpoint)
interface OpnameItem {
    id: string
    product_code: string
    product_name: string
    system_stock: number
    actual_stock: number
    variance: number
}

const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: Clock01Icon },
    in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200', icon: Clock01Icon },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200', icon: CheckmarkCircle01Icon },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200', icon: AlertCircleIcon }
}

export default function StockOpnameDetailPage() {
    const router = useRouter()
    const params = useParams()
    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState<StockOpname | null>(null)
    const [items, setItems] = useState<OpnameItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const fetchSession = async () => {
            if (!params.id) return
            try {
                setLoading(true)
                const data = await stockOpnameService.getById(params.id as string)
                setSession(data)
                // Items would come from a separate endpoint or nested in the response
                // For now, the backend only returns the opname header
                setItems([])
            } catch (error) {
                console.error('Failed to fetch session:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchSession()
    }, [params.id])

    const filteredItems = useMemo(() => {
        if (!searchQuery) return items
        const lower = searchQuery.toLowerCase()
        return items.filter(i =>
            i.product_name.toLowerCase().includes(lower) ||
            i.product_code.toLowerCase().includes(lower)
        )
    }, [items, searchQuery])

    const columns: TanStackColumn<OpnameItem>[] = useMemo(() => [
        {
            id: 'product',
            header: 'Product',
            accessorKey: 'product_name',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm">{row.original.product_name}</span>
                    <span className="text-[10px] text-muted-foreground">{row.original.product_code}</span>
                </div>
            )
        },
        {
            id: 'system',
            header: 'System',
            accessorKey: 'system_stock',
            cell: ({ row }) => (
                <div className="text-center">{row.original.system_stock}</div>
            )
        },
        {
            id: 'actual',
            header: 'Actual',
            accessorKey: 'actual_stock',
            cell: ({ row }) => (
                <div className="text-center font-medium">{row.original.actual_stock}</div>
            )
        },
        {
            id: 'variance',
            header: 'Variance',
            accessorKey: 'variance',
            cell: ({ row }) => {
                const variance = row.original.variance
                const isZero = variance === 0
                const color = isZero ? 'text-gray-400' : variance > 0 ? 'text-green-600' : 'text-red-600'
                return (
                    <div className={`text-center font-bold ${color}`}>
                        {variance > 0 ? '+' : ''}{variance}
                    </div>
                )
            }
        }
    ], [])

    if (loading) {
        return (
            <TwoLevelLayout>
                <Header
                    title="Stock Opname"
                    breadcrumbs={[
                        { label: 'Inventory', href: '/inventory' },
                        { label: 'Stock Opname', href: '/inventory/stock-opname' },
                    ]}
                />
                <div className="flex justify-center items-center h-64">
                    <div className="text-muted-foreground">Loading...</div>
                </div>
            </TwoLevelLayout>
        )
    }

    if (!session) {
        return (
            <TwoLevelLayout>
                <Header
                    title="Stock Opname Not Found"
                    breadcrumbs={[
                        { label: 'Inventory', href: '/inventory' },
                        { label: 'Stock Opname', href: '/inventory/stock-opname' },
                    ]}
                />
                <div className="flex flex-col justify-center items-center h-64 p-6">
                    <p className="text-muted-foreground">Session not found</p>
                    <Button variant="outline" className="mt-4" onClick={() => router.push('/inventory/stock-opname')}>
                        Back to List
                    </Button>
                </div>
            </TwoLevelLayout>
        )
    }

    const status = statusConfig[session.status] || statusConfig.draft

    return (
        <TwoLevelLayout>
            <Header
                title={session.opnameNumber}
                description={`${session.warehouseName} (${session.warehouseCode}) ${mounted && session.opnameDate ? `• ${new Date(session.opnameDate).toLocaleDateString('id-ID')}` : ''}`}
                breadcrumbs={[
                    { label: 'Inventory', href: '/inventory' },
                    { label: 'Stock Opname', href: '/inventory/stock-opname' },
                    { label: session.opnameNumber }
                ]}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <HugeiconsIcon icon={PrinterIcon} className="h-4 w-4 mr-2" />
                            Print Report
                        </Button>
                        {session.status !== 'completed' && (
                            <Link href={`/inventory/stock-opname/${session.id}/edit`}>
                                <Button>
                                    <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                                    Continue Count
                                </Button>
                            </Link>
                        )}
                    </div>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Session Info */}
                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                                <Badge className={`${status.color} mt-1 border-0 flex items-center gap-1 w-fit`}>
                                    <HugeiconsIcon icon={status.icon} className="h-3 w-3" />
                                    {status.label}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Warehouse</p>
                                <p className="text-sm font-medium mt-1">{session.warehouseName}</p>
                                <p className="text-xs text-muted-foreground">{session.warehouseCode}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Date</p>
                                <p className="text-sm mt-1">
                                    {mounted && session.opnameDate ? new Date(session.opnameDate).toLocaleDateString('id-ID') : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Items</p>
                                <p className="text-2xl font-bold">{items.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Total Items</p>
                            <p className="text-2xl font-bold">{items.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Matched</p>
                            <p className="text-2xl font-bold text-green-600">{items.filter(i => i.variance === 0).length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Variance (+)</p>
                            <p className="text-2xl font-bold text-blue-600">{items.filter(i => i.variance > 0).reduce((s, i) => s + i.variance, 0)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Variance (-)</p>
                            <p className="text-2xl font-bold text-red-600">{Math.abs(items.filter(i => i.variance < 0).reduce((s, i) => s + i.variance, 0))}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search & Items Table */}
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search items..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>

                {items.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                            No opname items recorded yet.
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <TanStackDataTable
                            data={filteredItems}
                            columns={columns}
                            pagination={{
                                pageSize: 20,
                                pageIndex: 0,
                                totalRows: filteredItems.length,
                                onPageChange: () => { }
                            }}
                        />
                    </Card>
                )}
            </div>
        </TwoLevelLayout>
    )
}
