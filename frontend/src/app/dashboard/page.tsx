"use client"

import * as React from "react"
import Link from 'next/link'
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
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

// Data Types
interface Message {
  id: string
  sender: string
  avatar?: string
  content: string
  timestamp: string
  isRead: boolean
  priority?: 'high' | 'medium' | 'low'
}

interface NewsItem {
  id: string
  title: string
  summary: string
  category: string
  timestamp: string
  isNew?: boolean
}

interface SystemHealthMetric {
  name: string
  value: number
  status: 'healthy' | 'warning' | 'critical'
}

// Chart Data with enhanced data points
const salesData = [
  { day: 'Mon', sales: 4200, target: 4000, orders: 42, avgOrderValue: 100, previousWeek: 3900 },
  { day: 'Tue', sales: 3800, target: 4000, orders: 38, avgOrderValue: 100, previousWeek: 3600 },
  { day: 'Wed', sales: 5100, target: 4000, orders: 51, avgOrderValue: 100, previousWeek: 4800 },
  { day: 'Thu', sales: 4600, target: 4000, orders: 46, avgOrderValue: 100, previousWeek: 4300 },
  { day: 'Fri', sales: 5400, target: 4000, orders: 54, avgOrderValue: 100, previousWeek: 5100 },
  { day: 'Sat', sales: 6200, target: 5000, orders: 62, avgOrderValue: 100, previousWeek: 5800 },
  { day: 'Sun', sales: 4900, target: 4500, orders: 49, avgOrderValue: 100, previousWeek: 4600 }
]

const hrData = [
  { day: 'Mon', present: 145, absent: 5, leave: 8, total: 158, overtime: 12, remote: 25 },
  { day: 'Tue', present: 148, absent: 3, leave: 7, total: 158, overtime: 15, remote: 28 },
  { day: 'Wed', present: 142, absent: 8, leave: 8, total: 158, overtime: 8, remote: 22 },
  { day: 'Thu', present: 150, absent: 2, leave: 6, total: 158, overtime: 18, remote: 30 },
  { day: 'Fri', present: 138, absent: 10, leave: 10, total: 158, overtime: 5, remote: 20 }
]

const revenueData = [
  { month: 'Jan', revenue: 65000, profit: 12000, expenses: 53000, customers: 1200, avgDeal: 54 },
  { month: 'Feb', revenue: 72000, profit: 15000, expenses: 57000, customers: 1350, avgDeal: 53 },
  { month: 'Mar', revenue: 81000, profit: 18000, expenses: 63000, customers: 1500, avgDeal: 54 },
  { month: 'Apr', revenue: 89000, profit: 21000, expenses: 68000, customers: 1680, avgDeal: 53 },
  { month: 'May', revenue: 95000, profit: 24000, expenses: 71000, customers: 1820, avgDeal: 52 },
  { month: 'Jun', revenue: 103000, profit: 28000, expenses: 75000, customers: 1950, avgDeal: 53 }
]

// Monochromatic color palette based on #cfff03
const colorPalette = {
  primary: '#cfff03',     // Base bright yellow-green
  secondary: '#a6cc02',   // Darker yellow-green
  tertiary: '#7a9901',    // Even darker
  quaternary: '#4d6600',  // Dark green
  light: '#e6ff66',       // Lighter yellow-green
  lighter: '#f0ff99',     // Very light
  accent: '#b3e600'       // Balanced mid-tone
}

const pieData = [
  { name: 'Footwear', value: 45, color: colorPalette.primary },
  { name: 'Accessories', value: 25, color: colorPalette.secondary },
  { name: 'Apparel', value: 20, color: colorPalette.tertiary },
  { name: 'Others', value: 10, color: colorPalette.quaternary }
]

export default function HousePage() {
  const [currentTime, setCurrentTime] = React.useState(new Date())

  // Messages State
  const [messages] = React.useState<Message[]>([
    {
      id: '1',
      sender: 'John Doe',
      avatar: '/avatars/john.jpg',
      content: 'New purchase order #PO-2024-001 needs approval',
      timestamp: '5 mins ago',
      isRead: false,
      priority: 'high'
    },
    {
      id: '2',
      sender: 'Sarah Smith',
      avatar: '/avatars/sarah.jpg',
      content: 'Monthly inventory report is ready for review',
      timestamp: '1 hour ago',
      isRead: false,
      priority: 'medium'
    },
    {
      id: '3',
      sender: 'System',
      content: 'Backup completed successfully',
      timestamp: '3 hours ago',
      isRead: true,
      priority: 'low'
    }
  ])

  // News Items
  const [newsItems] = React.useState<NewsItem[]>([
    {
      id: '1',
      title: 'Q4 Sales Target Exceeded by 15%',
      summary: 'Outstanding performance in footwear segment driving growth',
      category: 'Sales',
      timestamp: '2 hours ago',
      isNew: true
    },
    {
      id: '2',
      title: 'New Analytics Module Released',
      summary: 'Real-time insights and predictive analytics now available',
      category: 'System',
      timestamp: '1 day ago',
      isNew: true
    },
    {
      id: '3',
      title: 'Employee of the Month Announced',
      summary: 'Sarah Johnson from Production team wins this month',
      category: 'HR',
      timestamp: '2 days ago'
    }
  ])

  // System Health
  const [systemHealth] = React.useState<SystemHealthMetric[]>([
    { name: 'Server', value: 98, status: 'healthy' },
    { name: 'CPU', value: 45, status: 'healthy' },
    { name: 'Memory', value: 72, status: 'warning' },
    { name: 'Network', value: 99, status: 'healthy' }
  ])

  // Quick Stats
  const quickStats = [
    { label: 'Revenue', value: '$124.5K', change: '+12.5%', trend: 'up' },
    { label: 'Orders', value: '1,234', change: '+8.2%', trend: 'up' },
    { label: 'Customers', value: '567', change: '+3.1%', trend: 'up' },
    { label: 'Products', value: '89', change: '-2.4%', trend: 'down' }
  ]

  // Update current time
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'critical':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
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
                  <Button variant="outline" size="sm">
                    3 New
                  </Button>
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
                        <div className="flex items-center gap-1">
                          <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change}
                          </span>
                        </div>
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
                  {systemHealth.slice(0, 2).map((metric, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{metric.name}</span>
                        </div>
                        <span className={`text-sm font-bold ${getStatusColor(metric.status)}`}>
                          {metric.value}%
                        </span>
                      </div>
                      <Progress value={metric.value} className="h-1.5" />
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center text-xs text-muted-foreground">
                  System performance indicators
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
                      Sales performance and target comparison
                    </CardDescription>
                  </div>
                  <Badge variant="outline">This Week</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colorPalette.primary} stopOpacity={1}/>
                          <stop offset="100%" stopColor={colorPalette.secondary} stopOpacity={0.8}/>
                        </linearGradient>
                        <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colorPalette.light} stopOpacity={0.6}/>
                          <stop offset="100%" stopColor={colorPalette.lighter} stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.5} />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#666' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#666' }}
                        tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: `2px solid ${colorPalette.primary}`,
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value, name) => [
                          `$${value.toLocaleString()}`,
                          name === 'sales' ? 'Actual Sales' : 'Target'
                        ]}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => value === 'sales' ? 'Actual Sales' : 'Weekly Target'}
                      />
                      <Bar
                        dataKey="sales"
                        fill="url(#salesGradient)"
                        radius={[4, 4, 0, 0]}
                        stroke={colorPalette.secondary}
                        strokeWidth={1}
                      />
                      <Bar
                        dataKey="target"
                        fill="url(#targetGradient)"
                        radius={[4, 4, 0, 0]}
                        stroke={colorPalette.light}
                        strokeWidth={1}
                      />
                      <Line
                        type="monotone"
                        dataKey="previousWeek"
                        stroke={colorPalette.tertiary}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: colorPalette.tertiary, r: 3 }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Sales vs targets this week</span>
                    <span>Updated 5 min ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Weekly sales performance tracking shows strong momentum with Saturday achieving 124% of target.
                    Blue bars represent actual sales while grey bars show weekly targets. Overall performance is 15.3% above target.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Trend - Medium */}
            <Card className="md:col-span-2 xl:col-span-3 row-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Revenue Trend</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Monthly revenue and profit growth analysis
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More options">
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colorPalette.primary} stopOpacity={0.8}/>
                          <stop offset="100%" stopColor={colorPalette.primary} stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colorPalette.secondary} stopOpacity={0.6}/>
                          <stop offset="100%" stopColor={colorPalette.secondary} stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colorPalette.tertiary} stopOpacity={0.4}/>
                          <stop offset="100%" stopColor={colorPalette.tertiary} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" strokeOpacity={0.3} />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#666' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#666' }}
                        tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: `2px solid ${colorPalette.primary}`,
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value, name) => [
                          `$${value.toLocaleString()}`,
                          name.charAt(0).toUpperCase() + name.slice(1)
                        ]}
                        labelFormatter={(label) => `${label} 2024`}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: '15px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stackId="1"
                        stroke={colorPalette.tertiary}
                        strokeWidth={2}
                        fill="url(#expenseGradient)"
                        name="Expenses"
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stackId="2"
                        stroke={colorPalette.secondary}
                        strokeWidth={2}
                        fill="url(#profitGradient)"
                        name="Profit"
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stackId="3"
                        stroke={colorPalette.primary}
                        strokeWidth={3}
                        fill="url(#revenueGradient)"
                        name="Revenue"
                        dot={{ fill: colorPalette.primary, r: 4, strokeWidth: 2, stroke: 'white' }}
                        activeDot={{ r: 6, stroke: colorPalette.primary, strokeWidth: 2, fill: 'white' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>6-month growth trend</span>
                    <span>Updated 10 min ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Revenue trajectory demonstrates consistent upward growth over the past 6 months, with total revenue increasing from
                    $65K to $103K. The green area shows profit margins expanding alongside revenue growth, indicating healthy business scaling.
                  </p>
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
                    Daily employee attendance tracking and leave status
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={hrData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#666' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#666' }}
                        domain={[0, 160]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: `2px solid ${colorPalette.primary}`,
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value, name) => [
                          `${value} employees`,
                          name.charAt(0).toUpperCase() + name.slice(1)
                        ]}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: '15px' }}
                      />
                      <Bar
                        dataKey="present"
                        stackId="a"
                        fill="url(#presentGradient)"
                        stroke={colorPalette.secondary}
                        strokeWidth={1}
                        name="Present"
                      />
                      <Bar
                        dataKey="leave"
                        stackId="a"
                        fill="url(#leaveGradient)"
                        stroke={colorPalette.tertiary}
                        strokeWidth={1}
                        name="On Leave"
                      />
                      <Bar
                        dataKey="absent"
                        stackId="a"
                        fill="url(#absentGradient)"
                        radius={[4, 4, 0, 0]}
                        stroke={colorPalette.quaternary}
                        strokeWidth={1}
                        name="Absent"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Current week attendance summary</span>
                    <span>Live data</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Weekly attendance patterns show consistent workforce engagement with 95% average attendance rate.
                    Green sections indicate present employees, yellow shows approved leave, and red represents unplanned absences.
                    Thursday shows peak attendance with minimal absences.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Product Mix - Small Pie Chart */}
            <Card className="xl:col-span-2">
              <CardHeader className="pb-3">
                <div>
                  <CardTitle className="text-base">Product Mix</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Revenue distribution by product categories
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
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
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`url(#pieGradient-${index})`}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: `2px solid ${colorPalette.primary}`,
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value, name) => [`${value}%`, name]}
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
                </div>
                <div className="mt-3 space-y-2">
                  <div className="text-center text-xs text-muted-foreground">
                    Revenue breakdown by category
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed text-center">
                    Product mix analysis reveals footwear as the dominant revenue driver at 45%, followed by accessories at 25%.
                    This distribution aligns with our core competency in shoe manufacturing while showing diversification potential.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Latest Messages */}
            <Card className="md:col-span-2 xl:col-span-3 row-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      Messages
                    </CardTitle>
                    <CardDescription className="text-sm mt-1 ml-6">
                      Recent messages and notifications
                    </CardDescription>
                  </div>
                  <Badge>{messages.filter(m => !m.isRead).length} new</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 p-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        !message.isRead ? 'bg-white dark:bg-gray-800' : 'bg-white/50 dark:bg-gray-800/50'
                      }`}
                    >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.avatar} />
                      <AvatarFallback>
                        {message.sender.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{message.sender}</p>
                        <Badge variant={getPriorityColor(message.priority)} className="h-5">
                          {message.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.content}</p>
                      <p className="text-xs text-muted-foreground">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
                  <Button variant="outline" className="w-full" size="sm">
                    View All Messages
                  </Button>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Internal communications & alerts</span>
                  <span>Real-time updates</span>
                </div>
              </CardContent>
            </Card>

            {/* Latest News */}
            <Card className="md:col-span-2 xl:col-span-3 row-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      Latest News
                    </CardTitle>
                    <CardDescription className="text-sm mt-1 ml-6">
                      Company updates and announcements
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Refresh news">
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 p-4 space-y-4">
                  {newsItems.map((news) => (
                    <div key={news.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold line-clamp-2">
                        {news.title}
                      </h4>
                      {news.isNew && (
                        <Badge variant="default" className="shrink-0">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 my-2">{news.summary}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{news.category}</Badge>
                      <span className="text-xs text-muted-foreground">{news.timestamp}</span>
                    </div>
                  </div>
                ))}
                  <Button variant="outline" className="w-full" size="sm">
                    View All News
                  </Button>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Company announcements & updates</span>
                  <span>From multiple sources</span>
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
                  <p className="text-xs text-muted-foreground mt-1">158 active</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/inventory">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <p className="font-medium">Inventory</p>
                  <p className="text-xs text-muted-foreground mt-1">2,345 items</p>
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
                  <p className="text-xs text-muted-foreground mt-1">12 pending</p>
                </CardContent>
              </Card>
            </Link>

          </div>
          </div>
        </div>
    </TwoLevelLayout>
  )
}
