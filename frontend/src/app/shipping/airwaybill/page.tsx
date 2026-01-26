'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Invoice01Icon,
  CheckmarkCircle01Icon,
  PrinterIcon,
  DeliveryTruck01Icon,
  AlertCircleIcon,
  Money03Icon,
  ViewIcon,
  PencilEdit01Icon,
  Download01Icon,
  ScanIcon,
  Add01Icon,
  FilterHorizontalIcon,
  Search01Icon,
  DeleteIcon
} from '@hugeicons/core-free-icons'
import { useRouter } from 'next/navigation'

import Link from 'next/link'

// Airwaybill types
interface Airwaybill {
  id: string
  awb_number: string
  booking_code: string
  shipment_id: string
  order_number: string
  courier_id: string
  courier_name: string
  service_type: string
  origin_city: string
  destination_city: string
  sender_name: string
  sender_phone: string
  sender_address: string
  recipient_name: string
  recipient_phone: string
  recipient_address: string
  package_type: 'document' | 'package' | 'fragile' | 'liquid' | 'special'
  content_description: string
  weight: number
  dimensions: string
  pieces: number
  declared_value: number
  insurance_amount: number
  shipping_cost: number
  additional_services: string[]
  payment_method: 'sender' | 'recipient' | 'third_party'
  special_instructions?: string
  reference_number?: string
  status: 'draft' | 'confirmed' | 'printed' | 'dispatched' | 'delivered' | 'cancelled'
  pickup_date?: string
  estimated_delivery: string
  actual_delivery?: string
  delivery_signature?: string
  delivery_notes?: string
  created_by: string
  created_at: string
  updated_at: string
}

const mockAirwaybills: Airwaybill[] = [
  {
    id: '1',
    awb_number: 'AWB-JNE-240725001',
    booking_code: 'BK-JNE-001',
    shipment_id: '1',
    order_number: 'SO-2024-001',
    courier_id: '1',
    courier_name: 'JNE Regular',
    service_type: 'Regular Service',
    origin_city: 'Jakarta',
    destination_city: 'Jakarta',
    sender_name: 'Malaka Store Jakarta',
    sender_phone: '021-5551234',
    sender_address: 'Jl. Sudirman No. 100, Jakarta Pusat 10270',
    recipient_name: 'Toko Sepatu Merdeka',
    recipient_phone: '08123456789',
    recipient_address: 'Jl. Merdeka No. 123, Jakarta Pusat 10110',
    package_type: 'package',
    content_description: 'Sepatu formal dan kasual - 80 pasang',
    weight: 15.5,
    dimensions: '60x40x30 cm',
    pieces: 4,
    declared_value: 20976000,
    insurance_amount: 200000,
    shipping_cost: 45000,
    additional_services: ['Insurance', 'Door to Door'],
    payment_method: 'sender',
    special_instructions: 'Fragile items - Handle with care',
    reference_number: 'REF-SO-001',
    status: 'delivered',
    pickup_date: '2024-07-23T09:00:00Z',
    estimated_delivery: '2024-07-25T17:00:00Z',
    actual_delivery: '2024-07-25T15:30:00Z',
    delivery_signature: 'Ahmad (Store Manager)',
    delivery_notes: 'Package delivered in good condition',
    created_by: 'Logistics Admin',
    created_at: '2024-07-22T14:30:00Z',
    updated_at: '2024-07-25T15:30:00Z'
  },
  {
    id: '2',
    awb_number: 'AWB-SCP-240725002',
    booking_code: 'BK-SCP-002',
    shipment_id: '2',
    order_number: 'ON-2024-001',
    courier_id: '2',
    courier_name: 'SiCepat Regular',
    service_type: 'Regular Service',
    origin_city: 'Jakarta',
    destination_city: 'Jakarta',
    sender_name: 'Malaka E-commerce',
    sender_phone: '021-5551235',
    sender_address: 'Jl. Sudirman No. 100, Jakarta Pusat 10270',
    recipient_name: 'Ahmad Rizki',
    recipient_phone: '08123456789',
    recipient_address: 'Jl. Sudirman No. 123, Jakarta Pusat 10110',
    package_type: 'package',
    content_description: 'Sepatu Oxford dan ikat pinggang kulit',
    weight: 2.3,
    dimensions: '35x25x15 cm',
    pieces: 1,
    declared_value: 544500,
    insurance_amount: 25000,
    shipping_cost: 25000,
    additional_services: ['Insurance', 'SMS Notification'],
    payment_method: 'sender',
    reference_number: 'REF-ON-001',
    status: 'dispatched',
    pickup_date: '2024-07-25T10:00:00Z',
    estimated_delivery: '2024-07-26T17:00:00Z',
    created_by: 'E-commerce Admin',
    created_at: '2024-07-25T08:30:00Z',
    updated_at: '2024-07-25T16:00:00Z'
  },
  {
    id: '3',
    awb_number: 'AWB-JNT-240725003',
    booking_code: 'BK-JNT-003',
    shipment_id: '3',
    order_number: 'POS-2024-001',
    courier_id: '3',
    courier_name: 'J&T Regular',
    service_type: 'Regular Service',
    origin_city: 'Jakarta',
    destination_city: 'Bandung',
    sender_name: 'Malaka Store Jakarta',
    sender_phone: '021-5551234',
    sender_address: 'Jl. Sudirman No. 100, Jakarta Pusat 10270',
    recipient_name: 'Siti Nurhaliza',
    recipient_phone: '08123456788',
    recipient_address: 'Jl. Gatot Subroto No. 456, Bandung 40123',
    package_type: 'package',
    content_description: 'Sepatu sneaker putih untuk olahraga',
    weight: 1.8,
    dimensions: '30x20x12 cm',
    pieces: 1,
    declared_value: 518200,
    insurance_amount: 0,
    shipping_cost: 22000,
    additional_services: ['COD', 'SMS Notification'],
    payment_method: 'recipient',
    special_instructions: 'COD payment required - Rp 518,200',
    reference_number: 'REF-POS-001',
    status: 'printed',
    pickup_date: '2024-07-24T11:00:00Z',
    estimated_delivery: '2024-07-26T17:00:00Z',
    created_by: 'POS Admin',
    created_at: '2024-07-24T09:15:00Z',
    updated_at: '2024-07-26T08:30:00Z'
  },
  {
    id: '4',
    awb_number: 'AWB-GRAB-240725004',
    booking_code: 'BK-GRAB-004',
    shipment_id: '4',
    order_number: 'DS-2024-001',
    courier_id: '6',
    courier_name: 'GrabExpress Same Day',
    service_type: 'Same Day Service',
    origin_city: 'Jakarta',
    destination_city: 'Jakarta',
    sender_name: 'Ahmad Direct Sales',
    sender_phone: '08123456790',
    sender_address: 'Jl. Sudirman No. 100, Jakarta Pusat 10270',
    recipient_name: 'Budi Wijaya',
    recipient_phone: '08123456789',
    recipient_address: 'Jl. Sudirman No. 123, Jakarta Pusat 10110',
    package_type: 'package',
    content_description: 'Sepatu Oxford dan ikat pinggang premium',
    weight: 3.2,
    dimensions: '40x30x20 cm',
    pieces: 1,
    declared_value: 418300,
    insurance_amount: 0,
    shipping_cost: 25000,
    additional_services: ['Same Day Delivery', 'Real-time Tracking'],
    payment_method: 'sender',
    special_instructions: 'Same day delivery - urgent',
    reference_number: 'REF-DS-001',
    status: 'delivered',
    pickup_date: '2024-07-25T14:00:00Z',
    estimated_delivery: '2024-07-25T18:00:00Z',
    actual_delivery: '2024-07-25T17:45:00Z',
    delivery_signature: 'Budi Wijaya',
    delivery_notes: 'Customer satisfied with same day service',
    created_by: 'Direct Sales Admin',
    created_at: '2024-07-25T12:30:00Z',
    updated_at: '2024-07-25T17:45:00Z'
  },
  {
    id: '5',
    awb_number: 'AWB-TIKI-240725005',
    booking_code: 'BK-TIKI-005',
    shipment_id: '5',
    order_number: 'SO-2024-002',
    courier_id: '4',
    courier_name: 'TIKI Regular',
    service_type: 'Regular Service',
    origin_city: 'Jakarta',
    destination_city: 'Bandung',
    sender_name: 'Malaka Store Jakarta',
    sender_phone: '021-5551234',
    sender_address: 'Jl. Sudirman No. 100, Jakarta Pusat 10270',
    recipient_name: 'Fashion Store Bandung',
    recipient_phone: '08123456788',
    recipient_address: 'Jl. Braga No. 456, Bandung 40111',
    package_type: 'package',
    content_description: 'Work boots hitam untuk safety',
    weight: 8.7,
    dimensions: '50x35x25 cm',
    pieces: 2,
    declared_value: 11293750,
    insurance_amount: 150000,
    shipping_cost: 35000,
    additional_services: ['Insurance', 'Door to Door'],
    payment_method: 'sender',
    reference_number: 'REF-SO-002',
    status: 'confirmed',
    estimated_delivery: '2024-07-28T17:00:00Z',
    created_by: 'Logistics Admin',
    created_at: '2024-07-25T10:15:00Z',
    updated_at: '2024-07-25T10:15:00Z'
  },
  {
    id: '6',
    awb_number: 'AWB-DHL-240725006',
    booking_code: 'BK-DHL-006',
    shipment_id: '6',
    order_number: 'SO-2024-004',
    courier_id: '7',
    courier_name: 'DHL International',
    service_type: 'International Express',
    origin_city: 'Jakarta',
    destination_city: 'Singapore',
    sender_name: 'Malaka Export Division',
    sender_phone: '021-5551236',
    sender_address: 'Jl. Sudirman No. 100, Jakarta Pusat 10270',
    recipient_name: 'Export Partner Singapore',
    recipient_phone: '+65987654321',
    recipient_address: '123 Orchard Road, Singapore 238857',
    package_type: 'special',
    content_description: 'High heel collection - Export products',
    weight: 25.0,
    dimensions: '80x60x40 cm',
    pieces: 5,
    declared_value: 38900000,
    insurance_amount: 500000,
    shipping_cost: 750000,
    additional_services: ['Insurance', 'Express International', 'Customs Clearance'],
    payment_method: 'sender',
    special_instructions: 'Export documentation required - all papers included',
    reference_number: 'REF-EXP-004',
    status: 'dispatched',
    pickup_date: '2024-07-25T08:00:00Z',
    estimated_delivery: '2024-07-28T17:00:00Z',
    created_by: 'Export Admin',
    created_at: '2024-07-24T16:30:00Z',
    updated_at: '2024-07-25T08:00:00Z'
  },
  {
    id: '7',
    awb_number: 'AWB-POS-240725007',
    booking_code: 'BK-POS-007',
    shipment_id: '7',
    order_number: 'ON-2024-005',
    courier_id: '5',
    courier_name: 'Pos Indonesia Regular',
    service_type: 'Economy Service',
    origin_city: 'Jakarta',
    destination_city: 'Yogyakarta',
    sender_name: 'Malaka E-commerce',
    sender_phone: '021-5551235',
    sender_address: 'Jl. Sudirman No. 100, Jakarta Pusat 10270',
    recipient_name: 'Dedi Susanto',
    recipient_phone: '08123456785',
    recipient_address: 'Jl. Pahlawan No. 654, Yogyakarta 55141',
    package_type: 'package',
    content_description: 'High heel merah untuk fashion',
    weight: 1.5,
    dimensions: '25x20x10 cm',
    pieces: 1,
    declared_value: 374000,
    insurance_amount: 15000,
    shipping_cost: 15000,
    additional_services: ['COD', 'Insurance'],
    payment_method: 'recipient',
    special_instructions: 'COD payment - customer refused delivery after 3 attempts',
    reference_number: 'REF-ON-005',
    status: 'cancelled',
    pickup_date: '2024-07-23T10:00:00Z',
    estimated_delivery: '2024-07-26T17:00:00Z',
    delivery_notes: 'Customer not available - returned to sender',
    created_by: 'E-commerce Admin',
    created_at: '2024-07-22T16:10:00Z',
    updated_at: '2024-07-26T16:00:00Z'
  }
]

export default function AirwaybillPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  // Simplified filters state

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
    { label: 'Shipping', href: '/shipping' },
    { label: 'Airwaybill', href: '/shipping/airwaybill' }
  ]

  // Filter airwaybills
  const filteredAirwaybills = mockAirwaybills.filter(awb => {
    if (searchTerm && !awb.awb_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !awb.booking_code.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !awb.order_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !awb.recipient_name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  // Summary statistics
  const summaryStats = {
    totalAirwaybills: mockAirwaybills.length,
    draftAirwaybills: mockAirwaybills.filter(a => a.status === 'draft').length,
    printedAirwaybills: mockAirwaybills.filter(a => a.status === 'printed').length,
    dispatchedAirwaybills: mockAirwaybills.filter(a => a.status === 'dispatched').length,
    deliveredAirwaybills: mockAirwaybills.filter(a => a.status === 'delivered').length,
    totalDeclaredValue: mockAirwaybills.reduce((sum, a) => sum + a.declared_value, 0),
    totalShippingCost: mockAirwaybills.reduce((sum, a) => sum + a.shipping_cost, 0),
    avgDeliveryTime: mockAirwaybills.filter(a => a.actual_delivery && a.pickup_date).length > 0 ?
      mockAirwaybills.filter(a => a.actual_delivery && a.pickup_date)
        .reduce((sum, a) => {
          const pickup = new Date(a.pickup_date!)
          const delivery = new Date(a.actual_delivery!)
          return sum + ((delivery.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24))
        }, 0) / mockAirwaybills.filter(a => a.actual_delivery && a.pickup_date).length : 0
  }

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { variant: 'outline' as const, label: 'Draft', icon: Invoice01Icon },
      confirmed: { variant: 'default' as const, label: 'Confirmed', icon: CheckmarkCircle01Icon },
      printed: { variant: 'secondary' as const, label: 'Printed', icon: PrinterIcon },
      dispatched: { variant: 'default' as const, label: 'Dispatched', icon: DeliveryTruck01Icon },
      delivered: { variant: 'default' as const, label: 'Delivered', icon: CheckmarkCircle01Icon },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled', icon: AlertCircleIcon }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status, icon: Invoice01Icon }
  }

  const getPackageTypeBadge = (type: string) => {
    const config = {
      document: { variant: 'outline' as const, label: 'Document' },
      package: { variant: 'default' as const, label: 'Package' },
      fragile: { variant: 'destructive' as const, label: 'Fragile' },
      liquid: { variant: 'secondary' as const, label: 'Liquid' },
      special: { variant: 'secondary' as const, label: 'Special' }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type }
  }

  const getPaymentMethodBadge = (method: string) => {
    const config = {
      sender: { variant: 'default' as const, label: 'Sender Pay' },
      recipient: { variant: 'secondary' as const, label: 'Recipient Pay' },
      third_party: { variant: 'outline' as const, label: 'Third Party' }
    }
    return config[method as keyof typeof config] || { variant: 'secondary' as const, label: method }
  }

  // Get unique couriers for filter
  const couriers = Array.from(new Set(mockAirwaybills.map(awb => awb.courier_name)))

  const columns: TanStackColumn<Airwaybill>[] = [
    {
      id: 'awb_number',
      header: 'AWB Number',
      accessorKey: 'awb_number',
      cell: ({ row }) => (
        <Link
          href={`/shipping/airwaybill/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.awb_number}
        </Link>
      )
    },
    {
      id: 'booking_code',
      header: 'Booking',
      accessorKey: 'booking_code',
      cell: ({ row }) => (
        <div>
          <div className="font-mono text-sm">{row.original.booking_code}</div>
          <div className="text-xs text-muted-foreground">{row.original.order_number}</div>
        </div>
      )
    },
    {
      id: 'courier_info',
      header: 'Courier',
      accessorKey: 'courier_name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.courier_name}</div>
          <div className="text-sm text-muted-foreground">{row.original.service_type}</div>
        </div>
      )
    },
    {
      id: 'route',
      header: 'Route',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="flex items-center space-x-2">
            <span>{row.original.origin_city}</span>
            <span>→</span>
            <span>{row.original.destination_city}</span>
          </div>
        </div>
      )
    },
    {
      id: 'recipient',
      header: 'Recipient',
      accessorKey: 'recipient_name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.recipient_name}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.recipient_phone}
          </div>
        </div>
      )
    },
    {
      id: 'package_info',
      header: 'Package',
      cell: ({ row }) => {
        const { variant, label } = getPackageTypeBadge(row.original.package_type)
        return (
          <div>
            <Badge variant={variant} className="text-xs">{label}</Badge>
            <div className="text-sm text-muted-foreground mt-1">
              {row.original.weight} kg • {row.original.pieces} pcs
            </div>
          </div>
        )
      }
    },
    {
      id: 'declared_value',
      header: 'Value',
      accessorKey: 'declared_value',
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(row.original.declared_value)}</div>
          <div className="text-sm text-muted-foreground">
            Cost: {formatCurrency(row.original.shipping_cost)}
          </div>
        </div>
      )
    },
    {
      id: 'payment_method',
      header: 'Payment',
      accessorKey: 'payment_method',
      cell: ({ row }) => {
        const { variant, label } = getPaymentMethodBadge(row.original.payment_method)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const { variant, label } = getStatusBadge(row.original.status)
        return (
          <Badge variant={variant}>{label}</Badge>
        )
      }
    },
    {
      id: 'delivery_date',
      header: 'Delivery',
      cell: ({ row }) => (
        <div className="text-sm">
          <div>Est: {formatDate(row.original.estimated_delivery)}</div>
          {row.original.actual_delivery && (
            <div className="text-muted-foreground">Act: {formatDate(row.original.actual_delivery)}</div>
          )}
        </div>
      )
    },
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="Airwaybill Management"
        description="Create and manage shipping airwaybills and documentation"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={ScanIcon} className="h-4 w-4 mr-2" />
              Bulk Print
            </Button>
            <Button size="sm" asChild>
              <Link href="/shipping/airwaybill/new">
                <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
                Create AWB
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={Invoice01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total AWB</p>
                <p className="text-2xl font-bold">{summaryStats.totalAirwaybills}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={PrinterIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Printed</p>
                <p className="text-2xl font-bold">{summaryStats.printedAirwaybills}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={DeliveryTruck01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dispatched</p>
                <p className="text-2xl font-bold">{summaryStats.dispatchedAirwaybills}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{summaryStats.deliveredAirwaybills}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center justify-end gap-2">
          <div className="relative">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search AWB..."
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search airwaybills"
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

        {/* Content */}
        <TanStackDataTable
          data={filteredAirwaybills}
          columns={columns}
          pagination={{
            pageIndex: 0,
            pageSize: 10,
            totalRows: filteredAirwaybills.length,
            onPageChange: () => { }
          }}
          onEdit={(awb) => router.push(`/shipping/airwaybill/${awb.id}/edit`)}
          onDelete={(awb) => {
            if (confirm('Are you sure you want to delete this airwaybill?')) {
              console.log('Delete airwaybill', awb.id)
            }
          }}
          customActions={[
            {
              label: 'View Details',
              icon: ViewIcon,
              onClick: (awb) => router.push(`/shipping/airwaybill/${awb.id}`)
            },
            {
              label: 'Print AWB',
              icon: PrinterIcon,
              onClick: (awb) => console.log('Print', awb.id)
            }
          ]}
        />

        {/* Draft Airwaybills Alert */}
        {summaryStats.draftAirwaybills > 0 && (
          <Card className="p-6 border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <HugeiconsIcon icon={Invoice01Icon} className="h-6 w-6 text-gray-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">Draft Airwaybills</h3>
                <p className="text-gray-700 mt-1">
                  {summaryStats.draftAirwaybills} airwaybills are in draft status and need to be confirmed and printed.
                </p>
              </div>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                Process Drafts
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}