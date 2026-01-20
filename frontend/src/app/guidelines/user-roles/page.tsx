"use client"

import * as React from "react"
import Link from "next/link"
import { GuidelinesLayout } from "@/components/ui/guidelines-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight,
  ArrowLeft,
  Crown,
  User,
  Users,
  Shield,
  Eye,
  Edit,
  Trash2,
  CheckCircle
} from "lucide-react"

interface UserRole {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  permissions: string[]
  modules: string[]
  level: "executive" | "manager" | "operator" | "viewer"
}

const userRoles: UserRole[] = [
  {
    id: "super-admin",
    name: "Super Administrator",
    description: "Full system access with all administrative privileges",
    icon: Crown,
    permissions: ["Full Access", "User Management", "System Configuration", "Data Export", "Audit Access"],
    modules: ["All Modules", "System Settings", "User Management", "Audit Logs"],
    level: "executive"
  },
  {
    id: "admin",
    name: "Administrator",
    description: "Administrative access with user and system management capabilities",
    icon: Shield,
    permissions: ["User Management", "Module Configuration", "Data Import/Export", "Report Access"],
    modules: ["All Business Modules", "User Management", "Module Settings"],
    level: "executive"
  },
  {
    id: "finance-manager",
    name: "Finance Manager",
    description: "Full access to financial modules and reporting",
    icon: User,
    permissions: ["Financial Data", "Accounting Reports", "Cost Center Management", "Budget Control"],
    modules: ["Accounting", "Reports", "Cost Centers", "Financial Analytics"],
    level: "manager"
  },
  {
    id: "sales-manager",
    name: "Sales Manager",
    description: "Sales operations management and team supervision",
    icon: User,
    permissions: ["Sales Data", "Customer Management", "Sales Reports", "Team Management"],
    modules: ["Sales", "Customers", "Reports", "POS Management"],
    level: "manager"
  },
  {
    id: "inventory-manager",
    name: "Inventory Manager",
    description: "Inventory control and warehouse operations management",
    icon: User,
    permissions: ["Inventory Control", "Warehouse Management", "Stock Reports", "Supplier Management"],
    modules: ["Inventory", "Warehouses", "Suppliers", "Stock Reports"],
    level: "manager"
  },
  {
    id: "hr-manager",
    name: "HR Manager",
    description: "Human resources and employee management",
    icon: Users,
    permissions: ["Employee Management", "Payroll Processing", "HR Reports", "Performance Management"],
    modules: ["HR Management", "Employees", "Payroll", "Attendance"],
    level: "manager"
  },
  {
    id: "sales-staff",
    name: "Sales Staff",
    description: "Sales operations and customer service",
    icon: User,
    permissions: ["POS Operations", "Customer Service", "Sales Entry", "Basic Reports"],
    modules: ["POS", "Sales", "Customers", "Basic Reports"],
    level: "operator"
  },
  {
    id: "warehouse-staff",
    name: "Warehouse Staff",
    description: "Inventory operations and stock management",
    icon: User,
    permissions: ["Stock Operations", "Goods Receipt", "Stock Transfer", "Barcode Scanning"],
    modules: ["Inventory", "Stock Control", "Goods Receipt", "Stock Transfer"],
    level: "operator"
  },
  {
    id: "accountant",
    name: "Accountant",
    description: "Accounting operations and financial data entry",
    icon: User,
    permissions: ["Journal Entries", "Invoice Processing", "Financial Reports", "Tax Management"],
    modules: ["Accounting", "Invoices", "Financial Reports", "Tax Management"],
    level: "operator"
  },
  {
    id: "viewer",
    name: "Viewer/Auditor",
    description: "Read-only access for monitoring and auditing",
    icon: Eye,
    permissions: ["View Data", "Generate Reports", "Export Data", "Audit Access"],
    modules: ["All Modules (Read-only)", "Reports", "Analytics"],
    level: "viewer"
  }
]

export default function UserRolesPage() {
  const getLevelBadge = (level: string) => {
    switch (level) {
      case "executive":
        return { variant: "destructive" as const, color: "bg-red-500", icon: Crown }
      case "manager":
        return { variant: "default" as const, color: "bg-blue-500", icon: Shield }
      case "operator":
        return { variant: "secondary" as const, color: "bg-green-500", icon: User }
      case "viewer":
        return { variant: "outline" as const, color: "bg-gray-500", icon: Eye }
      default:
        return { variant: "outline" as const, color: "bg-gray-500", icon: User }
    }
  }

  return (
    <GuidelinesLayout>
      <div className="container py-8 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link href="/guidelines" className="text-muted-foreground hover:text-foreground">
            Guidelines
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">User Roles & Permissions</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="secondary">Intermediate</Badge>
            <Badge variant="outline">45 min read</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-4">User Roles & Permissions</h1>
          <p className="text-xl text-muted-foreground">
            Understand the different user roles, permission levels, and access control mechanisms 
            in Malaka ERP. Learn how to effectively manage team access and maintain security.
          </p>
        </div>

        {/* Permission Levels Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Permission Levels</CardTitle>
            <CardDescription>
              Malaka ERP uses a hierarchical permission system with four main levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                <Crown className="h-8 w-8 mx-auto mb-2 text-red-600 dark:text-red-400" />
                <div className="font-semibold text-red-900 dark:text-red-100">Executive</div>
                <div className="text-xs text-red-700 dark:text-red-300 mt-1">Full System Control</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <div className="font-semibold text-blue-900 dark:text-blue-100">Manager</div>
                <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">Department Control</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <User className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <div className="font-semibold text-green-900 dark:text-green-100">Operator</div>
                <div className="text-xs text-green-700 dark:text-green-300 mt-1">Operational Tasks</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <Eye className="h-8 w-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                <div className="font-semibold text-gray-900 dark:text-gray-100">Viewer</div>
                <div className="text-xs text-gray-700 dark:text-gray-300 mt-1">Read-only Access</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Roles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Available User Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userRoles.map((role) => {
              const Icon = role.icon
              const levelBadge = getLevelBadge(role.level)
              const LevelIcon = levelBadge.icon

              return (
                <Card 
                  key={role.id}
                  className="hover: transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{role.name}</CardTitle>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <LevelIcon className="h-4 w-4" />
                        <Badge variant={levelBadge.variant} className="capitalize text-xs">
                          {role.level}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      {role.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Permissions */}
                      <div>
                        <div className="text-sm font-medium mb-2">Key Permissions:</div>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((permission, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Modules */}
                      <div>
                        <div className="text-sm font-medium mb-2">Module Access:</div>
                        <div className="text-xs text-muted-foreground">
                          {role.modules.slice(0, 2).join(", ")}
                          {role.modules.length > 2 && ` +${role.modules.length - 2} more`}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Permission Matrix */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>
              Quick reference for common actions across different roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Action</th>
                    <th className="text-center p-3">Executive</th>
                    <th className="text-center p-3">Manager</th>
                    <th className="text-center p-3">Operator</th>
                    <th className="text-center p-3">Viewer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3">View Data</td>
                    <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Create Records</td>
                    <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3"><span className="text-muted-foreground">-</span></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Edit Records</td>
                    <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3"><span className="text-muted-foreground">-</span></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Delete Records</td>
                    <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3"><span className="text-muted-foreground">Limited</span></td>
                    <td className="text-center p-3"><span className="text-muted-foreground">-</span></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Manage Users</td>
                    <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3"><span className="text-muted-foreground">Limited</span></td>
                    <td className="text-center p-3"><span className="text-muted-foreground">-</span></td>
                    <td className="text-center p-3"><span className="text-muted-foreground">-</span></td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">System Settings</td>
                    <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-3"><span className="text-muted-foreground">-</span></td>
                    <td className="text-center p-3"><span className="text-muted-foreground">-</span></td>
                    <td className="text-center p-3"><span className="text-muted-foreground">-</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card className="mb-12 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">🛡️ Security Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-blue-800 dark:text-blue-200">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                <span><strong>Principle of Least Privilege:</strong> Give users only the minimum permissions they need to perform their job functions.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                <span><strong>Regular Access Reviews:</strong> Periodically review and update user permissions, especially when roles change.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                <span><strong>Segregation of Duties:</strong> Ensure critical processes require multiple people to complete (e.g., approvals).</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                <span><strong>Audit Trail:</strong> Monitor user activities through comprehensive audit logs and regular reviews.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href="/guidelines/modules">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Module Guides
            </Link>
          </Button>
          <Button asChild>
            <Link href="/guidelines/administration">
              System Administration
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </GuidelinesLayout>
  )
}