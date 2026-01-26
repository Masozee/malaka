'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DataTable } from '@/components/ui/data-table'
import { JournalEntryFilters } from '@/components/accounting/journal-entry-filters'
import { JournalEntryForm } from '@/components/accounting/journal-entry-form'

import type { 
  JournalEntry, 
  AccountingFilters,
  CreateJournalEntryRequest,
  UpdateJournalEntryRequest
} from '@/types/accounting'
import { journalEntryService } from '@/services/accounting'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { Calendar01Icon, Dollar01Icon } from '@hugeicons/core-free-icons'

const statusColors = {
  DRAFT: 'bg-gray-500',
  PENDING: 'bg-yellow-500',
  POSTED: 'bg-green-500',
  CANCELLED: 'bg-red-500'
}

const statusLabels = {
  DRAFT: 'Draft',
  PENDING: 'Pending',
  POSTED: 'Posted',
  CANCELLED: 'Cancelled'
}

export default function AccountingJournalPage() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [filters, setFilters] = useState<AccountingFilters>({
    page: 1,
    limit: 10
  })

  useEffect(() => {
    setMounted(true)
    fetchJournalEntries()
  }, [filters])

  const fetchJournalEntries = async () => {
    try {
      setLoading(true)
      const response = await journalEntryService.getAll(filters)
      setJournalEntries(response.data)
    } catch (error) {
      console.error('Error fetching journal entries:', error)
      // Set empty array on error
      setJournalEntries([])
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: AccountingFilters) => {
    setFilters({
      ...newFilters,
      page: 1
    })
  }

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10
    })
  }

  const handleCreateEntry = async (request: CreateJournalEntryRequest) => {
    try {
      await journalEntryService.create(request)
      setIsCreateDialogOpen(false)
      await fetchJournalEntries()
    } catch (error) {
      console.error('Error creating journal entry:', error)
      alert('Failed to create journal entry. Please try again.')
    }
  }

  const handleEditEntry = async (request: UpdateJournalEntryRequest) => {
    if (!selectedEntry) return

    try {
      await journalEntryService.update(selectedEntry.id, request)
      setIsEditDialogOpen(false)
      setSelectedEntry(null)
      await fetchJournalEntries()
    } catch (error) {
      console.error('Error updating journal entry:', error)
      alert('Failed to update journal entry. Please try again.')
    }
  }

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      return
    }

    try {
      await journalEntryService.delete(id)
      await fetchJournalEntries()
    } catch (error) {
      console.error('Error deleting journal entry:', error)
      alert('Failed to delete journal entry. Please try again.')
    }
  }

  const handlePostEntry = async (id: string) => {
    if (!window.confirm('Are you sure you want to post this journal entry? Posted entries cannot be modified.')) {
      return
    }

    try {
      await journalEntryService.post(id)
      await fetchJournalEntries()
    } catch (error) {
      console.error('Error posting journal entry:', error)
      alert('Failed to post journal entry. Please try again.')
    }
  }

  const openEditDialog = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setIsEditDialogOpen(true)
  }

  const breadcrumbs = [
    { label: 'Accounting', href: '/accounting' },
    { label: 'Journal Entries', href: '/accounting/journal' }
  ]

  const columns = [
    {
      key: 'entry_number' as keyof JournalEntry,
      title: 'Entry Number',
      render: (value: unknown, record: JournalEntry) => (
        <Link 
          href={`/accounting/journal/${record.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {record.entry_number}
        </Link>
      )
    },
    {
      key: 'entry_date' as keyof JournalEntry,
      title: 'Date',
      render: (value: unknown, record: JournalEntry) => (
        <div className="flex items-center space-x-2">
          <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-gray-400" />
          <span>
            {mounted ? new Date(record.entry_date).toLocaleDateString('id-ID') : record.entry_date}
          </span>
        </div>
      )
    },
    {
      key: 'reference' as keyof JournalEntry,
      title: 'Reference',
      render: (value: unknown, record: JournalEntry) => (
        <span className="font-mono text-xs">{record.reference}</span>
      )
    },
    {
      key: 'description' as keyof JournalEntry,
      title: 'Description',
      render: (value: unknown, record: JournalEntry) => (
        <div className="max-w-xs truncate" title={record.description}>
          {record.description}
        </div>
      )
    },
    {
      key: 'total_debit' as keyof JournalEntry,
      title: 'Amount',
      render: (value: unknown, record: JournalEntry) => (
        <div className="flex items-center space-x-1">
          <HugeiconsIcon icon={Dollar01Icon} className="h-4 w-4 text-gray-400" />
          <span className="font-medium">
            {mounted ? new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(record.total_debit) : `Rp ${record.total_debit.toLocaleString()}`}
          </span>
        </div>
      )
    },
    {
      key: 'status' as keyof JournalEntry,
      title: 'Status',
      render: (value: unknown, record: JournalEntry) => (
        <Badge className={`${statusColors[record.status as keyof typeof statusColors]} text-white`}>
          {statusLabels[record.status as keyof typeof statusLabels]}
        </Badge>
      )
    },
    {
      key: 'source_document' as keyof JournalEntry,
      title: 'Source',
      render: (value: unknown, record: JournalEntry) => (
        record.source_document && (
          <div className="flex items-center space-x-1">
            <span className="text-xs">{record.source_document}</span>
          </div>
        )
      )
    },
    {
      key: 'id' as keyof JournalEntry,
      title: 'Actions',
      render: (value: unknown, record: JournalEntry) => (
        <div className="flex items-center space-x-2">
          <Link href={`/accounting/journal/${record.id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>

          {record.status === 'DRAFT' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(record)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePostEntry(record.id)}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                Post
              </Button>
            </>
          )}

          {(record.status === 'DRAFT' || record.status === 'CANCELLED') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteEntry(record.id)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Delete
            </Button>
          )}
        </div>
      )
    }
  ]

  // Calculate summary statistics
  const summaryStats = {
    totalEntries: journalEntries.length,
    totalAmount: journalEntries.reduce((sum, entry) => sum + entry.total_debit, 0),
    draftEntries: journalEntries.filter(entry => entry.status === 'DRAFT').length,
    postedEntries: journalEntries.filter(entry => entry.status === 'POSTED').length
  }

  return (
    <TwoLevelLayout>
      <Header 
        title="Journal Entries"
        description="Manage and track all accounting journal entries"
        breadcrumbs={breadcrumbs}
        actions={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                New Journal Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Journal Entry</DialogTitle>
              </DialogHeader>
              <JournalEntryForm
                onSubmit={handleCreateEntry}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summaryStats.totalEntries}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {mounted ? new Intl.NumberFormat('id-ID', {
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(summaryStats.totalAmount) : summaryStats.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Draft Entries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summaryStats.draftEntries}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Posted Entries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summaryStats.postedEntries}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <JournalEntryFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Export Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {journalEntries.length} entries found
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={journalEntries}
          loading={loading}
          pagination={{
            current: filters.page || 1,
            pageSize: filters.limit || 10,
            total: journalEntries.length,
            onChange: (page, pageSize) => setFilters(prev => ({ ...prev, page, limit: pageSize }))
          }}
        />
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Journal Entry</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <JournalEntryForm
              journalEntry={selectedEntry}
              onSubmit={handleEditEntry}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </TwoLevelLayout>
  )
}