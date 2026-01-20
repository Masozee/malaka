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
  Handshake,
  Plus,
  Eye,
  Edit,
  Filter,
  Download,
  Package,
  Store,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  User,
  DollarSign,
  BarChart3,
  MapPin
} from 'lucide-react'
import Link from 'next/link'

// Consignment types
interface ConsignmentDeal {
  id: string
  consignment_number: string
  partner_type: 'store' | 'distributor' | 'agent' | 'individual'
  partner_name: string
  partner_location: string
  contact_person: string
  contact_phone: string
  start_date: string
  end_date?: string
  status: 'active' | 'pending' | 'completed' | 'cancelled' | 'expired'
  commission_rate: number
  payment_terms: 'monthly' | 'quarterly' | 'on_sale' | 'custom'
  total_items: number
  total_quantity: number
  total_value: number
  sold_quantity: number
  sold_value: number
  remaining_quantity: number
  commission_earned: number
  last_sale_date?: string
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

const mockConsignments: ConsignmentDeal[] = [
  {
    id: '1',
    consignment_number: 'CONS-2024-001',
    partner_type: 'store',
    partner_name: 'Fashion Plaza Boutique',
    partner_location: 'Kemang, Jakarta Selatan',
    contact_person: 'Sari Boutique',
    contact_phone: '+62 21 7199 8888',
    start_date: '2024-06-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    status: 'active',
    commission_rate: 25,
    payment_terms: 'monthly',
    total_items: 45,
    total_quantity: 180,
    total_value: 225000000,
    sold_quantity: 127,
    sold_value: 158750000,
    remaining_quantity: 53,
    commission_earned: 39687500,
    last_sale_date: '2024-07-24T16:30:00Z',
    created_by: 'Sales Manager',
    updated_by: 'Ahmad Sales',
    created_at: '2024-05-25T10:00:00Z',
    updated_at: '2024-07-25T09:15:00Z'
  },
  {
    id: '2',
    consignment_number: 'CONS-2024-002',
    partner_type: 'distributor',
    partner_name: 'Java Footwear Distribution',
    partner_location: 'Surabaya, Jawa Timur',
    contact_person: 'Budi Distributor',
    contact_phone: '+62 31 5555 7777',
    start_date: '2024-05-15T00:00:00Z',
    end_date: '2024-11-15T23:59:59Z',
    status: 'active',
    commission_rate: 20,
    payment_terms: 'quarterly',
    total_items: 89,
    total_quantity: 456,
    total_value: 684000000,
    sold_quantity: 234,
    sold_value: 351000000,
    remaining_quantity: 222,
    commission_earned: 70200000,
    last_sale_date: '2024-07-23T14:20:00Z',
    created_by: 'Regional Manager',
    updated_by: 'Rina Regional',
    created_at: '2024-05-10T09:30:00Z',
    updated_at: '2024-07-24T11:45:00Z'
  },
  {
    id: '3',
    consignment_number: 'CONS-2024-003',
    partner_type: 'agent',
    partner_name: 'Premium Shoes Agent',
    partner_location: 'Bandung, Jawa Barat',
    contact_person: 'Dedi Agent',
    contact_phone: '+62 22 8888 9999',
    start_date: '2024-07-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    status: 'pending',
    commission_rate: 30,
    payment_terms: 'on_sale',
    total_items: 25,
    total_quantity: 75,
    total_value: 112500000,
    sold_quantity: 12,
    sold_value: 18000000,
    remaining_quantity: 63,
    commission_earned: 5400000,
    last_sale_date: '2024-07-20T10:15:00Z',
    created_by: 'Sales Manager',
    updated_by: 'Lisa Sales',
    created_at: '2024-06-25T14:20:00Z',
    updated_at: '2024-07-22T16:30:00Z'
  },
  {
    id: '4',
    consignment_number: 'CONS-2024-004',
    partner_type: 'individual',
    partner_name: 'Celebrity Endorser Sarah',
    partner_location: 'Jakarta Pusat',
    contact_person: 'Sarah Celebrity',
    contact_phone: '+62 811 9999 8888',
    start_date: '2024-04-01T00:00:00Z',
    end_date: '2024-09-30T23:59:59Z',
    status: 'completed',
    commission_rate: 35,
    payment_terms: 'custom',
    total_items: 15,
    total_quantity: 30,
    total_value: 75000000,
    sold_quantity: 30,
    sold_value: 75000000,
    remaining_quantity: 0,
    commission_earned: 26250000,
    last_sale_date: '2024-07-15T19:45:00Z',
    created_by: 'Marketing Manager',
    updated_by: 'Ahmad Marketing',
    created_at: '2024-03-20T11:00:00Z',
    updated_at: '2024-07-16T08:30:00Z'
  },
  {
    id: '5',
    consignment_number: 'CONS-2024-005',
    partner_type: 'store',
    partner_name: 'Luxury Shoes Gallery',
    partner_location: 'Bali, Denpasar',
    contact_person: 'Ketut Store',
    contact_phone: '+62 361 7777 6666',
    start_date: '2024-06-15T00:00:00Z',
    end_date: '2024-12-15T23:59:59Z',
    status: 'active',
    commission_rate: 28,
    payment_terms: 'monthly',
    total_items: 67,
    total_quantity: 134,
    total_value: 201000000,
    sold_quantity: 89,
    sold_value: 133500000,
    remaining_quantity: 45,
    commission_earned: 37380000,
    last_sale_date: '2024-07-25T12:00:00Z',
    created_by: 'Regional Manager',
    updated_by: 'Sari Regional',
    created_at: '2024-06-10T13:45:00Z',
    updated_at: '2024-07-25T13:20:00Z'
  },
  {
    id: '6',
    consignment_number: 'CONS-2024-006',
    partner_type: 'distributor',
    partner_name: 'North Sumatra Distribution',
    partner_location: 'Medan, Sumatera Utara',
    contact_person: 'Andi Distributor',
    contact_phone: '+62 61 4444 5555',
    start_date: '2024-03-01T00:00:00Z',
    end_date: '2024-08-31T23:59:59Z',
    status: 'expired',
    commission_rate: 22,
    payment_terms: 'quarterly',
    total_items: 78,
    total_quantity: 312,
    total_value: 468000000,
    sold_quantity: 298,
    sold_value: 447000000,
    remaining_quantity: 14,
    commission_earned: 98340000,
    last_sale_date: '2024-07-10T15:30:00Z',
    created_by: 'Regional Manager',
    updated_by: 'Budi Regional',
    created_at: '2024-02-20T10:15:00Z',
    updated_at: '2024-07-11T09:00:00Z'
  },
  {
    id: '7',
    consignment_number: 'CONS-2024-007',
    partner_type: 'agent',
    partner_name: 'Fashion Week Agent',
    partner_location: 'Jakarta Utara',
    contact_person: 'Rina Fashion',
    contact_phone: '+62 21 6666 7777',
    start_date: '2024-07-10T00:00:00Z',
    end_date: '2024-10-10T23:59:59Z',
    status: 'active',
    commission_rate: 32,
    payment_terms: 'on_sale',
    total_items: 35,
    total_quantity: 70,
    total_value: 140000000,
    sold_quantity: 23,
    sold_value: 46000000,
    remaining_quantity: 47,
    commission_earned: 14720000,
    last_sale_date: '2024-07-22T17:15:00Z',
    created_by: 'Marketing Manager',
    updated_by: 'Dedi Marketing',
    created_at: '2024-07-05T15:30:00Z',
    updated_at: '2024-07-23T08:45:00Z'
  },
  {
    id: '8',
    consignment_number: 'CONS-2024-008',
    partner_type: 'store',
    partner_name: 'Sport Shoes Corner',
    partner_location: 'Yogyakarta',
    contact_person: 'Joko Store',
    contact_phone: '+62 274 8888 9999',
    start_date: '2024-05-01T00:00:00Z',
    end_date: '2024-10-31T23:59:59Z',
    status: 'cancelled',
    commission_rate: 26,
    payment_terms: 'monthly',
    total_items: 23,
    total_quantity: 46,
    total_value: 69000000,
    sold_quantity: 8,
    sold_value: 12000000,
    remaining_quantity: 38,
    commission_earned: 3120000,
    last_sale_date: '2024-06-15T11:20:00Z',
    created_by: 'Regional Manager',
    updated_by: 'Lisa Regional',
    created_at: '2024-04-25T09:00:00Z',
    updated_at: '2024-07-01T14:30:00Z'
  }
]

export default function SalesConsignmentPage() {
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentTermsFilter, setPaymentTermsFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const formatCurrency = (amount: number): string => {
    if (!mounted) return ''
    return amount.toLocaleString('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  const breadcrumbs = [
    { label: 'Sales', href: '/sales' },
    { label: 'Consignment', href: '/sales/consignment' }
  ]

  // Filter consignments
  const filteredConsignments = mockConsignments.filter(consignment => {
    if (searchTerm && !consignment.consignment_number.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !consignment.partner_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !consignment.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (partnerTypeFilter !== 'all' && consignment.partner_type !== partnerTypeFilter) return false
    if (statusFilter !== 'all' && consignment.status !== statusFilter) return false
    if (paymentTermsFilter !== 'all' && consignment.payment_terms !== paymentTermsFilter) return false
    return true
  })

  // Sort consignments by commission earned (highest first)
  const sortedConsignments = [...filteredConsignments].sort((a, b) => b.commission_earned - a.commission_earned)

  // Summary statistics
  const summaryStats = {
    totalConsignments: mockConsignments.length,
    activeConsignments: mockConsignments.filter(c => c.status === 'active').length,
    completedConsignments: mockConsignments.filter(c => c.status === 'completed').length,
    totalValue: mockConsignments.reduce((sum, c) => sum + c.total_value, 0),
    totalSoldValue: mockConsignments.reduce((sum, c) => sum + c.sold_value, 0),
    totalCommissionEarned: mockConsignments.reduce((sum, c) => sum + c.commission_earned, 0),
    averageCommissionRate: mockConsignments.reduce((sum, c) => sum + c.commission_rate, 0) / mockConsignments.length
  }

  const getPartnerTypeBadge = (type: string) => {
    const config = {
      store: { variant: 'default' as const, label: 'Store', icon: Store },
      distributor: { variant: 'secondary' as const, label: 'Distributor', icon: Package },
      agent: { variant: 'outline' as const, label: 'Agent', icon: User },
      individual: { variant: 'secondary' as const, label: 'Individual', icon: User }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type, icon: User }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      active: { variant: 'default' as const, label: 'Active', icon: CheckCircle },
      pending: { variant: 'outline' as const, label: 'Pending', icon: Clock },
      completed: { variant: 'default' as const, label: 'Completed', icon: CheckCircle },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled', icon: AlertCircle },
      expired: { variant: 'secondary' as const, label: 'Expired', icon: Clock }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status, icon: Clock }
  }

  const getPaymentTermsBadge = (terms: string) => {
    const config = {
      monthly: { variant: 'default' as const, label: 'Monthly' },
      quarterly: { variant: 'secondary' as const, label: 'Quarterly' },
      on_sale: { variant: 'outline' as const, label: 'On Sale' },
      custom: { variant: 'secondary' as const, label: 'Custom' }
    }
    return config[terms as keyof typeof config] || { variant: 'secondary' as const, label: terms }
  }

  const getSellThroughRate = (consignment: ConsignmentDeal) => {
    return consignment.total_quantity > 0 ? (consignment.sold_quantity / consignment.total_quantity * 100) : 0
  }

  const columns = [
    {
      key: 'consignment_number',
      title: 'Consignment #',
      render: (consignment: ConsignmentDeal) => (
        <Link 
          href={`/sales/consignment/${consignment.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {consignment.consignment_number}
        </Link>
      )
    },
    {
      key: 'partner_type',
      title: 'Partner Type',
      render: (consignment: ConsignmentDeal) => {
        const { variant, label, icon: Icon } = getPartnerTypeBadge(consignment.partner_type)
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'partner_name',
      title: 'Partner',
      render: (consignment: ConsignmentDeal) => (
        <div>
          <div className="font-medium">{consignment.partner_name}</div>
          <div className="text-sm text-muted-foreground">{consignment.partner_location}</div>
          <div className="text-sm text-muted-foreground">{consignment.contact_person}</div>
        </div>
      )
    },
    {
      key: 'commission_rate',
      title: 'Commission',
      render: (consignment: ConsignmentDeal) => (
        <div className="text-center">
          <div className="font-medium text-green-600">{consignment.commission_rate}%</div>
          <div className="text-sm text-muted-foreground">{formatCurrency(consignment.commission_earned)}</div>
        </div>
      )
    },
    {
      key: 'performance',
      title: 'Performance',
      render: (consignment: ConsignmentDeal) => {
        const sellThrough = getSellThroughRate(consignment)
        return (
          <div className="text-center">
            <div className="font-medium">{consignment.sold_quantity}/{consignment.total_quantity}</div>
            <div className={`text-sm ${sellThrough >= 70 ? 'text-green-600' : sellThrough >= 40 ? 'text-orange-600' : 'text-red-600'}`}>
              {mounted ? `${sellThrough.toFixed(1)}%` : ''}
            </div>
          </div>
        )
      }
    },
    {
      key: 'payment_terms',
      title: 'Terms',
      render: (consignment: ConsignmentDeal) => {
        const { variant, label } = getPaymentTermsBadge(consignment.payment_terms)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'duration',
      title: 'Duration',
      render: (consignment: ConsignmentDeal) => (
        <div className="text-sm">
          <div>{formatDate(consignment.start_date)}</div>
          <div className="text-muted-foreground">to {formatDate(consignment.end_date)}</div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (consignment: ConsignmentDeal) => {
        const { variant, label, icon: Icon } = getStatusBadge(consignment.status)
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
      render: (consignment: ConsignmentDeal) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/sales/consignment/${consignment.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/sales/consignment/${consignment.id}/edit`}>
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
          title="Sales Consignment"
          description="Manage consignment partnerships and track performance"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/sales/consignment/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Consignment
                </Link>
              </Button>
            </div>
          }
        />

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalConsignments}</p>
                <p className="text-sm text-blue-600 mt-1">All partnerships</p>
              </div>
              <Handshake className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{summaryStats.activeConsignments}</p>
                <p className="text-sm text-green-600 mt-1">Running</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{summaryStats.completedConsignments}</p>
                <p className="text-sm text-orange-600 mt-1">Finished</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${(summaryStats.totalValue / 1000000000).toFixed(1)}B` : ''}
                </p>
                <p className="text-sm text-purple-600 mt-1">IDR consigned</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sold Value</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {mounted ? `${(summaryStats.totalSoldValue / 1000000000).toFixed(1)}B` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">Revenue generated</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commission</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${(summaryStats.totalCommissionEarned / 1000000).toFixed(0)}M` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">Earned</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rate</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${summaryStats.averageCommissionRate.toFixed(1)}%` : ''}
                </p>
                <p className="text-sm text-gray-600 mt-1">Commission</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-600" />
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
                    placeholder="Search consignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner-type">Partner Type</Label>
                <Select value={partnerTypeFilter} onValueChange={setPartnerTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="store">Store</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-terms">Payment Terms</Label>
                <Select value={paymentTermsFilter} onValueChange={setPaymentTermsFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All terms</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="on_sale">On Sale</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
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
            {sortedConsignments.length} of {mockConsignments.length} consignments
          </div>
        </div>

        {/* Content */}
        {activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedConsignments.map((consignment) => {
              const { variant: typeVariant, label: typeLabel, icon: TypeIcon } = getPartnerTypeBadge(consignment.partner_type)
              const { variant: statusVariant, label: statusLabel, icon: StatusIcon } = getStatusBadge(consignment.status)
              const { variant: termsVariant, label: termsLabel } = getPaymentTermsBadge(consignment.payment_terms)
              const sellThrough = getSellThroughRate(consignment)
              
              return (
                <Card key={consignment.id} className="p-6 hover: transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <Handshake className="h-5 w-5 text-blue-600" />
                      <div>
                        <Link 
                          href={`/sales/consignment/${consignment.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {consignment.consignment_number}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {consignment.partner_name}
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
                      <span className="text-sm text-muted-foreground">Partner Type:</span>
                      <div className="flex items-center space-x-1">
                        <TypeIcon className="h-4 w-4" />
                        <Badge variant={typeVariant}>{typeLabel}</Badge>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Location:</span>
                      <span className="text-sm">{consignment.partner_location}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Contact:</span>
                      <span className="text-sm">{consignment.contact_person}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Commission:</span>
                      <span className="text-sm font-semibold text-green-600">{consignment.commission_rate}%</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payment:</span>
                      <Badge variant={termsVariant}>{termsLabel}</Badge>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Items:</span>
                        <span className="text-sm font-medium">{consignment.total_items} types</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        <span className="text-sm font-medium">{consignment.total_quantity} units</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Value:</span>
                        <span className="text-sm font-semibold">
                          {mounted ? `${(consignment.total_value / 1000000).toFixed(0)}M` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sold:</span>
                        <span className="text-sm font-medium">{consignment.sold_quantity} units</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Sell-through:</span>
                        <span className={`text-sm font-medium ${sellThrough >= 70 ? 'text-green-600' : sellThrough >= 40 ? 'text-orange-600' : 'text-red-600'}`}>
                          {mounted ? `${sellThrough.toFixed(1)}%` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Commission:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {mounted ? `${(consignment.commission_earned / 1000000).toFixed(1)}M` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-3 text-sm text-muted-foreground">
                      <div>Start: {formatDate(consignment.start_date)}</div>
                      <div>End: {formatDate(consignment.end_date)}</div>
                    </div>

                    <div className="flex space-x-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/sales/consignment/${consignment.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/sales/consignment/${consignment.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Consignment Partnerships</h3>
              <p className="text-sm text-muted-foreground">Manage all consignment deals and track partner performance</p>
            </div>
            <AdvancedDataTable
              data={sortedConsignments}
              columns={columns}
              searchable={false}
              filterable={false}
              pagination={{
                pageSize: 15,
                currentPage: 1,
                totalPages: Math.ceil(sortedConsignments.length / 15),
                totalItems: sortedConsignments.length,
                onChange: () => {}
              }}
            />
          </Card>
        )}

        {/* Low Performance Alert */}
        {mockConsignments.filter(c => getSellThroughRate(c) < 30 && c.status === 'active').length > 0 && (
          <Card className="p-6 border-orange-200 bg-orange-50">
            <div className="flex items-center space-x-3">
              <TrendingDown className="h-6 w-6 text-orange-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800">Low Performance Partners</h3>
                <p className="text-orange-700 mt-1">
                  {mockConsignments.filter(c => getSellThroughRate(c) < 30 && c.status === 'active').length} active partnerships have sell-through rates below 30% and need attention.
                </p>
              </div>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                Review Partners
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}