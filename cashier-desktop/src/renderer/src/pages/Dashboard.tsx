import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { salesService, Promo, DashboardStats } from '../services/sales'
import { Card } from '../components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CreditCardIcon,
  PackageIcon,
  Money01Icon,
  Loading01Icon,
  Discount01Icon,
  Calendar01Icon
} from '@hugeicons/core-free-icons'

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    total_transactions: 0,
    available_items: 0,
    cash_in_drawer: 0
  })
  const [promos, setPromos] = useState<Promo[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardStats, activePromos] = await Promise.all([
        salesService.getDashboardStats(),
        salesService.getActivePromos()
      ])
      setStats(dashboardStats)
      setPromos(activePromos)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number): string => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.username || 'Cashier'}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Transactions Today */}
        <Card className="p-5">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <HugeiconsIcon icon={CreditCardIcon} className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transactions Today</p>
              <p className="text-3xl font-bold">{stats.total_transactions}</p>
            </div>
          </div>
        </Card>

        {/* Available Items */}
        <Card className="p-5">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <HugeiconsIcon icon={PackageIcon} className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Items</p>
              <p className="text-3xl font-bold">{stats.available_items}</p>
            </div>
          </div>
        </Card>

        {/* Cash in Drawer */}
        <Card className="p-5">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <HugeiconsIcon icon={Money01Icon} className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cash in Drawer</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.cash_in_drawer)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Promos Table */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <HugeiconsIcon icon={Discount01Icon} className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Active Promotions</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Current active promotions that can be applied to transactions
          </p>
        </div>

        <div className="flex-1 overflow-auto">
          {promos.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <HugeiconsIcon icon={Discount01Icon} className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active promotions</p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                    Code
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                    Promo Name
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                    Discount
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                    Min. Purchase
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                    Valid Period
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {promos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {promo.code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{promo.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">
                        {promo.discount_type === 'percentage'
                          ? `${promo.discount_value}%`
                          : formatCurrency(promo.discount_value)}
                      </span>
                      {promo.max_discount && promo.discount_type === 'percentage' && (
                        <span className="text-xs text-muted-foreground block">
                          Max: {formatCurrency(promo.max_discount)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {promo.min_purchase ? formatCurrency(promo.min_purchase) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4" />
                        <span>
                          {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100">
                        Active
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
