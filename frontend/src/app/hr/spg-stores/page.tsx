'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Badge } from '@/components/ui/badge'
import { 
  Store,
  Users,
  MapPin,
  Phone,
  Calendar,
  TrendingUp,
  DollarSign,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Clock
} from 'lucide-react'

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

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'HR Management', href: '/hr' },
    { label: 'SPG Stores', href: '/hr/spg-stores' }
  ]

  // Calculate statistics
  const totalSPG = mockSPGData.length
  const activeSPG = mockSPGData.filter(spg => spg.status === 'active').length
  const onLeaveSPG = mockSPGData.filter(spg => spg.status === 'on-leave').length
  const totalSales = mockSPGData.reduce((sum, spg) => sum + spg.monthlySales, 0)
  const totalTargets = mockSPGData.reduce((sum, spg) => sum + spg.targetSales, 0)
  const totalCommission = mockSPGData.reduce((sum, spg) => sum + spg.commission, 0)
  const avgPerformance = mockSPGData.reduce((sum, spg) => sum + spg.performance, 0) / totalSPG
  const achievementRate = (totalSales / totalTargets) * 100

  const columns = [
    {
      accessorKey: 'spgName',
      header: 'SPG Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('spgName')}</div>
          <div className="text-sm text-gray-500">{row.original.spgId}</div>
        </div>
      )
    },
    {
      accessorKey: 'storeName',
      header: 'Store',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium text-sm">{row.getValue('storeName')}</div>
          <div className="text-xs text-gray-500 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {row.original.storeLocation}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'storeType',
      header: 'Store Type',
      cell: ({ row }: any) => {
        const type = row.getValue('storeType') as keyof typeof storeTypeColors
        return (
          <Badge className={storeTypeColors[type]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'assignment',
      header: 'Assignment',
      cell: ({ row }: any) => {
        const assignment = row.getValue('assignment') as keyof typeof assignmentColors
        return (
          <Badge className={assignmentColors[assignment]}>
            {assignment.charAt(0).toUpperCase() + assignment.slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'monthlySales',
      header: 'Monthly Sales',
      cell: ({ row }: any) => {
        const sales = row.getValue('monthlySales') as number
        const target = row.original.targetSales
        const achievement = (sales / target) * 100
        const color = achievement >= 100 ? 'text-green-600' : achievement >= 90 ? 'text-yellow-600' : 'text-red-600'
        
        return (
          <div className="text-sm">
            <div className={`font-medium ${color}`}>
              {mounted ? sales.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
            </div>
            <div className="text-xs text-gray-500">{achievement.toFixed(0)}% of target</div>
          </div>
        )
      }
    },
    {
      accessorKey: 'performance',
      header: 'Performance',
      cell: ({ row }: any) => {
        const performance = row.getValue('performance') as number
        const color = performance >= 100 ? 'text-green-600' : performance >= 90 ? 'text-yellow-600' : 'text-red-600'
        return (
          <div className={`font-bold ${color} flex items-center`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            {performance}%
          </div>
        )
      }
    },
    {
      accessorKey: 'commission',
      header: 'Commission',
      cell: ({ row }: any) => (
        <div className="text-sm font-medium">
          {mounted ? row.getValue('commission').toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status') as keyof typeof statusColors
        return (
          <Badge className={statusColors[status]}>
            {status.replace('-', ' ').charAt(0).toUpperCase() + status.replace('-', ' ').slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'contractType',
      header: 'Contract',
      cell: ({ row }: any) => {
        const contract = row.getValue('contractType') as keyof typeof contractColors
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
              <Phone className="h-3 w-3 mr-1" />
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
              <MapPin className="h-3 w-3 mr-1" />
              {spg.storeLocation} • {spg.storeType.charAt(0).toUpperCase() + spg.storeType.slice(1)}
            </div>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Working Hours:</span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1 text-gray-400" />
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
            <User className="h-4 w-4 mr-1" />
            View Profile
          </Button>
          <Button size="sm" className="flex-1">
            <Store className="h-4 w-4 mr-1" />
            Store Details
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="SPG Store Management"
          breadcrumbs={breadcrumbs}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total SPG</p>
                <p className="text-2xl font-bold text-gray-900">{totalSPG}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeSPG}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-yellow-600">{onLeaveSPG}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mounted ? (totalSales / 1000000).toFixed(0) : ''}M
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Achievement</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {mounted ? achievementRate.toFixed(1) : ''}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Award className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold text-teal-600">
                  {mounted ? avgPerformance.toFixed(1) : ''}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Commission</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mounted ? (totalCommission / 1000000).toFixed(1) : ''}M
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* View Toggle and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Store Map
            </Button>
            <Button variant="outline" size="sm">Export</Button>
            <Button size="sm">
              <User className="h-4 w-4 mr-2" />
              Add SPG
            </Button>
          </div>
        </div>

        {/* Data Display */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockSPGData.map((spg) => (
              <SPGCard key={spg.id} spg={spg} />
            ))}
          </div>
        ) : (
          <Card>
            <AdvancedDataTable
              data={mockSPGData}
              columns={columns}
              searchPlaceholder="Search SPG names, stores, or locations..."
              showFilters={true}
            />
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}