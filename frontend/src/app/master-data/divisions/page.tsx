"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { AdvancedDataTable } from "@/components/ui/advanced-data-table"
import { Badge } from "@/components/ui/badge"
import { DivisionForm } from "@/components/forms/division-form"
import { useToast, toast } from "@/components/ui/toast"
import { divisionService } from "@/services/masterdata"
import { Division, MasterDataFilters } from "@/types/masterdata"

export default function DivisionsPage() {
  const [mounted, setMounted] = React.useState(false)
  const [divisions, setDivisions] = React.useState<Division[]>([])
  const [loading, setLoading] = React.useState(true)
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [formOpen, setFormOpen] = React.useState(false)
  const [selectedDivision, setSelectedDivision] = React.useState<Division | null>(null)
  const { addToast } = useToast()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Define table columns
  const columns = [
    {
      key: 'code' as keyof Division,
      title: 'Code',
      sortable: true,
      searchable: true,
      width: '100px'
    },
    {
      key: 'name' as keyof Division,
      title: 'Name',
      sortable: true,
      searchable: true,
      width: '200px'
    },
    {
      key: 'description' as keyof Division,
      title: 'Description',
      render: (description: unknown) => (description as string) || '-',
    },
    {
      key: 'parent_id' as keyof Division,
      title: 'Parent Division',
      render: (parentId: unknown) => {
        const parent = divisions.find(d => d.id === parentId)
        return parent?.name || '-'
      },
      filterType: 'select' as const,
      filterOptions: divisions.map(division => ({
        value: division.id,
        label: division.name
      }))
    },
    {
      key: 'level' as keyof Division,
      title: 'Level',
      sortable: true,
      width: '80px'
    },
    {
      key: 'sort_order' as keyof Division,
      title: 'Sort Order',
      sortable: true,
      width: '100px'
    },
    {
      key: 'status' as keyof Division,
      title: 'Status',
      render: (status: unknown) => {
        const statusStr = status as string
        return (
          <Badge variant={statusStr === 'active' ? 'default' : 'secondary'}>
            {statusStr}
          </Badge>
        )
      },
      filterType: 'select' as const,
      filterOptions: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ],
      width: '100px'
    },
    {
      key: 'created_at' as keyof Division,
      title: 'Created At',
      render: (date: unknown) => mounted ? new Date(date as string).toLocaleDateString('id-ID') : '',
      width: '120px'
    }
  ]

  // Fetch divisions with filters
  const fetchDivisions = React.useCallback(async (filters?: MasterDataFilters) => {
    try {
      setLoading(true)
      const response = await divisionService.getAll(filters)
      setDivisions(response.data)
      setPagination(prev => ({
        ...prev,
        total: response.total
      }))
    } catch (error) {
      console.error('Error fetching divisions:', error)
      addToast(toast.error("Failed to fetch divisions", "Please try again later."))
    } finally {
      setLoading(false)
    }
  }, [addToast])

  // Load initial data
  React.useEffect(() => {
    fetchDivisions({
      page: pagination.current,
      limit: pagination.pageSize
    })
  }, [pagination.current, pagination.pageSize, fetchDivisions])

  // Event handlers
  const handleSearch = React.useCallback((filters: MasterDataFilters) => {
    fetchDivisions({
      ...filters,
      page: 1,
      limit: pagination.pageSize
    })
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [pagination.pageSize, fetchDivisions])

  const handlePageChange = React.useCallback((page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }, [])

  const handleAdd = () => {
    setSelectedDivision(null)
    setFormOpen(true)
  }

  const handleEdit = (division: Division) => {
    setSelectedDivision(division)
    setFormOpen(true)
  }

  const handleFormSuccess = () => {
    fetchDivisions({
      page: pagination.current,
      limit: pagination.pageSize
    })
  }

  const handleDelete = async (division: Division) => {
    if (confirm(`Are you sure you want to delete "${division.name}"?`)) {
      try {
        await divisionService.delete(division.id)
        fetchDivisions({
          page: pagination.current,
          limit: pagination.pageSize
        })
        addToast(toast.success("Division deleted successfully", `${division.name} has been removed.`))
      } catch (error) {
        console.error('Error deleting division:', error)
        addToast(toast.error("Failed to delete division", "Please try again later."))
      }
    }
  }

  const handleBulkAction = async (action: string, selectedIds: string[]) => {
    try {
      switch (action) {
        case 'activate':
          await Promise.all(selectedIds.map(id => 
            divisionService.update(id, { data: { status: 'active' } })
          ))
          addToast(toast.success("Divisions activated", `${selectedIds.length} divisions have been activated.`))
          break
        case 'deactivate':
          await Promise.all(selectedIds.map(id => 
            divisionService.update(id, { data: { status: 'inactive' } })
          ))
          addToast(toast.success("Divisions deactivated", `${selectedIds.length} divisions have been deactivated.`))
          break
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedIds.length} divisions?`)) {
            await Promise.all(selectedIds.map(id => divisionService.delete(id)))
            addToast(toast.success("Divisions deleted", `${selectedIds.length} divisions have been deleted.`))
          }
          break
        default:
          break
      }
      
      fetchDivisions({
        page: pagination.current,
        limit: pagination.pageSize
      })
    } catch (error) {
      console.error('Error performing bulk action:', error)
      addToast(toast.error("Bulk action failed", "Please try again later."))
    }
  }

  const bulkActions = [
    { value: 'activate', label: 'Activate Selected', variant: 'default' as const },
    { value: 'deactivate', label: 'Deactivate Selected', variant: 'secondary' as const },
    { value: 'delete', label: 'Delete Selected', variant: 'destructive' as const }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Divisions"
        description="Manage organizational divisions and their hierarchy"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data", href: "/master-data" },
          { label: "Divisions" }
        ]}
      />
      
      <div className="flex-1 p-6">
        <AdvancedDataTable
          data={divisions}
          columns={columns}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handlePageChange
          }}
          onSearch={handleSearch}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkAction={handleBulkAction}
          bulkActions={bulkActions}
          searchPlaceholder="Search divisions by code or name..."
          addButtonText="Add Division"
          exportEnabled={true}
          rowSelection={true}
        />

        <DivisionForm
          open={formOpen}
          onOpenChange={setFormOpen}
          division={selectedDivision}
          onSuccess={handleFormSuccess}
        />
      </div>
    </TwoLevelLayout>
  )
}