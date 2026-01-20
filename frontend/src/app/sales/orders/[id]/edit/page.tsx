"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

// Types
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

// Mock data
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
  status: 'draft',
  priority: 'high',
  payment_terms: 'Net 30',
  due_date: '2024-08-25',
  estimated_delivery: '2024-08-05',
  notes: 'Bulk order untuk grand opening toko baru',
  created_at: '2024-07-25T09:00:00Z',
  updated_at: '2024-07-25T14:30:00Z'
}

export default function EditSalesOrderPage() {
  const params = useParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [order, setOrder] = useState<SalesOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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

  const calculateLineTotal = (quantity: number, unitPrice: number, discountPercentage: number): number => {
    const subtotal = quantity * unitPrice
    const discount = subtotal * (discountPercentage / 100)
    return subtotal - discount
  }

  const calculateOrderTotals = (items: OrderItem[], shippingCost: number = 0) => {
    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0)
    const discount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price * item.discount_percentage / 100), 0)
    const taxAmount = subtotal * 0.1 // 10% tax
    const total = subtotal + taxAmount + shippingCost
    
    return { subtotal, discount, taxAmount, total }
  }

  const updateOrderItem = (itemId: string, field: keyof OrderItem, value: any) => {
    if (!order) return

    const updatedItems = order.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value }
        // Recalculate line total when quantity, unit_price, or discount_percentage changes
        if (['quantity', 'unit_price', 'discount_percentage'].includes(field)) {
          updatedItem.line_total = calculateLineTotal(
            updatedItem.quantity,
            updatedItem.unit_price,
            updatedItem.discount_percentage
          )
        }
        return updatedItem
      }
      return item
    })

    const { subtotal, discount, taxAmount, total } = calculateOrderTotals(updatedItems, order.shipping_cost)

    setOrder({
      ...order,
      items: updatedItems,
      subtotal,
      discount_amount: discount,
      tax_amount: taxAmount,
      total_amount: total
    })
  }

  const addOrderItem = () => {
    if (!order) return

    const newItem: OrderItem = {
      id: Date.now().toString(),
      product_code: '',
      product_name: '',
      size: '',
      color: '',
      quantity: 1,
      unit_price: 0,
      discount_percentage: 0,
      line_total: 0
    }

    setOrder({
      ...order,
      items: [...order.items, newItem]
    })
  }

  const removeOrderItem = (itemId: string) => {
    if (!order) return

    const updatedItems = order.items.filter(item => item.id !== itemId)
    const { subtotal, discount, taxAmount, total } = calculateOrderTotals(updatedItems, order.shipping_cost)

    setOrder({
      ...order,
      items: updatedItems,
      subtotal,
      discount_amount: discount,
      tax_amount: taxAmount,
      total_amount: total
    })
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      router.push(`/sales/orders/${order?.id}`)
    }, 1000)
  }

  const breadcrumbs = [
    { label: 'Sales', href: '/sales' },
    { label: 'Sales Orders', href: '/sales/orders' },
    { label: order?.order_number || 'Loading...', href: `/sales/orders/${params.id}` },
    { label: 'Edit' }
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
            <p className="text-muted-foreground mb-4">The order you're trying to edit doesn't exist.</p>
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

  return (
    <TwoLevelLayout>
      <Header 
        title={`Edit ${order.order_number}`}
        description="Modify sales order details"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/sales/orders/${order.id}`}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Link>
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Order Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Order Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order_date">Order Date</Label>
              <Input
                id="order_date"
                type="date"
                value={order.order_date}
                onChange={(e) => setOrder({ ...order, order_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={order.due_date}
                onChange={(e) => setOrder({ ...order, due_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_delivery">Estimated Delivery</Label>
              <Input
                id="estimated_delivery"
                type="date"
                value={order.estimated_delivery}
                onChange={(e) => setOrder({ ...order, estimated_delivery: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order_type">Order Type</Label>
              <Select value={order.order_type} onValueChange={(value) => setOrder({ ...order, order_type: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={order.priority} onValueChange={(value) => setOrder({ ...order, priority: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input
                id="payment_terms"
                value={order.payment_terms}
                onChange={(e) => setOrder({ ...order, payment_terms: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Customer Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                value={order.customer_name}
                onChange={(e) => setOrder({ ...order, customer_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_email">Email</Label>
              <Input
                id="customer_email"
                type="email"
                value={order.customer_email}
                onChange={(e) => setOrder({ ...order, customer_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Phone</Label>
              <Input
                id="customer_phone"
                value={order.customer_phone}
                onChange={(e) => setOrder({ ...order, customer_phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales_person">Sales Person</Label>
              <Input
                id="sales_person"
                value={order.sales_person}
                onChange={(e) => setOrder({ ...order, sales_person: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="delivery_address">Delivery Address</Label>
              <Textarea
                id="delivery_address"
                value={order.delivery_address}
                onChange={(e) => setOrder({ ...order, delivery_address: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Order Items</h3>
            <Button onClick={addOrderItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOrderItem(item.id)}
                    disabled={order.items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  <div className="space-y-2">
                    <Label>Product Code</Label>
                    <Input
                      value={item.product_code}
                      onChange={(e) => updateOrderItem(item.id, 'product_code', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Product Name</Label>
                    <Input
                      value={item.product_name}
                      onChange={(e) => updateOrderItem(item.id, 'product_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Size</Label>
                    <Input
                      value={item.size}
                      onChange={(e) => updateOrderItem(item.id, 'size', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Input
                      value={item.color}
                      onChange={(e) => updateOrderItem(item.id, 'color', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateOrderItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount_percentage}
                      onChange={(e) => updateOrderItem(item.id, 'discount_percentage', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div className="mt-3 text-right">
                  <span className="text-sm text-muted-foreground">Line Total: </span>
                  <span className="font-medium">{formatCurrency(item.line_total)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Shipping and Notes */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shipping_cost">Shipping Cost</Label>
              <Input
                id="shipping_cost"
                type="number"
                value={order.shipping_cost}
                onChange={(e) => {
                  const shippingCost = parseFloat(e.target.value) || 0
                  const { subtotal, discount, taxAmount, total } = calculateOrderTotals(order.items, shippingCost)
                  setOrder({
                    ...order,
                    shipping_cost: shippingCost,
                    subtotal,
                    discount_amount: discount,
                    tax_amount: taxAmount,
                    total_amount: total
                  })
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={order.notes || ''}
                onChange={(e) => setOrder({ ...order, notes: e.target.value })}
                rows={3}
              />
            </div>
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
      </div>
    </TwoLevelLayout>
  )
}