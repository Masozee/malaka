'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

import Link from 'next/link'
import { Size } from '@/types/masterdata'
import { SizeForm } from '@/components/forms/size-form'
import { useSizes } from '@/hooks/queries'

// Extended Size interface for frontend display
interface ProductSize extends Size {
  size_category?: string
  size_type?: string
  size_value?: string
  display_order?: number
  equivalent_us?: string
  equivalent_uk?: string
  equivalent_eu?: string
  measurement_cm?: number
  is_standard?: boolean
  product_count?: number
  total_stock?: number
  created_by?: string
  updated_by?: string
}

export default function ProductSizesPage() {
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortByFilter, setSortByFilter] = useState<string>('name')
  const [showSizeForm, setShowSizeForm] = useState(false)
  const [selectedSize, setSelectedSize] = useState<Size | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Use TanStack Query for data fetching
  const { data, isLoading, isFetching } = useSizes({
    page,
    limit: pageSize,
    search: searchTerm || undefined,
  })

  const sizes: ProductSize[] = data?.data || []

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCreateSize = () => {
    setSelectedSize(null)
    setShowSizeForm(true)
  }

  const handleEditSize = (size: Size) => {
    setSelectedSize(size)
    setShowSizeForm(true)
  }

  const handleSizeFormSuccess = () => {
    // TanStack Query will auto-refetch when cache is invalidated
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const breadcrumbs = [
    { label: 'Products', href: '/products' },
    { label: 'Sizes', href: '/products/sizes' }
  ]

  // Filter and sort sizes
  const filteredSizes = useMemo(() => {
    let result = [...sizes]

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(size => {
        if (statusFilter === 'active') return size?.status === 'active'
        if (statusFilter === 'inactive') return size?.status !== 'active'
        return true
      })
    }

    // Sort sizes
    result.sort((a, b) => {
      switch (sortByFilter) {
        case 'name':
          return (a?.name || '').localeCompare(b?.name || '')
        case 'code':
          return (a?.code || '').localeCompare(b?.code || '')
        case 'products':
          return (b?.product_count || 0) - (a?.product_count || 0)
        case 'order':
          return (a?.sort_order || 0) - (b?.sort_order || 0)
        default:
          return 0
      }
    })

    return result
  }, [sizes, statusFilter, sortByFilter])

  // Summary statistics
  const summaryStats = useMemo(() => ({
    totalSizes: sizes.length,
    activeSizes: sizes.filter(s => s?.status === 'active').length,
    totalProducts: sizes.reduce((sum, s) => sum + (s?.product_count || 0), 0),
    totalStock: sizes.reduce((sum, s) => sum + (s?.total_stock || 0), 0),
  }), [sizes])

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? { variant: 'default' as const, label: 'Active' }
      : { variant: 'destructive' as const, label: 'Inactive' }
  }

  const getSizeCategoryBadge = (category?: string) => {
    const config = {
      shoe: { variant: 'default' as const, label: 'Shoes' },
      clothing: { variant: 'secondary' as const, label: 'Clothing' },
      accessory: { variant: 'outline' as const, label: 'Accessories' },
    }
    return config[category as keyof typeof config] || { variant: 'secondary' as const, label: category || 'General' }
  }

  const columns: TanStackColumn<ProductSize>[] = [
    {
      id: 'code',
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <Link
          href={`/products/sizes/${row.original?.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {row.original?.code}
        </Link>
      )
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original?.name}</div>
          <div className="text-sm text-muted-foreground">{row.original?.description || '-'}</div>
        </div>
      )
    },
    {
      id: 'size_category',
      accessorKey: 'size_category',
      header: 'Category',
      cell: ({ row }) => {
        const { variant, label } = getSizeCategoryBadge(row.original?.size_category)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      id: 'product_count',
      accessorKey: 'product_count',
      header: 'Products',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{row.original?.product_count || 0}</span>
        </div>
      )
    },
    {
      id: 'sort_order',
      accessorKey: 'sort_order',
      header: 'Order',
      cell: ({ row }) => (
        <div className="text-center font-mono text-sm">
          {row.original?.sort_order || '-'}
        </div>
      )
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { variant, label } = getStatusBadge(row.original?.status || 'inactive')
        return (
          <div className="flex items-center space-x-2">
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      id: 'updated_at',
      accessorKey: 'updated_at',
      header: 'Last Updated',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <span className="text-sm">{formatDate(row.original?.updated_at)}</span>
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/products/sizes/${row.original?.id}`}>
              View
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEditSize(row.original)}>
            Edit
          </Button>
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="Product Sizes"
        description="Manage product sizes and measurements"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            {isFetching && !isLoading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            )}
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm" onClick={handleCreateSize}>
              Add Size
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <div className="h-5 w-5 bg-foreground/20 rounded" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sizes</p>
                <p className="text-2xl font-bold">{summaryStats.totalSizes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <div className="h-5 w-5 bg-foreground/20 rounded" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{summaryStats.activeSizes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <div className="h-5 w-5 bg-foreground/20 rounded" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Products</p>
                <p className="text-2xl font-bold">{summaryStats.totalProducts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <div className="h-5 w-5 bg-foreground/20 rounded" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock</p>
                <p className="text-2xl font-bold">{summaryStats.totalStock}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and View Toggle */}
        <div className="space-y-4">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Search sizes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortByFilter} onValueChange={setSortByFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="products">Product Count</SelectItem>
                  <SelectItem value="order">Display Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Showing {filteredSizes.length} items</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading sizes...</p>
            </div>
          </div>
        ) : activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSizes.map((size) => {
              const { variant: statusVariant, label: statusLabel } = getStatusBadge(size?.status || 'inactive')
              const { variant: categoryVariant, label: categoryLabel } = getSizeCategoryBadge(size?.size_category)

              return (
                <Card key={size?.id} className="p-4 hover: transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link
                        href={`/products/sizes/${size?.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {size?.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1 font-mono">
                        {size?.code}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-1">
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </div>
                      <Badge variant={categoryVariant}>{categoryLabel}</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {size?.description || '-'}
                    </p>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Products:</span>
                      <span className="text-sm font-medium">{size?.product_count || 0} items</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Order:</span>
                      <span className="text-sm font-medium">{size?.sort_order || '-'}</span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Updated:</span>
                        <span className="text-sm">{formatDate(size?.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <TanStackDataTable
            data={filteredSizes}
            columns={columns}
            loading={isLoading}
            serverSidePagination={{
              pageIndex: page - 1,
              pageSize,
              pageCount: Math.ceil((data?.total || 0) / pageSize),
              onPaginationChange: (pageIndex, newPageSize) => {
                setPage(pageIndex + 1)
                setPageSize(newPageSize)
              }
            }}
          />
        )}

        {/* Inactive Sizes Alert */}
        {sizes.filter(s => s?.status !== 'active').length > 0 && (
          <Card className="p-6 border-orange-200 bg-orange-50">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 rounded-full bg-orange-600/20" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800">Inactive Sizes</h3>
                <p className="text-orange-700 mt-1">
                  {sizes.filter(s => s?.status !== 'active').length} sizes are currently inactive and may need review.
                </p>
              </div>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                Review Inactive
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Size Form Modal */}
      <SizeForm
        open={showSizeForm}
        onOpenChange={setShowSizeForm}
        size={selectedSize}
        onSuccess={handleSizeFormSuccess}
      />
    </TwoLevelLayout>
  )
}
