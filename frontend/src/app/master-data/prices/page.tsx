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
import { 
  DollarSign,
  Plus,
  Eye,
  Edit,
  Filter,
  Download,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Hash,
  Target,
  Percent,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { priceService } from '@/services/masterdata'
import { Price, MasterDataFilters } from '@/types/masterdata'

// Extended Price interface for frontend display
interface ProductPrice extends Price {
  product_name?: string
  article_code?: string
  size?: string
  color?: string
  price_type?: 'retail' | 'wholesale' | 'distributor' | 'special' | 'promo'
  base_price?: number
  selling_price?: number
  discount_percent?: number
  margin_percent?: number
  customer_group?: string
  min_quantity?: number
  max_quantity?: number
  valid_from?: string
  valid_until?: string
  is_active?: boolean
  is_default?: boolean
  sales_count?: number
  revenue_total?: number
  created_by?: string
  updated_by?: string
}

const mockPrices: ProductPrice[] = [
  {
    id: '1',
    price_code: 'RETAIL-001',
    product_id: 'PRD-001',
    product_name: 'Classic Oxford Dress Shoes',
    article_code: 'ART-OXFORD-001',
    size: '42',
    color: 'Black',
    price_type: 'retail',
    base_price: 1000000,
    selling_price: 1250000,
    discount_percent: 0,
    margin_percent: 25,
    min_quantity: 1,
    valid_from: '2024-01-01T00:00:00Z',
    is_active: true,
    is_default: true,
    sales_count: 456,
    revenue_total: 570000000,
    created_by: 'Admin User',
    updated_by: 'Ahmad Manager',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-07-25T10:15:00Z'
  },
  {
    id: '2',
    price_code: 'WHOLESALE-001',
    product_id: 'PRD-001',
    product_name: 'Classic Oxford Dress Shoes',
    article_code: 'ART-OXFORD-001',
    size: '42',
    color: 'Black',
    price_type: 'wholesale',
    base_price: 1000000,
    selling_price: 1100000,
    discount_percent: 0,
    margin_percent: 10,
    customer_group: 'Wholesale Partners',
    min_quantity: 10,
    max_quantity: 100,
    valid_from: '2024-01-01T00:00:00Z',
    is_active: true,
    is_default: false,
    sales_count: 234,
    revenue_total: 257400000,
    created_by: 'Admin User',
    updated_by: 'Sari Manager',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-07-24T16:20:00Z'
  },
  {
    id: '3',
    price_code: 'PROMO-SUMMER',
    product_id: 'PRD-002',
    product_name: 'Sport Running Sneakers',
    article_code: 'ART-SPORT-002',
    size: '40',
    color: 'White',
    price_type: 'promo',
    base_price: 750000,
    selling_price: 650000,
    discount_percent: 13.33,
    margin_percent: -13.33,
    min_quantity: 1,
    valid_from: '2024-06-01T00:00:00Z',
    valid_until: '2024-08-31T23:59:59Z',
    is_active: true,
    is_default: false,
    sales_count: 678,
    revenue_total: 440700000,
    created_by: 'Admin User',
    updated_by: 'Budi Manager',
    created_at: '2024-05-20T09:15:00Z',
    updated_at: '2024-07-25T12:10:00Z'
  },
  {
    id: '4',
    price_code: 'DIST-001',
    product_id: 'PRD-003',
    product_name: 'Casual Loafers',
    article_code: 'ART-LOAFER-003',
    size: '39',
    color: 'Brown',
    price_type: 'distributor',
    base_price: 600000,
    selling_price: 690000,
    discount_percent: 0,
    margin_percent: 15,
    customer_group: 'Distributors',
    min_quantity: 50,
    valid_from: '2024-02-01T00:00:00Z',
    is_active: true,
    is_default: false,
    sales_count: 145,
    revenue_total: 100050000,
    created_by: 'Admin User',
    updated_by: 'Rina Manager',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-07-22T11:30:00Z'
  },
  {
    id: '5',
    price_code: 'SPECIAL-VIP',
    product_id: 'PRD-004',
    product_name: 'High Heel Pumps',
    article_code: 'ART-HEEL-004',
    size: '37',
    color: 'Red',
    price_type: 'special',
    base_price: 1200000,
    selling_price: 1380000,
    discount_percent: 0,
    margin_percent: 15,
    customer_group: 'VIP Customers',
    min_quantity: 1,
    valid_from: '2024-01-01T00:00:00Z',
    is_active: true,
    is_default: false,
    sales_count: 89,
    revenue_total: 122820000,
    created_by: 'Admin User',
    updated_by: 'Dedi Manager',
    created_at: '2024-02-10T11:30:00Z',
    updated_at: '2024-07-21T17:20:00Z'
  },
  {
    id: '6',
    price_code: 'RETAIL-002',
    product_id: 'PRD-005',
    product_name: 'Canvas Sneakers',
    article_code: 'ART-CANVAS-005',
    size: '38',
    color: 'Blue',
    price_type: 'retail',
    base_price: 500000,
    selling_price: 650000,
    discount_percent: 0,
    margin_percent: 30,
    min_quantity: 1,
    valid_from: '2024-02-15T00:00:00Z',
    is_active: true,
    is_default: true,
    sales_count: 567,
    revenue_total: 368550000,
    created_by: 'Admin User',
    updated_by: 'Lisa Manager',
    created_at: '2024-02-15T14:45:00Z',
    updated_at: '2024-07-20T14:15:00Z'
  },
  {
    id: '7',
    price_code: 'WHOLESALE-002',
    product_id: 'PRD-005',
    product_name: 'Canvas Sneakers',
    article_code: 'ART-CANVAS-005',
    size: '38',
    color: 'Blue',
    price_type: 'wholesale',
    base_price: 500000,
    selling_price: 575000,
    discount_percent: 0,
    margin_percent: 15,
    customer_group: 'Wholesale Partners',
    min_quantity: 12,
    valid_from: '2024-02-15T00:00:00Z',
    is_active: true,
    is_default: false,
    sales_count: 288,
    revenue_total: 165600000,
    created_by: 'Admin User',
    updated_by: 'Ahmad Manager',
    created_at: '2024-02-15T14:45:00Z',
    updated_at: '2024-07-19T10:45:00Z'
  },
  {
    id: '8',
    price_code: 'RETAIL-BELT',
    product_id: 'PRD-006',
    product_name: 'Leather Belt Classic',
    article_code: 'ART-BELT-006',
    size: 'M',
    color: 'Black',
    price_type: 'retail',
    base_price: 250000,
    selling_price: 350000,
    discount_percent: 0,
    margin_percent: 40,
    min_quantity: 1,
    valid_from: '2024-03-01T00:00:00Z',
    is_active: true,
    is_default: true,
    sales_count: 234,
    revenue_total: 81900000,
    created_by: 'Admin User',
    updated_by: 'Sari Manager',
    created_at: '2024-03-01T08:20:00Z',
    updated_at: '2024-07-18T12:30:00Z'
  },
  {
    id: '9',
    price_code: 'PROMO-WALLET',
    product_id: 'PRD-007',
    product_name: 'Premium Wallet',
    article_code: 'ART-WALLET-007',
    size: 'One Size',
    color: 'Brown',
    price_type: 'promo',
    base_price: 400000,
    selling_price: 320000,
    discount_percent: 20,
    margin_percent: -20,
    min_quantity: 1,
    valid_from: '2024-07-01T00:00:00Z',
    valid_until: '2024-07-31T23:59:59Z',
    is_active: true,
    is_default: false,
    sales_count: 156,
    revenue_total: 49920000,
    created_by: 'Admin User',
    updated_by: 'Budi Manager',
    created_at: '2024-06-25T12:00:00Z',
    updated_at: '2024-07-17T09:20:00Z'
  },
  {
    id: '10',
    price_code: 'RETAIL-BOOT',
    product_id: 'PRD-008',
    product_name: 'Winter Boots',
    article_code: 'ART-BOOT-008',
    size: '44',
    color: 'Brown',
    price_type: 'retail',
    base_price: 1500000,
    selling_price: 1890000,
    discount_percent: 0,
    margin_percent: 26,
    min_quantity: 1,
    valid_from: '2024-04-01T00:00:00Z',
    is_active: false,
    is_default: true,
    sales_count: 23,
    revenue_total: 43470000,
    created_by: 'Admin User',
    updated_by: 'Rina Manager',
    created_at: '2024-04-01T09:30:00Z',
    updated_at: '2024-06-20T15:10:00Z'
  },
  {
    id: '11',
    price_code: 'SPECIAL-SAFETY',
    product_id: 'PRD-009',
    product_name: 'Work Safety Shoes',
    article_code: 'ART-SAFETY-009',
    size: '42',
    color: 'Black',
    price_type: 'special',
    base_price: 800000,
    selling_price: 920000,
    discount_percent: 0,
    margin_percent: 15,
    customer_group: 'Corporate Clients',
    min_quantity: 20,
    valid_from: '2024-04-15T00:00:00Z',
    is_active: true,
    is_default: false,
    sales_count: 178,
    revenue_total: 163760000,
    created_by: 'Admin User',
    updated_by: 'Dedi Manager',
    created_at: '2024-04-15T10:15:00Z',
    updated_at: '2024-07-16T17:15:00Z'
  },
  {
    id: '12',
    price_code: 'RETAIL-SANDAL',
    product_id: 'PRD-010',
    product_name: 'Fashion Sandals',
    article_code: 'ART-SANDAL-010',
    size: '36',
    color: 'Pink',
    price_type: 'retail',
    base_price: 400000,
    selling_price: 550000,
    discount_percent: 0,
    margin_percent: 37.5,
    min_quantity: 1,
    valid_from: '2024-05-01T00:00:00Z',
    is_active: true,
    is_default: true,
    sales_count: 89,
    revenue_total: 48950000,
    created_by: 'Admin User',
    updated_by: 'Lisa Manager',
    created_at: '2024-05-01T11:45:00Z',
    updated_at: '2024-07-15T11:30:00Z'
  }
]

export default function ProductPricesPage() {
  const [mounted, setMounted] = useState(false)
  const [prices, setPrices] = useState<ProductPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [marginFilter, setMarginFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch prices from API
  const fetchPrices = async () => {
    try {
      setLoading(true)
      const response = await priceService.getAll()
      console.log('Prices response:', response)
      setPrices(response.data)
    } catch (error) {
      console.error('Error fetching prices:', error)
      setPrices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
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
    { label: 'Master Data', href: '/master-data' },
    { label: 'Prices', href: '/master-data/prices' }
  ]

  // Filter prices
  const filteredPrices = prices.filter(price => {
    if (searchTerm && !price.code?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !price.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !price.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (typeFilter !== 'all' && price.price_type !== typeFilter) return false
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && price.status !== 'active') return false
      if (statusFilter === 'inactive' && price.status !== 'active') return false
      if (statusFilter === 'default' && !price.is_default) return false
      if (statusFilter === 'expired' && (!price.valid_until || new Date(price.valid_until) > new Date())) return false
    }
    if (marginFilter !== 'all') {
      if (marginFilter === 'high' && (price.margin_percent || 0) < 20) return false
      if (marginFilter === 'medium' && ((price.margin_percent || 0) < 10 || (price.margin_percent || 0) >= 20)) return false
      if (marginFilter === 'low' && (price.margin_percent || 0) >= 10) return false
      if (marginFilter === 'negative' && (price.margin_percent || 0) >= 0) return false
    }
    return true
  })

  // Sort prices by revenue (highest first)
  const sortedPrices = [...filteredPrices].sort((a, b) => (b.revenue_total || 0) - (a.revenue_total || 0))

  // Summary statistics
  const summaryStats = {
    totalPrices: prices.length,
    activePrices: prices.filter(p => p.status === 'active').length,
    defaultPrices: prices.filter(p => p.is_default).length,
    totalRevenue: prices.reduce((sum, p) => sum + (p.revenue_total || 0), 0),
    averageMargin: prices.length > 0 ? prices.reduce((sum, p) => sum + (p.margin_percent || 0), 0) / prices.length : 0,
    highMarginCount: prices.filter(p => (p.margin_percent || 0) >= 20).length,
    topPrice: prices.length > 0 ? prices.reduce((prev, curr) => 
      (prev.revenue_total || 0) > (curr.revenue_total || 0) ? prev : curr, prices[0]) : null
  }

  const getTypeBadge = (type: string) => {
    const config = {
      retail: { variant: 'default' as const, label: 'Retail' },
      wholesale: { variant: 'secondary' as const, label: 'Wholesale' },
      distributor: { variant: 'outline' as const, label: 'Distributor' },
      special: { variant: 'secondary' as const, label: 'Special' },
      promo: { variant: 'destructive' as const, label: 'Promo' }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type }
  }

  const getStatusBadge = (status: string, validUntil?: string) => {
    if (status !== 'active') {
      return { variant: 'destructive' as const, label: 'Inactive', icon: AlertCircle }
    }
    if (validUntil && new Date(validUntil) <= new Date()) {
      return { variant: 'secondary' as const, label: 'Expired', icon: Clock }
    }
    return { variant: 'default' as const, label: 'Active', icon: CheckCircle }
  }

  const getDefaultBadge = (isDefault: boolean) => {
    return isDefault 
      ? { variant: 'default' as const, label: 'Default', icon: Target }
      : { variant: 'outline' as const, label: 'Alternative', icon: Hash }
  }

  const getMarginColor = (margin: number) => {
    if (margin >= 20) return 'text-green-600'
    if (margin >= 10) return 'text-blue-600'
    if (margin >= 0) return 'text-orange-600'
    return 'text-red-600'
  }

  const columns = [
    {
      key: 'price_code',
      title: 'Price Code',
      render: (price: ProductPrice) => (
        <Link 
          href={`/master-data/prices/${price.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {price.price_code}
        </Link>
      )
    },
    {
      key: 'price_type',
      title: 'Type',
      render: (price: ProductPrice) => {
        const { variant, label } = getTypeBadge(price.price_type)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'product_name',
      title: 'Product',
      render: (price: ProductPrice) => (
        <div>
          <div className="font-medium">{price.product_name}</div>
          <div className="text-sm text-muted-foreground">{price.article_code}</div>
          <div className="text-sm text-muted-foreground">{price.size} - {price.color}</div>
        </div>
      )
    },
    {
      key: 'base_price',
      title: 'Base Price',
      render: (price: ProductPrice) => (
        <span className="font-medium">{formatCurrency(price.base_price)}</span>
      )
    },
    {
      key: 'selling_price',
      title: 'Selling Price',
      render: (price: ProductPrice) => (
        <span className="font-semibold text-green-600">{formatCurrency(price.selling_price)}</span>
      )
    },
    {
      key: 'margin_percent',
      title: 'Margin',
      render: (price: ProductPrice) => (
        <div className="flex items-center space-x-2">
          <Percent className="h-4 w-4 text-muted-foreground" />
          <span className={`font-medium ${getMarginColor(price.margin_percent)}`}>
            {mounted ? `${price.margin_percent.toFixed(1)}%` : ''}
          </span>
        </div>
      )
    },
    {
      key: 'customer_group',
      title: 'Customer Group',
      render: (price: ProductPrice) => (
        <span className="text-sm">{price.customer_group || 'All Customers'}</span>
      )
    },
    {
      key: 'min_quantity',
      title: 'Min Qty',
      render: (price: ProductPrice) => (
        <span className="font-medium">{price.min_quantity}</span>
      )
    },
    {
      key: 'revenue_total',
      title: 'Revenue',
      render: (price: ProductPrice) => (
        <span className="font-medium text-green-600">
          {mounted ? formatCurrency(price.revenue_total) : ''}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (price: ProductPrice) => {
        const { variant, label, icon: Icon } = getStatusBadge(price.is_active, price.valid_until)
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
      render: (price: ProductPrice) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/master-data/prices/${price.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/master-data/prices/${price.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Product Prices"
        description="Manage product pricing and customer-specific rates"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" asChild>
              <Link href="/master-data/prices/new">
                <Plus className="h-4 w-4 mr-2" />
                New Price
              </Link>
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Prices</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalPrices}</p>
                <p className="text-sm text-blue-600 mt-1">Price rules</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{summaryStats.activePrices}</p>
                <p className="text-sm text-green-600 mt-1">In use</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Default</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{summaryStats.defaultPrices}</p>
                <p className="text-sm text-orange-600 mt-1">Primary prices</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Margin</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {mounted ? `${summaryStats.averageMargin.toFixed(1)}%` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">Profit margin</p>
              </div>
              <Percent className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <DollarSign className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="distributor">Distributor</SelectItem>
                <SelectItem value="special">Special</SelectItem>
                <SelectItem value="promo">Promo</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <CheckCircle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={marginFilter} onValueChange={setMarginFilter}>
              <SelectTrigger className="w-36">
                <Percent className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Margin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All margins</SelectItem>
                <SelectItem value="high">High (≥20%)</SelectItem>
                <SelectItem value="medium">Medium (10-19%)</SelectItem>
                <SelectItem value="low">Low (0-9%)</SelectItem>
                <SelectItem value="negative">Negative (&lt;0%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
            {sortedPrices.length} of {mockPrices.length} prices
          </div>
        </div>

        {/* Content */}
        {activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPrices.map((price) => {
              const { variant: typeVariant, label: typeLabel } = getTypeBadge(price.price_type)
              const { variant: statusVariant, label: statusLabel, icon: StatusIcon } = getStatusBadge(price.is_active, price.valid_until)
              const { variant: defaultVariant, label: defaultLabel, icon: DefaultIcon } = getDefaultBadge(price.is_default)
              
              return (
                <Card key={price.id} className="p-6 hover: transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <Link 
                          href={`/master-data/prices/${price.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {price.price_code}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {price.product_name}
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
                      <Badge variant={typeVariant}>{typeLabel}</Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Priority:</span>
                      <Badge variant={defaultVariant}>{defaultLabel}</Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Article:</span>
                      <span className="text-sm font-mono">{price.article_code}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Variant:</span>
                      <span className="text-sm">{price.size} - {price.color}</span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Base Price:</span>
                        <span className="text-sm font-medium">{formatCurrency(price.base_price)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Selling Price:</span>
                        <span className="text-sm font-semibold text-green-600">{formatCurrency(price.selling_price)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Margin:</span>
                        <span className={`text-sm font-medium ${getMarginColor(price.margin_percent)}`}>
                          {mounted ? `${price.margin_percent.toFixed(1)}%` : ''}
                        </span>
                      </div>
                    </div>

                    {price.customer_group && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Customer Group:</span>
                        <span className="text-sm">{price.customer_group}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Min Quantity:</span>
                      <span className="text-sm font-medium">{price.min_quantity}</span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sales:</span>
                        <span className="text-sm font-medium">{price.sales_count} items</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Revenue:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {mounted ? `${(price.revenue_total / 1000000).toFixed(1)}M` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/master-data/prices/${price.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/master-data/prices/${price.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <AdvancedDataTable
            data={sortedPrices}
            columns={columns}
            searchable={false}
            filterable={false}
            pagination={{
              pageSize: 15,
              currentPage: 1,
              totalPages: Math.ceil(sortedPrices.length / 15),
              totalItems: sortedPrices.length,
              onChange: () => {}
            }}
          />
        )}

        {/* Negative Margin Alert */}
        {mockPrices.filter(p => p.margin_percent < 0 && p.is_active).length > 0 && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">Negative Margin Prices</h3>
                <p className="text-red-700 mt-1">
                  {mockPrices.filter(p => p.margin_percent < 0 && p.is_active).length} active prices have negative margins and may need review.
                </p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Review Prices
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}