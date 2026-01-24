'use client'

import { useState, useEffect } from 'react'
import { salesService, type DirectSale } from '@/services/sales'
import { useToast } from '@/components/ui/toast'
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

// Extended DirectSale interface for UI
interface ExtendedDirectSale extends DirectSale {
  sale_number: string
  sale_date: string
  sales_person: string
  visit_type: 'showroom' | 'home_visit' | 'office_visit' | 'exhibition'
  location: string
  items: DirectSaleItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  delivery_method: 'pickup' | 'delivery' | 'shipping'
  delivery_status?: 'pending' | 'delivered' | 'cancelled'
  commission_rate: number
  commission_amount: number
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
  const [directSales, setDirectSales] = useState<ExtendedDirectSale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()

  useEffect(() => {
    setMounted(true)
    loadDirectSales()
  }, [])

  const loadDirectSales = async () => {
    try {
      setLoading(true)
      setError(null)
      const sales = await salesService.getDirectSales()
      
      // Transform API data to match UI expectations
      const transformedSales: ExtendedDirectSale[] = sales.map(sale => ({
        ...sale,
        sale_number: `DS-${sale.id}`,
        sale_date: sale.transaction_date,
        sales_person: sale.sales_person || 'Sales Staff',
        visit_type: (sale.visit_type || 'showroom') as 'showroom' | 'home_visit' | 'office_visit' | 'exhibition',
        location: sale.location || 'Store',
        items: sale.items || [],
        subtotal: sale.subtotal || sale.total_amount,
        tax_amount: sale.tax_amount || 0,
        discount_amount: sale.discount_amount || 0,
        delivery_method: (sale.delivery_method || 'pickup') as 'pickup' | 'delivery' | 'shipping',
        delivery_status: sale.delivery_status,
        commission_rate: sale.commission_rate || 0,
        commission_amount: sale.commission_amount || 0,
        payment_status: (sale.payment_status || 'pending') as 'pending' | 'paid' | 'partial' | 'failed'
      }))
      
      setDirectSales(transformedSales)
    } catch (error) {
      console.error('Error loading direct sales:', error)
      setError('Failed to load direct sales data')
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load direct sales data. Using sample data for demonstration.'
      })
      // Fall back to mock data if API fails
      setDirectSales(mockDirectSales as ExtendedDirectSale[])
    } finally {
      setLoading(false)
    }
  }

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
  const filteredSales = directSales.filter(sale => {
    if (searchTerm && !sale.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !sale.sales_person.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (paymentStatusFilter !== 'all' && sale.payment_status !== paymentStatusFilter) return false
    if (visitTypeFilter !== 'all' && sale.visit_type !== visitTypeFilter) return false
    if (salesPersonFilter !== 'all' && sale.sales_person !== salesPersonFilter) return false
    return true
  })

  // Summary statistics
  const today = new Date().toISOString().split('T')[0]
  const summaryStats = {
    totalSales: directSales.length,
    todaySales: directSales.filter(s => s.sale_date.startsWith(today)).length,
    totalRevenue: directSales.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.total_amount, 0),
    pendingSales: directSales.filter(s => s.payment_status === 'pending').length,
    totalCommission: directSales.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.commission_amount, 0),
    averageSale: directSales.length > 0 ? 
      directSales.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.total_amount, 0) / 
      directSales.filter(s => s.payment_status === 'paid').length : 0
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
      home_visit: { variant: 'secondary' as const, label: 'House Visit' },
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
  const salesPersons = Array.from(new Set(directSales.map(sale => sale.sales_person)))

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
          <span>{formatDate(sale.sale_date)}</span>
        </div>
      )
    },
    {
      key: 'sales_person',
      title: 'Sales Person',
      render: (sale: DirectSale) => (
        <div className="flex items-center space-x-2">
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
              View
            </Link>
          </Button>
          {sale.payment_status === 'pending' && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/sales/direct/${sale.id}/edit`}>
                Edit
              </Link>
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Direct Sales"
          description="Manage direct sales and field sales activities"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/sales/direct/new">
                  New Sale
                </Link>
              </Button>
            </div>
          }
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-2">
            <Card className="p-4 lg:p-6 hover: transition-all duration-200 border-0  bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 text-white rounded-xl">
                  <div className="h-5 w-5 lg:h-6 lg:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">Today&apos;s Sales</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1 text-blue-900 dark:text-blue-100">{summaryStats.todaySales}</p>
                  <p className="text-xs lg:text-sm text-blue-600 dark:text-blue-400 mt-1">Direct transactions</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 lg:p-6 hover: transition-all duration-200 border-0  bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 text-white rounded-xl">
                  <div className="h-5 w-5 lg:h-6 lg:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">Total Revenue</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1 text-green-900 dark:text-green-100">
                    {mounted ? `Rp ${(summaryStats.totalRevenue / 1000000).toFixed(1)}M` : ''}
                  </p>
                  <p className="text-xs lg:text-sm text-green-600 dark:text-green-400 mt-1">Direct revenue</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 lg:p-6 hover: transition-all duration-200 border-0  bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-500 text-white rounded-xl">
                  <div className="h-5 w-5 lg:h-6 lg:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wide">Pending</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1 text-orange-900 dark:text-orange-100">{summaryStats.pendingSales}</p>
                  <p className="text-xs lg:text-sm text-orange-600 dark:text-orange-400 mt-1">Need follow-up</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 lg:p-6 hover: transition-all duration-200 border-0  bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500 text-white rounded-xl">
                  <div className="h-5 w-5 lg:h-6 lg:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wide">Commission</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1 text-purple-900 dark:text-purple-100">
                    {mounted ? `Rp ${(summaryStats.totalCommission / 1000).toFixed(0)}K` : ''}
                  </p>
                  <p className="text-xs lg:text-sm text-purple-600 dark:text-purple-400 mt-1">Total earned</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 lg:p-6 hover: transition-all duration-200 border-0  bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-teal-500 text-white rounded-xl">
                  <div className="h-5 w-5 lg:h-6 lg:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-teal-700 dark:text-teal-300 uppercase tracking-wide">Average Sale</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1 text-teal-900 dark:text-teal-100">
                    {mounted ? `Rp ${(summaryStats.averageSale / 1000).toFixed(0)}K` : ''}
                  </p>
                  <p className="text-xs lg:text-sm text-teal-600 dark:text-teal-400 mt-1">Per transaction</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 lg:p-6 hover: transition-all duration-200 border-0  bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-slate-600 text-white rounded-xl">
                  <div className="h-5 w-5 lg:h-6 lg:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">Total Sales</p>
                  <p className="text-2xl lg:text-3xl font-bold mt-1 text-slate-900 dark:text-slate-100">{summaryStats.totalSales}</p>
                  <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-400 mt-1">All time</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Controls */}
          <div className="space-y-6">
            {/* Search and Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    placeholder="Search sales, customers, or sales persons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-4 py-3 text-base border-2 focus:border-blue-500 rounded-lg "
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="default" className="flex-shrink-0  hover: transition-all">
                  Advanced Filters
                </Button>
                <Button variant="outline" size="default" className="flex-shrink-0  hover: transition-all">
                  Export
                </Button>
              </div>
            </div>

            {/* Filter Controls */}
            <Card className="p-6  border-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filter Options</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setPaymentStatusFilter('all')
                      setVisitTypeFilter('all')
                      setSalesPersonFilter('all')
                      setSearchTerm('')
                    }}
                    className="text-muted-foreground hover:text-gray-900"
                  >
                    Clear All
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="paymentStatus" className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Status</Label>
                    <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                      <SelectTrigger className="border-2 focus:border-blue-500 ">
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

                  <div className="space-y-3">
                    <Label htmlFor="visitType" className="text-sm font-medium text-gray-700 dark:text-gray-300">Visit Type</Label>
                    <Select value={visitTypeFilter} onValueChange={setVisitTypeFilter}>
                      <SelectTrigger className="border-2 focus:border-blue-500 ">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        <SelectItem value="showroom">Showroom</SelectItem>
                        <SelectItem value="home_visit">House Visit</SelectItem>
                        <SelectItem value="office_visit">Office Visit</SelectItem>
                        <SelectItem value="exhibition">Exhibition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="salesPerson" className="text-sm font-medium text-gray-700 dark:text-gray-300">Sales Person</Label>
                    <Select value={salesPersonFilter} onValueChange={setSalesPersonFilter}>
                      <SelectTrigger className="border-2 focus:border-blue-500 ">
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

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Filters</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={paymentStatusFilter === 'pending' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentStatusFilter(paymentStatusFilter === 'pending' ? 'all' : 'pending')}
                        className=" hover: transition-all"
                      >
                        Pending
                      </Button>
                      <Button
                        variant={paymentStatusFilter === 'paid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaymentStatusFilter(paymentStatusFilter === 'paid' ? 'all' : 'paid')}
                        className=" hover: transition-all"
                      >
                        Paid
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* View Toggle and Results Summary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-1 bg-muted p-1.5 rounded-xl ">
                <Button
                  variant={activeView === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('cards')}
                  className="px-4 py-2 rounded-lg transition-all "
                >
                  Cards
                </Button>
                <Button
                  variant={activeView === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('table')}
                  className="px-4 py-2 rounded-lg transition-all "
                >
                  Table
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-medium">Showing {filteredSales.length} of {directSales.length} sales</span>
                  {filteredSales.length !== directSales.length && (
                    <Badge variant="secondary" className="text-xs">Filtered</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Content */}
        {loading ? (
          <Card className="p-12 text-center border-0  bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950 dark:via-slate-900 dark:to-blue-950">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">Loading Direct Sales</p>
                <p className="text-sm text-muted-foreground">Fetching the latest sales data...</p>
              </div>
            </div>
          </Card>
        ) : error && directSales.length === 0 ? (
          <Card className="p-12 text-center border-0  bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-950 dark:via-slate-900 dark:to-red-950">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <div className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-xl text-red-900 dark:text-red-100">Failed to Load Sales Data</p>
                <p className="text-red-700 dark:text-red-300 max-w-md">{error}</p>
                <p className="text-sm text-muted-foreground">Please check your connection and try again.</p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={loadDirectSales}
                  variant="outline"
                  className=" hover: transition-all"
                >
                  Retry Loading
                </Button>
                <Button
                  asChild
                  className=" hover: transition-all"
                >
                  <Link href="/sales/direct/new">
                    Create New Sale
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ) : directSales.length === 0 ? (
          <Card className="p-12 text-center border-0  bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
                <div className="h-16 w-16" />
              </div>
              <div className="space-y-3">
                <p className="font-bold text-2xl text-gray-900 dark:text-gray-100">No Direct Sales Yet</p>
                <p className="text-muted-foreground max-w-md">
                  Start by creating your first direct sale. Track field sales, home visits, and showroom transactions all in one place.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  size="lg"
                  className=" hover: transition-all"
                >
                  <Link href="/sales/direct/new">
                    Create Your First Sale
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className=" hover: transition-all"
                  asChild
                >
                  <Link href="/sales">
                    View All Sales
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ) : activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSales.map((sale) => {
              const { variant: paymentVariant, label: paymentLabel } = getPaymentStatusBadge(sale.payment_status)
              const { variant: visitVariant, label: visitLabel } = getVisitTypeBadge(sale.visit_type)
              const deliveryBadge = getDeliveryStatusBadge(sale.delivery_status)
              
              return (
                <Card 
                  key={sale.id} 
                  className="group relative overflow-hidden hover: transition-all duration-300 border-0  bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
                >
                  {/* Header Section */}
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/sales/direct/${sale.id}`}
                          className="text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors line-clamp-1 group-hover:underline"
                        >
                          {sale.sale_number}
                        </Link>
                        <div className="flex items-center space-x-2 mt-2">
                          <p className="text-sm text-muted-foreground">
                            {formatDate(sale.sale_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge 
                          variant={paymentVariant}
                          className=""
                        >
                          {paymentLabel}
                        </Badge>
                        <Badge 
                          variant={visitVariant}
                          className="text-xs "
                        >
                          {visitLabel}
                        </Badge>
                      </div>
                    </div>

                    {/* Main Info Grid */}
                    <div className="space-y-4">
                      {/* Customer & Sales Person */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <div className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Sales Person</p>
                            <p className="font-medium text-sm truncate">{sale.sales_person}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <div className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Customer</p>
                            <p className="font-medium text-sm truncate">{sale.customer_name || 'Walk-in Customer'}</p>
                            {sale.customer_phone && (
                              <p className="text-xs text-muted-foreground">{sale.customer_phone}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Location & Items */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="text-sm font-medium truncate">{sale.location}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">Items</p>
                            <p className="text-sm font-medium">{sale.items.length} items</p>
                          </div>
                        </div>
                      </div>

                      {deliveryBadge && (
                        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">Delivery Status</span>
                          </div>
                          <Badge variant={deliveryBadge.variant} className="">{deliveryBadge.label}</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-6 pt-4 mt-auto">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Total Amount</span>
                        </div>
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(sale.total_amount)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Commission ({sale.commission_rate}%)</span>
                        <span className="font-semibold text-purple-600">
                          {formatCurrency(sale.commission_amount)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm border-t pt-2">
                        <span className="text-muted-foreground">Payment</span>
                        <span className={`font-medium ${sale.payment_method === 'cash' ? 'text-green-600' : 
                          sale.payment_method === 'card' ? 'text-blue-600' : 
                          sale.payment_method === 'transfer' ? 'text-purple-600' : 'text-orange-600'}`}>
                          {sale.payment_method?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Address */}
                  {sale.customer_address && (
                    <div className="px-6 pb-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <div className="flex items-start space-x-3">
                          <div>
                            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Delivery Address</p>
                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1 leading-relaxed">
                              {sale.customer_address}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {sale.notes && (
                    <div className="px-6 pb-6">
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">Notes</p>
                        <p className="text-xs text-amber-600 dark:text-amber-300 leading-relaxed">
                          {sale.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 p-2 bg-white/80 hover:bg-white "
                        asChild
                      >
                        <Link href={`/sales/direct/${sale.id}`}>
                          View
                        </Link>
                      </Button>
                      {sale.payment_status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 p-2 bg-white/80 hover:bg-white "
                          asChild
                        >
                          <Link href={`/sales/direct/${sale.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                      )}
                    </div>
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
          <Card className="border-0  bg-gradient-to-r from-orange-50 via-orange-100 to-yellow-50 dark:from-orange-950 dark:via-orange-900 dark:to-yellow-950">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="p-3 bg-orange-500 text-white rounded-xl">
                    <div className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">Pending Sales Alert</h3>
                      <Badge variant="secondary" className="bg-orange-200 text-orange-800 border-orange-300">
                        {summaryStats.pendingSales} pending
                      </Badge>
                    </div>
                    <p className="text-orange-800 dark:text-orange-200">
                      {summaryStats.pendingSales} direct sale{summaryStats.pendingSales > 1 ? 's' : ''} require{summaryStats.pendingSales === 1 ? 's' : ''} payment follow-up.
                      Don&apos;t let potential revenue slip away.
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-orange-700 dark:text-orange-300">
                      <div className="flex items-center space-x-1">
                        <span>Potential Revenue: {formatCurrency(
                          directSales.filter(s => s.payment_status === 'pending').reduce((sum, s) => sum + s.total_amount, 0)
                        )}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="border-orange-400 text-orange-700 hover:bg-orange-200 dark:text-orange-300 dark:hover:bg-orange-900/50  hover: transition-all"
                    onClick={() => setPaymentStatusFilter('pending')}
                  >
                    View Pending
                  </Button>
                  <Button
                    className="bg-orange-600 hover:bg-orange-700  hover: transition-all"
                  >
                    Follow Up
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
          </div>
      </div>
    </TwoLevelLayout>
  )
}