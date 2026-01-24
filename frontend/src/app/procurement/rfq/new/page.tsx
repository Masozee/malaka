'use client'

import { useState, useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { rfqService, CreateRFQRequest, CreateRFQItemRequest } from '@/services/rfq'
import { supplierService } from '@/services/masterdata'
import type { Supplier } from '@/types/masterdata'
import Link from 'next/link'

interface RFQItem {
  id: string
  item_name: string
  description: string
  specification: string
  quantity: number
  unit: string
  target_price: number
}

export default function NewRFQPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [items, setItems] = useState<RFQItem[]>([
    {
      id: '1',
      item_name: '',
      description: '',
      specification: '',
      quantity: 1,
      unit: 'pcs',
      target_price: 0,
    },
  ])

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium' as const,
      created_by: '',
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    onSubmit: async ({ value }) => {
      setSaving(true)
      try {
        const rfqData: CreateRFQRequest = {
          title: value.title,
          description: value.description,
          priority: value.priority,
          created_by: value.created_by || 'system',
          due_date: value.due_date,
          items: items.map(({ id, ...item }): CreateRFQItemRequest => item),
          supplier_ids: selectedSuppliers,
        }
        await rfqService.createRFQ(rfqData)
        router.push('/procurement/rfq')
      } catch (error) {
        console.error('Error creating RFQ:', error)
        alert('Failed to create RFQ. Please try again.')
      } finally {
        setSaving(false)
      }
    },
  })

  useEffect(() => {
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
        target_price: 0,
      },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length === 1) return
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof RFQItem, value: string | number) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId]
    )
  }

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'RFQ', href: '/procurement/rfq' },
    { label: 'New RFQ' },
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="New Request for Quotation"
        description="Create a new RFQ to request quotes from suppliers"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/procurement/rfq">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={() => form.handleSubmit()} disabled={saving}>
              {saving ? 'Creating...' : 'Create RFQ'}
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
          {/* RFQ Details */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">RFQ Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field name="title">
                {(field) => (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">RFQ Title *</Label>
                    <Input
                      id="title"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Enter RFQ title"
                      required
                    />
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

              <form.Field name="due_date">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Response Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                    />
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
                      placeholder="Enter RFQ description and requirements"
                    />
                  </div>
                )}
              </form.Field>
            </div>
          </Card>

          {/* RFQ Items */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Items to Quote</h3>
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

                    <div className="space-y-2 md:col-span-2">
                      <Label>Specification</Label>
                      <Input
                        value={item.specification}
                        onChange={(e) => updateItem(item.id, 'specification', e.target.value)}
                        placeholder="Enter specification"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Target Price (IDR)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.target_price}
                        onChange={(e) => updateItem(item.id, 'target_price', parseFloat(e.target.value) || 0)}
                        placeholder="Optional"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-4">
                      <Label>Description</Label>
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        rows={2}
                        placeholder="Enter item description"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Supplier Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Invite Suppliers</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select suppliers to send this RFQ to. You can publish the RFQ later without selecting suppliers now.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedSuppliers.includes(supplier.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-400'
                  }`}
                  onClick={() => toggleSupplier(supplier.id)}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedSuppliers.includes(supplier.id)}
                      onCheckedChange={() => toggleSupplier(supplier.id)}
                    />
                    <div>
                      <p className="font-medium">{supplier.name}</p>
                      <p className="text-sm text-muted-foreground">{supplier.code}</p>
                      {supplier.contact_person && (
                        <p className="text-sm text-muted-foreground">{supplier.contact_person}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {suppliers.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No active suppliers found. Add suppliers in the Suppliers section first.
              </p>
            )}

            {selectedSuppliers.length > 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                {selectedSuppliers.length} supplier(s) selected
              </p>
            )}
          </Card>
        </form>
      </div>
    </TwoLevelLayout>
  )
}
