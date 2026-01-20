'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, Phone, Calendar, DollarSign } from 'lucide-react'
import type { Employee } from '@/types/hr'
import Link from 'next/link'

interface EmployeeCardProps {
  employee: Employee
}

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

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const initials = employee.employee_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="p-6 hover: transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <Link 
                href={`/hr/employees/${employee.id}`}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {employee.employee_name}
              </Link>
              <p className="text-sm text-gray-600">{employee.employee_code}</p>
            </div>
            <Badge className={`${statusColors[employee.employment_status]} text-white`}>
              {statusLabels[employee.employment_status]}
            </Badge>
          </div>

          <div className="mt-2">
            <p className="text-sm font-medium text-gray-900">{employee.position}</p>
            <p className="text-sm text-gray-600">{employee.department}</p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-2 text-gray-400" />
              <span className="truncate">{employee.email}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              <span>{employee.phone}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              <span>
                Hired: {mounted ? new Date(employee.hire_date).toLocaleDateString('id-ID') : ''}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
              <span>
                {mounted ? `Rp ${employee.total_salary.toLocaleString('id-ID')}` : ''}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                {employee.gender === 'M' ? 'Male' : 'Female'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {employee.marital_status}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {employee.bank_name}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}