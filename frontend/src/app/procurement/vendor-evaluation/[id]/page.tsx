'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { vendorEvaluationService } from '@/services/procurement'
import type { VendorEvaluation } from '@/types/procurement'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  completed: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
}

export default function VendorEvaluationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [evaluation, setEvaluation] = useState<VendorEvaluation | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadEvaluation()
  }, [params.id])

  const loadEvaluation = async () => {
    try {
      setLoading(true)
      const data = await vendorEvaluationService.getById(params.id as string)
      setEvaluation(data)
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
      try {
        await vendorEvaluationService.delete(evaluation.id)
        router.push('/procurement/vendor-evaluation')
      } catch (error) {
        console.error('Error deleting evaluation:', error)
        alert('Failed to delete evaluation. Please try again.')
      }
    }
  }

  const handleComplete = async () => {
    if (!evaluation) return
    try {
      await vendorEvaluationService.complete(evaluation.id)
      loadEvaluation()
    } catch (error) {
      console.error('Error completing evaluation:', error)
      alert('Failed to complete evaluation. Please try again.')
    }
  }

  const handleApprove = async () => {
    if (!evaluation) return
    try {
      await vendorEvaluationService.approve(evaluation.id)
      loadEvaluation()
    } catch (error) {
      console.error('Error approving evaluation:', error)
      alert('Failed to approve evaluation. Please try again.')
    }
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
    { label: evaluation.evaluation_number },
  ]

  const ScoreCard = ({ label, score, comments }: { label: string; score: number; comments?: string }) => (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{label}</span>
        <span className={`text-2xl font-bold ${vendorEvaluationService.getScoreColor(score).split(' ')[0]}`}>
          {score.toFixed(1)}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-blue-500' : score >= 2 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      {comments && <p className="text-sm text-muted-foreground">{comments}</p>}
    </div>
  )

  return (
    <TwoLevelLayout>
      <Header
        title={evaluation.supplier_name || 'Vendor Evaluation'}
        description={evaluation.evaluation_number}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            {evaluation.status === 'draft' && (
              <>
                <Button variant="outline" onClick={handleComplete}>
                  Mark Complete
                </Button>
                <Link href={`/procurement/vendor-evaluation/${evaluation.id}/edit`}>
                  <Button>Edit Evaluation</Button>
                </Link>
              </>
            )}
            {evaluation.status === 'completed' && (
              <Button onClick={handleApprove}>Approve Evaluation</Button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge className={statusColors[evaluation.status]}>
              {evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1)}
            </Badge>
          </Card>

          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
            <p className="text-lg font-semibold">{evaluation.overall_score.toFixed(1)} / 5.0</p>
          </Card>

          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Recommendation</p>
            <Badge className={vendorEvaluationService.getRecommendationColor(evaluation.recommendation)}>
              {evaluation.recommendation.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Badge>
          </Card>

          <Card className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Evaluation Period</p>
            <p className="text-sm font-semibold">
              {mounted ? new Date(evaluation.evaluation_period_start).toLocaleDateString('id-ID') : ''} -{' '}
              {mounted ? new Date(evaluation.evaluation_period_end).toLocaleDateString('id-ID') : ''}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Evaluation Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Evaluation Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Evaluation Number</p>
                  <p className="font-medium">{evaluation.evaluation_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium">{evaluation.supplier_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Evaluator</p>
                  <p className="font-medium">{evaluation.evaluator_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Evaluation Date</p>
                  <p className="font-medium">
                    {mounted ? new Date(evaluation.created_at).toLocaleDateString('id-ID') : ''}
                  </p>
                </div>
              </div>
            </Card>

            {/* Scores */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Scores</h3>
              <div className="space-y-4">
                <ScoreCard
                  label="Quality"
                  score={evaluation.quality_score}
                  comments={evaluation.quality_comments}
                />
                <ScoreCard
                  label="Delivery Performance"
                  score={evaluation.delivery_score}
                  comments={evaluation.delivery_comments}
                />
                <ScoreCard
                  label="Price Competitiveness"
                  score={evaluation.price_score}
                  comments={evaluation.price_comments}
                />
                <ScoreCard
                  label="Customer Service"
                  score={evaluation.service_score}
                  comments={evaluation.service_comments}
                />
                <ScoreCard
                  label="Compliance"
                  score={evaluation.compliance_score}
                  comments={evaluation.compliance_comments}
                />
              </div>
            </Card>

            {/* Overall Comments */}
            {evaluation.overall_comments && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Overall Comments</h3>
                <p className="text-muted-foreground">{evaluation.overall_comments}</p>
              </Card>
            )}

            {/* Action Items */}
            {evaluation.action_items && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Action Items / Improvement Areas</h3>
                <p className="text-muted-foreground">{evaluation.action_items}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {evaluation.status === 'draft' && (
                  <Link href={`/procurement/vendor-evaluation/${evaluation.id}/edit`} className="w-full">
                    <Button variant="outline" className="w-full justify-start">
                      Edit Evaluation
                    </Button>
                  </Link>
                )}

                <Button variant="outline" className="w-full justify-start">
                  Export PDF
                </Button>

                <Link href={`/procurement/suppliers/${evaluation.supplier_id}`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    View Supplier
                  </Button>
                </Link>

                <Separator className="my-3" />

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={evaluation.status === 'approved'}
                >
                  Delete Evaluation
                </Button>
              </div>
            </Card>

            {/* Overall Score Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Score Summary</h3>
              <div className="text-center mb-4">
                <div className={`text-5xl font-bold ${
                  evaluation.overall_score >= 4 ? 'text-green-600' :
                  evaluation.overall_score >= 3 ? 'text-blue-600' :
                  evaluation.overall_score >= 2 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {evaluation.overall_score.toFixed(1)}
                </div>
                <p className="text-muted-foreground">out of 5.0</p>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    evaluation.overall_score >= 4 ? 'bg-green-500' :
                    evaluation.overall_score >= 3 ? 'bg-blue-500' :
                    evaluation.overall_score >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(evaluation.overall_score / 5) * 100}%` }}
                />
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Timeline</h3>
              <div className="space-y-4">
                {evaluation.status === 'approved' && (
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Approved</p>
                      <p className="text-xs text-muted-foreground">
                        {mounted ? new Date(evaluation.updated_at).toLocaleDateString('id-ID') : ''}
                      </p>
                    </div>
                  </div>
                )}
                {['completed', 'approved'].includes(evaluation.status) && (
                  <div className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Completed</p>
                      <p className="text-xs text-muted-foreground">
                        Evaluation submitted
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-gray-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {mounted ? new Date(evaluation.created_at).toLocaleDateString('id-ID') : ''}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
