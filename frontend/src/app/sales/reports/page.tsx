"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { AdvancedDataTable } from "@/components/ui/advanced-data-table"
import { RevenueChart } from "@/components/charts/revenue-chart"
import { TopProductsChart } from "@/components/charts/top-products-chart"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TextField } from "@/components/ui/form-field"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  Download,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart
} from "lucide-react"
import { generateDashboardData, generateRevenueTimeSeries } from "@/lib/dashboard-data"
import { DashboardResponse, SalesReport, ProductSales, TopCustomer } from "@/types/dashboard"
import { format, subDays } from "date-fns"

export default function SalesReportsPage() {
  const [dashboardData, setDashboardData] = React.useState<DashboardResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [selectedReport, setSelectedReport] = React.useState("overview")
  const [dateRange, setDateRange] = React.useState("30d")
  const [searchTerm, setSearchTerm] = React.useState("")
  
  // Load dashboard data
  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      const data = generateDashboardData()
      setDashboardData(data)
      setLoading(false)
    }

    loadData()
  }, [dateRange])

  const handleExport = (reportType: string) => {
    const link = document.createElement('a')
    link.href = `data:text/csv;charset=utf-8,${reportType} Report Export`
    link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading || !dashboardData) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Sales Reports"
          description="Detailed sales analytics and reporting"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Sales", href: "/sales" },
            { label: "Reports" }
          ]}
        />
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const { metrics, charts, tables } = dashboardData.data

  // Define product columns for data table
  const productColumns = [
    {
      key: 'rank' as keyof ProductSales,
      title: 'Rank',
      render: (_: unknown, product: ProductSales) => (
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
          {product.rank}
        </div>
      ),
      width: '80px'
    },
    {
      key: 'product_name' as keyof ProductSales,
      title: 'Product',
      searchable: true,
      render: (name: unknown, product: ProductSales) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {name as string}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {product.product_code}
          </span>
        </div>
      )
    },
    {
      key: 'category' as keyof ProductSales,
      title: 'Category',
      render: (category: unknown) => (
        <Badge variant="outline" className="text-xs">
          {category as string}
        </Badge>
      ),
      filterType: 'select' as const,
      filterOptions: [
        { value: 'Electronics', label: 'Electronics' },
        { value: 'Gaming', label: 'Gaming' },
        { value: 'Furniture', label: 'Furniture' },
        { value: 'Accessories', label: 'Accessories' }
      ]
    },
    {
      key: 'units_sold' as keyof ProductSales,
      title: 'Units Sold',
      sortable: true,
      render: (units: unknown) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {(units as number).toLocaleString()}
        </span>
      ),
      width: '120px'
    },
    {
      key: 'revenue' as keyof ProductSales,
      title: 'Revenue',
      sortable: true,
      render: (revenue: unknown) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          ${(revenue as number).toLocaleString()}
        </span>
      ),
      width: '120px'
    },
    {
      key: 'margin_percentage' as keyof ProductSales,
      title: 'Margin %',
      sortable: true,
      render: (margin: unknown) => {
        const marginPercent = margin as number
        return (
          <span className={`font-medium ${
            marginPercent > 30 ? 'text-green-600 dark:text-green-400' :
            marginPercent > 20 ? 'text-blue-600 dark:text-blue-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {marginPercent.toFixed(1)}%
          </span>
        )
      },
      width: '100px'
    },
    {
      key: 'growth_rate' as keyof ProductSales,
      title: 'Growth',
      sortable: true,
      render: (growth: unknown) => {
        const growthRate = growth as number
        return (
          <span className={`font-medium ${
            growthRate > 0 ? 'text-green-600 dark:text-green-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </span>
        )
      },
      width: '100px'
    }
  ]

  // Define customer columns for data table
  const customerColumns = [
    {
      key: 'customer_name' as keyof TopCustomer,
      title: 'Customer',
      searchable: true,
      render: (name: unknown, customer: TopCustomer) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {name as string}
          </span>
          {customer.company_name && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {customer.company_name}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'total_orders' as keyof TopCustomer,
      title: 'Orders',
      sortable: true,
      render: (orders: unknown) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {(orders as number).toLocaleString()}
        </span>
      ),
      width: '100px'
    },
    {
      key: 'total_revenue' as keyof TopCustomer,
      title: 'Total Revenue',
      sortable: true,
      render: (revenue: unknown) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          ${(revenue as number).toLocaleString()}
        </span>
      ),
      width: '140px'
    },
    {
      key: 'last_order_date' as keyof TopCustomer,
      title: 'Last Order',
      render: (date: unknown) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(date as string).toLocaleDateString()}
        </span>
      ),
      width: '120px'
    },
    {
      key: 'status' as keyof TopCustomer,
      title: 'Status',
      render: (status: unknown) => {
        const statusStr = status as string
        return (
          <Badge 
            variant={statusStr === 'vip' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {statusStr === 'vip' ? '👑 VIP' : statusStr === 'active' ? '✅ Active' : '⏸️ Inactive'}
          </Badge>
        )
      },
      filterType: 'select' as const,
      filterOptions: [
        { value: 'vip', label: 'VIP' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ],
      width: '100px'
    }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Sales Reports"
        description="Detailed sales analytics and reporting"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sales", href: "/sales" },
          { label: "Reports" }
        ]}
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Report Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Sales Overview</SelectItem>
                <SelectItem value="products">Product Performance</SelectItem>
                <SelectItem value="customers">Customer Analysis</SelectItem>
                <SelectItem value="trends">Revenue Trends</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport(selectedReport)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${metrics.total_revenue.formatted_value}
              </div>
              <p className="text-xs text-muted-foreground">
                {(metrics.total_revenue.change_percentage || 0) > 0 ? '+' : ''}{(metrics.total_revenue.change_percentage || 0).toFixed(1)}% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.total_orders.formatted_value}
              </div>
              <p className="text-xs text-muted-foreground">
                {(metrics.total_orders.change_percentage || 0) > 0 ? '+' : ''}{(metrics.total_orders.change_percentage || 0).toFixed(1)}% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {metrics.average_order_value.formatted_value}
              </div>
              <p className="text-xs text-muted-foreground">
                {(metrics.average_order_value.change_percentage || 0) > 0 ? '+' : ''}{(metrics.average_order_value.change_percentage || 0).toFixed(1)}% from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {metrics.customer_count.formatted_value}
              </div>
              <p className="text-xs text-muted-foreground">
                {(metrics.customer_count.change_percentage || 0) > 0 ? '+' : ''}{(metrics.customer_count.change_percentage || 0).toFixed(1)}% from last period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Report Content Based on Selection */}
        {selectedReport === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart 
              data={charts.revenue_trend}
              title="Revenue Trend Analysis"
              height={400}
            />
            <TopProductsChart 
              data={tables.top_products}
              title="Top Performing Products"
              height={400}
              limit={6}
            />
          </div>
        )}

        {selectedReport === 'products' && (
          <div className="space-y-6">
            <AdvancedDataTable
              data={tables.top_products}
              columns={productColumns}
              loading={loading}
              searchPlaceholder="Search products..."
              exportEnabled={true}
              rowSelection={false}
            />
          </div>
        )}

        {selectedReport === 'customers' && (
          <div className="space-y-6">
            <AdvancedDataTable
              data={tables.top_customers}
              columns={customerColumns}
              loading={loading}
              searchPlaceholder="Search customers..."
              exportEnabled={true}
              rowSelection={false}
            />
          </div>
        )}

        {selectedReport === 'trends' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <RevenueChart 
                data={charts.revenue_trend}
                title="30-Day Revenue Trend"
                height={400}
                showComparison={true}
                comparisonData={generateRevenueTimeSeries(30).map(item => ({
                  ...item,
                  date: format(subDays(new Date(item.date), 30), 'yyyy-MM-dd'),
                  value: item.value * 0.85 // Previous period simulation
                }))}
              />
            </div>
            
            {/* Trend Analysis Table */}
            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-200">Best Performing Day</h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${Math.max(...charts.revenue_trend.map(d => d.value)).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {format(new Date(charts.revenue_trend.find(d => d.value === Math.max(...charts.revenue_trend.map(d => d.value)))?.date || ''), 'MMM dd')}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Average Daily Revenue</h4>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${Math.round(charts.revenue_trend.reduce((sum, d) => sum + d.value, 0) / charts.revenue_trend.length).toLocaleString()}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Last 30 days
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-medium text-purple-800 dark:text-purple-200">Growth Rate</h4>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      +{((charts.revenue_trend[charts.revenue_trend.length - 1].value / charts.revenue_trend[0].value - 1) * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Period over period
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <h4 className="font-medium text-orange-800 dark:text-orange-200">Volatility</h4>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {(Math.max(...charts.revenue_trend.map(d => d.value)) / Math.min(...charts.revenue_trend.map(d => d.value))).toFixed(1)}x
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Max/Min ratio
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TwoLevelLayout>
  )
}