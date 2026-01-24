"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Separator } from '@/components/ui/separator'

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
  status: 'draft' | 'confirmed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  payment_terms: string
  due_date: string
  estimated_delivery: string
  notes?: string
}

export default function NewSalesOrderPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [order, setOrder] = useState<SalesOrder>({
    order_number: `SO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    order_date: new Date().toISOString().split('T')[0],
    customer_id: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    sales_person: '',
    order_type: 'retail',
    delivery_address: '',
    items: [{
      id: '1',
      product_code: '',
      product_name: '',
      size: '',
      color: '',
      quantity: 1,
      unit_price: 0,
      discount_percentage: 0,
      line_total: 0
    }],
    subtotal: 0,
    tax_amount: 0,
    discount_amount: 0,
    shipping_cost: 0,
    total_amount: 0,
    status: 'draft',
    priority: 'normal',
    payment_terms: 'Net 30',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    estimated_delivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
    notes: ''
  })

  useEffect(() => {
    setMounted(true)
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
    if (order.items.length === 1) return // Keep at least one item

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

  const handleSave = async (status: 'draft' | 'confirmed' = 'draft') => {
    setSaving(true)
    const orderToSave = { ...order, status }
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      // In real app, you'd get the created order ID from the API response
      const newOrderId = Date.now().toString()
      router.push(`/sales/orders/${newOrderId}`)
    }, 1000)
  }

  const isFormValid = () => {
    return order.customer_name.trim() !== '' && 
           order.customer_email.trim() !== '' &&
           order.items.some(item => item.product_name.trim() !== '' && item.quantity > 0)
  }

  const breadcrumbs = [
    { label: 'Sales', href: '/sales' },
    { label: 'Sales Orders', href: '/sales/orders' },
    { label: 'New Order' }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="New Sales Order"
        description="Create a new customer order"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/sales/orders">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSave('draft')} 
              disabled={saving || !isFormValid()}
            >
              <FloppyDisk className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button 
              onClick={() => handleSave('confirmed')} 
              disabled={saving || !isFormValid()}
            >
              <FloppyDisk className="h-4 w-4 mr-2" />
              {saving ? 'Creating...' : 'Create Order'}
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
              <Label htmlFor="order_number">Order Number</Label>
              <Input
                id="order_number"
                value={order.order_number}
                onChange={(e) => setOrder({ ...order, order_number: e.target.value })}
                disabled
              />
            </div>
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
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input
                id="payment_terms"
                value={order.payment_terms}
                onChange={(e) => setOrder({ ...order, payment_terms: e.target.value })}
                placeholder="e.g., Net 30, Cash on Delivery, etc."
              />
            </div>
          </div>
        </Card>

        {/* Customer Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input
                id="customer_name"
                value={order.customer_name}
                onChange={(e) => setOrder({ ...order, customer_name: e.target.value })}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_email">Email *</Label>
              <Input
                id="customer_email"
                type="email"
                value={order.customer_email}
                onChange={(e) => setOrder({ ...order, customer_email: e.target.value })}
                placeholder="customer@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Phone</Label>
              <Input
                id="customer_phone"
                value={order.customer_phone}
                onChange={(e) => setOrder({ ...order, customer_phone: e.target.value })}
                placeholder="081234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales_person">Sales Person</Label>
              <Input
                id="sales_person"
                value={order.sales_person}
                onChange={(e) => setOrder({ ...order, sales_person: e.target.value })}
                placeholder="Enter sales person name"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="delivery_address">Delivery Address</Label>
              <Textarea
                id="delivery_address"
                value={order.delivery_address}
                onChange={(e) => setOrder({ ...order, delivery_address: e.target.value })}
                rows={3}
                placeholder="Enter complete delivery address"
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
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  <div className="space-y-2">
                    <Label>Product Code</Label>
                    <Input
                      value={item.product_code}
                      onChange={(e) => updateOrderItem(item.id, 'product_code', e.target.value)}
                      placeholder="SKU"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Product Name *</Label>
                    <Input
                      value={item.product_name}
                      onChange={(e) => updateOrderItem(item.id, 'product_name', e.target.value)}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Size</Label>
                    <Input
                      value={item.size}
                      onChange={(e) => updateOrderItem(item.id, 'size', e.target.value)}
                      placeholder="Size"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Input
                      value={item.color}
                      onChange={(e) => updateOrderItem(item.id, 'color', e.target.value)}
                      placeholder="Color"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Price</Label>
                    <Input
                      type="number"
                      min="0"
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
                min="0"
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
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={order.notes || ''}
                onChange={(e) => setOrder({ ...order, notes: e.target.value })}
                rows={3}
                placeholder="Additional notes or instructions"
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

        {!isFormValid() && (
          <Card className="p-4 border-amber-200 bg-amber-50">
            <p className="text-sm text-amber-800">
              Please fill in all required fields (*) before saving the order.
            </p>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}