'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { DataTable, Column } from '@/components/ui/data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  FileText,
  Plus,
  Eye,
  Edit,
  Filter,
  Download,
  Calendar,
  DollarSign,
  ShoppingCart,
  User,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Truck,
  Building,
  MoreHorizontal,
  Copy,
  Trash2,
  Send,
  PrinterIcon,
  Archive
} from 'lucide-react'
import Link from 'next/link'

// Sales Order types
interface SalesOrder {
  id: string
  order_number: string
  order_date: string
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  sales_person: string
  order_type: 'wholesale' | 'retail' | 'distributor' | 'export'
  delivery_address: string
  items: OrderItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  shipping_cost: number
  total_amount: number
  status: 'draft' | 'confirmed' | 'production' | 'ready' | 'shipped' | 'delivered' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  payment_terms: string
  due_date: string
  estimated_delivery: string
  notes?: string
  created_at: string
  updated_at: string
}

interface OrderItem {
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

const mockSalesOrders: SalesOrder[] = [
  {
    id: '1',
    order_number: 'SO-2024-001',
    order_date: '2024-07-25',
    customer_id: '1',
    customer_name: 'Toko Sepatu Merdeka',
    customer_email: 'merdeka@tokosepatu.com',
    customer_phone: '08123456789',
    sales_person: 'Ahmad Sales',
    order_type: 'wholesale',
    delivery_address: 'Jl. Merdeka No. 123, Jakarta Pusat, DKI Jakarta 10110',
    items: [
      {
        id: '1',
        product_code: 'SHOE-001',
        product_name: 'Classic Oxford Brown',
        size: '42',
        color: 'Brown',
        quantity: 50,
        unit_price: 300000,
        discount_percentage: 10,
        line_total: 13500000
      },
      {
        id: '2',
        product_code: 'SHOE-002',
        product_name: 'Sports Sneaker White',
        size: '40',
        color: 'White',
        quantity: 30,
        unit_price: 280000,
        discount_percentage: 10,
        line_total: 7560000
      }
    ],
    subtotal: 21060000,
    tax_amount: 2106000,
    discount_amount: 2340000,
    shipping_cost: 150000,
    total_amount: 20976000,
    status: 'production',
    priority: 'high',
    payment_terms: 'Net 30',
    due_date: '2024-08-25',
    estimated_delivery: '2024-08-05',
    notes: 'Bulk order untuk grand opening toko baru',
    created_at: '2024-07-25T09:00:00Z',
    updated_at: '2024-07-25T14:30:00Z'
  },
  {
    id: '2',
    order_number: 'SO-2024-002',
    order_date: '2024-07-25',
    customer_id: '2',
    customer_name: 'Fashion Store Bandung',
    customer_email: 'bandung@fashionstore.com',
    customer_phone: '08123456788',
    sales_person: 'Sari Sales',
    order_type: 'retail',
    delivery_address: 'Jl. Braga No. 456, Bandung, Jawa Barat 40111',
    items: [
      {
        id: '3',
        product_code: 'BOOT-001',
        product_name: 'Work Boot Black',
        size: '43',
        color: 'Black',
        quantity: 25,
        unit_price: 450000,
        discount_percentage: 5,
        line_total: 10687500
      }
    ],
    subtotal: 10687500,
    tax_amount: 1068750,
    discount_amount: 562500,
    shipping_cost: 100000,
    total_amount: 11293750,
    status: 'confirmed',
    priority: 'normal',
    payment_terms: 'Net 14',
    due_date: '2024-08-08',
    estimated_delivery: '2024-07-30',
    notes: 'Pesanan khusus untuk koleksi musim ini',
    created_at: '2024-07-25T10:15:00Z',
    updated_at: '2024-07-25T11:00:00Z'
  },
  {
    id: '3',
    order_number: 'SO-2024-003',
    order_date: '2024-07-24',
    customer_id: '3',
    customer_name: 'Distributor Surabaya',
    customer_email: 'surabaya@distributor.com',
    customer_phone: '08123456787',
    sales_person: 'Budi Sales',
    order_type: 'distributor',
    delivery_address: 'Jl. Tunjungan No. 789, Surabaya, Jawa Timur 60261',
    items: [
      {
        id: '4',
        product_code: 'SANDAL-001',
        product_name: 'Summer Sandal Brown',
        size: 'Mixed',
        color: 'Brown',
        quantity: 100,
        unit_price: 150000,
        discount_percentage: 15,
        line_total: 12750000
      },
      {
        id: '5',
        product_code: 'SHOE-003',
        product_name: 'Formal Loafer Black',
        size: 'Mixed',
        color: 'Black',
        quantity: 40,
        unit_price: 400000,
        discount_percentage: 15,
        line_total: 13600000
      }
    ],
    subtotal: 26350000,
    tax_amount: 2635000,
    discount_amount: 4650000,
    shipping_cost: 200000,
    total_amount: 24535000,
    status: 'ready',
    priority: 'normal',
    payment_terms: 'Net 45',
    due_date: '2024-09-08',
    estimated_delivery: '2024-07-28',
    created_at: '2024-07-24T13:20:00Z',
    updated_at: '2024-07-25T09:45:00Z'
  },
  {
    id: '4',
    order_number: 'SO-2024-004',
    order_date: '2024-07-24',
    customer_id: '4',
    customer_name: 'Export Partner Singapore',
    customer_email: 'singapore@exportpartner.com',
    customer_phone: '+65987654321',
    sales_person: 'Rina Sales',
    order_type: 'export',
    delivery_address: '123 Orchard Road, Singapore 238857',
    items: [
      {
        id: '6',
        product_code: 'SHOE-004',
        product_name: 'High Heel Red',
        size: 'Mixed',
        color: 'Red',
        quantity: 200,
        unit_price: 320000,
        discount_percentage: 20,
        line_total: 51200000
      }
    ],
    subtotal: 51200000,
    tax_amount: 0,
    discount_amount: 12800000,
    shipping_cost: 500000,
    total_amount: 38900000,
    status: 'shipped',
    priority: 'urgent',
    payment_terms: 'Prepaid',
    due_date: '2024-07-24',
    estimated_delivery: '2024-07-26',
    notes: 'Export order - free tax, include all export documents',
    created_at: '2024-07-24T08:00:00Z',
    updated_at: '2024-07-24T16:30:00Z'
  },
  {
    id: '5',
    order_number: 'SO-2024-005',
    order_date: '2024-07-23',
    customer_id: '5',
    customer_name: 'Mall Department Store',
    customer_email: 'mall@department.com',
    customer_phone: '08123456785',
    sales_person: 'Dedi Sales',
    order_type: 'wholesale',
    delivery_address: 'Mall Central, Lt. 2, Jakarta Selatan, DKI Jakarta 12560',
    items: [
      {
        id: '7',
        product_code: 'SHOE-MIX',
        product_name: 'Mixed Shoe Collection',
        size: 'Mixed',
        color: 'Mixed',
        quantity: 150,
        unit_price: 250000,
        discount_percentage: 12,
        line_total: 33000000
      }
    ],
    subtotal: 33000000,
    tax_amount: 3300000,
    discount_amount: 4500000,
    shipping_cost: 250000,
    total_amount: 32050000,
    status: 'delivered',
    priority: 'normal',
    payment_terms: 'Net 21',
    due_date: '2024-08-13',
    estimated_delivery: '2024-07-25',
    created_at: '2024-07-23T11:30:00Z',
    updated_at: '2024-07-25T10:00:00Z'
  },
  {
    id: '6',
    order_number: 'SO-2024-006',
    order_date: '2024-07-23',
    customer_id: '6',
    customer_name: 'Startup Fashion Co',
    customer_email: 'startup@fashion.com',
    customer_phone: '08123456784',
    sales_person: 'Lisa Sales',
    order_type: 'retail',
    delivery_address: 'Jl. Startup No. 111, Yogyakarta, DI Yogyakarta 55141',
    items: [
      {
        id: '8',
        product_code: 'SHOE-005',
        product_name: 'Casual Sneaker Blue',
        size: 'Mixed',
        color: 'Blue',
        quantity: 15,
        unit_price: 300000,
        discount_percentage: 0,
        line_total: 4500000
      }
    ],
    subtotal: 4500000,
    tax_amount: 450000,
    discount_amount: 0,
    shipping_cost: 75000,
    total_amount: 5025000,
    status: 'cancelled',
    priority: 'low',
    payment_terms: 'Net 7',
    due_date: '2024-07-30',
    estimated_delivery: '2024-07-27',
    notes: 'Cancelled by customer due to budget constraints',
    created_at: '2024-07-23T15:45:00Z',
    updated_at: '2024-July-23T16:00:00Z'
  }
]

export default function SalesOrdersPage() {
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('all')

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

  const breadcrumbs = [
    { label: 'Sales', href: '/sales' },
    { label: 'Sales Orders', href: '/sales/orders' }
  ]

  // Filter orders
  const filteredOrders = mockSalesOrders.filter(order => {
    if (searchTerm && !order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !order.sales_person.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    if (priorityFilter !== 'all' && order.priority !== priorityFilter) return false
    if (orderTypeFilter !== 'all' && order.order_type !== orderTypeFilter) return false
    return true
  })

  // Bulk action handlers
  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for orders:`)
    // TODO: Implement bulk actions
  }

  // Summary statistics
  const summaryStats = {
    totalOrders: mockSalesOrders.length,
    todayOrders: mockSalesOrders.filter(o => o.order_date === '2024-07-25').length,
    totalValue: mockSalesOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total_amount, 0),
    confirmedOrders: mockSalesOrders.filter(o => o.status === 'confirmed').length,
    productionOrders: mockSalesOrders.filter(o => o.status === 'production').length,
    shippedOrders: mockSalesOrders.filter(o => o.status === 'shipped').length,
    urgentOrders: mockSalesOrders.filter(o => o.priority === 'urgent').length
  }

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { 
        variant: 'outline' as const, 
        label: 'Draft',
        className: 'border-yellow-300 bg-yellow-50 text-yellow-800 '
      },
      confirmed: { 
        variant: 'default' as const, 
        label: 'Confirmed',
        className: 'bg-green-500 text-white  border-green-400 hover:bg-green-600'
      },
      production: { 
        variant: 'secondary' as const, 
        label: 'Production',
        className: 'bg-blue-500 text-white  border-blue-400 hover:bg-blue-600'
      },
      ready: { 
        variant: 'default' as const, 
        label: 'Ready',
        className: 'bg-purple-500 text-white  border-purple-400 hover:bg-purple-600'
      },
      shipped: { 
        variant: 'default' as const, 
        label: 'Shipped',
        className: 'bg-orange-500 text-white  border-orange-400 hover:bg-orange-600'
      },
      delivered: { 
        variant: 'default' as const, 
        label: 'Delivered',
        className: 'bg-emerald-500 text-white  border-emerald-400 hover:bg-emerald-600'
      },
      cancelled: { 
        variant: 'outline' as const, 
        label: 'Cancelled',
        className: 'border-red-300 bg-red-50 text-red-800 '
      }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status, className: '' }
  }

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: { 
        variant: 'outline' as const, 
        label: 'Low',
        className: 'border-gray-300 bg-gray-50 text-gray-600 '
      },
      normal: { 
        variant: 'secondary' as const, 
        label: 'Normal',
        className: 'bg-cyan-500 text-white  border-cyan-400 hover:bg-cyan-600'
      },
      high: { 
        variant: 'default' as const, 
        label: 'High',
        className: 'bg-yellow-500 text-white  border-yellow-400 hover:bg-yellow-600'
      },
      urgent: { 
        variant: 'destructive' as const, 
        label: 'Urgent',
        className: 'bg-red-500 text-white  border-red-400 hover:bg-red-600 animate-pulse'
      }
    }
    return config[priority as keyof typeof config] || { variant: 'secondary' as const, label: priority, className: '' }
  }

  const getOrderTypeBadge = (type: string) => {
    const config = {
      wholesale: { 
        variant: 'default' as const, 
        label: 'Wholesale',
        className: 'bg-indigo-500 text-white  border-indigo-400 hover:bg-indigo-600'
      },
      retail: { 
        variant: 'secondary' as const, 
        label: 'Retail',
        className: 'bg-pink-500 text-white  border-pink-400 hover:bg-pink-600'
      },
      distributor: { 
        variant: 'outline' as const, 
        label: 'Distributor',
        className: 'bg-teal-500 text-white  border-teal-400 hover:bg-teal-600'
      },
      export: { 
        variant: 'secondary' as const, 
        label: 'Export',
        className: 'bg-violet-500 text-white  border-violet-400 hover:bg-violet-600'
      }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type, className: '' }
  }

  const getStatusProgress = (status: string): number => {
    const statusOrder = ['draft', 'confirmed', 'production', 'ready', 'shipped', 'delivered']
    if (status === 'cancelled') return 0
    const index = statusOrder.indexOf(status)
    return index >= 0 ? ((index + 1) / statusOrder.length) * 100 : 0
  }

  const columns: Column<SalesOrder>[] = [
    {
      key: 'order_number',
      title: 'Order Number',
      sortable: true,
      render: (orderNumber: unknown, order: SalesOrder) => (
        <Link 
          href={`/sales/orders/${order.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {orderNumber as string}
        </Link>
      )
    },
    {
      key: 'order_date',
      title: 'Date',
      sortable: true,
      render: (date: unknown) => formatDate(date as string),
      width: '120px'
    },
    {
      key: 'customer_name',
      title: 'Customer',
      render: (customerName: unknown, order: SalesOrder) => (
        <div>
          <div className="font-medium">{customerName as string}</div>
          <div className="text-sm text-muted-foreground">{order.customer_email}</div>
        </div>
      )
    },
    {
      key: 'sales_person',
      title: 'Sales Person',
      render: (salesPerson: unknown) => salesPerson as string
    },
    {
      key: 'order_type',
      title: 'Type',
      render: (orderType: unknown) => {
        const { variant, label, className } = getOrderTypeBadge(orderType as string)
        return <Badge variant={variant} className={className}>{label}</Badge>
      }
    },
    {
      key: 'items',
      title: 'Items',
      render: (items: unknown) => `${(items as OrderItem[]).length} items`
    },
    {
      key: 'total_amount',
      title: 'Total',
      render: (amount: unknown) => (
        <div className="text-right font-medium">
          {formatCurrency(amount as number)}
        </div>
      ),
      width: '120px'
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (priority: unknown) => {
        const { variant, label, className } = getPriorityBadge(priority as string)
        return <Badge variant={variant} className={className}>{label}</Badge>
      }
    },
    {
      key: 'status',
      title: 'Status',
      render: (status: unknown) => {
        const { variant, label, className } = getStatusBadge(status as string)
        return <Badge variant={variant} className={className}>{label}</Badge>
      }
    }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Sales Orders"
        description="Manage customer orders and sales processes"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button asChild>
              <Link href="/sales/orders/new">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Link>
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Orders</p>
                <p className="text-2xl font-bold">{summaryStats.todayOrders}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  {mounted ? `Rp ${(summaryStats.totalValue / 1000000000).toFixed(1)}B` : ''}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{summaryStats.confirmedOrders}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold">{summaryStats.urgentOrders}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} items
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <AlertCircle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <Button 
                variant={activeView === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('cards')}
              >
                <Package className="h-4 w-4 mr-2" />
                Cards
              </Button>
              <Button 
                variant={activeView === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('table')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Table
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeView === 'table' ? (
          <DataTable
            data={filteredOrders}
            columns={columns}
            loading={false}
            batchSelection={true}
            onEdit={(order) => {
              // Handle edit
              console.log('Edit order:', order)
            }}
            onDelete={(order) => {
              // Handle delete
              console.log('Delete order:', order)
            }}
            onBatchDelete={(orders) => {
              // Handle batch delete
              console.log('Batch delete orders:', orders)
            }}
            pagination={{
              current: 1,
              pageSize: 15,
              total: filteredOrders.length,
              onChange: () => {}
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const { variant: statusVariant, label: statusLabel, className: statusClassName } = getStatusBadge(order.status)
              const { variant: priorityVariant, label: priorityLabel, className: priorityClassName } = getPriorityBadge(order.priority)
              const { variant: typeVariant, label: typeLabel, className: typeClassName } = getOrderTypeBadge(order.order_type)
              const progress = getStatusProgress(order.status)
              
              return (
                <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Link 
                        href={`/sales/orders/${order.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {order.order_number}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(order.order_date)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant={statusVariant} className={statusClassName}>{statusLabel}</Badge>
                      <Badge variant={priorityVariant} className={priorityClassName}>{priorityLabel}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Customer:</span>
                      <span className="text-sm font-medium">{order.customer_name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sales Person:</span>
                      <span className="text-sm font-medium">{order.sales_person}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <Badge variant={typeVariant} className={typeClassName}>{typeLabel}</Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Items:</span>
                      <span className="text-sm font-medium">{order.items.length} items</span>
                    </div>

                    <div className="border-t pt-2 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total</span>
                        <span className="text-lg font-bold">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-muted-foreground">{order.sales_person}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/sales/orders/${order.id}`} className="flex items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {(order.status === 'draft' || order.status === 'confirmed') && (
                            <DropdownMenuItem asChild>
                              <Link href={`/sales/orders/${order.id}/edit`} className="flex items-center">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Order
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate Order
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <PrinterIcon className="mr-2 h-4 w-4" />
                            Print Order
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {order.status === 'confirmed' && (
                            <DropdownMenuItem>
                              <Send className="mr-2 h-4 w-4" />
                              Send to Production
                            </DropdownMenuItem>
                          )}
                          {order.status === 'ready' && (
                            <DropdownMenuItem>
                              <Truck className="mr-2 h-4 w-4" />
                              Mark as Shipped
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                          {order.status === 'draft' && (
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Order
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Urgent Orders Alert */}
        {summaryStats.urgentOrders > 0 && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">Urgent Orders</h3>
                <p className="text-red-700 mt-1">
                  {summaryStats.urgentOrders} orders are marked as urgent and need immediate attention.
                </p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Review Urgent
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}