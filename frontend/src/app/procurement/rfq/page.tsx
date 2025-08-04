'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Eye, Send, FileText, Clock, CheckCircle, XCircle, AlertTriangle, BarChart3, Building2, Calendar, DollarSign, Users, MessageSquare, Filter, Settings, Download, Loader2, Edit, MoreHorizontal } from 'lucide-react'

import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

import { rfqService, RFQ, RFQStats } from '@/services/rfq'

export default function RFQPage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [stats, setStats] = useState<RFQStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  const loadData = async () => {
    try {
      console.log('RFQ Page: Starting to load data...')
      setLoading(true)
      setError(null)
      
      // Load RFQs and stats in parallel
      console.log('RFQ Page: Making API calls...')
      const [rfqData, statsData] = await Promise.all([
        rfqService.getAllRFQs({ limit: 100 }),
        rfqService.getRFQStats()
      ])
      
      console.log('RFQ Page: Received data:', { rfqData, statsData })
      setRfqs(rfqData.rfqs)
      setStats(statsData)
      console.log('RFQ Page: Data loaded successfully')
    } catch (err) {
      console.error('RFQ Page: Failed to load RFQ data:', err)
      setError('Failed to load RFQ data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const breadcrumbs = [
    { label: 'Procurement', href: '/procurement' },
    { label: 'RFQ (Request for Quotation)', href: '/procurement/rfq' }
  ]

  // Filter RFQs based on search and status
  const filteredRfqs = rfqs.filter(rfq => {
    const matchesSearch = !searchQuery || 
      rfq.rfq_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.title.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = !statusFilter || rfq.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Action handlers
  const handleViewDetails = (rfq: RFQ) => {
    console.log('View details for RFQ:', rfq.rfq_number)
    // TODO: Navigate to /procurement/rfq/[id]
  }

  const handleEditRFQ = (rfq: RFQ) => {
    console.log('Edit RFQ:', rfq.rfq_number)
    // TODO: Navigate to /procurement/rfq/[id]/edit
  }

  const handlePublishRFQ = (rfq: RFQ) => {
    console.log('Publish RFQ:', rfq.rfq_number)
    // TODO: Implement publish logic
  }

  const columns = [
    {
      key: 'rfq_number' as keyof RFQ,
      title: 'RFQ Number',
      render: (value: unknown, record: RFQ) => (
        <div>
          <div className="font-medium">{record.rfq_number}</div>
          <div className="text-sm text-gray-500">
            {rfqService.formatDate(record.created_at)}
          </div>
        </div>
      )
    },
    {
      key: 'title' as keyof RFQ,
      title: 'Title',
      render: (value: unknown, record: RFQ) => (
        <div className="max-w-60">
          <div className="font-medium truncate" title={record.title}>
            {record.title}
          </div>
          <div className="text-sm text-gray-500 truncate">
            {record.description}
          </div>
        </div>
      )
    },
    {
      key: 'status' as keyof RFQ,
      title: 'Status',
      render: (value: unknown, record: RFQ) => (
        <Badge className={rfqService.getStatusColor(record.status)}>
          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
        </Badge>
      )
    },
    {
      key: 'priority' as keyof RFQ,
      title: 'Priority',
      render: (value: unknown, record: RFQ) => (
        <Badge className={rfqService.getPriorityColor(record.priority)}>
          {record.priority.charAt(0).toUpperCase() + record.priority.slice(1)}
        </Badge>
      )
    },
    {
      key: 'items' as keyof RFQ,
      title: 'Items',
      render: (value: unknown, record: RFQ) => {
        const items = record.items || []
        return (
          <div className="text-sm">
            <div className="font-medium">{items.length} items</div>
            {items.length > 0 && (
              <div className="text-gray-500">
                Total: {rfqService.formatCurrency(
                  items.reduce((sum: number, item: any) => sum + (item.target_price * item.quantity), 0)
                )}
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'suppliers' as keyof RFQ,
      title: 'Suppliers',
      render: (value: unknown, record: RFQ) => {
        const suppliers = record.suppliers || []
        const responded = suppliers.filter((s: any) => s.status === 'responded').length
        return (
          <div className="text-sm">
            <div className="font-medium">{responded}/{suppliers.length}</div>
            <div className="text-gray-500">
              {suppliers.length > 0 ? Math.round((responded / suppliers.length) * 100) : 0}% response
            </div>
          </div>
        )
      }
    },
    {
      key: 'due_date' as keyof RFQ,
      title: 'Due Date',
      render: (value: unknown, record: RFQ) => {
        const isOverdue = rfqService.isOverdue(record)
        const daysUntil = rfqService.getDaysUntilDue(record)
        
        return (
          <div className="text-sm">
            <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {rfqService.formatDate(record.due_date)}
            </div>
            {daysUntil !== null && (
              <div className={`text-xs ${isOverdue ? 'text-red-500' : daysUntil <= 3 ? 'text-yellow-600' : 'text-gray-500'}`}>
                {isOverdue ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days left`}
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'id' as keyof RFQ,
      title: 'Actions',
      width: '80px',
      render: (value: unknown, record: RFQ) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(record)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {record.status === 'draft' && (
              <DropdownMenuItem onClick={() => handleEditRFQ(record)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit RFQ
              </DropdownMenuItem>
            )}
            {record.status === 'draft' && (
              <DropdownMenuItem onClick={() => handlePublishRFQ(record)}>
                <Send className="mr-2 h-4 w-4" />
                Publish RFQ
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  const RFQCard = ({ rfq }: { rfq: RFQ }) => {
    const items = rfq.items || []
    const suppliers = rfq.suppliers || []
    const responded = suppliers.filter(s => s.status === 'responded').length
    const responseRate = suppliers.length > 0 ? (responded / suppliers.length) * 100 : 0
    const isOverdue = rfqService.isOverdue(rfq)
    const daysUntil = rfqService.getDaysUntilDue(rfq)
    const totalAmount = items.reduce((sum, item) => sum + (item.target_price * item.quantity), 0)
    
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{rfq.rfq_number}</h3>
            <p className="text-sm text-gray-500">{rfqService.formatDate(rfq.created_at)}</p>
          </div>
          <div className="text-right">
            <Badge className={rfqService.getStatusColor(rfq.status)}>
              {rfq.status.replace('-', ' ').charAt(0).toUpperCase() + rfq.status.replace('-', ' ').slice(1)}
            </Badge>
            <div className="mt-1">
              <Badge className={rfqService.getPriorityColor(rfq.priority)}>
                {rfq.priority.charAt(0).toUpperCase() + rfq.priority.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="text-sm font-medium text-gray-900">
            {rfq.title}
          </div>
          
          <div className="text-sm text-gray-600">
            {rfq.description}
          </div>
          
          {totalAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Target Budget:</span>
              <span className="font-medium">
                {mounted ? rfqService.formatCurrency(totalAmount) : ''}
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-500">Items:</span>
            <span>{items.length} item(s)</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Suppliers:</span>
            <span className={responseRate === 100 ? 'text-green-600 font-medium' : responseRate > 50 ? 'text-yellow-600' : 'text-red-600'}>
              {responded}/{suppliers.length} ({responseRate.toFixed(0)}%)
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Request Date:</span>
            <span>{mounted ? rfqService.formatDate(rfq.created_at) : ''}</span>
          </div>
          
          {rfq.due_date && (
            <div className="flex justify-between">
              <span className="text-gray-500">Due Date:</span>
              <span className={isOverdue ? 'text-red-600 font-medium' : daysUntil !== null && daysUntil <= 3 ? 'text-yellow-600' : ''}>
                {mounted ? rfqService.formatDate(rfq.due_date) : ''}
              </span>
            </div>
          )}
          
          {rfq.published_at && (
            <div className="flex justify-between">
              <span className="text-gray-500">Published:</span>
              <span>{mounted ? rfqService.formatDate(rfq.published_at) : ''}</span>
            </div>
          )}
          
          {isOverdue && daysUntil !== null && (
            <div className="mt-2 p-2 bg-red-50 rounded text-xs">
              <span className="font-medium text-red-800">Overdue: </span>
              <span className="text-red-700">{Math.abs(daysUntil)} days past due date</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2 mt-4">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleViewDetails(rfq)}>
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          {rfq.status === 'draft' && (
            <Button size="sm" className="flex-1" onClick={() => handlePublishRFQ(rfq)}>
              <Send className="h-4 w-4 mr-1" />
              Publish
            </Button>
          )}
        </div>
      </Card>
    )
  }

  // Calculate additional statistics
  const totalRfqs = rfqs.length
  const totalValue = rfqs
    .filter(rfq => rfq.items && rfq.items.length > 0)
    .reduce((sum, rfq) => sum + (rfq.items?.reduce((itemSum, item) => itemSum + (item.target_price * item.quantity), 0) || 0), 0)

  return (
    <TwoLevelLayout>
      <Header 
        title="Request for Quotations (RFQ)"
        description="Manage RFQ processes and supplier quotations"
        breadcrumbs={breadcrumbs}
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New RFQ
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total RFQs</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total_rfqs}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.published_rfqs}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Send className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Closed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.closed_rfqs}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {mounted ? (totalValue / 1000000).toFixed(0) : ''}M
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search RFQs..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Workflow
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            {/* View Toggle */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <Button 
                variant={viewMode === 'cards' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                Cards
              </Button>
              <Button 
                variant={viewMode === 'table' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Error Loading RFQs</p>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={loadData}>
                Try Again
              </Button>
            </div>
          </div>
        ) : filteredRfqs.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No RFQs Found</p>
              <p className="text-gray-500 mb-4">Get started by creating your first RFQ.</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New RFQ
              </Button>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRfqs.map((rfq) => (
              <RFQCard key={rfq.id} rfq={rfq} />
            ))}
          </div>
        ) : (
          <DataTable
            data={filteredRfqs}
            columns={columns}
          />
        )}
      </div>
    </TwoLevelLayout>
  )
}