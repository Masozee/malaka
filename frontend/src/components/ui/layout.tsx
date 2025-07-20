import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/ui/sidebar"

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Layout({ children, className, ...props }: LayoutProps) {
  return (
    <div className={cn("flex min-h-screen", className)} {...props}>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
