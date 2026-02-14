'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable, type AdvancedColumn } from '@/components/ui/advanced-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search01Icon,
  Money01Icon,
  CoinsDollarIcon,
  Clock01Icon,
  Download01Icon,
  Globe02Icon,
} from '@hugeicons/core-free-icons'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { currencyService, type CurrencyData, type CurrencyHistorical } from '@/services/currency'

type Currency = CurrencyData

export default function CurrencyPage() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
  const [drawerHistory, setDrawerHistory] = useState<CurrencyHistorical | null>(null)
  const [drawerLoading, setDrawerLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchCurrencies()
  }, [])

  const fetchCurrencies = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await currencyService.getAllCurrencies()
      setCurrencies(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch currencies')
    } finally {
      setLoading(false)
    }
  }

  const openDrawer = async (currency: Currency) => {
    setSelectedCurrency(currency)
    setDrawerOpen(true)
    setDrawerLoading(true)
    try {
      const history = await currencyService.getHistoricalRates(currency.code, 30)
      setDrawerHistory(history)
    } catch {
      setDrawerHistory(null)
    } finally {
      setDrawerLoading(false)
    }
  }

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getRegion = (code: string): string => {
    const asean = ['SGD', 'MYR', 'THB', 'PHP', 'VND', 'LAK', 'BND', 'PGK']
    const eastAsia = ['JPY', 'KRW', 'CNY', 'CNH', 'HKD']
    const europe = ['EUR', 'GBP', 'CHF', 'SEK', 'DKK', 'NOK']
    const middleEast = ['SAR', 'AED', 'KWD']
    const americas = ['USD', 'CAD']
    const oceania = ['AUD', 'NZD']

    if (asean.includes(code)) return 'ASEAN'
    if (eastAsia.includes(code)) return 'East Asia'
    if (europe.includes(code)) return 'Europe'
    if (middleEast.includes(code)) return 'Middle East'
    if (americas.includes(code)) return 'Americas'
    if (oceania.includes(code)) return 'Oceania'
    return 'Other'
  }

  const getRegionKey = (code: string): string => {
    const asean = ['SGD', 'MYR', 'THB', 'PHP', 'VND', 'LAK', 'BND', 'PGK']
    const eastAsia = ['JPY', 'KRW', 'CNY', 'CNH', 'HKD']
    const europe = ['EUR', 'GBP', 'CHF', 'SEK', 'DKK', 'NOK']
    const middleEast = ['SAR', 'AED', 'KWD']
    const americas = ['USD', 'CAD']
    const oceania = ['AUD', 'NZD']

    if (asean.includes(code)) return 'asean'
    if (eastAsia.includes(code)) return 'east-asia'
    if (europe.includes(code)) return 'europe'
    if (middleEast.includes(code)) return 'middle-east'
    if (americas.includes(code)) return 'americas'
    if (oceania.includes(code)) return 'oceania'
    return 'other'
  }

  const breadcrumbs = [
    { label: 'Accounting', href: '/accounting' },
    { label: 'Currency', href: '/accounting/currency' },
  ]

  const filteredCurrencies = currencies
    .filter((c) => !c.is_base)
    .filter((c) => {
      if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase()) && !c.code.toLowerCase().includes(searchTerm.toLowerCase())) return false
      if (regionFilter !== 'all' && getRegionKey(c.code) !== regionFilter) return false
      return true
    })

  const rateDate = currencies.find((c) => !c.is_base)?.last_updated || ''
  const totalCurrencies = currencies.filter((c) => !c.is_base).length
  const usdRate = currencies.find((c) => c.code === 'USD')

  function handleExport() {
    const headers = ['Currency Code', 'Currency Name', 'Buy Rate (IDR)', 'Sell Rate (IDR)', 'Middle Rate (IDR)', 'Spread (IDR)']
    const rows = filteredCurrencies.map((c) => [
      c.code,
      c.name,
      c.buy_rate || 0,
      c.sell_rate || 0,
      c.middle_rate || c.exchange_rate,
      ((c.sell_rate || 0) - (c.buy_rate || 0)).toFixed(2),
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bi-exchange-rates-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Drawer chart data
  const drawerChartData = drawerHistory?.history.map((h) => ({
    date: h.date.slice(5),
    Buy: h.buy,
    Sell: h.sell,
    Middle: h.middle,
  })) || []

  // Min/max for chart
  const drawerChartMin = drawerChartData.length
    ? Math.floor(Math.min(...drawerChartData.map((d) => d.Buy)) * 0.999)
    : 0
  const drawerChartMax = drawerChartData.length
    ? Math.ceil(Math.max(...drawerChartData.map((d) => d.Sell)) * 1.001)
    : 0

  // 30-day change calculation
  const get30dChange = () => {
    if (!drawerChartData.length || drawerChartData.length < 2) return null
    const first = drawerChartData[0].Middle
    const last = drawerChartData[drawerChartData.length - 1].Middle
    const change = last - first
    const pct = (change / first) * 100
    return { change, pct }
  }

  const columns: AdvancedColumn<Currency>[] = [
    {
      key: 'code',
      title: 'Currency',
      render: (_: unknown, c: Currency) => (
        <button onClick={() => openDrawer(c)} className="flex items-center space-x-3 text-left hover:opacity-80 transition-opacity">
          <div className="h-9 w-9 bg-muted rounded-sm border flex items-center justify-center">
            <span className="text-sm font-bold text-foreground">{c.symbol}</span>
          </div>
          <div>
            <div className="font-semibold text-sm text-blue-600 hover:underline">{c.code}</div>
            <div className="text-xs text-muted-foreground">{c.name}</div>
          </div>
        </button>
      ),
    },
    {
      key: 'buy_rate',
      title: 'Buy (IDR)',
      render: (_: unknown, c: Currency) => (
        <div className="text-sm font-medium text-green-700">{mounted ? `Rp ${formatCurrency(c.buy_rate)}` : ''}</div>
      ),
    },
    {
      key: 'sell_rate',
      title: 'Sell (IDR)',
      render: (_: unknown, c: Currency) => (
        <div className="text-sm font-medium text-red-700">{mounted ? `Rp ${formatCurrency(c.sell_rate)}` : ''}</div>
      ),
    },
    {
      key: 'middle_rate',
      title: 'Middle Rate (IDR)',
      render: (_: unknown, c: Currency) => (
        <div className="text-sm font-bold">{mounted ? `Rp ${formatCurrency(c.middle_rate || c.exchange_rate)}` : ''}</div>
      ),
    },
    {
      key: 'exchange_rate',
      title: 'Spread',
      render: (_: unknown, c: Currency) => {
        const spread = (c.sell_rate || 0) - (c.buy_rate || 0)
        return (
          <div className="text-sm text-muted-foreground">{mounted ? `Rp ${formatCurrency(spread)}` : ''}</div>
        )
      },
    },
  ]

  const change30d = get30dChange()

  return (
    <TwoLevelLayout>
      <Header
        title="Exchange Rates"
        description="Daily exchange rates from Bank Indonesia (Kurs Transaksi BI)"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={fetchCurrencies} disabled={loading}>
              <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 mr-1.5" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-1.5" />
              Export CSV
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Error */}
        {error && (
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex items-center justify-between">
              <p className="text-red-700 text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchCurrencies} className="border-red-300 text-red-700">
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Currencies</p>
                <p className="text-2xl font-bold">{totalCurrencies}</p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center border">
                <HugeiconsIcon icon={Globe02Icon} className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Base Currency</p>
                <p className="text-2xl font-bold">IDR</p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center border">
                <HugeiconsIcon icon={Money01Icon} className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">USD/IDR</p>
                <p className="text-2xl font-bold">{mounted && usdRate ? `Rp ${formatCurrency(usdRate.middle_rate)}` : ''}</p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center border">
                <HugeiconsIcon icon={CoinsDollarIcon} className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rate Date</p>
                <p className="text-lg font-bold">{mounted ? formatDate(rateDate) : ''}</p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-sm flex items-center justify-center border">
                <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </Card>
        </div>

        {/* Source badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Source: Bank Indonesia - Kurs Transaksi BI
          </Badge>
          <Badge variant="outline" className="text-xs">
            {mounted ? formatDate(rateDate) : ''}
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search currency..."
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="asean">ASEAN</SelectItem>
                <SelectItem value="east-asia">East Asia</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="americas">Americas</SelectItem>
                <SelectItem value="oceania">Oceania</SelectItem>
                <SelectItem value="middle-east">Middle East</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              {filteredCurrencies.length} of {totalCurrencies} currencies
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-sm">
          <AdvancedDataTable data={filteredCurrencies} columns={columns} loading={loading} />
        </div>
      </div>

      {/* Currency Detail Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
          {selectedCurrency && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-sm border flex items-center justify-center">
                    <span className="text-base font-bold">{selectedCurrency.symbol}</span>
                  </div>
                  <div>
                    <div className="text-lg">{selectedCurrency.code}/IDR</div>
                  </div>
                </SheetTitle>
                <SheetDescription>{selectedCurrency.name} — Kurs Transaksi Bank Indonesia</SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-4 pb-6">
                {/* Current Rates */}
                <div className="border rounded-sm">
                  <div className="px-4 py-3 border-b bg-muted/30">
                    <h4 className="text-sm font-semibold">Current Rates</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Today&apos;s buy, sell, and middle exchange rates</p>
                  </div>
                  <div className="grid grid-cols-3 divide-x">
                    <div className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">Buy</p>
                      <p className="text-sm font-semibold text-green-700 mt-1">Rp {formatCurrency(selectedCurrency.buy_rate)}</p>
                    </div>
                    <div className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">Sell</p>
                      <p className="text-sm font-semibold text-red-700 mt-1">Rp {formatCurrency(selectedCurrency.sell_rate)}</p>
                    </div>
                    <div className="p-3 text-center">
                      <p className="text-xs text-muted-foreground">Middle</p>
                      <p className="text-sm font-bold mt-1">Rp {formatCurrency(selectedCurrency.middle_rate || selectedCurrency.exchange_rate)}</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="border rounded-sm">
                  <div className="px-4 py-3 border-b bg-muted/30">
                    <h4 className="text-sm font-semibold">Details</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">General information about this currency pair</p>
                  </div>
                  <div className="px-4 py-2 divide-y">
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-muted-foreground">Spread</span>
                      <span className="text-sm font-medium">Rp {formatCurrency((selectedCurrency.sell_rate || 0) - (selectedCurrency.buy_rate || 0))}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-muted-foreground">Region</span>
                      <span className="text-sm font-medium">{getRegion(selectedCurrency.code)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-muted-foreground">Decimal Places</span>
                      <span className="text-sm font-medium">{selectedCurrency.decimal_places}</span>
                    </div>
                    {change30d && (
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm text-muted-foreground">30-Day Change</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${change30d.change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {change30d.change >= 0 ? '+' : ''}{formatCurrency(change30d.change)}
                          </span>
                          <Badge variant="outline" className={`text-xs ${change30d.pct >= 0 ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'}`}>
                            {change30d.pct >= 0 ? '+' : ''}{change30d.pct.toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chart */}
                <div className="border rounded-sm">
                  <div className="px-4 py-3 border-b bg-muted/30">
                    <h4 className="text-sm font-semibold">30-Day Trend</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Historical buy, sell & middle rates in IDR</p>
                  </div>
                  <div className="p-4">
                    {drawerLoading ? (
                      <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
                        Loading chart data...
                      </div>
                    ) : drawerChartData.length > 0 ? (
                      <>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={drawerChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                              <defs>
                                <linearGradient id="middleGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                              <YAxis
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                domain={[drawerChartMin, drawerChartMax]}
                                tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(Math.round(v))}
                              />
                              <Tooltip
                                contentStyle={{ fontSize: 11, borderRadius: 4, border: '1px solid #e5e7eb' }}
                                formatter={(value: number, name: string) => [`Rp ${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2 }).format(value)}`, name]}
                                labelFormatter={(label: string) => `Date: ${label}`}
                              />
                              <Area type="monotone" dataKey="Middle" stroke="#2563eb" strokeWidth={2} fill="url(#middleGradient)" />
                              <Line type="monotone" dataKey="Buy" stroke="#16a34a" strokeWidth={1} strokeDasharray="4 2" dot={false} />
                              <Line type="monotone" dataKey="Sell" stroke="#dc2626" strokeWidth={1} strokeDasharray="4 2" dot={false} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-0.5 bg-blue-600" />
                            <span className="text-xs text-muted-foreground">Middle</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-0.5" style={{ borderTop: '2px dashed #16a34a' }} />
                            <span className="text-xs text-muted-foreground">Buy</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-0.5" style={{ borderTop: '2px dashed #dc2626' }} />
                            <span className="text-xs text-muted-foreground">Sell</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
                        No historical data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Source */}
                <div className="border rounded-sm">
                  <div className="px-4 py-3 border-b bg-muted/30">
                    <h4 className="text-sm font-semibold">Source</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Data origin and update information</p>
                  </div>
                  <div className="px-4 py-2 divide-y">
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-muted-foreground">Provider</span>
                      <span className="text-sm font-medium">Bank Indonesia</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-muted-foreground">Rate Type</span>
                      <span className="text-sm font-medium">Kurs Transaksi BI</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-muted-foreground">Last Updated</span>
                      <span className="text-sm font-medium">{mounted ? formatDate(selectedCurrency.last_updated) : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </TwoLevelLayout>
  )
}
