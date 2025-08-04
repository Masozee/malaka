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
  Store,
  Plus,
  Eye,
  Edit,
  Filter,
  Download,
  Calendar,
  DollarSign,
  User,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  MapPin,
  Phone
} from 'lucide-react'
import Link from 'next/link'

// Direct Sales types
interface DirectSale {
  id: string
  sale_number: string
  sale_date: string
  sales_person: string
  customer_name?: string
  customer_phone?: string
  customer_address?: string
  visit_type: 'showroom' | 'home_visit' | 'office_visit' | 'exhibition'
  location: string
  items: DirectSaleItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_method: 'cash' | 'card' | 'transfer' | 'installment'
  payment_status: 'pending' | 'paid' | 'partial' | 'failed'
  delivery_method: 'pickup' | 'delivery' | 'shipping'
  delivery_status?: 'pending' | 'delivered' | 'cancelled'
  commission_rate: number
  commission_amount: number
  notes?: string
  created_at: string
  updated_at: string
}

interface DirectSaleItem {
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

const mockDirectSales: DirectSale[] = [
  {
    id: '1',
    sale_number: 'DS-2024-001',
    sale_date: '2024-07-25',
    sales_person: 'Ahmad Direct',
    customer_name: 'Budi Wijaya',
    customer_phone: '08123456789',
    customer_address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    visit_type: 'home_visit',
    location: 'Jakarta Pusat',
    items: [
      {
        id: '1',
        product_code: 'SHOE-001',
        product_name: 'Classic Oxford Brown',
        size: '42',
        color: 'Brown',
        quantity: 1,
        unit_price: 350000,
        discount_percentage: 10,
        line_total: 315000
      },
      {
        id: '2',
        product_code: 'BELT-001',
        product_name: 'Leather Belt Brown',
        size: 'L',
        color: 'Brown',
        quantity: 1,
        unit_price: 120000,
        discount_percentage: 10,
        line_total: 108000
      }
    ],
    subtotal: 423000,
    tax_amount: 42300,
    discount_amount: 47000,
    total_amount: 418300,
    payment_method: 'cash',
    payment_status: 'paid',
    delivery_method: 'delivery',
    delivery_status: 'delivered',
    commission_rate: 5,
    commission_amount: 20915,
    notes: 'Customer very satisfied, potential for future orders',
    created_at: '2024-07-25T10:30:00Z',
    updated_at: '2024-07-25T16:00:00Z'
  },
  {
    id: '2',
    sale_number: 'DS-2024-002',
    sale_date: '2024-07-25',
    sales_person: 'Sari Direct',
    customer_name: 'Rina Sari',
    customer_phone: '08123456788',
    customer_address: 'Jl. Thamrin No. 456, Jakarta Pusat',
    visit_type: 'showroom',
    location: 'Showroom Jakarta',
    items: [
      {
        id: '3',
        product_code: 'SHOE-002',
        product_name: 'Sports Sneaker White',
        size: '38',
        color: 'White',
        quantity: 2,
        unit_price: 280000,
        discount_percentage: 15,
        line_total: 476000
      }
    ],
    subtotal: 476000,
    tax_amount: 47600,
    discount_amount: 84000,
    total_amount: 439600,
    payment_method: 'card',
    payment_status: 'paid',
    delivery_method: 'pickup',
    commission_rate: 7,
    commission_amount: 30772,
    notes: 'Walk-in customer, quick decision',
    created_at: '2024-07-25T14:15:00Z',
    updated_at: '2024-07-25T14:30:00Z'
  },
  {
    id: '3',
    sale_number: 'DS-2024-003',
    sale_date: '2024-07-25',
    sales_person: 'Budi Direct',
    customer_name: 'Dedi Santoso',
    customer_phone: '08123456787',
    customer_address: 'Jl. Gatot Subroto No. 789, Jakarta Selatan',
    visit_type: 'office_visit',
    location: 'Office Building Jakarta Selatan',
    items: [
      {
        id: '4',
        product_code: 'BOOT-001',
        product_name: 'Work Boot Black',
        size: '43',
        color: 'Black',
        quantity: 3,
        unit_price: 450000,
        discount_percentage: 5,
        line_total: 1282500
      }
    ],
    subtotal: 1282500,
    tax_amount: 128250,
    discount_amount: 67500,
    total_amount: 1343250,
    payment_method: 'transfer',
    payment_status: 'pending',
    delivery_method: 'delivery',
    delivery_status: 'pending',
    commission_rate: 6,
    commission_amount: 80595,
    notes: 'Corporate order, waiting for payment confirmation',
    created_at: '2024-07-25T11:00:00Z',
    updated_at: '2024-07-25T11:00:00Z'
  },
  {
    id: '4',
    sale_number: 'DS-2024-004',
    sale_date: '2024-07-24',
    sales_person: 'Rina Direct',
    customer_name: 'Lisa Dewi',
    customer_phone: '08123456786',
    customer_address: 'Jl. Kemang Raya No. 321, Jakarta Selatan',
    visit_type: 'exhibition',
    location: 'Fashion Expo Jakarta',
    items: [
      {
        id: '5',
        product_code: 'SHOE-003',
        product_name: 'Formal Loafer Black',
        size: '37',
        color: 'Black',
        quantity: 1,
        unit_price: 400000,
        discount_percentage: 20,
        line_total: 320000
      },
      {
        id: '6',
        product_code: 'SHOE-004',
        product_name: 'High Heel Red',
        size: '37',
        color: 'Red',
        quantity: 1,
        unit_price: 320000,
        discount_percentage: 20,
        line_total: 256000
      }
    ],
    subtotal: 576000,
    tax_amount: 57600,
    discount_amount: 144000,
    total_amount: 489600,
    payment_method: 'installment',
    payment_status: 'partial',
    delivery_method: 'shipping',
    delivery_status: 'delivered',
    commission_rate: 8,
    commission_amount: 39168,
    notes: 'Exhibition special discount, installment payment arranged',
    created_at: '2024-07-24T13:20:00Z',
    updated_at: '2024-07-24T18:45:00Z'
  },
  {
    id: '5',
    sale_number: 'DS-2024-005',
    sale_date: '2024-07-24',
    sales_person: 'Dedi Direct',
    customer_name: 'Ahmad Putra',
    customer_phone: '08123456785',
    visit_type: 'home_visit',
    location: 'Bekasi',
    items: [
      {
        id: '7',
        product_code: 'SANDAL-001',
        product_name: 'Summer Sandal Brown',
        size: '41',
        color: 'Brown',
        quantity: 2,
        unit_price: 180000,
        discount_percentage: 0,
        line_total: 360000
      }
    ],
    subtotal: 360000,
    tax_amount: 36000,
    discount_amount: 0,
    total_amount: 396000,
    payment_method: 'cash',
    payment_status: 'paid',
    delivery_method: 'pickup',
    commission_rate: 5,
    commission_amount: 19800,
    notes: 'Repeat customer, family purchase',
    created_at: '2024-07-24T16:10:00Z',
    updated_at: '2024-07-24T16:30:00Z'
  },
  {
    id: '6',
    sale_number: 'DS-2024-006',
    sale_date: '2024-07-23',
    sales_person: 'Lisa Direct',
    customer_name: 'Santi Wulandari',
    customer_phone: '08123456784',
    customer_address: 'Jl. Raya Bogor No. 654, Depok',
    visit_type: 'home_visit',
    location: 'Depok',
    items: [
      {
        id: '8',
        product_code: 'SHOE-005',
        product_name: 'Casual Sneaker Blue',
        size: '39',
        color: 'Blue',
        quantity: 1,
        unit_price: 300000,
        discount_percentage: 0,
        line_total: 300000
      }
    ],
    subtotal: 300000,
    tax_amount: 30000,
    discount_amount: 0,
    total_amount: 330000,
    payment_method: 'transfer',
    payment_status: 'failed',
    delivery_method: 'delivery',
    delivery_status: 'cancelled',
    commission_rate: 5,
    commission_amount: 0,
    notes: 'Payment failed, order cancelled by customer',
    created_at: '2024-07-23T15:45:00Z',
    updated_at: '2024-07-23T16:00:00Z'
  }
]

export default function DirectSalesPage() {
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all')
  const [visitTypeFilter, setVisitTypeFilter] = useState<string>('all')
  const [salesPersonFilter, setSalesPersonFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const formatDateTime = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleString('id-ID')
  }

  const breadcrumbs = [
    { label: 'Sales', href: '/sales' },
    { label: 'Direct Sales', href: '/sales/direct' }
  ]

  // Filter sales
  const filteredSales = mockDirectSales.filter(sale => {
    if (searchTerm && !sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !sale.sales_person.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (paymentStatusFilter !== 'all' && sale.payment_status !== paymentStatusFilter) return false
    if (visitTypeFilter !== 'all' && sale.visit_type !== visitTypeFilter) return false
    if (salesPersonFilter !== 'all' && sale.sales_person !== salesPersonFilter) return false
    return true
  })

  // Summary statistics
  const summaryStats = {
    totalSales: mockDirectSales.length,
    todaySales: mockDirectSales.filter(s => s.sale_date === '2024-07-25').length,
    totalRevenue: mockDirectSales.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.total_amount, 0),
    pendingSales: mockDirectSales.filter(s => s.payment_status === 'pending').length,
    totalCommission: mockDirectSales.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.commission_amount, 0),
    averageSale: mockDirectSales.length > 0 ? 
      mockDirectSales.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.total_amount, 0) / 
      mockDirectSales.filter(s => s.payment_status === 'paid').length : 0
  }

  const getPaymentStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      paid: { variant: 'default' as const, label: 'Paid' },
      partial: { variant: 'outline' as const, label: 'Partial' },
      failed: { variant: 'destructive' as const, label: 'Failed' }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status }
  }

  const getVisitTypeBadge = (type: string) => {
    const config = {
      showroom: { variant: 'default' as const, label: 'Showroom' },
      home_visit: { variant: 'secondary' as const, label: 'Home Visit' },
      office_visit: { variant: 'outline' as const, label: 'Office Visit' },
      exhibition: { variant: 'secondary' as const, label: 'Exhibition' }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type }
  }

  const getDeliveryStatusBadge = (status?: string) => {
    if (!status) return null
    const config = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      delivered: { variant: 'default' as const, label: 'Delivered' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status }
  }

  // Get unique sales persons for filter
  const salesPersons = Array.from(new Set(mockDirectSales.map(sale => sale.sales_person)))

  const columns = [
    {
      key: 'sale_number',
      title: 'Sale Number',
      render: (sale: DirectSale) => (
        <Link 
          href={`/sales/direct/${sale.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {sale.sale_number}
        </Link>
      )
    },
    {
      key: 'sale_date',
      title: 'Date',
      render: (sale: DirectSale) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(sale.sale_date)}</span>
        </div>
      )
    },
    {
      key: 'sales_person',
      title: 'Sales Person',
      render: (sale: DirectSale) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{sale.sales_person}</span>
        </div>
      )
    },
    {
      key: 'customer',
      title: 'Customer',
      render: (sale: DirectSale) => (
        <div>
          <div className="font-medium">{sale.customer_name || 'Walk-in'}</div>
          {sale.customer_phone && (
            <div className="text-sm text-muted-foreground flex items-center space-x-1">
              <Phone className="h-3 w-3" />
              <span>{sale.customer_phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'visit_type',
      title: 'Visit Type',
      render: (sale: DirectSale) => {
        const { variant, label } = getVisitTypeBadge(sale.visit_type)
        return (
          <div>
            <Badge variant={variant}>{label}</Badge>
            <div className="text-sm text-muted-foreground mt-1 flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{sale.location}</span>
            </div>
          </div>
        )
      }
    },
    {
      key: 'items',
      title: 'Items',
      render: (sale: DirectSale) => (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{sale.items.length} items</span>
        </div>
      )
    },
    {
      key: 'total_amount',
      title: 'Total',
      render: (sale: DirectSale) => (
        <div className="text-right font-medium">
          {formatCurrency(sale.total_amount)}
        </div>
      )
    },
    {
      key: 'commission',
      title: 'Commission',
      render: (sale: DirectSale) => (
        <div className="text-right">
          <div className="font-medium text-green-600">{formatCurrency(sale.commission_amount)}</div>
          <div className="text-sm text-muted-foreground">{sale.commission_rate}%</div>
        </div>
      )
    },
    {
      key: 'payment_status',
      title: 'Payment',
      render: (sale: DirectSale) => {
        const { variant, label } = getPaymentStatusBadge(sale.payment_status)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (sale: DirectSale) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/sales/direct/${sale.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {sale.payment_status === 'pending' && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/sales/direct/${sale.id}/edit`}>
                <Edit className="h-4 w-4" />
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
          title="Direct Sales"
          description="Manage direct sales and field sales activities"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/sales/direct/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Sale
                </Link>
              </Button>
            </div>
          }
        />

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today&apos;s Sales</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.todaySales}</p>
                <p className="text-sm text-blue-600 mt-1">Direct sales</p>
              </div>
              <Store className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `Rp ${(summaryStats.totalRevenue / 1000000).toFixed(1)}M` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">Direct revenue</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{summaryStats.pendingSales}</p>
                <p className="text-sm text-orange-600 mt-1">Need follow-up</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commission</p>
                <p className="text-2xl font-bold mt-1 text-purple-600">
                  {mounted ? `Rp ${(summaryStats.totalCommission / 1000).toFixed(0)}K` : ''}
                </p>
                <p className="text-sm text-purple-600 mt-1">Total earned</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Sale</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `Rp ${(summaryStats.averageSale / 1000).toFixed(0)}K` : ''}
                </p>
                <p className="text-sm text-gray-600 mt-1">Per transaction</p>
              </div>
              <Package className="h-8 w-8 text-gray-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalSales}</p>
                <p className="text-sm text-gray-600 mt-1">All time</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search sales..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
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
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitType">Visit Type</Label>
                <Select value={visitTypeFilter} onValueChange={setVisitTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="showroom">Showroom</SelectItem>
                    <SelectItem value="home_visit">Home Visit</SelectItem>
                    <SelectItem value="office_visit">Office Visit</SelectItem>
                    <SelectItem value="exhibition">Exhibition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salesPerson">Sales Person</Label>
                <Select value={salesPersonFilter} onValueChange={setSalesPersonFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All sales persons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sales persons</SelectItem>
                    {salesPersons.map(person => (
                      <SelectItem key={person} value={person}>{person}</SelectItem>
                    ))}
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
              const { variant: paymentVariant, label: paymentLabel } = getPaymentStatusBadge(sale.payment_status)
              const { variant: visitVariant, label: visitLabel } = getVisitTypeBadge(sale.visit_type)
              const deliveryBadge = getDeliveryStatusBadge(sale.delivery_status)
              
              return (
                <Card key={sale.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link 
                        href={`/sales/direct/${sale.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {sale.sale_number}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(sale.sale_date)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant={paymentVariant}>{paymentLabel}</Badge>
                      <Badge variant={visitVariant}>{visitLabel}</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sales Person:</span>
                      <span className="text-sm font-medium">{sale.sales_person}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Customer:</span>
                      <span className="text-sm font-medium">{sale.customer_name || 'Walk-in'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Location:</span>
                      <span className="text-sm font-medium">{sale.location}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Items:</span>
                      <span className="text-sm font-medium">{sale.items.length} items</span>
                    </div>

                    {deliveryBadge && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Delivery:</span>
                        <Badge variant={deliveryBadge.variant}>{deliveryBadge.label}</Badge>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(sale.total_amount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-muted-foreground">Commission</span>
                        <span className="text-sm font-medium text-purple-600">
                          {formatCurrency(sale.commission_amount)} ({sale.commission_rate}%)
                        </span>
                      </div>
                    </div>

                    {sale.customer_address && (
                      <div className="bg-muted p-2 rounded text-sm">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-xs">{sale.customer_address}</span>
                        </div>
                      </div>
                    )}

                    {sale.notes && (
                      <div className="bg-blue-50 p-2 rounded text-sm">
                        {sale.notes}
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
              <h3 className="text-lg font-semibold">Direct Sales</h3>
              <p className="text-sm text-muted-foreground">Manage all direct sales and field activities</p>
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

        {/* Pending Sales Alert */}
        {summaryStats.pendingSales > 0 && (
          <Card className="p-6 border-orange-200 bg-orange-50">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-orange-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800">Pending Sales</h3>
                <p className="text-orange-700 mt-1">
                  {summaryStats.pendingSales} direct sales are pending payment and need follow-up.
                </p>
              </div>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                Follow Up
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}