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
  ViewIcon,
  PencilEdit01Icon,
  Add01Icon,
  DeleteIcon,
  Search01Icon,
  FilterHorizontalIcon,
  Download01Icon
} from '@hugeicons/core-free-icons'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'

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

// Status badge variants
const statusVariants = {
  draft: 'outline' as const,
  sent: 'secondary' as const,
  paid: 'default' as const,
  partial: 'secondary' as const,
  overdue: 'destructive' as const,
  cancelled: 'outline' as const
}

const serviceVariants = {
  regular: 'default' as const,
  express: 'secondary' as const,
  'same-day': 'outline' as const,
  cargo: 'secondary' as const,
  cod: 'default' as const
}

export default function ShippingInvoicesPage() {
  const router = useRouter()
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
          <div className={`text-sm font-medium ${amount > 0 ? 'text-destructive' : 'text-foreground'}`}>
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
          <Badge variant={statusVariants[status]}>
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
      <Header
        title="Shipping Invoices"
        description="Manage shipping invoices and payments"
        breadcrumbs={breadcrumbs}
        actions={
          <Button size="sm" onClick={() => router.push('/shipping/invoices/new')}>
            <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={Invoice01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{totalInvoices}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={Money03Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">
                  {mounted ? (outstandingAmount / 1000000).toFixed(1) : ''}M
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{overdueInvoices}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paid Amount</p>
                <p className="text-2xl font-bold">
                  {mounted ? (paidAmount / 1000000).toFixed(1) : ''}M
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center justify-end gap-2">
          {/* Note: Search and filter functionality to be implemented */}
          <div className="relative">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-9 w-64"
              aria-label="Search invoices"
            />
          </div>
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={FilterHorizontalIcon} className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
            Export
          </Button>
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
          onEdit={(invoice) => router.push(`/shipping/invoices/${invoice.id}/edit`)}
          onDelete={(invoice) => {
            if (confirm('Are you sure you want to delete this invoice?')) {
              console.log('Delete invoice', invoice.id)
            }
          }}
          customActions={[
            {
              label: 'View Invoice',
              icon: ViewIcon,
              onClick: (invoice) => router.push(`/shipping/invoices/${invoice.id}`)
            }
          ]}
        />
      </div>
    </TwoLevelLayout>
  )
}