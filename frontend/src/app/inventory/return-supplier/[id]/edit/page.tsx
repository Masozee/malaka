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
import { ArrowLeft01Icon, PlusSignIcon, Delete01Icon } from '@hugeicons/core-free-icons'
import { returnSupplierService, ReturnSupplierDetail } from '@/services/inventory'
import { apiClient } from '@/lib/api'

interface Supplier {
  id: string
  name: string
  code: string
}

interface Article {
  id: string
  name: string
  barcode: string
}

interface ReturnItem {
  articleId: string
  quantity: number
  notes: string
}

export default function EditReturnSupplierPage() {
  const router = useRouter()
  const params = useParams()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [articles, setArticles] = useState<Article[]>([])

  const [supplierId, setSupplierId] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('draft')
  const [returnNumber, setReturnNumber] = useState('')
  const [items, setItems] = useState<ReturnItem[]>([{ articleId: '', quantity: 1, notes: '' }])

  useEffect(() => {
    fetchSuppliers()
    fetchArticles()
  }, [])

  useEffect(() => {
    if (params.id) fetchDetail()
  }, [params.id])

  const fetchSuppliers = async () => {
    try {
      const response = await apiClient.get<{ success: boolean, data: Supplier[] }>('/api/v1/masterdata/suppliers/')
      setSuppliers(response.data || [])
    } catch (err) {
      console.error('Error fetching suppliers:', err)
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

  const fetchDetail = async () => {
    try {
      setInitialLoading(true)
      const result = await returnSupplierService.getDetail(params.id as string)
      setSupplierId(result.supplierId)
      setReturnDate(result.returnDate ? result.returnDate.slice(0, 10) : '')
      setReason(result.reason || '')
      setNotes(result.notes || '')
      setStatus(result.status || 'draft')
      setReturnNumber(result.returnNumber || '')
      if (result.items && result.items.length > 0) {
        setItems(result.items.map(i => ({
          articleId: i.articleId,
          quantity: i.quantity,
          notes: i.notes || '',
        })))
      }
    } catch (error) {
      console.error('Failed to fetch return detail:', error)
      addToast({ type: 'error', title: 'Failed to load return data' })
    } finally {
      setInitialLoading(false)
    }
  }

  const addItem = () => {
    setItems([...items, { articleId: '', quantity: 1, notes: '' }])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof ReturnItem, value: string | number) => {
    setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const getArticleBarcode = (articleId: string) => {
    return articles.find(a => a.id === articleId)?.barcode || ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supplierId) {
      addToast({ type: 'error', title: 'Please select a supplier' })
      return
    }

    const validItems = items.filter(item => item.articleId && item.quantity > 0)
    if (validItems.length === 0) {
      addToast({ type: 'error', title: 'Please add at least one item' })
      return
    }

    try {
      setLoading(true)
      await returnSupplierService.updateReturn(params.id as string, {
        supplier_id: supplierId,
        return_date: returnDate,
        reason: reason || undefined,
        status,
        notes: notes || undefined,
        items: validItems.map(item => ({
          article_id: item.articleId,
          quantity: item.quantity,
          notes: item.notes || undefined,
        })),
      })
      addToast({ type: 'success', title: 'Return updated successfully' })
      router.push(`/inventory/return-supplier/${params.id}`)
    } catch (err) {
      console.error('Error updating return:', err)
      addToast({ type: 'error', title: 'Failed to update return' })
    } finally {
      setLoading(false)
    }
  }

  const validItemCount = items.filter(i => i.articleId).length
  const totalQty = items.filter(i => i.articleId).reduce((sum, i) => sum + i.quantity, 0)

  if (initialLoading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Edit Return"
          breadcrumbs={[
            { label: 'Inventory', href: '/inventory' },
            { label: 'Return Supplier', href: '/inventory/return-supplier' },
            { label: 'Edit' },
          ]}
          compact
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
        title={`Edit ${returnNumber || 'Return'}`}
        breadcrumbs={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Return Supplier', href: '/inventory/return-supplier' },
          { label: returnNumber || 'Edit', href: `/inventory/return-supplier/${params.id}` },
          { label: 'Edit' },
        ]}
        compact
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <button
          onClick={() => router.push(`/inventory/return-supplier/${params.id}`)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
          Back to Detail
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Return Details</CardTitle>
                <CardDescription>Update supplier and return information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier <span className="text-red-500">*</span></Label>
                    <Select value={supplierId} onValueChange={setSupplierId}>
                      <SelectTrigger id="supplier">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="returnDate">Return Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="returnDate"
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      placeholder="e.g. Damaged goods, Wrong items, Quality issue..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
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
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={() => router.push(`/inventory/return-supplier/${params.id}`)}>
                    Cancel
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                    <span className="text-sm font-medium text-muted-foreground">Items</span>
                    <span className="text-xl font-bold">{validItemCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                    <span className="text-sm font-medium text-muted-foreground">Total Qty</span>
                    <span className="text-xl font-bold">{totalQty}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Return Items</CardTitle>
                  <CardDescription>Select articles to return to supplier</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-1.5" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-[15px] font-semibold text-muted-foreground w-12">#</th>
                      <th className="text-left py-3 px-4 text-[15px] font-semibold text-muted-foreground">Article</th>
                      <th className="text-left py-3 px-4 text-[15px] font-semibold text-muted-foreground w-24">Code</th>
                      <th className="text-right py-3 px-4 text-[15px] font-semibold text-muted-foreground w-28">Qty <span className="text-red-500">*</span></th>
                      <th className="text-left py-3 px-4 text-[15px] font-semibold text-muted-foreground">Notes</th>
                      <th className="py-3 px-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4 text-muted-foreground">{index + 1}</td>
                        <td className="py-3 px-4">
                          <Select value={item.articleId} onValueChange={(val) => updateItem(index, 'articleId', val)}>
                            <SelectTrigger className="w-full">
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
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[13px] text-muted-foreground">
                            {getArticleBarcode(item.articleId) || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full text-right"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Input
                            value={item.notes}
                            onChange={(e) => updateItem(index, 'notes', e.target.value)}
                            placeholder="Optional"
                            className="w-full"
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
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </TwoLevelLayout>
  )
}
