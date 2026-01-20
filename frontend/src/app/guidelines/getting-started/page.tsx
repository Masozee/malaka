"use client"

import * as React from "react"
import Link from "next/link"
import { GuidelinesLayout } from "@/components/ui/guidelines-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  User,
  Settings,
  Eye,
  Shield,
  Palette,
  Bell
} from "lucide-react"

export default function GettingStartedPage() {
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([])

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepNumber) 
        ? prev.filter(s => s !== stepNumber)
        : [...prev, stepNumber]
    )
  }

  const steps = [
    {
      number: 1,
      title: "Login & Account Setup",
      description: "Access your account and complete initial profile setup",
      details: [
        "Navigate to the login page using provided credentials",
        "Complete your user profile with contact information",
        "Set up security preferences and password requirements",
        "Verify your email address if required"
      ]
    },
    {
      number: 2,
      title: "Interface Overview",
      description: "Familiarize yourself with the main navigation and layout",
      details: [
        "Explore the two-level sidebar navigation system",
        "Understand breadcrumb navigation and page headers",
        "Learn how to use the global search functionality",
        "Customize your dashboard layout and widgets"
      ]
    },
    {
      number: 3,
      title: "Basic Configuration",
      description: "Set up essential system preferences and settings",
      details: [
        "Configure your company information and preferences",
        "Set up basic master data (customers, suppliers, products)",
        "Configure user roles and permissions for your team",
        "Set up notification preferences and alerts"
      ]
    },
    {
      number: 4,
      title: "Data Import",
      description: "Import your existing business data into the system",
      details: [
        "Download data import templates for each module",
        "Prepare and clean your existing data files",
        "Import master data using the bulk import tools",
        "Verify data integrity and resolve any import issues"
      ]
    },
    {
      number: 5,
      title: "Team Setup",
      description: "Add team members and configure their access levels",
      details: [
        "Create user accounts for your team members",
        "Assign appropriate roles and permissions",
        "Set up department and organizational structure",
        "Configure approval workflows and hierarchies"
      ]
    },
    {
      number: 6,
      title: "First Transactions",
      description: "Process your first transactions to test the system",
      details: [
        "Create a sample customer and product record",
        "Process a test sales transaction",
        "Record a sample inventory movement",
        "Generate your first reports to verify data flow"
      ]
    }
  ]

  return (
    <GuidelinesLayout>
      <div className="container py-8 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link href="/guidelines" className="text-muted-foreground hover:text-foreground">
            Guidelines
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">Getting Started</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="default" className="bg-green-500">Beginner</Badge>
            <Badge variant="outline">30 min setup</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-4">Getting Started with Malaka ERP</h1>
          <p className="text-xl text-muted-foreground">
            Follow this step-by-step guide to set up your Malaka ERP system and start managing 
            your business operations effectively. Each step includes detailed instructions and 
            best practices.
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Setup Progress</span>
            </CardTitle>
            <CardDescription>
              Track your progress through the setup process. Click to mark steps as complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-2xl font-bold text-primary">
                {completedSteps.length}/{steps.length}
              </div>
              <div className="text-sm text-muted-foreground">Steps completed</div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <div className="space-y-6 mb-12">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.number)

            return (
              <Card 
                key={step.number} 
                className={`transition-all duration-200 ${
                  isCompleted 
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' 
                    : 'hover:'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div 
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : step.number}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {step.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant={isCompleted ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleStep(step.number)}
                    >
                      {isCompleted ? "Completed" : "Mark Complete"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="ml-12">
                    <h4 className="font-semibold mb-3">What you'll do:</h4>
                    <ul className="space-y-2">
                      {step.details.map((detail, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className={isCompleted ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'}>
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Access Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover: transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-500" />
                  <span>User Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Update your profile information and account settings.
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link href="/profile">Go to Profile</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover: transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-green-500" />
                  <span>System Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure system-wide settings and preferences.
                </p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/settings">View Settings</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover: transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-purple-500" />
                  <span>Dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  View your personalized dashboard and key metrics.
                </p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href="/dashboard">Open Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tips & Best Practices */}
        <Card className="mb-12 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">💡 Tips for Success</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-blue-800 dark:text-blue-200">
              <li className="flex items-start space-x-2">
                <Shield className="h-4 w-4 mt-1 flex-shrink-0" />
                <span><strong>Start Small:</strong> Begin with essential data and gradually expand as you become more comfortable with the system.</span>
              </li>
              <li className="flex items-start space-x-2">
                <Palette className="h-4 w-4 mt-1 flex-shrink-0" />
                <span><strong>Customize Wisely:</strong> Take time to set up your dashboard and preferences to match your workflow.</span>
              </li>
              <li className="flex items-start space-x-2">
                <Bell className="h-4 w-4 mt-1 flex-shrink-0" />
                <span><strong>Set Up Notifications:</strong> Configure alerts for critical business events to stay informed.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                <span><strong>Test First:</strong> Always test with sample data before processing real transactions.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href="/guidelines/overview">
              <ArrowLeft className="h-4 w-4 mr-2" />
              System Overview
            </Link>
          </Button>
          <Button asChild>
            <Link href="/guidelines/modules">
              Module Guides
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </GuidelinesLayout>
  )
}