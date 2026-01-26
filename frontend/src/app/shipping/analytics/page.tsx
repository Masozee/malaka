'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    DeliveryTruck01Icon,
    Time04Icon,
    CheckmarkCircle01Icon,
    ChartLineData01Icon,
    Money03Icon,
    Download01Icon
} from '@hugeicons/core-free-icons'

// Mock Analytics Data
const mockShippingStats = {
    totalShipments: 12450,
    deliveredShipments: 11850,
    pendingShipments: 450,
    failedShipments: 150,
    onTimeRate: 95.2,
    avgDeliveryDays: 2.3,
    totalCost: 450000000,
    costPerShipment: 36144
}

const mockCourierPerformance = [
    { id: '1', name: 'JNE Express', shipments: 4500, onTime: 96.5, avgDays: 2.1, cost: 35000 },
    { id: '2', name: 'SiCepat', shipments: 3200, onTime: 94.8, avgDays: 2.4, cost: 34000 },
    { id: '3', name: 'J&T Express', shipments: 2800, onTime: 95.2, avgDays: 2.2, cost: 33000 },
    { id: '4', name: 'Pos Indonesia', shipments: 1200, onTime: 92.5, avgDays: 3.1, cost: 28000 },
    { id: '5', name: 'GoSend/Grab', shipments: 750, onTime: 98.2, avgDays: 0.5, cost: 45000 }
]

const mockShipmentTrends = [
    { month: 'Jan', shipments: 850, cost: 32000000 },
    { month: 'Feb', shipments: 920, cost: 34500000 },
    { month: 'Mar', shipments: 1050, cost: 38200000 },
    { month: 'Apr', shipments: 1100, cost: 39500000 },
    { month: 'May', shipments: 1250, cost: 44200000 },
    { month: 'Jun', shipments: 1400, cost: 49500000 }
]

export default function ShippingAnalyticsPage() {
    const [mounted, setMounted] = useState(false)
    const [timeRange, setTimeRange] = useState('month')

    useEffect(() => {
        setMounted(true)
    }, [])

    const breadcrumbs = [
        { label: 'Shipping', href: '/shipping' },
        { label: 'Analytics', href: '/shipping/analytics' }
    ]

    const formatCurrency = (amount: number) => {
        if (!mounted) return ''
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
    }

    const courierColumns: TanStackColumn<typeof mockCourierPerformance[0]>[] = [
        {
            accessorKey: 'name',
            id: 'name',
            header: 'Courier Name',
            cell: ({ row }) => <div className="font-medium">{row.original.name}</div>
        },
        {
            accessorKey: 'shipments',
            id: 'shipments',
            header: 'Total Shipments',
            cell: ({ row }) => <div className="text-center">{row.original.shipments.toLocaleString()}</div>
        },
        {
            accessorKey: 'onTime',
            id: 'onTime',
            header: 'On-Time Rate',
            cell: ({ row }) => {
                const val = row.original.onTime
                return (
                    <div className="flex items-center space-x-2">
                        <Progress value={val} className="h-2 w-16" />
                        <span className="text-sm text-muted-foreground">{val}%</span>
                    </div>
                )
            }
        },
        {
            accessorKey: 'avgDays',
            id: 'avgDays',
            header: 'Avg Days',
            cell: ({ row }) => <div className="text-center">{row.original.avgDays} days</div>
        },
        {
            accessorKey: 'cost',
            id: 'cost',
            header: 'Avg Cost',
            cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.cost)}</div>
        }
    ]

    return (
        <TwoLevelLayout>
            <div className="flex-1 space-y-6">
                <Header
                    title="Shipping Analytics"
                    description="Performance metrics and shipping insights"
                    breadcrumbs={breadcrumbs}
                    actions={
                        <div className="flex items-center space-x-3">
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Time Range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="week">This Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="quarter">This Quarter</SelectItem>
                                    <SelectItem value="year">This Year</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm">
                                <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                                export Report
                            </Button>
                        </div>
                    }
                />

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={DeliveryTruck01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <Badge variant="secondary">
                                <HugeiconsIcon icon={ChartLineData01Icon} className="h-3 w-3 mr-1" />
                                +12.5%
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Shipments</p>
                            <h3 className="text-2xl font-bold mt-1">{mockShippingStats.totalShipments.toLocaleString()}</h3>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <Badge variant="secondary">
                                <HugeiconsIcon icon={ChartLineData01Icon} className="h-3 w-3 mr-1" />
                                +2.1%
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">On-Time Delivery</p>
                            <h3 className="text-2xl font-bold mt-1">{mockShippingStats.onTimeRate}%</h3>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Time04Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <Badge variant="secondary">
                                <HugeiconsIcon icon={ChartLineData01Icon} className="h-3 w-3 mr-1" />
                                -0.3 days
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Avg Delivery Time</p>
                            <h3 className="text-2xl font-bold mt-1">{mockShippingStats.avgDeliveryDays} days</h3>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                <HugeiconsIcon icon={Money03Icon} className="h-5 w-5 text-foreground" />
                            </div>
                            <Badge variant="outline">
                                <HugeiconsIcon icon={ChartLineData01Icon} className="h-3 w-3 mr-1" />
                                +5.4%
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Shipping Cost</p>
                            <h3 className="text-2xl font-bold mt-1">{mounted ? formatCurrency(mockShippingStats.totalCost) : ''}</h3>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Courier Performance Card */}
                    <Card className="col-span-2 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold">Courier Performance</h3>
                                <p className="text-sm text-muted-foreground">Performance metrics by shipping partner</p>
                            </div>
                        </div>
                        <TanStackDataTable
                            data={mockCourierPerformance}
                            columns={courierColumns}
                            pagination={{
                                pageIndex: 0,
                                pageSize: 5,
                                totalRows: mockCourierPerformance.length,
                                onPageChange: () => { }
                            }}
                        />
                    </Card>

                    {/* Shipment Trend Simulation (Simple Visual) */}
                    <Card className="col-span-1 p-6">
                        <h3 className="text-lg font-semibold mb-6">Shipment Trends</h3>
                        <div className="space-y-4">
                            {mockShipmentTrends.map((item, index) => {
                                const maxVal = Math.max(...mockShipmentTrends.map(t => t.shipments));
                                const percentage = (item.shipments / maxVal) * 100;
                                return (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{item.month}</span>
                                            <span className="text-muted-foreground">{item.shipments} shipments</span>
                                        </div>
                                        <Progress value={percentage} className="h-2" />
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                </div>
            </div>
        </TwoLevelLayout>
    )
}
