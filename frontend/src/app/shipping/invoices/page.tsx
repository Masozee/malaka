'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Invoice01Icon,
  CheckmarkCircle01Icon,
  Time04Icon,
  AlertCircleIcon,
  Money03Icon,
  ChartBarLineIcon,
  PercentCircleIcon
} from '@hugeicons/core-free-icons'

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
  const paymentRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0

  const columns: TanStackColumn<ShippingInvoice>[] = [
    {
      accessorKey: 'invoiceNumber',
      id: 'invoiceNumber',
      header: 'Invoice',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.invoiceNumber}</div>
          <div className="text-sm text-gray-500">{row.original.courierName}</div>
        </div>
      )
    },
    {
      accessorKey: 'invoicePeriod',
      id: 'invoicePeriod',
      header: 'Period',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.invoicePeriod}</div>
      )
    },
    {
      accessorKey: 'totalShipments',
      id: 'totalShipments',
      header: 'Shipments',
      cell: ({ row }) => (
        <div className="text-center font-medium">{row.original.totalShipments}</div>
      )
    },
    {
      accessorKey: 'totalAmount',
      id: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }) => (
        <div className="text-sm font-medium">
          {mounted ? row.original.totalAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
        </div>
      )
    },
    {
      accessorKey: 'outstandingAmount',
      id: 'outstandingAmount',
      header: 'Outstanding',
      cell: ({ row }) => {
        const amount = row.original.outstandingAmount
        return (
          <div className={`text-sm font-medium ${amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {mounted ? amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
          </div>
        )
      }
    },
    {
      accessorKey: 'dueDate',
      id: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <div className="text-sm">
          {mounted ? new Date(row.original.dueDate).toLocaleDateString('id-ID') : ''}
        </div>
      )
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'paymentTerms',
      id: 'paymentTerms',
      header: 'Terms',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.paymentTerms}</div>
      )
    }
  ]

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
                <HugeiconsIcon icon={Invoice01Icon} className="h-5 w-5 text-blue-600" />
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
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-green-600" />
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
                <HugeiconsIcon icon={Time04Icon} className="h-5 w-5 text-yellow-600" />
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
                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-red-600" />
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
                <HugeiconsIcon icon={Money03Icon} className="h-5 w-5 text-purple-600" />
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
                <HugeiconsIcon icon={ChartBarLineIcon} className="h-5 w-5 text-indigo-600" />
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
                <HugeiconsIcon icon={PercentCircleIcon} className="h-5 w-5 text-teal-600" />
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

        {/* Action Bar */}
        <div className="flex items-center justify-end space-x-2">
          <Button variant="outline" size="sm">
            Payment Schedule
          </Button>
          <Button variant="outline" size="sm">Export</Button>
          <Button size="sm">
            Create Invoice
          </Button>
        </div>

        <Card>
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Invoices</h3>
            <p className="text-sm text-muted-foreground">Manage shipping invoices and payments</p>
          </div>
          <TanStackDataTable
            data={mockShippingInvoices}
            columns={columns}
            pagination={{
              pageIndex: 0,
              pageSize: 10,
              totalRows: mockShippingInvoices.length,
              onPageChange: () => { }
            }}
          />
        </Card>
      </div>
    </TwoLevelLayout>
  )
}