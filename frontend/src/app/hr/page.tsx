"use client"

import * as React from "react"
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  UserGroupIcon,
  CheckmarkCircle01Icon,
  Calendar01Icon,
  StarIcon,
  GraduationScrollIcon,
  StoreIcon
} from '@hugeicons/core-free-icons'

const hrModules = [
  {
    title: 'Employees',
    description: 'Manage employee information, profiles, and organizational structure',
    href: '/hr/employees',
    stats: '156 active employees',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Payroll',
    description: 'Process payroll, manage salaries, and handle compensation',
    href: '/hr/payroll',
    stats: 'Next run: Jul 31',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Attendance',
    description: 'Track employee attendance, working hours, and time management',
    href: '/hr/attendance',
    stats: 'Today: 142 checked in',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Leave Management',
    description: 'Handle leave requests, vacation planning, and time-off policies',
    href: '/hr/leave',
    stats: '12 pending requests',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Performance',
    description: 'Evaluate employee performance, set goals, and track achievements',
    href: '/hr/performance',
    stats: 'Q2 reviews: 85% complete',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Training',
    description: 'Organize training programs, track certifications, and skill development',
    href: '/hr/training',
    stats: '8 active programs',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'SPG Stores',
    description: 'Manage Sales Promotion Girls and store assignments',
    href: '/hr/spg-stores',
    stats: '24 stores covered',
    color: 'bg-gray-100 text-gray-600'
  }
]

export default function HRPage() {
  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="HR Management"
          description="Manage personnel, attendance, and organizational culture"
          breadcrumbs={[{ label: 'HR Management', href: '/hr' }]}
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">156</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={UserGroupIcon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Active full-time staff
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present Today</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">142</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                91% attendance rate
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">On Leave</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">8</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={Calendar01Icon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Approved leave requests
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Hires</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">4</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={GraduationScrollIcon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                This month
              </div>
            </div>
          </div>

          {/* HR Modules */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">HR Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hrModules.map((module) => (
                <Card key={module.title} className="p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{module.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>
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
              ))}
            </div>
          </div>

          {/* HR Alerts (Optional placeholder if needed in future, currently kept minimal as per previous requests) */}
        </div>
      </div>
    </TwoLevelLayout>
  )
}
