'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable, type AdvancedColumn } from '@/components/ui/advanced-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  Truck, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Filter, 
  Download, 
  Star,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  TrendingUp,
  Users,
  Package,
  Search,
  BarChart3,
  Building2,
  X
} from 'lucide-react'
import Link from 'next/link'

// Enhanced Supplier Interface
interface Supplier {
  id: string
  code: string
  name: string
  category: 'materials' | 'equipment' | 'services' | 'packaging' | 'chemicals' | 'outsourcing'
  type: 'local' | 'national' | 'international'
  address: string
  city: string
  country: string
  contactPerson: string
  phone: string
  email: string
  website?: string
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  rating: number
  paymentTerms: string
  deliveryTerms: string
  minOrderValue: number
  totalOrders: number
  totalValue: number
  lastOrderDate: string
  certifications: string[]
  notes?: string
  contractStart?: string
  contractEnd?: string
}

// Enhanced Suppliers Data
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    code: 'SUP001',
    name: 'PT Prima Leather Industries',
    category: 'materials',
    type: 'national',
    address: 'Jl. Industri Raya No. 45',
    city: 'Sidoarjo',
    country: 'Indonesia',
    contactPerson: 'Budi Santoso',
    phone: '+62 31-8901234',
    email: 'budi@primaleather.co.id',
    website: 'www.primaleather.co.id',
    status: 'active',
    rating: 4.5,
    paymentTerms: 'NET 30',
    deliveryTerms: 'FOB Destination',
    minOrderValue: 50000000,
    totalOrders: 156,
    totalValue: 2500000000,
    lastOrderDate: '2024-07-20',
    certifications: ['ISO 9001', 'ISO 14001', 'REACH Compliance'],
    contractStart: '2024-01-01',
    contractEnd: '2024-12-31'
  },
  {
    id: '2',
    code: 'SUP002',
    name: 'CV Sole Master Supplier',
    category: 'materials',
    type: 'local',
    address: 'Jl. Raya Sepatu No. 128',
    city: 'Mojokerto',
    country: 'Indonesia',
    contactPerson: 'Sari Dewi',
    phone: '+62 321-567890',
    email: 'sari@solemaster.com',
    status: 'active',
    rating: 4.2,
    paymentTerms: 'NET 45',
    deliveryTerms: 'EXW',
    minOrderValue: 25000000,
    totalOrders: 89,
    totalValue: 1200000000,
    lastOrderDate: '2024-07-18',
    certifications: ['SNI', 'Halal Certificate'],
    contractStart: '2024-03-01',
    contractEnd: '2025-02-28'
  },
  {
    id: '3',
    code: 'SUP003',
    name: 'Shanghai Footwear Components Ltd',
    category: 'materials',
    type: 'international',
    address: '1688 Pudong Industrial Park',
    city: 'Shanghai',
    country: 'China',
    contactPerson: 'Li Wei',
    phone: '+86 21-12345678',
    email: 'li.wei@sfcltd.com.cn',
    website: 'www.shanghaifootwear.com',
    status: 'active',
    rating: 4.0,
    paymentTerms: 'LC at Sight',
    deliveryTerms: 'FOB Shanghai',
    minOrderValue: 100000000,
    totalOrders: 45,
    totalValue: 3200000000,
    lastOrderDate: '2024-07-15',
    certifications: ['ISO 9001', 'BSCI', 'OEKO-TEX'],
    contractStart: '2024-01-01',
    contractEnd: '2025-12-31'
  },
  {
    id: '4',
    code: 'SUP004',
    name: 'PT Kemasan Sepatu Jaya',
    category: 'packaging',
    type: 'national',
    address: 'Jl. Kemasan Industri No. 67',
    city: 'Tangerang',
    country: 'Indonesia',
    contactPerson: 'Andi Pratama',
    phone: '+62 21-7890123',
    email: 'andi@kemasanjaya.co.id',
    status: 'active',
    rating: 4.3,
    paymentTerms: 'NET 30',
    deliveryTerms: 'DDP',
    minOrderValue: 15000000,
    totalOrders: 234,
    totalValue: 800000000,
    lastOrderDate: '2024-07-22',
    certifications: ['ISO 9001', 'FSC Certified'],
    notes: 'Excellent packaging quality and fast delivery'
  },
  {
    id: '5',
    code: 'SUP005',
    name: 'Mesin Industri Nusantara',
    category: 'equipment',
    type: 'national',
    address: 'Jl. Mesin Raya No. 89',
    city: 'Surabaya',
    country: 'Indonesia',
    contactPerson: 'Rudi Hermawan',
    phone: '+62 31-4567890',
    email: 'rudi@mesinnusantara.com',
    status: 'active',
    rating: 4.7,
    paymentTerms: 'NET 60',
    deliveryTerms: 'DDP',
    minOrderValue: 200000000,
    totalOrders: 12,
    totalValue: 5600000000,
    lastOrderDate: '2024-06-30',
    certifications: ['ISO 9001', 'CE Marking'],
    contractStart: '2023-01-01',
    contractEnd: '2025-12-31'
  },
  {
    id: '6',
    code: 'SUP006',
    name: 'Chemical Solutions Indonesia',
    category: 'chemicals',
    type: 'national',
    address: 'Jl. Kimia Industri No. 234',
    city: 'Bekasi',
    country: 'Indonesia',
    contactPerson: 'Dr. Maya Sari',
    phone: '+62 21-2345678',
    email: 'maya@chemicalsolutions.co.id',
    status: 'suspended',
    rating: 3.5,
    paymentTerms: 'Cash on Delivery',
    deliveryTerms: 'FOB Origin',
    minOrderValue: 30000000,
    totalOrders: 67,
    totalValue: 900000000,
    lastOrderDate: '2024-05-15',
    certifications: ['ISO 9001', 'MSDS Certified'],
    notes: 'Suspended due to quality issues, under review'
  },
  {
    id: '7',
    code: 'SUP007',
    name: 'Global Logistics Services',
    category: 'services',
    type: 'international',
    address: '500 International Trade Center',
    city: 'Singapore',
    country: 'Singapore',
    contactPerson: 'James Tan',
    phone: '+65 6123-4567',
    email: 'james.tan@globallogistics.sg',
    website: 'www.globallogistics.sg',
    status: 'active',
    rating: 4.6,
    paymentTerms: 'NET 30',
    deliveryTerms: 'Door to Door',
    minOrderValue: 5000000,
    totalOrders: 189,
    totalValue: 1800000000,
    lastOrderDate: '2024-07-23',
    certifications: ['ISO 9001', 'AEO Certified'],
    contractStart: '2024-01-01',
    contractEnd: '2024-12-31'
  },
  {
    id: '8',
    code: 'SUP008',
    name: 'PT Outsource Produksi',
    category: 'outsourcing',
    type: 'local',
    address: 'Jl. Manufaktur No. 156',
    city: 'Bandung',
    country: 'Indonesia',
    contactPerson: 'Indra Kusuma',
    phone: '+62 22-3456789',
    email: 'indra@outsourceproduksi.com',
    status: 'pending',
    rating: 0,
    paymentTerms: 'NET 45',
    deliveryTerms: 'EXW',
    minOrderValue: 75000000,
    totalOrders: 0,
    totalValue: 0,
    lastOrderDate: '',
    certifications: ['ISO 9001'],
    notes: 'New supplier under evaluation process'
  }
]

// Category and status color mappings
const categoryColors = {
  materials: 'text-blue-600 bg-blue-50',
  equipment: 'text-purple-600 bg-purple-50',
  services: 'text-teal-600 bg-teal-50',
  packaging: 'text-orange-600 bg-orange-50',
  chemicals: 'text-red-600 bg-red-50',
  outsourcing: 'text-indigo-600 bg-indigo-50'
}

const typeColors = {
  local: 'text-green-600 bg-green-50',
  national: 'text-blue-600 bg-blue-50',
  international: 'text-purple-600 bg-purple-50'
}

export default function SuppliersPage() {
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Production', href: '/production' },
    { label: 'Suppliers', href: '/production/suppliers' }
  ]

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  // Filter and sort suppliers
  const filteredSuppliers = React.useMemo(() => {
    if (!mounted) return []
    
    return mockSuppliers
      .filter(supplier => {
        // Search filter
        if (searchTerm && searchTerm.trim() !== '') {
          const searchLower = searchTerm.toLowerCase()
          const searchableFields = [
            supplier.name,
            supplier.code,
            supplier.contactPerson,
            supplier.category,
            supplier.city,
            supplier.email
          ].map(field => field.toLowerCase())
          
          if (!searchableFields.some(field => field.includes(searchLower))) {
            return false
          }
        }
        
        // Status filter
        if (statusFilter !== 'all' && supplier.status !== statusFilter) {
          return false
        }
        
        // City filter
        if (cityFilter !== 'all' && supplier.city !== cityFilter) {
          return false
        }
        
        // Category filter
        if (categoryFilter !== 'all' && supplier.category !== categoryFilter) {
          return false
        }
        
        // Type filter
        if (typeFilter !== 'all' && supplier.type !== typeFilter) {
          return false
        }
        
        // Rating filter
        if (ratingFilter !== 'all') {
          const rating = supplier.rating || 0
          switch (ratingFilter) {
            case 'excellent': 
              if (rating < 4.5) return false
              break
            case 'good': 
              if (rating < 4.0 || rating >= 4.5) return false
              break
            case 'average': 
              if (rating < 3.0 || rating >= 4.0) return false
              break
            case 'poor': 
              if (rating >= 3.0) return false
              break
          }
        }
        
        return true
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'value':
            return (b.totalValue || 0) - (a.totalValue || 0)
          case 'rating':
            return (b.rating || 0) - (a.rating || 0)
          case 'orders':
            return (b.totalOrders || 0) - (a.totalOrders || 0)
          case 'recent':
            if (!a.lastOrderDate && !b.lastOrderDate) return 0
            if (!a.lastOrderDate) return 1
            if (!b.lastOrderDate) return -1
            return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
          default:
            return 0
        }
      })
  }, [mounted, searchTerm, statusFilter, cityFilter, categoryFilter, typeFilter, ratingFilter, sortBy])

  // Get unique values for filters
  const statuses = Array.from(new Set(mockSuppliers.map(supplier => supplier?.status).filter(Boolean)))
  const cities = Array.from(new Set(mockSuppliers.map(supplier => supplier?.city).filter(Boolean)))
  const categories = Array.from(new Set(mockSuppliers.map(supplier => supplier?.category).filter(Boolean)))
  const types = Array.from(new Set(mockSuppliers.map(supplier => supplier?.type).filter(Boolean)))

  const getStatusBadge = (status: Supplier['status']) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Active', color: 'text-green-600' },
      inactive: { variant: 'secondary' as const, label: 'Inactive', color: 'text-gray-600' },
      suspended: { variant: 'destructive' as const, label: 'Suspended', color: 'text-red-600' },
      pending: { variant: 'outline' as const, label: 'Pending', color: 'text-yellow-600' }
    }
    return statusConfig[status] || { variant: 'secondary' as const, label: status, color: 'text-muted-foreground' }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-blue-600'
    if (rating >= 3.0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'Excellent'
    if (rating >= 4.0) return 'Good'
    if (rating >= 3.0) return 'Average'
    return 'Poor'
  }

  // Summary statistics
  const summaryStats = {
    total: filteredSuppliers.length,
    active: filteredSuppliers.filter(s => s?.status === 'active').length,
    suspended: filteredSuppliers.filter(s => s?.status === 'suspended').length,
    pending: filteredSuppliers.filter(s => s?.status === 'pending').length,
    materials: filteredSuppliers.filter(s => s?.category === 'materials').length,
    equipment: filteredSuppliers.filter(s => s?.category === 'equipment').length,
    services: filteredSuppliers.filter(s => s?.category === 'services').length,
    totalOrders: filteredSuppliers.reduce((sum, s) => sum + (s?.totalOrders || 0), 0),
    totalValue: filteredSuppliers.reduce((sum, s) => sum + (s?.totalValue || 0), 0),
    averageRating: filteredSuppliers.filter(s => s?.rating > 0).reduce((sum, s) => sum + (s?.rating || 0), 0) / filteredSuppliers.filter(s => s?.rating > 0).length || 0
  }

  // Supplier Card Component for cards view
  const SupplierCard = ({ supplier }: { supplier: Supplier }) => (
    <Card className="p-4 hover: transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
          <p className="text-sm text-muted-foreground">{supplier.code} • {supplier.contactPerson}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {supplier.status && (
            <Badge variant={getStatusBadge(supplier.status).variant}>
              {getStatusBadge(supplier.status).label}
            </Badge>
          )}
          {supplier.rating > 0 && (
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-500 mr-1" fill="currentColor" />
              <span className="text-sm font-medium">{supplier.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={`${categoryColors[supplier.category]} border-0 text-xs`}>
              {supplier.category.charAt(0).toUpperCase() + supplier.category.slice(1)}
            </Badge>
            <Badge className={`${typeColors[supplier.type]} border-0 text-xs`}>
              {supplier.type.charAt(0).toUpperCase() + supplier.type.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center text-sm">
          <MapPin className="h-3 w-3 mr-2 text-muted-foreground" />
          <span>{supplier.city}, {supplier.country}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
          <span>{supplier.phone}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
          <span className="truncate">{supplier.email}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <span className="text-muted-foreground">Orders:</span>
            <p className="font-medium">{supplier.totalOrders}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Value:</span>
            <p className="font-medium">{formatCurrency(supplier.totalValue)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-muted-foreground">Payment:</span>
            <p className="text-xs">{supplier.paymentTerms}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Certs:</span>
            <p className="text-xs">{supplier.certifications.length} items</p>
          </div>
        </div>
        
        {supplier.notes && (
          <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
            <span className="font-medium text-yellow-800">Notes: </span>
            <span className="text-yellow-700">{supplier.notes}</span>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <Button size="sm" variant="outline" className="flex-1" asChild>
          <Link href={`/production/suppliers/${supplier.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Link>
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <Link href={`/production/suppliers/${supplier.id}/edit`}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </Button>
      </div>
    </Card>
  )

  const columns: AdvancedColumn<Supplier>[] = [
    {
      key: 'name' as keyof Supplier,
      title: 'Supplier',
      sortable: true,
      render: (value: unknown, record: Supplier) => (
        <div>
          <div className="font-medium">{record.name}</div>
          <div className="text-sm text-muted-foreground">{record.code} • {record.contactPerson}</div>
        </div>
      )
    },
    {
      key: 'category' as keyof Supplier,
      title: 'Category',
      sortable: true,
      render: (value: unknown, record: Supplier) => {
        const colorClass = categoryColors[record.category] || 'text-gray-600 bg-gray-50'
        return (
          <Badge className={`${colorClass} border-0`}>
            {record.category.charAt(0).toUpperCase() + record.category.slice(1)}
          </Badge>
        )
      }
    },
    {
      key: 'type' as keyof Supplier,
      title: 'Type',
      sortable: true,
      render: (value: unknown, record: Supplier) => {
        const colorClass = typeColors[record.type] || 'text-gray-600 bg-gray-50'
        return (
          <Badge className={`${colorClass} border-0`}>
            {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
          </Badge>
        )
      }
    },
    {
      key: 'city' as keyof Supplier,
      title: 'Location',
      sortable: true,
      render: (value: unknown, record: Supplier) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{record.city}</div>
            <div className="text-sm text-muted-foreground">{record.country}</div>
          </div>
        </div>
      )
    },
    {
      key: 'rating' as keyof Supplier,
      title: 'Rating',
      sortable: true,
      render: (value: unknown, record: Supplier) => {
        const rating = record.rating || 0
        if (rating === 0) {
          return <span className="text-muted-foreground text-sm">Not rated</span>
        }
        return (
          <div className="flex items-center space-x-2">
            <Star className={`h-4 w-4 ${getRatingColor(rating)}`} fill="currentColor" />
            <span className={`font-medium ${getRatingColor(rating)}`}>
              {rating.toFixed(1)}
            </span>
          </div>
        )
      }
    },
    {
      key: 'totalOrders' as keyof Supplier,
      title: 'Orders & Value',
      sortable: true,
      render: (value: unknown, record: Supplier) => (
        <div>
          <div className="font-medium">{record.totalOrders} orders</div>
          <div className="text-sm text-muted-foreground">{formatCurrency(record.totalValue)}</div>
        </div>
      )
    },
    {
      key: 'status' as keyof Supplier,
      title: 'Status',
      sortable: true,
      render: (value: unknown, record: Supplier) => {
        const { variant, label } = getStatusBadge(record.status)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'paymentTerms' as keyof Supplier,
      title: 'Payment Terms',
      render: (value: unknown, record: Supplier) => (
        <div className="text-sm">{record.paymentTerms}</div>
      )
    },
    {
      key: 'certifications' as keyof Supplier,
      title: 'Certifications',
      render: (value: unknown, record: Supplier) => {
        if (!record.certifications || record.certifications.length === 0) {
          return <span className="text-muted-foreground text-sm">None</span>
        }
        return (
          <div className="text-sm">
            <span className="font-medium">{record.certifications.length}</span>
            <div className="text-xs text-muted-foreground truncate max-w-32">
              {record.certifications.slice(0, 2).join(', ')}
              {record.certifications.length > 2 && '...'}
            </div>
          </div>
        )
      }
    }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Suppliers"
        description="Manage supplier relationships and procurement partners"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance Report
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" asChild>
              <Link href="/production/suppliers/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
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
                <p className="text-sm font-medium text-muted-foreground">Total Suppliers</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.total}</p>
                <p className="text-sm text-green-600 mt-1">{summaryStats.active} active</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.materials + summaryStats.equipment + summaryStats.services}</p>
                <p className="text-sm text-blue-600 mt-1">{summaryStats.materials} materials, {summaryStats.equipment} equipment</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `Rp ${(summaryStats.totalValue / 1000000000).toFixed(1)}B` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">{summaryStats.totalOrders.toLocaleString()} orders</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.averageRating.toFixed(1)}/5</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                  <span className="text-sm text-muted-foreground">
                    {getRatingLabel(summaryStats.averageRating)}
                  </span>
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>
        </div>

        {/* Filters (no outer border) */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search suppliers, categories, or contact..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36">
                <Package className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {mounted && categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {mounted && statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-32">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {mounted && cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || cityFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('all')
                  setStatusFilter('all')
                  setCityFilter('all')
                  setTypeFilter('all')
                  setRatingFilter('all')
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* View Toggle & Sort */}
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44">
                <BarChart3 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="value">Total Value</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="orders">Order Count</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredSuppliers.length} of {mockSuppliers.length} suppliers
          </div>
        </div>

        {/* Content */}
        {!mounted ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-muted-foreground">Loading suppliers...</div>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No suppliers found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setCategoryFilter('all')
                setStatusFilter('all')
                setCityFilter('all')
                setTypeFilter('all')
                setRatingFilter('all')
              }}
            >
              Clear all filters
            </Button>
          </div>
        ) : activeView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))}
          </div>
        ) : (
          <AdvancedDataTable
            data={filteredSuppliers}
            columns={columns}
            loading={!mounted}
            pagination={{
              current: 1,
              pageSize: 10,
              total: filteredSuppliers.length,
              onChange: () => {}
            }}
            searchPlaceholder="Search suppliers..."
            exportEnabled={true}
            rowSelection={false}
          />
        )}

        {/* Top Suppliers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Suppliers by Value</h3>
            <div className="space-y-4">
              {mockSuppliers
                .sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0))
                .slice(0, 5)
                .map((supplier, index) => (
                  <div key={supplier.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-muted-foreground">{supplier.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(supplier.totalValue)}</p>
                      <p className="text-sm text-muted-foreground">{supplier.totalOrders} orders</p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Suppliers by Rating</h3>
            <div className="space-y-4">
              {mockSuppliers
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 5)
                .map((supplier, index) => (
                  <div key={supplier.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-muted-foreground">{supplier.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                        <span className="font-medium">{supplier.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{supplier.totalOrders} orders</p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </TwoLevelLayout>
  )
}