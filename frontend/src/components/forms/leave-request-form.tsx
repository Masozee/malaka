'use client'

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  Clock01Icon,
  UserIcon,
  SmartPhoneIcon,
  FileIcon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  CancelIcon
} from "@hugeicons/core-free-icons"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HRService } from '@/services/hr'
import type { LeaveRequest, LeaveFormData, LeaveType, Employee } from '@/types/hr'

interface LeaveRequestFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: LeaveFormData) => Promise<void>
  initialData?: LeaveRequest
  mode: 'create' | 'edit'
}

export function LeaveRequestForm({ isOpen, onClose, onSubmit, initialData, mode }: LeaveRequestFormProps) {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<LeaveFormData>({
    employee_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    emergency_contact: '',
    notes: ''
  })
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [totalDays, setTotalDays] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (initialData) {
        setFormData({
          employee_id: initialData.employee_id,
          leave_type_id: initialData.leave_type_id,
          start_date: initialData.start_date,
          end_date: initialData.end_date,
          reason: initialData.reason,
          emergency_contact: initialData.emergency_contact || '',
          notes: initialData.notes || ''
        })
      } else {
        // Reset form for new request
        setFormData({
          employee_id: '',
          leave_type_id: '',
          start_date: '',
          end_date: '',
          reason: '',
          emergency_contact: '',
          notes: ''
        })
      }
      setErrors({})
      setTotalDays(0)
    }
  }, [isOpen, initialData])

  useEffect(() => {
    calculateTotalDays()
  }, [formData.start_date, formData.end_date])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [employeesResponse, leaveTypesResponse] = await Promise.all([
        HRService.getEmployees(),
        HRService.getLeaveTypes()
      ])
      
      setEmployees(employeesResponse.data)
      setLeaveTypes(leaveTypesResponse)
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalDays = () => {
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      
      if (endDate >= startDate) {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // Include both start and end dates
        setTotalDays(diffDays)
      } else {
        setTotalDays(0)
      }
    } else {
      setTotalDays(0)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.employee_id) {
      newErrors.employee_id = 'Employee is required'
    }

    if (!formData.leave_type_id) {
      newErrors.leave_type_id = 'Leave type is required'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required'
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required'
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      
      if (endDate < startDate) {
        newErrors.end_date = 'End date must be after start date'
      }

      // Check if start date is in the past (only for new requests)
      if (mode === 'create') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (startDate < today) {
          newErrors.start_date = 'Start date cannot be in the past'
        }
      }
    }

    if (!formData.reason || formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters'
    }

    if (formData.emergency_contact && !/^[0-9+\-\s()]{10,}$/.test(formData.emergency_contact)) {
      newErrors.emergency_contact = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error submitting leave request:', error)
      setErrors({ general: 'Failed to save leave request. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof LeaveFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getSelectedEmployee = () => {
    return employees.find(emp => emp.id === formData.employee_id)
  }

  const getSelectedLeaveType = () => {
    return leaveTypes.find(type => type.id === formData.leave_type_id)
  }

  const getStatusIcon = () => {
    if (!initialData) return null
    
    switch (initialData.status) {
      case 'pending':
        return <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 text-yellow-600" />
      case 'approved':
        return <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <HugeiconsIcon icon={CancelIcon} className="h-4 w-4 text-red-600" />
      case 'cancelled':
        return <HugeiconsIcon icon={CancelIcon} className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    if (!initialData) return ''
    
    switch (initialData.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return ''
    }
  }

  if (!mounted) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <HugeiconsIcon icon={FileIcon} className="h-5 w-5" />
              <span>
                {mode === 'create' ? 'New Leave Request' : 'Edit Leave Request'}
              </span>
            </DialogTitle>
            {initialData && (
              <Badge className={getStatusColor()}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon()}
                  <span>{initialData.status.charAt(0).toUpperCase() + initialData.status.slice(1)}</span>
                </div>
              </Badge>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-center space-x-2 text-red-800">
                <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
                <span className="text-sm">{errors.general}</span>
              </div>
            </Card>
          )}

          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee_id" className="flex items-center space-x-2">
              <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
              <span>Employee *</span>
            </Label>
            <Select
              value={formData.employee_id}
              onValueChange={(value) => handleInputChange('employee_id', value)}
              disabled={loading || mode === 'edit'} // Disable employee selection when editing
            >
              <SelectTrigger className={errors.employee_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{employee.employee_name}</span>
                      <span className="text-sm text-gray-500">
                        {employee.employee_code} • {employee.department}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employee_id && (
              <p className="text-sm text-red-600">{errors.employee_id}</p>
            )}
          </div>

          {/* Employee Details Card */}
          {formData.employee_id && (
            <Card className="p-4 bg-blue-50">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900">Selected Employee</h4>
                {getSelectedEmployee() && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span> {getSelectedEmployee()?.employee_name}
                    </div>
                    <div>
                      <span className="text-gray-600">Department:</span> {getSelectedEmployee()?.department}
                    </div>
                    <div>
                      <span className="text-gray-600">Position:</span> {getSelectedEmployee()?.position}
                    </div>
                    <div>
                      <span className="text-gray-600">Code:</span> {getSelectedEmployee()?.employee_code}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Leave Type */}
          <div className="space-y-2">
            <Label htmlFor="leave_type_id" className="flex items-center space-x-2">
              <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
              <span>Leave Type *</span>
            </Label>
            <Select
              value={formData.leave_type_id}
              onValueChange={(value) => handleInputChange('leave_type_id', value)}
              disabled={loading}
            >
              <SelectTrigger className={errors.leave_type_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.name}</span>
                      {type.description && (
                        <span className="text-sm text-gray-500">{type.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leave_type_id && (
              <p className="text-sm text-red-600">{errors.leave_type_id}</p>
            )}
          </div>

          {/* Leave Type Details */}
          {formData.leave_type_id && (
            <Card className="p-4 bg-green-50">
              <div className="space-y-2">
                <h4 className="font-medium text-green-900">Leave Type Details</h4>
                {getSelectedLeaveType() && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Max Days/Year:</span> {getSelectedLeaveType()?.max_days_per_year}
                    </div>
                    <div>
                      <span className="text-gray-600">Paid Leave:</span> {getSelectedLeaveType()?.is_paid ? 'Yes' : 'No'}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className={errors.start_date ? 'border-red-500' : ''}
                min={mode === 'create' ? new Date().toISOString().split('T')[0] : undefined}
              />
              {errors.start_date && (
                <p className="text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className={errors.end_date ? 'border-red-500' : ''}
                min={formData.start_date || undefined}
              />
              {errors.end_date && (
                <p className="text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Total Days Display */}
          {totalDays > 0 && (
            <Card className="p-4 bg-purple-50">
              <div className="flex items-center space-x-2">
                <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-900">Total Days: {totalDays}</span>
              </div>
            </Card>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Please provide a detailed reason for your leave request..."
              className={errors.reason ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason}</p>
            )}
            <p className="text-sm text-gray-500">
              {formData.reason.length}/500 characters (minimum 10 required)
            </p>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-2">
            <Label htmlFor="emergency_contact" className="flex items-center space-x-2">
              <HugeiconsIcon icon={SmartPhoneIcon} className="h-4 w-4" />
              <span>Emergency Contact</span>
            </Label>
            <Input
              id="emergency_contact"
              name="emergency_contact"
              type="tel"
              value={formData.emergency_contact}
              onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
              placeholder="e.g., +62 812 3456 7890"
              className={errors.emergency_contact ? 'border-red-500' : ''}
            />
            {errors.emergency_contact && (
              <p className="text-sm text-red-600">{errors.emergency_contact}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional information or special requests..."
              rows={2}
            />
          </div>

          {/* Current Status Info (Edit Mode) */}
          {mode === 'edit' && initialData && (
            <Card className="p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Current Status</h4>
              <div className="space-y-1 text-sm">
                <div>Applied: {mounted ? new Date(initialData.applied_date).toLocaleDateString('id-ID') : ''}</div>
                {initialData.approved_by && (
                  <div>Approved by: {initialData.approved_by}</div>
                )}
                {initialData.approved_date && (
                  <div>Approved on: {mounted ? new Date(initialData.approved_date).toLocaleDateString('id-ID') : ''}</div>
                )}
                {initialData.rejected_reason && (
                  <div className="text-red-600">Rejection reason: {initialData.rejected_reason}</div>
                )}
              </div>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || loading}
              className="min-w-24"
            >
              {saving ? 'Saving...' : mode === 'create' ? 'Submit Request' : 'Update Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}