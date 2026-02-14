"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  GridIcon,
  Menu01Icon,
  UploadIcon,
  CancelIcon,
  Image01Icon,
  ChartColumnIcon,
  QrCodeIcon,
  Package01Icon,
  FilterIcon,
  ChartIncreaseIcon
} from "@hugeicons/core-free-icons"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { DataTable, Column } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArticleForm } from "@/components/forms/article-form"
import { useToast, toast } from "@/components/ui/toast"
import { articleService, classificationService } from "@/services/masterdata"
import { barcodeService, type BarcodeFormat } from "@/services/barcode"
import { api } from "@/lib/api"
import { Article, Classification, MasterDataFilters } from "@/types/masterdata"

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
  const [barcodeDialogOpen, setBarcodeDialogOpen] = React.useState(false)
  const [selectedArticleForBarcode, setSelectedArticleForBarcode] = React.useState<Article | null>(null)
  const [barcodeType, setBarcodeType] = React.useState<'barcode' | 'qrcode'>('barcode')
  const [generatingBarcodes, setGeneratingBarcodes] = React.useState(false)
  const [batchProgress, setBatchProgress] = React.useState<{ current: number; total: number } | null>(null)
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = React.useState(false)
  const [selectedArticlesForQR, setSelectedArticlesForQR] = React.useState<Article[]>([])
  const [qrCodeDataType, setQrCodeDataType] = React.useState<'product_url' | 'product_info' | 'barcode_only' | 'custom'>('product_info')
  const [customQrTemplate, setCustomQrTemplate] = React.useState('{{name}} - {{id}}')
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
              <HugeiconsIcon icon={Image01Icon} className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'barcode',
      title: 'SKU',
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

  const handleBatchDelete = async (articles: Article[]) => {
    if (confirm(`Are you sure you want to delete ${articles.length} articles?`)) {
      try {
        // Delete articles one by one (or implement batch delete API)
        for (const article of articles) {
          await articleService.delete(article.id)
        }
        // Refresh the list
        fetchArticles({
          page: pagination.current,
          limit: pagination.pageSize
        })
        addToast(toast.success(`${articles.length} articles deleted successfully`, "Selected articles have been removed."))
      } catch (error) {
        console.error('Error deleting articles:', error)
        addToast(toast.error("Failed to delete articles", "Please try again later."))
      }
    }
  }

  const handleGenerateBarcode = async (article: Article) => {
    setGeneratingBarcodes(true)
    try {
      const result = await barcodeService.generateBarcode({
        id: article.id,
        data: article.barcode || article.id,
        format: 'CODE128',
        width: 300,
        height: 100
      })
      
      console.log('Single barcode generation result:', {
        id: result?.id,
        hasImage: !!(result?.image_base64),
        imageLength: result?.image_base64?.length,
        hasError: !!(result?.error),
        error: result?.error
      })
      
      if (result.error) {
        addToast(toast.error("Barcode generation failed", result.error))
      } else if (!result.image_base64 && !result.image_url) {
        addToast(toast.error("Barcode generation failed", "No barcode image data received from server"))
      } else {
        // Download the barcode
        await barcodeService.downloadBarcode(result, `barcode-${article.name}.png`)
        addToast(toast.success("Barcode generated successfully", `Downloaded barcode for ${article.name}`))
      }
    } catch (error) {
      console.error('Error generating barcode:', error)
      addToast(toast.error("Failed to generate barcode", "Please try again later."))
    } finally {
      setGeneratingBarcodes(false)
    }
  }

  const handleGenerateQRCode = async (article: Article) => {
    setGeneratingBarcodes(true)
    try {
      const result = await barcodeService.generateBarcode({
        id: article.id,
        data: `Product: ${article.name} (ID: ${article.id})`,
        format: 'QRCODE',
        width: 200,
        height: 200
      })
      
      if (result.error) {
        addToast(toast.error("QR code generation failed", result.error))
      } else {
        // Download the QR code
        barcodeService.downloadBarcode(result, `qrcode-${article.name}.png`)
        addToast(toast.success("QR code generated successfully", `Downloaded QR code for ${article.name}`))
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      addToast(toast.error("Failed to generate QR code", "Please try again later."))
    } finally {
      setGeneratingBarcodes(false)
    }
  }

  const handleBatchBarcode = async (articles: Article[], format: BarcodeFormat = 'CODE128') => {
    if (articles.length === 0) {
      addToast(toast.error("No articles selected", "Please select articles to generate barcodes for."))
      return
    }

    setGeneratingBarcodes(true)
    setBatchProgress({ current: 0, total: articles.length })
    
    try {
      const result = await barcodeService.generateSelectedArticleBarcodes(
        articles.map(a => a.id),
        format
      )
      
      console.log('Barcode generation result:', result)
      console.log('Results details:', result.results?.map(r => ({
        id: r?.id,
        hasImage: !!(r?.image_base64),
        imageLength: r?.image_base64?.length,
        hasError: !!(r?.error),
        error: r?.error
      })))
      
      setBatchProgress({ current: result.success_count, total: result.total_count })
      
      if (result.success_count > 0) {
        // Download all successful barcodes
        const validResults = result.results.filter(r => r && !r.error && (r.image_base64 || r.image_url))
        console.log('Valid results after filtering:', validResults?.length, validResults?.map(r => ({
          id: r.id,
          hasImageUrl: !!r.image_url,
          hasImageBase64: !!r.image_base64,
          imageLength: r.image_base64?.length
        })))
        
        if (validResults.length > 0) {
          await barcodeService.downloadBatchBarcodes(validResults, 'article-barcode')
        }
        
        addToast(toast.success(
          "Batch barcodes generated successfully", 
          `Generated ${result.success_count}/${result.total_count} barcodes successfully`
        ))
      }
      
      if (result.error_count > 0) {
        const errors = result.results.filter(r => r.error).map(r => r.error).join(', ')
        addToast(toast.error(
          `${result.error_count} barcodes failed to generate`,
          errors
        ))
      }
    } catch (error) {
      console.error('Error generating batch barcodes:', error)
      addToast(toast.error("Failed to generate batch barcodes", "Please try again later."))
    } finally {
      setGeneratingBarcodes(false)
      setBatchProgress(null)
    }
  }

  const handleBatchQRCode = (articles: Article[]) => {
    if (articles.length === 0) {
      addToast(toast.error("No articles selected", "Please select articles to generate QR codes for."))
      return
    }
    
    setSelectedArticlesForQR(articles)
    setQrCodeDialogOpen(true)
  }

  const generateQRCodeData = (article: Article, type: string, template?: string): string => {
    switch (type) {
      case 'product_url':
        return `https://malaka-erp.com/products/${article.id}`
      case 'product_info':
        const classification = classifications.find(c => c.id === article.classification_id)?.name || 'Unknown'
        return `Product: ${article.name}\nID: ${article.id}\nPrice: ${new Intl.NumberFormat('id-ID', { 
          style: 'currency', 
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(article.price)}\nCategory: ${classification}\nBarcode: ${article.barcode || 'N/A'}`
      case 'barcode_only':
        return article.barcode || article.id
      case 'custom':
        if (!template) return article.name
        return template
          .replace(/\{\{name\}\}/g, article.name)
          .replace(/\{\{id\}\}/g, article.id)
          .replace(/\{\{price\}\}/g, article.price.toString())
          .replace(/\{\{barcode\}\}/g, article.barcode || '')
          .replace(/\{\{description\}\}/g, article.description || '')
      default:
        return article.name
    }
  }

  const handleGenerateSelectedQRCodes = async () => {
    setQrCodeDialogOpen(false)
    setGeneratingBarcodes(true)
    setBatchProgress({ current: 0, total: selectedArticlesForQR.length })
    
    try {
      // Prepare QR code requests with custom data
      const requests = selectedArticlesForQR.map(article => ({
        id: article.id,
        data: generateQRCodeData(article, qrCodeDataType, customQrTemplate),
        format: 'QRCODE' as BarcodeFormat,
        width: 300,
        height: 300
      }))

      const result = await barcodeService.generateBatch(requests)
      
      console.log('QR Code generation result:', result)
      console.log('Results details:', result.results?.map(r => ({
        id: r?.id,
        hasImage: !!(r?.image_base64),
        imageLength: r?.image_base64?.length,
        hasError: !!(r?.error),
        error: r?.error
      })))
      
      setBatchProgress({ current: result.success_count, total: result.total_count })
      
      if (result.success_count > 0) {
        // Download all successful QR codes
        const validResults = result.results.filter(r => r && !r.error && r.image_base64)
        console.log('Valid results after filtering:', validResults?.length, validResults?.map(r => ({
          id: r.id,
          hasImage: !!r.image_base64,
          imageLength: r.image_base64?.length
        })))
        
        if (validResults.length > 0) {
          await barcodeService.downloadBatchBarcodes(
            validResults, 
            `qr-${qrCodeDataType}`
          )
        }
        
        addToast(toast.success(
          "Batch QR codes generated successfully", 
          `Generated ${result.success_count}/${result.total_count} QR codes successfully`
        ))
      }
      
      if (result.error_count > 0) {
        const errors = result.results.filter(r => r.error).map(r => r.error).join(', ')
        addToast(toast.error(
          `${result.error_count} QR codes failed to generate`,
          errors
        ))
      }
    } catch (error) {
      console.error('Error generating batch QR codes:', error)
      addToast(toast.error("Failed to generate batch QR codes", "Please try again later."))
    } finally {
      setGeneratingBarcodes(false)
      setBatchProgress(null)
    }
  }

  const handleGenerateAllBarcodes = async () => {
    if (articles.length === 0) {
      addToast(toast.error("No articles found", "Please add some articles first."))
      return
    }
    
    const confirmed = confirm(
      `Generate barcodes for all ${articles.length} articles?\n\n` +
      `This will create barcode images and store them in MinIO storage ` +
      `under the 'barcodes' folder. Existing barcodes will be overwritten.`
    )
    
    if (!confirmed) return
    
    setGeneratingBarcodes(true)
    setBatchProgress({ current: 0, total: articles.length })
    
    try {
      // Get all article IDs
      const articleIds = articles.map(article => article.id)
      
      // Use the enhanced backend endpoint to generate barcodes for all articles
      const response = await api.post('/api/v1/masterdata/barcodes/generate/articles', {
        article_ids: articleIds,
        format: 'CODE128',
        width: 500,
        height: 150,
        save_to_database: true
      })

      
      if (response.success) {
        const generatedCount = response.data?.generated_count || articleIds.length
        setBatchProgress({ current: generatedCount, total: articles.length })
        
        addToast(toast.success(
          "Barcodes generated successfully!", 
          `Generated ${generatedCount} barcodes and stored them in MinIO under 'malaka-images/barcodes/' folder.`
        ))
        
        // Refresh the articles list to show any updated data
        fetchArticles({
          page: pagination.current,
          limit: pagination.pageSize
        })
        
      } else {
        throw new Error(result.message || 'Failed to generate barcodes')
      }
      
    } catch (error) {
      console.error('Error generating barcodes:', error)
      addToast(toast.error(
        "Failed to generate barcodes", 
        `Error: ${error.message}. Please check that the backend service is running.`
      ))
    } finally {
      setGeneratingBarcodes(false)
      setBatchProgress(null)
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
        description="Manage products and article information"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Products", href: "/products" },
          { label: "Articles" }
        ]}
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleGenerateAllBarcodes}
              disabled={articles.length === 0 || generatingBarcodes}
              className="flex items-center gap-2"
            >
              {generatingBarcodes ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={ChartColumnIcon} className="h-4 w-4" />
                  <span>Generate All Barcodes ({articles.length})</span>
                </>
              )}
            </Button>
            <Button variant="outline" onClick={async () => {
              console.log('Starting barcode test...')
              const result = await barcodeService.testBarcodeGeneration()
              console.log('Test result:', result)
              addToast(result.success ? 
                toast.success('Barcode Test', result.message) :
                toast.error('Barcode Test Failed', result.message)
              )
            }}>
              Test Barcode API
            </Button>
            <Button onClick={handleAdd}>
              Add Article
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={Package01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
                <p className="text-2xl font-bold">{mounted ? articles.length : ''}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={Image01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">With Images</p>
                <p className="text-2xl font-bold">
                  {mounted ? articles.filter(a => a.image_url).length : ''}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={FilterIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Filtered</p>
                <p className="text-2xl font-bold">{mounted ? filteredArticles.length : ''}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={ChartIncreaseIcon} className="h-5 w-5 text-foreground" />
              </div>
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
              <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                <HugeiconsIcon icon={ChartColumnIcon} className="h-4 w-4 mr-2" />
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
                <HugeiconsIcon icon={GridIcon} className="h-4 w-4 mr-2" />
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <HugeiconsIcon icon={Menu01Icon} className="h-4 w-4 mr-2" />
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
                        <HugeiconsIcon icon={Image01Icon} className="w-12 h-12 text-gray-400" />
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
                      <HugeiconsIcon icon={UploadIcon} className="h-3 w-3 mr-1" />
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
            columns={columns}
            loading={loading}
            batchSelection={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBatchDelete={handleBatchDelete}
            onBatchBarcode={(articles) => handleBatchBarcode(articles, 'CODE128')}
            onBatchQRCode={handleBatchQRCode}
            onGenerateBarcode={handleGenerateBarcode}
            onGenerateQRCode={handleGenerateQRCode}
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

        {/* QR Code Configuration Dialog */}
        <Dialog open={qrCodeDialogOpen} onOpenChange={setQrCodeDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Generate QR Codes for {selectedArticlesForQR.length} Articles</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground">
                Choose what information to include in the QR codes for your selected articles.
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">QR Code Data Type</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="product_url" 
                        name="qrType" 
                        checked={qrCodeDataType === 'product_url'}
                        onChange={() => setQrCodeDataType('product_url')}
                      />
                      <Label htmlFor="product_url">Product URL</Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">Generate QR codes linking to product pages</p>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="product_info" 
                        name="qrType" 
                        checked={qrCodeDataType === 'product_info'}
                        onChange={() => setQrCodeDataType('product_info')}
                      />
                      <Label htmlFor="product_info">Complete Product Info</Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">Include name, ID, price, category, and barcode</p>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="barcode_only" 
                        name="qrType" 
                        checked={qrCodeDataType === 'barcode_only'}
                        onChange={() => setQrCodeDataType('barcode_only')}
                      />
                      <Label htmlFor="barcode_only">Barcode Only</Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">QR code contains only the product barcode</p>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        type="radio" 
                        id="custom" 
                        name="qrType" 
                        checked={qrCodeDataType === 'custom'}
                        onChange={() => setQrCodeDataType('custom')}
                      />
                      <Label htmlFor="custom">Custom Template</Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">Use custom template with placeholders</p>
                  </div>
                </div>
                
                {qrCodeDataType === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="customTemplate">Custom Template</Label>
                    <Input
                      id="customTemplate"
                      value={customQrTemplate}
                      onChange={(e) => setCustomQrTemplate(e.target.value)}
                      placeholder="Enter template with {{name}}, {{id}}, {{price}}, {{barcode}}"
                    />
                    <div className="text-xs text-muted-foreground">
                      Available placeholders: <code>{{name}}</code>, <code>{{id}}</code>, <code>{{price}}</code>, <code>{{barcode}}</code>, <code>{{description}}</code>
                    </div>
                  </div>
                )}
                
                {/* Preview */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium">Preview (first article):</Label>
                  <p className="text-sm mt-1 font-mono bg-white p-2 rounded border">
                    {selectedArticlesForQR.length > 0 
                      ? generateQRCodeData(selectedArticlesForQR[0], qrCodeDataType, customQrTemplate)
                      : 'No articles selected'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setQrCodeDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateSelectedQRCodes}
                  className="flex items-center space-x-2"
                >
                  <HugeiconsIcon icon={QrCodeIcon} className="h-4 w-4" />
                  <span>Generate {selectedArticlesForQR.length} QR Codes</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Batch Progress Dialog */}
        <Dialog open={generatingBarcodes} onOpenChange={() => {}}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generating Barcodes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {batchProgress 
                  ? `Processing ${batchProgress.current} of ${batchProgress.total} articles...`
                  : 'Preparing barcode generation...'}
              </div>
              
              <div className="flex flex-col items-center space-y-4 p-4 border-2 border-dashed border-muted rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                {batchProgress && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                    ></div>
                  </div>
                )}
                <p className="text-sm text-center">
                  Please wait while we generate your barcodes...
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TwoLevelLayout>
  )
}