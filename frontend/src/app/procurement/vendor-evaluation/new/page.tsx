'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { vendorEvaluationService } from '@/services/procurement'
import { supplierService } from '@/services/masterdata'
import { useToast } from '@/components/ui/toast'
import type { Supplier } from '@/types/masterdata'
import type { VendorEvaluationFormData } from '@/types/procurement'
import Link from 'next/link'

export default function NewVendorEvaluationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const form = useForm({
    defaultValues: {
      supplier_id: searchParams.get('supplier') || '',
      evaluation_period_start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      evaluation_period_end: new Date().toISOString().split('T')[0],
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
      recommendation: 'approved' as const,
      action_items: '',
    },
    onSubmit: async ({ value }) => {
      // Validate dates
      const startDate = new Date(value.evaluation_period_start)
      const endDate = new Date(value.evaluation_period_end)

      if (endDate < startDate) {
        addToast({ type: 'error', title: 'End date must be on or after start date' })
        return
      }

      setSaving(true)
      try {
        await vendorEvaluationService.create(value)
        addToast({ type: 'success', title: 'Vendor evaluation created successfully' })
        router.push('/procurement/vendor-evaluation')
      } catch (error) {
        console.error('Error creating evaluation:', error)
        addToast({ type: 'error', title: 'Failed to create evaluation. Please try again.' })
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

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'Vendor Evaluation', href: '/procurement/vendor-evaluation' },
    { label: 'New Evaluation' },
  ]

  const ScoreSlider = ({
    name,
    label,
    commentsName,
    commentsLabel,
  }: {
    name: keyof VendorEvaluationFormData
    label: string
    commentsName: keyof VendorEvaluationFormData
    commentsLabel: string
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
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Poor (1)</span>
              <span>Below Avg (2)</span>
              <span>Average (3)</span>
              <span>Good (4)</span>
              <span>Excellent (5)</span>
            </div>
          </div>
        )}
      </form.Field>
      <form.Field name={commentsName}>
        {(field) => (
          <div className="mt-4">
            <Label>{commentsLabel}</Label>
            <Textarea
              value={field.state.value as string}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              rows={2}
              placeholder={`Enter comments about ${label.toLowerCase()}...`}
              className="mt-2"
            />
          </div>
        )}
      </form.Field>
    </div>
  )

  return (
    <TwoLevelLayout>
      <Header
        title="New Vendor Evaluation"
        description="Evaluate supplier performance"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/procurement/vendor-evaluation">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={() => form.handleSubmit()} disabled={saving}>
              {saving ? 'Creating...' : 'Submit Evaluation'}
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
                  <form.Field
                    name="supplier_id"
                    validators={{
                      onChange: ({ value }) => !value || value.trim().length === 0 ? 'Supplier is required' : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="supplier_id">Supplier *</Label>
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select supplier to evaluate" />
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
                    name="evaluation_period_start"
                    validators={{
                      onChange: ({ value }) => !value || value.trim().length === 0 ? 'Period start is required' : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="evaluation_period_start">Period Start *</Label>
                        <Input
                          id="evaluation_period_start"
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
                    name="evaluation_period_end"
                    validators={{
                      onChange: ({ value }) => !value || value.trim().length === 0 ? 'Period end is required' : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="evaluation_period_end">Period End *</Label>
                        <Input
                          id="evaluation_period_end"
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
                </div>
              </Card>

              {/* Scoring Criteria */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Scoring Criteria</h3>
                <div className="space-y-6">
                  <ScoreSlider
                    name="quality_score"
                    label="Quality"
                    commentsName="quality_comments"
                    commentsLabel="Quality Comments"
                  />
                  <ScoreSlider
                    name="delivery_score"
                    label="Delivery Performance"
                    commentsName="delivery_comments"
                    commentsLabel="Delivery Comments"
                  />
                  <ScoreSlider
                    name="price_score"
                    label="Price Competitiveness"
                    commentsName="price_comments"
                    commentsLabel="Price Comments"
                  />
                  <ScoreSlider
                    name="service_score"
                    label="Customer Service"
                    commentsName="service_comments"
                    commentsLabel="Service Comments"
                  />
                  <ScoreSlider
                    name="compliance_score"
                    label="Compliance"
                    commentsName="compliance_comments"
                    commentsLabel="Compliance Comments"
                  />
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
                          onValueChange={(value) => field.handleChange(value as 'approved')}
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
                          placeholder="Enter overall evaluation comments..."
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="action_items">
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="action_items">Action Items / Improvement Areas</Label>
                        <Textarea
                          id="action_items"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          rows={3}
                          placeholder="Enter any action items or areas for improvement..."
                        />
                      </div>
                    )}
                  </form.Field>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Overall Score */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Overall Score</h3>
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {calculateOverallScore()}
                  </div>
                  <p className="text-muted-foreground">out of 5.0</p>
                  <div className="mt-4">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${(parseFloat(calculateOverallScore()) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Score Breakdown */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Score Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Quality</span>
                    <span className="font-medium">{form.getFieldValue('quality_score')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-medium">{form.getFieldValue('delivery_score')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price</span>
                    <span className="font-medium">{form.getFieldValue('price_score')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service</span>
                    <span className="font-medium">{form.getFieldValue('service_score')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compliance</span>
                    <span className="font-medium">{form.getFieldValue('compliance_score')}</span>
                  </div>
                </div>
              </Card>

              {/* Scoring Guide */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Scoring Guide</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-600">5.0 - Excellent</span>
                    <span>Exceeds expectations</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">4.0 - Good</span>
                    <span>Above average</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">3.0 - Average</span>
                    <span>Meets expectations</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-600">2.0 - Below Average</span>
                    <span>Needs improvement</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">1.0 - Poor</span>
                    <span>Unacceptable</span>
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
