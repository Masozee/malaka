"use client"

import * as React from "react"
import Link from "next/link"
import { GuidelinesLayout } from "@/components/ui/guidelines-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function SalesGuidePage() {
  return (
    <GuidelinesLayout>
      <div className="container py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="default" className="bg-green-500">Intermediate</Badge>
            <Badge variant="outline">40 min read</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-4">Sales Management</h1>
          <p className="text-xl text-muted-foreground">
            Sales Management handles all aspects of your sales operations including 
            order processing, customer transactions, pricing, and sales analytics.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>Overview</h2>
          <p>
            The Sales module manages your entire sales process from initial customer 
            contact through order fulfillment. It integrates with inventory management, 
            customer data, and accounting to provide a complete sales solution.
          </p>

          <h2>Key Components</h2>

          <h3>Sales Orders</h3>
          <p>
            Sales orders are the foundation of your sales process:
          </p>
          <ul>
            <li>Customer order creation and management</li>
            <li>Product selection and pricing calculation</li>
            <li>Order status tracking and updates</li>
            <li>Delivery scheduling and coordination</li>
            <li>Order modification and cancellation handling</li>
          </ul>

          <h3>Quotations</h3>
          <p>
            Quote management for prospective sales:
          </p>
          <ul>
            <li>Customer quote generation and formatting</li>
            <li>Quote validity periods and terms</li>
            <li>Quote revision and version control</li>
            <li>Quote to order conversion</li>
            <li>Quote tracking and follow-up management</li>
          </ul>

          <h3>Point of Sale (POS)</h3>
          <p>
            Direct sales transactions and retail operations:
          </p>
          <ul>
            <li>Real-time transaction processing</li>
            <li>Payment method handling</li>
            <li>Receipt generation and printing</li>
            <li>Inventory real-time updates</li>
            <li>Daily sales reporting and reconciliation</li>
          </ul>

          <h3>Pricing Management</h3>
          <p>
            Flexible pricing strategies and discount management:
          </p>
          <ul>
            <li>Base pricing and cost-plus calculations</li>
            <li>Customer-specific pricing tiers</li>
            <li>Volume discounts and promotional pricing</li>
            <li>Regional and currency-specific pricing</li>
            <li>Dynamic pricing based on inventory levels</li>
          </ul>

          <h3>Sales Analytics</h3>
          <p>
            Comprehensive sales reporting and analysis:
          </p>
          <ul>
            <li>Sales performance metrics and KPIs</li>
            <li>Product performance analysis</li>
            <li>Customer behavior and trends</li>
            <li>Sales forecasting and projections</li>
            <li>Commission and incentive calculations</li>
          </ul>

          <h2>Getting Started</h2>

          <h3>Step 1: Configure Sales Gear</h3>
          <p>
            Set up basic sales configuration including default terms, tax settings, 
            and order numbering sequences. Configure your sales workflow stages 
            and approval processes if required.
          </p>

          <h3>Step 2: Set Up Pricing Rules</h3>
          <p>
            Establish your pricing strategy including base prices, customer-specific 
            pricing, and discount structures. Configure tax calculations and any 
            special pricing rules for different product categories.
          </p>

          <h3>Step 3: Configure Payment Methods</h3>
          <p>
            Set up accepted payment methods for different sales channels. Configure 
            credit terms, payment processing integration, and cash handling procedures 
            for POS operations.
          </p>

          <h3>Step 4: Train Sales Staff</h3>
          <p>
            Ensure your sales team understands the order process, product catalog 
            navigation, customer lookup procedures, and system workflows for 
            optimal efficiency.
          </p>

          <h3>Step 5: Test Sales Processes</h3>
          <p>
            Run test transactions through the complete sales cycle from quote 
            creation to order fulfillment. Verify inventory updates, customer 
            notifications, and accounting integration.
          </p>

          <h2>Common Workflows</h2>

          <h3>Processing a Sales Order</h3>
          <ol>
            <li>Navigate to Sales → Orders</li>
            <li>Click "Create New Order"</li>
            <li>Select or create customer record</li>
            <li>Add products with quantities and pricing</li>
            <li>Review order totals and apply discounts</li>
            <li>Set delivery terms and schedule</li>
            <li>Confirm order and generate confirmation</li>
            <li>Process payment and update order status</li>
          </ol>

          <h3>Creating and Managing Quotations</h3>
          <ol>
            <li>Go to Sales → Quotations</li>
            <li>Create new quotation for customer</li>
            <li>Add requested products and services</li>
            <li>Set quotation validity period</li>
            <li>Generate and send quote to customer</li>
            <li>Track quote status and customer response</li>
            <li>Convert accepted quotes to sales orders</li>
            <li>Archive or follow up on pending quotes</li>
          </ol>

          <h3>POS Transaction Processing</h3>
          <ol>
            <li>Access POS interface</li>
            <li>Scan or search for products</li>
            <li>Add items to current transaction</li>
            <li>Apply discounts if applicable</li>
            <li>Select payment method</li>
            <li>Process payment and print receipt</li>
            <li>Close transaction and update inventory</li>
            <li>End-of-day reconciliation and reporting</li>
          </ol>

          <h2>Best Practices</h2>

          <h3>Order Management</h3>
          <ul>
            <li>Establish clear order processing procedures</li>
            <li>Set up automated customer notifications</li>
            <li>Implement order approval workflows for large orders</li>
            <li>Maintain accurate delivery scheduling</li>
          </ul>

          <h3>Customer Service</h3>
          <ul>
            <li>Keep customer information current and complete</li>
            <li>Track customer preferences and purchase history</li>
            <li>Implement customer feedback collection</li>
            <li>Maintain professional communication standards</li>
          </ul>

          <h3>Inventory Integration</h3>
          <ul>
            <li>Ensure real-time inventory visibility</li>
            <li>Set up low stock alerts for sales staff</li>
            <li>Implement backorder management procedures</li>
            <li>Regular inventory reconciliation with sales data</li>
          </ul>

          <h2>Integration Points</h2>
          <p>
            Sales Management integrates closely with other ERP modules:
          </p>
          <ul>
            <li><strong>Inventory</strong> - Real-time stock availability and automatic updates</li>
            <li><strong>Accounting</strong> - Automatic invoice generation and revenue recognition</li>
            <li><strong>Customer Data</strong> - Complete customer history and preferences</li>
            <li><strong>Procurement</strong> - Automatic reorder triggers based on sales</li>
            <li><strong>Shipping</strong> - Order fulfillment and delivery coordination</li>
          </ul>

          <h2>Troubleshooting</h2>

          <h3>Common Issues</h3>
          
          <h4>Order Processing Errors</h4>
          <p>
            Check inventory availability, customer credit limits, and pricing accuracy. 
            Verify that all required order fields are completed and customer information 
            is current.
          </p>

          <h4>Pricing Discrepancies</h4>
          <p>
            Review pricing rules, customer-specific pricing agreements, and promotional 
            discount applications. Ensure tax calculations are configured correctly 
            for different customer types and locations.
          </p>

          <h4>POS System Issues</h4>
          <p>
            Verify network connectivity, check barcode scanner functionality, and ensure 
            payment processing systems are operational. Regular POS system maintenance 
            prevents most operational issues.
          </p>

          <h4>Inventory Sync Problems</h4>
          <p>
            Monitor real-time inventory updates and investigate any delays in stock 
            level synchronization. Implement manual inventory checks if automated 
            updates are failing.
          </p>

          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6 my-8">
            <h4 className="text-green-900 dark:text-green-100 font-semibold mb-2">💡 Sales Success Tip</h4>
            <p className="text-green-800 dark:text-green-200">
              Establish clear sales processes and train your team thoroughly. Consistent 
              order processing, accurate inventory information, and excellent customer 
              service are key to successful sales operations.
            </p>
          </div>

          <h2>Performance Metrics</h2>
          <p>
            Key performance indicators to monitor for sales success:
          </p>
          <ul>
            <li>Order processing time and accuracy</li>
            <li>Customer satisfaction and repeat business</li>
            <li>Sales conversion rates and average order value</li>
            <li>Inventory turnover and stock availability</li>
            <li>Payment processing efficiency and collection rates</li>
          </ul>

          <h2>Next Steps</h2>
          <p>
            With sales operations configured, you can enhance your system by:
          </p>
          <ul>
            <li>Setting up advanced reporting and analytics</li>
            <li>Implementing customer relationship management features</li>
            <li>Configuring automated reorder points based on sales patterns</li>
            <li>Establishing sales forecasting and planning processes</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href="/guidelines/modules/products">
              Products Guide
            </Link>
          </Button>
          <Button asChild>
            <Link href="/guidelines/modules/inventory">
              Inventory Guide
            </Link>
          </Button>
        </div>
      </div>
    </GuidelinesLayout>
  )
}