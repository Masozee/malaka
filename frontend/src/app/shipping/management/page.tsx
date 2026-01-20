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
import { Progress } from '@/components/ui/progress'
import { 
  Ship,
  Plus,
  Eye,
  Edit,
  Filter,
  Download,
  Calendar,
  MapPin,
  User,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  DollarSign,
  BarChart3,
  TrendingUp,
  Phone
} from 'lucide-react'
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
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')

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

  const formatDateTime = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleString('id-ID')
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
    if (statusFilter !== 'all' && shipment.status !== statusFilter) return false
    if (orderTypeFilter !== 'all' && shipment.order_type !== orderTypeFilter) return false
    if (paymentMethodFilter !== 'all' && shipment.payment_method !== paymentMethodFilter) return false
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
      pending: { variant: 'secondary' as const, label: 'Pending', icon: Clock, progress: 0 },
      picked_up: { variant: 'default' as const, label: 'Picked Up', icon: Truck, progress: 25 },
      in_transit: { variant: 'default' as const, label: 'In Transit', icon: Ship, progress: 50 },
      out_for_delivery: { variant: 'default' as const, label: 'Out for Delivery', icon: Truck, progress: 75 },
      delivered: { variant: 'default' as const, label: 'Delivered', icon: CheckCircle, progress: 100 },
      failed: { variant: 'destructive' as const, label: 'Failed', icon: AlertCircle, progress: 0 },
      returned: { variant: 'destructive' as const, label: 'Returned', icon: AlertCircle, progress: 0 }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status, icon: Package, progress: 0 }
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

  const columns = [
    {
      key: 'shipment_number',
      title: 'Shipment',
      render: (shipment: Shipment) => (
        <Link 
          href={`/shipping/management/${shipment.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {shipment.shipment_number}
        </Link>
      )
    },
    {
      key: 'tracking_number',
      title: 'Tracking',
      render: (shipment: Shipment) => (
        <div>
          <div className="font-mono text-sm">{shipment.tracking_number}</div>
          <div className="text-xs text-muted-foreground">{shipment.courier_name}</div>
        </div>
      )
    },
    {
      key: 'order_info',
      title: 'Order Info',
      render: (shipment: Shipment) => {
        const { variant: orderVariant, label: orderLabel } = getOrderTypeBadge(shipment.order_type)
        return (
          <div>
            <div className="font-medium">{shipment.order_number}</div>
            <Badge variant={orderVariant} className="text-xs">{orderLabel}</Badge>
          </div>
        )
      }
    },
    {
      key: 'recipient',
      title: 'Recipient',
      render: (shipment: Shipment) => (
        <div>
          <div className="font-medium">{shipment.recipient_name}</div>
          <div className="text-sm text-muted-foreground flex items-center space-x-1">
            <Phone className="h-3 w-3" />
            <span>{shipment.recipient_phone}</span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span>{shipment.recipient_city}</span>
          </div>
        </div>
      )
    },
    {
      key: 'weight_value',
      title: 'Weight & Value',
      render: (shipment: Shipment) => (
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <Package className="h-3 w-3 text-muted-foreground" />
            <span>{shipment.weight} kg</span>
          </div>
          <div className="text-muted-foreground">{formatCurrency(shipment.declared_value)}</div>
        </div>
      )
    },
    {
      key: 'shipping_cost',
      title: 'Cost',
      render: (shipment: Shipment) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(shipment.total_cost)}</div>
          {shipment.cod_amount && (
            <div className="text-sm text-orange-600">COD: {formatCurrency(shipment.cod_amount)}</div>
          )}
        </div>
      )
    },
    {
      key: 'payment_method',
      title: 'Payment',
      render: (shipment: Shipment) => {
        const { variant, label } = getPaymentMethodBadge(shipment.payment_method)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'status',
      title: 'Status',
      render: (shipment: Shipment) => {
        const { variant, label, icon: Icon } = getStatusBadge(shipment.status)
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'delivery_date',
      title: 'Delivery',
      render: (shipment: Shipment) => (
        <div className="text-sm">
          <div>Est: {formatDate(shipment.estimated_delivery)}</div>
          {shipment.actual_delivery && (
            <div className="text-green-600">Act: {formatDate(shipment.actual_delivery)}</div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (shipment: Shipment) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/shipping/management/${shipment.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {shipment.status === 'pending' && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/shipping/management/${shipment.id}/edit`}>
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
          title="Shipment Management"
          description="Track and manage all shipments and deliveries"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/shipping/management/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Shipment
                </Link>
              </Button>
            </div>
          }
        />

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalShipments}</p>
                <p className="text-sm text-blue-600 mt-1">Shipments</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{summaryStats.pendingShipments}</p>
                <p className="text-sm text-orange-600 mt-1">Awaiting pickup</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{summaryStats.inTransitShipments}</p>
                <p className="text-sm text-blue-600 mt-1">On the way</p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{summaryStats.deliveredShipments}</p>
                <p className="text-sm text-green-600 mt-1">Completed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{summaryStats.failedShipments}</p>
                <p className="text-sm text-red-600 mt-1">Need action</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `Rp ${(summaryStats.totalShippingRevenue / 1000000).toFixed(1)}M` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">Shipping fees</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Delivery</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${summaryStats.avgDeliveryTime.toFixed(1)}` : ''}
                </p>
                <p className="text-sm text-gray-600 mt-1">Days</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On-Time</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${summaryStats.onTimeDelivery.toFixed(1)}%` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">Delivery rate</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
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
                    placeholder="Search shipments..."
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
                    <SelectItem value="picked_up">Picked Up</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderType">Order Type</Label>
                <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="pos">POS</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment</Label>
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All payments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All payments</SelectItem>
                    <SelectItem value="prepaid">Prepaid</SelectItem>
                    <SelectItem value="cod">COD</SelectItem>
                    <SelectItem value="postpaid">Postpaid</SelectItem>
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
          <div className="text-sm text-muted-foreground">
            {filteredShipments.length} of {mockShipments.length} shipments
          </div>
        </div>

        {/* Content */}
        {activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShipments.map((shipment) => {
              const { variant: statusVariant, label: statusLabel, icon: StatusIcon, progress } = getStatusBadge(shipment.status)
              const { variant: orderVariant, label: orderLabel } = getOrderTypeBadge(shipment.order_type)
              const { variant: paymentVariant, label: paymentLabel } = getPaymentMethodBadge(shipment.payment_method)
              
              return (
                <Card key={shipment.id} className="p-6 hover: transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link 
                        href={`/shipping/management/${shipment.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {shipment.shipment_number}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1 font-mono">
                        {shipment.tracking_number}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-1">
                        <StatusIcon className="h-4 w-4" />
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Order:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{shipment.order_number}</span>
                        <Badge variant={orderVariant}>{orderLabel}</Badge>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Courier:</span>
                      <span className="text-sm font-medium">{shipment.courier_name}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Recipient:</span>
                      <span className="text-sm font-medium">{shipment.recipient_name}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Destination:</span>
                      <span className="text-sm font-medium">{shipment.recipient_city}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Weight:</span>
                      <span className="text-sm font-medium">{shipment.weight} kg</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payment:</span>
                      <Badge variant={paymentVariant}>{paymentLabel}</Badge>
                    </div>

                    {shipment.cod_amount && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">COD Amount:</span>
                        <span className="text-sm font-medium text-orange-600">{formatCurrency(shipment.cod_amount)}</span>
                      </div>
                    )}

                    {progress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress:</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Shipping Cost:</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(shipment.total_cost)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Est. Delivery:</span>
                        <span>{formatDate(shipment.estimated_delivery)}</span>
                      </div>
                      
                      {shipment.actual_delivery && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Actual:</span>
                          <span className="text-green-600">{formatDate(shipment.actual_delivery)}</span>
                        </div>
                      )}
                    </div>

                    {shipment.notes && (
                      <div className="bg-muted p-2 rounded text-sm">
                        {shipment.notes}
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
              <h3 className="text-lg font-semibold">All Shipments</h3>
              <p className="text-sm text-muted-foreground">Track and manage all shipments and deliveries</p>
            </div>
            <AdvancedDataTable
              data={filteredShipments}
              columns={columns}
              searchable={false}
              filterable={false}
              pagination={{
                pageSize: 10,
                currentPage: 1,
                totalPages: Math.ceil(filteredShipments.length / 10),
                totalItems: filteredShipments.length,
                onChange: () => {}
              }}
            />
          </Card>
        )}

        {/* Failed Shipments Alert */}
        {summaryStats.failedShipments > 0 && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">Failed Deliveries</h3>
                <p className="text-red-700 mt-1">
                  {summaryStats.failedShipments} shipments have failed delivery and need immediate attention.
                </p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Review Failed
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}