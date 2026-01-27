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
} from "@hugeicons/core-free-icons"

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

interface AdvancedDataTableProps<T> {
  data: T[]
  columns: AdvancedColumn<T>[]
  loading?: boolean
  pageSize?: number
  onEdit?: (record: T) => void
  onDelete?: (record: T) => void
  rowSelection?: boolean
  showToolbar?: boolean
}

export function AdvancedDataTable<T extends { id: string }>({
  data,
  columns: legacyColumns,
  loading = false,
  pageSize = 10,
  onEdit,
  onDelete,
  rowSelection = false,
  showToolbar = false,
}: AdvancedDataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelectionState, setRowSelectionState] = React.useState({})

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
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                {col.title}
                {column.getIsSorted() === "asc" ? (
                  <HugeiconsIcon icon={ArrowUp01Icon} className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <HugeiconsIcon icon={ArrowDown01Icon} className="ml-2 h-4 w-4" />
                ) : null}
              </Button>
            )
          },
          cell: ({ row, getValue }) => {
            if (col.render) {
              return col.render(getValue(), row.original)
            }
            const value = getValue()
            return <span className="text-sm">{value != null ? String(value) : "-"}</span>
          },
          enableSorting: col.sortable ?? false,
          size: col.width ? parseInt(col.width) : undefined,
        })
      })

    // Add actions column if needed
    if (onEdit || onDelete) {
      tanstackColumns.push({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Row actions">
                <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  Edit
                </DropdownMenuItem>
              )}
              {onEdit && onDelete && <DropdownMenuSeparator />}
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
  }, [legacyColumns, rowSelection, onEdit, onDelete])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelectionState,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: rowSelectionState,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-100 dark:bg-zinc-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
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
                    className={`hover:bg-muted/50 transition-colors ${
                      row.getIsSelected() ? "bg-muted" : ""
                    }`}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
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
              {table.getFilteredRowModel().rows.length} row(s) selected
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
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} results
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
