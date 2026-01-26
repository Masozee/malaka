'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

import { rfqService, RFQ, RFQStats } from '@/services/rfq'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    ViewIcon,
    PlusSignIcon,
    MoreHorizontalIcon,
    Search01Icon,
    LoadingIcon,
    CancelIcon,
    PencilEdit01Icon,
    SentIcon,
    FileIcon
} from '@hugeicons/core-free-icons'

interface RFQListProps {
    initialData: RFQ[]
}

export default function RFQList({ initialData }: RFQListProps) {
    const router = useRouter()
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [rfqs, setRfqs] = useState<RFQ[]>(initialData)
    const [stats, setStats] = useState<RFQStats | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('')

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const [rfqData, statsData] = await Promise.all([
                rfqService.getAllRFQs({ limit: 100 }),
                rfqService.getRFQStats()
            ])

            setRfqs(rfqData.rfqs)
            setStats(statsData)
        } catch (err) {
            console.error('RFQ Page: Failed to load RFQ data:', err)
            setError('Failed to load RFQ data. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [])

    // Fetch stats on mount
    useEffect(() => {
        rfqService.getRFQStats().then(setStats).catch(console.error)
    }, [])

    const breadcrumbs = [
        { label: 'Procurement', href: '/procurement' },
        { label: 'RFQ (Request for Quotation)', href: '/procurement/rfq' }
    ]

    // Filter RFQs based on search and status
    const filteredRfqs = rfqs.filter(rfq => {
        const matchesSearch = !searchQuery ||
            rfq.rfq_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rfq.title.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = !statusFilter || rfq.status === statusFilter

        return matchesSearch && matchesStatus
    })

    // Action handlers
    const handleViewDetails = (rfq: RFQ) => {
        router.push(`/procurement/rfq/${rfq.id}`)
    }

    const handleEditRFQ = (rfq: RFQ) => {
        router.push(`/procurement/rfq/${rfq.id}/edit`)
    }

    const handlePublishRFQ = async (rfq: RFQ) => {
        console.log('Publish RFQ:', rfq.rfq_number)
        // TODO: Implement publish logic
    }

    const columns = [
        {
            key: 'rfq_number' as keyof RFQ,
            title: 'RFQ Number',
            render: (value: unknown, record: RFQ) => (
                <div>
                    <div className="font-medium">{record.rfq_number}</div>
                    <div className="text-xs text-gray-500">
                        {rfqService.formatDate(record.created_at)}
                    </div>
                </div>
            )
        },
        {
            key: 'title' as keyof RFQ,
            title: 'Title',
            render: (value: unknown, record: RFQ) => (
                <div className="max-w-60">
                    <div className="font-medium truncate" title={record.title}>
                        {record.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                        {record.description}
                    </div>
                </div>
            )
        },
        {
            key: 'status' as keyof RFQ,
            title: 'Status',
            render: (value: unknown, record: RFQ) => (
                <Badge className={rfqService.getStatusColor(record.status)}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </Badge>
            )
        },
        {
            key: 'priority' as keyof RFQ,
            title: 'Priority',
            render: (value: unknown, record: RFQ) => (
                <Badge className={rfqService.getPriorityColor(record.priority)}>
                    {record.priority.charAt(0).toUpperCase() + record.priority.slice(1)}
                </Badge>
            )
        },
        {
            key: 'items' as keyof RFQ,
            title: 'Items',
            render: (value: unknown, record: RFQ) => {
                const items = record.items || []
                return (
                    <div className="text-xs">
                        <div className="font-medium">{items.length} items</div>
                        {items.length > 0 && (
                            <div className="text-gray-500">
                                Total: {rfqService.formatCurrency(
                                    items.reduce((sum: number, item: any) => sum + (item.target_price * item.quantity), 0)
                                )}
                            </div>
                        )}
                    </div>
                )
            }
        },
        {
            key: 'suppliers' as keyof RFQ,
            title: 'Suppliers',
            render: (value: unknown, record: RFQ) => {
                const suppliers = record.suppliers || []
                const responded = suppliers.filter((s: any) => s.status === 'responded').length
                return (
                    <div className="text-xs">
                        <div className="font-medium">{responded}/{suppliers.length}</div>
                        <div className="text-gray-500">
                            {suppliers.length > 0 ? Math.round((responded / suppliers.length) * 100) : 0}% response
                        </div>
                    </div>
                )
            }
        },
        {
            key: 'due_date' as keyof RFQ,
            title: 'Due Date',
            render: (value: unknown, record: RFQ) => {
                const isOverdue = rfqService.isOverdue(record)
                const daysUntil = rfqService.getDaysUntilDue(record)

                return (
                    <div className="text-xs">
                        <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
                            {rfqService.formatDate(record.due_date)}
                        </div>
                        {daysUntil !== null && (
                            <div className={`text-xs ${isOverdue ? 'text-red-500' : daysUntil <= 3 ? 'text-yellow-600' : 'text-gray-500'}`}>
                                {isOverdue ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days left`}
                            </div>
                        )}
                    </div>
                )
            }
        },
        {
            key: 'id' as keyof RFQ,
            title: 'Actions',
            width: '80px',
            render: (value: unknown, record: RFQ) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                                <DropdownMenuItem onClick={() => handleEditRFQ(record)}>
                                    <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 h-4 w-4" />
                                    Edit RFQ
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handlePublishRFQ(record)}>
                                    <HugeiconsIcon icon={SentIcon} className="mr-2 h-4 w-4" />
                                    Publish RFQ
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    const RFQCard = ({ rfq }: { rfq: RFQ }) => {
        const items = rfq.items || []
        const suppliers = rfq.suppliers || []
        const responded = suppliers.filter(s => s.status === 'responded').length
        const responseRate = suppliers.length > 0 ? (responded / suppliers.length) * 100 : 0
        const isOverdue = rfqService.isOverdue(rfq)
        const daysUntil = rfqService.getDaysUntilDue(rfq)
        const totalAmount = items.reduce((sum, item) => sum + (item.target_price * item.quantity), 0)

        return (
            <Card className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="font-semibold text-gray-900">{rfq.rfq_number}</h3>
                        <p className="text-sm text-gray-500">{rfqService.formatDate(rfq.created_at)}</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(rfq)}>
                                <HugeiconsIcon icon={ViewIcon} className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            {rfq.status === 'draft' && (
                                <>
                                    <DropdownMenuItem onClick={() => handleEditRFQ(rfq)}>
                                        <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handlePublishRFQ(rfq)}>
                                        <HugeiconsIcon icon={SentIcon} className="mr-2 h-4 w-4" />
                                        Publish
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="mb-3">
                    <Badge className={rfqService.getStatusColor(rfq.status)}>
                        {rfq.status.replace('-', ' ').charAt(0).toUpperCase() + rfq.status.replace('-', ' ').slice(1)}
                    </Badge>
                    <Badge className={`ml-2 ${rfqService.getPriorityColor(rfq.priority)}`}>
                        {rfq.priority.charAt(0).toUpperCase() + rfq.priority.slice(1)}
                    </Badge>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="font-medium text-gray-900">{rfq.title}</div>
                    <div className="text-gray-600 line-clamp-2">{rfq.description}</div>

                    {totalAmount > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Target Budget:</span>
                            <span className="font-medium">{rfqService.formatCurrency(totalAmount)}</span>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <span className="text-gray-500">Items:</span>
                        <span>{items.length} item(s)</span>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-gray-500">Suppliers:</span>
                        <span className={responseRate === 100 ? 'text-green-600 font-medium' : responseRate > 50 ? 'text-yellow-600' : 'text-red-600'}>
                            {responded}/{suppliers.length} ({responseRate.toFixed(0)}%)
                        </span>
                    </div>

                    {rfq.due_date && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Due Date:</span>
                            <span className={isOverdue ? 'text-red-600 font-medium' : daysUntil !== null && daysUntil <= 3 ? 'text-yellow-600' : ''}>
                                {rfqService.formatDate(rfq.due_date)}
                            </span>
                        </div>
                    )}

                    {isOverdue && daysUntil !== null && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                            <span className="font-medium text-red-800">Overdue: </span>
                            <span className="text-red-700">{Math.abs(daysUntil)} days past due date</span>
                        </div>
                    )}
                </div>
            </Card>
        )
    }

    // Calculate additional statistics
    const totalValue = rfqs
        .filter(rfq => rfq.items && rfq.items.length > 0)
        .reduce((sum, rfq) => sum + (rfq.items?.reduce((itemSum, item) => itemSum + (item.target_price * item.quantity), 0) || 0), 0)

    return (
        <TwoLevelLayout>
            <Header
                title="Request for Quotations (RFQ)"
                description="Manage RFQ processes and supplier quotations"
                breadcrumbs={breadcrumbs}
                actions={
                    <Button size="sm" onClick={() => router.push('/procurement/rfq/new')}>
                        <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                        New RFQ
                    </Button>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Summary Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="p-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total RFQs</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total_rfqs}</p>
                        </Card>

                        <Card className="p-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.published_rfqs}</p>
                        </Card>

                        <Card className="p-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Closed</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.closed_rfqs}</p>
                        </Card>

                        <Card className="p-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {(totalValue / 1000000).toFixed(0)}M
                            </p>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search RFQs..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
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

                        <span className="text-sm text-muted-foreground">
                            {filteredRfqs.length} RFQ{filteredRfqs.length !== 1 ? 's' : ''}
                        </span>
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
                            <p className="text-lg font-medium text-gray-900 mb-2">Error Loading RFQs</p>
                            <p className="text-gray-500 mb-4">{error}</p>
                            <Button onClick={loadData}>
                                Try Again
                            </Button>
                        </div>
                    </div>
                ) : filteredRfqs.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <HugeiconsIcon icon={FileIcon} className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">No RFQs Found</p>
                            <p className="text-gray-500 mb-4">Get started by creating your first RFQ.</p>
                            <Button onClick={() => router.push('/procurement/rfq/new')}>
                                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                                New RFQ
                            </Button>
                        </div>
                    </div>
                ) : viewMode === 'cards' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRfqs.map((rfq) => (
                            <RFQCard key={rfq.id} rfq={rfq} />
                        ))}
                    </div>
                ) : (
                    <DataTable
                        data={filteredRfqs}
                        columns={columns}
                    />
                )}
            </div>
        </TwoLevelLayout>
    )
}
