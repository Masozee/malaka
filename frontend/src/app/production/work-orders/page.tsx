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
import { Progress } from '@/components/ui/progress'
import { 
  Factory, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Filter, 
  Download, 
  Calendar,
  Users,
  Clock,
  Package,
  CheckCircle,
  Search,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { ProductionService } from '@/services/production'
import type { WorkOrder, WorkOrderFilters } from '@/types/production'

export default function WorkOrdersPage() {
  const [mounted, setMounted] = useState(false)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all')
  const [activeView, setActiveView] = useState<'cards' | 'table'>('table')
  const [sortBy, setSortBy] = useState<string>('workOrderNumber')

  useEffect(() => {
    setMounted(true)
    fetchWorkOrders()
    fetchWarehouses()
  }, [])

  const fetchWorkOrders = async () => {
    try {
      setLoading(true)
      const response = await ProductionService.getWorkOrders()
      console.log('API Response:', response) // Debug log
      // Handle nested data structure: response.data.data
      setWorkOrders(response.data?.data || response.data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching work orders:', err)
      setError('Failed to load work orders')
      // Fallback to mock data for development
      const { mockWorkOrders } = await import('@/services/production')
      setWorkOrders(mockWorkOrders)
    } finally {
      setLoading(false)
    }
  }

  const fetchWarehouses = async () => {
    try {
      const response = await ProductionService.getWarehouses()
      setWarehouses(response.data || [])
    } catch (err) {
      console.error('Error fetching warehouses:', err)
      // Fallback to mock data for development
      const { mockWarehouses } = await import('@/services/production')
      setWarehouses(mockWarehouses)
    }
  }

  const breadcrumbs = [
    { label: 'Production', href: '/production' },
    { label: 'Work Orders', href: '/production/work-orders' }
  ]

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  // Filter work orders
  const filteredWorkOrders = workOrders.filter(order => {
    if (searchTerm && !order?.work_order_number?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !order?.product_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (statusFilter !== 'all' && order?.status !== statusFilter) return false
    if (typeFilter !== 'all' && order?.type !== typeFilter) return false
    if (priorityFilter !== 'all' && order?.priority !== priorityFilter) return false
    if (warehouseFilter !== 'all' && order?.warehouse_id !== warehouseFilter) return false
    return true
  })

  // Convert work orders for table display (string IDs required by AdvancedDataTable)
  const tableData = filteredWorkOrders.map(order => ({
    ...order,
    id: String(order.id)
  }))

  // Get unique values for filters
  const statuses = Array.from(new Set(workOrders.map(order => order?.status).filter(Boolean)))
  const types = Array.from(new Set(workOrders.map(order => order?.type).filter(Boolean)))
  const priorities = Array.from(new Set(workOrders.map(order => order?.priority).filter(Boolean)))

  const getStatusBadge = (status: WorkOrder['status']) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      scheduled: { variant: 'default' as const, label: 'Scheduled' },
      in_progress: { variant: 'default' as const, label: 'In Progress' },
      paused: { variant: 'outline' as const, label: 'Paused' },
      completed: { variant: 'default' as const, label: 'Completed' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' }
    }
    return statusConfig[status] || { variant: 'secondary' as const, label: status }
  }

  const getPriorityBadge = (priority: WorkOrder['priority']) => {
    const priorityConfig = {
      low: { variant: 'secondary' as const, label: 'Low' },
      normal: { variant: 'outline' as const, label: 'Normal' },
      high: { variant: 'default' as const, label: 'High' },
      urgent: { variant: 'destructive' as const, label: 'Urgent' }
    }
    return priorityConfig[priority] || { variant: 'secondary' as const, label: priority }
  }

  // Summary statistics
  const summaryStats = {
    total: filteredWorkOrders.length,
    inProgress: filteredWorkOrders.filter(wo => wo?.status === 'in_progress').length,
    completed: filteredWorkOrders.filter(wo => wo?.status === 'completed').length,
    delayed: filteredWorkOrders.filter(wo => {
      if (!wo?.planned_end_date) return false
      return new Date(wo.planned_end_date) < new Date() && wo.status !== 'completed'
    }).length
  }

  const columns = [
    {
      key: 'work_order_number' as keyof WorkOrder,
      title: 'Work Order',
      render: (value: unknown, record: WorkOrder) => (
        <div>
          <div className="font-medium">{record?.work_order_number || ''}</div>
          <div className="text-sm text-muted-foreground">{record?.type || ''}</div>
        </div>
      )
    },
    {
      key: 'product_name' as keyof WorkOrder,
      title: 'Product',
      render: (value: unknown, record: WorkOrder) => (
        <div>
          <div className="font-medium">{record?.product_name || ''}</div>
          <div className="text-sm text-muted-foreground">{record?.product_code || ''}</div>
        </div>
      )
    },
    {
      key: 'quantity' as keyof WorkOrder,
      title: 'Quantity',
      render: (value: unknown, record: WorkOrder) => (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{record?.quantity || 0} units</span>
        </div>
      )
    },
    {
      key: 'status' as keyof WorkOrder,
      title: 'Status',
      render: (value: unknown, record: WorkOrder) => {
        if (!record?.status) return ''
        const { variant, label } = getStatusBadge(record.status)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'priority' as keyof WorkOrder,
      title: 'Priority',
      render: (value: unknown, record: WorkOrder) => {
        if (!record?.priority) return ''
        const { variant, label } = getPriorityBadge(record.priority)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'planned_start_date' as keyof WorkOrder,
      title: 'Planned Dates',
      render: (value: unknown, record: WorkOrder) => (
        <div>
          <div className="text-sm">{formatDate(record?.planned_start_date)} -</div>
          <div className="text-sm">{formatDate(record?.planned_end_date)}</div>
        </div>
      )
    },
    {
      key: 'efficiency' as keyof WorkOrder,
      title: 'Efficiency',
      render: (value: unknown, record: WorkOrder) => (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{record?.efficiency || 0}%</span>
          </div>
          <Progress value={record?.efficiency || 0} className="h-2" />
        </div>
      )
    },
    {
      key: 'actual_cost' as keyof WorkOrder,
      title: 'Cost',
      render: (value: unknown, record: WorkOrder) => (
        <div>
          <div className="font-medium">{formatCurrency(record?.actual_cost)}</div>
          <div className="text-sm text-muted-foreground">of {formatCurrency(record?.total_cost)}</div>
        </div>
      )
    },
    {
      key: 'id' as keyof WorkOrder,
      title: 'Actions',
      render: (value: unknown, record: WorkOrder) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/production/work-orders/${record?.id || ''}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/production/work-orders/${record?.id || ''}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Work Orders"
        description="Manage production work orders and track progress"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" asChild>
              <Link href="/production/work-orders/new">
                <Plus className="h-4 w-4 mr-2" />
                New Work Order
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.total}</p>
              </div>
              <Factory className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.inProgress}</p>
                <p className="text-sm text-blue-600 mt-1">Active production</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.completed}</p>
                <p className="text-sm text-green-600 mt-1">This period</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delayed</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{summaryStats.delayed}</p>
                <p className="text-sm text-red-600 mt-1">Need attention</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <CheckCircle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <Factory className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <Clock className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger className="w-44">
                <Package className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Toggle & Sort */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44">
                <BarChart3 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workOrderNumber">Work Order</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="plannedStartDate">Start Date</SelectItem>
                <SelectItem value="plannedEndDate">End Date</SelectItem>
                <SelectItem value="efficiency">Efficiency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredWorkOrders.length} of {workOrders.length} items
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading work orders...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <button 
                onClick={fetchWorkOrders}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkOrders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{order.work_order_number}</div>
                      <div className="text-sm text-muted-foreground">{order.product_name}</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const { variant, label } = getStatusBadge(order.status)
                        return <Badge variant={variant}>{label}</Badge>
                      })()}
                      {(() => {
                        const { variant, label } = getPriorityBadge(order.priority)
                        return <Badge variant={variant} className="ml-1">{label}</Badge>
                      })()}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quantity:</span>
                      <span>{order.quantity} units</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Progress:</span>
                      <span>{order.efficiency}%</span>
                    </div>
                    <Progress value={order.efficiency} className="h-2" />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Planned Dates</div>
                    <div className="text-sm">
                      {formatDate(order.planned_start_date)} - {formatDate(order.planned_end_date)}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Cost:</span>
                    <div className="text-right">
                      <div>{formatCurrency(order.actual_cost)}</div>
                      <div className="text-xs text-muted-foreground">of {formatCurrency(order.total_cost)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/production/work-orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/production/work-orders/${order.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <AdvancedDataTable
            data={tableData}
            columns={columns}
            searchable={false}
            filterable={false}
            pagination={{
              current: 1,
              pageSize: 10,
              total: filteredWorkOrders.length,
              onChange: () => {}
            }}
          />
        ))}
      </div>
    </TwoLevelLayout>
  )
}