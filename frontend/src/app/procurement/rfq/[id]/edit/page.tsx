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
import { rfqService, RFQ, UpdateRFQRequest } from '@/services/rfq'
import Link from 'next/link'

export default function EditRFQPage() {
  const params = useParams()
  const router = useRouter()
  const [rfq, setRfq] = useState<RFQ | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium' as const,
      due_date: '',
    },
    onSubmit: async ({ value }) => {
      if (!rfq) return
      setSaving(true)
      try {
        const updateData: UpdateRFQRequest = {
          title: value.title,
          description: value.description,
          priority: value.priority,
          due_date: value.due_date,
        }
        await rfqService.updateRFQ(rfq.id, updateData)
        router.push(`/procurement/rfq/${rfq.id}`)
      } catch (error) {
        console.error('Error updating RFQ:', error)
        alert('Failed to update RFQ. Please try again.')
      } finally {
        setSaving(false)
      }
    },
  })

  useEffect(() => {
    loadRFQ()
  }, [params.id])

  const loadRFQ = async () => {
    try {
      setLoading(true)
      const data = await rfqService.getRFQById(params.id as string)
      setRfq(data)
      form.setFieldValue('title', data.title || '')
      form.setFieldValue('description', data.description || '')
      form.setFieldValue('priority', data.priority || 'medium')
      form.setFieldValue('due_date', data.due_date?.split('T')[0] || '')
    } catch (error) {
      console.error('Error loading RFQ:', error)
      setRfq(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!rfq) return
    if (window.confirm('Are you sure you want to delete this RFQ? This action cannot be undone.')) {
      setDeleting(true)
      try {
        await rfqService.deleteRFQ(rfq.id)
        router.push('/procurement/rfq')
      } catch (error) {
        console.error('Error deleting RFQ:', error)
        alert('Failed to delete RFQ. Please try again.')
      } finally {
        setDeleting(false)
      }
    }
  }

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Loading..."
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'RFQ', href: '/procurement/rfq' },
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

  if (!rfq) {
    return (
      <TwoLevelLayout>
        <Header
          title="RFQ Not Found"
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'RFQ', href: '/procurement/rfq' },
            { label: 'Not Found' },
          ]}
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">RFQ not found</h3>
            <p className="text-muted-foreground mb-4">
              The RFQ you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/procurement/rfq">
              <Button variant="outline">Back to RFQ List</Button>
            </Link>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'RFQ', href: '/procurement/rfq' },
    { label: rfq.rfq_number, href: `/procurement/rfq/${rfq.id}` },
    { label: 'Edit' },
  ]

  return (
    <TwoLevelLayout>
      <Header
        title={`Edit ${rfq.rfq_number}`}
        description="Update RFQ details"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/procurement/rfq/${rfq.id}`}>
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
                        />
                      </div>
                    )}
                  </form.Field>
                </div>
              </Card>

              {/* Current Items (Read-only) */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Current Items</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Items cannot be edited after creation. To change items, delete this RFQ and create a new one.
                </p>
                <div className="space-y-4">
                  {rfq.items?.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{item.item_name}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        {item.target_price > 0 && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Target Price</p>
                            <p className="font-medium">
                              {rfqService.formatCurrency(item.target_price)}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantity:</span> {item.quantity} {item.unit}
                        </div>
                        {item.specification && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Spec:</span> {item.specification}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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

                <Link href={`/procurement/rfq/${rfq.id}`} className="w-full">
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
                  {deleting ? 'Deleting...' : 'Delete RFQ'}
                </Button>
              </div>
            </Card>

            {/* RFQ Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">RFQ Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RFQ Number</span>
                  <span className="font-medium">{rfq.rfq_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium capitalize">{rfq.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created By</span>
                  <span className="font-medium">{rfq.created_by}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {rfqService.formatDate(rfq.created_at)}
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
