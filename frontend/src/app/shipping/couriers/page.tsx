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
  Truck,
  Plus,
  Eye,
  Edit,
  Filter,
  Download,
  Calendar,
  MapPin,
  User,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Package,
  Globe,
  Star,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

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
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all')
  const [coverageFilter, setCoverageFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

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
    { label: 'Couriers', href: '/shipping/couriers' }
  ]

  // Filter couriers
  const filteredCouriers = mockCouriers.filter(courier => {
    if (searchTerm && !courier.courier_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !courier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !courier.courier_code.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (serviceTypeFilter !== 'all' && courier.service_type !== serviceTypeFilter) return false
    if (coverageFilter !== 'all' && courier.coverage_area !== coverageFilter) return false
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && !courier.is_active) return false
      if (statusFilter === 'inactive' && courier.is_active) return false
      if (statusFilter === 'preferred' && !courier.is_preferred) return false
      if (statusFilter === 'api_integrated' && !courier.api_integration) return false
    }
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
      ? { variant: 'default' as const, label: 'Active', icon: CheckCircle }
      : { variant: 'destructive' as const, label: 'Inactive', icon: AlertCircle }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ))
  }

  const columns = [
    {
      key: 'courier_code',
      title: 'Code',
      render: (courier: Courier) => (
        <Link 
          href={`/shipping/couriers/${courier.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {courier.courier_code}
        </Link>
      )
    },
    {
      key: 'courier_info',
      title: 'Courier Info',
      render: (courier: Courier) => (
        <div className="flex items-center space-x-2">
          {courier.is_preferred && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
          <div>
            <div className="font-medium">{courier.courier_name}</div>
            <div className="text-sm text-muted-foreground">{courier.company_name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'service_type',
      title: 'Service Type',
      render: (courier: Courier) => {
        const { variant, label } = getServiceTypeBadge(courier.service_type)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'coverage_area',
      title: 'Coverage',
      render: (courier: Courier) => {
        const { variant, label } = getCoverageBadge(courier.coverage_area)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'contact_info',
      title: 'Contact',
      render: (courier: Courier) => (
        <div>
          <div className="font-medium">{courier.contact_person}</div>
          <div className="text-sm text-muted-foreground flex items-center space-x-1">
            <Phone className="h-3 w-3" />
            <span>{courier.phone}</span>
          </div>
        </div>
      )
    },
    {
      key: 'features',
      title: 'Features',
      render: (courier: Courier) => (
        <div className="flex flex-wrap gap-1">
          {courier.api_integration && <Badge variant="outline" className="text-xs">API</Badge>}
          {courier.tracking_available && <Badge variant="outline" className="text-xs">Track</Badge>}
          {courier.cod_available && <Badge variant="outline" className="text-xs">COD</Badge>}
          {courier.insurance_available && <Badge variant="outline" className="text-xs">Insurance</Badge>}
        </div>
      )
    },
    {
      key: 'rates',
      title: 'Rates',
      render: (courier: Courier) => (
        <div className="text-sm">
          <div>Base: {formatCurrency(courier.base_rate)}</div>
          <div className="text-muted-foreground">Per kg: {formatCurrency(courier.rate_per_kg)}</div>
        </div>
      )
    },
    {
      key: 'performance',
      title: 'Performance',
      render: (courier: Courier) => (
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-0.5">
              {getRatingStars(courier.customer_rating)}
            </div>
            <span className="font-medium">{courier.customer_rating.toFixed(1)}</span>
          </div>
          <div className="text-muted-foreground">{courier.on_time_delivery.toFixed(1)}% on-time</div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (courier: Courier) => {
        const { variant, label, icon: Icon } = getStatusBadge(courier.is_active)
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
      render: (courier: Courier) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/shipping/couriers/${courier.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/shipping/couriers/${courier.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Courier Management"
          description="Manage shipping couriers and delivery partners"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/shipping/couriers/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Courier
                </Link>
              </Button>
            </div>
          }
        />

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Couriers</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalCouriers}</p>
                <p className="text-sm text-blue-600 mt-1">Partners</p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{summaryStats.activeCouriers}</p>
                <p className="text-sm text-green-600 mt-1">Available</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Preferred</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">{summaryStats.preferredCouriers}</p>
                <p className="text-sm text-yellow-600 mt-1">Partners</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Integrated</p>
                <p className="text-2xl font-bold mt-1 text-purple-600">{summaryStats.apiIntegrated}</p>
                <p className="text-sm text-purple-600 mt-1">Connected</p>
              </div>
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search couriers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All services</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="express">Express</SelectItem>
                    <SelectItem value="same_day">Same Day</SelectItem>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverage">Coverage</Label>
                <Select value={coverageFilter} onValueChange={setCoverageFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All coverage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All coverage</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="preferred">Preferred</SelectItem>
                    <SelectItem value="api_integrated">API Integrated</SelectItem>
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
            {filteredCouriers.length} of {mockCouriers.length} couriers
          </div>
        </div>

        {/* Content */}
        {activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCouriers.map((courier) => {
              const { variant: serviceVariant, label: serviceLabel } = getServiceTypeBadge(courier.service_type)
              const { variant: coverageVariant, label: coverageLabel } = getCoverageBadge(courier.coverage_area)
              const { variant: statusVariant, label: statusLabel, icon: StatusIcon } = getStatusBadge(courier.is_active)
              
              return (
                <Card key={courier.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      {courier.is_preferred && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                      <div>
                        <Link 
                          href={`/shipping/couriers/${courier.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {courier.courier_name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {courier.company_name}
                        </p>
                      </div>
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
                      <span className="text-sm text-muted-foreground">Code:</span>
                      <span className="text-sm font-mono">{courier.courier_code}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Service:</span>
                      <Badge variant={serviceVariant}>{serviceLabel}</Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Coverage:</span>
                      <Badge variant={coverageVariant}>{coverageLabel}</Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Contact:</span>
                      <span className="text-sm font-medium">{courier.contact_person}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Phone:</span>
                      <span className="text-sm font-medium">{courier.phone}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {courier.api_integration && <Badge variant="outline" className="text-xs">API Integration</Badge>}
                      {courier.tracking_available && <Badge variant="outline" className="text-xs">Tracking</Badge>}
                      {courier.cod_available && <Badge variant="outline" className="text-xs">COD</Badge>}
                      {courier.insurance_available && <Badge variant="outline" className="text-xs">Insurance</Badge>}
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Base Rate:</span>
                        <span className="text-sm font-medium">{formatCurrency(courier.base_rate)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Per Kg:</span>
                        <span className="text-sm font-medium">{formatCurrency(courier.rate_per_kg)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Weight Range:</span>
                        <span className="text-sm">{courier.min_weight} - {courier.max_weight} kg</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Rating:</span>
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-0.5">
                            {mounted && getRatingStars(courier.customer_rating)}
                          </div>
                          <span className="text-sm font-medium">{courier.customer_rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted p-2 rounded text-sm">
                      <div className="flex justify-between">
                        <span>Shipments:</span>
                        <span className="font-medium">{courier.total_shipments.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>On-time:</span>
                        <span className="font-medium text-green-600">{courier.on_time_delivery.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg delivery:</span>
                        <span className="font-medium">{courier.avg_delivery_days.toFixed(1)} days</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Courier Partners</h3>
              <p className="text-sm text-muted-foreground">Manage all shipping couriers and delivery partners</p>
            </div>
            <AdvancedDataTable
              data={filteredCouriers}
              columns={columns}
              searchable={false}
              filterable={false}
              pagination={{
                pageSize: 10,
                currentPage: 1,
                totalPages: Math.ceil(filteredCouriers.length / 10),
                totalItems: filteredCouriers.length,
                onChange: () => {}
              }}
            />
          </Card>
        )}

        {/* Inactive Couriers Alert */}
        {mockCouriers.filter(c => !c.is_active).length > 0 && (
          <Card className="p-6 border-orange-200 bg-orange-50">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-orange-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800">Inactive Couriers</h3>
                <p className="text-orange-700 mt-1">
                  {mockCouriers.filter(c => !c.is_active).length} couriers are currently inactive and may need review or contract renewal.
                </p>
              </div>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                Review Couriers
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}