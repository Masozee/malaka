'use client'

import React, { useState, useMemo } from 'react'
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

// --- Types ---
type FacilityType = 'Term Loan' | 'Working Capital Line' | 'Lease'
type LoanStatus = 'active' | 'closed' | 'pending'

interface LoanFacility {
    id: string
    facilityName: string
    lender: string
    type: FacilityType
    principalAmount: number
    outstandingAmount: number
    interestRate: number
    maturityDate: string
    nextPaymentDate: string
    nextPaymentAmount: number
    status: LoanStatus
}

// --- Mock Data ---
const mockLoans: LoanFacility[] = [
    {
        id: '1',
        facilityName: 'Term Loan A - Factory Expansion',
        lender: 'BCA',
        type: 'Term Loan',
        principalAmount: 5000000000,
        outstandingAmount: 3200000000,
        interestRate: 8.5,
        maturityDate: '2028-12-31',
        nextPaymentDate: '2024-03-31',
        nextPaymentAmount: 125000000,
        status: 'active'
    },
    {
        id: '2',
        facilityName: 'Working Capital Line',
        lender: 'Mandiri',
        type: 'Working Capital Line',
        principalAmount: 2000000000,
        outstandingAmount: 850000000,
        interestRate: 9.25,
        maturityDate: '2025-06-30',
        nextPaymentDate: '2024-02-28',
        nextPaymentAmount: 15750000, // Interest only
        status: 'active'
    },
    {
        id: '3',
        facilityName: 'Machine Lease - Production Line 2',
        lender: 'OTO Finance',
        type: 'Lease',
        principalAmount: 1500000000,
        outstandingAmount: 1200000000,
        interestRate: 11.0,
        maturityDate: '2027-02-15',
        nextPaymentDate: '2024-03-15',
        nextPaymentAmount: 45000000,
        status: 'active'
    }
]

export default function LoanFinancingPage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // --- Stats ---
    const stats = useMemo(() => {
        const totalOutstanding = mockLoans.reduce((sum, l) => sum + l.outstandingAmount, 0)
        const weightedAvgRate = mockLoans.reduce((sum, l) => sum + (l.interestRate * l.outstandingAmount), 0) / totalOutstanding
        const nextMonthPayment = mockLoans.reduce((sum, l) => sum + l.nextPaymentAmount, 0) // Simplified
        return { totalOutstanding, weightedAvgRate, nextMonthPayment }
    }, [])

    // --- Filter ---
    const filteredData = useMemo(() => {
        let data = mockLoans
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item =>
                item.facilityName.toLowerCase().includes(lower) ||
                item.lender.toLowerCase().includes(lower)
            )
        }
        if (typeFilter !== 'all') {
            data = data.filter(item => item.type === typeFilter)
        }
        return data
    }, [searchTerm, typeFilter])

    // --- Columns ---
    const columns: TanStackColumn<LoanFacility>[] = [
        {
            id: 'facility',
            header: 'Facility Name',
            accessorKey: 'facilityName',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.facilityName}</span>
                    <span className="text-xs text-muted-foreground">{row.original.lender} - {row.original.type}</span>
                </div>
            )
        },
        {
            id: 'outstanding',
            header: 'Outstanding Principal',
            accessorKey: 'outstandingAmount',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">Rp {(row.original.outstandingAmount / 1000000).toLocaleString()}M</span>
                    <Progress value={(row.original.outstandingAmount / row.original.principalAmount) * 100} className="h-1 mt-1" />
                </div>
            )
        },
        {
            id: 'rate',
            header: 'Rate',
            accessorKey: 'interestRate',
            cell: ({ row }) => <span className="text-sm font-medium">{row.original.interestRate.toFixed(2)}%</span>
        },
        {
            id: 'nextPayment',
            header: 'Next Payment',
            cell: ({ row }) => (
                <div className="flex flex-col text-right">
                    <span className="font-medium text-sm">Rp {(row.original.nextPaymentAmount / 1000000).toLocaleString()}M</span>
                    <span className="text-xs text-muted-foreground">{new Date(row.original.nextPaymentDate).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            id: 'maturity',
            header: 'Maturity',
            accessorKey: 'maturityDate',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Calendar02Icon} className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{new Date(row.original.maturityDate).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const config = {
                    active: { label: 'Active', color: 'bg-green-100 text-green-800' },
                    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' },
                    pending: { label: 'Pending', color: 'bg-blue-100 text-blue-800' }
                }
                const s = config[row.original.status]
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
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                        New Facility
                    </Button>
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
                <TanStackDataTable
                    data={filteredData}
                    columns={columns}
                    enableRowSelection
                    showColumnToggle={false}
                />
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
