'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

import Link from 'next/link'
import { cashBankService } from '@/services/accounting'

// Mock cash and bank account data
interface CashBankAccount {
  id: string
  account_code: string
  account_name: string
  account_type: 'cash' | 'bank'
  bank_name?: string
  account_number?: string
  currency: string
  balance: number
  last_transaction_date: string
  status: 'active' | 'inactive' | 'closed'
  transactions_count: number
}

interface CashBankTransaction {
  id: string
  account_id: string
  account_name: string
  transaction_date: string
  reference: string
  description: string
  transaction_type: 'deposit' | 'withdrawal' | 'transfer'
  amount: number
  running_balance: number
  status: 'pending' | 'cleared' | 'cancelled'
  created_by: string
}

export default function CashBankPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<CashBankAccount[]>([])
  const [transactions, setTransactions] = useState<CashBankTransaction[]>([])
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions'>('accounts')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('all')
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [accountsResponse, transactionsResponse] = await Promise.all([
        cashBankService.getAll(),
        cashBankService.getTransactions()
      ])
      
      setAccounts(accountsResponse.data || [])
      setTransactions(transactionsResponse.data || [])
    } catch (error) {
      console.error('Error fetching cash/bank data:', error)
      // Set empty arrays on error
      setAccounts([])
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount?: number, currency = 'IDR'): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    if (currency === 'USD') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    }
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const breadcrumbs = [
    { label: 'Accounting', href: '/accounting' },
    { label: 'Cash & Bank', href: '/accounting/cash-bank' }
  ]

  // Filter accounts
  const filteredAccounts = accounts.filter(account => {
    if (searchTerm && !account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !account.account_code.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (statusFilter !== 'all' && account.status !== statusFilter) return false
    if (accountTypeFilter !== 'all' && account.account_type !== accountTypeFilter) return false
    return true
  })

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (statusFilter !== 'all' && transaction.status !== statusFilter) return false
    if (transactionTypeFilter !== 'all' && transaction.transaction_type !== transactionTypeFilter) return false
    return true
  })

  // Summary statistics
  const summaryStats = {
    totalCashAccounts: accounts.filter(acc => acc.account_type === 'cash').length,
    totalBankAccounts: accounts.filter(acc => acc.account_type === 'bank').length,
    totalCashBalance: accounts.filter(acc => acc.account_type === 'cash' && acc.currency === 'IDR').reduce((sum, acc) => sum + acc.balance, 0),
    totalBankBalance: accounts.filter(acc => acc.account_type === 'bank' && acc.currency === 'IDR').reduce((sum, acc) => sum + acc.balance, 0),
    totalUSDBalance: accounts.filter(acc => acc.currency === 'USD').reduce((sum, acc) => sum + acc.balance, 0),
    totalTransactions: transactions.length,
    pendingTransactions: transactions.filter(txn => txn.status === 'pending').length
  }

  const getStatusBadge = (status: string) => {
    const config = {
      active: { variant: 'default' as const, label: 'Active' },
      inactive: { variant: 'secondary' as const, label: 'Inactive' },
      closed: { variant: 'destructive' as const, label: 'Closed' },
      pending: { variant: 'secondary' as const, label: 'Pending' },
      cleared: { variant: 'default' as const, label: 'Cleared' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' }
    }
    return config[status as keyof typeof config] || { variant: 'secondary' as const, label: status }
  }

  const getTransactionTypeBadge = (type: string) => {
    const config = {
      deposit: { variant: 'default' as const, label: 'Deposit', color: 'text-green-600' },
      withdrawal: { variant: 'outline' as const, label: 'Withdrawal', color: 'text-red-600' },
      transfer: { variant: 'secondary' as const, label: 'Transfer', color: 'text-blue-600' }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type, color: 'text-gray-600' }
  }

  const accountColumns = [
    {
      key: 'account_code' as keyof CashBankAccount,
      title: 'Account',
      render: (value: unknown, account: CashBankAccount) => (
        <div>
          <div className="font-medium">{account.account_code}</div>
          <div className="text-xs text-muted-foreground">{account.account_name}</div>
        </div>
      )
    },
    {
      key: 'account_type' as keyof CashBankAccount,
      title: 'Type',
      render: (value: unknown, account: CashBankAccount) => (
        <div className="flex items-center space-x-2">
          <span className="capitalize">{account.account_type}</span>
        </div>
      )
    },
    {
      key: 'bank_name' as keyof CashBankAccount,
      title: 'Bank Details',
      render: (value: unknown, account: CashBankAccount) => (
        account.account_type === 'bank' ? (
          <div>
            <div className="font-medium">{account.bank_name}</div>
            <div className="text-xs text-muted-foreground font-mono">{account.account_number}</div>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      )
    },
    {
      key: 'balance' as keyof CashBankAccount,
      title: 'Balance',
      render: (value: unknown, account: CashBankAccount) => (
        <div className="text-right">
          <div className="font-medium text-lg">
            {formatCurrency(account.balance, account.currency)}
          </div>
          <div className="text-xs text-muted-foreground">{account.currency}</div>
        </div>
      )
    },
    {
      key: 'transactions_count' as keyof CashBankAccount,
      title: 'Transactions',
      render: (value: unknown, account: CashBankAccount) => (
        <div className="text-center">
          <div className="font-medium">{account.transactions_count}</div>
          <div className="text-xs text-muted-foreground">total</div>
        </div>
      )
    },
    {
      key: 'last_transaction_date' as keyof CashBankAccount,
      title: 'Last Activity',
      render: (value: unknown, account: CashBankAccount) => (
        <div className="text-xs">{formatDate(account.last_transaction_date)}</div>
      )
    },
    {
      key: 'status' as keyof CashBankAccount,
      title: 'Status',
      render: (value: unknown, account: CashBankAccount) => {
        const { variant, label } = getStatusBadge(account.status)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'id' as keyof CashBankAccount,
      title: 'Actions',
      render: (value: unknown, account: CashBankAccount) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/accounting/cash-bank/${account.id}`}>
              View
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/accounting/cash-bank/${account.id}/edit`}>
              Edit
            </Link>
          </Button>
          <Button variant="ghost" size="sm">
            Delete
          </Button>
        </div>
      )
    }
  ]

  const transactionColumns = [
    {
      key: 'transaction_date' as keyof CashBankTransaction,
      title: 'Date',
      render: (value: unknown, transaction: CashBankTransaction) => (
        <div className="flex items-center space-x-2">
          <span>{formatDate(transaction.transaction_date)}</span>
        </div>
      )
    },
    {
      key: 'reference' as keyof CashBankTransaction,
      title: 'Reference',
      render: (value: unknown, transaction: CashBankTransaction) => (
        <div className="font-mono text-xs font-medium">{transaction.reference}</div>
      )
    },
    {
      key: 'account_name' as keyof CashBankTransaction,
      title: 'Account',
      render: (value: unknown, transaction: CashBankTransaction) => (
        <div className="font-medium">{transaction.account_name}</div>
      )
    },
    {
      key: 'description' as keyof CashBankTransaction,
      title: 'Description',
      render: (value: unknown, transaction: CashBankTransaction) => (
        <div className="max-w-xs truncate">{transaction.description}</div>
      )
    },
    {
      key: 'transaction_type' as keyof CashBankTransaction,
      title: 'Type',
      render: (value: unknown, transaction: CashBankTransaction) => {
        const { variant, label } = getTransactionTypeBadge(transaction.transaction_type)
        return (
          <div className="flex items-center space-x-2">
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'amount' as keyof CashBankTransaction,
      title: 'Amount',
      render: (value: unknown, transaction: CashBankTransaction) => (
        <div className={`text-right font-medium ${
          transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
        }`}>
          {transaction.transaction_type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </div>
      )
    },
    {
      key: 'running_balance' as keyof CashBankTransaction,
      title: 'Balance',
      render: (value: unknown, transaction: CashBankTransaction) => (
        <div className="text-right font-medium">{formatCurrency(transaction.running_balance)}</div>
      )
    },
    {
      key: 'status' as keyof CashBankTransaction,
      title: 'Status',
      render: (value: unknown, transaction: CashBankTransaction) => {
        const { variant, label } = getStatusBadge(transaction.status)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'id' as keyof CashBankTransaction,
      title: 'Actions',
      render: (value: unknown, transaction: CashBankTransaction) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            View
          </Button>
          {transaction.status === 'pending' && (
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Cash & Bank"
        description="Manage cash accounts, bank accounts, and financial transactions"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm" asChild>
              <Link href="/accounting/cash-bank/new">
                New Account
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cash Accounts</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalCashAccounts}</p>
                <p className="text-sm text-green-600 mt-1">Active accounts</p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bank Accounts</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalBankAccounts}</p>
                <p className="text-sm text-blue-600 mt-1">Active accounts</p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cash Balance</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `Rp ${(summaryStats.totalCashBalance / 1000000).toFixed(1)}M` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">Total cash</p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bank Balance</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `Rp ${(summaryStats.totalBankBalance / 1000000).toFixed(1)}M` : ''}
                </p>
                <p className="text-sm text-blue-600 mt-1">Total banks</p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Input
                placeholder="Search accounts or transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-3"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cleared">Cleared</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {activeTab === 'accounts' && (
              <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                </SelectContent>
              </Select>
            )}

            {activeTab === 'transactions' && (
              <Select value={transactionTypeFilter} onValueChange={setTransactionTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* View Toggle & Sort */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <Button
                variant={activeTab === 'accounts' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('accounts')}
              >
                Accounts
              </Button>
              <Button
                variant={activeTab === 'transactions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('transactions')}
              >
                Transactions
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {activeTab === 'accounts' 
              ? `${filteredAccounts.length} of ${accounts.length} accounts`
              : `${filteredTransactions.length} of ${transactions.length} transactions`
            }
          </div>
        </div>

        {/* Content */}
        {activeTab === 'accounts' && (
          <AdvancedDataTable
            data={filteredAccounts}
            columns={accountColumns}
            loading={loading}
            pagination={{
              current: 1,
              pageSize: 10,
              total: filteredAccounts.length,
              onChange: () => {}
            }}
          />
        )}

        {activeTab === 'transactions' && (
          <AdvancedDataTable
            data={filteredTransactions}
            columns={transactionColumns}
            loading={loading}
            pagination={{
              current: 1,
              pageSize: 10,
              total: filteredTransactions.length,
              onChange: () => {}
            }}
          />
        )}

        {/* Pending Transactions Alert */}
        {summaryStats.pendingTransactions > 0 && (
          <Card className="p-6 border-orange-200 bg-orange-50">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 rounded-full bg-orange-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800">Pending Transactions</h3>
                <p className="text-orange-700 mt-1">
                  {summaryStats.pendingTransactions} transactions are pending approval and need to be reviewed.
                </p>
              </div>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                Review Pending
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}