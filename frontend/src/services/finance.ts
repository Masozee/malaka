/**
 * Finance API Services
 * Type-safe API calls for all Finance endpoints
 */

import { apiClient } from '@/lib/api'

// ==================== Types ====================

export interface CashBank {
  id: string
  name: string
  account_no: string
  balance: number
  currency: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  total_amount: number
  tax_amount: number
  grand_total: number
  customer_id: string
  supplier_id: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  invoice_id: string
  payment_date: string
  amount: number
  payment_method: string
  cash_bank_id: string
  created_at: string
  updated_at: string
}

export interface AccountsPayable {
  id: string
  invoice_id: string
  supplier_id: string
  issue_date: string
  due_date: string
  amount: number
  paid_amount: number
  balance: number
  status: string
  created_at: string
  updated_at: string
}

export interface AccountsReceivable {
  id: string
  invoice_id: string
  customer_id: string
  issue_date: string
  due_date: string
  amount: number
  paid_amount: number
  balance: number
  status: string
  created_at: string
  updated_at: string
}

export interface CashDisbursement {
  id: string
  disbursement_date: string
  amount: number
  description: string
  cash_bank_id: string
  created_at: string
  updated_at: string
}

export interface CashReceipt {
  id: string
  receipt_date: string
  amount: number
  description: string
  cash_bank_id: string
  created_at: string
  updated_at: string
}

export interface BankTransfer {
  id: string
  transfer_date: string
  from_cash_bank_id: string
  to_cash_bank_id: string
  amount: number
  description: string
  created_at: string
  updated_at: string
}

export interface CashOpeningBalance {
  id: string
  cash_bank_id: string
  opening_date: string
  opening_balance: number
  currency: string
  description: string
  fiscal_year: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PurchaseVoucher {
  id: string
  voucher_number: string
  voucher_date: string
  supplier_id: string
  total_amount: number
  paid_amount: number
  remaining_amount: number
  discount_amount: number
  tax_amount: number
  due_date: string
  status: string
  description: string
  approved_by: string
  approved_at: string
  created_at: string
  updated_at: string
}

export interface ExpenditureRequest {
  id: string
  request_number: string
  requestor_id: string
  department: string
  request_date: string
  required_date: string
  purpose: string
  total_amount: number
  approved_amount: number
  status: string
  priority: string
  approved_by: string
  approved_at: string
  processed_by: string
  processed_at: string
  remarks: string
  created_at: string
  updated_at: string
}

export interface CheckClearance {
  id: string
  check_number: string
  check_date: string
  bank_name: string
  account_number: string
  amount: number
  payee_name: string
  clearance_date: string | null
  status: string
  memo: string
  cleared_by: string
  created_at: string
  updated_at: string
}

export interface MonthlyClosing {
  id: string
  period_year: number
  period_month: number
  closing_date: string
  total_revenue: number
  total_expenses: number
  net_income: number
  cash_position: number
  bank_position: number
  accounts_receivable: number
  accounts_payable: number
  inventory_value: number
  status: string
  created_at: string
}

export interface CashBook {
  id: string
  book_code: string
  book_name: string
  book_type: string
  account_number: string
  bank_name: string
  opening_balance: number
  current_balance: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// ==================== API Response wrapper ====================

interface ApiResp<T> {
  success: boolean
  message: string
  data: T
}

// ==================== Service Classes ====================

class CashBankService {
  private readonly baseUrl = '/api/v1/finance/cash-banks'

  async getAll(): Promise<CashBank[]> {
    const resp = await apiClient.get<ApiResp<CashBank[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<CashBank> {
    const resp = await apiClient.get<ApiResp<CashBank>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<CashBank>): Promise<CashBank> {
    const resp = await apiClient.post<ApiResp<CashBank>>(`${this.baseUrl}/`, data)
    return resp.data
  }

  async update(id: string, data: Partial<CashBank>): Promise<CashBank> {
    const resp = await apiClient.put<ApiResp<CashBank>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class InvoiceService {
  private readonly baseUrl = '/api/v1/finance/invoices'

  async getAll(): Promise<Invoice[]> {
    const resp = await apiClient.get<ApiResp<Invoice[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<Invoice> {
    const resp = await apiClient.get<ApiResp<Invoice>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<Invoice>): Promise<Invoice> {
    const payload = {
      ...data,
      invoice_date: data.invoice_date ? new Date(data.invoice_date + 'T00:00:00Z').toISOString() : undefined,
      due_date: data.due_date ? new Date(data.due_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const resp = await apiClient.post<ApiResp<Invoice>>(`${this.baseUrl}/`, payload)
    return resp.data
  }

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const payload = {
      ...data,
      invoice_date: data.invoice_date ? new Date(data.invoice_date + 'T00:00:00Z').toISOString() : undefined,
      due_date: data.due_date ? new Date(data.due_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const resp = await apiClient.put<ApiResp<Invoice>>(`${this.baseUrl}/${id}`, payload)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class PaymentServiceAPI {
  private readonly baseUrl = '/api/v1/finance/payments'

  async getAll(): Promise<Payment[]> {
    const resp = await apiClient.get<ApiResp<Payment[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<Payment> {
    const resp = await apiClient.get<ApiResp<Payment>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<Payment>): Promise<Payment> {
    const payload = {
      ...data,
      payment_date: data.payment_date ? new Date(data.payment_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const resp = await apiClient.post<ApiResp<Payment>>(`${this.baseUrl}/`, payload)
    return resp.data
  }

  async update(id: string, data: Partial<Payment>): Promise<Payment> {
    const resp = await apiClient.put<ApiResp<Payment>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class AccountsPayableService {
  private readonly baseUrl = '/api/v1/finance/accounts-payable'

  async getAll(): Promise<AccountsPayable[]> {
    const resp = await apiClient.get<ApiResp<AccountsPayable[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<AccountsPayable> {
    const resp = await apiClient.get<ApiResp<AccountsPayable>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<AccountsPayable>): Promise<AccountsPayable> {
    const payload = {
      ...data,
      issue_date: data.issue_date ? new Date(data.issue_date + 'T00:00:00Z').toISOString() : undefined,
      due_date: data.due_date ? new Date(data.due_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const resp = await apiClient.post<ApiResp<AccountsPayable>>(`${this.baseUrl}/`, payload)
    return resp.data
  }

  async update(id: string, data: Partial<AccountsPayable>): Promise<AccountsPayable> {
    const resp = await apiClient.put<ApiResp<AccountsPayable>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class AccountsReceivableService {
  private readonly baseUrl = '/api/v1/finance/accounts-receivable'

  async getAll(): Promise<AccountsReceivable[]> {
    const resp = await apiClient.get<ApiResp<AccountsReceivable[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<AccountsReceivable> {
    const resp = await apiClient.get<ApiResp<AccountsReceivable>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<AccountsReceivable>): Promise<AccountsReceivable> {
    const payload = {
      ...data,
      issue_date: data.issue_date ? new Date(data.issue_date + 'T00:00:00Z').toISOString() : undefined,
      due_date: data.due_date ? new Date(data.due_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const resp = await apiClient.post<ApiResp<AccountsReceivable>>(`${this.baseUrl}/`, payload)
    return resp.data
  }

  async update(id: string, data: Partial<AccountsReceivable>): Promise<AccountsReceivable> {
    const resp = await apiClient.put<ApiResp<AccountsReceivable>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class CashDisbursementService {
  private readonly baseUrl = '/api/v1/finance/cash-disbursements'

  async getAll(): Promise<CashDisbursement[]> {
    const resp = await apiClient.get<ApiResp<CashDisbursement[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<CashDisbursement> {
    const resp = await apiClient.get<ApiResp<CashDisbursement>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<CashDisbursement>): Promise<CashDisbursement> {
    const payload = {
      ...data,
      disbursement_date: data.disbursement_date ? new Date(data.disbursement_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const resp = await apiClient.post<ApiResp<CashDisbursement>>(`${this.baseUrl}/`, payload)
    return resp.data
  }

  async update(id: string, data: Partial<CashDisbursement>): Promise<CashDisbursement> {
    const resp = await apiClient.put<ApiResp<CashDisbursement>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class CashReceiptService {
  private readonly baseUrl = '/api/v1/finance/cash-receipts'

  async getAll(): Promise<CashReceipt[]> {
    const resp = await apiClient.get<ApiResp<CashReceipt[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<CashReceipt> {
    const resp = await apiClient.get<ApiResp<CashReceipt>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<CashReceipt>): Promise<CashReceipt> {
    const payload = {
      ...data,
      receipt_date: data.receipt_date ? new Date(data.receipt_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const resp = await apiClient.post<ApiResp<CashReceipt>>(`${this.baseUrl}/`, payload)
    return resp.data
  }

  async update(id: string, data: Partial<CashReceipt>): Promise<CashReceipt> {
    const resp = await apiClient.put<ApiResp<CashReceipt>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class BankTransferService {
  private readonly baseUrl = '/api/v1/finance/bank-transfers'

  async getAll(): Promise<BankTransfer[]> {
    const resp = await apiClient.get<ApiResp<BankTransfer[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<BankTransfer> {
    const resp = await apiClient.get<ApiResp<BankTransfer>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<BankTransfer>): Promise<BankTransfer> {
    const payload = {
      ...data,
      transfer_date: data.transfer_date ? new Date(data.transfer_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const resp = await apiClient.post<ApiResp<BankTransfer>>(`${this.baseUrl}/`, payload)
    return resp.data
  }

  async update(id: string, data: Partial<BankTransfer>): Promise<BankTransfer> {
    const resp = await apiClient.put<ApiResp<BankTransfer>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class CashOpeningBalanceService {
  private readonly baseUrl = '/api/v1/finance/cash-opening-balances'

  async getAll(): Promise<CashOpeningBalance[]> {
    const resp = await apiClient.get<ApiResp<CashOpeningBalance[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<CashOpeningBalance> {
    const resp = await apiClient.get<ApiResp<CashOpeningBalance>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<CashOpeningBalance>): Promise<CashOpeningBalance> {
    const payload = {
      ...data,
      opening_date: data.opening_date ? new Date(data.opening_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const resp = await apiClient.post<ApiResp<CashOpeningBalance>>(`${this.baseUrl}/`, payload)
    return resp.data
  }

  async update(id: string, data: Partial<CashOpeningBalance>): Promise<CashOpeningBalance> {
    const resp = await apiClient.put<ApiResp<CashOpeningBalance>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class PurchaseVoucherService {
  private readonly baseUrl = '/api/v1/finance/purchase-vouchers'

  async getAll(): Promise<PurchaseVoucher[]> {
    const resp = await apiClient.get<ApiResp<PurchaseVoucher[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<PurchaseVoucher> {
    const resp = await apiClient.get<ApiResp<PurchaseVoucher>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<PurchaseVoucher>): Promise<PurchaseVoucher> {
    const payload = {
      ...data,
      voucher_date: data.voucher_date ? new Date(data.voucher_date + 'T00:00:00Z').toISOString() : undefined,
      due_date: data.due_date ? new Date(data.due_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const resp = await apiClient.post<ApiResp<PurchaseVoucher>>(`${this.baseUrl}/`, payload)
    return resp.data
  }

  async update(id: string, data: Partial<PurchaseVoucher>): Promise<PurchaseVoucher> {
    const resp = await apiClient.put<ApiResp<PurchaseVoucher>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }

  async approve(id: string, approvedBy: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${id}/approve`, { approved_by: approvedBy })
  }

  async getByStatus(status: string): Promise<PurchaseVoucher[]> {
    const resp = await apiClient.get<ApiResp<PurchaseVoucher[]>>(`${this.baseUrl}/status/${status}`)
    return resp.data || []
  }
}

class ExpenditureRequestService {
  private readonly baseUrl = '/api/v1/finance/expenditure-requests'

  async getAll(): Promise<ExpenditureRequest[]> {
    const resp = await apiClient.get<ApiResp<ExpenditureRequest[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<ExpenditureRequest> {
    const resp = await apiClient.get<ApiResp<ExpenditureRequest>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<ExpenditureRequest>): Promise<ExpenditureRequest> {
    const payload = {
      ...data,
      request_date: data.request_date ? new Date(data.request_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const resp = await apiClient.post<ApiResp<ExpenditureRequest>>(`${this.baseUrl}/`, payload)
    return resp.data
  }

  async update(id: string, data: Partial<ExpenditureRequest>): Promise<ExpenditureRequest> {
    const resp = await apiClient.put<ApiResp<ExpenditureRequest>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }

  async approve(id: string, approvedBy: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${id}/approve`, { approved_by: approvedBy })
  }

  async reject(id: string, remarks: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${id}/reject`, { remarks })
  }

  async disburse(id: string, processedBy: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${id}/disburse`, { processed_by: processedBy })
  }
}

class CheckClearanceService {
  private readonly baseUrl = '/api/v1/finance/check-clearance'

  async getAll(): Promise<CheckClearance[]> {
    const resp = await apiClient.get<ApiResp<CheckClearance[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<CheckClearance> {
    const resp = await apiClient.get<ApiResp<CheckClearance>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<CheckClearance>): Promise<CheckClearance> {
    const payload = {
      ...data,
      check_date: data.check_date ? new Date(data.check_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const resp = await apiClient.post<ApiResp<CheckClearance>>(`${this.baseUrl}/`, payload)
    return resp.data
  }

  async update(id: string, data: Partial<CheckClearance>): Promise<CheckClearance> {
    const resp = await apiClient.put<ApiResp<CheckClearance>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }

  async clear(id: string, clearanceDate: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${id}/clear`, { clearance_date: new Date(clearanceDate + 'T00:00:00Z').toISOString() })
  }

  async bounce(id: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${id}/bounce`, {})
  }
}

class MonthlyClosingService {
  private readonly baseUrl = '/api/v1/finance/monthly-closing'

  async getAll(): Promise<MonthlyClosing[]> {
    const resp = await apiClient.get<ApiResp<MonthlyClosing[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<MonthlyClosing> {
    const resp = await apiClient.get<ApiResp<MonthlyClosing>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<MonthlyClosing>): Promise<MonthlyClosing> {
    const resp = await apiClient.post<ApiResp<MonthlyClosing>>(`${this.baseUrl}/`, data)
    return resp.data
  }

  async closeMonth(id: string, closedBy: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${id}/close`, { closed_by: closedBy })
  }
}

class CashBookService {
  private readonly baseUrl = '/api/v1/finance/cash-book'

  async getAll(): Promise<CashBook[]> {
    const resp = await apiClient.get<ApiResp<CashBook[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<CashBook> {
    const resp = await apiClient.get<ApiResp<CashBook>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<CashBook>): Promise<CashBook> {
    const resp = await apiClient.post<ApiResp<CashBook>>(`${this.baseUrl}/`, data)
    return resp.data
  }

  async update(id: string, data: Partial<CashBook>): Promise<CashBook> {
    const resp = await apiClient.put<ApiResp<CashBook>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }

  async getByType(type: string): Promise<CashBook[]> {
    const resp = await apiClient.get<ApiResp<CashBook[]>>(`${this.baseUrl}/type/${type}`)
    return resp.data || []
  }
}

// ==================== Extended Finance Types ====================

export interface Budget {
  id: string
  department: string
  category: string
  fiscal_year: string
  allocated: number
  spent: number
  status: string
  company_id: string
  created_at: string
  updated_at: string
}

export interface CapexProject {
  id: string
  project_name: string
  description: string
  category: string
  est_budget: number
  actual_spent: number
  expected_roi: number
  status: string
  priority: string
  start_date: string | null
  completion_date: string | null
  company_id: string
  created_at: string
  updated_at: string
}

export interface LoanFacility {
  id: string
  facility_name: string
  lender: string
  type: string
  principal_amount: number
  outstanding_amount: number
  interest_rate: number
  maturity_date: string
  next_payment_date: string | null
  next_payment_amount: number
  status: string
  company_id: string
  created_at: string
  updated_at: string
}

export interface FinancialForecast {
  id: string
  scenario_name: string
  type: string
  fiscal_year: string
  projected_revenue: number
  projected_ebitda: number
  growth_rate: number
  status: string
  company_id: string
  created_at: string
  updated_at: string
}

export interface FinanceReport {
  id: string
  report_name: string
  type: string
  period: string
  generated_by: string
  file_size: string
  file_path: string
  status: string
  company_id: string
  created_at: string
  updated_at: string
}

// ==================== Extended Finance Service Classes ====================

class BudgetService {
  private readonly baseUrl = '/api/v1/finance/budgets'

  async getAll(): Promise<Budget[]> {
    const resp = await apiClient.get<ApiResp<Budget[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<Budget> {
    const resp = await apiClient.get<ApiResp<Budget>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<Budget>): Promise<Budget> {
    const resp = await apiClient.post<ApiResp<Budget>>(`${this.baseUrl}/`, data)
    return resp.data
  }

  async update(id: string, data: Partial<Budget>): Promise<Budget> {
    const resp = await apiClient.put<ApiResp<Budget>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class CapexProjectService {
  private readonly baseUrl = '/api/v1/finance/capex-projects'

  async getAll(): Promise<CapexProject[]> {
    const resp = await apiClient.get<ApiResp<CapexProject[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<CapexProject> {
    const resp = await apiClient.get<ApiResp<CapexProject>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<CapexProject>): Promise<CapexProject> {
    const payload = {
      ...data,
      start_date: data.start_date ? new Date(data.start_date + 'T00:00:00Z').toISOString() : undefined,
      completion_date: data.completion_date ? new Date(data.completion_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const resp = await apiClient.post<ApiResp<CapexProject>>(`${this.baseUrl}/`, payload)
    return resp.data
  }

  async update(id: string, data: Partial<CapexProject>): Promise<CapexProject> {
    const resp = await apiClient.put<ApiResp<CapexProject>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class LoanFacilityService {
  private readonly baseUrl = '/api/v1/finance/loan-facilities'

  async getAll(): Promise<LoanFacility[]> {
    const resp = await apiClient.get<ApiResp<LoanFacility[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<LoanFacility> {
    const resp = await apiClient.get<ApiResp<LoanFacility>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<LoanFacility>): Promise<LoanFacility> {
    const payload = {
      ...data,
      maturity_date: data.maturity_date ? new Date(data.maturity_date + 'T00:00:00Z').toISOString() : undefined,
      next_payment_date: data.next_payment_date ? new Date(data.next_payment_date + 'T00:00:00Z').toISOString() : undefined,
    }
    const resp = await apiClient.post<ApiResp<LoanFacility>>(`${this.baseUrl}/`, payload)
    return resp.data
  }

  async update(id: string, data: Partial<LoanFacility>): Promise<LoanFacility> {
    const resp = await apiClient.put<ApiResp<LoanFacility>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class FinancialForecastService {
  private readonly baseUrl = '/api/v1/finance/financial-forecasts'

  async getAll(): Promise<FinancialForecast[]> {
    const resp = await apiClient.get<ApiResp<FinancialForecast[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<FinancialForecast> {
    const resp = await apiClient.get<ApiResp<FinancialForecast>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<FinancialForecast>): Promise<FinancialForecast> {
    const resp = await apiClient.post<ApiResp<FinancialForecast>>(`${this.baseUrl}/`, data)
    return resp.data
  }

  async update(id: string, data: Partial<FinancialForecast>): Promise<FinancialForecast> {
    const resp = await apiClient.put<ApiResp<FinancialForecast>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

class FinanceReportService {
  private readonly baseUrl = '/api/v1/finance/finance-reports'

  async getAll(): Promise<FinanceReport[]> {
    const resp = await apiClient.get<ApiResp<FinanceReport[]>>(`${this.baseUrl}/`)
    return resp.data || []
  }

  async getById(id: string): Promise<FinanceReport> {
    const resp = await apiClient.get<ApiResp<FinanceReport>>(`${this.baseUrl}/${id}`)
    return resp.data
  }

  async create(data: Partial<FinanceReport>): Promise<FinanceReport> {
    const resp = await apiClient.post<ApiResp<FinanceReport>>(`${this.baseUrl}/`, data)
    return resp.data
  }

  async update(id: string, data: Partial<FinanceReport>): Promise<FinanceReport> {
    const resp = await apiClient.put<ApiResp<FinanceReport>>(`${this.baseUrl}/${id}`, data)
    return resp.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }
}

// ==================== Singleton Exports ====================

export const cashBankService = new CashBankService()
export const financeInvoiceService = new InvoiceService()
export const paymentService = new PaymentServiceAPI()
export const accountsPayableService = new AccountsPayableService()
export const accountsReceivableService = new AccountsReceivableService()
export const cashDisbursementService = new CashDisbursementService()
export const cashReceiptService = new CashReceiptService()
export const bankTransferService = new BankTransferService()
export const cashOpeningBalanceService = new CashOpeningBalanceService()
export const purchaseVoucherService = new PurchaseVoucherService()
export const expenditureRequestService = new ExpenditureRequestService()
export const checkClearanceService = new CheckClearanceService()
export const monthlyClosingService = new MonthlyClosingService()
export const cashBookService = new CashBookService()
export const budgetService = new BudgetService()
export const capexProjectService = new CapexProjectService()
export const loanFacilityService = new LoanFacilityService()
export const financialForecastService = new FinancialForecastService()
export const financeReportService = new FinanceReportService()
