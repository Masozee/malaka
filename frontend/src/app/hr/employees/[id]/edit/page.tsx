'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import type { Employee, EmployeeFormData } from '@/types/hr'
import { HRService } from '@/services/hr'
import { ProfileImageUpload } from '@/components/hr/profile-image-upload'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, FloppyDiskIcon } from '@hugeicons/core-free-icons'

export default function EditEmployeePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    employee_code: '',
    employee_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    hire_date: '',
    birth_date: '',
    gender: 'M',
    marital_status: 'Single',
    address: '',
    id_number: '',
    tax_id: '',
    bank_account: '',
    bank_name: '',
    basic_salary: 0,
    allowances: 0,
    employment_status: 'ACTIVE',
    supervisor_id: null,
    profile_image_url: ''
  })

  useEffect(() => {
    setMounted(true)
    
    // Fetch employee data
    const fetchEmployee = async () => {
      try {
        setLoading(true)
        const employeeData = await HRService.getEmployeeById(params.id as string)
        setEmployee(employeeData)
        
        // Populate form with employee data
        setFormData({
          employee_code: employeeData.employee_code || '',
          employee_name: employeeData.employee_name || '',
          email: employeeData.email || '',
          phone: employeeData.phone || '', 
          position: employeeData.position || '',
          department: employeeData.department || '',
          hire_date: employeeData.hire_date ? employeeData.hire_date.split('T')[0] : '',
          birth_date: employeeData.birth_date ? employeeData.birth_date.split('T')[0] : '',
          gender: employeeData.gender || 'M',
          marital_status: employeeData.marital_status || 'Single',
          address: employeeData.address || '',
          id_number: employeeData.id_number || '',
          tax_id: employeeData.tax_id || '',
          bank_account: employeeData.bank_account || '',
          bank_name: employeeData.bank_name || '',
          basic_salary: employeeData.basic_salary || 0,
          allowances: employeeData.allowances || 0,
          employment_status: employeeData.employment_status || 'ACTIVE',
          supervisor_id: employeeData.supervisor_id || null,
          profile_image_url: employeeData.profile_image_url || ''
        })
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

  const handleInputChange = (field: keyof EmployeeFormData, value: string | number | Employee['employment_status'] | Employee['gender'] | Employee['marital_status']) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      profile_image_url: imageUrl
    }))
    
    // Also update employee state for immediate preview
    if (employee) {
      setEmployee({
        ...employee,
        profile_image_url: imageUrl
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Clean form data before submission
      const cleanedFormData = {
        ...formData,
        // Convert empty supervisor_id to null to avoid UUID parsing errors
        supervisor_id: formData.supervisor_id?.trim() || null
      }
      
      await HRService.updateEmployee(params.id as string, cleanedFormData)
      alert('Employee updated successfully!')
      router.push(`/hr/employees/${params.id}`)
    } catch (error) {
      console.error('Error updating employee:', error)
      alert('Failed to update employee. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !employee) {
    return (
      <TwoLevelLayout>
        <Header 
          title="Loading Employee..."
          breadcrumbs={[
            { label: 'HR', href: '/hr' },
            { label: 'Employees', href: '/hr/employees' },
            { label: 'Loading...', href: '#' },
            { label: 'Edit', href: '#' }
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

  const breadcrumbs = [
    { label: 'HR', href: '/hr' },
    { label: 'Employees', href: '/hr/employees' },
    { label: employee.employee_name, href: `/hr/employees/${employee.id}` },
    { label: 'Edit', href: `/hr/employees/${employee.id}/edit` }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title={`Edit ${employee.employee_name}`}
        description={`${employee.position} • ${employee.department}`}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Link href={`/hr/employees/${employee.id}`}>
              <Button variant="outline" size="sm">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </Link>
            <Button 
              size="sm" 
              onClick={handleSubmit}
              disabled={saving}
            >
              <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employee_code">Employee Code *</Label>
                    <Input
                      id="employee_code"
                      value={formData.employee_code}
                      onChange={(e) => handleInputChange('employee_code', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="employee_name">Full Name *</Label>
                    <Input
                      id="employee_name"
                      value={formData.employee_name}
                      onChange={(e) => handleInputChange('employee_name', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="hire_date">Hire Date *</Label>
                    <Input
                      id="hire_date"
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => handleInputChange('hire_date', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="birth_date">Birth Date</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select 
                      value={formData.gender} 
                      onValueChange={(value) => handleInputChange('gender', value as Employee['gender'])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="marital_status">Marital Status *</Label>
                    <Select 
                      value={formData.marital_status} 
                      onValueChange={(value) => handleInputChange('marital_status', value as Employee['marital_status'])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                </div>
              </Card>

              {/* Job Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Position *</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="employment_status">Employment Status *</Label>
                    <Select 
                      value={formData.employment_status} 
                      onValueChange={(value) => handleInputChange('employment_status', value as Employee['employment_status'])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="TERMINATED">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="basic_salary">Basic Salary (IDR) *</Label>
                    <Input
                      id="basic_salary"
                      type="number"
                      value={formData.basic_salary || ''}
                      onChange={(e) => handleInputChange('basic_salary', parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="allowances">Allowances (IDR)</Label>
                    <Input
                      id="allowances"
                      type="number"
                      value={formData.allowances || ''}
                      onChange={(e) => handleInputChange('allowances', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </Card>

              {/* Official Documents & Banking */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Official Documents & Banking</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="id_number">ID Number (KTP) *</Label>
                    <Input
                      id="id_number"
                      value={formData.id_number}
                      onChange={(e) => handleInputChange('id_number', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="tax_id">Tax ID (NPWP) *</Label>
                    <Input
                      id="tax_id"
                      value={formData.tax_id}
                      onChange={(e) => handleInputChange('tax_id', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bank_name">Bank Name *</Label>
                    <Input
                      id="bank_name"
                      value={formData.bank_name}
                      onChange={(e) => handleInputChange('bank_name', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bank_account">Bank Account Number *</Label>  
                    <Input
                      id="bank_account"
                      value={formData.bank_account}
                      onChange={(e) => handleInputChange('bank_account', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="supervisor_id">Supervisor ID</Label>
                    <Input
                      id="supervisor_id"
                      value={formData.supervisor_id || ''}
                      onChange={(e) => handleInputChange('supervisor_id', e.target.value || '')}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Image */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Image</h3>
                <div className="flex justify-center">
                  <ProfileImageUpload
                    employee={employee}
                    onImageUpload={handleImageUpload}
                    size="lg"
                    editable={true}
                    showUploadButton={true}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Upload a profile photo for this employee
                </p>
              </Card>

              {/* Form Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={saving}>
                    <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  
                  <Link href={`/hr/employees/${employee.id}`} className="w-full">
                    <Button type="button" variant="outline" className="w-full">
                      <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Employee Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employee Code:</span>
                    <span className="font-medium">{employee.employee_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Status:</span>
                    <Badge className={`text-xs ${
                      employee.employment_status === 'ACTIVE' ? 'bg-green-500' : 
                      employee.employment_status === 'INACTIVE' ? 'bg-yellow-500' : 'bg-red-500'
                    } text-white`}>
                      {employee.employment_status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Years of Service:</span>
                    <span className="font-medium">
                      {mounted ? Math.floor((new Date().getTime() - new Date(employee.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 0} years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Salary:</span>
                    <span className="font-medium">
                      {mounted ? `Rp ${employee.total_salary.toLocaleString('id-ID')}` : ''}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Current Values */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Values</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Basic Salary:</span>
                    <div className="font-medium">
                      {mounted ? `Rp ${employee.basic_salary.toLocaleString('id-ID')}` : ''}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Allowances:</span>
                    <div className="font-medium">
                      {mounted ? `Rp ${employee.allowances.toLocaleString('id-ID')}` : ''}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <div className="font-medium">{employee.department}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Position:</span>
                    <div className="font-medium">{employee.position}</div>
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