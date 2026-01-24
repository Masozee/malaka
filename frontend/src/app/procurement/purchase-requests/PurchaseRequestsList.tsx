'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    ViewIcon,
    PlusSignIcon,
    MoreHorizontalIcon,
    CheckmarkCircle01Icon,
    Search01Icon,
    FilterIcon,
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
    const [mounted, setMounted] = useState(true) // Initialized true for SSR hydration sync if possible, or use useEffect for stricter check
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(initialData)
    const [stats, setStats] = useState<PurchaseRequestStats | null>(null)
    const [page, setPage] = useState(1)
    const [totalRows, setTotalRows] = useState(initialData.length) // Simplified

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

    // Don't fetch on mount if we have initialData and no search query. 
    // However, stats usually need to be fetched separately if they weren't passed in SSR props.
    // For this optimized step, we'll fetch stats client-side or assume they load progressively.
    // Ideally, stats should also be SSR, but to keep changes focused, we'll hydrate list first.

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
        // Debounce logic would go here, explicitly calling fetchData or useEffect dependency
    }

    // Trigger fetch when search or page changes, SKIP on initial mount if data is present
    // But we need stats. Let's fetch stats on mount client-side for now.
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

    const columns = [
        {
            key: 'request_number' as keyof PurchaseRequest,
            title: 'Request Number',
            sortable: true,
            render: (value: unknown, record: PurchaseRequest) => (
                <div>
                    <div className="font-medium">{record.request_number}</div>
                    <div className="text-sm text-gray-500">{record.requester_name || 'Unknown'} • {record.department}</div>
                </div>
            )
        },
        {
            key: 'title' as keyof PurchaseRequest,
            title: 'Title',
            render: (value: unknown, record: PurchaseRequest) => (
                <div className="text-sm max-w-60 truncate" title={record.title}>
                    {record.title}
                </div>
            )
        },
        {
            key: 'priority' as keyof PurchaseRequest,
            title: 'Priority',
            sortable: true,
            render: (value: unknown, record: PurchaseRequest) => (
                <Badge className={priorityColors[record.priority] || 'bg-gray-100 text-gray-800'}>
                    {record.priority.charAt(0).toUpperCase() + record.priority.slice(1)}
                </Badge>
            )
        },
        {
            key: 'total_amount' as keyof PurchaseRequest,
            title: 'Amount',
            sortable: true,
            render: (value: unknown, record: PurchaseRequest) => (
                <div className="text-sm font-medium">
                    {record.total_amount.toLocaleString('id-ID', { style: 'currency', currency: record.currency || 'IDR', maximumFractionDigits: 0 })}
                </div>
            )
        },
        {
            key: 'status' as keyof PurchaseRequest,
            title: 'Status',
            sortable: true,
            render: (value: unknown, record: PurchaseRequest) => (
                <Badge className={statusColors[record.status] || 'bg-gray-100 text-gray-800'}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </Badge>
            )
        },
        {
            key: 'id' as keyof PurchaseRequest,
            title: 'Actions',
            width: '80px',
            render: (value: unknown, record: PurchaseRequest) => (
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
                                <DropdownMenuItem onClick={() => handleEditRequest(record)}>
                                    <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 h-4 w-4" />
                                    Edit Request
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSubmit(record)}>
                                    <HugeiconsIcon icon={SentIcon} className="mr-2 h-4 w-4" />
                                    Submit for Approval
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(record)} className="text-red-600">
                                    <HugeiconsIcon icon={DeleteIcon} className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </>
                        )}
                        {record.status === 'pending' && (
                            <>
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
    ]

    const PurchaseRequestCard = ({ request }: { request: PurchaseRequest }) => (
        <Card className="p-4">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-gray-900">{request.request_number}</h3>
                    <p className="text-sm text-gray-500">{request.requester_name || 'Unknown'} • {request.department}</p>
                </div>
                <div className="text-right">
                    <Badge className={statusColors[request.status] || 'bg-gray-100 text-gray-800'}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                    <div className="mt-1">
                        <Badge className={priorityColors[request.priority] || 'bg-gray-100 text-gray-800'}>
                            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="space-y-2 text-sm">
                <div className="text-sm font-medium text-gray-900">
                    {request.title}
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-500">Total Amount:</span>
                    <span className="font-medium">
                        {request.total_amount.toLocaleString('id-ID', { style: 'currency', currency: request.currency || 'IDR', maximumFractionDigits: 0 })}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-500">Request Date:</span>
                    <span>{new Date(request.created_at).toLocaleDateString('id-ID')}</span>
                </div>

                {request.required_date && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">Required Date:</span>
                        <span>{new Date(request.required_date).toLocaleDateString('id-ID')}</span>
                    </div>
                )}

                {request.items && (
                    <div className="flex justify-between">
                        <span className="text-gray-500">Items:</span>
                        <span>{request.items.length} item(s)</span>
                    </div>
                )}

                {request.rejection_reason && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                        <span className="font-medium text-red-800">Rejection Reason: </span>
                        <span className="text-red-700">{request.rejection_reason}</span>
                    </div>
                )}

                {request.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <span className="font-medium text-gray-800">Notes: </span>
                        <span className="text-gray-700">{request.notes}</span>
                    </div>
                )}
            </div>

            <div className="flex space-x-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleViewDetails(request)}>
                    <HugeiconsIcon icon={ViewIcon} className="h-4 w-4 mr-1" />
                    View Details
                </Button>
                {request.status === 'draft' && (
                    <Button size="sm" className="flex-1" onClick={() => handleEditRequest(request)}>
                        <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                )}
            </div>
        </Card>
    )

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

            <div className="flex-1 p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.total || 0}</p>
                    </Card>

                    <Card className="p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Draft</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.draft || 0}</p>
                    </Card>

                    <Card className="p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                        <p className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</p>
                    </Card>

                    <Card className="p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                        <p className="text-3xl font-bold text-green-600">{stats?.approved || 0}</p>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search requests..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                        <Button variant="outline" size="sm">
                            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                            Export
                        </Button>

                        {/* View Toggle */}
                        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                            <Button
                                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('cards')}
                            >
                                Cards
                            </Button>
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                            >
                                Table
                            </Button>
                        </div>
                    </div>
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
                ) : viewMode === 'cards' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {purchaseRequests.map((request) => (
                            <PurchaseRequestCard key={request.id} request={request} />
                        ))}
                    </div>
                ) : (
                    <DataTable
                        data={purchaseRequests}
                        columns={columns}
                    />
                )}
            </div>
        </TwoLevelLayout>
    )
}
