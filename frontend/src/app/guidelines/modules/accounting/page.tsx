"use client"

import * as React from "react"
import Link from "next/link"
import { GuidelinesLayout } from "@/components/ui/guidelines-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function AccountingGuidePage() {
  return (
    <GuidelinesLayout>
      <div className="container py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="default" className="bg-red-500">Advanced</Badge>
            <Badge variant="outline">70 min read</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-4">Accounting & Finance</h1>
          <p className="text-xl text-muted-foreground">
            Accounting & Finance manages financial transactions, reporting, budgeting, 
            and compliance to provide complete financial control and visibility.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>Overview</h2>
          <p>
            The Accounting module provides comprehensive financial management 
            capabilities including general ledger, accounts payable and receivable, 
            budgeting, financial reporting, and regulatory compliance. It integrates 
            with all other modules to capture and report on all business transactions.
          </p>

          <h2>Key Components</h2>

          <h3>General Ledger</h3>
          <p>
            Central financial record-keeping and transaction management:
          </p>
          <ul>
            <li>Chart of accounts structure and maintenance</li>
            <li>Journal entry creation and posting</li>
            <li>Account balance tracking and reconciliation</li>
            <li>Period-end closing procedures</li>
            <li>Multi-currency support and translation</li>
            <li>Inter-company transaction handling</li>
          </ul>

          <h3>Accounts Receivable</h3>
          <p>
            Customer billing and collection management:
          </p>
          <ul>
            <li>Invoice generation from sales orders</li>
            <li>Customer credit management and limits</li>
            <li>Payment processing and cash application</li>
            <li>Collection activities and aging analysis</li>
            <li>Credit memo and adjustment processing</li>
            <li>Bad debt provision and write-offs</li>
          </ul>

          <h3>Accounts Payable</h3>
          <p>
            Vendor payment and expense management:
          </p>
          <ul>
            <li>Vendor invoice processing and approval</li>
            <li>Three-way matching with purchase orders</li>
            <li>Payment scheduling and cash flow planning</li>
            <li>Check printing and electronic payments</li>
            <li>Expense allocation and cost center management</li>
            <li>1099 processing and tax reporting</li>
          </ul>

          <h3>Cost Centers</h3>
          <p>
            Departmental and project cost tracking:
          </p>
          <ul>
            <li>Cost center structure and hierarchy</li>
            <li>Budget creation and management</li>
            <li>Actual vs. budget variance analysis</li>
            <li>Cost allocation and absorption</li>
            <li>Project and job costing</li>
            <li>Profitability analysis by segment</li>
          </ul>

          <h3>Financial Reporting</h3>
          <p>
            Comprehensive financial analysis and reporting:
          </p>
          <ul>
            <li>Standard financial statements (P&L, Balance Sheet, Cash Flow)</li>
            <li>Management reports and KPI dashboards</li>
            <li>Budget vs. actual reporting</li>
            <li>Financial ratio analysis</li>
            <li>Regulatory and tax reporting</li>
            <li>Custom report development</li>
          </ul>

          <h2>Getting Started</h2>

          <h3>Step 1: Set Up Chart of Accounts</h3>
          <p>
            Design your chart of accounts structure following accounting standards 
            and regulatory requirements. Include asset, liability, equity, revenue, 
            and expense accounts with proper numbering and classification.
          </p>

          <h3>Step 2: Configure Cost Centers</h3>
          <p>
            Establish cost center hierarchy aligned with your organizational 
            structure. Set up departments, projects, and locations for proper 
            cost tracking and allocation.
          </p>

          <h3>Step 3: Set Opening Balances</h3>
          <p>
            Enter opening balances for all accounts as of your go-live date. 
            Ensure trial balance accuracy and proper balance sheet reconciliation 
            before beginning operations.
          </p>

          <h3>Step 4: Configure Integration</h3>
          <p>
            Set up automatic journal entries from other modules including sales, 
            purchasing, inventory, and payroll. Configure posting rules and 
            account mapping for seamless integration.
          </p>

          <h3>Step 5: Establish Financial Controls</h3>
          <p>
            Implement approval workflows, segregation of duties, and access 
            controls. Set up period-end procedures and reconciliation requirements 
            for financial accuracy.
          </p>

          <h2>Common Workflows</h2>

          <h3>Processing Customer Invoices</h3>
          <ol>
            <li>Sales order generates automatic invoice</li>
            <li>Review invoice for accuracy and completeness</li>
            <li>Post invoice to accounts receivable</li>
            <li>Send invoice to customer</li>
            <li>Track payment due dates and follow up</li>
            <li>Process customer payments when received</li>
            <li>Apply payments to outstanding invoices</li>
            <li>Handle discrepancies and adjustments</li>
          </ol>

          <h3>Month-End Closing Process</h3>
          <ol>
            <li>Navigate to Accounting → Period Close</li>
            <li>Complete all transaction posting for the period</li>
            <li>Perform account reconciliations</li>
            <li>Record accruals and deferrals</li>
            <li>Run depreciation calculations</li>
            <li>Generate preliminary financial reports</li>
            <li>Review and approve period-end adjustments</li>
            <li>Close accounting period and finalize reports</li>
          </ol>

          <h3>Budget vs. Actual Analysis</h3>
          <ol>
            <li>Access Accounting → Budget Management</li>
            <li>Select reporting period and cost centers</li>
            <li>Generate budget vs. actual reports</li>
            <li>Analyze significant variances</li>
            <li>Investigate root causes of deviations</li>
            <li>Document explanations and corrective actions</li>
            <li>Communicate findings to management</li>
            <li>Update forecasts and budget revisions</li>
          </ol>

          <h2>Best Practices</h2>

          <h3>Financial Controls</h3>
          <ul>
            <li>Implement proper segregation of duties</li>
            <li>Regular account reconciliations and reviews</li>
            <li>Documented approval procedures and limits</li>
            <li>Monthly financial statement preparation and review</li>
          </ul>

          <h3>Data Accuracy</h3>
          <ul>
            <li>Consistent coding and account classification</li>
            <li>Timely transaction recording and posting</li>
            <li>Regular backup and data protection procedures</li>
            <li>Proper supporting documentation for all entries</li>
          </ul>

          <h3>Compliance</h3>
          <ul>
            <li>Stay current with accounting standards and regulations</li>
            <li>Implement required internal controls</li>
            <li>Regular audit preparation and cooperation</li>
            <li>Proper tax compliance and filing procedures</li>
          </ul>

          <h2>Integration Points</h2>
          <p>
            Accounting & Finance integrates with all business operations:
          </p>
          <ul>
            <li><strong>Sales</strong> - Revenue recognition and accounts receivable</li>
            <li><strong>Procurement</strong> - Purchase accruals and accounts payable</li>
            <li><strong>Inventory</strong> - Cost of goods sold and inventory valuation</li>
            <li><strong>Production</strong> - Work-in-process and manufacturing costs</li>
            <li><strong>HR</strong> - Payroll expenses and employee cost allocation</li>
          </ul>

          <h2>Troubleshooting</h2>

          <h3>Common Issues</h3>
          
          <h4>Trial Balance Not Balancing</h4>
          <p>
            Review all journal entries for posting errors and verify that debits 
            equal credits for each entry. Check for incomplete transactions and 
            ensure all automatic postings completed successfully.
          </p>

          <h4>Reconciliation Differences</h4>
          <p>
            Systematically review transactions and compare detailed records with 
            bank statements or subsidiary ledgers. Look for timing differences, 
            unrecorded transactions, or posting errors.
          </p>

          <h4>Period-End Delays</h4>
          <p>
            Establish standardized closing procedures with clear deadlines and 
            responsibilities. Implement daily transaction processing to avoid 
            month-end backlogs. Use closing checklists to ensure completeness.
          </p>

          <h4>Currency Translation Issues</h4>
          <p>
            Verify exchange rates are current and properly configured. Review 
            translation methods and ensure consistency. Check that all multi-currency 
            transactions are properly recorded and translated.
          </p>

          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6 my-8">
            <h4 className="text-red-900 dark:text-red-100 font-semibold mb-2">⚠️ Financial Control Warning</h4>
            <p className="text-red-800 dark:text-red-200">
              Financial accuracy and compliance are critical. Always implement 
              proper internal controls, maintain audit trails, and ensure adequate 
              segregation of duties. Regular reviews and reconciliations prevent 
              errors and fraud.
            </p>
          </div>

          <h2>Key Performance Indicators</h2>
          <p>
            Essential financial metrics to monitor:
          </p>
          <ul>
            <li>Days sales outstanding (DSO) and collection efficiency</li>
            <li>Days payable outstanding (DPO) and cash flow optimization</li>
            <li>Gross margin and operating margin percentages</li>
            <li>Budget variance percentages by cost center</li>
            <li>Account reconciliation timeliness and accuracy</li>
            <li>Month-end close cycle time</li>
          </ul>

          <h2>Advanced Features</h2>
          <p>
            Explore advanced accounting capabilities:
          </p>
          <ul>
            <li>Consolidation accounting for multiple entities</li>
            <li>Revenue recognition automation</li>
            <li>Fixed asset management and depreciation</li>
            <li>Cash flow forecasting and management</li>
            <li>International financial reporting standards (IFRS)</li>
            <li>Advanced financial analytics and modeling</li>
          </ul>

          <h2>Regulatory Compliance</h2>
          <p>
            Important compliance considerations:
          </p>
          <ul>
            <li>Generally Accepted Accounting Principles (GAAP) compliance</li>
            <li>Sarbanes-Oxley (SOX) internal control requirements</li>
            <li>Tax reporting and filing obligations</li>
            <li>Audit preparation and external auditor cooperation</li>
            <li>Financial disclosure and reporting requirements</li>
            <li>Anti-money laundering and financial crime prevention</li>
          </ul>

          <h2>Financial Analysis Tools</h2>
          <p>
            Powerful analysis capabilities for financial insight:
          </p>
          <ul>
            <li>Ratio analysis and trend reporting</li>
            <li>Cash flow analysis and forecasting</li>
            <li>Profitability analysis by product, customer, or region</li>
            <li>Break-even analysis and contribution margin reporting</li>
            <li>Budget modeling and scenario planning</li>
            <li>Financial dashboard and KPI monitoring</li>
          </ul>

          <h2>Next Steps</h2>
          <p>
            With accounting foundations established, enhance your financial management by:
          </p>
          <ul>
            <li>Implementing advanced financial reporting and analytics</li>
            <li>Setting up automated financial controls and workflows</li>
            <li>Configuring management accounting and profitability analysis</li>
            <li>Establishing financial planning and budgeting processes</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href="/guidelines/modules/shipping">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Shipping Guide
            </Link>
          </Button>
          <Button asChild>
            <Link href="/guidelines/modules/hr">
              HR Management Guide
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </GuidelinesLayout>
  )
}