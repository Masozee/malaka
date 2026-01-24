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

import Link from 'next/link'
import { ConversionModal } from '@/components/quotation-conversion-modal'
import { QuotationConversionService, ConversionResult } from '@/services/quotation-conversion'

// Quotation types
interface Quotation {
  id: string
  quotation_number: string
  quotation_date: string
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  sales_person: string
  quotation_type: 'standard' | 'custom' | 'bulk' | 'export'
  delivery_address: string
  items: QuotationItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  shipping_cost: number
  total_amount: number
  status: 'draft' | 'sent' | 'reviewed' | 'approved' | 'rejected' | 'expired' | 'converted'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  payment_terms: string
  valid_until: string
  notes?: string
  created_at: string
  updated_at: string
}

interface QuotationItem {
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

const mockQuotations: Quotation[] = [
  {
    id: '1',
    quotation_number: 'QT-2024-001',
    quotation_date: '2024-07-25',
    customer_id: '1',
    customer_name: 'Toko Sepatu Merdeka',
    customer_email: 'merdeka@tokosepatu.com',
    customer_phone: '08123456789',
    sales_person: 'Ahmad Sales',
    quotation_type: 'bulk',
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
    status: 'sent',
    priority: 'high',
    payment_terms: 'Net 30',
    valid_until: '2024-08-25',
    notes: 'Bulk quotation for grand opening',
    created_at: '2024-07-25T09:00:00Z',
    updated_at: '2024-07-25T14:30:00Z'
  },
  {
    id: '2',
    quotation_number: 'QT-2024-002',
    quotation_date: '2024-07-25',
    customer_id: '2',
    customer_name: 'Fashion Store Bandung',
    customer_email: 'bandung@fashionstore.com',
    customer_phone: '08123456788',
    sales_person: 'Sari Sales',
    quotation_type: 'standard',
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
    status: 'approved',
    priority: 'normal',
    payment_terms: 'Net 14',
    valid_until: '2024-08-08',
    notes: 'Special collection quotation',
    created_at: '2024-07-25T10:15:00Z',
    updated_at: '2024-07-25T11:00:00Z'
  },
  {
    id: '3',
    quotation_number: 'QT-2024-003',
    quotation_date: '2024-07-24',
    customer_id: '3',
    customer_name: 'Distributor Surabaya',
    customer_email: 'surabaya@distributor.com',
    customer_phone: '08123456787',
    sales_person: 'Budi Sales',
    quotation_type: 'bulk',
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
    status: 'converted',
    priority: 'normal',
    payment_terms: 'Net 45',
    valid_until: '2024-08-28',
    created_at: '2024-07-24T13:20:00Z',
    updated_at: '2024-07-25T09:45:00Z'
  },
  {
    id: '4',
    quotation_number: 'QT-2024-004',
    quotation_date: '2024-07-24',
    customer_id: '4',
    customer_name: 'Export Partner Singapore',
    customer_email: 'singapore@exportpartner.com',
    customer_phone: '+65987654321',
    sales_person: 'Rina Sales',
    quotation_type: 'export',
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
    status: 'reviewed',
    priority: 'urgent',
    payment_terms: 'Prepaid',
    valid_until: '2024-07-30',
    notes: 'Export quotation - tax free, include all export documents',
    created_at: '2024-07-24T08:00:00Z',
    updated_at: '2024-07-24T16:30:00Z'
  },
  {
    id: '5',
    quotation_number: 'QT-2024-005',
    quotation_date: '2024-07-23',
    customer_id: '5',
    customer_name: 'Mall Department Store',
    customer_email: 'mall@department.com',
    customer_phone: '08123456785',
    sales_person: 'Dedi Sales',
    quotation_type: 'bulk',
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
    status: 'expired',
    priority: 'normal',
    payment_terms: 'Net 21',
    valid_until: '2024-07-20',
    created_at: '2024-07-23T11:30:00Z',
    updated_at: '2024-07-25T10:00:00Z'
  },
  {
    id: '6',
    quotation_number: 'QT-2024-006',
    quotation_date: '2024-07-23',
    customer_id: '6',
    customer_name: 'Startup Fashion Co',
    customer_email: 'startup@fashion.com',
    customer_phone: '08123456784',
    sales_person: 'Lisa Sales',
    quotation_type: 'custom',
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
    status: 'rejected',
    priority: 'low',
    payment_terms: 'Net 7',
    valid_until: '2024-07-30',
    notes: 'Rejected due to pricing concerns',
    created_at: '2024-07-23T15:45:00Z',
    updated_at: '2024-July-23T16:00:00Z'
  }
]

export default function QuotationsPage() {
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([])
  const [showConversionModal, setShowConversionModal] = useState(false)
  const [conversionType, setConversionType] = useState<'sales-order' | 'invoice'>('sales-order')
  const [selectedQuotationForConversion, setSelectedQuotationForConversion] = useState<Quotation | null>(null)
  const [bulkConverting, setBulkConverting] = useState(false)

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
    { label: 'Quotations', href: '/sales/quotations' }
  ]

  // Filter quotations
  const filteredQuotations = mockQuotations.filter(quotation => {
    if (searchTerm && !quotation.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !quotation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !quotation.sales_person.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (statusFilter !== 'all' && quotation.status !== statusFilter) return false
    if (priorityFilter !== 'all' && quotation.priority !== priorityFilter) return false
    if (typeFilter !== 'all' && quotation.quotation_type !== typeFilter) return false
    return true
  })

  // Conversion handlers
  const openConversionModal = (quotation: Quotation, type: 'sales-order' | 'invoice') => {
    setSelectedQuotationForConversion(quotation)
    setConversionType(type)
    setShowConversionModal(true)
  }

  const handleConversionSuccess = (result: ConversionResult) => {
    if (result.success && selectedQuotationForConversion) {
      // Update the quotation status in the list
      // In real app, this would refetch data or update state
      console.log('Conversion successful:', result)
    }
    setShowConversionModal(false)
    setSelectedQuotationForConversion(null)
  }

  const handleBulkConvertToSalesOrders = async () => {
    if (selectedQuotations.length === 0) return

    setBulkConverting(true)
    try {
      const results = await QuotationConversionService.bulkConvertToSalesOrders(selectedQuotations)
      const successCount = results.filter(r => r.success).length
      
      // Show success message
      console.log(`Successfully converted ${successCount} of ${selectedQuotations.length} quotations to sales orders`)
      
      // Clear selection
      setSelectedQuotations([])
      
      // In real app, refresh the data
    } catch (error) {
      console.error('Bulk conversion error:', error)
    } finally {
      setBulkConverting(false)
    }
  }

  // Bulk action handlers
  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for quotations:`)
    // TODO: Implement bulk actions
  }

  // Summary statistics
  const summaryStats = {
    totalQuotations: mockQuotations.length,
    todayQuotations: mockQuotations.filter(q => q.quotation_date === '2024-07-25').length,
    totalValue: mockQuotations.filter(q => q.status !== 'rejected' && q.status !== 'expired').reduce((sum, q) => sum + q.total_amount, 0),
    sentQuotations: mockQuotations.filter(q => q.status === 'sent').length,
    approvedQuotations: mockQuotations.filter(q => q.status === 'approved').length,
    convertedQuotations: mockQuotations.filter(q => q.status === 'converted').length,
    urgentQuotations: mockQuotations.filter(q => q.priority === 'urgent').length
  }

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { variant: 'outline' as const, label: 'Draft' },
      sent: { variant: 'default' as const, label: 'Sent' },
      reviewed: { variant: 'secondary' as const, label: 'Reviewed' },
      approved: { variant: 'default' as const, label: 'Approved' },
      rejected: { variant: 'outline' as const, label: 'Rejected' },
      expired: { variant: 'outline' as const, label: 'Expired' },
      converted: { variant: 'default' as const, label: 'Converted' }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status }
  }

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: { variant: 'outline' as const, label: 'Low' },
      normal: { variant: 'secondary' as const, label: 'Normal' },
      high: { variant: 'default' as const, label: 'High' },
      urgent: { variant: 'destructive' as const, label: 'Urgent' }
    }
    return config[priority as keyof typeof config] || { variant: 'secondary' as const, label: priority }
  }

  const getTypeBadge = (type: string) => {
    const config = {
      standard: { variant: 'default' as const, label: 'Standard' },
      custom: { variant: 'secondary' as const, label: 'Custom' },
      bulk: { variant: 'outline' as const, label: 'Bulk' },
      export: { variant: 'secondary' as const, label: 'Export' }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type }
  }

  const columns: Column<Quotation>[] = [
    {
      key: 'quotation_number',
      title: 'Quotation Number',
      sortable: true,
      render: (quotationNumber: unknown, quotation: Quotation) => (
        <Link 
          href={`/sales/quotations/${quotation.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {quotationNumber as string}
        </Link>
      )
    },
    {
      key: 'quotation_date',
      title: 'Date',
      sortable: true,
      render: (date: unknown) => formatDate(date as string),
      width: '120px'
    },
    {
      key: 'customer_name',
      title: 'Customer',
      render: (customerName: unknown, quotation: Quotation) => (
        <div>
          <div className="font-medium">{customerName as string}</div>
          <div className="text-sm text-muted-foreground">{quotation.customer_email}</div>
        </div>
      )
    },
    {
      key: 'sales_person',
      title: 'Sales Person',
      render: (salesPerson: unknown) => salesPerson as string
    },
    {
      key: 'quotation_type',
      title: 'Type',
      render: (quotationType: unknown) => {
        const { variant, label } = getTypeBadge(quotationType as string)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'items',
      title: 'Items',
      render: (items: unknown) => `${(items as QuotationItem[]).length} items`
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
      key: 'valid_until',
      title: 'Valid Until',
      render: (validUntil: unknown) => formatDate(validUntil as string),
      width: '120px'
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (priority: unknown) => {
        const { variant, label } = getPriorityBadge(priority as string)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'status',
      title: 'Status',
      render: (status: unknown) => {
        const { variant, label } = getStatusBadge(status as string)
        return <Badge variant={variant}>{label}</Badge>
      }
    }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Quotations"
        description="Manage customer quotations and sales proposals"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            {selectedQuotations.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleBulkConvertToSalesOrders}
                  disabled={bulkConverting}
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {bulkConverting ? 'Converting...' : `Convert ${selectedQuotations.length} to Orders`}
                </Button>
              </>
            )}
            <Button variant="outline">
              <DownloadSimple className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button asChild>
              <Link href="/sales/quotations/new">
                <Plus className="h-4 w-4 mr-2" />
                New Quotation
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
                <Quote className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Quotations</p>
                <p className="text-2xl font-bold">{summaryStats.todayQuotations}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <CurrencyDollar className="h-5 w-5 text-foreground" />
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
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{summaryStats.approvedQuotations}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <WarningCircle className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold">{summaryStats.urgentQuotations}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quotations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Showing {filteredQuotations.length} items
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Funnel className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <WarningCircle className="h-4 w-4 mr-2" />
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
            data={filteredQuotations}
            columns={columns}
            loading={false}
            batchSelection={true}
            onEdit={(quotation) => {
              // Handle edit
              console.log('Edit quotation:', quotation)
            }}
            onDelete={(quotation) => {
              // Handle delete
              console.log('Delete quotation:', quotation)
            }}
            onBatchDelete={(quotations) => {
              // Handle batch delete
              console.log('Batch delete quotations:', quotations)
            }}
            pagination={{
              current: 1,
              pageSize: 15,
              total: filteredQuotations.length,
              onChange: () => {}
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuotations.map((quotation) => {
              const { variant: statusVariant, label: statusLabel } = getStatusBadge(quotation.status)
              const { variant: priorityVariant, label: priorityLabel } = getPriorityBadge(quotation.priority)
              const { variant: typeVariant, label: typeLabel } = getTypeBadge(quotation.quotation_type)
              
              return (
                <Card key={quotation.id} className="p-4 hover: transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Link 
                        href={`/sales/quotations/${quotation.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {quotation.quotation_number}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(quotation.quotation_date)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant={statusVariant}>{statusLabel}</Badge>
                      <Badge variant={priorityVariant}>{priorityLabel}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Customer:</span>
                      <span className="text-sm font-medium">{quotation.customer_name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sales Person:</span>
                      <span className="text-sm font-medium">{quotation.sales_person}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <Badge variant={typeVariant}>{typeLabel}</Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Items:</span>
                      <span className="text-sm font-medium">{quotation.items.length} items</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Valid Until:</span>
                      <span className="text-sm font-medium">{formatDate(quotation.valid_until)}</span>
                    </div>

                    <div className="border-t pt-2 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total</span>
                        <span className="text-lg font-bold">
                          {formatCurrency(quotation.total_amount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-muted-foreground">{quotation.sales_person}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <DotsThree className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/sales/quotations/${quotation.id}`} className="flex items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {(quotation.status === 'draft' || quotation.status === 'sent') && (
                            <DropdownMenuItem asChild>
                              <Link href={`/sales/quotations/${quotation.id}/edit`} className="flex items-center">
                                <PencilSimple className="mr-2 h-4 w-4" />
                                Edit Quotation
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate Quotation
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Quotation
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {quotation.status === 'draft' && (
                            <DropdownMenuItem>
                              <PaperPlaneTilt className="mr-2 h-4 w-4" />
                              Send to Customer
                            </DropdownMenuItem>
                          )}
                          {(quotation.status === 'approved' || quotation.status === 'sent') && new Date(quotation.valid_until) >= new Date() && (
                            <>
                              <DropdownMenuItem onClick={() => openConversionModal(quotation, 'sales-order')}>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Convert to Order
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openConversionModal(quotation, 'invoice')}>
                                <Receipt className="mr-2 h-4 w-4" />
                                Convert to Invoice
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                          {quotation.status === 'draft' && (
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Quotation
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

        {/* Urgent Quotations Alert */}
        {summaryStats.urgentQuotations > 0 && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <WarningCircle className="h-6 w-6 text-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">Urgent Quotations</h3>
                <p className="text-red-700 mt-1">
                  {summaryStats.urgentQuotations} quotations are marked as urgent and need immediate attention.
                </p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Review Urgent
              </Button>
            </div>
          </Card>
        )}

        {/* Conversion Modal */}
        <ConversionModal
          isOpen={showConversionModal}
          onClose={() => setShowConversionModal(false)}
          quotation={selectedQuotationForConversion}
          type={conversionType}
          onSuccess={handleConversionSuccess}
        />
      </div>
    </TwoLevelLayout>
  )
}