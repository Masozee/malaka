"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  PaintBrushIcon,
  ChartColumnIcon,
  CheckmarkCircle01Icon
} from "@hugeicons/core-free-icons"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { TanStackDataTable, TanStackColumn } from "@/components/ui/tanstack-data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { ColorForm } from "@/components/forms/color-form"
import { useToast, toast } from "@/components/ui/toast"
import { useColors, useDeleteColor } from "@/hooks/queries"
import { Color } from "@/types/masterdata"

export default function ColorsPage() {
  const [mounted, setMounted] = React.useState(false)
  const [formOpen, setFormOpen] = React.useState(false)
  const [selectedColor, setSelectedColor] = React.useState<Color | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [page, setPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const { addToast } = useToast()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // TanStack Query for fetching colors
  const {
    data: colorsData,
    isLoading,
    isFetching,
  } = useColors({
    page,
    limit: pageSize,
    search: searchTerm || undefined,
  })

  // TanStack Mutation for deleting colors
  const deleteColorMutation = useDeleteColor()

  // Extract data from query response
  const colors = colorsData?.data || []
  const total = colorsData?.total || 0

  // TanStack Table columns
  const columns: TanStackColumn<Color>[] = React.useMemo(
    () => [
      {
        id: 'code',
        header: 'Color Code',
        accessorKey: 'code',
        enableSorting: true,
        size: 120,
      },
      {
        id: 'name',
        header: 'Color Name',
        accessorKey: 'name',
        enableSorting: true,
      },
      {
        id: 'hex_code',
        header: 'Color Preview',
        accessorKey: 'hex_code',
        cell: ({ getValue, row }) => {
          const hexCode = getValue() as string
          const color = row.original
          const isValidHex = hexCode && /^#[0-9A-F]{6}$/i.test(hexCode)

          return (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-lg border-2 border-gray-200 flex-shrink-0 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: isValidHex ? hexCode : '#f3f4f6',
                    borderColor: isValidHex ? hexCode : '#d1d5db',
                  }}
                  title={`${color.name} - ${hexCode || 'No hex code'}`}
                />
                {!isValidHex && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {hexCode || 'N/A'}
                </span>
                {isValidHex && (
                  <span className="text-xs text-gray-500">
                    RGB:{' '}
                    {(() => {
                      const r = parseInt(hexCode.slice(1, 3), 16)
                      const g = parseInt(hexCode.slice(3, 5), 16)
                      const b = parseInt(hexCode.slice(5, 7), 16)
                      return `${r}, ${g}, ${b}`
                    })()}
                  </span>
                )}
              </div>
            </div>
          )
        },
        size: 200,
      },
      {
        id: 'description',
        header: 'Description',
        accessorKey: 'description',
        cell: ({ getValue }) => (getValue() as string) || '-',
        size: 200,
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const status = getValue() as string
          return (
            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
              {status}
            </Badge>
          )
        },
      },
      {
        id: 'created_at',
        header: 'Created At',
        accessorKey: 'created_at',
        cell: ({ getValue }) =>
          mounted ? new Date(getValue() as string).toLocaleDateString('id-ID') : '',
        size: 120,
      },
    ],
    [mounted]
  )

  // Filter colors by status locally
  const filteredColors = React.useMemo(() => {
    if (statusFilter === 'all') return colors
    return colors.filter((color) => color.status === statusFilter)
  }, [colors, statusFilter])

  // Summary statistics
  const summaryStats = React.useMemo(() => {
    return {
      totalColors: colors.length,
      activeColors: colors.filter((c) => c.status === 'active').length,
      withHexCode: colors.filter((c) => c.hex_code).length,
      recentlyAdded: colors.filter((c) => {
        const createdDate = new Date(c.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return createdDate > weekAgo
      }).length,
    }
  }, [colors])

  const handleAdd = () => {
    setSelectedColor(null)
    setFormOpen(true)
  }

  const handleEdit = (color: Color) => {
    setSelectedColor(color)
    setFormOpen(true)
  }

  const handleDelete = async (color: Color) => {
    if (confirm(`Are you sure you want to delete "${color.name}"?`)) {
      try {
        await deleteColorMutation.mutateAsync(color.id)
        addToast(toast.success('Color deleted successfully', `${color.name} has been removed.`))
      } catch (error) {
        console.error('Error deleting color:', error)
        addToast(toast.error('Failed to delete color', 'Please try again later.'))
      }
    }
  }

  const handleFormSuccess = () => {
    // Query will be automatically invalidated by mutations
  }

  const handleSearch = React.useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1) // Reset to first page on search
  }, [])

  const handlePageChange = React.useCallback((pageIndex: number) => {
    setPage(pageIndex + 1)
  }, [])

  return (
    <TwoLevelLayout>
      <Header
        title="Colors"
        description="Manage color variants and specifications"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Master Data', href: '/master-data' },
          { label: 'Colors' },
        ]}
        actions={<Button onClick={handleAdd}>Add Color</Button>}
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={PaintBrushIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Colors</p>
                <p className="text-2xl font-bold">{mounted ? summaryStats.totalColors : ''}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{mounted ? summaryStats.activeColors : ''}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <div className="h-5 w-5 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-full" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">With Hex Code</p>
                <p className="text-2xl font-bold">{mounted ? summaryStats.withHexCode : ''}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={ChartColumnIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recently Added</p>
                <p className="text-2xl font-bold">{mounted ? summaryStats.recentlyAdded : ''}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                const start = (page - 1) * pageSize + 1
                const end = Math.min(page * pageSize, total)
                return `${start}-${end} of ${total} items`
              })()}
              {isFetching && !isLoading && (
                <span className="ml-2 text-blue-500">(updating...)</span>
              )}
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* TanStack Data Table */}
        <TanStackDataTable
          data={filteredColors}
          columns={columns}
          loading={isLoading}
          pagination={{
            pageIndex: page - 1,
            pageSize,
            totalRows: total,
            onPageChange: handlePageChange,
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
