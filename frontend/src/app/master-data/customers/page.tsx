"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { AdvancedDataTable } from "@/components/ui/advanced-data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CustomerForm } from "@/components/forms/customer-form"
import { useToast, toast } from "@/components/ui/toast"
import { customerService, companyService } from "@/services/masterdata"
import { Customer, Company, MasterDataFilters } from "@/types/masterdata"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  FilterIcon,
  Download01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons"

export default function CustomersPage() {
  const [mounted, setMounted] = React.useState(false)
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [loading, setLoading] = React.useState(true)
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [formOpen, setFormOpen] = React.useState(false)
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
  const { addToast } = useToast()

  // Search and filter state
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [filters, setFilters] = React.useState<Record<string, string>>({})

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
  const fetchCustomers = React.useCallback(async (fetchFilters?: MasterDataFilters) => {
    try {
      setLoading(true)
      const response = await customerService.getAll(fetchFilters)
      setCustomers(response.data)
      setPagination(prev => ({
        ...prev,
        total: response.total
      }))
    } catch (error) {
      console.error('Error fetching customers:', error)
      addToast(toast.error("Failed to fetch customers", "Please try again later."))
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
      limit: pagination.pageSize,
      search: searchTerm || undefined,
      ...filters
    })
  }, [pagination.current, pagination.pageSize, fetchCustomers])

  // Event handlers
  const handleSearch = React.useCallback((searchFilters: MasterDataFilters) => {
    fetchCustomers({
      ...searchFilters,
      page: 1,
      limit: pagination.pageSize
    })
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [pagination.pageSize, fetchCustomers])

  const handlePageChange = React.useCallback((page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }, [])

  const handleAdd = () => {
    setSelectedCustomer(null)
    setFormOpen(true)
  }

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormOpen(true)
  }

  const handleFormSuccess = () => {
    fetchCustomers({
      page: pagination.current,
      limit: pagination.pageSize,
      search: searchTerm || undefined,
      ...filters
    })
  }

  const handleDelete = async (customer: Customer) => {
    if (confirm(`Are you sure you want to delete "${customer.name}"?`)) {
      try {
        await customerService.delete(customer.id)
        fetchCustomers({
          page: pagination.current,
          limit: pagination.pageSize,
          search: searchTerm || undefined,
          ...filters
        })
        addToast(toast.success("Customer deleted successfully", `${customer.name} has been removed.`))
      } catch (error) {
        console.error('Error deleting customer:', error)
        addToast(toast.error("Failed to delete customer", "Please try again later."))
      }
    }
  }

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch({
        search: searchTerm || undefined,
        ...filters,
        page: 1,
        limit: pagination.pageSize
      })
    }, 300)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters }
    if (value && value !== 'all') {
      newFilters[key] = value
    } else {
      delete newFilters[key]
    }
    setFilters(newFilters)
    handleSearch({
      search: searchTerm || undefined,
      ...newFilters,
      page: 1,
      limit: pagination.pageSize
    })
  }

  // Export functionality
  const handleExport = () => {
    const visibleColumns = columns.filter(col => !col.hidden)
    const csvContent = [
      visibleColumns.map(col => col.title).join(','),
      ...customers.map(row =>
        visibleColumns.map(col => {
          const value = row[col.key as keyof Customer]
          return `"${String(value || '').replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'customers-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const activeFiltersCount = Object.keys(filters).length

  return (
    <TwoLevelLayout>
      <Header
        title="Customers"
        description="Manage customer accounts and information"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data", href: "/master-data" },
          { label: "Customers" }
        ]}
        actions={
          <Button onClick={handleAdd}>
            <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        }
      />

      <div className="flex-1 p-6">
        {/* Toolbar: Search, Filters, Export */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers by name, email, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filters */}
            <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 mr-2" />
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={filters['status'] || ""}
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilters({})
                        handleSearch({
                          search: searchTerm || undefined,
                          page: 1,
                          limit: pagination.pageSize
                        })
                      }}
                      className="w-full"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Export */}
            <Button variant="outline" size="sm" onClick={handleExport}>
              <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <AdvancedDataTable
          data={customers}
          columns={columns}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handlePageChange
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          rowSelection={true}
        />

        <CustomerForm
          open={formOpen}
          onOpenChange={setFormOpen}
          customer={selectedCustomer}
          companies={companies}
          onSuccess={handleFormSuccess}
        />
      </div>
    </TwoLevelLayout>
  )
}
