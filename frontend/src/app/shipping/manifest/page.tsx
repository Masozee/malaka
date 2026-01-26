'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Location01Icon,
  File01Icon,
  Download01Icon,
  ClipboardIcon,
  PackageIcon,
  DeliveryTruck01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  ViewIcon,
  PencilEdit01Icon,
  Add01Icon,
  DeleteIcon,
  Search01Icon,
  FilterHorizontalIcon
} from '@hugeicons/core-free-icons'
import { useRouter } from 'next/navigation'

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

// Status badge variants
const statusVariants = {
  preparing: 'secondary' as const,
  'in-transit': 'default' as const,
  arrived: 'outline' as const,
  completed: 'default' as const,
  delayed: 'destructive' as const
}

export default function ManifestPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

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

  const columns: TanStackColumn<Manifest>[] = [
    {
      accessorKey: 'manifestNumber',
      id: 'manifestNumber',
      header: 'Manifest',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.manifestNumber}</div>
          <div className="text-sm text-gray-500">{row.original.courierName}</div>
        </div>
      )
    },
    {
      accessorKey: 'vehicleNumber',
      id: 'vehicleNumber',
      header: 'Vehicle',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.vehicleNumber}</div>
          <div className="text-sm text-gray-500">{row.original.driverName}</div>
        </div>
      )
    },
    {
      accessorKey: 'route',
      id: 'route',
      header: 'Route',
      cell: ({ row }) => (
        <div className="text-sm">
          <span className="max-w-32 truncate" title={row.original.route}>
            {row.original.route}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'totalPackages',
      id: 'totalPackages',
      header: 'Packages',
      cell: ({ row }) => (
        <div className="text-center">
          <div className="font-medium">{row.original.totalPackages}</div>
          <div className="text-xs text-gray-500">{row.original.totalWeight.toFixed(1)}kg</div>
        </div>
      )
    },
    {
      accessorKey: 'departureTime',
      id: 'departureTime',
      header: 'Departure',
      cell: ({ row }) => (
        <div className="text-sm">
          {mounted ? new Date(row.original.departureTime).toLocaleString('id-ID') : ''}
        </div>
      )
    },
    {
      accessorKey: 'estimatedArrival',
      id: 'estimatedArrival',
      header: 'Est. Arrival',
      cell: ({ row }) => (
        <div className="text-sm">
          {mounted ? new Date(row.original.estimatedArrival).toLocaleString('id-ID') : ''}
        </div>
      )
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant={statusVariants[status]}>
            {status.replace('-', ' ').charAt(0).toUpperCase() + status.replace('-', ' ').slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'totalValue',
      id: 'totalValue',
      header: 'Value',
      cell: ({ row }) => (
        <div className="text-sm font-medium">
          {mounted ? row.original.totalValue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="Manifest Management"
        description="Manage shipping manifests and routes"
        breadcrumbs={breadcrumbs}
        actions={
          <Button size="sm" onClick={() => router.push('/shipping/manifest/new')}>
            <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
            Create Manifest
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={ClipboardIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Manifests</p>
                <p className="text-2xl font-bold">{totalManifests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={DeliveryTruck01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold">{inTransitManifests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delayed</p>
                <p className="text-2xl font-bold">{delayedManifests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedManifests}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center justify-end gap-2">
          {/* Note: Search and filter functionality to be implemented */}
          <div className="relative">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search manifests..."
              className="pl-9 w-64"
              aria-label="Search manifests"
            />
          </div>
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={FilterHorizontalIcon} className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        <TanStackDataTable
          data={mockManifestData}
          columns={columns}
          pagination={{
            pageIndex: 0,
            pageSize: 10,
            totalRows: mockManifestData.length,
            onPageChange: () => { }
          }}
          onEdit={(manifest) => router.push(`/shipping/manifest/${manifest.id}/edit`)}
          onDelete={(manifest) => {
            if (confirm('Are you sure you want to delete this manifest?')) {
              console.log('Delete manifest', manifest.id)
            }
          }}
          customActions={[
            {
              label: 'Track Route',
              icon: Location01Icon,
              onClick: (manifest) => router.push(`/shipping/manifest/${manifest.id}/track`)
            },
            {
              label: 'View Details',
              icon: ViewIcon,
              onClick: (manifest) => router.push(`/shipping/manifest/${manifest.id}`)
            }
          ]}
        />
      </div>
    </TwoLevelLayout>
  )
}