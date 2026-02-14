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
    SentIcon,
    Clock01Icon,
    Dollar01Icon,
    PlusSignIcon,
    Search01Icon,
    Download01Icon,
    MoreHorizontalIcon,
} from '@hugeicons/core-free-icons'
import { BookmarkToggle } from '@/components/ui/bookmark-toggle'
import { expenditureRequestService, type ExpenditureRequest } from '@/services/finance'

export default function ExpenditureRequestsPage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [data, setData] = useState<ExpenditureRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    const [form, setForm] = useState({
        request_number: '',
        requestor_id: '',
        department: '',
        request_date: '',
        required_date: '',
        purpose: '',
        total_amount: 0,
        priority: 'MEDIUM',
    })

    useEffect(() => { setMounted(true) }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const result = await expenditureRequestService.getAll()
            setData(result)
        } catch (err) {
            console.error('Failed to fetch expenditure requests:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const stats = useMemo(() => {
        const totalRequested = data.reduce((sum, er) => sum + er.total_amount, 0)
        const pendingCount = data.filter(er => er.status === 'PENDING').length
        return { totalCount: data.length, totalRequested, pendingCount }
    }, [data])

    const filteredData = useMemo(() => {
        let result = data
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            result = result.filter(item =>
                item.request_number.toLowerCase().includes(lower) ||
                item.department.toLowerCase().includes(lower) ||
                item.purpose.toLowerCase().includes(lower)
            )
        }
        if (statusFilter !== 'all') {
            result = result.filter(item => item.status === statusFilter)
        }
        return result
    }, [searchTerm, statusFilter, data])

    const handleCreate = async () => {
        try {
            await expenditureRequestService.create(form)
            addToast({ type: 'success', title: 'Expenditure request created' })
            setIsCreateModalOpen(false)
            setForm({ request_number: '', requestor_id: '', department: '', request_date: '', required_date: '', purpose: '', total_amount: 0, priority: 'MEDIUM' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to create request' })
        }
    }

    const handleApprove = async (id: string) => {
        try {
            await expenditureRequestService.approve(id, 'current-user')
            addToast({ type: 'success', title: 'Request approved' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to approve' })
        }
    }

    const handleReject = async (id: string) => {
        try {
            await expenditureRequestService.reject(id, 'Rejected by admin')
            addToast({ type: 'success', title: 'Request rejected' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to reject' })
        }
    }

    const handleDisburse = async (id: string) => {
        try {
            await expenditureRequestService.disburse(id, 'current-user')
            addToast({ type: 'success', title: 'Funds disbursed' })
            fetchData()
        } catch (err) {
            addToast({ type: 'error', title: 'Failed to disburse' })
        }
    }

    const statusConfig: Record<string, { label: string; color: string }> = {
        DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' },
        PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
        APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
        REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
        DISBURSED: { label: 'Disbursed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
    }

    const priorityConfig: Record<string, { label: string; color: string }> = {
        HIGH: { label: 'High', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
        MEDIUM: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
        LOW: { label: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    }

    const columns: TanStackColumn<ExpenditureRequest>[] = [
        {
            id: 'request_number',
            header: 'Request',
            accessorKey: 'request_number',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.request_number || '-'}</span>
                    <span className="text-xs text-muted-foreground">
                        {mounted && row.original.request_date ? new Date(row.original.request_date).toLocaleDateString('id-ID') : '-'}
                    </span>
                </div>
            ),
        },
        {
            id: 'department',
            header: 'Department',
            accessorKey: 'department',
            cell: ({ row }) => <span className="text-sm">{row.original.department || '-'}</span>,
        },
        {
            id: 'purpose',
            header: 'Purpose',
            accessorKey: 'purpose',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                    {row.original.purpose || '-'}
                </span>
            ),
        },
        {
            id: 'total_amount',
            header: 'Amount',
            accessorKey: 'total_amount',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {row.original.total_amount.toLocaleString('id-ID')}</span>,
        },
        {
            id: 'priority',
            header: 'Priority',
            accessorKey: 'priority',
            cell: ({ row }) => {
                const p = priorityConfig[row.original.priority] || { label: row.original.priority, color: 'bg-gray-100 text-gray-800' }
                return <Badge className={`${p.color} border-0 whitespace-nowrap`}>{p.label}</Badge>
            },
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
                                <DropdownMenuItem onClick={() => handleApprove(row.original.id)}>Approve</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReject(row.original.id)} className="text-red-600">Reject</DropdownMenuItem>
                            </>
                        )}
                        {row.original.status === 'APPROVED' && (
                            <DropdownMenuItem onClick={() => handleDisburse(row.original.id)}>Disburse</DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Expenditure Requests"
                description="Submit and manage expenditure requests with approval workflow"
                breadcrumbs={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Expenditure Requests' },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        <BookmarkToggle itemId="expenditure-requests" />
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                            New Request
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                                <p className="text-2xl font-bold">{stats.totalCount}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={SentIcon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                                <p className="text-sm font-medium text-muted-foreground">Total Requested</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalRequested / 1000000).toFixed(1)}M</p>
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
                        <Input placeholder="Search requests..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="DISBURSED">Disbursed</SelectItem>
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
                        <DialogTitle>New Expenditure Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Request Number</Label>
                                <Input placeholder="ER-001" value={form.request_number} onChange={(e) => setForm({ ...form, request_number: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Department</Label>
                                <Input placeholder="e.g. Operations" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Requestor ID</Label>
                            <Input placeholder="Requestor reference" value={form.requestor_id} onChange={(e) => setForm({ ...form, requestor_id: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Request Date</Label>
                                <Input type="date" value={form.request_date} onChange={(e) => setForm({ ...form, request_date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Required Date</Label>
                                <Input type="date" value={form.required_date} onChange={(e) => setForm({ ...form, required_date: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input type="number" placeholder="0" value={form.total_amount || ''} onChange={(e) => setForm({ ...form, total_amount: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Purpose</Label>
                            <Textarea placeholder="Describe the purpose..." value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Submit Request</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </TwoLevelLayout>
    )
}
