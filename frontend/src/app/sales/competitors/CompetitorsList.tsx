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
    FlashIcon,
    AlertCircleIcon,
    CrownIcon,
    CheckmarkCircle01Icon,
    ChartColumnIcon,
    Dollar01Icon,
    Globe02Icon,
    Search01Icon,
    FilterIcon,
    Download01Icon,
} from '@hugeicons/core-free-icons'
import Link from 'next/link'

// Types
export interface Competitor {
    id: string
    company_name: string
    brand_name: string
    company_type: 'local' | 'national' | 'international' | 'online_only'
    market_position: 'leader' | 'challenger' | 'follower' | 'niche'
    business_model: 'b2c' | 'b2b' | 'hybrid'
    headquarters: string
    website?: string
    founded_year: number
    estimated_revenue: number
    market_share_percentage: number
    employee_count: number
    store_count: number
    online_presence_score: number
    product_similarity_score: number
    price_competitiveness: 'higher' | 'similar' | 'lower'
    strengths: string[]
    weaknesses: string[]
    threat_level: 'low' | 'medium' | 'high' | 'critical'
    monitoring_status: 'active' | 'passive' | 'discontinued'
    last_analysis_date: string
    created_by: string
    updated_by: string
    created_at: string
    updated_at: string
}

// Colors
const threatColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

const positionColors: Record<string, string> = {
    leader: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    challenger: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    follower: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    niche: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
}

interface CompetitorsListProps {
    initialData: Competitor[]
}

export default function CompetitorsList({ initialData }: CompetitorsListProps) {
    const router = useRouter()
    const { addToast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [competitors, setCompetitors] = useState<Competitor[]>(initialData)

    // Filtered Data
    const filteredCompetitors = useMemo(() => {
        if (!searchQuery) return competitors
        const lowerQuery = searchQuery.toLowerCase()
        return competitors.filter(
            (c) =>
                c.company_name.toLowerCase().includes(lowerQuery) ||
                c.brand_name.toLowerCase().includes(lowerQuery)
        )
    }, [competitors, searchQuery])

    // Stats
    const stats = useMemo(() => {
        const total = competitors.length
        const critical = competitors.filter(c => c.threat_level === 'critical').length
        const leaders = competitors.filter(c => c.market_position === 'leader').length
        const active = competitors.filter(c => c.monitoring_status === 'active').length

        return { total, critical, leaders, active }
    }, [competitors])

    // Handlers
    const handleEdit = (competitor: Competitor) => {
        router.push(`/sales/competitors/${competitor.id}/edit`)
    }

    const handleDelete = (competitor: Competitor) => {
        if (confirm('Are you sure you want to delete this competitor?')) {
            setCompetitors(prev => prev.filter(c => c.id !== competitor.id))
            addToast({ type: 'success', title: 'Competitor deleted successfully' })
        }
    }

    // Columns
    const columns: TanStackColumn<Competitor>[] = useMemo(() => [
        {
            id: 'company_name',
            header: 'Company',
            accessorKey: 'company_name',
            cell: ({ row }) => (
                <div>
                    <Link
                        href={`/sales/competitors/${row.original.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                        {row.original.company_name}
                    </Link>
                    <div className="text-sm text-gray-500">{row.original.brand_name}</div>
                </div>
            ),
        },
        {
            id: 'market_position',
            header: 'Position',
            accessorKey: 'market_position',
            cell: ({ row }) => (
                <Badge className={positionColors[row.original.market_position] || positionColors.follower}>
                    {row.original.market_position.charAt(0).toUpperCase() + row.original.market_position.slice(1)}
                </Badge>
            ),
        },
        {
            id: 'market_share_percentage',
            header: 'Market Share',
            accessorKey: 'market_share_percentage',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.original.market_share_percentage}%</span>
                    <div className="h-2 w-16 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
                        <div
                            className="h-full bg-blue-500"
                            style={{ width: `${Math.min(row.original.market_share_percentage, 100)}%` }}
                        />
                    </div>
                </div>
            ),
        },
        {
            id: 'estimated_revenue',
            header: 'Est. Revenue',
            accessorKey: 'estimated_revenue',
            cell: ({ row }) => (
                <span>
                    {(row.original.estimated_revenue / 1000000000000).toFixed(1)}T
                </span>
            ),
        },
        {
            id: 'threat_level',
            header: 'Threat Level',
            accessorKey: 'threat_level',
            cell: ({ row }) => (
                <Badge className={threatColors[row.original.threat_level] || threatColors.low}>
                    {row.original.threat_level.charAt(0).toUpperCase() + row.original.threat_level.slice(1)}
                </Badge>
            ),
        },
        {
            id: 'online_presence_score',
            header: 'Online Score',
            accessorKey: 'online_presence_score',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.original.online_presence_score}</span>
                    <div className="h-2 w-16 bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden">
                        <div
                            className={`h-full ${row.original.online_presence_score > 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${row.original.online_presence_score}%` }}
                        />
                    </div>
                </div>
            ),
        },
    ], [])

    const breadcrumbs = [
        { label: 'Sales', href: '/sales' },
        { label: 'Competitors' },
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Competitor Analysis"
                description="Monitor competitors and track market intelligence"
                breadcrumbs={breadcrumbs}
                actions={
                    <Link href="/sales/competitors/new">
                        <Button>
                            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                            Add Competitor
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
                                <HugeiconsIcon icon={FlashIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Competitors</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Critical Threats</p>
                                <p className="text-2xl font-bold">{stats.critical}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CrownIcon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Leaders</p>
                                <p className="text-2xl font-bold">{stats.leaders}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Monitoring</p>
                                <p className="text-2xl font-bold">{stats.active}</p>
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
                            aria-hidden="true"
                        />
                        <Input
                            placeholder="Search competitors..."
                            className="pl-9 w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm" aria-label="Filter competitors">
                        <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 mr-2" aria-hidden="true" />
                        Filters
                    </Button>
                    <Button variant="outline" size="sm" aria-label="Export competitor data">
                        <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" aria-hidden="true" />
                        Export
                    </Button>
                </div>

                {/* Table */}
                <TanStackDataTable
                    data={filteredCompetitors}
                    columns={columns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    pagination={{
                        pageIndex: 0,
                        pageSize: 10,
                        totalRows: filteredCompetitors.length,
                        onPageChange: () => { },
                    }}
                />
            </div>
        </TwoLevelLayout>
    )
}
