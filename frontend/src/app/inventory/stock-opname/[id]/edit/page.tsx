'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import {
    ArrowLeft01Icon,
    PlusSignIcon,
    Delete01Icon,
    FloppyDiskIcon,
    CheckmarkCircle01Icon
} from '@hugeicons/core-free-icons'
import { stockOpnameService, WarehouseStockItem } from '@/services/inventory'
import { apiClient } from '@/lib/api'

interface Warehouse {
  id: string
  name: string
  code: string
}

interface OpnameItem {
  articleId: string
  articleName: string
  articleCode: string
  systemQty: number
  actualQty: number
  notes: string
}

export default function EditStockOpnamePage() {
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [warehouseStock, setWarehouseStock] = useState<WarehouseStockItem[]>([])
  const [stockLoading, setStockLoading] = useState(false)

  const [sessionId, setSessionId] = useState('')
  const [opnameNumber, setOpnameNumber] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [opnameDate, setOpnameDate] = useState('')
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<OpnameItem[]>([])
  const [initialWarehouseId, setInitialWarehouseId] = useState('')

  useEffect(() => {
    setMounted(true)
    fetchWarehouses()
  }, [])

  useEffect(() => {
    if (params.id) {
      fetchSession()
    }
  }, [params.id])

  // Fetch warehouse stock when warehouse changes (but not on initial load)
  useEffect(() => {
    if (warehouseId && warehouseId !== initialWarehouseId) {
      fetchWarehouseStock(warehouseId)
      // Reset items when warehouse changes
      setItems([{ articleId: '', articleName: '', articleCode: '', systemQty: 0, actualQty: 0, notes: '' }])
    } else if (warehouseId && warehouseId === initialWarehouseId) {
      // Load stock for the initial warehouse (to populate dropdowns)
      fetchWarehouseStock(warehouseId)
    }
  }, [warehouseId, initialWarehouseId])

  const fetchWarehouses = async () => {
    try {
      const response = await apiClient.get<{ success: boolean, data: Warehouse[] }>('/api/v1/masterdata/warehouses/')
      setWarehouses(response.data || [])
    } catch (err) {
      console.error('Error fetching warehouses:', err)
    }
  }

  const fetchWarehouseStock = async (whId: string) => {
    try {
      setStockLoading(true)
      const stock = await stockOpnameService.getWarehouseStock(whId)
      setWarehouseStock(stock)
    } catch (err) {
      console.error('Error fetching warehouse stock:', err)
      setWarehouseStock([])
    } finally {
      setStockLoading(false)
    }
  }

  const fetchSession = async () => {
    try {
      setLoading(true)
      const data = await stockOpnameService.getDetail(params.id as string)
      setSessionId(data.id)
      setOpnameNumber(data.opnameNumber)
      setWarehouseId(data.warehouseId)
      setInitialWarehouseId(data.warehouseId)
      setOpnameDate(data.opnameDate ? data.opnameDate.slice(0, 10) : '')
      setStatus(data.status)
      setNotes(data.notes || '')

      if (data.items && data.items.length > 0) {
        setItems(data.items.map(item => ({
          articleId: item.articleId,
          articleName: item.articleName || '',
          articleCode: item.articleCode || '',
          systemQty: item.systemQty,
          actualQty: item.actualQty,
          notes: item.notes || '',
        })))
      } else {
        setItems([{ articleId: '', articleName: '', articleCode: '', systemQty: 0, actualQty: 0, notes: '' }])
      }
    } catch (error) {
      console.error('Failed to fetch session:', error)
      addToast({ type: 'error', title: 'Failed to load session details' })
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    setItems([...items, { articleId: '', articleName: '', articleCode: '', systemQty: 0, actualQty: 0, notes: '' }])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const handleArticleChange = (index: number, articleId: string) => {
    const stockItem = warehouseStock.find(s => s.articleId === articleId)
    setItems(items.map((item, i) => i === index ? {
      ...item,
      articleId,
      articleName: stockItem?.articleName || '',
      articleCode: stockItem?.articleCode || '',
      systemQty: stockItem?.quantity || 0,
    } : item))
  }

  const handleActualQtyChange = (index: number, qty: number) => {
    setItems(items.map((item, i) => i === index ? { ...item, actualQty: qty } : item))
  }

  const handleNotesChange = (index: number, val: string) => {
    setItems(items.map((item, i) => i === index ? { ...item, notes: val } : item))
  }

  const handleSave = async (complete: boolean = false) => {
    if (!warehouseId) {
      addToast({ type: 'error', title: 'Please select a warehouse' })
      return
    }

    const validItems = items.filter(item => item.articleId)

    if (validItems.length === 0) {
      addToast({ type: 'error', title: 'Please add at least one article to count' })
      return
    }

    try {
      setSaving(true)
      await stockOpnameService.updateOpname(sessionId, {
        warehouse_id: warehouseId,
        opname_date: opnameDate,
        status: complete ? 'completed' : status,
        notes,
        items: validItems.map(item => ({
          article_id: item.articleId,
          actual_qty: item.actualQty,
          notes: item.notes || undefined,
        })),
      })
      addToast({ type: 'success', title: complete ? 'Session completed' : 'Session updated' })
      router.push(`/inventory/stock-opname/${sessionId}`)
    } catch (error) {
      console.error('Error updating stock opname:', error)
      addToast({ type: 'error', title: 'Failed to save changes' })
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    router.push(`/inventory/stock-opname/${sessionId}`)
  }

  // Available articles = warehouse stock items not already selected
  const selectedArticleIds = new Set(items.map(i => i.articleId).filter(Boolean))
  const getAvailableArticles = (currentArticleId: string) => {
    return warehouseStock.filter(s => s.articleId === currentArticleId || !selectedArticleIds.has(s.articleId))
  }

  const validItemCount = items.filter(item => item.articleId).length
  const matchedCount = items.filter(item => item.articleId && item.actualQty === item.systemQty).length
  const mismatchCount = items.filter(item => item.articleId && item.actualQty !== item.systemQty).length

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Edit Stock Opname"
          breadcrumbs={[
            { label: 'Inventory', href: '/inventory' },
            { label: 'Stock Opname', href: '/inventory/stock-opname' },
          ]}
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </TwoLevelLayout>
    )
  }

  return (
    <TwoLevelLayout>
      <Header
        title={`Edit: ${opnameNumber}`}
        description={mounted && opnameDate ? `Opname date: ${new Date(opnameDate + 'T00:00:00Z').toLocaleDateString('id-ID')}` : ''}
        breadcrumbs={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Stock Opname', href: '/inventory/stock-opname' },
          { label: opnameNumber, href: `/inventory/stock-opname/${sessionId}` },
          { label: 'Edit' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
              <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4 mr-2" />
              Save
            </Button>
            {status !== 'completed' && (
              <Button onClick={() => handleSave(true)} disabled={saving}>
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 mr-2" />
                Complete
              </Button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
          Back to Detail
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Session Details</CardTitle>
              <CardDescription>Update warehouse, date, and status — system quantities loaded automatically</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="warehouse">Warehouse <span className="text-red-500">*</span></Label>
                  <Select value={warehouseId} onValueChange={setWarehouseId}>
                    <SelectTrigger id="warehouse">
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>
                          {wh.name} ({wh.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opnameDate">Opname Date</Label>
                  <Input
                    id="opnameDate"
                    type="date"
                    value={opnameDate}
                    onChange={(e) => setOpnameDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Optional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Count Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                  <span className="text-sm font-medium text-muted-foreground">Total Items</span>
                  <span className="text-xl font-bold">{validItemCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                  <span className="text-sm font-medium text-muted-foreground">Matched</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xl font-bold text-green-600">{matchedCount}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                  <span className="text-sm font-medium text-muted-foreground">Mismatch</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-xl font-bold text-red-600">{mismatchCount}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Items table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Opname Items</CardTitle>
                <CardDescription>
                  {warehouseId
                    ? stockLoading
                      ? 'Loading warehouse stock...'
                      : `Select articles to count — system qty loaded from current stock (${warehouseStock.length} articles in warehouse)`
                    : 'Select a warehouse first to load available articles'
                  }
                </CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={!warehouseId}>
                <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-1.5" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!warehouseId ? (
              <div className="p-8 text-center text-muted-foreground">
                Please select a warehouse above to load available articles and their stock quantities.
              </div>
            ) : stockLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading stock data for selected warehouse...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-[15px] font-semibold text-muted-foreground w-12">#</th>
                      <th className="text-left py-3 px-4 text-[15px] font-semibold text-muted-foreground">Article</th>
                      <th className="text-left py-3 px-4 text-[15px] font-semibold text-muted-foreground w-24">Code</th>
                      <th className="text-right py-3 px-4 text-[15px] font-semibold text-muted-foreground w-28">System Qty</th>
                      <th className="text-right py-3 px-4 text-[15px] font-semibold text-muted-foreground w-28">Actual Qty <span className="text-red-500">*</span></th>
                      <th className="text-center py-3 px-4 text-[15px] font-semibold text-muted-foreground w-24">Variance</th>
                      <th className="text-left py-3 px-4 text-[15px] font-semibold text-muted-foreground">Notes</th>
                      <th className="py-3 px-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const variance = item.actualQty - item.systemQty
                      const availableArticles = getAvailableArticles(item.articleId)
                      return (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4 text-muted-foreground">{index + 1}</td>
                          <td className="py-3 px-4">
                            <Select value={item.articleId} onValueChange={(val) => handleArticleChange(index, val)}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select article" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableArticles.map((stock) => (
                                  <SelectItem key={stock.articleId} value={stock.articleId}>
                                    {stock.articleName} (qty: {stock.quantity})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-[13px] text-muted-foreground">
                              {item.articleCode || '-'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-right font-medium bg-gray-50 dark:bg-gray-800 py-2 px-3 rounded text-sm">
                              {item.articleId ? item.systemQty : '-'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              min={0}
                              value={item.actualQty}
                              onChange={(e) => handleActualQtyChange(index, parseInt(e.target.value) || 0)}
                              className="w-full text-right"
                              disabled={!item.articleId}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className={`text-center font-bold ${!item.articleId ? 'text-gray-300' : variance === 0 ? 'text-gray-400' : variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.articleId ? `${variance > 0 ? '+' : ''}${variance}` : '-'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              value={item.notes}
                              onChange={(e) => handleNotesChange(index, e.target.value)}
                              placeholder="Optional"
                              className="w-full"
                              disabled={!item.articleId}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              disabled={items.length <= 1}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TwoLevelLayout>
  )
}
