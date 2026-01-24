"use client"

import Link from 'next/link'
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { Tile } from "@/components/ui/tile"

export default function MasterDataPage() {
  const masterDataModules = [
    {
      title: "Companies",
      href: "/master-data/companies",
      description: "Manage company information and setup"
    },
    {
      title: "Users",
      href: "/master-data/users",
      description: "User accounts and access management"
    },
    {
      title: "Articles",
      href: "/master-data/articles",
      description: "Shoe products and article management"
    },
    {
      title: "Classifications",
      href: "/master-data/classifications",
      description: "Product categories and classifications"
    },
    {
      title: "Colors",
      href: "/master-data/colors",
      description: "Color variants and specifications"
    },
    {
      title: "Models",
      href: "/master-data/models",
      description: "Shoe models and designs"
    },
    {
      title: "Sizes",
      href: "/master-data/sizes",
      description: "Size charts and measurements"
    },
    {
      title: "Barcodes",
      href: "/master-data/barcodes",
      description: "Barcode generation and management"
    },
    {
      title: "Prices",
      href: "/master-data/prices",
      description: "Price maintenance and history"
    },
    {
      title: "Gallery Images",
      href: "/master-data/gallery-images",
      description: "Product images and gallery"
    },
    {
      title: "Suppliers",
      href: "/master-data/suppliers",
      description: "Supplier information and management"
    },
    {
      title: "Customers",
      href: "/master-data/customers",
      description: "Customer database and profiles"
    },
    {
      title: "Warehouses",
      href: "/master-data/warehouses",
      description: "Warehouse locations and setup"
    },
    {
      title: "Couriers",
      href: "/master-data/couriers",
      description: "Shipping couriers and services"
    },
    {
      title: "Department Stores",
      href: "/master-data/depstores",
      description: "Department store partnerships"
    },
    {
      title: "Divisions",
      href: "/master-data/divisions",
      description: "Organizational divisions and groups"
    }
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="Master Data Management"
        description="Manage all core business data and configurations"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master Data" }
        ]}
      />

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {masterDataModules.map((module) => (
            <Link key={module.href} href={module.href}>
              <Tile
                title={module.title}
                description={module.description}
                className="hover: transition-shadow cursor-pointer h-full"
              />
            </Link>
          ))}
        </div>
      </div>
    </TwoLevelLayout>
  )
}
