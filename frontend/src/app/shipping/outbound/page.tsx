'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TanStackDataTable, TanStackColumn } from '@/components/ui/tanstack-data-table'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ScanIcon,
  CheckmarkCircle01Icon,
  Time04Icon,
  AlertCircleIcon,
  PackageIcon,
  ChartBarLineIcon,
  ViewIcon,
  PencilEdit01Icon,
  Add01Icon,
  DeleteIcon,
  Search01Icon,
  FilterHorizontalIcon,
  Download01Icon
} from '@hugeicons/core-free-icons'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'

interface OutboundScan {
  id: string
  scanId: string
  packageId: string
  airwaybill: string
  courierName: string
  destination: string
  customerName: string
  scanType: 'pickup' | 'sorting' | 'transit' | 'delivery' | 'exception'
  scanDate: string
  scanTime: string
  location: string
  scannedBy: string
  deviceId: string
  status: 'completed' | 'pending' | 'failed' | 'exception'
  notes?: string
  weight: number
  dimensions: string
  value: number
}

// Mock outbound scan data
const mockOutboundScans: OutboundScan[] = [
  {
    id: '1',
    scanId: 'SC-2024-001',
    packageId: 'PKG-240725-001',
    airwaybill: 'AWB-JNE-001',
    courierName: 'JNE Express',
    destination: 'Jakarta Pusat',
    customerName: 'PT ABC Corporation',
    scanType: 'pickup',
    scanDate: '2024-07-25',
    scanTime: '08:30',
    location: 'Malaka Warehouse',
    scannedBy: 'Operator 1',
    deviceId: 'SCANNER-001',
    status: 'completed',
    weight: 2.5,
    dimensions: '30x20x15 cm',
    value: 850000
  },
  {
    id: '2',
    scanId: 'SC-2024-002',
    packageId: 'PKG-240725-002',
    airwaybill: 'AWB-TIKI-002',
    courierName: 'TIKI',
    destination: 'Surabaya',
    customerName: 'Toko Sepatu Murah',
    scanType: 'sorting',
    scanDate: '2024-07-25',
    scanTime: '09:15',
    location: 'Sorting Center Jakarta',
    scannedBy: 'Operator 2',
    deviceId: 'SCANNER-002',
    status: 'completed',
    weight: 1.8,
    dimensions: '25x18x12 cm',
    value: 650000
  },
  {
    id: '3',
    scanId: 'SC-2024-003',
    packageId: 'PKG-240725-003',
    airwaybill: 'AWB-POS-003',
    courierName: 'Pos Indonesia',
    destination: 'Bandung',
    customerName: 'Sarah Kusuma',
    scanType: 'transit',
    scanDate: '2024-07-25',
    scanTime: '10:45',
    location: 'Transit Hub Bandung',
    scannedBy: 'Operator 3',
    deviceId: 'SCANNER-003',
    status: 'completed',
    weight: 1.2,
    dimensions: '22x15x10 cm',
    value: 420000
  },
  {
    id: '4',
    scanId: 'SC-2024-004',
    packageId: 'PKG-240725-004',
    airwaybill: 'AWB-JNT-004',
    courierName: 'J&T Express',
    destination: 'Yogyakarta',
    customerName: 'Ahmad Rizki',
    scanType: 'delivery',
    scanDate: '2024-07-25',
    scanTime: '14:20',
    location: 'Yogyakarta Distribution Center',
    scannedBy: 'Courier 1',
    deviceId: 'MOBILE-001',
    status: 'completed',
    weight: 0.8,
    dimensions: '20x12x8 cm',
    value: 320000
  },
  {
    id: '5',
    scanId: 'SC-2024-005',
    packageId: 'PKG-240725-005',
    airwaybill: 'AWB-SICEPAT-005',
    courierName: 'SiCepat',
    destination: 'Medan',
    customerName: 'CV Maju Jaya',
    scanType: 'exception',
    scanDate: '2024-07-25',
    scanTime: '11:30',
    location: 'Medan Sorting Facility',
    scannedBy: 'Operator 4',
    deviceId: 'SCANNER-004',
    status: 'exception',
    notes: 'Address incomplete, requires clarification',
    weight: 3.2,
    dimensions: '35x25x18 cm',
    value: 1200000
  },
  {
    id: '6',
    scanId: 'SC-2024-006',
    packageId: 'PKG-240725-006',
    airwaybill: 'AWB-LION-006',
    courierName: 'Lion Parcel',
    destination: 'Makassar',
    customerName: 'Indira Fashion',
    scanType: 'pickup',
    scanDate: '2024-07-25',
    scanTime: '16:00',
    location: 'Malaka Warehouse',
    scannedBy: 'Operator 1',
    deviceId: 'SCANNER-001',
    status: 'pending',
    weight: 2.1,
    dimensions: '28x20x14 cm',
    value: 780000
  },
  {
    id: '7',
    scanId: 'SC-2024-007',
    packageId: 'PKG-240725-007',
    airwaybill: 'AWB-ANTERAJA-007',
    courierName: 'AnterAja',
    destination: 'Denpasar',
    customerName: 'Bali Shoes Store',
    scanType: 'sorting',
    scanDate: '2024-07-25',
    scanTime: '13:45',
    location: 'Denpasar Hub',
    scannedBy: 'Operator 5',
    deviceId: 'SCANNER-005',
    status: 'failed',
    notes: 'Barcode damaged, manual entry required',
    weight: 1.5,
    dimensions: '24x16x11 cm',
    value: 580000
  },
  {
    id: '8',
    scanId: 'SC-2024-008',
    packageId: 'PKG-240725-008',
    airwaybill: 'AWB-NINJA-008',
    courierName: 'Ninja Express',
    destination: 'Semarang',
    customerName: 'Toni Setiawan',
    scanType: 'delivery',
    scanDate: '2024-07-25',
    scanTime: '15:30',
    location: 'Customer Location',
    scannedBy: 'Courier 2',
    deviceId: 'MOBILE-002',
    status: 'completed',
    weight: 0.9,
    dimensions: '21x13x9 cm',
    value: 390000
  }
]

// Status and scan type badge variants
const statusVariants = {
  completed: 'default' as const,
  pending: 'secondary' as const,
  failed: 'destructive' as const,
  exception: 'outline' as const
}

const scanTypeVariants = {
  pickup: 'default' as const,
  sorting: 'secondary' as const,
  transit: 'outline' as const,
  delivery: 'default' as const,
  exception: 'destructive' as const
}

export default function OutboundScanningPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Shipping', href: '/shipping' },
    { label: 'Outbound Scanning', href: '/shipping/outbound' }
  ]

  // Calculate statistics
  const totalScans = mockOutboundScans.length
  const completedScans = mockOutboundScans.filter(scan => scan.status === 'completed').length
  const pendingScans = mockOutboundScans.filter(scan => scan.status === 'pending').length
  const failedScans = mockOutboundScans.filter(scan => scan.status === 'failed').length
  const exceptionScans = mockOutboundScans.filter(scan => scan.status === 'exception').length
  const totalWeight = mockOutboundScans.reduce((sum, scan) => sum + scan.weight, 0)
  const totalValue = mockOutboundScans.reduce((sum, scan) => sum + scan.value, 0)
  const successRate = (completedScans / totalScans) * 100

  const columns: TanStackColumn<OutboundScan>[] = [
    {
      accessorKey: 'scanId',
      id: 'scanId',
      header: 'Scan ID',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.scanId}</div>
          <div className="text-xs text-gray-500">{row.original.packageId}</div>
        </div>
      )
    },
    {
      accessorKey: 'airwaybill',
      id: 'airwaybill',
      header: 'Airwaybill',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.airwaybill}</div>
          <div className="text-xs text-gray-500">{row.original.courierName}</div>
        </div>
      )
    },
    {
      accessorKey: 'scanType',
      id: 'scanType',
      header: 'Scan Type',
      cell: ({ row }) => {
        const type = row.original.scanType
        return (
          <Badge variant={scanTypeVariants[type]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'destination',
      id: 'destination',
      header: 'Destination',
      cell: ({ row }) => (
        <div className="text-xs">
          {row.original.destination}
        </div>
      )
    },
    {
      accessorKey: 'customerName',
      id: 'customerName',
      header: 'Customer',
      cell: ({ row }) => (
        <div className="text-xs">{row.original.customerName}</div>
      )
    },
    {
      accessorKey: 'scanTime',
      id: 'scanTime',
      header: 'Scan Time',
      cell: ({ row }) => (
        <div className="text-xs">
          {row.original.scanDate} {row.original.scanTime}
        </div>
      )
    },
    {
      accessorKey: 'location',
      id: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <div className="text-xs">{row.original.location}</div>
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
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'scannedBy',
      id: 'scannedBy',
      header: 'Scanned By',
      cell: ({ row }) => (
        <div className="text-xs">
          {row.original.scannedBy}
        </div>
      )
    }
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="Outbound Scanning"
        description="Manage outbound package scanning"
        breadcrumbs={breadcrumbs}
        actions={
          <Button size="sm" onClick={() => router.push('/shipping/outbound/scan')}>
            <HugeiconsIcon icon={ScanIcon} className="h-4 w-4 mr-2" />
            Manual Scan
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={ScanIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold">{totalScans}</p>
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
                <p className="text-2xl font-bold">{completedScans}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{failedScans}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={ChartBarLineIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {mounted ? successRate.toFixed(1) : ''}%
                </p>
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
              placeholder="Search scans..."
              className="pl-9 w-64"
              aria-label="Search scans"
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
          data={mockOutboundScans}
          columns={columns}
          pagination={{
            pageIndex: 0,
            pageSize: 10,
            totalRows: mockOutboundScans.length,
            onPageChange: () => { }
          }}
          onEdit={(scan) => router.push(`/shipping/outbound/${scan.id}/edit`)}
          onDelete={(scan) => {
            if (confirm('Are you sure you want to delete this scan?')) {
              console.log('Delete scan', scan.id)
            }
          }}
          customActions={[
            {
              label: 'View Details',
              icon: ViewIcon,
              onClick: (scan) => router.push(`/shipping/outbound/${scan.id}`)
            }
          ]}
        />
      </div>
    </TwoLevelLayout>
  )
}