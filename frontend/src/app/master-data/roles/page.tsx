'use client'

import * as React from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast, toast } from '@/components/ui/toast'
import { rbacService, Role, Permission, RolePermission } from '@/services/rbac'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PlusSignIcon,
  Search01Icon,
  PencilEdit01Icon,
  Delete01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  UserShield01Icon,
  MoreVerticalIcon,
} from '@hugeicons/core-free-icons'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// Permission modules for grouping
const MODULES = [
  'masterdata', 'accounting', 'inventory', 'sales', 'shipping',
  'finance', 'tax', 'hr', 'procurement', 'production', 'calendar',
  'notifications', 'invitations', 'profile', 'settings', 'admin',
]

export default function RolesPage() {
  const [roles, setRoles] = React.useState<Role[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const { addToast } = useToast()

  // Role form state
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingRole, setEditingRole] = React.useState<Role | null>(null)
  const [formData, setFormData] = React.useState({ name: '', description: '', level: 1 })
  const [formSaving, setFormSaving] = React.useState(false)

  // Permission management state
  const [permDialogOpen, setPermDialogOpen] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null)
  const [rolePermissions, setRolePermissions] = React.useState<RolePermission[]>([])
  const [allPermissions, setAllPermissions] = React.useState<Permission[]>([])
  const [permSearch, setPermSearch] = React.useState('')
  const [activeModule, setActiveModule] = React.useState<string>('all')
  const [permLoading, setPermLoading] = React.useState(false)

  // Fetch roles
  const fetchRoles = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await rbacService.getRoles()
      setRoles(data || [])
    } catch (error) {
      console.error('Error fetching roles:', error)
      addToast(toast.error('Failed to fetch roles', 'Please try again later.'))
    } finally {
      setLoading(false)
    }
  }, [addToast])

  React.useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  // Filter roles by search
  const filteredRoles = React.useMemo(() => {
    if (!search) return roles
    const q = search.toLowerCase()
    return roles.filter(
      r => r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
    )
  }, [roles, search])

  // Role form handlers
  const handleOpenCreate = () => {
    setEditingRole(null)
    setFormData({ name: '', description: '', level: 1 })
    setFormOpen(true)
  }

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role)
    setFormData({ name: role.name, description: role.description || '', level: role.level })
    setFormOpen(true)
  }

  const handleSaveRole = async () => {
    if (!formData.name.trim()) return
    setFormSaving(true)
    try {
      if (editingRole) {
        await rbacService.updateRole(editingRole.id, formData)
        addToast(toast.success('Role updated', `${formData.name} has been updated.`))
      } else {
        await rbacService.createRole(formData)
        addToast(toast.success('Role created', `${formData.name} has been created.`))
      }
      setFormOpen(false)
      fetchRoles()
    } catch (error) {
      console.error('Error saving role:', error)
      addToast(toast.error('Failed to save role', 'Please try again.'))
    } finally {
      setFormSaving(false)
    }
  }

  const handleDeleteRole = async (role: Role) => {
    if (role.is_system) {
      addToast(toast.error('Cannot delete', 'System roles cannot be deleted.'))
      return
    }
    if (!confirm(`Are you sure you want to delete "${role.name}"?`)) return
    try {
      await rbacService.deleteRole(role.id)
      addToast(toast.success('Role deleted', `${role.name} has been removed.`))
      fetchRoles()
    } catch (error) {
      console.error('Error deleting role:', error)
      addToast(toast.error('Failed to delete role', 'Please try again.'))
    }
  }

  const handleToggleActive = async (role: Role) => {
    try {
      await rbacService.updateRole(role.id, { is_active: !role.is_active })
      addToast(toast.success(
        role.is_active ? 'Role deactivated' : 'Role activated',
        `${role.name} has been ${role.is_active ? 'deactivated' : 'activated'}.`
      ))
      fetchRoles()
    } catch (error) {
      console.error('Error toggling role:', error)
      addToast(toast.error('Failed to update role', 'Please try again.'))
    }
  }

  // Permission management
  const handleOpenPermissions = async (role: Role) => {
    setSelectedRole(role)
    setPermDialogOpen(true)
    setPermLoading(true)
    setActiveModule('all')
    setPermSearch('')
    try {
      const [roleData, perms] = await Promise.all([
        rbacService.getRole(role.id),
        rbacService.getPermissions(),
      ])
      setRolePermissions(roleData.permissions || [])
      setAllPermissions(perms || [])
    } catch (error) {
      console.error('Error loading permissions:', error)
      addToast(toast.error('Failed to load permissions', 'Please try again.'))
    } finally {
      setPermLoading(false)
    }
  }

  // Superadmin (level >= 99) bypasses all permission checks — all permissions are implicitly granted
  const isSuperadmin = selectedRole ? selectedRole.level >= 99 : false

  // Set of permission IDs that are granted to this role
  // For Superadmin: all permissions are granted (implicit bypass)
  // For others: use the role_permissions join table
  const grantedPermissionIds = React.useMemo(
    () => isSuperadmin
      ? new Set(allPermissions.map(p => p.id))
      : new Set(rolePermissions.map(rp => rp.permission_id)),
    [rolePermissions, allPermissions, isSuperadmin]
  )

  const filteredPermissions = React.useMemo(() => {
    let perms = allPermissions
    if (activeModule !== 'all') {
      perms = perms.filter(p => p.module === activeModule)
    }
    if (permSearch) {
      const q = permSearch.toLowerCase()
      perms = perms.filter(p => p.code.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
    }
    return perms
  }, [allPermissions, activeModule, permSearch])

  const handleTogglePermission = async (perm: Permission) => {
    if (!selectedRole) return
    try {
      if (grantedPermissionIds.has(perm.id)) {
        await rbacService.revokePermissionFromRole(selectedRole.id, perm.id)
        setRolePermissions(prev => prev.filter(rp => rp.permission_id !== perm.id))
      } else {
        await rbacService.assignPermissionsToRole(selectedRole.id, [perm.id])
        // Add a synthetic RolePermission entry for immediate UI update
        setRolePermissions(prev => [...prev, {
          id: crypto.randomUUID(),
          role_id: selectedRole.id,
          permission_id: perm.id,
          granted_at: new Date().toISOString(),
          permission_code: perm.code,
        }])
      }
    } catch (error) {
      console.error('Error toggling permission:', error)
      addToast(toast.error('Failed to update permission', 'Please try again.'))
    }
  }

  const handleGrantModule = async (module: string) => {
    if (!selectedRole) return
    const modulePerms = allPermissions.filter(p => p.module === module && !grantedPermissionIds.has(p.id))
    if (modulePerms.length === 0) return
    try {
      await rbacService.assignPermissionsToRole(selectedRole.id, modulePerms.map(p => p.id))
      // Add synthetic RolePermission entries for immediate UI update
      const newEntries: RolePermission[] = modulePerms.map(p => ({
        id: crypto.randomUUID(),
        role_id: selectedRole.id,
        permission_id: p.id,
        granted_at: new Date().toISOString(),
        permission_code: p.code,
      }))
      setRolePermissions(prev => [...prev, ...newEntries])
      addToast(toast.success('Permissions granted', `All ${module} permissions assigned.`))
    } catch (error) {
      console.error('Error granting module:', error)
      addToast(toast.error('Failed to grant permissions', 'Please try again.'))
    }
  }

  const handleRevokeModule = async (module: string) => {
    if (!selectedRole) return
    const modulePerms = allPermissions.filter(p => p.module === module && grantedPermissionIds.has(p.id))
    if (modulePerms.length === 0) return
    try {
      await Promise.all(modulePerms.map(p => rbacService.revokePermissionFromRole(selectedRole.id, p.id)))
      const revokedIds = new Set(modulePerms.map(p => p.id))
      setRolePermissions(prev => prev.filter(rp => !revokedIds.has(rp.permission_id)))
      addToast(toast.success('Permissions revoked', `All ${module} permissions removed.`))
    } catch (error) {
      console.error('Error revoking module:', error)
      addToast(toast.error('Failed to revoke permissions', 'Please try again.'))
    }
  }

  // Group permissions by module for count display
  const modulePermCounts = React.useMemo(() => {
    const counts: Record<string, { total: number; granted: number }> = {}
    for (const p of allPermissions) {
      if (!counts[p.module]) counts[p.module] = { total: 0, granted: 0 }
      counts[p.module].total++
      if (grantedPermissionIds.has(p.id)) counts[p.module].granted++
    }
    return counts
  }, [allPermissions, grantedPermissionIds])

  const totalGranted = isSuperadmin ? allPermissions.length : rolePermissions.length

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Roles & Permissions"
          description="Manage user roles, assign permissions, and control access across all modules"
          breadcrumbs={[
            { label: 'Master Data', href: '/master-data' },
            { label: 'Roles & Permissions' },
          ]}
          actions={
            <Button onClick={handleOpenCreate}>
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          }
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Roles</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{roles.length}</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">{roles.filter(r => r.is_system).length} system roles</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Roles</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{roles.filter(r => r.is_active).length}</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">{roles.filter(r => !r.is_active).length} inactive</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Custom Roles</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{roles.filter(r => !r.is_system).length}</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">User-created roles</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Modules</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{MODULES.length}</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Permission modules</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-64">
            <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search roles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800"
            />
          </div>

          {/* Roles List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
            </div>
          ) : filteredRoles.length === 0 ? (
            <Card className="p-12 text-center">
              <HugeiconsIcon icon={UserShield01Icon} className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No roles found</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoles.map(role => (
                <Card key={role.id} className="p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{role.name}</h3>
                      {role.is_system && (
                        <Badge variant="secondary" className="text-xs">System</Badge>
                      )}
                    </div>
                    <Badge variant={role.is_active ? 'default' : 'secondary'}>
                      {role.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {role.description || 'No description'}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">Level: {role.level}</p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenPermissions(role)}
                    >
                      <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3 mr-1" />
                      Manage Permissions
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="px-2">
                          <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(role)}>
                          <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(role)}>
                          <HugeiconsIcon icon={role.is_active ? Cancel01Icon : CheckmarkCircle01Icon} className="h-4 w-4 mr-2" />
                          {role.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteRole(role)}
                          disabled={role.is_system}
                          className="text-red-600 focus:text-red-600"
                        >
                          <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
                          Delete Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Role Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Finance Manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the role's purpose and scope"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                type="number"
                min={1}
                max={98}
                value={formData.level}
                onChange={e => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
              />
              <p className="text-xs text-gray-500">Higher level = more authority (1-98). Level 99 is reserved for Superadmin.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRole} disabled={formSaving || !formData.name.trim()}>
              {formSaving ? 'Saving...' : editingRole ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Management Dialog */}
      <Dialog open={permDialogOpen} onOpenChange={setPermDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Permissions for {selectedRole?.name}
              {selectedRole?.is_system && (
                <Badge variant="secondary" className="ml-2 text-xs">System Role</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {permLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col gap-4">
              {/* Superadmin notice */}
              {isSuperadmin && (
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                  <div className="flex-1">
                    <p className="font-medium text-green-800 dark:text-green-300">Superadmin Role</p>
                    <p className="text-sm text-green-700 dark:text-green-400">This role bypasses all permission checks. All permissions are implicitly granted and cannot be individually toggled.</p>
                  </div>
                </div>
              )}

              {/* Summary bar */}
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {totalGranted} of {allPermissions.length} permissions granted
                </span>
                <div className="w-48 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: allPermissions.length > 0 ? `${(totalGranted / allPermissions.length) * 100}%` : '0%' }}
                  />
                </div>
              </div>

              {/* Permission search */}
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
                  variant={activeModule === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveModule('all')}
                >
                  All ({totalGranted}/{allPermissions.length})
                </Button>
                {MODULES.filter(m => modulePermCounts[m]).map(m => {
                  const counts = modulePermCounts[m]
                  const allGranted = counts.granted === counts.total
                  return (
                    <Button
                      key={m}
                      variant={activeModule === m ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveModule(m)}
                      className={activeModule !== m && allGranted ? 'border-green-300 text-green-700 dark:border-green-600 dark:text-green-400' : ''}
                    >
                      {m} ({counts.granted}/{counts.total})
                    </Button>
                  )
                })}
              </div>

              {/* Grant/Revoke all in module */}
              {activeModule !== 'all' && modulePermCounts[activeModule] && (
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {modulePermCounts[activeModule].granted} of {modulePermCounts[activeModule].total} permissions granted
                    </span>
                    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(modulePermCounts[activeModule].granted / modulePermCounts[activeModule].total) * 100}%` }}
                      />
                    </div>
                  </div>
                  {!isSuperadmin && (
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
                  )}
                </div>
              )}

              {/* Permissions list */}
              <div className="flex-1 overflow-auto border rounded-lg">
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
                    {filteredPermissions.map(perm => {
                      const granted = grantedPermissionIds.has(perm.id)
                      return (
                        <tr
                          key={perm.id}
                          className={`border-t border-gray-100 dark:border-gray-700 ${isSuperadmin ? '' : 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'} ${granted ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}
                          onClick={isSuperadmin ? undefined : () => handleTogglePermission(perm)}
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
                            <div className={`inline-flex h-5 w-5 items-center justify-center rounded ${granted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300 dark:bg-gray-700 dark:text-gray-500'}`}>
                              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-3.5 w-3.5" />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredPermissions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">No permissions found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TwoLevelLayout>
  )
}
