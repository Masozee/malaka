"use client"

import * as React from "react"
import Link from "next/link"
import { GuidelinesLayout } from "@/components/ui/guidelines-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function ProductsGuidePage() {
  return (
    <GuidelinesLayout>
      <div className="container py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="default" className="bg-blue-500">Beginner</Badge>
            <Badge variant="outline">30 min read</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-4">Products Management</h1>
          <p className="text-xl text-muted-foreground">
            Products Management handles your complete product catalog, classifications, 
            and all product-related information that drives your inventory and sales operations.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>Overview</h2>
          <p>
            The Products module is the central hub for managing your product catalog, including 
            articles, classifications, categories, colors, sizes, and all product attributes. 
            This module feeds into inventory management, sales operations, and purchasing processes.
          </p>

          <h2>Key Components</h2>

          <h3>Articles</h3>
          <p>
            Articles represent your core products and include comprehensive product information:
          </p>
          <ul>
            <li>Product identification codes (SKU, barcode)</li>
            <li>Product names and descriptions</li>
            <li>Pricing information and cost details</li>
            <li>Product specifications and attributes</li>
            <li>Supplier and manufacturer information</li>
            <li>Product images and documentation</li>
          </ul>

          <h3>Classifications</h3>
          <p>
            Product classifications help organize your catalog into logical categories:
          </p>
          <ul>
            <li>Hierarchical product categorization</li>
            <li>Category-specific attributes and rules</li>
            <li>Reporting and analysis groupings</li>
            <li>Pricing and discount rule applications</li>
          </ul>

          <h3>Categories</h3>
          <p>
            Product categories provide detailed sub-classifications for better organization:
          </p>
          <ul>
            <li>Sub-category management within classifications</li>
            <li>Category-specific pricing rules</li>
            <li>Inventory management groupings</li>
            <li>Sales and marketing segmentation</li>
          </ul>

          <h3>Colors</h3>
          <p>
            Color management for products with color variations:
          </p>
          <ul>
            <li>Color code standardization</li>
            <li>Color name and description management</li>
            <li>Color-specific pricing and inventory</li>
            <li>Visual color representation</li>
          </ul>

          <h3>Sizes</h3>
          <p>
            Size management for products with size variations:
          </p>
          <ul>
            <li>Size chart and measurement standards</li>
            <li>Size-specific inventory tracking</li>
            <li>Regional size conversion</li>
            <li>Size availability and stock levels</li>
          </ul>

          <h2>Getting Started</h2>

          <h3>Step 1: Set Up Classifications</h3>
          <p>
            Begin by creating your product classification structure. This provides the 
            framework for organizing your entire product catalog. Think about how you 
            naturally group your products for sales, inventory, and reporting purposes.
          </p>

          <h3>Step 2: Define Categories</h3>
          <p>
            Within each classification, create specific categories that represent 
            your product lines. This helps with detailed organization and enables 
            category-specific business rules.
          </p>

          <h3>Step 3: Configure Colors and Sizes</h3>
          <p>
            Set up your color and size systems if your products have variations. 
            Establish consistent naming conventions and codes that will be used 
            throughout your inventory and sales processes.
          </p>

          <h3>Step 4: Import or Create Articles</h3>
          <p>
            Add your products to the system either through bulk import or individual 
            creation. Ensure each article has complete information including 
            classification, category, and applicable color/size variations.
          </p>

          <h3>Step 5: Set Pricing and Costs</h3>
          <p>
            Configure pricing information for each article including cost prices, 
            selling prices, and any special pricing rules. This information feeds 
            directly into your sales and purchasing operations.
          </p>

          <h2>Common Workflows</h2>

          <h3>Adding a New Product</h3>
          <ol>
            <li>Navigate to Products → Articles</li>
            <li>Click "Add New Article"</li>
            <li>Enter basic product information (name, SKU, description)</li>
            <li>Assign classification and category</li>
            <li>Set up color and size variations if applicable</li>
            <li>Configure pricing and cost information</li>
            <li>Add product images and specifications</li>
            <li>Save and verify the product setup</li>
          </ol>

          <h3>Managing Product Variations</h3>
          <ol>
            <li>Select the base article</li>
            <li>Go to "Variations" tab</li>
            <li>Add color variations with specific codes</li>
            <li>Add size variations with measurements</li>
            <li>Set variation-specific pricing if needed</li>
            <li>Configure stock levels for each variation</li>
            <li>Save the variation configuration</li>
          </ol>

          <h3>Bulk Product Import</h3>
          <ol>
            <li>Download the product import template</li>
            <li>Prepare product data with all required fields</li>
            <li>Ensure classifications and categories exist</li>
            <li>Validate data format and completeness</li>
            <li>Upload through the import wizard</li>
            <li>Review import results and resolve errors</li>
            <li>Complete the import and verify products</li>
          </ol>

          <h2>Best Practices</h2>

          <h3>Product Organization</h3>
          <ul>
            <li>Use consistent naming conventions for products</li>
            <li>Establish clear classification hierarchies</li>
            <li>Maintain standardized SKU formats</li>
            <li>Document product specification standards</li>
          </ul>

          <h3>Data Quality</h3>
          <ul>
            <li>Ensure all products have complete information</li>
            <li>Regularly review and update product data</li>
            <li>Maintain high-quality product images</li>
            <li>Keep pricing information current</li>
          </ul>

          <h3>Performance</h3>
          <ul>
            <li>Archive discontinued products appropriately</li>
            <li>Optimize product search and filtering</li>
            <li>Regular cleanup of unused variations</li>
            <li>Monitor system performance with large catalogs</li>
          </ul>

          <h2>Integration Points</h2>
          <p>
            Products Management integrates with all major ERP modules:
          </p>
          <ul>
            <li><strong>Inventory</strong> - Stock tracking for all product variations</li>
            <li><strong>Sales</strong> - Product availability and pricing for orders</li>
            <li><strong>Procurement</strong> - Product specifications for purchasing</li>
            <li><strong>Production</strong> - Product specifications for manufacturing</li>
            <li><strong>Accounting</strong> - Product costing and revenue tracking</li>
          </ul>

          <h2>Troubleshooting</h2>

          <h3>Common Issues</h3>
          
          <h4>Duplicate Products</h4>
          <p>
            Use the duplicate detection tools to identify similar products. Review 
            carefully before merging to avoid losing product history or affecting 
            existing orders and inventory.
          </p>

          <h4>Import Errors</h4>
          <p>
            Common import issues include missing classifications, invalid data formats, 
            and duplicate SKU codes. Always validate your data against the template 
            before importing.
          </p>

          <h4>Performance Issues</h4>
          <p>
            Large product catalogs can impact performance. Ensure proper indexing, 
            consider archiving old products, and optimize search queries for better 
            response times.
          </p>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 my-8">
            <h4 className="text-blue-900 dark:text-blue-100 font-semibold mb-2">💡 Pro Tip</h4>
            <p className="text-blue-800 dark:text-blue-200">
              Set up your product structure carefully from the beginning. Changes to 
              classifications and categories later can affect existing inventory, sales 
              records, and reports. Plan your product hierarchy before adding products.
            </p>
          </div>

          <h2>Next Steps</h2>
          <p>
            With your product catalog established, you can proceed to:
          </p>
          <ul>
            <li>Set up inventory tracking for your products</li>
            <li>Configure sales processes with product availability</li>
            <li>Establish procurement workflows for replenishment</li>
            <li>Begin production planning for manufactured items</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href="/guidelines/modules/master-data">
              Master Data Guide
            </Link>
          </Button>
          <Button asChild>
            <Link href="/guidelines/modules/sales">
              Sales Guide
            </Link>
          </Button>
        </div>
      </div>
    </GuidelinesLayout>
  )
}