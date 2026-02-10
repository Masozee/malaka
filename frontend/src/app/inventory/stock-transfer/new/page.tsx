'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  FloppyDiskIcon,
  PlusSignIcon,
  Delete01Icon,
  PackageIcon,
  Store01Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons'
import { stockTransferService } from '@/services/inventory'
import { apiClient } from '@/lib/api'

interface Warehouse {
  id: string
  name: string
  code: string
  address?: string
}

interface WarehouseStockItem {
  id: string
  code: string
  name: string
  currentStock: number
  article_details?: {
    id: string
    name: string
    barcode: string
  }
  warehouse_details?: {
    id: string
  }
}

interface TransferItemForm {
  localId: string
  article_id: string
  quantity: number
}

export default function CreateStockTransferPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [warehouseStock, setWarehouseStock] = useState<WarehouseStockItem[]>([])
  const [loadingStock, setLoadingStock] = useState(false)

  const [fromWarehouseId, setFromWarehouseId] = useState('')
  const [toWarehouseId, setToWarehouseId] = useState('')
  const [items, setItems] = useState<TransferItemForm[]>([
    { localId: '1', article_id: '', quantity: 1 },
  ])

  useEffect(() => {
    setMounted(true)
    fetchWarehouses()
  }, [])

  // Fetch stock when origin warehouse changes
  useEffect(() => {
    if (fromWarehouseId) {
      fetchWarehouseStock(fromWarehouseId)
      // Reset items when warehouse changes
      setItems([{ localId: '1', article_id: '', quantity: 1 }])
    } else {
      setWarehouseStock([])
    }
  }, [fromWarehouseId])

  const fetchWarehouses = async () => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Warehouse[] }>('/api/v1/masterdata/warehouses/')
      setWarehouses(response.data || [])
    } catch (error) {
      console.error('Failed to fetch warehouses:', error)
    }
  }

  const fetchWarehouseStock = async (warehouseId: string) => {
    try {
      setLoadingStock(true)
      const response = await apiClient.get<{ success: boolean; data: WarehouseStockItem[] }>(
        '/api/v1/inventory/stock/control',
        undefined,
        { cache: false }
      )
      // Filter stock items to only those in the selected warehouse
      const filtered = (response.data || []).filter(
        item => item.warehouse_details?.id === warehouseId && item.currentStock > 0
      )
      setWarehouseStock(filtered)
    } catch (error) {
      console.error('Failed to fetch warehouse stock:', error)
      setWarehouseStock([])
    } finally {
      setLoadingStock(false)
    }
  }

  const addItem = () => {
    setItems([...items, { localId: Date.now().toString(), article_id: '', quantity: 1 }])
  }

  const removeItem = (localId: string) => {
    if (items.length === 1) return
    setItems(items.filter(item => item.localId !== localId))
  }

  const updateItem = (localId: string, field: keyof TransferItemForm, value: string | number) => {
    setItems(items.map(item => {
      if (item.localId === localId) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const getStockForArticle = (articleId: string) => {
    // article_details.id is the actual article UUID
    const stockItem = warehouseStock.find(s => s.article_details?.id === articleId)
    return stockItem?.currentStock || 0
  }

  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const validItemCount = items.filter(i => i.article_id && i.quantity > 0).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fromWarehouseId) {
      alert('Please select origin warehouse')
      return
    }
    if (!toWarehouseId) {
      alert('Please select destination warehouse')
      return
    }
    if (fromWarehouseId === toWarehouseId) {
      alert('Origin and destination warehouse cannot be the same')
      return
    }

    const validItems = items.filter(item => item.article_id && item.quantity > 0)
    if (validItems.length === 0) {
      alert('Please add at least one item with a valid article and quantity')
      return
    }

    // Check stock availability
    for (const item of validItems) {
      const available = getStockForArticle(item.article_id)
      if (item.quantity > available) {
        const stockItem = warehouseStock.find(s => s.article_details?.id === item.article_id)
        alert(`Insufficient stock for ${stockItem?.name || 'item'}. Available: ${available}, Requested: ${item.quantity}`)
        return
      }
    }

    try {
      setLoading(true)
      await stockTransferService.create({
        from_warehouse_id: fromWarehouseId,
        to_warehouse_id: toWarehouseId,
        items: validItems.map(item => ({
          article_id: item.article_id,
          quantity: item.quantity,
        })),
      } as any)
      router.push('/inventory/stock-transfer')
    } catch (error) {
      console.error('Error creating transfer:', error)
      alert('Failed to create transfer order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFromWarehouseChange = (value: string) => {
    setFromWarehouseId(value)
  }

  const fromWarehouse = warehouses.find(w => w.id === fromWarehouseId)
  const toWarehouse = warehouses.find(w => w.id === toWarehouseId)

  return (
    <TwoLevelLayout>
      <Header
        title="New Stock Transfer"
        description="Create a new transfer order between warehouses"
        breadcrumbs={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Stock Transfer', href: '/inventory/stock-transfer' },
          { label: 'New Transfer' },
        ]}
      />

      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Warehouse Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HugeiconsIcon icon={Store01Icon} className="w-5 h-5 text-gray-500" />
                Warehouse Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>
                    From Warehouse <span className="text-red-500">*</span>
                  </Label>
                  <Select value={fromWarehouseId} onValueChange={handleFromWarehouseChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select origin warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {mounted && warehouses.map(wh => (
                        <SelectItem key={wh.id} value={wh.id} disabled={wh.id === toWarehouseId}>
                          {wh.name} ({wh.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fromWarehouse?.address && (
                    <p className="text-xs text-muted-foreground">{fromWarehouse.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    To Warehouse <span className="text-red-500">*</span>
                  </Label>
                  <Select value={toWarehouseId} onValueChange={setToWarehouseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {mounted && warehouses.map(wh => (
                        <SelectItem key={wh.id} value={wh.id} disabled={wh.id === fromWarehouseId}>
                          {wh.name} ({wh.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {toWarehouse?.address && (
                    <p className="text-xs text-muted-foreground">{toWarehouse.address}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Route */}
          {(fromWarehouse || toWarehouse) && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {fromWarehouse && (
                    <div className="space-y-1 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="font-semibold text-blue-800 dark:text-blue-300">Origin</div>
                      <div className="text-blue-700 dark:text-blue-400">{fromWarehouse.name}</div>
                      <div className="text-blue-600 dark:text-blue-500 text-xs">{fromWarehouse.code}</div>
                      <div className="text-blue-600 dark:text-blue-500 text-xs mt-1">
                        {loadingStock ? 'Loading stock...' : `${warehouseStock.length} article(s) in stock`}
                      </div>
                    </div>
                  )}
                  {toWarehouse && (
                    <div className="space-y-1 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="font-semibold text-green-800 dark:text-green-300">Destination</div>
                      <div className="text-green-700 dark:text-green-400">{toWarehouse.name}</div>
                      <div className="text-green-600 dark:text-green-500 text-xs">{toWarehouse.code}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transfer Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HugeiconsIcon icon={PackageIcon} className="w-5 h-5 text-gray-500" />
                  Transfer Items
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  disabled={!fromWarehouseId || warehouseStock.length === 0}
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!fromWarehouseId ? (
                <div className="flex items-center gap-3 p-4 text-sm text-muted-foreground bg-muted rounded-lg">
                  <HugeiconsIcon icon={AlertCircleIcon} className="w-5 h-5 shrink-0" />
                  Please select an origin warehouse first to see available items.
                </div>
              ) : loadingStock ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3" />
                  <span className="text-muted-foreground text-sm">Loading stock from warehouse...</span>
                </div>
              ) : warehouseStock.length === 0 ? (
                <div className="flex items-center gap-3 p-4 text-sm text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <HugeiconsIcon icon={AlertCircleIcon} className="w-5 h-5 shrink-0" />
                  No items with stock found in this warehouse.
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const availableStock = item.article_id ? getStockForArticle(item.article_id) : 0
                    const overStock = item.article_id && item.quantity > availableStock

                    return (
                      <div key={item.localId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-muted-foreground">Item {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.localId)}
                            disabled={items.length === 1}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                          <div className="md:col-span-4 space-y-2">
                            <Label>Article <span className="text-red-500">*</span></Label>
                            <Select
                              value={item.article_id}
                              onValueChange={(value) => updateItem(item.localId, 'article_id', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select article from warehouse stock" />
                              </SelectTrigger>
                              <SelectContent>
                                {mounted && warehouseStock.map(stockItem => (
                                  <SelectItem key={stockItem.article_details?.id || stockItem.id} value={stockItem.article_details?.id || stockItem.id}>
                                    {stockItem.code} - {stockItem.name} (stock: {stockItem.currentStock})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Available</Label>
                            <div className="h-9 flex items-center px-3 bg-muted rounded-md text-sm font-medium">
                              {item.article_id ? availableStock : '-'}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Quantity <span className="text-red-500">*</span></Label>
                            <Input
                              type="number"
                              min={1}
                              max={availableStock || undefined}
                              value={item.quantity}
                              onChange={(e) => updateItem(item.localId, 'quantity', parseInt(e.target.value) || 0)}
                              placeholder="Qty"
                              className={overStock ? 'border-red-500 focus-visible:ring-red-500' : ''}
                            />
                            {overStock && (
                              <p className="text-xs text-red-500">Exceeds available stock</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Summary */}
                  <div className="border-t pt-4 flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {validItemCount} item(s)
                    </span>
                    <span className="font-semibold">
                      Total Quantity: {totalQuantity}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/inventory/stock-transfer')}
              disabled={loading}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !fromWarehouseId || !toWarehouseId || validItemCount === 0}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <HugeiconsIcon icon={FloppyDiskIcon} className="w-4 h-4 mr-2" />
              )}
              Create Transfer
            </Button>
          </div>
        </form>
      </div>
    </TwoLevelLayout>
  )
}
