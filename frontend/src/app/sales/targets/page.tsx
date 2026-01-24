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

import Link from 'next/link'

// Sales Target types
interface SalesTarget {
  id: string
  target_name: string
  target_type: 'individual' | 'team' | 'store' | 'region' | 'company'
  assigned_to: string
  assigned_to_type: 'employee' | 'team' | 'store' | 'region'
  target_period: 'monthly' | 'quarterly' | 'semi_annually' | 'annually'
  start_date: string
  end_date: string
  target_amount: number
  target_quantity?: number
  achieved_amount: number
  achieved_quantity?: number
  achievement_percentage: number
  status: 'active' | 'completed' | 'overdue' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  bonus_eligible: boolean
  bonus_amount?: number
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
}

const mockTargets: SalesTarget[] = [
  {
    id: '1',
    target_name: 'Q3 2024 Individual Sales Target',
    target_type: 'individual',
    assigned_to: 'Ahmad Sales Executive',
    assigned_to_type: 'employee',
    target_period: 'quarterly',
    start_date: '2024-07-01T00:00:00Z',
    end_date: '2024-09-30T23:59:59Z',
    target_amount: 500000000,
    target_quantity: 250,
    achieved_amount: 378500000,
    achieved_quantity: 189,
    achievement_percentage: 75.7,
    status: 'active',
    priority: 'high',
    bonus_eligible: true,
    bonus_amount: 5000000,
    created_by: 'Sales Manager',
    updated_by: 'Ahmad Sales',
    created_at: '2024-06-25T10:00:00Z',
    updated_at: '2024-07-25T14:30:00Z'
  },
  {
    id: '2',
    target_name: 'Store Plaza Indonesia Monthly Target',
    target_type: 'store',
    assigned_to: 'Store Plaza Indonesia',
    assigned_to_type: 'store',
    target_period: 'monthly',
    start_date: '2024-07-01T00:00:00Z',
    end_date: '2024-07-31T23:59:59Z',
    target_amount: 750000000,
    target_quantity: 400,
    achieved_amount: 825600000,
    achieved_quantity: 456,
    achievement_percentage: 110.1,
    status: 'completed',
    priority: 'high',
    bonus_eligible: true,
    bonus_amount: 15000000,
    created_by: 'Regional Manager',
    updated_by: 'Sari Store Manager',
    created_at: '2024-06-28T09:30:00Z',
    updated_at: '2024-07-31T18:00:00Z'
  },
  {
    id: '3',
    target_name: 'Jakarta Region Annual Target 2024',
    target_type: 'region',
    assigned_to: 'Jakarta Region',
    assigned_to_type: 'region',
    target_period: 'annually',
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    target_amount: 12000000000,
    target_quantity: 6000,
    achieved_amount: 7845600000,
    achieved_quantity: 3923,
    achievement_percentage: 65.4,
    status: 'active',
    priority: 'critical',
    bonus_eligible: true,
    bonus_amount: 100000000,
    created_by: 'CEO',
    updated_by: 'Regional Director',
    created_at: '2023-12-15T14:00:00Z',
    updated_at: '2024-07-25T16:45:00Z'
  },
  {
    id: '4',
    target_name: 'Online Sales Team Q3 Target',
    target_type: 'team',
    assigned_to: 'Online Sales Team',
    assigned_to_type: 'team',
    target_period: 'quarterly',
    start_date: '2024-07-01T00:00:00Z',
    end_date: '2024-09-30T23:59:59Z',
    target_amount: 2000000000,
    target_quantity: 1200,
    achieved_amount: 1567800000,
    achieved_quantity: 934,
    achievement_percentage: 78.4,
    status: 'active',
    priority: 'high',
    bonus_eligible: true,
    bonus_amount: 25000000,
    created_by: 'E-commerce Manager',
    updated_by: 'Budi Team Lead',
    created_at: '2024-06-20T11:45:00Z',
    updated_at: '2024-07-24T13:20:00Z'
  },
  {
    id: '5',
    target_name: 'Company Half Year Target 2024',
    target_type: 'company',
    assigned_to: 'Malaka Footwear',
    assigned_to_type: 'region',
    target_period: 'semi_annually',
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-06-30T23:59:59Z',
    target_amount: 25000000000,
    target_quantity: 15000,
    achieved_amount: 26750000000,
    achieved_quantity: 16234,
    achievement_percentage: 107.0,
    status: 'completed',
    priority: 'critical',
    bonus_eligible: true,
    bonus_amount: 500000000,
    created_by: 'Board of Directors',
    updated_by: 'CEO',
    created_at: '2023-12-01T15:30:00Z',
    updated_at: '2024-06-30T23:59:59Z'
  },
  {
    id: '6',
    target_name: 'Rina Individual Monthly Target',
    target_type: 'individual',
    assigned_to: 'Rina Sales Executive',
    assigned_to_type: 'employee',
    target_period: 'monthly',
    start_date: '2024-07-01T00:00:00Z',
    end_date: '2024-07-31T23:59:59Z',
    target_amount: 150000000,
    target_quantity: 80,
    achieved_amount: 89600000,
    achieved_quantity: 47,
    achievement_percentage: 59.7,
    status: 'overdue',
    priority: 'medium',
    bonus_eligible: false,
    created_by: 'Sales Manager',
    updated_by: 'Rina Sales',
    created_at: '2024-06-28T08:15:00Z',
    updated_at: '2024-07-25T09:30:00Z'
  },
  {
    id: '7',
    target_name: 'Store Grand Indonesia Q3 Target',
    target_type: 'store',
    assigned_to: 'Store Grand Indonesia',
    assigned_to_type: 'store',
    target_period: 'quarterly',
    start_date: '2024-07-01T00:00:00Z',
    end_date: '2024-09-30T23:59:59Z',
    target_amount: 1800000000,
    target_quantity: 900,
    achieved_amount: 567800000,
    achieved_quantity: 284,
    achievement_percentage: 31.5,
    status: 'active',
    priority: 'high',
    bonus_eligible: true,
    bonus_amount: 18000000,
    created_by: 'Regional Manager',
    updated_by: 'Dedi Store Manager',
    created_at: '2024-06-25T12:00:00Z',
    updated_at: '2024-07-23T15:45:00Z'
  },
  {
    id: '8',
    target_name: 'Surabaya Region Q3 Target',
    target_type: 'region',
    assigned_to: 'Surabaya Region',
    assigned_to_type: 'region',
    target_period: 'quarterly',
    start_date: '2024-07-01T00:00:00Z',
    end_date: '2024-09-30T23:59:59Z',
    target_amount: 3500000000,
    target_quantity: 1750,
    achieved_amount: 2156700000,
    achieved_quantity: 1078,
    achievement_percentage: 61.6,
    status: 'active',
    priority: 'high',
    bonus_eligible: true,
    bonus_amount: 50000000,
    created_by: 'National Sales Director',
    updated_by: 'Regional Manager Surabaya',
    created_at: '2024-06-20T10:30:00Z',
    updated_at: '2024-07-22T12:15:00Z'
  },
  {
    id: '9',
    target_name: 'Premium Products Team Target',
    target_type: 'team',
    assigned_to: 'Premium Products Team',
    assigned_to_type: 'team',
    target_period: 'monthly',
    start_date: '2024-07-01T00:00:00Z',
    end_date: '2024-07-31T23:59:59Z',
    target_amount: 800000000,
    target_quantity: 200,
    achieved_amount: 934500000,
    achieved_quantity: 234,
    achievement_percentage: 116.8,
    status: 'completed',
    priority: 'medium',
    bonus_eligible: true,
    bonus_amount: 12000000,
    created_by: 'Product Manager',
    updated_by: 'Lisa Team Lead',
    created_at: '2024-06-28T14:20:00Z',
    updated_at: '2024-07-31T20:30:00Z'
  },
  {
    id: '10',
    target_name: 'Corporate Sales Q3 Target',
    target_type: 'team',
    assigned_to: 'Corporate Sales Team',
    assigned_to_type: 'team',
    target_period: 'quarterly',
    start_date: '2024-07-01T00:00:00Z',
    end_date: '2024-09-30T23:59:59Z',
    target_amount: 1200000000,
    target_quantity: 400,
    achieved_amount: 234500000,
    achieved_quantity: 78,
    achievement_percentage: 19.5,
    status: 'active',
    priority: 'critical',
    bonus_eligible: false,
    created_by: 'Sales Director',
    updated_by: 'Corporate Sales Manager',
    created_at: '2024-06-22T16:45:00Z',
    updated_at: '2024-07-21T11:30:00Z'
  }
]

export default function SalesTargetsPage() {
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('all')

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
    { label: 'Targets', href: '/sales/targets' }
  ]

  // Filter targets
  const filteredTargets = mockTargets.filter(target => {
    if (searchTerm && !target.target_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !target.assigned_to.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (typeFilter !== 'all' && target.target_type !== typeFilter) return false
    if (statusFilter !== 'all' && target.status !== statusFilter) return false
    if (periodFilter !== 'all' && target.target_period !== periodFilter) return false
    return true
  })

  // Sort targets by achievement percentage (highest first)
  const sortedTargets = [...filteredTargets].sort((a, b) => b.achievement_percentage - a.achievement_percentage)

  // Summary statistics
  const summaryStats = {
    totalTargets: mockTargets.length,
    activeTargets: mockTargets.filter(t => t.status === 'active').length,
    completedTargets: mockTargets.filter(t => t.status === 'completed').length,
    overdueTargets: mockTargets.filter(t => t.status === 'overdue').length,
    totalTargetAmount: mockTargets.reduce((sum, t) => sum + t.target_amount, 0),
    totalAchievedAmount: mockTargets.reduce((sum, t) => sum + t.achieved_amount, 0),
    averageAchievement: mockTargets.reduce((sum, t) => sum + t.achievement_percentage, 0) / mockTargets.length
  }

  const getTypeBadge = (type: string) => {
    const config = {
      individual: { variant: 'default' as const, label: 'Individual', icon: User },
      team: { variant: 'secondary' as const, label: 'Team', icon: Users },
      store: { variant: 'outline' as const, label: 'Store', icon: Building },
      region: { variant: 'secondary' as const, label: 'Region', icon: ChartBar },
      company: { variant: 'default' as const, label: 'Company', icon: Award }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type, icon: Target }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      active: { variant: 'default' as const, label: 'Active', icon: Clock },
      completed: { variant: 'default' as const, label: 'Completed', icon: CheckCircle },
      overdue: { variant: 'destructive' as const, label: 'Overdue', icon: WarningCircle },
      cancelled: { variant: 'secondary' as const, label: 'Cancelled', icon: WarningCircle }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status, icon: Clock }
  }

  const getPeriodBadge = (period: string) => {
    const config = {
      monthly: { variant: 'default' as const, label: 'Monthly' },
      quarterly: { variant: 'secondary' as const, label: 'Quarterly' },
      semi_annually: { variant: 'outline' as const, label: 'Semi-Annual' },
      annually: { variant: 'secondary' as const, label: 'Annual' }
    }
    return config[period as keyof typeof config] || { variant: 'secondary' as const, label: period }
  }

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: { variant: 'secondary' as const, label: 'Low' },
      medium: { variant: 'outline' as const, label: 'Medium' },
      high: { variant: 'default' as const, label: 'High' },
      critical: { variant: 'destructive' as const, label: 'Critical' }
    }
    return config[priority as keyof typeof config] || { variant: 'secondary' as const, label: priority }
  }

  const getAchievementColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const columns = [
    {
      key: 'target_name',
      title: 'Target Name',
      render: (target: SalesTarget) => (
        <Link 
          href={`/sales/targets/${target.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {target.target_name}
        </Link>
      )
    },
    {
      key: 'target_type',
      title: 'Type',
      render: (target: SalesTarget) => {
        const { variant, label, icon: Icon } = getTypeBadge(target.target_type)
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'assigned_to',
      title: 'Assigned To',
      render: (target: SalesTarget) => (
        <span className="font-medium">{target.assigned_to}</span>
      )
    },
    {
      key: 'target_period',
      title: 'Period',
      render: (target: SalesTarget) => {
        const { variant, label } = getPeriodBadge(target.target_period)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'target_amount',
      title: 'Target Amount',
      render: (target: SalesTarget) => (
        <span className="font-medium">{formatCurrency(target.target_amount)}</span>
      )
    },
    {
      key: 'achieved_amount',
      title: 'Achieved',
      render: (target: SalesTarget) => (
        <div>
          <div className="font-medium text-green-600">{formatCurrency(target.achieved_amount)}</div>
          {target.target_quantity && target.achieved_quantity && (
            <div className="text-sm text-muted-foreground">
              {target.achieved_quantity} / {target.target_quantity} units
            </div>
          )}
        </div>
      )
    },
    {
      key: 'achievement_percentage',
      title: 'Progress',
      render: (target: SalesTarget) => (
        <div className="text-center">
          <div className={`font-bold text-lg ${getAchievementColor(target.achievement_percentage)}`}>
            {mounted ? `${target.achievement_percentage.toFixed(1)}%` : ''}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className={`h-2 rounded-full ${
                target.achievement_percentage >= 100 ? 'bg-green-500' :
                target.achievement_percentage >= 80 ? 'bg-blue-500' :
                target.achievement_percentage >= 60 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(target.achievement_percentage, 100)}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'duration',
      title: 'Duration',
      render: (target: SalesTarget) => (
        <div className="text-sm">
          <div>{formatDate(target.start_date)}</div>
          <div className="text-muted-foreground">to {formatDate(target.end_date)}</div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (target: SalesTarget) => {
        const { variant, label, icon: Icon } = getStatusBadge(target.status)
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
      render: (target: SalesTarget) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/sales/targets/${target.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/sales/targets/${target.id}/edit`}>
              <PencilSimple className="h-4 w-4" />
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
          title="Sales Targets"
          description="Manage sales targets and track achievement progress"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <DownloadSimple className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/sales/targets/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Target
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
                <p className="text-sm font-medium text-muted-foreground">Total Targets</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalTargets}</p>
                <p className="text-sm text-blue-600 mt-1">All targets</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">{summaryStats.activeTargets}</p>
                <p className="text-sm text-blue-600 mt-1">In progress</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{summaryStats.completedTargets}</p>
                <p className="text-sm text-green-600 mt-1">Achieved</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{summaryStats.overdueTargets}</p>
                <p className="text-sm text-red-600 mt-1">Behind schedule</p>
              </div>
              <WarningCircle className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Target Amount</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${(summaryStats.totalTargetAmount / 1000000000).toFixed(1)}B` : ''}
                </p>
                <p className="text-sm text-purple-600 mt-1">IDR target</p>
              </div>
              <CurrencyDollar className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Achieved</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {mounted ? `${(summaryStats.totalAchievedAmount / 1000000000).toFixed(1)}B` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">IDR achieved</p>
              </div>
              <TrendUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${summaryStats.averageAchievement.toFixed(1)}%` : ''}
                </p>
                <p className="text-sm text-gray-600 mt-1">Overall</p>
              </div>
              <ChartBar className="h-8 w-8 text-gray-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Funnel className="h-5 w-5 text-muted-foreground" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search targets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Target Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="store">Store</SelectItem>
                    <SelectItem value="region">Region</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
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
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All periods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All periods</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi_annually">Semi-Annual</SelectItem>
                    <SelectItem value="annually">Annual</SelectItem>
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
            {sortedTargets.length} of {mockTargets.length} targets
          </div>
        </div>

        {/* Content */}
        {activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTargets.map((target) => {
              const { variant: typeVariant, label: typeLabel, icon: TypeIcon } = getTypeBadge(target.target_type)
              const { variant: statusVariant, label: statusLabel, icon: StatusIcon } = getStatusBadge(target.status)
              const { variant: periodVariant, label: periodLabel } = getPeriodBadge(target.target_period)
              const { variant: priorityVariant, label: priorityLabel } = getPriorityBadge(target.priority)
              
              return (
                <Card key={target.id} className="p-6 hover: transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <div>
                        <Link 
                          href={`/sales/targets/${target.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {target.target_name.length > 25 ? `${target.target_name.substring(0, 25)}...` : target.target_name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {target.assigned_to}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-1">
                        <StatusIcon className="h-4 w-4" />
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </div>
                      <Badge variant={priorityVariant}>{priorityLabel}</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <div className="flex items-center space-x-1">
                        <TypeIcon className="h-4 w-4" />
                        <Badge variant={typeVariant}>{typeLabel}</Badge>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Period:</span>
                      <Badge variant={periodVariant}>{periodLabel}</Badge>
                    </div>

                    <div className="border-t pt-3">
                      <div className="text-center py-4 bg-muted rounded-lg">
                        <div className={`text-3xl font-bold ${getAchievementColor(target.achievement_percentage)}`}>
                          {mounted ? `${target.achievement_percentage.toFixed(1)}%` : ''}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Achievement</div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Target:</span>
                        <span className="text-sm font-medium">
                          {mounted ? `${(target.target_amount / 1000000).toFixed(0)}M` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Achieved:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {mounted ? `${(target.achieved_amount / 1000000).toFixed(0)}M` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Remaining:</span>
                        <span className="text-sm font-medium">
                          {mounted ? `${((target.target_amount - target.achieved_amount) / 1000000).toFixed(0)}M` : ''}
                        </span>
                      </div>
                    </div>

                    {target.target_quantity && target.achieved_quantity && (
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Units Target:</span>
                          <span className="text-sm font-medium">{target.target_quantity}</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-sm text-muted-foreground">Units Achieved:</span>
                          <span className="text-sm font-semibold text-blue-600">{target.achieved_quantity}</span>
                        </div>
                      </div>
                    )}

                    {target.bonus_eligible && target.bonus_amount && (
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Bonus:</span>
                          <span className="text-sm font-semibold text-green-600">
                            {formatCurrency(target.bonus_amount)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-3 text-sm text-muted-foreground">
                      <div>Start: {formatDate(target.start_date)}</div>
                      <div>End: {formatDate(target.end_date)}</div>
                    </div>

                    <div className="flex space-x-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/sales/targets/${target.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/sales/targets/${target.id}/edit`}>
                          <PencilSimple className="h-4 w-4" />
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
              <h3 className="text-lg font-semibold">Sales Targets</h3>
              <p className="text-sm text-muted-foreground">Manage all sales targets and track achievement progress</p>
            </div>
            <AdvancedDataTable
              data={sortedTargets}
              columns={columns}
              searchable={false}
              filterable={false}
              pagination={{
                pageSize: 15,
                currentPage: 1,
                totalPages: Math.ceil(sortedTargets.length / 15),
                totalItems: sortedTargets.length,
                onChange: () => {}
              }}
            />
          </Card>
        )}

        {/* Performance Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overdue Targets Alert */}
          {summaryStats.overdueTargets > 0 && (
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="flex items-center space-x-3">
                <WarningCircle className="h-6 w-6 text-red-600" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800">Overdue Targets</h3>
                  <p className="text-red-700 mt-1">
                    {summaryStats.overdueTargets} targets are overdue and require immediate attention.
                  </p>
                </div>
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  Review Overdue
                </Button>
              </div>
            </Card>
          )}

          {/* Low Performance Alert */}
          {mockTargets.filter(t => t.achievement_percentage < 50 && t.status === 'active').length > 0 && (
            <Card className="p-6 border-orange-200 bg-orange-50">
              <div className="flex items-center space-x-3">
                <TrendDown className="h-6 w-6 text-orange-600" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-800">Low Performance</h3>
                  <p className="text-orange-700 mt-1">
                    {mockTargets.filter(t => t.achievement_percentage < 50 && t.status === 'active').length} active targets have achievement below 50%.
                  </p>
                </div>
                <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                  Review Performance
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </TwoLevelLayout>
  )
}