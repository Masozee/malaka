"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartIncreaseIcon, ChartDecreaseIcon, Calendar01Icon, Dollar01Icon } from "@hugeicons/core-free-icons"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { AdvancedDataTable } from "@/components/ui/advanced-data-table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  AccountingFilters 
} from "@/types/accounting"

export default function GeneralLedgerPage() {
  const [entries, setEntries] = React.useState<GeneralLedgerEntry[]>([])
  const [accounts, setAccounts] = React.useState<ChartOfAccount[]>([])
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([])
  const [periods, setPeriods] = React.useState<FinancialPeriod[]>([])
  const [loading, setLoading] = React.useState(true)
  const [summary, setSummary] = React.useState({
    total_debits: 0,
    total_credits: 0,
    opening_balance: 0,
    closing_balance: 0
  })
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 25,
    total: 0
  })
  const { addToast } = useToast()

  // Define table columns with financial formatting
  const columns = [
    {
      key: 'entry_date' as keyof GeneralLedgerEntry,
      title: 'Date',
      sortable: true,
      render: (date: unknown) => new Date(date as string).toLocaleDateString(),
      width: '100px'
    },
    {
      key: 'entry_number' as keyof GeneralLedgerEntry,
      title: 'Entry #',
      sortable: true,
      searchable: true,
      render: (entryNumber: unknown, entry: GeneralLedgerEntry) => (
        <div className="flex flex-col">
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {entryNumber as string}
          </span>
          <span className="text-xs text-gray-500">
            Line {entry.line_number}
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
      filterType: 'select' as const,
      filterOptions: accounts.map(account => ({
        value: account.id,
        label: `${account.account_code} - ${account.account_name}`
      })),
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
          <span className="font-medium text-green-600 dark:text-green-400">
            Rp {debitAmount.toLocaleString('id-ID')}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
      width: '120px'
    },
    {
      key: 'credit_amount' as keyof GeneralLedgerEntry,
      title: 'Credit',
      sortable: true,
      render: (amount: unknown) => {
        const creditAmount = amount as number
        return creditAmount > 0 ? (
          <span className="font-medium text-red-600 dark:text-red-400">
            Rp {creditAmount.toLocaleString('id-ID')}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      },
      width: '120px'
    },
    {
      key: 'running_balance' as keyof GeneralLedgerEntry,
      title: 'Balance',
      sortable: true,
      render: (balance: unknown) => {
        const runningBalance = balance as number
        const isNegative = runningBalance < 0
        return (
          <span className={`font-medium ${
            isNegative 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-green-600 dark:text-green-400'
          }`}>
            Rp {Math.abs(runningBalance).toLocaleString('id-ID')}
            {isNegative && ' CR'}
          </span>
        )
      },
      width: '120px'
    },
    {
      key: 'cost_center_name' as keyof GeneralLedgerEntry,
      title: 'Cost Center',
      render: (costCenter: unknown) => costCenter ? (
        <Badge variant="outline" className="text-xs">
          {costCenter as string}
        </Badge>
      ) : '-',
      filterType: 'select' as const,
      filterOptions: costCenters.map(cc => ({
        value: cc.id,
        label: `${cc.code} - ${cc.name}`
      })),
      width: '120px'
    },
    {
      key: 'status' as keyof GeneralLedgerEntry,
      title: 'Status',
      render: (status: unknown) => {
        const statusStr = status as string
        let variant: 'default' | 'secondary' | 'destructive' = 'default'
        if (statusStr === 'DRAFT') variant = 'secondary'
        if (statusStr === 'CANCELLED') variant = 'destructive'
        
        return (
          <Badge variant={variant}>
            {statusStr}
          </Badge>
        )
      },
      filterType: 'select' as const,
      filterOptions: [
        { value: 'DRAFT', label: 'Draft' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'POSTED', label: 'Posted' },
        { value: 'CANCELLED', label: 'Cancelled' }
      ],
      width: '100px'
    },
    {
      key: 'period' as keyof GeneralLedgerEntry,
      title: 'Period',
      render: (period: unknown, entry: GeneralLedgerEntry) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium">{period as string}</span>
          <span className="text-xs text-gray-500">FY {entry.fiscal_year}</span>
        </div>
      ),
      filterType: 'select' as const,
      filterOptions: periods.map(period => ({
        value: period.period_name,
        label: `${period.period_name} ${period.fiscal_year}`
      })),
      width: '100px'
    },
    {
      key: 'journal_entry_id' as keyof GeneralLedgerEntry,
      title: 'Actions',
      render: (journalEntryId: unknown, entry: GeneralLedgerEntry) => (
        <div className="flex space-x-2">
          {entry.journal_entry_id && (
            <button
              onClick={() => handleViewJournalEntry(entry)}
              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
            >
              View Journal Entry
            </button>
          )}
        </div>
      ),
      width: '150px'
    }
  ]

  // Fetch general ledger entries with filters
  const fetchEntries = React.useCallback(async (filters?: AccountingFilters) => {
    try {
      setLoading(true)
      const response = await generalLedgerService.getAll(filters)
      setEntries(response.data)
      setPagination(prev => ({
        ...prev,
        total: response.total
      }))
      
      // Update summary if available
      if (response.summary) {
        setSummary(response.summary)
      }
    } catch (error) {
      console.error('Error fetching general ledger entries:', error)
      addToast(toast.error("Failed to fetch ledger entries", "Please try again later."))
    } finally {
      setLoading(false)
    }
  }, [addToast])

  // Fetch reference data
  const fetchReferenceData = React.useCallback(async () => {
    try {
      const [accountsResponse, costCentersResponse, periodsResponse] = await Promise.all([
        chartOfAccountsService.getAll(),
        costCenterService.getAll(),
        financialPeriodService.getAll()
      ])
      
      setAccounts(accountsResponse.data)
      setCostCenters(costCentersResponse.data)
      setPeriods(periodsResponse)
    } catch (error) {
      console.error('Error fetching reference data:', error)
    }
  }, [])

  // Load initial data
  React.useEffect(() => {
    fetchReferenceData()
  }, [fetchReferenceData])

  React.useEffect(() => {
    fetchEntries({
      page: pagination.current,
      limit: pagination.pageSize,
      sortBy: 'entry_date',
      sortOrder: 'desc'
    })
  }, [pagination.current, pagination.pageSize, fetchEntries])

  // Event handlers
  const handleSearch = React.useCallback((filters: AccountingFilters) => {
    fetchEntries({
      ...filters,
      page: 1,
      limit: pagination.pageSize,
      sortBy: 'entry_date',
      sortOrder: 'desc'
    })
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [pagination.pageSize, fetchEntries])

  const handlePageChange = React.useCallback((page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }, [])

  const handleViewJournalEntry = (entry: GeneralLedgerEntry) => {
    // Navigate to the source journal entry for editing
    if (entry.journal_entry_id) {
      window.open(`/accounting/journal/${entry.journal_entry_id}`, '_blank')
    }
  }

  const handleExport = async () => {
    try {
      const blob = await generalLedgerService.exportLedger({
        // Current filters would be applied here
      })
      
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
      <Header 
        title="General Ledger"
        description="View all financial transactions and account balances. Click 'View Journal Entry' to edit transactions."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Accounting", href: "/accounting" },
          { label: "General Ledger" }
        ]}
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
              <HugeiconsIcon icon={ChartIncreaseIcon} className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_debits)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <HugeiconsIcon icon={ChartDecreaseIcon} className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.total_credits)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opening Balance</CardTitle>
              <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.opening_balance)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Closing Balance</CardTitle>
              <HugeiconsIcon icon={Dollar01Icon} className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(summary.closing_balance)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Data Table */}
        <AdvancedDataTable
          data={entries}
          columns={columns}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handlePageChange
          }}
          onSearch={handleSearch}
          searchPlaceholder="Search by entry number, account, or description..."
          exportEnabled={true}
          rowSelection={false}
        />

      </div>
    </TwoLevelLayout>
  )
}