'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { DataTable, Column } from '@/components/ui/data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  Ruler,
  Plus,
  Eye,
  Edit,
  Download,
  Calendar,
  Package,
  CheckCircle,
  AlertCircle,
  Search,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { sizeService } from '@/services/masterdata'
import { Size } from '@/types/masterdata'
import { SizeForm } from '@/components/forms/size-form'

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
  const [sizes, setSizes] = useState<ProductSize[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortByFilter, setSortByFilter] = useState<string>('name')
  const [showSizeForm, setShowSizeForm] = useState(false)
  const [selectedSize, setSelectedSize] = useState<Size | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch sizes from API
  const fetchSizes = async () => {
    try {
      setLoading(true)
      const response = await sizeService.getAll()
      console.log('Sizes response:', response)
      setSizes(response.data)
    } catch (error) {
      console.error('Error fetching sizes:', error)
      setSizes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSizes()
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
    fetchSizes() // Refresh the list
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const breadcrumbs = [
    { label: 'Products', href: '/products' },
    { label: 'Sizes', href: '/products/sizes' }
  ]

  // Filter sizes
  const filteredSizes = sizes.filter(size => {
    if (searchTerm && !size?.name?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !size?.code?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !size?.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && size?.status !== 'active') return false
      if (statusFilter === 'inactive' && size?.status !== 'active') return false
    }
    return true
  })

  // Sort sizes
  const sortedSizes = [...filteredSizes].sort((a, b) => {
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

  // Summary statistics
  const summaryStats = {
    totalSizes: sizes.length,
    activeSizes: sizes.filter(s => s?.status === 'active').length,
    totalProducts: sizes.reduce((sum, s) => sum + (s?.product_count || 0), 0),
    totalStock: sizes.reduce((sum, s) => sum + (s?.total_stock || 0), 0),
  }

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? { variant: 'default' as const, label: 'Active', icon: CheckCircle }
      : { variant: 'destructive' as const, label: 'Inactive', icon: AlertCircle }
  }

  const getSizeCategoryBadge = (category?: string) => {
    const config = {
      shoe: { variant: 'default' as const, label: 'Shoes' },
      clothing: { variant: 'secondary' as const, label: 'Clothing' },
      accessory: { variant: 'outline' as const, label: 'Accessories' },
    }
    return config[category as keyof typeof config] || { variant: 'secondary' as const, label: category || 'General' }
  }

  const columns: Column<ProductSize>[] = [
    {
      key: 'code',
      title: 'Code',
      render: (value: unknown, size: ProductSize) => (
        <Link 
          href={`/products/sizes/${size?.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {size?.code}
        </Link>
      )
    },
    {
      key: 'name',
      title: 'Name',
      render: (value: unknown, size: ProductSize) => (
        <div>
          <div className="font-medium">{size?.name}</div>
          <div className="text-sm text-muted-foreground">{size?.description || '-'}</div>
        </div>
      )
    },
    {
      key: 'size_category',
      title: 'Category',
      render: (value: unknown, size: ProductSize) => {
        const { variant, label } = getSizeCategoryBadge(size?.size_category)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'product_count',
      title: 'Products',
      render: (value: unknown, size: ProductSize) => (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{size?.product_count || 0}</span>
        </div>
      )
    },
    {
      key: 'sort_order',
      title: 'Order',
      render: (value: unknown, size: ProductSize) => (
        <div className="text-center font-mono text-sm">
          {size?.sort_order || '-'}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: unknown, size: ProductSize) => {
        const { variant, label, icon: Icon } = getStatusBadge(size?.status || 'inactive')
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge variant={variant}>{label}</Badge>
          </div>
        )
      }
    },
    {
      key: 'updated_at',
      title: 'Last Updated',
      render: (value: unknown, size: ProductSize) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatDate(size?.updated_at)}</span>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: unknown, size: ProductSize) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/products/sizes/${size?.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEditSize(size)}>
            <Edit className="h-4 w-4" />
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={handleCreateSize}>
              <Plus className="h-4 w-4 mr-2" />
              Add Size
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
                <p className="text-sm font-medium text-muted-foreground">Total Sizes</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalSizes}</p>
                <p className="text-sm text-blue-600 mt-1">All sizes</p>
              </div>
              <Ruler className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{summaryStats.activeSizes}</p>
                <p className="text-sm text-green-600 mt-1">In use</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Products</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalProducts}</p>
                <p className="text-sm text-purple-600 mt-1">Total items</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalStock}</p>
                <p className="text-sm text-green-600 mt-1">Units available</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4">
          {/* Search on the left */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sizes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          {/* Filters on the right */}
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <CheckCircle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortByFilter} onValueChange={setSortByFilter}>
              <SelectTrigger className="w-44">
                <BarChart3 className="h-4 w-4 mr-2" />
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

        {/* View Toggle and Stats */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
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
          </div>
          
          <div className="text-sm text-muted-foreground">
            {sortedSizes.length} of {sizes.length} sizes
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading sizes...</p>
            </div>
          </div>
        ) : activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSizes.map((size) => {
              const { variant: statusVariant, label: statusLabel, icon: StatusIcon } = getStatusBadge(size?.status || 'inactive')
              const { variant: categoryVariant, label: categoryLabel } = getSizeCategoryBadge(size?.size_category)
              
              return (
                <Card key={size?.id} className="p-4 hover:shadow-md transition-shadow">
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
                        <StatusIcon className="h-4 w-4" />
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
          <DataTable
            data={sortedSizes}
            columns={columns}
            loading={loading}
            pagination={{
              current: 1,
              pageSize: 10,
              total: sortedSizes.length,
              onChange: () => {}
            }}
          />
        )}

        {/* Inactive Sizes Alert */}
        {sizes.filter(s => s?.status !== 'active').length > 0 && (
          <Card className="p-6 border-orange-200 bg-orange-50">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-orange-600" />
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