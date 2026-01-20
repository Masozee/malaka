"use client"

import * as React from "react"
import Link from "next/link"
import { GuidelinesLayout } from "@/components/ui/guidelines-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function ShippingGuidePage() {
  return (
    <GuidelinesLayout>
      <div className="container py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="default" className="bg-teal-500">Intermediate</Badge>
            <Badge variant="outline">35 min read</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-4">Shipping & Logistics</h1>
          <p className="text-xl text-muted-foreground">
            Shipping & Logistics manages order fulfillment, carrier coordination, 
            delivery tracking, and logistics optimization for efficient product distribution.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>Overview</h2>
          <p>
            The Shipping module coordinates the movement of goods from warehouse 
            to customer, managing carrier relationships, shipping methods, tracking, 
            and delivery confirmation. It integrates with sales and inventory to 
            ensure accurate and timely order fulfillment.
          </p>

          <h2>Key Components</h2>

          <h3>Shipment Management</h3>
          <p>
            Central coordination of outbound shipments and deliveries:
          </p>
          <ul>
            <li>Shipment creation from sales orders</li>
            <li>Pick list generation and warehouse coordination</li>
            <li>Packing and packaging specifications</li>
            <li>Shipping document generation</li>
            <li>Shipment consolidation and optimization</li>
            <li>Delivery scheduling and coordination</li>
          </ul>

          <h3>Carrier Management</h3>
          <p>
            Transportation provider relationship and service management:
          </p>
          <ul>
            <li>Carrier registration and qualification</li>
            <li>Service level agreements and terms</li>
            <li>Rate management and cost calculation</li>
            <li>Carrier performance monitoring</li>
            <li>Route optimization and planning</li>
            <li>Carrier capacity management</li>
          </ul>

          <h3>Tracking & Delivery</h3>
          <p>
            Shipment tracking and delivery confirmation systems:
          </p>
          <ul>
            <li>Real-time shipment tracking</li>
            <li>Delivery status updates and notifications</li>
            <li>Proof of delivery collection</li>
            <li>Exception handling and issue resolution</li>
            <li>Customer delivery notifications</li>
            <li>Return and reverse logistics management</li>
          </ul>

          <h3>Logistics Planning</h3>
          <p>
            Strategic logistics and distribution planning:
          </p>
          <ul>
            <li>Distribution network optimization</li>
            <li>Warehouse location planning</li>
            <li>Inventory placement optimization</li>
            <li>Transportation cost analysis</li>
            <li>Service level optimization</li>
            <li>Seasonal capacity planning</li>
          </ul>

          <h3>Documentation</h3>
          <p>
            Shipping documentation and compliance management:
          </p>
          <ul>
            <li>Bill of lading generation</li>
            <li>Commercial invoices and customs documents</li>
            <li>Packing lists and shipping labels</li>
            <li>Certificate of origin and trade documents</li>
            <li>Hazardous materials documentation</li>
            <li>Insurance and claims documentation</li>
          </ul>

          <h2>Getting Started</h2>

          <h3>Step 1: Set Up Shipping Zones</h3>
          <p>
            Define shipping zones and regions for rate calculation and service 
            level determination. Configure zone mappings based on postal codes, 
            geographic regions, and delivery requirements.
          </p>

          <h3>Step 2: Configure Carriers</h3>
          <p>
            Register shipping carriers with service offerings, rate structures, 
            and integration parameters. Set up carrier APIs for automated rate 
            calculation and tracking integration.
          </p>

          <h3>Step 3: Establish Shipping Methods</h3>
          <p>
            Create shipping method templates with cost calculations, delivery 
            timeframes, and service parameters. Configure customer-specific 
            shipping preferences and agreements.
          </p>

          <h3>Step 4: Set Up Packaging Rules</h3>
          <p>
            Define packaging specifications, box sizes, weight limits, and 
            packing rules for different product types. Configure automated 
            packaging optimization for cost and efficiency.
          </p>

          <h3>Step 5: Configure Warehouse Integration</h3>
          <p>
            Integrate shipping processes with warehouse management including 
            pick list generation, packing workflows, and shipping dock operations. 
            Set up barcode scanning and tracking systems.
          </p>

          <h2>Common Workflows</h2>

          <h3>Processing an Outbound Shipment</h3>
          <ol>
            <li>Sales order triggers shipment creation</li>
            <li>System generates pick list for warehouse</li>
            <li>Warehouse picks and packs items</li>
            <li>Select carrier and shipping method</li>
            <li>Generate shipping labels and documentation</li>
            <li>Dispatch shipment with carrier</li>
            <li>Update order status and notify customer</li>
            <li>Track delivery and confirm receipt</li>
          </ol>

          <h3>Managing Carrier Selection</h3>
          <ol>
            <li>Navigate to Shipping → Carrier Management</li>
            <li>Review shipment requirements and constraints</li>
            <li>Compare carrier rates and service levels</li>
            <li>Consider delivery timeframes and reliability</li>
            <li>Select optimal carrier for shipment</li>
            <li>Generate shipping documentation</li>
            <li>Schedule pickup or delivery to carrier</li>
            <li>Monitor shipment progress and performance</li>
          </ol>

          <h3>Handling Delivery Exceptions</h3>
          <ol>
            <li>Monitor shipment tracking for delays or issues</li>
            <li>Receive exception alerts from carrier systems</li>
            <li>Investigate root cause of delivery problem</li>
            <li>Coordinate with carrier for resolution</li>
            <li>Communicate status updates to customer</li>
            <li>Implement corrective actions as needed</li>
            <li>Document lessons learned and improvements</li>
            <li>Update processes to prevent future issues</li>
          </ol>

          <h2>Best Practices</h2>

          <h3>Shipment Optimization</h3>
          <ul>
            <li>Consolidate shipments when possible for cost efficiency</li>
            <li>Use appropriate packaging to minimize dimensional weight</li>
            <li>Optimize route planning and carrier selection</li>
            <li>Implement zone skipping and strategic shipping</li>
          </ul>

          <h3>Customer Service</h3>
          <ul>
            <li>Provide accurate delivery timeframes and tracking</li>
            <li>Proactive communication about delays or issues</li>
            <li>Offer multiple shipping options and delivery methods</li>
            <li>Handle returns and exchanges efficiently</li>
          </ul>

          <h3>Cost Management</h3>
          <ul>
            <li>Regular review and negotiation of carrier rates</li>
            <li>Monitor shipping costs as percentage of sales</li>
            <li>Analyze packaging efficiency and optimization</li>
            <li>Implement cost allocation and chargeback systems</li>
          </ul>

          <h2>Integration Points</h2>
          <p>
            Shipping & Logistics integrates with key business processes:
          </p>
          <ul>
            <li><strong>Sales</strong> - Order fulfillment and delivery coordination</li>
            <li><strong>Inventory</strong> - Stock allocation and warehouse operations</li>
            <li><strong>Customer Service</strong> - Delivery tracking and issue resolution</li>
            <li><strong>Accounting</strong> - Freight cost allocation and billing</li>
            <li><strong>Procurement</strong> - Inbound logistics and supplier coordination</li>
          </ul>

          <h2>Troubleshooting</h2>

          <h3>Common Issues</h3>
          
          <h4>Delivery Delays</h4>
          <p>
            Monitor carrier performance and identify recurring delay patterns. 
            Work with carriers on service improvements and consider alternative 
            routing or backup carriers for critical shipments.
          </p>

          <h4>Damaged Shipments</h4>
          <p>
            Review packaging specifications and carrier handling procedures. 
            File damage claims promptly and work with carriers on prevention. 
            Consider additional packaging protection for fragile items.
          </p>

          <h4>Incorrect Addresses</h4>
          <p>
            Implement address validation during order entry. Set up processes 
            for address correction and verification. Work with customers to 
            maintain current and accurate delivery information.
          </p>

          <h4>High Shipping Costs</h4>
          <p>
            Analyze shipping patterns and look for consolidation opportunities. 
            Review carrier contracts and negotiate better rates. Consider 
            alternative shipping methods and packaging optimization.
          </p>

          <div className="bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 rounded-lg p-6 my-8">
            <h4 className="text-teal-900 dark:text-teal-100 font-semibold mb-2">🚚 Logistics Efficiency Tip</h4>
            <p className="text-teal-800 dark:text-teal-200">
              Focus on perfect order fulfillment - delivering the right product, 
              in the right quantity, at the right time, to the right place, in 
              perfect condition. This metric drives customer satisfaction and 
              operational efficiency.
            </p>
          </div>

          <h2>Key Performance Indicators</h2>
          <p>
            Critical metrics for shipping and logistics performance:
          </p>
          <ul>
            <li>On-time delivery performance percentage</li>
            <li>Perfect order fulfillment rate</li>
            <li>Average shipping cost per order</li>
            <li>Delivery time accuracy and reliability</li>
            <li>Damage and loss claim rates</li>
            <li>Customer satisfaction with delivery service</li>
          </ul>

          <h2>Advanced Features</h2>
          <p>
            Explore advanced shipping and logistics capabilities:
          </p>
          <ul>
            <li>Transportation management systems (TMS)</li>
            <li>Route optimization and dynamic routing</li>
            <li>Last-mile delivery solutions</li>
            <li>Cross-docking and distribution optimization</li>
            <li>Supply chain visibility platforms</li>
            <li>Sustainability and carbon footprint tracking</li>
          </ul>

          <h2>International Shipping</h2>
          <p>
            Special considerations for global logistics:
          </p>
          <ul>
            <li>Customs documentation and trade compliance</li>
            <li>Duty and tax calculation</li>
            <li>Export control and restricted party screening</li>
            <li>Currency and payment method management</li>
            <li>International carrier and service selection</li>
            <li>Cultural and language considerations</li>
          </ul>

          <h2>Next Steps</h2>
          <p>
            With shipping and logistics established, enhance your operations by:
          </p>
          <ul>
            <li>Implementing advanced route optimization</li>
            <li>Setting up real-time delivery tracking portals</li>
            <li>Configuring automated exception handling</li>
            <li>Establishing sustainability and green logistics programs</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href="/guidelines/modules/procurement">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Procurement Guide
            </Link>
          </Button>
          <Button asChild>
            <Link href="/guidelines/modules/accounting">
              Accounting Guide
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </GuidelinesLayout>
  )
}