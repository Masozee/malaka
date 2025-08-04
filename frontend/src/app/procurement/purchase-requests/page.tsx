'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  FileInput,
  User,
  Calendar,
  DollarSign,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Building2,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Settings,
  Loader2
} from 'lucide-react'

interface PurchaseRequest {
  id: string
  requestNumber: string
  requestedBy: string
  department: string
  requestDate: string
  requiredDate: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'materials' | 'equipment' | 'services' | 'supplies' | 'maintenance'
  description: string
  justification: string
  totalAmount: number
  currency: string
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'cancelled'
  approvalLevel: number // 1-3 levels
  currentApprover?: string
  items: PurchaseRequestItem[]
  notes?: string
  rejectionReason?: string
  attachments?: string[]
}

interface PurchaseRequestItem {
  id: string
  itemCode?: string
  description: string
  specification: string
  quantity: number
  unit: string
  estimatedUnitPrice: number
  estimatedTotal: number
  suggestedSupplier?: string
  urgency: 'normal' | 'urgent'
}

// Mock purchase requests data
const mockPurchaseRequestsData: PurchaseRequest[] = [
  {
    id: '1',
    requestNumber: 'PR-2024-001',
    requestedBy: 'John Doe',
    department: 'Production',
    requestDate: '2024-07-20',
    requiredDate: '2024-08-05',
    priority: 'high',
    category: 'materials',
    description: 'Leather and sole materials for August production',
    justification: 'Raw materials running low, need to maintain production schedule',
    totalAmount: 85000000,
    currency: 'IDR',
    status: 'under-review',
    approvalLevel: 2,
    currentApprover: 'Production Manager',
    items: [
      {
        id: '1',
        itemCode: 'MAT001',
        description: 'Premium Leather - Brown',
        specification: 'Top grain leather, 2mm thickness',
        quantity: 500,
        unit: 'sq ft',
        estimatedUnitPrice: 150000,
        estimatedTotal: 75000000,
        suggestedSupplier: 'PT Prima Leather Industries',
        urgency: 'urgent'
      },
      {
        id: '2',
        itemCode: 'MAT002', 
        description: 'Rubber Sole - Black',
        specification: 'Anti-slip rubber compound',
        quantity: 1000,
        unit: 'pcs',
        estimatedUnitPrice: 10000,
        estimatedTotal: 10000000,
        suggestedSupplier: 'CV Sole Master Supplier',
        urgency: 'normal'
      }
    ]
  },
  {
    id: '2',
    requestNumber: 'PR-2024-002',
    requestedBy: 'Sarah Wilson',
    department: 'IT',
    requestDate: '2024-07-22',
    requiredDate: '2024-08-10',
    priority: 'medium',
    category: 'equipment',
    description: 'New laptops for development team',
    justification: 'Current laptops are outdated and affecting productivity',
    totalAmount: 75000000,
    currency: 'IDR',
    status: 'approved',
    approvalLevel: 3,
    items: [
      {
        id: '3',
        description: 'Business Laptop',
        specification: 'Intel i7, 16GB RAM, 512GB SSD',
        quantity: 5,
        unit: 'pcs',
        estimatedUnitPrice: 15000000,
        estimatedTotal: 75000000,
        urgency: 'normal'
      }
    ]
  },
  {
    id: '3',
    requestNumber: 'PR-2024-003',
    requestedBy: 'Mike Johnson',
    department: 'Quality Control',
    requestDate: '2024-07-23',
    requiredDate: '2024-07-30',
    priority: 'urgent',
    category: 'equipment',
    description: 'Calibration service for testing equipment',
    justification: 'Annual calibration due, required for ISO compliance',
    totalAmount: 25000000,
    currency: 'IDR',
    status: 'submitted',
    approvalLevel: 1,
    currentApprover: 'QC Manager',
    items: [
      {
        id: '4',
        description: 'Equipment Calibration Service',
        specification: 'ISO 17025 certified calibration',
        quantity: 1,
        unit: 'service',
        estimatedUnitPrice: 25000000,
        estimatedTotal: 25000000,
        suggestedSupplier: 'PT Kalibrasi Presisi',
        urgency: 'urgent'
      }
    ]
  },
  {
    id: '4',
    requestNumber: 'PR-2024-004',
    requestedBy: 'Lisa Garcia',
    department: 'Accounting',
    requestDate: '2024-07-21',
    requiredDate: '2024-08-15',
    priority: 'low',
    category: 'supplies',
    description: 'Office supplies for Q3',
    justification: 'Regular quarterly office supplies replenishment',
    totalAmount: 8500000,
    currency: 'IDR',
    status: 'approved',
    approvalLevel: 1,
    items: [
      {
        id: '5',
        description: 'Stationery Package',
        specification: 'Paper, pens, folders, etc.',
        quantity: 1,
        unit: 'package',
        estimatedUnitPrice: 8500000,
        estimatedTotal: 8500000,
        urgency: 'normal'
      }
    ]
  },
  {
    id: '5',
    requestNumber: 'PR-2024-005',
    requestedBy: 'David Brown',
    department: 'Warehouse',
    requestDate: '2024-07-19',
    requiredDate: '2024-07-28',
    priority: 'high',
    category: 'maintenance',
    description: 'Forklift maintenance and spare parts',
    justification: 'Preventive maintenance to avoid breakdown',
    totalAmount: 35000000,
    currency: 'IDR',
    status: 'rejected',
    approvalLevel: 2,
    rejectionReason: 'Maintenance not due yet, reschedule for next month',
    items: [
      {
        id: '6',
        description: 'Forklift Service Package',
        specification: 'Full service including hydraulic system',
        quantity: 2,
        unit: 'units',
        estimatedUnitPrice: 17500000,
        estimatedTotal: 35000000,
        urgency: 'normal'
      }
    ]
  },
  {
    id: '6',
    requestNumber: 'PR-2024-006',
    requestedBy: 'Tom Anderson',
    department: 'Marketing',
    requestDate: '2024-07-24',
    requiredDate: '2024-08-20',
    priority: 'medium',
    category: 'services',
    description: 'Digital marketing campaign services',
    justification: 'Launch new product line promotion',
    totalAmount: 50000000,
    currency: 'IDR',
    status: 'draft',
    approvalLevel: 1,
    items: [
      {
        id: '7',
        description: 'Digital Marketing Campaign',
        specification: 'Social media, Google Ads, content creation',
        quantity: 1,
        unit: 'campaign',
        estimatedUnitPrice: 50000000,
        estimatedTotal: 50000000,
        urgency: 'normal'
      }
    ]
  },
  {
    id: '7',
    requestNumber: 'PR-2024-007',
    requestedBy: 'Rina Handayani',
    department: 'HR',
    requestDate: '2024-07-25',
    requiredDate: '2024-08-12',
    priority: 'medium',
    category: 'services',
    description: 'Employee training program',
    justification: 'Annual skill development training',
    totalAmount: 30000000,
    currency: 'IDR',
    status: 'under-review',
    approvalLevel: 2,
    currentApprover: 'HR Director',
    items: [
      {
        id: '8',
        description: 'Leadership Training Program',
        specification: '2-day workshop for 20 employees',
        quantity: 1,
        unit: 'program',
        estimatedUnitPrice: 30000000,
        estimatedTotal: 30000000,
        urgency: 'normal'
      }
    ]
  },
  {
    id: '8',
    requestNumber: 'PR-2024-008',
    requestedBy: 'Indira Putri',
    department: 'Production',
    requestDate: '2024-07-18',
    requiredDate: '2024-07-25',
    priority: 'urgent',
    category: 'maintenance',
    description: 'Emergency machine repair',
    justification: 'Production line stopped due to machine failure',
    totalAmount: 45000000,
    currency: 'IDR',
    status: 'cancelled',
    approvalLevel: 1,
    notes: 'Repaired in-house, no external service needed',
    items: [
      {
        id: '9',
        description: 'Machine Repair Service',
        specification: 'Emergency repair for cutting machine',
        quantity: 1,
        unit: 'service',
        estimatedUnitPrice: 45000000,
        estimatedTotal: 45000000,
        urgency: 'urgent'
      }
    ]
  }
]

// Status and priority color mappings
const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  'under-review': 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

const categoryColors = {
  materials: 'bg-blue-100 text-blue-800',
  equipment: 'bg-purple-100 text-purple-800',
  services: 'bg-teal-100 text-teal-800',
  supplies: 'bg-green-100 text-green-800',
  maintenance: 'bg-orange-100 text-orange-800'
}

export default function PurchaseRequestsPage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Purchase Requests', href: '/procurement/purchase-requests' }
  ]

  // Calculate statistics
  const totalRequests = mockPurchaseRequestsData.length
  const draftRequests = mockPurchaseRequestsData.filter(req => req.status === 'draft').length
  const submittedRequests = mockPurchaseRequestsData.filter(req => req.status === 'submitted').length
  const underReviewRequests = mockPurchaseRequestsData.filter(req => req.status === 'under-review').length
  const approvedRequests = mockPurchaseRequestsData.filter(req => req.status === 'approved').length
  const rejectedRequests = mockPurchaseRequestsData.filter(req => req.status === 'rejected').length
  const totalValue = mockPurchaseRequestsData
    .filter(req => ['approved', 'under-review'].includes(req.status))
    .reduce((sum, req) => sum + req.totalAmount, 0)
  const approvalRate = totalRequests > 0 ? ((approvedRequests / (totalRequests - draftRequests)) * 100) : 0

  // Action handlers
  const handleViewDetails = (request: PurchaseRequest) => {
    console.log('View details for request:', request.requestNumber)
    // TODO: Navigate to /procurement/purchase-requests/[id]
  }

  const handleEditRequest = (request: PurchaseRequest) => {
    console.log('Edit request:', request.requestNumber)
    // TODO: Navigate to /procurement/purchase-requests/[id]/edit
  }

  const handleApprove = (request: PurchaseRequest) => {
    console.log('Approve request:', request.requestNumber)
    // TODO: Implement approval logic
  }

  const columns = [
    {
      key: 'requestNumber' as keyof PurchaseRequest,
      title: 'Request Number',
      sortable: true,
      render: (value: unknown, record: PurchaseRequest) => (
        <div>
          <div className="font-medium">{record.requestNumber}</div>
          <div className="text-sm text-gray-500">{record.requestedBy} • {record.department}</div>
        </div>
      )
    },
    {
      key: 'category' as keyof PurchaseRequest,
      title: 'Category',
      sortable: true,
      render: (value: unknown, record: PurchaseRequest) => {
        const category = record.category as keyof typeof categoryColors
        return (
          <Badge className={categoryColors[category]}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Badge>
        )
      }
    },
    {
      key: 'priority' as keyof PurchaseRequest,
      title: 'Priority',
      sortable: true,
      render: (value: unknown, record: PurchaseRequest) => {
        const priority = record.priority as keyof typeof priorityColors
        return (
          <Badge className={priorityColors[priority]}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        )
      }
    },
    {
      key: 'description' as keyof PurchaseRequest,
      title: 'Description',
      render: (value: unknown, record: PurchaseRequest) => (
        <div className="text-sm max-w-60 truncate" title={record.description}>
          {record.description}
        </div>
      )
    },
    {
      key: 'totalAmount' as keyof PurchaseRequest,
      title: 'Amount',
      sortable: true,
      render: (value: unknown, record: PurchaseRequest) => (
        <div className="text-sm font-medium">
          {mounted ? record.totalAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
        </div>
      )
    },
    {
      key: 'status' as keyof PurchaseRequest,
      title: 'Status',
      sortable: true,
      render: (value: unknown, record: PurchaseRequest) => {
        const status = record.status as keyof typeof statusColors
        return (
          <Badge className={statusColors[status]}>
            {status.replace('-', ' ').charAt(0).toUpperCase() + status.replace('-', ' ').slice(1)}
          </Badge>
        )
      }
    },
    {
      key: 'id' as keyof PurchaseRequest,
      title: 'Actions',
      width: '80px',
      render: (value: unknown, record: PurchaseRequest) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(record)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {record.status === 'draft' && (
              <DropdownMenuItem onClick={() => handleEditRequest(record)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Request
              </DropdownMenuItem>
            )}
            {(['submitted', 'under-review'].includes(record.status)) && (
              <DropdownMenuItem onClick={() => handleApprove(record)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  const PurchaseRequestCard = ({ request }: { request: PurchaseRequest }) => (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{request.requestNumber}</h3>
          <p className="text-sm text-gray-500">{request.requestedBy} • {request.department}</p>
        </div>
        <div className="text-right">
          <Badge className={statusColors[request.status]}>
            {request.status.replace('-', ' ').charAt(0).toUpperCase() + request.status.replace('-', ' ').slice(1)}
          </Badge>
          <div className="mt-1">
            <Badge className={priorityColors[request.priority]}>
              {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <Badge className={categoryColors[request.category]}>
          {request.category.charAt(0).toUpperCase() + request.category.slice(1)}
        </Badge>
        
        <div className="text-sm font-medium text-gray-900">
          {request.description}
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Total Amount:</span>
          <span className="font-medium">
            {mounted ? request.totalAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Request Date:</span>
          <span>{mounted ? new Date(request.requestDate).toLocaleDateString('id-ID') : ''}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Required Date:</span>
          <span>{mounted ? new Date(request.requiredDate).toLocaleDateString('id-ID') : ''}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Items:</span>
          <span>{request.items.length} item(s)</span>
        </div>
        
        {request.currentApprover && (
          <div className="flex justify-between">
            <span className="text-gray-500">Current Approver:</span>
            <span>{request.currentApprover}</span>
          </div>
        )}
        
        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
          <span className="font-medium text-blue-800">Justification: </span>
          <span className="text-blue-700">{request.justification}</span>
        </div>
        
        {request.rejectionReason && (
          <div className="mt-2 p-2 bg-red-50 rounded text-xs">
            <span className="font-medium text-red-800">Rejection Reason: </span>
            <span className="text-red-700">{request.rejectionReason}</span>
          </div>
        )}
        
        {request.notes && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <span className="font-medium text-gray-800">Notes: </span>
            <span className="text-gray-700">{request.notes}</span>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2 mt-4">
        <Button size="sm" variant="outline" className="flex-1">
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Button>
        {request.status === 'draft' && (
          <Button size="sm" className="flex-1">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
      </div>
    </Card>
  )

  return (
    <TwoLevelLayout>
      <Header 
        title="Purchase Requests"
        description="Manage purchase requests and approval workflow"
        breadcrumbs={breadcrumbs}
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{totalRequests}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileInput className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-3xl font-bold text-yellow-600">{underReviewRequests}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{approvedRequests}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-purple-600">
                  {mounted ? (totalValue / 1000000).toFixed(0) : ''}M
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search requests..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Workflow
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            {/* View Toggle */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <Button 
                variant={viewMode === 'cards' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                Cards
              </Button>
              <Button 
                variant={viewMode === 'table' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Error Loading Requests</p>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        ) : mockPurchaseRequestsData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileInput className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No Purchase Requests Found</p>
              <p className="text-gray-500 mb-4">Get started by creating your first purchase request.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockPurchaseRequestsData.map((request) => (
              <PurchaseRequestCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <DataTable
            data={mockPurchaseRequestsData}
            columns={columns}
          />
        )}
      </div>
    </TwoLevelLayout>
  )
}