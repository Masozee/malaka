'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TanStackDataTable, TanStackColumn, CustomAction } from '@/components/ui/tanstack-data-table'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    StarIcon,
    Building03Icon,
    Award05Icon,
    AnalyticsUpIcon,
    PlusSignIcon,
    Search01Icon,
    FilterIcon,
    Download01Icon,
    CancelIcon,
    CheckmarkCircle02Icon
} from '@hugeicons/core-free-icons'
import { vendorEvaluationService } from '@/services/procurement'
import type { VendorEvaluation, VendorEvaluationStats } from '@/types/procurement'
import { useToast } from '@/components/ui/toast'

const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
}

const recommendationColors: Record<string, string> = {
    preferred: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    conditional: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    not_recommended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

interface VendorEvaluationListProps {
    initialData: VendorEvaluation[]
}

export default function VendorEvaluationList({ initialData }: VendorEvaluationListProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [evaluations, setEvaluations] = useState<VendorEvaluation[]>(initialData)
    const [stats, setStats] = useState<VendorEvaluationStats | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const [evaluationsResponse, statsResponse] = await Promise.all([
                vendorEvaluationService.getAll(),
                vendorEvaluationService.getStats()
            ])
            setEvaluations(evaluationsResponse.data || [])
            setStats(statsResponse)
        } catch (err) {
            console.error('Failed to fetch vendor evaluations:', err)
            setError('Failed to load vendor evaluations')
            addToast({ type: 'error', title: 'Failed to load vendor evaluations' })
        } finally {
            setLoading(false)
        }
    }, [addToast])

    // Fetch stats on mount
    useEffect(() => {
        vendorEvaluationService.getStats().then(setStats).catch(console.error)
    }, [])

    const handleComplete = async (evaluation: VendorEvaluation) => {
        try {
            await vendorEvaluationService.complete(evaluation.id)
            addToast({ type: 'success', title: 'Evaluation marked as completed' })
            fetchData()
        } catch (err) {
            console.error('Failed to complete evaluation:', err)
            addToast({ type: 'error', title: 'Failed to complete evaluation' })
        }
    }

    const handleApprove = async (evaluation: VendorEvaluation) => {
        try {
            await vendorEvaluationService.approve(evaluation.id)
            addToast({ type: 'success', title: 'Evaluation approved' })
            fetchData()
        } catch (err) {
            console.error('Failed to approve evaluation:', err)
            addToast({ type: 'error', title: 'Failed to approve evaluation' })
        }
    }

    const handleEdit = (evaluation: VendorEvaluation) => {
        router.push(`/procurement/vendor-evaluation/${evaluation.id}/edit`)
    }

    const handleDelete = async (evaluation: VendorEvaluation) => {
        if (!confirm('Are you sure you want to delete this evaluation?')) return
        try {
            await vendorEvaluationService.delete(evaluation.id)
            addToast({ type: 'success', title: 'Evaluation deleted' })
            fetchData()
        } catch (err) {
            console.error('Failed to delete evaluation:', err)
            addToast({ type: 'error', title: 'Failed to delete evaluation' })
        }
    }

    const breadcrumbs = [
        { label: 'Procurement', href: '/procurement' },
        { label: 'Vendor Evaluation' }
    ]

    // Custom actions for the table
    const customActions: CustomAction<VendorEvaluation>[] = useMemo(() => [
        {
            label: 'Mark Complete',
            icon: CheckmarkCircle02Icon,
            onClick: handleComplete,
            show: (row) => row.status === 'draft',
        },
        {
            label: 'Approve',
            icon: Award05Icon,
            onClick: handleApprove,
            show: (row) => row.status === 'completed',
        },
    ], [])

    // Table columns
    const columns: TanStackColumn<VendorEvaluation>[] = useMemo(() => [
        {
            id: 'evaluation_number',
            header: 'Evaluation #',
            accessorKey: 'evaluation_number',
            cell: ({ row }) => (
                <Link
                    href={`/procurement/vendor-evaluation/${row.original.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                    {row.original.evaluation_number}
                </Link>
            ),
        },
        {
            id: 'supplier_name',
            header: 'Supplier',
            accessorKey: 'supplier_name',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.supplier_name || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">
                        {new Date(row.original.evaluation_period_start).toLocaleDateString('id-ID')} - {new Date(row.original.evaluation_period_end).toLocaleDateString('id-ID')}
                    </div>
                </div>
            ),
        },
        {
            id: 'overall_score',
            header: 'Overall Score',
            accessorKey: 'overall_score',
            cell: ({ row }) => (
                <div className="flex items-center">
                    <span className="font-bold">{(row.original.overall_score || 0).toFixed(1)}</span>
                    <span className="text-muted-foreground ml-1">/ 5</span>
                </div>
            ),
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const status = row.original.status
                return (
                    <Badge className={statusColors[status] || statusColors.draft}>
                        {status?.charAt(0).toUpperCase() + status?.slice(1)}
                    </Badge>
                )
            },
        },
        {
            id: 'recommendation',
            header: 'Recommendation',
            accessorKey: 'recommendation',
            cell: ({ row }) => {
                const recommendation = row.original.recommendation
                if (!recommendation) return <span className="text-muted-foreground">-</span>
                return (
                    <Badge className={recommendationColors[recommendation] || 'bg-gray-100 text-gray-800'}>
                        {recommendation.replace('_', ' ').charAt(0).toUpperCase() + recommendation.replace('_', ' ').slice(1)}
                    </Badge>
                )
            },
        },
        {
            id: 'scores',
            header: 'Scores',
            accessorKey: 'quality_score',
            cell: ({ row }) => (
                <div className="flex gap-1 text-xs">
                    <span title="Quality">Q:{row.original.quality_score}</span>
                    <span title="Delivery">D:{row.original.delivery_score}</span>
                    <span title="Price">P:{row.original.price_score}</span>
                    <span title="Service">S:{row.original.service_score}</span>
                    <span title="Compliance">C:{row.original.compliance_score}</span>
                </div>
            ),
        },
    ], [])

    // Filter evaluations based on search
    const filteredEvaluations = useMemo(() => {
        if (!searchQuery) return evaluations
        const query = searchQuery.toLowerCase()
        return evaluations.filter(e =>
            e.evaluation_number?.toLowerCase().includes(query) ||
            e.supplier_name?.toLowerCase().includes(query)
        )
    }, [evaluations, searchQuery])

    if (loading && evaluations.length === 0) {
        return (
            <TwoLevelLayout>
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </TwoLevelLayout>
        )
    }

    return (
        <TwoLevelLayout>
            <Header
                title="Vendor Evaluation"
                description="Evaluate and manage supplier performance"
                breadcrumbs={breadcrumbs}
                actions={
                    <Link href="/procurement/vendor-evaluation/new">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            New Evaluation
                        </Button>
                    </Link>
                }
            />

            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Building03Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Evaluations</p>
                                <p className="text-2xl font-bold">{stats?.total || evaluations.length}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Award05Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Preferred Vendors</p>
                                <p className="text-2xl font-bold">{stats?.preferred_count || 0}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={StarIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                                <p className="text-2xl font-bold">
                                    {(stats?.average_overall_score || 0).toFixed(1)}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={AnalyticsUpIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Needs Improvement</p>
                                <p className="text-2xl font-bold">{stats?.not_recommended_count || 0}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-end gap-2">
                    <div className="relative">
                        <HugeiconsIcon
                            icon={Search01Icon}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                        />
                        <Input
                            placeholder="Search evaluations..."
                            className="pl-9 w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                    <Button variant="outline" size="sm">
                        <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>

                {/* Data Table */}
                {error ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <HugeiconsIcon icon={CancelIcon} className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-lg font-medium mb-2">Error Loading Evaluations</p>
                            <p className="text-muted-foreground mb-4">{error}</p>
                            <Button onClick={fetchData}>Try Again</Button>
                        </div>
                    </div>
                ) : filteredEvaluations.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <HugeiconsIcon icon={Building03Icon} className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-lg font-medium mb-2">No Evaluations Found</p>
                            <p className="text-muted-foreground mb-4">Get started by creating your first vendor evaluation.</p>
                            <Link href="/procurement/vendor-evaluation/new">
                                <Button>
                                    <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                                    New Evaluation
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <TanStackDataTable
                        data={filteredEvaluations}
                        columns={columns}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        customActions={customActions}
                    />
                )}
            </div>
        </TwoLevelLayout>
    )
}
