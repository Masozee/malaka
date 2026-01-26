'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    PlusSignIcon,
    TargetIcon,
    Clock01Icon,
    CheckmarkCircle01Icon,
    AlertCircleIcon,
    Dollar01Icon,
    AnalyticsUpIcon,
    ChartColumnIcon,
    Search01Icon,
    FilterIcon,
    Download01Icon,
    UserIcon,
    UserMultiple02Icon,
    Building01Icon,
    Award01Icon,
} from '@hugeicons/core-free-icons'
import Link from 'next/link'

// Types
export interface SalesTarget {
    id: string
    target_name: string
    target_type: 'individual' | 'team' | 'store' | 'region' | 'company'
    assigned_to: string
    target_period: 'monthly' | 'quarterly' | 'semi_annually' | 'annually'
    start_date: string
    end_date: string
    target_amount: number
    achieved_amount: number
    achievement_percentage: number
    status: 'active' | 'completed' | 'overdue' | 'cancelled'
    priority: 'low' | 'medium' | 'high' | 'critical'
}

// Colors
const statusColors: Record<string, string> = {
    active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
}

const typeIcons: Record<string, any> = {
    individual: UserIcon,
    team: UserMultiple02Icon,
    store: Building01Icon,
    region: ChartColumnIcon,
    company: Award01Icon,
}

const typeColors: Record<string, string> = {
    individual: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    team: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    store: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    region: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    company: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
}

interface TargetsListProps {
    initialData: SalesTarget[]
}

export default function TargetsList({ initialData }: TargetsListProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [targets, setTargets] = useState<SalesTarget[]>(initialData)

    // Filtered Data
    const filteredTargets = useMemo(() => {
        if (!searchQuery) return targets
        const lowerQuery = searchQuery.toLowerCase()
        return targets.filter(
            (t) =>
                t.target_name.toLowerCase().includes(lowerQuery) ||
                t.assigned_to.toLowerCase().includes(lowerQuery)
        )
    }, [targets, searchQuery])

    // Stats
    const stats = useMemo(() => {
        const total = targets.length
        const active = targets.filter(t => t.status === 'active').length
        const completed = targets.filter(t => t.status === 'completed').length
        const overdue = targets.filter(t => t.status === 'overdue').length
        const targetAmount = targets.reduce((sum, t) => sum + t.target_amount, 0)
        const achievedAmount = targets.reduce((sum, t) => sum + t.achieved_amount, 0)
        const avgProgress = targets.length > 0 ? (targets.reduce((sum, t) => sum + t.achievement_percentage, 0) / targets.length) : 0

        return { total, active, completed, overdue, targetAmount, achievedAmount, avgProgress }
    }, [targets])

    // Handlers
    const handleEdit = (target: SalesTarget) => {
        router.push(`/sales/targets/${target.id}/edit`)
    }

    const handleDelete = (target: SalesTarget) => {
        if (confirm('Are you sure you want to delete this target?')) {
            setTargets(prev => prev.filter(t => t.id !== target.id))
            addToast({ type: 'success', title: 'Target deleted successfully' })
        }
    }

    // Columns
    const columns: TanStackColumn<SalesTarget>[] = useMemo(() => [
        {
            id: 'target_name',
            header: 'Target Name',
            accessorKey: 'target_name',
            cell: ({ row }) => (
                <Link
                    href={`/sales/targets/${row.original.id}`}
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                    {row.original.target_name}
                </Link>
            ),
        },
        {
            id: 'assigned_to',
            header: 'Assigned To',
            accessorKey: 'assigned_to',
            cell: ({ row }) => <span className="font-medium">{row.original.assigned_to}</span>,
        },
        {
            id: 'target_type',
            header: 'Type',
            accessorKey: 'target_type',
            cell: ({ row }) => {
                const Icon = typeIcons[row.original.target_type] || TargetIcon
                return (
                    <Badge className={`flex items-center gap-1 w-fit ${typeColors[row.original.target_type] || typeColors.individual}`}>
                        <HugeiconsIcon icon={Icon} className="h-3 w-3" />
                        {row.original.target_type.charAt(0).toUpperCase() + row.original.target_type.slice(1)}
                    </Badge>
                )
            },
        },
        {
            id: 'target_period',
            header: 'Period',
            accessorKey: 'target_period',
            cell: ({ row }) => (
                <span className="capitalize">{row.original.target_period.replace('_', ' ')}</span>
            ),
        },
        {
            id: 'progress',
            header: 'Progress',
            accessorKey: 'achievement_percentage',
            cell: ({ row }) => {
                const percentage = row.original.achievement_percentage
                return (
                    <div className="flex flex-col items-center gap-1">
                        <span className={`text-xs font-bold ${percentage >= 100 ? 'text-green-600' :
                            percentage >= 80 ? 'text-blue-600' :
                                percentage >= 60 ? 'text-orange-600' : 'text-red-600'
                            }`}>
                            {percentage.toFixed(1)}%
                        </span>
                        <div className="h-1.5 w-16 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
                            <div
                                className={`h-full ${percentage >= 100 ? 'bg-green-500' :
                                    percentage >= 80 ? 'bg-blue-500' :
                                        percentage >= 60 ? 'bg-orange-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>
                    </div>
                )
            },
        },
        {
            id: 'amounts',
            header: 'Target / Achieved',
            accessorKey: 'target_amount',
            cell: ({ row }) => (
                <div className="flex flex-col text-right text-xs">
                    <span className="font-medium">{(row.original.target_amount / 1000000).toFixed(1)}M</span>
                    <span className="text-muted-foreground">{(row.original.achieved_amount / 1000000).toFixed(1)}M</span>
                </div>
            ),
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => (
                <Badge className={statusColors[row.original.status] || statusColors.active}>
                    {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
                </Badge>
            ),
        },
    ], [])

    const breadcrumbs = [
        { label: 'Sales', href: '/sales' },
        { label: 'Targets' },
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Sales Targets"
                description="Manage sales targets and track achievement progress"
                breadcrumbs={breadcrumbs}
                actions={
                    <Link href="/sales/targets/new">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            New Target
                        </Button>
                    </Link>
                }
            />

            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={TargetIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Targets</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active</p>
                                <p className="text-2xl font-bold">{stats.active}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold">{stats.completed}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                                <p className="text-2xl font-bold">{stats.overdue}</p>
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
                            placeholder="Search targets..."
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

                {/* Table */}
                <TanStackDataTable
                    data={filteredTargets}
                    columns={columns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    pagination={{
                        pageIndex: 0,
                        pageSize: 10,
                        totalRows: filteredTargets.length,
                        onPageChange: () => { },
                    }}
                />
            </div>
        </TwoLevelLayout>
    )
}
