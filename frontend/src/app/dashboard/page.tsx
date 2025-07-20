import { Tile } from "@/components/ui/tile"
import { Layout } from "@/components/ui/layout"
import { Home, ShoppingCart, Users, Package, BarChart, Settings } from "lucide-react"

export default function DashboardPage() {
  return (
    <Layout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
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
        <Tile
          title="Home"
          icon={<Home size={48} />}
          description="Return to the main overview."
        />
      </div>
    </Layout>
  )
}
