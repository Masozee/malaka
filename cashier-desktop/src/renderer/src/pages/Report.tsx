import { useState, useEffect } from 'react'
import { salesService, PosTransaction } from '../services/sales'
import { Card } from '../components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ChartIcon,
  Loading01Icon,
  Calendar01Icon,
  Money01Icon,
  CreditCardIcon,
  SmartPhone01Icon
} from '@hugeicons/core-free-icons'

export default function Report() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<PosTransaction[]>([])

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const data = await salesService.getPosTransactions()
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number): string => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDateTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return Money01Icon
      case 'card':
        return CreditCardIcon
      case 'transfer':
        return SmartPhone01Icon
      default:
        return Money01Icon
    }
  }

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0)

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Transaction Report</h1>
        <p className="text-muted-foreground">View all transaction history</p>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <HugeiconsIcon icon={ChartIcon} className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-3xl font-bold">{transactions.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <HugeiconsIcon icon={Money01Icon} className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Transaction History</h2>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {transactions.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <HugeiconsIcon icon={ChartIcon} className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No transactions found</p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                    ID
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                    Date & Time
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                    Payment Method
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm">{transaction.id.slice(0, 8)}...</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDateTime(transaction.transaction_date || transaction.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <HugeiconsIcon
                          icon={getPaymentIcon(transaction.payment_method)}
                          className="h-4 w-4 text-muted-foreground"
                        />
                        <span className="capitalize">{transaction.payment_method}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold">
                        {formatCurrency(transaction.total_amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  )
}
