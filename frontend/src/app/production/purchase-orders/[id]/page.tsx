'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'

import Link from 'next/link'
import { mockPurchaseOrders } from '@/services/production'
import type { PurchaseOrder, PurchaseOrderItem } from '@/types/production'
import { useParams } from 'next/navigation'

export default function PurchaseOrderDetailsPage() {
  const [mounted, setMounted] = useState(false)
  const params = useParams()
  const purchaseOrderId = params.id as string

  useEffect(() => {
    setMounted(true)
  }, [])

  // Find the purchase order (in real app, this would be an API call)
  const purchaseOrder = mockPurchaseOrders.find(po => po.id === purchaseOrderId)

  if (!purchaseOrder) {
    return (
      <TwoLevelLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Purchase Order Not Found</h2>
            <p className="text-muted-foreground mt-2">The requested purchase order could not be found.</p>
            <Button asChild className="mt-4">
              <Link href="/production/purchase-orders">Back to Purchase Orders</Link>
            </Button>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Production', href: '/production' },
    { label: 'Purchase Orders', href: '/production/purchase-orders' },
    { label: purchaseOrder.orderNumber, href: `/production/purchase-orders/${purchaseOrder.id}` }
  ]

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const formatDateTime = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleString('id-ID')
  }

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

  // Calculate order metrics
  const orderMetrics = {
    totalItems: purchaseOrder.items.length,
    totalQuantity: purchaseOrder.items.reduce((sum, item) => sum + item.quantity, 0),
    receivedQuantity: purchaseOrder.items.reduce((sum, item) => sum + item.receivedQuantity, 0),
    pendingQuantity: purchaseOrder.items.reduce((sum, item) => sum + item.pendingQuantity, 0),
    progress: purchaseOrder.items.reduce((sum, item) => sum + item.quantity, 0) > 0 
      ? (purchaseOrder.items.reduce((sum, item) => sum + item.receivedQuantity, 0) / 
         purchaseOrder.items.reduce((sum, item) => sum + item.quantity, 0)) * 100 
      : 0
  }

  // Items columns for data table
  const itemColumns: AdvancedColumn<PurchaseOrderItem>[] = [
    {
      key: 'articleName',
      title: 'Article',
      sortable: true,
      width: '200px',
      render: (value: unknown, item: PurchaseOrderItem) => (
        <div>
          <div className="font-medium">{item?.articleName || ''}</div>
          <div className="text-sm text-muted-foreground">{item?.articleCode || ''}</div>
        </div>
      )
    },
    {
      key: 'specifications',
      title: 'Specifications',
      width: '180px',
      render: (value: unknown, item: PurchaseOrderItem) => (
        <div className="text-sm max-w-[200px]">
          {item?.specifications || 'No specifications'}
        </div>
      )
    },
    {
      key: 'quantity',
      title: 'Quantity',
      sortable: true,
      width: '100px',
      render: (value: unknown, item: PurchaseOrderItem) => (
        <div className="text-center">
          <div className="font-medium">{item?.quantity || 0}</div>
          <div className="text-sm text-muted-foreground">ordered</div>
        </div>
      )
    },
    {
      key: 'receivedQuantity',
      title: 'Received',
      sortable: true,
      width: '100px',
      render: (value: unknown, item: PurchaseOrderItem) => (
        <div className="text-center">
          <div className="font-medium text-green-600">{item?.receivedQuantity || 0}</div>
          <div className="text-sm text-muted-foreground">received</div>
        </div>
      )
    },
    {
      key: 'pendingQuantity',
      title: 'Pending',
      sortable: true,
      width: '100px',
      render: (value: unknown, item: PurchaseOrderItem) => (
        <div className="text-center">
          <div className="font-medium text-orange-600">{item?.pendingQuantity || 0}</div>
          <div className="text-sm text-muted-foreground">pending</div>
        </div>
      )
    },
    {
      key: 'unitPrice',
      title: 'Unit Price',
      sortable: true,
      width: '120px',
      render: (value: unknown, item: PurchaseOrderItem) => (
        <div className="text-right font-medium">{formatCurrency(item?.unitPrice)}</div>
      )
    },
    {
      key: 'totalPrice',
      title: 'Total Price',
      sortable: true,
      width: '120px',
      render: (value: unknown, item: PurchaseOrderItem) => (
        <div className="text-right font-medium">{formatCurrency(item?.totalPrice)}</div>
      )
    },
    {
      key: 'id',
      title: 'Progress',
      width: '120px',
      render: (value: unknown, item: PurchaseOrderItem) => {
        const quantity = item?.quantity || 0
        const receivedQuantity = item?.receivedQuantity || 0
        const progress = quantity > 0 ? (receivedQuantity / quantity) * 100 : 0
        return (
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-center text-muted-foreground">
              {progress.toFixed(0)}%
            </div>
          </div>
        )
      }
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title={purchaseOrder.orderNumber}
          description={`Purchase order from ${purchaseOrder.supplier.name}`}
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Print PO
              </Button>
              {purchaseOrder.status === 'draft' && (
                <Button variant="outline" size="sm">
                  <Envelope className="h-4 w-4 mr-2" />
                  Send to Supplier
                </Button>
              )}
              {purchaseOrder.status === 'confirmed' && (
                <Button variant="outline" size="sm">
                  <Package className="h-4 w-4 mr-2" />
                  Receive Goods
                </Button>
              )}
              <Button size="sm" asChild>
                <Link href={`/production/purchase-orders/${purchaseOrder.id}/edit`}>
                  <PencilSimple className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Purchase Order Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Number</label>
                    <p className="font-medium">{purchaseOrder.orderNumber}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                    <p className="font-medium">{purchaseOrder.supplier.name}</p>
                    <p className="text-sm text-muted-foreground">{purchaseOrder.supplier.code}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Warehouse</label>
                    <p className="font-medium">{purchaseOrder.warehouse.name}</p>
                    <p className="text-sm text-muted-foreground">{purchaseOrder.warehouse.code}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                    <p className="font-medium">{formatDate(purchaseOrder.orderDate)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const { variant, label, icon: Icon } = getStatusBadge(purchaseOrder.status)
                          return (
                            <>
                              <Icon className="h-4 w-4" />
                              <Badge variant={variant}>{label}</Badge>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <div className="mt-1">
                      <Badge variant={getPriorityBadge(purchaseOrder.priority).variant}>
                        {getPriorityBadge(purchaseOrder.priority).label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Expected Date</label>
                    <p className="font-medium">{formatDate(purchaseOrder.expectedDate)}</p>
                  </div>
                  
                  {purchaseOrder.deliveredDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Delivered Date</label>
                      <p className="font-medium">{formatDate(purchaseOrder.deliveredDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Order Progress */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Progress</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="font-bold text-green-600">{orderMetrics.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={orderMetrics.progress} className="h-4" />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{orderMetrics.receivedQuantity} received</span>
                    <span>{orderMetrics.totalQuantity} total</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{orderMetrics.totalItems}</div>
                    <div className="text-sm text-muted-foreground">Total Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{orderMetrics.receivedQuantity}</div>
                    <div className="text-sm text-muted-foreground">Received</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{orderMetrics.pendingQuantity}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Items ({purchaseOrder.items.length})</h3>
              
              <AdvancedDataTable
                data={purchaseOrder.items}
                columns={itemColumns}
                searchable={false}
                filterable={false}
                pagination={{
                  pageSize: 10,
                  currentPage: 1,
                  totalPages: Math.ceil(purchaseOrder.items.length / 10),
                  totalItems: purchaseOrder.items.length,
                  onChange: () => {}
                }}
              />
            </div>

            {/* Cost Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(purchaseOrder.subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Amount</span>
                  <span className="font-medium">{formatCurrency(purchaseOrder.taxAmount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Cost</span>
                  <span className="font-medium">{formatCurrency(purchaseOrder.shippingCost)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total Amount</span>
                  <span className="font-bold text-green-600">{formatCurrency(purchaseOrder.totalAmount)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-muted-foreground">Items</span>
                  </div>
                  <span className="font-bold">{orderMetrics.totalItems}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CurrencyDollar className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Total Value</span>
                  </div>
                  <span className="font-bold">{formatCurrency(purchaseOrder.totalAmount)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Progress</span>
                  </div>
                  <span className="font-bold">{orderMetrics.progress.toFixed(1)}%</span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Days to Expected</span>
                  <span className="font-medium">
                    {purchaseOrder.expectedDate 
                      ? Math.ceil((new Date(purchaseOrder.expectedDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      : 'N/A'} days
                  </span>
                </div>
              </div>
            </Card>

            {/* Supplier Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Supplier Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{purchaseOrder.supplier.name}</p>
                    <p className="text-sm text-muted-foreground">{purchaseOrder.supplier.code}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Envelope className="h-4 w-4 text-muted-foreground" />
                    <span>{purchaseOrder.supplier.email}</span>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <User className="h-4 w-4 mr-2" />
                    View Supplier Details
                  </Button>
                </div>
              </div>
            </Card>

            {/* Order Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Order Created</p>
                    <p className="text-sm text-muted-foreground">{formatDate(purchaseOrder.orderDate)}</p>
                  </div>
                </div>
                
                {purchaseOrder.status !== 'draft' && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Order Confirmed</p>
                      <p className="text-sm text-muted-foreground">Status updated</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    purchaseOrder.deliveredDate ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Truck className={`h-4 w-4 ${
                      purchaseOrder.deliveredDate ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">Expected Delivery</p>
                    <p className="text-sm text-muted-foreground">{formatDate(purchaseOrder.expectedDate)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Created By Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Details</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-muted-foreground">Created By</label>
                  <p className="font-medium">{purchaseOrder.createdBy}</p>
                </div>
                
                {purchaseOrder.approvedBy && (
                  <div>
                    <label className="text-muted-foreground">Approved By</label>
                    <p className="font-medium">{purchaseOrder.approvedBy}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-muted-foreground">Created At</label>
                  <p className="font-medium">{formatDateTime(purchaseOrder.createdAt)}</p>
                </div>
                
                <div>
                  <label className="text-muted-foreground">Last Updated</label>
                  <p className="font-medium">{formatDateTime(purchaseOrder.updatedAt)}</p>
                </div>
              </div>
            </Card>

            {/* Notes */}
            {purchaseOrder.notes && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Notes</h3>
                <p className="text-sm">{purchaseOrder.notes}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}