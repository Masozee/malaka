'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ChartColumnIcon,
  PieChartIcon,
} from '@hugeicons/core-free-icons'
import { analyticsService } from '@/services/procurement'
import type { ProcurementOverview, SpendAnalytics, SupplierPerformance } from '@/types/procurement'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  sent: 'bg-indigo-100 text-indigo-800',
  confirmed: 'bg-teal-100 text-teal-800',
  received: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function ProcurementAnalyticsPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<ProcurementOverview | null>(null)
  const [spendAnalytics, setSpendAnalytics] = useState<SpendAnalytics | null>(null)
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const [overviewData, spendData, supplierData] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getSpendAnalytics(),
        analyticsService.getSupplierPerformance(),
      ])

      setOverview(overviewData)
      setSpendAnalytics(spendData)
      setSupplierPerformance(supplierData)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Analytics', href: '/procurement/analytics' }
  ]

  // Generate mountain chart SVG path
  const generateMountainChart = (data: { month: string; total_spend: number }[]) => {
    if (!data || data.length === 0) return null

    const reversedData = [...data].reverse() // Oldest to newest
    const maxSpend = Math.max(...reversedData.map(d => d.total_spend))
    const width = 100
    const height = 100
    const padding = 5

    const points = reversedData.map((d, i) => {
      const x = padding + (i / (reversedData.length - 1 || 1)) * (width - 2 * padding)
      const y = height - padding - (d.total_spend / (maxSpend || 1)) * (height - 2 * padding)
      return { x, y, ...d }
    })

    // Create path for the area
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const areaPath = `${linePath} L ${points[points.length - 1]?.x || width - padding} ${height - padding} L ${padding} ${height - padding} Z`

    return { points, linePath, areaPath, maxSpend, reversedData }
  }

  if (loading) {
    return (
      <TwoLevelLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="Procurement Analytics"
            breadcrumbs={breadcrumbs}
          />
          <div className="flex-1 overflow-auto p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  if (error) {
    return (
      <TwoLevelLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="Procurement Analytics"
            breadcrumbs={breadcrumbs}
          />
          <div className="flex-1 overflow-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchAnalytics}>Try Again</Button>
              </div>
            </div>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const chartData = generateMountainChart(spendAnalytics?.spend_by_month || [])

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Procurement Analytics"
          breadcrumbs={breadcrumbs}
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm font-medium text-muted-foreground">Total PO Value</p>
              <p className="text-2xl font-bold">
                {mounted && overview ? analyticsService.formatCompactCurrency(overview.total_po_value) : '-'}
              </p>
              <p className="text-xs text-muted-foreground">{overview?.total_purchase_orders || 0} orders</p>
            </Card>

            <Card className="p-4">
              <p className="text-sm font-medium text-muted-foreground">Avg Vendor Score</p>
              <p className="text-2xl font-bold">
                {overview?.average_vendor_score?.toFixed(1) || '0'}/5
              </p>
              <p className="text-xs text-muted-foreground">{overview?.total_vendor_evaluations || 0} evaluations</p>
            </Card>

            <Card className="p-4">
              <p className="text-sm font-medium text-muted-foreground">Purchase Orders</p>
              <p className="text-2xl font-bold">{overview?.total_purchase_orders || 0}</p>
              <p className="text-xs text-muted-foreground">{overview?.received_purchase_orders || 0} received</p>
            </Card>

            <Card className="p-4">
              <p className="text-sm font-medium text-muted-foreground">Active Contracts</p>
              <p className="text-2xl font-bold">{overview?.active_contracts || 0}</p>
              <p className="text-xs text-muted-foreground">{overview?.expiring_contracts || 0} expiring soon</p>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mountain Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Monthly Spend Trend</h3>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
              {chartData ? (
                <div className="space-y-2">
                  <div className="flex">
                    {/* Y-axis labels */}
                    <div className="flex flex-col justify-between text-xs text-muted-foreground pr-2 py-1" style={{ width: '60px' }}>
                      <span className="text-right">{analyticsService.formatCompactCurrency(chartData.maxSpend)}</span>
                      <span className="text-right">{analyticsService.formatCompactCurrency(chartData.maxSpend * 0.5)}</span>
                      <span className="text-right">0</span>
                    </div>

                    {/* Chart area */}
                    <div className="flex-1 h-48 relative">
                      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                        {/* Grid lines */}
                        <line x1="0" y1="5" x2="100" y2="5" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.3" />
                        <line x1="0" y1="52.5" x2="100" y2="52.5" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.3" />
                        <line x1="0" y1="95" x2="100" y2="95" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.3" />

                        {/* Area fill */}
                        <path
                          d={chartData.areaPath}
                          fill="currentColor"
                          fillOpacity="0.08"
                        />

                        {/* Line */}
                        <path
                          d={chartData.linePath}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Data points */}
                        {chartData.points.map((point, i) => (
                          <circle
                            key={i}
                            cx={point.x}
                            cy={point.y}
                            r="1.5"
                            fill="currentColor"
                          />
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="flex text-xs text-muted-foreground" style={{ marginLeft: '60px' }}>
                    <div className="flex-1 flex justify-between">
                      {chartData.reversedData.map((item, i) => (
                        <span key={i} className="text-center" style={{ width: `${100 / chartData.reversedData.length}%` }}>
                          {item.month.slice(5)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Total Spend</span>
                    <span className="font-semibold">{analyticsService.formatCompactCurrency(spendAnalytics?.total_spend || 0)}</span>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <HugeiconsIcon icon={ChartColumnIcon} className="h-12 w-12 mx-auto mb-2" />
                    <p>No spend data available</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Spend by Status */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Spend by Status</h3>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
              {spendAnalytics?.spend_by_status && spendAnalytics.spend_by_status.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {spendAnalytics.spend_by_status.map((status, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <Badge className={statusColors[status.status] || 'bg-gray-100 text-gray-800'}>
                        {status.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xl font-bold mt-2">{status.order_count}</p>
                      <p className="text-xs text-muted-foreground">
                        {analyticsService.formatCompactCurrency(status.total_spend)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <HugeiconsIcon icon={PieChartIcon} className="h-12 w-12 mx-auto mb-2" />
                    <p>No status data available</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Top Suppliers */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Top Suppliers by Spend</h3>
              <Link href="/procurement/suppliers">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>

            {spendAnalytics?.spend_by_supplier && spendAnalytics.spend_by_supplier.length > 0 ? (
              <div className="space-y-4">
                {spendAnalytics.spend_by_supplier.slice(0, 5).map((supplier, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{supplier.supplier_name}</span>
                        <span className="font-semibold">
                          {mounted ? analyticsService.formatCompactCurrency(supplier.total_spend) : '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-muted-foreground">{supplier.order_count} orders</span>
                        <span className="text-sm text-muted-foreground">{supplier.percentage.toFixed(1)}% of total</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                <p>No supplier data available</p>
              </div>
            )}
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Draft Orders</span>
                  <span className="font-semibold">{overview?.draft_purchase_orders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending Approval</span>
                  <span className="font-semibold">{overview?.pending_approval_orders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sent to Suppliers</span>
                  <span className="font-semibold">{overview?.sent_purchase_orders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Received</span>
                  <span className="font-semibold">{overview?.received_purchase_orders || 0}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Supplier Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Suppliers</span>
                  <span className="font-semibold">{supplierPerformance?.total_suppliers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active (6 months)</span>
                  <span className="font-semibold">{supplierPerformance?.active_suppliers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Vendor Score</span>
                  <span className="font-semibold">{overview?.average_vendor_score?.toFixed(1) || '0'}/5</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Request Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Requests</span>
                  <span className="font-semibold">{overview?.total_purchase_requests || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-semibold">{overview?.pending_purchase_requests || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved</span>
                  <span className="font-semibold">{overview?.approved_purchase_requests || 0}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Purchase Orders */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Purchase Orders</h3>
              <Link href="/procurement/purchase-orders">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            {overview?.recent_purchase_orders && overview.recent_purchase_orders.length > 0 ? (
              <div className="space-y-3">
                {overview.recent_purchase_orders.map((po, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Link href={`/procurement/purchase-orders/${po.id}`} className="font-medium hover:underline">
                        {po.po_number}
                      </Link>
                      <p className="text-sm text-muted-foreground">{po.supplier_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {analyticsService.formatCurrency(po.total_amount)}
                      </p>
                      <Badge className={statusColors[po.status] || 'bg-gray-100 text-gray-800'}>
                        {po.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                <p>No recent purchase orders</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
