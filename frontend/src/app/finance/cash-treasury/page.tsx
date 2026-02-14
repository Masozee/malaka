'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
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
import { HugeiconsIcon } from '@hugeicons/react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    MoneySendSquareIcon,
    Wallet01Icon,
    ArrowRight01Icon,
    PlusSignIcon,
    Search01Icon,
    Download01Icon,
    BankIcon,
    Coins01Icon,
    MoreHorizontalIcon
} from '@hugeicons/core-free-icons'
import { BookmarkToggle } from '@/components/ui/bookmark-toggle'
import { cashBankService, type CashBank } from '@/services/finance'

export default function CashTreasuryPage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
    const [accounts, setAccounts] = useState<CashBank[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                const data = await cashBankService.getAll()
                setAccounts(data)
            } catch (err) {
                console.error('Failed to fetch cash banks:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // --- Stats ---
    const stats = useMemo(() => {
        const totalIDR = accounts
            .filter(a => a.currency === 'IDR')
            .reduce((sum, a) => sum + a.balance, 0)

        const totalUSD = accounts
            .filter(a => a.currency === 'USD')
            .reduce((sum, a) => sum + a.balance, 0)

        return { totalIDR, totalUSD, activeCount: accounts.length }
    }, [accounts])

    // --- Filtering ---
    const filteredData = useMemo(() => {
        let data = accounts
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item =>
                item.name.toLowerCase().includes(lower) ||
                item.account_no.includes(lower)
            )
        }
        return data
    }, [searchTerm, accounts])

    // --- Columns ---
    const columns: TanStackColumn<CashBank>[] = [
        {
            id: 'name',
            header: 'Account Name',
            accessorKey: 'name',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.account_no || '-'}</span>
                </div>
            )
        },
        {
            id: 'currency',
            header: 'Currency',
            accessorKey: 'currency',
            cell: ({ row }) => <span className="font-mono text-xs">{row.original.currency}</span>
        },
        {
            id: 'balance',
            header: 'Balance',
            accessorKey: 'balance',
            cell: ({ row }) => (
                <div className="text-right font-medium text-sm">
                    {row.original.currency} {row.original.balance.toLocaleString('id-ID')}
                </div>
            )
        },
        {
            id: 'updated_at',
            header: 'Last Updated',
            accessorKey: 'updated_at',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {mounted && row.original.updated_at ? new Date(row.original.updated_at).toLocaleDateString() : '-'}
                </span>
            )
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
                            Copy Account ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Transactions</DropdownMenuItem>
                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Cash & Treasury"
                description="Manage company liquidity, bank accounts, and cashflow"
                breadcrumbs={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Cash & Treasury' }
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <BookmarkToggle itemId="cash-treasury" />
                        <Button variant="outline" onClick={() => setIsTransferModalOpen(true)}>
                            <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 mr-2" />
                            Transfer Funds
                        </Button>
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                            Add Account
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Liquidity (IDR)</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalIDR / 1000000).toFixed(2)}M</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={MoneySendSquareIcon} className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">USD Holdings</p>
                                <p className="text-2xl font-bold">${stats.totalUSD.toLocaleString()}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Coins01Icon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Accounts</p>
                                <p className="text-2xl font-bold">{stats.activeCount}</p>
                            </div>
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={BankIcon} className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Actions */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search accounts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[150px] h-9">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="bank">Bank</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="e-wallet">E-Wallet</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="h-9">
                            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <TanStackDataTable
                    data={filteredData}
                    columns={columns}
                    enableRowSelection
                    showColumnToggle={false}
                />
            </div>

            {/* Transfer Modal Placeholder */}
            <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transfer Funds</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>From Account</Label>
                            <Select>
                                <SelectTrigger><SelectValue placeholder="Select Source" /></SelectTrigger>
                                <SelectContent>
                                    {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>To Account</Label>
                            <Select>
                                <SelectTrigger><SelectValue placeholder="Select Destination" /></SelectTrigger>
                                <SelectContent>
                                    {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input type="number" placeholder="0.00" />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsTransferModalOpen(false)}>Cancel</Button>
                            <Button onClick={() => {
                                addToast({ type: 'success', title: 'Transfer initiated' })
                                setIsTransferModalOpen(false)
                            }}>Transfer</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </TwoLevelLayout>
    )
}
