'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  PackageIcon,
  Store01Icon,
  AlertCircleIcon,
  Calendar01Icon,
  BarCode01Icon,
  Location01Icon,
  InformationCircleIcon,
  PrinterIcon,
  Download01Icon,
} from '@hugeicons/core-free-icons'
import { stockService, StockItem } from '@/services/inventory'

const statusConfig: Record<string, { label: string; color: string }> = {
  in_stock: { label: 'In Stock', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  low_stock: { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
  overstock: { label: 'Overstock', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
}

export default function StockControlDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [item, setItem] = useState<StockItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const itemId = params.id as string

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (itemId) {
      fetchDetail()
    }
  }, [itemId])

  const fetchDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await stockService.getById(itemId)
      setItem(data)
    } catch (err) {
      console.error('Error fetching stock control detail:', err)
      setError('Failed to load stock item details')
      setItem(null)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/inventory/stock-control')
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
  }

  // Stock level percentage for visual indicator
  const getStockPercentage = () => {
    if (!item || !item.maxStock) return 0
    return Math.min(Math.round((item.currentStock / item.maxStock) * 100), 100)
  }

  const getStockBarColor = () => {
    if (!item) return 'bg-gray-300'
    if (item.status === 'out_of_stock') return 'bg-red-500'
    if (item.status === 'low_stock') return 'bg-yellow-500'
    if (item.status === 'overstock') return 'bg-blue-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <TwoLevelLayout>
        <Header
          title="Stock Item Details"
          description="Loading stock information..."
          breadcrumbs={[
            { label: "Inventory", href: "/inventory" },
            { label: "Stock Control", href: "/inventory/stock-control" },
            { label: "Details" }
          ]}
        />
        <div className="flex-1 p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </TwoLevelLayout>
    )
  }

  if (error || !item) {
    return (
      <TwoLevelLayout>
        <Header
          title="Stock Item Details"
          description="Error loading stock information"
          breadcrumbs={[
            { label: "Inventory", href: "/inventory" },
            { label: "Stock Control", href: "/inventory/stock-control" },
            { label: "Details" }
          ]}
        />
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <HugeiconsIcon icon={AlertCircleIcon} className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {error || 'Stock Item Not Found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                The stock item you are looking for could not be found or loaded.
              </p>
              <Button onClick={handleBack} variant="outline">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-2" />
                Back to Stock Control
              </Button>
            </CardContent>
          </Card>
        </div>
      </TwoLevelLayout>
    )
  }

  const statusBadge = statusConfig[item.status] || statusConfig.in_stock
  const stockPct = getStockPercentage()

  return (
    <TwoLevelLayout>
      <Header
        title={item.name}
        description={`Stock control details for ${item.code}`}
        breadcrumbs={[
          { label: "Inventory", href: "/inventory" },
          { label: "Stock Control", href: "/inventory/stock-control" },
          { label: item.code || "Details" }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <HugeiconsIcon icon={PrinterIcon} className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={Download01Icon} className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleBack}>
              <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Main Info + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Article Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HugeiconsIcon icon={PackageIcon} className="w-5 h-5 text-gray-500" />
                Article Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Article Code</label>
                  <p className="mt-1 font-mono text-sm font-semibold">{item.code}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                  <div className="mt-1">
                    <Badge className={`${statusBadge.color} border-0`}>{statusBadge.label}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Article Name</label>
                  <p className="mt-1 text-sm font-medium">{item.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
                  <p className="mt-1 text-sm">{item.category || '-'}</p>
                </div>
                {item.article_details?.barcode && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Barcode</label>
                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <HugeiconsIcon icon={BarCode01Icon} className="w-4 h-4 text-gray-400" />
                      <span className="font-mono">{item.article_details.barcode}</span>
                    </div>
                  </div>
                )}
                {item.article_details?.description && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
                    <p className="mt-1 text-sm text-muted-foreground">{item.article_details.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stock Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted rounded-lg border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Current Stock</span>
                  <span className="text-xl font-bold">{item.currentStock.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getStockBarColor()}`}
                    style={{ width: `${stockPct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>Min: {item.minStock}</span>
                  <span>{stockPct}%</span>
                  <span>Max: {item.maxStock}</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground">Unit Cost</span>
                <span className="text-lg font-bold">
                  {mounted ? formatCurrency(item.unitCost || 0) : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground">Total Value</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {mounted ? formatCurrency(item.totalValue || 0) : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {mounted && item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) : '-'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warehouse Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HugeiconsIcon icon={Store01Icon} className="w-5 h-5 text-gray-500" />
              Warehouse Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Warehouse</label>
                <p className="mt-1 text-sm font-medium">{item.warehouse}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Warehouse Code</label>
                <p className="mt-1 text-sm font-mono">{item.warehouse_code}</p>
              </div>
              {item.warehouse_details?.city && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">City</label>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <HugeiconsIcon icon={Location01Icon} className="w-4 h-4 text-gray-400" />
                    {item.warehouse_details.city}
                  </div>
                </div>
              )}
              {item.warehouse_details?.type && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</label>
                  <p className="mt-1 text-sm capitalize">{item.warehouse_details.type}</p>
                </div>
              )}
              {item.warehouse_details?.status && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Warehouse Status</label>
                  <div className="mt-1">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-0 capitalize">
                      {item.warehouse_details.status}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stock Level Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HugeiconsIcon icon={InformationCircleIcon} className="w-5 h-5 text-gray-500" />
              Stock Level Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Minimum Stock</p>
                <p className="text-2xl font-bold mt-1">{(item.minStock || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Reorder threshold</p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Stock</p>
                <p className="text-2xl font-bold mt-1">{item.currentStock.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Available units</p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Maximum Stock</p>
                <p className="text-2xl font-bold mt-1">{(item.maxStock || 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Storage capacity</p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reorder Needed</p>
                <p className="text-2xl font-bold mt-1">
                  {item.currentStock <= (item.minStock || 0)
                    ? <span className="text-red-600">Yes</span>
                    : <span className="text-green-600">No</span>
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.currentStock <= (item.minStock || 0)
                    ? `Need ${((item.maxStock || 0) - item.currentStock).toLocaleString()} more`
                    : `${(item.currentStock - (item.minStock || 0)).toLocaleString()} above minimum`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TwoLevelLayout>
  )
}
