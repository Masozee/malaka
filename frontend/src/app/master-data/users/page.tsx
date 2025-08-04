"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { AdvancedDataTable } from "@/components/ui/advanced-data-table"
import { Badge } from "@/components/ui/badge"
import { UserForm } from "@/components/forms/user-form"
import { useToast, toast } from "@/components/ui/toast"
import { userService, companyService } from "@/services/masterdata"
import { User, Company, MasterDataFilters } from "@/types/masterdata"

export default function UsersPage() {
  const [mounted, setMounted] = React.useState(false)
  const [users, setUsers] = React.useState<User[]>([])
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [loading, setLoading] = React.useState(true)
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [formOpen, setFormOpen] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const { addToast } = useToast()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Define table columns
  const columns = [
    {
      key: 'username' as keyof User,
      title: 'Username',
      sortable: true,
      searchable: true,
      width: '150px'
    },
    {
      key: 'full_name' as keyof User,
      title: 'Full Name',
      sortable: true,
      searchable: true,
      render: (fullName: unknown, user: User) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {fullName as string}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {user.email}
          </span>
        </div>
      )
    },
    {
      key: 'email' as keyof User,
      title: 'Email',
      sortable: true,
      searchable: true,
      hidden: true // Hidden as it's shown in full_name render
    },
    {
      key: 'phone' as keyof User,
      title: 'Phone',
      render: (phone: unknown) => (phone as string) || '-',
      width: '120px'
    },
    {
      key: 'company_id' as keyof User,
      title: 'Company',
      render: (companyId: unknown) => {
        const company = companies.find(c => c.id === companyId)
        return company?.name || '-'
      },
      filterType: 'select' as const,
      filterOptions: companies.map(company => ({
        value: company.id,
        label: company.name
      }))
    },
    {
      key: 'role' as keyof User,
      title: 'Role',
      render: (role: unknown) => {
        const roleStr = role as string
        let variant: 'default' | 'secondary' | 'destructive' = 'default'
        if (roleStr === 'user') variant = 'secondary'
        if (roleStr === 'admin') variant = 'destructive'
        
        return (
          <Badge variant={variant}>
            {roleStr?.charAt(0).toUpperCase() + roleStr?.slice(1)}
          </Badge>
        )
      },
      filterType: 'select' as const,
      filterOptions: [
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'user', label: 'User' }
      ],
      width: '100px'
    },
    {
      key: 'status' as keyof User,
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
      key: 'last_login' as keyof User,
      title: 'Last Login',
      render: (lastLogin: unknown) => {
        if (!mounted || !lastLogin) return 'Never'
        return new Date(lastLogin as string).toLocaleDateString('id-ID')
      },
      width: '120px'
    },
    {
      key: 'created_at' as keyof User,
      title: 'Created At',
      render: (date: unknown) => mounted ? new Date(date as string).toLocaleDateString('id-ID') : '',
      width: '120px'
    }
  ]

  // Fetch users with filters
  const fetchUsers = React.useCallback(async (filters?: MasterDataFilters) => {
    try {
      setLoading(true)
      const response = await userService.getAll(filters)
      setUsers(response.data)
      setPagination(prev => ({
        ...prev,
        total: response.total
      }))
    } catch (error) {
      console.error('Error fetching users:', error)
      addToast(toast.error("Failed to fetch users", "Please try again later."))
    } finally {
      setLoading(false)
    }
  }, [addToast])

  // Fetch companies for filter options
  const fetchCompanies = React.useCallback(async () => {
    try {
      const response = await companyService.getAll()
      setCompanies(response.data)
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }, [])

  // Load initial data
  React.useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  React.useEffect(() => {
    fetchUsers({
      page: pagination.current,
      limit: pagination.pageSize
    })
  }, [pagination.current, pagination.pageSize, fetchUsers])

  // Event handlers
  const handleSearch = React.useCallback((filters: MasterDataFilters) => {
    fetchUsers({
      ...filters,
      page: 1,
      limit: pagination.pageSize
    })
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [pagination.pageSize, fetchUsers])

  const handlePageChange = React.useCallback((page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }, [])

  const handleAdd = () => {
    setSelectedUser(null)
    setFormOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setFormOpen(true)
  }

  const handleFormSuccess = () => {
    fetchUsers({
      page: pagination.current,
      limit: pagination.pageSize
    })
  }

  const handleDelete = async (user: User) => {
    if (confirm(`Are you sure you want to delete "${user.full_name}"?`)) {
      try {
        await userService.delete(user.id)
        fetchUsers({
          page: pagination.current,
          limit: pagination.pageSize
        })
        addToast(toast.success("User deleted successfully", `${user.full_name} has been removed.`))
      } catch (error) {
        console.error('Error deleting user:', error)
        addToast(toast.error("Failed to delete user", "Please try again later."))
      }
    }
  }

  const handleBulkAction = async (action: string, selectedIds: string[]) => {
    try {
      switch (action) {
        case 'activate':
          // Implement bulk activate
          await Promise.all(selectedIds.map(id => 
            userService.update(id, { data: { status: 'active' } })
          ))
          addToast(toast.success("Users activated", `${selectedIds.length} users have been activated.`))
          break
        case 'deactivate':
          // Implement bulk deactivate
          await Promise.all(selectedIds.map(id => 
            userService.update(id, { data: { status: 'inactive' } })
          ))
          addToast(toast.success("Users deactivated", `${selectedIds.length} users have been deactivated.`))
          break
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) {
            await Promise.all(selectedIds.map(id => userService.delete(id)))
            addToast(toast.success("Users deleted", `${selectedIds.length} users have been deleted.`))
          }
          break
        default:
          break
      }
      
      // Refresh data after bulk action
      fetchUsers({
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
        title="Users"
        description="Manage user accounts and access permissions"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data", href: "/master-data" },
          { label: "Users" }
        ]}
      />
      
      <div className="flex-1 p-6">
        <AdvancedDataTable
          data={users}
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
          searchPlaceholder="Search users by name, email, or username..."
          addButtonText="Add User"
          exportEnabled={true}
          rowSelection={true}
        />

        <UserForm
          open={formOpen}
          onOpenChange={setFormOpen}
          user={selectedUser}
          companies={companies}
          onSuccess={handleFormSuccess}
        />
      </div>
    </TwoLevelLayout>
  )
}