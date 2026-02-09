import { apiClient } from '@/lib/api'

export interface Role {
  id: string
  name: string
  description: string
  level: number
  is_system: boolean
  is_active: boolean
  company_id?: string
  created_at?: string
  updated_at?: string
}

export interface Permission {
  id: string
  code: string
  module: string
  resource: string
  action: string
  description: string
  is_active: boolean
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
  role_name?: string
  assigned_at: string
  assigned_by?: string
  expires_at?: string
}

export interface RolePermission {
  id: string
  role_id: string
  permission_id: string
  granted_at: string
  granted_by?: string
  permission_code: string
}

export interface UserPermission {
  id: string
  user_id: string
  permission_id: string
  granted_at: string
  granted_by?: string
  expires_at?: string
  permission_code: string
}

export interface AuditEntry {
  id: string
  action: string
  actor_id: string
  target_user_id?: string
  target_role_id?: string
  target_permission_id?: string
  details?: Record<string, unknown>
  ip_address?: string
  created_at: string
}

class RBACService {
  // Roles
  async getRoles(): Promise<Role[]> {
    const res = await apiClient.get<{ data: Role[] }>('/api/v1/admin/rbac/roles')
    return res.data
  }

  async getRole(id: string): Promise<{ role: Role; permissions: RolePermission[] }> {
    const res = await apiClient.get<{ data: { role: Role; permissions: RolePermission[] } }>(`/api/v1/admin/rbac/roles/${id}`)
    return res.data
  }

  async createRole(data: { name: string; description?: string; level?: number }): Promise<Role> {
    const res = await apiClient.post<{ data: Role }>('/api/v1/admin/rbac/roles', data)
    return res.data
  }

  async updateRole(id: string, data: { name?: string; description?: string; level?: number; is_active?: boolean }): Promise<Role> {
    const res = await apiClient.put<{ data: Role }>(`/api/v1/admin/rbac/roles/${id}`, data)
    return res.data
  }

  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/rbac/roles/${id}`)
  }

  // Permissions
  async getPermissions(module?: string): Promise<Permission[]> {
    const query = module ? `?module=${module}` : ''
    const res = await apiClient.get<{ data: Permission[] }>(`/api/v1/admin/rbac/permissions${query}`)
    return res.data
  }

  // Role-Permission management
  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    await apiClient.post(`/api/v1/admin/rbac/roles/${roleId}/permissions`, { permission_ids: permissionIds })
  }

  async revokePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/rbac/roles/${roleId}/permissions/${permissionId}`)
  }

  // User-Role management
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const res = await apiClient.get<{ data: UserRole[] }>(`/api/v1/admin/rbac/users/${userId}/roles`)
    return res.data
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    await apiClient.post(`/api/v1/admin/rbac/users/${userId}/roles`, { role_id: roleId })
  }

  async revokeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/rbac/users/${userId}/roles/${roleId}`)
  }

  // User-Permission direct assignments
  async getUserDirectPermissions(userId: string): Promise<UserPermission[]> {
    const res = await apiClient.get<{ data: UserPermission[] }>(`/api/v1/admin/rbac/users/${userId}/permissions`)
    return res.data
  }

  async grantPermissionsToUser(userId: string, permissionIds: string[]): Promise<void> {
    await apiClient.post(`/api/v1/admin/rbac/users/${userId}/permissions`, { permission_ids: permissionIds })
  }

  async revokePermissionFromUser(userId: string, permissionId: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/rbac/users/${userId}/permissions/${permissionId}`)
  }

  // Audit log
  async getAuditLog(): Promise<AuditEntry[]> {
    const res = await apiClient.get<{ data: AuditEntry[] }>('/api/v1/admin/rbac/audit-log')
    return res.data
  }

  async getUserAuditLog(userId: string): Promise<AuditEntry[]> {
    const res = await apiClient.get<{ data: AuditEntry[] }>(`/api/v1/admin/rbac/users/${userId}/audit-log`)
    return res.data
  }

  // Current user permissions
  async getMyPermissions(): Promise<{ user_id: string; roles: string[]; permissions: Record<string, boolean>; is_superadmin: boolean }> {
    const res = await apiClient.get<{ data: { user_id: string; roles: string[]; permissions: Record<string, boolean>; is_superadmin: boolean } }>('/api/v1/auth/permissions')
    return res.data
  }
}

export const rbacService = new RBACService()
