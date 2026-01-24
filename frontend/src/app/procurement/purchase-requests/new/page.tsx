'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { purchaseRequestService } from '@/services/procurement'
import { useToast } from '@/components/ui/toast'
import type { PurchaseRequestFormData } from '@/types/procurement'
import Link from 'next/link'

interface RequestItem {
  id: string
  item_name: string
  description: string
  specification: string
  quantity: number
  unit: string
  estimated_price: number
  currency: string
}

export default function NewPurchaseRequestPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({})
  const [items, setItems] = useState<RequestItem[]>([
    {
      id: '1',
      item_name: '',
      description: '',
      specification: '',
      quantity: 1,
      unit: 'pcs',
      estimated_price: 0,
      currency: 'IDR',
    },
  ])

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      department: '',
      priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
      required_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
    },
    onSubmit: async ({ value }) => {
      // Validate items
      const errors: Record<string, string> = {}
      let hasItemErrors = false

      items.forEach((item, index) => {
        if (!item.item_name.trim()) {
          errors[`${item.id}-item_name`] = 'Item name is required'
          hasItemErrors = true
        }
        if (item.quantity < 1) {
          errors[`${item.id}-quantity`] = 'Quantity must be at least 1'
          hasItemErrors = true
        }
        if (item.estimated_price < 0) {
          errors[`${item.id}-estimated_price`] = 'Price must be 0 or greater'
          hasItemErrors = true
        }
      })

      setItemErrors(errors)

      if (hasItemErrors) {
        addToast({ type: 'error', title: 'Please fix item validation errors' })
        return
      }

      setSaving(true)
      try {
        const formData: PurchaseRequestFormData = {
          ...value,
          items: items.map(({ id, ...item }) => item),
        }
        await purchaseRequestService.create(formData)
        addToast({ type: 'success', title: 'Purchase request created successfully' })
        router.push('/procurement/purchase-requests')
      } catch (error) {
        console.error('Error creating purchase request:', error)
        addToast({ type: 'error', title: 'Failed to create purchase request. Please try again.' })
      } finally {
        setSaving(false)
      }
    },
  })

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
        estimated_price: 0,
        currency: 'IDR',
      },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length === 1) return
    setItems(items.filter((item) => item.id !== id))
    // Clear any errors for the removed item
    const newErrors = { ...itemErrors }
    Object.keys(newErrors).forEach(key => {
      if (key.startsWith(`${id}-`)) {
        delete newErrors[key]
      }
    })
    setItemErrors(newErrors)
  }

  const updateItem = (id: string, field: keyof RequestItem, value: string | number) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
    // Clear error for this field when user starts typing
    const errorKey = `${id}-${field}`
    if (itemErrors[errorKey]) {
      const newErrors = { ...itemErrors }
      delete newErrors[errorKey]
      setItemErrors(newErrors)
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.estimated_price, 0)

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Purchase Requests', href: '/procurement/purchase-requests' },
    { label: 'New Request' },
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="New Purchase Request"
        description="Create a new purchase request"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/procurement/purchase-requests">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={() => form.handleSubmit()} disabled={saving}>
              {saving ? 'Creating...' : 'Submit Request'}
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
          {/* Request Details */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Request Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field
                name="title"
                validators={{
                  onChange: ({ value }) => {
                    if (!value || value.trim().length === 0) return 'Title is required'
                    if (value.length > 200) return 'Title must be 200 characters or less'
                    return undefined
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Request Title *</Label>
                    <Input
                      id="title"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Enter request title"
                      className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="department"
                validators={{
                  onChange: ({ value }) => !value || value.trim().length === 0 ? 'Department is required' : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value)}
                    >
                      <SelectTrigger className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Production">Production</SelectItem>
                        <SelectItem value="Warehouse">Warehouse</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="priority">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value as 'low' | 'medium' | 'high' | 'urgent')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>

              <form.Field
                name="required_date"
                validators={{
                  onChange: ({ value }) => !value || value.trim().length === 0 ? 'Required date is required' : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="required_date">Required Date *</Label>
                    <Input
                      id="required_date"
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

              <form.Field name="description">
                {(field) => (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      rows={3}
                      placeholder="Enter request description"
                    />
                  </div>
                )}
              </form.Field>
            </div>
          </Card>

          {/* Request Items */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Request Items</h3>
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

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                    <div className="space-y-2 md:col-span-2">
                      <Label>Specification</Label>
                      <Input
                        value={item.specification}
                        onChange={(e) => updateItem(item.id, 'specification', e.target.value)}
                        placeholder="Enter specification"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Estimated Price (IDR)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.estimated_price}
                        onChange={(e) => updateItem(item.id, 'estimated_price', parseFloat(e.target.value) || 0)}
                        className={itemErrors[`${item.id}-estimated_price`] ? 'border-red-500' : ''}
                      />
                      {itemErrors[`${item.id}-estimated_price`] && (
                        <p className="text-sm text-red-500">{itemErrors[`${item.id}-estimated_price`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Line Total</Label>
                      <Input
                        value={`Rp ${(item.quantity * item.estimated_price).toLocaleString('id-ID')}`}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Estimated Amount</p>
                <p className="text-2xl font-bold">Rp {totalAmount.toLocaleString('id-ID')}</p>
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
