'use client'

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
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Filter, 
  Download, 
  MapPin, 
  Phone, 
  User, 
  Building, 
  TrendingUp,
  BarChart3,
  Search
} from 'lucide-react'
import Link from 'next/link'
import { ProductionService } from '@/services/production'
import type { Warehouse, WarehouseFilters } from '@/types/production'

export default function WarehousesPage() {
  const [mounted, setMounted] = useState(false)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        console.log('🔄 Starting warehouse fetch...')
        setLoading(true)
        setError(null)
        
        // Direct fetch with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        const response = await fetch('http://localhost:8084/api/v1/masterdata/warehouses/', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        console.log('📡 Fetch response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('📊 Raw data received:', data)
        console.log('📊 Data success:', data.success)
        console.log('📊 Data array length:', data.data?.length)
        
        if (data.success && data.data && Array.isArray(data.data)) {
          console.log('✅ Setting warehouses:', data.data.length, 'items')
          setWarehouses(data.data)
          console.log('✅ Warehouses state updated')
        } else {
          console.log('❌ Invalid data format:', data)
          setError('Invalid data format received')
          setWarehouses([])
        }
      } catch (error) {
        console.error('💥 Fetch error:', error)
        if (error.name === 'AbortError') {
          setError('Request timeout - API took too long to respond')
        } else {
          setError(error.message || 'Unknown error occurred')
        }
        setWarehouses([])
      } finally {
        setLoading(false)
        console.log('🏁 Loading complete')
      }
    }

    // Add small delay to ensure component is mounted
    const timer = setTimeout(fetchWarehouses, 100)
    return () => clearTimeout(timer)
  }, [])

  const breadcrumbs = [
    { label: 'Production', href: '/production' },
    { label: 'Warehouses', href: '/production/warehouses' }
  ]

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  // Filter warehouses
  const filteredWarehouses = warehouses.filter(warehouse => {
    if (searchTerm && !warehouse?.name?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !warehouse?.code?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !warehouse?.manager?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (statusFilter !== 'all' && warehouse?.status !== statusFilter) return false
    if (typeFilter !== 'all' && warehouse?.type !== typeFilter) return false
    if (cityFilter !== 'all' && warehouse?.city !== cityFilter) return false
    return true
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredWarehouses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedWarehouses = filteredWarehouses.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, typeFilter, cityFilter])

  // Get unique values for filters
  const statuses = Array.from(new Set(warehouses.map(warehouse => warehouse?.status).filter(Boolean)))
  const types = Array.from(new Set(warehouses.map(warehouse => warehouse?.type).filter(Boolean)))
  const cities = Array.from(new Set(warehouses.map(warehouse => warehouse?.city).filter(Boolean)))

  const getStatusBadge = (status: Warehouse['status']) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Active', color: 'text-green-600' },
      inactive: { variant: 'secondary' as const, label: 'Inactive', color: 'text-gray-600' },
      maintenance: { variant: 'outline' as const, label: 'Maintenance', color: 'text-orange-600' }
    }
    return statusConfig[status] || { variant: 'secondary' as const, label: status, color: 'text-muted-foreground' }
  }

  const getTypeBadge = (type: Warehouse['type']) => {
    const typeConfig = {
      main: { variant: 'default' as const, label: 'Main', color: 'text-blue-600' },
      satellite: { variant: 'outline' as const, label: 'Satellite', color: 'text-purple-600' },
      transit: { variant: 'secondary' as const, label: 'Transit', color: 'text-yellow-600' },
      quarantine: { variant: 'destructive' as const, label: 'Quarantine', color: 'text-red-600' }
    }
    return typeConfig[type] || { variant: 'secondary' as const, label: type, color: 'text-muted-foreground' }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600'
    if (utilization >= 80) return 'text-orange-600'
    if (utilization >= 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  // Debug logging
  console.log('🏗️ Current warehouses state:', warehouses)
  console.log('🏗️ Warehouses length:', warehouses.length)
  console.log('🏗️ Warehouses type:', typeof warehouses)
  console.log('🏗️ Is warehouses array?:', Array.isArray(warehouses))
  console.log('🔍 Filtered warehouses length:', filteredWarehouses.length)
  
  if (warehouses.length > 0) {
    console.log('🏗️ First warehouse in state:', warehouses[0])
    console.log('🏗️ First warehouse properties:', Object.keys(warehouses[0]))
  }

  // Summary statistics with debug logging
  const summaryStats = {
    total: filteredWarehouses.length,
    active: filteredWarehouses.filter(w => {
      console.log('🔍 Checking warehouse status:', w?.name, 'status:', w?.status)
      return w?.status === 'active'
    }).length,
    totalCapacity: filteredWarehouses.reduce((sum, w) => {
      const capacity = w?.capacity || 0
      console.log('📊 Adding capacity:', w?.name, 'capacity:', capacity)
      return sum + capacity
    }, 0),
    totalStock: filteredWarehouses.reduce((sum, w) => {
      const stock = w?.current_stock || 0
      console.log('📊 Adding stock:', w?.name, 'current_stock:', stock)
      return sum + stock
    }, 0),
    averageUtilization: filteredWarehouses.reduce((sum, w) => {
      const utilization = w?.capacity > 0 ? (w.current_stock / w.capacity) * 100 : 0
      console.log('📊 Calculating utilization:', w?.name, 'utilization:', utilization)
      return sum + utilization
    }, 0) / filteredWarehouses.length || 0
  }
  
  console.log('📊 Final summary stats:', summaryStats)

  const columns = [
    {
      key: 'warehouse' as keyof Warehouse,
      title: 'Warehouse',
      render: (warehouse: Warehouse) => (
        <div>
          <div className="font-medium">{warehouse?.name || ''}</div>
          <div className="text-sm text-muted-foreground">{warehouse?.code || ''}</div>
        </div>
      )
    },
    {
      key: 'type' as keyof Warehouse,
      title: 'Type',
      render: (warehouse: Warehouse) => {
        if (!warehouse?.type) return ''
        const { variant, label } = getTypeBadge(warehouse.type)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'location' as keyof Warehouse,
      title: 'Location',
      render: (warehouse: Warehouse) => (
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{warehouse?.city || ''}</div>
            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
              {warehouse?.address || ''}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status' as keyof Warehouse,
      title: 'Status',
      render: (warehouse: Warehouse) => {
        if (!warehouse?.status) return ''
        const { variant, label } = getStatusBadge(warehouse.status)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'capacity' as keyof Warehouse,
      title: 'Capacity',
      render: (warehouse: Warehouse) => {
        const utilization = warehouse?.capacity > 0 ? (warehouse.current_stock / warehouse.capacity) * 100 : 0
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{warehouse?.current_stock || 0}</span>
              <span className="text-muted-foreground">/ {warehouse?.capacity || 0}</span>
            </div>
            <Progress value={utilization} className="h-2" />
            <div className={`text-xs ${getUtilizationColor(utilization)}`}>
              {utilization.toFixed(1)}% utilized
            </div>
          </div>
        )
      }
    },
    {
      key: 'zones' as keyof Warehouse,
      title: 'Zones',
      render: (warehouse: Warehouse) => (
        <div className="text-center">
          <div className="font-medium">{warehouse?.zones?.length || 0}</div>
          <div className="text-sm text-muted-foreground">zones</div>
        </div>
      )
    },
    {
      key: 'manager' as keyof Warehouse,
      title: 'Manager',
      render: (warehouse: Warehouse) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{warehouse?.manager || ''}</div>
            <div className="text-sm text-muted-foreground flex items-center space-x-1">
              <Phone className="h-3 w-3" />
              <span>{warehouse?.phone || ''}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'actions' as keyof Warehouse,
      title: 'Actions',
      render: (warehouse: Warehouse) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/production/warehouses/${warehouse?.id || ''}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/production/warehouses/${warehouse?.id || ''}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Warehouses"
        description="Manage warehouse operations and storage facilities"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Utilization Report
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" asChild>
              <Link href="/production/warehouses/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Warehouse
              </Link>
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Warehouses</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.total}</p>
                <p className="text-sm text-green-600 mt-1">{summaryStats.active} active</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Capacity</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalCapacity.toLocaleString()}</p>
                <p className="text-sm text-blue-600 mt-1">units</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Stock</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalStock.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">units stored</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Utilization</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.averageUtilization.toFixed(1)}%</p>
                <div className="mt-2">
                  <Progress value={summaryStats.averageUtilization} className="h-2" />
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search warehouses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {mounted && statuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <Package className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {mounted && types.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-32">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {mounted && cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Warehouses Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 font-medium">Warehouse</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Location</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Capacity</th>
                  <th className="text-left p-4 font-medium">Manager</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedWarehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{warehouse.name}</div>
                        <div className="text-sm text-gray-500">{warehouse.code}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={getTypeBadge(warehouse.type).variant}>
                        {getTypeBadge(warehouse.type).label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{warehouse.city}</div>
                          <div className="text-sm text-gray-500 max-w-[200px] truncate">
                            {warehouse.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusBadge(warehouse.status).variant}>
                        {getStatusBadge(warehouse.status).label}  
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>{warehouse.current_stock}</span>
                          <span className="text-gray-500">/ {warehouse.capacity}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${warehouse.capacity > 0 ? (warehouse.current_stock / warehouse.capacity) * 100 : 0}%`}}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {warehouse.capacity > 0 ? ((warehouse.current_stock / warehouse.capacity) * 100).toFixed(1) : 0}% utilized
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{warehouse.manager}</div>
                          <div className="text-sm text-gray-500">{warehouse.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/production/warehouses/${warehouse.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/production/warehouses/${warehouse.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredWarehouses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No warehouses found
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredWarehouses.length)} of {filteredWarehouses.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8"
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

      </div>
    </TwoLevelLayout>
  )
}