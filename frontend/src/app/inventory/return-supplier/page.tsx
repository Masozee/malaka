'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  FileText,
  Download,
  Eye,
  ArrowLeft
} from 'lucide-react'

interface ReturnSupplier {
  id: string
  returnNumber: string
  supplierName: string
  supplierCode: string
  originalPO: string
  returnDate: string
  returnReason: 'defective' | 'wrong-specification' | 'overshipped' | 'damaged' | 'expired' | 'quality-issue'
  status: 'initiated' | 'approved' | 'shipped' | 'received' | 'processed' | 'rejected'
  totalItems: number
  totalQuantity: number
  totalValue: number
  returnedBy: string
  notes?: string
  items: ReturnItem[]
  expectedRefund: number
  refundStatus: 'pending' | 'partial' | 'completed' | 'disputed'
}

interface ReturnItem {
  id: string
  itemCode: string
  itemName: string
  category: string
  quantity: number
  unitPrice: number
  totalPrice: number
  reason: string
  condition: 'new' | 'used' | 'damaged' | 'defective'
}

// Mock return supplier data
const mockReturnSuppliers: ReturnSupplier[] = [
  {
    id: '1',
    returnNumber: 'RET-SUP-2024-001',
    supplierName: 'PT Prima Leather Industries',
    supplierCode: 'SUP-001',
    originalPO: 'PO-2024-0156',
    returnDate: '2024-07-20',
    returnReason: 'defective',
    status: 'processed',
    totalItems: 3,
    totalQuantity: 50,
    totalValue: 2500000,
    returnedBy: 'QC Inspector',
    expectedRefund: 2500000,
    refundStatus: 'completed',
    items: [
      {
        id: '1',
        itemCode: 'LTH-001',
        itemName: 'Premium Leather Roll',
        category: 'Raw Materials',
        quantity: 25,
        unitPrice: 85000,
        totalPrice: 2125000,
        reason: 'Surface defects detected',
        condition: 'defective'
      },
      {
        id: '2',
        itemCode: 'LTH-002',
        itemName: 'Leather Finishing Chemical',
        category: 'Chemicals',
        quantity: 25,
        unitPrice: 15000,
        totalPrice: 375000,
        reason: 'Wrong grade specification',
        condition: 'new'
      }
    ]
  },
  {
    id: '2',
    returnNumber: 'RET-SUP-2024-002',
    supplierName: 'Shanghai Footwear Components Ltd',
    supplierCode: 'SUP-002',
    originalPO: 'PO-2024-0198',
    returnDate: '2024-07-22',
    returnReason: 'wrong-specification',
    status: 'shipped',
    totalItems: 2,
    totalQuantity: 100,
    totalValue: 1800000,
    returnedBy: 'Warehouse Manager',
    expectedRefund: 1800000,
    refundStatus: 'pending',
    notes: 'Items shipped back via express courier',
    items: [
      {
        id: '3',
        itemCode: 'SOL-003',
        itemName: 'Rubber Sole Type A',
        category: 'Components',
        quantity: 50,
        unitPrice: 25000,
        totalPrice: 1250000,
        reason: 'Wrong size specification',
        condition: 'new'
      },
      {
        id: '4',
        itemCode: 'EYE-004',
        itemName: 'Metal Eyelets',
        category: 'Hardware',
        quantity: 50,
        unitPrice: 11000,
        totalPrice: 550000,
        reason: 'Color mismatch',
        condition: 'new'
      }
    ]
  },
  {
    id: '3',
    returnNumber: 'RET-SUP-2024-003',
    supplierName: 'PT Kemasan Sepatu Jaya',
    supplierCode: 'SUP-003',
    originalPO: 'PO-2024-0203',
    returnDate: '2024-07-18',
    returnReason: 'damaged',
    status: 'approved',
    totalItems: 1,
    totalQuantity: 200,
    totalValue: 850000,
    returnedBy: 'Receiving Clerk',
    expectedRefund: 850000,
    refundStatus: 'pending',
    notes: 'Damaged during transportation, packaging insufficient',
    items: [
      {
        id: '5',
        itemCode: 'BOX-005',
        itemName: 'Shoe Boxes Premium',
        category: 'Packaging',
        quantity: 200,
        unitPrice: 4250,
        totalPrice: 850000,
        reason: 'Damaged during shipping',
        condition: 'damaged'
      }
    ]
  },
  {
    id: '4',
    returnNumber: 'RET-SUP-2024-004',
    supplierName: 'Mesin Industri Nusantara',
    supplierCode: 'SUP-004',
    originalPO: 'PO-2024-0189',
    returnDate: '2024-07-25',
    returnReason: 'quality-issue',
    status: 'initiated',
    totalItems: 2,
    totalQuantity: 15,
    totalValue: 4500000,
    returnedBy: 'Production Manager',
    expectedRefund: 4500000,
    refundStatus: 'pending',
    notes: 'Equipment not meeting performance specifications',
    items: [
      {
        id: '6',
        itemCode: 'MAC-006',
        itemName: 'Cutting Machine Blade',
        category: 'Machinery Parts',
        quantity: 10,
        unitPrice: 350000,
        totalPrice: 3500000,
        reason: 'Poor cutting precision',
        condition: 'defective'
      },
      {
        id: '7',
        itemCode: 'TOL-007',
        itemName: 'Precision Tools Set',
        category: 'Tools',
        quantity: 5,
        unitPrice: 200000,
        totalPrice: 1000000,
        reason: 'Calibration issues',
        condition: 'defective'
      }
    ]
  },
  {
    id: '5',
    returnNumber: 'RET-SUP-2024-005',
    supplierName: 'CV Bahan Kimia Industri',
    supplierCode: 'SUP-005',
    originalPO: 'PO-2024-0211',
    returnDate: '2024-07-21',
    returnReason: 'expired',
    status: 'received',
    totalItems: 3,
    totalQuantity: 80,
    totalValue: 1200000,
    returnedBy: 'Quality Control',
    expectedRefund: 1200000,
    refundStatus: 'disputed',
    notes: 'Expiry dates not clearly visible on packaging',
    items: [
      {
        id: '8',
        itemCode: 'CHM-008',
        itemName: 'Adhesive Solution A',
        category: 'Chemicals',
        quantity: 30,
        unitPrice: 25000,
        totalPrice: 750000,
        reason: 'Expired before use',
        condition: 'used'
      },
      {
        id: '9',
        itemCode: 'CHM-009',
        itemName: 'Cleaning Agent B',
        category: 'Chemicals',
        quantity: 50,
        unitPrice: 9000,
        totalPrice: 450000,
        reason: 'Short shelf life',
        condition: 'new'
      }
    ]
  },
  {
    id: '6',
    returnNumber: 'RET-SUP-2024-006',
    supplierName: 'Textile Fabric Solutions',
    supplierCode: 'SUP-006',
    originalPO: 'PO-2024-0175',
    returnDate: '2024-07-19',
    returnReason: 'overshipped',
    status: 'rejected',
    totalItems: 1,
    totalQuantity: 300,
    totalValue: 3600000,
    returnedBy: 'Inventory Manager',
    expectedRefund: 0,
    refundStatus: 'disputed',
    notes: 'Supplier disputes overshipping claim, under review',
    items: [
      {
        id: '10',
        itemCode: 'FAB-010',
        itemName: 'Canvas Fabric Roll',
        category: 'Fabrics',
        quantity: 300,
        unitPrice: 12000,
        totalPrice: 3600000,
        reason: 'Exceeded ordered quantity',
        condition: 'new'
      }
    ]
  },
  {
    id: '7',
    returnNumber: 'RET-SUP-2024-007',
    supplierName: 'Hardware Components Asia',
    supplierCode: 'SUP-007',
    originalPO: 'PO-2024-0234',
    returnDate: '2024-07-24',
    returnReason: 'defective',
    status: 'approved',
    totalItems: 4,
    totalQuantity: 500,
    totalValue: 2800000,
    returnedBy: 'QC Supervisor',
    expectedRefund: 2800000,
    refundStatus: 'pending',
    items: [
      {
        id: '11',
        itemCode: 'ZIP-011',
        itemName: 'Metal Zippers 20cm',
        category: 'Hardware',
        quantity: 200,
        unitPrice: 8000,
        totalPrice: 1600000,
        reason: 'Slider malfunction',
        condition: 'defective'
      },
      {
        id: '12',
        itemCode: 'BUT-012',
        itemName: 'Plastic Buttons Set',
        category: 'Hardware',
        quantity: 300,
        unitPrice: 4000,
        totalPrice: 1200000,
        reason: 'Color bleeding',
        condition: 'defective'
      }
    ]
  }
]

// Status color mappings
const statusColors = {
  initiated: 'bg-gray-100 text-gray-800',
  approved: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  received: 'bg-yellow-100 text-yellow-800',
  processed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

const reasonColors = {
  defective: 'bg-red-100 text-red-800',
  'wrong-specification': 'bg-orange-100 text-orange-800',
  overshipped: 'bg-purple-100 text-purple-800',
  damaged: 'bg-red-100 text-red-800',
  expired: 'bg-yellow-100 text-yellow-800',
  'quality-issue': 'bg-pink-100 text-pink-800'
}

const refundStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  partial: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  disputed: 'bg-red-100 text-red-800'
}

export default function ReturnSupplierPage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Inventory', href: '/inventory' },
    { label: 'Return Supplier', href: '/inventory/return-supplier' }
  ]

  // Calculate statistics
  const totalReturns = mockReturnSuppliers.length
  const initiatedReturns = mockReturnSuppliers.filter(ret => ret.status === 'initiated').length
  const approvedReturns = mockReturnSuppliers.filter(ret => ret.status === 'approved').length
  const processedReturns = mockReturnSuppliers.filter(ret => ret.status === 'processed').length
  const rejectedReturns = mockReturnSuppliers.filter(ret => ret.status === 'rejected').length
  const totalValue = mockReturnSuppliers.reduce((sum, ret) => sum + ret.totalValue, 0)
  const totalRefunds = mockReturnSuppliers.reduce((sum, ret) => sum + ret.expectedRefund, 0)
  const successRate = ((approvedReturns + processedReturns) / totalReturns) * 100

  const columns = [
    {
      accessorKey: 'returnNumber',
      header: 'Return Number',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('returnNumber')}</div>
          <div className="text-sm text-gray-500">{row.original.supplierName}</div>
        </div>
      )
    },
    {
      accessorKey: 'originalPO',
      header: 'Original PO',
      cell: ({ row }: any) => (
        <div className="text-sm font-medium">{row.getValue('originalPO')}</div>
      )
    },
    {
      accessorKey: 'returnReason',
      header: 'Reason',
      cell: ({ row }: any) => {
        const reason = row.getValue('returnReason') as keyof typeof reasonColors
        return (
          <Badge className={reasonColors[reason]}>
            {reason.replace('-', ' ').charAt(0).toUpperCase() + reason.replace('-', ' ').slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'totalItems',
      header: 'Items',
      cell: ({ row }: any) => (
        <div className="text-center">
          <div className="font-medium">{row.getValue('totalItems')}</div>
          <div className="text-xs text-gray-500">{row.original.totalQuantity} qty</div>
        </div>
      )
    },
    {
      accessorKey: 'totalValue',
      header: 'Value',
      cell: ({ row }: any) => (
        <div className="text-sm font-medium">
          {mounted ? row.getValue('totalValue').toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
        </div>
      )
    },
    {
      accessorKey: 'returnDate',
      header: 'Return Date',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {mounted ? new Date(row.getValue('returnDate')).toLocaleDateString('id-ID') : ''}
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
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'refundStatus',
      header: 'Refund',
      cell: ({ row }: any) => {
        const status = row.getValue('refundStatus') as keyof typeof refundStatusColors
        return (
          <Badge className={refundStatusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      }
    }
  ]

  const ReturnCard = ({ returnItem }: { returnItem: ReturnSupplier }) => (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{returnItem.returnNumber}</h3>
          <p className="text-sm text-gray-500">{returnItem.supplierName}</p>
        </div>
        <div className="text-right">
          <Badge className={statusColors[returnItem.status]}>
            {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
          </Badge>
          <div className="mt-1">
            <Badge className={refundStatusColors[returnItem.refundStatus]}>
              {returnItem.refundStatus.charAt(0).toUpperCase() + returnItem.refundStatus.slice(1)}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Original PO:</span>
          <span className="font-medium">{returnItem.originalPO}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Reason:</span>
          <Badge className={reasonColors[returnItem.returnReason]}>
            {returnItem.returnReason.replace('-', ' ').charAt(0).toUpperCase() + returnItem.returnReason.replace('-', ' ').slice(1)}
          </Badge>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Items:</span>
          <span>{returnItem.totalItems} items ({returnItem.totalQuantity} qty)</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Total Value:</span>
          <span className="font-medium">
            {mounted ? returnItem.totalValue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Expected Refund:</span>
          <span className="font-medium text-green-600">
            {mounted ? returnItem.expectedRefund.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Return Date:</span>
          <span>{mounted ? new Date(returnItem.returnDate).toLocaleDateString('id-ID') : ''}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Returned By:</span>
          <span className="flex items-center">
            <User className="h-3 w-3 mr-1 text-gray-400" />
            {returnItem.returnedBy}
          </span>
        </div>
        
        {returnItem.notes && (
          <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
            <span className="font-medium text-yellow-800">Notes: </span>
            <span className="text-yellow-700">{returnItem.notes}</span>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2 mt-4">
        <Button size="sm" variant="outline" className="flex-1">
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Button>
        <Button size="sm" className="flex-1">
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </div>
    </Card>
  )

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Return to Supplier"
          breadcrumbs={breadcrumbs}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-gray-900">{totalReturns}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Initiated</p>
                <p className="text-2xl font-bold text-gray-600">{initiatedReturns}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-blue-600">{approvedReturns}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Processed</p>
                <p className="text-2xl font-bold text-green-600">{processedReturns}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedReturns}</p>
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
                  {mounted ? (totalValue / 1000000).toFixed(0) : ''}M
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expected Refunds</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {mounted ? (totalRefunds / 1000000).toFixed(0) : ''}M
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-teal-600">
                  {mounted ? successRate.toFixed(1) : ''}%
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
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Return
            </Button>
            <Button variant="outline" size="sm">Export</Button>
            <Button size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              New Return
            </Button>
          </div>
        </div>

        {/* Data Display */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockReturnSuppliers.map((returnItem) => (
              <ReturnCard key={returnItem.id} returnItem={returnItem} />
            ))}
          </div>
        ) : (
          <Card>
            <AdvancedDataTable
              data={mockReturnSuppliers}
              columns={columns}
              searchPlaceholder="Search return numbers, suppliers, or PO numbers..."
              showFilters={true}
            />
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}