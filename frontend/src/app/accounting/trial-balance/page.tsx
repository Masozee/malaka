'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HugeiconsIcon } from '@hugeicons/react'
import { DownloadSquare02Icon, CheckmarkCircle01Icon, AlertCircleIcon } from '@hugeicons/core-free-icons'

import { trialBalanceService } from '@/services/accounting'
import type { TrialBalance, TrialBalanceAccount } from '@/types/accounting'

const TYPE_ORDER = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']

export default function TrialBalancePage() {
  const [mounted, setMounted] = useState(false)
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'))

  const selectedPeriod = `${selectedFiscalYear}-${selectedMonth}`

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) fetchTrialBalance()
  }, [mounted, selectedFiscalYear, selectedMonth])

  const fetchTrialBalance = async () => {
    try {
      setLoading(true)
      const response = await trialBalanceService.getByPeriod(selectedPeriod, selectedFiscalYear)
      setTrialBalance(response)
    } catch (error) {
      console.error('Error fetching trial balance:', error)
      setTrialBalance(null)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const summaryStats = useMemo(() => ({
    totalAccounts: trialBalance?.accounts?.filter(a => a.trial_balance_debit > 0 || a.trial_balance_credit > 0).length || 0,
    totalDebits: trialBalance?.summary?.total_debits || 0,
    totalCredits: trialBalance?.summary?.total_credits || 0,
    balanceDifference: trialBalance?.summary?.difference_amount || 0,
    isBalanced: trialBalance?.summary?.is_balanced || false
  }), [trialBalance])

  const accountsByType = useMemo(() => {
    const grouped = trialBalance?.accounts?.reduce((acc, account) => {
      if (!acc[account.account_type]) acc[account.account_type] = []
      acc[account.account_type].push(account)
      return acc
    }, {} as Record<string, TrialBalanceAccount[]>) || {}
    return grouped
  }, [trialBalance])

  // Only show accounts with activity
  const activeAccounts = useMemo(() => {
    return (trialBalance?.accounts || []).filter(a => a.trial_balance_debit > 0 || a.trial_balance_credit > 0)
  }, [trialBalance])

  const columns = [
    {
      key: 'account_code' as keyof TrialBalanceAccount,
      title: 'Code',
      sortable: true,
      render: (_: unknown, account: TrialBalanceAccount) => (
        <span className="font-mono text-xs font-medium">{account.account_code}</span>
      ),
      width: '80px'
    },
    {
      key: 'account_name' as keyof TrialBalanceAccount,
      title: 'Account Name',
      sortable: true,
      render: (_: unknown, account: TrialBalanceAccount) => (
        <div>
          <div className="font-medium text-sm">{account.account_name}</div>
          <div className="text-xs text-muted-foreground">{account.account_type}</div>
        </div>
      )
    },
    {
      key: 'debit_total' as keyof TrialBalanceAccount,
      title: 'Total Debit',
      sortable: true,
      render: (_: unknown, account: TrialBalanceAccount) => (
        <div className="text-right">
          {account.debit_total > 0 ? (
            <span className="text-sm">{formatCurrency(account.debit_total)}</span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
      width: '140px'
    },
    {
      key: 'credit_total' as keyof TrialBalanceAccount,
      title: 'Total Credit',
      sortable: true,
      render: (_: unknown, account: TrialBalanceAccount) => (
        <div className="text-right">
          {account.credit_total > 0 ? (
            <span className="text-sm">{formatCurrency(account.credit_total)}</span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
      width: '140px'
    },
    {
      key: 'trial_balance_debit' as keyof TrialBalanceAccount,
      title: 'Debit Balance',
      sortable: true,
      render: (_: unknown, account: TrialBalanceAccount) => (
        <div className="text-right">
          {account.trial_balance_debit > 0 ? (
            <span className="font-medium text-green-600">{formatCurrency(account.trial_balance_debit)}</span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
      width: '140px'
    },
    {
      key: 'trial_balance_credit' as keyof TrialBalanceAccount,
      title: 'Credit Balance',
      sortable: true,
      render: (_: unknown, account: TrialBalanceAccount) => (
        <div className="text-right">
          {account.trial_balance_credit > 0 ? (
            <span className="font-medium text-red-600">{formatCurrency(account.trial_balance_credit)}</span>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
      width: '140px'
    }
  ]

  const monthLabel = mounted
    ? new Date(selectedFiscalYear, parseInt(selectedMonth) - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    : ''

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Trial Balance"
          description="View trial balance and account balances for financial periods"
          breadcrumbs={[
            { label: 'Accounting', href: '/accounting' },
            { label: 'Trial Balance' }
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Select value={selectedFiscalYear.toString()} onValueChange={(v) => setSelectedFiscalYear(parseInt(v))}>
                <SelectTrigger className="w-24 rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-sm">
                  {[2026, 2025, 2024].map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-36 rounded-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-sm">
                  {mounted && Array.from({ length: 12 }, (_, i) => {
                    const m = String(i + 1).padStart(2, '0')
                    const label = new Date(selectedFiscalYear, i, 1).toLocaleDateString('id-ID', { month: 'long' })
                    return <SelectItem key={m} value={m}>{label}</SelectItem>
                  })}
                </SelectContent>
              </Select>

              <Button size="sm" className="rounded-sm px-6" onClick={fetchTrialBalance} disabled={loading}>
                <HugeiconsIcon icon={DownloadSquare02Icon} className="h-4 w-4 mr-1.5" />
                Export
              </Button>
            </div>
          }
        />

        <div className="flex-1 overflow-auto p-6">
          <div className="flex gap-6">
            {/* Left: Main Table */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Balance Status Alert */}
              {trialBalance && !summaryStats.isBalanced && summaryStats.totalAccounts > 0 && (
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-sm">
                  <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-red-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800 text-sm">Trial Balance is Unbalanced</p>
                    <p className="text-red-700 text-xs">
                      Difference: {formatCurrency(summaryStats.balanceDifference)}
                    </p>
                  </div>
                </div>
              )}

              {trialBalance && summaryStats.isBalanced && summaryStats.totalAccounts > 0 && (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-sm">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-green-600 shrink-0" />
                  <p className="font-medium text-green-800 text-sm">Trial Balance is Balanced — {monthLabel}</p>
                </div>
              )}

              {/* Data Table */}
              <AdvancedDataTable
                data={activeAccounts}
                columns={columns}
                loading={loading}
                pageSize={50}
              />
            </div>

            {/* Right Sidebar */}
            <div className="w-80 shrink-0 space-y-4">
              {/* Trial Balance Summary */}
              <Card className="p-4 rounded-sm border">
                <h3 className="text-sm font-semibold mb-3">Trial Balance Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2.5 bg-green-50 rounded-sm">
                    <span className="text-xs font-medium text-green-800">Total Debits</span>
                    <span className="text-sm font-bold text-green-600">{formatCurrency(summaryStats.totalDebits)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-red-50 rounded-sm">
                    <span className="text-xs font-medium text-red-800">Total Credits</span>
                    <span className="text-sm font-bold text-red-600">{formatCurrency(summaryStats.totalCredits)}</span>
                  </div>
                  <div className={`flex justify-between items-center p-2.5 rounded-sm ${summaryStats.isBalanced ? 'bg-blue-50' : 'bg-yellow-50'}`}>
                    <span className={`text-xs font-medium ${summaryStats.isBalanced ? 'text-blue-800' : 'text-yellow-800'}`}>
                      Difference
                    </span>
                    <span className={`text-sm font-bold ${summaryStats.isBalanced ? 'text-blue-600' : 'text-yellow-600'}`}>
                      {formatCurrency(summaryStats.balanceDifference)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Active Accounts</span>
                    <span className="font-medium">{summaryStats.totalAccounts}</span>
                  </div>
                </div>
              </Card>

              {/* Balance by Account Type */}
              <Card className="p-4 rounded-sm border">
                <h3 className="text-sm font-semibold mb-3">Balance by Account Type</h3>
                <div className="space-y-3">
                  {TYPE_ORDER.filter(type => accountsByType[type]?.length).map(type => {
                    const accounts = accountsByType[type] || []
                    const totalDebit = accounts.reduce((sum, acc) => sum + acc.trial_balance_debit, 0)
                    const totalCredit = accounts.reduce((sum, acc) => sum + acc.trial_balance_credit, 0)
                    const activeCount = accounts.filter(a => a.trial_balance_debit > 0 || a.trial_balance_credit > 0).length
                    const isDebitType = type === 'ASSET' || type === 'EXPENSE'
                    const balance = isDebitType ? totalDebit - totalCredit : totalCredit - totalDebit

                    if (balance === 0 && activeCount === 0) return null

                    return (
                      <div key={type} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 rounded-sm">{type}</Badge>
                            <span className="text-[10px] text-muted-foreground">{activeCount} acct</span>
                          </div>
                          <span className={`text-xs font-medium ${isDebitType ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(balance)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${isDebitType ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(Math.abs(balance) / Math.max(summaryStats.totalDebits, summaryStats.totalCredits, 1) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Accounting Equation */}
              <Card className="p-4 rounded-sm border">
                <h3 className="text-sm font-semibold mb-3">Accounting Equation</h3>
                <div className="space-y-2 text-xs">
                  {(() => {
                    const assetAccounts = accountsByType['ASSET'] || []
                    const liabilityAccounts = accountsByType['LIABILITY'] || []
                    const equityAccounts = accountsByType['EQUITY'] || []
                    const revenueAccounts = accountsByType['REVENUE'] || []
                    const expenseAccounts = accountsByType['EXPENSE'] || []

                    const assets = assetAccounts.reduce((s, a) => s + a.trial_balance_debit - a.trial_balance_credit, 0)
                    const liabilities = liabilityAccounts.reduce((s, a) => s + a.trial_balance_credit - a.trial_balance_debit, 0)
                    const equity = equityAccounts.reduce((s, a) => s + a.trial_balance_credit - a.trial_balance_debit, 0)
                    const revenue = revenueAccounts.reduce((s, a) => s + a.trial_balance_credit - a.trial_balance_debit, 0)
                    const expenses = expenseAccounts.reduce((s, a) => s + a.trial_balance_debit - a.trial_balance_credit, 0)
                    const netIncome = revenue - expenses

                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Assets</span>
                          <span className="font-medium">{formatCurrency(assets)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Liabilities</span>
                          <span className="font-medium">{formatCurrency(liabilities)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Equity</span>
                          <span className="font-medium">{formatCurrency(equity)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Net Income (R-E)</span>
                          <span className={`font-medium ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(netIncome)}
                          </span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-medium">
                            <span>A = L + E + NI</span>
                            <span className={assets === liabilities + equity + netIncome ? 'text-green-600' : 'text-red-600'}>
                              {assets === liabilities + equity + netIncome ? 'Balanced' : 'Unbalanced'}
                            </span>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
