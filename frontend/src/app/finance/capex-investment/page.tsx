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
    ChartLineData02Icon,
    Search01Icon,
    Download01Icon,
    PlusSignIcon,
    MoneySendSquareIcon,
    Settings02Icon,
    MoreHorizontalIcon
} from '@hugeicons/core-free-icons'

// --- Types ---
type CapexStatus = 'planning' | 'approved' | 'active' | 'completed' | 'on_hold'
type Priority = 'high' | 'medium' | 'low'

interface CapexProject {
    id: string
    projectName: string
    description: string
    category: 'Equipment' | 'Infrastructure' | 'Technology' | 'Vehicle'
    estBudget: number
    actualSpent: number
    expectedRoi: number
    status: CapexStatus
    priority: Priority
    completionDate: string
}

// --- Mock Data ---
const mockProjects: CapexProject[] = [
    {
        id: '1',
        projectName: 'New Assembly Line Automation',
        description: 'Automating the main shoe assembly line to increase capacity by 40%',
        category: 'Equipment',
        estBudget: 2500000000,
        actualSpent: 850000000,
        expectedRoi: 18.5,
        status: 'active',
        priority: 'high',
        completionDate: '2024-08-15'
    },
    {
        id: '2',
        projectName: 'Warehouse Solar Panel Installation',
        description: 'Green energy initiative to reduce electricity costs',
        category: 'Infrastructure',
        estBudget: 800000000,
        actualSpent: 50000000,
        expectedRoi: 12.0,
        status: 'approved',
        priority: 'medium',
        completionDate: '2024-11-30'
    },
    {
        id: '3',
        projectName: 'ERP System Upgrade',
        description: 'Migration to new server infrastructure',
        category: 'Technology',
        estBudget: 450000000,
        actualSpent: 420000000,
        expectedRoi: 15.0,
        status: 'active',
        priority: 'high',
        completionDate: '2024-03-31'
    },
    {
        id: '4',
        projectName: 'New Delivery Fleet',
        description: 'Purchase of 5 new electric vans',
        category: 'Vehicle',
        estBudget: 1200000000,
        actualSpent: 0,
        expectedRoi: 8.5,
        status: 'planning',
        priority: 'medium',
        completionDate: '2024-12-31'
    }
]

export default function CapexPage() {
    const { addToast } = useToast()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // --- Stats ---
    const stats = useMemo(() => {
        const totalBudget = mockProjects.reduce((sum, p) => sum + p.estBudget, 0)
        const totalSpent = mockProjects.reduce((sum, p) => sum + p.actualSpent, 0)
        const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
        const activeProjects = mockProjects.filter(p => p.status === 'active').length
        return { totalBudget, totalSpent, utilization, activeProjects }
    }, [])

    // --- Filter ---
    const filteredData = useMemo(() => {
        let data = mockProjects
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            data = data.filter(item =>
                item.projectName.toLowerCase().includes(lower) ||
                item.description.toLowerCase().includes(lower)
            )
        }
        if (statusFilter !== 'all') {
            data = data.filter(item => item.status === statusFilter)
        }
        return data
    }, [searchTerm, statusFilter])

    // --- Columns ---
    const columns: TanStackColumn<CapexProject>[] = [
        {
            id: 'projectName',
            header: 'Project Name',
            accessorKey: 'projectName',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.original.projectName}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</span>
                </div>
            )
        },
        {
            id: 'category',
            header: 'Category',
            accessorKey: 'category',
            cell: ({ row }) => <span className="text-sm">{row.original.category}</span>
        },
        {
            id: 'progress',
            header: 'Budget Progress',
            cell: ({ row }) => {
                const pct = (row.original.actualSpent / row.original.estBudget) * 100
                return (
                    <div className="w-[140px] space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Spent: Rp {(row.original.actualSpent / 1000000).toFixed(0)}M</span>
                            <span className="font-medium">{pct.toFixed(0)}%</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                        <div className="text-xs text-muted-foreground">Total: Rp {(row.original.estBudget / 1000000).toFixed(0)}M</div>
                    </div>
                )
            }
        },
        {
            id: 'roi',
            header: 'Req. ROI',
            accessorKey: 'expectedRoi',
            cell: ({ row }) => <span className="text-sm font-medium">{row.original.expectedRoi}%</span>
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => {
                const config = {
                    planning: { label: 'Planning', color: 'bg-gray-100 text-gray-800' },
                    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800' },
                    active: { label: 'Active', color: 'bg-purple-100 text-purple-800' },
                    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
                    on_hold: { label: 'On Hold', color: 'bg-yellow-100 text-yellow-800' }
                }
                const s = config[row.original.status]
                return <Badge className={`${s.color} border-0 capitalize`}>{s.label}</Badge>
            }
        },
        {
            id: 'priority',
            header: 'Priority',
            accessorKey: 'priority',
            cell: ({ row }) => {
                const colors = {
                    high: 'text-red-600',
                    medium: 'text-orange-600',
                    low: 'text-blue-600'
                }
                return <span className={`text-xs font-medium uppercase ${colors[row.original.priority]}`}>{row.original.priority}</span>
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
                            Copy Project ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Update Progress</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ]

    return (
        <TwoLevelLayout>
            <Header
                title="CapEx & Investment"
                description="Monitor capital expenditure projects and investment portfolio"
                breadcrumbs={[
                    { label: 'Finance', href: '/finance' },
                    { label: 'CapEx & Investment' }
                ]}
                actions={
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                        New Project
                    </Button>
                }
            />

            <div className="flex-1 p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total CapEx Budget</p>
                                <p className="text-2xl font-bold">Rp {(stats.totalBudget / 1000000000).toFixed(2)}B</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={MoneySendSquareIcon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Budget Utilization</p>
                                <p className="text-2xl font-bold">{stats.utilization.toFixed(1)}%</p>
                            </div>
                            <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={ChartLineData02Icon} className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                                <p className="text-2xl font-bold">{stats.activeProjects}</p>
                            </div>
                            <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Settings02Icon} className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between gap-2">
                    <div className="relative w-64">
                        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[150px] h-9">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <HugeiconsIcon icon={Download01Icon} className="w-4 h-4 mr-2" />
                            Export
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
                        <DialogTitle>New Investment Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Project Name</Label>
                            <Input placeholder="e.g. New Equipment Purchase" />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select>
                                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Equipment">Equipment</SelectItem>
                                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                    <SelectItem value="Technology">Technology</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Estimated Budget</Label>
                            <Input type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <Label>Expected ROI (%)</Label>
                            <Input type="number" placeholder="0.0" />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button onClick={() => {
                                addToast({ type: 'success', title: 'Project created' })
                                setIsAddModalOpen(false)
                            }}>Create Project</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </TwoLevelLayout>
    )
}
