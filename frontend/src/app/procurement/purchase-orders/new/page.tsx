'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { purchaseOrderService } from '@/services/procurement'
import { supplierService } from '@/services/masterdata'
import { useToast } from '@/components/ui/toast'
import type { Supplier } from '@/types/masterdata'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon, Delete01Icon } from '@hugeicons/core-free-icons'

// Zod Schema for form validation
const purchaseOrderItemSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  specification: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  unit_price: z.number().min(0, 'Unit price must be 0 or greater'),
  discount_percentage: z.number().min(0).max(100, 'Discount must be between 0 and 100'),
  tax_percentage: z.number().min(0).max(100, 'Tax must be between 0 and 100'),
  currency: z.string().default('IDR'),
})

const purchaseOrderSchema = z.object({
  supplier_id: z.string().min(1, 'Supplier is required'),
  purchase_request_id: z.string().optional(),
  expected_delivery_date: z.string().min(1, 'Expected delivery date is required'),
  delivery_address: z.string().min(1, 'Delivery address is required'),
  payment_terms: z.string().min(1, 'Payment terms is required'),
  notes: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required'),
})

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>

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

function NewPurchaseOrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [mounted, setMounted] = useState(false)
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({})
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: '1',
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

  const form = useForm({
    defaultValues: {
      supplier_id: searchParams.get('supplier') || '',
      purchase_request_id: searchParams.get('pr') || '',
      expected_delivery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      delivery_address: '',
      payment_terms: 'Net 30',
      notes: '',
    },
    onSubmit: async ({ value }) => {
      // Validate items with Zod
      const errors: Record<string, string> = {}
      let hasErrors = false

      items.forEach((item, index) => {
        const result = purchaseOrderItemSchema.safeParse(item)
        if (!result.success) {
          result.error.errors.forEach((err) => {
            errors[`${item.id}-${err.path[0]}`] = err.message
            hasErrors = true
          })
        }
      })

      setItemErrors(errors)

      if (hasErrors) {
        addToast({ type: 'error', title: 'Please fix validation errors in items' })
        return
      }

      // Validate main form with Zod
      const formData: PurchaseOrderFormValues = {
        ...value,
        items: items.map(({ id, line_total, ...item }) => item),
      }

      const validation = purchaseOrderSchema.safeParse(formData)
      if (!validation.success) {
        const firstError = validation.error.errors[0]
        addToast({ type: 'error', title: firstError.message })
        return
      }

      setSaving(true)
      try {
        await purchaseOrderService.create(formData)
        addToast({ type: 'success', title: 'Purchase order created successfully' })
        router.push('/procurement/purchase-orders')
      } catch (error) {
        console.error('Error creating purchase order:', error)
        addToast({ type: 'error', title: 'Failed to create purchase order. Please try again.' })
      } finally {
        setSaving(false)
      }
    },
  })

  useEffect(() => {
    setMounted(true)
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      const response = await supplierService.getAll({ status: 'active' })
      setSuppliers(response.data || [])
    } catch (error) {
      console.error('Error loading suppliers:', error)
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
    // Clear errors for removed item
    const newErrors = { ...itemErrors }
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`${id}-`)) {
        delete newErrors[key]
      }
    })
    setItemErrors(newErrors)
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
    // Clear error for this field
    const errorKey = `${id}-${field}`
    if (itemErrors[errorKey]) {
      const newErrors = { ...itemErrors }
      delete newErrors[errorKey]
      setItemErrors(newErrors)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const totalDiscount = items.reduce((sum, item) => sum + item.quantity * item.unit_price * (item.discount_percentage / 100), 0)
  const totalTax = items.reduce((sum, item) => {
    const taxable = item.quantity * item.unit_price * (1 - item.discount_percentage / 100)
    return sum + taxable * (item.tax_percentage / 100)
  }, 0)
  const totalAmount = subtotal - totalDiscount + totalTax

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
    { label: 'New Order' },
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="New Purchase Order"
        description="Create a new purchase order"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/procurement/purchase-orders">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={() => form.handleSubmit()} disabled={saving}>
              {saving ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
          {/* Order Details */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field
                name="supplier_id"
                validators={{
                  onChange: ({ value }) => !value ? 'Supplier is required' : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="supplier_id">Supplier *</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                    >
                      <SelectTrigger className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name} ({supplier.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="expected_delivery_date"
                validators={{
                  onChange: ({ value }) => !value ? 'Expected delivery date is required' : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="expected_delivery_date">Expected Delivery Date *</Label>
                    <Input
                      id="expected_delivery_date"
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="payment_terms">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="payment_terms">Payment Terms *</Label>
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
                      placeholder="PR Number (optional)"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field
                name="delivery_address"
                validators={{
                  onChange: ({ value }) => !value ? 'Delivery address is required' : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="delivery_address">Delivery Address *</Label>
                    <Textarea
                      id="delivery_address"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      rows={3}
                      placeholder="Enter delivery address"
                      className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                    )}
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
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
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
                      className="text-red-500 hover:text-red-700"
                    >
                      <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Item Name *</Label>
                      <Input
                        value={item.item_name}
                        onChange={(e) => updateItem(item.id, 'item_name', e.target.value)}
                        placeholder="Enter item name"
                        className={itemErrors[`${item.id}-item_name`] ? 'border-red-500' : ''}
                      />
                      {itemErrors[`${item.id}-item_name`] && (
                        <p className="text-sm text-red-500">{itemErrors[`${item.id}-item_name`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className={itemErrors[`${item.id}-quantity`] ? 'border-red-500' : ''}
                      />
                      {itemErrors[`${item.id}-quantity`] && (
                        <p className="text-sm text-red-500">{itemErrors[`${item.id}-quantity`]}</p>
                      )}
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
                      <Label>Unit Price (IDR) *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                        className={itemErrors[`${item.id}-unit_price`] ? 'border-red-500' : ''}
                      />
                      {itemErrors[`${item.id}-unit_price`] && (
                        <p className="text-sm text-red-500">{itemErrors[`${item.id}-unit_price`]}</p>
                      )}
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

                    <div className="space-y-2 md:col-span-2">
                      <Label>Specification</Label>
                      <Input
                        value={item.specification}
                        onChange={(e) => updateItem(item.id, 'specification', e.target.value)}
                        placeholder="Enter specification"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tax (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.tax_percentage}
                        onChange={(e) => updateItem(item.id, 'tax_percentage', parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Line Total</Label>
                      <Input
                        value={mounted ? `Rp ${item.line_total.toLocaleString('id-ID')}` : ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="max-w-md ml-auto space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{mounted ? `Rp ${subtotal.toLocaleString('id-ID')}` : ''}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-{mounted ? `Rp ${totalDiscount.toLocaleString('id-ID')}` : ''}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
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
                  placeholder="Enter any additional notes or instructions"
                />
              )}
            </form.Field>
          </Card>
        </form>
      </div>
    </TwoLevelLayout>
  )
}

export default function NewPurchaseOrderPage() {
  return (
    <Suspense fallback={
      <TwoLevelLayout>
        <Header title="Loading..." breadcrumbs={[]} />
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </TwoLevelLayout>
    }>
      <NewPurchaseOrderContent />
    </Suspense>
  )
}
