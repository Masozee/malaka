"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUp01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  MoreVerticalIcon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Legacy interface for backward compatibility
export interface AdvancedColumn<T> {
  key: keyof T
  title: string
  sortable?: boolean
  searchable?: boolean
  hidden?: boolean
  width?: string
  render?: (value: unknown, record: T) => React.ReactNode
  filterType?: 'select' | 'date' | 'number'
  filterOptions?: { value: string; label: string }[]
}

export interface PaginationProps {
  current: number
  pageSize: number
  total: number
  onChange: (page: number, pageSize: number) => void
}

export interface RowAction<T> {
  label: string
  icon?: React.ReactNode
  onClick: (record: T) => void
  className?: string
  separator?: boolean
  disabled?: (record: T) => boolean
  hidden?: (record: T) => boolean
}

interface AdvancedDataTableProps<T> {
  data: T[]
  columns: AdvancedColumn<T>[]
  loading?: boolean
  pageSize?: number
  onEdit?: (record: T) => void
  onDelete?: (record: T) => void
  rowActions?: RowAction<T>[]
  rowSelection?: boolean
  showToolbar?: boolean
  pagination?: PaginationProps
  onAdd?: () => void
  addButtonText?: string
  onSearch?: (filters: any) => void
  searchPlaceholder?: string
  onBulkAction?: (action: string, ids: string[]) => void
  bulkActions?: { value: string; label: string; variant?: string }[]
  exportEnabled?: boolean
}

export function AdvancedDataTable<T extends { id: string }>({
  data,
  columns: legacyColumns,
  loading = false,
  pageSize = 10,
  onEdit,
  onDelete,
  rowActions,
  rowSelection = false,
  showToolbar = false,
  pagination,
  onAdd,
  addButtonText = "Add New",
  onSearch,
  searchPlaceholder = "Search...",
  onBulkAction,
  bulkActions,
  exportEnabled,
}: AdvancedDataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelectionState, setRowSelectionState] = React.useState({})
  const [searchValue, setSearchValue] = React.useState("")

  // Convert legacy columns to TanStack columns
  const columns: ColumnDef<T>[] = React.useMemo(() => {
    const tanstackColumns: ColumnDef<T>[] = []

    // Add selection column if enabled
    if (rowSelection) {
      tanstackColumns.push({
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
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      })
    }

    // Convert legacy columns
    legacyColumns
      .filter((col) => !col.hidden)
      .forEach((col) => {
        tanstackColumns.push({
          id: String(col.key),
          accessorKey: col.key as string,
          header: ({ column }) => {
            if (!col.sortable) {
              return <span>{col.title}</span>
            }
            return (
              <button
                className="inline-flex items-center -ml-1 h-8 font-semibold hover:text-gray-900 dark:hover:text-gray-200"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                {col.title}
                {column.getIsSorted() === "asc" ? (
                  <HugeiconsIcon icon={ArrowUp01Icon} className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <HugeiconsIcon icon={ArrowDown01Icon} className="ml-2 h-4 w-4" />
                ) : null}
              </button>
            )
          },
          cell: ({ row, getValue }) => {
            if (col.render) {
              return col.render(getValue(), row.original)
            }
            const value = getValue()
            return <span>{value != null ? String(value) : "-"}</span>
          },
          enableSorting: col.sortable ?? false,
          size: col.width ? parseInt(col.width) : undefined,
        })
      })

    // Add actions column if needed
    if (onEdit || onDelete || (rowActions && rowActions.length > 0)) {
      tanstackColumns.push({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" aria-label="Row actions">
                <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  Edit
                </DropdownMenuItem>
              )}
              {rowActions && rowActions.map((action, idx) => {
                if (action.hidden?.(row.original)) return null
                const isDisabled = action.disabled?.(row.original) ?? false
                return (
                  <React.Fragment key={idx}>
                    {action.separator && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={() => !isDisabled && action.onClick(row.original)}
                      className={cn(
                        action.className,
                        isDisabled && 'opacity-50 cursor-not-allowed'
                      )}
                      disabled={isDisabled}
                    >
                      {action.icon}
                      {action.label}
                    </DropdownMenuItem>
                  </React.Fragment>
                )
              })}
              {(onEdit || (rowActions && rowActions.length > 0)) && onDelete && <DropdownMenuSeparator />}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(row.original)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 60,
      })
    }

    return tanstackColumns
  }, [legacyColumns, rowSelection, onEdit, onDelete, rowActions])

  const [internalPagination, setInternalPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  })

  const table = useReactTable({
    data,
    columns,
    rowCount: pagination?.total,
    manualPagination: !!pagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelectionState,
    onPaginationChange: pagination
      ? (updater) => {
          if (typeof updater === 'function') {
            const newState = updater({
              pageIndex: pagination.current - 1,
              pageSize: pagination.pageSize,
            })
            pagination.onChange(newState.pageIndex + 1, newState.pageSize)
          } else {
            pagination.onChange(updater.pageIndex + 1, updater.pageSize)
          }
        }
      : setInternalPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: rowSelectionState,
      pagination: pagination
        ? { pageIndex: pagination.current - 1, pageSize: pagination.pageSize }
        : internalPagination,
    },
  })

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchValue(value)
    if (onSearch) {
      onSearch({ search: value })
    }
  }, [onSearch])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {(onAdd || onSearch) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {onSearch && (
              <div className="relative">
                <HugeiconsIcon icon={Search01Icon} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-8 w-64 bg-white dark:bg-gray-900"
                />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onAdd && (
              <Button onClick={onAdd}>
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-1" />
                {addButtonText}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 dark:bg-gray-700">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <th
                      key={header.id}
                      className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-white ${index === 0 ? 'rounded-tl-sm' : ''
                        } ${index === headerGroup.headers.length - 1 ? 'rounded-tr-sm' : ''
                        }`}
                      style={{
                        width: header.getSize() !== 150 ? header.getSize() : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-muted/50 transition-colors ${row.getIsSelected() ? "bg-muted" : ""
                      }`}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2.5 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span className="mr-4">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getRowCount()} row(s) selected
            </span>
          )}
          <span>
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
              table.getRowCount()
            )}{" "}
            of {table.getRowCount()} results
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
