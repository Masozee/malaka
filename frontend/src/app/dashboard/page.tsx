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
            />
          </Link>
          <Link href="/sales">
            <Tile
              title="Sales"
              icon={<ShoppingCart size={48} />}
              description="Manage orders, customers, and sales analytics."
            />
          </Link>
          <Link href="/inventory">
            <Tile
              title="Inventory"
              icon={<Package size={48} />}
              description="Track stock levels, manage products, and suppliers."
            />
          </Link>
          <Link href="/production">
            <Tile
              title="Production"
              icon={<Factory size={48} />}
              description="Manage manufacturing processes, work orders, and quality control."
            />
          </Link>
          <Link href="/accounting">
            <Tile
              title="Accounting"
              icon={<Calculator size={48} />}
              description="Handle financial transactions, ledgers, and accounting reports."
            />
          </Link>
          <Link href="/hr">
            <Tile
              title="HR Management"
              icon={<Users size={48} />}
              description="Handle employee data, payroll, and recruitment."
            />
          </Link>
          <Link href="/reports">
            <Tile
              title="Reporting"
              icon={<BarChart size={48} />}
              description="Generate insightful reports and analyze business performance."
            />
          </Link>
          <Link href="/settings">
            <Tile
              title="Settings"
              icon={<Settings size={48} />}
              description="Configure system settings and user permissions."
            />
          </Link>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
