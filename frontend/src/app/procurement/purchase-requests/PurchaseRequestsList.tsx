'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TanStackDataTable } from '@/components/ui/tanstack-data-table'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    ViewIcon,
    PlusSignIcon,
    MoreHorizontalIcon,
    CheckmarkCircle01Icon,
    Search01Icon,
    FilterHorizontalIcon,
    Download01Icon,
    LoadingIcon,
    CancelIcon,
    PencilEdit01Icon,
    FileIcon,
    SentIcon,
    DeleteIcon
} from '@hugeicons/core-free-icons'
import { purchaseRequestService } from '@/services/procurement'
import type { PurchaseRequest, PurchaseRequestStats } from '@/types/procurement'
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'
import { TanStackColumn } from '@/components/ui/tanstack-data-table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

// Status and priority color mappings
const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
}

const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
}

interface PurchaseRequestsListProps {
    initialData: PurchaseRequest[]
}

export default function PurchaseRequestsList({ initialData }: PurchaseRequestsListProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [mounted, setMounted] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(initialData)
    const [stats, setStats] = useState<PurchaseRequestStats | null>(null)
    const [page, setPage] = useState(1)
    const [totalRows, setTotalRows] = useState(initialData.length)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const [listResponse, statsResponse] = await Promise.all([
                purchaseRequestService.getAll({ page, limit: 20, search: searchQuery }),
                purchaseRequestService.getStats()
            ])

            setPurchaseRequests(listResponse.data || [])
            setTotalRows(listResponse.total)
            setStats(statsResponse)
        } catch (err) {
            console.error('Failed to fetch purchase requests:', err)
            setError('Failed to load purchase requests. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [page, searchQuery])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    useState(() => {
        purchaseRequestService.getStats().then(setStats).catch(console.error)
    })

    const breadcrumbs = [
        { label: 'Procurement', href: '/procurement' },
        { label: 'Purchase Requests', href: '/procurement/purchase-requests' }
    ]

    const handleViewDetails = (request: PurchaseRequest) => {
        router.push(`/procurement/purchase-requests/${request.id}`)
    }

    const handleEditRequest = (request: PurchaseRequest) => {
        router.push(`/procurement/purchase-requests/${request.id}/edit`)
    }

    const handleNewRequest = () => {
        router.push('/procurement/purchase-requests/new')
    }

    const handleSubmit = async (request: PurchaseRequest) => {
        try {
            await purchaseRequestService.submit(request.id)
            addToast({ type: 'success', title: 'Purchase request submitted successfully' })
            fetchData()
        } catch (err) {
            console.error('Failed to submit:', err)
            addToast({ type: 'error', title: 'Failed to submit purchase request' })
        }
    }

    const handleApprove = async (request: PurchaseRequest) => {
        try {
            await purchaseRequestService.approve(request.id)
            addToast({ type: 'success', title: 'Purchase request approved' })
            fetchData()
        } catch (err) {
            console.error('Failed to approve:', err)
            addToast({ type: 'error', title: 'Failed to approve purchase request' })
        }
    }

    const handleCancel = async (request: PurchaseRequest) => {
        try {
            await purchaseRequestService.cancel(request.id)
            addToast({ type: 'success', title: 'Purchase request cancelled' })
            fetchData()
        } catch (err) {
            console.error('Failed to cancel:', err)
            addToast({ type: 'error', title: 'Failed to cancel purchase request' })
        }
    }

    const handleDelete = async (request: PurchaseRequest) => {
        if (!confirm('Are you sure you want to delete this purchase request?')) return
        try {
            await purchaseRequestService.delete(request.id)
            addToast({ type: 'success', title: 'Purchase request deleted' })
            fetchData()
        } catch (err) {
            console.error('Failed to delete:', err)
            addToast({ type: 'error', title: 'Failed to delete purchase request' })
        }
    }

    const columns: TanStackColumn<PurchaseRequest>[] = [
        {
            accessorKey: 'request_number' as keyof PurchaseRequest,
            id: 'request_number',
            header: 'Request Number',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.request_number}</div>
                    <div className="text-sm text-gray-500">{row.original.requester_name || 'Unknown'} • {row.original.department}</div>
                </div>
            )
        },
        {
            accessorKey: 'title' as keyof PurchaseRequest,
            id: 'title',
            header: 'Title',
            cell: ({ row }) => (
                <div className="text-sm max-w-60 truncate" title={row.original.title}>
                    {row.original.title}
                </div>
            )
        },
        {
            accessorKey: 'priority' as keyof PurchaseRequest,
            id: 'priority',
            header: 'Priority',
            cell: ({ row }) => (
                <Badge className={priorityColors[row.original.priority] || 'bg-gray-100 text-gray-800'}>
                    {row.original.priority.charAt(0).toUpperCase() + row.original.priority.slice(1)}
                </Badge>
            )
        },
        {
            accessorKey: 'total_amount' as keyof PurchaseRequest,
            id: 'total_amount',
            header: 'Amount',
            cell: ({ row }) => (
                <div className="text-sm font-medium">
                    {row.original.total_amount.toLocaleString('id-ID', { style: 'currency', currency: row.original.currency || 'IDR', maximumFractionDigits: 0 })}
                </div>
            )
        },
        {
            accessorKey: 'status' as keyof PurchaseRequest,
            id: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge className={statusColors[row.original.status] || 'bg-gray-100 text-gray-800'}>
                    {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                </Badge>
            )
        },
        {
            id: 'actions',
            header: 'Actions',
            size: 60,
            cell: ({ row }) => {
                const record = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(record)}>
                                <HugeiconsIcon icon={ViewIcon} className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            {record.status === 'draft' && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleEditRequest(record)}>
                                        <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 h-4 w-4" />
                                        Edit Request
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSubmit(record)}>
                                        <HugeiconsIcon icon={SentIcon} className="mr-2 h-4 w-4" />
                                        Submit for Approval
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDelete(record)} className="text-red-600">
                                        <HugeiconsIcon icon={DeleteIcon} className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </>
                            )}
                            {record.status === 'pending' && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleApprove(record)}>
                                        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="mr-2 h-4 w-4" />
                                        Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleCancel(record)}>
                                        <HugeiconsIcon icon={CancelIcon} className="mr-2 h-4 w-4" />
                                        Cancel
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Purchase Requests"
                description="Manage purchase requests and approval workflow"
                breadcrumbs={breadcrumbs}
                actions={
                    <Button size="sm" onClick={handleNewRequest}>
                        <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                        New Request
                    </Button>
                }
            />

            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <HugeiconsIcon icon={FileIcon} className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.total || 0}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-50 rounded-lg">
                                <HugeiconsIcon icon={PencilEdit01Icon} className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Draft</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.draft || 0}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <HugeiconsIcon icon={LoadingIcon} className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                                <p className="text-2xl font-bold text-green-600">{stats?.approved || 0}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-end gap-2">
                    <div className="relative">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search requests..."
                            className="pl-9 w-64"
                            value={searchQuery}
                            onChange={handleSearch}
                            aria-label="Search requests"
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <HugeiconsIcon icon={FilterHorizontalIcon} className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                    <Button variant="outline" size="sm">
                        <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <HugeiconsIcon icon={LoadingIcon} className="h-8 w-8 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <HugeiconsIcon icon={CancelIcon} className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">Error Loading Requests</p>
                            <p className="text-gray-500 mb-4">{error}</p>
                            <Button onClick={() => fetchData()}>
                                Try Again
                            </Button>
                        </div>
                    </div>
                ) : purchaseRequests.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <HugeiconsIcon icon={FileIcon} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">No Purchase Requests Found</p>
                            <p className="text-gray-500 mb-4">Get started by creating your first purchase request.</p>
                            <Button onClick={handleNewRequest}>
                                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                                New Request
                            </Button>
                        </div>
                    </div>
                ) : (
                    <TanStackDataTable
                        data={purchaseRequests}
                        columns={columns}
                        pagination={{
                            pageIndex: page - 1,
                            pageSize: 20,
                            totalRows: totalRows,
                            onPageChange: (newPage) => setPage(newPage + 1)
                        }}
                    />
                )}
            </div>
        </TwoLevelLayout>
    )
}
