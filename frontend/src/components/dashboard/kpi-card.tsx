"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartIncreaseIcon, ChartDecreaseIcon, MinusSignIcon, TargetIcon } from "@hugeicons/core-free-icons"
import { SalesKPI, BaseMetric } from "@/types/dashboard"

interface KPICardProps {
  metric: SalesKPI | BaseMetric
  icon?: React.ReactNode
  showTarget?: boolean
  size?: 'small' | 'medium' | 'large'
}

export function KPICard({ 
  metric, 
  icon, 
  showTarget = false,
  size = 'medium'
}: KPICardProps) {
  const formatValue = (value: number, currency?: string) => {
    if (currency) {
      // Format currency with K, M, B suffixes for large values
      if (value >= 1000000000) {
        return `$${(value / 1000000000).toFixed(2)}B`
      }
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(2)}M`
      }
      if (value >= 1000) {
        return `$${(value / 1000).toFixed(2)}K`
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    }
    
    // Format numbers with K, M, B suffixes
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B`
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`
    }
    return value.toLocaleString()
  }

  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <HugeiconsIcon icon={ChartIncreaseIcon} className="h-4 w-4" />
      case 'down':
        return <HugeiconsIcon icon={ChartDecreaseIcon} className="h-4 w-4" />
      default:
        return <HugeiconsIcon icon={MinusSignIcon} className="h-4 w-4" />
    }
  }

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400'
      case 'down':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }


  const salesKPI = metric as SalesKPI
  const currency = 'currency' in metric ? salesKPI.currency : undefined

  return (
    <Card className="hover: transition-shadow min-w-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
          {metric.name}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground flex-shrink-0 ml-2">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <div className="space-y-3">
          {/* Main Value */}
          <div className="text-xl xl:text-2xl font-bold text-gray-900 dark:text-gray-100 break-all">
            {formatValue(metric.value, currency)}
          </div>

          {/* Change Percentage and Previous Value */}
          <div className="space-y-2">
            {metric.change_percentage !== undefined && (
              <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-sm font-medium">
                  {Math.abs(metric.change_percentage).toFixed(2)}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  vs {metric.period}
                </span>
              </div>
            )}

            {metric.previous_value !== undefined && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Previous: {formatValue(metric.previous_value, currency)}
              </div>
            )}
          </div>

          {/* Target Information (for SalesKPI) */}
          {showTarget && 'target' in metric && salesKPI.target && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Target</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {formatValue(salesKPI.target, currency)}
                </span>
              </div>
              
              {salesKPI.target_percentage !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Achievement</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {salesKPI.target_percentage.toFixed(2)}%
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        salesKPI.target_percentage >= 100 
                          ? 'bg-green-500' 
                          : salesKPI.target_percentage >= 80 
                          ? 'bg-blue-500' 
                          : 'bg-yellow-500'
                      }`}
                      style={{ 
                        width: `${Math.min(salesKPI.target_percentage, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center justify-between gap-2">
            <Badge 
              variant={
                metric.trend === 'up' ? 'default' : 
                metric.trend === 'down' ? 'destructive' : 
                'secondary'
              }
              className="text-xs flex-shrink-0"
            >
              {metric.trend === 'up' ? 'Growing' : 
               metric.trend === 'down' ? 'Declining' : 
               'Stable'}
            </Badge>

            {showTarget && 'target_percentage' in metric && salesKPI.target_percentage !== undefined && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 min-w-0">
                <HugeiconsIcon icon={TargetIcon} className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {salesKPI.target_percentage >= 100 ? 'Target Met' : 
                   salesKPI.target_percentage >= 80 ? 'On Track' : 'Below Target'}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}