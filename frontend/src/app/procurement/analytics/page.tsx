'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Clock,
  Target,
  PieChart
} from 'lucide-react'

export default function ProcurementAnalyticsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Analytics', href: '/procurement/analytics' }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Procurement Analytics"
          breadcrumbs={breadcrumbs}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spend (YTD)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mounted ? 'Rp 15.2B' : ''}
                </p>
                <p className="text-xs text-green-600">↗ 8.5% vs last year</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Cost Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  {mounted ? 'Rp 2.1B' : ''}
                </p>
                <p className="text-xs text-green-600">12.5% of total spend</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Purchase Orders</p>
                <p className="text-2xl font-bold text-purple-600">1,247</p>
                <p className="text-xs text-blue-600">↗ 15% vs last month</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Lead Time</p>
                <p className="text-2xl font-bold text-orange-600">18 days</p>
                <p className="text-xs text-red-600">↗ 2 days vs target</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Monthly Spend Trend</h3>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Monthly spending trend chart</p>
                <p className="text-sm">Interactive chart would be here</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Spend by Category</h3>
              <Button variant="outline" size="sm">
                <PieChart className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <PieChart className="h-12 w-12 mx-auto mb-2" />
                <p>Category distribution chart</p>
                <p className="text-sm">Interactive pie chart would be here</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Suppliers */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Suppliers by Spend</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'PT Prima Leather Industries', spend: 'Rp 2.5B', percentage: 16.4, orders: 45 },
              { name: 'Shanghai Footwear Components Ltd', spend: 'Rp 1.8B', percentage: 11.8, orders: 28 },
              { name: 'PT Kemasan Sepatu Jaya', spend: 'Rp 1.2B', percentage: 7.9, orders: 67 },
              { name: 'Mesin Industri Nusantara', spend: 'Rp 980M', percentage: 6.4, orders: 12 },
            ].map((supplier, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{supplier.name}</span>
                    <span className="font-semibold">{mounted ? supplier.spend : ''}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-500">{supplier.orders} orders</span>
                    <span className="text-sm text-gray-500">{supplier.percentage}% of total</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Delivery Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">On-Time Delivery</span>
                <span className="font-semibold text-green-600">92%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Early Delivery</span>
                <span className="font-semibold text-blue-600">5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Late Delivery</span>
                <span className="font-semibold text-red-600">3%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quality Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Defect Rate</span>
                <span className="font-semibold text-green-600">1.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Return Rate</span>
                <span className="font-semibold text-yellow-600">0.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Acceptance Rate</span>
                <span className="font-semibold text-green-600">98.2%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Process Efficiency</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Processing Time</span>
                <span className="font-semibold">5.2 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">RFQ Response Rate</span>
                <span className="font-semibold text-green-600">87%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contract Compliance</span>
                <span className="font-semibold text-green-600">94%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </TwoLevelLayout>
  )
}