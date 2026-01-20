'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { DataTable, Column } from '@/components/ui/data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  CreditCard,
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  Calendar,
  DollarSign,
  ShoppingCart,
  User,
  Package,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  Search
} from 'lucide-react'
import Link from 'next/link'

// POS Transaction types
interface POSTransaction {
  id: string
  transaction_number: string
  transaction_date: string
  cashier_name: string
  customer_name?: string
  customer_phone?: string
  items: POSItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_method: 'cash' | 'card' | 'transfer' | 'mixed'
  cash_received?: number
  change_amount?: number
  status: 'completed' | 'pending' | 'cancelled' | 'refunded'
  notes?: string
  created_at: string
}

interface POSItem {
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

const mockPOSTransactions: POSTransaction[] = [
  {
    id: '1',
    transaction_number: 'POS-2024-001',
    transaction_date: '2024-07-25',
    cashier_name: 'Ahmad Kasir',
    customer_name: 'Budi Santoso',
    customer_phone: '08123456789',
    items: [
      {
        id: '1',
        product_code: 'SHOE-001',
        product_name: 'Classic Oxford Brown',
        size: '42',
        color: 'Brown',
        quantity: 1,
        unit_price: 350000,
        discount_percentage: 5,
        line_total: 332500
      },
      {
        id: '2',
        product_code: 'SHOE-002',
        product_name: 'Sports Sneaker White',
        size: '40',
        color: 'White',
        quantity: 2,
        unit_price: 280000,
        discount_percentage: 0,
        line_total: 560000
      }
    ],
    subtotal: 892500,
    tax_amount: 89250,
    discount_amount: 17500,
    total_amount: 964250,
    payment_method: 'cash',
    cash_received: 1000000,
    change_amount: 35750,
    status: 'completed',
    notes: 'Customer regular, member discount applied',
    created_at: '2024-07-25T10:30:00Z'
  },
  {
    id: '2',
    transaction_number: 'POS-2024-002',
    transaction_date: '2024-07-25',
    cashier_name: 'Sari Kasir',
    customer_name: 'Rina Dewi',
    customer_phone: '08123456788',
    items: [
      {
        id: '3',
        product_code: 'BOOT-001',
        product_name: 'Work Boot Black',
        size: '38',
        color: 'Black',
        quantity: 1,
        unit_price: 450000,
        discount_percentage: 0,
        line_total: 450000
      }
    ],
    subtotal: 450000,
    tax_amount: 45000,
    discount_amount: 0,
    total_amount: 495000,
    payment_method: 'card',
    status: 'completed',
    created_at: '2024-07-25T11:15:00Z'
  },
  {
    id: '3',
    transaction_number: 'POS-2024-003',
    transaction_date: '2024-07-25',
    cashier_name: 'Ahmad Kasir',
    items: [
      {
        id: '4',
        product_code: 'SANDAL-001',
        product_name: 'Summer Sandal Brown',
        size: '41',
        color: 'Brown',
        quantity: 3,
        unit_price: 180000,
        discount_percentage: 10,
        line_total: 486000
      }
    ],
    subtotal: 486000,
    tax_amount: 48600,
    discount_amount: 54000,
    total_amount: 480600,
    payment_method: 'transfer',
    status: 'pending',
    notes: 'Waiting for payment confirmation',
    created_at: '2024-07-25T12:00:00Z'
  },
  {
    id: '4',
    transaction_number: 'POS-2024-004',
    transaction_date: '2024-07-24',
    cashier_name: 'Sari Kasir',
    customer_name: 'Dedi Susanto',
    customer_phone: '08123456787',
    items: [
      {
        id: '5',
        product_code: 'SHOE-003',
        product_name: 'Formal Loafer Black',
        size: '43',
        color: 'Black',
        quantity: 1,
        unit_price: 400000,
        discount_percentage: 0,
        line_total: 400000
      },
      {
        id: '6',
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
    subtotal: 520000,
    tax_amount: 52000,
    discount_amount: 0,
    total_amount: 572000,
    payment_method: 'mixed',
    cash_received: 300000,
    status: 'completed',
    notes: 'Payment: 300k cash + 272k card',
    created_at: '2024-07-24T16:45:00Z'
  },
  {
    id: '5',
    transaction_number: 'POS-2024-005',
    transaction_date: '2024-07-24',
    cashier_name: 'Ahmad Kasir',
    customer_name: 'Lisa Putri',
    items: [
      {
        id: '7',
        product_code: 'SHOE-004',
        product_name: 'High Heel Red',
        size: '37',
        color: 'Red',
        quantity: 1,
        unit_price: 320000,
        discount_percentage: 15,
        line_total: 272000
      }
    ],
    subtotal: 272000,
    tax_amount: 27200,
    discount_amount: 48000,
    total_amount: 251200,
    payment_method: 'card',
    status: 'refunded',
    notes: 'Item returned due to size issue',
    created_at: '2024-07-24T14:20:00Z'
  }
]

export default function POSPage() {
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('today')

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
    { label: 'Point of Sale', href: '/sales/pos' }
  ]

  // Filter transactions
  const filteredTransactions = mockPOSTransactions.filter(transaction => {
    if (searchTerm && !transaction.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !transaction.cashier_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !transaction.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (statusFilter !== 'all' && transaction.status !== statusFilter) return false
    if (paymentMethodFilter !== 'all' && transaction.payment_method !== paymentMethodFilter) return false
    return true
  })

  // Summary statistics
  const summaryStats = {
    totalTransactions: mockPOSTransactions.length,
    todayTransactions: mockPOSTransactions.filter(t => t.transaction_date === '2024-07-25').length,
    totalSales: mockPOSTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.total_amount, 0),
    pendingTransactions: mockPOSTransactions.filter(t => t.status === 'pending').length,
    completedTransactions: mockPOSTransactions.filter(t => t.status === 'completed').length,
    averageTransaction: mockPOSTransactions.length > 0 ? 
      mockPOSTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.total_amount, 0) / 
      mockPOSTransactions.filter(t => t.status === 'completed').length : 0
  }

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { variant: 'default' as const, label: 'Completed', icon: CheckCircle },
      pending: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled', icon: AlertCircle },
      refunded: { variant: 'outline' as const, label: 'Refunded', icon: AlertCircle }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status, icon: Receipt }
  }

  const getPaymentMethodBadge = (method: string) => {
    const config = {
      cash: { variant: 'default' as const, label: 'Cash' },
      card: { variant: 'secondary' as const, label: 'Card' },
      transfer: { variant: 'outline' as const, label: 'Transfer' },
      mixed: { variant: 'secondary' as const, label: 'Mixed' }
    }
    return config[method as keyof typeof config] || { variant: 'secondary' as const, label: method }
  }

  const columns: Column<POSTransaction>[] = [
    {
      key: 'transaction_number',
      title: 'Transaction',
      render: (value: unknown, transaction: POSTransaction) => (
        <Link 
          href={`/sales/pos/${transaction.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {transaction.transaction_number}
        </Link>
      )
    },
    {
      key: 'transaction_date',
      title: 'Date & Time',
      render: (value: unknown, transaction: POSTransaction) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">{formatDateTime(transaction.created_at)}</div>
          </div>
        </div>
      )
    },
    {
      key: 'cashier',
      title: 'Cashier',
      render: (value: unknown, transaction: POSTransaction) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{transaction.cashier_name}</span>
        </div>
      )
    },
    {
      key: 'customer',
      title: 'Customer',
      render: (value: unknown, transaction: POSTransaction) => (
        <div>
          <div className="font-medium">{transaction.customer_name || 'Walk-in'}</div>
          {transaction.customer_phone && (
            <div className="text-sm text-muted-foreground">{transaction.customer_phone}</div>
          )}
        </div>
      )
    },
    {
      key: 'items',
      title: 'Items',
      render: (value: unknown, transaction: POSTransaction) => (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{transaction.items.length} items</span>
        </div>
      )
    },
    {
      key: 'total_amount',
      title: 'Total',
      render: (value: unknown, transaction: POSTransaction) => (
        <div className="text-right font-medium">
          {formatCurrency(transaction.total_amount)}
        </div>
      )
    },
    {
      key: 'payment_method',
      title: 'Payment',
      render: (transaction: POSTransaction) => {
        const { variant, label } = getPaymentMethodBadge(transaction.payment_method)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'status',
      title: 'Status',
      render: (transaction: POSTransaction) => {
        const { variant, label, icon: Icon } = getStatusBadge(transaction.status)
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
      render: (value: unknown, transaction: POSTransaction) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild aria-label="View transaction details">
            <Link href={`/sales/pos/${transaction.id}`}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">View {transaction.transaction_number}</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" aria-label="Print receipt">
            <Receipt className="h-4 w-4" />
            <span className="sr-only">Print receipt for {transaction.transaction_number}</span>
          </Button>
          {transaction.status === 'pending' && (
            <Button variant="ghost" size="sm" asChild aria-label="Edit transaction">
              <Link href={`/sales/pos/${transaction.id}/edit`}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit {transaction.transaction_number}</span>
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
          title="Point of Sale (POS)"
          description="Manage retail transactions and sales"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/sales/pos/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Sale
                </Link>
              </Button>
            </div>
          }
        />

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-foreground" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today&apos;s Sales</p>
                <p className="text-2xl font-bold">{summaryStats.todayTransactions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-foreground" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {mounted ? `Rp ${(summaryStats.totalSales / 1000000).toFixed(1)}M` : ''}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-foreground" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{summaryStats.completedTransactions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-foreground" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{summaryStats.pendingTransactions}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4">
          {/* Search on the left */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          {/* Filters on the right */}
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <CheckCircle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger className="w-36">
                <CreditCard className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Toggle and Stats */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
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
          
          <div className="text-sm text-muted-foreground">
            {filteredTransactions.length} of {mockPOSTransactions.length} transactions
          </div>
        </div>

        {/* Content */}
        {activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTransactions.map((transaction) => {
              const { variant: statusVariant, label: statusLabel, icon: StatusIcon } = getStatusBadge(transaction.status)
              const { variant: paymentVariant, label: paymentLabel } = getPaymentMethodBadge(transaction.payment_method)
              
              return (
                <Card key={transaction.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link 
                        href={`/sales/pos/${transaction.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {transaction.transaction_number}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDateTime(transaction.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StatusIcon className="h-4 w-4" />
                      <Badge variant={statusVariant}>{statusLabel}</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cashier:</span>
                      <span className="text-sm font-medium">{transaction.cashier_name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Customer:</span>
                      <span className="text-sm font-medium">{transaction.customer_name || 'Walk-in'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Items:</span>
                      <span className="text-sm font-medium">{transaction.items.length} items</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payment:</span>
                      <Badge variant={paymentVariant}>{paymentLabel}</Badge>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(transaction.total_amount)}
                        </span>
                      </div>
                    </div>

                    {transaction.notes && (
                      <div className="bg-muted p-2 rounded text-sm">
                        {transaction.notes}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <DataTable
            data={filteredTransactions}
            columns={columns}
            pagination={{
              current: 1,
              pageSize: 10,
              total: filteredTransactions.length,
              onChange: () => {}
            }}
          />
        )}

        {/* Pending Alert */}
        {summaryStats.pendingTransactions > 0 && (
          <Card className="p-6 border-orange-200 bg-orange-50">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-orange-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800">Pending Transactions</h3>
                <p className="text-orange-700 mt-1">
                  {summaryStats.pendingTransactions} transactions are pending payment confirmation.
                </p>
              </div>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                Review Pending
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}