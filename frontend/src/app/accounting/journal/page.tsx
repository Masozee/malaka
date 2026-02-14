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
import { AdvancedDataTable, type AdvancedColumn } from '@/components/ui/advanced-data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
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
import {
  Dollar01Icon,
  FileScriptIcon,
  CheckmarkCircle01Icon,
  Edit01Icon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons'

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

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    confirmLabel: string
    variant: 'default' | 'destructive'
    onConfirm: () => Promise<void>
  }>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    variant: 'default',
    onConfirm: async () => {},
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
    }
  }

  const handleDeleteEntry = (entry: JournalEntry) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Journal Entry',
      description: `Are you sure you want to delete entry "${entry.entry_number}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
        await journalEntryService.delete(entry.id)
        setConfirmDialog(prev => ({ ...prev, open: false }))
        await fetchJournalEntries()
      },
    })
  }

  const handlePostEntry = (entry: JournalEntry) => {
    setConfirmDialog({
      open: true,
      title: 'Post Journal Entry',
      description: `Are you sure you want to post entry "${entry.entry_number}"? Posted entries cannot be modified.`,
      confirmLabel: 'Post Entry',
      variant: 'default',
      onConfirm: async () => {
        await journalEntryService.post(entry.id)
        setConfirmDialog(prev => ({ ...prev, open: false }))
        await fetchJournalEntries()
      },
    })
  }

  const openEditDialog = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setIsEditDialogOpen(true)
  }

  const breadcrumbs = [
    { label: 'Accounting', href: '/accounting' },
    { label: 'Journal Entries' }
  ]

  const columns: AdvancedColumn<JournalEntry>[] = [
    {
      key: 'entry_number',
      title: 'Entry Number',
      sortable: true,
      render: (_, record) => (
        <Link
          href={`/accounting/journal/${record.id}`}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-sm"
        >
          {record.entry_number}
        </Link>
      )
    },
    {
      key: 'entry_date',
      title: 'Date',
      sortable: true,
      render: (_, record) => (
        <span className="text-sm">
          {mounted ? new Date(record.entry_date).toLocaleDateString('id-ID') : record.entry_date}
        </span>
      )
    },
    {
      key: 'reference',
      title: 'Reference',
      render: (_, record) => (
        <span className="font-mono text-sm">{record.reference || '-'}</span>
      )
    },
    {
      key: 'description',
      title: 'Description',
      render: (_, record) => (
        <div className="max-w-xs truncate text-sm" title={record.description}>
          {record.description}
        </div>
      )
    },
    {
      key: 'total_debit',
      title: 'Amount',
      sortable: true,
      render: (_, record) => (
        <span className="font-medium text-sm">
          {mounted ? new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(record.total_debit) : `Rp ${record.total_debit.toLocaleString()}`}
        </span>
      )
    },
    {
      key: 'source_document',
      title: 'Source',
      render: (_, record) => (
        <span className="text-sm">{record.source_document || '-'}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (_, record) => (
        <Badge className={`${statusColors[record.status as keyof typeof statusColors]} text-white`}>
          {statusLabels[record.status as keyof typeof statusLabels]}
        </Badge>
      )
    },
  ]

  // Calculate summary statistics
  const summaryStats = {
    totalEntries: journalEntries.length,
    totalAmount: journalEntries.reduce((sum, entry) => sum + entry.total_debit, 0),
    draftEntries: journalEntries.filter(entry => entry.status === 'DRAFT').length,
    postedEntries: journalEntries.filter(entry => entry.status === 'POSTED').length
  }

  if (!mounted) return null

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Journal Entries"
          description="Manage and track all accounting journal entries"
          breadcrumbs={breadcrumbs}
          actions={
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
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

        <div className="flex-1 overflow-auto p-6 space-y-6 text-sm">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={FileScriptIcon} className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold">{summaryStats.totalEntries}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={Dollar01Icon} className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat('id-ID', {
                      notation: 'compact',
                      compactDisplay: 'short'
                    }).format(summaryStats.totalAmount)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={Edit01Icon} className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Draft Entries</p>
                  <p className="text-2xl font-bold">{summaryStats.draftEntries}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Posted Entries</p>
                  <p className="text-2xl font-bold">{summaryStats.postedEntries}</p>
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

          {/* Data Table */}
          <AdvancedDataTable
            columns={columns}
            data={journalEntries}
            loading={loading}
            pageSize={10}
            rowActions={[
              {
                label: 'View Detail',
                onClick: (r) => { window.location.href = `/accounting/journal/${r.id}` },
              },
              {
                label: 'Edit',
                onClick: (r) => openEditDialog(r),
                hidden: (r) => r.status !== 'DRAFT',
              },
              {
                label: 'Post',
                onClick: (r) => handlePostEntry(r),
                separator: true,
                disabled: (r) => r.status === 'POSTED' || r.status === 'CANCELLED',
                hidden: (r) => r.status === 'POSTED' || r.status === 'CANCELLED',
              },
              {
                label: 'Delete',
                onClick: (r) => handleDeleteEntry(r),
                className: 'text-red-600',
                separator: true,
                hidden: (r) => r.status === 'POSTED',
              },
            ]}
          />
        </div>
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
      />
    </TwoLevelLayout>
  )
}
