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
import { ArrowLeft01Icon, AlertCircleIcon } from '@hugeicons/core-free-icons'
import { StockAdjustment, stockAdjustmentService } from '@/services/inventory'

export default function StockAdjustmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [adjustment, setAdjustment] = useState<StockAdjustment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const adjustmentId = params.id as string

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (adjustmentId) {
      fetchDetail()
    }
  }, [adjustmentId])

  const fetchDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await stockAdjustmentService.getById(adjustmentId)
      setAdjustment(data)
    } catch (err) {
      console.error('Error fetching stock adjustment detail:', err)
      setError('Failed to load stock adjustment details')
      setAdjustment(null)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/inventory/adjustments')
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this stock adjustment?')) return
    try {
      await stockAdjustmentService.delete(adjustmentId)
      addToast({ type: 'success', title: 'Stock adjustment deleted successfully' })
      router.push('/inventory/adjustments')
    } catch (err) {
      console.error('Error deleting stock adjustment:', err)
      addToast({ type: 'error', title: 'Failed to delete stock adjustment' })
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
          title="Adjustment Details"
          breadcrumbs={[
            { label: 'Inventory', href: '/inventory' },
            { label: 'Adjustments', href: '/inventory/adjustments' },
            { label: 'Details' },
          ]}
        />
        <div className="flex-1 p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </TwoLevelLayout>
    )
  }

  if (error || !adjustment) {
    return (
      <TwoLevelLayout>
        <Header
          title="Adjustment Details"
          breadcrumbs={[
            { label: 'Inventory', href: '/inventory' },
            { label: 'Adjustments', href: '/inventory/adjustments' },
            { label: 'Details' },
          ]}
        />
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <HugeiconsIcon icon={AlertCircleIcon} className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {error || 'Stock Adjustment Not Found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                The stock adjustment you are looking for could not be found or loaded.
              </p>
              <Button onClick={handleBack} variant="outline">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-2" />
                Back to Adjustments
              </Button>
            </CardContent>
          </Card>
        </div>
      </TwoLevelLayout>
    )
  }

  const qty = adjustment.quantity
  const qtyColor = qty > 0 ? 'text-green-600' : qty < 0 ? 'text-red-600' : 'text-gray-600'
  const qtyBadgeColor = qty > 0
    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
    : qty < 0
      ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'

  return (
    <TwoLevelLayout>
      <Header
        title={adjustment.adjustmentNumber}
        breadcrumbs={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Adjustments', href: '/inventory/adjustments' },
          { label: adjustment.adjustmentNumber },
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
          Back to Adjustments
        </button>

        {/* Page title + badge */}
        <div className="-mt-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{adjustment.adjustmentNumber}</h1>
            <Badge className={`${qtyBadgeColor} border-0`}>
              {qty > 0 ? 'Addition' : qty < 0 ? 'Deduction' : 'No Change'}
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Stock adjustment details and information</p>
        </div>

        {/* Info + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Adjustment Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Adjustment Information</CardTitle>
              <CardDescription>Article, warehouse, and quantity details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Adjustment Number</label>
                  <p className="mt-1 font-mono text-sm font-semibold">{adjustment.adjustmentNumber}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Adjustment Date</label>
                  <p className="mt-1 text-sm">{formatDate(adjustment.adjustmentDate)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Article</label>
                  <p className="mt-1 text-sm font-medium">{adjustment.articleName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{adjustment.articleCode}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Warehouse</label>
                  <p className="mt-1 text-sm font-medium">{adjustment.warehouseName}</p>
                  <p className="text-xs text-muted-foreground">{adjustment.warehouseCode}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantity</label>
                  <p className={`mt-1 text-2xl font-bold ${qtyColor}`}>
                    {qty > 0 ? '+' : ''}{qty}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</label>
                  <p className="mt-1 text-sm">{formatDateTime(adjustment.createdAt)}</p>
                </div>
                {adjustment.reason && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reason</label>
                    <p className="mt-1 text-sm p-3 bg-muted rounded-md border text-muted-foreground">
                      {adjustment.reason}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/inventory/adjustments/${adjustment.id}/edit`} className="block">
                  <Button variant="outline" className="w-full">
                    Edit
                  </Button>
                </Link>
                <Button variant="destructive" className="w-full" onClick={handleDelete}>
                  Delete
                </Button>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
                <CardDescription>Adjustment overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                  <span className="text-sm font-medium text-muted-foreground">Quantity</span>
                  <span className={`text-xl font-bold ${qtyColor}`}>
                    {qty > 0 ? '+' : ''}{qty}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                  <span className="text-sm font-medium text-muted-foreground">Type</span>
                  <span className="text-sm font-semibold">
                    {qty > 0 ? 'Addition' : qty < 0 ? 'Deduction' : 'No Change'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                  <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatDateTime(adjustment.updatedAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
