'use client'

import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calculator, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Building, 
  PieChart, 
  BookOpen,
  Plus,
  ArrowRight,
  BarChart,
  Settings,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  Wallet,
  Receipt,
  Eye,
  Globe
} from 'lucide-react'
import Link from 'next/link'

const accountingModules = [
  {
    title: 'General Ledger',
    description: 'Manage chart of accounts and general ledger entries',
    icon: BookOpen,
    href: '/accounting/general-ledger',
    stats: '1,247 entries this month',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Journal Entries',
    description: 'Create and manage accounting journal entries',
    icon: FileText,
    href: '/accounting/journal',
    stats: '89 entries pending',
    color: 'bg-green-100 text-green-600'
  },
  {
    title: 'Trial Balance',
    description: 'Generate trial balance and balance sheet reports',
    icon: Calculator,
    href: '/accounting/trial-balance',
    stats: 'Last updated: Today',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    title: 'Cash & Bank',
    description: 'Manage cash accounts and bank reconciliation',
    icon: CreditCard,
    href: '/accounting/cash-bank',
    stats: '8 bank accounts',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    title: 'Fixed Assets',
    description: 'Track and manage company fixed assets',
    icon: Building,
    href: '/accounting/fixed-assets',
    stats: '234 assets tracked',
    color: 'bg-red-100 text-red-600'
  },
  {
    title: 'Cost Centers',
    description: 'Manage departmental cost allocation and tracking',
    icon: Target,
    href: '/accounting/cost-centers',
    stats: '12 cost centers',
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    title: 'Currency Settings',
    description: 'Manage multi-currency and exchange rates',
    icon: Globe,
    href: '/accounting/currency',
    stats: '5 currencies active',
    color: 'bg-pink-100 text-pink-600'
  },
  {
    title: 'Invoices',
    description: 'Create and manage customer invoices',
    icon: Receipt,
    href: '/accounting/invoices',
    stats: '156 invoices this month',
    color: 'bg-orange-100 text-orange-600'
  }
]

export default function AccountingPage() {
  const breadcrumbs = [
    { label: 'Accounting & Finance', href: '/accounting' }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Accounting & Finance"
          description="Manage financial records, reporting, and compliance"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/accounting/reports">
                  <BarChart className="h-4 w-4 mr-2" />
                  Reports
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/accounting/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/accounting/journal/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Entry
                </Link>
              </Button>
            </div>
          }
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Assets</p>
                  <p className="text-3xl font-bold text-gray-900">Rp 15.2B</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+5.2%</span>
                <span className="text-sm text-gray-500 ml-1">vs last quarter</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-green-600">Rp 2.8B</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+12.8%</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cash Flow</p>
                  <p className="text-3xl font-bold text-yellow-600">Rp 890M</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">Positive</span>
                <span className="text-sm text-gray-500 ml-1">trend</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                  <p className="text-3xl font-bold text-purple-600">18.5%</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+2.1%</span>
                <span className="text-sm text-gray-500 ml-1">improvement</span>
              </div>
            </div>
          </div>

          {/* Accounting Modules */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Accounting Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {accountingModules.map((module) => {
                const Icon = module.icon
                return (
                  <Card key={module.title} className="p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${module.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <Link href={module.href}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">New Journal Entry</p>
                    <p className="text-sm text-gray-500">Create accounting entry</p>
                  </div>
                  <Link href="/accounting/journal/new">
                    <Button size="sm">Create</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">New Invoice</p>
                    <p className="text-sm text-gray-500">Create customer invoice</p>
                  </div>
                  <Link href="/accounting/invoices/new">
                    <Button size="sm">Create</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Trial Balance</p>
                    <p className="text-sm text-gray-500">Generate balance report</p>
                  </div>
                  <Link href="/accounting/trial-balance">
                    <Button size="sm">Generate</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Bank Reconciliation</p>
                    <p className="text-sm text-gray-500">Reconcile accounts</p>
                  </div>
                  <Link href="/accounting/cash-bank">
                    <Button size="sm">Reconcile</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Journal Entries</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/accounting/journal">
                    <Eye className="h-4 w-4 mr-1" />
                    View All
                  </Link>
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">JE-2024-0234</p>
                      <p className="text-sm text-gray-500">Sales Revenue Entry - Rp 45,000,000</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Posted</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">JE-2024-0235</p>
                      <p className="text-sm text-gray-500">Purchase Entry - Rp 12,500,000</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Pending</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">JE-2024-0236</p>
                      <p className="text-sm text-gray-500">Expense Allocation - Rp 8,750,000</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Posted</Badge>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">JE-2024-0237</p>
                      <p className="text-sm text-gray-500">Depreciation Entry - Rp 3,200,000</p>
                    </div>
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/accounting/reports">
                    <Eye className="h-4 w-4 mr-1" />
                    View Reports
                  </Link>
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Current Assets</p>
                      <p className="text-sm text-gray-500">Cash, Inventory, Receivables</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Rp 8.5B</p>
                    <p className="text-xs text-green-600">+8.2%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Fixed Assets</p>
                      <p className="text-sm text-gray-500">Property, Equipment, Vehicles</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Rp 6.7B</p>
                    <p className="text-xs text-blue-600">+2.1%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Current Liabilities</p>
                      <p className="text-sm text-gray-500">Payables, Short-term Debt</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Rp 3.2B</p>
                    <p className="text-xs text-yellow-600">-5.4%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <PieChart className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Owner's Equity</p>
                      <p className="text-sm text-gray-500">Capital, Retained Earnings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Rp 12.0B</p>
                    <p className="text-xs text-green-600">+7.8%</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Accounting Alerts */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Accounting Alerts</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Clock className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="font-medium text-red-800">Month-End Closing Due</p>
                  <p className="text-sm text-red-700">Financial period closes in 3 days - 12 journal entries pending</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href="/accounting/journal?status=pending">Review Entries</Link>
                </Button>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-800">Bank Reconciliation Required</p>
                  <p className="text-sm text-yellow-700">3 bank accounts need reconciliation for current month</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href="/accounting/cash-bank">Reconcile Now</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-blue-800">Tax Filing Reminder</p>
                  <p className="text-sm text-blue-700">Monthly VAT return due in 7 days</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href="/accounting/reports/tax">Prepare Filing</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </TwoLevelLayout>
  )
}