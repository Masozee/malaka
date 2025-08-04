'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Badge } from '@/components/ui/badge'
import { 
  HandHeart,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Contract {
  id: string
  contractNumber: string
  supplierName: string
  contractType: 'supply' | 'service' | 'maintenance' | 'consulting'
  startDate: string
  endDate: string
  value: number
  status: 'active' | 'expired' | 'terminated' | 'renewal-pending'
  renewalDate?: string
  terms: string
  department: string
}

const mockContractsData: Contract[] = [
  {
    id: '1',
    contractNumber: 'CON-2024-001',
    supplierName: 'PT Prima Leather Industries',
    contractType: 'supply',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    value: 2500000000,
    status: 'active',
    renewalDate: '2024-11-01',
    terms: 'Annual leather supply agreement with quality specifications',
    department: 'Production'
  },
  {
    id: '2',
    contractNumber: 'CON-2024-002',
    supplierName: 'Global Logistics Services',
    contractType: 'service',
    startDate: '2024-03-01',
    endDate: '2025-02-28',
    value: 180000000,
    status: 'active',
    terms: 'International shipping and logistics services',
    department: 'Logistics'
  },
  {
    id: '3',
    contractNumber: 'CON-2023-015',
    supplierName: 'Industrial Maintenance Co',
    contractType: 'maintenance',
    startDate: '2023-06-01',
    endDate: '2024-05-31',
    value: 120000000,
    status: 'expired',
    terms: 'Annual equipment maintenance contract',
    department: 'Maintenance'
  },
  {
    id: '4',
    contractNumber: 'CON-2024-003',
    supplierName: 'Tech Solutions Indonesia',
    contractType: 'service',
    startDate: '2024-07-01',
    endDate: '2025-06-30',
    value: 200000000,
    status: 'renewal-pending',
    renewalDate: '2024-08-15',
    terms: 'IT support and maintenance services',
    department: 'IT'
  }
]

const statusColors = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  terminated: 'bg-gray-100 text-gray-800',
  'renewal-pending': 'bg-yellow-100 text-yellow-800'
}

const typeColors = {
  supply: 'bg-blue-100 text-blue-800',
  service: 'bg-teal-100 text-teal-800',
  maintenance: 'bg-orange-100 text-orange-800',
  consulting: 'bg-purple-100 text-purple-800'
}

export default function ContractsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Contracts', href: '/procurement/contracts' }
  ]

  const totalContracts = mockContractsData.length
  const activeContracts = mockContractsData.filter(c => c.status === 'active').length
  const expiredContracts = mockContractsData.filter(c => c.status === 'expired').length
  const totalValue = mockContractsData.reduce((sum, c) => sum + c.value, 0)

  const columns = [
    {
      accessorKey: 'contractNumber',
      header: 'Contract',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('contractNumber')}</div>
          <div className="text-sm text-gray-500">{row.original.supplierName}</div>
        </div>
      )
    },
    {
      accessorKey: 'contractType',
      header: 'Type',
      cell: ({ row }: any) => {
        const type = row.getValue('contractType') as keyof typeof typeColors
        return (
          <Badge className={typeColors[type]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'value',
      header: 'Value',
      cell: ({ row }: any) => (
        <div className="text-sm font-medium">
          {mounted ? row.getValue('value').toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
        </div>
      )
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {mounted ? new Date(row.getValue('endDate')).toLocaleDateString('id-ID') : ''}
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
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Contract Management"
          breadcrumbs={breadcrumbs}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HandHeart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                <p className="text-2xl font-bold text-gray-900">{totalContracts}</p>
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
                <p className="text-2xl font-bold text-green-600">{activeContracts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{expiredContracts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mounted ? (totalValue / 1000000000).toFixed(1) : ''}B
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <div></div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Renewal Calendar
            </Button>
            <Button size="sm">
              <FileText className="h-4 w-4 mr-2" />
              New Contract
            </Button>
          </div>
        </div>

        <Card>
          <AdvancedDataTable
            data={mockContractsData}
            columns={columns}
            searchPlaceholder="Search contracts or suppliers..."
            showFilters={true}
          />
        </Card>
      </div>
    </TwoLevelLayout>
  )
}