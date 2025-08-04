'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Badge } from '@/components/ui/badge'
import { 
  ClipboardList,
  Truck,
  Package,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Download
} from 'lucide-react'

interface Manifest {
  id: string
  manifestNumber: string
  courierName: string
  vehicleNumber: string
  driverName: string
  driverPhone: string
  route: string
  departureTime: string
  estimatedArrival: string
  actualArrival?: string
  status: 'preparing' | 'in-transit' | 'arrived' | 'completed' | 'delayed'
  totalPackages: number
  totalWeight: number
  totalValue: number
  createdDate: string
  packages: ManifestPackage[]
  notes?: string
}

interface ManifestPackage {
  id: string
  airwaybill: string
  destination: string
  customerName: string
  weight: number
  value: number
  status: 'loaded' | 'in-transit' | 'delivered' | 'failed'
}

// Mock manifest data
const mockManifestData: Manifest[] = [
  {
    id: '1',
    manifestNumber: 'MNF-2024-001',
    courierName: 'JNE Express',
    vehicleNumber: 'B 1234 ABC',
    driverName: 'Budi Santoso',
    driverPhone: '+62 812-3456-7890',
    route: 'Jakarta - Surabaya - Malang',
    departureTime: '2024-07-25 06:00',
    estimatedArrival: '2024-07-25 18:00',
    actualArrival: '2024-07-25 17:45',
    status: 'completed',
    totalPackages: 25,
    totalWeight: 45.8,
    totalValue: 12500000,
    createdDate: '2024-07-24',
    packages: [
      {
        id: '1',
        airwaybill: 'AWB-JNE-001',
        destination: 'Surabaya',
        customerName: 'PT ABC Corporation',
        weight: 2.5,
        value: 850000,
        status: 'delivered'
      },
      {
        id: '2',
        airwaybill: 'AWB-JNE-002',
        destination: 'Malang',
        customerName: 'Toko Sepatu Murah',
        weight: 1.8,
        value: 650000,
        status: 'delivered'
      }
    ]
  },
  {
    id: '2',
    manifestNumber: 'MNF-2024-002',
    courierName: 'TIKI',
    vehicleNumber: 'B 5678 DEF',
    driverName: 'Sari Dewi',
    driverPhone: '+62 813-4567-8901',
    route: 'Jakarta - Bandung - Tasikmalaya',
    departureTime: '2024-07-25 08:00',
    estimatedArrival: '2024-07-25 15:00',
    status: 'in-transit',
    totalPackages: 18,
    totalWeight: 32.4,
    totalValue: 8900000,
    createdDate: '2024-07-24',
    packages: [
      {
        id: '3',
        airwaybill: 'AWB-TIKI-003',
        destination: 'Bandung',
        customerName: 'Sarah Kusuma',
        weight: 1.2,
        value: 420000,
        status: 'in-transit'
      },
      {
        id: '4',
        airwaybill: 'AWB-TIKI-004',
        destination: 'Tasikmalaya',
        customerName: 'Ahmad Rizki',
        weight: 0.8,
        value: 320000,
        status: 'in-transit'
      }
    ]
  },
  {
    id: '3',
    manifestNumber: 'MNF-2024-003',
    courierName: 'Pos Indonesia',
    vehicleNumber: 'B 9012 GHI',
    driverName: 'Mike Johnson',
    driverPhone: '+62 814-5678-9012',
    route: 'Jakarta - Yogyakarta - Solo',
    departureTime: '2024-07-25 07:30',
    estimatedArrival: '2024-07-25 16:30',
    status: 'delayed',
    totalPackages: 15,
    totalWeight: 28.6,
    totalValue: 7200000,
    createdDate: '2024-07-24',
    notes: 'Delayed due to traffic congestion',
    packages: [
      {
        id: '5',
        airwaybill: 'AWB-POS-005',
        destination: 'Yogyakarta',
        customerName: 'CV Maju Jaya',
        weight: 3.2,
        value: 1200000,
        status: 'in-transit'
      }
    ]
  },
  {
    id: '4',
    manifestNumber: 'MNF-2024-004',
    courierName: 'J&T Express',
    vehicleNumber: 'B 3456 JKL',
    driverName: 'Indira Putri',
    driverPhone: '+62 815-6789-0123',
    route: 'Jakarta - Cirebon - Semarang',
    departureTime: '2024-07-25 09:00',
    estimatedArrival: '2024-07-25 17:00',
    status: 'arrived',
    totalPackages: 22,
    totalWeight: 38.9,
    totalValue: 9800000,
    createdDate: '2024-07-24',
    actualArrival: '2024-07-25 16:30',
    packages: [
      {
        id: '6',
        airwaybill: 'AWB-JNT-006',
        destination: 'Semarang',
        customerName: 'Indira Fashion',
        weight: 2.1,
        value: 780000,
        status: 'delivered'
      }
    ]
  },
  {
    id: '5',
    manifestNumber: 'MNF-2024-005',
    courierName: 'SiCepat',
    vehicleNumber: 'B 7890 MNO',
    driverName: 'Fitri Rahayu',
    driverPhone: '+62 816-7890-1234',
    route: 'Jakarta - Bekasi - Karawang',
    departureTime: '2024-07-25 10:00',
    estimatedArrival: '2024-07-25 14:00',
    status: 'preparing',
    totalPackages: 12,
    totalWeight: 21.3,
    totalValue: 5600000,
    createdDate: '2024-07-25',
    packages: [
      {
        id: '7',
        airwaybill: 'AWB-SICEPAT-007',
        destination: 'Bekasi',
        customerName: 'Bali Shoes Store',
        weight: 1.5,
        value: 580000,
        status: 'loaded'
      }
    ]
  },
  {
    id: '6',
    manifestNumber: 'MNF-2024-006',
    courierName: 'Lion Parcel',
    vehicleNumber: 'B 2345 PQR',
    driverName: 'Nina Kusuma',
    driverPhone: '+62 817-8901-2345',
    route: 'Jakarta - Depok - Bogor',
    departureTime: '2024-07-25 11:30',
    estimatedArrival: '2024-07-25 16:00',
    status: 'in-transit',
    totalPackages: 8,
    totalWeight: 15.7,
    totalValue: 4200000,
    createdDate: '2024-07-25',
    packages: [
      {
        id: '8',
        airwaybill: 'AWB-LION-008',
        destination: 'Bogor',
        customerName: 'Toni Setiawan',
        weight: 0.9,
        value: 390000,
        status: 'in-transit'
      }
    ]
  }
]

// Status color mappings
const statusColors = {
  preparing: 'bg-gray-100 text-gray-800',
  'in-transit': 'bg-blue-100 text-blue-800',
  arrived: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  delayed: 'bg-red-100 text-red-800'
}

export default function ManifestPage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Shipping', href: '/shipping' },
    { label: 'Manifest', href: '/shipping/manifest' }
  ]

  // Calculate statistics
  const totalManifests = mockManifestData.length
  const preparingManifests = mockManifestData.filter(m => m.status === 'preparing').length
  const inTransitManifests = mockManifestData.filter(m => m.status === 'in-transit').length
  const completedManifests = mockManifestData.filter(m => m.status === 'completed').length
  const delayedManifests = mockManifestData.filter(m => m.status === 'delayed').length
  const totalPackages = mockManifestData.reduce((sum, m) => sum + m.totalPackages, 0)
  const totalWeight = mockManifestData.reduce((sum, m) => sum + m.totalWeight, 0)
  const totalValue = mockManifestData.reduce((sum, m) => sum + m.totalValue, 0)

  const columns = [
    {
      accessorKey: 'manifestNumber',
      header: 'Manifest',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('manifestNumber')}</div>
          <div className="text-sm text-gray-500">{row.original.courierName}</div>
        </div>
      )
    },
    {
      accessorKey: 'vehicleNumber',
      header: 'Vehicle',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('vehicleNumber')}</div>
          <div className="text-sm text-gray-500">{row.original.driverName}</div>
        </div>
      )
    },
    {
      accessorKey: 'route',
      header: 'Route',
      cell: ({ row }: any) => (
        <div className="flex items-center text-sm">
          <MapPin className="h-3 w-3 mr-1 text-gray-400" />
          <span className="max-w-32 truncate" title={row.getValue('route')}>
            {row.getValue('route')}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'totalPackages',
      header: 'Packages',
      cell: ({ row }: any) => (
        <div className="text-center">
          <div className="font-medium">{row.getValue('totalPackages')}</div>
          <div className="text-xs text-gray-500">{row.original.totalWeight.toFixed(1)}kg</div>
        </div>
      )
    },
    {
      accessorKey: 'departureTime',
      header: 'Departure',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {mounted ? new Date(row.getValue('departureTime')).toLocaleString('id-ID') : ''}
        </div>
      )
    },
    {
      accessorKey: 'estimatedArrival',
      header: 'Est. Arrival',
      cell: ({ row }: any) => (
        <div className="text-sm">
          {mounted ? new Date(row.getValue('estimatedArrival')).toLocaleString('id-ID') : ''}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status') as keyof typeof statusColors
        return (
          <Badge className={statusColors[status]}>
            {status.replace('-', ' ').charAt(0).toUpperCase() + status.replace('-', ' ').slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'totalValue',
      header: 'Value',
      cell: ({ row }: any) => (
        <div className="text-sm font-medium">
          {mounted ? row.getValue('totalValue').toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
        </div>
      )
    }
  ]

  const ManifestCard = ({ manifest }: { manifest: Manifest }) => (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{manifest.manifestNumber}</h3>
          <p className="text-sm text-gray-500">{manifest.courierName}</p>
        </div>
        <Badge className={statusColors[manifest.status]}>
          {manifest.status.replace('-', ' ').charAt(0).toUpperCase() + manifest.status.replace('-', ' ').slice(1)}
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Vehicle:</span>
          <span>{manifest.vehicleNumber}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Driver:</span>
          <span>{manifest.driverName}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Route:</span>
          <span className="flex items-center">
            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
            <span className="truncate max-w-32" title={manifest.route}>
              {manifest.route}
            </span>
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Packages:</span>
          <span>{manifest.totalPackages} packages ({manifest.totalWeight.toFixed(1)}kg)</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Departure:</span>
          <span>{mounted ? new Date(manifest.departureTime).toLocaleString('id-ID') : ''}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Est. Arrival:</span>
          <span>{mounted ? new Date(manifest.estimatedArrival).toLocaleString('id-ID') : ''}</span>
        </div>
        
        {manifest.actualArrival && (
          <div className="flex justify-between">
            <span className="text-gray-500">Actual Arrival:</span>
            <span className="text-green-600 font-medium">
              {mounted ? new Date(manifest.actualArrival).toLocaleString('id-ID') : ''}
            </span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-500">Total Value:</span>
          <span className="font-medium">
            {mounted ? manifest.totalValue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
          </span>
        </div>
        
        {manifest.notes && (
          <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
            <span className="font-medium text-yellow-800">Notes: </span>
            <span className="text-yellow-700">{manifest.notes}</span>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2 mt-4">
        <Button size="sm" variant="outline" className="flex-1">
          <FileText className="h-4 w-4 mr-1" />
          View Details
        </Button>
        <Button size="sm" className="flex-1">
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </div>
    </Card>
  )

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Manifest Management"
          breadcrumbs={breadcrumbs}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Manifests</p>
                <p className="text-2xl font-bold text-gray-900">{totalManifests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Package className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Preparing</p>
                <p className="text-2xl font-bold text-gray-600">{preparingManifests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-blue-600">{inTransitManifests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedManifests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Delayed</p>
                <p className="text-2xl font-bold text-red-600">{delayedManifests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Packages</p>
                <p className="text-2xl font-bold text-purple-600">{totalPackages}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Package className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Weight</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {totalWeight.toFixed(0)}kg
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <FileText className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-teal-600">
                  {mounted ? (totalValue / 1000000).toFixed(0) : ''}M
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* View Toggle and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Track Route
            </Button>
            <Button variant="outline" size="sm">Export</Button>
            <Button size="sm">
              <ClipboardList className="h-4 w-4 mr-2" />
              Create Manifest
            </Button>
          </div>
        </div>

        {/* Data Display */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockManifestData.map((manifest) => (
              <ManifestCard key={manifest.id} manifest={manifest} />
            ))}
          </div>
        ) : (
          <Card>
            <AdvancedDataTable
              data={mockManifestData}
              columns={columns}
              searchPlaceholder="Search manifest numbers, couriers, or routes..."
              showFilters={true}
            />
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}