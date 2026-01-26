'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    ArrowLeft01Icon,
    FloppyDiskIcon,
    CheckmarkCircle01Icon,
    Search01Icon,
    AlertCircleIcon
} from '@hugeicons/core-free-icons'
import { stockOpnameService, StockOpname, StockOpnameItem } from '@/services/inventory'

export default function EditStockOpnamePage() {
    const router = useRouter()
    const params = useParams()
    const { addToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [session, setSession] = useState<StockOpname | null>(null)
    const [items, setItems] = useState<StockOpnameItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchSession = async () => {
            if (!params.id) return
            try {
                setLoading(true)
                // In a real app, fetch by ID
                // const data = await stockOpnameService.getById(params.id as string)

                // Mock data for now since we don't know if the ID exists in backend
                const mockSession: StockOpname = {
                    id: params.id as string,
                    opnameNumber: 'OPN-2024-001',
                    date: new Date().toISOString(),
                    warehouseId: 'WH-001',
                    warehouseName: 'Main Warehouse Jakarta',
                    status: 'in_progress',
                    totalItems: 5,
                    totalVariance: 0,
                    notes: 'Quarterly stock count'
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
                addToast({ type: 'error', title: 'Failed to load session details' })
            } finally {
                setLoading(false)
            }
        }
        fetchSession()
    }, [params.id])

    const handleQuantityChange = (id: string, newQty: number) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    actualStock: newQty,
                    variance: newQty - item.systemStock
                }
            }
            return item
        }))
    }

    const handleSave = async (complete: boolean = false) => {
        try {
            setSaving(true)
            // Save logic here
            await new Promise(resolve => setTimeout(resolve, 1000))
            addToast({ type: 'success', title: complete ? 'Session completed' : 'Progress saved' })
            if (complete) {
                router.push('/inventory/stock-opname')
            }
        } catch (error) {
            addToast({ type: 'error', title: 'Failed to save' })
        } finally {
            setSaving(false)
        }
    }

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
            header: 'System Qty',
            accessorKey: 'systemStock',
            cell: ({ row }) => (
                <div className="text-center font-medium bg-gray-50 dark:bg-gray-800 py-1 rounded">
                    {row.original.systemStock}
                </div>
            )
        },
        {
            id: 'actual',
            header: 'Actual Qty',
            accessorKey: 'actualStock',
            cell: ({ row }) => (
                <Input
                    type="number"
                    className="w-24 text-center mx-auto"
                    value={row.original.actualStock}
                    onChange={(e) => handleQuantityChange(row.original.id, parseInt(e.target.value) || 0)}
                />
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
    ], [items])

    if (loading || !session) return <div className="p-6">Loading...</div>

    return (
        <TwoLevelLayout>
            <Header
                title={`Edit Session: ${session.opnameNumber}`}
                description={`${session.warehouseName} • ${new Date(session.date).toLocaleDateString()}`}
                breadcrumbs={[
                    { label: 'Inventory', href: '/inventory' },
                    { label: 'Stock Opname', href: '/inventory/stock-opname' },
                    { label: session.opnameNumber }
                ]}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                            <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button onClick={() => handleSave(true)} disabled={saving}>
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 mr-2" />
                            Finish Count
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find item..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Matched: {items.filter(i => i.variance === 0).length}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Mismatch: {items.filter(i => i.variance !== 0).length}
                        </span>
                    </div>
                </div>

                <Card>
                    <TanStackDataTable
                        data={filteredItems}
                        columns={columns}
                        pagination={{
                            pageSize: 50,
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
