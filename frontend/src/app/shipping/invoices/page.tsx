'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Badge } from '@/components/ui/badge'
import { 
  Receipt,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  Eye
} from 'lucide-react'

interface ShippingInvoice {
  id: string
  invoiceNumber: string
  courierName: string
  courierCode: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled'
  paymentTerms: string
  totalShipments: number
  invoicePeriod: string
  currency: string
  notes?: string
  services: ShippingService[]
}

interface ShippingService {
  id: string
  serviceType: 'regular' | 'express' | 'same-day' | 'cargo' | 'cod'
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  taxAmount: number
}

// Mock shipping invoice data
const mockShippingInvoices: ShippingInvoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-JNE-2024-001',
    courierName: 'JNE Express',
    courierCode: 'JNE',
    invoiceDate: '2024-07-20',
    dueDate: '2024-08-19',
    totalAmount: 15750000,
    paidAmount: 15750000,
    outstandingAmount: 0,
    status: 'paid',
    paymentTerms: 'NET 30',
    totalShipments: 125,
    invoicePeriod: 'July 2024',
    currency: 'IDR',
    services: [
      {
        id: '1',
        serviceType: 'regular',
        description: 'Regular Delivery Service',
        quantity: 85,
        unitPrice: 120000,
        totalPrice: 10200000,
        taxAmount: 1020000
      },
      {
        id: '2',
        serviceType: 'express',
        description: 'Express Delivery Service',
        quantity: 40,
        unitPrice: 180000,
        totalPrice: 7200000,
        taxAmount: 720000
      }
    ]
  },
  {
    id: '2',
    invoiceNumber: 'INV-TIKI-2024-002',
    courierName: 'TIKI',
    courierCode: 'TIKI',
    invoiceDate: '2024-07-22',
    dueDate: '2024-08-21',
    totalAmount: 8900000,
    paidAmount: 5000000,
    outstandingAmount: 3900000,
    status: 'partial',
    paymentTerms: 'NET 30',
    totalShipments: 78,
    invoicePeriod: 'July 2024',
    currency: 'IDR',
    services: [
      {
        id: '3',
        serviceType: 'regular',
        description: 'Regular Delivery Service',
        quantity: 60,
        unitPrice: 110000,
        totalPrice: 6600000,
        taxAmount: 660000
      },
      {
        id: '4',
        serviceType: 'same-day',
        description: 'Same Day Delivery',
        quantity: 18,
        unitPrice: 250000,
        totalPrice: 4500000,
        taxAmount: 450000
      }
    ]
  },
  {
    id: '3',
    invoiceNumber: 'INV-POS-2024-003',
    courierName: 'Pos Indonesia',
    courierCode: 'POS',
    invoiceDate: '2024-07-18',
    dueDate: '2024-08-17',
    totalAmount: 6750000,
    paidAmount: 0,
    outstandingAmount: 6750000,
    status: 'overdue',
    paymentTerms: 'NET 30',
    totalShipments: 95,
    invoicePeriod: 'July 2024',
    currency: 'IDR',
    notes: 'Payment overdue - follow up required',
    services: [
      {
        id: '5',
        serviceType: 'regular',
        description: 'Regular Postal Service',
        quantity: 95,
        unitPrice: 65000,
        totalPrice: 6175000,
        taxAmount: 617500
      }
    ]
  },
  {
    id: '4',
    invoiceNumber: 'INV-JNT-2024-004',
    courierName: 'J&T Express',
    courierCode: 'JNT',
    invoiceDate: '2024-07-25',
    dueDate: '2024-08-24',
    totalAmount: 12300000,
    paidAmount: 0,
    outstandingAmount: 12300000,
    status: 'sent',
    paymentTerms: 'NET 30',
    totalShipments: 102,
    invoicePeriod: 'July 2024',
    currency: 'IDR',
    services: [
      {
        id: '6',
        serviceType: 'regular',
        description: 'Regular Delivery Service',
        quantity: 70,
        unitPrice: 125000,
        totalPrice: 8750000,
        taxAmount: 875000
      },
      {
        id: '7',
        serviceType: 'cod',
        description: 'Cash on Delivery Service',
        quantity: 32,
        unitPrice: 180000,
        totalPrice: 5760000,
        taxAmount: 576000
      }
    ]
  },
  {
    id: '5',
    invoiceNumber: 'INV-SICEPAT-2024-005',
    courierName: 'SiCepat',
    courierCode: 'SICEPAT',
    invoiceDate: '2024-07-23',
    dueDate: '2024-08-22',
    totalAmount: 9850000,
    paidAmount: 0,
    outstandingAmount: 9850000,
    status: 'sent',
    paymentTerms: 'NET 30',
    totalShipments: 89,
    invoicePeriod: 'July 2024',
    currency: 'IDR',
    services: [
      {
        id: '8',
        serviceType: 'express',
        description: 'Express Delivery Service',
        quantity: 65,
        unitPrice: 140000,
        totalPrice: 9100000,
        taxAmount: 910000
      },
      {
        id: '9',
        serviceType: 'cargo',
        description: 'Cargo Service',
        quantity: 24,
        unitPrice: 300000,
        totalPrice: 7200000,
        taxAmount: 720000
      }
    ]
  },
  {
    id: '6',
    invoiceNumber: 'INV-LION-2024-006',
    courierName: 'Lion Parcel',
    courierCode: 'LION',
    invoiceDate: '2024-07-19',
    dueDate: '2024-08-18',
    totalAmount: 7200000,
    paidAmount: 7200000,
    outstandingAmount: 0,
    status: 'paid',
    paymentTerms: 'NET 30',
    totalShipments: 56,
    invoicePeriod: 'July 2024',
    currency: 'IDR',
    services: [
      {
        id: '10',
        serviceType: 'regular',
        description: 'Regular Delivery Service',
        quantity: 56,
        unitPrice: 115000,
        totalPrice: 6440000,
        taxAmount: 644000
      }
    ]
  },
  {
    id: '7',
    invoiceNumber: 'INV-ANTERAJA-2024-007',
    courierName: 'AnterAja',
    courierCode: 'ANTERAJA',
    invoiceDate: '2024-07-21',
    dueDate: '2024-08-20',
    totalAmount: 5400000,
    paidAmount: 0,
    outstandingAmount: 5400000,
    status: 'draft',
    paymentTerms: 'NET 30',
    totalShipments: 45,
    invoicePeriod: 'July 2024',
    currency: 'IDR',
    services: [
      {
        id: '11',
        serviceType: 'regular',
        description: 'Regular Delivery Service',
        quantity: 45,
        unitPrice: 108000,
        totalPrice: 4860000,
        taxAmount: 486000
      }
    ]
  }
]

// Status color mappings
const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

const serviceColors = {
  regular: 'bg-blue-100 text-blue-800',
  express: 'bg-purple-100 text-purple-800',
  'same-day': 'bg-orange-100 text-orange-800',
  cargo: 'bg-teal-100 text-teal-800',
  cod: 'bg-green-100 text-green-800'
}

export default function ShippingInvoicesPage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Shipping', href: '/shipping' },
    { label: 'Shipping Invoices', href: '/shipping/invoices' }
  ]

  // Calculate statistics
  const totalInvoices = mockShippingInvoices.length
  const paidInvoices = mockShippingInvoices.filter(inv => inv.status === 'paid').length
  const pendingInvoices = mockShippingInvoices.filter(inv => ['sent', 'partial'].includes(inv.status)).length
  const overdueInvoices = mockShippingInvoices.filter(inv => inv.status === 'overdue').length
  const totalAmount = mockShippingInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const paidAmount = mockShippingInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
  const outstandingAmount = mockShippingInvoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0)
  const paymentRate = (paidAmount / totalAmount) * 100

  const columns = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('invoiceNumber')}</div>
          <div className="text-sm text-gray-500">{row.original.courierName}</div>
        </div>
      )
    },
    {
      accessorKey: 'invoicePeriod',
      header: 'Period',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.getValue('invoicePeriod')}</div>
      )
    },
    {
      accessorKey: 'totalShipments',
      header: 'Shipments',
      cell: ({ row }: any) => (
        <div className="text-center font-medium">{row.getValue('totalShipments')}</div>
      )
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }: any) => (
        <div className="text-sm font-medium">
          {mounted ? row.getValue('totalAmount').toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
        </div>
      )
    },
    {
      accessorKey: 'outstandingAmount',
      header: 'Outstanding',
      cell: ({ row }: any) => {
        const amount = row.getValue('outstandingAmount') as number
        return (
          <div className={`text-sm font-medium ${amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {mounted ? amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
          </div>
        )
      }
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {mounted ? new Date(row.getValue('dueDate')).toLocaleDateString('id-ID') : ''}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status') as keyof typeof statusColors
        return (
          <Badge className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'paymentTerms',
      header: 'Terms',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.getValue('paymentTerms')}</div>
      )
    }
  ]

  const InvoiceCard = ({ invoice }: { invoice: ShippingInvoice }) => {
    const paymentProgress = (invoice.paidAmount / invoice.totalAmount) * 100
    
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
            <p className="text-sm text-gray-500">{invoice.courierName}</p>
          </div>
          <Badge className={statusColors[invoice.status]}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Period:</span>
            <span>{invoice.invoicePeriod}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Shipments:</span>
            <span className="font-medium">{invoice.totalShipments}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Total Amount:</span>
            <span className="font-medium">
              {mounted ? invoice.totalAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Paid Amount:</span>
            <span className="text-green-600 font-medium">
              {mounted ? invoice.paidAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Outstanding:</span>
            <span className={`font-medium ${invoice.outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {mounted ? invoice.outstandingAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Due Date:</span>
            <span>{mounted ? new Date(invoice.dueDate).toLocaleDateString('id-ID') : ''}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Progress:</span>
            <span className="font-medium">{paymentProgress.toFixed(1)}%</span>
          </div>
          
          {invoice.notes && (
            <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
              <span className="font-medium text-yellow-800">Notes: </span>
              <span className="text-yellow-700">{invoice.notes}</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2 mt-4">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Shipping Invoices"
          breadcrumbs={breadcrumbs}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{paidInvoices}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingInvoices}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueInvoices}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mounted ? (totalAmount / 1000000).toFixed(0) : ''}M
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {mounted ? (outstandingAmount / 1000000).toFixed(0) : ''}M
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Payment Rate</p>
                <p className="text-2xl font-bold text-teal-600">
                  {mounted ? paymentRate.toFixed(1) : ''}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* View Toggle and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Payment Schedule
            </Button>
            <Button variant="outline" size="sm">Export</Button>
            <Button size="sm">
              <Receipt className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Data Display */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockShippingInvoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        ) : (
          <Card>
            <AdvancedDataTable
              data={mockShippingInvoices}
              columns={columns}
              searchPlaceholder="Search invoice numbers, couriers, or periods..."
              showFilters={true}
            />
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}