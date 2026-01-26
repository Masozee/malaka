"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { AdvancedDataTable } from "@/components/ui/advanced-data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserForm } from "@/components/forms/user-form"
import { useToast, toast } from "@/components/ui/toast"
import { userService, companyService } from "@/services/masterdata"
import { invitationService, Invitation } from "@/services/invitations"
import { User, Company, MasterDataFilters } from "@/types/masterdata"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  UserAdd01Icon,
  Delete01Icon,
  Cancel01Icon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  MoreVerticalIcon,
  Search01Icon,
  FilterIcon,
  Download01Icon,
} from "@hugeicons/core-free-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

  // Invitation state
  const [invitations, setInvitations] = React.useState<Invitation[]>([])
  const [invitationsLoading, setInvitationsLoading] = React.useState(false)
  const [showInviteDialog, setShowInviteDialog] = React.useState(false)
  const [inviteForm, setInviteForm] = React.useState({
    email: '',
    role: 'user',
    company_id: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('users')

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

  // Fetch invitations
  const fetchInvitations = React.useCallback(async () => {
    try {
      setInvitationsLoading(true)
      const response = await invitationService.list()
      setInvitations(response.invitations || [])
    } catch (error) {
      console.error('Error fetching invitations:', error)
    } finally {
      setInvitationsLoading(false)
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

  React.useEffect(() => {
    if (activeTab === 'invitations') {
      fetchInvitations()
    }
  }, [activeTab, fetchInvitations])

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
          await Promise.all(selectedIds.map(id =>
            userService.update(id, { data: { status: 'active' } })
          ))
          addToast(toast.success("Users activated", `${selectedIds.length} users have been activated.`))
          break
        case 'deactivate':
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

      fetchUsers({
        page: pagination.current,
        limit: pagination.pageSize
      })
    } catch (error) {
      console.error('Error performing bulk action:', error)
      addToast(toast.error("Bulk action failed", "Please try again later."))
    }
  }

  // Invitation handlers
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteForm.email || !inviteForm.role || !inviteForm.company_id) {
      addToast(toast.error("Missing fields", "Please fill in all required fields."))
      return
    }

    setIsSubmitting(true)
    try {
      await invitationService.create({
        email: inviteForm.email,
        role: inviteForm.role,
        company_id: inviteForm.company_id,
        message: inviteForm.message || undefined
      })
      addToast(toast.success("Invitation sent", `An invitation has been sent to ${inviteForm.email}`))
      setShowInviteDialog(false)
      setInviteForm({ email: '', role: 'user', company_id: '', message: '' })
      fetchInvitations()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      addToast(toast.error("Failed to send invitation", err.response?.data?.message || err.message || "Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendInvitation = async (id: string) => {
    setIsSubmitting(true)
    try {
      await invitationService.resend(id)
      addToast(toast.success("Invitation resent", "The invitation email has been resent."))
      fetchInvitations()
    } catch (error) {
      addToast(toast.error("Failed to resend", "Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevokeInvitation = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this invitation?")) return
    setIsSubmitting(true)
    try {
      await invitationService.revoke(id)
      addToast(toast.success("Invitation revoked", "The invitation has been revoked."))
      fetchInvitations()
    } catch (error) {
      addToast(toast.error("Failed to revoke", "Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteInvitation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invitation?")) return
    setIsSubmitting(true)
    try {
      await invitationService.delete(id)
      addToast(toast.success("Invitation deleted", "The invitation has been deleted."))
      fetchInvitations()
    } catch (error) {
      addToast(toast.error("Failed to delete", "Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const bulkActions = [
    { value: 'activate', label: 'Activate Selected', variant: 'default' as const },
    { value: 'deactivate', label: 'Deactivate Selected', variant: 'secondary' as const },
    { value: 'delete', label: 'Delete Selected', variant: 'destructive' as const }
  ]

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
    revoked: 'bg-red-100 text-red-800',
  }

  const statusIcons: Record<string, typeof Clock01Icon> = {
    pending: Clock01Icon,
    accepted: CheckmarkCircle01Icon,
    expired: AlertCircleIcon,
    revoked: Cancel01Icon,
  }

  const formatDate = (dateStr: string) => {
    if (!mounted) return ''
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const pendingCount = invitations.filter(i => i.status === 'pending').length

  // Search and filter state for custom toolbar
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filterOpen, setFilterOpen] = React.useState(false)
  const [filters, setFilters] = React.useState<Record<string, string>>({})

  // Handle search with debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch({
        search: searchTerm,
        ...filters,
        page: 1,
        limit: pagination.pageSize
      })
    }, 300)
    return () => clearTimeout(timer)
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
      search: searchTerm,
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
      ...users.map(row =>
        visibleColumns.map(col => {
          const value = row[col.key as keyof User]
          return `"${String(value || '').replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const activeFiltersCount = Object.keys(filters).length

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
        actions={
          <Button onClick={() => setShowInviteDialog(true)}>
            <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Custom toolbar with tabs on left, search/filter/export on right */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="invitations" className="flex items-center gap-2">
                  Invitations
                  {pendingCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

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
                      <label className="text-sm font-medium">Company</label>
                      <Select
                        value={filters['company_id'] || ""}
                        onValueChange={(value) => handleFilterChange('company_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Companies" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Companies</SelectItem>
                          {companies.map(company => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Role</label>
                      <Select
                        value={filters['role'] || ""}
                        onValueChange={(value) => handleFilterChange('role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                            search: searchTerm,
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

          <TabsContent value="users" className="mt-0">
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
              onEdit={handleEdit}
              onDelete={handleDelete}
              onBulkAction={handleBulkAction}
              bulkActions={bulkActions}
              rowSelection={true}
              showToolbar={false}
            />
          </TabsContent>

          <TabsContent value="invitations" className="mt-0">
            {invitationsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <HugeiconsIcon icon={Mail01Icon} className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No invitations yet</p>
                <p className="text-sm">Click &quot;Invite User&quot; to send your first invitation</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Role</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Company</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Created</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Expires</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((invitation) => {
                      const StatusIcon = statusIcons[invitation.status] || Clock01Icon
                      const company = companies.find(c => c.id === invitation.company_id)
                      return (
                        <tr key={invitation.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-3 font-medium">{invitation.email}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="capitalize">
                              {invitation.role}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {company?.name || invitation.company_name || '-'}
                          </td>
                          <td className="p-3">
                            <Badge className={statusColors[invitation.status]}>
                              <HugeiconsIcon icon={StatusIcon} className="h-3 w-3 mr-1" />
                              {invitation.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">{formatDate(invitation.created_at)}</td>
                          <td className="p-3 text-muted-foreground">{formatDate(invitation.expires_at)}</td>
                          <td className="p-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={isSubmitting}>
                                  <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {invitation.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleResendInvitation(invitation.id)}>
                                      <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4 mr-2" />
                                      Resend Invitation
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRevokeInvitation(invitation.id)}>
                                      <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 mr-2" />
                                      Revoke Invitation
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDeleteInvitation(invitation.id)}
                                  className="text-red-600"
                                >
                                  <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <UserForm
          open={formOpen}
          onOpenChange={setFormOpen}
          user={selectedUser}
          companies={companies}
          onSuccess={handleFormSuccess}
        />

        {/* Invite User Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={UserAdd01Icon} className="h-5 w-5" />
                Invite User
              </DialogTitle>
              <DialogDescription>
                Send an email invitation to a new user. They will receive a link to create their account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Select
                    value={inviteForm.company_id}
                    onValueChange={(value) => setInviteForm(prev => ({ ...prev, company_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Input
                    id="message"
                    placeholder="Welcome to the team!"
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TwoLevelLayout>
  )
}
