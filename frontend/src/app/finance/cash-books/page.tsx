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
    BookOpen01Icon,
    CheckmarkCircle01Icon,
    Dollar01Icon,
    PlusSignIcon,
    Search01Icon,
    Download01Icon,
    MoreHorizontalIcon,
} from '@hugeicons/core-free-icons'
import { BookmarkToggle } from '@/components/ui/bookmark-toggle'
import { cashBookService, type CashBook } from '@/services/finance'

export default function CashBooksPage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [data, setData] = useState<CashBook[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    const [form, setForm] = useState({
        book_code: '',
        book_name: '',
        book_type: 'CASH',
        account_number: '',
        bank_name: '',
        opening_balance: 0,
    })

    useEffect(() => { setMounted(true) }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            if (typeFilter !== 'all') {
                const result = await cashBookService.getByType(typeFilter)
                setData(result)
            } else {
                const result = await cashBookService.getAll()
                setData(result)
            }
        } catch (err) {
            console.error('Failed to fetch cash books:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [typeFilter])

    const stats = useMemo(() => {
        const activeCount = data.filter(cb => cb.is_active).length
        const totalBalance = data.reduce((sum, cb) => sum + cb.current_balance, 0)
        return { totalCount: data.length, activeCount, totalBalance }
    }, [data])

    const filteredData = useMemo(() => {
        if (!searchTerm) return data
        const lower = searchTerm.toLowerCase()
        return data.filter(item =>
            item.book_code.toLowerCase().includes(lower) ||
            item.book_name.toLowerCase().includes(lower) ||
            item.bank_name.toLowerCase().includes(lower)
        )
    }, [searchTerm, data])

    const handleCreate = async () => {
        try {
            await cashBookService.create(form)
            addToast({ type: 'success', title: 'Cash book created' })
            setIsCreateModalOpen(false)
            setForm({ book_code: '', book_name: '', book_type: 'CASH', account_number: '', bank_name: '', opening_balance: 0 })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to create cash book' })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await cashBookService.delete(id)
            addToast({ type: 'success', title: 'Cash book deleted' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to delete cash book' })
        }
    }

    const columns: TanStackColumn<CashBook>[] = [
        {
            id: 'book_code',
            header: 'Code',
            accessorKey: 'book_code',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.book_code}</span>
                    <span className="text-xs text-muted-foreground">{row.original.book_name}</span>
                </div>
            ),
        },
        {
            id: 'book_type',
            header: 'Type',
            accessorKey: 'book_type',
            cell: ({ row }) => (
                <span className="text-sm px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {row.original.book_type}
                </span>
            ),
        },
        {
            id: 'bank_name',
            header: 'Bank',
            accessorKey: 'bank_name',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm">{row.original.bank_name || '-'}</span>
                    <span className="text-xs text-muted-foreground">{row.original.account_number || ''}</span>
                </div>
            ),
        },
        {
            id: 'opening_balance',
            header: 'Opening',
            accessorKey: 'opening_balance',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">Rp {row.original.opening_balance.toLocaleString('id-ID')}</span>,
        },
        {
            id: 'current_balance',
            header: 'Current Balance',
            accessorKey: 'current_balance',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {row.original.current_balance.toLocaleString('id-ID')}</span>,
        },
        {
            id: 'is_active',
            header: 'Status',
            accessorKey: 'is_active',
            cell: ({ row }) => (
                <Badge className={`border-0 whitespace-nowrap ${row.original.is_active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
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
                title="Cash Books"
                description="Manage cash book accounts and balances"
                breadcrumbs={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Cash Books' },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <BookmarkToggle itemId="cash-books" />
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                            New Cash Book
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Books</p>
                                <p className="text-2xl font-bold">{stats.totalCount}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={BookOpen01Icon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Books</p>
                                <p className="text-2xl font-bold text-green-600">{stats.activeCount}</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalBalance / 1000000).toFixed(1)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search cash books..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[150px] h-9">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="CASH">Cash</SelectItem>
                                <SelectItem value="BANK">Bank</SelectItem>
                                <SelectItem value="PETTY_CASH">Petty Cash</SelectItem>
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
                        <DialogTitle>New Cash Book</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Book Code</Label>
                                <Input placeholder="CB-001" value={form.book_code} onChange={(e) => setForm({ ...form, book_code: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Book Type</Label>
                                <Select value={form.book_type} onValueChange={(v) => setForm({ ...form, book_type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="BANK">Bank</SelectItem>
                                        <SelectItem value="PETTY_CASH">Petty Cash</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Book Name</Label>
                            <Input placeholder="e.g. Kas Utama" value={form.book_name} onChange={(e) => setForm({ ...form, book_name: e.target.value })} />
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
                        <div className="space-y-2">
                            <Label>Opening Balance</Label>
                            <Input type="number" placeholder="0" value={form.opening_balance || ''} onChange={(e) => setForm({ ...form, opening_balance: parseFloat(e.target.value) || 0 })} />
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
