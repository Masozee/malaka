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
import { purchaseOrderService, PurchaseOrder } from '@/services/inventory'
import { 
  FileCheck,
  Building2,
  Calendar,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  FileText,
  Download,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Settings,
  Loader2
} from 'lucide-react'
import { WeatherWidget } from '@/components/ui/weather-widget'

// Extended interface for display purposes (adds computed fields to API PurchaseOrder)
interface PurchaseOrderDisplay extends PurchaseOrder {
  poNumber?: string
  supplierName?: string
  supplierCode?: string
  category?: 'materials' | 'equipment' | 'services' | 'supplies' | 'maintenance'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  itemCount?: number
  formattedAmount?: string
  formattedDate?: string
}

// Transform API purchase order to display format
const transformPurchaseOrderData = (po: PurchaseOrder): PurchaseOrderDisplay => {
  // Generate PO number from ID if not available
  const poNumber = `PO-${new Date(po.order_date).getFullYear()}-${po.id.slice(-4).toUpperCase()}`
  
  // Determine category based on supplier name (simple heuristic)
  const supplierName = po.supplier?.name || 'Unknown Supplier'
  const category = (
    supplierName.toLowerCase().includes('leather') ? 'materials' :
    supplierName.toLowerCase().includes('machine') || supplierName.toLowerCase().includes('equipment') ? 'equipment' :
    supplierName.toLowerCase().includes('service') || supplierName.toLowerCase().includes('logistic') ? 'services' :
    supplierName.toLowerCase().includes('chemical') ? 'materials' :
    'supplies'
  ) as PurchaseOrderDisplay['category']
  
  // Determine priority based on amount (simple heuristic)
  const amount = po.total_amount || 0
  const priority = (
    amount > 100000000 ? 'high' :
    amount > 50000000 ? 'medium' :
    amount < 20000000 ? 'low' :
    'medium'
  ) as PurchaseOrderDisplay['priority']
  
  return {
    ...po,
    poNumber,
    supplierName,
    supplierCode: po.supplier?.code || 'N/A',
    category,
    priority,
    itemCount: po.items?.length || 0,
    formattedAmount: po.total_amount?.toLocaleString('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }),
    formattedDate: new Date(po.order_date).toLocaleDateString('id-ID')
  }
}

// Status and priority color mappings
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  // Legacy status mappings for compatibility
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  acknowledged: 'bg-teal-100 text-teal-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'partial-delivery': 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
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
  packaging: 'bg-orange-100 text-orange-800',
  chemicals: 'bg-red-100 text-red-800',
  maintenance: 'bg-indigo-100 text-indigo-800'
}

export default function PurchaseOrdersPage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    loadPurchaseOrders()
  }, [])

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await purchaseOrderService.getAll()
      const transformedOrders = response.data.map(transformPurchaseOrderData)
      setPurchaseOrders(transformedOrders)
    } catch (err) {
      console.error('Failed to load purchase orders:', err)
      setError('Failed to load purchase orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Purchase Orders', href: '/procurement/purchase-orders' }
  ]

  // Action handlers
  const handleViewDetails = (order: PurchaseOrderDisplay) => {
    console.log('View details for order:', order.poNumber)
    // TODO: Navigate to /procurement/purchase-orders/[id]
  }

  const handleDownloadPO = (order: PurchaseOrderDisplay) => {
    console.log('Download PO:', order.poNumber)
    // TODO: Generate and download PDF
  }

  // Calculate statistics
  const totalOrders = purchaseOrders.length
  const pendingOrders = purchaseOrders.filter(po => po.status === 'pending').length
  const approvedOrders = purchaseOrders.filter(po => po.status === 'approved').length
  const completedOrders = purchaseOrders.filter(po => po.status === 'completed').length
  const totalValue = purchaseOrders
    .filter(po => po.status !== 'cancelled')
    .reduce((sum, po) => sum + (po.total_amount || 0), 0)
  const avgOrderValue = totalValue / Math.max(totalOrders, 1)

  const columns = [
    {
      key: 'poNumber' as keyof PurchaseOrderDisplay,
      title: 'PO Number',
      sortable: true,
      render: (value: unknown, record: PurchaseOrderDisplay) => (
        <div>
          <div className="font-medium">{record.poNumber}</div>
          <div className="text-sm text-gray-500">{record.supplier?.name || 'Unknown'}</div>
        </div>
      )
    },
    {
      key: 'supplierName' as keyof PurchaseOrderDisplay,
      title: 'Supplier',
      sortable: true,
      render: (value: unknown, record: PurchaseOrderDisplay) => (
        <div>
          <div className="font-medium">{record.supplierName}</div>
          <div className="text-sm text-gray-500">{record.supplierCode}</div>
        </div>
      )
    },
    {
      key: 'category' as keyof PurchaseOrderDisplay,
      title: 'Category',
      sortable: true,
      render: (value: unknown, record: PurchaseOrderDisplay) => {
        const category = record.category as keyof typeof categoryColors
        if (!category) return <span className="text-gray-400">-</span>
        return (
          <Badge className={categoryColors[category]}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Badge>
        )
      }
    },
    {
      key: 'priority' as keyof PurchaseOrderDisplay,
      title: 'Priority',
      sortable: true,
      render: (value: unknown, record: PurchaseOrderDisplay) => {
        const priority = record.priority as keyof typeof priorityColors
        if (!priority) return <span className="text-gray-400">-</span>
        return (
          <Badge className={priorityColors[priority]}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        )
      }
    },
    {
      key: 'total_amount' as keyof PurchaseOrderDisplay,
      title: 'Amount',
      sortable: true,
      render: (value: unknown, record: PurchaseOrderDisplay) => (
        <div className="text-sm font-medium">
          {mounted && record.total_amount ? record.total_amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
        </div>
      )
    },
    {
      key: 'order_date' as keyof PurchaseOrderDisplay,
      title: 'Order Date',
      sortable: true,
      render: (value: unknown, record: PurchaseOrderDisplay) => (
        <div className="text-sm">
          {mounted ? new Date(record.order_date).toLocaleDateString('id-ID') : ''}
        </div>
      )
    },
    {
      key: 'status' as keyof PurchaseOrderDisplay,
      title: 'Status',
      sortable: true,
      render: (value: unknown, record: PurchaseOrderDisplay) => {
        const status = record.status as keyof typeof statusColors
        const displayStatus = status || 'pending'
        return (
          <Badge className={statusColors[displayStatus] || statusColors.pending}>
            {displayStatus.replace('-', ' ').charAt(0).toUpperCase() + displayStatus.replace('-', ' ').slice(1)}
          </Badge>
        )
      }
    },
    {
      key: 'itemCount' as keyof PurchaseOrderDisplay,
      title: 'Items',
      render: (value: unknown, record: PurchaseOrderDisplay) => (
        <div className="text-sm">{record.itemCount || 0} item(s)</div>
      )
    },
    {
      key: 'id' as keyof PurchaseOrderDisplay,
      title: 'Actions',
      width: '80px',
      render: (value: unknown, record: PurchaseOrderDisplay) => (
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
            <DropdownMenuItem onClick={() => handleDownloadPO(record)}>
              <Download className="mr-2 h-4 w-4" />
              Download PO
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  const PurchaseOrderCard = ({ order }: { order: PurchaseOrderDisplay }) => (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{order.poNumber}</h3>
          <p className="text-sm text-gray-500">{order.supplierName}</p>
          <p className="text-xs text-gray-400">{order.supplier?.code || 'N/A'}</p>
        </div>
        <div className="text-right">
          <Badge className={statusColors[order.status as keyof typeof statusColors] || statusColors.pending}>
            {(order.status || 'pending').replace('-', ' ').charAt(0).toUpperCase() + (order.status || 'pending').replace('-', ' ').slice(1)}
          </Badge>
          {order.priority && (
            <div className="mt-1">
              <Badge className={priorityColors[order.priority]}>
                {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        {order.category && (
          <Badge className={categoryColors[order.category]}>
            {order.category.charAt(0).toUpperCase() + order.category.slice(1)}
          </Badge>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-500">Total Amount:</span>
          <span className="font-medium">
            {mounted && order.total_amount ? order.total_amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Order Date:</span>
          <span>{mounted ? new Date(order.order_date).toLocaleDateString('id-ID') : ''}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Items:</span>
          <span>{order.itemCount || 0} item(s)</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Supplier:</span>
          <span>{order.supplier?.contact_person || 'N/A'}</span>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-4">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleViewDetails(order)}>
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Button>
        <Button size="sm" className="flex-1" onClick={() => handleDownloadPO(order)}>
          <Download className="h-4 w-4 mr-1" />
          Download PO
        </Button>
      </div>
    </Card>
  )

  return (
    <TwoLevelLayout>
      <Header 
        title="Purchase Orders"
        description="Manage purchase orders and supplier transactions"
        breadcrumbs={breadcrumbs}
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create PO
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Weather and Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
          {/* Weather Widget */}
          <div className="lg:col-span-1">
            <WeatherWidget compact={true} />
          </div>
          
          {/* Summary Cards */}
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
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
                <p className="text-3xl font-bold text-green-600">{approvedOrders}</p>
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
                  {mounted ? (totalValue / 1000000000).toFixed(1) : ''}B
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search purchase orders..." 
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
              Delivery Tracking
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
              <p className="text-lg font-medium text-gray-900 mb-2">Error Loading Purchase Orders</p>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={loadPurchaseOrders}>Try Again</Button>
            </div>
          </div>
        ) : purchaseOrders.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No Purchase Orders Found</p>
              <p className="text-gray-500 mb-4">Get started by creating your first purchase order.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create PO
              </Button>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchaseOrders.map((order) => (
              <PurchaseOrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <DataTable data={purchaseOrders} columns={columns} />
        )}
      </div>
    </TwoLevelLayout>
  )
}