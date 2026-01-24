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
import { Switch } from '@/components/ui/switch'
import { contractService } from '@/services/procurement'
import { supplierService } from '@/services/masterdata'
import { useToast } from '@/components/ui/toast'
import type { Supplier } from '@/types/masterdata'
import type { ContractFormData } from '@/types/procurement'
import Link from 'next/link'

export default function NewContractPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      supplier_id: '',
      contract_type: 'supply' as const,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 0,
      currency: 'IDR',
      payment_terms: 'Net 30',
      terms_conditions: '',
      auto_renewal: false,
      renewal_period: 12,
      notice_period: 30,
    },
    onSubmit: async ({ value }) => {
      // Validate dates
      const startDate = new Date(value.start_date)
      const endDate = new Date(value.end_date)

      if (endDate <= startDate) {
        addToast({ type: 'error', title: 'End date must be after start date' })
        return
      }

      setSaving(true)
      try {
        await contractService.create(value)
        addToast({ type: 'success', title: 'Contract created successfully' })
        router.push('/procurement/contracts')
      } catch (error) {
        console.error('Error creating contract:', error)
        addToast({ type: 'error', title: 'Failed to create contract. Please try again.' })
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: form.getFieldValue('currency') || 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Contracts', href: '/procurement/contracts' },
    { label: 'New Contract' },
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="New Contract"
        description="Create a new supplier contract"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/procurement/contracts">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={() => form.handleSubmit()} disabled={saving}>
              {saving ? 'Creating...' : 'Create Contract'}
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contract Details */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contract Details</h3>
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
                        <Label htmlFor="title">Contract Title *</Label>
                        <Input
                          id="title"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="Enter contract title"
                          className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="supplier_id"
                    validators={{
                      onChange: ({ value }) => !value || value.trim().length === 0 ? 'Supplier is required' : undefined,
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

                  <form.Field name="contract_type">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="contract_type">Contract Type *</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value as 'supply')}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="supply">Supply Agreement</SelectItem>
                            <SelectItem value="service">Service Contract</SelectItem>
                            <SelectItem value="framework">Framework Agreement</SelectItem>
                            <SelectItem value="one-time">One-Time Purchase</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="start_date"
                    validators={{
                      onChange: ({ value }) => !value || value.trim().length === 0 ? 'Start date is required' : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date *</Label>
                        <Input
                          id="start_date"
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

                  <form.Field
                    name="end_date"
                    validators={{
                      onChange: ({ value }) => !value || value.trim().length === 0 ? 'End date is required' : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date *</Label>
                        <Input
                          id="end_date"
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
                          placeholder="Enter contract description..."
                        />
                      </div>
                    )}
                  </form.Field>
                </div>
              </Card>

              {/* Financial Terms */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Financial Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form.Field
                    name="value"
                    validators={{
                      onChange: ({ value }) => value < 0 ? 'Value must be 0 or greater' : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="value">Contract Value *</Label>
                        <Input
                          id="value"
                          type="number"
                          min={0}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                          onBlur={field.handleBlur}
                          className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                        )}
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="currency">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency *</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>

                  <form.Field
                    name="payment_terms"
                    validators={{
                      onChange: ({ value }) => !value || value.trim().length === 0 ? 'Payment terms are required' : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="payment_terms">Payment Terms *</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                            <SelectItem value="Net 15">Net 15 Days</SelectItem>
                            <SelectItem value="Net 30">Net 30 Days</SelectItem>
                            <SelectItem value="Net 45">Net 45 Days</SelectItem>
                            <SelectItem value="Net 60">Net 60 Days</SelectItem>
                            <SelectItem value="Net 90">Net 90 Days</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-red-500">{field.state.meta.errors[0]}</p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>
              </Card>

              {/* Renewal Settings */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Renewal Settings</h3>
                <div className="space-y-4">
                  <form.Field name="auto_renewal">
                    {(field) => (
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto Renewal</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically renew this contract when it expires
                          </p>
                        </div>
                        <Switch
                          checked={field.state.value}
                          onCheckedChange={(checked) => field.handleChange(checked)}
                        />
                      </div>
                    )}
                  </form.Field>

                  {form.getFieldValue('auto_renewal') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <form.Field name="renewal_period">
                        {(field) => (
                          <div className="space-y-2">
                            <Label htmlFor="renewal_period">Renewal Period (months)</Label>
                            <Input
                              id="renewal_period"
                              type="number"
                              min={1}
                              value={field.state.value}
                              onChange={(e) => field.handleChange(parseInt(e.target.value) || 1)}
                              onBlur={field.handleBlur}
                            />
                          </div>
                        )}
                      </form.Field>

                      <form.Field name="notice_period">
                        {(field) => (
                          <div className="space-y-2">
                            <Label htmlFor="notice_period">Notice Period (days)</Label>
                            <Input
                              id="notice_period"
                              type="number"
                              min={0}
                              value={field.state.value}
                              onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                              onBlur={field.handleBlur}
                            />
                          </div>
                        )}
                      </form.Field>
                    </div>
                  )}
                </div>
              </Card>

              {/* Terms and Conditions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Terms and Conditions</h3>
                <form.Field name="terms_conditions">
                  {(field) => (
                    <div className="space-y-2">
                      <Textarea
                        id="terms_conditions"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        rows={8}
                        placeholder="Enter the terms and conditions of this contract..."
                      />
                    </div>
                  )}
                </form.Field>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contract Summary */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contract Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">{form.getFieldValue('contract_type').replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">
                      {(() => {
                        const start = new Date(form.getFieldValue('start_date'))
                        const end = new Date(form.getFieldValue('end_date'))
                        const months = Math.round((end.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000))
                        return `${months} months`
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Value</span>
                    <span className="font-medium">{formatCurrency(form.getFieldValue('value'))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auto Renewal</span>
                    <span className="font-medium">{form.getFieldValue('auto_renewal') ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </Card>

              {/* Contract Types Guide */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contract Type Guide</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-blue-600">Supply Agreement</span>
                    <p className="text-muted-foreground">Long-term material supply</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-600">Service Contract</span>
                    <p className="text-muted-foreground">Ongoing service provision</p>
                  </div>
                  <div>
                    <span className="font-medium text-purple-600">Framework Agreement</span>
                    <p className="text-muted-foreground">Pre-negotiated terms for future orders</p>
                  </div>
                  <div>
                    <span className="font-medium text-orange-600">One-Time Purchase</span>
                    <p className="text-muted-foreground">Single transaction contract</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </TwoLevelLayout>
  )
}
