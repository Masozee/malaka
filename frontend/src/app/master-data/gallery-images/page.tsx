'use client'

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Image01Icon,
  UploadIcon,
  Download01Icon,
  ViewIcon,
  PencilEdit01Icon,
  DeleteIcon,
  GridIcon,
  Menu01Icon,
  CameraIcon,
  Tag01Icon,
  PaintBrush01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  AlertCircleIcon
} from "@hugeicons/core-free-icons"

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Badge } from '@/components/ui/badge'

import { galleryImageService } from '@/services/masterdata'
import { GalleryImage as GalleryImageType, MasterDataFilters } from '@/types/masterdata'

interface GalleryImage extends GalleryImageType {
  id: string
  fileName: string
  originalName: string
  productCode: string
  productName: string
  category: string
  imageType: 'main' | 'thumbnail' | 'detail' | 'lifestyle' | 'color-variant' | 'size-guide'
  imageUrl: string
  alt: string
  fileSize: number
  dimensions: string
  format: 'jpg' | 'png' | 'webp' | 'svg'
  status: 'active' | 'inactive' | 'processing' | 'failed'
  uploadDate: string
  uploadedBy: string
  tags: string[]
  color?: string
  size?: string
  angle?: string
  isApproved: boolean
  approvedBy?: string
  approvalDate?: string
  usage: {
    website: boolean
    catalog: boolean
    pos: boolean
    mobile: boolean
  }
  seoOptimized: boolean
  compressionLevel: number
}

// Mock gallery images data
const mockGalleryImages: GalleryImage[] = [
  {
    id: '1',
    fileName: 'air-runner-pro-main-001.webp',
    originalName: 'Air Runner Pro Main Photo.jpg',
    productCode: 'RS-SUM-001',
    productName: 'Air Runner Pro',
    category: 'Running Shoes',
    imageType: 'main',
    imageUrl: '/images/products/air-runner-pro-main.webp',
    alt: 'Air Runner Pro running shoes in black color',
    fileSize: 245760,
    dimensions: '1200x1200',
    format: 'webp',
    status: 'active',
    uploadDate: '2024-07-20',
    uploadedBy: 'Product Manager',
    tags: ['running', 'sport', 'black', 'professional'],
    color: 'Black',
    angle: 'side',
    isApproved: true,
    approvedBy: 'Marketing Director',
    approvalDate: '2024-07-21',
    usage: {
      website: true,
      catalog: true,
      pos: true,
      mobile: true
    },
    seoOptimized: true,
    compressionLevel: 85
  },
  {
    id: '2',
    fileName: 'air-runner-pro-detail-001.webp',
    originalName: 'Air Runner Pro Detail Shot.jpg',
    productCode: 'RS-SUM-001',
    productName: 'Air Runner Pro',
    category: 'Running Shoes',
    imageType: 'detail',
    imageUrl: '/images/products/air-runner-pro-detail.webp',
    alt: 'Air Runner Pro sole and cushioning detail',
    fileSize: 189440,
    dimensions: '800x800',
    format: 'webp',
    status: 'active',
    uploadDate: '2024-07-20',
    uploadedBy: 'Product Manager',
    tags: ['sole', 'cushioning', 'technology', 'detail'],
    color: 'Black',
    angle: 'bottom',
    isApproved: true,
    approvedBy: 'Marketing Director',
    approvalDate: '2024-07-21',
    usage: {
      website: true,
      catalog: false,
      pos: false,
      mobile: true
    },
    seoOptimized: true,
    compressionLevel: 80
  },
  {
    id: '3',
    fileName: 'sprint-master-white-main-001.webp',
    originalName: 'Sprint Master White Main.jpg',
    productCode: 'RS-SUM-002',
    productName: 'Sprint Master',
    category: 'Running Shoes',
    imageType: 'main',
    imageUrl: '/images/products/sprint-master-white.webp',
    alt: 'Sprint Master running shoes in white color',
    fileSize: 298240,
    dimensions: '1200x1200',
    format: 'webp',
    status: 'active',
    uploadDate: '2024-07-22',
    uploadedBy: 'Design Team',
    tags: ['running', 'white', 'sprint', 'performance'],
    color: 'White',
    angle: 'three-quarter',
    isApproved: true,
    approvedBy: 'Product Director',
    approvalDate: '2024-07-23',
    usage: {
      website: true,
      catalog: true,
      pos: true,
      mobile: true
    },
    seoOptimized: true,
    compressionLevel: 85
  },
  {
    id: '4',
    fileName: 'canvas-classic-lifestyle-001.jpg',
    originalName: 'Canvas Classic Lifestyle Photo.jpg',
    productCode: 'CS-CAS-001',
    productName: 'Classic Canvas Low',
    category: 'Canvas Shoes',
    imageType: 'lifestyle',
    imageUrl: '/images/products/canvas-classic-lifestyle.jpg',
    alt: 'Person wearing Classic Canvas Low shoes in casual setting',
    fileSize: 456780,
    dimensions: '1920x1080',
    format: 'jpg',
    status: 'processing',
    uploadDate: '2024-07-25',
    uploadedBy: 'Photography Team',
    tags: ['lifestyle', 'casual', 'street', 'fashion'],
    color: 'Beige',
    isApproved: false,
    usage: {
      website: false,
      catalog: true,
      pos: false,
      mobile: false
    },
    seoOptimized: false,
    compressionLevel: 90
  },
  {
    id: '5',
    fileName: 'winter-boot-alpine-thumb-001.png',
    originalName: 'Alpine Winter Boot Thumbnail.png',
    productCode: 'BT-WIN-001',
    productName: 'Alpine Winter Boot',
    category: 'Winter Boots',
    imageType: 'thumbnail',
    imageUrl: '/images/products/winter-boot-thumb.png',
    alt: 'Alpine Winter Boot thumbnail image',
    fileSize: 65536,
    dimensions: '300x300',
    format: 'png',
    status: 'active',
    uploadDate: '2024-07-18',
    uploadedBy: 'E-commerce Team',
    tags: ['winter', 'boot', 'thumbnail', 'cold'],
    color: 'Brown',
    angle: 'front',
    isApproved: true,
    approvedBy: 'E-commerce Manager',
    approvalDate: '2024-07-19',
    usage: {
      website: true,
      catalog: false,
      pos: true,
      mobile: true
    },
    seoOptimized: true,
    compressionLevel: 75
  },
  {
    id: '6',
    fileName: 'size-guide-universal.svg',
    originalName: 'Universal Size Guide Chart.svg',
    productCode: 'UNIVERSAL',
    productName: 'Universal Size Guide',
    category: 'Reference',
    imageType: 'size-guide',
    imageUrl: '/images/reference/size-guide.svg',
    alt: 'Universal shoe size guide chart',
    fileSize: 12288,
    dimensions: '800x600',
    format: 'svg',
    status: 'active',
    uploadDate: '2024-07-15',
    uploadedBy: 'Product Team',
    tags: ['size', 'guide', 'measurement', 'reference'],
    isApproved: true,
    approvedBy: 'Product Director',
    approvalDate: '2024-07-16',
    usage: {
      website: true,
      catalog: true,
      pos: false,
      mobile: true
    },
    seoOptimized: true,
    compressionLevel: 100
  },
  {
    id: '7',
    fileName: 'urban-runner-navy-variant-001.webp',
    originalName: 'Urban Runner Navy Color.jpg',
    productCode: 'RS-SUM-003',
    productName: 'Urban Runner',
    category: 'Running Shoes',
    imageType: 'color-variant',
    imageUrl: '/images/products/urban-runner-navy.webp',
    alt: 'Urban Runner shoes in navy blue color variant',
    fileSize: 267890,
    dimensions: '1000x1000',
    format: 'webp',
    status: 'failed',
    uploadDate: '2024-07-24',
    uploadedBy: 'Product Manager',
    tags: ['urban', 'running', 'navy', 'color-variant'],
    color: 'Navy',
    angle: 'side',
    isApproved: false,
    usage: {
      website: false,
      catalog: false,
      pos: false,
      mobile: false
    },
    seoOptimized: false,
    compressionLevel: 0
  },
  {
    id: '8',
    fileName: 'product-catalog-template.jpg',
    originalName: 'Product Catalog Template.jpg',
    productCode: 'TEMPLATE',
    productName: 'Catalog Template',
    category: 'Template',
    imageType: 'main',
    imageUrl: '/images/templates/catalog-template.jpg',
    alt: 'Product catalog page template design',
    fileSize: 1048576,
    dimensions: '2480x3508',
    format: 'jpg',
    status: 'inactive',
    uploadDate: '2024-07-10',
    uploadedBy: 'Design Team',
    tags: ['template', 'catalog', 'layout', 'design'],
    isApproved: true,
    approvedBy: 'Creative Director',
    approvalDate: '2024-07-11',
    usage: {
      website: false,
      catalog: true,
      pos: false,
      mobile: false
    },
    seoOptimized: false,
    compressionLevel: 95
  }
]

// Status and type color mappings
const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  processing: 'bg-blue-100 text-blue-800',
  failed: 'bg-red-100 text-red-800'
}

const typeColors = {
  main: 'bg-blue-100 text-blue-800',
  thumbnail: 'bg-green-100 text-green-800',
  detail: 'bg-purple-100 text-purple-800',
  lifestyle: 'bg-orange-100 text-orange-800',
  'color-variant': 'bg-pink-100 text-pink-800',
  'size-guide': 'bg-teal-100 text-teal-800'
}

const formatColors = {
  jpg: 'bg-yellow-100 text-yellow-800',
  png: 'bg-blue-100 text-blue-800',
  webp: 'bg-green-100 text-green-800',
  svg: 'bg-purple-100 text-purple-800'
}

export default function GalleryImagesPage() {
  const [mounted, setMounted] = useState(false)
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch gallery images from API
  const fetchGalleryImages = async () => {
    try {
      setLoading(true)
      const response = await galleryImageService.getAll()
      console.log('Gallery images response:', response)
      setGalleryImages(response.data)
    } catch (error) {
      console.error('Error fetching gallery images:', error)
      setGalleryImages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGalleryImages()
  }, [])

  const breadcrumbs = [
    { label: 'Master Data', href: '/master-data' },
    { label: 'Gallery Images', href: '/master-data/gallery-images' }
  ]

  // Calculate statistics
  const totalImages = galleryImages.length
  const activeImages = galleryImages.filter(img => img.status === 'active').length
  const processingImages = galleryImages.filter(img => img.status === 'processing').length
  const failedImages = galleryImages.filter(img => img.status === 'failed').length
  const approvedImages = galleryImages.length // All images from API are considered approved
  const totalFileSize = galleryImages.reduce((sum, img) => sum + (img.fileSize || 0), 0)
  const seoOptimizedImages = galleryImages.length // Assume all are SEO optimized
  const approvalRate = totalImages > 0 ? (approvedImages / totalImages) * 100 : 0

  const columns = [
    {
      accessorKey: 'fileName',
      header: 'Image',
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <HugeiconsIcon icon={Image01Icon} className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <div className="font-medium">{row.getValue('fileName')}</div>
            <div className="text-sm text-gray-500">{row.original.productName}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'imageType',
      header: 'Type',
      cell: ({ row }: any) => {
        const type = row.getValue('imageType') as keyof typeof typeColors
        return (
          <Badge className={typeColors[type]}>
            {type.replace('-', ' ').charAt(0).toUpperCase() + type.replace('-', ' ').slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'format',
      header: 'Format',
      cell: ({ row }: any) => {
        const format = row.getValue('format') as keyof typeof formatColors
        return (
          <Badge className={formatColors[format]}>
            {format.toUpperCase()}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'dimensions',
      header: 'Dimensions',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.getValue('dimensions')}</div>
      )
    },
    {
      accessorKey: 'fileSize',
      header: 'Size',
      cell: ({ row }: any) => {
        const size = row.getValue('fileSize') as number
        return (
          <div className="text-sm">
            {size > 1048576 
              ? `${(size / 1048576).toFixed(1)}MB`
              : `${(size / 1024).toFixed(0)}KB`
            }
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status') as keyof typeof statusColors
        return (
          <Badge className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'isApproved',
      header: 'Approved',
      cell: ({ row }: any) => (
        <div className="flex items-center">
          {row.getValue('isApproved') ? (
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 text-green-600" />
          ) : (
            <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 text-yellow-600" />
          )}
        </div>
      )
    },
    {
      accessorKey: 'uploadDate',
      header: 'Upload Date',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {mounted ? new Date(row.getValue('uploadDate')).toLocaleDateString('id-ID') : ''}
        </div>
      )
    }
  ]

  const ImageCard = ({ image }: { image: GalleryImage }) => (
    <Card className="p-4">
      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
        <HugeiconsIcon icon={Image01Icon} className="h-12 w-12 text-gray-400" />
      </div>
      
      <div className="space-y-2">
        <div>
          <h3 className="font-semibold text-gray-900 truncate" title={image.fileName}>
            {image.fileName}
          </h3>
          <p className="text-sm text-gray-500">{image.productName}</p>
        </div>
        
        <div className="flex space-x-1">
          <Badge className={typeColors[image.imageType]} size="sm">
            {image.imageType.replace('-', ' ').charAt(0).toUpperCase() + image.imageType.replace('-', ' ').slice(1)}
          </Badge>
          <Badge className={formatColors[image.format]} size="sm">
            {image.format.toUpperCase()}
          </Badge>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Size:</span>
          <span>
            {image.fileSize > 1048576 
              ? `${(image.fileSize / 1048576).toFixed(1)}MB`
              : `${(image.fileSize / 1024).toFixed(0)}KB`
            }
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Dimensions:</span>
          <span>{image.dimensions}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <Badge className={statusColors[image.status]} size="sm">
            {image.status.charAt(0).toUpperCase() + image.status.slice(1)}
          </Badge>
          <div className="flex items-center space-x-1">
            {image.isApproved ? (
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 text-green-600" />
            ) : (
              <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 text-yellow-600" />
            )}
            {image.seoOptimized && (
              <HugeiconsIcon icon={Tag01Icon} className="h-4 w-4 text-blue-600" />
            )}
          </div>
        </div>
        
        {image.tags.length > 0 && (
          <div className="text-xs text-gray-500">
            Tags: {image.tags.slice(0, 3).join(', ')}
            {image.tags.length > 3 && '...'}
          </div>
        )}
      </div>
      
      <div className="flex space-x-2 mt-4">
        <Button size="sm" variant="outline" className="flex-1">
          <HugeiconsIcon icon={ViewIcon} className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </div>
    </Card>
  )

  return (
    <TwoLevelLayout>
      <Header 
        title="Gallery Images"
        breadcrumbs={breadcrumbs}
      />
      
      <div className="flex-1 p-6 space-y-6">

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Images</p>
                <p className="text-2xl font-bold mt-1">{totalImages}</p>
                <p className="text-sm text-blue-600 mt-1">All files</p>
              </div>
              <HugeiconsIcon icon={Image01Icon} className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{activeImages}</p>
                <p className="text-sm text-green-600 mt-1">In use</p>
              </div>
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold mt-1 text-purple-600">{approvedImages}</p>
                <p className="text-sm text-purple-600 mt-1">Ready to use</p>
              </div>
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Size</p>
                <p className="text-2xl font-bold mt-1 text-teal-600">
                  {(totalFileSize / 1048576).toFixed(1)}MB
                </p>
                <p className="text-sm text-teal-600 mt-1">Storage used</p>
              </div>
              <HugeiconsIcon icon={Download01Icon} className="h-8 w-8 text-teal-600" />
            </div>
          </Card>
        </div>

        {/* View Toggle and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <HugeiconsIcon icon={GridIcon} className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <HugeiconsIcon icon={Menu01Icon} className="h-4 w-4 mr-2" />
              Table
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={PaintBrush01Icon} className="h-4 w-4 mr-2" />
              Bulk Process
            </Button>
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={CameraIcon} className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button size="sm">
              <HugeiconsIcon icon={UploadIcon} className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          </div>
        </div>

        {/* Data Display */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading gallery images...</p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {galleryImages.map((image) => (
              <ImageCard key={image.id} image={image} />
            ))}
          </div>
        ) : (
          <AdvancedDataTable
            data={galleryImages}
            columns={columns}
            searchPlaceholder="Search file names, products, or tags..."
            showFilters={true}
          />
        )}
      </div>
    </TwoLevelLayout>
  )
}