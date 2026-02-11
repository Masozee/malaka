'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TanStackDataTable, type TanStackColumn } from '@/components/ui/tanstack-data-table'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  StarIcon,
  File01Icon,
  Award01Icon,
  ChartLineData01Icon,
  Search01Icon,
  UserGroupIcon,
  Calendar01Icon,
  ChartColumnIcon,
  AlertCircleIcon,
  Note01Icon,
  CheckmarkCircle01Icon
} from '@hugeicons/core-free-icons'

import { HRService } from '@/services/hr'

interface PerformanceReview {
  id: string
  employee_id: string
  employee_name: string
  employee_code: string
  department: string
  position: string
  review_period: string
  review_type: 'quarterly' | 'annual' | 'probation' | 'mid-year'
  overall_score: number | null
  status: 'draft' | 'pending' | 'completed' | 'overdue'
  review_date: string | null
  submission_date: string | null
  completion_date: string | null
  notes: string
  self_review_completed: boolean
  manager_review_completed: boolean
  reviewer: string
  last_updated: string
  goals: {
    achieved: number
    total: number
  }
  competencies: {
    technical: number
    communication: number
    leadership: number
    teamwork: number
    problem_solving: number
  }
}

// Status color mapping
const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800'
}

const reviewTypeColors = {
  quarterly: 'bg-blue-100 text-blue-800',
  annual: 'bg-purple-100 text-purple-800',
  probation: 'bg-orange-100 text-orange-800',
  'mid-year': 'bg-teal-100 text-teal-800'
}

export default function PerformancePage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
  const [performanceData, setPerformanceData] = useState<PerformanceReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')

  useEffect(() => {
    setMounted(true)
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch performance reviews from API
      const response = await HRService.getPerformanceReviews()
      setPerformanceData(response.data)
    } catch (error) {
      console.error('Error fetching performance data:', error)
      setError('Failed to load performance data')
      setPerformanceData([])
    } finally {
      setLoading(false)
    }
  }

  // Filter data based on search term, status, and period
  const filteredData = performanceData.filter(review => {
    const matchesSearch = !searchTerm ||
      review.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || review.status === statusFilter
    const matchesPeriod = periodFilter === 'all' || review.review_period === periodFilter

    return matchesSearch && matchesStatus && matchesPeriod
  })

  const breadcrumbs = [
    { label: 'HR Management', href: '/hr' },
    { label: 'Performance', href: '/hr/performance' }
  ]

  // Calculate statistics
  const totalReviews = performanceData.length
  const completedReviews = performanceData.filter(review => review.status === 'completed').length
  const pendingReviews = performanceData.filter(review => review.status === 'pending').length
  const overdueReviews = performanceData.filter(review => review.status === 'overdue').length
  const avgOverallScore = performanceData
    .filter(review => review.overall_score !== null)
    .reduce((sum, review) => sum + (review.overall_score || 0), 0) /
    Math.max(1, performanceData.filter(review => review.overall_score !== null).length)
  const completionRate = totalReviews > 0 ? ((completedReviews / totalReviews) * 100) : 0

  const columns: TanStackColumn<PerformanceReview>[] = [
    {
      id: 'employee',
      header: 'Employee',
      accessorKey: 'employee_name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.employee_name}</div>
          <div className="text-xs text-muted-foreground">{row.original.employee_code} • {row.original.department}</div>
        </div>
      )
    },
    {
      id: 'position',
      header: 'Position',
      accessorKey: 'position',
      cell: ({ row }) => (
        <div className="text-xs">{row.original.position}</div>
      )
    },
    {
      id: 'type',
      header: 'Review Type',
      accessorKey: 'review_type',
      cell: ({ row }) => {
        const type = row.original.review_type as keyof typeof reviewTypeColors
        return (
          <Badge className={reviewTypeColors[type]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        )
      }
    },
    {
      id: 'period',
      header: 'Period',
      accessorKey: 'review_period',
      cell: ({ row }) => (
        <div className="text-xs">{row.original.review_period}</div>
      )
    },
    {
      id: 'score',
      header: 'Score',
      accessorKey: 'overall_score',
      cell: ({ row }) => {
        const score = row.original.overall_score
        if (!score) {
          return (
            <div className="text-gray-400 flex items-center">
              <HugeiconsIcon icon={StarIcon} className="h-4 w-4 mr-1" />
              -
            </div>
          )
        }
        const color = score >= 4.5 ? 'text-green-600' : score >= 4.0 ? 'text-blue-600' : score >= 3.5 ? 'text-yellow-600' : 'text-red-600'
        return (
          <div className={`font-bold ${color} flex items-center`}>
            <HugeiconsIcon icon={StarIcon} className="h-4 w-4 mr-1" />
            {score.toFixed(1)}
          </div>
        )
      }
    },
    {
      id: 'goals',
      header: 'Goals',
      accessorKey: 'goals',
      cell: ({ row }) => {
        const goals = row.original.goals
        const percentage = goals.total > 0 ? (goals.achieved / goals.total) * 100 : 0
        return (
          <div className="text-xs">
            <div>{goals.achieved}/{goals.total}</div>
            <div className="text-xs text-gray-500">{percentage.toFixed(0)}%</div>
          </div>
        )
      }
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status as keyof typeof statusColors
        return (
          <Badge className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      }
    },
    {
      id: 'reviewDate',
      header: 'Review Date',
      accessorKey: 'review_date',
      cell: ({ row }) => (
        <div className="text-xs">
          {mounted && row.original.review_date ? new Date(row.original.review_date).toLocaleDateString('id-ID') : '-'}
        </div>
      )
    },
    {
      id: 'reviewer',
      header: 'Reviewer',
      accessorKey: 'reviewer',
      cell: ({ row }) => (
        <div className="text-xs">{row.original.reviewer}</div>
      )
    }
  ]

  const PerformanceCard = ({ review }: { review: PerformanceReview }) => {
    const goalsPercentage = review.goals.total > 0 ? (review.goals.achieved / review.goals.total) * 100 : 0
    const competencyValues = Object.values(review.competencies).filter(score => score > 0)
    const avgCompetency = competencyValues.length > 0 ? competencyValues.reduce((sum, score) => sum + score, 0) / competencyValues.length : 0

    return (
      <Card className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{review.employee_name}</h3>
            <p className="text-sm text-gray-500">{review.employee_code} • {review.position}</p>
            <p className="text-xs text-gray-400">{review.department}</p>
          </div>
          <div className="text-right">
            <Badge className={statusColors[review.status]}>
              {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
            </Badge>
            <div className="mt-1">
              <Badge className={reviewTypeColors[review.review_type]}>
                {review.review_type.charAt(0).toUpperCase() + review.review_type.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Overall Score:</span>
            <div className="flex items-center">
              <HugeiconsIcon icon={StarIcon} className="h-4 w-4 mr-1 text-yellow-500" />
              <span className="font-bold text-lg">
                {review.overall_score ? review.overall_score.toFixed(1) : '-'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">Goals Achievement:</span>
            <span className="font-medium">
              {review.goals.achieved}/{review.goals.total} ({goalsPercentage.toFixed(0)}%)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">Avg Competency:</span>
            <span className="font-medium">
              {avgCompetency > 0 ? avgCompetency.toFixed(1) : '-'}/5.0
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">Review Period:</span>
            <span>{review.review_period}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">Review Date:</span>
            <span>
              {mounted && review.review_date ? new Date(review.review_date).toLocaleDateString('id-ID') : '-'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">Reviewer:</span>
            <span>{review.reviewer || '-'}</span>
          </div>

          {review.notes && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
              <span className="font-medium text-blue-800">Notes: </span>
              <span className="text-blue-700">{review.notes}</span>
            </div>
          )}
        </div>

        <div className="flex space-x-2 mt-4">
          <Button size="sm" variant="outline" className="flex-1">
            <HugeiconsIcon icon={File01Icon} className="h-4 w-4 mr-1" />
            View Details
          </Button>
          {review.status === 'draft' && (
            <Button size="sm" className="flex-1">
              <HugeiconsIcon icon={Award01Icon} className="h-4 w-4 mr-1" />
              Complete
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <TwoLevelLayout>
      <Header
        title="Performance Management"
        description="Manage employee performance reviews, goals, and competency evaluations"
        breadcrumbs={breadcrumbs}
        actions={
          <Button size="sm">
            <HugeiconsIcon icon={Award01Icon} className="h-4 w-4 mr-2" />
            New Review
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{totalReviews}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={File01Icon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedReviews}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={Award01Icon} className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mounted ? avgOverallScore.toFixed(1) : ''}
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={StarIcon} className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-teal-600">
                  {mounted ? completionRate.toFixed(1) : ''}%
                </p>
              </div>
              <div className="h-10 w-10 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={ChartLineData01Icon} className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees, positions, or reviewers..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <HugeiconsIcon icon={UserGroupIcon} className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-36">
                <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                <SelectItem value="Annual 2024">Annual 2024</SelectItem>
                <SelectItem value="Mid-Year 2024">Mid-Year 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Toggle & Sort */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>
            <Select>
              <SelectTrigger className="w-44">
                <HugeiconsIcon icon={ChartColumnIcon} className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Employee Name</SelectItem>
                <SelectItem value="score">Overall Score</SelectItem>
                <SelectItem value="date">Review Date</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredData.length} of {totalReviews} items
          </div>
        </div>

        {/* Data Display */}
        {loading ? (
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading performance data...</span>
            </div>
          </Card>
        ) : error ? (
          <Card className="p-8">
            <div className="text-center">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchPerformanceData} variant="outline">
                Try Again
              </Button>
            </div>
          </Card>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((review) => (
              <PerformanceCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <TanStackDataTable
            data={filteredData}
            columns={columns}
          />
        )}
      </div>
    </TwoLevelLayout>
  )
}