"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Separator } from '@/components/ui/separator'

import Link from 'next/link'

// Mock data - same types as main page
interface OrderItem {
  id: string
  product_code: string
  product_name: string
  size: string
  color: string
  quantity: number
  unit_price: number
  discount_percentage: number
  line_total: number
}

interface SalesOrder {
  id: string
  order_number: string
  order_date: string
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  sales_person: string
  order_type: 'wholesale' | 'retail' | 'distributor' | 'export'
  delivery_address: string
  items: OrderItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  shipping_cost: number
  total_amount: number
  status: 'draft' | 'confirmed' | 'production' | 'ready' | 'shipped' | 'delivered' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  payment_terms: string
  due_date: string
  estimated_delivery: string
  notes?: string
  created_at: string
  updated_at: string
}

// Mock data for demo
const mockOrder: SalesOrder = {
  id: '1',
  order_number: 'SO-2024-001',
  order_date: '2024-07-25',
  customer_id: '1',
  customer_name: 'Toko Sepatu Merdeka',
  customer_email: 'merdeka@tokosepatu.com',
  customer_phone: '08123456789',
  sales_person: 'Ahmad Sales',
  order_type: 'wholesale',
  delivery_address: 'Jl. Merdeka No. 123, Jakarta Pusat, DKI Jakarta 10110',
  items: [
    {
      id: '1',
      product_code: 'SHOE-001',
      product_name: 'Classic Oxford Brown',
      size: '42',
      color: 'Brown',
      quantity: 50,
      unit_price: 300000,
      discount_percentage: 10,
      line_total: 13500000
    },
    {
      id: '2',
      product_code: 'SHOE-002',
      product_name: 'Sports Sneaker White',
      size: '40',
      color: 'White',
      quantity: 30,
      unit_price: 280000,
      discount_percentage: 10,
      line_total: 7560000
    }
  ],
  subtotal: 21060000,
  tax_amount: 2106000,
  discount_amount: 2340000,
  shipping_cost: 150000,
  total_amount: 20976000,
  status: 'production',
  priority: 'high',
  payment_terms: 'Net 30',
  due_date: '2024-08-25',
  estimated_delivery: '2024-08-05',
  notes: 'Bulk order untuk grand opening toko baru',
  created_at: '2024-07-25T09:00:00Z',
  updated_at: '2024-07-25T14:30:00Z'
}

export default function SalesOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [order, setOrder] = useState<SalesOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    // Simulate API call
    setTimeout(() => {
      setOrder(mockOrder)
      setLoading(false)
    }, 500)
  }, [])

  const formatCurrency = (amount: number): string => {
    if (!mounted) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString: string): string => {
    if (!mounted) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { variant: 'outline' as const, label: 'Draft' },
      confirmed: { variant: 'default' as const, label: 'Confirmed' },
      production: { variant: 'secondary' as const, label: 'Production' },
      ready: { variant: 'default' as const, label: 'Ready' },
      shipped: { variant: 'default' as const, label: 'Shipped' },
      delivered: { variant: 'default' as const, label: 'Delivered' },
      cancelled: { variant: 'outline' as const, label: 'Cancelled' }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status }
  }

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: { variant: 'outline' as const, label: 'Low' },
      normal: { variant: 'secondary' as const, label: 'Normal' },
      high: { variant: 'default' as const, label: 'High' },
      urgent: { variant: 'destructive' as const, label: 'Urgent' }
    }
    return config[priority as keyof typeof config] || { variant: 'secondary' as const, label: priority }
  }

  const getOrderTypeBadge = (type: string) => {
    const config = {
      wholesale: { variant: 'default' as const, label: 'Wholesale' },
      retail: { variant: 'secondary' as const, label: 'Retail' },
      distributor: { variant: 'outline' as const, label: 'Distributor' },
      export: { variant: 'secondary' as const, label: 'Export' }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type }
  }

  const breadcrumbs = [
    { label: 'Sales', href: '/sales' },
    { label: 'Sales Orders', href: '/sales/orders' },
    { label: order?.order_number || 'Loading...' }
  ]

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Loading..."
          breadcrumbs={breadcrumbs}
        />
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  if (!order) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Order Not Found"
          breadcrumbs={breadcrumbs}
        />
        <div className="flex-1 p-6">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/sales/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
          </Card>
        </div>
      </TwoLevelLayout>
    )
  }

  const { variant: statusVariant, label: statusLabel } = getStatusBadge(order.status)
  const { variant: priorityVariant, label: priorityLabel } = getPriorityBadge(order.priority)
  const { variant: typeVariant, label: typeLabel } = getOrderTypeBadge(order.order_type)

  return (
    <TwoLevelLayout>
      <Header 
        title={order.order_number}
        description="Sales order details and management"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <DownloadSimple className="h-4 w-4 mr-2" />
              Export
            </Button>
            {(order.status === 'draft' || order.status === 'confirmed') && (
              <Button size="sm" asChild>
                <Link href={`/sales/orders/${order.id}/edit`}>
                  <PencilSimple className="h-4 w-4 mr-2" />
                  Edit Order
                </Link>
              </Button>
            )}
          </div>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Order Status and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant}>{statusLabel}</Badge>
                <Badge variant={priorityVariant}>{priorityLabel}</Badge>
                <Badge variant={typeVariant}>{typeLabel}</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Order Date:</span>
                  <span className="font-medium">{formatDate(order.order_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Due Date:</span>
                  <span className="font-medium">{formatDate(order.due_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Est. Delivery:</span>
                  <span className="font-medium">{formatDate(order.estimated_delivery)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Sales Person:</span>
                  <span className="font-medium">{order.sales_person}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Payment Terms:</span>
                  <span className="font-medium">{order.payment_terms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Items:</span>
                  <span className="font-medium">{order.items.length} items</span>
                </div>
              </div>
            </div>
            
            {order.notes && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-1">Notes</h4>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">{order.customer_name}</h4>
              </div>
              <div className="flex items-center gap-2">
                <Envelope className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.customer_email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.customer_phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium mb-1">Delivery Address</div>
                  <div className="text-muted-foreground">{order.delivery_address}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Product Code</th>
                  <th className="text-left py-2">Product Name</th>
                  <th className="text-left py-2">Size</th>
                  <th className="text-left py-2">Color</th>
                  <th className="text-right py-2">Quantity</th>
                  <th className="text-right py-2">Unit Price</th>
                  <th className="text-right py-2">Discount</th>
                  <th className="text-right py-2">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3 font-mono text-xs">{item.product_code}</td>
                    <td className="py-3 font-medium">{item.product_name}</td>
                    <td className="py-3">{item.size}</td>
                    <td className="py-3">{item.color}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 text-right">{item.discount_percentage}%</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Order Totals */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Order Totals</h3>
          <div className="space-y-2 max-w-md ml-auto">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span className="text-green-600">-{formatCurrency(order.discount_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%):</span>
              <span>{formatCurrency(order.tax_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{formatCurrency(order.shipping_cost)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          <div className="flex flex-wrap gap-2">
            {order.status === 'confirmed' && (
              <Button>
                <PaperPlaneTilt className="mr-2 h-4 w-4" />
                Send to Production
              </Button>
            )}
            {order.status === 'ready' && (
              <Button>
                <Truck className="mr-2 h-4 w-4" />
                Mark as Shipped
              </Button>
            )}
            <Button variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Duplicate Order
            </Button>
            <Button variant="outline">
              <Archive className="mr-2 h-4 w-4" />
              Archive Order
            </Button>
            {order.status === 'draft' && (
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete Order
              </Button>
            )}
          </div>
        </Card>
      </div>
    </TwoLevelLayout>
  )
}