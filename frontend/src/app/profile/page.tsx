'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { useAuth } from '@/contexts/auth-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Clock,
  DollarSign,
  Target,
  TrendingUp,
  Users,
  Building2,
  Edit,
  Settings,
  FileText,
  Camera,
  Shield,
  Bell,
  Palette,
  Globe,
  Download,
  Upload,
  Eye,
  EyeOff,
  RefreshCw,
  Save
} from 'lucide-react'

interface UserProfile {
  // Personal Information
  id: string
  employeeId: string
  fullName: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
  nationality: string
  religion: string
  avatar: string
  
  // Address Information
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  emergencyContact: {
    name: string
    relationship: string
    phone: string
    address: string
  }
  
  // Employment Information
  position: string
  department: string
  division: string
  manager: string
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern'
  employmentStatus: 'active' | 'probation' | 'notice' | 'terminated'
  hireDate: string
  workLocation: string
  workSchedule: string
  salary: {
    base: number
    currency: string
    payFrequency: string
    lastReview: string
    nextReview: string
  }
  
  // Education & Skills
  education: EducationRecord[]
  certifications: Certification[]
  skills: Skill[]
  languages: Language[]
  
  // Performance & Goals
  performance: {
    currentRating: number
    lastReviewDate: string
    nextReviewDate: string
    goals: Goal[]
    achievements: Achievement[]
  }
  
  // Attendance & Leave
  attendance: {
    totalWorkingDays: number
    presentDays: number
    absentDays: number
    lateDays: number
    overtimeHours: number
    attendanceRate: number
  }
  leaveBalance: {
    annual: number
    sick: number
    personal: number
    maternity: number
    totalUsed: number
    totalRemaining: number
  }
  
  // Benefits & Compensation
  benefits: Benefit[]
  
  // System Preferences
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    timezone: string
    dateFormat: string
    currency: string
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
      desktop: boolean
    }
    privacy: {
      profileVisibility: 'public' | 'colleagues' | 'private'
      showSalary: boolean
      showPerformance: boolean
      showAttendance: boolean
    }
  }
}

interface EducationRecord {
  id: string
  institution: string
  degree: string
  field: string
  startYear: string
  endYear: string
  grade: string
  status: 'completed' | 'in-progress' | 'dropped'
}

interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialId: string
  verified: boolean
}

interface Skill {
  id: string
  name: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  endorsements: number
}

interface Language {
  id: string
  language: string
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native'
  certification?: string
}

interface Goal {
  id: string
  title: string
  description: string
  category: 'performance' | 'learning' | 'career' | 'project'
  targetDate: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  progress: number
}

interface Achievement {
  id: string
  title: string
  description: string
  date: string
  type: 'award' | 'recognition' | 'milestone' | 'project'
  issuer: string
}

interface Benefit {
  id: string
  name: string
  type: 'health' | 'dental' | 'vision' | 'life' | 'retirement' | 'other'
  provider: string
  coverage: string
  premium: number
  status: 'active' | 'inactive' | 'pending'
}

// Mock user profile data
const mockUserProfile: UserProfile = {
  id: '1',
  employeeId: 'EMP-2024-001',
  fullName: 'Sarah Kusuma Dewi',
  firstName: 'Sarah',
  lastName: 'Kusuma Dewi',
  email: 'sarah.kusuma@malaka.com',
  phone: '+62 812-3456-7890',
  dateOfBirth: '1992-05-15',
  gender: 'female',
  maritalStatus: 'married',
  nationality: 'Indonesian',
  religion: 'Islam',
  avatar: '/avatars/sarah-kusuma.jpg',
  
  address: {
    street: 'Jl. Sudirman No. 123',
    city: 'Jakarta',
    state: 'DKI Jakarta',
    postalCode: '12190',
    country: 'Indonesia'
  },
  
  emergencyContact: {
    name: 'Budi Kusuma',
    relationship: 'Spouse',
    phone: '+62 813-4567-8901',
    address: 'Jl. Sudirman No. 123, Jakarta'
  },
  
  position: 'Senior Product Manager',
  department: 'Product Development',
  division: 'Technology',
  manager: 'Ahmad Rahman',
  employmentType: 'full-time',
  employmentStatus: 'active',
  hireDate: '2020-03-15',
  workLocation: 'Jakarta Office',
  workSchedule: 'Monday - Friday, 9:00 AM - 6:00 PM',
  
  salary: {
    base: 15000000,
    currency: 'IDR',
    payFrequency: 'monthly',
    lastReview: '2024-01-15',
    nextReview: '2025-01-15'
  },
  
  education: [
    {
      id: '1',
      institution: 'Universitas Indonesia',
      degree: 'Bachelor of Computer Science',
      field: 'Information Systems',
      startYear: '2010',
      endYear: '2014',
      grade: '3.75 GPA',
      status: 'completed'
    },
    {
      id: '2',
      institution: 'Institut Teknologi Bandung',
      degree: 'Master of Business Administration',
      field: 'Technology Management',
      startYear: '2018',
      endYear: '2020',
      grade: '3.85 GPA',
      status: 'completed'
    }
  ],
  
  certifications: [
    {
      id: '1',
      name: 'Certified Product Manager (CPM)',
      issuer: 'Product Management Institute',
      issueDate: '2022-06-15',
      expiryDate: '2025-06-15',
      credentialId: 'CPM-2022-5678',
      verified: true
    },
    {
      id: '2',
      name: 'AWS Solutions Architect',
      issuer: 'Amazon Web Services',
      issueDate: '2023-03-20',
      expiryDate: '2026-03-20',
      credentialId: 'AWS-SA-2023-9012',
      verified: true
    }
  ],
  
  skills: [
    { id: '1', name: 'Product Management', category: 'Management', level: 'expert', endorsements: 25 },
    { id: '2', name: 'Agile/Scrum', category: 'Methodology', level: 'advanced', endorsements: 18 },
    { id: '3', name: 'Data Analysis', category: 'Technical', level: 'advanced', endorsements: 22 },
    { id: '4', name: 'UI/UX Design', category: 'Design', level: 'intermediate', endorsements: 15 },
    { id: '5', name: 'Python', category: 'Programming', level: 'intermediate', endorsements: 12 }
  ],
  
  languages: [
    { id: '1', language: 'Indonesian', proficiency: 'native' },
    { id: '2', language: 'English', proficiency: 'fluent', certification: 'TOEFL 580' },
    { id: '3', language: 'Mandarin', proficiency: 'conversational', certification: 'HSK Level 4' }
  ],
  
  performance: {
    currentRating: 4.2,
    lastReviewDate: '2024-01-15',
    nextReviewDate: '2025-01-15',
    goals: [
      {
        id: '1',
        title: 'Launch New Product Line',
        description: 'Successfully launch the premium sneaker collection',
        category: 'project',
        targetDate: '2024-12-31',
        status: 'in-progress',
        progress: 75
      },
      {
        id: '2',
        title: 'Team Leadership Development',
        description: 'Complete advanced leadership training program',
        category: 'learning',
        targetDate: '2024-10-30',
        status: 'in-progress',
        progress: 45
      }
    ],
    achievements: [
      {
        id: '1',
        title: 'Product of the Year Award',
        description: 'Led the development of best-selling product in 2023',
        date: '2023-12-15',
        type: 'award',
        issuer: 'Company Board'
      },
      {
        id: '2',
        title: 'Customer Satisfaction Excellence',
        description: 'Achieved 95% customer satisfaction rate',
        date: '2023-06-30',
        type: 'recognition',
        issuer: 'Customer Success Team'
      }
    ]
  },
  
  attendance: {
    totalWorkingDays: 240,
    presentDays: 235,
    absentDays: 5,
    lateDays: 8,
    overtimeHours: 45,
    attendanceRate: 97.9
  },
  
  leaveBalance: {
    annual: 12,
    sick: 8,
    personal: 3,
    maternity: 0,
    totalUsed: 8,
    totalRemaining: 15
  },
  
  benefits: [
    {
      id: '1',
      name: 'Health Insurance Premium',
      type: 'health',
      provider: 'Allianz Indonesia',
      coverage: 'Family Coverage',
      premium: 500000,
      status: 'active'
    },
    {
      id: '2',
      name: 'Life Insurance',
      type: 'life',
      provider: 'Prudential Indonesia',
      coverage: '10x Annual Salary',
      premium: 200000,
      status: 'active'
    },
    {
      id: '3',
      name: 'Retirement Plan',
      type: 'retirement',
      provider: 'Dana Pensiun Malaka',
      coverage: '10% Contribution',
      premium: 1500000,
      status: 'active'
    }
  ],
  
  preferences: {
    theme: 'light',
    language: 'en',
    timezone: 'Asia/Jakarta',
    dateFormat: 'DD/MM/YYYY',
    currency: 'IDR',
    notifications: {
      email: true,
      push: true,
      sms: false,
      desktop: true
    },
    privacy: {
      profileVisibility: 'colleagues',
      showSalary: false,
      showPerformance: true,
      showAttendance: true
    }
  }
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile)

  // Update profile with real user data when available
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        fullName: user.username || prev.fullName,
        firstName: user.username?.split(' ')[0] || prev.firstName,
        lastName: user.username?.split(' ').slice(1).join(' ') || prev.lastName,
        email: user.email || prev.email,
        id: user.id || prev.id
      }))
    }
  }, [user])

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Profile', href: '/profile' }
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: FileText },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'education', label: 'Education & Skills', icon: GraduationCap },
    { id: 'performance', label: 'Performance', icon: Target },
    { id: 'attendance', label: 'Attendance & Leave', icon: Clock },
    { id: 'benefits', label: 'Benefits', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ]

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-gray-400" />
            </div>
            <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full p-2">
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
                <p className="text-lg text-gray-600">{profile.position}</p>
                <p className="text-sm text-gray-500">{profile.department} • {profile.division}</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download CV
                </Button>
                <Button size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Employee ID</p>
                <p className="font-medium">{profile.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Join Date</p>
                <p className="font-medium">
                  {mounted ? new Date(profile.hireDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Work Location</p>
                <p className="font-medium">{profile.workLocation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge className="bg-green-100 text-green-800">
                  {profile.employmentStatus.charAt(0).toUpperCase() + profile.employmentStatus.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Performance Rating</p>
              <p className="text-xl font-bold text-gray-900">{profile.performance.currentRating}/5.0</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Attendance Rate</p>
              <p className="text-xl font-bold text-gray-900">{profile.attendance.attendanceRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Leave Balance</p>
              <p className="text-xl font-bold text-gray-900">{profile.leaveBalance.totalRemaining} days</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Award className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Achievements</p>
              <p className="text-xl font-bold text-gray-900">{profile.performance.achievements.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Goals</h3>
          <div className="space-y-4">
            {profile.performance.goals.map((goal) => (
              <div key={goal.id} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-gray-900">{goal.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                <div className="flex items-center justify-between">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{goal.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
          <div className="space-y-4">
            {profile.performance.achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-start space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                  <Award className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {mounted ? new Date(achievement.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )

  const EmploymentTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Employment Information</h3>
          <Button size="sm" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            View Contract
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
            <p className="text-sm text-gray-900 font-mono">{profile.employeeId}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <p className="text-sm text-gray-900">{profile.position}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <p className="text-sm text-gray-900">{profile.department}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
            <p className="text-sm text-gray-900">{profile.division}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Direct Manager</label>
            <p className="text-sm text-gray-900">{profile.manager}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
            <Badge className="bg-blue-100 text-blue-800 capitalize">
              {profile.employmentType.replace('-', ' ')}
            </Badge>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
            <Badge className={`capitalize ${
              profile.employmentStatus === 'active' ? 'bg-green-100 text-green-800' :
              profile.employmentStatus === 'probation' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {profile.employmentStatus}
            </Badge>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
            <p className="text-sm text-gray-900">
              {mounted ? new Date(profile.hireDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Location</label>
            <p className="text-sm text-gray-900">{profile.workLocation}</p>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Schedule</label>
            <p className="text-sm text-gray-900">{profile.workSchedule}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Compensation Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary</label>
            <p className="text-lg font-bold text-gray-900">
              {profile.salary.currency} {profile.salary.base.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 capitalize">{profile.salary.payFrequency}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Review</label>
            <p className="text-sm text-gray-900">
              {mounted ? new Date(profile.salary.lastReview).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Review</label>
            <p className="text-sm text-gray-900">
              {mounted ? new Date(profile.salary.nextReview).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Service</label>
            <p className="text-lg font-bold text-gray-900">
              {mounted ? Math.floor((new Date().getTime() - new Date(profile.hireDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0} years
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Organizational Chart</h3>
        
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{profile.manager}</p>
              <p className="text-sm text-gray-500">Direct Manager</p>
            </div>
            <div className="w-px h-8 bg-gray-300 mx-auto"></div>
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium text-gray-900 mt-2">{profile.fullName}</p>
              <p className="text-sm text-gray-500">{profile.position}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  const AttendanceTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Attendance Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{profile.attendance.attendanceRate}%</p>
            <p className="text-sm text-gray-500">Attendance Rate</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{profile.attendance.presentDays}</p>
            <p className="text-sm text-gray-500">Present Days</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{profile.attendance.absentDays}</p>
            <p className="text-sm text-gray-500">Absent Days</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{profile.attendance.overtimeHours}h</p>
            <p className="text-sm text-gray-500">Overtime Hours</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Leave Balance</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Annual Leave</p>
                <p className="text-sm text-blue-600">{profile.leaveBalance.annual} days remaining</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">{profile.leaveBalance.annual}</p>
                <p className="text-xs text-blue-600">days</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">Sick Leave</p>
                <p className="text-sm text-green-600">{profile.leaveBalance.sick} days remaining</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-900">{profile.leaveBalance.sick}</p>
                <p className="text-xs text-green-600">days</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="font-medium text-purple-900">Personal Leave</p>
                <p className="text-sm text-purple-600">{profile.leaveBalance.personal} days remaining</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-900">{profile.leaveBalance.personal}</p>
                <p className="text-xs text-purple-600">days</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Total Used</p>
                <p className="text-sm text-gray-600">This year</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{profile.leaveBalance.totalUsed}</p>
                <p className="text-xs text-gray-600">days</p>
              </div>
            </div>
          </div>
          
          <Button className="w-full mt-4">
            <Calendar className="h-4 w-4 mr-2" />
            Request Leave
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Attendance Details</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Working Days</span>
              <span className="font-medium">{profile.attendance.totalWorkingDays}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Present Days</span>
              <span className="font-medium text-green-600">{profile.attendance.presentDays}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Absent Days</span>
              <span className="font-medium text-red-600">{profile.attendance.absentDays}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Late Days</span>
              <span className="font-medium text-orange-600">{profile.attendance.lateDays}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overtime Hours</span>
              <span className="font-medium text-blue-600">{profile.attendance.overtimeHours}h</span>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Attendance Rate</span>
                <span className="text-lg font-bold text-green-600">{profile.attendance.attendanceRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${profile.attendance.attendanceRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )

  const PersonalInfoTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          <Button size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <p className="text-sm text-gray-900">{profile.fullName}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-sm text-gray-900">{profile.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <p className="text-sm text-gray-900">{profile.phone}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <p className="text-sm text-gray-900">
              {mounted ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <p className="text-sm text-gray-900 capitalize">{profile.gender}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
            <p className="text-sm text-gray-900 capitalize">{profile.maritalStatus}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
            <p className="text-sm text-gray-900">{profile.nationality}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
            <p className="text-sm text-gray-900">{profile.religion}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Address Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <p className="text-sm text-gray-900">{profile.address.street}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <p className="text-sm text-gray-900">{profile.address.city}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
            <p className="text-sm text-gray-900">{profile.address.state}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <p className="text-sm text-gray-900">{profile.address.postalCode}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <p className="text-sm text-gray-900">{profile.address.country}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Emergency Contact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
            <p className="text-sm text-gray-900">{profile.emergencyContact.name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
            <p className="text-sm text-gray-900">{profile.emergencyContact.relationship}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <p className="text-sm text-gray-900">{profile.emergencyContact.phone}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <p className="text-sm text-gray-900">{profile.emergencyContact.address}</p>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'personal':
        return <PersonalInfoTab />
      case 'employment':
        return <EmploymentTab />
      case 'education':
        return <div className="p-8 text-center text-gray-500">Education & Skills tab content would be here</div>
      case 'performance':
        return <div className="p-8 text-center text-gray-500">Performance tab content would be here</div>
      case 'attendance':
        return <AttendanceTab />
      case 'benefits':
        return <div className="p-8 text-center text-gray-500">Benefits tab content would be here</div>
      case 'preferences':
        return <div className="p-8 text-center text-gray-500">Preferences tab content would be here</div>
      default:
        return <OverviewTab />
    }
  }

  return (
    <TwoLevelLayout>
      <Header 
        title="My Profile"
        description="Manage your personal information and preferences"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile" }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6">
        {/* Compact Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                  ${activeTab === tab.id 
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 ' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>
      </div>
    </TwoLevelLayout>
  )
}