import {
  Invoice01Icon,
  ReceiptDollarIcon,
  FileIcon,
  CreditCardIcon,
  Agreement01Icon,
  CalculateIcon,
  BankIcon,
  BookOpen01Icon,
  FileLockedIcon,
  CoinsIcon,
  ClipboardIcon,
  TargetIcon,
  CreditCardValidationIcon,
  ChartBreakoutSquareIcon,
  ChartLineData01Icon,
  Calendar01Icon,
  PieChart01Icon,
} from '@hugeicons/core-free-icons'

export interface FinanceMenuItem {
  id: string
  label: string
  icon: typeof Invoice01Icon
  href: string
  description: string
}

export interface FinanceGroup {
  id: string
  label: string
  icon: typeof Invoice01Icon
  href: string
  description: string
  items: FinanceMenuItem[]
}

export const FINANCE_GROUPS: FinanceGroup[] = [
  {
    id: 'receivables-payables',
    label: 'Receivables & Payables',
    icon: Invoice01Icon,
    href: '/finance/receivables-payables',
    description: 'Manage accounts payable, receivable, invoices, payments, and vouchers',
    items: [
      { id: 'accounts-payable', label: 'Accounts Payable', icon: Invoice01Icon, href: '/finance/accounts-payable', description: 'Track and manage outstanding payables to suppliers' },
      { id: 'accounts-receivable', label: 'Accounts Receivable', icon: ReceiptDollarIcon, href: '/finance/accounts-receivable', description: 'Track receivables and collections from customers' },
      { id: 'invoices', label: 'Invoices', icon: FileIcon, href: '/finance/invoices', description: 'Create and manage financial invoices and billing' },
      { id: 'payments', label: 'Payments', icon: CreditCardIcon, href: '/finance/payments', description: 'Record and track payment transactions' },
      { id: 'purchase-vouchers', label: 'Purchase Vouchers', icon: Agreement01Icon, href: '/finance/purchase-vouchers', description: 'Manage purchase vouchers with approval workflow' },
      { id: 'expenditure-requests', label: 'Expenditure Requests', icon: CalculateIcon, href: '/finance/expenditure-requests', description: 'Submit and approve expenditure requests' },
    ],
  },
  {
    id: 'cash-management',
    label: 'Cash Management',
    icon: BankIcon,
    href: '/finance/cash-management',
    description: 'Cash & bank accounts, books, check clearance, and working capital',
    items: [
      { id: 'cash-treasury', label: 'Cash & Treasury', icon: BankIcon, href: '/finance/cash-treasury', description: 'Manage cash positions, bank accounts, and liquidity' },
      { id: 'cash-books', label: 'Cash Books', icon: BookOpen01Icon, href: '/finance/cash-books', description: 'Manage cash book accounts and balances' },
      { id: 'check-clearance', label: 'Check Clearance', icon: FileLockedIcon, href: '/finance/check-clearance', description: 'Track and manage check clearance status' },
      { id: 'working-capital', label: 'Working Capital', icon: CoinsIcon, href: '/finance/working-capital', description: 'Optimize cash conversion cycle and working capital' },
    ],
  },
  {
    id: 'planning-analysis',
    label: 'Planning & Analysis',
    icon: ChartLineData01Icon,
    href: '/finance/planning-analysis',
    description: 'Budgeting, cost control, loans, investments, and financial planning',
    items: [
      { id: 'budgeting', label: 'Budgeting', icon: ClipboardIcon, href: '/finance/budgeting', description: 'Create and monitor budgets by department' },
      { id: 'cost-control', label: 'Cost Control', icon: TargetIcon, href: '/finance/cost-control', description: 'Monitor expenses and enforce spending limits' },
      { id: 'loan-financing', label: 'Loan & Financing', icon: CreditCardValidationIcon, href: '/finance/loan-financing', description: 'Manage loans, credit facilities, and repayments' },
      { id: 'capex-investment', label: 'CapEx & Investment', icon: ChartBreakoutSquareIcon, href: '/finance/capex-investment', description: 'Plan capital expenditures and track ROI' },
      { id: 'financial-planning', label: 'Financial Planning', icon: ChartLineData01Icon, href: '/finance/financial-planning', description: 'Forecasting, scenario analysis, and strategy' },
    ],
  },
  {
    id: 'closing-reports',
    label: 'Closing & Reports',
    icon: PieChart01Icon,
    href: '/finance/closing-reports',
    description: 'Monthly closing periods and financial reporting',
    items: [
      { id: 'monthly-closing', label: 'Monthly Closing', icon: Calendar01Icon, href: '/finance/monthly-closing', description: 'Manage monthly financial closing periods' },
      { id: 'finance-reports', label: 'Finance Reports', icon: PieChart01Icon, href: '/finance/reports', description: 'Generate financial statements and reports' },
    ],
  },
]

export const FINANCE_ALL_ITEMS: FinanceMenuItem[] = FINANCE_GROUPS.flatMap(g => g.items)

export function getFinanceItemById(id: string): FinanceMenuItem | undefined {
  return FINANCE_ALL_ITEMS.find(item => item.id === id)
}

export function getFinanceGroupById(id: string): FinanceGroup | undefined {
  return FINANCE_GROUPS.find(g => g.id === id)
}
