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
import { BookmarkToggle } from '@/components/ui/bookmark-toggle'
import { financialForecastService, type FinancialForecast } from '@/services/finance'

export default function FinancialPlanningPage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [scenarioFilter, setScenarioFilter] = useState<string>('all')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [forecasts, setForecasts] = useState<FinancialForecast[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                const data = await financialForecastService.getAll()
                setForecasts(data)
            } catch (err) {
                console.error('Failed to fetch forecasts:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // --- Stats ---
    const stats = useMemo(() => {
        const approvedPlan = forecasts.find(f => f.status === 'approved' && f.fiscal_year === '2025')
        const growthTarget = approvedPlan ? approvedPlan.growth_rate : 0
        const revenueTarget = approvedPlan ? approvedPlan.projected_revenue : 0
        const activeScenarios = forecasts.filter(f => f.status !== 'approved').length
        return { growthTarget, revenueTarget, activeScenarios }
    }, [forecasts])

    // --- Filter ---
    const filteredData = useMemo(() => {
        let data = forecasts
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item => item.scenario_name.toLowerCase().includes(lower))
        }
        if (scenarioFilter !== 'all') {
            data = data.filter(item => item.type === scenarioFilter)
        }
        return data
    }, [searchTerm, scenarioFilter, forecasts])

    // --- Columns ---
    const columns: TanStackColumn<FinancialForecast>[] = [
        {
            id: 'name',
            header: 'Scenario Name',
            accessorKey: 'scenario_name',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.scenario_name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.fiscal_year} - {row.original.type}</span>
                </div>
            )
        },
        {
            id: 'revenue',
            header: 'Proj. Revenue',
            accessorKey: 'projected_revenue',
            cell: ({ row }) => <span className="text-sm font-medium">Rp {(row.original.projected_revenue / 1000000000).toFixed(1)}B</span>
        },
        {
            id: 'ebitda',
            header: 'Proj. EBITDA',
            accessorKey: 'projected_ebitda',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">Rp {(row.original.projected_ebitda / 1000000000).toFixed(1)}B</span>
        },
        {
            id: 'growth',
            header: 'Growth Rate',
            accessorKey: 'growth_rate',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <span className={`text-sm font-medium ${row.original.growth_rate >= 10 ? 'text-green-600' : 'text-blue-600'}`}>
                        {row.original.growth_rate}%
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
                const config: Record<string, { label: string; color: string }> = {
                    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
                    review: { label: 'In Review', color: 'bg-yellow-100 text-yellow-800' },
                    approved: { label: 'Approved', color: 'bg-green-100 text-green-800' }
                }
                const s = config[row.original.status] || { label: row.original.status, color: 'bg-gray-100 text-gray-800' }
                return <Badge className={`${s.color} border-0 capitalize`}>{s.label}</Badge>
            }
        },
        {
            id: 'lastModified',
            header: 'Last Modified',
            accessorKey: 'updated_at',
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{mounted && row.original.updated_at ? new Date(row.original.updated_at).toLocaleDateString() : '-'}</span>
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
                    <div className="flex items-center gap-2">
                        <BookmarkToggle itemId="financial-planning" />
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                            New Forecast
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
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-muted-foreground">Loading forecasts...</div>
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
