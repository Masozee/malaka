'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable, type AdvancedColumn } from '@/components/ui/advanced-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search01Icon,
  PlusSignIcon,
  Download01Icon,
  Building01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
} from '@hugeicons/core-free-icons'
import { Checkbox } from '@/components/ui/checkbox'

import type { ChartOfAccount } from '@/types/accounting'
import { apiClient } from '@/lib/api'

export default function ChartOfAccountsPage() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null)
  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    account_type: 'ASSET' as ChartOfAccount['account_type'],
    account_subtype: '',
    normal_balance: 'DEBIT' as 'DEBIT' | 'CREDIT',
    description: '',
    is_active: true,
    parent_account_id: '',
  })

  useEffect(() => {
    setMounted(true)
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get<{ success: boolean, message: string, data: ChartOfAccount[] }>('/api/v1/accounting/chart-of-accounts/')

      if (response.success && Array.isArray(response.data)) {
        setAccounts(response.data)
      } else {
        throw new Error(response.message || 'Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching accounts:', err)
      setError(err instanceof Error ? err.message : 'Failed to load accounts')
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingAccount(null)
    setFormData({
      account_code: '',
      account_name: '',
      account_type: 'ASSET',
      account_subtype: '',
      normal_balance: 'DEBIT',
      description: '',
      is_active: true,
      parent_account_id: '',
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (account: ChartOfAccount) => {
    setEditingAccount(account)
    setFormData({
      account_code: account.account_code,
      account_name: account.account_name,
      account_type: account.account_type,
      account_subtype: account.account_subtype || '',
      normal_balance: account.normal_balance,
      description: account.description || '',
      is_active: account.is_active,
      parent_account_id: account.parent_account_id || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (account: ChartOfAccount) => {
    if (!confirm(`Are you sure you want to delete account "${account.account_code} - ${account.account_name}"?`)) {
      return
    }

    try {
      await apiClient.delete(`/api/v1/accounting/chart-of-accounts/${account.id}`)
      fetchAccounts()
    } catch (err) {
      console.error('Error deleting account:', err)
      alert('Failed to delete account')
    }
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        parent_account_id: formData.parent_account_id || null,
      }

      if (editingAccount) {
        await apiClient.put(`/api/v1/accounting/chart-of-accounts/${editingAccount.id}`, payload)
      } else {
        await apiClient.post('/api/v1/accounting/chart-of-accounts/', payload)
      }

      setIsDialogOpen(false)
      fetchAccounts()
    } catch (err) {
      console.error('Error saving account:', err)
      alert('Failed to save account')
    }
  }

  const getTypeBadge = (type: ChartOfAccount['account_type']) => {
    const typeConfig = {
      'ASSET': { class: 'bg-blue-100 text-blue-800', label: 'Asset' },
      'LIABILITY': { class: 'bg-red-100 text-red-800', label: 'Liability' },
      'EQUITY': { class: 'bg-purple-100 text-purple-800', label: 'Equity' },
      'REVENUE': { class: 'bg-green-100 text-green-800', label: 'Revenue' },
      'EXPENSE': { class: 'bg-orange-100 text-orange-800', label: 'Expense' },
    }
    const config = typeConfig[type] || typeConfig.ASSET
    return <Badge className={config.class}>{config.label}</Badge>
  }

  const getBalanceBadge = (balance: 'DEBIT' | 'CREDIT') => {
    return balance === 'DEBIT'
      ? <Badge variant="outline" className="border-blue-200 text-blue-700">Debit</Badge>
      : <Badge variant="outline" className="border-green-200 text-green-700">Credit</Badge>
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? <Badge className="bg-green-100 text-green-800">Active</Badge>
      : <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
  }

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    if (!acc) return false
    if (searchTerm &&
        !acc.account_code?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !acc.account_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (typeFilter !== 'all' && acc.account_type !== typeFilter) return false
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && !acc.is_active) return false
      if (statusFilter === 'inactive' && acc.is_active) return false
    }
    return true
  })

  // Calculate summary stats
  const summaryStats = {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter(acc => acc?.is_active).length,
    assetAccounts: accounts.filter(acc => acc?.account_type === 'ASSET').length,
    liabilityAccounts: accounts.filter(acc => acc?.account_type === 'LIABILITY').length,
    equityAccounts: accounts.filter(acc => acc?.account_type === 'EQUITY').length,
    revenueAccounts: accounts.filter(acc => acc?.account_type === 'REVENUE').length,
    expenseAccounts: accounts.filter(acc => acc?.account_type === 'EXPENSE').length,
  }

  const columns: AdvancedColumn<ChartOfAccount>[] = [
    {
      key: 'account_code',
      title: 'Code',
      sortable: true,
      render: (_, record) => (
        <span className="font-mono font-medium">{record.account_code}</span>
      )
    },
    {
      key: 'account_name',
      title: 'Account Name',
      sortable: true,
      render: (_, record) => (
        <div>
          <p className="font-medium">{record.account_name}</p>
          {record.description && (
            <p className="text-xs text-muted-foreground truncate max-w-xs">{record.description}</p>
          )}
        </div>
      )
    },
    {
      key: 'account_type',
      title: 'Type',
      sortable: true,
      render: (_, record) => getTypeBadge(record.account_type)
    },
    {
      key: 'account_subtype',
      title: 'Subtype',
      sortable: true,
      render: (_, record) => (
        <span className="text-sm text-muted-foreground">{record.account_subtype || '-'}</span>
      )
    },
    {
      key: 'normal_balance',
      title: 'Normal Balance',
      sortable: true,
      render: (_, record) => getBalanceBadge(record.normal_balance)
    },
    {
      key: 'is_active',
      title: 'Status',
      sortable: true,
      render: (_, record) => getStatusBadge(record.is_active)
    }
  ]

  const breadcrumbs = [
    { label: 'Accounting', href: '/accounting' },
    { label: 'Chart of Accounts' }
  ]

  if (!mounted) return null

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Chart of Accounts"
          description="Manage your organization's financial account structure"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" aria-hidden="true" />
                Export
              </Button>
              <Button size="sm" onClick={handleCreate}>
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" aria-hidden="true" />
                Add Account
              </Button>
            </div>
          }
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={Building01Icon} className="h-5 w-5 text-foreground" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                  <p className="text-2xl font-bold">{summaryStats.totalAccounts}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Accounts</p>
                  <p className="text-2xl font-bold">{summaryStats.activeAccounts}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={ArrowUp01Icon} className="h-5 w-5 text-foreground" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Asset Accounts</p>
                  <p className="text-2xl font-bold">{summaryStats.assetAccounts}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={ArrowDown01Icon} className="h-5 w-5 text-foreground" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Liability Accounts</p>
                  <p className="text-2xl font-bold">{summaryStats.liabilityAccounts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="relative">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64 bg-white dark:bg-zinc-900"
                aria-label="Search accounts"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] bg-white dark:bg-zinc-900" aria-label="Filter by account type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ASSET">Asset</SelectItem>
                  <SelectItem value="LIABILITY">Liability</SelectItem>
                  <SelectItem value="EQUITY">Equity</SelectItem>
                  <SelectItem value="REVENUE">Revenue</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] bg-white dark:bg-zinc-900" aria-label="Filter by status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-8" role="status" aria-label="Loading accounts">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="sr-only">Loading accounts...</span>
            </div>
          ) : error ? (
            <div className="p-8 bg-card rounded-lg">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="flex items-center gap-2 text-red-600">
                  <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5" aria-hidden="true" />
                  <span>Error: {error}</span>
                </div>
                <Button onClick={fetchAccounts} variant="ghost" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <AdvancedDataTable
              columns={columns}
              data={filteredAccounts}
              pageSize={20}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Account' : 'Create Account'}</DialogTitle>
            <DialogDescription>
              {editingAccount ? 'Update account details below.' : 'Fill in the details for the new account.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_code">Account Code *</Label>
                <Input
                  id="account_code"
                  value={formData.account_code}
                  onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                  placeholder="e.g., 1100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_type">Account Type *</Label>
                <Select
                  value={formData.account_type}
                  onValueChange={(value) => setFormData({ ...formData, account_type: value as ChartOfAccount['account_type'] })}
                >
                  <SelectTrigger id="account_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSET">Asset</SelectItem>
                    <SelectItem value="LIABILITY">Liability</SelectItem>
                    <SelectItem value="EQUITY">Equity</SelectItem>
                    <SelectItem value="REVENUE">Revenue</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_name">Account Name *</Label>
              <Input
                id="account_name"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                placeholder="e.g., Cash and Cash Equivalents"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="account_subtype">Subtype</Label>
                <Input
                  id="account_subtype"
                  value={formData.account_subtype}
                  onChange={(e) => setFormData({ ...formData, account_subtype: e.target.value })}
                  placeholder="e.g., Current Asset"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="normal_balance">Normal Balance *</Label>
                <Select
                  value={formData.normal_balance}
                  onValueChange={(value) => setFormData({ ...formData, normal_balance: value as 'DEBIT' | 'CREDIT' })}
                >
                  <SelectTrigger id="normal_balance">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEBIT">Debit</SelectItem>
                    <SelectItem value="CREDIT">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_account_id">Parent Account</Label>
              <Select
                value={formData.parent_account_id || 'none'}
                onValueChange={(value) => setFormData({ ...formData, parent_account_id: value === 'none' ? '' : value })}
              >
                <SelectTrigger id="parent_account_id">
                  <SelectValue placeholder="Select parent account (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Parent</SelectItem>
                  {accounts
                    .filter(acc => acc.id !== editingAccount?.id)
                    .map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.account_code} - {acc.account_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked === true })}
              />
              <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingAccount ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TwoLevelLayout>
  )
}
