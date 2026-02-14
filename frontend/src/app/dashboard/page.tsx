"use client"

import * as React from "react"
import Link from 'next/link'
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { salesOrderService } from '@/services/sales'
import { HRService } from '@/services/hr'
import { ProductionService } from '@/services/production'
import { procurementServices } from '@/services/procurement'
import { notificationService } from '@/services/notifications'
import type { Notification } from '@/services/notifications'
import { inventoryServices } from '@/services/inventory'
import type { StockItem } from '@/services/inventory'
import { apiClient } from '@/lib/api'
import type { ProductionSummary } from '@/types/production'

// Teal color palette
const colorPalette = {
  primary: '#00979D',
  secondary: '#007F84',
  tertiary: '#006569',
  quaternary: '#004C50',
  light: '#2FBFC4',
  lighter: '#5DDADF',
  accent: '#10A3A9'
}

// Helper: format currency in IDR
function formatCurrency(value: number): string {
  if (value >= 1e9) return `Rp ${(value / 1e9).toFixed(1)}B`
  if (value >= 1e6) return `Rp ${(value / 1e6).toFixed(1)}M`
  if (value >= 1e3) return `Rp ${(value / 1e3).toFixed(1)}K`
  return `Rp ${value.toLocaleString('id-ID')}`
}

// Helper: relative time
function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function HousePage() {
  const [currentTime, setCurrentTime] = React.useState(new Date())
  const [loading, setLoading] = React.useState(true)

  // Raw API data
  const [salesOrders, setSalesOrders] = React.useState<Array<{ id: string; order_date: string; status: string; total_amount: number }>>([])
  const [customerCount, setCustomerCount] = React.useState(0)
  const [productCount, setProductCount] = React.useState(0)
  const [employeeCount, setEmployeeCount] = React.useState(0)
  const [stockItems, setStockItems] = React.useState<StockItem[]>([])
  const [attendanceRecords, setAttendanceRecords] = React.useState<Array<{ attendance_date: string; status: string }>>([])
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [productionSummary, setProductionSummary] = React.useState<ProductionSummary | null>(null)
  const [spendByMonth, setSpendByMonth] = React.useState<Array<{ month: string; total_spend: number; order_count: number }>>([])
  const [healthChecks, setHealthChecks] = React.useState<{ database: string; redis: string; storage: string }>({ database: 'unknown', redis: 'unknown', storage: 'unknown' })
  const [monitoringData, setMonitoringData] = React.useState<{ active_connections: number; max_connections: number; cache_hit_ratio: number } | null>(null)

  // Clock
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Fetch all data on mount
  React.useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      const results = await Promise.allSettled([
        salesOrderService.getAll(),                                          // 0
        apiClient.get<any>('/api/v1/masterdata/customers/', { limit: 1 }),// 1
        apiClient.get<any>('/api/v1/masterdata/articles/'),               // 2
        HRService.getEmployees({ limit: 1 }),                             // 3
        inventoryServices.stock.getAll(),                                  // 4
        HRService.getAttendanceRecords({ limit: 500 }),                   // 5
        notificationService.listNotifications({ limit: 5 }),              // 6
        ProductionService.getProductionSummary(),                         // 7
        procurementServices.analytics.getSpendAnalytics(),                // 8
        fetch('http://localhost:8080/health/ready').then(r => r.json()),  // 9
        apiClient.get<any>('/api/v1/monitoring/health'),                  // 10
      ])

      // 0: Sales orders
      if (results[0].status === 'fulfilled') {
        setSalesOrders(results[0].value || [])
      }

      // 1: Customers count
      if (results[1].status === 'fulfilled') {
        const res = results[1].value
        if (res?.data?.pagination) {
          setCustomerCount(res.data.pagination.total_rows || 0)
        } else if (Array.isArray(res?.data)) {
          setCustomerCount(res.data.length)
        }
      }

      // 2: Articles count
      if (results[2].status === 'fulfilled') {
        const res = results[2].value
        if (Array.isArray(res?.data)) {
          setProductCount(res.data.length)
        } else if (res?.data?.pagination) {
          setProductCount(res.data.pagination.total_rows || 0)
        }
      }

      // 3: Employees count
      if (results[3].status === 'fulfilled') {
        const res = results[3].value
        setEmployeeCount(res?.pagination?.total || res?.data?.length || 0)
      }

      // 4: Stock items
      if (results[4].status === 'fulfilled') {
        setStockItems(results[4].value?.data || [])
      }

      // 5: Attendance records
      if (results[5].status === 'fulfilled') {
        setAttendanceRecords(results[5].value?.data || [])
      }

      // 6: Notifications
      if (results[6].status === 'fulfilled') {
        const res = results[6].value
        setNotifications(res?.notifications || [])
        setUnreadCount(res?.unread_count || 0)
      }

      // 7: Production summary — service returns full response wrapper
      if (results[7].status === 'fulfilled') {
        const res = results[7].value as any
        const summary = res?.data || res
        if (summary && (summary.total_work_orders !== undefined || summary.totalWorkOrders !== undefined)) {
          setProductionSummary({
            totalWorkOrders: summary.total_work_orders ?? summary.totalWorkOrders ?? 0,
            activeWorkOrders: summary.active_work_orders ?? summary.activeWorkOrders ?? 0,
            completedWorkOrders: summary.completed_work_orders ?? summary.completedWorkOrders ?? 0,
            delayedWorkOrders: summary.delayed_work_orders ?? summary.delayedWorkOrders ?? 0,
            totalProduction: summary.total_production ?? summary.totalProduction ?? 0,
            averageEfficiency: summary.average_efficiency ?? summary.averageEfficiency ?? 0,
            qualityScore: summary.quality_score ?? summary.qualityScore ?? 0,
            onTimeDelivery: summary.on_time_delivery ?? summary.onTimeDelivery ?? 0,
          })
        }
      }

      // 8: Spend analytics
      if (results[8].status === 'fulfilled') {
        const res = results[8].value
        setSpendByMonth(res?.spend_by_month || [])
      }

      // 9: Health ready
      if (results[9].status === 'fulfilled') {
        const res = results[9].value
        setHealthChecks({
          database: res?.checks?.database?.status || 'unknown',
          redis: res?.checks?.redis?.status || 'unknown',
          storage: res?.checks?.storage?.status || 'unknown',
        })
      }

      // 10: Monitoring health
      if (results[10].status === 'fulfilled') {
        setMonitoringData(results[10].value || null)
      }

      setLoading(false)
    }

    fetchAll()
  }, [])

  // Computed: Quick Stats
  const quickStats = React.useMemo(() => {
    const revenue = salesOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    return [
      { label: 'Revenue', value: formatCurrency(revenue) },
      { label: 'Orders', value: salesOrders.length.toLocaleString() },
      { label: 'Customers', value: customerCount.toLocaleString() },
      { label: 'Products', value: productCount.toLocaleString() },
    ]
  }, [salesOrders, customerCount, productCount])

  // Computed: System Health metrics
  const systemHealth = React.useMemo(() => {
    const dbHealthy = healthChecks.database === 'healthy' || healthChecks.database === 'up'
    const redisHealthy = healthChecks.redis === 'healthy' || healthChecks.redis === 'up'
    const connPct = monitoringData ? Math.round((monitoringData.active_connections / Math.max(monitoringData.max_connections, 1)) * 100) : 0
    const cachePct = monitoringData ? Math.round(monitoringData.cache_hit_ratio) : 0

    return [
      { name: 'Database', value: dbHealthy ? 100 : 0, status: dbHealthy ? 'healthy' : 'critical' as const },
      { name: 'Redis', value: redisHealthy ? 100 : 0, status: redisHealthy ? 'healthy' : 'critical' as const },
      { name: 'Connections', value: Math.min(connPct, 100), status: (connPct < 80 ? 'healthy' : 'warning') as const },
      { name: 'Cache Hit', value: Math.min(cachePct, 100), status: (cachePct > 70 ? 'healthy' : 'warning') as const },
    ]
  }, [healthChecks, monitoringData])

  // Computed: Weekly sales chart data
  const weeklySalesData = React.useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const now = new Date()
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (6 - i))
      return d
    })

    const salesByDateKey: Record<string, number> = {}
    const ordersByDateKey: Record<string, number> = {}
    salesOrders.forEach(order => {
      const d = new Date(order.order_date)
      const key = d.toISOString().slice(0, 10)
      salesByDateKey[key] = (salesByDateKey[key] || 0) + (order.total_amount || 0)
      ordersByDateKey[key] = (ordersByDateKey[key] || 0) + 1
    })

    return last7.map(date => {
      const key = date.toISOString().slice(0, 10)
      return {
        day: dayNames[date.getDay()],
        sales: salesByDateKey[key] || 0,
        orders: ordersByDateKey[key] || 0,
      }
    })
  }, [salesOrders])

  // Computed: Monthly spend trend
  const spendTrendData = React.useMemo(() => {
    return spendByMonth.map(item => ({
      month: item.month.length > 7
        ? new Date(item.month).toLocaleDateString('en-US', { month: 'short' })
        : new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      spend: item.total_spend || 0,
      orders: item.order_count || 0,
    }))
  }, [spendByMonth])

  // Computed: HR attendance chart data
  const hrChartData = React.useMemo(() => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    const byDay: Record<string, { present: number; leave: number; absent: number }> = {}
    dayNames.forEach(d => { byDay[d] = { present: 0, leave: 0, absent: 0 } })

    attendanceRecords.forEach(record => {
      const d = new Date(record.attendance_date)
      const dayIdx = d.getDay() // 0=Sun
      if (dayIdx >= 1 && dayIdx <= 5) {
        const dayName = dayNames[dayIdx - 1]
        if (record.status === 'present' || record.status === 'late') {
          byDay[dayName].present++
        } else if (record.status === 'on_leave') {
          byDay[dayName].leave++
        } else if (record.status === 'absent') {
          byDay[dayName].absent++
        }
      }
    })

    return dayNames.map(day => ({
      day,
      present: byDay[day].present,
      leave: byDay[day].leave,
      absent: byDay[day].absent,
      total: byDay[day].present + byDay[day].leave + byDay[day].absent,
    }))
  }, [attendanceRecords])

  // Computed: Product mix from stock categories
  const pieData = React.useMemo(() => {
    const categoryTotals: Record<string, number> = {}
    stockItems.forEach(item => {
      const cat = item.category || 'Others'
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (item.totalValue || 0)
    })

    const total = Object.values(categoryTotals).reduce((s, v) => s + v, 0)
    const colors = [colorPalette.primary, colorPalette.secondary, colorPalette.tertiary, colorPalette.quaternary, colorPalette.light, colorPalette.accent]

    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], idx) => ({
        name,
        value: total > 0 ? Math.round((value / total) * 100) : 0,
        color: colors[idx % colors.length],
      }))
  }, [stockItems])

  // Helpers
  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 dark:text-green-400'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      case 'critical': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'urgent': case 'high': return 'destructive' as const
      case 'normal': return 'default' as const
      case 'low': return 'secondary' as const
      default: return 'outline' as const
    }
  }

  // Max attendance for chart Y axis
  const maxAttendance = React.useMemo(() => {
    const maxTotal = Math.max(...hrChartData.map(d => d.total), 0)
    return Math.max(Math.ceil(maxTotal / 10) * 10, 20)
  }, [hrChartData])

  if (loading) {
    return (
      <TwoLevelLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Dashboard" breadcrumbs={[{ label: "House", href: "/" }]} />
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-[minmax(120px,auto)]">
              <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 animate-pulse bg-muted rounded-lg h-48" />
              <div className="xl:col-span-2 animate-pulse bg-muted rounded-lg h-48" />
              <div className="md:col-span-2 xl:col-span-3 row-span-2 animate-pulse bg-muted rounded-lg h-96" />
              <div className="md:col-span-2 xl:col-span-3 row-span-2 animate-pulse bg-muted rounded-lg h-96" />
              <div className="md:col-span-2 xl:col-span-4 animate-pulse bg-muted rounded-lg h-64" />
              <div className="xl:col-span-2 animate-pulse bg-muted rounded-lg h-64" />
              <div className="md:col-span-2 xl:col-span-3 row-span-2 animate-pulse bg-muted rounded-lg h-80" />
              <div className="md:col-span-2 xl:col-span-3 row-span-2 animate-pulse bg-muted rounded-lg h-80" />
            </div>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            title="Dashboard"
            breadcrumbs={[
              { label: "House", href: "/" }
            ]}
          />

          <div className="flex-1 overflow-auto p-6">
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-[minmax(120px,auto)]">

            {/* Welcome Card - Large */}
            <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'}!
                    </CardTitle>
                    <CardDescription>
                      Welcome back to Malaka ERP · {formatDate(currentTime)} · {formatTime(currentTime)}
                    </CardDescription>
                  </div>
                  {unreadCount > 0 && (
                    <Badge>{unreadCount} New</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickStats.map((stat, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health - Small */}
            <Card className="xl:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 p-3 space-y-3">
                  {systemHealth.map((metric, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{metric.name}</span>
                        <span className={`text-sm font-bold ${getStatusColor(metric.status)}`}>
                          {metric.value > 0 ? `${metric.value}%` : 'Down'}
                        </span>
                      </div>
                      <Progress value={metric.value} className="h-1.5" />
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center text-xs text-muted-foreground">
                  Live system performance
                </div>
              </CardContent>
            </Card>

            {/* Sales Chart - Large */}
            <Card className="md:col-span-2 lg:col-span-2 xl:col-span-3 row-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Weekly Sales</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Sales orders from the last 7 days
                    </CardDescription>
                  </div>
                  <Badge variant="outline">This Week</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                  {weeklySalesData.some(d => d.sales > 0) ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={weeklySalesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colorPalette.primary} stopOpacity={1}/>
                            <stop offset="100%" stopColor={colorPalette.secondary} stopOpacity={0.8}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.5} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }}
                          tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'white', border: `2px solid ${colorPalette.primary}`, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          formatter={(value: number) => [formatCurrency(value), 'Sales']}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={() => 'Sales Amount'} />
                        <Bar dataKey="sales" fill="url(#salesGradient)" radius={[4, 4, 0, 0]} stroke={colorPalette.secondary} strokeWidth={1} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                      No sales orders this week
                    </div>
                  )}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {weeklySalesData.reduce((s, d) => s + d.orders, 0)} orders totaling {formatCurrency(weeklySalesData.reduce((s, d) => s + d.sales, 0))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Spend Trend */}
            <Card className="md:col-span-2 xl:col-span-3 row-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Monthly Spend</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Procurement spend trend by month
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                  {spendTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={spendTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colorPalette.primary} stopOpacity={0.8}/>
                            <stop offset="100%" stopColor={colorPalette.primary} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.3} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }}
                          tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'white', border: `2px solid ${colorPalette.primary}`, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          formatter={(value: number, name: string) => [
                            formatCurrency(value),
                            name === 'spend' ? 'Spend' : 'Orders'
                          ]}
                        />
                        <Legend wrapperStyle={{ paddingTop: '15px' }} />
                        <Area
                          type="monotone"
                          dataKey="spend"
                          stroke={colorPalette.primary}
                          strokeWidth={3}
                          fill="url(#spendGradient)"
                          name="Spend"
                          dot={{ fill: colorPalette.primary, r: 4, strokeWidth: 2, stroke: 'white' }}
                          activeDot={{ r: 6, stroke: colorPalette.primary, strokeWidth: 2, fill: 'white' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
                      No procurement spend data available
                    </div>
                  )}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {spendTrendData.length > 0
                    ? `${spendTrendData.length} months of data · Total: ${formatCurrency(spendTrendData.reduce((s, d) => s + d.spend, 0))}`
                    : 'Spend analytics will appear once purchase orders are processed'
                  }
                </div>
              </CardContent>
            </Card>

            {/* HR Attendance - Wide */}
            <Card className="md:col-span-2 xl:col-span-4">
              <CardHeader>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    HR Attendance
                  </CardTitle>
                  <CardDescription className="text-sm mt-1 ml-6">
                    Employee attendance this week
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                  {hrChartData.some(d => d.total > 0) ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={hrChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colorPalette.primary} stopOpacity={1}/>
                            <stop offset="100%" stopColor={colorPalette.secondary} stopOpacity={0.8}/>
                          </linearGradient>
                          <linearGradient id="leaveGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colorPalette.accent} stopOpacity={1}/>
                            <stop offset="100%" stopColor={colorPalette.tertiary} stopOpacity={0.8}/>
                          </linearGradient>
                          <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colorPalette.quaternary} stopOpacity={1}/>
                            <stop offset="100%" stopColor={colorPalette.quaternary} stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.3} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#666' }} domain={[0, maxAttendance]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'white', border: `2px solid ${colorPalette.primary}`, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          formatter={(value: number, name: string) => [`${value} employees`, name.charAt(0).toUpperCase() + name.slice(1)]}
                        />
                        <Legend wrapperStyle={{ paddingTop: '15px' }} />
                        <Bar dataKey="present" stackId="a" fill="url(#presentGradient)" stroke={colorPalette.secondary} strokeWidth={1} name="Present" />
                        <Bar dataKey="leave" stackId="a" fill="url(#leaveGradient)" stroke={colorPalette.tertiary} strokeWidth={1} name="On Leave" />
                        <Bar dataKey="absent" stackId="a" fill="url(#absentGradient)" radius={[4, 4, 0, 0]} stroke={colorPalette.quaternary} strokeWidth={1} name="Absent" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                      No attendance records this week
                    </div>
                  )}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {attendanceRecords.length > 0
                    ? `${attendanceRecords.length} attendance records loaded`
                    : 'Attendance data will appear when records are entered'
                  }
                </div>
              </CardContent>
            </Card>

            {/* Product Mix - Small Pie Chart */}
            <Card className="xl:col-span-2">
              <CardHeader className="pb-3">
                <div>
                  <CardTitle className="text-base">Stock by Category</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Inventory value distribution
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                  {pieData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <defs>
                            {pieData.map((entry, index) => (
                              <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                                <stop offset="100%" stopColor={entry.color} stopOpacity={0.7}/>
                              </linearGradient>
                            ))}
                          </defs>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="white"
                            strokeWidth={2}
                          >
                            {pieData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={`url(#pieGradient-${index})`} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: 'white', border: `2px solid ${colorPalette.primary}`, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value: number, name: string) => [`${value}%`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {pieData.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                            <span className="text-xs">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">
                      No stock data
                    </div>
                  )}
                </div>
                <div className="mt-3 text-center text-xs text-muted-foreground">
                  {stockItems.length} items across {pieData.length} categories
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="md:col-span-2 xl:col-span-3 row-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      Notifications
                    </CardTitle>
                    <CardDescription className="text-sm mt-1 ml-6">
                      Recent alerts and updates
                    </CardDescription>
                  </div>
                  {unreadCount > 0 && <Badge>{unreadCount} new</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 p-4 space-y-3">
                  {notifications.length > 0 ? notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        notif.status === 'unread' ? 'bg-white dark:bg-gray-800' : 'bg-white/50 dark:bg-gray-800/50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300 shrink-0">
                        {notif.type?.charAt(0).toUpperCase() || 'N'}
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate">{notif.title}</p>
                          <Badge variant={getPriorityBadge(notif.priority)} className="h-5 shrink-0">
                            {notif.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-muted-foreground">{timeAgo(notif.created_at)}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                      No notifications
                    </div>
                  )}
                  <Link href="/notifications">
                    <Button variant="outline" className="w-full" size="sm">
                      View All Notifications
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>System alerts & updates</span>
                  <span>Live</span>
                </div>
              </CardContent>
            </Card>

            {/* Production Overview */}
            <Card className="md:col-span-2 xl:col-span-3 row-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      Production Overview
                    </CardTitle>
                    <CardDescription className="text-sm mt-1 ml-6">
                      Work orders and manufacturing KPIs
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 p-4 space-y-4">
                  {productionSummary ? (
                    <>
                      {/* Work Order Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-muted-foreground">Total Work Orders</p>
                          <p className="text-xl font-bold">{productionSummary.totalWorkOrders}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-muted-foreground">Active</p>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{productionSummary.activeWorkOrders}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-muted-foreground">Completed</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">{productionSummary.completedWorkOrders}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-muted-foreground">Delayed</p>
                          <p className="text-xl font-bold text-red-600 dark:text-red-400">{productionSummary.delayedWorkOrders}</p>
                        </div>
                      </div>
                      {/* KPIs */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Efficiency</span>
                            <span className="font-bold">{productionSummary.averageEfficiency.toFixed(1)}%</span>
                          </div>
                          <Progress value={productionSummary.averageEfficiency} className="h-1.5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Quality Score</span>
                            <span className="font-bold">{productionSummary.qualityScore.toFixed(1)}%</span>
                          </div>
                          <Progress value={productionSummary.qualityScore} className="h-1.5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>On-Time Delivery</span>
                            <span className="font-bold">{productionSummary.onTimeDelivery.toFixed(1)}%</span>
                          </div>
                          <Progress value={productionSummary.onTimeDelivery} className="h-1.5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                      No production data available
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Manufacturing KPIs</span>
                  <span>From production module</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Grid */}
            <Link href="/sales/orders/new">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <p className="font-medium">New Order</p>
                  <p className="text-xs text-muted-foreground mt-1">Create</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/hr/employees">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <p className="font-medium">Employees</p>
                  <p className="text-xs text-muted-foreground mt-1">{employeeCount > 0 ? `${employeeCount} active` : 'View all'}</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/inventory">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <p className="font-medium">Inventory</p>
                  <p className="text-xs text-muted-foreground mt-1">{stockItems.length > 0 ? `${stockItems.length} items` : 'View all'}</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <p className="font-medium">Reports</p>
                  <p className="text-xs text-muted-foreground mt-1">Analytics</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/accounting">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <p className="font-medium">Finance</p>
                  <p className="text-xs text-muted-foreground mt-1">Accounting</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/shipping">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <p className="font-medium">Shipping</p>
                  <p className="text-xs text-muted-foreground mt-1">Logistics</p>
                </CardContent>
              </Card>
            </Link>

          </div>
          </div>
        </div>
    </TwoLevelLayout>
  )
}
