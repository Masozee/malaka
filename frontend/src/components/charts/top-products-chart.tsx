"use client"

import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductSales } from "@/types/dashboard"

interface TopProductsChartProps {
  data: ProductSales[]
  title?: string
  height?: number
  showRevenue?: boolean
  limit?: number
}

export function TopProductsChart({ 
  data, 
  title = "Top Products", 
  height = 350,
  showRevenue = true,
  limit = 10
}: TopProductsChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatUnits = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const chartData = React.useMemo(() => {
    return data
      .slice(0, limit)
      .map(product => ({
        name: product.product_name.length > 20 
          ? product.product_name.substring(0, 20) + '...' 
          : product.product_name,
        fullName: product.product_name,
        revenue: product.revenue,
        units: product.units_sold,
        margin: product.margin_percentage
      }))
  }, [data, limit])

  const CustomTooltip = ({ active, payload }: { 
    active?: boolean; 
    payload?: Array<{ payload: { fullName: string; revenue: number; units: number; margin: number } }> 
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg ">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {data.fullName}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">
              Revenue: {formatCurrency(data.revenue)}
            </p>
            <p className="text-sm text-green-600">
              Units Sold: {formatUnits(data.units)}
            </p>
            <p className="text-sm text-purple-600">
              Margin: {data.margin.toFixed(1)}%
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          style={{ width: '100%', height }}
          role="img"
          aria-label={`${title} bar chart showing ${showRevenue ? 'revenue' : 'units sold'} for top ${limit} products`}
        >
          <ResponsiveContainer>
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                type="number"
                tickFormatter={showRevenue ? formatCurrency : formatUnits}
                className="text-xs"
              />
              <YAxis 
                type="category"
                dataKey="name"
                width={120}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={showRevenue ? "revenue" : "units"}
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}