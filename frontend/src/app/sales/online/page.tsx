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

// Online Sales types
interface OnlineSale {
  id: string
  order_number: string
  order_date: string
  platform: 'website' | 'marketplace' | 'social_media' | 'mobile_app'
  platform_name: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  items: OnlineItem[]
  subtotal: number
  shipping_cost: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: string
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  tracking_number?: string
  estimated_delivery?: string
  notes?: string
  created_at: string
  updated_at: string
}

interface OnlineItem {
  id: string
  product_code: string
  product_name: string
  size: string
  color: string
  quantity: number
  unit_price: number
  discount_percentage: number
  line_total: number
}

const mockOnlineSales: OnlineSale[] = [
  {
    id: '1',
    order_number: 'ON-2024-001',
    order_date: '2024-07-25',
    platform: 'website',
    platform_name: 'Official Website',
    customer_name: 'Ahmad Rizki',
    customer_email: 'ahmad.rizki@email.com',
    customer_phone: '08123456789',
    shipping_address: 'Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 10110',
    items: [
      {
        id: '1',
        product_code: 'SHOE-001',
        product_name: 'Classic Oxford Brown',
        size: '42',
        color: 'Brown',
        quantity: 1,
        unit_price: 350000,
        discount_percentage: 0,
        line_total: 350000
      },
      {
        id: '2',
        product_code: 'BELT-001',
        product_name: 'Leather Belt Brown',
        size: 'L',
        color: 'Brown',
        quantity: 1,
        unit_price: 120000,
        discount_percentage: 0,
        line_total: 120000
      }
    ],
    subtotal: 470000,
    shipping_cost: 25000,
    tax_amount: 49500,
    discount_amount: 0,
    total_amount: 544500,
    payment_status: 'paid',
    payment_method: 'Credit Card',
    order_status: 'shipped',
    tracking_number: 'JNE123456789',
    estimated_delivery: '2024-07-27',
    notes: 'Customer requested express delivery',
    created_at: '2024-07-25T08:30:00Z',
    updated_at: '2024-07-25T14:00:00Z'
  },
  {
    id: '2',
    order_number: 'ON-2024-002',
    order_date: '2024-07-25',
    platform: 'marketplace',
    platform_name: 'Tokopedia',
    customer_name: 'Siti Nurhaliza',
    customer_email: 'siti.nur@email.com',
    customer_phone: '08123456788',
    shipping_address: 'Jl. Gatot Subroto No. 456, Bandung, Jawa Barat 40123',
    items: [
      {
        id: '3',
        product_code: 'SHOE-002',
        product_name: 'Sports Sneaker White',
        size: '38',
        color: 'White',
        quantity: 2,
        unit_price: 280000,
        discount_percentage: 10,
        line_total: 504000
      }
    ],
    subtotal: 504000,
    shipping_cost: 18000,
    tax_amount: 52200,
    discount_amount: 56000,
    total_amount: 518200,
    payment_status: 'paid',
    payment_method: 'Bank Transfer',
    order_status: 'processing',
    notes: 'Gift wrapping requested',
    created_at: '2024-07-25T09:15:00Z',
    updated_at: '2024-07-25T10:30:00Z'
  },
  {
    id: '3',
    order_number: 'ON-2024-003',
    order_date: '2024-07-25',
    platform: 'marketplace',
    platform_name: 'Shopee',
    customer_name: 'Budi Santoso',
    customer_email: 'budi.santoso@email.com',
    customer_phone: '08123456787',
    shipping_address: 'Jl. Diponegoro No. 789, Surabaya, Jawa Timur 60234',
    items: [
      {
        id: '4',
        product_code: 'BOOT-001',
        product_name: 'Work Boot Black',
        size: '43',
        color: 'Black',
        quantity: 1,
        unit_price: 450000,
        discount_percentage: 0,
        line_total: 450000
      }
    ],
    subtotal: 450000,
    shipping_cost: 22000,
    tax_amount: 47200,
    discount_amount: 0,
    total_amount: 519200,
    payment_status: 'pending',
    payment_method: 'COD',
    order_status: 'confirmed',
    estimated_delivery: '2024-07-28',
    created_at: '2024-07-25T11:00:00Z',
    updated_at: '2024-07-25T11:00:00Z'
  },
  {
    id: '4',
    order_number: 'ON-2024-004',
    order_date: '2024-07-24',
    platform: 'social_media',
    platform_name: 'Instagram',
    customer_name: 'Rina Dewi',
    customer_email: 'rina.dewi@email.com',
    customer_phone: '08123456786',
    shipping_address: 'Jl. Ahmad Yani No. 321, Medan, Sumatera Utara 20111',
    items: [
      {
        id: '5',
        product_code: 'SANDAL-001',
        product_name: 'Summer Sandal Brown',
        size: '37',
        color: 'Brown',
        quantity: 1,
        unit_price: 180000,
        discount_percentage: 15,
        line_total: 153000
      },
      {
        id: '6',
        product_code: 'SHOE-003',
        product_name: 'Formal Loafer Black',
        size: '37',
        color: 'Black',
        quantity: 1,
        unit_price: 400000,
        discount_percentage: 0,
        line_total: 400000
      }
    ],
    subtotal: 553000,
    shipping_cost: 35000,
    tax_amount: 58800,
    discount_amount: 27000,
    total_amount: 619800,
    payment_status: 'paid',
    payment_method: 'E-Wallet',
    order_status: 'delivered',
    tracking_number: 'SICEPAT987654',
    created_at: '2024-07-24T13:20:00Z',
    updated_at: '2024-07-24T18:45:00Z'
  },
  {
    id: '5',
    order_number: 'ON-2024-005',
    order_date: '2024-07-24',
    platform: 'mobile_app',
    platform_name: 'Mobile App',
    customer_name: 'Dedi Susanto',
    customer_email: 'dedi.susanto@email.com',
    customer_phone: '08123456785',
    shipping_address: 'Jl. Pahlawan No. 654, Yogyakarta, DI Yogyakarta 55141',
    items: [
      {
        id: '7',
        product_code: 'SHOE-004',
        product_name: 'High Heel Red',
        size: '38',
        color: 'Red',
        quantity: 1,
        unit_price: 320000,
        discount_percentage: 0,
        line_total: 320000
      }
    ],
    subtotal: 320000,
    shipping_cost: 20000,
    tax_amount: 34000,
    discount_amount: 0,
    total_amount: 374000,
    payment_status: 'failed',
    payment_method: 'Credit Card',
    order_status: 'cancelled',
    notes: 'Payment declined by bank',
    created_at: '2024-07-24T16:10:00Z',
    updated_at: '2024-07-24T16:15:00Z'
  }
]

export default function OnlineSalesPage() {
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDateTime = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleString('id-ID')
  }

  const breadcrumbs = [
    { label: 'Sales', href: '/sales' },
    { label: 'Online Sales', href: '/sales/online' }
  ]

  // Filter sales
  const filteredSales = mockOnlineSales.filter(sale => {
    if (searchTerm && !sale.order_number.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !sale.customer_email.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (orderStatusFilter !== 'all' && sale.order_status !== orderStatusFilter) return false
    if (paymentStatusFilter !== 'all' && sale.payment_status !== paymentStatusFilter) return false
    if (platformFilter !== 'all' && sale.platform !== platformFilter) return false
    return true
  })

  // Summary statistics
  const summaryStats = {
    totalOrders: mockOnlineSales.length,
    todayOrders: mockOnlineSales.filter(s => s.order_date === '2024-07-25').length,
    totalRevenue: mockOnlineSales.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.total_amount, 0),
    pendingOrders: mockOnlineSales.filter(s => s.order_status === 'pending' || s.order_status === 'confirmed').length,
    shippedOrders: mockOnlineSales.filter(s => s.order_status === 'shipped').length,
    averageOrderValue: mockOnlineSales.length > 0 ? 
      mockOnlineSales.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.total_amount, 0) / 
      mockOnlineSales.filter(s => s.payment_status === 'paid').length : 0
  }

  const getOrderStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
      confirmed: { variant: 'default' as const, label: 'Confirmed', icon: CheckCircle },
      processing: { variant: 'secondary' as const, label: 'Processing', icon: Package },
      shipped: { variant: 'default' as const, label: 'Shipped', icon: Truck },
      delivered: { variant: 'default' as const, label: 'Delivered', icon: CheckCircle },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled', icon: WarningCircle }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status, icon: Package }
  }

  const getPaymentStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      paid: { variant: 'default' as const, label: 'Paid' },
      failed: { variant: 'destructive' as const, label: 'Failed' },
      refunded: { variant: 'outline' as const, label: 'Refunded' }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status }
  }

  const getPlatformBadge = (platform: string) => {
    const config = {
      website: { variant: 'default' as const, label: 'Website' },
      marketplace: { variant: 'secondary' as const, label: 'Marketplace' },
      social_media: { variant: 'outline' as const, label: 'Social Media' },
      mobile_app: { variant: 'secondary' as const, label: 'Mobile App' }
    }
    return config[platform as keyof typeof config] || { variant: 'secondary' as const, label: platform }
  }

  const columns = [
    {
      key: 'order_number',
      title: 'Order Number',
      render: (sale: OnlineSale) => (
        <Link 
          href={`/sales/online/${sale.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {sale.order_number}
        </Link>
      )
    },
    {
      key: 'order_date',
      title: 'Date',
      render: (sale: OnlineSale) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDateTime(sale.created_at)}</span>
        </div>
      )
    },
    {
      key: 'platform',
      title: 'Platform',
      render: (sale: OnlineSale) => {
        const { variant, label } = getPlatformBadge(sale.platform)
        return (
          <div>
            <Badge variant={variant}>{label}</Badge>
            <div className="text-sm text-muted-foreground mt-1">{sale.platform_name}</div>
          </div>
        )
      }
    },
    {
      key: 'customer',
      title: 'Customer',
      render: (sale: OnlineSale) => (
        <div>
          <div className="font-medium">{sale.customer_name}</div>
          <div className="text-sm text-muted-foreground">{sale.customer_email}</div>
        </div>
      )
    },
    {
      key: 'items',
      title: 'Items',
      render: (sale: OnlineSale) => (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{sale.items.length} items</span>
        </div>
      )
    },
    {
      key: 'total_amount',
      title: 'Total',
      render: (sale: OnlineSale) => (
        <div className="text-right font-medium">
          {formatCurrency(sale.total_amount)}
        </div>
      )
    },
    {
      key: 'payment_status',
      title: 'Payment',
      render: (sale: OnlineSale) => {
        const { variant, label } = getPaymentStatusBadge(sale.payment_status)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'order_status',
      title: 'Status',
      render: (sale: OnlineSale) => {
        const { variant, label, icon: Icon } = getOrderStatusBadge(sale.order_status)
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
      render: (sale: OnlineSale) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/sales/online/${sale.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {(sale.order_status === 'pending' || sale.order_status === 'confirmed') && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/sales/online/${sale.id}/edit`}>
                <PencilSimple className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Online Sales"
          description="Manage e-commerce and digital channel sales"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <DownloadSimple className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/sales/online/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Order
                </Link>
              </Button>
            </div>
          }
        />

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today&apos;s Orders</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.todayOrders}</p>
                <p className="text-sm text-blue-600 mt-1">New orders</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `Rp ${(summaryStats.totalRevenue / 1000000).toFixed(1)}M` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">Online sales</p>
              </div>
              <CurrencyDollar className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{summaryStats.pendingOrders}</p>
                <p className="text-sm text-orange-600 mt-1">Need processing</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shipped</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{summaryStats.shippedOrders}</p>
                <p className="text-sm text-blue-600 mt-1">In transit</p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <Funnel className="h-5 w-5 text-muted-foreground" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderStatus">Order Status</Label>
                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All payments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All platforms</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="marketplace">Marketplace</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="mobile_app">Mobile App</SelectItem>
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
        </div>

        {/* Content */}
        {activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSales.map((sale) => {
              const { variant: orderVariant, label: orderLabel, icon: OrderIcon } = getOrderStatusBadge(sale.order_status)
              const { variant: paymentVariant, label: paymentLabel } = getPaymentStatusBadge(sale.payment_status)
              const { variant: platformVariant, label: platformLabel } = getPlatformBadge(sale.platform)
              
              return (
                <Card key={sale.id} className="p-6 hover: transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link 
                        href={`/sales/online/${sale.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {sale.order_number}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDateTime(sale.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-1">
                        <OrderIcon className="h-4 w-4" />
                        <Badge variant={orderVariant}>{orderLabel}</Badge>
                      </div>
                      <Badge variant={platformVariant}>{platformLabel}</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Customer:</span>
                      <span className="text-sm font-medium">{sale.customer_name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Platform:</span>
                      <span className="text-sm font-medium">{sale.platform_name}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Items:</span>
                      <span className="text-sm font-medium">{sale.items.length} items</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payment:</span>
                      <Badge variant={paymentVariant}>{paymentLabel}</Badge>
                    </div>

                    {sale.tracking_number && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tracking:</span>
                        <span className="text-sm font-mono">{sale.tracking_number}</span>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(sale.total_amount)}
                        </span>
                      </div>
                    </div>

                    {sale.shipping_address && (
                      <div className="bg-muted p-2 rounded text-sm">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-xs">{sale.shipping_address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Online Sales Orders</h3>
              <p className="text-sm text-muted-foreground">Manage all online sales and orders</p>
            </div>
            <AdvancedDataTable
              data={filteredSales}
              columns={columns}
              searchable={false}
              filterable={false}
              pagination={{
                pageSize: 10,
                currentPage: 1,
                totalPages: Math.ceil(filteredSales.length / 10),
                totalItems: filteredSales.length,
                onChange: () => {}
              }}
            />
          </Card>
        )}

        {/* Pending Orders Alert */}
        {summaryStats.pendingOrders > 0 && (
          <Card className="p-6 border-orange-200 bg-orange-50">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-orange-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800">Pending Orders</h3>
                <p className="text-orange-700 mt-1">
                  {summaryStats.pendingOrders} orders are pending processing and need attention.
                </p>
              </div>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                Process Orders
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}