'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search01Icon,
  FilterIcon,
  Download01Icon,
  PlusSignIcon,
  EyeIcon,
  PencilEdit01Icon,
  MoreVerticalIcon,
  Calendar01Icon,
  Coins01Icon,
  TruckIcon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  Delete02Icon
} from '@hugeicons/core-free-icons'
import { ProductionService, mockProductionPlans } from '@/services/production'
import { ProductionPlan } from '@/types/production'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

// Mock types for requirements (since they are mocked in the original file)
interface MaterialRequirement {
  id: string
  materialCode: string
  materialName: string
  currentStock: number
  requiredQuantity: number
  shortfall: number
  unitCost: number
  totalCost: number
  supplier: string
  leadTime: number
  status: 'sufficient' | 'shortage' | 'critical'
  category: string
}

// Mock data (copied from original)
const mockMaterialRequirements: MaterialRequirement[] = [
  {
    id: '1',
    materialCode: 'LEATHER-001',
    materialName: 'Premium Leather Black',
    currentStock: 45,
    requiredQuantity: 120,
    shortfall: 75,
    unitCost: 150000,
    totalCost: 11250000,
    supplier: 'PT Bahan Baku Indonesia',
    leadTime: 7,
    status: 'shortage',
    category: 'Raw Material'
  },
  {
    id: '2',
    materialCode: 'SOLE-001',
    materialName: 'Rubber Sole Premium',
    currentStock: 200,
    requiredQuantity: 150,
    shortfall: 0,
    unitCost: 85000,
    totalCost: 0,
    supplier: 'Sole & Rubber Co',
    leadTime: 5,
    status: 'sufficient',
    category: 'Components'
  },
  {
    id: '3',
    materialCode: 'THREAD-001',
    materialName: 'Synthetic Thread Brown',
    currentStock: 25,
    requiredQuantity: 80,
    shortfall: 55,
    unitCost: 45000,
    totalCost: 2475000,
    supplier: 'Thread Supplies Ltd',
    leadTime: 3,
    status: 'shortage',
    category: 'Consumables'
  }
]

const statusConfig: Record<string, { label: string, color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  approved: { label: 'Approved', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200' },
  active: { label: 'Active', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' }
}

const reqStatusConfig: Record<string, { label: string, color: string }> = {
  sufficient: { label: 'Sufficient', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
  shortage: { label: 'Shortage', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
  critical: { label: 'Critical', color: 'bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-100' }
}

export default function MaterialPlanningPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'plans' | 'requirements'>('plans')
  const [plans, setPlans] = useState<ProductionPlan[]>([])
  const [requirements, setRequirements] = useState<MaterialRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Use imported mock data for now as per original file
        const response = await ProductionService.getProductionPlans()
        const items = (response.data as any)?.data || (response as any).data || []
        setPlans(Array.isArray(items) ? items : mockProductionPlans)
        setRequirements(mockMaterialRequirements)
      } catch (error) {
        console.error('Failed to fetch planning data:', error)
        setPlans(mockProductionPlans)
        setRequirements(mockMaterialRequirements)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredPlans = useMemo(() => {
    if (!searchQuery) return plans
    const lower = searchQuery.toLowerCase()
    return plans.filter(item =>
      item.planNumber.toLowerCase().includes(lower) ||
      item.planName.toLowerCase().includes(lower)
    )
  }, [plans, searchQuery])

  const filteredReqs = useMemo(() => {
    if (!searchQuery) return requirements
    const lower = searchQuery.toLowerCase()
    return requirements.filter(item =>
      item.materialName.toLowerCase().includes(lower) ||
      item.materialCode.toLowerCase().includes(lower)
    )
  }, [requirements, searchQuery])

  // Stats
  const stats = useMemo(() => {
    const totalPlans = plans.length
    const totalValue = plans.reduce((sum, i) => sum + (i.totalValue || 0), 0)
    const shortages = requirements.filter(i => ['shortage', 'critical'].includes(i.status)).length
    const shortfallValue = requirements.reduce((sum, i) => sum + (i.totalCost || 0), 0)
    return { totalPlans, totalValue, shortages, shortfallValue }
  }, [plans, requirements])

  const planColumns: TanStackColumn<ProductionPlan>[] = useMemo(() => [
    {
      id: 'info',
      header: 'Plan',
      accessorKey: 'planNumber',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link
            href={`/production/material-planning/${row.original.id}`}
            className="font-bold text-xs text-foreground hover:underline"
          >
            {row.original.planNumber}
          </Link>
          <span className="text-[10px] text-muted-foreground">{row.original.planName}</span>
        </div>
      )
    },
    {
      id: 'date',
      header: 'Period',
      accessorKey: 'startDate',
      cell: ({ row }) => (
        <div className="flex flex-col text-[10px] text-muted-foreground">
          <span>{new Date(row.original.startDate).toLocaleDateString()}</span>
          <span>to {new Date(row.original.endDate).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      id: 'products',
      header: 'Target',
      accessorKey: 'totalQuantity',
      cell: ({ row }) => (
        <div className="text-center">
          <span className="font-medium text-foreground">{row.original.totalQuantity}</span>
          <span className="text-[10px] text-muted-foreground block">{row.original.totalProducts} items</span>
        </div>
      )
    },
    {
      id: 'value',
      header: 'Value',
      accessorKey: 'totalValue',
      cell: ({ row }) => (
        <div className="font-medium text-xs text-foreground">
          {row.original.totalValue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const config = statusConfig[row.original.status]
        return (
          <Badge className={`${config.color} border-0 capitalize`}>
            {config.label}
          </Badge>
        )
      }
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/production/material-planning/${row.original.id}`)}>
                <HugeiconsIcon icon={EyeIcon} className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/production/material-planning/${row.original.id}/edit`)}>
                <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 h-4 w-4" />
                Edit Plan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => { }}>
                <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ], [router])

  const reqColumns: TanStackColumn<MaterialRequirement>[] = useMemo(() => [
    {
      id: 'material',
      header: 'Material',
      accessorKey: 'materialName',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-xs text-foreground">{row.original.materialName}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.materialCode} • {row.original.category}</span>
        </div>
      )
    },
    {
      id: 'stock',
      header: 'Stock / Required',
      accessorKey: 'currentStock',
      cell: ({ row }) => {
        const percent = row.original.requiredQuantity > 0 ? (row.original.currentStock / row.original.requiredQuantity) * 100 : 0
        return (
          <div className="w-full min-w-[120px] flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{row.original.currentStock} / {row.original.requiredQuantity}</span>
            </div>
            <Progress value={percent} className="h-1.5" />
          </div>
        )
      }
    },
    {
      id: 'shortfall',
      header: 'Shortfall',
      accessorKey: 'shortfall',
      cell: ({ row }) => (
        <div className={`font-medium text-center ${row.original.shortfall > 0 ? 'text-destructive' : 'text-green-600'}`}>
          {row.original.shortfall > 0 ? `-${row.original.shortfall}` : 'OK'}
        </div>
      )
    },
    {
      id: 'cost',
      header: 'Est. Cost',
      accessorKey: 'totalCost',
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground">
          {row.original.totalCost > 0 ? row.original.totalCost.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : '-'}
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const config = reqStatusConfig[row.original.status]
        return (
          <Badge className={`${config.color} border-0 capitalize`}>
            {config.label}
          </Badge>
        )
      }
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {row.original.shortfall > 0 && (
            <Button size="sm" variant="outline" className="h-8 gap-2">
              Order
            </Button>
          )}
        </div>
      )
    }
  ], [router])


  return (
    <TwoLevelLayout>
      <Header
        title="Material Planning"
        description="Plan material requirements and manage production schedules"
        breadcrumbs={[
          { label: 'Production', href: '/production' },
          { label: 'Material Planning' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              MRP Report
            </Button>
            <Link href="/production/material-planning/new">
              <Button>
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                New Plan
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalPlans}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plan Value</p>
                <p className="text-2xl font-bold truncate text-foreground" title={stats.totalValue.toLocaleString()}>
                  {stats.totalValue > 1000000000
                    ? `${(stats.totalValue / 1000000000).toFixed(1)}B`
                    : `${(stats.totalValue / 1000000).toFixed(1)}M`}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shortages</p>
                <p className="text-2xl font-bold text-destructive">{stats.shortages}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Est. Cost</p>
                <p className="text-2xl font-bold truncate text-foreground" title={stats.shortfallValue.toLocaleString()}>
                  {stats.shortfallValue > 1000000000
                    ? `${(stats.shortfallValue / 1000000000).toFixed(1)}B`
                    : `${(stats.shortfallValue / 1000000).toFixed(1)}M`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === 'plans' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('plans')}
            >
              Production Plans
            </Button>
            <Button
              variant={activeTab === 'requirements' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('requirements')}
            >
              Requirements
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 w-full md:w-64"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
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
        </div>

        {/* Table */}
        {activeTab === 'plans' ? (
          <TanStackDataTable
            data={filteredPlans}
            columns={planColumns}
            pagination={{
              pageSize: 10,
              pageIndex: 0,
              totalRows: filteredPlans.length,
              onPageChange: () => { }
            }}
          />
        ) : (
          <TanStackDataTable
            data={filteredReqs}
            columns={reqColumns}
            pagination={{
              pageSize: 10,
              pageIndex: 0,
              totalRows: filteredReqs.length,
              onPageChange: () => { }
            }}
          />
        )}
      </div>
    </TwoLevelLayout>
  )
}