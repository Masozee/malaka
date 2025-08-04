'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Badge } from '@/components/ui/badge'
import { 
  Star,
  Building2,
  TrendingUp,
  Award,
  BarChart3,
  FileText,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface VendorEvaluation {
  id: string
  vendorName: string
  vendorCode: string
  evaluationPeriod: string
  overallScore: number
  qualityScore: number
  deliveryScore: number
  priceScore: number
  serviceScore: number
  status: 'excellent' | 'good' | 'satisfactory' | 'needs-improvement' | 'poor'
  totalOrders: number
  onTimeDelivery: number
  defectRate: number
  lastEvaluated: string
}

const mockEvaluationData: VendorEvaluation[] = [
  {
    id: '1',
    vendorName: 'PT Prima Leather Industries',
    vendorCode: 'SUP001',
    evaluationPeriod: 'Q2 2024',
    overallScore: 4.5,
    qualityScore: 4.7,
    deliveryScore: 4.2,
    priceScore: 4.3,
    serviceScore: 4.8,
    status: 'excellent',
    totalOrders: 45,
    onTimeDelivery: 96,
    defectRate: 1.2,
    lastEvaluated: '2024-07-15'
  },
  {
    id: '2',
    vendorName: 'Shanghai Footwear Components Ltd',
    vendorCode: 'SUP003',
    evaluationPeriod: 'Q2 2024',
    overallScore: 3.8,
    qualityScore: 4.0,
    deliveryScore: 3.5,
    priceScore: 4.2,
    serviceScore: 3.6,
    status: 'good',
    totalOrders: 28,
    onTimeDelivery: 85,
    defectRate: 2.8,
    lastEvaluated: '2024-07-18'
  },
  {
    id: '3',
    vendorName: 'PT Kemasan Sepatu Jaya',
    vendorCode: 'SUP004',
    evaluationPeriod: 'Q2 2024',
    overallScore: 4.2,
    qualityScore: 4.1,
    deliveryScore: 4.5,
    priceScore: 3.9,
    serviceScore: 4.3,
    status: 'good',
    totalOrders: 67,
    onTimeDelivery: 92,
    defectRate: 1.8,
    lastEvaluated: '2024-07-20'
  },
  {
    id: '4',
    vendorName: 'Chemical Solutions Indonesia',
    vendorCode: 'SUP006',
    evaluationPeriod: 'Q2 2024',
    overallScore: 2.8,
    qualityScore: 2.5,
    deliveryScore: 3.2,
    priceScore: 3.1,
    serviceScore: 2.4,
    status: 'needs-improvement',
    totalOrders: 15,
    onTimeDelivery: 73,
    defectRate: 4.5,
    lastEvaluated: '2024-07-22'
  }
]

const statusColors = {
  excellent: 'bg-green-100 text-green-800',
  good: 'bg-blue-100 text-blue-800',
  satisfactory: 'bg-yellow-100 text-yellow-800',
  'needs-improvement': 'bg-orange-100 text-orange-800',
  poor: 'bg-red-100 text-red-800'
}

export default function VendorEvaluationPage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Vendor Evaluation', href: '/procurement/vendor-evaluation' }
  ]

  const totalVendors = mockEvaluationData.length
  const excellentVendors = mockEvaluationData.filter(v => v.status === 'excellent').length
  const avgOverallScore = mockEvaluationData.reduce((sum, v) => sum + v.overallScore, 0) / totalVendors

  const columns = [
    {
      accessorKey: 'vendorName',
      header: 'Vendor',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('vendorName')}</div>
          <div className="text-sm text-gray-500">{row.original.vendorCode}</div>
        </div>
      )
    },
    {
      accessorKey: 'overallScore',
      header: 'Overall Score',
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-500 mr-1" />
          <span className="font-bold">{row.getValue('overallScore').toFixed(1)}</span>
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
      accessorKey: 'onTimeDelivery',
      header: 'On-Time Delivery',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.getValue('onTimeDelivery')}%</div>
      )
    },
    {
      accessorKey: 'defectRate',
      header: 'Defect Rate',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.getValue('defectRate')}%</div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Vendor Evaluation"
          breadcrumbs={breadcrumbs}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{totalVendors}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Excellent</p>
                <p className="text-2xl font-bold text-green-600">{excellentVendors}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {mounted ? avgOverallScore.toFixed(1) : ''}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Improvement</p>
                <p className="text-2xl font-bold text-purple-600">1</p>
              </div>
            </div>
          </Card>
        </div>

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
              <BarChart3 className="h-4 w-4 mr-2" />
              Evaluation Report
            </Button>
            <Button size="sm">
              <FileText className="h-4 w-4 mr-2" />
              New Evaluation
            </Button>
          </div>
        </div>

        <Card>
          <AdvancedDataTable
            data={mockEvaluationData}
            columns={columns}
            searchPlaceholder="Search vendors or evaluation status..."
            showFilters={true}
          />
        </Card>
      </div>
    </TwoLevelLayout>
  )
}