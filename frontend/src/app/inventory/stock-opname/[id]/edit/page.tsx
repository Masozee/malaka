'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    FloppyDiskIcon,
    CheckmarkCircle01Icon,
    Search01Icon
} from '@hugeicons/core-free-icons'
import { stockOpnameService, StockOpname } from '@/services/inventory'

// Local interface for opname items (editing view)
interface OpnameItem {
    id: string
    product_code: string
    product_name: string
    system_stock: number
    actual_stock: number
    variance: number
}

export default function EditStockOpnamePage() {
    const router = useRouter()
    const params = useParams()
    const { addToast } = useToast()
    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
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
                    actual_stock: newQty,
                    variance: newQty - item.system_stock
                }
            }
            return item
        }))
    }

    const handleSave = async (complete: boolean = false) => {
        try {
            setSaving(true)
            // Save logic here - update opname with counted items
            if (session) {
                await stockOpnameService.update(session.id, {
                    status: complete ? 'completed' : session.status
                })
            }
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
            header: 'System Qty',
            accessorKey: 'system_stock',
            cell: ({ row }) => (
                <div className="text-center font-medium bg-gray-50 dark:bg-gray-800 py-1 rounded">
                    {row.original.system_stock}
                </div>
            )
        },
        {
            id: 'actual',
            header: 'Actual Qty',
            accessorKey: 'actual_stock',
            cell: ({ row }) => (
                <Input
                    type="number"
                    className="w-24 text-center mx-auto"
                    value={row.original.actual_stock}
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

    if (loading) return <div className="p-6">Loading...</div>

    if (!session) {
        return (
            <TwoLevelLayout>
                <Header
                    title="Session Not Found"
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

    return (
        <TwoLevelLayout>
            <Header
                title={`Edit Opname: ${session.opnameNumber}`}
                description={`${session.warehouseName} (${session.warehouseCode}) ${mounted && session.opnameDate ? `• ${new Date(session.opnameDate).toLocaleDateString('id-ID')}` : ''}`}
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

                {items.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                            No opname items to count. Items will appear once the backend supports opname item data.
                        </CardContent>
                    </Card>
                ) : (
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
                )}
            </div>
        </TwoLevelLayout>
    )
}
