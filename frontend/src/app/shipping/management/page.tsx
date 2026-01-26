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
import { Progress } from '@/components/ui/progress'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Time04Icon,
  DeliveryTruck01Icon,
  DeliveryTruck02Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  PackageIcon,
  Location01Icon,
  ViewIcon,
  PencilEdit01Icon,
  Download01Icon,
  Add01Icon,
  FilterHorizontalIcon,
  Search01Icon,
  DeleteIcon
} from '@hugeicons/core-free-icons'
import { useRouter } from 'next/navigation'

import Link from 'next/link'

// Shipment types
interface Shipment {
  id: string
  shipment_number: string
  tracking_number: string
  order_number: string
  order_type: 'pos' | 'online' | 'direct' | 'wholesale'
  courier_id: string
  courier_name: string
  service_type: string
  sender_name: string
  sender_phone: string
  sender_address: string
  recipient_name: string
  recipient_phone: string
  recipient_address: string
  recipient_city: string
  recipient_province: string
  postal_code: string
  weight: number
  dimensions: string
  declared_value: number
  shipping_cost: number
  insurance_cost: number
  total_cost: number
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned'
  payment_method: 'prepaid' | 'cod' | 'postpaid'
  cod_amount?: number
  pickup_date?: string
  estimated_delivery: string
  actual_delivery?: string
  delivery_attempts: number
  delivery_proof?: string
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
}

const mockShipments: Shipment[] = [
  {
    id: '1',
    shipment_number: 'SHP-2024-001',
    tracking_number: 'JNE123456789',
    order_number: 'SO-2024-001',
    order_type: 'wholesale',
    courier_id: '1',
    courier_name: 'JNE Regular',
    service_type: 'Regular',
    sender_name: 'Malaka Store Jakarta',
    sender_phone: '021-5551234',
    sender_address: 'Jl. Sudirman No. 100, Jakarta Pusat',
    recipient_name: 'Toko Sepatu Merdeka',
    recipient_phone: '08123456789',
    recipient_address: 'Jl. Merdeka No. 123, Jakarta Pusat',
    recipient_city: 'Jakarta',
    recipient_province: 'DKI Jakarta',
    postal_code: '10110',
    weight: 15.5,
    dimensions: '60x40x30 cm',
    declared_value: 20976000,
    shipping_cost: 45000,
    insurance_cost: 10000,
    total_cost: 55000,
    status: 'delivered',
    payment_method: 'prepaid',
    pickup_date: '2024-07-23T09:00:00Z',
    estimated_delivery: '2024-07-25T17:00:00Z',
    actual_delivery: '2024-07-25T15:30:00Z',
    delivery_attempts: 1,
    delivery_proof: 'Received by: Ahmad (Store Manager)',
    notes: 'Bulk order delivered successfully',
    created_by: 'Logistics Admin',
    created_at: '2024-07-22T14:30:00Z',
    updated_at: '2024-07-25T15:30:00Z'
  },
  {
    id: '2',
    shipment_number: 'SHP-2024-002',
    tracking_number: 'SICEPAT987654',
    order_number: 'ON-2024-001',
    order_type: 'online',
    courier_id: '2',
    courier_name: 'SiCepat Regular',
    service_type: 'Regular',
    sender_name: 'Malaka E-commerce',
    sender_phone: '021-5551235',
    sender_address: 'Jl. Sudirman No. 100, Jakarta Pusat',
    recipient_name: 'Ahmad Rizki',
    recipient_phone: '08123456789',
    recipient_address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    recipient_city: 'Jakarta',
    recipient_province: 'DKI Jakarta',
    postal_code: '10110',
    weight: 2.3,
    dimensions: '35x25x15 cm',
    declared_value: 544500,
    shipping_cost: 25000,
    insurance_cost: 5000,
    total_cost: 30000,
    status: 'in_transit',
    payment_method: 'prepaid',
    pickup_date: '2024-07-25T10:00:00Z',
    estimated_delivery: '2024-07-26T17:00:00Z',
    delivery_attempts: 0,
    notes: 'Express delivery requested',
    created_by: 'E-commerce Admin',
    created_at: '2024-07-25T08:30:00Z',
    updated_at: '2024-07-25T16:00:00Z'
  },
  {
    id: '3',
    shipment_number: 'SHP-2024-003',
    tracking_number: 'JNT456789123',
    order_number: 'POS-2024-001',
    order_type: 'pos',
    courier_id: '3',
    courier_name: 'J&T Regular',
    service_type: 'Regular',
    sender_name: 'Malaka Store Jakarta',
    sender_phone: '021-5551234',
    sender_address: 'Jl. Sudirman No. 100, Jakarta Pusat',
    recipient_name: 'Siti Nurhaliza',
    recipient_phone: '08123456788',
    recipient_address: 'Jl. Gatot Subroto No. 456, Bandung',
    recipient_city: 'Bandung',
    recipient_province: 'Jawa Barat',
    postal_code: '40123',
    weight: 1.8,
    dimensions: '30x20x12 cm',
    declared_value: 518200,
    shipping_cost: 22000,
    insurance_cost: 0,
    total_cost: 22000,
    status: 'out_for_delivery',
    payment_method: 'cod',
    cod_amount: 518200,
    pickup_date: '2024-07-24T11:00:00Z',
    estimated_delivery: '2024-07-26T17:00:00Z',
    delivery_attempts: 0,
    notes: 'COD payment - cash on delivery',
    created_by: 'POS Admin',
    created_at: '2024-07-24T09:15:00Z',
    updated_at: '2024-07-26T08:30:00Z'
  },
  {
    id: '4',
    shipment_number: 'SHP-2024-004',
    tracking_number: 'GRAB789123456',
    order_number: 'DS-2024-001',
    order_type: 'direct',
    courier_id: '6',
    courier_name: 'GrabExpress Same Day',
    service_type: 'Same Day',
    sender_name: 'Ahmad Direct Sales',
    sender_phone: '08123456790',
    sender_address: 'Jl. Sudirman No. 100, Jakarta Pusat',
    recipient_name: 'Budi Wijaya',
    recipient_phone: '08123456789',
    recipient_address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    recipient_city: 'Jakarta',
    recipient_province: 'DKI Jakarta',
    postal_code: '10110',
    weight: 3.2,
    dimensions: '40x30x20 cm',
    declared_value: 418300,
    shipping_cost: 25000,
    insurance_cost: 0,
    total_cost: 25000,
    status: 'delivered',
    payment_method: 'prepaid',
    pickup_date: '2024-07-25T14:00:00Z',
    estimated_delivery: '2024-07-25T18:00:00Z',
    actual_delivery: '2024-07-25T17:45:00Z',
    delivery_attempts: 1,
    delivery_proof: 'Photo delivered to customer',
    notes: 'Same day delivery completed',
    created_by: 'Direct Sales Admin',
    created_at: '2024-07-25T12:30:00Z',
    updated_at: '2024-07-25T17:45:00Z'
  },
  {
    id: '5',
    shipment_number: 'SHP-2024-005',
    tracking_number: 'TIKI321654987',
    order_number: 'SO-2024-002',
    order_type: 'wholesale',
    courier_id: '4',
    courier_name: 'TIKI Regular',
    service_type: 'Regular',
    sender_name: 'Malaka Store Jakarta',
    sender_phone: '021-5551234',
    sender_address: 'Jl. Sudirman No. 100, Jakarta Pusat',
    recipient_name: 'Fashion Store Bandung',
    recipient_phone: '08123456788',
    recipient_address: 'Jl. Braga No. 456, Bandung',
    recipient_city: 'Bandung',
    recipient_province: 'Jawa Barat',
    postal_code: '40111',
    weight: 8.7,
    dimensions: '50x35x25 cm',
    declared_value: 11293750,
    shipping_cost: 35000,
    insurance_cost: 15000,
    total_cost: 50000,
    status: 'pending',
    payment_method: 'prepaid',
    estimated_delivery: '2024-07-28T17:00:00Z',
    delivery_attempts: 0,
    notes: 'Waiting for pickup schedule',
    created_by: 'Logistics Admin',
    created_at: '2024-07-25T10:15:00Z',
    updated_at: '2024-07-25T10:15:00Z'
  },
  {
    id: '6',
    shipment_number: 'SHP-2024-006',
    tracking_number: 'DHL987123456',
    order_number: 'SO-2024-004',
    order_type: 'wholesale',
    courier_id: '7',
    courier_name: 'DHL International',
    service_type: 'International',
    sender_name: 'Malaka Export Division',
    sender_phone: '021-5551236',
    sender_address: 'Jl. Sudirman No. 100, Jakarta Pusat',
    recipient_name: 'Export Partner Singapore',
    recipient_phone: '+65987654321',
    recipient_address: '123 Orchard Road, Singapore',
    recipient_city: 'Singapore',
    recipient_province: 'Singapore',
    postal_code: '238857',
    weight: 25.0,
    dimensions: '80x60x40 cm',
    declared_value: 38900000,
    shipping_cost: 750000,
    insurance_cost: 50000,
    total_cost: 800000,
    status: 'picked_up',
    payment_method: 'prepaid',
    pickup_date: '2024-07-25T08:00:00Z',
    estimated_delivery: '2024-07-28T17:00:00Z',
    delivery_attempts: 0,
    notes: 'International export shipment with full documentation',
    created_by: 'Export Admin',
    created_at: '2024-07-24T16:30:00Z',
    updated_at: '2024-07-25T08:00:00Z'
  },
  {
    id: '7',
    shipment_number: 'SHP-2024-007',
    tracking_number: 'POS654321789',
    order_number: 'ON-2024-005',
    order_type: 'online',
    courier_id: '5',
    courier_name: 'Pos Indonesia Regular',
    service_type: 'Economy',
    sender_name: 'Malaka E-commerce',
    sender_phone: '021-5551235',
    sender_address: 'Jl. Sudirman No. 100, Jakarta Pusat',
    recipient_name: 'Dedi Susanto',
    recipient_phone: '08123456785',
    recipient_address: 'Jl. Pahlawan No. 654, Yogyakarta',
    recipient_city: 'Yogyakarta',
    recipient_province: 'DI Yogyakarta',
    postal_code: '55141',
    weight: 1.5,
    dimensions: '25x20x10 cm',
    declared_value: 374000,
    shipping_cost: 15000,
    insurance_cost: 3000,
    total_cost: 18000,
    status: 'failed',
    payment_method: 'cod',
    cod_amount: 374000,
    pickup_date: '2024-07-23T10:00:00Z',
    estimated_delivery: '2024-07-26T17:00:00Z',
    delivery_attempts: 3,
    notes: 'Customer not available after 3 delivery attempts',
    created_by: 'E-commerce Admin',
    created_at: '2024-07-22T16:10:00Z',
    updated_at: '2024-07-26T16:00:00Z'
  }
]

export default function ShipmentManagementPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  // Simplified filters state - complex filters removed from UI to match standard
  // In a real app these might be in a "Filter" drawer/popover

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
    { label: 'Shipment Management', href: '/shipping/management' }
  ]

  // Filter shipments
  const filteredShipments = mockShipments.filter(shipment => {
    if (searchTerm && !shipment.shipment_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !shipment.order_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !shipment.recipient_name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  // Summary statistics
  const summaryStats = {
    totalShipments: mockShipments.length,
    pendingShipments: mockShipments.filter(s => s.status === 'pending').length,
    inTransitShipments: mockShipments.filter(s => s.status === 'in_transit' || s.status === 'picked_up' || s.status === 'out_for_delivery').length,
    deliveredShipments: mockShipments.filter(s => s.status === 'delivered').length,
    failedShipments: mockShipments.filter(s => s.status === 'failed' || s.status === 'returned').length,
    totalShippingRevenue: mockShipments.reduce((sum, s) => sum + s.total_cost, 0),
    avgDeliveryTime: mockShipments.filter(s => s.actual_delivery && s.pickup_date).length > 0 ?
      mockShipments.filter(s => s.actual_delivery && s.pickup_date)
        .reduce((sum, s) => {
          const pickup = new Date(s.pickup_date!)
          const delivery = new Date(s.actual_delivery!)
          return sum + ((delivery.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24))
        }, 0) / mockShipments.filter(s => s.actual_delivery && s.pickup_date).length : 0,
    onTimeDelivery: mockShipments.filter(s => s.status === 'delivered').length > 0 ?
      (mockShipments.filter(s => s.status === 'delivered' && s.actual_delivery && s.estimated_delivery &&
        new Date(s.actual_delivery) <= new Date(s.estimated_delivery)).length /
        mockShipments.filter(s => s.status === 'delivered').length) * 100 : 0
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'secondary' as const, label: 'Pending', icon: Time04Icon },
      picked_up: { variant: 'default' as const, label: 'Picked Up', icon: DeliveryTruck01Icon },
      in_transit: { variant: 'default' as const, label: 'In Transit', icon: DeliveryTruck02Icon },
      out_for_delivery: { variant: 'default' as const, label: 'Out for Delivery', icon: DeliveryTruck01Icon },
      delivered: { variant: 'default' as const, label: 'Delivered', icon: CheckmarkCircle01Icon },
      failed: { variant: 'destructive' as const, label: 'Failed', icon: AlertCircleIcon },
      returned: { variant: 'destructive' as const, label: 'Returned', icon: AlertCircleIcon }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status, icon: PackageIcon }
  }

  const getOrderTypeBadge = (type: string) => {
    const config = {
      pos: { variant: 'default' as const, label: 'POS' },
      online: { variant: 'secondary' as const, label: 'Online' },
      direct: { variant: 'outline' as const, label: 'Direct' },
      wholesale: { variant: 'secondary' as const, label: 'Wholesale' }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type }
  }

  const getPaymentMethodBadge = (method: string) => {
    const config = {
      prepaid: { variant: 'default' as const, label: 'Prepaid' },
      cod: { variant: 'secondary' as const, label: 'COD' },
      postpaid: { variant: 'outline' as const, label: 'Postpaid' }
    }
    return config[method as keyof typeof config] || { variant: 'secondary' as const, label: method }
  }

  const columns: TanStackColumn<Shipment>[] = [
    {
      id: 'shipment_number',
      header: 'Shipment',
      accessorKey: 'shipment_number',
      cell: ({ row }) => (
        <Link
          href={`/shipping/management/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.shipment_number}
        </Link>
      )
    },
    {
      id: 'tracking_number',
      header: 'Tracking',
      accessorKey: 'tracking_number',
      cell: ({ row }) => (
        <div>
          <div className="font-mono text-xs">{row.original.tracking_number}</div>
          <div className="text-xs text-muted-foreground">{row.original.courier_name}</div>
        </div>
      )
    },
    {
      id: 'order_info',
      header: 'Order Info',
      accessorKey: 'order_number',
      cell: ({ row }) => {
        const { variant: orderVariant, label: orderLabel } = getOrderTypeBadge(row.original.order_type)
        return (
          <div>
            <div className="font-medium">{row.original.order_number}</div>
            <Badge variant={orderVariant} className="text-xs">{orderLabel}</Badge>
          </div>
        )
      }
    },
    {
      id: 'recipient',
      header: 'Recipient',
      accessorKey: 'recipient_name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.recipient_name}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.recipient_phone}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.recipient_city}
          </div>
        </div>
      )
    },
    {
      id: 'weight_value',
      header: 'Weight & Value',
      accessorKey: 'weight',
      cell: ({ row }) => (
        <div className="text-xs">
          <div>
            {row.original.weight} kg
          </div>
          <div className="text-muted-foreground">{formatCurrency(row.original.declared_value)}</div>
        </div>
      )
    },
    {
      id: 'shipping_cost',
      header: 'Cost',
      accessorKey: 'total_cost',
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(row.original.total_cost)}</div>
          {row.original.cod_amount && (
            <div className="text-xs text-muted-foreground">COD: {formatCurrency(row.original.cod_amount)}</div>
          )}
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
      accessorKey: 'estimated_delivery',
      cell: ({ row }) => (
        <div className="text-xs">
          <div>Est: {formatDate(row.original.estimated_delivery)}</div>
          {row.original.actual_delivery && (
            <div className="text-muted-foreground">Act: {formatDate(row.original.actual_delivery)}</div>
          )}
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="Shipment Management"
        description="Track and manage all shipments and deliveries"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button size="sm" asChild>
              <Link href="/shipping/management/new">
                <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
                New Shipment
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
                <HugeiconsIcon icon={PackageIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Shipments</p>
                <p className="text-2xl font-bold">{summaryStats.totalShipments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={DeliveryTruck01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold">{summaryStats.inTransitShipments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{summaryStats.failedShipments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">On-Time Rate</p>
                <p className="text-2xl font-bold">{mounted ? `${summaryStats.onTimeDelivery.toFixed(0)}%` : '0%'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center justify-end gap-2">
          <div className="relative">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shipments..."
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search shipments"
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
          data={filteredShipments}
          columns={columns}
          pagination={{
            pageIndex: 0,
            pageSize: 10,
            totalRows: filteredShipments.length,
            onPageChange: () => { }
          }}
          onEdit={(shipment) => router.push(`/shipping/management/${shipment.id}/edit`)}
          onDelete={(shipment) => {
            if (confirm('Are you sure you want to delete this shipment?')) {
              console.log('Delete shipment', shipment.id)
            }
          }}
          customActions={[
            {
              label: 'Track',
              icon: Location01Icon,
              onClick: (shipment) => router.push(`/shipping/management/${shipment.id}/track`)
            },
            {
              label: 'View Details',
              icon: ViewIcon,
              onClick: (shipment) => router.push(`/shipping/management/${shipment.id}`)
            }
          ]}
        />
      </div>
    </TwoLevelLayout>
  )
}