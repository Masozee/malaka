'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PackageIcon,
  Search01Icon,
  FilterIcon,
  Download01Icon,
  PlusSignIcon,
  Store01Icon,
  AlertCircleIcon,
  RotateRight01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Coins01Icon
} from '@hugeicons/core-free-icons'

import StockControlList, { StockItemDisplay } from './StockControlList'
import { StockItem } from '@/services/inventory'

// Mock Data
const mockStockData: StockItemDisplay[] = [
  {
    id: '1',
    code: 'SPT-001-BLK-42',
    name: 'Sport Running Shoes Black',
    category: 'Sports Shoes',
    warehouse: 'Main Warehouse Jakarta',
    currentStock: 154,
    minStock: 50,
    maxStock: 500,
    unitCost: 450000,
    totalValue: 69300000,
    status: 'in_stock'
  },
  {
    id: '2',
    code: 'CAS-002-BRN-40',
    name: 'Casual Leather Shoes Brown',
    category: 'Casual Shoes',
    warehouse: 'Main Warehouse Jakarta',
    currentStock: 24,
    minStock: 30,
    maxStock: 200,
    unitCost: 650000,
    totalValue: 15600000,
    status: 'low_stock'
  },
  {
    id: '3',
    code: 'FML-003-BLK-38',
    name: 'Formal Office Shoes Black',
    category: 'Formal Shoes',
    warehouse: 'Store Plaza Indonesia',
    currentStock: 0,
    minStock: 20,
    maxStock: 100,
    unitCost: 750000,
    totalValue: 0,
    status: 'out_of_stock'
  },
  {
    id: '4',
    code: 'BOT-005-BLK-43',
    name: 'Work Boots Black',
    category: 'Boots',
    warehouse: 'Regional Warehouse Surabaya',
    currentStock: 320,
    minStock: 50,
    maxStock: 300,
    unitCost: 850000,
    totalValue: 272000000,
    status: 'overstock'
  }
]

export default function StockControlPage() {
  const [mounted, setMounted] = useState(false)
  const [stockData, setStockData] = useState<StockItemDisplay[]>(mockStockData) // Use mock data initially
  const [loading, setLoading] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<StockItemDisplay | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredData = useMemo(() => {
    return stockData.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesWarehouse = selectedWarehouse === 'all' || item.warehouse === selectedWarehouse
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory

      return matchesSearch && matchesWarehouse && matchesStatus && matchesCategory
    })
  }, [stockData, searchTerm, selectedWarehouse, selectedStatus, selectedCategory])

  // Aggregate values for filters
  const uniqueWarehouses = useMemo(() => Array.from(new Set(stockData.map(i => i.warehouse))), [stockData])
  const uniqueCategories = useMemo(() => Array.from(new Set(stockData.map(i => i.category))), [stockData])

  // Stats
  const stats = useMemo(() => {
    const totalItems = filteredData.length
    const totalValue = filteredData.reduce((acc, curr) => acc + (curr.totalValue || 0), 0)
    const lowStock = filteredData.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock').length
    const warehouses = uniqueWarehouses.length
    return { totalItems, totalValue, lowStock, warehouses }
  }, [filteredData, uniqueWarehouses])

  const handleEditStock = (item: StockItemDisplay) => {
    setEditingItem(item)
    setIsEditModalOpen(true)
  }

  const handleCloseModals = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setEditingItem(null)
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
            <Button variant="outline" size="sm" onClick={() => { }}>
              <HugeiconsIcon icon={RotateRight01Icon} className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
              Add Stock
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
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600">
                <HugeiconsIcon icon={PackageIcon} className="h-6 w-6" />
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
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center text-green-600">
                <HugeiconsIcon icon={Coins01Icon} className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
              </div>
              <div className="h-10 w-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-600">
                <HugeiconsIcon icon={AlertCircleIcon} className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warehouses</p>
                <p className="text-2xl font-bold">{stats.warehouses}</p>
              </div>
              <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center text-purple-600">
                <HugeiconsIcon icon={Store01Icon} className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-end gap-2">
          <div className="flex items-center gap-2">
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {uniqueWarehouses.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
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
          </div>

          <div className="relative">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>

          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Stock Data Table */}
        <StockControlList data={filteredData} onEdit={handleEditStock} />
      </div>

      {/* Create Stock Modal - Keeping simulated dialog for now but styled properly */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Stock</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="article" className="text-right">Article</Label>
              <div className="col-span-3">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select article" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nike-air-max-39">Nike Air Max 39</SelectItem>
                    <SelectItem value="casual-walker-40">Casual Walker 40</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="warehouse" className="text-right">Warehouse</Label>
              <div className="col-span-3">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueWarehouses.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
              <Input id="quantity" type="number" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModals}>Cancel</Button>
            <Button onClick={handleCloseModals}>Add Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stock Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Stock - {editingItem?.code}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input id="edit-name" value={editingItem?.name} disabled className="col-span-3 bg-muted" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-wh" className="text-right">Warehouse</Label>
              <Input id="edit-wh" value={editingItem?.warehouse} disabled className="col-span-3 bg-muted" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-qty" className="text-right">Current</Label>
              <Input id="edit-qty" type="number" defaultValue={editingItem?.currentStock} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-min" className="text-right">Min</Label>
              <Input id="edit-min" type="number" defaultValue={editingItem?.minStock} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-max" className="text-right">Max</Label>
              <Input id="edit-max" type="number" defaultValue={editingItem?.maxStock} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModals}>Cancel</Button>
            <Button onClick={handleCloseModals}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TwoLevelLayout>
  )
}