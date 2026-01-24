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
import { supplierService } from '@/services/masterdata'
import type { Supplier } from '@/types/masterdata'
import Link from 'next/link'

type SupplierFormData = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>

export default function NewSupplierPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

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
      setSaving(true)
      try {
        await supplierService.create({ data: value })
        router.push('/procurement/suppliers')
      } catch (error) {
        console.error('Error creating supplier:', error)
        alert('Failed to create supplier. Please try again.')
      } finally {
        setSaving(false)
      }
    },
  })

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Suppliers', href: '/procurement/suppliers' },
    { label: 'New Supplier' },
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="New Supplier"
        description="Add a new supplier to the system"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/procurement/suppliers">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              onClick={() => form.handleSubmit()}
              disabled={saving}
            >
              {saving ? 'Creating...' : 'Create Supplier'}
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
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
                      placeholder="SUP-001"
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
                      placeholder="Enter supplier name"
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
                      placeholder="Enter contact person name"
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
                        <SelectValue placeholder="Select status" />
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
                      placeholder="supplier@example.com"
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
                      placeholder="081234567890"
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
                      placeholder="https://www.example.com"
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
                      placeholder="Enter tax ID"
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
                      placeholder="Enter complete address"
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
                        <SelectValue placeholder="Select payment terms" />
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
                      placeholder="0"
                    />
                  </div>
                )}
              </form.Field>
            </div>
          </Card>
        </form>
      </div>
    </TwoLevelLayout>
  )
}
