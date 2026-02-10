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
import { HugeiconsIcon } from '@hugeicons/react'
import {
    PencilEdit01Icon,
    Download01Icon,
    Search01Icon,
    CheckmarkCircle01Icon,
    Clock01Icon,
    AlertCircleIcon,
    Delete01Icon
} from '@hugeicons/core-free-icons'
import { stockOpnameService, StockOpnameDetail } from '@/services/inventory'
import { useToast } from '@/components/ui/toast'

const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
    planned: { label: 'Planned', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200', icon: Clock01Icon },
    in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200', icon: Clock01Icon },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200', icon: CheckmarkCircle01Icon },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200', icon: AlertCircleIcon }
}

export default function StockOpnameDetailPage() {
    const router = useRouter()
    const params = useParams()
    const { addToast } = useToast()
    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState<StockOpnameDetail | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const fetchSession = async () => {
            if (!params.id) return
            try {
                setLoading(true)
                const data = await stockOpnameService.getDetail(params.id as string)
                setSession(data)
            } catch (error) {
                console.error('Failed to fetch session:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchSession()
    }, [params.id])

    const items = session?.items || []

    const filteredItems = useMemo(() => {
        if (!searchQuery) return items
        const lower = searchQuery.toLowerCase()
        return items.filter(i =>
            i.articleName.toLowerCase().includes(lower) ||
            i.articleCode.toLowerCase().includes(lower)
        )
    }, [items, searchQuery])

    const handleDelete = async () => {
        if (!session) return
        if (!confirm('Are you sure you want to delete this stock opname session?')) return
        try {
            await stockOpnameService.delete(session.id)
            addToast({ type: 'success', title: 'Stock opname deleted' })
            router.push('/inventory/stock-opname')
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to delete stock opname' })
        }
    }

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

    const status = statusConfig[session.status] || statusConfig.planned
    const matchedCount = items.filter(i => i.variance === 0).length
    const positiveVariance = items.filter(i => i.variance > 0).reduce((s, i) => s + i.variance, 0)
    const negativeVariance = Math.abs(items.filter(i => i.variance < 0).reduce((s, i) => s + i.variance, 0))

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
                        <Button variant="outline" size="sm" onClick={handleDelete}>
                            <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                        {session.status !== 'completed' && (
                            <Link href={`/inventory/stock-opname/${session.id}/edit`}>
                                <Button size="sm">
                                    <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                    </div>
                }
            />

            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Session Info */}
                <Card>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Notes</p>
                                <p className="text-sm mt-1">{session.notes || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                {items.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-4 text-center">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Total Items</p>
                            <p className="text-2xl font-bold">{items.length}</p>
                        </Card>
                        <Card className="p-4 text-center">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Matched</p>
                            <p className="text-2xl font-bold text-green-600">{matchedCount}</p>
                        </Card>
                        <Card className="p-4 text-center">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Variance (+)</p>
                            <p className="text-2xl font-bold text-blue-600">{positiveVariance}</p>
                        </Card>
                        <Card className="p-4 text-center">
                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Variance (-)</p>
                            <p className="text-2xl font-bold text-red-600">{negativeVariance}</p>
                        </Card>
                    </div>
                )}

                {/* Items Table */}
                {items.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <p className="text-muted-foreground">No articles have been counted in this session yet.</p>
                            <p className="text-sm text-muted-foreground mt-1">A stock opname requires at least one article to compare system vs actual quantities.</p>
                            {session.status !== 'completed' && (
                                <Link href={`/inventory/stock-opname/${session.id}/edit`}>
                                    <Button className="mt-4">
                                        <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                                        Add Items & Start Counting
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Opname Items</CardTitle>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search items..."
                                            className="pl-9 w-64"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-[14px]">
                                    <thead>
                                        <tr className="border-y border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                            <th className="text-left py-3 px-4 text-[13px] font-semibold text-muted-foreground w-12">#</th>
                                            <th className="text-left py-3 px-4 text-[13px] font-semibold text-muted-foreground">Article</th>
                                            <th className="text-left py-3 px-4 text-[13px] font-semibold text-muted-foreground w-28">Code</th>
                                            <th className="text-right py-3 px-4 text-[13px] font-semibold text-muted-foreground w-28">System Qty</th>
                                            <th className="text-right py-3 px-4 text-[13px] font-semibold text-muted-foreground w-28">Actual Qty</th>
                                            <th className="text-center py-3 px-4 text-[13px] font-semibold text-muted-foreground w-24">Variance</th>
                                            <th className="text-left py-3 px-4 text-[13px] font-semibold text-muted-foreground">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredItems.map((item, index) => {
                                            const variance = item.variance
                                            const varianceColor = variance === 0 ? 'text-gray-400' : variance > 0 ? 'text-green-600' : 'text-red-600'
                                            return (
                                                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                    <td className="py-3 px-4 text-muted-foreground">{index + 1}</td>
                                                    <td className="py-3 px-4 font-medium">{item.articleName}</td>
                                                    <td className="py-3 px-4">
                                                        <span className="font-mono text-[13px] text-muted-foreground">{item.articleCode || '-'}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">{item.systemQty}</td>
                                                    <td className="py-3 px-4 text-right font-medium">{item.actualQty}</td>
                                                    <td className="py-3 px-4">
                                                        <div className={`text-center font-bold ${varianceColor}`}>
                                                            {variance > 0 ? '+' : ''}{variance}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-muted-foreground">{item.notes || '-'}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-sm text-muted-foreground">
                                Showing {filteredItems.length} of {items.length} items
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </TwoLevelLayout>
    )
}
