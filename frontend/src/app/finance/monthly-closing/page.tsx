'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    Calendar01Icon,
    CheckmarkCircle01Icon,
    Dollar01Icon,
    PlusSignIcon,
    Search01Icon,
    Download01Icon,
    MoreHorizontalIcon,
} from '@hugeicons/core-free-icons'
import { BookmarkToggle } from '@/components/ui/bookmark-toggle'
import { monthlyClosingService, type MonthlyClosing } from '@/services/finance'

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function MonthlyClosingPage() {
    const { addToast } = useToast()
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [data, setData] = useState<MonthlyClosing[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    const [form, setForm] = useState({
        period_year: new Date().getFullYear(),
        period_month: new Date().getMonth() + 1,
        closing_date: '',
        total_revenue: 0,
        total_expenses: 0,
        cash_position: 0,
        bank_position: 0,
        accounts_receivable: 0,
        accounts_payable: 0,
        inventory_value: 0,
    })

    useEffect(() => { setMounted(true) }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const result = await monthlyClosingService.getAll()
            setData(result)
        } catch (err) {
            console.error('Failed to fetch monthly closings:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const stats = useMemo(() => {
        const openCount = data.filter(mc => mc.status === 'OPEN').length
        const lastClosed = data.find(mc => mc.status === 'CLOSED')
        const latestNetIncome = data.length > 0 ? data[0].net_income : 0
        return { openCount, lastClosed, latestNetIncome }
    }, [data])

    const filteredData = useMemo(() => {
        if (statusFilter === 'all') return data
        return data.filter(item => item.status === statusFilter)
    }, [statusFilter, data])

    const handleCreate = async () => {
        try {
            await monthlyClosingService.create({
                ...form,
                closing_date: form.closing_date ? new Date(form.closing_date + 'T00:00:00Z').toISOString() : new Date().toISOString(),
            })
            addToast({ type: 'success', title: 'Period created' })
            setIsCreateModalOpen(false)
            setForm({
                period_year: new Date().getFullYear(),
                period_month: new Date().getMonth() + 1,
                closing_date: '',
                total_revenue: 0,
                total_expenses: 0,
                cash_position: 0,
                bank_position: 0,
                accounts_receivable: 0,
                accounts_payable: 0,
                inventory_value: 0,
            })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to create period' })
        }
    }

    const handleCloseMonth = async (id: string) => {
        try {
            await monthlyClosingService.closeMonth(id, 'current-user')
            addToast({ type: 'success', title: 'Month closed successfully' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to close month' })
        }
    }

    const statusConfig: Record<string, { label: string; color: string }> = {
        OPEN: { label: 'Open', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
        CLOSED: { label: 'Closed', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
        LOCKED: { label: 'Locked', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' },
    }

    const columns: TanStackColumn<MonthlyClosing>[] = [
        {
            id: 'period',
            header: 'Period',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">
                        {MONTH_NAMES[row.original.period_month]} {row.original.period_year}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {mounted && row.original.closing_date ? new Date(row.original.closing_date).toLocaleDateString('id-ID') : '-'}
                    </span>
                </div>
            ),
        },
        {
            id: 'total_revenue',
            header: 'Revenue',
            accessorKey: 'total_revenue',
            cell: ({ row }) => <span className="text-sm font-medium text-green-600">Rp {row.original.total_revenue.toLocaleString('id-ID')}</span>,
        },
        {
            id: 'total_expenses',
            header: 'Expenses',
            accessorKey: 'total_expenses',
            cell: ({ row }) => <span className="text-sm text-red-600">Rp {row.original.total_expenses.toLocaleString('id-ID')}</span>,
        },
        {
            id: 'net_income',
            header: 'Net Income',
            accessorKey: 'net_income',
            cell: ({ row }) => (
                <span className={`text-sm font-bold ${row.original.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Rp {row.original.net_income.toLocaleString('id-ID')}
                </span>
            ),
        },
        {
            id: 'cash_position',
            header: 'Cash Position',
            accessorKey: 'cash_position',
            cell: ({ row }) => <span className="text-sm">Rp {row.original.cash_position.toLocaleString('id-ID')}</span>,
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const s = statusConfig[row.original.status] || { label: row.original.status, color: 'bg-gray-100 text-gray-800' }
                return <Badge className={`${s.color} border-0 whitespace-nowrap`}>{s.label}</Badge>
            },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        {row.original.status === 'OPEN' && (
                            <DropdownMenuItem onClick={() => handleCloseMonth(row.original.id)}>
                                Close Month
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Monthly Closing"
                description="Manage monthly financial closing periods"
                breadcrumbs={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Monthly Closing' },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <BookmarkToggle itemId="monthly-closing" />
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                            New Period
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Open Periods</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.openCount}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Last Closed</p>
                                <p className="text-2xl font-bold">
                                    {stats.lastClosed
                                        ? `${MONTH_NAMES[stats.lastClosed.period_month]} ${stats.lastClosed.period_year}`
                                        : '-'}
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Latest Net Income</p>
                                <p className={`text-2xl font-bold ${stats.latestNetIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    Rp {(stats.latestNetIncome / 1000000).toFixed(1)}M
                                </p>
                            </div>
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="OPEN">Open</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
                                <SelectItem value="LOCKED">Locked</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline" className="h-9">
                        <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">Loading...</div>
                ) : (
                    <TanStackDataTable data={filteredData} columns={columns} enableRowSelection showColumnToggle={false} />
                )}
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>New Closing Period</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Year</Label>
                                <Input type="number" value={form.period_year} onChange={(e) => setForm({ ...form, period_year: parseInt(e.target.value) || 2024 })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Month</Label>
                                <Select value={String(form.period_month)} onValueChange={(v) => setForm({ ...form, period_month: parseInt(v) })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {MONTH_NAMES.slice(1).map((m, i) => (
                                            <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Closing Date</Label>
                                <Input type="date" value={form.closing_date} onChange={(e) => setForm({ ...form, closing_date: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Revenue</Label>
                                <Input type="number" placeholder="0" value={form.total_revenue || ''} onChange={(e) => setForm({ ...form, total_revenue: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Expenses</Label>
                                <Input type="number" placeholder="0" value={form.total_expenses || ''} onChange={(e) => setForm({ ...form, total_expenses: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cash Position</Label>
                                <Input type="number" placeholder="0" value={form.cash_position || ''} onChange={(e) => setForm({ ...form, cash_position: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Bank Position</Label>
                                <Input type="number" placeholder="0" value={form.bank_position || ''} onChange={(e) => setForm({ ...form, bank_position: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Accounts Receivable</Label>
                                <Input type="number" placeholder="0" value={form.accounts_receivable || ''} onChange={(e) => setForm({ ...form, accounts_receivable: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Accounts Payable</Label>
                                <Input type="number" placeholder="0" value={form.accounts_payable || ''} onChange={(e) => setForm({ ...form, accounts_payable: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Inventory Value</Label>
                            <Input type="number" placeholder="0" value={form.inventory_value || ''} onChange={(e) => setForm({ ...form, inventory_value: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Create Period</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </TwoLevelLayout>
    )
}
