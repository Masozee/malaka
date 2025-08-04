'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Filter, RotateCcw } from 'lucide-react'
import type { Employee, EmployeeFilters } from '@/types/hr'
import { mockDepartments, mockDivisions, mockPositions } from '@/services/hr'

interface EmployeeFiltersProps {
  filters: EmployeeFilters
  onFiltersChange: (filters: EmployeeFilters) => void
  onClearFilters: () => void
}

export function EmployeeFilters({ filters, onFiltersChange, onClearFilters }: EmployeeFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleFilterChange = (key: keyof EmployeeFilters, value: string | number | Employee['status'] | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' || value === 'all' ? undefined : value
    })
  }

  const activeFiltersCount = Object.values(filters).filter(
    value => value !== undefined && value !== ''
  ).length

  const getActiveFilterBadges = () => {
    const badges = []
    
    if (filters.search) {
      badges.push({ key: 'search', label: 'Search', value: filters.search })
    }
    if (filters.department) {
      badges.push({ key: 'department', label: 'Department', value: filters.department })
    }
    if (filters.division) {
      badges.push({ key: 'division', label: 'Division', value: filters.division })
    }
    if (filters.position) {
      badges.push({ key: 'position', label: 'Position', value: filters.position })
    }
    if (filters.status) {
      badges.push({ key: 'status', label: 'Status', value: filters.status })
    }
    if (filters.hireStartDate || filters.hireEndDate) {
      const dateRange = `${filters.hireStartDate || ''} - ${filters.hireEndDate || ''}`
      badges.push({ key: 'hireDate', label: 'Hire Date', value: dateRange })
    }
    if (filters.salaryMin || filters.salaryMax) {
      const salaryRange = `${filters.salaryMin ? `Min: ${filters.salaryMin.toLocaleString('id-ID')}` : ''} ${filters.salaryMax ? `Max: ${filters.salaryMax.toLocaleString('id-ID')}` : ''}`
      badges.push({ key: 'salary', label: 'Salary', value: salaryRange })
    }

    return badges
  }

  const removeBadgeFilter = (key: string) => {
    if (key === 'hireDate') {
      handleFilterChange('hireStartDate', undefined)
      handleFilterChange('hireEndDate', undefined)
    } else if (key === 'salary') {
      handleFilterChange('salaryMin', undefined)
      handleFilterChange('salaryMax', undefined)
    } else {
      handleFilterChange(key as keyof EmployeeFilters, undefined)
    }
  }

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFilters}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Less Filters' : 'More Filters'}
          </Button>
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {getActiveFilterBadges().map((badge) => (
            <Badge 
              key={badge.key} 
              variant="secondary" 
              className="pl-2 pr-1 py-1 flex items-center gap-1"
            >
              <span className="text-xs">
                <strong>{badge.label}:</strong> {badge.value}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeBadgeFilter(badge.key)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Name, email, or employee ID..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="department">Department</Label>
          <Select 
            value={filters.department || ''} 
            onValueChange={(value) => handleFilterChange('department', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {mounted && mockDepartments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="division">Division</Label>
          <Select 
            value={filters.division || ''} 
            onValueChange={(value) => handleFilterChange('division', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All divisions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All divisions</SelectItem>
              {mounted && mockDivisions.map((div) => (
                <SelectItem key={div} value={div}>{div}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={filters.status || ''} 
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <Label htmlFor="position">Position</Label>
            <Select 
              value={filters.position || ''} 
              onValueChange={(value) => handleFilterChange('position', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All positions</SelectItem>
                {mounted && mockPositions.map((pos) => (
                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hireStartDate">Hire Date From</Label>
            <Input
              id="hireStartDate"
              type="date"
              value={filters.hireStartDate || ''}
              onChange={(e) => handleFilterChange('hireStartDate', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="hireEndDate">Hire Date To</Label>
            <Input
              id="hireEndDate"
              type="date"
              value={filters.hireEndDate || ''}
              onChange={(e) => handleFilterChange('hireEndDate', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="salaryMin">Min Salary (IDR)</Label>
            <Input
              id="salaryMin"
              type="number"
              placeholder="e.g., 5000000"
              value={filters.salaryMin || ''}
              onChange={(e) => handleFilterChange('salaryMin', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <Label htmlFor="salaryMax">Max Salary (IDR)</Label>
            <Input
              id="salaryMax"
              type="number"
              placeholder="e.g., 20000000"
              value={filters.salaryMax || ''}
              onChange={(e) => handleFilterChange('salaryMax', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>
      )}
    </Card>
  )
}