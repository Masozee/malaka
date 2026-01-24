'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

import type { Employee } from '@/types/hr'
import { HRService } from '@/services/hr'
import { ProfileImageUpload } from '@/components/hr/profile-image-upload'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  UserCircleIcon,
  ArrowLeft01Icon,
  Download01Icon,
  File01Icon,
  PencilEdit01Icon,
  Clock01Icon,
  DollarCircleIcon,
  Briefcase01Icon,
  Building01Icon,
  Calendar01Icon,
  Mail01Icon,
  Call02Icon,
  Location01Icon,
  UserIcon,
  CreditCardIcon,
  Delete01Icon
} from '@hugeicons/core-free-icons'

const statusColors = {
  ACTIVE: 'bg-green-500',
  INACTIVE: 'bg-yellow-500',
  TERMINATED: 'bg-red-500'
}

const statusLabels = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  TERMINATED: 'Terminated'
}

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // API call to get employee by ID
    const fetchEmployee = async () => {
      setLoading(true)
      try {
        const employeeData = await HRService.getEmployeeById(params.id as string)
        setEmployee(employeeData)
      } catch (error) {
        console.error('Error fetching employee:', error)
        setEmployee(null)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchEmployee()
    }
  }, [params.id])

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Loading Employee..."
          breadcrumbs={[
            { label: 'HR', href: '/hr' },
            { label: 'Employees', href: '/hr/employees' },
            { label: 'Loading...', href: '#' }
          ]}
        />
        
        <div className="flex-1 p-6 space-y-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  if (!employee || !employee.employee_name) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Employee Not Found"
          breadcrumbs={[
            { label: 'HR', href: '/hr' },
            { label: 'Employees', href: '/hr/employees' },
            { label: 'Not Found', href: '#' }
          ]}
        />
        
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <HugeiconsIcon icon={UserCircleIcon} className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Employee not found</h3>
            <p className="text-gray-500 mb-4">The employee you&apos;re looking for doesn&apos;t exist or may have been removed.</p>
            <Link href="/hr/employees">
              <Button variant="outline">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                Back to Employees
              </Button>
            </Link>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const initials = (employee.employee_name || '')
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const breadcrumbs = [
    { label: 'HR', href: '/hr' },
    { label: 'Employees', href: '/hr/employees' },
    { label: employee.employee_name || 'Employee', href: `/hr/employees/${employee.id}` }
  ]

  const handleImageUpload = (imageUrl: string) => {
    // Update local employee state with new image URL
    if (employee) {
      setEmployee({
        ...employee,
        profile_image_url: imageUrl
      })
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      try {
        await HRService.deleteEmployee(employee.id)
        alert('Employee deleted successfully!')
        router.push('/hr/employees')
      } catch {
        alert('Failed to delete employee. Please try again.')
      }
    }
  }

  return (
    <TwoLevelLayout>
      <Header 
        title={employee.employee_name}
        description={`${employee.position} • ${employee.department}`}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={File01Icon} className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Link href={`/hr/employees/${employee.id}/edit`}>
              <Button size="sm">
                <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                Edit Employee
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Years of Service</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? Math.floor((new Date().getTime() - new Date(employee.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">years</p>
              </div>
              <HugeiconsIcon icon={Clock01Icon} className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Salary</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `Rp ${employee.total_salary.toLocaleString('id-ID')}` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">per month</p>
              </div>
              <HugeiconsIcon icon={DollarCircleIcon} className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Employment Status</p>
                <p className="text-2xl font-bold mt-1">{statusLabels[employee.employment_status]}</p>
                <Badge className={`${statusColors[employee.employment_status]} text-white text-xs mt-1`}>
                  {employee.employment_status}
                </Badge>
              </div>
              <HugeiconsIcon icon={Briefcase01Icon} className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Department</p>
                <p className="text-2xl font-bold mt-1">{employee.department}</p>
                <p className="text-sm text-muted-foreground mt-1">{employee.position}</p>
              </div>
              <HugeiconsIcon icon={Building01Icon} className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Employee Profile */}
            <Card className="p-6">
              <div className="flex items-start space-x-6 mb-6">
                <ProfileImageUpload
                  employee={employee}
                  onImageUpload={handleImageUpload}
                  size="xl"
                  editable={true}
                  showUploadButton={false}
                />
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {employee.employee_name}
                  </h1>
                  <p className="text-xl text-gray-600 mb-2">{employee.position}</p>
                  <p className="text-base text-gray-500 mb-4">
                    {employee.department} • Employee ID: {employee.employee_code}
                  </p>
                  <div className="flex items-center space-x-4">
                    <Badge className={`${statusColors[employee.employment_status]} text-white`}>
                      {statusLabels[employee.employment_status]}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 mr-1" />
                      Joined {mounted ? new Date(employee.hire_date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : ''}
                    </div>
                  </div>
                </div>
                
                <div className="ml-auto">
                  <ProfileImageUpload
                    employee={employee}
                    onImageUpload={handleImageUpload}
                    size="sm"
                    editable={true}
                    showUploadButton={true}
                  />
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HugeiconsIcon icon={Mail01Icon} className="h-5 w-5 mr-2" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <HugeiconsIcon icon={Mail01Icon} className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email Address</p>
                      <p className="text-sm text-gray-600">{employee.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <HugeiconsIcon icon={Call02Icon} className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone Number</p>
                      <p className="text-sm text-gray-600">{employee.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <HugeiconsIcon icon={Location01Icon} className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Address</p>
                      <p className="text-sm text-gray-600">{employee.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Personal Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HugeiconsIcon icon={UserIcon} className="h-5 w-5 mr-2" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Birth Date</p>
                    <p className="text-sm text-gray-600">
                      {mounted && employee.birth_date ? new Date(employee.birth_date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Not provided'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900">Gender</p>
                    <p className="text-sm text-gray-600">{employee.gender === 'M' ? 'Male' : 'Female'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900">Marital Status</p>
                    <p className="text-sm text-gray-600">{employee.marital_status}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">ID Number</p>
                    <p className="text-sm text-gray-600">{employee.id_number}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tax ID (NPWP)</p>
                    <p className="text-sm text-gray-600">{employee.tax_id}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Financial Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HugeiconsIcon icon={CreditCardIcon} className="h-5 w-5 mr-2" />
                Financial Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">Basic Salary</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {mounted ? `Rp ${employee.basic_salary.toLocaleString('id-ID')}` : ''}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-1">Allowances</p>
                    <p className="text-lg font-semibold text-green-600">
                      {mounted ? `Rp ${employee.allowances.toLocaleString('id-ID')}` : ''}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-1">Total Salary</p>
                    <p className="text-xl font-bold text-blue-900">
                      {mounted ? `Rp ${employee.total_salary.toLocaleString('id-ID')}` : ''}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">per month</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bank Account</p>
                    <p className="text-sm text-gray-600">{employee.bank_name}</p>
                    <p className="text-sm text-gray-600 font-mono">{employee.bank_account}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href={`/hr/employees/${employee.id}/edit`} className="w-full">
                  <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:border-blue-200 h-auto py-3">
                    <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Edit Employee</div>
                      <div className="text-xs text-muted-foreground mt-1">Update employee information</div>
                    </div>
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-green-50 hover:border-green-200 h-auto py-3"
                  onClick={() => window.open(`mailto:${employee.email}`, '_blank')}
                >
                  <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Send Email</div>
                    <div className="text-xs text-muted-foreground mt-1">{employee.email}</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-purple-50 hover:border-purple-200 h-auto py-3"
                  onClick={() => window.open(`tel:${employee.phone}`, '_blank')}
                >
                  <HugeiconsIcon icon={Call02Icon} className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Call Employee</div>
                    <div className="text-xs text-muted-foreground mt-1">{employee.phone}</div>
                  </div>
                </Button>

                <Link href={`/hr/payroll?employee=${employee.id}`} className="w-full">
                  <Button variant="outline" className="w-full justify-start hover:bg-orange-50 hover:border-orange-200 h-auto py-3">
                    <HugeiconsIcon icon={File01Icon} className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">View Payroll</div>
                      <div className="text-xs text-muted-foreground mt-1">Salary & payment history</div>
                    </div>
                  </Button>
                </Link>

                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-gray-50 hover:border-gray-200 h-auto py-3"
                  onClick={() => window.print()}
                >
                  <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Print Profile</div>
                    <div className="text-xs text-muted-foreground mt-1">Employee information sheet</div>
                  </div>
                </Button>
                
                <Separator className="my-3" />
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 h-auto py-3"
                  onClick={handleDelete}
                >
                  <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Delete Employee</div>
                    <div className="text-xs text-red-500 mt-1">Permanently remove from system</div>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Employee Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Profile Updated</p>
                    <p className="text-xs text-gray-500">
                      {mounted ? new Date(employee.updatedAt).toLocaleDateString('id-ID') : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Employee Hired</p>
                    <p className="text-xs text-gray-500">
                      {mounted ? new Date(employee.hire_date).toLocaleDateString('id-ID') : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-gray-300 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Profile Created</p>
                    <p className="text-xs text-gray-500">
                      {mounted ? new Date(employee.createdAt).toLocaleDateString('id-ID') : ''}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Employment Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Employee Code</span>
                  <span className="text-sm font-medium">{employee.employee_code}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Department</span>
                  <span className="text-sm font-medium">{employee.department}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Position</span>
                  <span className="text-sm font-medium">{employee.position}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge className={`${statusColors[employee.employment_status]} text-white text-xs`}>
                    {statusLabels[employee.employment_status]}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}