'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable, type AdvancedColumn } from '@/components/ui/advanced-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

import Link from 'next/link'
import { mockPurchaseOrders, mockWarehouses, mockSuppliers } from '@/services/production'
import type { PurchaseOrder, PurchaseOrderFilters } from '@/types/production'

export default function PurchaseOrdersPage() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [supplierFilter, setSupplierFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Production', href: '/production' },
    { label: 'Purchase Orders', href: '/production/purchase-orders' }
  ]

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  // Filter purchase orders
  const filteredPurchaseOrders = mockPurchaseOrders.filter(po => {
    if (searchTerm && !po?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !po?.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (statusFilter !== 'all' && po?.status !== statusFilter) return false
    if (supplierFilter !== 'all' && po?.supplierId !== supplierFilter) return false
    if (priorityFilter !== 'all' && po?.priority !== priorityFilter) return false
    if (warehouseFilter !== 'all' && po?.warehouseId !== warehouseFilter) return false
    return true
  })

  // Get unique values for filters
  const statuses = Array.from(new Set(mockPurchaseOrders.map(po => po?.status).filter(Boolean)))
  const priorities = Array.from(new Set(mockPurchaseOrders.map(po => po?.priority).filter(Boolean)))

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: PencilSimple },
      sent: { variant: 'outline' as const, label: 'Sent', icon: Clock },
      confirmed: { variant: 'default' as const, label: 'Confirmed', icon: CheckCircle },
      partial: { variant: 'default' as const, label: 'Partial', icon: Package },
      delivered: { variant: 'default' as const, label: 'Delivered', icon: Truck },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled', icon: Warning }
    }
    return statusConfig[status] || { variant: 'secondary' as const, label: status, icon: Clock }
  }

  const getPriorityBadge = (priority: PurchaseOrder['priority']) => {
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
    total: filteredPurchaseOrders.length,
    confirmed: filteredPurchaseOrders.filter(po => po?.status === 'confirmed').length,
    delivered: filteredPurchaseOrders.filter(po => po?.status === 'delivered').length,
    pending: filteredPurchaseOrders.filter(po => ['draft', 'sent'].includes(po?.status || '')).length,
    totalValue: filteredPurchaseOrders.reduce((sum, po) => sum + (po?.totalAmount || 0), 0),
    urgent: filteredPurchaseOrders.filter(po => po?.priority === 'urgent').length
  }

  const columns: AdvancedColumn<PurchaseOrder>[] = [
    {
      key: 'orderNumber',
      title: 'Order Number',
      sortable: true,
      width: '140px',
      render: (value: unknown, po: PurchaseOrder) => (
        <Link 
          href={`/production/purchase-orders/${po?.id || ''}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          <div>{(value as string) || po?.orderNumber || ''}</div>
          <div className="text-sm text-muted-foreground">{formatDate(po?.orderDate)}</div>
        </Link>
      )
    },
    {
      key: 'supplier',
      title: 'Supplier',
      sortable: true,
      render: (value: unknown, po: PurchaseOrder) => (
        <div>
          <div className="font-medium">{po?.supplier?.name || ''}</div>
          <div className="text-sm text-muted-foreground">{po?.supplier?.code || ''}</div>
        </div>
      )
    },
    {
      key: 'warehouse',
      title: 'Warehouse',
      width: '140px',
      render: (value: unknown, po: PurchaseOrder) => (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{po?.warehouse?.name || ''}</div>
            <div className="text-sm text-muted-foreground">{po?.warehouse?.code || ''}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      width: '120px',
      render: (value: unknown, po: PurchaseOrder) => {
        if (!po?.status) return ''
        const { variant, label, icon: Icon } = getStatusBadge(po.status)
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'priority',
      title: 'Priority',
      sortable: true,
      width: '100px',
      render: (value: unknown, po: PurchaseOrder) => {
        if (!po?.priority) return ''
        const { variant, label } = getPriorityBadge(po.priority)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'items',
      title: 'Items',
      sortable: true,
      width: '80px',
      render: (value: unknown, po: PurchaseOrder) => (
        <div className="text-center">
          <div className="font-medium">{po?.items?.length || 0}</div>
          <div className="text-sm text-muted-foreground">items</div>
        </div>
      )
    },
    {
      key: 'totalAmount',
      title: 'Total Amount',
      sortable: true,
      width: '120px',
      render: (value: unknown, po: PurchaseOrder) => (
        <div className="font-medium text-right">{formatCurrency(po?.totalAmount)}</div>
      )
    },
    {
      key: 'expectedDate',
      title: 'Expected Date',
      sortable: true,
      width: '120px',
      render: (value: unknown, po: PurchaseOrder) => {
        const isOverdue = po?.expectedDate && new Date(po.expectedDate) < new Date() && po.status !== 'delivered'
        return (
          <div className={isOverdue ? 'text-red-600' : ''}>
            <div className="text-sm">{formatDate(po?.expectedDate)}</div>
            {isOverdue && (
              <div className="text-xs text-red-600">Overdue</div>
            )}
          </div>
        )
      }
    },
    {
      key: 'progress',
      title: 'Progress',
      width: '120px',
      render: (value: unknown, po: PurchaseOrder) => {
        const totalQuantity = po?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
        const receivedQuantity = po?.items?.reduce((sum, item) => sum + item.receivedQuantity, 0) || 0
        const progress = totalQuantity > 0 ? (receivedQuantity / totalQuantity) * 100 : 0
        
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{receivedQuantity}</span>
              <span className="text-muted-foreground">/ {totalQuantity}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {progress.toFixed(0)}% received
            </div>
          </div>
        )
      }
    },
    {
      key: 'id',
      title: 'Actions',
      width: '100px',
      render: (_, po: PurchaseOrder) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/production/purchase-orders/${po?.id || ''}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/production/purchase-orders/${po?.id || ''}/edit`}>
              <PencilSimple className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Purchase Orders"
        description="Manage procurement and purchase orders from suppliers"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" size="sm">
              <DownloadSimple className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" asChild>
              <Link href="/production/purchase-orders/new">
                <Plus className="h-4 w-4 mr-2" />
                New Purchase Order
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
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.confirmed}</p>
                <p className="text-sm text-green-600 mt-1">Ready to ship</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.delivered}</p>
                <p className="text-sm text-blue-600 mt-1">Completed</p>
              </div>
              <Truck className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `Rp ${(summaryStats.totalValue / 1000000).toFixed(1)}M` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">This period</p>
              </div>
              <CurrencyDollar className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search orders..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <CheckCircle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-36">
                <Warning className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-44">
                <BuildingOffice className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {mockSuppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AdvancedDataTable
          data={filteredPurchaseOrders}
          columns={columns}
          searchable={false}
          filterable={false}
          pagination={{
            pageSize: 10,
            currentPage: 1,
            totalPages: Math.ceil(filteredPurchaseOrders.length / 10),
            totalItems: filteredPurchaseOrders.length,
            onChange: () => {}
          }}
        />

        {/* Urgent Orders Alert */}
        {summaryStats.urgent > 0 && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <Warning className="h-6 w-6 text-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">Urgent Orders Alert</h3>
                <p className="text-red-700 mt-1">
                  {summaryStats.urgent} purchase orders are marked as urgent and require immediate attention.
                </p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                <Warning className="h-4 w-4 mr-2" />
                Review Urgent Orders
              </Button>
            </div>
          </Card>
        )}

        {/* Quick Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
            <div className="space-y-3">
              {statuses.map((status) => {
                const count = filteredPurchaseOrders.filter(po => po.status === status).length
                const percentage = filteredPurchaseOrders.length > 0 ? (count / filteredPurchaseOrders.length) * 100 : 0
                const { variant, label } = getStatusBadge(status as PurchaseOrder['status'])
                
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge variant={variant}>{label}</Badge>
                        <span className="text-sm text-muted-foreground">({count})</span>
                      </div>
                      <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Suppliers</h3>
            <div className="space-y-3">
              {mockPurchaseOrders
                .reduce((acc, po) => {
                  const existing = acc.find(item => item.supplierId === po.supplierId)
                  if (existing) {
                    existing.count += 1
                    existing.totalValue += po.totalAmount
                  } else {
                    acc.push({
                      supplierId: po.supplierId,
                      name: po.supplier.name,
                      count: 1,
                      totalValue: po.totalAmount
                    })
                  }
                  return acc
                }, [] as Array<{supplierId: string, name: string, count: number, totalValue: number}>)
                .sort((a, b) => b.totalValue - a.totalValue)
                .slice(0, 5)
                .map((supplier, index) => (
                  <div key={supplier.supplierId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-muted-foreground">{supplier.count} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(supplier.totalValue)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </TwoLevelLayout>
  )
}