"use client"

import * as React from "react"
import Link from "next/link"
import { GuidelinesLayout } from "@/components/ui/guidelines-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Zap,
  RefreshCw,
  Bug,
  Shield,
  Database,
  Globe,
  Search
} from "lucide-react"

interface TroubleshootingItem {
  id: string
  title: string
  description: string
  category: "common" | "performance" | "security" | "integration" | "data"
  severity: "low" | "medium" | "high" | "critical"
  symptoms: string[]
  solutions: string[]
  icon: React.ComponentType<{ className?: string }>
}

const troubleshootingItems: TroubleshootingItem[] = [
  {
    id: "slow-loading",
    title: "Slow Page Loading",
    description: "Pages take too long to load or system feels sluggish",
    category: "performance",
    severity: "medium",
    symptoms: ["Pages load slowly (>5 seconds)", "System becomes unresponsive", "Timeout errors"],
    solutions: [
      "Clear browser cache and cookies",
      "Check network connection stability",
      "Refresh the page (Ctrl+F5 or Cmd+Shift+R)",
      "Contact administrator if problem persists"
    ],
    icon: RefreshCw
  },
  {
    id: "login-issues",
    title: "Cannot Login",
    description: "Unable to access the system due to login failures",
    category: "common",
    severity: "high",
    symptoms: ["Invalid credentials error", "Account locked message", "System not responding"],
    solutions: [
      "Verify username and password are correct",
      "Check if Caps Lock is enabled",
      "Try password reset if available",
      "Contact administrator if account is locked"
    ],
    icon: Shield
  },
  {
    id: "data-not-saving",
    title: "Data Not Saving",
    description: "Changes to records are not being saved properly",
    category: "data",
    severity: "high",
    symptoms: ["Save button doesn't work", "Changes revert after refresh", "Error messages on save"],
    solutions: [
      "Check for required field validation errors",
      "Ensure you have proper permissions to modify data",
      "Try refreshing the page and re-entering data",
      "Report to administrator if data corruption is suspected"
    ],
    icon: Database
  },
  {
    id: "permission-denied",
    title: "Permission Denied",
    description: "Unable to access certain features or modules",
    category: "security",
    severity: "medium",
    symptoms: ["Access denied messages", "Missing menu items", "Buttons are disabled"],
    solutions: [
      "Verify your user role and permissions",
      "Contact your manager or administrator",
      "Check if your account needs role updates",
      "Ensure you're not accessing restricted features"
    ],
    icon: Shield
  },
  {
    id: "browser-compatibility",
    title: "Browser Compatibility Issues",
    description: "System doesn't work properly in your browser",
    category: "common",
    severity: "low",
    symptoms: ["Layout appears broken", "Buttons don't click", "JavaScript errors"],
    solutions: [
      "Update your browser to the latest version",
      "Try using Chrome, Firefox, or Edge",
      "Disable browser extensions temporarily",
      "Clear browser cache and reload"
    ],
    icon: Globe
  },
  {
    id: "search-not-working",
    title: "Search Function Not Working",
    description: "Unable to search for records or getting no results",
    category: "common",
    severity: "medium",
    symptoms: ["No search results", "Search returns errors", "Search is very slow"],
    solutions: [
      "Check search terms for typos",
      "Try broader search terms",
      "Ensure you have access to the data you're searching",
      "Report search indexing issues to administrator"
    ],
    icon: Search
  },
  {
    id: "report-generation-failed",
    title: "Report Generation Failed",
    description: "Cannot generate or export reports",
    category: "common",
    severity: "medium",
    symptoms: ["Report generation timeouts", "Empty reports", "Export buttons not working"],
    solutions: [
      "Reduce the date range or data scope",
      "Check if you have permissions to generate reports",
      "Try a different report format (PDF vs Excel)",
      "Contact administrator for large dataset reports"
    ],
    icon: Bug
  },
  {
    id: "integration-sync-issues",
    title: "Integration Sync Problems",
    description: "Data sync with external systems is failing",
    category: "integration",
    severity: "high",
    symptoms: ["Sync errors", "Outdated data", "Integration alerts"],
    solutions: [
      "Check integration status in system settings",
      "Verify network connectivity to external systems",
      "Review integration logs for errors",
      "Contact administrator for integration troubleshooting"
    ],
    icon: Zap
  }
]

export default function TroubleshootingPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")

  const categories = ["all", ...Array.from(new Set(troubleshootingItems.map(item => item.category)))]
  
  const filteredItems = troubleshootingItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return { variant: "destructive" as const, color: "bg-red-500", text: "Critical" }
      case "high":
        return { variant: "destructive" as const, color: "bg-orange-500", text: "High" }
      case "medium":
        return { variant: "secondary" as const, color: "bg-yellow-500", text: "Medium" }
      case "low":
        return { variant: "outline" as const, color: "bg-green-500", text: "Low" }
      default:
        return { variant: "outline" as const, color: "bg-gray-500", text: "Unknown" }
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "common": return "Common Issues"
      case "performance": return "Performance"
      case "security": return "Security"
      case "integration": return "Integration"
      case "data": return "Data Issues"
      default: return category
    }
  }

  return (
    <GuidelinesLayout>
      <div className="container py-8 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link href="/guidelines" className="text-muted-foreground hover:text-foreground">
            Guidelines
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">Troubleshooting</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="secondary">Intermediate</Badge>
            <Badge variant="outline">1 hour reference</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-4">Troubleshooting Guide</h1>
          <p className="text-xl text-muted-foreground">
            Common issues, error messages, and step-by-step solutions to help you resolve 
            problems quickly and get back to productive work.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search troubleshooting topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category === "all" ? "All Issues" : getCategoryLabel(category)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Help */}
        <Card className="mb-8 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <HelpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-green-900 dark:text-green-100">Before You Start</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-green-800 dark:text-green-200">
                <h4 className="font-medium mb-2">📝 Document the Issue</h4>
                <p className="text-sm">Note exactly what you were doing when the problem occurred and any error messages.</p>
              </div>
              <div className="text-green-800 dark:text-green-200">
                <h4 className="font-medium mb-2">🔄 Try Basic Steps</h4>
                <p className="text-sm">Refresh the page, clear cache, or try in a different browser before investigating further.</p>
              </div>
              <div className="text-green-800 dark:text-green-200">
                <h4 className="font-medium mb-2">📞 Know When to Escalate</h4>
                <p className="text-sm">Contact support for critical issues or when basic troubleshooting doesn't help.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting Items */}
        <div className="space-y-6 mb-12">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or category filter.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => {
              const Icon = item.icon
              const severityBadge = getSeverityBadge(item.severity)

              return (
                <Card key={item.id} className="hover: transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {item.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={severityBadge.variant} className="text-xs">
                          {severityBadge.text}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {getCategoryLabel(item.category)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Symptoms */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <span>Symptoms</span>
                        </h4>
                        <ul className="space-y-2">
                          {item.symptoms.map((symptom, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-muted-foreground">{symptom}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Solutions */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Solutions</span>
                        </h4>
                        <ol className="space-y-2">
                          {item.solutions.map((solution, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <div className="w-5 h-5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                                {index + 1}
                              </div>
                              <span className="text-muted-foreground">{solution}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Contact Support */}
        <Card className="mb-12 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              Still Need Help?
            </h3>
            <p className="text-blue-800 dark:text-blue-200 mb-6">
              If you can't find a solution here, our support team is ready to help you resolve any issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center p-4 bg-background rounded-lg">
                <h4 className="font-semibold mb-2">Email Support</h4>
                <p className="text-sm text-muted-foreground mb-2">support@malaka-erp.com</p>
                <p className="text-xs text-muted-foreground">Response within 24 hours</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <h4 className="font-semibold mb-2">Phone Support</h4>
                <p className="text-sm text-muted-foreground mb-2">+62-21-1234-5678</p>
                <p className="text-xs text-muted-foreground">Mon-Fri, 9AM-6PM WIB</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <h4 className="font-semibold mb-2">Remote Support</h4>
                <p className="text-sm text-muted-foreground mb-2">Screen sharing available</p>
                <p className="text-xs text-muted-foreground">By appointment only</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href="/guidelines/administration">
              <ArrowLeft className="h-4 w-4 mr-2" />
              System Administration
            </Link>
          </Button>
          <Button asChild>
            <Link href="/guidelines">
              Back to Guidelines
            </Link>
          </Button>
        </div>
      </div>
    </GuidelinesLayout>
  )
}