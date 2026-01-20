"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategorySales } from "@/types/dashboard"

interface SalesDistributionChartProps {
  data: CategorySales[]
  title?: string
  height?: number
  showLabels?: boolean
}

const COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red  
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#6b7280', // Gray
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#84cc16'  // Lime
]

export function SalesDistributionChart({ 
  data, 
  title = "Sales by Category", 
  height = 350,
  showLabels = true 
}: SalesDistributionChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const chartData = React.useMemo(() => {
    const totalRevenue = data.reduce((sum, category) => sum + category.total_revenue, 0)
    
    return data.map((category, index) => ({
      name: category.category_name,
      value: category.total_revenue,
      percentage: totalRevenue > 0 ? (category.total_revenue / totalRevenue) * 100 : 0,
      color: COLORS[index % COLORS.length],
      units: category.total_units,
      productCount: category.product_count
    }))
  }, [data])

  const CustomTooltip = ({ active, payload }: { 
    active?: boolean; 
    payload?: Array<{ 
      payload: { 
        name: string; 
        value: number; 
        percentage: number; 
        units: number; 
        productCount: number; 
        color: string 
      } 
    }> 
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg ">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {data.name}
          </p>
          <div className="space-y-1">
            <p className="text-sm" style={{ color: data.color }}>
              Revenue: {formatCurrency(data.value)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share: {data.percentage.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Units: {data.units.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Products: {data.productCount}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percentage } = props
    if (!showLabels || percentage < 5) return null // Don't show labels for slices less than 5%
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    )
  }

  const CustomLegend = ({ payload }: { 
    payload?: Array<{ color: string; value: string }> 
  }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload?.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    )
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
          aria-label={`${title} pie chart showing sales distribution across ${data.length} categories`}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}