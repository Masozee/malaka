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
  RefreshCw,
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
  XCircle,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

// Returns types
interface Return {
  id: string
  return_number: string
  return_date: string
  original_transaction: string
  customer_name: string
  customer_phone?: string
  customer_email?: string
  return_type: 'defective' | 'wrong_size' | 'wrong_color' | 'customer_change' | 'damaged' | 'other'
  return_reason: string
  processed_by: string
  items: ReturnItem[]
  subtotal: number
  refund_amount: number
  refund_method: 'cash' | 'card' | 'transfer' | 'store_credit' | 'exchange'
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  approval_date?: string
  refund_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

interface ReturnItem {
  id: string
  product_code: string
  product_name: string
  size: string
  color: string
  quantity: number
  unit_price: number
  line_total: number
  condition: 'good' | 'damaged' | 'defective'
}

const mockReturns: Return[] = [
  {
    id: '1',
    return_number: 'RET-2024-001',
    return_date: '2024-07-25',
    original_transaction: 'POS-2024-001',
    customer_name: 'Budi Santoso',
    customer_phone: '08123456789',
    customer_email: 'budi@email.com',
    return_type: 'wrong_size',
    return_reason: 'Ukuran terlalu kecil, ingin tukar dengan ukuran 43',
    processed_by: 'Sari Admin',
    items: [
      {
        id: '1',
        product_code: 'SHOE-001',
        product_name: 'Classic Oxford Brown',
        size: '42',
        color: 'Brown',
        quantity: 1,
        unit_price: 350000,
        line_total: 350000,
        condition: 'good'
      }
    ],
    subtotal: 350000,
    refund_amount: 0,
    refund_method: 'exchange',
    status: 'approved',
    approval_date: '2024-07-25',
    notes: 'Exchange dengan ukuran 43, selisih harga dibayar customer',
    created_at: '2024-07-25T09:30:00Z',
    updated_at: '2024-07-25T10:15:00Z'
  },
  {
    id: '2',
    return_number: 'RET-2024-002',
    return_date: '2024-07-25',
    original_transaction: 'ON-2024-001',
    customer_name: 'Rina Dewi',
    customer_phone: '08123456788',
    customer_email: 'rina@email.com',
    return_type: 'defective',
    return_reason: 'Sol sepatu lepas setelah dipakai 2 hari',
    processed_by: 'Ahmad Admin',
    items: [
      {
        id: '2',
        product_code: 'SHOE-002',
        product_name: 'Sports Sneaker White',
        size: '38',
        color: 'White',
        quantity: 1,
        unit_price: 280000,
        line_total: 280000,
        condition: 'defective'
      }
    ],
    subtotal: 280000,
    refund_amount: 280000,
    refund_method: 'transfer',
    status: 'completed',
    approval_date: '2024-07-25',
    refund_date: '2024-07-25',
    notes: 'Produk defect, full refund disetujui',
    created_at: '2024-07-25T11:20:00Z',
    updated_at: '2024-07-25T14:30:00Z'
  },
  {
    id: '3',
    return_number: 'RET-2024-003',
    return_date: '2024-07-24',
    original_transaction: 'DS-2024-001',
    customer_name: 'Dedi Susanto',
    customer_phone: '08123456787',
    return_type: 'customer_change',
    return_reason: 'Berubah pikiran, tidak jadi beli',
    processed_by: 'Lisa Admin',
    items: [
      {
        id: '3',
        product_code: 'BOOT-001',
        product_name: 'Work Boot Black',
        size: '43',
        color: 'Black',
        quantity: 1,
        unit_price: 450000,
        line_total: 450000,
        condition: 'good'
      }
    ],
    subtotal: 450000,
    refund_amount: 427500,
    refund_method: 'cash',
    status: 'pending',
    notes: 'Dikurangi biaya restocking 5% = Rp 22,500',
    created_at: '2024-07-24T15:45:00Z',
    updated_at: '2024-07-24T15:45:00Z'
  },
  {
    id: '4',
    return_number: 'RET-2024-004',
    return_date: '2024-07-24',
    original_transaction: 'SO-2024-001',
    customer_name: 'Siti Nurhaliza',
    customer_phone: '08123456786',
    customer_email: 'siti@email.com',
    return_type: 'damaged',
    return_reason: 'Barang rusak saat pengiriman, kardus basah',
    processed_by: 'Budi Admin',
    items: [
      {
        id: '4',
        product_code: 'SHOE-003',
        product_name: 'Formal Loafer Black',
        size: '37',
        color: 'Black',
        quantity: 2,
        unit_price: 400000,
        line_total: 800000,
        condition: 'damaged'
      }
    ],
    subtotal: 800000,
    refund_amount: 800000,
    refund_method: 'store_credit',
    status: 'approved',
    approval_date: '2024-07-24',
    notes: 'Rusak saat pengiriman, customer pilih store credit',
    created_at: '2024-07-24T13:10:00Z',
    updated_at: '2024-07-24T16:20:00Z'
  },
  {
    id: '5',
    return_number: 'RET-2024-005',
    return_date: '2024-07-23',
    original_transaction: 'POS-2024-005',
    customer_name: 'Ahmad Putra',
    customer_phone: '08123456785',
    return_type: 'wrong_color',
    return_reason: 'Salah ambil warna, ingin yang coklat',
    processed_by: 'Rina Admin',
    items: [
      {
        id: '5',
        product_code: 'SANDAL-001',
        product_name: 'Summer Sandal Brown',
        size: '41',
        color: 'Black',
        quantity: 1,
        unit_price: 180000,
        line_total: 180000,
        condition: 'good'
      }
    ],
    subtotal: 180000,
    refund_amount: 0,
    refund_method: 'exchange',
    status: 'completed',
    approval_date: '2024-07-23',
    refund_date: '2024-07-23',
    notes: 'Exchange dengan warna coklat, no charge',
    created_at: '2024-07-23T10:30:00Z',
    updated_at: '2024-07-23T11:00:00Z'
  },
  {
    id: '6',
    return_number: 'RET-2024-006',
    return_date: '2024-07-23',
    original_transaction: 'ON-2024-003',
    customer_name: 'Lisa Wati',
    customer_phone: '08123456784',
    customer_email: 'lisa@email.com',
    return_type: 'other',
    return_reason: 'Tidak sesuai ekspektasi dari foto online',
    processed_by: 'Dedi Admin',
    items: [
      {
        id: '6',
        product_code: 'SHOE-004',
        product_name: 'High Heel Red',
        size: '38',
        color: 'Red',
        quantity: 1,
        unit_price: 320000,
        line_total: 320000,
        condition: 'good'
      }
    ],
    subtotal: 320000,
    refund_amount: 288000,
    refund_method: 'card',
    status: 'rejected',
    notes: 'Sudah lebih dari 7 hari, return ditolak',
    created_at: '2024-07-23T08:15:00Z',
    updated_at: '2024-07-23T09:00:00Z'
  }
]

export default function ReturnsPage() {
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [returnTypeFilter, setReturnTypeFilter] = useState<string>('all')
  const [refundMethodFilter, setRefundMethodFilter] = useState<string>('all')

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
    { label: 'Returns', href: '/sales/returns' }
  ]

  // Filter returns
  const filteredReturns = mockReturns.filter(returnItem => {
    if (searchTerm && !returnItem.return_number.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !returnItem.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !returnItem.original_transaction.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (statusFilter !== 'all' && returnItem.status !== statusFilter) return false
    if (returnTypeFilter !== 'all' && returnItem.return_type !== returnTypeFilter) return false
    if (refundMethodFilter !== 'all' && returnItem.refund_method !== refundMethodFilter) return false
    return true
  })

  // Summary statistics
  const summaryStats = {
    totalReturns: mockReturns.length,
    todayReturns: mockReturns.filter(r => r.return_date === '2024-07-25').length,
    pendingReturns: mockReturns.filter(r => r.status === 'pending').length,
    completedReturns: mockReturns.filter(r => r.status === 'completed').length,
    totalRefundAmount: mockReturns.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.refund_amount, 0),
    averageRefund: mockReturns.filter(r => r.status === 'completed' && r.refund_amount > 0).length > 0 ?
      mockReturns.filter(r => r.status === 'completed' && r.refund_amount > 0).reduce((sum, r) => sum + r.refund_amount, 0) /
      mockReturns.filter(r => r.status === 'completed' && r.refund_amount > 0).length : 0
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
      approved: { variant: 'default' as const, label: 'Approved', icon: CheckCircle },
      rejected: { variant: 'destructive' as const, label: 'Rejected', icon: XCircle },
      completed: { variant: 'default' as const, label: 'Completed', icon: CheckCircle },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled', icon: AlertCircle }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status, icon: RefreshCw }
  }

  const getReturnTypeBadge = (type: string) => {
    const config = {
      defective: { variant: 'destructive' as const, label: 'Defective' },
      wrong_size: { variant: 'secondary' as const, label: 'Wrong Size' },
      wrong_color: { variant: 'secondary' as const, label: 'Wrong Color' },
      customer_change: { variant: 'outline' as const, label: 'Customer Change' },
      damaged: { variant: 'destructive' as const, label: 'Damaged' },
      other: { variant: 'secondary' as const, label: 'Other' }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type }
  }

  const getRefundMethodBadge = (method: string) => {
    const config = {
      cash: { variant: 'default' as const, label: 'Cash' },
      card: { variant: 'secondary' as const, label: 'Card' },
      transfer: { variant: 'outline' as const, label: 'Transfer' },
      store_credit: { variant: 'secondary' as const, label: 'Store Credit' },
      exchange: { variant: 'default' as const, label: 'Exchange' }
    }
    return config[method as keyof typeof config] || { variant: 'secondary' as const, label: method }
  }

  const columns = [
    {
      key: 'return_number',
      title: 'Return Number',
      render: (returnItem: Return) => (
        <Link 
          href={`/sales/returns/${returnItem.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {returnItem.return_number}
        </Link>
      )
    },
    {
      key: 'return_date',
      title: 'Date',
      render: (returnItem: Return) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(returnItem.return_date)}</span>
        </div>
      )
    },
    {
      key: 'original_transaction',
      title: 'Original Order',
      render: (returnItem: Return) => (
        <div className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{returnItem.original_transaction}</span>
        </div>
      )
    },
    {
      key: 'customer',
      title: 'Customer',
      render: (returnItem: Return) => (
        <div>
          <div className="font-medium">{returnItem.customer_name}</div>
          {returnItem.customer_phone && (
            <div className="text-sm text-muted-foreground">{returnItem.customer_phone}</div>
          )}
        </div>
      )
    },
    {
      key: 'return_type',
      title: 'Type',
      render: (returnItem: Return) => {
        const { variant, label } = getReturnTypeBadge(returnItem.return_type)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'items',
      title: 'Items',
      render: (returnItem: Return) => (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{returnItem.items.length} items</span>
        </div>
      )
    },
    {
      key: 'refund_amount',
      title: 'Refund Amount',
      render: (returnItem: Return) => (
        <div className="text-right">
          <div className="font-medium">
            {returnItem.refund_amount > 0 ? formatCurrency(returnItem.refund_amount) : 'Exchange'}
          </div>
        </div>
      )
    },
    {
      key: 'refund_method',
      title: 'Refund Method',
      render: (returnItem: Return) => {
        const { variant, label } = getRefundMethodBadge(returnItem.refund_method)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'status',
      title: 'Status',
      render: (returnItem: Return) => {
        const { variant, label, icon: Icon } = getStatusBadge(returnItem.status)
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
      render: (returnItem: Return) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/sales/returns/${returnItem.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {returnItem.status === 'pending' && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/sales/returns/${returnItem.id}/edit`}>
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
          title="Returns & Refunds"
          description="Manage product returns and customer refunds"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/sales/returns/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Return
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
                <p className="text-sm font-medium text-muted-foreground">Today&apos;s Returns</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.todayReturns}</p>
                <p className="text-sm text-blue-600 mt-1">New returns</p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{summaryStats.pendingReturns}</p>
                <p className="text-sm text-orange-600 mt-1">Need approval</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{summaryStats.completedReturns}</p>
                <p className="text-sm text-green-600 mt-1">Processed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Refunds</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `Rp ${(summaryStats.totalRefundAmount / 1000000).toFixed(1)}M` : ''}
                </p>
                <p className="text-sm text-red-600 mt-1">Refunded amount</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Refund</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `Rp ${(summaryStats.averageRefund / 1000).toFixed(0)}K` : ''}
                </p>
                <p className="text-sm text-purple-600 mt-1">Per return</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Returns</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalReturns}</p>
                <p className="text-sm text-gray-600 mt-1">All time</p>
              </div>
              <User className="h-8 w-8 text-gray-600" />
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
                    placeholder="Search returns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnType">Return Type</Label>
                <Select value={returnTypeFilter} onValueChange={setReturnTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="defective">Defective</SelectItem>
                    <SelectItem value="wrong_size">Wrong Size</SelectItem>
                    <SelectItem value="wrong_color">Wrong Color</SelectItem>
                    <SelectItem value="customer_change">Customer Change</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refundMethod">Refund Method</Label>
                <Select value={refundMethodFilter} onValueChange={setRefundMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="store_credit">Store Credit</SelectItem>
                    <SelectItem value="exchange">Exchange</SelectItem>
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
            {filteredReturns.map((returnItem) => {
              const { variant: statusVariant, label: statusLabel, icon: StatusIcon } = getStatusBadge(returnItem.status)
              const { variant: typeVariant, label: typeLabel } = getReturnTypeBadge(returnItem.return_type)
              const { variant: refundVariant, label: refundLabel } = getRefundMethodBadge(returnItem.refund_method)
              
              return (
                <Card key={returnItem.id} className="p-6 hover: transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link 
                        href={`/sales/returns/${returnItem.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {returnItem.return_number}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(returnItem.return_date)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-1">
                        <StatusIcon className="h-4 w-4" />
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </div>
                      <Badge variant={typeVariant}>{typeLabel}</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Customer:</span>
                      <span className="text-sm font-medium">{returnItem.customer_name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Original Order:</span>
                      <span className="text-sm font-mono">{returnItem.original_transaction}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Processed By:</span>
                      <span className="text-sm font-medium">{returnItem.processed_by}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Items:</span>
                      <span className="text-sm font-medium">{returnItem.items.length} items</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Refund Method:</span>
                      <Badge variant={refundVariant}>{refundLabel}</Badge>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Refund Amount</span>
                        <span className="text-lg font-bold text-red-600">
                          {returnItem.refund_amount > 0 ? formatCurrency(returnItem.refund_amount) : 'Exchange'}
                        </span>
                      </div>
                    </div>

                    {returnItem.return_reason && (
                      <div className="bg-muted p-2 rounded text-sm">
                        <div className="font-medium text-muted-foreground mb-1">Reason:</div>
                        {returnItem.return_reason}
                      </div>
                    )}

                    {returnItem.notes && (
                      <div className="bg-blue-50 p-2 rounded text-sm">
                        <div className="font-medium text-blue-700 mb-1">Notes:</div>
                        {returnItem.notes}
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
              <h3 className="text-lg font-semibold">Returns & Refunds</h3>
              <p className="text-sm text-muted-foreground">Manage all product returns and customer refunds</p>
            </div>
            <AdvancedDataTable
              data={filteredReturns}
              columns={columns}
              searchable={false}
              filterable={false}
              pagination={{
                pageSize: 10,
                currentPage: 1,
                totalPages: Math.ceil(filteredReturns.length / 10),
                totalItems: filteredReturns.length,
                onChange: () => {}
              }}
            />
          </Card>
        )}

        {/* Pending Returns Alert */}
        {summaryStats.pendingReturns > 0 && (
          <Card className="p-6 border-orange-200 bg-orange-50">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-orange-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800">Pending Returns</h3>
                <p className="text-orange-700 mt-1">
                  {summaryStats.pendingReturns} returns are pending approval and need review.
                </p>
              </div>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                Review Returns
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}