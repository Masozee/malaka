import Link from 'next/link'
import { Tile } from "@/components/ui/tile"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { 
  ShoppingCart, Users, Package, BarChart, Settings, 
  Database, Factory, Calculator
} from "lucide-react"

export default function DashboardPage() {
  return (
    <TwoLevelLayout>
      <Header 
        title="Dashboard"
        description="Welcome to Malaka ERP - Your comprehensive business management solution"
        breadcrumbs={[
          { label: "Dashboard" }
        ]}
      />
      
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Link href="/master-data">
            <Tile
              title="Master Data"
              icon={<Database size={48} />}
              description="Manage core business data: products, customers, suppliers, and more."
              className="hover:shadow-lg transition-shadow cursor-pointer"
            />
          </Link>
          <Tile
            title="Sales"
            icon={<ShoppingCart size={48} />}
            description="Manage orders, customers, and sales analytics."
          />
          <Tile
            title="Inventory"
            icon={<Package size={48} />}
            description="Track stock levels, manage products, and suppliers."
          />
          <Tile
            title="Production"
            icon={<Factory size={48} />}
            description="Manage manufacturing processes, work orders, and quality control."
          />
          <Tile
            title="Accounting"
            icon={<Calculator size={48} />}
            description="Handle financial transactions, ledgers, and accounting reports."
          />
          <Tile
            title="HR Management"
            icon={<Users size={48} />}
            description="Handle employee data, payroll, and recruitment."
          />
          <Tile
            title="Reporting"
            icon={<BarChart size={48} />}
            description="Generate insightful reports and analyze business performance."
          />
          <Tile
            title="Settings"
            icon={<Settings size={48} />}
            description="Configure system settings and user permissions."
          />
        </div>
      </div>
    </TwoLevelLayout>
  )
}
