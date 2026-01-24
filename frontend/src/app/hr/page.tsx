'use client'

import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import Link from 'next/link'

const hrModules = [
  {
    title: 'Employees',
    description: 'Manage employee information, profiles, and organizational structure',
    href: '/hr/employees',
    stats: '156 active employees',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Payroll',
    description: 'Process payroll, manage salaries, and handle compensation',
    href: '/hr/payroll',
    stats: 'Next run: Jul 31',
    color: 'bg-green-100 text-green-600'
  },
  {
    title: 'Attendance',
    description: 'Track employee attendance, working hours, and time management',
    href: '/hr/attendance',
    stats: 'Today: 142 checked in',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    title: 'Leave Management',
    description: 'Handle leave requests, vacation planning, and time-off policies',
    href: '/hr/leave',
    stats: '12 pending requests',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    title: 'Performance',
    description: 'Evaluate employee performance, set goals, and track achievements',
    href: '/hr/performance',
    stats: 'Q2 reviews: 85% complete',
    color: 'bg-red-100 text-red-600'
  },
  {
    title: 'Training',
    description: 'Organize training programs, track certifications, and skill development',
    href: '/hr/training',
    stats: '8 active programs',
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    title: 'SPG Stores',
    description: 'Manage Sales Promotion Girls and store assignments',
    href: '/hr/spg-stores',
    stats: '24 stores covered',
    color: 'bg-pink-100 text-pink-600'
  }
]

export default function HRPage() {
  const breadcrumbs = [
    { label: 'HR Management', href: '/hr' }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="HR Management"
          breadcrumbs={breadcrumbs}
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Present Today</p>
                  <p className="text-2xl font-bold">142</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">On Leave</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">New Hires (This Month)</p>
                  <p className="text-2xl font-bold">4</p>
                </div>
              </div>
            </Card>
          </div>

          {/* HR Modules */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">HR Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hrModules.map((module) => {
              return (
                <Card key={module.title} className="p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${module.color}`}>
                    </div>
                    <Link href={module.href}>
                      <Button variant="ghost" size="sm" aria-label={`Go to ${module.title}`}>
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">{module.title}</h3>
                    <p className="text-sm text-gray-600">{module.description}</p>
                    <p className="text-xs text-gray-500">{module.stats}</p>
                  </div>

                  <div className="mt-4">
                    <Link href={module.href}>
                      <Button variant="outline" size="sm" className="w-full">
                        View {module.title}
                      </Button>
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Add New Employee</p>
                  <p className="text-sm text-gray-500">Register a new team member</p>
                </div>
                <Link href="/hr/employees/new">
                  <Button size="sm">Add</Button>
                </Link>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Process Payroll</p>
                  <p className="text-sm text-gray-500">Run monthly payroll</p>
                </div>
                <Link href="/hr/payroll">
                  <Button size="sm">Process</Button>
                </Link>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Review Leave Requests</p>
                  <p className="text-sm text-gray-500">12 pending approvals</p>
                </div>
                <Link href="/hr/leave">
                  <Button size="sm">Review</Button>
                </Link>
              </div>
            </Card>
          </div>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
