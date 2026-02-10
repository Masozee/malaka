'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PackageIcon,
  Search01Icon,
  Download01Icon,
  Store01Icon,
  AlertCircleIcon,
  RotateRight01Icon,
  Coins01Icon
} from '@hugeicons/core-free-icons'

import StockControlList, { StockItemDisplay } from './StockControlList'
import { stockService } from '@/services/inventory'

export default function StockControlPage() {
  const [mounted, setMounted] = useState(false)
  const [stockData, setStockData] = useState<StockItemDisplay[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    setMounted(true)
    fetchStockData()
  }, [])

  const fetchStockData = async () => {
    try {
      setLoading(true)
      const response = await stockService.getAll()
      const items: StockItemDisplay[] = response.data.map(item => ({
        ...item,
        category: item.category || '',
        warehouse: item.warehouse || '',
      }))
      setStockData(items)
    } catch (error) {
      console.error('Failed to fetch stock data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = useMemo(() => {
    return stockData.filter(item => {
      const matchesSearch =
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(searchTerm.toLowerCase())

      const matchesWarehouse = selectedWarehouse === 'all' || item.warehouse === selectedWarehouse
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus

      return matchesSearch && matchesWarehouse && matchesStatus
    })
  }, [stockData, searchTerm, selectedWarehouse, selectedStatus])

  // Aggregate values for filters
  const uniqueWarehouses = useMemo(() => Array.from(new Set(stockData.map(i => i.warehouse).filter(Boolean))), [stockData])

  // Stats
  const stats = useMemo(() => {
    const totalItems = filteredData.length
    const totalValue = filteredData.reduce((acc, curr) => acc + (curr.totalValue || 0), 0)
    const lowStock = filteredData.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock').length
    const warehouses = uniqueWarehouses.length
    return { totalItems, totalValue, lowStock, warehouses }
  }, [filteredData, uniqueWarehouses])

  const handleEditStock = (item: StockItemDisplay) => {
    // Edit functionality - could open modal or navigate
  }

  const handleBatchExport = (items: StockItemDisplay[]) => {
    const headers = ['Code', 'Name', 'Category', 'Warehouse', 'Current Stock', 'Min Stock', 'Max Stock', 'Unit Cost', 'Total Value', 'Status']
    const rows = items.map(item => [
      item.code,
      item.name,
      item.category,
      item.warehouse,
      item.currentStock,
      item.minStock,
      item.maxStock,
      item.unitCost,
      item.totalValue,
      item.status
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stock-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <TwoLevelLayout>
      <Header
        title="Stock Control"
        description="Monitor and manage inventory levels across all locations"
        breadcrumbs={[
          { label: "Inventory", href: "/inventory" },
          { label: "Stock Control" }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchStockData}>
              <HugeiconsIcon icon={RotateRight01Icon} className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={PackageIcon} className="h-5 w-5 text-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  {mounted ? `Rp ${(stats.totalValue / 1000000).toFixed(1)}M` : '-'}
                </p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={Coins01Icon} className="h-5 w-5 text-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warehouses</p>
                <p className="text-2xl font-bold">{stats.warehouses}</p>
              </div>
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={Store01Icon} className="h-5 w-5 text-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-2">
          <div className="relative w-64">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 bg-white dark:bg-gray-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {uniqueWarehouses.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="overstock">Overstock</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="h-9" onClick={() => handleBatchExport(filteredData)}>
              <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        {/* Stock Data Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading stock data...</div>
          </div>
        ) : (
          <StockControlList data={filteredData} onEdit={handleEditStock} onBatchExport={handleBatchExport} />
        )}
      </div>
    </TwoLevelLayout>
  )
}
