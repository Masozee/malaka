import Link from 'next/link'
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { Tile } from "@/components/ui/tile"
import { 
  Building2, Users, Shirt, Palette, Box, Ruler, ScanLine, 
  DollarSign, Image, Truck, ShoppingBag, Warehouse, 
  Network, Map, UserCheck
} from "lucide-react"

export default function MasterDataPage() {
  const masterDataModules = [
    {
      title: "Companies",
      href: "/master-data/companies",
      icon: <Building2 size={48} />,
      description: "Manage company information and setup"
    },
    {
      title: "Users",
      href: "/master-data/users", 
      icon: <UserCheck size={48} />,
      description: "User accounts and access management"
    },
    {
      title: "Articles",
      href: "/master-data/articles",
      icon: <Shirt size={48} />,
      description: "Shoe products and article management"
    },
    {
      title: "Classifications",
      href: "/master-data/classifications",
      icon: <Network size={48} />,
      description: "Product categories and classifications"
    },
    {
      title: "Colors",
      href: "/master-data/colors",
      icon: <Palette size={48} />,
      description: "Color variants and specifications"
    },
    {
      title: "Models",
      href: "/master-data/models",
      icon: <Box size={48} />,
      description: "Shoe models and designs"
    },
    {
      title: "Sizes",
      href: "/master-data/sizes",
      icon: <Ruler size={48} />,
      description: "Size charts and measurements"
    },
    {
      title: "Barcodes",
      href: "/master-data/barcodes",
      icon: <ScanLine size={48} />,
      description: "Barcode generation and management"
    },
    {
      title: "Prices",
      href: "/master-data/prices",
      icon: <DollarSign size={48} />,
      description: "Price maintenance and history"
    },
    {
      title: "Gallery Images",
      href: "/master-data/gallery-images",
      icon: <Image size={48} />,
      description: "Product images and gallery"
    },
    {
      title: "Suppliers",
      href: "/master-data/suppliers",
      icon: <Truck size={48} />,
      description: "Supplier information and management"
    },
    {
      title: "Customers",
      href: "/master-data/customers",
      icon: <Users size={48} />,
      description: "Customer database and profiles"
    },
    {
      title: "Warehouses",
      href: "/master-data/warehouses",
      icon: <Warehouse size={48} />,
      description: "Warehouse locations and setup"
    },
    {
      title: "Couriers",
      href: "/master-data/couriers",
      icon: <Map size={48} />,
      description: "Shipping couriers and services"
    },
    {
      title: "Department Stores",
      href: "/master-data/depstores",
      icon: <ShoppingBag size={48} />,
      description: "Department store partnerships"
    },
    {
      title: "Divisions",
      href: "/master-data/divisions",
      icon: <Network size={48} />,
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
                icon={module.icon}
                description={module.description}
                className="hover:shadow-lg transition-shadow cursor-pointer h-full"
              />
            </Link>
          ))}
        </div>
      </div>
    </TwoLevelLayout>
  )
}