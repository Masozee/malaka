'use client'

import { HugeiconsIcon } from "@hugeicons/react"
import {
  CancelIcon,
  FilterIcon,
  RotateLeftIcon
} from "@hugeicons/core-free-icons"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import type { AccountingFilters } from '@/types/accounting'

interface JournalEntryFiltersProps {
  filters: AccountingFilters
  onFiltersChange: (filters: AccountingFilters) => void
  onClearFilters: () => void
}

export function JournalEntryFilters({ filters, onFiltersChange, onClearFilters }: JournalEntryFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleFilterChange = (key: keyof AccountingFilters, value: string | number | undefined) => {
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
    if (filters.status) {
      badges.push({ key: 'status', label: 'Status', value: filters.status })
    }
    if (filters.fiscal_year) {
      badges.push({ key: 'fiscal_year', label: 'Fiscal Year', value: filters.fiscal_year.toString() })
    }
    if (filters.period) {
      badges.push({ key: 'period', label: 'Period', value: filters.period })
    }
    if (filters.start_date || filters.end_date) {
      const dateRange = `${filters.start_date || ''} - ${filters.end_date || ''}`
      badges.push({ key: 'dateRange', label: 'Date Range', value: dateRange })
    }
    if (filters.min_amount || filters.max_amount) {
      const amountRange = `${filters.min_amount ? `Min: ${filters.min_amount.toLocaleString()}` : ''} ${filters.max_amount ? `Max: ${filters.max_amount.toLocaleString()}` : ''}`
      badges.push({ key: 'amount', label: 'Amount', value: amountRange })
    }
    if (filters.source_document) {
      badges.push({ key: 'source_document', label: 'Source Document', value: filters.source_document })
    }

    return badges
  }

  const removeBadgeFilter = (key: string) => {
    if (key === 'dateRange') {
      handleFilterChange('start_date', undefined)
      handleFilterChange('end_date', undefined)
    } else if (key === 'amount') {
      handleFilterChange('min_amount', undefined)
      handleFilterChange('max_amount', undefined)
    } else {
      handleFilterChange(key as keyof AccountingFilters, undefined)
    }
  }

  return (
    <div className="space-y-4">
      {/* Active Filter Badges */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {getActiveFilterBadges().map((badge) => (
            <Badge
              key={badge.key}
              variant="secondary"
              className="px-2 py-1"
            >
              <span className="text-xs">
                <strong>{badge.label}:</strong> {badge.value}
              </span>
            </Badge>
          ))}
        </div>
      )}

      {/* Main Filters Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Search - Left Side */}
        <div className="relative w-full md:w-96">
          <HugeiconsIcon
            icon={FilterIcon}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            id="search"
            placeholder="Search entry number, description, reference..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10 bg-white dark:bg-zinc-900"
          />
        </div>

        {/* Filters - Right Side */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={filters.status || ''}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-[130px] h-10 bg-white dark:bg-zinc-900">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {mounted && (
                <>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="POSTED">Posted</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          <Select
            value={filters.period || ''}
            onValueChange={(value) => handleFilterChange('period', value)}
          >
            <SelectTrigger className="w-[130px] h-10 bg-white dark:bg-zinc-900">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All periods</SelectItem>
              {mounted && (
                <>
                  <SelectItem value="2024-01">January 2024</SelectItem>
                  <SelectItem value="2024-02">February 2024</SelectItem>
                  <SelectItem value="2024-03">March 2024</SelectItem>
                  <SelectItem value="2024-04">April 2024</SelectItem>
                  <SelectItem value="2024-05">May 2024</SelectItem>
                  <SelectItem value="2024-06">June 2024</SelectItem>
                  <SelectItem value="2024-07">July 2024</SelectItem>
                  <SelectItem value="2024-08">August 2024</SelectItem>
                  <SelectItem value="2024-09">September 2024</SelectItem>
                  <SelectItem value="2024-10">October 2024</SelectItem>
                  <SelectItem value="2024-11">November 2024</SelectItem>
                  <SelectItem value="2024-12">December 2024</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="default"
              className="h-10"
              onClick={onClearFilters}
            >
              Clear
            </Button>
          )}

          <Select
            value={filters.fiscal_year?.toString() || ''}
            onValueChange={(value) => handleFilterChange('fiscal_year', value ? parseInt(value) : undefined)}
          >
            <SelectTrigger className="w-[130px] h-10 bg-white dark:bg-zinc-900">
              <SelectValue placeholder="Fiscal Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {mounted && (
                <>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="default"
            className="h-10"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Less' : 'Advanced'}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <Label htmlFor="start_date">Date From</Label>
            <Input
              id="start_date"
              type="date"
              value={filters.start_date || ''}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="bg-white dark:bg-zinc-900"
            />
          </div>

          <div>
            <Label htmlFor="end_date">Date To</Label>
            <Input
              id="end_date"
              type="date"
              value={filters.end_date || ''}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="bg-white dark:bg-zinc-900"
            />
          </div>

          <div>
            <Label htmlFor="min_amount">Min Amount (IDR)</Label>
            <Input
              id="min_amount"
              type="number"
              placeholder="e.g., 1000000"
              value={filters.min_amount || ''}
              onChange={(e) => handleFilterChange('min_amount', e.target.value ? parseInt(e.target.value) : undefined)}
              className="bg-white dark:bg-zinc-900"
            />
          </div>

          <div>
            <Label htmlFor="max_amount">Max Amount (IDR)</Label>
            <Input
              id="max_amount"
              type="number"
              placeholder="e.g., 50000000"
              value={filters.max_amount || ''}
              onChange={(e) => handleFilterChange('max_amount', e.target.value ? parseInt(e.target.value) : undefined)}
              className="bg-white dark:bg-zinc-900"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="source_document">Source Document</Label>
            <Input
              id="source_document"
              placeholder="e.g., Invoice, PO, Payroll..."
              value={filters.source_document || ''}
              onChange={(e) => handleFilterChange('source_document', e.target.value)}
              className="bg-white dark:bg-zinc-900"
            />
          </div>
        </div>
      )}
    </div>
  )
}