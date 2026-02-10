'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
import { ArrowLeft01Icon, AlertCircleIcon } from '@hugeicons/core-free-icons'
import { StockAdjustment, stockAdjustmentService } from '@/services/inventory'
import { apiClient } from '@/lib/api'

interface Warehouse {
  id: string
  name: string
  code: string
}

interface Article {
  id: string
  name: string
  barcode: string
}

export default function EditStockAdjustmentPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const adjustmentId = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [articles, setArticles] = useState<Article[]>([])

  const [articleId, setArticleId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [quantity, setQuantity] = useState<number>(0)
  const [adjustmentDate, setAdjustmentDate] = useState('')
  const [reason, setReason] = useState('')
  const [adjustmentNumber, setAdjustmentNumber] = useState('')

  useEffect(() => {
    fetchWarehouses()
    fetchArticles()
    fetchAdjustment()
  }, [])

  const fetchWarehouses = async () => {
    try {
      const response = await apiClient.get<{ success: boolean, data: Warehouse[] }>('/api/v1/masterdata/warehouses/')
      setWarehouses(response.data || [])
    } catch (err) {
      console.error('Error fetching warehouses:', err)
    }
  }

  const fetchArticles = async () => {
    try {
      const response = await apiClient.get<{ success: boolean, data: Article[] }>('/api/v1/masterdata/articles/')
      setArticles(response.data || [])
    } catch (err) {
      console.error('Error fetching articles:', err)
    }
  }

  const fetchAdjustment = async () => {
    try {
      setFetching(true)
      setError(null)
      const data = await stockAdjustmentService.getById(adjustmentId) as StockAdjustment
      setArticleId(data.articleId)
      setWarehouseId(data.warehouseId)
      setQuantity(data.quantity)
      setAdjustmentDate(data.adjustmentDate ? data.adjustmentDate.slice(0, 10) : '')
      setReason(data.reason || '')
      setAdjustmentNumber(data.adjustmentNumber)
    } catch (err) {
      console.error('Error fetching stock adjustment:', err)
      setError('Failed to load stock adjustment')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!articleId) {
      addToast({ type: 'error', title: 'Please select an article' })
      return
    }
    if (!warehouseId) {
      addToast({ type: 'error', title: 'Please select a warehouse' })
      return
    }
    if (quantity === 0) {
      addToast({ type: 'error', title: 'Quantity cannot be zero' })
      return
    }
    if (!adjustmentDate) {
      addToast({ type: 'error', title: 'Please select an adjustment date' })
      return
    }
    if (!reason.trim()) {
      addToast({ type: 'error', title: 'Please enter a reason for the adjustment' })
      return
    }

    try {
      setLoading(true)
      await stockAdjustmentService.updateAdjustment(adjustmentId, {
        article_id: articleId,
        warehouse_id: warehouseId,
        quantity,
        adjustment_date: adjustmentDate,
        reason: reason.trim(),
      })
      addToast({ type: 'success', title: 'Stock adjustment updated successfully' })
      router.push(`/inventory/adjustments/${adjustmentId}`)
    } catch (err) {
      console.error('Error updating stock adjustment:', err)
      addToast({ type: 'error', title: 'Failed to update stock adjustment' })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/inventory/adjustments/${adjustmentId}`)
  }

  const selectedArticle = articles.find(a => a.id === articleId)

  if (fetching) {
    return (
      <TwoLevelLayout>
        <Header
          title="Edit Adjustment"
          breadcrumbs={[
            { label: 'Inventory', href: '/inventory' },
            { label: 'Adjustments', href: '/inventory/adjustments' },
            { label: 'Edit' },
          ]}
          compact
        />
        <div className="flex-1 p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </TwoLevelLayout>
    )
  }

  if (error) {
    return (
      <TwoLevelLayout>
        <Header
          title="Edit Adjustment"
          breadcrumbs={[
            { label: 'Inventory', href: '/inventory' },
            { label: 'Adjustments', href: '/inventory/adjustments' },
            { label: 'Edit' },
          ]}
          compact
        />
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <HugeiconsIcon icon={AlertCircleIcon} className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{error}</h3>
              <p className="text-muted-foreground mb-6">
                The stock adjustment you are trying to edit could not be found or loaded.
              </p>
              <Button onClick={() => router.push('/inventory/adjustments')} variant="outline">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-2" />
                Back to Adjustments
              </Button>
            </CardContent>
          </Card>
        </div>
      </TwoLevelLayout>
    )
  }

  return (
    <TwoLevelLayout>
      <Header
        title={`Edit ${adjustmentNumber}`}
        breadcrumbs={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Adjustments', href: '/inventory/adjustments' },
          { label: adjustmentNumber, href: `/inventory/adjustments/${adjustmentId}` },
          { label: 'Edit' },
        ]}
        compact
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Back link */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
          Back to Details
        </button>

        {/* Page title */}
        <div className="-mt-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit {adjustmentNumber}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Modify stock adjustment details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Adjustment Details</CardTitle>
                <CardDescription>Article, warehouse, and quantity information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="article">Article <span className="text-red-500">*</span></Label>
                    <Select value={articleId} onValueChange={setArticleId}>
                      <SelectTrigger id="article">
                        <SelectValue placeholder="Select article" />
                      </SelectTrigger>
                      <SelectContent>
                        {articles.map((article) => (
                          <SelectItem key={article.id} value={article.id}>
                            {article.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedArticle?.barcode && (
                      <p className="text-xs text-muted-foreground font-mono">{selectedArticle.barcode}</p>
                    )}
                  </div>
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
                    <Label htmlFor="quantity">Quantity <span className="text-red-500">*</span></Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                      placeholder="Positive to add, negative to deduct"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use positive values to add stock, negative values to deduct
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adjustmentDate">Adjustment Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="adjustmentDate"
                      type="date"
                      value={adjustmentDate}
                      onChange={(e) => setAdjustmentDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="reason"
                    placeholder="Enter reason for the stock adjustment..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={handleBack}>
                    Cancel
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                  <CardDescription>Adjustment preview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                    <span className="text-sm font-medium text-muted-foreground">Quantity</span>
                    <span className={`text-xl font-bold ${quantity > 0 ? 'text-green-600' : quantity < 0 ? 'text-red-600' : ''}`}>
                      {quantity > 0 ? '+' : ''}{quantity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                    <span className="text-sm font-medium text-muted-foreground">Type</span>
                    <span className="text-sm font-semibold">
                      {quantity > 0 ? 'Addition' : quantity < 0 ? 'Deduction' : '-'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </TwoLevelLayout>
  )
}
