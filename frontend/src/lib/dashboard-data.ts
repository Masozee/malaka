/**
 * Dummy Data Generators for Dashboard and BI Analytics
 * Realistic sample data for development and testing
 */

import { 
  SalesMetrics, 
  TimeSeriesData, 
  ProductSales, 
  CategorySales, 
  TopCustomer, 
  RegionSales, 
  SalesRepPerformance,
  CustomerSegment,
  DashboardResponse 
} from '@/types/dashboard'
import { subDays, format } from 'date-fns'

// Helper function to generate random number in range
const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Helper function to generate random float in range
const randomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

// Generate realistic sales metrics
export const generateSalesMetrics = (): SalesMetrics => {
  const totalRevenue = randomBetween(2500000, 3500000)
  const previousRevenue = randomBetween(2200000, 3200000)
  const revenueChange = ((totalRevenue - previousRevenue) / previousRevenue) * 100

  const totalOrders = randomBetween(1200, 1800)
  const previousOrders = randomBetween(1100, 1700)
  const ordersChange = ((totalOrders - previousOrders) / previousOrders) * 100

  const avgOrderValue = totalRevenue / totalOrders
  const previousAOV = previousRevenue / previousOrders
  const aovChange = ((avgOrderValue - previousAOV) / previousAOV) * 100

  const customerCount = randomBetween(450, 650)
  const previousCustomers = randomBetween(420, 620)
  const customerChange = ((customerCount - previousCustomers) / previousCustomers) * 100

  const conversionRate = randomFloat(2.5, 4.2)
  const previousConversion = randomFloat(2.2, 4.0)
  const conversionChange = ((conversionRate - previousConversion) / previousConversion) * 100

  const grossMargin = randomFloat(35, 45)
  const previousMargin = randomFloat(33, 43)
  const marginChange = ((grossMargin - previousMargin) / previousMargin) * 100

  return {
    total_revenue: {
      id: 'total_revenue',
      name: 'Total Revenue',
      value: totalRevenue,
      formatted_value: `$${(totalRevenue / 1000000).toFixed(2)}M`,
      previous_value: previousRevenue,
      change_percentage: Math.abs(revenueChange),
      trend: revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'stable',
      period: 'last month',
      target: 3000000,
      target_percentage: (totalRevenue / 3000000) * 100,
      currency: 'USD'
    },
    total_orders: {
      id: 'total_orders',
      name: 'Total Orders',
      value: totalOrders,
      formatted_value: totalOrders.toLocaleString(),
      previous_value: previousOrders,
      change_percentage: Math.abs(ordersChange),
      trend: ordersChange > 0 ? 'up' : ordersChange < 0 ? 'down' : 'stable',
      period: 'last month'
    },
    average_order_value: {
      id: 'average_order_value',
      name: 'Average Order Value',
      value: avgOrderValue,
      formatted_value: `$${avgOrderValue.toFixed(0)}`,
      previous_value: previousAOV,
      change_percentage: Math.abs(aovChange),
      trend: aovChange > 0 ? 'up' : aovChange < 0 ? 'down' : 'stable',
      period: 'last month',
      target: 2000,
      target_percentage: (avgOrderValue / 2000) * 100,
      currency: 'USD'
    },
    customer_count: {
      id: 'customer_count',
      name: 'Active Customers',
      value: customerCount,
      formatted_value: customerCount.toLocaleString(),
      previous_value: previousCustomers,
      change_percentage: Math.abs(customerChange),
      trend: customerChange > 0 ? 'up' : customerChange < 0 ? 'down' : 'stable',
      period: 'last month'
    },
    conversion_rate: {
      id: 'conversion_rate',
      name: 'Conversion Rate',
      value: conversionRate,
      formatted_value: `${conversionRate.toFixed(1)}%`,
      previous_value: previousConversion,
      change_percentage: Math.abs(conversionChange),
      trend: conversionChange > 0 ? 'up' : conversionChange < 0 ? 'down' : 'stable',
      period: 'last month'
    },
    gross_margin: {
      id: 'gross_margin',
      name: 'Gross Margin',
      value: grossMargin,
      formatted_value: `${grossMargin.toFixed(1)}%`,
      previous_value: previousMargin,
      change_percentage: Math.abs(marginChange),
      trend: marginChange > 0 ? 'up' : marginChange < 0 ? 'down' : 'stable',
      period: 'last month'
    }
  }
}

// Generate time series data for charts
export const generateRevenueTimeSeries = (days: number = 30): TimeSeriesData[] => {
  const data: TimeSeriesData[] = []
  const baseRevenue = 85000
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const dayOfWeek = date.getDay()
    
    // Weekend adjustment (lower sales on weekends)
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1
    
    // Random variation
    const variation = randomFloat(0.8, 1.3)
    
    // Trend (slight upward trend)
    const trendMultiplier = 1 + (i * 0.002)
    
    const revenue = baseRevenue * weekendMultiplier * variation * trendMultiplier
    
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      value: Math.round(revenue),
      label: format(date, 'MMM dd')
    })
  }
  
  return data
}

// Generate product sales data
export const generateProductSales = (): ProductSales[] => {
  const products = [
    { name: 'MacBook Pro 16"', category: 'Electronics', code: 'MBP16' },
    { name: 'iPhone 15 Pro', category: 'Electronics', code: 'IP15P' },
    { name: 'AirPods Pro', category: 'Electronics', code: 'APP2' },
    { name: 'iPad Air', category: 'Electronics', code: 'IPA5' },
    { name: 'Samsung Galaxy S24', category: 'Electronics', code: 'SGS24' },
    { name: 'Dell XPS 13', category: 'Electronics', code: 'DX13' },
    { name: 'Sony WH-1000XM5', category: 'Electronics', code: 'SWH5' },
    { name: 'LG OLED TV 55"', category: 'Electronics', code: 'LGO55' },
    { name: 'Canon EOS R6', category: 'Electronics', code: 'CER6' },
    { name: 'Nintendo Switch', category: 'Gaming', code: 'NSW' },
    { name: 'PlayStation 5', category: 'Gaming', code: 'PS5' },
    { name: 'Xbox Series X', category: 'Gaming', code: 'XSX' },
    { name: 'Office Chair Pro', category: 'Furniture', code: 'OCP' },
    { name: 'Standing Desk', category: 'Furniture', code: 'SD' },
    { name: 'Ergonomic Keyboard', category: 'Accessories', code: 'EK' }
  ]

  return products.map((product, index) => {
    const unitsSold = randomBetween(50, 500)
    const avgPrice = randomBetween(200, 2500)
    const revenue = unitsSold * avgPrice
    const marginPercentage = randomFloat(20, 45)
    const margin = revenue * (marginPercentage / 100)
    
    return {
      id: `prod_${index + 1}`,
      product_id: `prod_${index + 1}`,
      product_name: product.name,
      product_code: product.code,
      category: product.category,
      units_sold: unitsSold,
      revenue: revenue,
      margin: margin,
      margin_percentage: marginPercentage,
      growth_rate: randomFloat(-15, 25),
      rank: index + 1
    }
  }).sort((a, b) => b.revenue - a.revenue)
}

// Generate category sales data
export const generateCategorySales = (): CategorySales[] => {
  const categories = [
    'Electronics',
    'Gaming', 
    'Furniture',
    'Accessories',
    'Software'
  ]

  return categories.map((category, index) => {
    const totalRevenue = randomBetween(500000, 1200000)
    const totalUnits = randomBetween(800, 2000)
    const productCount = randomBetween(15, 45)
    
    return {
      category_id: `cat_${index + 1}`,
      category_name: category,
      total_revenue: totalRevenue,
      total_units: totalUnits,
      product_count: productCount,
      average_price: totalRevenue / totalUnits,
      margin_percentage: randomFloat(25, 40)
    }
  }).sort((a, b) => b.total_revenue - a.total_revenue)
}

// Generate top customers data
export const generateTopCustomers = (): TopCustomer[] => {
  const customers = [
    { name: 'Apple Inc.', company: 'Apple Inc.' },
    { name: 'Microsoft Corp.', company: 'Microsoft Corp.' },
    { name: 'Google LLC', company: 'Alphabet Inc.' },
    { name: 'Amazon.com', company: 'Amazon.com Inc.' },
    { name: 'Meta Platforms', company: 'Meta Platforms Inc.' },
    { name: 'Tesla Inc.', company: 'Tesla Inc.' },
    { name: 'Netflix Inc.', company: 'Netflix Inc.' },
    { name: 'Adobe Systems', company: 'Adobe Inc.' },
    { name: 'Salesforce', company: 'Salesforce Inc.' },
    { name: 'Oracle Corp.', company: 'Oracle Corporation' }
  ]

  return customers.map((customer, index) => {
    const totalOrders = randomBetween(15, 85)
    const totalRevenue = randomBetween(25000, 150000)
    const customerSince = subDays(new Date(), randomBetween(30, 1200))
    const lastOrder = subDays(new Date(), randomBetween(1, 45))
    
    return {
      id: `cust_${index + 1}`,
      customer_id: `cust_${index + 1}`,
      customer_name: customer.name,
      company_name: customer.company,
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      last_order_date: format(lastOrder, 'yyyy-MM-dd'),
      customer_since: format(customerSince, 'yyyy-MM-dd'),
      status: (totalRevenue > 100000 ? 'vip' : totalRevenue > 50000 ? 'active' : 'active') as 'active' | 'inactive' | 'vip'
    }
  }).sort((a, b) => b.total_revenue - a.total_revenue)
}

// Generate regional sales data
export const generateRegionSales = (): RegionSales[] => {
  const regions = [
    { name: 'North America', country: 'United States' },
    { name: 'Europe', country: 'United Kingdom' },
    { name: 'Asia Pacific', country: 'Japan' },
    { name: 'Latin America', country: 'Brazil' },
    { name: 'Middle East', country: 'UAE' }
  ]

  return regions.map((region, index) => {
    const totalRevenue = randomBetween(400000, 1000000)
    const totalOrders = randomBetween(200, 600)
    const customerCount = randomBetween(100, 300)
    
    return {
      region_id: `region_${index + 1}`,
      region_name: region.name,
      country: region.country,
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      customer_count: customerCount,
      growth_rate: randomFloat(-10, 20)
    }
  }).sort((a, b) => b.total_revenue - a.total_revenue)
}

// Generate sales rep performance data
export const generateSalesRepPerformance = (): SalesRepPerformance[] => {
  const reps = [
    { name: 'John Smith', territory: 'North America' },
    { name: 'Sarah Johnson', territory: 'Europe' },
    { name: 'Mike Chen', territory: 'Asia Pacific' },
    { name: 'Lisa Rodriguez', territory: 'Latin America' },
    { name: 'David Wilson', territory: 'North America' },
    { name: 'Emma Davis', territory: 'Europe' },
    { name: 'Alex Kim', territory: 'Asia Pacific' },
    { name: 'Maria Garcia', territory: 'Latin America' }
  ]

  return reps.map((rep, index) => {
    const target = randomBetween(200000, 400000)
    const totalSales = randomBetween(150000, 450000)
    const customerCount = randomBetween(25, 80)
    
    return {
      rep_id: `rep_${index + 1}`,
      rep_name: rep.name,
      territory: rep.territory,
      total_sales: totalSales,
      target: target,
      achievement_percentage: (totalSales / target) * 100,
      customer_count: customerCount,
      average_deal_size: totalSales / randomBetween(15, 35),
      conversion_rate: randomFloat(15, 35)
    }
  }).sort((a, b) => b.achievement_percentage - a.achievement_percentage)
}

// Generate customer segments
export const generateCustomerSegments = (): CustomerSegment[] => {
  const segments = ['Enterprise', 'SMB', 'Startup', 'Individual']
  
  return segments.map((segment, index) => {
    const customerCount = randomBetween(50, 200)
    const totalRevenue = randomBetween(200000, 800000)
    const avgOrderValue = totalRevenue / randomBetween(customerCount * 2, customerCount * 8)
    
    return {
      segment_id: `seg_${index + 1}`,
      segment_name: segment,
      customer_count: customerCount,
      total_revenue: totalRevenue,
      average_order_value: avgOrderValue,
      order_frequency: randomFloat(2, 8),
      lifetime_value: totalRevenue / customerCount * randomFloat(1.5, 3)
    }
  }).sort((a, b) => b.total_revenue - a.total_revenue)
}

// Generate complete dashboard response
export const generateDashboardData = (): DashboardResponse => {
  return {
    dashboard: {
      id: 'sales_overview',
      name: 'Sales Overview',
      description: 'Comprehensive sales performance dashboard',
      category: 'sales',
      is_default: true,
      created_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      widgets: [],
      filters: {
        date_range: {
          start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
          end_date: format(new Date(), 'yyyy-MM-dd'),
          period_type: 'monthly'
        }
      }
    },
    data: {
      metrics: generateSalesMetrics(),
      charts: {
        revenue_trend: generateRevenueTimeSeries(30),
        orders_trend: generateRevenueTimeSeries(30).map(item => ({
          ...item,
          value: Math.round(item.value / 1000) // Convert to order count
        })),
        customer_acquisition: generateRevenueTimeSeries(30).map(item => ({
          ...item,
          value: Math.round(item.value / 10000) // Convert to customer count
        })),
        product_performance: generateRevenueTimeSeries(10)
      },
      tables: {
        top_products: generateProductSales(),
        top_customers: generateTopCustomers(),
        regional_performance: generateRegionSales(),
        category_performance: generateCategorySales(),
        sales_rep_performance: generateSalesRepPerformance(),
        customer_segments: generateCustomerSegments()
      }
    }
  }
}