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
  Layers,
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
import { modelService } from '@/services/masterdata'
import { Model } from '@/types/masterdata'
import { ModelForm } from '@/components/forms/model-form'

// Extended Model interface for frontend display
interface ProductModel extends Model {
  article_id?: string
  product_count?: number
  total_stock?: number
  min_price?: number
  max_price?: number
  created_by?: string
  updated_by?: string
}

export default function ProductModelsPage() {
  const [mounted, setMounted] = useState(false)
  const [models, setModels] = useState<ProductModel[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortByFilter, setSortByFilter] = useState<string>('name')
  const [showModelForm, setShowModelForm] = useState(false)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch models from API
  const fetchModels = async () => {
    try {
      setLoading(true)
      const response = await modelService.getAll()
      console.log('Models response:', response)
      setModels(response.data)
    } catch (error) {
      console.error('Error fetching models:', error)
      setModels([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  const handleCreateModel = () => {
    setSelectedModel(null)
    setShowModelForm(true)
  }

  const handleEditModel = (model: Model) => {
    setSelectedModel(model)
    setShowModelForm(true)
  }

  const handleModelFormSuccess = () => {
    fetchModels() // Refresh the list
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

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
    { label: 'Models', href: '/products/models' }
  ]

  // Filter models
  const filteredModels = models.filter(model => {
    if (searchTerm && !model?.name?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !model?.code?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !model?.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && model?.status !== 'active') return false
      if (statusFilter === 'inactive' && model?.status !== 'active') return false
    }
    return true
  })

  // Sort models
  const sortedModels = [...filteredModels].sort((a, b) => {
    switch (sortByFilter) {
      case 'name':
        return (a?.name || '').localeCompare(b?.name || '')
      case 'code':
        return (a?.code || '').localeCompare(b?.code || '')
      case 'products':
        return (b?.product_count || 0) - (a?.product_count || 0)
      case 'stock':
        return (b?.total_stock || 0) - (a?.total_stock || 0)
      default:
        return 0
    }
  })

  // Summary statistics
  const summaryStats = {
    totalModels: models.length,
    activeModels: models.filter(m => m?.status === 'active').length,
    totalProducts: models.reduce((sum, m) => sum + (m?.product_count || 0), 0),
    totalStock: models.reduce((sum, m) => sum + (m?.total_stock || 0), 0),
  }

  const getStatusBadge = (status: string) => {
    return status === 'active'
      ? { variant: 'default' as const, label: 'Active', icon: CheckCircle }
      : { variant: 'destructive' as const, label: 'Inactive', icon: AlertCircle }
  }

  const columns: Column<ProductModel>[] = [
    {
      key: 'code',
      title: 'Code',
      render: (value: unknown, model: ProductModel) => (
        <Link 
          href={`/products/models/${model?.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {model?.code}
        </Link>
      )
    },
    {
      key: 'name',
      title: 'Name',
      render: (value: unknown, model: ProductModel) => (
        <div>
          <div className="font-medium">{model?.name}</div>
          <div className="text-sm text-muted-foreground">{model?.description || '-'}</div>
        </div>
      )
    },
    {
      key: 'product_count',
      title: 'Products',
      render: (value: unknown, model: ProductModel) => (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{model?.product_count || 0}</span>
        </div>
      )
    },
    {
      key: 'total_stock',
      title: 'Stock',
      render: (value: unknown, model: ProductModel) => (
        <div className="text-right font-medium">
          {model?.total_stock || 0}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: unknown, model: ProductModel) => {
        const { variant, label, icon: Icon } = getStatusBadge(model?.status || 'inactive')
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
      render: (value: unknown, model: ProductModel) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatDate(model?.updated_at)}</span>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: unknown, model: ProductModel) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/products/models/${model?.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEditModel(model)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Product Models"
        description="Manage product models and variations"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={handleCreateModel}>
              <Plus className="h-4 w-4 mr-2" />
              Add Model
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
                <p className="text-sm font-medium text-muted-foreground">Total Models</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalModels}</p>
                <p className="text-sm text-blue-600 mt-1">All models</p>
              </div>
              <Layers className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{summaryStats.activeModels}</p>
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
                placeholder="Search models..."
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
                <SelectItem value="stock">Stock Level</SelectItem>
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
            {sortedModels.length} of {models.length} models
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading models...</p>
            </div>
          </div>
        ) : activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedModels.map((model) => {
              const { variant: statusVariant, label: statusLabel, icon: StatusIcon } = getStatusBadge(model?.status || 'inactive')
              
              return (
                <Card key={model?.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link 
                        href={`/products/models/${model?.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {model?.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1 font-mono">
                        {model?.code}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-1">
                        <StatusIcon className="h-4 w-4" />
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {model?.description || '-'}
                    </p>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Products:</span>
                      <span className="text-sm font-medium">{model?.product_count || 0} items</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Stock:</span>
                      <span className="text-sm font-medium">{model?.total_stock || 0} units</span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Updated:</span>
                        <span className="text-sm">{formatDate(model?.updated_at)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">By:</span>
                        <span className="text-sm font-medium">{model?.updated_by || '-'}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <DataTable
            data={sortedModels}
            columns={columns}
            loading={loading}
            pagination={{
              current: 1,
              pageSize: 10,
              total: sortedModels.length,
              onChange: () => {}
            }}
          />
        )}

        {/* Inactive Models Alert */}
        {models.filter(m => m.status !== 'active').length > 0 && (
          <Card className="p-6 border-orange-200 bg-orange-50">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-orange-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800">Inactive Models</h3>
                <p className="text-orange-700 mt-1">
                  {models.filter(m => m.status !== 'active').length} models are currently inactive and may need review.
                </p>
              </div>
              <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                Review Inactive
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Model Form Modal */}
      <ModelForm
        open={showModelForm}
        onOpenChange={setShowModelForm}
        model={selectedModel}
        onSuccess={handleModelFormSuccess}
      />
    </TwoLevelLayout>
  )
}