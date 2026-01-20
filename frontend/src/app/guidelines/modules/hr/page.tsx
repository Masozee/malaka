"use client"

import * as React from "react"
import Link from "next/link"
import { GuidelinesLayout } from "@/components/ui/guidelines-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function HRGuidePage() {
  return (
    <GuidelinesLayout>
      <div className="container py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="default" className="bg-violet-500">Advanced</Badge>
            <Badge variant="outline">65 min read</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-4">HR Management</h1>
          <p className="text-xl text-muted-foreground">
            HR Management provides comprehensive human resource capabilities including 
            employee management, payroll processing, attendance tracking, and performance management.
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>Overview</h2>
          <p>
            The HR Management module handles all aspects of human resource management 
            from recruitment through retirement. It manages employee records, payroll 
            processing, time and attendance, benefits administration, and performance 
            evaluation to support your workforce effectively.
          </p>

          <h2>Key Components</h2>

          <h3>Employee Management</h3>
          <p>
            Comprehensive employee lifecycle management:
          </p>
          <ul>
            <li>Employee profile creation and maintenance</li>
            <li>Personal and professional information tracking</li>
            <li>Employment history and position management</li>
            <li>Skills and qualification tracking</li>
            <li>Document management and compliance</li>
            <li>Emergency contact and dependent information</li>
          </ul>

          <h3>Payroll Processing</h3>
          <p>
            Complete payroll calculation and administration:
          </p>
          <ul>
            <li>Salary and wage calculation</li>
            <li>Overtime and bonus processing</li>
            <li>Tax withholding and deduction management</li>
            <li>Benefits and insurance deductions</li>
            <li>Payroll register and statement generation</li>
            <li>Direct deposit and payment processing</li>
          </ul>

          <h3>Time & Attendance</h3>
          <p>
            Time tracking and attendance management systems:
          </p>
          <ul>
            <li>Clock-in/clock-out time recording</li>
            <li>Schedule management and shift planning</li>
            <li>Absence and leave tracking</li>
            <li>Overtime calculation and approval</li>
            <li>Timesheet approval workflows</li>
            <li>Attendance reporting and analytics</li>
          </ul>

          <h3>Leave Management</h3>
          <p>
            Employee leave and absence administration:
          </p>
          <ul>
            <li>Leave policy configuration and management</li>
            <li>Leave request submission and approval</li>
            <li>Accrual calculation and balance tracking</li>
            <li>Holiday calendar management</li>
            <li>Sick leave and medical leave tracking</li>
            <li>Leave reporting and compliance</li>
          </ul>

          <h3>Performance Management</h3>
          <p>
            Employee performance evaluation and development:
          </p>
          <ul>
            <li>Performance review cycles and scheduling</li>
            <li>Goal setting and objective tracking</li>
            <li>Competency and skill assessments</li>
            <li>360-degree feedback collection</li>
            <li>Performance improvement plans</li>
            <li>Career development planning</li>
          </ul>

          <h2>Getting Started</h2>

          <h3>Step 1: Set Up Organizational Structure</h3>
          <p>
            Define your organizational hierarchy including departments, positions, 
            and reporting relationships. Set up job classifications and pay grades 
            that align with your compensation structure.
          </p>

          <h3>Step 2: Configure Payroll Parameters</h3>
          <p>
            Set up payroll calculation rules including tax tables, benefit plans, 
            deduction types, and pay frequencies. Configure integration with 
            accounting for proper cost allocation.
          </p>

          <h3>Step 3: Establish Time and Attendance Rules</h3>
          <p>
            Configure work schedules, overtime rules, rounding policies, and 
            attendance tracking methods. Set up integration with time clocks 
            or mobile applications if used.
          </p>

          <h3>Step 4: Import Employee Data</h3>
          <p>
            Load existing employee information including personal details, 
            employment history, compensation, and benefit enrollment. Ensure 
            data accuracy and compliance with privacy requirements.
          </p>

          <h3>Step 5: Train HR Staff</h3>
          <p>
            Train HR personnel on system workflows, compliance requirements, 
            reporting procedures, and employee self-service features to ensure 
            effective HR operations.
          </p>

          <h2>Common Workflows</h2>

          <h3>Hiring a New Employee</h3>
          <ol>
            <li>Navigate to HR → Employee Management</li>
            <li>Create new employee profile</li>
            <li>Enter personal and contact information</li>
            <li>Set up employment details and compensation</li>
            <li>Configure benefits and deductions</li>
            <li>Assign manager and department</li>
            <li>Generate employment documents</li>
            <li>Set up system access and training schedule</li>
          </ol>

          <h3>Processing Monthly Payroll</h3>
          <ol>
            <li>Access HR → Payroll Processing</li>
            <li>Review and approve time and attendance data</li>
            <li>Calculate gross pay and deductions</li>
            <li>Review payroll register for accuracy</li>
            <li>Process tax withholdings and payments</li>
            <li>Generate paystubs and direct deposits</li>
            <li>Create payroll journal entries</li>
            <li>Distribute paystubs and handle inquiries</li>
          </ol>

          <h3>Managing Performance Reviews</h3>
          <ol>
            <li>Go to HR → Performance Management</li>
            <li>Set up performance review cycle</li>
            <li>Notify employees and managers</li>
            <li>Employees complete self-evaluations</li>
            <li>Managers complete performance assessments</li>
            <li>Conduct performance review meetings</li>
            <li>Document outcomes and development plans</li>
            <li>Update employee records and goals</li>
          </ol>

          <h2>Best Practices</h2>

          <h3>Data Security and Compliance</h3>
          <ul>
            <li>Implement strict access controls for sensitive HR data</li>
            <li>Regular compliance audits and documentation</li>
            <li>Secure handling of social security numbers and personal data</li>
            <li>Proper retention and disposal of HR records</li>
          </ul>

          <h3>Process Efficiency</h3>
          <ul>
            <li>Standardize HR procedures and documentation</li>
            <li>Implement employee self-service capabilities</li>
            <li>Automate routine calculations and notifications</li>
            <li>Regular process review and improvement</li>
          </ul>

          <h3>Employee Engagement</h3>
          <ul>
            <li>Transparent communication of policies and procedures</li>
            <li>Regular feedback and performance discussions</li>
            <li>Career development and training opportunities</li>
            <li>Employee recognition and reward programs</li>
          </ul>

          <h2>Integration Points</h2>
          <p>
            HR Management integrates with other business functions:
          </p>
          <ul>
            <li><strong>Accounting</strong> - Payroll expenses and cost center allocation</li>
            <li><strong>Production</strong> - Labor planning and time tracking</li>
            <li><strong>Project Management</strong> - Resource allocation and project costing</li>
            <li><strong>Security</strong> - User access management and system permissions</li>
            <li><strong>Reporting</strong> - HR analytics and compliance reporting</li>
          </ul>

          <h2>Troubleshooting</h2>

          <h3>Common Issues</h3>
          
          <h4>Payroll Calculation Errors</h4>
          <p>
            Review payroll configuration settings and tax tables for accuracy. 
            Verify employee data and pay rates. Check overtime calculations 
            and deduction setups. Test calculations before processing.
          </p>

          <h4>Time and Attendance Issues</h4>
          <p>
            Verify time clock synchronization and data transmission. Check 
            employee schedules and overtime rules. Review rounding policies 
            and exception handling procedures.
          </p>

          <h4>Compliance Problems</h4>
          <p>
            Stay current with employment law changes and tax rate updates. 
            Regular review of policies and procedures. Implement proper 
            documentation and audit trails.
          </p>

          <h4>System Performance</h4>
          <p>
            Monitor system response times during peak usage periods. Optimize 
            database queries and reporting procedures. Consider system 
            upgrades for growing employee populations.
          </p>

          <div className="bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 rounded-lg p-6 my-8">
            <h4 className="text-violet-900 dark:text-violet-100 font-semibold mb-2">👥 HR Success Tip</h4>
            <p className="text-violet-800 dark:text-violet-200">
              Focus on employee experience and self-service capabilities. Empower 
              employees to access their information, request leave, and update 
              personal details. This reduces administrative burden while improving 
              employee satisfaction.
            </p>
          </div>

          <h2>Key Performance Indicators</h2>
          <p>
            Important HR metrics to track and monitor:
          </p>
          <ul>
            <li>Employee turnover and retention rates</li>
            <li>Time-to-fill for open positions</li>
            <li>Payroll accuracy and processing time</li>
            <li>Employee satisfaction and engagement scores</li>
            <li>Training completion and compliance rates</li>
            <li>Absenteeism and overtime percentages</li>
          </ul>

          <h2>Advanced Features</h2>
          <p>
            Explore advanced HR management capabilities:
          </p>
          <ul>
            <li>Talent management and succession planning</li>
            <li>Learning management and training tracking</li>
            <li>Compensation analysis and benchmarking</li>
            <li>Employee engagement and survey management</li>
            <li>Workforce analytics and predictive modeling</li>
            <li>Mobile applications for employee access</li>
          </ul>

          <h2>Compliance and Legal Requirements</h2>
          <p>
            Critical compliance considerations for HR management:
          </p>
          <ul>
            <li>Equal Employment Opportunity (EEO) compliance</li>
            <li>Family and Medical Leave Act (FMLA) tracking</li>
            <li>Wage and hour law compliance</li>
            <li>Immigration and work authorization (I-9)</li>
            <li>Occupational Safety and Health Administration (OSHA)</li>
            <li>Benefits administration and COBRA compliance</li>
          </ul>

          <h2>Employee Self-Service</h2>
          <p>
            Empower employees with self-service capabilities:
          </p>
          <ul>
            <li>Personal information updates and maintenance</li>
            <li>Paystub and tax document access</li>
            <li>Leave request submission and balance inquiry</li>
            <li>Benefits enrollment and changes</li>
            <li>Time and attendance entry and approval</li>
            <li>Performance review and goal management</li>
          </ul>

          <h2>Reporting and Analytics</h2>
          <p>
            Comprehensive HR reporting for decision-making:
          </p>
          <ul>
            <li>Standard HR reports and compliance documents</li>
            <li>Custom report development and scheduling</li>
            <li>Dashboard and KPI monitoring</li>
            <li>Workforce analytics and trending</li>
            <li>Compensation analysis and equity reporting</li>
            <li>Diversity and inclusion metrics</li>
          </ul>

          <h2>Next Steps</h2>
          <p>
            With HR management foundations in place, enhance your people operations by:
          </p>
          <ul>
            <li>Implementing talent management and succession planning</li>
            <li>Setting up learning management and development tracking</li>
            <li>Configuring advanced workforce analytics</li>
            <li>Establishing employee engagement and feedback systems</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t">
          <Button variant="outline" asChild>
            <Link href="/guidelines/modules/accounting">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Accounting Guide
            </Link>
          </Button>
          <Button asChild>
            <Link href="/guidelines/modules/reporting">
              Reports & Analytics Guide
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </GuidelinesLayout>
  )
}