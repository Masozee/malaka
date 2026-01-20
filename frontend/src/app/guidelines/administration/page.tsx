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
  Settings,
  Database,
  Shield,
  Globe,
  Monitor,
  HardDrive,
  Users,
  AlertTriangle
} from "lucide-react"

export default function AdministrationPage() {
  return (
    <GuidelinesLayout>
      <div className="container py-8 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link href="/guidelines" className="text-muted-foreground hover:text-foreground">
            Guidelines
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">System Administration</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="destructive">Advanced</Badge>
            <Badge variant="outline">1.5 hours</Badge>
            <Badge variant="secondary">In Progress</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-4">System Administration</h1>
          <p className="text-xl text-muted-foreground">
            Advanced system configuration, maintenance procedures, and administrative tasks 
            for managing the Malaka ERP system infrastructure and operations.
          </p>
        </div>

        {/* Warning */}
        <Card className="mb-8 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Administrator Access Required</h3>
                <p className="text-red-800 dark:text-red-200">
                  The procedures in this guide require administrator privileges and can affect system-wide operations. 
                  Proceed with caution and always backup critical data before making changes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Administration Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="hover: transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-500" />
                <span>System Configuration</span>
              </CardTitle>
              <CardDescription>
                Core system settings and configuration management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Global system preferences</li>
                <li>• Module-specific configurations</li>
                <li>• Business rules and workflows</li>
                <li>• Integration settings</li>
              </ul>
              <Button className="w-full mt-4">
                Configure System
              </Button>
            </CardContent>
          </Card>

          <Card className="hover: transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-500" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>
                Manage users, roles, and access permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• User account management</li>
                <li>• Role and permission assignment</li>
                <li>• Password policies</li>
                <li>• Session management</li>
              </ul>
              <Button className="w-full mt-4">
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card className="hover: transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-purple-500" />
                <span>Database Management</span>
              </CardTitle>
              <CardDescription>
                Database maintenance and optimization tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Database backup and restore</li>
                <li>• Performance optimization</li>
                <li>• Index maintenance</li>
                <li>• Data cleanup procedures</li>
              </ul>
              <Button className="w-full mt-4">
                Database Tools
              </Button>
            </CardContent>
          </Card>

          <Card className="hover: transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-500" />
                <span>Security & Compliance</span>
              </CardTitle>
              <CardDescription>
                Security policies and compliance management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Security policy configuration</li>
                <li>• Audit log management</li>
                <li>• Compliance reporting</li>
                <li>• Data privacy controls</li>
              </ul>
              <Button className="w-full mt-4">
                Security Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="hover: transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-orange-500" />
                <span>Integration Management</span>
              </CardTitle>
              <CardDescription>
                External system integrations and APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• API endpoint configuration</li>
                <li>• Third-party integrations</li>
                <li>• Data synchronization</li>
                <li>• Webhook management</li>
              </ul>
              <Button className="w-full mt-4">
                Integration Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="hover: transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5 text-indigo-500" />
                <span>System Monitoring</span>
              </CardTitle>
              <CardDescription>
                Performance monitoring and system health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• System performance metrics</li>
                <li>• Resource usage monitoring</li>
                <li>• Alert configuration</li>
                <li>• Health check dashboards</li>
              </ul>
              <Button className="w-full mt-4">
                Monitor System
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Daily Maintenance Tasks */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Daily Maintenance Checklist</CardTitle>
            <CardDescription>
              Essential daily tasks for system administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Morning Tasks</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Check system health status</li>
                  <li>• Review overnight error logs</li>
                  <li>• Verify backup completion</li>
                  <li>• Monitor storage usage</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">End of Day</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Review audit logs</li>
                  <li>• Check performance metrics</li>
                  <li>• Verify security alerts</li>
                  <li>• Plan maintenance windows</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Procedures */}
        <Card className="mb-12 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="text-amber-900 dark:text-amber-100">🚨 Emergency Procedures</CardTitle>
            <CardDescription className="text-amber-800 dark:text-amber-200">
              Quick reference for critical system issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <HardDrive className="h-4 w-4" />
                  <span>System Downtime</span>
                </h4>
                <ol className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>1. Identify the root cause</li>
                  <li>2. Check system resources</li>
                  <li>3. Review recent changes</li>
                  <li>4. Implement immediate fixes</li>
                  <li>5. Communicate with users</li>
                </ol>
              </div>

              <div className="p-4 bg-background rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Security Incident</span>
                </h4>
                <ol className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>1. Isolate affected systems</li>
                  <li>2. Preserve evidence</li>
                  <li>3. Assess the impact</li>
                  <li>4. Notify stakeholders</li>
                  <li>5. Implement containment</li>
                </ol>
              </div>

              <div className="p-4 bg-background rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Data Corruption</span>
                </h4>
                <ol className="text-sm text-muted-foreground space-y-1 ml-6">
                  <li>1. Stop write operations</li>
                  <li>2. Assess corruption scope</li>
                  <li>3. Initiate backup restore</li>
                  <li>4. Verify data integrity</li>
                  <li>5. Resume operations</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Notice */}
        <Card className="mb-12 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              Detailed Administration Guide Coming Soon
            </h3>
            <p className="text-blue-800 dark:text-blue-200 mb-6">
              We're currently developing comprehensive administration documentation with 
              step-by-step procedures, troubleshooting guides, and best practices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline">
                Subscribe for Updates
              </Button>
              <Button>
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href="/guidelines/user-roles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              User Roles & Permissions
            </Link>
          </Button>
          <Button asChild>
            <Link href="/guidelines/troubleshooting">
              Troubleshooting
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </GuidelinesLayout>
  )
}