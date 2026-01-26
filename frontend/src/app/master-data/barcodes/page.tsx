'use client'

import { HugeiconsIcon } from "@hugeicons/react"
import {
  BarCode01Icon,
  PlusSignIcon,
  ViewIcon,
  PencilEdit01Icon,
  FilterIcon,
  Download01Icon,
  Package01Icon,
  PrinterIcon,
  BarcodeScanIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  AlertCircleIcon,
  Search01Icon,
  HashtagIcon,
  TargetIcon,
  ChartIncreaseIcon,
  Copy01Icon
} from "@hugeicons/core-free-icons"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import Link from 'next/link'
import { barcodeService } from '@/services/masterdata'
import { Barcode as BarcodeType, MasterDataFilters } from '@/types/masterdata'

// Extended Barcode interface for frontend display
interface ProductBarcode extends BarcodeType {
  product_name?: string
  article_code?: string
  size?: string
  color?: string
  price?: number
  is_primary?: boolean
  is_active?: boolean
  print_count?: number
  scan_count?: number
  last_scanned?: string
  created_by?: string
  updated_by?: string
}

export default function ProductBarcodesPage() {
  const [mounted, setMounted] = useState(false)
  const [barcodes, setBarcodes] = useState<ProductBarcode[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [primaryFilter, setPrimaryFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch barcodes from API
  const fetchBarcodes = async () => {
    try {
      setLoading(true)
      const response = await barcodeService.getAll()
      console.log('Barcodes response:', response)
      setBarcodes(response.data)
    } catch (error) {
      console.error('Error fetching barcodes:', error)
      setBarcodes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBarcodes()
  }, [])

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const formatCurrency = (amount: number): string => {
    if (!mounted) return ''
    return amount.toLocaleString('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
  }

  const breadcrumbs = [
    { label: 'Master Data', href: '/master-data' },
    { label: 'Barcodes', href: '/master-data/barcodes' }
  ]

  // Filter barcodes
  const filteredBarcodes = barcodes.filter(barcode => {
    if (searchTerm && !barcode.code?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !barcode.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !barcode.article_code?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (typeFilter !== 'all' && barcode.type !== typeFilter) return false
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && barcode.status !== 'active') return false
      if (statusFilter === 'inactive' && barcode.status !== 'inactive') return false
    }
    if (primaryFilter !== 'all') {
      if (primaryFilter === 'primary' && !barcode.is_primary) return false
      if (primaryFilter === 'secondary' && barcode.is_primary) return false
    }
    return true
  })

  // Sort barcodes by scan count (most used first)
  const sortedBarcodes = [...filteredBarcodes].sort((a, b) => (b.scan_count || 0) - (a.scan_count || 0))

  // Summary statistics
  const summaryStats = {
    totalBarcodes: barcodes.length,
    activeBarcodes: barcodes.filter(b => b.status === 'active').length,
    primaryBarcodes: barcodes.filter(b => b.is_primary).length,
    totalPrints: barcodes.reduce((sum, b) => sum + (b.print_count || 0), 0),
    totalScans: barcodes.reduce((sum, b) => sum + (b.scan_count || 0), 0),
    averagePrice: barcodes.length > 0 ? barcodes.reduce((sum, b) => sum + (b.price || 0), 0) / barcodes.length : 0,
    topBarcode: barcodes.length > 0 ? barcodes.reduce((prev, curr) => 
      (prev.scan_count || 0) > (curr.scan_count || 0) ? prev : curr, barcodes[0]) : null
  }

  const getTypeBadge = (type: string) => {
    const config = {
      EAN13: { variant: 'default' as const, label: 'EAN13' },
      EAN8: { variant: 'secondary' as const, label: 'EAN8' },
      UPC: { variant: 'outline' as const, label: 'UPC' },
      CODE128: { variant: 'secondary' as const, label: 'CODE128' },
      CODE39: { variant: 'outline' as const, label: 'CODE39' },
      QR: { variant: 'default' as const, label: 'QR Code' }
    }
    return config[type as keyof typeof config] || { variant: 'secondary' as const, label: type }
  }

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? { variant: 'default' as const, label: 'Active', icon: CheckmarkCircle01Icon }
      : { variant: 'destructive' as const, label: 'Inactive', icon: AlertCircleIcon }
  }

  const getPrimaryBadge = (isPrimary: boolean) => {
    return isPrimary
      ? { variant: 'default' as const, label: 'Primary', icon: TargetIcon }
      : { variant: 'outline' as const, label: 'Secondary', icon: HashtagIcon }
  }

  const columns = [
    {
      key: 'code',
      title: 'Barcode',
      render: (barcode: ProductBarcode) => (
        <div className="flex items-center space-x-2">
          <HugeiconsIcon icon={BarCode01Icon} className="h-4 w-4 text-muted-foreground" />
          <Link
            href={`/master-data/barcodes/${barcode.id}`}
            className="font-mono text-blue-600 hover:text-blue-800"
          >
            {barcode.code}
          </Link>
          <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(barcode.code || '')}>
            <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      render: (barcode: ProductBarcode) => {
        const { variant, label } = getTypeBadge(barcode.type || '')
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'product_name',
      title: 'Product',
      render: (barcode: ProductBarcode) => (
        <div>
          <div className="font-medium">{barcode.product_name}</div>
          <div className="text-xs text-muted-foreground">{barcode.article_code}</div>
          <div className="text-xs text-muted-foreground">{barcode.size} - {barcode.color}</div>
        </div>
      )
    },
    {
      key: 'price',
      title: 'Price',
      render: (barcode: ProductBarcode) => (
        <span className="font-medium">{formatCurrency(barcode.price)}</span>
      )
    },
    {
      key: 'primary',
      title: 'Priority',
      render: (barcode: ProductBarcode) => {
        const { variant, label, icon: IconData } = getPrimaryBadge(barcode.is_primary)
        return (
          <div className="flex items-center space-x-2">
            <HugeiconsIcon icon={IconData} className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'print_count',
      title: 'Prints',
      render: (barcode: ProductBarcode) => (
        <div className="flex items-center space-x-2">
          <HugeiconsIcon icon={PrinterIcon} className="h-4 w-4 text-muted-foreground" />
          <span>{barcode.print_count}</span>
        </div>
      )
    },
    {
      key: 'scan_count',
      title: 'Scans',
      render: (barcode: ProductBarcode) => (
        <div className="flex items-center space-x-2">
          <HugeiconsIcon icon={BarcodeScanIcon} className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{barcode.scan_count}</span>
        </div>
      )
    },
    {
      key: 'last_scanned',
      title: 'Last Scanned',
      render: (barcode: ProductBarcode) => (
        <span className="text-xs">{formatDate(barcode.last_scanned)}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (barcode: ProductBarcode) => {
        const { variant, label, icon: IconData } = getStatusBadge(barcode.status || 'inactive')
        return (
          <div className="flex items-center space-x-2">
            <HugeiconsIcon icon={IconData} className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (barcode: ProductBarcode) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/master-data/barcodes/${barcode.id}`}>
              <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/master-data/barcodes/${barcode.id}/edit`}>
              <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm">
            <HugeiconsIcon icon={PrinterIcon} className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Product Barcodes"
        description="Manage product barcodes and tracking codes"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={PrinterIcon} className="h-4 w-4 mr-2" />
              Print Labels
            </Button>
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" asChild>
              <Link href="/master-data/barcodes/new">
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                New Barcode
              </Link>
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Barcodes</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalBarcodes}</p>
                <p className="text-sm text-blue-600 mt-1">All codes</p>
              </div>
              <HugeiconsIcon icon={BarCode01Icon} className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{summaryStats.activeBarcodes}</p>
                <p className="text-sm text-green-600 mt-1">In use</p>
              </div>
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Primary</p>
                <p className="text-2xl font-bold mt-1 text-orange-600">{summaryStats.primaryBarcodes}</p>
                <p className="text-sm text-orange-600 mt-1">Main codes</p>
              </div>
              <HugeiconsIcon icon={TargetIcon} className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `${(summaryStats.totalScans / 1000).toFixed(1)}K` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">Scanned times</p>
              </div>
              <HugeiconsIcon icon={BarcodeScanIcon} className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search barcodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <HugeiconsIcon icon={BarCode01Icon} className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="EAN13">EAN13</SelectItem>
                <SelectItem value="EAN8">EAN8</SelectItem>
                <SelectItem value="UPC">UPC</SelectItem>
                <SelectItem value="CODE128">CODE128</SelectItem>
                <SelectItem value="CODE39">CODE39</SelectItem>
                <SelectItem value="QR">QR Code</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={primaryFilter} onValueChange={setPrimaryFilter}>
              <SelectTrigger className="w-32">
                <HugeiconsIcon icon={TargetIcon} className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeView === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('cards')}
            >
              Cards
            </Button>
            <Button
              variant={activeView === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('table')}
            >
              Table
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {sortedBarcodes.length} of {barcodes.length} barcodes
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading barcodes...</p>
            </div>
          </div>
        ) : activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBarcodes.map((barcode) => {
              const { variant: typeVariant, label: typeLabel } = getTypeBadge(barcode.type || '')
              const { variant: statusVariant, label: statusLabel, icon: StatusIcon } = getStatusBadge(barcode.status || 'inactive')
              const { variant: primaryVariant, label: primaryLabel, icon: PrimaryIcon } = getPrimaryBadge(barcode.is_primary || false)
              
              return (
                <Card key={barcode.id} className="p-6 hover: transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <HugeiconsIcon icon={BarCode01Icon} className="h-5 w-5 text-blue-600" />
                      <div>
                        <Link
                          href={`/master-data/barcodes/${barcode.id}`}
                          className="font-mono text-blue-600 hover:text-blue-800 text-lg font-semibold"
                        >
                          {barcode.code}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {barcode.product_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-1">
                        <HugeiconsIcon icon={StatusIcon} className="h-4 w-4" />
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <Badge variant={typeVariant}>{typeLabel}</Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Priority:</span>
                      <Badge variant={primaryVariant}>{primaryLabel}</Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Article:</span>
                      <span className="text-sm font-mono">{barcode.article_code}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Variant:</span>
                      <span className="text-sm">{barcode.size} - {barcode.color}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Price:</span>
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(barcode.price)}
                      </span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Prints:</span>
                        <span className="text-sm font-medium">{barcode.print_count}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Scans:</span>
                        <span className="text-sm font-medium text-blue-600">{barcode.scan_count}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Last Scan:</span>
                        <span className="text-sm">{formatDate(barcode.last_scanned)}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/master-data/barcodes/${barcode.id}`}>
                          <HugeiconsIcon icon={ViewIcon} className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <HugeiconsIcon icon={PrinterIcon} className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(barcode.code || '')}>
                        <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <AdvancedDataTable
            data={sortedBarcodes}
            columns={columns}
            searchable={false}
            filterable={false}
            pagination={{
              pageSize: 15,
              currentPage: 1,
              totalPages: Math.ceil(sortedBarcodes.length / 15),
              totalItems: sortedBarcodes.length,
              onChange: () => {}
            }}
          />
        )}

        {/* Low Scan Count Alert */}
        {barcodes.filter(b => (b.scan_count || 0) < 50 && b.status === 'active').length > 0 && (
          <Card className="p-6 border-orange-200 bg-orange-50">
            <div className="flex items-center space-x-3">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-6 w-6 text-orange-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800">Low Usage Barcodes</h3>
                <p className="text-orange-700 mt-1">
                  {barcodes.filter(b => (b.scan_count || 0) < 50 && b.status === 'active').length} active barcodes have less than 50 scans and may need review.
                </p>
              </div>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                Review Barcodes
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}