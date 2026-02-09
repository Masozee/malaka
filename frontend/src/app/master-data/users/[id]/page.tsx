"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "@/components/ui/dialog"
import { useToast, toast } from "@/components/ui/toast"
import { userService, companyService } from "@/services/masterdata"
import { rbacService, Role, Permission, UserRole, UserPermission, AuditEntry } from "@/services/rbac"
import { auditService, AuditLogEntry, formatAuditAction, getMethodColor } from "@/services/audit"
import { HRService } from "@/services/hr"
import { User, Company } from "@/types/masterdata"
import type { Employee } from "@/types/hr"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  PencilEdit01Icon,
  Delete01Icon,
  UserIcon,
  UserShield01Icon,
  CheckmarkCircle01Icon,
  Search01Icon,
  Clock01Icon,
  Mail01Icon,
  Call02Icon,
  Building01Icon,
  Calendar01Icon,
  Briefcase01Icon,
  Dollar01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const [mounted, setMounted] = React.useState(false)
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [companies, setCompanies] = React.useState<Company[]>([])

  // Edit profile state
  const [editOpen, setEditOpen] = React.useState(false)
  const [editForm, setEditForm] = React.useState({
    full_name: "",
    email: "",
    phone: "",
    company_id: "",
    status: "active" as string,
    password: "",
  })
  const [editLoading, setEditLoading] = React.useState(false)

  // Roles state
  const [allRoles, setAllRoles] = React.useState<Role[]>([])
  const [userRoles, setUserRoles] = React.useState<UserRole[]>([])
  const [rolesLoading, setRolesLoading] = React.useState(false)

  // Permissions state
  const [allPermissions, setAllPermissions] = React.useState<Permission[]>([])
  const [userDirectPerms, setUserDirectPerms] = React.useState<UserPermission[]>([])
  const [permSearch, setPermSearch] = React.useState("")
  const [activeModule, setActiveModule] = React.useState("all")
  const [permLoading, setPermLoading] = React.useState(false)

  // Activity log state (combined: general audit + RBAC audit)
  const [activityLog, setActivityLog] = React.useState<AuditLogEntry[]>([])
  const [rbacAuditLog, setRbacAuditLog] = React.useState<AuditEntry[]>([])
  const [auditLoading, setAuditLoading] = React.useState(false)

  // Employment state (linked HR employee)
  const [linkedEmployee, setLinkedEmployee] = React.useState<Employee | null>(null)
  const [employeeLoading, setEmployeeLoading] = React.useState(false)
  const [employeeLoaded, setEmployeeLoaded] = React.useState(false)

  // Active tab
  const [activeTab, setActiveTab] = React.useState("profile")

  const MODULES = [
    "masterdata", "accounting", "inventory", "sales", "shipping",
    "finance", "hr", "procurement", "production", "calendar",
    "notifications", "invitations", "profile", "settings", "admin",
  ]

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Load user data
  React.useEffect(() => {
    if (!params.id) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const [userData, companiesData, rolesData] = await Promise.all([
          userService.getById(params.id as string),
          companyService.getAll(),
          rbacService.getRoles(),
        ])
        setUser(userData)
        setCompanies(companiesData.data || [])
        setAllRoles(rolesData || [])
      } catch (error) {
        console.error("Error loading user:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  // Load tab-specific data when tab changes
  React.useEffect(() => {
    if (!user) return

    if (activeTab === "roles" && userRoles.length === 0 && !rolesLoading) {
      loadRoles()
    }
    if (activeTab === "permissions" && allPermissions.length === 0 && !permLoading) {
      loadPermissions()
    }
    if (activeTab === "activity" && activityLog.length === 0 && rbacAuditLog.length === 0 && !auditLoading) {
      loadAuditLog()
    }
    if (activeTab === "employment" && !employeeLoaded && !employeeLoading) {
      loadEmployeeData()
    }
  }, [activeTab, user])

  const loadRoles = async () => {
    if (!user) return
    setRolesLoading(true)
    try {
      const roles = await rbacService.getUserRoles(user.id)
      setUserRoles(roles || [])
    } catch {
      addToast(toast.error("Failed to load roles", "Please try again."))
    } finally {
      setRolesLoading(false)
    }
  }

  const loadPermissions = async () => {
    if (!user) return
    setPermLoading(true)
    try {
      const [directPerms, perms] = await Promise.all([
        rbacService.getUserDirectPermissions(user.id),
        rbacService.getPermissions(),
      ])
      setUserDirectPerms(directPerms || [])
      setAllPermissions(perms || [])
    } catch {
      addToast(toast.error("Failed to load permissions", "Please try again."))
    } finally {
      setPermLoading(false)
    }
  }

  const loadAuditLog = async () => {
    if (!user) return
    setAuditLoading(true)
    try {
      const [activity, rbacEntries] = await Promise.all([
        auditService.getUserActivityLog(user.id).catch(() => [] as AuditLogEntry[]),
        rbacService.getUserAuditLog(user.id).catch(() => [] as AuditEntry[]),
      ])
      setActivityLog(activity || [])
      setRbacAuditLog(rbacEntries || [])
    } catch {
      addToast(toast.error("Failed to load activity log", "Please try again."))
    } finally {
      setAuditLoading(false)
    }
  }

  const loadEmployeeData = async () => {
    if (!user) return
    setEmployeeLoading(true)
    try {
      const employee = await HRService.getEmployeeByUserId(user.id)
      setLinkedEmployee(employee)
    } catch {
      setLinkedEmployee(null)
    } finally {
      setEmployeeLoading(false)
      setEmployeeLoaded(true)
    }
  }

  // Role management
  const userRoleIds = React.useMemo(() => new Set(userRoles.map(ur => ur.role_id)), [userRoles])

  const handleToggleRole = async (roleId: string) => {
    if (!user) return
    try {
      if (userRoleIds.has(roleId)) {
        await rbacService.revokeRoleFromUser(user.id, roleId)
        setUserRoles(prev => prev.filter(ur => ur.role_id !== roleId))
      } else {
        await rbacService.assignRoleToUser(user.id, roleId)
        const role = allRoles.find(r => r.id === roleId)
        setUserRoles(prev => [...prev, {
          id: crypto.randomUUID(),
          user_id: user.id,
          role_id: roleId,
          role_name: role?.name || "",
          assigned_at: new Date().toISOString(),
        }])
      }
    } catch {
      addToast(toast.error("Failed to update role", "Please try again."))
    }
  }

  // Permission management
  const grantedPermIds = React.useMemo(
    () => new Set(userDirectPerms.map(up => up.permission_id)),
    [userDirectPerms]
  )

  const filteredPerms = React.useMemo(() => {
    let perms = allPermissions
    if (activeModule !== "all") perms = perms.filter(p => p.module === activeModule)
    if (permSearch) {
      const q = permSearch.toLowerCase()
      perms = perms.filter(p => p.code.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    }
    return perms
  }, [allPermissions, activeModule, permSearch])

  const modulePermCounts = React.useMemo(() => {
    const counts: Record<string, { total: number; granted: number }> = {}
    for (const p of allPermissions) {
      if (!counts[p.module]) counts[p.module] = { total: 0, granted: 0 }
      counts[p.module].total++
      if (grantedPermIds.has(p.id)) counts[p.module].granted++
    }
    return counts
  }, [allPermissions, grantedPermIds])

  const handleTogglePerm = async (perm: Permission) => {
    if (!user) return
    try {
      if (grantedPermIds.has(perm.id)) {
        await rbacService.revokePermissionFromUser(user.id, perm.id)
        setUserDirectPerms(prev => prev.filter(up => up.permission_id !== perm.id))
      } else {
        await rbacService.grantPermissionsToUser(user.id, [perm.id])
        setUserDirectPerms(prev => [...prev, {
          id: crypto.randomUUID(),
          user_id: user.id,
          permission_id: perm.id,
          granted_at: new Date().toISOString(),
          permission_code: perm.code,
        }])
      }
    } catch {
      addToast(toast.error("Failed to update permission", "Please try again."))
    }
  }

  const handleGrantModule = async (module: string) => {
    if (!user) return
    const toGrant = allPermissions.filter(p => p.module === module && !grantedPermIds.has(p.id))
    if (toGrant.length === 0) return
    try {
      await rbacService.grantPermissionsToUser(user.id, toGrant.map(p => p.id))
      const newEntries: UserPermission[] = toGrant.map(p => ({
        id: crypto.randomUUID(),
        user_id: user.id,
        permission_id: p.id,
        granted_at: new Date().toISOString(),
        permission_code: p.code,
      }))
      setUserDirectPerms(prev => [...prev, ...newEntries])
      addToast(toast.success("Permissions granted", `All ${module} permissions assigned.`))
    } catch {
      addToast(toast.error("Failed to grant permissions", "Please try again."))
    }
  }

  const handleRevokeModule = async (module: string) => {
    if (!user) return
    const toRevoke = allPermissions.filter(p => p.module === module && grantedPermIds.has(p.id))
    if (toRevoke.length === 0) return
    try {
      await Promise.all(toRevoke.map(p => rbacService.revokePermissionFromUser(user.id, p.id)))
      const revokedIds = new Set(toRevoke.map(p => p.id))
      setUserDirectPerms(prev => prev.filter(up => !revokedIds.has(up.permission_id)))
      addToast(toast.success("Permissions revoked", `All ${module} permissions removed.`))
    } catch {
      addToast(toast.error("Failed to revoke permissions", "Please try again."))
    }
  }

  // Edit user
  const handleOpenEdit = () => {
    if (!user) return
    setEditForm({
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      company_id: user.company_id || "",
      status: user.status || "active",
      password: "",
    })
    setEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setEditLoading(true)
    try {
      const submitData: Record<string, unknown> = {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone || undefined,
        company_id: editForm.company_id,
        status: editForm.status,
      }
      if (editForm.password) {
        submitData.password = editForm.password
      }
      await userService.update(user.id, { data: submitData })
      const updatedUser = await userService.getById(user.id)
      setUser(updatedUser)
      setEditOpen(false)
      addToast(toast.success("User updated", `${editForm.full_name} has been updated.`))
    } catch (error) {
      console.error("Error updating user:", error)
      addToast(toast.error("Failed to update user", "Please try again."))
    } finally {
      setEditLoading(false)
    }
  }

  // Delete user
  const handleDelete = async () => {
    if (!user) return
    if (!confirm(`Are you sure you want to delete "${user.full_name}"? This action cannot be undone.`)) return
    try {
      await userService.delete(user.id)
      addToast(toast.success("User deleted", `${user.full_name} has been removed.`))
      router.push("/master-data/users")
    } catch {
      addToast(toast.error("Failed to delete user", "Please try again."))
    }
  }

  const formatDate = (dateStr: string) => {
    if (!mounted || !dateStr) return ""
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateShort = (dateStr: string) => {
    if (!mounted || !dateStr) return ""
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Master Data", href: "/master-data" },
    { label: "Users", href: "/master-data/users" },
    { label: user?.full_name || "User Detail" },
  ]

  // Loading
  if (loading) {
    return (
      <TwoLevelLayout>
        <Header title="Loading..." breadcrumbs={breadcrumbs} />
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg" />
              ))}
            </div>
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  // Not found
  if (!user) {
    return (
      <TwoLevelLayout>
        <Header title="User Not Found" breadcrumbs={breadcrumbs} />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <HugeiconsIcon icon={UserIcon} className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User not found</h2>
            <p className="text-sm text-muted-foreground mt-1">The user you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
            <Link href="/master-data/users">
              <Button className="mt-4" variant="outline">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </Link>
          </div>
        </div>
      </TwoLevelLayout>
    )
  }

  const company = companies.find(c => c.id === user.company_id)

  return (
    <TwoLevelLayout>
      <Header
        title={user.full_name}
        description={`@${user.username}`}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleOpenEdit}>
              <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
              Edit User
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={UserIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={user.status === "active" ? "default" : "secondary"}>
                  {user.status}
                </Badge>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={UserShield01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Roles</p>
                <p className="text-2xl font-bold">{userRoles.length || "-"}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={Building01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p className="text-sm font-bold truncate max-w-[150px]">{company?.name || "-"}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                <p className="text-sm font-bold">{user.last_login ? formatDateShort(user.last_login) : "Never"}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Custom Permissions</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-muted-foreground">Full Name</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.full_name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-muted-foreground">Username</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">@{user.username}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-muted-foreground">Legacy Role</span>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700">
                    <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700">
                    <HugeiconsIcon icon={Call02Icon} className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.phone || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700">
                    <HugeiconsIcon icon={Building01Icon} className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{company?.name || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Member Since</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDateShort(user.created_at)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Employment Tab */}
          <TabsContent value="employment" className="mt-4">
            {employeeLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
              </div>
            ) : !linkedEmployee ? (
              <Card className="p-6">
                <div className="text-center py-12 text-muted-foreground">
                  <HugeiconsIcon icon={Briefcase01Icon} className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No employee record linked</p>
                  <p className="text-sm mt-1">This user account is not linked to any HR employee record.</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Employment Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-muted-foreground">Employee Code</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{linkedEmployee.employee_code}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-muted-foreground">Position</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{linkedEmployee.position}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-muted-foreground">Department</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{linkedEmployee.department}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-muted-foreground">Hire Date</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDateShort(linkedEmployee.hire_date)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-muted-foreground">Employment Status</span>
                      <Badge variant={linkedEmployee.employment_status === "ACTIVE" ? "default" : "secondary"}>
                        {linkedEmployee.employment_status}
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Compensation & Banking</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-muted-foreground">Basic Salary</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Rp {linkedEmployee.basic_salary?.toLocaleString("id-ID") || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-muted-foreground">Allowances</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Rp {linkedEmployee.allowances?.toLocaleString("id-ID") || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-muted-foreground">Total Salary</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        Rp {linkedEmployee.total_salary?.toLocaleString("id-ID") || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-muted-foreground">Bank Name</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{linkedEmployee.bank_name || "-"}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-muted-foreground">Bank Account</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{linkedEmployee.bank_account || "-"}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link href={`/hr/employees`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 mr-2" />
                        View Full Employee Record
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Assigned Roles</h3>
                  <p className="text-sm text-muted-foreground">Click a role to assign or revoke it from this user.</p>
                </div>
                <Badge variant="outline">{userRoles.length} assigned</Badge>
              </div>

              {rolesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allRoles.filter(r => r.is_active).map(role => {
                    const assigned = userRoleIds.has(role.id)
                    return (
                      <div
                        key={role.id}
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                          assigned
                            ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => handleToggleRole(role.id)}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100">{role.name}</span>
                            {role.is_system && <Badge variant="secondary" className="text-xs">System</Badge>}
                            <Badge variant="outline" className="text-xs">Level {role.level}</Badge>
                          </div>
                          {role.description && (
                            <p className="text-sm text-gray-500 mt-0.5">{role.description}</p>
                          )}
                        </div>
                        <div className={`h-5 w-5 rounded flex items-center justify-center ${
                          assigned
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-300 dark:bg-gray-700 dark:text-gray-500"
                        }`}>
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Custom Permissions</h3>
                  <p className="text-sm text-muted-foreground">Grant individual permissions beyond what this user&apos;s roles provide.</p>
                </div>
              </div>

              {permLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary bar */}
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {userDirectPerms.length} custom permissions granted
                    </span>
                    <div className="w-48 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: allPermissions.length > 0 ? `${(userDirectPerms.length / allPermissions.length) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search permissions by code or description..."
                      value={permSearch}
                      onChange={e => setPermSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Module tabs */}
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant={activeModule === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveModule("all")}
                    >
                      All ({userDirectPerms.length}/{allPermissions.length})
                    </Button>
                    {MODULES.filter(m => modulePermCounts[m]).map(m => {
                      const counts = modulePermCounts[m]
                      const allGranted = counts.granted === counts.total && counts.total > 0
                      return (
                        <Button
                          key={m}
                          variant={activeModule === m ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveModule(m)}
                          className={activeModule !== m && allGranted ? "border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-400" : ""}
                        >
                          {m} ({counts.granted}/{counts.total})
                        </Button>
                      )
                    })}
                  </div>

                  {/* Grant/Revoke all in module */}
                  {activeModule !== "all" && modulePermCounts[activeModule] && (
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {modulePermCounts[activeModule].granted} of {modulePermCounts[activeModule].total} permissions
                        </span>
                        <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${(modulePermCounts[activeModule].granted / modulePermCounts[activeModule].total) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {modulePermCounts[activeModule].granted < modulePermCounts[activeModule].total && (
                          <Button size="sm" variant="outline" onClick={() => handleGrantModule(activeModule)}>
                            Grant All
                          </Button>
                        )}
                        {modulePermCounts[activeModule].granted > 0 && (
                          <Button size="sm" variant="outline" onClick={() => handleRevokeModule(activeModule)}>
                            Revoke All
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Permissions table */}
                  <div className="overflow-auto border rounded-lg max-h-[500px]">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                        <tr>
                          <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Permission</th>
                          <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Module</th>
                          <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Resource</th>
                          <th className="text-left p-3 font-medium text-gray-600 dark:text-gray-400">Action</th>
                          <th className="text-center p-3 font-medium text-gray-600 dark:text-gray-400 w-20">Granted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPerms.map(perm => {
                          const granted = grantedPermIds.has(perm.id)
                          return (
                            <tr
                              key={perm.id}
                              className={`border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${granted ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                              onClick={() => handleTogglePerm(perm)}
                            >
                              <td className="p-3">
                                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                  {perm.code}
                                </code>
                              </td>
                              <td className="p-3 text-gray-600 dark:text-gray-400">{perm.module}</td>
                              <td className="p-3 text-gray-600 dark:text-gray-400">{perm.resource}</td>
                              <td className="p-3 text-gray-600 dark:text-gray-400">{perm.action}</td>
                              <td className="p-3 text-center">
                                <div className={`inline-flex h-5 w-5 items-center justify-center rounded ${granted ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-300 dark:bg-gray-700 dark:text-gray-500"}`}>
                                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-3.5 w-3.5" />
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                        {filteredPerms.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">No permissions found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="mt-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Activity Log</h3>
                  <p className="text-sm text-muted-foreground">All actions performed by this user across the system.</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadAuditLog}>
                  Refresh
                </Button>
              </div>

              {auditLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
                </div>
              ) : activityLog.length === 0 && rbacAuditLog.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <HugeiconsIcon icon={Clock01Icon} className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No activity recorded</p>
                  <p className="text-sm">User actions will appear here as they use the system.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {/* General Activity Entries */}
                  {(() => {
                    // Combine both sources into a unified list sorted by time
                    type CombinedEntry = {
                      id: string
                      type: "activity" | "rbac"
                      timestamp: string
                      data: AuditLogEntry | AuditEntry
                    }

                    const combined: CombinedEntry[] = [
                      ...activityLog.map(e => ({
                        id: e.id,
                        type: "activity" as const,
                        timestamp: e.created_at,
                        data: e,
                      })),
                      ...rbacAuditLog.map(e => ({
                        id: e.id,
                        type: "rbac" as const,
                        timestamp: e.created_at,
                        data: e,
                      })),
                    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

                    return combined.map(item => {
                      if (item.type === "activity") {
                        const entry = item.data as AuditLogEntry
                        const label = formatAuditAction(entry)
                        const methodColor = getMethodColor(entry.method)

                        return (
                          <div
                            key={`a-${item.id}`}
                            className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                          >
                            <div className="mt-0.5">
                              <span className={`inline-flex items-center justify-center h-7 px-2 rounded text-xs font-mono font-medium ${methodColor}`}>
                                {entry.method}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                                {entry.path}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDate(entry.created_at)}
                              </span>
                              {entry.ip_address && (
                                <p className="text-xs text-muted-foreground mt-0.5">{entry.ip_address}</p>
                              )}
                            </div>
                          </div>
                        )
                      } else {
                        const entry = item.data as AuditEntry
                        const isActor = entry.actor_id === user.id
                        const actionLabels: Record<string, string> = {
                          role_assigned: "Role assigned",
                          role_revoked: "Role revoked",
                          user_permission_granted: "Permission granted",
                          user_permission_revoked: "Permission revoked",
                        }
                        const label = actionLabels[entry.action] || entry.action

                        return (
                          <div
                            key={`r-${item.id}`}
                            className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                          >
                            <div className="mt-0.5">
                              <span className="inline-flex items-center justify-center h-7 px-2 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                RBAC
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {isActor ? "Performed by this user" : "Applied to this user"}
                                {entry.target_role_id && ` \u2022 Role: ${entry.target_role_id}`}
                                {entry.target_permission_id && ` \u2022 Permission: ${entry.target_permission_id}`}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                              {formatDate(entry.created_at)}
                            </span>
                          </div>
                        )
                      }
                    })
                  })()}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user profile information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-full-name">Full Name</Label>
                <Input
                  id="edit-full-name"
                  value={editForm.full_name}
                  onChange={e => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editForm.phone}
                    onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Company</Label>
                  <Select
                    value={editForm.company_id}
                    onValueChange={v => setEditForm(prev => ({ ...prev, company_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={v => setEditForm(prev => ({ ...prev, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editForm.password}
                  onChange={e => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TwoLevelLayout>
  )
}
