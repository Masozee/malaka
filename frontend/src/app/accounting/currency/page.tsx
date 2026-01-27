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
import { Label } from '@/components/ui/label'

import Link from 'next/link'
import { currencyService, type CurrencyData } from '@/services/currency'

// Use CurrencyData from service
type Currency = CurrencyData

interface ExchangeRateHistory {
  id: string
  currency_code: string
  date: string
  rate: number
  high: number
  low: number
  change: number
  change_percentage: number
}

// Real currency data will be fetched from Bank Indonesia

const mockExchangeRateHistory: ExchangeRateHistory[] = [
  {
    id: '1',
    currency_code: 'USD',
    date: '2024-07-25',
    rate: 15250,
    high: 15280,
    low: 15220,
    change: 125,
    change_percentage: 0.82
  },
  {
    id: '2',
    currency_code: 'USD',
    date: '2024-07-24',
    rate: 15125,
    high: 15150,
    low: 15100,
    change: -50,
    change_percentage: -0.33
  },
  {
    id: '3',
    currency_code: 'EUR',
    date: '2024-07-25',
    rate: 16580,
    high: 16620,
    low: 16540,
    change: -75,
    change_percentage: -0.45
  },
  {
    id: '4',
    currency_code: 'EUR',
    date: '2024-07-24',
    rate: 16655,
    high: 16680,
    low: 16630,
    change: 95,
    change_percentage: 0.57
  }
]

export default function CurrencyPage() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeView, setActiveView] = useState<'cards' | 'table'>('table')
  const [activeTab, setActiveTab] = useState<'currencies' | 'rates'>('currencies')
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    setMounted(true)
    fetchCurrencies()
  }, [])

  const fetchCurrencies = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try backend API first, then fallback to Bank Indonesia
      let data: Currency[]
      try {
        data = await currencyService.getBackendCurrencies()
        console.log('Using backend exchange rates API')
      } catch (backendError) {
        console.warn('Backend API failed, using Bank Indonesia rates:', backendError)
        data = await currencyService.getAllCurrencies()
      }

      setCurrencies(data)
      setLastUpdated(new Date().toISOString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch currencies')
      console.error('Failed to fetch currencies:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshRates = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to refresh via backend API first
      try {
        const refreshResponse = await fetch('http://localhost:8084/api/v1/accounting/exchange-rates/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (refreshResponse.ok) {
          console.log('Backend refresh successful')
          // Fetch updated data
          const data = await currencyService.getBackendCurrencies()
          setCurrencies(data)
        } else {
          throw new Error('Backend refresh failed')
        }
      } catch (backendError) {
        console.warn('Backend refresh failed, using local refresh:', backendError)
        const data = await currencyService.refreshRates()
        setCurrencies(data)
      }

      setLastUpdated(new Date().toISOString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh rates')
      console.error('Failed to refresh rates:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount?: number, currency = 'IDR'): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    if (currency === 'IDR') {
      return `Rp ${amount.toLocaleString('id-ID')}`
    }
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const formatDateTime = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleString('id-ID')
  }

  const breadcrumbs = [
    { label: 'Accounting', href: '/accounting' },
    { label: 'Currency', href: '/accounting/currency' }
  ]

  // Filter currencies
  const filteredCurrencies = currencies.filter(currency => {
    if (searchTerm && !currency.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !currency.code.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (statusFilter !== 'all' && (statusFilter === 'active' ? !currency.is_active : currency.is_active)) return false
    return true
  })

  // Summary statistics
  const summaryStats = {
    totalCurrencies: currencies.length,
    activeCurrencies: currencies.filter(c => c.is_active).length,
    baseCurrency: currencies.find(c => c.is_base)?.code || 'IDR',
    strongestGainer: currencies.filter(c => !c.is_base).reduce((max, curr) =>
      curr.rate_change_24h > (max?.rate_change_24h || 0) ? curr : max, null as Currency | null),
    biggestLoser: currencies.filter(c => !c.is_base).reduce((min, curr) =>
      curr.rate_change_24h < (min?.rate_change_24h || 0) ? curr : min, null as Currency | null)
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? { variant: 'default' as const, label: 'Active' }
      : { variant: 'secondary' as const, label: 'Inactive' }
  }

  const getRateChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getRateChangeIndicator = (change: number) => {
    if (change > 0) return '+'
    if (change < 0) return '-'
    return ''
  }

  const currencyColumns = [
    {
      key: 'code' as keyof Currency,
      title: 'Currency',
      sortable: true,
      render: (value: unknown, currency: Currency) => {
        if (!currency) return null
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">{currency.code}</span>
            </div>
            <div>
              <div className="font-medium">{currency.code}</div>
              <div className="text-xs text-muted-foreground">{currency.name}</div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'symbol' as keyof Currency,
      title: 'Symbol',
      render: (value: unknown, currency: Currency) => {
        if (!currency) return null
        return <div className="text-lg font-medium">{currency.symbol}</div>
      }
    },
    {
      key: 'exchange_rate' as keyof Currency,
      title: 'Exchange Rate (BI)',
      sortable: true,
      render: (value: unknown, currency: Currency) => {
        if (!currency) return null
        return (
          <div>
            {currency.is_base ? (
              <div className="font-medium">1.00</div>
            ) : (
              <div className="space-y-1">
                <div className="font-medium">
                  {formatCurrency(currency.middle_rate || currency.exchange_rate, 'IDR')}
                </div>
                <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1">
                  <div className="text-green-600">
                    Buy: {formatCurrency(currency.buy_rate || currency.exchange_rate, 'IDR')}
                  </div>
                  <div className="text-red-600">
                    Sell: {formatCurrency(currency.sell_rate || currency.exchange_rate, 'IDR')}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  1 {currency.code} = {formatCurrency(currency.middle_rate || currency.exchange_rate)} IDR
                </div>
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'rate_change_24h' as keyof Currency,
      title: '24H Change',
      sortable: true,
      render: (value: unknown, currency: Currency) => {
        if (!currency) return null
        if (currency.is_base) return <span className="text-muted-foreground">-</span>

        const color = getRateChangeColor(currency.rate_change_24h)
        const percentage = currency.exchange_rate > 0 ? (currency.rate_change_24h / currency.exchange_rate) * 100 : 0

        return (
          <div className="flex items-center space-x-2">
            <div className={color}>
              <div className="font-medium">
                {currency.rate_change_24h > 0 ? '+' : ''}{formatCurrency(currency.rate_change_24h, 'IDR')}
              </div>
              <div className="text-xs">
                {percentage > 0 ? '+' : ''}{percentage.toFixed(2)}%
              </div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'is_active' as keyof Currency,
      title: 'Status',
      filterType: 'select' as const,
      filterOptions: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ],
      render: (value: unknown, currency: Currency) => {
        if (!currency || currency.is_active === undefined) return null
        const { variant, label } = getStatusBadge(currency.is_active)
        return (
          <div className="flex items-center space-x-2">
            <Badge variant={variant}>{label}</Badge>
            {currency.is_base && <Badge variant="outline">Base</Badge>}
          </div>
        )
      }
    },
    {
      key: 'last_updated' as keyof Currency,
      title: 'Last Updated',
      sortable: true,
      render: (value: unknown, currency: Currency) => {
        if (!currency) return null
        return <div className="text-xs">{formatDateTime(currency.last_updated)}</div>
      }
    }
  ]

  const historyColumns = [
    {
      key: 'currency_code' as keyof ExchangeRateHistory,
      title: 'Currency',
      sortable: true,
      render: (value: unknown, history: ExchangeRateHistory) => {
        if (!history) return null
        return <div className="font-medium">{history.currency_code}</div>
      }
    },
    {
      key: 'date' as keyof ExchangeRateHistory,
      title: 'Date',
      sortable: true,
      render: (value: unknown, history: ExchangeRateHistory) => {
        if (!history) return null
        return <div className="text-xs">{formatDate(history.date)}</div>
      }
    },
    {
      key: 'rate' as keyof ExchangeRateHistory,
      title: 'Rate',
      sortable: true,
      render: (value: unknown, history: ExchangeRateHistory) => {
        if (!history) return null
        return <div className="font-medium">{formatCurrency(history.rate, 'IDR')}</div>
      }
    },
    {
      key: 'high' as keyof ExchangeRateHistory,
      title: 'High / Low',
      render: (value: unknown, history: ExchangeRateHistory) => {
        if (!history) return null
        return (
          <div>
            <div className="text-xs text-green-600">H: {formatCurrency(history.high, 'IDR')}</div>
            <div className="text-xs text-red-600">L: {formatCurrency(history.low, 'IDR')}</div>
          </div>
        )
      }
    },
    {
      key: 'change' as keyof ExchangeRateHistory,
      title: 'Change',
      sortable: true,
      render: (value: unknown, history: ExchangeRateHistory) => {
        if (!history) return null
        const color = getRateChangeColor(history.change)

        return (
          <div className="flex items-center space-x-2">
            <div className={color}>
              <div className="font-medium">
                {history.change > 0 ? '+' : ''}{formatCurrency(history.change, 'IDR')}
              </div>
              <div className="text-xs">
                {history.change_percentage > 0 ? '+' : ''}{history.change_percentage.toFixed(2)}%
              </div>
            </div>
          </div>
        )
      }
    }
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="Currency Management"
        description="Manage currencies and exchange rates for international transactions"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshRates}
              disabled={loading}
            >
              Update Rates
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm" asChild>
              <Link href="/accounting/currency/new">
                Add Currency
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Error Display */}
        {error && (
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 rounded-full bg-red-600" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800">Error Loading Exchange Rates</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCurrencies}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && currencies.length === 0 && (
          <Card className="p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-muted-foreground">Fetching real-time exchange rates from Bank Indonesia...</p>
            </div>
          </Card>
        )}

        {/* Summary Statistics */}
        {(!loading || currencies.length > 0) && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Currencies</p>
                    <p className="text-2xl font-bold mt-1">{summaryStats.totalCurrencies}</p>
                    <p className="text-sm text-blue-600 mt-1">{summaryStats.activeCurrencies} active</p>
                  </div>
                  <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Base Currency</p>
                    <p className="text-2xl font-bold mt-1">{summaryStats.baseCurrency}</p>
                    <p className="text-sm text-green-600 mt-1">Primary currency</p>
                  </div>
                  <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Strongest Gainer</p>
                    <p className="text-2xl font-bold mt-1 text-green-600">
                      {summaryStats.strongestGainer?.code || '-'}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      {summaryStats.strongestGainer ?
                        `+${formatCurrency(summaryStats.strongestGainer.rate_change_24h, 'IDR')}` :
                        'No gains'
                      }
                    </p>
                  </div>
                  <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Update</p>
                    <p className="text-2xl font-bold mt-1">
                      {mounted && lastUpdated ? formatDateTime(lastUpdated) : 'Never'}
                    </p>
                    <p className="text-sm text-purple-600 mt-1">Bank Indonesia rates</p>
                  </div>
                  <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center" />
                </div>
              </Card>
            </div>

            {/* Filters (no outer border) */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Input
                    placeholder="Search currencies..."
                    className="pl-3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search currencies"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32" aria-label="Filter by status">
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

            {/* View Toggle & Sort */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                  <Button
                    variant={activeView === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView('cards')}
                  >
                    Cards
                  </Button>
                  <Button
                    variant={activeView === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView('table')}
                  >
                    Table
                  </Button>
                </div>
                <Select defaultValue="name">
                  <SelectTrigger className="w-44" aria-label="Sort by">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="rate">Sort by Rate</SelectItem>
                    <SelectItem value="change">Sort by Change</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredCurrencies.length} of {currencies.length} currencies
              </div>
            </div>

            {/* Content */}
            {activeView === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCurrencies.map((currency) => (
                  <Card key={currency.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600">{currency.code}</span>
                        </div>
                        <div>
                          <div className="font-medium">{currency.code}</div>
                          <div className="text-sm text-muted-foreground">{currency.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={currency.is_active ? 'default' : 'secondary'}>
                          {currency.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {currency.is_base && <Badge variant="outline">Base</Badge>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Rate: </span>
                        <span className="font-medium">
                          {currency.is_base ? '1.00' : formatCurrency(currency.middle_rate || currency.exchange_rate, 'IDR')}
                        </span>
                      </div>
                      {!currency.is_base && (
                        <div>
                          <span className="text-sm text-muted-foreground">24H Change: </span>
                          <span className={getRateChangeColor(currency.rate_change_24h)}>
                            {currency.rate_change_24h > 0 ? '+' : ''}{formatCurrency(currency.rate_change_24h, 'IDR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <AdvancedDataTable
                data={filteredCurrencies}
                columns={currencyColumns}
                loading={loading}
                pagination={{
                  current: 1,
                  pageSize: 10,
                  total: filteredCurrencies.length,
                  onChange: (page: number, pageSize: number) => {
                    console.log('Pagination change:', page, pageSize)
                  }
                }}
                searchPlaceholder="Search currencies..."
                exportEnabled={true}
              />
            )}
          </>
        )}
      </div>
    </TwoLevelLayout>
  )
}