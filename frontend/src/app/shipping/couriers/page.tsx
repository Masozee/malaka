'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DeliveryTruck01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  StarIcon,
  Globe02Icon,
  FilterHorizontalIcon,
  Search01Icon,
  ViewIcon,
  PencilEdit01Icon,
  Download01Icon,
  Add01Icon,
  DeleteIcon
} from '@hugeicons/core-free-icons'

// Courier types
interface Courier {
  id: string
  courier_code: string
  courier_name: string
  company_name: string
  service_type: 'regular' | 'express' | 'same_day' | 'economy' | 'international'
  coverage_area: 'local' | 'national' | 'international'
  contact_person: string
  phone: string
  email: string
  address: string
  website?: string
  api_integration: boolean
  tracking_available: boolean
  cod_available: boolean
  insurance_available: boolean
  min_weight: number
  max_weight: number
  base_rate: number
  rate_per_kg: number
  is_active: boolean
  is_preferred: boolean
  total_shipments: number
  on_time_delivery: number
  avg_delivery_days: number
  customer_rating: number
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

const mockCouriers: Courier[] = [
  {
    id: '1',
    courier_code: 'JNE-REG',
    courier_name: 'JNE Regular',
    company_name: 'JNE Express',
    service_type: 'regular',
    coverage_area: 'national',
    contact_person: 'Ahmad Kurniawan',
    phone: '021-1500-888',
    email: 'ahmad.k@jne.co.id',
    address: 'Jl. Tomang Raya No. 11, Jakarta Barat 11440',
    website: 'https://www.jne.co.id',
    api_integration: true,
    tracking_available: true,
    cod_available: true,
    insurance_available: true,
    min_weight: 0.1,
    max_weight: 30.0,
    base_rate: 9000,
    rate_per_kg: 5000,
    is_active: true,
    is_preferred: true,
    total_shipments: 15678,
    on_time_delivery: 94.5,
    avg_delivery_days: 2.3,
    customer_rating: 4.6,
    created_by: 'Admin User',
    updated_by: 'Logistics Manager',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-07-25T14:30:00Z'
  },
  {
    id: '2',
    courier_code: 'SICEPAT-REG',
    courier_name: 'SiCepat Regular',
    company_name: 'SiCepat Ekspres',
    service_type: 'regular',
    coverage_area: 'national',
    contact_person: 'Sari Wulandari',
    phone: '021-2927-2927',
    email: 'sari.w@sicepat.com',
    address: 'Jl. Raya Bekasi KM 23, Bekasi 17530',
    website: 'https://www.sicepat.com',
    api_integration: true,
    tracking_available: true,
    cod_available: true,
    insurance_available: true,
    min_weight: 0.1,
    max_weight: 20.0,
    base_rate: 8500,
    rate_per_kg: 4500,
    is_active: true,
    is_preferred: true,
    total_shipments: 12456,
    on_time_delivery: 92.8,
    avg_delivery_days: 2.5,
    customer_rating: 4.4,
    created_by: 'Admin User',
    updated_by: 'Logistics Manager',
    created_at: '2024-01-20T10:30:00Z',
    updated_at: '2024-07-24T16:45:00Z'
  },
  {
    id: '3',
    courier_code: 'JNT-REG',
    courier_name: 'J&T Regular',
    company_name: 'J&T Express',
    service_type: 'regular',
    coverage_area: 'national',
    contact_person: 'Budi Santoso',
    phone: '021-3040-0000',
    email: 'budi.s@jet.co.id',
    address: 'Jl. Raya Jakarta-Bogor KM 47, Depok 16454',
    website: 'https://www.jet.co.id',
    api_integration: true,
    tracking_available: true,
    cod_available: true,
    insurance_available: false,
    min_weight: 0.1,
    max_weight: 20.0,
    base_rate: 8000,
    rate_per_kg: 4000,
    is_active: true,
    is_preferred: false,
    total_shipments: 18934,
    on_time_delivery: 89.2,
    avg_delivery_days: 2.8,
    customer_rating: 4.2,
    created_by: 'Admin User',
    updated_by: 'Logistics Manager',
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-07-23T11:20:00Z'
  },
  {
    id: '4',
    courier_code: 'TIKI-REG',
    courier_name: 'TIKI Regular',
    company_name: 'Citra Van Titipan Kilat',
    service_type: 'regular',
    coverage_area: 'national',
    contact_person: 'Rina Dewi',
    phone: '021-1500-125',
    email: 'rina.d@tiki.id',
    address: 'Jl. Daan Mogot KM 11, Jakarta Barat 11840',
    website: 'https://www.tiki.id',
    api_integration: false,
    tracking_available: true,
    cod_available: false,
    insurance_available: true,
    min_weight: 0.5,
    max_weight: 30.0,
    base_rate: 10000,
    rate_per_kg: 6000,
    is_active: true,
    is_preferred: false,
    total_shipments: 8765,
    on_time_delivery: 88.7,
    avg_delivery_days: 3.1,
    customer_rating: 4.0,
    created_by: 'Admin User',
    updated_by: 'Logistics Manager',
    created_at: '2024-02-10T11:45:00Z',
    updated_at: '2024-07-22T09:15:00Z'
  },
  {
    id: '5',
    courier_code: 'POS-REG',
    courier_name: 'Pos Indonesia Regular',
    company_name: 'PT Pos Indonesia',
    service_type: 'economy',
    coverage_area: 'national',
    contact_person: 'Dedi Susanto',
    phone: '021-1500-161',
    email: 'dedi.s@posindonesia.co.id',
    address: 'Jl. Cilaki No. 73, Bandung 40115',
    website: 'https://www.posindonesia.co.id',
    api_integration: false,
    tracking_available: true,
    cod_available: false,
    insurance_available: true,
    min_weight: 0.1,
    max_weight: 30.0,
    base_rate: 7000,
    rate_per_kg: 3500,
    is_active: true,
    is_preferred: false,
    total_shipments: 5432,
    on_time_delivery: 85.3,
    avg_delivery_days: 4.2,
    customer_rating: 3.8,
    created_by: 'Admin User',
    updated_by: 'Logistics Manager',
    created_at: '2024-02-15T14:20:00Z',
    updated_at: '2024-07-21T13:45:00Z'
  },
  {
    id: '6',
    courier_code: 'GRAB-SAME',
    courier_name: 'GrabExpress Same Day',
    company_name: 'Grab Indonesia',
    service_type: 'same_day',
    coverage_area: 'local',
    contact_person: 'Lisa Putri',
    phone: '021-8064-7777',
    email: 'lisa.p@grab.com',
    address: 'Sequis Tower, Jl. Jend. Sudirman, Jakarta 12930',
    website: 'https://www.grab.com',
    api_integration: true,
    tracking_available: true,
    cod_available: true,
    insurance_available: false,
    min_weight: 0.1,
    max_weight: 5.0,
    base_rate: 15000,
    rate_per_kg: 8000,
    is_active: true,
    is_preferred: false,
    total_shipments: 3456,
    on_time_delivery: 96.8,
    avg_delivery_days: 0.5,
    customer_rating: 4.7,
    created_by: 'Admin User',
    updated_by: 'Logistics Manager',
    created_at: '2024-03-01T08:30:00Z',
    updated_at: '2024-07-20T15:30:00Z'
  },
  {
    id: '7',
    courier_code: 'DHL-INTL',
    courier_name: 'DHL International',
    company_name: 'DHL Express Indonesia',
    service_type: 'international',
    coverage_area: 'international',
    contact_person: 'Michael Johnson',
    phone: '021-7917-4545',
    email: 'michael.j@dhl.com',
    address: 'Gedung Menara Bidakara, Jakarta 12560',
    website: 'https://www.dhl.co.id',
    api_integration: true,
    tracking_available: true,
    cod_available: false,
    insurance_available: true,
    min_weight: 0.5,
    max_weight: 70.0,
    base_rate: 150000,
    rate_per_kg: 45000,
    is_active: true,
    is_preferred: true,
    total_shipments: 1234,
    on_time_delivery: 98.5,
    avg_delivery_days: 3.8,
    customer_rating: 4.9,
    created_by: 'Admin User',
    updated_by: 'Logistics Manager',
    created_at: '2024-03-10T12:15:00Z',
    updated_at: '2024-07-19T10:25:00Z'
  },
  {
    id: '8',
    courier_code: 'FEDEX-INTL',
    courier_name: 'FedEx International',
    company_name: 'Federal Express Indonesia',
    service_type: 'express',
    coverage_area: 'international',
    contact_person: 'David Wilson',
    phone: '021-7918-8888',
    email: 'david.w@fedex.com',
    address: 'Wisma GKBI, Jakarta 10310',
    website: 'https://www.fedex.com',
    api_integration: true,
    tracking_available: true,
    cod_available: false,
    insurance_available: true,
    min_weight: 0.5,
    max_weight: 68.0,
    base_rate: 180000,
    rate_per_kg: 52000,
    is_active: false,
    is_preferred: false,
    total_shipments: 567,
    on_time_delivery: 97.2,
    avg_delivery_days: 2.5,
    customer_rating: 4.8,
    created_by: 'Admin User',
    updated_by: 'Logistics Manager',
    created_at: '2024-04-01T13:45:00Z',
    updated_at: '2024-06-15T11:30:00Z'
  }
]



export default function CouriersPage() {
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

  const breadcrumbs = [
    { label: 'Shipping', href: '/shipping' },
    { label: 'Couriers', href: '/shipping/couriers' }
  ]

  // Filter couriers
  const filteredCouriers = mockCouriers.filter(courier => {
    if (searchTerm && !courier.courier_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !courier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !courier.courier_code.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  // Summary statistics
  const summaryStats = {
    totalCouriers: mockCouriers.length,
    activeCouriers: mockCouriers.filter(c => c.is_active).length,
    preferredCouriers: mockCouriers.filter(c => c.is_preferred).length,
    apiIntegrated: mockCouriers.filter(c => c.api_integration).length,
    totalShipments: mockCouriers.reduce((sum, c) => sum + c.total_shipments, 0),
    avgDeliveryTime: mockCouriers.length > 0 ?
      mockCouriers.reduce((sum, c) => sum + c.avg_delivery_days, 0) / mockCouriers.length : 0,
    avgOnTimeDelivery: mockCouriers.length > 0 ?
      mockCouriers.reduce((sum, c) => sum + c.on_time_delivery, 0) / mockCouriers.length : 0
  }

  const getServiceTypeBadge = (type: string) => {
    const config = {
      regular: { variant: 'default' as const, label: 'Regular' },
      express: { variant: 'secondary' as const, label: 'Express' },
      same_day: { variant: 'outline' as const, label: 'Same Day' },
      economy: { variant: 'secondary' as const, label: 'Economy' },
      international: { variant: 'destructive' as const, label: 'International' }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type }
  }

  const getCoverageBadge = (coverage: string) => {
    const config = {
      local: { variant: 'outline' as const, label: 'Local' },
      national: { variant: 'default' as const, label: 'National' },
      international: { variant: 'secondary' as const, label: 'International' }
    }
    return config[coverage as keyof typeof config] || { variant: 'secondary' as const, label: coverage }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? { variant: 'default' as const, label: 'Active', icon: CheckmarkCircle01Icon }
      : { variant: 'destructive' as const, label: 'Inactive', icon: AlertCircleIcon }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <HugeiconsIcon
        icon={StarIcon}
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const columns: TanStackColumn<Courier>[] = [
    {
      id: 'courier_code',
      header: 'Code',
      accessorKey: 'courier_code',
      cell: ({ row }) => (
        <Link
          href={`/shipping/couriers/${row.original.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {row.original.courier_code}
        </Link>
      )
    },
    {
      id: 'courier_info',
      header: 'Courier Info',
      accessorKey: 'courier_name',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {row.original.is_preferred && <HugeiconsIcon icon={StarIcon} className="h-4 w-4 text-yellow-400 fill-current" />}
          <div>
            <div className="font-medium">{row.original.courier_name}</div>
            <div className="text-sm text-muted-foreground">{row.original.company_name}</div>
          </div>
        </div>
      )
    },
    {
      id: 'service_type',
      header: 'Service Type',
      accessorKey: 'service_type',
      cell: ({ row }) => {
        const { variant, label } = getServiceTypeBadge(row.original.service_type)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      id: 'coverage_area',
      header: 'Coverage',
      accessorKey: 'coverage_area',
      cell: ({ row }) => {
        const { variant, label } = getCoverageBadge(row.original.coverage_area)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      id: 'contact_info',
      header: 'Contact',
      accessorKey: 'contact_person',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.contact_person}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.phone}
          </div>
        </div>
      )
    },
    {
      id: 'features',
      header: 'Features',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.api_integration && <Badge variant="outline" className="text-xs">API</Badge>}
          {row.original.tracking_available && <Badge variant="outline" className="text-xs">Track</Badge>}
          {row.original.cod_available && <Badge variant="outline" className="text-xs">COD</Badge>}
          {row.original.insurance_available && <Badge variant="outline" className="text-xs">Insurance</Badge>}
        </div>
      )
    },
    {
      id: 'rates',
      header: 'Rates',
      accessorKey: 'base_rate',
      cell: ({ row }) => (
        <div className="text-sm">
          <div>Base: {formatCurrency(row.original.base_rate)}</div>
          <div className="text-muted-foreground">Per kg: {formatCurrency(row.original.rate_per_kg)}</div>
        </div>
      )
    },
    {
      id: 'performance',
      header: 'Performance',
      accessorKey: 'customer_rating',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-0.5">
              {getRatingStars(row.original.customer_rating)}
            </div>
            <span className="font-medium">{row.original.customer_rating.toFixed(1)}</span>
          </div>
          <div className="text-muted-foreground">{row.original.on_time_delivery.toFixed(1)}% on-time</div>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'is_active',
      cell: ({ row }) => {
        const { variant, label } = getStatusBadge(row.original.is_active)
        return (
          <Badge variant={variant}>{label}</Badge>
        )
      }
    }
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="Courier Management"
        description="Manage shipping couriers and delivery partners"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button size="sm" asChild>
              <Link href="/shipping/couriers/new">
                <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
                Add Courier
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <HugeiconsIcon icon={DeliveryTruck01Icon} className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Couriers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summaryStats.totalCouriers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.activeCouriers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <HugeiconsIcon icon={StarIcon} className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Preferred</p>
                <p className="text-2xl font-bold text-yellow-600">{summaryStats.preferredCouriers}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <HugeiconsIcon icon={Globe02Icon} className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Integrated</p>
                <p className="text-2xl font-bold text-purple-600">{summaryStats.apiIntegrated}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center justify-end gap-2">
          <div className="relative">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search couriers..."
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search couriers"
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
          data={filteredCouriers}
          columns={columns}
          pagination={{
            pageIndex: 0,
            pageSize: 10,
            totalRows: filteredCouriers.length,
            onPageChange: () => { }
          }}
          onEdit={(courier) => router.push(`/shipping/couriers/${courier.id}/edit`)}
          onDelete={(courier) => {
            if (confirm('Are you sure you want to delete this courier?')) {
              console.log('Delete courier', courier.id)
            }
          }}
          customActions={[
            {
              label: 'View Details',
              icon: ViewIcon,
              onClick: (courier) => router.push(`/shipping/couriers/${courier.id}`)
            }
          ]}
        />
      </div>
    </TwoLevelLayout>
  )
}