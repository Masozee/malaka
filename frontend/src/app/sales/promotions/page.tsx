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

import Link from 'next/link'

// Promotion types
interface SalesPromotion {
  id: string
  promotion_code: string
  promotion_name: string
  promotion_type: 'percentage' | 'fixed_amount' | 'buy_one_get_one' | 'bundle' | 'free_shipping' | 'cashback'
  discount_value: number
  minimum_purchase?: number
  maximum_discount?: number
  target_audience: 'all_customers' | 'new_customers' | 'vip_customers' | 'specific_group'
  target_products: 'all_products' | 'specific_categories' | 'specific_items'
  start_date: string
  end_date: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  usage_limit?: number
  usage_count: number
  total_sales: number
  total_discount_given: number
  conversion_rate: number
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

const mockPromotions: SalesPromotion[] = [
  {
    id: '1',
    promotion_code: 'SUMMER2024',
    promotion_name: 'Summer Sale Collection',
    promotion_type: 'percentage',
    discount_value: 25,
    minimum_purchase: 500000,
    maximum_discount: 200000,
    target_audience: 'all_customers',
    target_products: 'specific_categories',
    start_date: '2024-06-01T00:00:00Z',
    end_date: '2024-08-31T23:59:59Z',
    status: 'active',
    usage_limit: 1000,
    usage_count: 678,
    total_sales: 845600000,
    total_discount_given: 127400000,
    conversion_rate: 18.5,
    created_by: 'Marketing Manager',
    updated_by: 'Ahmad Marketing',
    created_at: '2024-05-20T10:00:00Z',
    updated_at: '2024-07-25T14:30:00Z'
  },
  {
    id: '2',
    promotion_code: 'NEWBIE50',
    promotion_name: 'New Customer Welcome',
    promotion_type: 'fixed_amount',
    discount_value: 50000,
    minimum_purchase: 200000,
    target_audience: 'new_customers',
    target_products: 'all_products',
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    status: 'active',
    usage_count: 1234,
    total_sales: 456700000,
    total_discount_given: 61700000,
    conversion_rate: 24.8,
    created_by: 'Sales Manager',
    updated_by: 'Sari Sales',
    created_at: '2023-12-15T09:30:00Z',
    updated_at: '2024-07-24T16:20:00Z'
  },
  {
    id: '3',
    promotion_code: 'BOGO-SPECIAL',
    promotion_name: 'Buy One Get One Free',
    promotion_type: 'buy_one_get_one',
    discount_value: 50,
    target_audience: 'all_customers',
    target_products: 'specific_items',
    start_date: '2024-07-15T00:00:00Z',
    end_date: '2024-07-31T23:59:59Z',
    status: 'active',
    usage_limit: 500,
    usage_count: 289,
    total_sales: 234500000,
    total_discount_given: 98600000,
    conversion_rate: 31.2,
    created_by: 'Product Manager',
    updated_by: 'Budi Product',
    created_at: '2024-07-10T11:45:00Z',
    updated_at: '2024-07-25T12:15:00Z'
  },
  {
    id: '4',
    promotion_code: 'VIP2024',
    promotion_name: 'VIP Member Exclusive',
    promotion_type: 'percentage',
    discount_value: 35,
    minimum_purchase: 1000000,
    maximum_discount: 500000,
    target_audience: 'vip_customers',
    target_products: 'all_products',
    start_date: '2024-03-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    status: 'active',
    usage_count: 145,
    total_sales: 567800000,
    total_discount_given: 145600000,
    conversion_rate: 42.7,
    created_by: 'CRM Manager',
    updated_by: 'Rina CRM',
    created_at: '2024-02-20T14:00:00Z',
    updated_at: '2024-07-23T10:45:00Z'
  },
  {
    id: '5',
    promotion_code: 'FREESHIP100',
    promotion_name: 'Free Shipping Campaign',
    promotion_type: 'free_shipping',
    discount_value: 0,
    minimum_purchase: 300000,
    target_audience: 'all_customers',
    target_products: 'all_products',
    start_date: '2024-05-01T00:00:00Z',
    end_date: '2024-09-30T23:59:59Z',
    status: 'active',
    usage_count: 2156,
    total_sales: 1234500000,
    total_discount_given: 43120000,
    conversion_rate: 15.3,
    created_by: 'E-commerce Manager',
    updated_by: 'Dedi Ecommerce',
    created_at: '2024-04-25T08:30:00Z',
    updated_at: '2024-07-25T11:00:00Z'
  },
  {
    id: '6',
    promotion_code: 'BUNDLE2024',
    promotion_name: 'Product Bundle Deal',
    promotion_type: 'bundle',
    discount_value: 20,
    minimum_purchase: 800000,
    target_audience: 'all_customers',
    target_products: 'specific_categories',
    start_date: '2024-06-15T00:00:00Z',
    end_date: '2024-08-15T23:59:59Z',
    status: 'paused',
    usage_limit: 200,
    usage_count: 67,
    total_sales: 89600000,
    total_discount_given: 15400000,
    conversion_rate: 12.8,
    created_by: 'Sales Manager',
    updated_by: 'Lisa Sales',
    created_at: '2024-06-10T13:20:00Z',
    updated_at: '2024-07-20T09:15:00Z'
  },
  {
    id: '7',
    promotion_code: 'CASHBACK10',
    promotion_name: 'Cashback Rewards',
    promotion_type: 'cashback',
    discount_value: 10,
    minimum_purchase: 1500000,
    maximum_discount: 150000,
    target_audience: 'vip_customers',
    target_products: 'all_products',
    start_date: '2024-04-01T00:00:00Z',
    end_date: '2024-07-31T23:59:59Z',
    status: 'completed',
    usage_limit: 300,
    usage_count: 298,
    total_sales: 678900000,
    total_discount_given: 44200000,
    conversion_rate: 28.9,
    created_by: 'Finance Manager',
    updated_by: 'Ahmad Finance',
    created_at: '2024-03-25T15:45:00Z',
    updated_at: '2024-07-31T23:59:59Z'
  },
  {
    id: '8',
    promotion_code: 'FLASH24H',
    promotion_name: '24 Hour Flash Sale',
    promotion_type: 'percentage',
    discount_value: 40,
    minimum_purchase: 250000,
    maximum_discount: 300000,
    target_audience: 'all_customers',
    target_products: 'specific_items',
    start_date: '2024-07-25T00:00:00Z',
    end_date: '2024-07-26T23:59:59Z',
    status: 'active',
    usage_limit: 100,
    usage_count: 89,
    total_sales: 67800000,
    total_discount_given: 23400000,
    conversion_rate: 45.6,
    created_by: 'Marketing Manager',
    updated_by: 'Sari Marketing',
    created_at: '2024-07-24T20:00:00Z',
    updated_at: '2024-07-25T18:30:00Z'
  },
  {
    id: '9',
    promotion_code: 'BIRTHDAY20',
    promotion_name: 'Birthday Special Discount',
    promotion_type: 'percentage',
    discount_value: 20,
    minimum_purchase: 300000,
    maximum_discount: 100000,
    target_audience: 'specific_group',
    target_products: 'all_products',
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    status: 'active',
    usage_count: 567,
    total_sales: 234600000,
    total_discount_given: 45600000,
    conversion_rate: 22.1,
    created_by: 'CRM Manager',
    updated_by: 'Budi CRM',
    created_at: '2023-12-28T12:00:00Z',
    updated_at: '2024-07-22T14:20:00Z'
  },
  {
    id: '10',
    promotion_code: 'STUDENT15',
    promotion_name: 'Student Discount Program',
    promotion_type: 'percentage',
    discount_value: 15,
    minimum_purchase: 150000,
    maximum_discount: 75000,
    target_audience: 'specific_group',
    target_products: 'specific_categories',
    start_date: '2024-02-01T00:00:00Z',
    end_date: '2024-11-30T23:59:59Z',
    status: 'cancelled',
    usage_count: 123,
    total_sales: 45600000,
    total_discount_given: 6800000,
    conversion_rate: 8.7,
    created_by: 'Marketing Manager',
    updated_by: 'Rina Marketing',
    created_at: '2024-01-25T16:30:00Z',
    updated_at: '2024-06-15T10:00:00Z'
  }
]

export default function SalesPromotionsPage() {
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [audienceFilter, setAudienceFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const formatCurrency = (amount: number): string => {
    if (!mounted) return ''
    return amount.toLocaleString('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  const breadcrumbs = [
    { label: 'Sales', href: '/sales' },
    { label: 'Promotions', href: '/sales/promotions' }
  ]

  // Filter promotions
  const filteredPromotions = mockPromotions.filter(promotion => {
    if (searchTerm && !promotion.promotion_code.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !promotion.promotion_name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (typeFilter !== 'all' && promotion.promotion_type !== typeFilter) return false
    if (statusFilter !== 'all' && promotion.status !== statusFilter) return false
    if (audienceFilter !== 'all' && promotion.target_audience !== audienceFilter) return false
    return true
  })

  // Sort promotions by total sales (highest first)
  const sortedPromotions = [...filteredPromotions].sort((a, b) => b.total_sales - a.total_sales)

  // Summary statistics
  const summaryStats = {
    totalPromotions: mockPromotions.length,
    activePromotions: mockPromotions.filter(p => p.status === 'active').length,
    completedPromotions: mockPromotions.filter(p => p.status === 'completed').length,
    totalSales: mockPromotions.reduce((sum, p) => sum + p.total_sales, 0),
    totalDiscountGiven: mockPromotions.reduce((sum, p) => sum + p.total_discount_given, 0),
    totalUsageCount: mockPromotions.reduce((sum, p) => sum + p.usage_count, 0),
    averageConversionRate: mockPromotions.reduce((sum, p) => sum + p.conversion_rate, 0) / mockPromotions.length
  }

  const getTypeBadge = (type: string) => {
    const config = {
      percentage: { variant: 'default' as const, label: 'Percentage', icon: Percent },
      fixed_amount: { variant: 'secondary' as const, label: 'Fixed Amount', icon: CurrencyDollar },
      buy_one_get_one: { variant: 'outline' as const, label: 'BOGO', icon: Gift },
      bundle: { variant: 'secondary' as const, label: 'Bundle', icon: Package },
      free_shipping: { variant: 'outline' as const, label: 'Free Ship', icon: Target },
      cashback: { variant: 'default' as const, label: 'Cashback', icon: CurrencyDollar }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type, icon: Tag }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: Clock },
      active: { variant: 'default' as const, label: 'Active', icon: CheckCircle },
      paused: { variant: 'outline' as const, label: 'Paused', icon: Clock },
      completed: { variant: 'default' as const, label: 'Completed', icon: CheckCircle },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled', icon: WarningCircle }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status, icon: Clock }
  }

  const getAudienceBadge = (audience: string) => {
    const config = {
      all_customers: { variant: 'default' as const, label: 'All Customers' },
      new_customers: { variant: 'secondary' as const, label: 'New Customers' },
      vip_customers: { variant: 'outline' as const, label: 'VIP Customers' },
      specific_group: { variant: 'secondary' as const, label: 'Specific Group' }
    }
    return config[audience as keyof typeof config] || { variant: 'secondary' as const, label: audience }
  }

  const getPerformanceColor = (conversionRate: number) => {
    if (conversionRate >= 30) return 'text-green-600'
    if (conversionRate >= 20) return 'text-blue-600'
    if (conversionRate >= 10) return 'text-orange-600'
    return 'text-red-600'
  }

  const columns = [
    {
      key: 'promotion_code',
      title: 'Promotion Code',
      render: (promotion: SalesPromotion) => (
        <Link 
          href={`/sales/promotions/${promotion.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {promotion.promotion_code}
        </Link>
      )
    },
    {
      key: 'promotion_name',
      title: 'Name',
      render: (promotion: SalesPromotion) => (
        <div>
          <div className="font-medium">{promotion.promotion_name}</div>
          <div className="text-sm text-muted-foreground">
            {promotion.promotion_type === 'percentage' && `${promotion.discount_value}% off`}
            {promotion.promotion_type === 'fixed_amount' && formatCurrency(promotion.discount_value)}
            {promotion.promotion_type === 'buy_one_get_one' && 'Buy 1 Get 1'}
            {promotion.promotion_type === 'bundle' && `${promotion.discount_value}% bundle`}
            {promotion.promotion_type === 'free_shipping' && 'Free shipping'}
            {promotion.promotion_type === 'cashback' && `${promotion.discount_value}% cashback`}
          </div>
        </div>
      )
    },
    {
      key: 'promotion_type',
      title: 'Type',
      render: (promotion: SalesPromotion) => {
        const { variant, label, icon: Icon } = getTypeBadge(promotion.promotion_type)
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'target_audience',
      title: 'Audience',
      render: (promotion: SalesPromotion) => {
        const { variant, label } = getAudienceBadge(promotion.target_audience)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'usage_performance',
      title: 'Usage',
      render: (promotion: SalesPromotion) => (
        <div className="text-center">
          <div className="font-medium">{promotion.usage_count}</div>
          {promotion.usage_limit && (
            <div className="text-sm text-muted-foreground">
              of {promotion.usage_limit} ({((promotion.usage_count / promotion.usage_limit) * 100).toFixed(0)}%)
            </div>
          )}
        </div>
      )
    },
    {
      key: 'conversion_rate',
      title: 'Conversion',
      render: (promotion: SalesPromotion) => (
        <div className={`text-center font-medium ${getPerformanceColor(promotion.conversion_rate)}`}>
          {mounted ? `${promotion.conversion_rate.toFixed(1)}%` : ''}
        </div>
      )
    },
    {
      key: 'total_sales',
      title: 'Sales Generated',
      render: (promotion: SalesPromotion) => (
        <span className="font-medium text-green-600">
          {mounted ? `${(promotion.total_sales / 1000000).toFixed(0)}M` : ''}
        </span>
      )
    },
    {
      key: 'duration',
      title: 'Duration',
      render: (promotion: SalesPromotion) => (
        <div className="text-sm">
          <div>{formatDate(promotion.start_date)}</div>
          <div className="text-muted-foreground">to {formatDate(promotion.end_date)}</div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (promotion: SalesPromotion) => {
        const { variant, label, icon: Icon } = getStatusBadge(promotion.status)
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (promotion: SalesPromotion) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/sales/promotions/${promotion.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/sales/promotions/${promotion.id}/edit`}>
              <PencilSimple className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Sales Promotions"
          description="Manage promotional campaigns and track performance"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <DownloadSimple className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/sales/promotions/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Promotion
                </Link>
              </Button>
            </div>
          }
        />

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalPromotions}</p>
                <p className="text-sm text-blue-600 mt-1">All promotions</p>
              </div>
              <Gift className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{summaryStats.activePromotions}</p>
                <p className="text-sm text-green-600 mt-1">Running now</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{summaryStats.completedPromotions}</p>
                <p className="text-sm text-orange-600 mt-1">Finished</p>
              </div>
              <Star className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sales Generated</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${(summaryStats.totalSales / 1000000000).toFixed(1)}B` : ''}
                </p>
                <p className="text-sm text-purple-600 mt-1">IDR revenue</p>
              </div>
              <TrendUp className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Discount Given</p>
                <p className="text-2xl font-bold mt-1 text-red-600">
                  {mounted ? `${(summaryStats.totalDiscountGiven / 1000000).toFixed(0)}M` : ''}
                </p>
                <p className="text-sm text-red-600 mt-1">Cost of promo</p>
              </div>
              <CurrencyDollar className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usage</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${(summaryStats.totalUsageCount / 1000).toFixed(1)}K` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">Times used</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Conversion</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${summaryStats.averageConversionRate.toFixed(1)}%` : ''}
                </p>
                <p className="text-sm text-gray-600 mt-1">Effectiveness</p>
              </div>
              <ChartBar className="h-8 w-8 text-gray-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Funnel className="h-5 w-5 text-muted-foreground" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search promotions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Promotion Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                    <SelectItem value="buy_one_get_one">BOGO</SelectItem>
                    <SelectItem value="bundle">Bundle</SelectItem>
                    <SelectItem value="free_shipping">Free Shipping</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All audiences" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All audiences</SelectItem>
                    <SelectItem value="all_customers">All Customers</SelectItem>
                    <SelectItem value="new_customers">New Customers</SelectItem>
                    <SelectItem value="vip_customers">VIP Customers</SelectItem>
                    <SelectItem value="specific_group">Specific Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeView === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('cards')}
            >
              Cards
            </Button>
            <Button
              variant={activeView === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('table')}
            >
              Table
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {sortedPromotions.length} of {mockPromotions.length} promotions
          </div>
        </div>

        {/* Content */}
        {activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPromotions.map((promotion) => {
              const { variant: typeVariant, label: typeLabel, icon: TypeIcon } = getTypeBadge(promotion.promotion_type)
              const { variant: statusVariant, label: statusLabel, icon: StatusIcon } = getStatusBadge(promotion.status)
              const { variant: audienceVariant, label: audienceLabel } = getAudienceBadge(promotion.target_audience)
              
              return (
                <Card key={promotion.id} className="p-6 hover: transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <Gift className="h-5 w-5 text-blue-600" />
                      <div>
                        <Link 
                          href={`/sales/promotions/${promotion.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {promotion.promotion_code}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {promotion.promotion_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-1">
                        <StatusIcon className="h-4 w-4" />
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <div className="flex items-center space-x-1">
                        <TypeIcon className="h-4 w-4" />
                        <Badge variant={typeVariant}>{typeLabel}</Badge>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Discount:</span>
                      <span className="text-sm font-semibold text-green-600">
                        {promotion.promotion_type === 'percentage' && `${promotion.discount_value}%`}
                        {promotion.promotion_type === 'fixed_amount' && formatCurrency(promotion.discount_value)}
                        {promotion.promotion_type === 'buy_one_get_one' && 'Buy 1 Get 1'}
                        {promotion.promotion_type === 'bundle' && `${promotion.discount_value}%`}
                        {promotion.promotion_type === 'free_shipping' && 'Free Shipping'}
                        {promotion.promotion_type === 'cashback' && `${promotion.discount_value}%`}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Audience:</span>
                      <Badge variant={audienceVariant}>{audienceLabel}</Badge>
                    </div>

                    {promotion.minimum_purchase && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Min Purchase:</span>
                        <span className="text-sm">{formatCurrency(promotion.minimum_purchase)}</span>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Usage:</span>
                        <span className="text-sm font-medium">
                          {promotion.usage_count}
                          {promotion.usage_limit && ` / ${promotion.usage_limit}`}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Conversion:</span>
                        <span className={`text-sm font-medium ${getPerformanceColor(promotion.conversion_rate)}`}>
                          {mounted ? `${promotion.conversion_rate.toFixed(1)}%` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Sales:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {mounted ? `${(promotion.total_sales / 1000000).toFixed(0)}M` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-3 text-sm text-muted-foreground">
                      <div>Start: {formatDate(promotion.start_date)}</div>
                      <div>End: {formatDate(promotion.end_date)}</div>
                    </div>

                    <div className="flex space-x-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/sales/promotions/${promotion.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/sales/promotions/${promotion.id}/edit`}>
                          <PencilSimple className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Sales Promotions</h3>
              <p className="text-sm text-muted-foreground">Manage all promotional campaigns and track their performance</p>
            </div>
            <AdvancedDataTable
              data={sortedPromotions}
              columns={columns}
              searchable={false}
              filterable={false}
              pagination={{
                pageSize: 15,
                currentPage: 1,
                totalPages: Math.ceil(sortedPromotions.length / 15),
                totalItems: sortedPromotions.length,
                onChange: () => {}
              }}
            />
          </Card>
        )}

        {/* Low Performance Alert */}
        {mockPromotions.filter(p => p.conversion_rate < 10 && p.status === 'active').length > 0 && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <WarningCircle className="h-6 w-6 text-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">Low Performance Promotions</h3>
                <p className="text-red-700 mt-1">
                  {mockPromotions.filter(p => p.conversion_rate < 10 && p.status === 'active').length} active promotions have conversion rates below 10% and may need optimization.
                </p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Review Campaigns
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}