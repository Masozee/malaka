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
  Calculator,
  Plus,
  Eye,
  Edit,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  DollarSign,
  BarChart3,
  FileText,
  Building,
  CreditCard,
  Banknote,
  Receipt
} from 'lucide-react'
import Link from 'next/link'

// Sales Reconciliation types
interface SalesReconciliation {
  id: string
  reconciliation_number: string
  reconciliation_date: string
  reconciliation_period: string
  location: string
  location_type: 'store' | 'warehouse' | 'region' | 'online'
  reconciliation_type: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  total_sales_recorded: number
  total_sales_system: number
  variance_amount: number
  variance_percentage: number
  cash_sales: number
  card_sales: number
  transfer_sales: number
  refunds_amount: number
  discounts_amount: number
  tax_amount: number
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed'
  reviewed_by?: string
  approved_by?: string
  issues_found: number
  adjustments_made: number
  notes?: string
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

const mockReconciliations: SalesReconciliation[] = [
  {
    id: '1',
    reconciliation_number: 'REC-2024-07-25',
    reconciliation_date: '2024-07-25T00:00:00Z',
    reconciliation_period: '2024-07-25',
    location: 'Store Plaza Indonesia',
    location_type: 'store',
    reconciliation_type: 'daily',
    total_sales_recorded: 45750000,
    total_sales_system: 45825000,
    variance_amount: -75000,
    variance_percentage: -0.16,
    cash_sales: 15250000,
    card_sales: 28500000,
    transfer_sales: 2000000,
    refunds_amount: 625000,
    discounts_amount: 2875000,
    tax_amount: 4575000,
    status: 'pending',
    issues_found: 1,
    adjustments_made: 0,
    notes: 'Minor cash discrepancy found during end-of-day count',
    created_by: 'Store Manager PI',
    updated_by: 'Ahmad Store',
    created_at: '2024-07-25T20:30:00Z',
    updated_at: '2024-07-25T20:30:00Z'
  },
  {
    id: '2',
    reconciliation_number: 'REC-2024-07-24',
    reconciliation_date: '2024-07-24T00:00:00Z',
    reconciliation_period: '2024-07-24',
    location: 'Store Grand Indonesia',
    location_type: 'store',
    reconciliation_type: 'daily',
    total_sales_recorded: 67890000,
    total_sales_system: 67890000,
    variance_amount: 0,
    variance_percentage: 0,
    cash_sales: 22630000,
    card_sales: 42360000,
    transfer_sales: 2900000,
    refunds_amount: 890000,
    discounts_amount: 4234000,
    tax_amount: 6789000,
    status: 'approved',
    reviewed_by: 'Regional Manager',
    approved_by: 'Finance Manager',
    issues_found: 0,
    adjustments_made: 0,
    created_by: 'Store Manager GI',
    updated_by: 'Sari Finance',
    created_at: '2024-07-24T21:00:00Z',
    updated_at: '2024-07-25T09:15:00Z'
  },
  {
    id: '3',
    reconciliation_number: 'REC-2024-W30',
    reconciliation_date: '2024-07-21T00:00:00Z',
    reconciliation_period: 'Week 30 (July 15-21, 2024)',
    location: 'Jakarta Region',
    location_type: 'region',
    reconciliation_type: 'weekly',
    total_sales_recorded: 2450000000,
    total_sales_system: 2467500000,
    variance_amount: -17500000,
    variance_percentage: -0.71,
    cash_sales: 735000000,
    card_sales: 1470000000,
    transfer_sales: 245000000,
    refunds_amount: 24500000,
    discounts_amount: 122500000,
    tax_amount: 245000000,
    status: 'in_review',
    reviewed_by: 'Regional Finance',
    issues_found: 3,
    adjustments_made: 1,
    notes: 'System integration issues affecting 3 stores. Investigation ongoing.',
    created_by: 'Regional Manager',
    updated_by: 'Budi Regional',
    created_at: '2024-07-22T08:00:00Z',
    updated_at: '2024-07-24T14:30:00Z'
  },
  {
    id: '4',
    reconciliation_number: 'REC-2024-07-23',
    reconciliation_date: '2024-07-23T00:00:00Z',
    reconciliation_period: '2024-07-23',
    location: 'Online Store',
    location_type: 'online',
    reconciliation_type: 'daily',
    total_sales_recorded: 123450000,
    total_sales_system: 123450000,
    variance_amount: 0,
    variance_percentage: 0,
    cash_sales: 0,
    card_sales: 86415000,
    transfer_sales: 37035000,
    refunds_amount: 6172500,
    discounts_amount: 18517500,
    tax_amount: 12345000,
    status: 'completed',
    reviewed_by: 'E-commerce Manager',
    approved_by: 'Finance Director',
    issues_found: 0,
    adjustments_made: 0,
    created_by: 'E-commerce Team',
    updated_by: 'Rina Ecommerce',
    created_at: '2024-07-23T23:45:00Z',
    updated_at: '2024-07-24T10:20:00Z'
  },
  {
    id: '5',
    reconciliation_number: 'REC-2024-07-22',
    reconciliation_date: '2024-07-22T00:00:00Z',
    reconciliation_period: '2024-07-22',
    location: 'Store Senayan City',
    location_type: 'store',
    reconciliation_type: 'daily',
    total_sales_recorded: 34560000,
    total_sales_system: 35125000,
    variance_amount: -565000,
    variance_percentage: -1.61,
    cash_sales: 10368000,
    card_sales: 22752000,
    transfer_sales: 1440000,
    refunds_amount: 1728000,
    discounts_amount: 2073600,
    tax_amount: 3456000,
    status: 'rejected',
    reviewed_by: 'Regional Manager',
    issues_found: 2,
    adjustments_made: 0,
    notes: 'Significant cash shortage requires investigation. Please resubmit with corrected figures.',
    created_by: 'Store Manager SC',
    updated_by: 'Dedi Regional',
    created_at: '2024-07-22T20:15:00Z',
    updated_at: '2024-07-23T11:45:00Z'
  },
  {
    id: '6',
    reconciliation_number: 'REC-2024-Q2',
    reconciliation_date: '2024-06-30T00:00:00Z',
    reconciliation_period: 'Q2 2024 (April-June)',
    location: 'Company Wide',
    location_type: 'region',
    reconciliation_type: 'quarterly',
    total_sales_recorded: 18500000000,
    total_sales_system: 18456750000,
    variance_amount: 43250000,
    variance_percentage: 0.23,
    cash_sales: 5550000000,
    card_sales: 11100000000,
    transfer_sales: 1850000000,
    refunds_amount: 925000000,
    discounts_amount: 1387500000,
    tax_amount: 1850000000,
    status: 'completed',
    reviewed_by: 'CFO',
    approved_by: 'CEO',
    issues_found: 12,
    adjustments_made: 8,
    notes: 'Quarterly reconciliation completed with minor positive variance. All major discrepancies resolved.',
    created_by: 'Finance Director',
    updated_by: 'Lisa Finance',
    created_at: '2024-07-01T09:00:00Z',
    updated_at: '2024-07-15T16:30:00Z'
  },
  {
    id: '7',
    reconciliation_number: 'REC-2024-07-21',
    reconciliation_date: '2024-07-21T00:00:00Z',
    reconciliation_period: '2024-07-21',
    location: 'Store Kelapa Gading',
    location_type: 'store',
    reconciliation_type: 'daily',
    total_sales_recorded: 56780000,
    total_sales_system: 56215000,
    variance_amount: 565000,
    variance_percentage: 1.00,
    cash_sales: 17034000,
    card_sales: 36707000,
    transfer_sales: 3039000,
    refunds_amount: 568000,
    discounts_amount: 3407000,
    tax_amount: 5678000,
    status: 'in_review',
    reviewed_by: 'Area Manager',
    issues_found: 1,
    adjustments_made: 0,
    notes: 'Positive variance needs verification. Possible duplicate transaction recorded.',
    created_by: 'Store Manager KG',
    updated_by: 'Ahmad Area',
    created_at: '2024-07-21T21:30:00Z',
    updated_at: '2024-07-23T13:20:00Z'
  },
  {
    id: '8',
    reconciliation_number: 'REC-2024-M07',
    reconciliation_date: '2024-07-31T00:00:00Z',
    reconciliation_period: 'July 2024',
    location: 'Surabaya Region',
    location_type: 'region',
    reconciliation_type: 'monthly',
    total_sales_recorded: 4567890000,
    total_sales_system: 4589234000,
    variance_amount: -21344000,
    variance_percentage: -0.47,
    cash_sales: 1370367000,
    card_sales: 2740734000,
    transfer_sales: 456789000,
    refunds_amount: 228394500,
    discounts_amount: 342592350,
    tax_amount: 456789000,
    status: 'pending',
    issues_found: 5,
    adjustments_made: 2,
    notes: 'Monthly reconciliation in progress. Several minor discrepancies identified across multiple stores.',
    created_by: 'Regional Finance SBY',
    updated_by: 'Sari Regional',
    created_at: '2024-08-01T08:15:00Z',
    updated_at: '2024-08-01T15:45:00Z'
  }
]

export default function SalesReconciliationPage() {
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [locationTypeFilter, setLocationTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

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
    { label: 'Reconciliation', href: '/sales/reconciliation' }
  ]

  // Filter reconciliations
  const filteredReconciliations = mockReconciliations.filter(reconciliation => {
    if (searchTerm && !reconciliation.reconciliation_number.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !reconciliation.location.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (locationTypeFilter !== 'all' && reconciliation.location_type !== locationTypeFilter) return false
    if (statusFilter !== 'all' && reconciliation.status !== statusFilter) return false
    if (typeFilter !== 'all' && reconciliation.reconciliation_type !== typeFilter) return false
    return true
  })

  // Sort reconciliations by date (newest first)
  const sortedReconciliations = [...filteredReconciliations].sort((a, b) => 
    new Date(b.reconciliation_date).getTime() - new Date(a.reconciliation_date).getTime()
  )

  // Summary statistics
  const summaryStats = {
    totalReconciliations: mockReconciliations.length,
    pendingReconciliations: mockReconciliations.filter(r => ['pending', 'in_review'].includes(r.status)).length,
    approvedReconciliations: mockReconciliations.filter(r => r.status === 'approved').length,
    completedReconciliations: mockReconciliations.filter(r => r.status === 'completed').length,
    totalVariance: mockReconciliations.reduce((sum, r) => sum + Math.abs(r.variance_amount), 0),
    totalSalesRecorded: mockReconciliations.reduce((sum, r) => sum + r.total_sales_recorded, 0),
    averageVariancePercentage: mockReconciliations.reduce((sum, r) => sum + Math.abs(r.variance_percentage), 0) / mockReconciliations.length
  }

  const getLocationTypeBadge = (type: string) => {
    const config = {
      store: { variant: 'default' as const, label: 'Store', icon: Building },
      warehouse: { variant: 'secondary' as const, label: 'Warehouse', icon: Building },
      region: { variant: 'outline' as const, label: 'Region', icon: BarChart3 },
      online: { variant: 'secondary' as const, label: 'Online', icon: Building }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type, icon: Building }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'outline' as const, label: 'Pending', icon: Clock },
      in_review: { variant: 'secondary' as const, label: 'In Review', icon: Clock },
      approved: { variant: 'default' as const, label: 'Approved', icon: CheckCircle },
      rejected: { variant: 'destructive' as const, label: 'Rejected', icon: AlertCircle },
      completed: { variant: 'default' as const, label: 'Completed', icon: CheckCircle }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status, icon: Clock }
  }

  const getTypeBadge = (type: string) => {
    const config = {
      daily: { variant: 'default' as const, label: 'Daily' },
      weekly: { variant: 'secondary' as const, label: 'Weekly' },
      monthly: { variant: 'outline' as const, label: 'Monthly' },
      quarterly: { variant: 'secondary' as const, label: 'Quarterly' }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type }
  }

  const getVarianceColor = (percentage: number) => {
    const abs = Math.abs(percentage)
    if (abs === 0) return 'text-green-600'
    if (abs <= 0.5) return 'text-blue-600'
    if (abs <= 1.0) return 'text-orange-600'
    return 'text-red-600'
  }

  const columns = [
    {
      key: 'reconciliation_number',
      title: 'Reconciliation #',
      render: (reconciliation: SalesReconciliation) => (
        <Link 
          href={`/sales/reconciliation/${reconciliation.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {reconciliation.reconciliation_number}
        </Link>
      )
    },
    {
      key: 'location',
      title: 'Location',
      render: (reconciliation: SalesReconciliation) => (
        <div>
          <div className="font-medium">{reconciliation.location}</div>
          <div className="text-sm text-muted-foreground">{reconciliation.reconciliation_period}</div>
        </div>
      )
    },
    {
      key: 'location_type',
      title: 'Type',
      render: (reconciliation: SalesReconciliation) => {
        const { variant, label, icon: Icon } = getLocationTypeBadge(reconciliation.location_type)
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'reconciliation_type',
      title: 'Period',
      render: (reconciliation: SalesReconciliation) => {
        const { variant, label } = getTypeBadge(reconciliation.reconciliation_type)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'total_sales',
      title: 'Sales Amount',
      render: (reconciliation: SalesReconciliation) => (
        <div>
          <div className="font-medium">{formatCurrency(reconciliation.total_sales_recorded)}</div>
          <div className="text-sm text-muted-foreground">
            System: {formatCurrency(reconciliation.total_sales_system)}
          </div>
        </div>
      )
    },
    {
      key: 'variance',
      title: 'Variance',
      render: (reconciliation: SalesReconciliation) => (
        <div className="text-center">
          <div className={`font-bold ${getVarianceColor(reconciliation.variance_percentage)}`}>
            {formatCurrency(reconciliation.variance_amount)}
          </div>
          <div className={`text-sm ${getVarianceColor(reconciliation.variance_percentage)}`}>
            {mounted ? `${reconciliation.variance_percentage.toFixed(2)}%` : ''}
          </div>
        </div>
      )
    },
    {
      key: 'issues_found',
      title: 'Issues',
      render: (reconciliation: SalesReconciliation) => (
        <div className="text-center">
          <div className="font-medium">{reconciliation.issues_found}</div>
          <div className="text-sm text-muted-foreground">
            {reconciliation.adjustments_made} adjusted
          </div>
        </div>
      )
    },
    {
      key: 'reconciliation_date',
      title: 'Date',
      render: (reconciliation: SalesReconciliation) => (
        <span className="text-sm">{formatDate(reconciliation.reconciliation_date)}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (reconciliation: SalesReconciliation) => {
        const { variant, label, icon: Icon } = getStatusBadge(reconciliation.status)
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
      render: (reconciliation: SalesReconciliation) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/sales/reconciliation/${reconciliation.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/sales/reconciliation/${reconciliation.id}/edit`}>
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
          title="Sales Reconciliation"
          description="Reconcile sales transactions and resolve discrepancies"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/sales/reconciliation/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Reconciliation
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
                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalReconciliations}</p>
                <p className="text-sm text-blue-600 mt-1">All reconciliations</p>
              </div>
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{summaryStats.pendingReconciliations}</p>
                <p className="text-sm text-orange-600 mt-1">Need review</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{summaryStats.approvedReconciliations}</p>
                <p className="text-sm text-green-600 mt-1">Verified</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{summaryStats.completedReconciliations}</p>
                <p className="text-sm text-blue-600 mt-1">Finalized</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${(summaryStats.totalSalesRecorded / 1000000000).toFixed(1)}B` : ''}
                </p>
                <p className="text-sm text-purple-600 mt-1">IDR recorded</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Variance</p>
                <p className="text-2xl font-bold mt-1 text-red-600">
                  {mounted ? `${(summaryStats.totalVariance / 1000000).toFixed(0)}M` : ''}
                </p>
                <p className="text-sm text-red-600 mt-1">Absolute variance</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Variance</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${summaryStats.averageVariancePercentage.toFixed(2)}%` : ''}
                </p>
                <p className="text-sm text-gray-600 mt-1">Average</p>
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
                    placeholder="Search reconciliations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location-type">Location Type</Label>
                <Select value={locationTypeFilter} onValueChange={setLocationTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    <SelectItem value="store">Store</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="region">Region</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Period Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All periods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All periods</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
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
            {sortedReconciliations.length} of {mockReconciliations.length} reconciliations
          </div>
        </div>

        {/* Content */}
        {activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedReconciliations.map((reconciliation) => {
              const { variant: locationVariant, label: locationLabel, icon: LocationIcon } = getLocationTypeBadge(reconciliation.location_type)
              const { variant: statusVariant, label: statusLabel, icon: StatusIcon } = getStatusBadge(reconciliation.status)
              const { variant: typeVariant, label: typeLabel } = getTypeBadge(reconciliation.reconciliation_type)
              
              return (
                <Card key={reconciliation.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      <div>
                        <Link 
                          href={`/sales/reconciliation/${reconciliation.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {reconciliation.reconciliation_number}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {reconciliation.location}
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
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <div className="flex items-center space-x-1">
                        <LocationIcon className="h-4 w-4" />
                        <Badge variant={locationVariant}>{locationLabel}</Badge>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Period:</span>
                      <Badge variant={typeVariant}>{typeLabel}</Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Date:</span>
                      <span className="text-sm">{formatDate(reconciliation.reconciliation_date)}</span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="text-center py-3 bg-muted rounded-lg">
                        <div className={`text-2xl font-bold ${getVarianceColor(reconciliation.variance_percentage)}`}>
                          {mounted ? `${reconciliation.variance_percentage.toFixed(2)}%` : ''}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Variance</div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sales Recorded:</span>
                        <span className="text-sm font-medium">
                          {mounted ? `${(reconciliation.total_sales_recorded / 1000000).toFixed(0)}M` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">System Sales:</span>
                        <span className="text-sm font-medium">
                          {mounted ? `${(reconciliation.total_sales_system / 1000000).toFixed(0)}M` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Variance:</span>
                        <span className={`text-sm font-semibold ${getVarianceColor(reconciliation.variance_percentage)}`}>
                          {formatCurrency(reconciliation.variance_amount)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cash Sales:</span>
                        <span className="text-sm font-medium">
                          {mounted ? `${(reconciliation.cash_sales / 1000000).toFixed(0)}M` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Card Sales:</span>
                        <span className="text-sm font-medium">
                          {mounted ? `${(reconciliation.card_sales / 1000000).toFixed(0)}M` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Transfer Sales:</span>
                        <span className="text-sm font-medium">
                          {mounted ? `${(reconciliation.transfer_sales / 1000000).toFixed(0)}M` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Issues:</span>
                        <span className="text-sm font-medium">{reconciliation.issues_found}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Adjustments:</span>
                        <span className="text-sm font-medium">{reconciliation.adjustments_made}</span>
                      </div>
                    </div>

                    {reconciliation.notes && (
                      <div className="border-t pt-3 text-sm text-muted-foreground">
                        <strong>Notes:</strong> {reconciliation.notes.substring(0, 100)}
                        {reconciliation.notes.length > 100 && '...'}
                      </div>
                    )}

                    <div className="flex space-x-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/sales/reconciliation/${reconciliation.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/sales/reconciliation/${reconciliation.id}/edit`}>
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
              <h3 className="text-lg font-semibold">Sales Reconciliation</h3>
              <p className="text-sm text-muted-foreground">Review and reconcile all sales transactions</p>
            </div>
            <AdvancedDataTable
              data={sortedReconciliations}
              columns={columns}
              searchable={false}
              filterable={false}
              pagination={{
                pageSize: 15,
                currentPage: 1,
                totalPages: Math.ceil(sortedReconciliations.length / 15),
                totalItems: sortedReconciliations.length,
                onChange: () => {}
              }}
            />
          </Card>
        )}

        {/* Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Reconciliations Alert */}
          {summaryStats.pendingReconciliations > 0 && (
            <Card className="p-6 border-orange-200 bg-orange-50">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-orange-600" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-800">Pending Reconciliations</h3>
                  <p className="text-orange-700 mt-1">
                    {summaryStats.pendingReconciliations} reconciliations are pending review and require attention.
                  </p>
                </div>
                <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                  Review Pending
                </Button>
              </div>
            </Card>
          )}

          {/* High Variance Alert */}
          {mockReconciliations.filter(r => Math.abs(r.variance_percentage) > 1.0 && r.status !== 'completed').length > 0 && (
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800">High Variance Alert</h3>
                  <p className="text-red-700 mt-1">
                    {mockReconciliations.filter(r => Math.abs(r.variance_percentage) > 1.0 && r.status !== 'completed').length} reconciliations have variances above 1% and need investigation.
                  </p>
                </div>
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  Investigate
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </TwoLevelLayout>
  )
}