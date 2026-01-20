'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from '@/components/ui/sheet'
import {
  Tag,
  Plus,
  Eye,
  Edit,
  Download,
  Package,
  CheckCircle,
  AlertCircle,
  Search,
  TrendingUp,
  MoreHorizontal,
  Trash2,
  CheckSquare,
  Archive,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { Classification } from '@/types/masterdata'
import { useClassifications } from '@/hooks/queries'

// Extended Classification interface for frontend display
interface ProductClassification extends Omit<Classification, 'code' | 'parent_id'> {
  code: string
  product_count?: number
  total_value?: number
  profit_margin?: number
  created_by?: string
  updated_by?: string
  parent_id?: string | null
}

// Mock data for comprehensive display (used as fallback)
const mockClassifications: ProductClassification[] = [
  {
    id: '1',
    code: 'FOOTWEAR',
    name: 'Footwear',
    description: 'All types of shoes and footwear products',
    parent_id: null,
    status: 'active',
    product_count: 245,
    total_value: 4500000000,
    profit_margin: 35.2,
    created_by: 'Admin',
    updated_by: 'Manager',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-07-20T14:30:00Z'
  },
  {
    id: '2',
    code: 'CASUAL',
    name: 'Casual Shoes',
    description: 'Everyday casual footwear for comfort and style',
    parent_id: '1',
    status: 'active',
    product_count: 89,
    total_value: 1800000000,
    profit_margin: 42.1,
    created_by: 'Admin',
    updated_by: 'Product Manager',
    created_at: '2024-01-20T09:15:00Z',
    updated_at: '2024-07-18T11:45:00Z'
  },
  {
    id: '3',
    code: 'FORMAL',
    name: 'Formal Shoes',
    description: 'Professional and formal occasion footwear',
    parent_id: '1',
    status: 'active',
    product_count: 67,
    total_value: 2100000000,
    profit_margin: 38.5,
    created_by: 'Admin',
    updated_by: 'Category Manager',
    created_at: '2024-01-22T10:30:00Z',
    updated_at: '2024-07-19T16:20:00Z'
  }
]

export default function ProductClassificationsPage() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingClassification, setEditingClassification] = useState<ProductClassification | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'active'
  })
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Use TanStack Query for data fetching
  const { data, isLoading, isFetching } = useClassifications({
    page,
    limit: pageSize,
    search: searchTerm || undefined,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Enhance backend data with mock fields for better display
  const enhanceClassificationData = (backendData: Classification[]): ProductClassification[] => {
    return backendData.map((item) => {
      const getCodeFromName = (name: string) => {
        return name.toUpperCase().replace(/\s+/g, '').substring(0, 8)
      }

      const getMockStats = (name: string) => {
        const nameHash = name.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0)
          return a & a
        }, 0)

        const seed = Math.abs(nameHash) % 1000
        const productCount = 20 + (seed % 200)
        const baseValue = 500000000 + (seed * 3000000)
        const margin = 25 + (seed % 40)

        return { productCount, baseValue, margin }
      }

      const { productCount, baseValue, margin } = getMockStats(item.name)

      return {
        ...item,
        code: getCodeFromName(item.name),
        description: `${item.name} category for footwear products`,
        status: 'active' as const,
        parent_id: null,
        product_count: productCount,
        total_value: baseValue,
        profit_margin: margin,
        created_by: 'System',
        updated_by: 'Manager'
      }
    })
  }

  // Process classifications data
  const classifications: ProductClassification[] = useMemo(() => {
    if (data?.data && data.data.length > 0) {
      return enhanceClassificationData(data.data)
    }
    return mockClassifications
  }, [data])

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const breadcrumbs = [
    { label: 'Products', href: '/products' },
    { label: 'Classifications', href: '/products/classifications' }
  ]

  // Filter and sort classifications
  const sortedClassifications = useMemo(() => {
    let result = [...classifications]

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(classification => {
        if (statusFilter === 'active') return classification.status === 'active'
        if (statusFilter === 'inactive') return classification.status !== 'active'
        return true
      })
    }

    // Sort classifications
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'code':
          return a.code.localeCompare(b.code)
        case 'products':
          return (b.product_count || 0) - (a.product_count || 0)
        case 'value':
          return (b.total_value || 0) - (a.total_value || 0)
        case 'margin':
          return (b.profit_margin || 0) - (a.profit_margin || 0)
        default:
          return 0
      }
    })

    return result
  }, [classifications, statusFilter, sortBy])

  // Summary statistics
  const summaryStats = useMemo(() => ({
    totalClassifications: classifications.length,
    activeClassifications: classifications.filter(c => c.status === 'active').length,
    totalProducts: classifications.reduce((sum, c) => sum + (c.product_count || 0), 0),
    totalValue: classifications.reduce((sum, c) => sum + (c.total_value || 0), 0),
    averageMargin: classifications.length > 0 ?
      classifications.reduce((sum, c) => sum + (c.profit_margin || 0), 0) / classifications.length : 0,
  }), [classifications])

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? { variant: 'default' as const, label: 'Active', icon: CheckCircle }
      : { variant: 'destructive' as const, label: 'Inactive', icon: AlertCircle }
  }

  const handleEdit = (classification: ProductClassification) => {
    setEditingClassification(classification)
    setFormData({
      name: classification.name,
      code: classification.code,
      description: classification.description || '',
      status: classification.status
    })
    setEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingClassification) return

    try {
      console.log('Saving classification:', formData)
      setEditModalOpen(false)
      setEditingClassification(null)
    } catch (error) {
      console.error('Error saving classification:', error)
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Bulk selection functions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(sortedClassifications.map(c => c.id))
      setSelectedItems(allIds)
      setShowBulkActions(true)
    } else {
      setSelectedItems(new Set())
      setShowBulkActions(false)
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedItems)
    if (checked) {
      newSelection.add(id)
    } else {
      newSelection.delete(id)
    }
    setSelectedItems(newSelection)
    setShowBulkActions(newSelection.size > 0)
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return
    console.log('Bulk deleting:', Array.from(selectedItems))
    setSelectedItems(new Set())
    setShowBulkActions(false)
  }

  const handleBulkStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (selectedItems.size === 0) return
    console.log('Bulk status change:', Array.from(selectedItems), newStatus)
    setSelectedItems(new Set())
    setShowBulkActions(false)
  }

  // Check if all items are selected
  const isAllSelected = sortedClassifications.length > 0 &&
    sortedClassifications.every(c => selectedItems.has(c.id))

  // Check if some items are selected
  const isSomeSelected = selectedItems.size > 0 && !isAllSelected

  const columns: TanStackColumn<ProductClassification>[] = [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={handleSelectAll}
          aria-label="Select all"
          className={isSomeSelected ? "data-[state=checked]:bg-muted-foreground" : ""}
        />
      ),
      enableSorting: false,
      cell: ({ row }) => (
        <Checkbox
          checked={selectedItems.has(row.original.id)}
          onCheckedChange={(checked) => handleSelectItem(row.original.id, checked as boolean)}
          aria-label={`Select ${row.original.name}`}
        />
      )
    },
    {
      id: 'code',
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <Link
          href={`/products/classifications/${row.original.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {row.original.code}
        </Link>
      )
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.description || '-'}</div>
        </div>
      )
    },
    {
      id: 'product_count',
      accessorKey: 'product_count',
      header: 'Products',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.product_count || 0}</span>
      )
    },
    {
      id: 'total_value',
      accessorKey: 'total_value',
      header: 'Total Value',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.original.total_value)}
        </div>
      )
    },
    {
      id: 'profit_margin',
      accessorKey: 'profit_margin',
      header: 'Margin',
      cell: ({ row }) => (
        <div className="text-right">
          <span className="font-medium text-green-600">
            {row.original.profit_margin ? `${row.original.profit_margin.toFixed(1)}%` : '-'}
          </span>
        </div>
      )
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { variant, label } = getStatusBadge(row.original.status)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      id: 'updated_at',
      accessorKey: 'updated_at',
      header: 'Last Updated',
      cell: ({ row }) => (
        <span className="text-sm">{formatDate(row.original.updated_at)}</span>
      )
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/products/classifications/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="Product Classifications"
        description="Organize and manage product categories and classifications"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            {isFetching && !isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" asChild>
              <Link href="/products/classifications/new">
                <Plus className="h-4 w-4 mr-2" />
                New Classification
              </Link>
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
                <Tag className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Classifications</p>
                <p className="text-2xl font-bold">{summaryStats.totalClassifications}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{summaryStats.activeClassifications}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{summaryStats.totalProducts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  {mounted ? `Rp ${(summaryStats.totalValue / 1000000000).toFixed(1)}B` : ''}
                </p>
              </div>
            </div>
          </Card>

        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar and Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search classifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
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

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="products">Product Count</SelectItem>
                  <SelectItem value="value">Total Value</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                >
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  Table
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {viewMode === 'cards' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                    className={isSomeSelected ? "data-[state=checked]:bg-muted-foreground" : ""}
                  />
                  <span className="text-sm text-muted-foreground">Select all</span>
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <span>Showing {sortedClassifications.length} items</span>
            </div>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {showBulkActions && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedItems(new Set())
                    setShowBulkActions(false)
                  }}
                >
                  Clear Selection
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Archive className="h-4 w-4 mr-2" />
                      Change Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkStatusChange('active')}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Set Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusChange('inactive')}>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Set Inactive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading classifications...</p>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedClassifications.map((classification) => (
              <Card key={classification.id} className={`p-4 ${selectedItems.has(classification.id) ? 'ring-2 ring-primary' : ''}`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedItems.has(classification.id)}
                        onCheckedChange={(checked) => handleSelectItem(classification.id, checked as boolean)}
                        aria-label={`Select ${classification.name}`}
                      />
                      <div>
                        <Link
                          href={`/products/classifications/${classification.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {classification.name}
                        </Link>
                        <p className="text-sm text-muted-foreground font-mono">{classification.code}</p>
                      </div>
                    </div>
                    <Badge variant={classification.status === 'active' ? 'default' : 'destructive'}>
                      {classification.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {classification.description || 'No description'}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Products:</span>
                      <span className="text-sm font-medium">{classification.product_count || 0}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Value:</span>
                      <span className="text-sm font-medium">
                        {mounted ? `Rp ${((classification.total_value || 0) / 1000000000).toFixed(1)}B` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/products/classifications/${classification.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(classification)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <TanStackDataTable
            data={sortedClassifications}
            columns={columns}
            loading={isLoading}
            serverSidePagination={{
              pageIndex: page - 1,
              pageSize,
              pageCount: Math.ceil((data?.total || sortedClassifications.length) / pageSize),
              onPaginationChange: (pageIndex, newPageSize) => {
                setPage(pageIndex + 1)
                setPageSize(newPageSize)
              }
            }}
          />
        )}

        {/* Inactive Classifications Alert */}
        {classifications.filter(c => c.status !== 'active').length > 0 && (
          <Card className="p-6 border-orange-200 bg-orange-50">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-orange-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800">Inactive Classifications</h3>
                <p className="text-orange-700 mt-1">
                  {classifications.filter(c => c.status !== 'active').length} classifications are currently inactive and may need review.
                </p>
              </div>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                Review Inactive
              </Button>
            </div>
          </Card>
        )}

        {/* Edit Modal */}
        <Sheet open={editModalOpen} onOpenChange={setEditModalOpen}>
          <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col">
            <SheetHeader className="px-6 py-6 border-b">
              <SheetTitle className="text-xl font-semibold">Edit Classification</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-1">
                Make changes to the classification details. Click save when you're done.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-8">
              <div className="space-y-8">
                {/* Form Fields */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      placeholder="Enter classification name"
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      A clear, descriptive name for this product classification
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="code" className="text-sm font-medium">Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleFormChange('code', e.target.value)}
                      placeholder="Enter classification code"
                      className="font-mono h-10"
                    />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      A unique code used for system identification. Use uppercase letters and numbers only.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Enter classification description"
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Provide a detailed description to help users understand this classification's purpose
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="status" className="text-sm font-medium">Status *</Label>
                    <Select value={formData.status} onValueChange={(value) => handleFormChange('status', value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Active classifications are available for product assignment. Inactive ones are hidden from selection.
                    </p>
                  </div>
                </div>

                {/* Help Section */}
                <div className="rounded-lg border bg-muted/30 p-5">
                  <h4 className="font-semibold text-sm mb-4 flex items-center text-foreground">
                    <Package className="h-4 w-4 mr-2.5" />
                    Classification Guidelines
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2.5 leading-relaxed">
                    <li className="flex items-start">
                      <span className="text-primary mr-2 mt-0.5">•</span>
                      Use clear, descriptive names that are easy to understand
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2 mt-0.5">•</span>
                      Codes should be short (2-8 characters) and memorable
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2 mt-0.5">•</span>
                      Avoid special characters in codes (letters and numbers only)
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2 mt-0.5">•</span>
                      Consider how this classification relates to your product catalog
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <SheetFooter className="px-6 py-6 border-t bg-muted/20">
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 h-10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="flex-1 h-10"
                >
                  Save Changes
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </TwoLevelLayout>
  )
}
