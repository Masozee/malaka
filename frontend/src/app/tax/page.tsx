"use client"

import * as React from "react"
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  TaxesIcon,
  FileExportIcon,
  FileImportIcon,
  Calendar01Icon,
} from '@hugeicons/core-free-icons'

const taxModules = [
  {
    title: 'Output Tax (VAT Out)',
    description: 'Manage PPN Keluaran from sales transactions, invoices, and taxable deliveries',
    href: '/tax/output-tax',
    stats: 'Rp 320M this period',
  },
  {
    title: 'Input Tax (VAT In)',
    description: 'Track PPN Masukan from purchases, claim creditable input tax invoices',
    href: '/tax/input-tax',
    stats: 'Rp 185M this period',
  },
  {
    title: 'Withholding Tax (PPh)',
    description: 'Manage PPh 21 (employees), PPh 23/26 (services), and other withholding taxes',
    href: '/tax/withholding-tax',
    stats: '156 tax slips issued',
  },
  {
    title: 'Tax Reporting & Filing',
    description: 'Prepare SPT Masa & Tahunan, e-Filing submissions, and compliance tracking',
    href: '/tax/reporting',
    stats: 'Next filing: Feb 20',
  },
  {
    title: 'Tax Reconciliation',
    description: 'Reconcile tax records with accounting ledgers and e-Faktur data',
    href: '/tax/reconciliation',
    stats: '2 items pending',
  },
  {
    title: 'Tax Master Data',
    description: 'Manage tax codes, rates, NPWP records, and tax authority configurations',
    href: '/tax/master-data',
    stats: '24 tax codes active',
  },
]

export default function TaxPage() {
  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Tax"
          description="Tax compliance, reporting, and filing management"
          breadcrumbs={[{ label: 'Tax', href: '/tax' }]}
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">VAT Payable</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rp 135M</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={TaxesIcon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Output Rp 320M - Input Rp 185M
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Output Tax (PPN Out)</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rp 320M</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={FileExportIcon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+5.2%</span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Input Tax (PPN In)</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rp 185M</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={FileImportIcon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+3.8%</span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Next Filing</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">10d</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={Calendar01Icon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                SPT Masa PPN - Feb 20
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Quick Actions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Frequently used tax operations and filing shortcuts</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Create Tax Invoice</p>
                    <p className="text-sm text-gray-500">Issue e-Faktur for sales</p>
                  </div>
                  <Link href="/tax/output-tax">
                    <Button size="sm">Create</Button>
                  </Link>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">File SPT Masa</p>
                    <p className="text-sm text-gray-500">Submit monthly tax return</p>
                  </div>
                  <Link href="/tax/reporting">
                    <Button size="sm">File</Button>
                  </Link>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Tax Reconciliation</p>
                    <p className="text-sm text-gray-500">Match records with e-Faktur</p>
                  </div>
                  <Link href="/tax/reconciliation">
                    <Button size="sm">Reconcile</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          {/* Tax Modules */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Tax Modules</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">VAT management, withholding taxes, and compliance tools</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {taxModules.map((module) => (
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

          {/* Alerts */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Alerts</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Deadlines, compliance warnings, and items requiring review</p>
            <Card className="p-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-red-800">Filing Deadline Approaching</p>
                    <p className="text-sm text-red-700">SPT Masa PPN January due in 10 days - prepare e-Faktur data</p>
                  </div>
                  <Link href="/tax/reporting">
                    <Button variant="outline" size="sm">Prepare</Button>
                  </Link>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800">Reconciliation Needed</p>
                    <p className="text-sm text-yellow-700">2 input tax invoices pending verification with e-Faktur</p>
                  </div>
                  <Link href="/tax/reconciliation">
                    <Button variant="outline" size="sm">Reconcile</Button>
                  </Link>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-blue-800">PPh 21 Monthly Update</p>
                    <p className="text-sm text-blue-700">Employee tax slips for January ready for review</p>
                  </div>
                  <Link href="/tax/withholding-tax">
                    <Button variant="outline" size="sm">Review</Button>
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
