/**
 * Dashboard and BI Analytics TypeScript Interfaces
 * Types for sales reports, KPIs, and business intelligence
 */

export interface BaseMetric {
  id: string
  name: string
  value: number
  formatted_value: string
  previous_value?: number
  change_percentage?: number
  trend: 'up' | 'down' | 'stable'
  period: string
}

// Sales KPIs and Metrics
export interface SalesKPI extends BaseMetric {
  target?: number
  target_percentage?: number
  currency: string
}

export interface SalesMetrics {
  total_revenue: SalesKPI
  total_orders: BaseMetric
  average_order_value: SalesKPI
  customer_count: BaseMetric
  conversion_rate: BaseMetric
  gross_margin: BaseMetric
}

// Time Series Data for Charts
export interface TimeSeriesData {
  date: string
  value: number
  label?: string
  category?: string
}

export interface SalesChartData {
  revenue_trend: TimeSeriesData[]
  orders_trend: TimeSeriesData[]
  customer_acquisition: TimeSeriesData[]
  product_performance: TimeSeriesData[]
}

// Product Analytics
export interface ProductSales {
  id: string
  product_id: string
  product_name: string
  product_code: string
  category: string
  units_sold: number
  revenue: number
  margin: number
  margin_percentage: number
  growth_rate: number
  rank: number
}

export interface CategorySales {
  category_id: string
  category_name: string
  total_revenue: number
  total_units: number
  product_count: number
  average_price: number
  margin_percentage: number
}

// Customer Analytics
export interface CustomerSegment {
  segment_id: string
  segment_name: string
  customer_count: number
  total_revenue: number
  average_order_value: number
  order_frequency: number
  lifetime_value: number
}

export interface TopCustomer {
  id: string
  customer_id: string
  customer_name: string
  company_name?: string
  total_orders: number
  total_revenue: number
  last_order_date: string
  customer_since: string
  status: 'active' | 'inactive' | 'vip'
}

// Geographic Analytics
export interface RegionSales {
  region_id: string
  region_name: string
  country: string
  total_revenue: number
  total_orders: number
  customer_count: number
  growth_rate: number
}

// Sales Representative Performance
export interface SalesRepPerformance {
  rep_id: string
  rep_name: string
  territory: string
  total_sales: number
  target: number
  achievement_percentage: number
  customer_count: number
  average_deal_size: number
  conversion_rate: number
}

// Dashboard Filters
export interface DashboardFilters {
  date_range: {
    start_date: string
    end_date: string
    period_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  }
  region?: string[]
  product_category?: string[]
  sales_rep?: string[]
  customer_segment?: string[]
  currency?: string
  comparison_period?: {
    start_date: string
    end_date: string
  }
}

// Sales Report Types
export interface SalesReport {
  id: string
  report_name: string
  report_type: 'summary' | 'detailed' | 'trend' | 'comparison'
  generated_at: string
  generated_by: string
  filters: DashboardFilters
  data: {
    metrics: SalesMetrics
    charts: SalesChartData
    top_products: ProductSales[]
    top_customers: TopCustomer[]
    regional_performance: RegionSales[]
    sales_rep_performance: SalesRepPerformance[]
  }
}

// Widget Configuration
export interface DashboardWidget {
  id: string
  title: string
  type: 'metric' | 'chart' | 'table' | 'map'
  chart_type?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area'
  size: 'small' | 'medium' | 'large' | 'full'
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  data_source: string
  config: Record<string, unknown>
  is_visible: boolean
}

export interface Dashboard {
  id: string
  name: string
  description?: string
  category: 'sales' | 'finance' | 'operations' | 'custom'
  is_default: boolean
  created_by: string
  created_at: string
  updated_at: string
  widgets: DashboardWidget[]
  filters: DashboardFilters
}

// API Response Types
export interface DashboardResponse {
  dashboard: Dashboard
  data: {
    metrics: SalesMetrics
    charts: SalesChartData
    tables: {
      top_products: ProductSales[]
      top_customers: TopCustomer[]
      regional_performance: RegionSales[]
      category_performance: CategorySales[]
      sales_rep_performance: SalesRepPerformance[]
      customer_segments: CustomerSegment[]
    }
  }
}

export interface ReportsListResponse {
  data: SalesReport[]
  total: number
  page: number
  limit: number
}

// Chart Configuration
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter'
  title: string
  subtitle?: string
  x_axis_label?: string
  y_axis_label?: string
  colors: string[]
  show_legend: boolean
  show_grid: boolean
  is_stacked?: boolean
  is_percentage?: boolean
}

// Export Types
export interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv' | 'png'
  include_charts: boolean
  include_data: boolean
  date_range: {
    start_date: string
    end_date: string
  }
  template?: string
}