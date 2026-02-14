"use client"

import * as React from "react"
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  MoneySendSquareIcon,
  PiggyBankIcon,
  ChartIncreaseIcon,
  Clock01Icon,
} from '@hugeicons/core-free-icons'
import { FINANCE_GROUPS } from '@/config/finance-menu'
import { BookmarkToggle } from '@/components/ui/bookmark-toggle'

export default function FinancePage() {
  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Finance"
          description="Treasury management, budgeting, and financial planning"
          breadcrumbs={[{ label: 'Finance', href: '/finance' }]}
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cash Position</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rp 4.2B</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={MoneySendSquareIcon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+12.3%</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget Utilization</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">68%</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={PiggyBankIcon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Rp 2.8B of Rp 4.1B spent
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue MTD</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rp 1.6B</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={ChartIncreaseIcon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+8.5%</span>
                <span className="text-sm text-gray-500 ml-1">vs target</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Outstanding Loans</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rp 1.2B</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={Clock01Icon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Next payment: Feb 28
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Quick Actions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Common financial operations and shortcuts</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Cash Transfer</p>
                    <p className="text-sm text-gray-500">Move funds between accounts</p>
                  </div>
                  <Link href="/finance/cash-treasury">
                    <Button size="sm">Transfer</Button>
                  </Link>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Budget Review</p>
                    <p className="text-sm text-gray-500">Check budget vs actuals</p>
                  </div>
                  <Link href="/finance/budgeting">
                    <Button size="sm">Review</Button>
                  </Link>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Generate Report</p>
                    <p className="text-sm text-gray-500">Create financial statements</p>
                  </div>
                  <Link href="/finance/reports">
                    <Button size="sm">Create</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          {/* All Finance Modules grouped */}
          {FINANCE_GROUPS.map((group) => (
            <div key={group.id}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{group.label}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{group.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {group.items.map((item) => (
                  <Card key={item.id} className="p-5 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="h-9 w-9 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                        <HugeiconsIcon icon={item.icon} className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </div>
                      <BookmarkToggle itemId={item.id} size="sm" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{item.label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{item.description}</p>
                    <Link href={item.href}>
                      <Button variant="outline" size="sm" className="w-full">
                        Open {item.label}
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* Alerts */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Alerts</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Important notifications and action items requiring attention</p>
            <Card className="p-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800">Budget Overrun Warning</p>
                    <p className="text-sm text-yellow-700">Marketing department at 92% of quarterly budget</p>
                  </div>
                  <Link href="/finance/budgeting">
                    <Button variant="outline" size="sm">Review</Button>
                  </Link>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-blue-800">Loan Payment Due</p>
                    <p className="text-sm text-blue-700">BCA facility installment due in 18 days - Rp 125M</p>
                  </div>
                  <Link href="/finance/loan-financing">
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-green-800">Cash Position Healthy</p>
                    <p className="text-sm text-green-700">All accounts above minimum threshold requirements</p>
                  </div>
                  <Link href="/finance/cash-treasury">
                    <Button variant="outline" size="sm">Details</Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
