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
    NoteIcon,
    Clock01Icon,
    CheckmarkCircle01Icon,
    PlusSignIcon,
    Search01Icon,
    Download01Icon,
    MoreHorizontalIcon,
} from '@hugeicons/core-free-icons'
import { BookmarkToggle } from '@/components/ui/bookmark-toggle'
import { checkClearanceService, type CheckClearance } from '@/services/finance'

export default function CheckClearancePage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [data, setData] = useState<CheckClearance[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    const [form, setForm] = useState({
        check_number: '',
        check_date: '',
        bank_name: '',
        account_number: '',
        amount: 0,
        payee_name: '',
        memo: '',
    })

    useEffect(() => { setMounted(true) }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const result = await checkClearanceService.getAll()
            setData(result)
        } catch (err) {
            console.error('Failed to fetch check clearance:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const stats = useMemo(() => {
        const pendingCount = data.filter(c => c.status === 'PENDING').length
        const clearedAmount = data.filter(c => c.status === 'CLEARED').reduce((sum, c) => sum + c.amount, 0)
        return { totalCount: data.length, pendingCount, clearedAmount }
    }, [data])

    const filteredData = useMemo(() => {
        let result = data
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            result = result.filter(item =>
                item.check_number.toLowerCase().includes(lower) ||
                item.payee_name.toLowerCase().includes(lower) ||
                item.bank_name.toLowerCase().includes(lower)
            )
        }
        if (statusFilter !== 'all') {
            result = result.filter(item => item.status === statusFilter)
        }
        return result
    }, [searchTerm, statusFilter, data])

    const handleCreate = async () => {
        try {
            await checkClearanceService.create(form)
            addToast({ type: 'success', title: 'Check record created' })
            setIsCreateModalOpen(false)
            setForm({ check_number: '', check_date: '', bank_name: '', account_number: '', amount: 0, payee_name: '', memo: '' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to create check record' })
        }
    }

    const handleClear = async (id: string) => {
        try {
            const today = new Date().toISOString().split('T')[0]
            await checkClearanceService.clear(id, today)
            addToast({ type: 'success', title: 'Check cleared' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to clear check' })
        }
    }

    const handleBounce = async (id: string) => {
        try {
            await checkClearanceService.bounce(id)
            addToast({ type: 'success', title: 'Check marked as bounced' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to bounce check' })
        }
    }

    const statusConfig: Record<string, { label: string; color: string }> = {
        PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
        CLEARED: { label: 'Cleared', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
        BOUNCED: { label: 'Bounced', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
    }

    const columns: TanStackColumn<CheckClearance>[] = [
        {
            id: 'check_number',
            header: 'Check',
            accessorKey: 'check_number',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.check_number || '-'}</span>
                    <span className="text-xs text-muted-foreground">
                        {mounted && row.original.check_date ? new Date(row.original.check_date).toLocaleDateString('id-ID') : '-'}
                    </span>
                </div>
            ),
        },
        {
            id: 'bank_name',
            header: 'Bank',
            accessorKey: 'bank_name',
            cell: ({ row }) => <span className="text-sm">{row.original.bank_name || '-'}</span>,
        },
        {
            id: 'payee_name',
            header: 'Payee',
            accessorKey: 'payee_name',
            cell: ({ row }) => <span className="text-sm">{row.original.payee_name || '-'}</span>,
        },
        {
            id: 'amount',
            header: 'Amount',
            accessorKey: 'amount',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {row.original.amount.toLocaleString('id-ID')}</span>,
        },
        {
            id: 'clearance_date',
            header: 'Clearance Date',
            accessorKey: 'clearance_date',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {mounted && row.original.clearance_date ? new Date(row.original.clearance_date).toLocaleDateString('id-ID') : '-'}
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
                            <>
                                <DropdownMenuItem onClick={() => handleClear(row.original.id)}>Clear Check</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBounce(row.original.id)} className="text-red-600">Mark Bounced</DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Check Clearance"
                description="Track and manage check clearance status"
                breadcrumbs={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Check Clearance' },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <BookmarkToggle itemId="check-clearance" />
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                            New Check
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Checks</p>
                                <p className="text-2xl font-bold">{stats.totalCount}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={NoteIcon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Clearance</p>
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
                                <p className="text-sm font-medium text-muted-foreground">Cleared Amount</p>
                                <p className="text-2xl font-bold">Rp {(stats.clearedAmount / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search checks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="CLEARED">Cleared</SelectItem>
                                <SelectItem value="BOUNCED">Bounced</SelectItem>
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
                        <DialogTitle>New Check Record</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Check Number</Label>
                                <Input placeholder="CHK-001" value={form.check_number} onChange={(e) => setForm({ ...form, check_number: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Check Date</Label>
                                <Input type="date" value={form.check_date} onChange={(e) => setForm({ ...form, check_date: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bank Name</Label>
                                <Input placeholder="e.g. BCA" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Account Number</Label>
                                <Input placeholder="Account number" value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Payee Name</Label>
                                <Input placeholder="Payee name" value={form.payee_name} onChange={(e) => setForm({ ...form, payee_name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input type="number" placeholder="0" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Memo</Label>
                            <Input placeholder="Optional memo" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} />
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
