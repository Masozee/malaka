'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

import { trialBalanceService } from '@/services/accounting'
import type { TrialBalance, TrialBalanceAccount } from '@/types/accounting'

export default function TrialBalancePage() {
  const [mounted, setMounted] = useState(false)
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024-07')
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(2024)

  useEffect(() => {
    setMounted(true)
    fetchTrialBalance()
  }, [selectedPeriod, selectedFiscalYear])

  const fetchTrialBalance = async () => {
    try {
      setLoading(true)
      const response = await trialBalanceService.getByPeriod(selectedPeriod, selectedFiscalYear)
      setTrialBalance(response)
    } catch (error) {
      console.error('Error fetching trial balance:', error)
      // Service already handles fallback to mock data
      setTrialBalance(null)
    } finally {
      setLoading(false)
    }
  }

  const generateTrialBalance = async () => {
    try {
      setLoading(true)
      const response = await trialBalanceService.generate(selectedPeriod, selectedFiscalYear)
      setTrialBalance(response)
    } catch (error) {
      console.error('Error generating trial balance:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportTrialBalance = async () => {
    try {
      const blob = await trialBalanceService.export(selectedPeriod, selectedFiscalYear)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `trial-balance-${selectedFiscalYear}-${selectedPeriod}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting trial balance:', error)
    }
  }

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const breadcrumbs = [
    { label: 'Accounting', href: '/accounting' },
    { label: 'Trial Balance', href: '/accounting/trial-balance' }
  ]

  const summaryStats = {
    totalAccounts: trialBalance?.accounts?.length || 0,
    totalDebits: trialBalance?.summary?.total_debits || 0,
    totalCredits: trialBalance?.summary?.total_credits || 0,
    balanceDifference: trialBalance?.summary?.difference_amount || 0,
    isBalanced: trialBalance?.summary?.is_balanced || false
  }

  const accountsByType = trialBalance?.accounts?.reduce((acc, account) => {
    if (!acc[account.account_type]) {
      acc[account.account_type] = []
    }
    acc[account.account_type].push(account)
    return acc
  }, {} as Record<string, TrialBalanceAccount[]>) || {}

  const columns = [
    {
      key: 'account_code' as keyof TrialBalanceAccount,
      title: 'Account Code',
      render: (value: unknown, account: TrialBalanceAccount) => {
        if (!account) return null
        return (
          <div className="font-mono text-sm font-medium">{account.account_code}</div>
        )
      }
    },
    {
      key: 'account_name' as keyof TrialBalanceAccount,
      title: 'Account Name',
      render: (value: unknown, account: TrialBalanceAccount) => {
        if (!account) return null
        return (
          <div>
            <div className="font-medium">{account.account_name}</div>
            <div className="text-sm text-muted-foreground">{account.account_type}</div>
          </div>
        )
      }
    },
    {
      key: 'trial_balance_debit' as keyof TrialBalanceAccount,
      title: 'Debit Balance',
      render: (value: unknown, account: TrialBalanceAccount) => {
        if (!account) return null
        return (
          <div className="text-right">
            {account.trial_balance_debit > 0 ? (
              <span className="font-medium text-green-600">
                {formatCurrency(account.trial_balance_debit)}
              </span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        )
      }
    },
    {
      key: 'trial_balance_credit' as keyof TrialBalanceAccount,
      title: 'Credit Balance',
      render: (value: unknown, account: TrialBalanceAccount) => {
        if (!account) return null
        return (
          <div className="text-right">
            {account.trial_balance_credit > 0 ? (
              <span className="font-medium text-red-600">
                {formatCurrency(account.trial_balance_credit)}
              </span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Trial Balance"
        description="View trial balance and account balances for financial periods"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={generateTrialBalance} disabled={loading}>
              Generate
            </Button>
            <Button variant="outline" size="sm" onClick={exportTrialBalance}>
              Export
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards (max 4 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalAccounts}</p>
                <p className="text-sm text-blue-600 mt-1">Active accounts</p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Debits</p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {mounted ? `Rp ${(summaryStats.totalDebits / 1000000).toFixed(1)}M` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">Debit balances</p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold mt-1 text-red-600">
                  {mounted ? `Rp ${(summaryStats.totalCredits / 1000000).toFixed(1)}M` : ''}
                </p>
                <p className="text-sm text-red-600 mt-1">Credit balances</p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Balance Status</p>
                <p className={`text-2xl font-bold mt-1 ${summaryStats.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                  {summaryStats.isBalanced ? 'Balanced' : 'Unbalanced'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {summaryStats.isBalanced ? 'Trial balance is balanced' : `Difference: ${formatCurrency(summaryStats.balanceDifference)}`}
                </p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
            </div>
          </Card>
        </div>

        {/* Filters (no outer border) */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Label htmlFor="period" className="sr-only">Select Period</Label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedFiscalYear.toString()} onValueChange={(value) => setSelectedFiscalYear(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {mounted && Array.from({ length: 12 }, (_, i) => {
                  const month = String(i + 1).padStart(2, '0')
                  const value = `${selectedFiscalYear}-${month}`
                  const label = new Date(selectedFiscalYear, i, 1).toLocaleDateString('id-ID', { 
                    month: 'long', 
                    year: 'numeric' 
                  })
                  return (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Balance Status Alert */}
        {!summaryStats.isBalanced && (
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 rounded-full bg-red-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800">Trial Balance is Unbalanced</h3>
                <p className="text-red-700 mt-1">
                  The trial balance does not balance. Total debits and credits differ by {formatCurrency(summaryStats.balanceDifference)}.
                  Please review journal entries for errors.
                </p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Review Entries
              </Button>
            </div>
          </Card>
        )}

        {/* Account Type Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Balance by Account Type</h3>
            <div className="space-y-4">
              {Object.entries(accountsByType).map(([type, accounts]) => {
                const totalDebit = accounts.reduce((sum, acc) => sum + acc.trial_balance_debit, 0)
                const totalCredit = accounts.reduce((sum, acc) => sum + acc.trial_balance_credit, 0)
                const netBalance = totalDebit - totalCredit
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{type}</Badge>
                        <span className="text-sm text-muted-foreground">({accounts.length} accounts)</span>
                      </div>
                      <span className={`font-medium ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(netBalance))} {netBalance < 0 ? 'CR' : 'DR'}
                      </span>
                    </div>
                    <Progress 
                      value={Math.abs(netBalance) / Math.max(summaryStats.totalDebits, summaryStats.totalCredits) * 100} 
                      className="h-2" 
                    />
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Trial Balance Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-800">Total Debit Balances</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(summaryStats.totalDebits)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-red-800">Total Credit Balances</span>
                <span className="text-lg font-bold text-red-600">{formatCurrency(summaryStats.totalCredits)}</span>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg ${
                summaryStats.isBalanced ? 'bg-blue-50' : 'bg-yellow-50'
              }`}>
                <span className={`font-medium ${
                  summaryStats.isBalanced ? 'text-blue-800' : 'text-yellow-800'
                }`}>
                  Difference
                </span>
                <span className={`text-lg font-bold ${
                  summaryStats.isBalanced ? 'text-blue-600' : 'text-yellow-600'
                }`}>
                  {formatCurrency(summaryStats.balanceDifference)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Trial Balance Table (no Card wrapper) */}
        <AdvancedDataTable
          data={trialBalance?.accounts || []}
          columns={columns}
          loading={loading}
          pagination={{
            current: 1,
            pageSize: 25,
            total: trialBalance?.accounts?.length || 0,
            onChange: () => {}
          }}
          searchPlaceholder="Search accounts..."
        />
      </div>
    </TwoLevelLayout>
  )
}

