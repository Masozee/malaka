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
import { supplierService } from '@/services/masterdata'
import type { Supplier } from '@/types/masterdata'
import Link from 'next/link'

type SupplierFormData = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>

export default function EditSupplierPage() {
  const params = useParams()
  const router = useRouter()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const form = useForm<SupplierFormData>({
    defaultValues: {
      code: '',
      name: '',
      contact_person: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      tax_id: '',
      payment_terms: 'Net 30',
      credit_limit: 0,
      status: 'active',
    },
    onSubmit: async ({ value }) => {
      if (!supplier) return
      setSaving(true)
      try {
        await supplierService.update(supplier.id, { data: value })
        router.push(`/procurement/suppliers/${supplier.id}`)
      } catch (error) {
        console.error('Error updating supplier:', error)
        alert('Failed to update supplier. Please try again.')
      } finally {
        setSaving(false)
      }
    },
  })

  useEffect(() => {
    loadSupplier()
  }, [params.id])

  const loadSupplier = async () => {
    try {
      setLoading(true)
      const data = await supplierService.getById(params.id as string)
      setSupplier(data)
      form.setFieldValue('code', data.code || '')
      form.setFieldValue('name', data.name || '')
      form.setFieldValue('contact_person', data.contact_person || '')
      form.setFieldValue('address', data.address || '')
      form.setFieldValue('phone', data.phone || '')
      form.setFieldValue('email', data.email || '')
      form.setFieldValue('website', data.website || '')
      form.setFieldValue('tax_id', data.tax_id || '')
      form.setFieldValue('payment_terms', data.payment_terms || 'Net 30')
      form.setFieldValue('credit_limit', data.credit_limit || 0)
      form.setFieldValue('status', data.status || 'active')
    } catch (error) {
      console.error('Error loading supplier:', error)
      setSupplier(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!supplier) return
    if (window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      setDeleting(true)
      try {
        await supplierService.delete(supplier.id)
        router.push('/procurement/suppliers')
      } catch (error) {
        console.error('Error deleting supplier:', error)
        alert('Failed to delete supplier. Please try again.')
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
            { label: 'Suppliers', href: '/procurement/suppliers' },
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

  if (!supplier) {
    return (
      <TwoLevelLayout>
        <Header
          title="Supplier Not Found"
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'Suppliers', href: '/procurement/suppliers' },
            { label: 'Not Found' },
          ]}
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Supplier not found</h3>
            <p className="text-muted-foreground mb-4">
              The supplier you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/procurement/suppliers">
              <Button variant="outline">Back to Suppliers</Button>
            </Link>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Suppliers', href: '/procurement/suppliers' },
    { label: supplier.name, href: `/procurement/suppliers/${supplier.id}` },
    { label: 'Edit' },
  ]

  return (
    <TwoLevelLayout>
      <Header
        title={`Edit ${supplier.name}`}
        description={`${supplier.code} - Update supplier information`}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/procurement/suppliers/${supplier.id}`}>
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
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
            >
              {/* Basic Information */}
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form.Field name="code">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="code">Supplier Code *</Label>
                        <Input
                          id="code"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          required
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="name">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="name">Supplier Name *</Label>
                        <Input
                          id="name"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          required
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="contact_person">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="contact_person">Contact Person</Label>
                        <Input
                          id="contact_person"
                          value={field.state.value || ''}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="status">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value as 'active' | 'inactive')}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>
                </div>
              </Card>

              {/* Contact Information */}
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form.Field name="email">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={field.state.value || ''}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="phone">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={field.state.value || ''}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="website">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={field.state.value || ''}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="tax_id">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="tax_id">Tax ID (NPWP)</Label>
                        <Input
                          id="tax_id"
                          value={field.state.value || ''}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="address">
                    {(field) => (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={field.state.value || ''}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          rows={3}
                        />
                      </div>
                    )}
                  </form.Field>
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form.Field name="payment_terms">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="payment_terms">Payment Terms</Label>
                        <Select
                          value={field.state.value || 'Net 30'}
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

                  <form.Field name="credit_limit">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="credit_limit">Credit Limit (IDR)</Label>
                        <Input
                          id="credit_limit"
                          type="number"
                          value={field.state.value || 0}
                          onChange={(e) => field.handleChange(Number(e.target.value))}
                          onBlur={field.handleBlur}
                        />
                      </div>
                    )}
                  </form.Field>
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

                <Link href={`/procurement/suppliers/${supplier.id}`} className="w-full">
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
                  {deleting ? 'Deleting...' : 'Delete Supplier'}
                </Button>
              </div>
            </Card>

            {/* Supplier Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Supplier Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supplier ID</span>
                  <span className="font-medium font-mono text-xs">{supplier.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {new Date(supplier.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">
                    {new Date(supplier.updated_at).toLocaleDateString('id-ID')}
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
