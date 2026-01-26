"use client"

import * as React from "react"
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  ArrowRightIcon,
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  Search01Icon,
  PlusSignIcon,
  PencilEdit01Icon,
  DeleteIcon,
  MoreHorizontalIcon,
  QrCodeIcon,
  BarCode01Icon
} from '@hugeicons/core-free-icons'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export interface Column<T> {
  key: keyof T
  title: string
  sortable?: boolean
  render?: (value: unknown, record: T) => React.ReactNode
  width?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  onSearch?: (value: string) => void
  onAdd?: () => void
  onEdit?: (record: T) => void
  onDelete?: (record: T) => void
  onBatchDelete?: (records: T[]) => void
  onBatchBarcode?: (records: T[]) => void
  onBatchQRCode?: (records: T[]) => void
  onGenerateBarcode?: (record: T) => void
  onGenerateQRCode?: (record: T) => void
  searchPlaceholder?: string
  addButtonText?: string
  className?: string
  batchSelection?: boolean
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  pagination,
  onSearch,
  onAdd,
  onEdit,
  onDelete,
  onBatchDelete,
  onBatchBarcode,
  onBatchQRCode,
  onGenerateBarcode,
  onGenerateQRCode,
  searchPlaceholder = "Search...",
  addButtonText = "Add New",
  className = "",
  batchSelection = false
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = React.useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    if (onSearch) {
      // Debounce search
      const timer = setTimeout(() => onSearch(value), 300)
      return () => clearTimeout(timer)
    }
  }

  const handlePageChange = (page: number) => {
    if (pagination?.onChange) {
      pagination.onChange(page, pagination.pageSize)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedIds(new Set(data.map(item => item.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds)
    if (checked) {
      newSelectedIds.add(id)
    } else {
      newSelectedIds.delete(id)
      setSelectAll(false)
    }
    setSelectedIds(newSelectedIds)
    
    // Update select all state
    if (newSelectedIds.size === data.length && data.length > 0) {
      setSelectAll(true)
    }
  }

  const handleBatchDelete = () => {
    if (onBatchDelete && selectedIds.size > 0) {
      const selectedRecords = data.filter(item => selectedIds.has(item.id))
      onBatchDelete(selectedRecords)
      setSelectedIds(new Set())
      setSelectAll(false)
    }
  }

  const selectedRecords = data.filter(item => selectedIds.has(item.id))

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1
  const currentPage = pagination?.current || 1

  if (loading) {
    return (
      <div className="w-full" role="status" aria-label="Loading data" aria-busy="true">
        <div className="rounded-md border">
          <div className="p-4">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1 animate-pulse" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1 animate-pulse" />
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <span className="sr-only">Loading table data...</span>
      </div>
    )
  }

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {batchSelection && selectedIds.size > 0 && (
            <div className="flex items-center space-x-2 mr-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                {onBatchDelete && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleBatchDelete}
                    className="flex items-center space-x-1"
                  >
                    <HugeiconsIcon icon={DeleteIcon} className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                )}
                {onBatchBarcode && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const selectedRecords = data.filter(item => selectedIds.has(item.id))
                      onBatchBarcode(selectedRecords)
                    }}
                    className="flex items-center space-x-1"
                  >
                    <HugeiconsIcon icon={BarCode01Icon} className="h-4 w-4" />
                    <span>Barcodes</span>
                  </Button>
                )}
                {onBatchQRCode && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const selectedRecords = data.filter(item => selectedIds.has(item.id))
                      onBatchQRCode(selectedRecords)
                    }}
                    className="flex items-center space-x-1"
                  >
                    <HugeiconsIcon icon={QrCodeIcon} className="h-4 w-4" />
                    <span>QR Codes</span>
                  </Button>
                )}
              </div>
            </div>
          )}
          {onSearch && (
            <div className="relative">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={handleSearchChange}
                className="pl-8 w-64 bg-white dark:bg-gray-900"
              />
            </div>
          )}
        </div>
        {onAdd && (
          <Button onClick={onAdd} className="flex items-center space-x-2">
            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" />
            <span>{addButtonText}</span>
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white dark:bg-gray-900 overflow-hidden" role="region" aria-label="Data table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <caption className="sr-only">Data table with row selection and actions</caption>
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                {batchSelection && (
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-white w-12">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all rows"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-white"
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.title}
                  </th>
                ))}
                {(onEdit || onDelete || onGenerateBarcode || onGenerateQRCode) && (
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-white w-20">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (batchSelection ? 1 : 0) + (onEdit || onDelete || onGenerateBarcode || onGenerateQRCode ? 1 : 0)}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                data.map((record) => (
                  <tr key={record.id} className="border-b bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800">
                    {batchSelection && (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedIds.has(record.id)}
                          onCheckedChange={(checked) => handleSelectItem(record.id, checked as boolean)}
                          aria-label={`Select row ${record.id}`}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={String(column.key)} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {column.render 
                          ? column.render(record[column.key], record)
                          : String(record[column.key] || '-')
                        }
                      </td>
                    ))}
                    {(onEdit || onDelete || onGenerateBarcode || onGenerateQRCode) && (
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="Actions menu">
                              <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                              <span className="sr-only">Open actions menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(record)}>
                                <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={() => onDelete(record)}
                                className="text-red-600"
                              >
                                <HugeiconsIcon icon={DeleteIcon} className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                            {(onGenerateBarcode || onGenerateQRCode) && onEdit && <DropdownMenuSeparator />}
                            {onGenerateBarcode && (
                              <DropdownMenuItem onClick={() => onGenerateBarcode(record)}>
                                <HugeiconsIcon icon={BarCode01Icon} className="mr-2 h-4 w-4" />
                                Generate Barcode
                              </DropdownMenuItem>
                            )}
                            {onGenerateQRCode && (
                              <DropdownMenuItem onClick={() => onGenerateQRCode(record)}>
                                <HugeiconsIcon icon={QrCodeIcon} className="mr-2 h-4 w-4" />
                                Generate QR Code
                              </DropdownMenuItem>
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
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {Math.min((currentPage - 1) * pagination.pageSize + 1, pagination.total)} to{' '}
            {Math.min(currentPage * pagination.pageSize, pagination.total)} of {pagination.total} entries
          </div>
          <nav className="flex items-center space-x-2" aria-label="Pagination">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              aria-label="Go to first page"
            >
              <HugeiconsIcon icon={ArrowLeftDoubleIcon} className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Go to previous page"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
            </Button>
            <span className="text-sm" aria-current="page" aria-live="polite" aria-atomic="true">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Go to next page"
            >
              <HugeiconsIcon icon={ArrowRightIcon} className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Go to last page"
            >
              <HugeiconsIcon icon={ArrowRightDoubleIcon} className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      )}
    </div>
  )
}