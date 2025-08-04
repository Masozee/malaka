"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { KPICard } from "@/components/dashboard/kpi-card"
import { RevenueChart } from "@/components/charts/revenue-chart"
import { TopProductsChart } from "@/components/charts/top-products-chart"
import { SalesDistributionChart } from "@/components/charts/sales-distribution-chart"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Target, 
  Calendar,
  Download,
  RefreshCw 
} from "lucide-react"
import { generateDashboardData } from "@/lib/dashboard-data"
import { DashboardResponse } from "@/types/dashboard"

export default function SalesDashboardPage() {
  const [dashboardData, setDashboardData] = React.useState<DashboardResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [selectedPeriod, setSelectedPeriod] = React.useState("30d")

  // Load dashboard data
  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      const data = generateDashboardData()
      setDashboardData(data)
      setLoading(false)
    }

    loadData()
  }, [selectedPeriod])

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    const data = generateDashboardData()
    setDashboardData(data)
    setRefreshing(false)
  }

  const handleExport = () => {
    // Simulate export functionality
    const link = document.createElement('a')
    link.href = 'data:text/csv;charset=utf-8,Dashboard Report Export'
    link.download = `sales-dashboard-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading || !dashboardData) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Sales Dashboard"
          description="Comprehensive overview of sales performance and key metrics"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Sales", href: "/sales" },
            { label: "Dashboard" }
          ]}
        />
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const { metrics, charts, tables } = dashboardData.data

  return (
    <TwoLevelLayout>
      <Header 
        title="Sales Dashboard"
        description="Comprehensive overview of sales performance and key metrics"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sales", href: "/sales" },
          { label: "Dashboard" }
        ]}
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Dashboard Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
          <KPICard 
            metric={metrics.total_revenue} 
            icon={<DollarSign className="h-5 w-5 text-green-600" />}
            showTarget={true}
          />
          <KPICard 
            metric={metrics.total_orders} 
            icon={<ShoppingCart className="h-5 w-5 text-blue-600" />}
          />
          <KPICard 
            metric={metrics.average_order_value} 
            icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
            showTarget={true}
          />
          <KPICard 
            metric={metrics.customer_count} 
            icon={<Users className="h-5 w-5 text-orange-600" />}
          />
          <KPICard 
            metric={metrics.conversion_rate} 
            icon={<Target className="h-5 w-5 text-pink-600" />}
          />
          <KPICard 
            metric={metrics.gross_margin} 
            icon={<Calendar className="h-5 w-5 text-teal-600" />}
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart 
            data={charts.revenue_trend}
            title="Revenue Trend (Last 30 Days)"
            height={400}
          />
          <TopProductsChart 
            data={tables.top_products}
            title="Top Products by Revenue"
            height={400}
            limit={8}
          />
        </div>

        {/* Secondary Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesDistributionChart 
            data={tables.category_performance}
            title="Sales Distribution by Category"
            height={400}
          />
          
          {/* Customer Performance Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Top Customers
            </h3>
            <div className="space-y-3">
              {tables.top_customers.slice(0, 6).map((customer, index) => (
                <div key={customer.customer_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {customer.customer_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {customer.total_orders} orders
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      ${customer.total_revenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {customer.status === 'vip' ? '👑 VIP' : '✅ Active'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regional Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Regional Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {tables.regional_performance.map((region) => (
              <div key={region.region_id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {region.region_name}
                  </h4>
                  <span className={`text-sm font-medium ${
                    region.growth_rate > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {region.growth_rate > 0 ? '+' : ''}{region.growth_rate.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    ${(region.total_revenue / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {region.total_orders} orders • {region.customer_count} customers
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Rep Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Sales Team Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Sales Rep
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Territory
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Sales
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Target
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    Achievement
                  </th>
                </tr>
              </thead>
              <tbody>
                {tables.sales_rep_performance.slice(0, 6).map((rep) => (
                  <tr key={rep.rep_id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                      {rep.rep_name}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {rep.territory}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-gray-100">
                      ${(rep.total_sales / 1000).toFixed(0)}K
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                      ${(rep.target / 1000).toFixed(0)}K
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium ${
                        rep.achievement_percentage >= 100 
                          ? 'text-green-600 dark:text-green-400' 
                          : rep.achievement_percentage >= 80 
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {rep.achievement_percentage.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}