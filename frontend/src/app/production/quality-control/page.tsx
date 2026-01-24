'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

import Link from 'next/link'
import { mockQualityControls } from '@/services/production'
import type { QualityControl, QualityControlFilters } from '@/types/production'

export default function QualityControlPage() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [referenceTypeFilter, setReferenceTypeFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Production', href: '/production' },
    { label: 'Quality Control', href: '/production/quality-control' }
  ]

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  // Filter quality controls
  const filteredQualityControls = mockQualityControls.filter(qc => {
    if (searchTerm && !qc?.qcNumber?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !qc?.productName?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (statusFilter !== 'all' && qc?.status !== statusFilter) return false
    if (typeFilter !== 'all' && qc?.type !== typeFilter) return false
    if (referenceTypeFilter !== 'all' && qc?.referenceType !== referenceTypeFilter) return false
    return true
  })

  // Get unique values for filters
  const statuses = Array.from(new Set(mockQualityControls.map(qc => qc?.status).filter(Boolean)))
  const types = Array.from(new Set(mockQualityControls.map(qc => qc?.type).filter(Boolean)))
  const referenceTypes = Array.from(new Set(mockQualityControls.map(qc => qc?.referenceType).filter(Boolean)))

  const getStatusBadge = (status: QualityControl['status']) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: Clock },
      testing: { variant: 'default' as const, label: 'Testing', icon: ChartBar },
      passed: { variant: 'default' as const, label: 'Passed', icon: CheckCircle },
      failed: { variant: 'destructive' as const, label: 'Failed', icon: XCircle },
      conditional: { variant: 'outline' as const, label: 'Conditional', icon: Warning }
    }
    return statusConfig[status] || { variant: 'secondary' as const, label: status, icon: Clock }
  }

  const getTestResultColor = (result: string) => {
    switch (result) {
      case 'pass': return 'text-green-600'
      case 'fail': return 'text-red-600'
      case 'marginal': return 'text-yellow-600'
      default: return 'text-muted-foreground'
    }
  }

  // Summary statistics
  const summaryStats = {
    total: filteredQualityControls.length,
    testing: filteredQualityControls.filter(qc => qc?.status === 'testing').length,
    passed: filteredQualityControls.filter(qc => qc?.status === 'passed').length,
    failed: filteredQualityControls.filter(qc => qc?.status === 'failed').length,
    conditional: filteredQualityControls.filter(qc => qc?.status === 'conditional').length,
    averageScore: filteredQualityControls.reduce((sum, qc) => sum + (qc?.overallScore || 0), 0) / filteredQualityControls.length || 0
  }

  const columns = [
    {
      key: 'qcNumber' as keyof QualityControl,
      title: 'QC Number',
      render: (qc: QualityControl) => (
        <div>
          <div className="font-medium">{qc?.qcNumber || ''}</div>
          <div className="text-sm text-muted-foreground capitalize">{qc?.type || ''}</div>
        </div>
      )
    },
    {
      key: 'product' as keyof QualityControl,
      title: 'Product',
      render: (qc: QualityControl) => (
        <div>
          <div className="font-medium">{qc?.productName || ''}</div>
          <div className="text-sm text-muted-foreground">{qc?.productCode || ''}</div>
        </div>
      )
    },
    {
      key: 'reference' as keyof QualityControl,
      title: 'Reference',
      render: (qc: QualityControl) => (
        <div>
          <div className="font-medium">{qc?.referenceNumber || ''}</div>
          <div className="text-sm text-muted-foreground capitalize">{qc?.referenceType || ''}</div>
        </div>
      )
    },
    {
      key: 'testInfo' as keyof QualityControl,
      title: 'Test Information',
      render: (qc: QualityControl) => (
        <div>
          <div className="text-sm">Batch: {qc?.batchNumber || ''}</div>
          <div className="text-sm text-muted-foreground">
            {qc?.quantityTested || 0} of {qc?.sampleSize || 0} tested
          </div>
        </div>
      )
    },
    {
      key: 'status' as keyof QualityControl,
      title: 'Status',
      render: (qc: QualityControl) => {
        if (!qc?.status) return ''
        const { variant, label, icon: Icon } = getStatusBadge(qc.status)
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'score' as keyof QualityControl,
      title: 'Quality Score',
      render: (qc: QualityControl) => {
        if (!qc?.overallScore || qc.overallScore === 0) {
          return <span className="text-muted-foreground">Pending</span>
        }
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{qc.overallScore.toFixed(1)}/10</span>
              <span className="text-muted-foreground">{(qc.overallScore * 10).toFixed(0)}%</span>
            </div>
            <Progress value={qc.overallScore * 10} className="h-2" />
          </div>
        )
      }
    },
    {
      key: 'testDate' as keyof QualityControl,
      title: 'Test Date',
      render: (qc: QualityControl) => (
        <div>
          <div className="text-sm">{formatDate(qc?.testDate)}</div>
          <div className="text-sm text-muted-foreground">{qc?.inspector || ''}</div>
        </div>
      )
    },
    {
      key: 'tests' as keyof QualityControl,
      title: 'Test Results',
      render: (qc: QualityControl) => (
        <div className="space-y-1">
          {qc?.tests?.slice(0, 2).map((test) => (
            <div key={test.id} className="text-xs">
              <span className="font-medium">{test.testName}:</span>
              <span className={`ml-1 ${getTestResultColor(test.result)}`}>
                {test.result}
              </span>
            </div>
          ))}
          {qc?.tests && qc.tests.length > 2 && (
            <div className="text-xs text-muted-foreground">
              +{qc.tests.length - 2} more tests
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions' as keyof QualityControl,
      title: 'Actions',
      render: (qc: QualityControl) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/production/quality-control/${qc?.id || ''}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/production/quality-control/${qc?.id || ''}/edit`}>
              <PencilSimple className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Quality Control"
          description="Manage quality inspections and test results"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Inspection
              </Button>
              <Button variant="outline" size="sm">
                <DownloadSimple className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button size="sm" asChild>
                <Link href="/production/quality-control/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New QC Inspection
                </Link>
              </Button>
            </div>
          }
        />

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inspections</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.total}</p>
              </div>
              <ChartBar className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Testing</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.testing}</p>
                <p className="text-sm text-blue-600 mt-1">In progress</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Passed</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.passed}</p>
                <p className="text-sm text-green-600 mt-1">Quality approved</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{summaryStats.failed}</p>
                <p className="text-sm text-red-600 mt-1">Need attention</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.averageScore.toFixed(1)}/10</p>
                <div className="mt-2">
                  <Progress value={summaryStats.averageScore * 10} className="h-2" />
                </div>
              </div>
              <Warning className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Funnel className="h-5 w-5 text-muted-foreground" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search QC inspections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {mounted && statuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {mounted && types.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceType">Reference Type</Label>
                <Select value={referenceTypeFilter} onValueChange={setReferenceTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All references" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All references</SelectItem>
                    {mounted && referenceTypes.map((refType) => (
                      <SelectItem key={refType} value={refType}>{refType.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Quality Control Table */}
        <Card>
          <AdvancedDataTable
            data={filteredQualityControls}
            columns={columns}
            searchable={false}
            filterable={false}
            pagination={{
              pageSize: 10,
              currentPage: 1,
              totalPages: Math.ceil(filteredQualityControls.length / 10),
              totalItems: filteredQualityControls.length,
              onChange: () => {}
            }}
          />
        </Card>
      </div>
    </TwoLevelLayout>
  )
}