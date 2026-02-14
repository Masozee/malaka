/**
 * Accounting TypeScript Interfaces
 * Generated for General Ledger and Financial Management
 */

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

// Chart of Accounts
export interface ChartOfAccount extends BaseEntity {
  account_code: string
  account_name: string
  account_type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
  account_subtype: string
  parent_account_id?: string
  is_active: boolean
  normal_balance: 'DEBIT' | 'CREDIT'
  description?: string
  tax_code?: string
  
  // Relationships
  parent_account?: ChartOfAccount
  child_accounts?: ChartOfAccount[]
  journal_entries?: JournalEntryLine[]
}

// Journal Entry
export interface JournalEntry extends BaseEntity {
  entry_number: string
  reference: string
  description: string
  entry_date: string
  posting_date: string
  period: string
  fiscal_year: number
  source_document?: string
  total_debit: number
  total_credit: number
  status: 'DRAFT' | 'PENDING' | 'POSTED' | 'CANCELLED'
  created_by: string
  created_by_name?: string
  posted_by?: string
  posted_by_name?: string
  posted_at?: string

  // Relationships
  journal_entry_lines: JournalEntryLine[]
  attachments?: JournalEntryAttachment[]
}

// Journal Entry Line
export interface JournalEntryLine extends BaseEntity {
  journal_entry_id: string
  line_number: number
  account_id: string
  account_code?: string
  account_name?: string
  description: string
  debit_amount: number
  credit_amount: number
  base_debit_amount?: number
  base_credit_amount?: number
  is_debit?: boolean
  is_credit?: boolean
  amount?: number
  reference?: string
  cost_center_id?: string
  project_id?: string
  department_id?: string

  // Relationships
  journal_entry?: JournalEntry
  account?: ChartOfAccount
  cost_center?: CostCenter
}

// General Ledger Entry (View)
export interface GeneralLedgerEntry {
  id: string
  // Backend returns transaction_date, mapped as entry_date for display
  entry_date: string
  transaction_date?: string
  posting_date?: string
  period: string
  fiscal_year: number
  journal_entry_id: string
  entry_number: string
  line_number: number
  account_id: string
  account_code: string
  account_name: string
  account_type?: string
  description: string
  reference?: string
  debit_amount: number
  credit_amount: number
  balance: number
  running_balance: number
  currency_code: string
  exchange_rate: number
  source_document?: string
  // Backend returns entry_status, mapped as status for display
  status: string
  entry_status?: string
  created_by: string
  posted_by?: string
  posted_at?: string
  cost_center_id?: string
  cost_center_name?: string
  created_at: string
  updated_at: string
}

// Cost Center - matches backend DTO exactly
export interface CostCenter extends BaseEntity {
  company_id: string
  code: string
  name: string
  description?: string
  type: 'COST' | 'REVENUE' | 'PROFIT'
  manager_id?: string
  parent_id?: string
  is_active: boolean
  budget_amount: number
  actual_amount: number
  variance_amount: number
  
  // Relationships
  parent?: CostCenter
  children?: CostCenter[]
}

// Journal Entry Attachment
export interface JournalEntryAttachment extends BaseEntity {
  journal_entry_id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_by: string
}

// Account Balance
export interface AccountBalance {
  account_id: string
  account_code: string
  account_name: string
  account_type?: string
  balance: number
  as_of_date: string
  currency_code: string
  opening_balance?: number
  period_debits?: number
  period_credits?: number
  closing_balance?: number
  ytd_debits?: number
  ytd_credits?: number
  ytd_balance?: number
}

// Trial Balance (aligned with backend DTO)
export interface TrialBalance {
  id: string
  period_start: string
  period_end: string
  generated_at: string
  company_id: string
  created_by: string
  created_at: string
  accounts: TrialBalanceAccount[]
  summary: TrialBalanceSummary
  is_valid: boolean
}

export interface TrialBalanceAccount {
  id: string // Used by DataTable, maps to account_id
  account_id: string
  account_code: string
  account_name: string
  account_type: string
  opening_balance: number
  debit_total: number
  credit_total: number
  closing_balance: number
  base_opening_balance: number
  base_debit_total: number
  base_credit_total: number
  base_closing_balance: number
  trial_balance_debit: number
  trial_balance_credit: number
}

export interface TrialBalanceSummary {
  total_debits: number
  total_credits: number
  base_total_debits: number
  base_total_credits: number
  is_balanced: boolean
  difference_amount: number
  base_difference_amount: number
}

// Financial Period
export interface FinancialPeriod {
  id: string
  period_name: string
  fiscal_year: number
  start_date: string
  end_date: string
  is_closed: boolean
  closed_by?: string
  closed_at?: string
}

// Budget
export interface Budget extends BaseEntity {
  budget_name: string
  fiscal_year: number
  period: string
  account_id: string
  budgeted_amount: number
  actual_amount: number
  variance: number
  variance_percentage: number
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'CLOSED'
  
  // Relationships
  account: ChartOfAccount
}

// API Request/Response Types
export interface AccountingFilters {
  search?: string
  account_id?: string
  account_type?: string
  cost_center_id?: string
  start_date?: string
  end_date?: string
  period?: string
  fiscal_year?: number
  status?: string
  entry_type?: string
  min_amount?: number
  max_amount?: number
  source_document?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: unknown
}

export interface CreateJournalEntryRequest {
  data: {
    reference: string
    description: string
    entry_date: string
    source_document?: string
    journal_entry_lines: {
      account_id: string
      description: string
      debit_amount: number
      credit_amount: number
      reference?: string
      cost_center_id?: string
    }[]
  }
}

export interface UpdateJournalEntryRequest {
  data: {
    reference: string
    description: string
    entry_date: string
    source_document?: string
    status?: 'DRAFT' | 'PENDING' | 'POSTED' | 'CANCELLED'
    journal_entry_lines: {
      id?: string
      account_id: string
      description: string
      debit_amount: number
      credit_amount: number
      reference?: string
      cost_center_id?: string
    }[]
  }
}

// API Response Types
export interface GeneralLedgerListResponse {
  data: GeneralLedgerEntry[]
  total: number
  page: number
  limit: number
  summary: {
    total_debits: number
    total_credits: number
    opening_balance: number
    closing_balance: number
  }
}

export interface JournalEntryListResponse {
  data: JournalEntry[]
  total: number
  page: number
  limit: number
}

export interface ChartOfAccountListResponse {
  data: ChartOfAccount[]
  total: number
  page: number
  limit: number
}

export interface CostCenterListResponse {
  data: CostCenter[]
  total: number
  page: number
  limit: number
}