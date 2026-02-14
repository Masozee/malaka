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
    MoneyReceiveSquareIcon,
    Clock01Icon,
    CheckmarkCircle01Icon,
    PlusSignIcon,
    Search01Icon,
    Download01Icon,
    MoreHorizontalIcon,
} from '@hugeicons/core-free-icons'
import { BookmarkToggle } from '@/components/ui/bookmark-toggle'
import { accountsReceivableService, type AccountsReceivable } from '@/services/finance'

export default function AccountsReceivablePage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [data, setData] = useState<AccountsReceivable[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    const [form, setForm] = useState({
        invoice_id: '',
        customer_id: '',
        issue_date: '',
        due_date: '',
        amount: 0,
        status: 'OPEN',
    })

    useEffect(() => { setMounted(true) }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const result = await accountsReceivableService.getAll()
            setData(result)
        } catch (err) {
            console.error('Failed to fetch accounts receivable:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const stats = useMemo(() => {
        const totalReceivable = data.reduce((sum, ar) => sum + ar.balance, 0)
        const collectedAmount = data.reduce((sum, ar) => sum + ar.paid_amount, 0)
        return { totalReceivable, collectedAmount, totalCount: data.length }
    }, [data])

    const filteredData = useMemo(() => {
        let result = data
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            result = result.filter(item =>
                item.customer_id.toLowerCase().includes(lower) ||
                item.invoice_id.toLowerCase().includes(lower)
            )
        }
        if (statusFilter !== 'all') {
            result = result.filter(item => item.status === statusFilter)
        }
        return result
    }, [searchTerm, statusFilter, data])

    const handleCreate = async () => {
        try {
            await accountsReceivableService.create(form)
            addToast({ type: 'success', title: 'AR record created' })
            setIsCreateModalOpen(false)
            setForm({ invoice_id: '', customer_id: '', issue_date: '', due_date: '', amount: 0, status: 'OPEN' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to create AR record' })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await accountsReceivableService.delete(id)
            addToast({ type: 'success', title: 'AR record deleted' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to delete AR record' })
        }
    }

    const statusConfig: Record<string, { label: string; color: string }> = {
        OPEN: { label: 'Open', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
        PARTIAL: { label: 'Partial', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
        PAID: { label: 'Paid', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
        OVERDUE: { label: 'Overdue', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
    }

    const columns: TanStackColumn<AccountsReceivable>[] = [
        {
            id: 'customer_id',
            header: 'Customer',
            accessorKey: 'customer_id',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.customer_id.slice(0, 8)}...</span>
                    <span className="text-xs text-muted-foreground">INV: {row.original.invoice_id.slice(0, 8)}...</span>
                </div>
            ),
        },
        {
            id: 'issue_date',
            header: 'Issue Date',
            accessorKey: 'issue_date',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {mounted && row.original.issue_date ? new Date(row.original.issue_date).toLocaleDateString('id-ID') : '-'}
                </span>
            ),
        },
        {
            id: 'due_date',
            header: 'Due Date',
            accessorKey: 'due_date',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {mounted && row.original.due_date ? new Date(row.original.due_date).toLocaleDateString('id-ID') : '-'}
                </span>
            ),
        },
        {
            id: 'amount',
            header: 'Amount',
            accessorKey: 'amount',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {row.original.amount.toLocaleString('id-ID')}</span>,
        },
        {
            id: 'paid_amount',
            header: 'Collected',
            accessorKey: 'paid_amount',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">Rp {row.original.paid_amount.toLocaleString('id-ID')}</span>,
        },
        {
            id: 'balance',
            header: 'Balance',
            accessorKey: 'balance',
            cell: ({ row }) => (
                <span className={`text-sm font-medium ${row.original.balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    Rp {row.original.balance.toLocaleString('id-ID')}
                </span>
            ),
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
                        <DropdownMenuItem>Record Receipt</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row.original.id)}>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Accounts Receivable"
                description="Track and manage outstanding receivables from customers"
                breadcrumbs={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Accounts Receivable' },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <BookmarkToggle itemId="accounts-receivable" />
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                            New AR
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Receivable</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalReceivable / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={MoneyReceiveSquareIcon} className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Collected</p>
                                <p className="text-2xl font-bold">Rp {(stats.collectedAmount / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                                <p className="text-2xl font-bold">{stats.totalCount}</p>
                            </div>
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by customer or invoice..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="OPEN">Open</SelectItem>
                                <SelectItem value="PARTIAL">Partial</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                                <SelectItem value="OVERDUE">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="h-9">
                            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-muted-foreground">Loading...</div>
                ) : (
                    <TanStackDataTable data={filteredData} columns={columns} enableRowSelection showColumnToggle={false} />
                )}
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Accounts Receivable</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Invoice ID</Label>
                            <Input placeholder="Invoice reference" value={form.invoice_id} onChange={(e) => setForm({ ...form, invoice_id: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Customer ID</Label>
                            <Input placeholder="Customer reference" value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Issue Date</Label>
                                <Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input type="number" placeholder="0" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Create</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </TwoLevelLayout>
    )
}
