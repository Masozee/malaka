"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRightIcon,
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Search01Icon,
  PlusSignIcon,
  PencilEdit01Icon,
  DeleteIcon,
  MoreHorizontalIcon,
  QrCodeIcon,
  BarCode01Icon,
  SettingsIcon,
  type IconSvgElement,
} from "@hugeicons/core-free-icons"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  ColumnDef,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

/**
 * TanStack Data Table
 *
 * Enhanced data table with TanStack Table v8 features:
 * - Column sorting (click headers to sort)
 * - Column visibility toggle
 * - Row selection with batch actions
 * - Pagination (local or server-side)
 * - Global search filter
 */

export interface TanStackColumn<T> {
  id: string
  header: string
  accessorKey?: keyof T
  accessorFn?: (row: T) => unknown
  cell?: (info: { getValue: () => unknown; row: { original: T } }) => React.ReactNode
  enableSorting?: boolean
  enableHiding?: boolean
  size?: number
}

export interface CustomAction<T> {
  label: string
  icon?: IconSvgElement
  onClick: (record: T) => void | Promise<void>
  className?: string
  separator?: boolean
}

export interface TanStackDataTableProps<T> {
  data: T[]
  columns: TanStackColumn<T>[]
  loading?: boolean

  // Pagination (server-side)
  pagination?: {
    pageIndex: number
    pageSize: number
    totalRows: number
    onPageChange: (pageIndex: number) => void
    onPageSizeChange?: (pageSize: number) => void
  }

  // Search
  onSearch?: (value: string) => void
  searchPlaceholder?: string
  searchValue?: string

  // Add button
  onAdd?: () => void
  addButtonText?: string

  // Row actions
  onEdit?: (record: T) => void
  onDelete?: (record: T) => void
  onGenerateBarcode?: (record: T) => void
  onGenerateQRCode?: (record: T) => void
  customActions?: CustomAction<T>[]

  // Batch actions
  enableRowSelection?: boolean
  onBatchDelete?: (records: T[]) => void
  onBatchBarcode?: (records: T[]) => void
  onBatchQRCode?: (records: T[]) => void

  // Customization
  className?: string
  getRowId?: (row: T) => string
}

export function TanStackDataTable<T extends { id: string }>({
  data,
  columns: columnDefs,
  loading = false,
  pagination,
  onSearch,
  searchPlaceholder = "Search...",
  searchValue = "",
  onAdd,
  addButtonText = "Add New",
  onEdit,
  onDelete,
  onGenerateBarcode,
  onGenerateQRCode,
  customActions,
  enableRowSelection = false,
  onBatchDelete,
  onBatchBarcode,
  onBatchQRCode,
  className = "",
  getRowId = (row) => row.id,
}: TanStackDataTableProps<T>) {
  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = React.useState(searchValue)

  // Sync external search value
  React.useEffect(() => {
    setGlobalFilter(searchValue)
  }, [searchValue])

  // Build TanStack Table columns
  const columns = React.useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = []

    // Selection column
    if (enableRowSelection) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select row ${row.original.id}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      })
    }

    // Data columns
    columnDefs.forEach((col) => {
      cols.push({
        id: col.id,
        accessorKey: col.accessorKey as string,
        accessorFn: col.accessorFn,
        header: ({ column }) => {
          const canSort = col.enableSorting !== false
          if (!canSort) return col.header

          const sortState = column.getIsSorted()
          return (
            <button
              className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 dark:text-white dark:hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 rounded"
              onClick={() => column.toggleSorting()}
              aria-label={`Sort by ${col.header}${sortState ? `, currently sorted ${sortState}ending` : ''}`}
            >
              <span>{col.header}</span>
              {sortState === "asc" && <HugeiconsIcon icon={ArrowUpIcon} className="h-4 w-4" />}
              {sortState === "desc" && <HugeiconsIcon icon={ArrowDownIcon} className="h-4 w-4" />}
            </button>
          )
        },
        cell: col.cell
          ? (info) =>
              col.cell!({
                getValue: info.getValue,
                row: { original: info.row.original },
              })
          : (info) => {
              const value = info.getValue()
              return value != null ? String(value) : "-"
            },
        enableSorting: col.enableSorting !== false,
        enableHiding: col.enableHiding !== false,
        size: col.size,
      })
    })

    // Actions column
    if (onEdit || onDelete || onGenerateBarcode || onGenerateQRCode || (customActions && customActions.length > 0)) {
      cols.push({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const record = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
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
                {(onGenerateBarcode || onGenerateQRCode) && (onEdit || onDelete) && (
                  <DropdownMenuSeparator />
                )}
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
                {customActions && customActions.length > 0 && (
                  <>
                    {(onEdit || onDelete || onGenerateBarcode || onGenerateQRCode) && (
                      <DropdownMenuSeparator />
                    )}
                    {customActions.map((action, index) => (
                      <React.Fragment key={action.label}>
                        {action.separator && index > 0 && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                          onClick={() => action.onClick(record)}
                          className={action.className}
                        >
                          {action.icon && (
                            <HugeiconsIcon icon={action.icon} className="mr-2 h-4 w-4" />
                          )}
                          {action.label}
                        </DropdownMenuItem>
                      </React.Fragment>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        enableSorting: false,
        enableHiding: false,
        size: 60,
      })
    }

    return cols
  }, [columnDefs, enableRowSelection, onEdit, onDelete, onGenerateBarcode, onGenerateQRCode, customActions])

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      ...(pagination && {
        pagination: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        },
      }),
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: pagination ? undefined : getPaginationRowModel(),
    getRowId,
    manualPagination: Boolean(pagination),
    pageCount: pagination
      ? Math.ceil(pagination.totalRows / pagination.pageSize)
      : undefined,
  })

  // Get selected rows
  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original)

  // Handle search with debounce
  const handleSearchChange = React.useCallback(
    (value: string) => {
      setGlobalFilter(value)
      if (onSearch) {
        onSearch(value)
      }
    },
    [onSearch]
  )

  // Pagination helpers
  const currentPage = pagination ? pagination.pageIndex + 1 : table.getState().pagination.pageIndex + 1
  const totalPages = pagination
    ? Math.ceil(pagination.totalRows / pagination.pageSize)
    : table.getPageCount()
  const pageSize = pagination?.pageSize || table.getState().pagination.pageSize
  const totalRows = pagination?.totalRows || data.length

  const handlePageChange = (pageIndex: number) => {
    if (pagination) {
      pagination.onPageChange(pageIndex)
    } else {
      table.setPageIndex(pageIndex)
    }
  }

  // Loading state
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
          {/* Batch actions */}
          {enableRowSelection && selectedRows.length > 0 && (
            <div className="flex items-center space-x-2 mr-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedRows.length} item{selectedRows.length !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center space-x-2">
                {onBatchDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      onBatchDelete(selectedRows)
                      setRowSelection({})
                    }}
                  >
                    <HugeiconsIcon icon={DeleteIcon} className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
                {onBatchBarcode && (
                  <Button variant="outline" size="sm" onClick={() => onBatchBarcode(selectedRows)}>
                    <HugeiconsIcon icon={BarCode01Icon} className="h-4 w-4 mr-1" />
                    Barcodes
                  </Button>
                )}
                {onBatchQRCode && (
                  <Button variant="outline" size="sm" onClick={() => onBatchQRCode(selectedRows)}>
                    <HugeiconsIcon icon={QrCodeIcon} className="h-4 w-4 mr-1" />
                    QR Codes
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Search */}
          {onSearch && (
            <div className="relative">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8 w-64 bg-white dark:bg-gray-900"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <HugeiconsIcon icon={SettingsIcon} className="h-4 w-4 mr-1" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add button */}
          {onAdd && (
            <Button onClick={onAdd}>
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-1" />
              {addButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white dark:bg-gray-900 overflow-hidden" role="region" aria-label="Data table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <caption className="sr-only">Data table with sortable columns and row actions</caption>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gray-200 dark:bg-gray-700">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-white"
                      style={
                        header.column.getSize() !== 150
                          ? { width: header.column.getSize() }
                          : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalRows)} to{" "}
          {Math.min(currentPage * pageSize, totalRows)} of {totalRows} entries
        </div>
        <nav className="flex items-center space-x-2" aria-label="Pagination">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(0)}
            disabled={currentPage === 1}
            aria-label="Go to first page"
          >
            <HugeiconsIcon icon={ArrowLeftDoubleIcon} className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 2)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <span className="text-sm" aria-live="polite" aria-atomic="true">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            <HugeiconsIcon icon={ArrowRightIcon} className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages - 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to last page"
          >
            <HugeiconsIcon icon={ArrowRightDoubleIcon} className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </div>
  )
}
