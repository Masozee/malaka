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
import { purchaseRequestService } from '@/services/procurement'
import type { PurchaseRequest, PurchaseRequestFormData } from '@/types/procurement'
import Link from 'next/link'
import { useToast } from '@/components/ui/toast'

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

export default function EditPurchaseRequestPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const [request, setRequest] = useState<PurchaseRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [items, setItems] = useState<RequestItem[]>([])

  const form = useForm<Omit<PurchaseRequestFormData, 'items'>>({
    defaultValues: {
      title: '',
      description: '',
      department: '',
      priority: 'medium',
      required_date: '',
      notes: '',
    },
    onSubmit: async ({ value }) => {
      if (!request) return
      setSaving(true)
      try {
        const formData: PurchaseRequestFormData = {
          ...value,
          items: items.map(({ id, ...item }) => item),
        }
        await purchaseRequestService.update(request.id, formData)
        router.push(`/procurement/purchase-requests/${request.id}`)
      } catch (error) {
        console.error('Error updating purchase request:', error)
        alert('Failed to update purchase request. Please try again.')
      } finally {
        setSaving(false)
      }
    },
  })

  useEffect(() => {
    loadRequest()
  }, [params.id])

  const loadRequest = async () => {
    try {
      setLoading(true)
      const data = await purchaseRequestService.getById(params.id as string)

      // Status guard: Only draft requests can be edited
      if (data.status !== 'draft') {
        addToast({ type: 'error', title: 'Only draft requests can be edited' })
        router.replace(`/procurement/purchase-requests/${params.id}`)
        return
      }

      setRequest(data)
      form.setFieldValue('title', data.title || '')
      form.setFieldValue('description', data.description || '')
      form.setFieldValue('department', data.department || '')
      form.setFieldValue('priority', data.priority || 'medium')
      form.setFieldValue('required_date', data.required_date?.split('T')[0] || '')
      form.setFieldValue('notes', data.notes || '')
      setItems(
        data.items?.map((item) => ({
          id: item.id,
          item_name: item.item_name,
          description: item.description || '',
          specification: item.specification || '',
          quantity: item.quantity,
          unit: item.unit,
          estimated_price: item.estimated_price,
          currency: item.currency,
        })) || []
      )
    } catch (error) {
      console.error('Error loading purchase request:', error)
      setRequest(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!request) return
    if (window.confirm('Are you sure you want to delete this purchase request? This action cannot be undone.')) {
      setDeleting(true)
      try {
        await purchaseRequestService.delete(request.id)
        router.push('/procurement/purchase-requests')
      } catch (error) {
        console.error('Error deleting purchase request:', error)
        alert('Failed to delete purchase request. Please try again.')
      } finally {
        setDeleting(false)
      }
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
        estimated_price: 0,
        currency: 'IDR',
      },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length === 1) return
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof RequestItem, value: string | number) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.estimated_price, 0)

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Loading..."
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'Purchase Requests', href: '/procurement/purchase-requests' },
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

  if (!request) {
    return (
      <TwoLevelLayout>
        <Header
          title="Request Not Found"
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'Purchase Requests', href: '/procurement/purchase-requests' },
            { label: 'Not Found' },
          ]}
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Purchase request not found</h3>
            <p className="text-muted-foreground mb-4">
              The purchase request you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/procurement/purchase-requests">
              <Button variant="outline">Back to Purchase Requests</Button>
            </Link>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Purchase Requests', href: '/procurement/purchase-requests' },
    { label: request.request_number, href: `/procurement/purchase-requests/${request.id}` },
    { label: 'Edit' },
  ]

  return (
    <TwoLevelLayout>
      <Header
        title={`Edit ${request.request_number}`}
        description="Update purchase request details"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/procurement/purchase-requests/${request.id}`}>
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
              {/* Request Details */}
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Request Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form.Field name="title">
                    {(field) => (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="title">Request Title *</Label>
                        <Input
                          id="title"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          required
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="department">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="department">Department *</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
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

                  <form.Field name="required_date">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="required_date">Required Date</Label>
                        <Input
                          id="required_date"
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
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Estimated Price (IDR)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={item.estimated_price}
                            onChange={(e) => updateItem(item.id, 'estimated_price', parseFloat(e.target.value) || 0)}
                          />
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

                <Link href={`/procurement/purchase-requests/${request.id}`} className="w-full">
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
                  {deleting ? 'Deleting...' : 'Delete Request'}
                </Button>
              </div>
            </Card>

            {/* Request Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Request Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Request Number</span>
                  <span className="font-medium">{request.request_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{request.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(request.created_at).toLocaleDateString('id-ID')}
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
