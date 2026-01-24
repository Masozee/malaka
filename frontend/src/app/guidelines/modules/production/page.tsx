"use client"

import * as React from "react"
import Link from "next/link"
import { GuidelinesLayout } from "@/components/ui/guidelines-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ProductionGuidePage() {
  return (
    <GuidelinesLayout>
      <div className="container py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="default" className="bg-orange-500">Advanced</Badge>
            <Badge variant="outline">60 min read</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-4">Production Management</h1>
          <p className="text-xl text-muted-foreground">
            Production Management handles manufacturing operations, work orders, 
            resource planning, and production scheduling for efficient manufacturing processes.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>Overview</h2>
          <p>
            The Production module manages your entire manufacturing process from 
            production planning through finished goods completion. It coordinates 
            material requirements, work center capacity, quality control, and 
            production reporting to optimize manufacturing efficiency.
          </p>

          <h2>Key Components</h2>

          <h3>Work Orders</h3>
          <p>
            Work orders drive your production activities and track manufacturing progress:
          </p>
          <ul>
            <li>Production order creation and scheduling</li>
            <li>Bill of materials (BOM) management</li>
            <li>Resource and labor allocation</li>
            <li>Production progress tracking</li>
            <li>Material consumption recording</li>
            <li>Quality control checkpoints</li>
          </ul>

          <h3>Production Planning</h3>
          <p>
            Strategic planning and scheduling of manufacturing activities:
          </p>
          <ul>
            <li>Master production schedule (MPS)</li>
            <li>Material requirements planning (MRP)</li>
            <li>Capacity requirements planning (CRP)</li>
            <li>Demand forecasting integration</li>
            <li>Production calendar management</li>
            <li>Resource optimization</li>
          </ul>

          <h3>Work Centers</h3>
          <p>
            Manufacturing resource and facility management:
          </p>
          <ul>
            <li>Production facility setup</li>
            <li>Machine and equipment management</li>
            <li>Capacity planning and scheduling</li>
            <li>Maintenance scheduling integration</li>
            <li>Efficiency and utilization tracking</li>
            <li>Cost center allocation</li>
          </ul>

          <h3>Bill of Materials (BOM)</h3>
          <p>
            Product structure and component management:
          </p>
          <ul>
            <li>Multi-level BOM creation and maintenance</li>
            <li>Component and subassembly management</li>
            <li>Version control and engineering changes</li>
            <li>Costing and material planning</li>
            <li>Substitute and alternate components</li>
            <li>BOM validation and approval workflows</li>
          </ul>

          <h3>Quality Control</h3>
          <p>
            Production quality management and compliance:
          </p>
          <ul>
            <li>Quality checkpoints and inspections</li>
            <li>Non-conformance tracking</li>
            <li>Quality metrics and reporting</li>
            <li>Corrective action management</li>
            <li>Supplier quality monitoring</li>
            <li>Quality certification compliance</li>
          </ul>

          <h2>Getting Started</h2>

          <h3>Step 1: Set Up Work Centers</h3>
          <p>
            Define your production facilities including machines, work stations, 
            and production lines. Configure capacity information, operating 
            schedules, and cost parameters for each work center.
          </p>

          <h3>Step 2: Create Bills of Materials</h3>
          <p>
            Build product structures for all manufactured items including 
            component requirements, quantities, and specifications. Establish 
            BOM approval processes and version control procedures.
          </p>

          <h3>Step 3: Configure Production Parameters</h3>
          <p>
            Set up production planning parameters including planning horizons, 
            lot sizing rules, lead times, and safety stock levels. Configure 
            MRP and capacity planning settings.
          </p>

          <h3>Step 4: Establish Quality Procedures</h3>
          <p>
            Define quality control checkpoints, inspection procedures, and 
            quality standards for your production processes. Set up non-conformance 
            handling and corrective action workflows.
          </p>

          <h3>Step 5: Train Production Staff</h3>
          <p>
            Train production personnel on work order processing, material handling, 
            quality procedures, and system data entry to ensure smooth production 
            operations.
          </p>

          <h2>Common Workflows</h2>

          <h3>Creating a Work Order</h3>
          <ol>
            <li>Navigate to Production → Work Orders</li>
            <li>Create new work order for finished product</li>
            <li>Specify quantity and due date</li>
            <li>Select or create bill of materials</li>
            <li>Assign work center and routing</li>
            <li>Schedule production based on capacity</li>
            <li>Release order for material allocation</li>
            <li>Begin production and track progress</li>
          </ol>

          <h3>Material Requirements Planning</h3>
          <ol>
            <li>Access Production → Planning</li>
            <li>Run MRP calculation for planning period</li>
            <li>Review material requirements report</li>
            <li>Analyze capacity requirements</li>
            <li>Generate purchase requisitions</li>
            <li>Create additional work orders as needed</li>
            <li>Adjust schedules for resource conflicts</li>
            <li>Communicate plan to relevant departments</li>
          </ol>

          <h3>Production Reporting</h3>
          <ol>
            <li>Go to work order in progress</li>
            <li>Record actual material consumption</li>
            <li>Report labor hours and machine time</li>
            <li>Perform quality inspections</li>
            <li>Record production quantities</li>
            <li>Update work order progress status</li>
            <li>Report completion when finished</li>
            <li>Update inventory with finished goods</li>
          </ol>

          <h2>Best Practices</h2>

          <h3>Production Planning</h3>
          <ul>
            <li>Maintain accurate and current bills of materials</li>
            <li>Regular review and update of planning parameters</li>
            <li>Balance production smoothing with customer requirements</li>
            <li>Implement realistic capacity planning</li>
          </ul>

          <h3>Work Order Management</h3>
          <ul>
            <li>Use consistent work order numbering and documentation</li>
            <li>Implement clear work order approval processes</li>
            <li>Maintain accurate routing and operation sequences</li>
            <li>Track actual vs. planned performance</li>
          </ul>

          <h3>Quality Management</h3>
          <ul>
            <li>Establish clear quality standards and procedures</li>
            <li>Implement preventive quality measures</li>
            <li>Document and track quality issues</li>
            <li>Continuous improvement based on quality data</li>
          </ul>

          <h2>Integration Points</h2>
          <p>
            Production Management integrates with all major ERP functions:
          </p>
          <ul>
            <li><strong>Inventory</strong> - Material consumption and finished goods receipt</li>
            <li><strong>Procurement</strong> - Material requirements and purchase planning</li>
            <li><strong>Sales</strong> - Production planning based on sales forecasts</li>
            <li><strong>Accounting</strong> - Work-in-process and manufacturing cost tracking</li>
            <li><strong>HR</strong> - Labor planning and time tracking integration</li>
          </ul>

          <h2>Troubleshooting</h2>

          <h3>Common Issues</h3>
          
          <h4>Material Shortages</h4>
          <p>
            Review MRP parameters and lead times. Check for accuracy in bills 
            of materials and inventory records. Implement better demand forecasting 
            and supplier management to prevent shortages.
          </p>

          <h4>Capacity Overloads</h4>
          <p>
            Analyze work center utilization and identify bottlenecks. Consider 
            alternative routing, overtime scheduling, or subcontracting. Review 
            capacity planning parameters for accuracy.
          </p>

          <h4>Quality Issues</h4>
          <p>
            Investigate root causes through quality data analysis. Review and 
            update quality procedures and training. Implement preventive measures 
            and supplier quality improvements.
          </p>

          <h4>Schedule Delays</h4>
          <p>
            Analyze actual vs. planned performance data. Identify process bottlenecks 
            and resource constraints. Improve scheduling accuracy and implement 
            better tracking systems.
          </p>

          <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-6 my-8">
            <h4 className="text-orange-900 dark:text-orange-100 font-semibold mb-2">⚡ Production Efficiency Tip</h4>
            <p className="text-orange-800 dark:text-orange-200">
              Focus on improving Overall Equipment Effectiveness (OEE) by tracking 
              availability, performance, and quality metrics. Small improvements 
              in each area can significantly impact overall production efficiency.
            </p>
          </div>

          <h2>Key Performance Indicators</h2>
          <p>
            Critical metrics for production performance monitoring:
          </p>
          <ul>
            <li>On-time delivery performance</li>
            <li>Overall Equipment Effectiveness (OEE)</li>
            <li>Work order completion accuracy</li>
            <li>Material yield and waste percentages</li>
            <li>Production cost variance analysis</li>
            <li>Quality first-pass yield rates</li>
          </ul>

          <h2>Advanced Features</h2>
          <p>
            Explore advanced production management capabilities:
          </p>
          <ul>
            <li>Finite capacity scheduling</li>
            <li>Advanced planning and optimization (APO)</li>
            <li>Lean manufacturing and kanban systems</li>
            <li>Statistical process control (SPC)</li>
            <li>Maintenance integration and planning</li>
            <li>Shop floor data collection systems</li>
          </ul>

          <h2>Next Steps</h2>
          <p>
            With production management established, enhance your manufacturing by:
          </p>
          <ul>
            <li>Implementing advanced scheduling algorithms</li>
            <li>Setting up real-time production monitoring</li>
            <li>Configuring maintenance management integration</li>
            <li>Establishing continuous improvement processes</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href="/guidelines/modules/inventory">
              Inventory Guide
            </Link>
          </Button>
          <Button asChild>
            <Link href="/guidelines/modules/procurement">
              Procurement Guide
            </Link>
          </Button>
        </div>
      </div>
    </GuidelinesLayout>
  )
}