"use client"

import * as React from "react"
import Link from "next/link"
import { GuidelinesLayout } from "@/components/ui/guidelines-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ProcurementGuidePage() {
  return (
    <GuidelinesLayout>
      <div className="container py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="default" className="bg-indigo-500">Intermediate</Badge>
            <Badge variant="outline">45 min read</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-4">Procurement Management</h1>
          <p className="text-xl text-muted-foreground">
            Procurement Management handles all purchasing activities including supplier management, 
            purchase orders, request for quotations, and vendor evaluation processes.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>Overview</h2>
          <p>
            The Procurement module manages your entire purchasing process from 
            supplier qualification through order fulfillment and payment. It provides 
            tools for strategic sourcing, cost management, supplier performance 
            monitoring, and procurement analytics.
          </p>

          <h2>Key Components</h2>

          <h3>Purchase Orders</h3>
          <p>
            Central purchasing document management and processing:
          </p>
          <ul>
            <li>Purchase order creation and approval workflows</li>
            <li>Multi-line item orders with specifications</li>
            <li>Delivery scheduling and terms management</li>
            <li>Order modification and cancellation handling</li>
            <li>Receipt matching and three-way matching</li>
            <li>Purchase order status tracking and reporting</li>
          </ul>

          <h3>Request for Quotations (RFQ)</h3>
          <p>
            Competitive bidding and supplier selection processes:
          </p>
          <ul>
            <li>RFQ creation and specification definition</li>
            <li>Multi-supplier quote solicitation</li>
            <li>Quote comparison and analysis tools</li>
            <li>Supplier evaluation and scoring</li>
            <li>Award decisions and notifications</li>
            <li>Quote history and audit trails</li>
          </ul>

          <h3>Supplier Management</h3>
          <p>
            Comprehensive vendor relationship management:
          </p>
          <ul>
            <li>Supplier registration and qualification</li>
            <li>Supplier performance monitoring</li>
            <li>Contract and agreement management</li>
            <li>Supplier scorecards and ratings</li>
            <li>Risk assessment and mitigation</li>
            <li>Supplier development programs</li>
          </ul>

          <h3>Purchase Requisitions</h3>
          <p>
            Internal purchase request and approval management:
          </p>
          <ul>
            <li>Requisition creation and submission</li>
            <li>Multi-level approval workflows</li>
            <li>Budget checking and validation</li>
            <li>Requisition consolidation for purchasing</li>
            <li>Status tracking and notifications</li>
            <li>Emergency and rush order handling</li>
          </ul>

          <h3>Contract Management</h3>
          <p>
            Supplier contract and agreement administration:
          </p>
          <ul>
            <li>Contract creation and negotiation tracking</li>
            <li>Terms and conditions management</li>
            <li>Contract renewal and expiration monitoring</li>
            <li>Compliance tracking and reporting</li>
            <li>Price agreement and escalation management</li>
            <li>Contract performance measurement</li>
          </ul>

          <h2>Getting Started</h2>

          <h3>Step 1: Set Up Supplier Database</h3>
          <p>
            Register your key suppliers with complete contact information, 
            payment terms, and qualification status. Establish supplier 
            categories and classification systems for better organization.
          </p>

          <h3>Step 2: Configure Approval Workflows</h3>
          <p>
            Set up purchase approval hierarchies based on order values and 
            organizational structure. Define approval limits, routing rules, 
            and escalation procedures for purchasing decisions.
          </p>

          <h3>Step 3: Establish Purchasing Policies</h3>
          <p>
            Define purchasing policies including preferred suppliers, competitive 
            bidding thresholds, contract requirements, and compliance standards. 
            Configure system rules to enforce these policies.
          </p>

          <h3>Step 4: Set Up Item Catalogs</h3>
          <p>
            Create standardized item catalogs with preferred suppliers, standard 
            pricing, and specifications. This streamlines ordering and ensures 
            compliance with purchasing standards.
          </p>

          <h3>Step 5: Train Procurement Staff</h3>
          <p>
            Train purchasing personnel on system workflows, approval processes, 
            supplier evaluation procedures, and reporting requirements to ensure 
            effective procurement operations.
          </p>

          <h2>Common Workflows</h2>

          <h3>Processing a Purchase Requisition</h3>
          <ol>
            <li>Employee creates purchase requisition</li>
            <li>System routes for departmental approval</li>
            <li>Budget validation and availability check</li>
            <li>Procurement team reviews and consolidates</li>
            <li>Convert approved requisitions to purchase orders</li>
            <li>Send purchase orders to suppliers</li>
            <li>Track delivery and receipt confirmation</li>
            <li>Process invoice and payment</li>
          </ol>

          <h3>Conducting an RFQ Process</h3>
          <ol>
            <li>Navigate to Procurement → RFQ</li>
            <li>Create new RFQ with detailed specifications</li>
            <li>Select suppliers and send quote requests</li>
            <li>Receive and record supplier quotations</li>
            <li>Compare quotes using analysis tools</li>
            <li>Evaluate suppliers on price and other criteria</li>
            <li>Award business to selected supplier(s)</li>
            <li>Convert winning quotes to purchase orders</li>
          </ol>

          <h3>Supplier Performance Evaluation</h3>
          <ol>
            <li>Access Procurement → Supplier Management</li>
            <li>Review supplier delivery performance</li>
            <li>Evaluate quality metrics and returns</li>
            <li>Assess pricing competitiveness</li>
            <li>Check service and responsiveness ratings</li>
            <li>Update supplier scorecards</li>
            <li>Implement improvement plans as needed</li>
            <li>Adjust supplier status and preferences</li>
          </ol>

          <h2>Best Practices</h2>

          <h3>Supplier Relationship Management</h3>
          <ul>
            <li>Maintain current and accurate supplier information</li>
            <li>Regular supplier performance reviews and feedback</li>
            <li>Develop strategic partnerships with key suppliers</li>
            <li>Implement supplier diversity and sustainability programs</li>
          </ul>

          <h3>Cost Management</h3>
          <ul>
            <li>Regular market analysis and price benchmarking</li>
            <li>Implement total cost of ownership analysis</li>
            <li>Use competitive bidding for significant purchases</li>
            <li>Negotiate volume discounts and long-term agreements</li>
          </ul>

          <h3>Process Efficiency</h3>
          <ul>
            <li>Standardize purchasing procedures and documentation</li>
            <li>Implement electronic procurement workflows</li>
            <li>Use purchase catalogs for routine items</li>
            <li>Automate approval routing and notifications</li>
          </ul>

          <h2>Integration Points</h2>
          <p>
            Procurement Management integrates with multiple ERP modules:
          </p>
          <ul>
            <li><strong>Inventory</strong> - Automatic reorder triggers and receipt processing</li>
            <li><strong>Production</strong> - Material requirements planning and production scheduling</li>
            <li><strong>Accounting</strong> - Purchase invoice processing and payment management</li>
            <li><strong>Master Data</strong> - Supplier information and product specifications</li>
            <li><strong>Budget Management</strong> - Budget validation and spending analysis</li>
          </ul>

          <h2>Troubleshooting</h2>

          <h3>Common Issues</h3>
          
          <h4>Delayed Deliveries</h4>
          <p>
            Monitor supplier delivery performance and identify chronic issues. 
            Work with suppliers on improvement plans and consider alternative 
            sources for critical items. Implement supplier performance penalties 
            where appropriate.
          </p>

          <h4>Quality Problems</h4>
          <p>
            Track quality metrics and implement corrective action procedures. 
            Work with suppliers on quality improvement programs and consider 
            supplier audits for persistent issues. Update specifications as needed.
          </p>

          <h4>Price Increases</h4>
          <p>
            Monitor market conditions and validate price increase justifications. 
            Negotiate with suppliers and seek alternative sources where possible. 
            Consider long-term contracts to stabilize pricing.
          </p>

          <h4>Approval Bottlenecks</h4>
          <p>
            Review approval workflows for efficiency and appropriate delegation. 
            Consider raising approval limits or implementing emergency procedures 
            for urgent purchases. Track approval cycle times and identify delays.
          </p>

          <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6 my-8">
            <h4 className="text-indigo-900 dark:text-indigo-100 font-semibold mb-2">🎯 Strategic Procurement Tip</h4>
            <p className="text-indigo-800 dark:text-indigo-200">
              Focus on total cost of ownership rather than just purchase price. 
              Consider quality, delivery reliability, service support, and long-term 
              relationship value when making supplier selection decisions.
            </p>
          </div>

          <h2>Key Performance Indicators</h2>
          <p>
            Important metrics for procurement performance measurement:
          </p>
          <ul>
            <li>Purchase order processing cycle time</li>
            <li>Supplier on-time delivery performance</li>
            <li>Cost savings achieved through negotiation</li>
            <li>Purchase order accuracy and error rates</li>
            <li>Supplier quality performance metrics</li>
            <li>Contract compliance and utilization rates</li>
          </ul>

          <h2>Advanced Features</h2>
          <p>
            Explore advanced procurement capabilities:
          </p>
          <ul>
            <li>Strategic sourcing and category management</li>
            <li>Supplier risk assessment and monitoring</li>
            <li>Sustainability and social responsibility tracking</li>
            <li>Procurement analytics and spend analysis</li>
            <li>E-procurement and supplier portals</li>
            <li>Supply chain visibility and tracking</li>
          </ul>

          <h2>Compliance and Risk Management</h2>
          <p>
            Important considerations for procurement compliance:
          </p>
          <ul>
            <li>Regulatory compliance and audit requirements</li>
            <li>Supplier financial stability monitoring</li>
            <li>Contract risk assessment and mitigation</li>
            <li>Ethical sourcing and anti-corruption policies</li>
            <li>Business continuity and supply chain resilience</li>
            <li>Data security and confidentiality protection</li>
          </ul>

          <h2>Next Steps</h2>
          <p>
            With procurement management established, enhance your operations by:
          </p>
          <ul>
            <li>Implementing strategic sourcing initiatives</li>
            <li>Setting up supplier collaboration portals</li>
            <li>Configuring advanced analytics and reporting</li>
            <li>Establishing category management processes</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href="/guidelines/modules/production">
              Production Guide
            </Link>
          </Button>
          <Button asChild>
            <Link href="/guidelines/modules/shipping">
              Shipping Guide
            </Link>
          </Button>
        </div>
      </div>
    </GuidelinesLayout>
  )
}