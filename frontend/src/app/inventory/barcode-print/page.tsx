'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Badge } from '@/components/ui/badge'

interface BarcodePrintJob {
  id: string
  jobNumber: string
  jobName: string
  barcodeType: 'ean13' | 'code128' | 'qr' | 'datamatrix' | 'code39'
  template: string
  status: 'queued' | 'printing' | 'completed' | 'failed' | 'paused'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  totalLabels: number
  printedLabels: number
  failedLabels: number
  createdDate: string
  startTime?: string
  completedTime?: string
  printerName: string
  requestedBy: string
  paperSize: string
  labelDimensions: string
  items: BarcodePrintItem[]
  notes?: string
}

interface BarcodePrintItem {
  id: string
  itemCode: string
  itemName: string
  barcode: string
  quantity: number
  category: string
  size?: string
  color?: string
  price?: number
}

// Mock barcode print jobs data
const mockBarcodePrintJobs: BarcodePrintJob[] = [
  {
    id: '1',
    jobNumber: 'BPJ-2024-001',
    jobName: 'Summer Collection - Running Shoes',
    barcodeType: 'ean13',
    template: 'Product Label Template A',
    status: 'completed',
    priority: 'normal',
    totalLabels: 500,
    printedLabels: 500,
    failedLabels: 0,
    createdDate: '2024-07-25',
    startTime: '2024-07-25 08:00',
    completedTime: '2024-07-25 09:15',
    printerName: 'Zebra ZT230 - Production Floor',
    requestedBy: 'Production Manager',
    paperSize: 'A4',
    labelDimensions: '50x30mm',
    items: [
      {
        id: '1',
        itemCode: 'RS-SUM-001',
        itemName: 'Air Runner Pro',
        barcode: '8901234567890',
        quantity: 100,
        category: 'Running Shoes',
        size: '42',
        color: 'Black',
        price: 850000
      },
      {
        id: '2',
        itemCode: 'RS-SUM-002',
        itemName: 'Sprint Master',
        barcode: '8901234567891',
        quantity: 200,
        category: 'Running Shoes',
        size: '41',
        color: 'White',
        price: 750000
      },
      {
        id: '3',
        itemCode: 'RS-SUM-003',
        itemName: 'Urban Runner',
        barcode: '8901234567892',
        quantity: 200,
        category: 'Running Shoes',
        size: '43',
        color: 'Navy',
        price: 680000
      }
    ]
  },
  {
    id: '2',
    jobNumber: 'BPJ-2024-002',
    jobName: 'Casual Collection - Canvas Shoes',
    barcodeType: 'code128',
    template: 'Retail Label Template B',
    status: 'printing',
    priority: 'high',
    totalLabels: 300,
    printedLabels: 180,
    failedLabels: 5,
    createdDate: '2024-07-25',
    startTime: '2024-07-25 10:30',
    printerName: 'Datamax H-4212 - Warehouse',
    requestedBy: 'Warehouse Supervisor',
    paperSize: 'Roll',
    labelDimensions: '40x25mm',
    items: [
      {
        id: '4',
        itemCode: 'CS-CAS-001',
        itemName: 'Classic Canvas Low',
        barcode: 'CC001424250',
        quantity: 150,
        category: 'Canvas Shoes',
        size: '40',
        color: 'Beige',
        price: 320000
      },
      {
        id: '5',
        itemCode: 'CS-CAS-002',
        itemName: 'Vintage Canvas High',
        barcode: 'CC002414351',
        quantity: 150,
        category: 'Canvas Shoes',
        size: '39',
        color: 'Brown',
        price: 380000
      }
    ]
  },
  {
    id: '3',
    jobNumber: 'BPJ-2024-003',
    jobName: 'Inventory Tracking - QR Codes',
    barcodeType: 'qr',
    template: 'Asset Tracking Template',
    status: 'queued',
    priority: 'normal',
    totalLabels: 1000,
    printedLabels: 0,
    failedLabels: 0,
    createdDate: '2024-07-25',
    printerName: 'Brother QL-820NWB - Office',
    requestedBy: 'IT Administrator',
    paperSize: 'Label Roll',
    labelDimensions: '29x90mm',
    notes: 'Asset tracking labels for warehouse equipment',
    items: [
      {
        id: '6',
        itemCode: 'ASSET-001',
        itemName: 'Warehouse Rack A1',
        barcode: 'QR:RACK-A1-2024',
        quantity: 50,
        category: 'Equipment'
      },
      {
        id: '7',
        itemCode: 'ASSET-002',
        itemName: 'Conveyor Belt B2',
        barcode: 'QR:CONV-B2-2024',
        quantity: 25,
        category: 'Equipment'
      }
    ]
  },
  {
    id: '4',
    jobNumber: 'BPJ-2024-004',
    jobName: 'Winter Collection - Boots',
    barcodeType: 'ean13',
    template: 'Premium Product Template',
    status: 'failed',
    priority: 'high',
    totalLabels: 250,
    printedLabels: 45,
    failedLabels: 205,
    createdDate: '2024-07-24',
    startTime: '2024-07-24 14:00',
    printerName: 'Zebra ZT230 - Production Floor',
    requestedBy: 'Quality Control',
    paperSize: 'A4',
    labelDimensions: '60x40mm',
    notes: 'Printer jam occurred, needs maintenance',
    items: [
      {
        id: '8',
        itemCode: 'BT-WIN-001',
        itemName: 'Alpine Winter Boot',
        barcode: '8901234567893',
        quantity: 125,
        category: 'Winter Boots',
        size: '42',
        color: 'Black',
        price: 1250000
      },
      {
        id: '9',
        itemCode: 'BT-WIN-002',
        itemName: 'Urban Winter Boot',
        barcode: '8901234567894',
        quantity: 125,
        category: 'Winter Boots',
        size: '41',
        color: 'Brown',
        price: 980000
      }
    ]
  },
  {
    id: '5',
    jobNumber: 'BPJ-2024-005',
    jobName: 'Raw Materials - Components',
    barcodeType: 'code39',
    template: 'Material Label Template',
    status: 'paused',
    priority: 'low',
    totalLabels: 150,
    printedLabels: 60,
    failedLabels: 2,
    createdDate: '2024-07-24',
    startTime: '2024-07-24 16:00',
    printerName: 'Honeywell PC42t - Materials',
    requestedBy: 'Materials Manager',
    paperSize: 'Roll',
    labelDimensions: '35x20mm',
    notes: 'Paused for material restocking',
    items: [
      {
        id: '10',
        itemCode: 'MTL-001',
        itemName: 'Leather Sheet A Grade',
        barcode: 'MTL001A',
        quantity: 50,
        category: 'Raw Materials'
      },
      {
        id: '11',
        itemCode: 'MTL-002',
        itemName: 'Rubber Sole Type B',
        barcode: 'MTL002B',
        quantity: 100,
        category: 'Components'
      }
    ]
  }
]

// Status and priority color mappings
const statusColors = {
  queued: 'bg-gray-100 text-gray-800',
  printing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  paused: 'bg-yellow-100 text-yellow-800'
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

const barcodeTypeColors = {
  ean13: 'bg-blue-100 text-blue-800',
  code128: 'bg-green-100 text-green-800',
  qr: 'bg-purple-100 text-purple-800',
  datamatrix: 'bg-teal-100 text-teal-800',
  code39: 'bg-orange-100 text-orange-800'
}

export default function BarcodePrintPage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Inventory', href: '/inventory' },
    { label: 'Barcode Print', href: '/inventory/barcode-print' }
  ]

  // Calculate statistics
  const totalJobs = mockBarcodePrintJobs.length
  const queuedJobs = mockBarcodePrintJobs.filter(job => job.status === 'queued').length
  const printingJobs = mockBarcodePrintJobs.filter(job => job.status === 'printing').length
  const completedJobs = mockBarcodePrintJobs.filter(job => job.status === 'completed').length
  const failedJobs = mockBarcodePrintJobs.filter(job => job.status === 'failed').length
  const totalLabels = mockBarcodePrintJobs.reduce((sum, job) => sum + job.totalLabels, 0)
  const printedLabels = mockBarcodePrintJobs.reduce((sum, job) => sum + job.printedLabels, 0)
  const successRate = totalLabels > 0 ? (printedLabels / totalLabels) * 100 : 0

  const columns = [
    {
      accessorKey: 'jobNumber',
      header: 'Job Number',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('jobNumber')}</div>
          <div className="text-sm text-gray-500">{row.original.jobName}</div>
        </div>
      )
    },
    {
      accessorKey: 'barcodeType',
      header: 'Type',
      cell: ({ row }: any) => {
        const type = row.getValue('barcodeType') as keyof typeof barcodeTypeColors
        return (
          <Badge className={barcodeTypeColors[type]}>
            {type.toUpperCase()}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }: any) => {
        const priority = row.getValue('priority') as keyof typeof priorityColors
        return (
          <Badge className={priorityColors[priority]}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'totalLabels',
      header: 'Labels',
      cell: ({ row }: any) => (
        <div className="text-center">
          <div className="font-medium">{row.getValue('totalLabels')}</div>
          <div className="text-xs text-gray-500">
            {row.original.printedLabels} printed
          </div>
        </div>
      )
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }: any) => {
        const progress = (row.original.printedLabels / row.original.totalLabels) * 100
        return (
          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'printerName',
      header: 'Printer',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.getValue('printerName')}</div>
      )
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
      accessorKey: 'requestedBy',
      header: 'Requested By',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.getValue('requestedBy')}</div>
      )
    }
  ]

  const JobCard = ({ job }: { job: BarcodePrintJob }) => {
    const progress = (job.printedLabels / job.totalLabels) * 100
    
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{job.jobNumber}</h3>
            <p className="text-sm text-gray-500">{job.jobName}</p>
          </div>
          <div className="text-right">
            <Badge className={statusColors[job.status]}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </Badge>
            <div className="mt-1">
              <Badge className={priorityColors[job.priority]}>
                {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Barcode Type:</span>
            <Badge className={barcodeTypeColors[job.barcodeType]}>
              {job.barcodeType.toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Labels:</span>
            <span>{job.printedLabels} / {job.totalLabels}</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Progress:</span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Printer:</span>
            <span className="text-right max-w-32 truncate" title={job.printerName}>
              {job.printerName}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Template:</span>
            <span className="text-right max-w-32 truncate" title={job.template}>
              {job.template}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Label Size:</span>
            <span>{job.labelDimensions}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Created:</span>
            <span>{mounted ? new Date(job.createdDate).toLocaleDateString('id-ID') : ''}</span>
          </div>
          
          {job.failedLabels > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Failed:</span>
              <span className="text-red-600 font-medium">{job.failedLabels}</span>
            </div>
          )}
          
          {job.notes && (
            <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
              <span className="font-medium text-yellow-800">Notes: </span>
              <span className="text-yellow-700">{job.notes}</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2 mt-4">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button size="sm" className="flex-1" disabled={job.status === 'completed'}>
            <Printer className="h-4 w-4 mr-1" />
            {job.status === 'printing' ? 'Resume' : 'Print'}
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Barcode Print Management"
          breadcrumbs={breadcrumbs}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{totalJobs}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Queued</p>
                <p className="text-2xl font-bold text-gray-600">{queuedJobs}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Printer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Printing</p>
                <p className="text-2xl font-bold text-blue-600">{printingJobs}</p>
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
                <p className="text-2xl font-bold text-green-600">{completedJobs}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <ArrowsClockwise className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedJobs}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ScanLine className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Labels</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(totalLabels / 1000).toFixed(1)}K
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <ChartBar className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-teal-600">
                  {mounted ? successRate.toFixed(1) : ''}%
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
              <Gear className="h-4 w-4 mr-2" />
              Printer Gear
            </Button>
            <Button variant="outline" size="sm">
              <QrCode className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button size="sm">
              <Printer className="h-4 w-4 mr-2" />
              New Print Job
            </Button>
          </div>
        </div>

        {/* Data Display */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockBarcodePrintJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <Card>
            <AdvancedDataTable
              data={mockBarcodePrintJobs}
              columns={columns}
              searchPlaceholder="Search job numbers, names, or printers..."
              showFilters={true}
            />
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}