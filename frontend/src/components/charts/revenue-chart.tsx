"use client"

import * as React from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TimeSeriesData } from "@/types/dashboard"

interface RevenueChartProps {
  data: TimeSeriesData[]
  title?: string
  height?: number
  showComparison?: boolean
  comparisonData?: TimeSeriesData[]
}

export function RevenueChart({ 
  data, 
  title = "Revenue Trend", 
  height = 350,
  showComparison = false,
  comparisonData 
}: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const CustomTooltip = ({ active, payload, label }: { 
    active?: boolean; 
    payload?: Array<{ color: string; name: string; value: number }>; 
    label?: string 
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg ">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {new Date(label || '').toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Combine current and comparison data if needed
  const chartData = React.useMemo(() => {
    if (!showComparison || !comparisonData) {
      return data.map(item => ({
        date: item.date,
        current: item.value,
        label: item.label
      }))
    }

    // Merge current and comparison data by date
    const mergedData = data.map(currentItem => {
      const comparisonItem = comparisonData.find(comp => comp.date === currentItem.date)
      return {
        date: currentItem.date,
        current: currentItem.value,
        previous: comparisonItem?.value || 0,
        label: currentItem.label
      }
    })

    return mergedData
  }, [data, comparisonData, showComparison])

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
          aria-label={`${title} line chart showing revenue data over time`}
        >
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                className="text-xs"
              />
              <YAxis 
                tickFormatter={formatCurrency}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              {showComparison && <Legend />}
              
              <Line
                type="monotone"
                dataKey="current"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                name={showComparison ? "Current Period" : "Revenue"}
              />
              
              {showComparison && (
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#94a3b8", strokeWidth: 2, r: 3 }}
                  name="Previous Period"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}