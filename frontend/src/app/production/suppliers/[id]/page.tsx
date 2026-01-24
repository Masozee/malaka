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
import { mockSuppliers, mockPurchaseOrders } from '@/services/production'
import type { Supplier, PurchaseOrder } from '@/types/production'
import { useParams } from 'next/navigation'

export default function SupplierDetailsPage() {
  const [mounted, setMounted] = useState(false)
  const params = useParams()
  const supplierId = params.id as string

  useEffect(() => {
    setMounted(true)
  }, [])

  // Find the supplier (in real app, this would be an API call)
  const supplier = mockSuppliers.find(s => s.id === supplierId)

  // Get purchase orders for this supplier
  const supplierPurchaseOrders = mockPurchaseOrders.filter(po => po.supplierId === supplierId)

  if (!supplier) {
    return (
      <TwoLevelLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Supplier Not Found</h2>
            <p className="text-muted-foreground mt-2">The requested supplier could not be found.</p>
            <Button asChild className="mt-4">
              <Link href="/production/suppliers">Back to Suppliers</Link>
            </Button>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Production', href: '/production' },
    { label: 'Suppliers', href: '/production/suppliers' },
    { label: supplier.name, href: `/production/suppliers/${supplier.id}` }
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

  const getStatusBadge = (status: Supplier['status']) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Active' },
      inactive: { variant: 'secondary' as const, label: 'Inactive' },
      suspended: { variant: 'destructive' as const, label: 'Suspended' }
    }
    return statusConfig[status] || { variant: 'secondary' as const, label: status }
  }

  const getPurchaseOrderStatusBadge = (status: PurchaseOrder['status']) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      sent: { variant: 'outline' as const, label: 'Sent' },
      confirmed: { variant: 'default' as const, label: 'Confirmed' },
      partial: { variant: 'default' as const, label: 'Partial' },
      delivered: { variant: 'default' as const, label: 'Delivered' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' }
    }
    return statusConfig[status] || { variant: 'secondary' as const, label: status }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-blue-600'
    if (rating >= 3.0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'Excellent'
    if (rating >= 4.0) return 'Good'
    if (rating >= 3.0) return 'Average'
    return 'Poor'
  }

  // Calculate performance metrics
  const performanceMetrics = {
    onTimeDelivery: 87.5, // Mock percentage
    qualityRating: supplier.rating * 20, // Convert to percentage
    responsiveness: 92.3, // Mock percentage
    monthlyOrders: Math.round(supplier.totalOrders / 24), // Assuming 2 years of data
    averageOrderValue: supplier.totalValue / supplier.totalOrders
  }

  // Recent purchase orders columns
  const purchaseOrderColumns = [
    {
      key: 'orderNumber',
      title: 'Order Number',
      render: (po: PurchaseOrder) => (
        <div>
          <div className="font-medium">{po.orderNumber}</div>
          <div className="text-sm text-muted-foreground">{formatDate(po.orderDate)}</div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (po: PurchaseOrder) => {
        const { variant, label } = getPurchaseOrderStatusBadge(po.status)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'items',
      title: 'Items',
      render: (po: PurchaseOrder) => (
        <div className="text-center">
          <div className="font-medium">{po.items.length}</div>
          <div className="text-sm text-muted-foreground">items</div>
        </div>
      )
    },
    {
      key: 'totalAmount',
      title: 'Amount',
      render: (po: PurchaseOrder) => (
        <div className="font-medium">{formatCurrency(po.totalAmount)}</div>
      )
    },
    {
      key: 'expectedDate',
      title: 'Expected',
      render: (po: PurchaseOrder) => (
        <div className="text-sm">{formatDate(po.expectedDate)}</div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title={supplier.name}
          description={`Supplier details and performance metrics`}
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Contract
              </Button>
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4 mr-2" />
                New Order
              </Button>
              <Button size="sm" asChild>
                <Link href={`/production/suppliers/${supplier.id}/edit`}>
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
              <h3 className="text-lg font-semibold mb-4">Supplier Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Supplier Code</label>
                    <p className="font-medium">{supplier.code}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                    <p className="font-medium">{supplier.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                    <p className="font-medium">{supplier.contactPerson}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Terms</label>
                    <p className="font-medium">{supplier.paymentTerms}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge {...getStatusBadge(supplier.status)} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Rating</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Star className={`h-5 w-5 ${getRatingColor(supplier.rating)}`} fill="currentColor" />
                      <span className={`font-medium ${getRatingColor(supplier.rating)}`}>
                        {supplier.rating.toFixed(1)}/5
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({getRatingLabel(supplier.rating)})
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="font-medium">{formatDate(supplier.createdAt)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p className="font-medium">{formatDate(supplier.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Envelope className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="font-medium">{supplier.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="font-medium">{supplier.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <p className="font-medium">{supplier.address}</p>
                      <p className="text-sm text-muted-foreground">{supplier.city}, {supplier.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Performance Metrics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-muted-foreground">On-Time Delivery</label>
                      <span className="font-medium">{performanceMetrics.onTimeDelivery}%</span>
                    </div>
                    <Progress value={performanceMetrics.onTimeDelivery} className="h-3" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-muted-foreground">Quality Rating</label>
                      <span className="font-medium">{performanceMetrics.qualityRating}%</span>
                    </div>
                    <Progress value={performanceMetrics.qualityRating} className="h-3" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-muted-foreground">Responsiveness</label>
                      <span className="font-medium">{performanceMetrics.responsiveness}%</span>
                    </div>
                    <Progress value={performanceMetrics.responsiveness} className="h-3" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Monthly Orders (Avg)</label>
                    <p className="font-medium">{performanceMetrics.monthlyOrders} orders/month</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Purchase Orders */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Purchase Orders</h3>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/production/purchase-orders?supplier=${supplier.id}`}>
                    View All Orders
                  </Link>
                </Button>
              </div>
              
              <AdvancedDataTable
                data={supplierPurchaseOrders.slice(0, 5)}
                columns={purchaseOrderColumns}
                searchable={false}
                filterable={false}
                pagination={{
                  pageSize: 5,
                  currentPage: 1,
                  totalPages: 1,
                  totalItems: supplierPurchaseOrders.length,
                  onChange: () => {}
                }}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Statistics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Key Statistics</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-muted-foreground">Total Orders</span>
                  </div>
                  <span className="font-bold">{supplier.totalOrders.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CurrencyDollar className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Total Value</span>
                  </div>
                  <span className="font-bold">{formatCurrency(supplier.totalValue)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Avg Order Value</span>
                  </div>
                  <span className="font-bold">{formatCurrency(performanceMetrics.averageOrderValue)}</span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Orders</span>
                  <span className="font-medium">{performanceMetrics.monthlyOrders}</span>
                </div>
              </div>
            </Card>

            {/* Rating Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Quality</span>
                    <span>4.8/5</span>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Delivery</span>
                    <span>4.2/5</span>
                  </div>
                  <Progress value={84} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Service</span>
                    <span>4.6/5</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pricing</span>
                    <span>4.3/5</span>
                  </div>
                  <Progress value={86} className="h-2" />
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/production/purchase-orders/new?supplier=${supplier.id}`}>
                    <Package className="h-4 w-4 mr-2" />
                    Create Purchase Order
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Envelope className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Contract
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <TrendUp className="h-4 w-4 mr-2" />
                  Performance Report
                </Button>
              </div>
            </Card>

            {/* Status Alert */}
            {supplier.status !== 'active' && (
              <Card className="p-6 border-orange-200 bg-orange-50">
                <div className="flex items-center space-x-2 text-orange-800">
                  <Warning className="h-5 w-5" />
                  <p className="font-medium">Supplier Status</p>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  This supplier is currently {supplier.status}. Review supplier status before placing new orders.
                </p>
              </Card>
            )}

            {/* Audit Trail */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Audit Trail</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-muted-foreground">Created At</label>
                  <p className="font-medium">{formatDateTime(supplier.createdAt)}</p>
                </div>
                <div>
                  <label className="text-muted-foreground">Last Updated</label>
                  <p className="font-medium">{formatDateTime(supplier.updatedAt)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}