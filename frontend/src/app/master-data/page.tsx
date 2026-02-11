'use client'

import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const masterDataModules = [
  {
    title: 'Companies',
    description: 'Manage company profiles, legal entities, and organizational structure',
    href: '/master-data/companies',
    stats: 'Core business entities',
  },
  {
    title: 'Users',
    description: 'Manage user accounts, credentials, and system access permissions',
    href: '/master-data/users',
    stats: 'Authentication & authorization',
  },
  {
    title: 'Articles',
    description: 'Define shoe products, SKUs, specifications, and product attributes',
    href: '/master-data/articles',
    stats: 'Product catalog management',
  },
  {
    title: 'Classifications',
    description: 'Organize products into categories, types, and classification hierarchies',
    href: '/master-data/classifications',
    stats: 'Product categorization',
  },
  {
    title: 'Colors',
    description: 'Define color variants, color codes, and product color specifications',
    href: '/master-data/colors',
    stats: 'Color variant management',
  },
  {
    title: 'Models',
    description: 'Manage shoe models, design templates, and model specifications',
    href: '/master-data/models',
    stats: 'Design & model catalog',
  },
  {
    title: 'Sizes',
    description: 'Configure size charts, size ranges, and measurement standards',
    href: '/master-data/sizes',
    stats: 'Size chart configuration',
  },
  {
    title: 'Barcodes',
    description: 'Generate and manage product barcodes for inventory and POS scanning',
    href: '/master-data/barcodes',
    stats: 'Barcode generation & lookup',
  },
  {
    title: 'Prices',
    description: 'Set and maintain product pricing, price lists, and pricing history',
    href: '/master-data/prices',
    stats: 'Pricing & price lists',
  },
  {
    title: 'Gallery Images',
    description: 'Upload and organize product photos, catalog images, and media assets',
    href: '/master-data/gallery-images',
    stats: 'Product media library',
  },
  {
    title: 'Suppliers',
    description: 'Manage supplier contacts, agreements, and procurement relationships',
    href: '/master-data/suppliers',
    stats: 'Supplier relationship management',
  },
  {
    title: 'Customers',
    description: 'Maintain customer profiles, contact details, and purchase history',
    href: '/master-data/customers',
    stats: 'Customer database',
  },
  {
    title: 'Warehouses',
    description: 'Configure warehouse locations, storage zones, and inventory points',
    href: '/master-data/warehouses',
    stats: 'Warehouse & location setup',
  },
  {
    title: 'Couriers',
    description: 'Manage shipping courier partners, service levels, and delivery rates',
    href: '/master-data/couriers',
    stats: 'Shipping partner management',
  },
  {
    title: 'Department Stores',
    description: 'Manage department store partnerships, consignment terms, and agreements',
    href: '/master-data/depstores',
    stats: 'Retail partner management',
  },
  {
    title: 'Divisions',
    description: 'Define organizational divisions, business units, and team structures',
    href: '/master-data/divisions',
    stats: 'Organization structure',
  },
  {
    title: 'Roles & Permissions',
    description: 'Manage user roles, assign permissions, and control access across all modules',
    href: '/master-data/roles',
    stats: 'Access control & RBAC',
  },
]

export default function MasterDataPage() {
  const breadcrumbs = [
    { label: 'Master Data', href: '/master-data' },
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Master Data Management"
          description="Manage all core business data, product catalogs, and system configurations"
          breadcrumbs={breadcrumbs}
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Product Catalog</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">6</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Articles, Models, Colors, Sizes, Barcodes, Prices</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Business Partners</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">4</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Suppliers, Customers, Couriers, Dept Stores</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Organization</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">4</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Companies, Users, Divisions, Warehouses</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Media & Assets</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">2</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Gallery Images, Classifications</span>
              </div>
            </div>
          </div>

          {/* Master Data Modules */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Master Data Modules</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Core business entities, product catalogs, and partner configurations</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {masterDataModules.map((module) => (
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

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Quick Actions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Common tasks and shortcuts for managing master data</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">New Article</p>
                    <p className="text-sm text-gray-500">Add a new product to the catalog</p>
                  </div>
                  <Link href="/master-data/articles/new">
                    <Button size="sm">Create</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">New Customer</p>
                    <p className="text-sm text-gray-500">Register a new customer profile</p>
                  </div>
                  <Link href="/master-data/customers/new">
                    <Button size="sm">Create</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">New Supplier</p>
                    <p className="text-sm text-gray-500">Add a new supplier partner</p>
                  </div>
                  <Link href="/master-data/suppliers/new">
                    <Button size="sm">Create</Button>
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
