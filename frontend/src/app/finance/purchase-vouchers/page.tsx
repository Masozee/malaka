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
import { Textarea } from '@/components/ui/textarea'
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
    Invoice02Icon,
    Clock01Icon,
    Dollar01Icon,
    PlusSignIcon,
    Search01Icon,
    Download01Icon,
    MoreHorizontalIcon,
} from '@hugeicons/core-free-icons'
import { BookmarkToggle } from '@/components/ui/bookmark-toggle'
import { purchaseVoucherService, type PurchaseVoucher } from '@/services/finance'

export default function PurchaseVouchersPage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [data, setData] = useState<PurchaseVoucher[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    const [form, setForm] = useState({
        voucher_number: '',
        voucher_date: '',
        supplier_id: '',
        total_amount: 0,
        discount_amount: 0,
        tax_amount: 0,
        due_date: '',
        description: '',
    })

    useEffect(() => { setMounted(true) }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const result = await purchaseVoucherService.getAll()
            setData(result)
        } catch (err) {
            console.error('Failed to fetch purchase vouchers:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const stats = useMemo(() => {
        const totalAmount = data.reduce((sum, pv) => sum + pv.total_amount, 0)
        const pendingCount = data.filter(pv => pv.status === 'PENDING').length
        return { totalCount: data.length, totalAmount, pendingCount }
    }, [data])

    const filteredData = useMemo(() => {
        let result = data
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            result = result.filter(item =>
                item.voucher_number.toLowerCase().includes(lower) ||
                item.supplier_id.toLowerCase().includes(lower)
            )
        }
        if (statusFilter !== 'all') {
            result = result.filter(item => item.status === statusFilter)
        }
        return result
    }, [searchTerm, statusFilter, data])

    const handleCreate = async () => {
        try {
            await purchaseVoucherService.create(form)
            addToast({ type: 'success', title: 'Purchase voucher created' })
            setIsCreateModalOpen(false)
            setForm({ voucher_number: '', voucher_date: '', supplier_id: '', total_amount: 0, discount_amount: 0, tax_amount: 0, due_date: '', description: '' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to create purchase voucher' })
        }
    }

    const handleApprove = async (id: string) => {
        try {
            await purchaseVoucherService.approve(id, 'current-user')
            addToast({ type: 'success', title: 'Voucher approved' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to approve voucher' })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await purchaseVoucherService.delete(id)
            addToast({ type: 'success', title: 'Voucher deleted' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to delete voucher' })
        }
    }

    const statusConfig: Record<string, { label: string; color: string }> = {
        DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' },
        PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
        APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
        PAID: { label: 'Paid', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
    }

    const columns: TanStackColumn<PurchaseVoucher>[] = [
        {
            id: 'voucher_number',
            header: 'Voucher',
            accessorKey: 'voucher_number',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.voucher_number || '-'}</span>
                    <span className="text-xs text-muted-foreground">
                        {mounted && row.original.voucher_date ? new Date(row.original.voucher_date).toLocaleDateString('id-ID') : '-'}
                    </span>
                </div>
            ),
        },
        {
            id: 'supplier_id',
            header: 'Supplier',
            accessorKey: 'supplier_id',
            cell: ({ row }) => <span className="text-sm">{row.original.supplier_id.slice(0, 8)}...</span>,
        },
        {
            id: 'total_amount',
            header: 'Total',
            accessorKey: 'total_amount',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {row.original.total_amount.toLocaleString('id-ID')}</span>,
        },
        {
            id: 'paid_amount',
            header: 'Paid',
            accessorKey: 'paid_amount',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">Rp {row.original.paid_amount.toLocaleString('id-ID')}</span>,
        },
        {
            id: 'remaining_amount',
            header: 'Remaining',
            accessorKey: 'remaining_amount',
            cell: ({ row }) => (
                <span className={`text-sm font-medium ${row.original.remaining_amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Rp {row.original.remaining_amount.toLocaleString('id-ID')}
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
                        {row.original.status === 'PENDING' && (
                            <DropdownMenuItem onClick={() => handleApprove(row.original.id)}>
                                Approve
                            </DropdownMenuItem>
                        )}
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
                title="Purchase Vouchers"
                description="Manage purchase vouchers and supplier payments"
                breadcrumbs={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Purchase Vouchers' },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <BookmarkToggle itemId="purchase-vouchers" />
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                            New Voucher
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Vouchers</p>
                                <p className="text-2xl font-bold">{stats.totalCount}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Invoice02Icon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
                            </div>
                            <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalAmount / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search vouchers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
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
                        <DialogTitle>New Purchase Voucher</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Voucher Number</Label>
                                <Input placeholder="PV-001" value={form.voucher_number} onChange={(e) => setForm({ ...form, voucher_number: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Voucher Date</Label>
                                <Input type="date" value={form.voucher_date} onChange={(e) => setForm({ ...form, voucher_date: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Supplier ID</Label>
                            <Input placeholder="Supplier reference" value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input type="number" placeholder="0" value={form.total_amount || ''} onChange={(e) => setForm({ ...form, total_amount: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Discount</Label>
                                <Input type="number" placeholder="0" value={form.discount_amount || ''} onChange={(e) => setForm({ ...form, discount_amount: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Tax</Label>
                                <Input type="number" placeholder="0" value={form.tax_amount || ''} onChange={(e) => setForm({ ...form, tax_amount: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea placeholder="Voucher description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Create Voucher</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </TwoLevelLayout>
    )
}
