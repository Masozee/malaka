'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
    BankIcon,
    Calendar02Icon,
    Search01Icon,
    Download01Icon,
    PlusSignIcon,
    MoneySendSquareIcon,
    PercentIcon,
    MoreHorizontalIcon
} from '@hugeicons/core-free-icons'
import { BookmarkToggle } from '@/components/ui/bookmark-toggle'
import { loanFacilityService, type LoanFacility } from '@/services/finance'

export default function LoanFinancingPage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [loans, setLoans] = useState<LoanFacility[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                const data = await loanFacilityService.getAll()
                setLoans(data)
            } catch (err) {
                console.error('Failed to fetch loans:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // --- Stats ---
    const stats = useMemo(() => {
        const totalOutstanding = loans.reduce((sum, l) => sum + l.outstanding_amount, 0)
        const weightedAvgRate = totalOutstanding > 0 ? loans.reduce((sum, l) => sum + (l.interest_rate * l.outstanding_amount), 0) / totalOutstanding : 0
        const nextMonthPayment = loans.reduce((sum, l) => sum + l.next_payment_amount, 0)
        return { totalOutstanding, weightedAvgRate, nextMonthPayment }
    }, [loans])

    // --- Filter ---
    const filteredData = useMemo(() => {
        let data = loans
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item =>
                item.facility_name.toLowerCase().includes(lower) ||
                item.lender.toLowerCase().includes(lower)
            )
        }
        if (typeFilter !== 'all') {
            data = data.filter(item => item.type === typeFilter)
        }
        return data
    }, [searchTerm, typeFilter, loans])

    // --- Columns ---
    const columns: TanStackColumn<LoanFacility>[] = [
        {
            id: 'facility',
            header: 'Facility Name',
            accessorKey: 'facility_name',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.facility_name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.lender} - {row.original.type}</span>
                </div>
            )
        },
        {
            id: 'outstanding',
            header: 'Outstanding Principal',
            accessorKey: 'outstanding_amount',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">Rp {(row.original.outstanding_amount / 1000000).toLocaleString()}M</span>
                    <Progress value={row.original.principal_amount > 0 ? (row.original.outstanding_amount / row.original.principal_amount) * 100 : 0} className="h-1 mt-1" />
                </div>
            )
        },
        {
            id: 'rate',
            header: 'Rate',
            accessorKey: 'interest_rate',
            cell: ({ row }) => <span className="text-sm font-medium">{row.original.interest_rate.toFixed(2)}%</span>
        },
        {
            id: 'nextPayment',
            header: 'Next Payment',
            cell: ({ row }) => (
                <div className="flex flex-col text-right">
                    <span className="font-medium text-sm">Rp {(row.original.next_payment_amount / 1000000).toLocaleString()}M</span>
                    <span className="text-xs text-muted-foreground">{mounted && row.original.next_payment_date ? new Date(row.original.next_payment_date).toLocaleDateString() : '-'}</span>
                </div>
            )
        },
        {
            id: 'maturity',
            header: 'Maturity',
            accessorKey: 'maturity_date',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Calendar02Icon} className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{mounted && row.original.maturity_date ? new Date(row.original.maturity_date).toLocaleDateString() : '-'}</span>
                </div>
            )
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const config: Record<string, { label: string; color: string }> = {
                    active: { label: 'Active', color: 'bg-green-100 text-green-800' },
                    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' },
                    pending: { label: 'Pending', color: 'bg-blue-100 text-blue-800' }
                }
                const s = config[row.original.status] || { label: row.original.status, color: 'bg-gray-100 text-gray-800' }
                return <Badge className={`${s.color} border-0 capitalize`}>{s.label}</Badge>
            }
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
                        <DropdownMenuItem>View Schedule</DropdownMenuItem>
                        <DropdownMenuItem>Make Payment</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Loan & Financing"
                description="Manage credit facilities, repayments, and interest obligations"
                breadcrumbs={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Loan & Financing' }
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <BookmarkToggle itemId="loan-financing" />
                        <Button onClick={() => setIsAddModalOpen(true)}>
                            <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                            New Facility
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
                                <p className="text-sm font-medium text-muted-foreground">Total Outstanding</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalOutstanding / 1000000000).toFixed(2)}B</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={BankIcon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Wg. Avg Rate</p>
                                <p className="text-2xl font-bold">{stats.weightedAvgRate.toFixed(2)}%</p>
                            </div>
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={PercentIcon} className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Upcoming Payments (30d)</p>
                                <p className="text-2xl font-bold">Rp {(stats.nextMonthPayment / 1000000).toLocaleString()}M</p>
                            </div>
                            <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={MoneySendSquareIcon} className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by facility or lender..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[180px] h-9">
                                <SelectValue placeholder="Facility Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Term Loan">Term Loan</SelectItem>
                                <SelectItem value="Working Capital Line">Working Capital</SelectItem>
                                <SelectItem value="Lease">Lease</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <HugeiconsIcon icon={Download01Icon} className="w-4 h-4 mr-2" />
                            Export Schedule
                        </Button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-muted-foreground">Loading loans...</div>
                    </div>
                ) : (
                    <TanStackDataTable
                        data={filteredData}
                        columns={columns}
                        enableRowSelection
                        showColumnToggle={false}
                    />
                )}
            </div>

            {/* Add Modal Placeholder */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Financing Facility</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Facility Name</Label>
                            <Input placeholder="e.g. Series B Investment" />
                        </div>
                        <div className="space-y-2">
                            <Label>Lender / Bank</Label>
                            <Input placeholder="Bank Name" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Principal Amount</Label>
                                <Input type="number" placeholder="0" />
                            </div>
                            <div className="space-y-2">
                                <Label>Interest Rate (%)</Label>
                                <Input type="number" step="0.01" placeholder="0.00" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button onClick={() => {
                                addToast({ type: 'success', title: 'Facility added' })
                                setIsAddModalOpen(false)
                            }}>Add Facility</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </TwoLevelLayout>
    )
}
