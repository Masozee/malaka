'use client'

import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const productModules = [
  {
    title: 'Articles',
    description: 'Define shoe products, SKUs, specifications, and product attributes',
    href: '/master-data/articles',
    stats: 'Product catalog management',
  },
  {
    title: 'Classifications',
    description: 'Organize products into categories, types, and classification hierarchies',
    href: '/products/classifications',
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
    href: '/products/models',
    stats: 'Design & model catalog',
  },
  {
    title: 'Sizes',
    description: 'Configure size charts, size ranges, and measurement standards',
    href: '/products/sizes',
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
    title: 'Gallery',
    description: 'Upload and organize product photos, catalog images, and media assets',
    href: '/master-data/gallery-images',
    stats: 'Product media library',
  },
  {
    title: 'Settings',
    description: 'Configure product module settings, SKU formats, and pricing rules',
    href: '/products/settings',
    stats: 'Module configuration',
  },
]

export default function ProductsPage() {
  const breadcrumbs = [
    { label: 'Products', href: '/products' },
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Products Management"
          description="Manage product catalog, classifications, variants, and pricing"
          breadcrumbs={breadcrumbs}
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Product Catalog</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">3</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Articles, Models, Classifications</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Variants</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">2</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Colors, Sizes</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pricing & Codes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">2</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Prices, Barcodes</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Media & Config</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">2</p>
              <div className="mt-2">
                <span className="text-sm text-gray-500">Gallery, Settings</span>
              </div>
            </div>
          </div>

          {/* Product Modules */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Product Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productModules.map((module) => (
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">New Article</p>
                    <p className="text-sm text-gray-500">Add a new product to the catalog</p>
                  </div>
                  <Link href="/master-data/articles">
                    <Button size="sm">Create</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">New Classification</p>
                    <p className="text-sm text-gray-500">Create a new product category</p>
                  </div>
                  <Link href="/products/classifications">
                    <Button size="sm">Create</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Barcode Design</p>
                    <p className="text-sm text-gray-500">Generate barcodes and QR codes</p>
                  </div>
                  <Link href="/products/settings?tab=barcode">
                    <Button size="sm">Open</Button>
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
