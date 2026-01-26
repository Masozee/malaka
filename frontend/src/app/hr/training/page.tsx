'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Badge } from '@/components/ui/badge'
import { HRService } from '@/services/hr'

interface TrainingProgram {
  id: string
  program_title: string
  description: string
  category: 'technical' | 'soft-skills' | 'safety' | 'compliance' | 'leadership' | 'product'
  training_type: 'online' | 'classroom' | 'workshop' | 'certification' | 'onboarding'
  duration_hours: number
  max_participants: number
  enrolled_count: number
  completed_count: number
  instructor_name: string
  target_departments: string[]
  program_status: 'active' | 'upcoming' | 'completed' | 'cancelled'
  start_date: string
  end_date: string
  training_location?: string
  cost_per_participant: number
  provides_certification: boolean
  prerequisites?: string[]
  training_materials?: string[]
  created_at: string
  updated_at: string
}

interface TrainingEnrollment {
  id: string
  employee_id: string
  employee_name: string
  department: string
  program_id: string
  program_title: string
  enrollment_date: string
  completion_date?: string
  progress_percentage: number
  enrollment_status: 'enrolled' | 'in-progress' | 'completed' | 'failed' | 'dropped'
  final_score?: number
  certificate_issued: boolean
  created_at: string
  updated_at: string
}

// Mock training programs data updated to match new interface
const mockTrainingPrograms: TrainingProgram[] = [
  {
    id: '1',
    program_title: 'Workplace Safety & Health',
    description: 'Comprehensive safety training covering workplace hazards, emergency procedures, and health protocols',
    category: 'safety',
    training_type: 'classroom',
    duration_hours: 8,
    max_participants: 25,
    enrolled_count: 23,
    completed_count: 20,
    instructor_name: 'Safety Manager',
    target_departments: ['Production', 'Warehouse', 'Maintenance'],
    program_status: 'active',
    start_date: '2024-08-01',
    end_date: '2024-08-01',
    training_location: 'Training Room A',
    cost_per_participant: 150000,
    provides_certification: true,
    prerequisites: ['Basic orientation'],
    created_at: '2024-07-01T09:00:00Z',
    updated_at: '2024-07-25T14:30:00Z'
  },
  {
    id: '2',
    program_title: 'Advanced Excel for Business',
    description: 'Master advanced Excel functions, pivot tables, macros, and data analysis techniques',
    category: 'technical',
    training_type: 'online',
    duration_hours: 16,
    max_participants: 50,
    enrolled_count: 35,
    completed_count: 28,
    instructor_name: 'IT Trainer',
    target_departments: ['Accounting', 'Sales', 'HR', 'Administration'],
    program_status: 'active',
    start_date: '2024-07-15',
    end_date: '2024-08-15',
    cost_per_participant: 200000,
    provides_certification: true,
    training_materials: ['Excel workbook', 'Video tutorials', 'Practice datasets'],
    created_at: '2024-07-01T09:00:00Z',
    updated_at: '2024-07-25T14:30:00Z'
  },
  {
    id: '3',
    program_title: 'Leadership Development Program',
    description: 'Develop essential leadership skills including team management, decision making, and strategic thinking',
    category: 'leadership',
    training_type: 'workshop',
    duration_hours: 24,
    max_participants: 15,
    enrolled_count: 12,
    completed_count: 8,
    instructor_name: 'Leadership Coach',
    target_departments: ['Management', 'Supervisors'],
    program_status: 'active',
    start_date: '2024-07-01',
    end_date: '2024-08-30',
    training_location: 'Conference Room',
    cost_per_participant: 500000,
    provides_certification: true,
    prerequisites: ['2+ years management experience'],
    created_at: '2024-06-15T09:00:00Z',
    updated_at: '2024-07-25T14:30:00Z'
  },
  {
    id: '4',
    program_title: 'Customer Service Excellence',
    description: 'Enhance customer service skills, communication techniques, and complaint handling',
    category: 'soft-skills',
    training_type: 'classroom',
    duration_hours: 12,
    max_participants: 30,
    enrolled_count: 28,
    completed_count: 25,
    instructor_name: 'Customer Service Manager',
    target_departments: ['Sales', 'Customer Service'],
    program_status: 'completed',
    start_date: '2024-06-01',
    end_date: '2024-06-15',
    training_location: 'Training Room B',
    cost_per_participant: 180000,
    provides_certification: false,
    created_at: '2024-05-20T09:00:00Z',
    updated_at: '2024-06-15T17:00:00Z'
  },
  {
    id: '5',
    program_title: 'Quality Management System ISO 9001',
    description: 'Understanding ISO 9001 standards, quality control processes, and continuous improvement',
    category: 'compliance',
    training_type: 'certification',
    duration_hours: 32,
    max_participants: 20,
    enrolled_count: 18,
    completed_count: 15,
    instructor_name: 'Quality Consultant',
    target_departments: ['Quality Control', 'Production'],
    program_status: 'active',
    start_date: '2024-07-10',
    end_date: '2024-09-10',
    training_location: 'QC Laboratory',
    cost_per_participant: 750000,
    provides_certification: true,
    prerequisites: ['Quality basics', 'Process documentation'],
    created_at: '2024-06-25T09:00:00Z',
    updated_at: '2024-07-25T14:30:00Z'
  },
  {
    id: '6',
    program_title: 'New Employee Orientation',
    description: 'Company introduction, policies, procedures, and workplace culture for new hires',
    category: 'compliance',
    training_type: 'onboarding',
    duration_hours: 4,
    max_participants: 10,
    enrolled_count: 8,
    completed_count: 6,
    instructor_name: 'HR Specialist',
    target_departments: ['All'],
    program_status: 'upcoming',
    start_date: '2024-08-05',
    end_date: '2024-08-05',
    training_location: 'HR Office',
    cost_per_participant: 50000,
    provides_certification: false,
    created_at: '2024-07-25T09:00:00Z',
    updated_at: '2024-07-25T14:30:00Z'
  },
  {
    id: '7',
    program_title: 'Digital Marketing Fundamentals',
    description: 'Social media marketing, SEO basics, content creation, and online advertising strategies',
    category: 'technical',
    training_type: 'online',
    duration_hours: 20,
    max_participants: 25,
    enrolled_count: 22,
    completed_count: 18,
    instructor_name: 'Marketing Expert',
    target_departments: ['Marketing', 'Sales'],
    program_status: 'active',
    start_date: '2024-07-20',
    end_date: '2024-08-20',
    cost_per_participant: 300000,
    provides_certification: true,
    created_at: '2024-07-10T09:00:00Z',
    updated_at: '2024-07-25T14:30:00Z'
  },
  {
    id: '8',
    program_title: 'Product Knowledge Training',
    description: 'Comprehensive training on shoe manufacturing processes, materials, and product specifications',
    category: 'product',
    training_type: 'workshop',
    duration_hours: 6,
    max_participants: 40,
    enrolled_count: 35,
    completed_count: 32,
    instructor_name: 'Product Manager',
    target_departments: ['Sales', 'Customer Service', 'Production'],
    program_status: 'completed',
    start_date: '2024-06-15',
    end_date: '2024-06-16',
    training_location: 'Production Floor',
    cost_per_participant: 100000,
    provides_certification: false,
    created_at: '2024-06-01T09:00:00Z',
    updated_at: '2024-06-16T17:00:00Z'
  }
]

// Status and category color mappings
const statusColors = {
  active: 'bg-green-100 text-green-800',
  upcoming: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
}

const categoryColors = {
  technical: 'bg-blue-100 text-blue-800',
  'soft-skills': 'bg-purple-100 text-purple-800',
  safety: 'bg-red-100 text-red-800',
  compliance: 'bg-yellow-100 text-yellow-800',
  leadership: 'bg-indigo-100 text-indigo-800',
  product: 'bg-green-100 text-green-800'
}

const typeColors = {
  online: 'bg-teal-100 text-teal-800',
  classroom: 'bg-orange-100 text-orange-800',
  workshop: 'bg-pink-100 text-pink-800',
  certification: 'bg-purple-100 text-purple-800',
  onboarding: 'bg-cyan-100 text-cyan-800'
}

export default function TrainingPage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
  const [trainingData, setTrainingData] = useState<TrainingProgram[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchTrainingData()
  }, [])

  const fetchTrainingData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Replace with actual API call when backend endpoint is ready
      // const response = await HRService.getTrainingPrograms()
      // setTrainingData(response.data)
      
      // Use mock data for now
      setTrainingData(mockTrainingPrograms)
    } catch (error) {
      console.error('Error fetching training data:', error)
      setError('Failed to load training programs')
      setTrainingData(mockTrainingPrograms) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  const retryFetch = () => {
    fetchTrainingData()
  }

  const breadcrumbs = [
    { label: 'HR Management', href: '/hr' },
    { label: 'Training', href: '/hr/training' }
  ]

  // Calculate statistics from actual data
  const totalPrograms = trainingData.length
  const activePrograms = trainingData.filter(program => program.program_status === 'active').length
  const upcomingPrograms = trainingData.filter(program => program.program_status === 'upcoming').length
  const completedPrograms = trainingData.filter(program => program.program_status === 'completed').length
  const totalEnrolled = trainingData.reduce((sum, program) => sum + program.enrolled_count, 0)
  const totalCompleted = trainingData.reduce((sum, program) => sum + program.completed_count, 0)
  const completionRate = totalEnrolled > 0 ? ((totalCompleted / totalEnrolled) * 100) : 0
  const avgCost = totalPrograms > 0 ? trainingData.reduce((sum, program) => sum + program.cost_per_participant, 0) / totalPrograms : 0

  // Use correct column structure following integration guidelines
  const columns: Array<{
    key: keyof TrainingProgram;
    title: string;
    render?: (value: unknown, record: TrainingProgram) => React.ReactNode;
  }> = [
    {
      key: 'program_title' as keyof TrainingProgram,
      title: 'Program Title',
      render: (value: unknown, record: TrainingProgram) => (
        <div>
          <div className="font-medium">{record.program_title}</div>
          <div className="text-xs text-muted-foreground max-w-60 truncate">{record.description}</div>
        </div>
      )
    },
    {
      key: 'category' as keyof TrainingProgram,
      title: 'Category',
      render: (value: unknown, record: TrainingProgram) => {
        const category = record.category as keyof typeof categoryColors
        return (
          <Badge className={categoryColors[category]}>
            {category.replace('-', ' ').charAt(0).toUpperCase() + category.replace('-', ' ').slice(1)}
          </Badge>
        )
      }
    },
    {
      key: 'training_type' as keyof TrainingProgram,
      title: 'Type',
      render: (value: unknown, record: TrainingProgram) => {
        const type = record.training_type as keyof typeof typeColors
        return (
          <Badge className={typeColors[type]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        )
      }
    },
    {
      key: 'duration_hours' as keyof TrainingProgram,
      title: 'Duration',
      render: (value: unknown, record: TrainingProgram) => (
        <div className="flex items-center text-xs">
          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
          {record.duration_hours}h
        </div>
      )
    },
    {
      key: 'enrolled_count' as keyof TrainingProgram,
      title: 'Enrollment',
      render: (value: unknown, record: TrainingProgram) => (
        <div className="text-xs">
          <div>{record.enrolled_count}/{record.max_participants}</div>
          <div className="text-xs text-muted-foreground">
            {record.max_participants > 0 ? Math.round((record.enrolled_count / record.max_participants) * 100) : 0}% filled
          </div>
        </div>
      )
    },
    {
      key: 'completed_count' as keyof TrainingProgram,
      title: 'Completed',
      render: (value: unknown, record: TrainingProgram) => {
        const rate = record.enrolled_count > 0 ? Math.round((record.completed_count / record.enrolled_count) * 100) : 0
        return (
          <div className="text-xs">
            <div>{record.completed_count}</div>
            <div className="text-xs text-muted-foreground">{rate}% rate</div>
          </div>
        )
      }
    },
    {
      key: 'program_status' as keyof TrainingProgram,
      title: 'Status',
      render: (value: unknown, record: TrainingProgram) => {
        const status = record.program_status as keyof typeof statusColors
        return (
          <Badge className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      }
    },
    {
      key: 'start_date' as keyof TrainingProgram,
      title: 'Start Date',
      render: (value: unknown, record: TrainingProgram) => (
        <div className="text-xs">
          {mounted ? new Date(record.start_date).toLocaleDateString('id-ID') : ''}
        </div>
      )
    },
    {
      key: 'cost_per_participant' as keyof TrainingProgram,
      title: 'Cost per Participant',
      render: (value: unknown, record: TrainingProgram) => (
        <div className="text-xs font-medium">
          {mounted ? record.cost_per_participant.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) : ''}
        </div>
      )
    }
  ]

  const TrainingCard = ({ program }: { program: TrainingProgram }) => {
    const enrollmentRate = program.max_participants > 0 ? (program.enrolled_count / program.max_participants) * 100 : 0
    const completionRate = program.enrolled_count > 0 ? (program.completed_count / program.enrolled_count) * 100 : 0
    
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{program.program_title}</h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{program.description}</p>
            <div className="flex items-center space-x-2">
              <Badge className={categoryColors[program.category]}>
                {program.category.replace('-', ' ').charAt(0).toUpperCase() + program.category.replace('-', ' ').slice(1)}
              </Badge>
              <Badge className={typeColors[program.training_type]}>
                {program.training_type.charAt(0).toUpperCase() + program.training_type.slice(1)}
              </Badge>
            </div>
          </div>
          <Badge className={statusColors[program.program_status]}>
            {program.program_status.charAt(0).toUpperCase() + program.program_status.slice(1)}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Instructor:</span>
            <span className="flex items-center">
              <User className="h-3 w-3 mr-1 text-gray-400" />
              {program.instructor_name}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Duration:</span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1 text-gray-400" />
              {program.duration_hours} hours
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Enrollment:</span>
            <span>{program.enrolled_count}/{program.max_participants} ({enrollmentRate.toFixed(0)}%)</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Completion:</span>
            <span>{program.completed_count} ({completionRate.toFixed(0)}%)</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Start Date:</span>
            <span>{mounted ? new Date(program.start_date).toLocaleDateString('id-ID') : ''}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Cost:</span>
            <span className="font-medium">
              {mounted ? program.cost_per_participant.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) : ''}
            </span>
          </div>
          
          {program.training_location && (
            <div className="flex justify-between">
              <span className="text-gray-500">Location:</span>
              <span>{program.training_location}</span>
            </div>
          )}
          
          {program.provides_certification && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
              <span className="flex items-center text-blue-700">
                <Award className="h-3 w-3 mr-1" />
                Certificate awarded upon completion
              </span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2 mt-4">
          <Button size="sm" variant="outline" className="flex-1">
            <FileText className="h-4 w-4 mr-1" />
            View Details
          </Button>
          {program.program_status === 'active' && (
            <Button size="sm" className="flex-1">
              <Play className="h-4 w-4 mr-1" />
              Enroll
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Training Management"
          breadcrumbs={breadcrumbs}
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Programs</p>
                <p className="text-2xl font-bold text-gray-900">{totalPrograms}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{activePrograms}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{upcomingPrograms}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-600">{completedPrograms}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enrolled</p>
                <p className="text-2xl font-bold text-purple-600">{totalEnrolled}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Award className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-indigo-600">{totalCompleted}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <TrendUp className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-teal-600">
                  {mounted ? completionRate.toFixed(1) : ''}%
                </p>
              </div>
            </div>
          </Card>
        </div>

          {/* Filters and Controls */}
          <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search programs, instructors, or categories..."
                    className="pl-10"
                    // Add search functionality here when needed
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Training Calendar
                </Button>
                <Button variant="outline" size="sm">
                  Export
                </Button>
                <Button size="sm">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  New Program
                </Button>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between">
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
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Showing {trainingData.length} training programs</span>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <Warning className="h-8 w-8 text-red-500" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Failed to Load Training Programs</h3>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <Button onClick={retryFetch} variant="outline" size="sm">
                    <ArrowsClockwise className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          ) : viewMode === 'cards' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainingData.map((program) => (
                  <TrainingCard key={program.id} program={program} />
                ))}
              </div>
              
              {/* Empty State for Cards */}
              {trainingData.length === 0 && (
                <Card className="p-8">
                  <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <GraduationCap className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">No Training Programs Found</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get started by creating your first training program.
                      </p>
                      <Button size="sm">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Create Program
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <AdvancedDataTable
                data={trainingData}
                columns={columns}
                searchPlaceholder="Search programs, instructors, or categories..."
              />
            </Card>
          )}
        </div>
      </div>
    </TwoLevelLayout>
  )
}