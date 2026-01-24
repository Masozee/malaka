'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { purchaseOrderService } from '@/services/procurement'
import { supplierService } from '@/services/masterdata'
import type { PurchaseOrder } from '@/types/procurement'
import type { Supplier } from '@/types/masterdata'
import Link from 'next/link'

interface OrderItem {
  id: string
  item_name: string
  description: string
  specification: string
  quantity: number
  unit: string
  unit_price: number
  discount_percentage: number
  tax_percentage: number
  line_total: number
  currency: string
}

export default function EditPurchaseOrderPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [mounted, setMounted] = useState(false)
  const [items, setItems] = useState<OrderItem[]>([])

  const form = useForm({
    defaultValues: {
      supplier_id: '',
      purchase_request_id: '',
      expected_delivery_date: '',
      delivery_address: '',
      payment_terms: 'Net 30',
      notes: '',
    },
    onSubmit: async ({ value }) => {
      if (!order) return
      setSaving(true)
      try {
        await purchaseOrderService.update(order.id, {
          ...value,
          items: items.map(({ id, line_total, ...item }) => item),
        })
        router.push(`/procurement/purchase-orders/${order.id}`)
      } catch (error) {
        console.error('Error updating purchase order:', error)
        alert('Failed to update purchase order. Please try again.')
      } finally {
        setSaving(false)
      }
    },
  })

  useEffect(() => {
    setMounted(true)
    loadSuppliers()
    loadOrder()
  }, [params.id])

  const loadSuppliers = async () => {
    try {
      const response = await supplierService.getAll({ status: 'active' })
      setSuppliers(response.data || [])
    } catch (error) {
      console.error('Error loading suppliers:', error)
    }
  }

  const loadOrder = async () => {
    try {
      setLoading(true)
      const data = await purchaseOrderService.getById(params.id as string)
      setOrder(data)
      form.setFieldValue('supplier_id', data.supplier_id || '')
      form.setFieldValue('purchase_request_id', data.purchase_request_id || '')
      form.setFieldValue('expected_delivery_date', data.expected_delivery_date?.split('T')[0] || '')
      form.setFieldValue('delivery_address', data.delivery_address || '')
      form.setFieldValue('payment_terms', data.payment_terms || 'Net 30')
      form.setFieldValue('notes', data.notes || '')
      setItems(
        data.items?.map((item) => ({
          id: item.id,
          item_name: item.item_name,
          description: item.description || '',
          specification: item.specification || '',
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          discount_percentage: item.discount_percentage,
          tax_percentage: item.tax_percentage,
          line_total: item.line_total,
          currency: item.currency,
        })) || []
      )
    } catch (error) {
      console.error('Error loading purchase order:', error)
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!order) return
    if (window.confirm('Are you sure you want to delete this purchase order? This action cannot be undone.')) {
      setDeleting(true)
      try {
        await purchaseOrderService.delete(order.id)
        router.push('/procurement/purchase-orders')
      } catch (error) {
        console.error('Error deleting purchase order:', error)
        alert('Failed to delete purchase order. Please try again.')
      } finally {
        setDeleting(false)
      }
    }
  }

  const calculateLineTotal = (item: OrderItem) => {
    const subtotal = item.quantity * item.unit_price
    const discount = subtotal * (item.discount_percentage / 100)
    const taxable = subtotal - discount
    const tax = taxable * (item.tax_percentage / 100)
    return taxable + tax
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        item_name: '',
        description: '',
        specification: '',
        quantity: 1,
        unit: 'pcs',
        unit_price: 0,
        discount_percentage: 0,
        tax_percentage: 10,
        line_total: 0,
        currency: 'IDR',
      },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length === 1) return
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          updatedItem.line_total = calculateLineTotal(updatedItem)
          return updatedItem
        }
        return item
      })
    )
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const totalDiscount = items.reduce((sum, item) => sum + item.quantity * item.unit_price * (item.discount_percentage / 100), 0)
  const totalTax = items.reduce((sum, item) => {
    const taxable = item.quantity * item.unit_price * (1 - item.discount_percentage / 100)
    return sum + taxable * (item.tax_percentage / 100)
  }, 0)
  const totalAmount = subtotal - totalDiscount + totalTax

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Loading..."
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
            { label: 'Loading...' },
          ]}
        />
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
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
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
            { label: 'Not Found' },
          ]}
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Purchase order not found</h3>
            <p className="text-muted-foreground mb-4">
              The purchase order you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/procurement/purchase-orders">
              <Button variant="outline">Back to Purchase Orders</Button>
            </Link>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
    { label: order.po_number, href: `/procurement/purchase-orders/${order.id}` },
    { label: 'Edit' },
  ]

  return (
    <TwoLevelLayout>
      <Header
        title={`Edit ${order.po_number}`}
        description="Update purchase order details"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/procurement/purchase-orders/${order.id}`}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={() => form.handleSubmit()} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
              {/* Order Details */}
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Order Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form.Field name="supplier_id">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="supplier_id">Supplier *</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name} ({supplier.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="expected_delivery_date">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
                        <Input
                          id="expected_delivery_date"
                          type="date"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="payment_terms">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="payment_terms">Payment Terms</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Net 15">Net 15</SelectItem>
                            <SelectItem value="Net 30">Net 30</SelectItem>
                            <SelectItem value="Net 45">Net 45</SelectItem>
                            <SelectItem value="Net 60">Net 60</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="purchase_request_id">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="purchase_request_id">Purchase Request Reference</Label>
                        <Input
                          id="purchase_request_id"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="delivery_address">
                    {(field) => (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="delivery_address">Delivery Address *</Label>
                        <Textarea
                          id="delivery_address"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          rows={3}
                          required
                        />
                      </div>
                    )}
                  </form.Field>
                </div>
              </Card>

              {/* Order Items */}
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Order Items</h3>
                  <Button type="button" onClick={addItem} variant="outline" size="sm">
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label>Item Name *</Label>
                          <Input
                            value={item.item_name}
                            onChange={(e) => updateItem(item.id, 'item_name', e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Unit</Label>
                          <Select
                            value={item.unit}
                            onValueChange={(value) => updateItem(item.id, 'unit', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pcs">Pcs</SelectItem>
                              <SelectItem value="kg">Kg</SelectItem>
                              <SelectItem value="m">Meter</SelectItem>
                              <SelectItem value="box">Box</SelectItem>
                              <SelectItem value="roll">Roll</SelectItem>
                              <SelectItem value="set">Set</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Unit Price (IDR)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Discount (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount_percentage}
                            onChange={(e) => updateItem(item.id, 'discount_percentage', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="max-w-md ml-auto space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{mounted ? `Rp ${subtotal.toLocaleString('id-ID')}` : ''}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{mounted ? `Rp ${totalDiscount.toLocaleString('id-ID')}` : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{mounted ? `Rp ${totalTax.toLocaleString('id-ID')}` : ''}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span>{mounted ? `Rp ${totalAmount.toLocaleString('id-ID')}` : ''}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Notes */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
                <form.Field name="notes">
                  {(field) => (
                    <Textarea
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      rows={4}
                    />
                  )}
                </form.Field>
              </Card>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => form.handleSubmit()}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>

                <Link href={`/procurement/purchase-orders/${order.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>

                <Separator className="my-3" />

                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Order'}
                </Button>
              </div>
            </Card>

            {/* Order Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PO Number</span>
                  <span className="font-medium">{order.po_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{order.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
