'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  PrinterIcon,
  Download01Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons'
import { GoodsIssueDetail, goodsIssueService } from '@/services/inventory'

const statusConfig: Record<string, { label: string; color: string }> = {
  Draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  Pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' },
  Completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
  Canceled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
}

export default function GoodsIssueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [issue, setIssue] = useState<GoodsIssueDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const issueId = params.id as string

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (issueId) {
      fetchDetail()
    }
  }, [issueId])

  const fetchDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await goodsIssueService.getById(issueId) as GoodsIssueDetail
      setIssue(data)
    } catch (err) {
      console.error('Error fetching goods issue detail:', err)
      setError('Failed to load goods issue details')
      setIssue(null)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/inventory/goods-issue')
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this goods issue?')) return
    try {
      await goodsIssueService.delete(issueId)
      addToast({ type: 'success', title: 'Goods issue deleted successfully' })
      router.push('/inventory/goods-issue')
    } catch (err) {
      console.error('Error deleting goods issue:', err)
      addToast({ type: 'error', title: 'Failed to delete goods issue' })
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!mounted || !dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateStr?: string) => {
    if (!mounted || !dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Goods Issue Details"
          breadcrumbs={[
            { label: 'Inventory', href: '/inventory' },
            { label: 'Goods Issue', href: '/inventory/goods-issue' },
            { label: 'Details' },
          ]}
        />
        <div className="flex-1 p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </TwoLevelLayout>
    )
  }

  if (error || !issue) {
    return (
      <TwoLevelLayout>
        <Header
          title="Goods Issue Details"
          breadcrumbs={[
            { label: 'Inventory', href: '/inventory' },
            { label: 'Goods Issue', href: '/inventory/goods-issue' },
            { label: 'Details' },
          ]}
        />
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <HugeiconsIcon icon={AlertCircleIcon} className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {error || 'Goods Issue Not Found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                The goods issue you are looking for could not be found or loaded.
              </p>
              <Button onClick={handleBack} variant="outline">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-2" />
                Back to Goods Issue
              </Button>
            </CardContent>
          </Card>
        </div>
      </TwoLevelLayout>
    )
  }

  const statusBadge = statusConfig[issue.status] || statusConfig.Draft
  const isDraft = issue.status === 'Draft'

  return (
    <TwoLevelLayout>
      <Header
        title={issue.issueNumber}
        breadcrumbs={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Goods Issue', href: '/inventory/goods-issue' },
          { label: issue.issueNumber },
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
          Back to Goods Issue
        </button>

        {/* Page title + actions */}
        <div className="flex items-start justify-between -mt-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{issue.issueNumber}</h1>
              <Badge className={`${statusBadge.color} border-0`}>{statusBadge.label}</Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Goods issue details and item tracking</p>
          </div>
          <div className="inline-flex items-center rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 w-28 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
            >
              <HugeiconsIcon icon={PrinterIcon} className="w-4 h-4" />
              Print
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
            <button
              className="inline-flex items-center justify-center gap-2 w-28 py-1.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
            >
              <HugeiconsIcon icon={Download01Icon} className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Info + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Issue Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Issue Information</CardTitle>
              <CardDescription>Warehouse, date, and issue details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Issue Number</label>
                  <p className="mt-1 font-mono text-sm font-semibold">{issue.issueNumber}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Issue Date</label>
                  <p className="mt-1 text-sm">{formatDate(issue.issueDate)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Warehouse</label>
                  <p className="mt-1 text-sm font-medium">{issue.warehouseName}</p>
                  <p className="text-xs text-muted-foreground">{issue.warehouseCode}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</label>
                  <p className="mt-1 text-sm">{formatDateTime(issue.createdAt)}</p>
                </div>
                {issue.notes && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</label>
                    <p className="mt-1 text-sm p-3 bg-muted rounded-md border text-muted-foreground">
                      {issue.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            {isDraft && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/inventory/goods-issue/${issue.id}/edit`} className="block">
                    <Button variant="outline" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Button variant="destructive" className="w-full" onClick={handleDelete}>
                    Delete
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
                <CardDescription>Items and quantity overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                  <span className="text-sm font-medium text-muted-foreground">Total Items</span>
                  <span className="text-xl font-bold">{issue.totalItems}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                  <span className="text-sm font-medium text-muted-foreground">Total Quantity</span>
                  <span className="text-xl font-bold">{issue.totalQuantity}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                  <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatDateTime(issue.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Issue Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Issue Items ({issue.items?.length || 0})</CardTitle>
            <CardDescription>Articles being issued from warehouse</CardDescription>
          </CardHeader>
          <CardContent>
            {issue.items && issue.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-[15px] font-semibold text-muted-foreground">Article Code</th>
                      <th className="text-left py-3 px-4 text-[15px] font-semibold text-muted-foreground">Article Name</th>
                      <th className="text-right py-3 px-4 text-[15px] font-semibold text-muted-foreground">Quantity</th>
                      <th className="text-left py-3 px-4 text-[15px] font-semibold text-muted-foreground">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issue.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4 font-mono text-[13px]">{item.articleCode || '-'}</td>
                        <td className="py-3 px-4">{item.articleName || '-'}</td>
                        <td className="py-3 px-4 text-right font-semibold">{item.quantity}</td>
                        <td className="py-3 px-4 text-muted-foreground">{item.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                      <td colSpan={2} className="py-3 px-4 font-semibold">Total</td>
                      <td className="py-3 px-4 text-right font-bold">
                        {issue.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No items found for this goods issue.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TwoLevelLayout>
  )
}
