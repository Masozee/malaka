"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { DataTable, Column } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { CompanyForm } from "@/components/forms/company-form"
import { useToast, toast } from "@/components/ui/toast"
import { companyService } from "@/services/masterdata"
import { Company, MasterDataFilters } from "@/types/masterdata"

export default function CompaniesPage() {
  const [mounted, setMounted] = React.useState(false)
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [loading, setLoading] = React.useState(true)
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [formOpen, setFormOpen] = React.useState(false)
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(null)
  const { addToast } = useToast()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const columns: Column<Company>[] = [
    {
      key: 'name',
      title: 'Company Name',
      sortable: true,
    },
    {
      key: 'email',
      title: 'Email',
      render: (email: unknown) => (email as string) || '-'
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (phone: unknown) => (phone as string) || '-'
    },
    {
      key: 'address',
      title: 'Address',
      render: (address: unknown) => (address as string) || '-',
      width: '200px'
    },
    {
      key: 'status',
      title: 'Status',
      render: (status: unknown) => {
        const statusStr = status as string
        return (
          <Badge variant={statusStr === 'active' ? 'default' : 'secondary'}>
            {statusStr}
          </Badge>
        )
      }
    },
    {
      key: 'created_at',
      title: 'Created At',
      render: (date: unknown) => mounted ? new Date(date as string).toLocaleDateString('id-ID') : ''
    }
  ]

  const fetchCompanies = React.useCallback(async (filters?: MasterDataFilters) => {
    try {
      setLoading(true)
      const response = await companyService.getAll(filters)
      setCompanies(response.data)
      setPagination(prev => ({
        ...prev,
        total: response.total
      }))
    } catch (error) {
      console.error('Error fetching companies:', error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchCompanies({
      page: pagination.current,
      limit: pagination.pageSize
    })
  }, [pagination.current, pagination.pageSize, fetchCompanies])

  const handleSearch = React.useCallback((search: string) => {
    fetchCompanies({
      search,
      page: 1,
      limit: pagination.pageSize
    })
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [pagination.pageSize, fetchCompanies])

  const handlePageChange = React.useCallback((page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }))
  }, [])

  const handleAdd = () => {
    setSelectedCompany(null)
    setFormOpen(true)
  }

  const handleEdit = (company: Company) => {
    setSelectedCompany(company)
    setFormOpen(true)
  }

  const handleFormSuccess = () => {
    // Refresh the list after successful create/update
    fetchCompanies({
      page: pagination.current,
      limit: pagination.pageSize
    })
  }

  const handleDelete = async (company: Company) => {
    if (confirm(`Are you sure you want to delete "${company.name}"?`)) {
      try {
        await companyService.delete(company.id)
        // Refresh the list
        fetchCompanies({
          page: pagination.current,
          limit: pagination.pageSize
        })
        addToast(toast.success("Company deleted successfully", `${company.name} has been removed.`))
      } catch (error) {
        console.error('Error deleting company:', error)
        addToast(toast.error("Failed to delete company", "Please try again later."))
      }
    }
  }

  return (
    <TwoLevelLayout>
      <Header 
        title="Companies"
        description="Manage company information and setup"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data", href: "/master-data" },
          { label: "Companies" }
        ]}
      />
      
      <div className="flex-1 p-6">
        <DataTable
          data={companies}
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
          searchPlaceholder="Search companies..."
          addButtonText="Add Company"
        />

        <CompanyForm
          open={formOpen}
          onOpenChange={setFormOpen}
          company={selectedCompany}
          onSuccess={handleFormSuccess}
        />
      </div>
    </TwoLevelLayout>
  )
}