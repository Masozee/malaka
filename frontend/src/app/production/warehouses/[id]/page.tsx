'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { 
  Package, 
  Edit, 
  MapPin, 
  Phone, 
  User, 
  Building, 
  TrendingUp,
  BarChart3,
  AlertTriangle,
  FileText,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { mockWarehouses } from '@/services/production'
import type { Warehouse, WarehouseZone } from '@/types/production'
import { useParams } from 'next/navigation'

export default function WarehouseDetailsPage() {
  const [mounted, setMounted] = useState(false)
  const params = useParams()
  const warehouseId = params.id as string

  useEffect(() => {
    setMounted(true)
  }, [])

  // Find the warehouse (in real app, this would be an API call)
  const warehouse = mockWarehouses.find(w => w.id === warehouseId)

  if (!warehouse) {
    return (
      <TwoLevelLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Warehouse Not Found</h2>
            <p className="text-muted-foreground mt-2">The requested warehouse could not be found.</p>
            <Button asChild className="mt-4">
              <Link href="/production/warehouses">Back to Warehouses</Link>
            </Button>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const breadcrumbs = [
    { label: 'Production', href: '/production' },
    { label: 'Warehouses', href: '/production/warehouses' },
    { label: warehouse.name, href: `/production/warehouses/${warehouse.id}` }
  ]

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  const formatDateTime = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleString('id-ID')
  }

  const getStatusBadge = (status: Warehouse['status']) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Active' },
      inactive: { variant: 'secondary' as const, label: 'Inactive' },
      maintenance: { variant: 'outline' as const, label: 'Maintenance' }
    }
    return statusConfig[status] || { variant: 'secondary' as const, label: status }
  }

  const getTypeBadge = (type: Warehouse['type']) => {
    const typeConfig = {
      main: { variant: 'default' as const, label: 'Main Warehouse' },
      satellite: { variant: 'outline' as const, label: 'Satellite Warehouse' },
      transit: { variant: 'secondary' as const, label: 'Transit Hub' },
      quarantine: { variant: 'destructive' as const, label: 'Quarantine Area' }
    }
    return typeConfig[type] || { variant: 'secondary' as const, label: type }
  }

  const getZoneTypeBadge = (type: WarehouseZone['type']) => {
    const typeConfig = {
      storage: { variant: 'default' as const, label: 'Storage', color: 'text-blue-600' },
      picking: { variant: 'outline' as const, label: 'Picking', color: 'text-green-600' },
      packing: { variant: 'secondary' as const, label: 'Packing', color: 'text-purple-600' },
      staging: { variant: 'outline' as const, label: 'Staging', color: 'text-orange-600' }
    }
    return typeConfig[type] || { variant: 'secondary' as const, label: type, color: 'text-muted-foreground' }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600'
    if (utilization >= 80) return 'text-orange-600'
    if (utilization >= 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  // Calculate warehouse metrics
  const warehouseMetrics = {
    totalUtilization: warehouse.capacity > 0 ? (warehouse.currentStock / warehouse.capacity) * 100 : 0,
    totalZones: warehouse.zones.length,
    totalZoneCapacity: warehouse.zones.reduce((sum, zone) => sum + zone.capacity, 0),
    totalZoneStock: warehouse.zones.reduce((sum, zone) => sum + zone.currentStock, 0),
    averageZoneUtilization: warehouse.zones.reduce((sum, zone) => {
      const utilization = zone.capacity > 0 ? (zone.currentStock / zone.capacity) * 100 : 0
      return sum + utilization
    }, 0) / warehouse.zones.length || 0
  }

  // Zone columns for data table
  const zoneColumns = [
    {
      key: 'zone',
      title: 'Zone',
      render: (zone: WarehouseZone) => (
        <div>
          <div className="font-medium">{zone.name}</div>
          <div className="text-sm text-muted-foreground">{zone.code}</div>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      render: (zone: WarehouseZone) => {
        const { variant, label } = getZoneTypeBadge(zone.type)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    {
      key: 'capacity',
      title: 'Capacity',
      render: (zone: WarehouseZone) => {
        const utilization = zone.capacity > 0 ? (zone.currentStock / zone.capacity) * 100 : 0
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{zone.currentStock}</span>
              <span className="text-muted-foreground">/ {zone.capacity}</span>
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
      key: 'utilization',
      title: 'Utilization',
      render: (zone: WarehouseZone) => {
        const utilization = zone.capacity > 0 ? (zone.currentStock / zone.capacity) * 100 : 0
        return (
          <div className={`text-center font-medium ${getUtilizationColor(utilization)}`}>
            {utilization.toFixed(1)}%
          </div>
        )
      }
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title={warehouse.name}
          description={`${warehouse.type} warehouse in ${warehouse.city}`}
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Inventory Report
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/production/warehouses/${warehouse.id}/zones/new`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Zone
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/production/warehouses/${warehouse.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Warehouse Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Warehouse Code</label>
                    <p className="font-medium">{warehouse.code}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="font-medium">{warehouse.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <div className="mt-1">
                      <Badge {...getTypeBadge(warehouse.type)} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Manager</label>
                    <p className="font-medium">{warehouse.manager}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge {...getStatusBadge(warehouse.status)} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Capacity</label>
                    <p className="font-medium">{warehouse.capacity.toLocaleString()} units</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Stock</label>
                    <p className="font-medium">{warehouse.currentStock.toLocaleString()} units</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="font-medium">{warehouse.phone}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Location Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Location & Contact</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p className="font-medium">{warehouse.address}</p>
                    <p className="text-sm text-muted-foreground">{warehouse.city}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Warehouse Manager</label>
                    <p className="font-medium">{warehouse.manager}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p className="font-medium">{warehouse.phone}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Capacity Overview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Capacity Overview</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Utilization</span>
                    <span className={`font-bold ${getUtilizationColor(warehouseMetrics.totalUtilization)}`}>
                      {warehouseMetrics.totalUtilization.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={warehouseMetrics.totalUtilization} className="h-4" />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>{warehouse.currentStock.toLocaleString()} units used</span>
                    <span>{warehouse.capacity.toLocaleString()} units total</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{warehouseMetrics.totalZones}</div>
                    <div className="text-sm text-muted-foreground">Total Zones</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {warehouseMetrics.totalZoneCapacity.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Zone Capacity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {warehouseMetrics.averageZoneUtilization.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Zone Utilization</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Warehouse Zones */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Warehouse Zones</h3>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/production/warehouses/${warehouse.id}/zones/new`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Zone
                  </Link>
                </Button>
              </div>
              
              <AdvancedDataTable
                data={warehouse.zones}
                columns={zoneColumns}
                searchable={false}
                filterable={false}
                pagination={{
                  pageSize: 10,
                  currentPage: 1,
                  totalPages: Math.ceil(warehouse.zones.length / 10),
                  totalItems: warehouse.zones.length,
                  onChange: () => {}
                }}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-muted-foreground">Capacity</span>
                  </div>
                  <span className="font-bold">{warehouse.capacity.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Current Stock</span>
                  </div>
                  <span className="font-bold">{warehouse.currentStock.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Zones</span>
                  </div>
                  <span className="font-bold">{warehouse.zones.length}</span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Available Space</span>
                  <span className="font-medium">
                    {(warehouse.capacity - warehouse.currentStock).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Zone Type Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Zone Distribution</h3>
              
              <div className="space-y-3">
                {['storage', 'picking', 'packing', 'staging'].map((zoneType) => {
                  const zonesOfType = warehouse.zones.filter(z => z.type === zoneType)
                  const totalCapacity = zonesOfType.reduce((sum, z) => sum + z.capacity, 0)
                  const totalStock = zonesOfType.reduce((sum, z) => sum + z.currentStock, 0)
                  const utilization = totalCapacity > 0 ? (totalStock / totalCapacity) * 100 : 0
                  
                  if (zonesOfType.length === 0) return null
                  
                  return (
                    <div key={zoneType} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{zoneType}</span>
                        <span className="text-muted-foreground">
                          {zonesOfType.length} zones
                        </span>
                      </div>
                      <Progress value={utilization} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{totalStock.toLocaleString()} / {totalCapacity.toLocaleString()}</span>
                        <span>{utilization.toFixed(1)}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Inventory Check
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Zone
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </Card>

            {/* Utilization Alert */}
            {warehouseMetrics.totalUtilization >= 85 && (
              <Card className="p-6 border-orange-200 bg-orange-50">
                <div className="flex items-center space-x-2 text-orange-800">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-medium">High Utilization</p>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  This warehouse is at {warehouseMetrics.totalUtilization.toFixed(1)}% capacity. 
                  Consider expanding or redistributing inventory.
                </p>
              </Card>
            )}

            {/* Status Alert */}
            {warehouse.status !== 'active' && (
              <Card className="p-6 border-red-200 bg-red-50">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-medium">Warehouse Status</p>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  This warehouse is currently {warehouse.status}. Operations may be limited.
                </p>
              </Card>
            )}

            {/* Audit Trail */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Audit Trail</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-muted-foreground">Created At</label>
                  <p className="font-medium">{formatDateTime(warehouse.createdAt)}</p>
                </div>
                <div>
                  <label className="text-muted-foreground">Last Updated</label>
                  <p className="font-medium">{formatDateTime(warehouse.updatedAt)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}