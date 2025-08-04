"use client"

import * as React from "react"
import Link from 'next/link'
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ShoppingCart, 
  Users, 
  Package, 
  BarChart, 
  Database, 
  Factory, 
  Calculator,
  Bookmark,
  Star,
  Clock,
  TrendingUp,
  ArrowRight,
  Activity,
  Bell,
  Calendar
} from "lucide-react"

interface BookmarkItem {
  id: string
  title: string
  description: string
  href: string
  icon: React.ReactNode
  category: string
  lastVisited?: string
  isStarred?: boolean
}

interface DashboardMenuItem {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  count?: number
  status?: 'active' | 'warning' | 'info'
  isNew?: boolean
}

export default function HomePage() {
  const [currentTime, setCurrentTime] = React.useState(new Date())
  const [bookmarks, setBookmarks] = React.useState<BookmarkItem[]>([
    {
      id: '1',
      title: 'Sales Dashboard',
      description: 'Real-time sales analytics and KPIs',
      href: '/sales/dashboard',
      icon: <BarChart className="h-5 w-5" />,
      category: 'Analytics',
      lastVisited: '2 hours ago',
      isStarred: true
    },
    {
      id: '2',
      title: 'User Management',
      description: 'Manage system users and permissions',
      href: '/master-data/users',
      icon: <Users className="h-5 w-5" />,
      category: 'Master Data',
      lastVisited: '1 day ago',
      isStarred: true
    },
    {
      id: '3',
      title: 'General Ledger',
      description: 'Financial transactions and accounting',
      href: '/accounting/general-ledger',
      icon: <Calculator className="h-5 w-5" />,
      category: 'Accounting',
      lastVisited: '3 hours ago',
      isStarred: false
    },
    {
      id: '4',
      title: 'Sales Reports',
      description: 'Detailed sales and customer analytics',
      href: '/sales/reports',
      icon: <TrendingUp className="h-5 w-5" />,
      category: 'Reports',
      lastVisited: '5 hours ago',
      isStarred: true
    }
  ])

  const dashboardMenuItems: DashboardMenuItem[] = [
    {
      title: "Master Data",
      description: "Manage core business data: products, customers, suppliers, and more.",
      href: "/master-data",
      icon: <Database className="h-6 w-6" />,
      count: 1247,
      status: 'active'
    },
    {
      title: "Sales Dashboard",
      description: "Real-time sales analytics, KPIs, and performance metrics.",
      href: "/sales/dashboard",
      icon: <ShoppingCart className="h-6 w-6" />,
      count: 89,
      status: 'info',
      isNew: true
    },
    {
      title: "Inventory",
      description: "Track stock levels, manage products, and suppliers.",
      href: "/inventory",
      icon: <Package className="h-6 w-6" />,
      count: 12,
      status: 'warning'
    },
    {
      title: "Production",
      description: "Manage manufacturing processes, work orders, and quality control.",
      href: "/production",
      icon: <Factory className="h-6 w-6" />,
      count: 7,
      status: 'active'
    },
    {
      title: "Accounting",
      description: "Handle financial transactions, ledgers, and accounting reports.",
      href: "/accounting/general-ledger",
      icon: <Calculator className="h-6 w-6" />,
      count: 156,
      status: 'active'
    },
    {
      title: "Sales Reports",
      description: "Generate detailed sales reports and customer analytics.",
      href: "/sales/reports",
      icon: <BarChart className="h-6 w-6" />,
      isNew: true
    }
  ]

  // Update current time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => prev.map(bookmark => 
      bookmark.id === id 
        ? { ...bookmark, isStarred: !bookmark.isStarred }
        : bookmark
    ))
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'warning':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400'
      case 'info':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
      default:
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
    }
  }

  return (
    <TwoLevelLayout>
      <Header 
        title="Welcome to Malaka ERP"
        description="Your comprehensive business management solution"
        breadcrumbs={[
          { label: "Home" }
        ]}
      />
      
      <div className="flex-1 p-6 space-y-8">
        {/* Welcome Section */}
        <section className="relative">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">
                    Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'}! 👋
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Welcome back to your ERP dashboard. Here&apos;s what&apos;s happening today.
                  </p>
                </div>
                
                <div className="flex items-center gap-6 text-blue-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{formatDate(currentTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{formatTime(currentTime)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Link href="/sales/dashboard">
                    <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Activity className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="hidden lg:flex flex-col gap-3">
                <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center min-w-[120px]">
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-xs text-blue-100">Open Tasks</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center min-w-[120px]">
                  <div className="text-2xl font-bold">89%</div>
                  <div className="text-xs text-blue-100">System Health</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center min-w-[120px]">
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-xs text-blue-100">Notifications</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Menu Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Dashboard Menu
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Quick access to your most used modules
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardMenuItems.map((item, index) => (
              <Link key={index} href={item.href}>
                <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
                          <div className="text-blue-600 dark:text-blue-400">
                            {item.icon}
                          </div>
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {item.title}
                            {item.isNew && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                          </CardTitle>
                        </div>
                      </div>
                      
                      {item.count && (
                        <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                          {item.count}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Bookmarks Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Bookmark className="h-6 w-6" />
                Bookmarks
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Your frequently visited pages and saved shortcuts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {bookmarks.filter(b => b.isStarred).length} Starred
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded">
                        {bookmark.icon}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {bookmark.category}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.preventDefault()
                        toggleBookmark(bookmark.id)
                      }}
                    >
                      <Star 
                        className={`h-3 w-3 ${
                          bookmark.isStarred 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-400'
                        }`} 
                      />
                    </Button>
                  </div>
                  
                  <Link href={bookmark.href}>
                    <div className="space-y-2 cursor-pointer">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {bookmark.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {bookmark.description}
                      </p>
                      {bookmark.lastVisited && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>Last visited {bookmark.lastVisited}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Bookmark Button */}
          <div className="mt-6 text-center">
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Add New Bookmark
            </Button>
          </div>
        </section>

        {/* Recent Activity Footer */}
        <section className="pt-4">
          <Card className="bg-gray-50 dark:bg-gray-900/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Bell className="h-4 w-4" />
                  <span>You have 3 unread notifications</span>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </TwoLevelLayout>
  )
}