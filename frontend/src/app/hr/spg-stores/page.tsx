'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TanStackDataTable, type TanStackColumn } from '@/components/ui/tanstack-data-table'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Location01Icon,
  ChartLineData01Icon,
  Call02Icon,
  Clock01Icon,
  UserIcon,
  Store01Icon,
  UserGroupIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Coins01Icon,
  Award01Icon,
  Download01Icon,
  PlusSignIcon,
  MapsIcon,
  Search01Icon,
  FilterHorizontalIcon
} from '@hugeicons/core-free-icons'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SPGAssignment {
  id: string
  spgId: string
  spgName: string
  storeId: string
  storeName: string
  storeLocation: string
  storeType: 'mall' | 'street' | 'outlet' | 'department'
  assignment: 'permanent' | 'temporary' | 'rotation' | 'backup'
  startDate: string
  endDate?: string
  workingHours: string
  monthlySales: number
  targetSales: number
  commission: number
  performance: number // 0-100%
  status: 'active' | 'inactive' | 'on-leave' | 'terminated'
  contractType: 'full-time' | 'part-time' | 'freelance'
  supervisor: string
  phoneNumber: string
  email: string
  notes?: string
}

// Mock SPG data
const mockSPGData: SPGAssignment[] = [
  {
    id: '1',
    spgId: 'SPG001',
    spgName: 'Sari Dewi',
    storeId: 'ST001',
    storeName: 'Malaka Store Plaza Indonesia',
    storeLocation: 'Jakarta Pusat',
    storeType: 'mall',
    assignment: 'permanent',
    startDate: '2024-01-15',
    workingHours: '10:00 - 19:00',
    monthlySales: 85000000,
    targetSales: 80000000,
    commission: 2550000,
    performance: 106,
    status: 'active',
    contractType: 'full-time',
    supervisor: 'Store Manager Jakarta',
    phoneNumber: '+62 812-3456-7890',
    email: 'sari.dewi@malaka.com'
  },
  {
    id: '2',
    spgId: 'SPG002',
    spgName: 'Maya Sari',
    storeId: 'ST002',
    storeName: 'Malaka Store Grand Indonesia',
    storeLocation: 'Jakarta Pusat',
    storeType: 'mall',
    assignment: 'permanent',
    startDate: '2024-02-01',
    workingHours: '10:00 - 19:00',
    monthlySales: 72000000,
    targetSales: 75000000,
    commission: 2160000,
    performance: 96,
    status: 'active',
    contractType: 'full-time',
    supervisor: 'Store Manager Jakarta',
    phoneNumber: '+62 813-4567-8901',
    email: 'maya.sari@malaka.com'
  },
  {
    id: '3',
    spgId: 'SPG003',
    spgName: 'Rina Handayani',
    storeId: 'ST003',
    storeName: 'Malaka Store Senayan City',
    storeLocation: 'Jakarta Selatan',
    storeType: 'mall',
    assignment: 'temporary',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    workingHours: '10:00 - 19:00',
    monthlySales: 65000000,
    targetSales: 70000000,
    commission: 1950000,
    performance: 93,
    status: 'active',
    contractType: 'part-time',
    supervisor: 'Area Manager South',
    phoneNumber: '+62 814-5678-9012',
    email: 'rina.handayani@malaka.com'
  },
  {
    id: '4',
    spgId: 'SPG004',
    spgName: 'Dewi Lestari',
    storeId: 'ST004',
    storeName: 'Malaka Store Pondok Indah Mall',
    storeLocation: 'Jakarta Selatan',
    storeType: 'mall',
    assignment: 'permanent',
    startDate: '2023-10-01',
    workingHours: '10:00 - 19:00',
    monthlySales: 90000000,
    targetSales: 85000000,
    commission: 2700000,
    performance: 106,
    status: 'active',
    contractType: 'full-time',
    supervisor: 'Area Manager South',
    phoneNumber: '+62 815-6789-0123',
    email: 'dewi.lestari@malaka.com'
  },
  {
    id: '5',
    spgId: 'SPG005',
    spgName: 'Indira Putri',
    storeId: 'ST005',
    storeName: 'Malaka Store Kelapa Gading',
    storeLocation: 'Jakarta Utara',
    storeType: 'mall',
    assignment: 'rotation',
    startDate: '2024-03-01',
    workingHours: '10:00 - 19:00',
    monthlySales: 55000000,
    targetSales: 60000000,
    commission: 1650000,
    performance: 92,
    status: 'on-leave',
    contractType: 'full-time',
    supervisor: 'Area Manager North',
    phoneNumber: '+62 816-7890-1234',
    email: 'indira.putri@malaka.com',
    notes: 'Maternity leave until September 2024'
  },
  {
    id: '6',
    spgId: 'SPG006',
    spgName: 'Fitri Rahayu',
    storeId: 'ST006',
    storeName: 'Malaka Store Mal Taman Anggrek',
    storeLocation: 'Jakarta Barat',
    storeType: 'mall',
    assignment: 'permanent',
    startDate: '2024-04-15',
    workingHours: '10:00 - 19:00',
    monthlySales: 78000000,
    targetSales: 75000000,
    commission: 2340000,
    performance: 104,
    status: 'active',
    contractType: 'full-time',
    supervisor: 'Area Manager West',
    phoneNumber: '+62 817-8901-2345',
    email: 'fitri.rahayu@malaka.com'
  },
  {
    id: '7',
    spgId: 'SPG007',
    spgName: 'Nina Kusuma',
    storeId: 'ST007',
    storeName: 'Malaka Outlet Tanah Abang',
    storeLocation: 'Jakarta Pusat',
    storeType: 'outlet',
    assignment: 'backup',
    startDate: '2024-05-01',
    workingHours: '09:00 - 18:00',
    monthlySales: 45000000,
    targetSales: 50000000,
    commission: 1350000,
    performance: 90,
    status: 'active',
    contractType: 'part-time',
    supervisor: 'Outlet Manager',
    phoneNumber: '+62 818-9012-3456',
    email: 'nina.kusuma@malaka.com'
  },
  {
    id: '8',
    spgId: 'SPG008',
    spgName: 'Lita Sari',
    storeId: 'ST008',
    storeName: 'Malaka Store Summarecon Bekasi',
    storeLocation: 'Bekasi',
    storeType: 'mall',
    assignment: 'permanent',
    startDate: '2024-01-01',
    workingHours: '10:00 - 19:00',
    monthlySales: 68000000,
    targetSales: 70000000,
    commission: 2040000,
    performance: 97,
    status: 'active',
    contractType: 'full-time',
    supervisor: 'Area Manager East',
    phoneNumber: '+62 819-0123-4567',
    email: 'lita.sari@malaka.com'
  }
]

// Status and type color mappings
const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  'on-leave': 'bg-yellow-100 text-yellow-800',
  terminated: 'bg-red-100 text-red-800'
}

const assignmentColors = {
  permanent: 'bg-blue-100 text-blue-800',
  temporary: 'bg-orange-100 text-orange-800',
  rotation: 'bg-purple-100 text-purple-800',
  backup: 'bg-gray-100 text-gray-800'
}

const storeTypeColors = {
  mall: 'bg-indigo-100 text-indigo-800',
  street: 'bg-green-100 text-green-800',
  outlet: 'bg-red-100 text-red-800',
  department: 'bg-purple-100 text-purple-800'
}

const contractColors = {
  'full-time': 'bg-blue-100 text-blue-800',
  'part-time': 'bg-yellow-100 text-yellow-800',
  freelance: 'bg-gray-100 text-gray-800'
}

export default function SPGStoresPage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'HR Management', href: '/hr' },
    { label: 'SPG Stores', href: '/hr/spg-stores' }
  ]

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSPG = mockSPGData.length
    const activeSPG = mockSPGData.filter(spg => spg.status === 'active').length
    const onLeaveSPG = mockSPGData.filter(spg => spg.status === 'on-leave').length
    const totalSales = mockSPGData.reduce((sum, spg) => sum + spg.monthlySales, 0)
    const totalTargets = mockSPGData.reduce((sum, spg) => sum + spg.targetSales, 0)
    const achievementRate = totalTargets > 0 ? (totalSales / totalTargets) * 100 : 0

    return { totalSPG, activeSPG, onLeaveSPG, totalSales, achievementRate }
  }, [])

  // Filter Data
  const filteredData = useMemo(() => {
    let data = mockSPGData
    if (searchTerm) {
      const lower = searchTerm.toLowerCase()
      data = data.filter(item =>
        item.spgName.toLowerCase().includes(lower) ||
        item.storeName.toLowerCase().includes(lower) ||
        item.storeLocation.toLowerCase().includes(lower)
      )
    }
    if (statusFilter !== 'all') {
      data = data.filter(item => item.status === statusFilter)
    }
    return data
  }, [searchTerm, statusFilter])

  const columns: TanStackColumn<SPGAssignment>[] = [
    {
      id: 'spg',
      header: 'SPG Name',
      accessorKey: 'spgName',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.spgName}</div>
          <div className="text-xs text-muted-foreground">{row.original.spgId}</div>
        </div>
      )
    },
    {
      id: 'store',
      header: 'Store',
      accessorKey: 'storeName',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-xs">{row.original.storeName}</div>
          <div className="text-xs text-muted-foreground flex items-center">
            <HugeiconsIcon icon={Location01Icon} className="h-3 w-3 mr-1" />
            {row.original.storeLocation}
          </div>
        </div>
      )
    },
    {
      id: 'storeType',
      header: 'Store Type',
      accessorKey: 'storeType',
      cell: ({ row }) => {
        const type = row.original.storeType as keyof typeof storeTypeColors
        return (
          <Badge className={storeTypeColors[type]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        )
      }
    },
    {
      id: 'assignment',
      header: 'Assignment',
      accessorKey: 'assignment',
      cell: ({ row }) => {
        const assignment = row.original.assignment as keyof typeof assignmentColors
        return (
          <Badge className={assignmentColors[assignment]}>
            {assignment.charAt(0).toUpperCase() + assignment.slice(1)}
          </Badge>
        )
      }
    },
    {
      id: 'sales',
      header: 'Monthly Sales',
      accessorKey: 'monthlySales',
      cell: ({ row }) => {
        const sales = row.original.monthlySales
        const target = row.original.targetSales
        const achievement = (sales / target) * 100
        const color = achievement >= 100 ? 'text-green-600' : achievement >= 90 ? 'text-yellow-600' : 'text-red-600'

        return (
          <div className="text-xs">
            <div className={`font-medium ${color}`}>
              {mounted ? sales.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
            </div>
            <div className="text-xs text-muted-foreground">{achievement.toFixed(0)}% of target</div>
          </div>
        )
      }
    },
    {
      id: 'performance',
      header: 'Performance',
      accessorKey: 'performance',
      cell: ({ row }) => {
        const performance = row.original.performance
        const color = performance >= 100 ? 'text-green-600' : performance >= 90 ? 'text-yellow-600' : 'text-red-600'
        return (
          <div className={`font-bold ${color} flex items-center`}>
            <HugeiconsIcon icon={ChartLineData01Icon} className="h-4 w-4 mr-1" />
            {performance}%
          </div>
        )
      }
    },
    {
      id: 'commission',
      header: 'Commission',
      accessorKey: 'commission',
      cell: ({ row }) => (
        <div className="text-xs font-medium">
          {mounted ? row.original.commission.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status as keyof typeof statusColors
        return (
          <Badge className={statusColors[status]}>
            {status.replace('-', ' ').charAt(0).toUpperCase() + status.replace('-', ' ').slice(1)}
          </Badge>
        )
      }
    },
    {
      id: 'contract',
      header: 'Contract',
      accessorKey: 'contractType',
      cell: ({ row }) => {
        const contract = row.original.contractType as keyof typeof contractColors
        return (
          <Badge className={contractColors[contract]}>
            {contract.replace('-', ' ').charAt(0).toUpperCase() + contract.replace('-', ' ').slice(1)}
          </Badge>
        )
      }
    }
  ]

  const SPGCard = ({ spg }: { spg: SPGAssignment }) => {
    const achievement = (spg.monthlySales / spg.targetSales) * 100

    return (
      <Card className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{spg.spgName}</h3>
            <p className="text-sm text-gray-500">{spg.spgId}</p>
            <p className="text-xs text-gray-400 flex items-center">
              <HugeiconsIcon icon={Call02Icon} className="h-3 w-3 mr-1" />
              {spg.phoneNumber}
            </p>
          </div>
          <div className="text-right">
            <Badge className={statusColors[spg.status]}>
              {spg.status.replace('-', ' ').charAt(0).toUpperCase() + spg.status.replace('-', ' ').slice(1)}
            </Badge>
            <div className="mt-1">
              <Badge className={assignmentColors[spg.assignment]}>
                {spg.assignment.charAt(0).toUpperCase() + spg.assignment.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="p-2 bg-blue-50 rounded">
            <div className="font-medium text-blue-900">{spg.storeName}</div>
            <div className="text-xs text-blue-700 flex items-center">
              <HugeiconsIcon icon={Location01Icon} className="h-3 w-3 mr-1" />
              {spg.storeLocation} • {spg.storeType.charAt(0).toUpperCase() + spg.storeType.slice(1)}
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Working Hours:</span>
            <span className="flex items-center">
              <HugeiconsIcon icon={Clock01Icon} className="h-3 w-3 mr-1 text-gray-400" />
              {spg.workingHours}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Monthly Sales:</span>
            <span className="font-medium">
              {mounted ? spg.monthlySales.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Target:</span>
            <span>
              {mounted ? spg.targetSales.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Achievement:</span>
            <span className={achievement >= 100 ? 'text-green-600 font-medium' : achievement >= 90 ? 'text-yellow-600' : 'text-red-600'}>
              {achievement.toFixed(1)}%
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Commission:</span>
            <span className="font-medium text-green-600">
              {mounted ? spg.commission.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Performance:</span>
            <span className={spg.performance >= 100 ? 'text-green-600 font-bold' : spg.performance >= 90 ? 'text-yellow-600' : 'text-red-600'}>
              {spg.performance}%
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Supervisor:</span>
            <span>{spg.supervisor}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Start Date:</span>
            <span>{mounted ? new Date(spg.startDate).toLocaleDateString('id-ID') : ''}</span>
          </div>

          {spg.notes && (
            <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
              <span className="font-medium text-yellow-800">Notes: </span>
              <span className="text-yellow-700">{spg.notes}</span>
            </div>
          )}
        </div>

        <div className="flex space-x-2 mt-4">
          <Button size="sm" variant="outline" className="flex-1">
            <HugeiconsIcon icon={UserIcon} className="h-4 w-4 mr-1" />
            View Profile
          </Button>
          <Button size="sm" className="flex-1">
            <HugeiconsIcon icon={Store01Icon} className="h-4 w-4 mr-1" />
            Store Details
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <TwoLevelLayout>
      <Header
        title="SPG Store Management"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={MapsIcon} className="h-4 w-4 mr-2" />
              Store Map
            </Button>
            <Button size="sm">
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
              Add SPG
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total SPG</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stats.totalSPG}</p>
                  <span className="text-xs text-muted-foreground">
                    {stats.activeSPG} Active
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={UserGroupIcon} className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales (Monthly)</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mounted ? (stats.totalSales / 1000000).toFixed(0) : ''}M
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={Coins01Icon} className="h-5 w-5 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Achievement</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {mounted ? stats.achievementRate.toFixed(1) : ''}%
                </p>
              </div>
              <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={ChartLineData01Icon} className="h-5 w-5 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.onLeaveSPG}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search SPG, Store, or Location..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
              <Button
                variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="h-8"
              >
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-8"
              >
                Table
              </Button>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="h-9">
              <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Data Display */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((spg) => (
              <SPGCard key={spg.id} spg={spg} />
            ))}
            {filteredData.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No SPG assignments found matching your criteria.
              </div>
            )}
          </div>
        ) : (
          <TanStackDataTable
            data={filteredData}
            columns={columns}
            searchPlaceholder="Search..."
          />
        )}
      </div>
    </TwoLevelLayout>
  )
}