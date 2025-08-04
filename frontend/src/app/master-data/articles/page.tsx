"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { DataTable, Column } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArticleForm } from "@/components/forms/article-form"
import { useToast, toast } from "@/components/ui/toast"
import { articleService, classificationService } from "@/services/masterdata"
import { Article, Classification, MasterDataFilters } from "@/types/masterdata"
import { Search, Grid3X3, List, Upload, X, Image as ImageIcon, BarChart3 } from "lucide-react"

export default function ArticlesPage() {
  const [articles, setArticles] = React.useState<Article[]>([])
  const [classifications, setClassifications] = React.useState<Classification[]>([])
  const [loading, setLoading] = React.useState(true)
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [formOpen, setFormOpen] = React.useState(false)
  const [selectedArticle, setSelectedArticle] = React.useState<Article | null>(null)
  const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('table')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortBy, setSortBy] = React.useState('name')
  const [mounted, setMounted] = React.useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false)
  const [selectedForUpload, setSelectedForUpload] = React.useState<Article | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const { addToast } = useToast()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const columns: Column<Article>[] = [
    {
      key: 'image_url',
      title: 'Image',
      width: '80px',
      render: (imageUrl: unknown, article: Article) => (
        <div className="flex items-center justify-center">
          {imageUrl && mounted ? (
            <img 
              src={articleService.getImageUrl(imageUrl as string)}
              alt={article.name}
              className="w-12 h-12 object-cover rounded border"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'barcode',
      title: 'Barcode',
      sortable: true,
      width: '120px',
      render: (barcode: unknown) => (barcode as string) || '-'
    },
    {
      key: 'name',
      title: 'Article Name',
      sortable: true,
    },
    {
      key: 'classification_id',
      title: 'Classification',
      render: (classificationId: unknown) => {
        const classification = classifications.find(c => c.id === classificationId)
        return classification?.name || '-'
      }
    },
    {
      key: 'price',
      title: 'Price',
      render: (price: unknown) => {
        const priceNum = price as number
        return new Intl.NumberFormat('id-ID', { 
          style: 'currency', 
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(priceNum)
      },
      width: '120px'
    },
    {
      key: 'description',
      title: 'Description',
      render: (description: unknown) => {
        const desc = description as string
        return desc ? (desc.length > 50 ? desc.substring(0, 50) + '...' : desc) : '-'
      }
    },
    {
      key: 'created_at',
      title: 'Created At',
      render: (date: unknown) => new Date(date as string).toLocaleDateString('id-ID'),
      width: '120px'
    }
  ]

  const fetchArticles = React.useCallback(async (filters?: MasterDataFilters) => {
    try {
      setLoading(true)
      console.log('🔍 Fetching articles with filters:', filters)
      const response = await articleService.getAll(filters)
      console.log('✅ Articles response:', response)
      setArticles(response.data)
      setPagination(prev => ({
        ...prev,
        total: response.total
      }))
    } catch (error) {
      console.error('❌ Error fetching articles:', error)
      // Show error in UI
      setArticles([])
      setPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchClassifications = React.useCallback(async () => {
    try {
      console.log('🔍 Fetching classifications...')
      const response = await classificationService.getAll()
      console.log('✅ Classifications response:', response)
      setClassifications(response.data)
    } catch (error) {
      console.error('❌ Error fetching classifications:', error)
      setClassifications([])
    }
  }, [])

  React.useEffect(() => {
    fetchClassifications()
  }, [fetchClassifications])

  React.useEffect(() => {
    fetchArticles({
      page: pagination.current,
      limit: pagination.pageSize
    })
  }, [pagination.current, pagination.pageSize, fetchArticles])

  const handleSearch = React.useCallback((search: string) => {
    setSearchTerm(search)
    if (search.trim()) {
      // Use the search endpoint for articles
      articleService.search(search).then(response => {
        setArticles(response.data)
        setPagination(prev => ({ ...prev, current: 1, total: response.total }))
        setLoading(false)
      }).catch(error => {
        console.error('Error searching articles:', error)
        setLoading(false)
      })
      setLoading(true)
    } else {
      fetchArticles({
        page: 1,
        limit: pagination.pageSize
      })
      setPagination(prev => ({ ...prev, current: 1 }))
    }
  }, [pagination.pageSize, fetchArticles])

  const handlePageChange = React.useCallback((page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }, [])

  const handleAdd = () => {
    setSelectedArticle(null)
    setFormOpen(true)
  }

  const handleEdit = (article: Article) => {
    setSelectedArticle(article)
    setFormOpen(true)
  }

  const handleFormSuccess = () => {
    // Refresh the list after successful create/update
    fetchArticles({
      page: pagination.current,
      limit: pagination.pageSize
    })
  }

  const handleDelete = async (article: Article) => {
    if (confirm(`Are you sure you want to delete "${article.name}"?`)) {
      try {
        await articleService.delete(article.id)
        // Refresh the list
        fetchArticles({
          page: pagination.current,
          limit: pagination.pageSize
        })
        addToast(toast.success("Article deleted successfully", `${article.name} has been removed.`))
      } catch (error) {
        console.error('Error deleting article:', error)
        addToast(toast.error("Failed to delete article", "Please try again later."))
      }
    }
  }

  const handleImageUpload = (article: Article) => {
    setSelectedForUpload(article)
    setUploadDialogOpen(true)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0 || !selectedForUpload) return

    setUploading(true)
    try {
      const result = await articleService.uploadImages(selectedForUpload.id, files)
      
      if (result.success) {
        addToast(toast.success("Images uploaded successfully", 
          `${result.data.success_count}/${result.data.total_files} images uploaded`))
        
        // Refresh the articles list to show updated images
        fetchArticles({
          page: pagination.current,
          limit: pagination.pageSize
        })
        
        setUploadDialogOpen(false)
        setSelectedForUpload(null)
      } else {
        addToast(toast.error("Upload failed", result.message))
      }

      if (result.data.errors && result.data.errors.length > 0) {
        console.warn('Upload errors:', result.data.errors)
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      addToast(toast.error("Upload failed", "Please try again later."))
    } finally {
      setUploading(false)
      // Reset the file input
      event.target.value = ''
    }
  }

  const filteredArticles = React.useMemo(() => {
    let filtered = articles

    // Apply sorting (search is handled server-side)
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price':
          return a.price - b.price
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [articles, sortBy])

  return (
    <TwoLevelLayout>
      <Header 
        title="Articles"
        description="Manage shoe products and article information"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data", href: "/master-data" },
          { label: "Articles" }
        ]}
        actions={
          <Button onClick={handleAdd}>
            Add Article
          </Button>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
                <p className="text-2xl font-bold">{mounted ? articles.length : ''}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">With Images</p>
                <p className="text-2xl font-bold">
                  {mounted ? articles.filter(a => a.image_url).length : ''}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Filtered</p>
                <p className="text-2xl font-bold">{mounted ? filteredArticles.length : ''}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-orange-600 rounded-full" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Price</p>
                <p className="text-2xl font-bold">
                  {mounted && articles.length > 0 ? 
                    new Intl.NumberFormat('id-ID', { 
                      style: 'currency', 
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    }).format(articles.reduce((sum, a) => sum + a.price, 0) / articles.length) : ''}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {(() => {
                const start = (pagination.current - 1) * pagination.pageSize + 1
                const end = Math.min(pagination.current * pagination.pageSize, pagination.total)
                return `${start}-${end} of ${pagination.total} items`
              })()}
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <BarChart3 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="created_at">Created</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <Button 
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Cards
              </Button>
              <Button 
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4 mr-2" />
                Table
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="p-4">
                <div className="space-y-3">
                  {/* Image */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {article.image_url && mounted ? (
                      <img 
                        src={articleService.getImageUrl(article.image_url)}
                        alt={article.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = ''
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg line-clamp-2">{article.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.description || 'No description'}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {classifications.find(c => c.id === article.classification_id)?.name || 'Unknown'}
                      </Badge>
                      <span className="font-bold text-lg">
                        {mounted ? new Intl.NumberFormat('id-ID', { 
                          style: 'currency', 
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(article.price) : ''}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleImageUpload(article)}>
                      <Upload className="h-3 w-3 mr-1" />
                      Images
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(article)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(article)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <DataTable
            data={filteredArticles}
            columns={[
              ...columns,
              {
                key: 'actions',
                title: 'Actions',
                width: '120px',
                render: (_, article: Article) => (
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleImageUpload(article)}
                    >
                      <Upload className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(article)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete(article)}
                    >
                      Delete
                    </Button>
                  </div>
                )
              }
            ]}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: handlePageChange
            }}
          />
        )}

        {/* Forms and Dialogs */}
        <ArticleForm
          open={formOpen}
          onOpenChange={setFormOpen}
          article={selectedArticle}
          onSuccess={handleFormSuccess}
        />

        {/* Image Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Images for {selectedForUpload?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Select up to 5 images (max 5MB each). Supported formats: JPG, PNG, GIF, WebP.
              </div>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {uploading && (
                <div className="text-sm text-muted-foreground">
                  Uploading images...
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TwoLevelLayout>
  )
}