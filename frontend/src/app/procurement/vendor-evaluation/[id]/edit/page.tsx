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
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { vendorEvaluationService } from '@/services/procurement'
import { supplierService } from '@/services/masterdata'
import type { Supplier } from '@/types/masterdata'
import type { VendorEvaluation, VendorEvaluationFormData } from '@/types/procurement'
import Link from 'next/link'

export default function EditVendorEvaluationPage() {
  const params = useParams()
  const router = useRouter()
  const [evaluation, setEvaluation] = useState<VendorEvaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const form = useForm<VendorEvaluationFormData>({
    defaultValues: {
      supplier_id: '',
      evaluation_period_start: '',
      evaluation_period_end: '',
      quality_score: 3,
      delivery_score: 3,
      price_score: 3,
      service_score: 3,
      compliance_score: 3,
      quality_comments: '',
      delivery_comments: '',
      price_comments: '',
      service_comments: '',
      compliance_comments: '',
      overall_comments: '',
      recommendation: 'approved',
      action_items: '',
    },
    onSubmit: async ({ value }) => {
      if (!evaluation) return
      setSaving(true)
      try {
        await vendorEvaluationService.update(evaluation.id, value)
        router.push(`/procurement/vendor-evaluation/${evaluation.id}`)
      } catch (error) {
        console.error('Error updating evaluation:', error)
        alert('Failed to update evaluation. Please try again.')
      } finally {
        setSaving(false)
      }
    },
  })

  useEffect(() => {
    loadSuppliers()
    loadEvaluation()
  }, [params.id])

  const loadSuppliers = async () => {
    try {
      const response = await supplierService.getAll({ status: 'active' })
      setSuppliers(response.data || [])
    } catch (error) {
      console.error('Error loading suppliers:', error)
    }
  }

  const loadEvaluation = async () => {
    try {
      setLoading(true)
      const data = await vendorEvaluationService.getById(params.id as string)
      setEvaluation(data)
      form.setFieldValue('supplier_id', data.supplier_id || '')
      form.setFieldValue('evaluation_period_start', data.evaluation_period_start?.split('T')[0] || '')
      form.setFieldValue('evaluation_period_end', data.evaluation_period_end?.split('T')[0] || '')
      form.setFieldValue('quality_score', data.quality_score || 3)
      form.setFieldValue('delivery_score', data.delivery_score || 3)
      form.setFieldValue('price_score', data.price_score || 3)
      form.setFieldValue('service_score', data.service_score || 3)
      form.setFieldValue('compliance_score', data.compliance_score || 3)
      form.setFieldValue('quality_comments', data.quality_comments || '')
      form.setFieldValue('delivery_comments', data.delivery_comments || '')
      form.setFieldValue('price_comments', data.price_comments || '')
      form.setFieldValue('service_comments', data.service_comments || '')
      form.setFieldValue('compliance_comments', data.compliance_comments || '')
      form.setFieldValue('overall_comments', data.overall_comments || '')
      form.setFieldValue('recommendation', data.recommendation || 'approved')
      form.setFieldValue('action_items', data.action_items || '')
    } catch (error) {
      console.error('Error loading evaluation:', error)
      setEvaluation(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!evaluation) return
    if (window.confirm('Are you sure you want to delete this evaluation? This action cannot be undone.')) {
      setDeleting(true)
      try {
        await vendorEvaluationService.delete(evaluation.id)
        router.push('/procurement/vendor-evaluation')
      } catch (error) {
        console.error('Error deleting evaluation:', error)
        alert('Failed to delete evaluation. Please try again.')
      } finally {
        setDeleting(false)
      }
    }
  }

  const calculateOverallScore = () => {
    const scores = [
      form.getFieldValue('quality_score'),
      form.getFieldValue('delivery_score'),
      form.getFieldValue('price_score'),
      form.getFieldValue('service_score'),
      form.getFieldValue('compliance_score'),
    ]
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
  }

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Loading..."
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'Vendor Evaluation', href: '/procurement/vendor-evaluation' },
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

  if (!evaluation) {
    return (
      <TwoLevelLayout>
        <Header
          title="Evaluation Not Found"
          breadcrumbs={[
            { label: 'Procurement', href: '/procurement' },
            { label: 'Vendor Evaluation', href: '/procurement/vendor-evaluation' },
            { label: 'Not Found' },
          ]}
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Evaluation not found</h3>
            <p className="text-muted-foreground mb-4">
              The evaluation you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/procurement/vendor-evaluation">
              <Button variant="outline">Back to Evaluations</Button>
            </Link>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Vendor Evaluation', href: '/procurement/vendor-evaluation' },
    { label: evaluation.evaluation_number, href: `/procurement/vendor-evaluation/${evaluation.id}` },
    { label: 'Edit' },
  ]

  const ScoreSlider = ({
    name,
    label,
    commentsName,
  }: {
    name: keyof VendorEvaluationFormData
    label: string
    commentsName: keyof VendorEvaluationFormData
  }) => (
    <div className="border rounded-lg p-4">
      <form.Field name={name}>
        {(field) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{label}</Label>
              <span className="text-2xl font-bold">{field.state.value}</span>
            </div>
            <Slider
              value={[field.state.value as number]}
              onValueChange={([value]) => field.handleChange(value)}
              min={1}
              max={5}
              step={0.5}
              className="w-full"
            />
          </div>
        )}
      </form.Field>
      <form.Field name={commentsName}>
        {(field) => (
          <div className="mt-4">
            <Textarea
              value={field.state.value as string}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              rows={2}
              placeholder="Comments..."
            />
          </div>
        )}
      </form.Field>
    </div>
  )

  return (
    <TwoLevelLayout>
      <Header
        title={`Edit ${evaluation.evaluation_number}`}
        description="Update vendor evaluation"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/procurement/vendor-evaluation/${evaluation.id}`}>
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
              {/* Evaluation Details */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Evaluation Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form.Field name="supplier_id">
                    {(field) => (
                      <div className="space-y-2 md:col-span-2">
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

                  <form.Field name="evaluation_period_start">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="evaluation_period_start">Period Start *</Label>
                        <Input
                          id="evaluation_period_start"
                          type="date"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          required
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="evaluation_period_end">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="evaluation_period_end">Period End *</Label>
                        <Input
                          id="evaluation_period_end"
                          type="date"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          required
                        />
                      </div>
                    )}
                  </form.Field>
                </div>
              </Card>

              {/* Scoring Criteria */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Scoring Criteria</h3>
                <div className="space-y-4">
                  <ScoreSlider name="quality_score" label="Quality" commentsName="quality_comments" />
                  <ScoreSlider name="delivery_score" label="Delivery Performance" commentsName="delivery_comments" />
                  <ScoreSlider name="price_score" label="Price Competitiveness" commentsName="price_comments" />
                  <ScoreSlider name="service_score" label="Customer Service" commentsName="service_comments" />
                  <ScoreSlider name="compliance_score" label="Compliance" commentsName="compliance_comments" />
                </div>
              </Card>

              {/* Recommendation */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recommendation</h3>
                <div className="space-y-4">
                  <form.Field name="recommendation">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="recommendation">Overall Recommendation *</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value as VendorEvaluationFormData['recommendation'])}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="preferred">Preferred Supplier</SelectItem>
                            <SelectItem value="approved">Approved Supplier</SelectItem>
                            <SelectItem value="conditional">Conditional Approval</SelectItem>
                            <SelectItem value="not_recommended">Not Recommended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="overall_comments">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="overall_comments">Overall Comments</Label>
                        <Textarea
                          id="overall_comments"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          rows={4}
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="action_items">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="action_items">Action Items</Label>
                        <Textarea
                          id="action_items"
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

                  <Link href={`/procurement/vendor-evaluation/${evaluation.id}`} className="w-full">
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
                    {deleting ? 'Deleting...' : 'Delete Evaluation'}
                  </Button>
                </div>
              </Card>

              {/* Overall Score */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Overall Score</h3>
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {calculateOverallScore()}
                  </div>
                  <p className="text-muted-foreground">out of 5.0</p>
                </div>
              </Card>

              {/* Evaluation Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Evaluation Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Evaluation Number</span>
                    <span className="font-medium">{evaluation.evaluation_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium capitalize">{evaluation.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {new Date(evaluation.created_at).toLocaleDateString('id-ID')}
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
