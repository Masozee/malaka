"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { DataTable, Column } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { ColorForm } from "@/components/forms/color-form"
import { useToast, toast } from "@/components/ui/toast"
import { colorService } from "@/services/masterdata"
import { Color, MasterDataFilters } from "@/types/masterdata"
import { Search, Palette, BarChart3, CheckCircle, AlertCircle } from "lucide-react"

export default function ColorsPage() {
  const [mounted, setMounted] = React.useState(false)
  const [colors, setColors] = React.useState<Color[]>([])
  const [loading, setLoading] = React.useState(true)
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [formOpen, setFormOpen] = React.useState(false)
  const [selectedColor, setSelectedColor] = React.useState<Color | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [sortBy, setSortBy] = React.useState<string>('name')
  const { addToast } = useToast()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const columns: Column<Color>[] = [
    {
      key: 'code',
      title: 'Color Code',
      sortable: true,
      width: '120px'
    },
    {
      key: 'name',
      title: 'Color Name',
      sortable: true,
    },
    {
      key: 'hex_code',
      title: 'Color Preview',
      render: (hexCode: unknown, color: Color) => {
        const hexStr = hexCode as string
        const isValidHex = hexStr && /^#[0-9A-F]{6}$/i.test(hexStr)
        
        return (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div 
                className="w-8 h-8 rounded-lg border-2 border-gray-200 shadow-sm flex-shrink-0 transition-transform hover:scale-110"
                style={{ 
                  backgroundColor: isValidHex ? hexStr : '#f3f4f6',
                  borderColor: isValidHex ? hexStr : '#d1d5db'
                }}
                title={`${color.name} - ${hexStr || 'No hex code'}`}
              />
              {!isValidHex && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {hexStr || 'N/A'}
              </span>
              {isValidHex && (
                <span className="text-xs text-gray-500">
                  RGB: {(() => {
                    const r = parseInt(hexStr.slice(1, 3), 16)
                    const g = parseInt(hexStr.slice(3, 5), 16)
                    const b = parseInt(hexStr.slice(5, 7), 16)
                    return `${r}, ${g}, ${b}`
                  })()}
                </span>
              )}
            </div>
          </div>
        )
      },
      width: '200px'
    },
    {
      key: 'description',
      title: 'Description',
      render: (description: unknown) => (description as string) || '-',
      width: '200px'
    },
    {
      key: 'status',
      title: 'Status',
      render: (status: unknown) => {
        const statusStr = status as string
        return (
          <Badge variant={statusStr === 'active' ? 'default' : 'secondary'}>
            {statusStr}
          </Badge>
        )
      }
    },
    {
      key: 'created_at',
      title: 'Created At',
      render: (date: unknown) => mounted ? new Date(date as string).toLocaleDateString('id-ID') : '',
      width: '120px'
    }
  ]

  const fetchColors = React.useCallback(async (filters?: MasterDataFilters) => {
    try {
      setLoading(true)
      const response = await colorService.getAll(filters)
      setColors(response.data)
      setPagination(prev => ({
        ...prev,
        total: response.total
      }))
    } catch (error) {
      console.error('Error fetching colors:', error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchColors({
      page: pagination.current,
      limit: pagination.pageSize
    })
  }, [pagination.current, pagination.pageSize, fetchColors])

  const handleSearch = React.useCallback((search: string) => {
    setSearchTerm(search)
    fetchColors({
      search,
      page: 1,
      limit: pagination.pageSize
    })
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [pagination.pageSize, fetchColors])

  const handlePageChange = React.useCallback((page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }, [])

  const handleAdd = () => {
    setSelectedColor(null)
    setFormOpen(true)
  }

  const handleEdit = (color: Color) => {
    setSelectedColor(color)
    setFormOpen(true)
  }

  const handleFormSuccess = () => {
    // Refresh the list after successful create/update
    fetchColors({
      page: pagination.current,
      limit: pagination.pageSize
    })
  }

  const handleDelete = async (color: Color) => {
    if (confirm(`Are you sure you want to delete "${color.name}"?`)) {
      try {
        await colorService.delete(color.id)
        // Refresh the list
        fetchColors({
          page: pagination.current,
          limit: pagination.pageSize
        })
        addToast(toast.success("Color deleted successfully", `${color.name} has been removed.`))
      } catch (error) {
        console.error('Error deleting color:', error)
        addToast(toast.error("Failed to delete color", "Please try again later."))
      }
    }
  }

  // Filter and sort colors locally for display
  const filteredColors = React.useMemo(() => {
    let filtered = colors

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(color => color.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'code':
          return a.code.localeCompare(b.code)
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [colors, statusFilter, sortBy])

  // Summary statistics
  const summaryStats = React.useMemo(() => {
    return {
      totalColors: colors.length,
      activeColors: colors.filter(c => c.status === 'active').length,
      withHexCode: colors.filter(c => c.hex_code).length,
      recentlyAdded: colors.filter(c => {
        const createdDate = new Date(c.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return createdDate > weekAgo
      }).length
    }
  }, [colors])

  return (
    <TwoLevelLayout>
      <Header 
        title="Colors"
        description="Manage color variants and specifications"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data", href: "/master-data" },
          { label: "Colors" }
        ]}
        actions={
          <Button onClick={handleAdd}>
            Add Color
          </Button>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Palette className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Colors</p>
                <p className="text-2xl font-bold">{mounted ? summaryStats.totalColors : ''}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{mounted ? summaryStats.activeColors : ''}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">With Hex Code</p>
                <p className="text-2xl font-bold">{mounted ? summaryStats.withHexCode : ''}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recently Added</p>
                <p className="text-2xl font-bold">{mounted ? summaryStats.recentlyAdded : ''}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search colors..."
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
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <CheckCircle className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <BarChart3 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="created_at">Created</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <DataTable
          data={filteredColors}
          columns={[
            ...columns,
            {
              key: 'actions',
              title: 'Actions',
              width: '120px',
              render: (_, color: Color) => (
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEdit(color)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDelete(color)}
                  >
                    Delete
                  </Button>
                </div>
              )
            }
          ]}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handlePageChange
          }}
        />

        {/* Forms and Dialogs */}
        <ColorForm
          open={formOpen}
          onOpenChange={setFormOpen}
          color={selectedColor}
          onSuccess={handleFormSuccess}
        />
      </div>
    </TwoLevelLayout>
  )
}