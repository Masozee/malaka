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
import { ArrowLeft01Icon, PlusSignIcon, Delete01Icon, AlertCircleIcon } from '@hugeicons/core-free-icons'
import { GoodsIssueDetail, goodsIssueService } from '@/services/inventory'
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

interface IssueItem {
  articleId: string
  quantity: number
  notes: string
}

export default function EditGoodsIssuePage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const issueId = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [articles, setArticles] = useState<Article[]>([])

  const [warehouseId, setWarehouseId] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [status, setStatus] = useState('Draft')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<IssueItem[]>([{ articleId: '', quantity: 1, notes: '' }])
  const [issueNumber, setIssueNumber] = useState('')

  useEffect(() => {
    fetchWarehouses()
    fetchArticles()
    fetchIssue()
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

  const fetchIssue = async () => {
    try {
      setFetching(true)
      setError(null)
      const data = await goodsIssueService.getById(issueId) as GoodsIssueDetail
      if (data.status !== 'Draft') {
        setError('Only draft goods issues can be edited')
        return
      }
      setWarehouseId(data.warehouseId)
      setIssueDate(data.issueDate ? data.issueDate.slice(0, 10) : '')
      setStatus(data.status)
      setNotes(data.notes || '')
      setIssueNumber(data.issueNumber)
      if (data.items && data.items.length > 0) {
        setItems(data.items.map(item => ({
          articleId: item.articleId,
          quantity: item.quantity,
          notes: item.notes || '',
        })))
      }
    } catch (err) {
      console.error('Error fetching goods issue:', err)
      setError('Failed to load goods issue')
    } finally {
      setFetching(false)
    }
  }

  const addItem = () => {
    setItems([...items, { articleId: '', quantity: 1, notes: '' }])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof IssueItem, value: string | number) => {
    setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!warehouseId) {
      addToast({ type: 'error', title: 'Please select a warehouse' })
      return
    }
    if (!issueDate) {
      addToast({ type: 'error', title: 'Please select an issue date' })
      return
    }

    const validItems = items.filter(item => item.articleId && item.quantity > 0)
    if (validItems.length === 0) {
      addToast({ type: 'error', title: 'Please add at least one item' })
      return
    }

    try {
      setLoading(true)
      await goodsIssueService.updateIssue(issueId, {
        warehouse_id: warehouseId,
        issue_date: issueDate,
        status,
        notes: notes || undefined,
        items: validItems.map(item => ({
          article_id: item.articleId,
          quantity: item.quantity,
          notes: item.notes || undefined,
        })),
      })
      addToast({ type: 'success', title: 'Goods issue updated successfully' })
      router.push(`/inventory/goods-issue/${issueId}`)
    } catch (err) {
      console.error('Error updating goods issue:', err)
      addToast({ type: 'error', title: 'Failed to update goods issue' })
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/inventory/goods-issue/${issueId}`)
  }

  const getArticleBarcode = (articleId: string) => {
    const article = articles.find(a => a.id === articleId)
    return article?.barcode || ''
  }

  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const validItemCount = items.filter(item => item.articleId && item.quantity > 0).length

  if (fetching) {
    return (
      <TwoLevelLayout>
        <Header
          title="Edit Goods Issue"
          breadcrumbs={[
            { label: 'Inventory', href: '/inventory' },
            { label: 'Goods Issue', href: '/inventory/goods-issue' },
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
          title="Edit Goods Issue"
          breadcrumbs={[
            { label: 'Inventory', href: '/inventory' },
            { label: 'Goods Issue', href: '/inventory/goods-issue' },
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
                {error === 'Only draft goods issues can be edited'
                  ? 'This goods issue can no longer be modified because its status has changed.'
                  : 'The goods issue you are trying to edit could not be found or loaded.'}
              </p>
              <Button onClick={handleBack} variant="outline">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-2" />
                Back to Details
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
        title={`Edit ${issueNumber}`}
        breadcrumbs={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Goods Issue', href: '/inventory/goods-issue' },
          { label: issueNumber, href: `/inventory/goods-issue/${issueId}` },
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit {issueNumber}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Modify goods issue details and items</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Issue Details</CardTitle>
                <CardDescription>Warehouse, date, and notes for this issue</CardDescription>
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
                    <Label htmlFor="issueDate">Issue Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter notes or reason for this goods issue..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
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
                  <CardDescription>Items overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                    <span className="text-sm font-medium text-muted-foreground">Total Items</span>
                    <span className="text-xl font-bold">{validItemCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                    <span className="text-sm font-medium text-muted-foreground">Total Quantity</span>
                    <span className="text-xl font-bold">{totalQuantity}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Items Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Issue Items</CardTitle>
                  <CardDescription>Articles being issued from warehouse</CardDescription>
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
                      <th className="text-left py-3 px-4 text-[15px] font-semibold text-muted-foreground">Article <span className="text-red-500">*</span></th>
                      <th className="text-left py-3 px-4 text-[15px] font-semibold text-muted-foreground w-24">Code</th>
                      <th className="text-right py-3 px-4 text-[15px] font-semibold text-muted-foreground w-32">Quantity <span className="text-red-500">*</span></th>
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
                            placeholder="Optional notes"
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
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                      <td colSpan={3} className="py-3 px-4 font-semibold">Total</td>
                      <td className="py-3 px-4 text-right font-bold">{totalQuantity}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </TwoLevelLayout>
  )
}
