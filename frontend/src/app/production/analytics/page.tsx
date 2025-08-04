'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  Download, 
  Filter, 
  DollarSign, 
  Users, 
  Package, 
  Truck, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Calculator,
  PieChart,
  LineChart,
  Target,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { mockProductionAnalytics } from '@/services/production'
import type { ProductionCostAnalysis, ProductionEfficiencyMetrics } from '@/types/production'

export default function ProductionAnalyticsPage() {
  const [mounted, setMounted] = useState(false)
  const [timeRange, setTimeRange] = useState<string>('month')
  const [productFilter, setProductFilter] = useState<string>('all')
  const [costTypeFilter, setCostTypeFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'cost-analysis' | 'efficiency' | 'trends'>('cost-analysis')

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Production', href: '/production' },
    { label: 'Analytics', href: '/production/analytics' }
  ]

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatPercentage = (value?: number): string => {
    if (!mounted || typeof value !== 'number' || isNaN(value)) return ''
    return `${value.toFixed(1)}%`
  }

  // Filter analytics data
  const filteredAnalytics = (mockProductionAnalytics?.costAnalysis || []).filter(item => {
    if (productFilter !== 'all' && item?.productId !== productFilter) return false
    return true
  })

  // Summary metrics
  const summaryMetrics = {
    totalCost: filteredAnalytics.reduce((sum, item) => sum + (item?.totalCost || 0), 0),
    totalRevenue: filteredAnalytics.reduce((sum, item) => sum + (item?.revenue || 0), 0),
    totalProfit: filteredAnalytics.reduce((sum, item) => sum + (item?.profit || 0), 0),
    averageMargin: filteredAnalytics.length > 0 
      ? filteredAnalytics.reduce((sum, item) => sum + (item?.profitMargin || 0), 0) / filteredAnalytics.length
      : 0,
    totalUnits: filteredAnalytics.reduce((sum, item) => sum + (item?.unitsProduced || 0), 0)
  }

  // Cost breakdown columns
  const costAnalysisColumns = [
    {
      key: 'product',
      title: 'Product',
      render: (item: ProductionCostAnalysis) => (
        <div>
          <div className="font-medium">{item?.productName || ''}</div>
          <div className="text-sm text-muted-foreground">{item?.productCode || ''}</div>
        </div>
      )
    },
    {
      key: 'units',
      title: 'Units Produced',
      render: (item: ProductionCostAnalysis) => (
        <div className="text-center">
          <div className="font-medium">{item?.unitsProduced || 0}</div>
          <div className="text-sm text-muted-foreground">units</div>
        </div>
      )
    },
    {
      key: 'materialCost',
      title: 'Material Cost',
      render: (item: ProductionCostAnalysis) => (
        <div>
          <div className="font-medium">{formatCurrency(item?.materialCost?.total)}</div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(item?.materialCost?.perUnit)} per unit
          </div>
        </div>
      )
    },
    {
      key: 'laborCost',
      title: 'Labor Cost',
      render: (item: ProductionCostAnalysis) => (
        <div>
          <div className="font-medium">{formatCurrency(item?.laborCost?.total)}</div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(item?.laborCost?.perUnit)} per unit
          </div>
          <div className="text-xs text-muted-foreground">
            {item?.laborCost?.hoursUsed || 0}h total
          </div>
        </div>
      )
    },
    {
      key: 'overheadCost',
      title: 'Overhead Cost',
      render: (item: ProductionCostAnalysis) => (
        <div>
          <div className="font-medium">{formatCurrency(item?.overheadCost?.total)}</div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(item?.overheadCost?.perUnit)} per unit
          </div>
        </div>
      )
    },
    {
      key: 'logisticsCost',
      title: 'Logistics Cost',
      render: (item: ProductionCostAnalysis) => (
        <div>
          <div className="font-medium">{formatCurrency(item?.logisticsCost?.total)}</div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(item?.logisticsCost?.perUnit)} per unit
          </div>
        </div>
      )
    },
    {
      key: 'totalCost',
      title: 'Total Cost',
      render: (item: ProductionCostAnalysis) => (
        <div>
          <div className="font-medium text-red-600">{formatCurrency(item?.totalCost)}</div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(item?.costPerUnit)} per unit
          </div>
        </div>
      )
    },
    {
      key: 'profitAnalysis',
      title: 'Profit Analysis',
      render: (item: ProductionCostAnalysis) => (
        <div>
          <div className="font-medium text-green-600">{formatCurrency(item?.profit)}</div>
          <div className="text-sm text-muted-foreground">
            Revenue: {formatCurrency(item?.revenue)}
          </div>
          <div className={`text-sm font-medium ${(item?.profitMargin || 0) >= 20 ? 'text-green-600' : (item?.profitMargin || 0) >= 10 ? 'text-orange-600' : 'text-red-600'}`}>
            Margin: {formatPercentage(item?.profitMargin)}
          </div>
        </div>
      )
    }
  ]

  // Efficiency metrics columns
  const efficiencyColumns = [
    {
      key: 'product',
      title: 'Product',
      render: (item: ProductionEfficiencyMetrics) => (
        <div>
          <div className="font-medium">{item?.productName || ''}</div>
          <div className="text-sm text-muted-foreground">{item?.productCode || ''}</div>
        </div>
      )
    },
    {
      key: 'efficiency',
      title: 'Overall Efficiency',
      render: (item: ProductionEfficiencyMetrics) => (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{formatPercentage(item?.overallEfficiency)}</span>
            <span className={`text-xs ${(item?.overallEfficiency || 0) >= 85 ? 'text-green-600' : 'text-orange-600'}`}>
              {(item?.overallEfficiency || 0) >= 85 ? 'Excellent' : 'Needs Improvement'}
            </span>
          </div>
          <Progress value={item?.overallEfficiency || 0} className="h-2" />
        </div>
      )
    },
    {
      key: 'timeEfficiency',
      title: 'Time Efficiency',
      render: (item: ProductionEfficiencyMetrics) => (
        <div>
          <div className="text-sm">
            Planned: {item?.timeEfficiency?.plannedHours || 0}h
          </div>
          <div className="text-sm">
            Actual: {item?.timeEfficiency?.actualHours || 0}h
          </div>
          <div className={`text-sm font-medium ${(item?.timeEfficiency?.efficiency || 0) >= 90 ? 'text-green-600' : 'text-orange-600'}`}>
            {formatPercentage(item?.timeEfficiency?.efficiency)}
          </div>
        </div>
      )
    },
    {
      key: 'materialEfficiency',
      title: 'Material Efficiency',
      render: (item: ProductionEfficiencyMetrics) => (
        <div>
          <div className="text-sm">
            Used: {item?.materialEfficiency?.materialsUsed || 0} units
          </div>
          <div className="text-sm">
            Waste: {item?.materialEfficiency?.waste || 0} units
          </div>
          <div className={`text-sm font-medium ${(item?.materialEfficiency?.efficiency || 0) >= 95 ? 'text-green-600' : 'text-orange-600'}`}>
            {formatPercentage(item?.materialEfficiency?.efficiency)}
          </div>
        </div>
      )
    },
    {
      key: 'qualityScore',
      title: 'Quality Score',
      render: (item: ProductionEfficiencyMetrics) => (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{formatPercentage(item?.qualityScore)}</span>
          </div>
          <Progress value={item?.qualityScore || 0} className="h-2" />
          <div className="text-xs text-muted-foreground">
            Defect rate: {formatPercentage(100 - (item?.qualityScore || 0))}
          </div>
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Production Analytics"
          description="Deep analysis of production costs, efficiency, and performance metrics"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <PieChart className="h-4 w-4 mr-2" />
                Cost Breakdown
              </Button>
              <Button variant="outline" size="sm">
                <LineChart className="h-4 w-4 mr-2" />
                Trend Analysis
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          }
        />

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `Rp ${(summaryMetrics.totalCost / 1000000).toFixed(1)}M` : ''}
                </p>
                <p className="text-sm text-red-600 mt-1">Production costs</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `Rp ${(summaryMetrics.totalRevenue / 1000000).toFixed(1)}M` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">Sales revenue</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `Rp ${(summaryMetrics.totalProfit / 1000000).toFixed(1)}M` : ''}
                </p>
                <p className={`text-sm mt-1 ${summaryMetrics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summaryMetrics.totalProfit >= 0 ? 'Profitable' : 'Loss'}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Margin</p>
                <p className="text-2xl font-bold mt-1">{formatPercentage(summaryMetrics.averageMargin)}</p>
                <div className="mt-2">
                  <Progress value={summaryMetrics.averageMargin} className="h-2" />
                </div>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Units Produced</p>
                <p className="text-2xl font-bold mt-1">{summaryMetrics.totalUnits.toLocaleString()}</p>
                <p className="text-sm text-blue-600 mt-1">Total output</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="timeRange">Time Range</Label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Product Filter</Label>
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {mounted && filteredAnalytics.map((item) => (
                      <SelectItem key={item?.productId} value={item?.productId || ''}>
                        {item?.productName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="costType">Cost Type</Label>
                <Select value={costTypeFilter} onValueChange={setCostTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All cost types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Costs</SelectItem>
                    <SelectItem value="material">Material Costs</SelectItem>
                    <SelectItem value="labor">Labor Costs</SelectItem>
                    <SelectItem value="overhead">Overhead Costs</SelectItem>
                    <SelectItem value="logistics">Logistics Costs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Analytics Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'cost-analysis' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('cost-analysis')}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Cost Analysis
          </Button>
          <Button
            variant={activeTab === 'efficiency' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('efficiency')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Efficiency Metrics
          </Button>
          <Button
            variant={activeTab === 'trends' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('trends')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Trend Analysis
          </Button>
        </div>

        {/* Cost Analysis Tab */}
        {activeTab === 'cost-analysis' && (
          <div className="space-y-6">
            {/* Cost Breakdown Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Cost Distribution</h3>
                <div className="space-y-4">
                  {['Material', 'Labor', 'Overhead', 'Logistics'].map((costType, index) => {
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500']
                    const values = [45, 30, 15, 10] // Mock percentages
                    return (
                      <div key={costType} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded ${colors[index]}`}></div>
                          <span className="font-medium">{costType}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{values[index]}%</span>
                          <Progress value={values[index]} className="h-2 w-20" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Cost per Unit Trends</h3>
                <div className="space-y-4">
                  {filteredAnalytics.slice(0, 5).map((item, index) => (
                    <div key={item?.productId} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item?.productName}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(item?.costPerUnit)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {index % 2 === 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm ${index % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {index % 2 === 0 ? '+' : '-'}{(Math.random() * 10).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Detailed Cost Analysis Table */}
            <Card>
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Detailed Cost Analysis</h3>
                <p className="text-sm text-muted-foreground">Complete breakdown of production costs per product</p>
              </div>
              <AdvancedDataTable
                data={filteredAnalytics}
                columns={costAnalysisColumns}
                searchable={false}
                filterable={false}
                pagination={{
                  pageSize: 10,
                  currentPage: 1,
                  totalPages: Math.ceil(filteredAnalytics.length / 10),
                  totalItems: filteredAnalytics.length,
                  onChange: () => {}
                }}
              />
            </Card>
          </div>
        )}

        {/* Efficiency Metrics Tab */}
        {activeTab === 'efficiency' && (
          <div className="space-y-6">
            {/* Efficiency Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Time Efficiency</h3>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">87.5%</div>
                  <p className="text-sm text-muted-foreground">Average across all products</p>
                  <Progress value={87.5} className="h-3 mt-3" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Package className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Material Efficiency</h3>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">94.2%</div>
                  <p className="text-sm text-muted-foreground">Material utilization rate</p>
                  <Progress value={94.2} className="h-3 mt-3" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Quality Score</h3>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">96.8%</div>
                  <p className="text-sm text-muted-foreground">Quality pass rate</p>
                  <Progress value={96.8} className="h-3 mt-3" />
                </div>
              </Card>
            </div>

            {/* Efficiency Details Table */}
            <Card>
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Production Efficiency Metrics</h3>
                <p className="text-sm text-muted-foreground">Detailed efficiency analysis per product</p>
              </div>
              <AdvancedDataTable
                data={mockProductionAnalytics?.efficiencyMetrics || []}
                columns={efficiencyColumns}
                searchable={false}
                filterable={false}
                pagination={{
                  pageSize: 10,
                  currentPage: 1,
                  totalPages: Math.ceil((mockProductionAnalytics?.efficiencyMetrics?.length || 0) / 10),
                  totalItems: mockProductionAnalytics?.efficiencyMetrics?.length || 0,
                  onChange: () => {}
                }}
              />
            </Card>
          </div>
        )}

        {/* Trend Analysis Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Production Trends & Insights</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-green-600">Positive Trends</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Material efficiency improved by 8.5% this quarter</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Labor productivity increased by 12.3%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Quality scores consistently above 95%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 text-red-600">Areas for Improvement</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Logistics costs increased by 15% this month</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Overhead costs trending upward</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">3 products with declining profit margins</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Cost Optimization Recommendations */}
        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-800">Cost Optimization Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-orange-800">Material Costs</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Negotiate bulk purchase agreements with top suppliers</li>
                <li>• Implement just-in-time inventory management</li>
                <li>• Explore alternative material sources</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-orange-800">Labor Efficiency</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Implement cross-training programs</li>
                <li>• Optimize production scheduling</li>
                <li>• Invest in automation for repetitive tasks</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </TwoLevelLayout>
  )
}