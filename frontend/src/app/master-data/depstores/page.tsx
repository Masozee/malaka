"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { AdvancedDataTable } from "@/components/ui/advanced-data-table"
import { Badge } from "@/components/ui/badge"
import { DepstoreForm } from "@/components/forms/depstore-form"
import { useToast, toast } from "@/components/ui/toast"
import { depstoreService } from "@/services/masterdata"
import { Depstore, MasterDataFilters } from "@/types/masterdata"

export default function DepstoresPage() {
  const [mounted, setMounted] = React.useState(false)
  const [depstores, setDepstores] = React.useState<Depstore[]>([])
  const [loading, setLoading] = React.useState(true)
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [formOpen, setFormOpen] = React.useState(false)
  const [selectedDepstore, setSelectedDepstore] = React.useState<Depstore | null>(null)
  const { addToast } = useToast()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Define table columns
  const columns = [
    {
      key: 'code' as keyof Depstore,
      title: 'Code',
      sortable: true,
      searchable: true,
      width: '100px'
    },
    {
      key: 'name' as keyof Depstore,
      title: 'Name',
      sortable: true,
      searchable: true,
      width: '200px'
    },
    {
      key: 'contact_person' as keyof Depstore,
      title: 'Contact Person',
      render: (contactPerson: unknown) => (contactPerson as string) || '-',
    },
    {
      key: 'phone' as keyof Depstore,
      title: 'Phone',
      render: (phone: unknown) => (phone as string) || '-',
      width: '120px'
    },
    {
      key: 'email' as keyof Depstore,
      title: 'Email',
      render: (email: unknown) => (email as string) || '-',
      width: '150px'
    },
    {
      key: 'city' as keyof Depstore,
      title: 'City',
      sortable: true,
      searchable: true,
      width: '120px'
    },
    {
      key: 'commission_rate' as keyof Depstore,
      title: 'Commission Rate',
      render: (rate: unknown) => `${rate || 0}%`,
      width: '120px'
    },
    {
      key: 'status' as keyof Depstore,
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
      key: 'created_at' as keyof Depstore,
      title: 'Created At',
      render: (date: unknown) => mounted ? new Date(date as string).toLocaleDateString('id-ID') : '',
      width: '120px'
    }
  ]

  // Fetch depstores with filters
  const fetchDepstores = React.useCallback(async (filters?: MasterDataFilters) => {
    try {
      setLoading(true)
      const response = await depstoreService.getAll(filters)
      setDepstores(response.data)
      setPagination(prev => ({
        ...prev,
        total: response.total
      }))
    } catch (error) {
      console.error('Error fetching depstores:', error)
      addToast(toast.error("Failed to fetch department stores", "Please try again later."))
    } finally {
      setLoading(false)
    }
  }, [addToast])

  // Load initial data
  React.useEffect(() => {
    fetchDepstores({
      page: pagination.current,
      limit: pagination.pageSize
    })
  }, [pagination.current, pagination.pageSize, fetchDepstores])

  // Event handlers
  const handleSearch = React.useCallback((filters: MasterDataFilters) => {
    fetchDepstores({
      ...filters,
      page: 1,
      limit: pagination.pageSize
    })
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [pagination.pageSize, fetchDepstores])

  const handlePageChange = React.useCallback((page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }, [])

  const handleAdd = () => {
    setSelectedDepstore(null)
    setFormOpen(true)
  }

  const handleEdit = (depstore: Depstore) => {
    setSelectedDepstore(depstore)
    setFormOpen(true)
  }

  const handleFormSuccess = () => {
    fetchDepstores({
      page: pagination.current,
      limit: pagination.pageSize
    })
  }

  const handleDelete = async (depstore: Depstore) => {
    if (confirm(`Are you sure you want to delete "${depstore.name}"?`)) {
      try {
        await depstoreService.delete(depstore.id)
        fetchDepstores({
          page: pagination.current,
          limit: pagination.pageSize
        })
        addToast(toast.success("Department store deleted successfully", `${depstore.name} has been removed.`))
      } catch (error) {
        console.error('Error deleting department store:', error)
        addToast(toast.error("Failed to delete department store", "Please try again later."))
      }
    }
  }

  const handleBulkAction = async (action: string, selectedIds: string[]) => {
    try {
      switch (action) {
        case 'activate':
          await Promise.all(selectedIds.map(id => 
            depstoreService.update(id, { data: { status: 'active' } })
          ))
          addToast(toast.success("Department stores activated", `${selectedIds.length} department stores have been activated.`))
          break
        case 'deactivate':
          await Promise.all(selectedIds.map(id => 
            depstoreService.update(id, { data: { status: 'inactive' } })
          ))
          addToast(toast.success("Department stores deactivated", `${selectedIds.length} department stores have been deactivated.`))
          break
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedIds.length} department stores?`)) {
            await Promise.all(selectedIds.map(id => depstoreService.delete(id)))
            addToast(toast.success("Department stores deleted", `${selectedIds.length} department stores have been deleted.`))
          }
          break
        default:
          break
      }
      
      fetchDepstores({
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
        title="Department Stores"
        description="Manage department store information"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data", href: "/master-data" },
          { label: "Department Stores" }
        ]}
      />
      
      <div className="flex-1 p-6">
        <AdvancedDataTable
          data={depstores}
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
          searchPlaceholder="Search department stores by code, name, or city..."
          addButtonText="Add Department Store"
          exportEnabled={true}
          rowSelection={true}
        />

        <DepstoreForm
          open={formOpen}
          onOpenChange={setFormOpen}
          depstore={selectedDepstore}
          onSuccess={handleFormSuccess}
        />
      </div>
    </TwoLevelLayout>
  )
}