"use client"

import * as React from "react"
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  BookOpen01Icon,
  FileEditIcon,
  CalculateIcon,
  Money03Icon,
  Building01Icon,
  ChartLineData01Icon,
  Coins01Icon,
  Invoice01Icon,
  AlertCircleIcon,
  ChartIncreaseIcon,
  Wallet01Icon,
  ChartUpIcon
} from '@hugeicons/core-free-icons'

const accountingModules = [
  {
    title: 'General Ledger',
    description: 'Manage chart of accounts and general ledger entries',
    href: '/accounting/general-ledger',
    stats: '1,247 entries this month',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Journal Entries',
    description: 'Create and manage accounting journal entries',
    href: '/accounting/journal',
    stats: '89 entries pending',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Trial Balance',
    description: 'Generate trial balance and balance sheet reports',
    href: '/accounting/trial-balance',
    stats: 'Last updated: Today',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Cash & Bank',
    description: 'Manage cash accounts and bank reconciliation',
    href: '/accounting/cash-bank',
    stats: '8 bank accounts',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Fixed Assets',
    description: 'Track and manage company fixed assets',
    href: '/accounting/fixed-assets',
    stats: '234 assets tracked',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Cost Centers',
    description: 'Manage departmental cost allocation and tracking',
    href: '/accounting/cost-centers',
    stats: '12 cost centers',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Currency Settings',
    description: 'Manage multi-currency and exchange rates',
    href: '/accounting/currency',
    stats: '5 currencies active',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Invoices',
    description: 'Create and manage customer invoices',
    href: '/accounting/invoices',
    stats: '156 invoices this month',
    color: 'bg-gray-100 text-gray-600'
  }
]

export default function AccountingPage() {
  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Accounting & Finance"
          description="Manage financial records, reporting, and compliance"
          breadcrumbs={[{ label: 'Accounting & Finance', href: '/accounting' }]}
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assets</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rp 15.2B</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={Wallet01Icon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-900 font-medium">+5.2%</span>
                <span className="text-sm text-gray-500 ml-1">vs last quarter</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rp 2.8B</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={ChartUpIcon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-900 font-medium">+12.8%</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cash Flow</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rp 890M</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={Money03Icon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-900 font-medium">Positive</span>
                <span className="text-sm text-gray-500 ml-1">trend</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Margin</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">18.5%</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={CalculateIcon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-900 font-medium">+2.1%</span>
                <span className="text-sm text-gray-500 ml-1">improvement</span>
              </div>
            </div>
          </div>

          {/* Accounting Modules */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Accounting Modules</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">General ledger, journal entries, and financial reporting</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {accountingModules.map((module) => (
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

          {/* Accounting Alerts */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-gray-900 dark:text-gray-100" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Accounting Alerts</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-white dark:bg-gray-800">
                <div className="h-2 w-2 rounded-full bg-gray-900 dark:bg-gray-100 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Month-End Closing Due</p>
                  <p className="text-sm text-gray-500">Financial period closes in 3 days</p>
                </div>
                <Link href="/accounting/journal?status=pending">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">Review</Button>
                </Link>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-white dark:bg-gray-800">
                <div className="h-2 w-2 rounded-full bg-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Bank Reconciliation</p>
                  <p className="text-sm text-gray-500">3 accounts need reconciliation</p>
                </div>
                <Link href="/accounting/cash-bank">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">View</Button>
                </Link>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-white dark:bg-gray-800">
                <div className="h-2 w-2 rounded-full bg-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Tax Filing Reminder</p>
                  <p className="text-sm text-gray-500">VAT return due in 7 days</p>
                </div>
                <Link href="/accounting/reports/tax">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">Prepare</Button>
                </Link>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </TwoLevelLayout>
  )
}
