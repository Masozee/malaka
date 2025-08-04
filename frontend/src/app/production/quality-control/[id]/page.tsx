'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Edit, 
  FileText, 
  AlertTriangle, 
  XCircle, 
  Eye,
  Calendar,
  User,
  Package,
  BarChart3,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { mockQualityControls } from '@/services/production'
import type { QualityControl, QualityTest, QualityDefect, QualityAction } from '@/types/production'
import { useParams } from 'next/navigation'

export default function QualityControlDetailsPage() {
  const [mounted, setMounted] = useState(false)
  const params = useParams()
  const qcId = params.id as string

  useEffect(() => {
    setMounted(true)
  }, [])

  // Find the quality control (in real app, this would be an API call)
  const qualityControl = mockQualityControls.find(qc => qc.id === qcId)

  if (!qualityControl) {
    return (
      <TwoLevelLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Quality Control Not Found</h2>
            <p className="text-muted-foreground mt-2">The requested quality control inspection could not be found.</p>
            <Button asChild className="mt-4">
              <Link href="/production/quality-control">Back to Quality Control</Link>
            </Button>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Production', href: '/production' },
    { label: 'Quality Control', href: '/production/quality-control' },
    { label: qualityControl.qcNumber, href: `/production/quality-control/${qualityControl.id}` }
  ]

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const formatDateTime = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleString('id-ID')
  }

  const getStatusBadge = (status: QualityControl['status']) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: Clock },
      testing: { variant: 'default' as const, label: 'Testing', icon: BarChart3 },
      passed: { variant: 'default' as const, label: 'Passed', icon: CheckCircle },
      failed: { variant: 'destructive' as const, label: 'Failed', icon: XCircle },
      conditional: { variant: 'outline' as const, label: 'Conditional', icon: AlertTriangle }
    }
    return statusConfig[status] || { variant: 'secondary' as const, label: status, icon: Clock }
  }

  const getTestResultBadge = (result: string) => {
    const resultConfig = {
      pass: { variant: 'default' as const, label: 'Pass', color: 'text-green-600' },
      fail: { variant: 'destructive' as const, label: 'Fail', color: 'text-red-600' },
      marginal: { variant: 'outline' as const, label: 'Marginal', color: 'text-yellow-600' }
    }
    return resultConfig[result as keyof typeof resultConfig] || { variant: 'secondary' as const, label: result, color: 'text-muted-foreground' }
  }

  const getDefectSeverityBadge = (severity: string) => {
    const severityConfig = {
      minor: { variant: 'secondary' as const, label: 'Minor' },
      major: { variant: 'outline' as const, label: 'Major' },
      critical: { variant: 'destructive' as const, label: 'Critical' }
    }
    return severityConfig[severity as keyof typeof severityConfig] || { variant: 'secondary' as const, label: severity }
  }

  const getActionStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      in_progress: { variant: 'default' as const, label: 'In Progress' },
      completed: { variant: 'default' as const, label: 'Completed' }
    }
    return statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status }
  }

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title={qualityControl.qcNumber}
          description={`${qualityControl.type} quality control for ${qualityControl.productName}`}
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Print Report
              </Button>
              {qualityControl.status === 'testing' && (
                <Button variant="outline" size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Testing
                </Button>
              )}
              <Button size="sm" asChild>
                <Link href={`/production/quality-control/${qualityControl.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Inspection Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">QC Number</label>
                    <p className="font-medium">{qualityControl.qcNumber}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="font-medium capitalize">{qualityControl.type}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Product</label>
                    <p className="font-medium">{qualityControl.productName}</p>
                    <p className="text-sm text-muted-foreground">{qualityControl.productCode}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Batch Number</label>
                    <p className="font-medium">{qualityControl.batchNumber}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge {...getStatusBadge(qualityControl.status)} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Reference</label>
                    <p className="font-medium">{qualityControl.referenceNumber}</p>
                    <p className="text-sm text-muted-foreground capitalize">{qualityControl.referenceType.replace('_', ' ')}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Test Date</label>
                    <p className="font-medium">{formatDate(qualityControl.testDate)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Inspector</label>
                    <p className="font-medium">{qualityControl.inspector}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Test Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Test Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{qualityControl.quantityTested}</div>
                  <div className="text-sm text-muted-foreground">Quantity Tested</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{qualityControl.sampleSize}</div>
                  <div className="text-sm text-muted-foreground">Sample Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {qualityControl.overallScore > 0 ? qualityControl.overallScore.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
              </div>
              
              {qualityControl.overallScore > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Quality Score</span>
                    <span>{(qualityControl.overallScore * 10).toFixed(0)}%</span>
                  </div>
                  <Progress value={qualityControl.overallScore * 10} className="h-3" />
                </div>
              )}
            </Card>

            {/* Test Results */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Test Results</h3>
              
              <div className="space-y-4">
                {qualityControl.tests.map((test) => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{test.testName}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{test.testType} test</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge {...getTestResultBadge(test.result)} />
                        <span className="font-medium">{test.score}/10</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="text-muted-foreground">Specification</label>
                        <p className="font-medium">{test.specification}</p>
                      </div>
                      <div>
                        <label className="text-muted-foreground">Actual Value</label>
                        <p className="font-medium">{test.actualValue}</p>
                      </div>
                    </div>
                    
                    {test.notes && (
                      <div className="mt-3">
                        <label className="text-muted-foreground text-sm">Notes</label>
                        <p className="text-sm">{test.notes}</p>
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Score</span>
                        <span>{test.score}/10</span>
                      </div>
                      <Progress value={test.score * 10} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Defects */}
            {qualityControl.defects && qualityControl.defects.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Defects Found</h3>
                
                <div className="space-y-4">
                  {qualityControl.defects.map((defect) => (
                    <div key={defect.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{defect.defectType}</h4>
                        <Badge {...getDefectSeverityBadge(defect.severity)} />
                      </div>
                      
                      <p className="text-sm mb-3">{defect.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <label className="text-muted-foreground">Quantity</label>
                          <p className="font-medium">{defect.quantity} units</p>
                        </div>
                        {defect.location && (
                          <div>
                            <label className="text-muted-foreground">Location</label>
                            <p className="font-medium">{defect.location}</p>
                          </div>
                        )}
                        {defect.images && defect.images.length > 0 && (
                          <div>
                            <label className="text-muted-foreground">Images</label>
                            <p className="font-medium">{defect.images.length} attached</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Actions */}
            {qualityControl.actions && qualityControl.actions.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Corrective Actions</h3>
                
                <div className="space-y-4">
                  {qualityControl.actions.map((action) => (
                    <div key={action.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{action.actionType.replace('_', ' ')}</h4>
                        <Badge {...getActionStatusBadge(action.status)} />
                      </div>
                      
                      <p className="text-sm mb-3">{action.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <label className="text-muted-foreground">Assigned To</label>
                          <p className="font-medium">{action.assignedTo}</p>
                        </div>
                        <div>
                          <label className="text-muted-foreground">Due Date</label>
                          <p className="font-medium">{formatDate(action.dueDate)}</p>
                        </div>
                        {action.completedDate && (
                          <div>
                            <label className="text-muted-foreground">Completed Date</label>
                            <p className="font-medium">{formatDate(action.completedDate)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pass Rate</span>
                  <span className="font-medium">
                    {qualityControl.tests.filter(t => t.result === 'pass').length}/{qualityControl.tests.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Score</span>
                  <span className="font-medium">
                    {(qualityControl.tests.reduce((sum, t) => sum + t.score, 0) / qualityControl.tests.length).toFixed(1)}/10
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Defects Found</span>
                  <span className="font-medium">{qualityControl.defects?.length || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Actions Required</span>
                  <span className="font-medium">{qualityControl.actions?.length || 0}</span>
                </div>
              </div>
            </Card>

            {/* Test Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Test Breakdown</h3>
              
              <div className="space-y-3">
                {['visual', 'measurement', 'functional', 'durability', 'chemical'].map((testType) => {
                  const testsOfType = qualityControl.tests.filter(t => t.testType === testType)
                  if (testsOfType.length === 0) return null
                  
                  const passedTests = testsOfType.filter(t => t.result === 'pass').length
                  const percentage = (passedTests / testsOfType.length) * 100
                  
                  return (
                    <div key={testType}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{testType}</span>
                        <span>{passedTests}/{testsOfType.length}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Inspector Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Inspector Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{qualityControl.inspector}</p>
                    <p className="text-sm text-muted-foreground">Quality Inspector</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Test Date</span>
                    <span>{formatDate(qualityControl.testDate)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Audit Trail */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Audit Trail</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-muted-foreground">Created At</label>
                  <p className="font-medium">{formatDateTime(qualityControl.createdAt)}</p>
                </div>
                <div>
                  <label className="text-muted-foreground">Last Updated</label>
                  <p className="font-medium">{formatDateTime(qualityControl.updatedAt)}</p>
                </div>
              </div>
            </Card>

            {/* Notes */}
            {qualityControl.notes && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Notes</h3>
                <p className="text-sm">{qualityControl.notes}</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}