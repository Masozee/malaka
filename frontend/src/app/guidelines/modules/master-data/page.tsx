"use client"

import * as React from "react"
import Link from "next/link"
import { GuidelinesLayout } from "@/components/ui/guidelines-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function MasterDataGuidePage() {
  return (
    <GuidelinesLayout>
      <div className="container py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="default" className="bg-green-500">Beginner</Badge>
            <Badge variant="outline">45 min read</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-4">Master Data Management</h1>
          <p className="text-xl text-muted-foreground">
            Master Data Management forms the foundation of your ERP system. This module handles 
            all the core business entities that other modules depend on.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>Overview</h2>
          <p>
            Master Data Management is the central hub for managing foundational business information 
            including customers, suppliers, products, users, and organizational structure. This data 
            serves as the backbone for all other ERP modules.
          </p>

          <h2>Key Components</h2>

          <h3>Companies</h3>
          <p>
            Manage your organization's structure including main company information, subsidiaries, 
            and business units. This includes:
          </p>
          <ul>
            <li>Company profile and contact information</li>
            <li>Business registration details</li>
            <li>Tax identification numbers</li>
            <li>Banking information</li>
            <li>Multi-company configurations</li>
          </ul>

          <h3>Users</h3>
          <p>
            User management encompasses all aspects of system access and user administration:
          </p>
          <ul>
            <li>User account creation and management</li>
            <li>Role assignment and permissions</li>
            <li>Password policies and security settings</li>
            <li>User profile management</li>
            <li>Access control and audit trails</li>
          </ul>

          <h3>Customers</h3>
          <p>
            Comprehensive customer database management for all your business relationships:
          </p>
          <ul>
            <li>Customer registration and profile management</li>
            <li>Contact information and communication history</li>
            <li>Credit limits and payment terms</li>
            <li>Customer categorization and segmentation</li>
            <li>Shipping addresses and preferences</li>
          </ul>

          <h3>Suppliers</h3>
          <p>
            Supplier management for procurement and vendor relationships:
          </p>
          <ul>
            <li>Supplier registration and qualification</li>
            <li>Contact details and communication logs</li>
            <li>Payment terms and banking information</li>
            <li>Performance ratings and evaluations</li>
            <li>Product catalogs and pricing agreements</li>
          </ul>

          <h3>Divisions</h3>
          <p>
            Organizational structure management for business divisions:
          </p>
          <ul>
            <li>Department and division hierarchy</li>
            <li>Cost center assignments</li>
            <li>Reporting structure definition</li>
            <li>Budget and responsibility allocations</li>
          </ul>

          <h3>Department Stores</h3>
          <p>
            Retail location management for multi-store operations:
          </p>
          <ul>
            <li>Store profile and location information</li>
            <li>Store hierarchy and relationships</li>
            <li>Operating hours and contact details</li>
            <li>Store-specific configurations</li>
          </ul>

          <h2>Getting Started</h2>

          <h3>Step 1: Set Up Company Information</h3>
          <p>
            Begin by entering your main company information. This includes basic details like 
            company name, address, registration numbers, and tax information. This data will 
            be used across all modules for documentation and reporting.
          </p>

          <h3>Step 2: Create User Accounts</h3>
          <p>
            Set up user accounts for your team members. Start with administrator accounts, 
            then create accounts for other users based on their roles. Assign appropriate 
            permissions based on job responsibilities.
          </p>

          <h3>Step 3: Import Customer Data</h3>
          <p>
            If you have existing customer data, use the bulk import feature to bring it into 
            the system. Clean your data first to ensure consistency. For new implementations, 
            start by adding your most important customers manually.
          </p>

          <h3>Step 4: Set Up Suppliers</h3>
          <p>
            Register your key suppliers with complete contact and business information. 
            This is essential for procurement operations. Include payment terms and 
            banking details for smooth transaction processing.
          </p>

          <h3>Step 5: Configure Organizational Structure</h3>
          <p>
            Define your divisions, departments, and store locations if applicable. 
            This structure will be used for reporting, cost allocation, and access control 
            throughout the system.
          </p>

          <h2>Common Workflows</h2>

          <h3>Adding a New Customer</h3>
          <ol>
            <li>Navigate to Master Data → Customers</li>
            <li>Click "Add New Customer"</li>
            <li>Fill in basic information (name, contact details)</li>
            <li>Set credit limit and payment terms</li>
            <li>Add shipping addresses</li>
            <li>Assign customer category</li>
            <li>Save and verify the information</li>
          </ol>

          <h3>Managing User Permissions</h3>
          <ol>
            <li>Go to Master Data → Users</li>
            <li>Select the user account to modify</li>
            <li>Click "Edit Permissions"</li>
            <li>Select appropriate role template</li>
            <li>Customize specific module access</li>
            <li>Set data access restrictions if needed</li>
            <li>Save changes and notify the user</li>
          </ol>

          <h3>Bulk Data Import</h3>
          <ol>
            <li>Download the import template</li>
            <li>Prepare your data in the required format</li>
            <li>Validate data for completeness</li>
            <li>Upload the file through the import wizard</li>
            <li>Review import results and errors</li>
            <li>Fix any validation issues</li>
            <li>Complete the import process</li>
          </ol>

          <h2>Best Practices</h2>

          <h3>Data Quality</h3>
          <ul>
            <li>Establish data entry standards and formats</li>
            <li>Use validation rules to ensure data consistency</li>
            <li>Regular data cleanup and deduplication</li>
            <li>Implement approval workflows for critical changes</li>
          </ul>

          <h3>Security</h3>
          <ul>
            <li>Follow principle of least privilege for user access</li>
            <li>Regular review and update of user permissions</li>
            <li>Implement strong password policies</li>
            <li>Monitor and audit data access patterns</li>
          </ul>

          <h3>Maintenance</h3>
          <ul>
            <li>Schedule regular data reviews and updates</li>
            <li>Archive inactive records appropriately</li>
            <li>Maintain backup and recovery procedures</li>
            <li>Document custom fields and configurations</li>
          </ul>

          <h2>Integration Points</h2>
          <p>
            Master Data integrates with all other ERP modules:
          </p>
          <ul>
            <li><strong>Sales</strong> - Customer information for transactions</li>
            <li><strong>Procurement</strong> - Supplier data for purchase orders</li>
            <li><strong>Inventory</strong> - Location and user data for stock control</li>
            <li><strong>Accounting</strong> - Chart of accounts and cost center structure</li>
            <li><strong>HR</strong> - Employee data and organizational hierarchy</li>
          </ul>

          <h2>Troubleshooting</h2>

          <h3>Common Issues</h3>
          
          <h4>Duplicate Records</h4>
          <p>
            Use the built-in duplicate detection tools to identify and merge duplicate customers 
            or suppliers. Always verify before merging to avoid data loss.
          </p>

          <h4>Import Errors</h4>
          <p>
            Check data format and required field validation. Common issues include missing 
            required fields, invalid data formats, and character encoding problems.
          </p>

          <h4>Permission Issues</h4>
          <p>
            Verify user roles and module-specific permissions. Check if the user has the 
            appropriate data access rights for the records they're trying to access.
          </p>

          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-6 my-8">
            <h4 className="text-amber-900 dark:text-amber-100 font-semibold mb-2">⚠️ Important Note</h4>
            <p className="text-amber-800 dark:text-amber-200">
              Master Data changes can affect all other modules. Always test changes in a 
              development environment first and backup your data before major modifications.
            </p>
          </div>

          <h2>Next Steps</h2>
          <p>
            Once you have your Master Data set up, you can proceed to configure other modules:
          </p>
          <ul>
            <li>Set up your Product catalog</li>
            <li>Configure Inventory management</li>
            <li>Start processing Sales transactions</li>
            <li>Begin using Procurement features</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href="/guidelines/modules">
              Module Guides
            </Link>
          </Button>
          <Button asChild>
            <Link href="/guidelines/modules/products">
              Products Guide
            </Link>
          </Button>
        </div>
      </div>
    </GuidelinesLayout>
  )
}