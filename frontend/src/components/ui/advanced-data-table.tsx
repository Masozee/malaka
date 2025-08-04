"use client"

import * as React from "react"
import { Search, Filter, Download, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { MasterDataFilters } from "@/types/masterdata"

interface FilterOption {
  value: string
  label: string
}

interface BulkAction {
  value: string
  label: string
  variant?: 'default' | 'secondary' | 'destructive'
}

export interface AdvancedColumn<T> {
  key: keyof T
  title: string
  sortable?: boolean
  searchable?: boolean
  hidden?: boolean
  width?: string
  render?: (value: unknown, record: T) => React.ReactNode
  filterType?: 'select' | 'date' | 'number'
  filterOptions?: FilterOption[]
}

interface AdvancedDataTableProps<T> {
  data: T[]
  columns: AdvancedColumn<T>[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  onSearch?: (filters: MasterDataFilters) => void
  onAdd?: () => void
  onEdit?: (record: T) => void
  onDelete?: (record: T) => void
  onBulkAction?: (action: string, selectedIds: string[]) => void
  bulkActions?: BulkAction[]
  searchPlaceholder?: string
  addButtonText?: string
  exportEnabled?: boolean
  rowSelection?: boolean
}

export function AdvancedDataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  pagination,
  onSearch,
  onAdd,
  onEdit,
  onDelete,
  onBulkAction,
  bulkActions = [],
  searchPlaceholder = "Search...",
  addButtonText = "Add New",
  exportEnabled = false,
  rowSelection = false
}: AdvancedDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [sortField, setSortField] = React.useState<keyof T | null>(null)
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = React.useState<Record<string, string>>({})
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set())
  const [filterOpen, setFilterOpen] = React.useState(false)

  // Get visible columns (non-hidden)
  const visibleColumns = columns.filter(col => !col.hidden)

  // Handle search
  const handleSearch = React.useCallback(() => {
    const searchFilters: MasterDataFilters = {
      search: searchTerm,
      sortBy: sortField as string,
      sortOrder,
      ...filters,
      page: 1
    }
    onSearch?.(searchFilters)
  }, [searchTerm, sortField, sortOrder, filters, onSearch])

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        handleSearch()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, handleSearch])

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters }
    if (value && value !== 'all') {
      newFilters[key] = value
    } else {
      delete newFilters[key]
    }
    setFilters(newFilters)
  }

  // Apply filters
  React.useEffect(() => {
    handleSearch()
  }, [filters, sortField, sortOrder])

  // Handle sorting
  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Row selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map(item => item.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedRows(newSelected)
  }

  const handleBulkAction = (action: string) => {
    if (selectedRows.size > 0) {
      onBulkAction?.(action, Array.from(selectedRows))
      setSelectedRows(new Set())
    }
  }

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      // Header
      visibleColumns.map(col => col.title).join(','),
      // Data rows
      ...data.map(row => 
        visibleColumns.map(col => {
          const value = row[col.key]
          return `"${String(value || '').replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const activeFiltersCount = Object.keys(filters).length
  const allSelected = data.length > 0 && selectedRows.size === data.length
  const someSelected = selectedRows.size > 0 && selectedRows.size < data.length

  return (
    <div className="space-y-4">
      {/* Header with Search and Actions */}
      <div className="flex items-center justify-between space-x-4">
        {/* Search */}
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filters */}
          <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Filter Options</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {columns
                  .filter(col => col.filterType && col.filterOptions)
                  .map(col => (
                    <div key={String(col.key)} className="space-y-2">
                      <label className="text-sm font-medium">{col.title}</label>
                      <Select 
                        value={filters[String(col.key)] || ""} 
                        onValueChange={(value) => handleFilterChange(String(col.key), value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`All ${col.title}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All {col.title}</SelectItem>
                          {col.filterOptions?.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFilters({})}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Bulk Actions */}
          {rowSelection && selectedRows.size > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {selectedRows.size} selected
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {bulkActions.map(action => (
                  <DropdownMenuItem 
                    key={action.value}
                    onClick={() => handleBulkAction(action.value)}
                    className={action.variant === 'destructive' ? 'text-red-600' : ''}
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Export */}
          {exportEnabled && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          
          {/* Add Button */}
          {onAdd && (
            <Button onClick={onAdd} size="sm">
              {addButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {/* Row Selection */}
                {rowSelection && (
                  <th className="w-12 px-4 py-3">
                    <Checkbox
                      checked={allSelected || someSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                )}
                
                {/* Column Headers */}
                {visibleColumns.map(column => (
                  <th 
                    key={String(column.key)}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''
                    }`}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.title}</span>
                      {column.sortable && sortField === column.key && (
                        <span className="text-gray-400">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                
                {/* Actions */}
                {(onEdit || onDelete) && (
                  <th className="w-20 px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td 
                    colSpan={visibleColumns.length + (rowSelection ? 1 : 0) + ((onEdit || onDelete) ? 1 : 0)}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td 
                    colSpan={visibleColumns.length + (rowSelection ? 1 : 0) + ((onEdit || onDelete) ? 1 : 0)}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr 
                    key={row.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      selectedRows.has(row.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    {/* Row Selection */}
                    {rowSelection && (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedRows.has(row.id)}
                          onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                        />
                      </td>
                    )}
                    
                    {/* Data Cells */}
                    {visibleColumns.map(column => (
                      <td key={String(column.key)} className="px-4 py-3 text-sm">
                        {column.render 
                          ? column.render(row[column.key], row)
                          : String(row[column.key] || '-')
                        }
                      </td>
                    ))}
                    
                    {/* Actions */}
                    {(onEdit || onDelete) && (
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(row)}>
                                Edit
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => onDelete(row)}
                                  className="text-red-600"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>
              Showing {((pagination.current - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} results
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select 
              value={pagination.pageSize.toString()} 
              onValueChange={(value) => pagination.onChange(1, parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              disabled={pagination.current <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-gray-500">
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}