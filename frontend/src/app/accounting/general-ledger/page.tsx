"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SquareArrowUp02Icon, SquareArrowDown02Icon, PanelLeftOpenIcon, PanelRightCloseIcon, DownloadSquare02Icon } from "@hugeicons/core-free-icons"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { AdvancedDataTable } from "@/components/ui/advanced-data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast, toast } from "@/components/ui/toast"
import {
  generalLedgerService,
  chartOfAccountsService,
  costCenterService,
  financialPeriodService
} from "@/services/accounting"
import {
  GeneralLedgerEntry,
  ChartOfAccount,
  CostCenter,
  FinancialPeriod,
} from "@/types/accounting"

export default function GeneralLedgerPage() {
  const [allEntries, setAllEntries] = React.useState<GeneralLedgerEntry[]>([])
  const [accounts, setAccounts] = React.useState<ChartOfAccount[]>([])
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([])
  const [periods, setPeriods] = React.useState<FinancialPeriod[]>([])
  const [loading, setLoading] = React.useState(true)
  const { addToast } = useToast()

  // Filter state
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedAccount, setSelectedAccount] = React.useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>("all")

  // Client-side filtered entries
  const filteredEntries = React.useMemo(() => {
    let result = allEntries

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(entry =>
        entry.description?.toLowerCase().includes(q) ||
        entry.entry_number?.toLowerCase().includes(q) ||
        entry.account_code?.toLowerCase().includes(q) ||
        entry.account_name?.toLowerCase().includes(q) ||
        entry.reference?.toLowerCase().includes(q)
      )
    }

    if (selectedAccount && selectedAccount !== "all") {
      result = result.filter(entry => entry.account_id === selectedAccount)
    }

    if (selectedPeriod && selectedPeriod !== "all") {
      result = result.filter(entry => entry.period === selectedPeriod)
    }

    return result
  }, [allEntries, searchQuery, selectedAccount, selectedPeriod])

  // Summary computed from filtered entries
  const summary = React.useMemo(() => {
    const totalDebits = filteredEntries.reduce((sum, e) => sum + (e.debit_amount || 0), 0)
    const totalCredits = filteredEntries.reduce((sum, e) => sum + (e.credit_amount || 0), 0)
    return {
      total_debits: totalDebits,
      total_credits: totalCredits,
      opening_balance: 0,
      closing_balance: totalDebits - totalCredits
    }
  }, [filteredEntries])

  // Define table columns
  const columns = [
    {
      key: 'entry_date' as keyof GeneralLedgerEntry,
      title: 'Date',
      sortable: true,
      render: (date: unknown) => {
        const d = new Date(date as string)
        return <span className="whitespace-nowrap">{d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      },
      width: '100px'
    },
    {
      key: 'entry_number' as keyof GeneralLedgerEntry,
      title: 'Entry #',
      sortable: true,
      searchable: true,
      render: (entryNumber: unknown, entry: GeneralLedgerEntry) => (
        <div className="flex flex-col gap-1">
          {entry.journal_entry_id ? (
            <a
              href={`/accounting/journal/${entry.journal_entry_id}`}
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {entryNumber as string}
            </a>
          ) : (
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {entryNumber as string}
            </span>
          )}
          <span className="text-[10px] text-gray-500">
            <Badge variant={entry.status === 'POSTED' ? 'default' : entry.status === 'CANCELLED' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0 h-4 rounded-sm">
              {entry.status?.toLowerCase()}
            </Badge>
            {' | Line '}{entry.line_number}
          </span>
        </div>
      ),
      width: '120px'
    },
    {
      key: 'account_code' as keyof GeneralLedgerEntry,
      title: 'Account',
      sortable: true,
      searchable: true,
      render: (accountCode: unknown, entry: GeneralLedgerEntry) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {accountCode as string}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-32">
            {entry.account_name}
          </span>
        </div>
      ),
      width: '180px'
    },
    {
      key: 'description' as keyof GeneralLedgerEntry,
      title: 'Description',
      searchable: true,
      render: (description: unknown, entry: GeneralLedgerEntry) => (
        <div className="flex flex-col">
          <span className="text-xs text-gray-900 dark:text-gray-100">
            {description as string}
          </span>
          {entry.reference && (
            <span className="text-xs text-gray-500">
              Ref: {entry.reference}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'debit_amount' as keyof GeneralLedgerEntry,
      title: 'Debit',
      sortable: true,
      render: (amount: unknown) => {
        const debitAmount = amount as number
        return debitAmount > 0 ? (
          <span className="font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
            Rp {debitAmount.toLocaleString('id-ID')}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
      width: '130px'
    },
    {
      key: 'credit_amount' as keyof GeneralLedgerEntry,
      title: 'Credit',
      sortable: true,
      render: (amount: unknown) => {
        const creditAmount = amount as number
        return creditAmount > 0 ? (
          <span className="font-medium text-red-600 dark:text-red-400 whitespace-nowrap">
            Rp {creditAmount.toLocaleString('id-ID')}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
      width: '130px'
    },
    {
      key: 'running_balance' as keyof GeneralLedgerEntry,
      title: 'Balance',
      sortable: true,
      render: (balance: unknown) => {
        const runningBalance = balance as number
        const isNegative = runningBalance < 0
        return (
          <span className={`font-medium whitespace-nowrap ${isNegative
            ? 'text-red-600 dark:text-red-400'
            : 'text-green-600 dark:text-green-400'
            }`}>
            Rp {Math.abs(runningBalance).toLocaleString('id-ID')}
            {isNegative && ' CR'}
          </span>
        )
      },
      width: '130px'
    },
  ]

  // Fetch all data once on mount
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true)
      const [glResponse, accountsResponse, costCentersResponse, periodsResponse] = await Promise.allSettled([
        generalLedgerService.getAll(),
        chartOfAccountsService.getAll(),
        costCenterService.getAll(),
        financialPeriodService.getAll()
      ])

      if (glResponse.status === 'fulfilled') {
        setAllEntries(glResponse.value.data)
      } else {
        addToast(toast.error("Failed to fetch ledger entries", "Please try again later."))
      }

      if (accountsResponse.status === 'fulfilled') {
        setAccounts(accountsResponse.value.data)
      }
      if (costCentersResponse.status === 'fulfilled') {
        setCostCenters(costCentersResponse.value.data)
      }
      if (periodsResponse.status === 'fulfilled') {
        setPeriods(periodsResponse.value.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [addToast])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleExport = async () => {
    try {
      const blob = await generalLedgerService.exportLedger({})

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `general-ledger-${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      URL.revokeObjectURL(url)

      addToast(toast.success("Export completed", "General ledger has been exported successfully."))
    } catch (error) {
      console.error('Error exporting general ledger:', error)
      addToast(toast.error("Export failed", "Please try again later."))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="General Ledger"
          description="View all financial transactions and account balances"
          breadcrumbs={[
            { label: "Accounting", href: "/accounting" },
            { label: "General Ledger" }
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button size="sm" className="rounded-sm px-6" onClick={handleExport}>
                <HugeiconsIcon icon={DownloadSquare02Icon} className="h-4 w-4 mr-1.5" />
                Export
              </Button>
            </div>
          }
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-sm border">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-sm flex items-center justify-center">
                  <HugeiconsIcon icon={SquareArrowUp02Icon} className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Debits</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.total_debits)}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 rounded-sm border">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-sm flex items-center justify-center">
                  <HugeiconsIcon icon={SquareArrowDown02Icon} className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.total_credits)}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 rounded-sm border">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-sm flex items-center justify-center">
                  <HugeiconsIcon icon={PanelLeftOpenIcon} className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Opening Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.opening_balance)}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 rounded-sm border">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-sm flex items-center justify-center">
                  <HugeiconsIcon icon={PanelRightCloseIcon} className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Closing Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.closing_balance)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="relative">
              <Input
                placeholder="Search entries..."
                className="pl-3 w-64 bg-white dark:bg-zinc-900 rounded-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-zinc-900 rounded-sm">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent className="rounded-sm">
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account_code} - {account.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-zinc-900 rounded-sm">
                  <SelectValue placeholder="All Periods" />
                </SelectTrigger>
                <SelectContent className="rounded-sm">
                  <SelectItem value="all">All Periods</SelectItem>
                  {periods.map(period => (
                    <SelectItem key={period.id} value={period.start_date?.substring(0, 7) || period.period_name}>
                      {period.period_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Table */}
          <AdvancedDataTable
            data={filteredEntries}
            columns={columns}
            loading={loading}
            pageSize={25}
          />
        </div>
      </div>
    </TwoLevelLayout>
  )
}
