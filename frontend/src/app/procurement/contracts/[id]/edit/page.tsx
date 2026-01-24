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
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { contractService } from '@/services/procurement'
import { supplierService } from '@/services/masterdata'
import type { Supplier } from '@/types/masterdata'
import type { Contract, ContractFormData } from '@/types/procurement'
import Link from 'next/link'

export default function EditContractPage() {
  const params = useParams()
  const router = useRouter()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const form = useForm<ContractFormData>({
    defaultValues: {
      title: '',
      description: '',
      supplier_id: '',
      contract_type: 'supply',
      start_date: '',
      end_date: '',
      value: 0,
      currency: 'IDR',
      payment_terms: 'Net 30',
      terms_conditions: '',
      auto_renewal: false,
      renewal_period: 12,
      notice_period: 30,
    },
    onSubmit: async ({ value }) => {
      if (!contract) return
      setSaving(true)
      try {
        await contractService.update(contract.id, value)
        router.push(`/procurement/contracts/${contract.id}`)
      } catch (error) {
        console.error('Error updating contract:', error)
        alert('Failed to update contract. Please try again.')
      } finally {
        setSaving(false)
      }
    },
  })

  useEffect(() => {
    loadSuppliers()
    loadContract()
  }, [params.id])

  const loadSuppliers = async () => {
    try {
      const response = await supplierService.getAll({ status: 'active' })
      setSuppliers(response.data || [])
    } catch (error) {
      console.error('Error loading suppliers:', error)
    }
  }

  const loadContract = async () => {
    try {
      setLoading(true)
      const data = await contractService.getById(params.id as string)
      setContract(data)
      form.setFieldValue('title', data.title || '')
      form.setFieldValue('description', data.description || '')
      form.setFieldValue('supplier_id', data.supplier_id || '')
      form.setFieldValue('contract_type', data.contract_type || 'supply')
      form.setFieldValue('start_date', data.start_date?.split('T')[0] || '')
      form.setFieldValue('end_date', data.end_date?.split('T')[0] || '')
      form.setFieldValue('value', data.value || 0)
      form.setFieldValue('currency', data.currency || 'IDR')
      form.setFieldValue('payment_terms', data.payment_terms || 'Net 30')
      form.setFieldValue('terms_conditions', data.terms_conditions || '')
      form.setFieldValue('auto_renewal', data.auto_renewal || false)
      form.setFieldValue('renewal_period', data.renewal_period || 12)
      form.setFieldValue('notice_period', data.notice_period || 30)
    } catch (error) {
      console.error('Error loading contract:', error)
      setContract(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!contract) return
    if (window.confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      setDeleting(true)
      try {
        await contractService.delete(contract.id)
        router.push('/procurement/contracts')
      } catch (error) {
        console.error('Error deleting contract:', error)
        alert('Failed to delete contract. Please try again.')
      } finally {
        setDeleting(false)
      }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: form.getFieldValue('currency') || 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Loading..."
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'Contracts', href: '/procurement/contracts' },
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

  if (!contract) {
    return (
      <TwoLevelLayout>
        <Header
          title="Contract Not Found"
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'Contracts', href: '/procurement/contracts' },
            { label: 'Not Found' },
          ]}
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Contract not found</h3>
            <p className="text-muted-foreground mb-4">
              The contract you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/procurement/contracts">
              <Button variant="outline">Back to Contracts</Button>
            </Link>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Contracts', href: '/procurement/contracts' },
    { label: contract.contract_number, href: `/procurement/contracts/${contract.id}` },
    { label: 'Edit' },
  ]

  return (
    <TwoLevelLayout>
      <Header
        title={`Edit ${contract.contract_number}`}
        description="Update contract details"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/procurement/contracts/${contract.id}`}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={() => form.handleSubmit()} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
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
                  <form.Field name="title">
                    {(field) => (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="title">Contract Title *</Label>
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

                  <form.Field name="contract_type">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="contract_type">Contract Type *</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value as ContractFormData['contract_type'])}
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

                  <form.Field name="start_date">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date *</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          required
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="end_date">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date *</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          required
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

              {/* Financial Terms */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Financial Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form.Field name="value">
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
                          required
                        />
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
                            <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                            <SelectItem value="Net 15">Net 15 Days</SelectItem>
                            <SelectItem value="Net 30">Net 30 Days</SelectItem>
                            <SelectItem value="Net 45">Net 45 Days</SelectItem>
                            <SelectItem value="Net 60">Net 60 Days</SelectItem>
                            <SelectItem value="Net 90">Net 90 Days</SelectItem>
                          </SelectContent>
                        </Select>
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
                      />
                    </div>
                  )}
                </form.Field>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => form.handleSubmit()} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>

                  <Link href={`/procurement/contracts/${contract.id}`} className="w-full">
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
                    {deleting ? 'Deleting...' : 'Delete Contract'}
                  </Button>
                </div>
              </Card>

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
                        return isNaN(months) ? 'N/A' : `${months} months`
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

              {/* Contract Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contract Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contract Number</span>
                    <span className="font-medium">{contract.contract_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium capitalize">{contract.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {new Date(contract.created_at).toLocaleDateString('id-ID')}
                    </span>
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
