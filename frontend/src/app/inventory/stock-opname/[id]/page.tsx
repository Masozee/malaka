'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    PencilEdit01Icon,
    PrinterIcon,
    Download01Icon,
    Search01Icon,
    ArrowLeft01Icon
} from '@hugeicons/core-free-icons'
import { stockOpnameService, StockOpname, StockOpnameItem } from '@/services/inventory'

export default function StockOpnameDetailPage() {
    const router = useRouter()
    const params = useParams()
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState<StockOpname | null>(null)
    const [items, setItems] = useState<StockOpnameItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchSession = async () => {
            if (!params.id) return
            try {
                setLoading(true)
                // In a real app, fetch by ID

                // Mock data
                const mockSession: StockOpname = {
                    id: params.id as string,
                    opnameNumber: 'OPN-2024-001',
                    date: new Date().toISOString(),
                    warehouseId: 'WH-001',
                    warehouseName: 'Main Warehouse Jakarta',
                    status: 'completed',
                    totalItems: 5,
                    totalVariance: 3,
                    notes: 'Quarterly stock count - Completed'
                }

                const mockItems: StockOpnameItem[] = [
                    { id: '1', productCode: 'PRD-001', productName: 'Running Shoes A', systemStock: 100, actualStock: 100, variance: 0 },
                    { id: '2', productCode: 'PRD-002', productName: 'Running Shoes B', systemStock: 50, actualStock: 48, variance: -2 },
                    { id: '3', productCode: 'PRD-003', productName: 'T-Shirt C', systemStock: 200, actualStock: 200, variance: 0 },
                    { id: '4', productCode: 'PRD-004', productName: 'Socks D', systemStock: 500, actualStock: 505, variance: 5 },
                    { id: '5', productCode: 'PRD-005', productName: 'Hat E', systemStock: 75, actualStock: 75, variance: 0 },
                ]

                setSession(mockSession)
                setItems(mockItems)
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
            i.productName.toLowerCase().includes(lower) ||
            i.productCode.toLowerCase().includes(lower)
        )
    }, [items, searchQuery])

    const columns: TanStackColumn<StockOpnameItem>[] = useMemo(() => [
        {
            id: 'product',
            header: 'Product',
            accessorKey: 'productName',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm">{row.original.productName}</span>
                    <span className="text-[10px] text-muted-foreground">{row.original.productCode}</span>
                </div>
            )
        },
        {
            id: 'system',
            header: 'System',
            accessorKey: 'systemStock',
            cell: ({ row }) => (
                <div className="text-center">{row.original.systemStock}</div>
            )
        },
        {
            id: 'actual',
            header: 'Actual',
            accessorKey: 'actualStock',
            cell: ({ row }) => (
                <div className="text-center font-medium">{row.original.actualStock}</div>
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

    if (loading || !session) return <div className="p-6">Loading...</div>

    return (
        <TwoLevelLayout>
            <Header
                title={`${session.opnameNumber}`}
                description={`${session.warehouseName} • ${new Date(session.date).toLocaleDateString()}`}
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
            </div>
        </TwoLevelLayout>
    )
}
