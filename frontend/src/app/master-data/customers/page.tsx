"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { AdvancedDataTable } from "@/components/ui/advanced-data-table"
import { Badge } from "@/components/ui/badge"
import { CustomerForm } from "@/components/forms/customer-form" // Changed from UserForm
import { useToast, toast } from "@/components/ui/toast"
import { customerService, companyService } from "@/services/masterdata" // Changed from userService
import { Customer, Company, MasterDataFilters } from "@/types/masterdata" // Changed from User

export default function CustomersPage() { // Changed from UsersPage
  const [mounted, setMounted] = React.useState(false)
  const [customers, setCustomers] = React.useState<Customer[]>([]) // Changed from users, User
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [loading, setLoading] = React.useState(true)
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [formOpen, setFormOpen] = React.useState(false)
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null) // Changed from selectedUser, User
  const { addToast } = useToast()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Define table columns
  const columns = [
    {
      key: 'name' as keyof Customer,
      title: 'Customer Name',
      sortable: true,
      searchable: true,
      width: '150px'
    },
    {
      key: 'contact_person' as keyof Customer,
      title: 'Contact Person',
      sortable: true,
      searchable: true,
      render: (contactPerson: unknown, customer: Customer) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {contactPerson as string}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {customer.email}
          </span>
        </div>
      )
    },
    {
      key: 'email' as keyof Customer,
      title: 'Email',
      sortable: true,
      searchable: true,
      hidden: true
    },
    {
      key: 'phone' as keyof Customer,
      title: 'Phone',
      render: (phone: unknown) => (phone as string) || '-',
      width: '120px'
    },
    {
      key: 'company_id' as keyof Customer,
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
      key: 'status' as keyof Customer,
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
      key: 'created_at' as keyof Customer,
      title: 'Created At',
      render: (date: unknown) => mounted ? new Date(date as string).toLocaleDateString('id-ID') : '',
      width: '120px'
    }
  ]

  // Fetch customers with filters
  const fetchCustomers = React.useCallback(async (filters?: MasterDataFilters) => { // Changed from fetchUsers
    try {
      setLoading(true)
      const response = await customerService.getAll(filters) // Changed from userService
      setCustomers(response.data) // Changed from setUsers
      setPagination(prev => ({
        ...prev,
        total: response.total
      }))
    } catch (error) {
      console.error('Error fetching customers:', error) // Changed from users
      addToast(toast.error("Failed to fetch customers", "Please try again later.")) // Changed from users
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
    fetchCustomers({
      page: pagination.current,
      limit: pagination.pageSize
    })
  }, [pagination.current, pagination.pageSize, fetchCustomers])

  // Event handlers
  const handleSearch = React.useCallback((filters: MasterDataFilters) => {
    fetchCustomers({ // Changed from fetchUsers
      ...filters,
      page: 1,
      limit: pagination.pageSize
    })
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [pagination.pageSize, fetchCustomers]) // Changed from fetchUsers

  const handlePageChange = React.useCallback((page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }, [])

  const handleAdd = () => {
    setSelectedCustomer(null) // Changed from setSelectedUser
    setFormOpen(true)
  }

  const handleEdit = (customer: Customer) => { // Changed from user: User
    setSelectedCustomer(customer) // Changed from setSelectedUser
    setFormOpen(true)
  }

  const handleFormSuccess = () => {
    fetchCustomers({ // Changed from fetchUsers
      page: pagination.current,
      limit: pagination.pageSize
    })
  }

  const handleDelete = async (customer: Customer) => { // Changed from user: User
    if (confirm(`Are you sure you want to delete "${customer.name}"?`)) { // Changed from user.full_name
      try {
        await customerService.delete(customer.id) // Changed from userService.delete
        fetchCustomers({ // Changed from fetchUsers
          page: pagination.current,
          limit: pagination.pageSize
        })
        addToast(toast.success("Customer deleted successfully", `${customer.name} has been removed.`)) // Changed from User, user.full_name
      } catch (error) {
        console.error('Error deleting customer:', error) // Changed from user
        addToast(toast.error("Failed to delete customer", "Please try again later.")) // Changed from user
      }
    }
  }

  const handleBulkAction = async (action: string, selectedIds: string[]) => {
    try {
      switch (action) {
        case 'activate':
          // Implement bulk activate
          await Promise.all(selectedIds.map(id => 
            customerService.update(id, { data: { status: 'active' } }) // Changed from userService.update
          ))
          addToast(toast.success("Customers activated", `${selectedIds.length} customers have been activated.`)) // Changed from Users
          break
        case 'deactivate':
          // Implement bulk deactivate
          await Promise.all(selectedIds.map(id => 
            customerService.update(id, { data: { status: 'inactive' } }) // Changed from userService.update
          ))
          addToast(toast.success("Customers deactivated", `${selectedIds.length} customers have been deactivated.`)) // Changed from Users
          break
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedIds.length} customers?`)) { // Changed from users
            await Promise.all(selectedIds.map(id => customerService.delete(id))) // Changed from userService.delete
            addToast(toast.success("Customers deleted", `${selectedIds.length} customers have been deleted.`)) // Changed from Users
          }
          break
        default:
          break
      }
      
      // Refresh data after bulk action
      fetchCustomers({ // Changed from fetchUsers
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
        title="Customers" // Changed from Users
        description="Manage customer accounts and information" // Changed from user accounts and access permissions
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data", href: "/master-data" },
          { label: "Customers" } // Changed from Users
        ]}
      />
      
      <div className="flex-1 p-6">
        <AdvancedDataTable
          data={customers} // Changed from users
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
          searchPlaceholder="Search customers by name, email, or contact person..." // Changed from users by name, email, or username
          addButtonText="Add Customer" // Changed from Add User
          exportEnabled={true}
          rowSelection={true}
        />

        <CustomerForm // Changed from UserForm
          open={formOpen}
          onOpenChange={setFormOpen}
          customer={selectedCustomer} // Changed from user
          companies={companies}
          onSuccess={handleFormSuccess}
        />
      </div>
    </TwoLevelLayout>
  )
}