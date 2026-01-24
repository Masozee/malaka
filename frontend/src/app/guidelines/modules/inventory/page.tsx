"use client"

import * as React from "react"
import Link from "next/link"
import { GuidelinesLayout } from "@/components/ui/guidelines-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function InventoryGuidePage() {
  return (
    <GuidelinesLayout>
      <div className="container py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="default" className="bg-purple-500">Intermediate</Badge>
            <Badge variant="outline">50 min read</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-4">Inventory Management</h1>
          <p className="text-xl text-muted-foreground">
            Inventory Management provides complete control over stock levels, warehouse 
            operations, stock movements, and inventory optimization across all locations.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>Overview</h2>
          <p>
            The Inventory module tracks all stock movements, manages multiple warehouse 
            locations, controls stock levels, and provides real-time inventory visibility. 
            It integrates with sales, purchasing, and production to maintain accurate 
            stock information across your entire operation.
          </p>

          <h2>Key Components</h2>

          <h3>Stock Control</h3>
          <p>
            Central stock management and tracking capabilities:
          </p>
          <ul>
            <li>Real-time stock level monitoring</li>
            <li>Multi-location inventory tracking</li>
            <li>Stock movement history and audit trails</li>
            <li>Minimum and maximum stock level management</li>
            <li>Automated reorder point calculations</li>
            <li>Stock valuation and costing methods</li>
          </ul>

          <h3>Warehouse Management</h3>
          <p>
            Comprehensive warehouse operations management:
          </p>
          <ul>
            <li>Multiple warehouse location support</li>
            <li>Bin and shelf location management</li>
            <li>Picking and packing operations</li>
            <li>Warehouse layout optimization</li>
            <li>Receiving and put-away processes</li>
            <li>Warehouse staff task management</li>
          </ul>

          <h3>Stock Movements</h3>
          <p>
            Complete tracking of all inventory movements:
          </p>
          <ul>
            <li>Inbound receipts from suppliers</li>
            <li>Outbound shipments to customers</li>
            <li>Inter-warehouse transfers</li>
            <li>Stock adjustments and corrections</li>
            <li>Production consumption and output</li>
            <li>Return and damage processing</li>
          </ul>

          <h3>Stock Count & Auditing</h3>
          <p>
            Inventory accuracy and audit management:
          </p>
          <ul>
            <li>Cycle counting and physical inventory</li>
            <li>Stock count scheduling and management</li>
            <li>Variance analysis and resolution</li>
            <li>Audit trail and documentation</li>
            <li>ABC analysis for count prioritization</li>
            <li>Count accuracy metrics and reporting</li>
          </ul>

          <h3>Inventory Optimization</h3>
          <p>
            Advanced inventory planning and optimization:
          </p>
          <ul>
            <li>Demand forecasting and planning</li>
            <li>Safety stock calculations</li>
            <li>Lead time management</li>
            <li>Dead stock identification</li>
            <li>Fast/slow-moving analysis</li>
            <li>Carrying cost optimization</li>
          </ul>

          <h2>Getting Started</h2>

          <h3>Step 1: Set Up Warehouses</h3>
          <p>
            Define your warehouse locations including main warehouses, distribution 
            centers, and retail locations. Configure each location with address 
            information, contact details, and operational parameters.
          </p>

          <h3>Step 2: Configure Stock Control Gear</h3>
          <p>
            Set up your inventory tracking preferences including costing methods 
            (FIFO, LIFO, or Average), stock level calculations, and reorder point 
            algorithms based on your business requirements.
          </p>

          <h3>Step 3: Import Initial Stock Levels</h3>
          <p>
            Load your current inventory levels into the system using bulk import 
            or manual entry. Ensure accurate opening balances for all products 
            across all warehouse locations.
          </p>

          <h3>Step 4: Set Up Location Management</h3>
          <p>
            Configure bin locations, shelf numbering, and warehouse layout mapping 
            if you need detailed location tracking. This helps with picking efficiency 
            and stock organization.
          </p>

          <h3>Step 5: Configure Automated Rules</h3>
          <p>
            Set up reorder points, maximum stock levels, and automated purchasing 
            triggers. Configure stock alerts and notifications for critical inventory 
            situations.
          </p>

          <h2>Common Workflows</h2>

          <h3>Receiving Inventory</h3>
          <ol>
            <li>Navigate to Inventory → Receipts</li>
            <li>Create receipt from purchase order</li>
            <li>Scan or enter received quantities</li>
            <li>Verify product quality and condition</li>
            <li>Assign bin locations for put-away</li>
            <li>Update stock levels and cost information</li>
            <li>Generate receipt documentation</li>
            <li>Update purchase order status</li>
          </ol>

          <h3>Processing Stock Transfers</h3>
          <ol>
            <li>Go to Inventory → Transfers</li>
            <li>Create new transfer request</li>
            <li>Select source and destination warehouses</li>
            <li>Add products and transfer quantities</li>
            <li>Generate transfer documentation</li>
            <li>Process shipment from source warehouse</li>
            <li>Receive and confirm at destination</li>
            <li>Update stock levels in both locations</li>
          </ol>

          <h3>Conducting Stock Counts</h3>
          <ol>
            <li>Access Inventory → Stock Count</li>
            <li>Create new count session</li>
            <li>Define count scope and parameters</li>
            <li>Generate count sheets or mobile tasks</li>
            <li>Perform physical counting</li>
            <li>Enter count results in system</li>
            <li>Analyze variances and investigate discrepancies</li>
            <li>Approve adjustments and update stock levels</li>
          </ol>

          <h2>Best Practices</h2>

          <h3>Stock Accuracy</h3>
          <ul>
            <li>Implement regular cycle counting programs</li>
            <li>Maintain clean and organized warehouse areas</li>
            <li>Train staff on proper receiving and shipping procedures</li>
            <li>Use barcode scanning for all transactions</li>
          </ul>

          <h3>Warehouse Efficiency</h3>
          <ul>
            <li>Optimize warehouse layout for picking efficiency</li>
            <li>Implement first-in-first-out (FIFO) rotation</li>
            <li>Use zone picking and batch processing</li>
            <li>Maintain clear location labeling and signage</li>
          </ul>

          <h3>Inventory Planning</h3>
          <ul>
            <li>Regular review and adjustment of reorder points</li>
            <li>Monitor demand patterns and seasonality</li>
            <li>Analyze supplier lead times and reliability</li>
            <li>Balance inventory investment with service levels</li>
          </ul>

          <h2>Integration Points</h2>
          <p>
            Inventory Management integrates with all major business functions:
          </p>
          <ul>
            <li><strong>Sales</strong> - Real-time stock availability and automatic reservations</li>
            <li><strong>Procurement</strong> - Automatic reorder triggers and receipt processing</li>
            <li><strong>Production</strong> - Material consumption and finished goods receipt</li>
            <li><strong>Accounting</strong> - Inventory valuation and cost of goods sold</li>
            <li><strong>Shipping</strong> - Pick list generation and fulfillment tracking</li>
          </ul>

          <h2>Troubleshooting</h2>

          <h3>Common Issues</h3>
          
          <h4>Stock Level Discrepancies</h4>
          <p>
            Investigate transaction history and check for unrecorded movements. 
            Review receiving and shipping procedures to identify process gaps. 
            Implement more frequent cycle counting for affected products.
          </p>

          <h4>Negative Stock Levels</h4>
          <p>
            Check for timing issues between sales and receipts. Verify that 
            backorders are properly managed and that stock reservations are 
            working correctly. Review minimum stock level settings.
          </p>

          <h4>Slow Moving Inventory</h4>
          <p>
            Analyze demand patterns and review sales forecasts. Consider markdown 
            strategies or return arrangements with suppliers. Adjust reorder points 
            and maximum stock levels for slow-moving items.
          </p>

          <h4>Picking Errors</h4>
          <p>
            Review warehouse layout and location accuracy. Verify that bin locations 
            are clearly marked and up-to-date in the system. Consider implementing 
            pick confirmation scanning.
          </p>

          <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-6 my-8">
            <h4 className="text-purple-900 dark:text-purple-100 font-semibold mb-2">💡 Inventory Optimization Tip</h4>
            <p className="text-purple-800 dark:text-purple-200">
              Use ABC analysis to focus your attention on high-value items. Monitor 
              your A-class items closely with tight controls, while managing C-class 
              items with simpler processes to optimize your time and resources.
            </p>
          </div>

          <h2>Key Performance Indicators</h2>
          <p>
            Important metrics to monitor for inventory performance:
          </p>
          <ul>
            <li>Inventory accuracy percentage</li>
            <li>Inventory turnover ratio</li>
            <li>Stockout frequency and duration</li>
            <li>Carrying cost as percentage of inventory value</li>
            <li>Order fulfillment rate and picking accuracy</li>
            <li>Warehouse space utilization</li>
          </ul>

          <h2>Advanced Features</h2>
          <p>
            Explore advanced inventory management capabilities:
          </p>
          <ul>
            <li>Serial number and lot tracking</li>
            <li>Expiration date management</li>
            <li>Consignment inventory tracking</li>
            <li>Multi-unit of measure handling</li>
            <li>Kitting and assembly management</li>
            <li>Vendor-managed inventory (VMI)</li>
          </ul>

          <h2>Next Steps</h2>
          <p>
            With inventory management established, enhance your operations by:
          </p>
          <ul>
            <li>Implementing advanced demand forecasting</li>
            <li>Setting up automated purchasing workflows</li>
            <li>Configuring production material planning</li>
            <li>Establishing inventory optimization reporting</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href="/guidelines/modules/sales">
              Sales Guide
            </Link>
          </Button>
          <Button asChild>
            <Link href="/guidelines/modules/production">
              Production Guide
            </Link>
          </Button>
        </div>
      </div>
    </GuidelinesLayout>
  )
}