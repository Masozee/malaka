'use client'

import React, { useState, useMemo } from 'react'
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
    ChartLineData02Icon,
    Search01Icon,
    Download01Icon,
    PlusSignIcon,
    Target01Icon,
    ArrowRight01Icon,
    ActivityIcon,
    MoreHorizontalIcon
} from '@hugeicons/core-free-icons'

// --- Types ---
type ForecastScenario = 'Base Case' | 'Optimistic' | 'Conservative'
type PlanStatus = 'draft' | 'review' | 'approved'

interface FinancialForecast {
    id: string
    scenarioName: string
    type: ForecastScenario
    fiscalYear: string
    projectedRevenue: number
    projectedEbitda: number
    growthRate: number
    status: PlanStatus
    lastModified: string
}

// --- Mock Data ---
const mockForecasts: FinancialForecast[] = [
    {
        id: '1',
        scenarioName: 'FY2025 Base Budget',
        type: 'Base Case',
        fiscalYear: '2025',
        projectedRevenue: 45000000000,
        projectedEbitda: 8500000000,
        growthRate: 12.5,
        status: 'approved',
        lastModified: '2024-01-15'
    },
    {
        id: '2',
        scenarioName: 'FY2025 Aggressive Growth',
        type: 'Optimistic',
        fiscalYear: '2025',
        projectedRevenue: 52000000000,
        projectedEbitda: 9800000000,
        growthRate: 25.0,
        status: 'review',
        lastModified: '2024-02-01'
    },
    {
        id: '3',
        scenarioName: 'FY2025 Market Downturn',
        type: 'Conservative',
        fiscalYear: '2025',
        projectedRevenue: 38000000000,
        projectedEbitda: 6000000000,
        growthRate: 5.0,
        status: 'draft',
        lastModified: '2024-02-10'
    },
    {
        id: '4',
        scenarioName: 'FY2026 Long Range Plan',
        type: 'Base Case',
        fiscalYear: '2026',
        projectedRevenue: 55000000000,
        projectedEbitda: 11000000000,
        growthRate: 15.0,
        status: 'draft',
        lastModified: '2024-01-20'
    }
]

export default function FinancialPlanningPage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [scenarioFilter, setScenarioFilter] = useState<string>('all')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // --- Stats ---
    const stats = useMemo(() => {
        const approvedPlan = mockForecasts.find(f => f.status === 'approved' && f.fiscalYear === '2025')
        const growthTarget = approvedPlan ? approvedPlan.growthRate : 0
        const revenueTarget = approvedPlan ? approvedPlan.projectedRevenue : 0
        const activeScenarios = mockForecasts.filter(f => f.status !== 'approved').length
        return { growthTarget, revenueTarget, activeScenarios }
    }, [])

    // --- Filter ---
    const filteredData = useMemo(() => {
        let data = mockForecasts
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item => item.scenarioName.toLowerCase().includes(lower))
        }
        if (scenarioFilter !== 'all') {
            data = data.filter(item => item.type === scenarioFilter)
        }
        return data
    }, [searchTerm, scenarioFilter])

    // --- Columns ---
    const columns: TanStackColumn<FinancialForecast>[] = [
        {
            id: 'name',
            header: 'Scenario Name',
            accessorKey: 'scenarioName',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.scenarioName}</span>
                    <span className="text-xs text-muted-foreground">{row.original.fiscalYear} - {row.original.type}</span>
                </div>
            )
        },
        {
            id: 'revenue',
            header: 'Proj. Revenue',
            accessorKey: 'projectedRevenue',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {(row.original.projectedRevenue / 1000000000).toFixed(1)}B</span>
        },
        {
            id: 'ebitda',
            header: 'Proj. EBITDA',
            accessorKey: 'projectedEbitda',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">Rp {(row.original.projectedEbitda / 1000000000).toFixed(1)}B</span>
        },
        {
            id: 'growth',
            header: 'Growth Rate',
            accessorKey: 'growthRate',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <span className={`text-sm font-medium ${row.original.growthRate >= 10 ? 'text-green-600' : 'text-blue-600'}`}>
                        {row.original.growthRate}%
                    </span>
                    <HugeiconsIcon icon={ActivityIcon} className="w-3 h-3 text-muted-foreground" />
                </div>
            )
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const config = {
                    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
                    review: { label: 'In Review', color: 'bg-yellow-100 text-yellow-800' },
                    approved: { label: 'Approved', color: 'bg-green-100 text-green-800' }
                }
                const s = config[row.original.status]
                return <Badge className={`${s.color} border-0 capitalize`}>{s.label}</Badge>
            }
        },
        {
            id: 'lastModified',
            header: 'Last Modified',
            accessorKey: 'lastModified',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.lastModified}</span>
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
                        <DropdownMenuItem>View Forecast</DropdownMenuItem>
                        <DropdownMenuItem>Compare Scenarios</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="Financial Planning"
                description="Forecasting, scenario modeling, and long-term strategy"
                breadcrumbs={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'Financial Planning' }
                ]}
                actions={
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                        New Forecast
                    </Button>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Revenue Target (Base)</p>
                                <p className="text-2xl font-bold">Rp {(stats.revenueTarget / 1000000000).toFixed(1)}B</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Target01Icon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Growth Target</p>
                                <p className="text-2xl font-bold text-green-600">+{stats.growthTarget}%</p>
                            </div>
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={ActivityIcon} className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Scenarios</p>
                                <p className="text-2xl font-bold">{stats.activeScenarios}</p>
                            </div>
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={ChartLineData02Icon} className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search scenarios..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={scenarioFilter} onValueChange={setScenarioFilter}>
                            <SelectTrigger className="w-[180px] h-9">
                                <SelectValue placeholder="Scenario Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Scenarios</SelectItem>
                                <SelectItem value="Base Case">Base Case</SelectItem>
                                <SelectItem value="Optimistic">Optimistic</SelectItem>
                                <SelectItem value="Conservative">Conservative</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <HugeiconsIcon icon={Download01Icon} className="w-4 h-4 mr-2" />
                            Export Plan
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
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Forecast Scenario</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Scenario Name</Label>
                            <Input placeholder="e.g. FY2026 High Growth" />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select>
                                <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Base Case">Base Case</SelectItem>
                                    <SelectItem value="Optimistic">Optimistic</SelectItem>
                                    <SelectItem value="Conservative">Conservative</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Fiscal Year</Label>
                            <Input placeholder="YYYY" />
                        </div>
                        <div className="space-y-2">
                            <Label>Base Revenue Projection</Label>
                            <Input type="number" placeholder="0" />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                            <Button onClick={() => {
                                addToast({ type: 'success', title: 'Scenario created' })
                                setIsCreateModalOpen(false)
                            }}>Create Scenario</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </TwoLevelLayout>
    )
}
