'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, X } from 'lucide-react'
import type { Employee, EmployeeFormData } from '@/types/hr'
import { HRService } from '@/services/hr'
import Link from 'next/link'

export default function NewEmployeePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [departments, setDepartments] = useState<string[]>([])
  const [positions, setPositions] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    // In a real app, you might fetch these from the API
    setDepartments(['Operasional', 'Penjualan', 'Logistik', 'Keuangan', 'IT', 'SDM', 'Keamanan', 'Maintenance', 'Administrasi', 'Produksi', 'Pemasaran'])
    setPositions(['Manager Operasional', 'Supervisor Penjualan', 'Staff Gudang', 'Kasir Senior', 'Driver Pengiriman', 'SPG Toko', 'Admin Keuangan', 'Security', 'HRD Staff', 'IT Support', 'Cleaning Service', 'Mekanik', 'Receptionist', 'Quality Control', 'Marketing Executive'])
  }, [])
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    employee_code: '',
    employee_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    hire_date: new Date().toISOString().split('T')[0],
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
    supervisor_id: undefined
  })

  const handleInputChange = (field: keyof EmployeeFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await HRService.createEmployee(formData)
      alert('Employee created successfully!')
      router.push('/hr/employees')
    } catch (error) {
      console.error('Error creating employee:', error)
      alert('Failed to create employee. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: 'HR', href: '/hr' },
    { label: 'Employees', href: '/hr/employees' },
    { label: 'New Employee', href: '/hr/employees/new' }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="New Employee"
        description="Add a new employee to your organization"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/hr/employees">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Employees
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-6">
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
                      placeholder="e.g., EMP016"
                      value={formData.employee_code}
                      onChange={(e) => handleInputChange('employee_code', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="employee_name">Full Name *</Label>
                    <Input
                      id="employee_name"
                      placeholder="Enter full name"
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
                      placeholder="employee@malaka.co.id"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      placeholder="081234567890"
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
                      onValueChange={(value) => handleInputChange('gender', value)}
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
                      onValueChange={(value) => handleInputChange('marital_status', value)}
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

                  <div>
                    <Label htmlFor="id_number">ID Number</Label>
                    <Input
                      id="id_number"
                      placeholder="3171051205850001"
                      value={formData.id_number}
                      onChange={(e) => handleInputChange('id_number', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tax_id">Tax ID</Label>
                    <Input
                      id="tax_id"
                      placeholder="12.345.678.9-012.000"
                      value={formData.tax_id}
                      onChange={(e) => handleInputChange('tax_id', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="employment_status">Employment Status *</Label>
                    <Select 
                      value={formData.employment_status} 
                      onValueChange={(value) => handleInputChange('employment_status', value)}
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
                </div>

                <div className="mt-4">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter complete address"
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
                    <Select 
                      value={formData.position} 
                      onValueChange={(value) => handleInputChange('position', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {mounted && positions.map((position) => (
                          <SelectItem key={position} value={position}>{position}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(value) => handleInputChange('department', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {mounted && departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="basic_salary">Basic Salary (IDR) *</Label>
                    <Input
                      id="basic_salary"
                      type="number"
                      placeholder="e.g., 8500000"
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
                      placeholder="e.g., 2000000"
                      value={formData.allowances || ''}
                      onChange={(e) => handleInputChange('allowances', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </Card>

              {/* Banking Information */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Banking Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Select 
                      value={formData.bank_name} 
                      onValueChange={(value) => handleInputChange('bank_name', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {mounted && ['Bank BCA', 'Bank Mandiri', 'Bank BNI', 'Bank BRI', 'Bank CIMB Niaga', 'Bank Danamon'].map((bank) => (
                          <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bank_account">Bank Account Number</Label>
                    <Input
                      id="bank_account"
                      placeholder="1234567890"
                      value={formData.bank_account}
                      onChange={(e) => handleInputChange('bank_account', e.target.value)}
                    />
                  </div>
                </div>
              </Card>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Form Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Creating...' : 'Create Employee'}
                  </Button>
                  
                  <Link href="/hr/employees" className="w-full">
                    <Button type="button" variant="outline" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Form Tips */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <p>Employee ID should be unique and follow company format</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <p>Use company email domain for work email addresses</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <p>Emergency contact information is required for all employees</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2"></div>
                    <p>Skills help with project assignments and career development</p>
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