package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
	"malaka/internal/shared/uuid"
)

type TaxRepositoryImpl struct {
	db *sqlx.DB
}

func NewTaxRepositoryImpl(db *sqlx.DB) repositories.TaxRepository {
	return &TaxRepositoryImpl{db: db}
}

// --- Tax CRUD ---

func (r *TaxRepositoryImpl) Create(ctx context.Context, tax *entities.Tax) error {
	if tax.ID.IsNil() {
		tax.ID = uuid.New()
	}
	now := time.Now()
	tax.CreatedAt = now
	tax.UpdatedAt = now

	query := `INSERT INTO taxes (id, tax_code, tax_name, tax_type, tax_rate, description, is_active, effective_date, expiry_date, tax_account_id, expense_account_id, company_id, created_by, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`
	_, err := r.db.ExecContext(ctx, query,
		tax.ID, tax.TaxCode, tax.TaxName, tax.TaxType, tax.TaxRate, tax.Description,
		tax.IsActive, tax.EffectiveDate, tax.ExpiryDate, tax.TaxAccountID, tax.ExpenseAccountID,
		tax.CompanyID, tax.CreatedBy, tax.CreatedAt, tax.UpdatedAt)
	return err
}

func (r *TaxRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.Tax, error) {
	var tax entities.Tax
	query := `SELECT id, tax_code, tax_name, tax_type, tax_rate, COALESCE(description,'') as description, is_active, effective_date, expiry_date, tax_account_id, expense_account_id, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM taxes WHERE id = $1`
	err := r.db.GetContext(ctx, &tax, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &tax, err
}

func (r *TaxRepositoryImpl) GetAll(ctx context.Context) ([]*entities.Tax, error) {
	var taxes []*entities.Tax
	query := `SELECT id, tax_code, tax_name, tax_type, tax_rate, COALESCE(description,'') as description, is_active, effective_date, expiry_date, tax_account_id, expense_account_id, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM taxes ORDER BY tax_code ASC`
	err := r.db.SelectContext(ctx, &taxes, query)
	return taxes, err
}

func (r *TaxRepositoryImpl) Update(ctx context.Context, tax *entities.Tax) error {
	tax.UpdatedAt = time.Now()
	query := `UPDATE taxes SET tax_code=$1, tax_name=$2, tax_type=$3, tax_rate=$4, description=$5, is_active=$6, effective_date=$7, expiry_date=$8, tax_account_id=$9, expense_account_id=$10, company_id=$11, updated_at=$12 WHERE id=$13`
	_, err := r.db.ExecContext(ctx, query,
		tax.TaxCode, tax.TaxName, tax.TaxType, tax.TaxRate, tax.Description,
		tax.IsActive, tax.EffectiveDate, tax.ExpiryDate, tax.TaxAccountID, tax.ExpenseAccountID,
		tax.CompanyID, tax.UpdatedAt, tax.ID)
	return err
}

func (r *TaxRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM taxes WHERE id = $1`, id)
	return err
}

// --- Tax Transaction CRUD ---

func (r *TaxRepositoryImpl) CreateTransaction(ctx context.Context, tx *entities.TaxTransaction) error {
	if tx.ID.IsNil() {
		tx.ID = uuid.New()
	}
	now := time.Now()
	tx.CreatedAt = now
	tx.UpdatedAt = now

	query := `INSERT INTO tax_transactions (id, tax_id, transaction_date, transaction_type, base_amount, tax_amount, total_amount, reference_type, reference_id, reference_number, customer_id, supplier_id, journal_entry_id, company_id, created_by, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`
	_, err := r.db.ExecContext(ctx, query,
		tx.ID, tx.TaxID, tx.TransactionDate, tx.TransactionType, tx.BaseAmount, tx.TaxAmount, tx.TotalAmount,
		tx.ReferenceType, tx.ReferenceID, tx.ReferenceNumber, tx.CustomerID, tx.SupplierID, tx.JournalEntryID,
		tx.CompanyID, tx.CreatedBy, tx.CreatedAt, tx.UpdatedAt)
	return err
}

func (r *TaxRepositoryImpl) GetTransactionByID(ctx context.Context, id uuid.ID) (*entities.TaxTransaction, error) {
	var tx entities.TaxTransaction
	query := `SELECT id, tax_id, transaction_date, COALESCE(transaction_type,'') as transaction_type, base_amount, tax_amount, total_amount, COALESCE(reference_type,'') as reference_type, COALESCE(reference_id,'') as reference_id, COALESCE(reference_number,'') as reference_number, COALESCE(customer_id,'') as customer_id, COALESCE(supplier_id,'') as supplier_id, journal_entry_id, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM tax_transactions WHERE id = $1`
	err := r.db.GetContext(ctx, &tx, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &tx, err
}

func (r *TaxRepositoryImpl) GetTransactionsByTax(ctx context.Context, taxID uuid.ID) ([]*entities.TaxTransaction, error) {
	var txs []*entities.TaxTransaction
	query := `SELECT id, tax_id, transaction_date, COALESCE(transaction_type,'') as transaction_type, base_amount, tax_amount, total_amount, COALESCE(reference_type,'') as reference_type, COALESCE(reference_id,'') as reference_id, COALESCE(reference_number,'') as reference_number, COALESCE(customer_id,'') as customer_id, COALESCE(supplier_id,'') as supplier_id, journal_entry_id, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM tax_transactions WHERE tax_id = $1 ORDER BY transaction_date DESC`
	err := r.db.SelectContext(ctx, &txs, query, taxID)
	return txs, err
}

func (r *TaxRepositoryImpl) UpdateTransaction(ctx context.Context, tx *entities.TaxTransaction) error {
	tx.UpdatedAt = time.Now()
	query := `UPDATE tax_transactions SET tax_id=$1, transaction_date=$2, transaction_type=$3, base_amount=$4, tax_amount=$5, total_amount=$6, reference_type=$7, reference_id=$8, reference_number=$9, customer_id=$10, supplier_id=$11, journal_entry_id=$12, company_id=$13, updated_at=$14 WHERE id=$15`
	_, err := r.db.ExecContext(ctx, query,
		tx.TaxID, tx.TransactionDate, tx.TransactionType, tx.BaseAmount, tx.TaxAmount, tx.TotalAmount,
		tx.ReferenceType, tx.ReferenceID, tx.ReferenceNumber, tx.CustomerID, tx.SupplierID, tx.JournalEntryID,
		tx.CompanyID, tx.UpdatedAt, tx.ID)
	return err
}

func (r *TaxRepositoryImpl) DeleteTransaction(ctx context.Context, id uuid.ID) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM tax_transactions WHERE id = $1`, id)
	return err
}

// --- Tax Return CRUD ---

func (r *TaxRepositoryImpl) CreateReturn(ctx context.Context, ret *entities.TaxReturn) error {
	if ret.ID.IsNil() {
		ret.ID = uuid.New()
	}
	now := time.Now()
	ret.CreatedAt = now
	ret.UpdatedAt = now

	query := `INSERT INTO tax_returns (id, return_number, tax_type, period_start, period_end, filing_date, due_date, status, total_sales, total_purchases, output_tax, input_tax, tax_payable, tax_paid, penalty_amount, interest_amount, total_due, submitted_by, submitted_at, paid_at, company_id, created_by, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`
	_, err := r.db.ExecContext(ctx, query,
		ret.ID, ret.ReturnNumber, ret.TaxType, ret.PeriodStart, ret.PeriodEnd, ret.FilingDate, ret.DueDate,
		ret.Status, ret.TotalSales, ret.TotalPurchases, ret.OutputTax, ret.InputTax, ret.TaxPayable, ret.TaxPaid,
		ret.PenaltyAmount, ret.InterestAmount, ret.TotalDue, ret.SubmittedBy, ret.SubmittedAt, ret.PaidAt,
		ret.CompanyID, ret.CreatedBy, ret.CreatedAt, ret.UpdatedAt)
	return err
}

func (r *TaxRepositoryImpl) GetReturnByID(ctx context.Context, id uuid.ID) (*entities.TaxReturn, error) {
	var ret entities.TaxReturn
	query := `SELECT id, return_number, tax_type, period_start, period_end, filing_date, due_date, status, total_sales, total_purchases, output_tax, input_tax, tax_payable, tax_paid, penalty_amount, interest_amount, total_due, COALESCE(submitted_by,'') as submitted_by, submitted_at, paid_at, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM tax_returns WHERE id = $1`
	err := r.db.GetContext(ctx, &ret, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &ret, err
}

func (r *TaxRepositoryImpl) GetReturnsByCompany(ctx context.Context, companyID string) ([]*entities.TaxReturn, error) {
	var rets []*entities.TaxReturn
	query := `SELECT id, return_number, tax_type, period_start, period_end, filing_date, due_date, status, total_sales, total_purchases, output_tax, input_tax, tax_payable, tax_paid, penalty_amount, interest_amount, total_due, COALESCE(submitted_by,'') as submitted_by, submitted_at, paid_at, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM tax_returns WHERE company_id = $1 ORDER BY due_date DESC`
	err := r.db.SelectContext(ctx, &rets, query, companyID)
	return rets, err
}

func (r *TaxRepositoryImpl) UpdateReturn(ctx context.Context, ret *entities.TaxReturn) error {
	ret.UpdatedAt = time.Now()
	query := `UPDATE tax_returns SET return_number=$1, tax_type=$2, period_start=$3, period_end=$4, filing_date=$5, due_date=$6, status=$7, total_sales=$8, total_purchases=$9, output_tax=$10, input_tax=$11, tax_payable=$12, tax_paid=$13, penalty_amount=$14, interest_amount=$15, total_due=$16, submitted_by=$17, submitted_at=$18, paid_at=$19, company_id=$20, updated_at=$21 WHERE id=$22`
	_, err := r.db.ExecContext(ctx, query,
		ret.ReturnNumber, ret.TaxType, ret.PeriodStart, ret.PeriodEnd, ret.FilingDate, ret.DueDate,
		ret.Status, ret.TotalSales, ret.TotalPurchases, ret.OutputTax, ret.InputTax, ret.TaxPayable, ret.TaxPaid,
		ret.PenaltyAmount, ret.InterestAmount, ret.TotalDue, ret.SubmittedBy, ret.SubmittedAt, ret.PaidAt,
		ret.CompanyID, ret.UpdatedAt, ret.ID)
	return err
}

func (r *TaxRepositoryImpl) DeleteReturn(ctx context.Context, id uuid.ID) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM tax_returns WHERE id = $1`, id)
	return err
}

// --- Query Operations ---

func (r *TaxRepositoryImpl) GetByCode(ctx context.Context, taxCode string) (*entities.Tax, error) {
	var tax entities.Tax
	query := `SELECT id, tax_code, tax_name, tax_type, tax_rate, COALESCE(description,'') as description, is_active, effective_date, expiry_date, tax_account_id, expense_account_id, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM taxes WHERE tax_code = $1`
	err := r.db.GetContext(ctx, &tax, query, taxCode)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &tax, err
}

func (r *TaxRepositoryImpl) GetByType(ctx context.Context, taxType entities.TaxType) ([]*entities.Tax, error) {
	var taxes []*entities.Tax
	query := `SELECT id, tax_code, tax_name, tax_type, tax_rate, COALESCE(description,'') as description, is_active, effective_date, expiry_date, tax_account_id, expense_account_id, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM taxes WHERE tax_type = $1 ORDER BY tax_code`
	err := r.db.SelectContext(ctx, &taxes, query, taxType)
	return taxes, err
}

func (r *TaxRepositoryImpl) GetActiveTaxes(ctx context.Context, companyID string, date time.Time) ([]*entities.Tax, error) {
	var taxes []*entities.Tax
	query := `SELECT id, tax_code, tax_name, tax_type, tax_rate, COALESCE(description,'') as description, is_active, effective_date, expiry_date, tax_account_id, expense_account_id, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM taxes WHERE is_active = true AND effective_date <= $1 AND (expiry_date IS NULL OR expiry_date >= $1) ORDER BY tax_code`
	err := r.db.SelectContext(ctx, &taxes, query, date)
	return taxes, err
}

func (r *TaxRepositoryImpl) GetTaxByTypeAndCompany(ctx context.Context, companyID string, taxType entities.TaxType) ([]*entities.Tax, error) {
	var taxes []*entities.Tax
	query := `SELECT id, tax_code, tax_name, tax_type, tax_rate, COALESCE(description,'') as description, is_active, effective_date, expiry_date, tax_account_id, expense_account_id, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM taxes WHERE tax_type = $1 ORDER BY tax_code`
	err := r.db.SelectContext(ctx, &taxes, query, taxType)
	return taxes, err
}

func (r *TaxRepositoryImpl) GetByCompanyID(ctx context.Context, companyID string) ([]*entities.Tax, error) {
	return r.GetAll(ctx)
}

func (r *TaxRepositoryImpl) GetActiveByCompany(ctx context.Context, companyID string) ([]*entities.Tax, error) {
	return r.GetActiveTaxes(ctx, companyID, time.Now())
}

// --- Transaction Queries ---

func (r *TaxRepositoryImpl) GetTransactionsByPeriod(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.TaxTransaction, error) {
	var txs []*entities.TaxTransaction
	query := `SELECT id, tax_id, transaction_date, COALESCE(transaction_type,'') as transaction_type, base_amount, tax_amount, total_amount, COALESCE(reference_type,'') as reference_type, COALESCE(reference_id,'') as reference_id, COALESCE(reference_number,'') as reference_number, COALESCE(customer_id,'') as customer_id, COALESCE(supplier_id,'') as supplier_id, journal_entry_id, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM tax_transactions WHERE transaction_date >= $1 AND transaction_date <= $2 ORDER BY transaction_date DESC`
	err := r.db.SelectContext(ctx, &txs, query, startDate, endDate)
	return txs, err
}

func (r *TaxRepositoryImpl) GetTransactionsByType(ctx context.Context, companyID string, transactionType string) ([]*entities.TaxTransaction, error) {
	var txs []*entities.TaxTransaction
	query := `SELECT id, tax_id, transaction_date, COALESCE(transaction_type,'') as transaction_type, base_amount, tax_amount, total_amount, COALESCE(reference_type,'') as reference_type, COALESCE(reference_id,'') as reference_id, COALESCE(reference_number,'') as reference_number, COALESCE(customer_id,'') as customer_id, COALESCE(supplier_id,'') as supplier_id, journal_entry_id, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM tax_transactions WHERE transaction_type = $1 ORDER BY transaction_date DESC`
	err := r.db.SelectContext(ctx, &txs, query, transactionType)
	return txs, err
}

func (r *TaxRepositoryImpl) GetTransactionsByReference(ctx context.Context, referenceType, referenceID string) ([]*entities.TaxTransaction, error) {
	var txs []*entities.TaxTransaction
	query := `SELECT id, tax_id, transaction_date, COALESCE(transaction_type,'') as transaction_type, base_amount, tax_amount, total_amount, COALESCE(reference_type,'') as reference_type, COALESCE(reference_id,'') as reference_id, COALESCE(reference_number,'') as reference_number, COALESCE(customer_id,'') as customer_id, COALESCE(supplier_id,'') as supplier_id, journal_entry_id, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM tax_transactions WHERE reference_type = $1 AND reference_id = $2 ORDER BY transaction_date DESC`
	err := r.db.SelectContext(ctx, &txs, query, referenceType, referenceID)
	return txs, err
}

func (r *TaxRepositoryImpl) GetTransactionsByCustomer(ctx context.Context, customerID string) ([]*entities.TaxTransaction, error) {
	var txs []*entities.TaxTransaction
	query := `SELECT id, tax_id, transaction_date, COALESCE(transaction_type,'') as transaction_type, base_amount, tax_amount, total_amount, COALESCE(reference_type,'') as reference_type, COALESCE(reference_id,'') as reference_id, COALESCE(reference_number,'') as reference_number, COALESCE(customer_id,'') as customer_id, COALESCE(supplier_id,'') as supplier_id, journal_entry_id, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM tax_transactions WHERE customer_id = $1 ORDER BY transaction_date DESC`
	err := r.db.SelectContext(ctx, &txs, query, customerID)
	return txs, err
}

func (r *TaxRepositoryImpl) GetTransactionsBySupplier(ctx context.Context, supplierID string) ([]*entities.TaxTransaction, error) {
	var txs []*entities.TaxTransaction
	query := `SELECT id, tax_id, transaction_date, COALESCE(transaction_type,'') as transaction_type, base_amount, tax_amount, total_amount, COALESCE(reference_type,'') as reference_type, COALESCE(reference_id,'') as reference_id, COALESCE(reference_number,'') as reference_number, COALESCE(customer_id,'') as customer_id, COALESCE(supplier_id,'') as supplier_id, journal_entry_id, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM tax_transactions WHERE supplier_id = $1 ORDER BY transaction_date DESC`
	err := r.db.SelectContext(ctx, &txs, query, supplierID)
	return txs, err
}

// --- Tax Return Queries ---

func (r *TaxRepositoryImpl) GetReturnByNumber(ctx context.Context, returnNumber string) (*entities.TaxReturn, error) {
	var ret entities.TaxReturn
	query := `SELECT id, return_number, tax_type, period_start, period_end, filing_date, due_date, status, total_sales, total_purchases, output_tax, input_tax, tax_payable, tax_paid, penalty_amount, interest_amount, total_due, COALESCE(submitted_by,'') as submitted_by, submitted_at, paid_at, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM tax_returns WHERE return_number = $1`
	err := r.db.GetContext(ctx, &ret, query, returnNumber)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &ret, err
}

func (r *TaxRepositoryImpl) GetReturnsByType(ctx context.Context, companyID string, taxType entities.TaxType) ([]*entities.TaxReturn, error) {
	var rets []*entities.TaxReturn
	query := `SELECT id, return_number, tax_type, period_start, period_end, filing_date, due_date, status, total_sales, total_purchases, output_tax, input_tax, tax_payable, tax_paid, penalty_amount, interest_amount, total_due, COALESCE(submitted_by,'') as submitted_by, submitted_at, paid_at, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM tax_returns WHERE tax_type = $1 ORDER BY due_date DESC`
	err := r.db.SelectContext(ctx, &rets, query, taxType)
	return rets, err
}

func (r *TaxRepositoryImpl) GetReturnsByStatus(ctx context.Context, companyID string, status entities.TaxStatus) ([]*entities.TaxReturn, error) {
	var rets []*entities.TaxReturn
	query := `SELECT id, return_number, tax_type, period_start, period_end, filing_date, due_date, status, total_sales, total_purchases, output_tax, input_tax, tax_payable, tax_paid, penalty_amount, interest_amount, total_due, COALESCE(submitted_by,'') as submitted_by, submitted_at, paid_at, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM tax_returns WHERE status = $1 ORDER BY due_date DESC`
	err := r.db.SelectContext(ctx, &rets, query, status)
	return rets, err
}

func (r *TaxRepositoryImpl) GetReturnsByPeriod(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.TaxReturn, error) {
	var rets []*entities.TaxReturn
	query := `SELECT id, return_number, tax_type, period_start, period_end, filing_date, due_date, status, total_sales, total_purchases, output_tax, input_tax, tax_payable, tax_paid, penalty_amount, interest_amount, total_due, COALESCE(submitted_by,'') as submitted_by, submitted_at, paid_at, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM tax_returns WHERE period_start >= $1 AND period_end <= $2 ORDER BY due_date DESC`
	err := r.db.SelectContext(ctx, &rets, query, startDate, endDate)
	return rets, err
}

func (r *TaxRepositoryImpl) GetOverdueReturns(ctx context.Context, companyID string) ([]*entities.TaxReturn, error) {
	var rets []*entities.TaxReturn
	query := `SELECT id, return_number, tax_type, period_start, period_end, filing_date, due_date, status, total_sales, total_purchases, output_tax, input_tax, tax_payable, tax_paid, penalty_amount, interest_amount, total_due, COALESCE(submitted_by,'') as submitted_by, submitted_at, paid_at, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM tax_returns WHERE due_date < NOW() AND status NOT IN ('PAID') ORDER BY due_date ASC`
	err := r.db.SelectContext(ctx, &rets, query)
	return rets, err
}

func (r *TaxRepositoryImpl) GetDueReturns(ctx context.Context, companyID string, dueDate time.Time) ([]*entities.TaxReturn, error) {
	var rets []*entities.TaxReturn
	query := `SELECT id, return_number, tax_type, period_start, period_end, filing_date, due_date, status, total_sales, total_purchases, output_tax, input_tax, tax_payable, tax_paid, penalty_amount, interest_amount, total_due, COALESCE(submitted_by,'') as submitted_by, submitted_at, paid_at, COALESCE(company_id,'') as company_id, COALESCE(created_by,'') as created_by, created_at, updated_at FROM tax_returns WHERE due_date <= $1 AND status IN ('DRAFT','SUBMITTED') ORDER BY due_date ASC`
	err := r.db.SelectContext(ctx, &rets, query, dueDate)
	return rets, err
}

// --- Tax Calculation ---

func (r *TaxRepositoryImpl) CalculateTax(ctx context.Context, taxID uuid.ID, baseAmount float64) (float64, error) {
	tax, err := r.GetByID(ctx, taxID)
	if err != nil {
		return 0, err
	}
	if tax == nil {
		return 0, fmt.Errorf("tax not found")
	}
	return tax.CalculateTaxAmount(baseAmount), nil
}

func (r *TaxRepositoryImpl) GetApplicableTaxes(ctx context.Context, companyID string, transactionType string, date time.Time) ([]*entities.Tax, error) {
	return r.GetActiveTaxes(ctx, companyID, date)
}

// --- Tax Return Management ---

func (r *TaxRepositoryImpl) SubmitReturn(ctx context.Context, returnID uuid.ID, userID string) error {
	now := time.Now()
	query := `UPDATE tax_returns SET status='SUBMITTED', submitted_by=$1, submitted_at=$2, updated_at=$3 WHERE id=$4 AND status='DRAFT'`
	result, err := r.db.ExecContext(ctx, query, userID, now, now, returnID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("tax return not found or not in DRAFT status")
	}
	return nil
}

func (r *TaxRepositoryImpl) PayReturn(ctx context.Context, returnID uuid.ID, paymentAmount float64) error {
	now := time.Now()
	query := `UPDATE tax_returns SET status='PAID', tax_paid=tax_paid+$1, paid_at=$2, updated_at=$3 WHERE id=$4 AND status='SUBMITTED'`
	result, err := r.db.ExecContext(ctx, query, paymentAmount, now, now, returnID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("tax return not found or not in SUBMITTED status")
	}
	return nil
}

func (r *TaxRepositoryImpl) GenerateReturn(ctx context.Context, companyID string, taxType entities.TaxType, periodStart, periodEnd time.Time) (*entities.TaxReturn, error) {
	ret := &entities.TaxReturn{
		ID:          uuid.New(),
		TaxType:     taxType,
		PeriodStart: periodStart,
		PeriodEnd:   periodEnd,
		FilingDate:  time.Now(),
		DueDate:     periodEnd.AddDate(0, 1, 0),
		Status:      entities.TaxStatusDraft,
		CompanyID:   companyID,
	}
	ret.ReturnNumber = fmt.Sprintf("SPT-%s-%s", taxType, periodStart.Format("200601"))
	err := r.CreateReturn(ctx, ret)
	return ret, err
}

// --- Reporting ---

func (r *TaxRepositoryImpl) GetTaxReport(ctx context.Context, companyID string, taxType entities.TaxType, startDate, endDate time.Time) (*entities.TaxReport, error) {
	report := &entities.TaxReport{TaxType: taxType, PeriodStart: startDate, PeriodEnd: endDate}
	query := `SELECT COALESCE(SUM(base_amount),0), COALESCE(SUM(tax_amount),0), COUNT(*) FROM tax_transactions WHERE transaction_date >= $1 AND transaction_date <= $2`
	err := r.db.QueryRowContext(ctx, query, startDate, endDate).Scan(&report.TotalTaxable, &report.TotalTax, &report.TransactionCount)
	if err != nil {
		return nil, err
	}
	report.TaxCollected = report.TotalTax
	report.NetTaxPosition = report.TaxCollected - report.TaxPaid
	return report, nil
}

func (r *TaxRepositoryImpl) GetTaxLiabilityReport(ctx context.Context, companyID string, asOfDate time.Time) (map[entities.TaxType]float64, error) {
	result := make(map[entities.TaxType]float64)
	query := `SELECT tax_type, COALESCE(SUM(tax_payable - tax_paid),0) FROM tax_returns WHERE status != 'PAID' GROUP BY tax_type`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var taxType entities.TaxType
		var amount float64
		if err := rows.Scan(&taxType, &amount); err != nil {
			return nil, err
		}
		result[taxType] = amount
	}
	return result, rows.Err()
}

func (r *TaxRepositoryImpl) GetTaxComplianceReport(ctx context.Context, companyID string, year int) (map[string]interface{}, error) {
	result := map[string]interface{}{"year": year, "status": "compliant"}
	return result, nil
}

func (r *TaxRepositoryImpl) GetVATReport(ctx context.Context, companyID string, startDate, endDate time.Time) (map[string]float64, error) {
	result := make(map[string]float64)
	query := `SELECT COALESCE(SUM(CASE WHEN transaction_type='SALE' THEN tax_amount ELSE 0 END),0) as output_tax, COALESCE(SUM(CASE WHEN transaction_type='PURCHASE' THEN tax_amount ELSE 0 END),0) as input_tax FROM tax_transactions WHERE transaction_date >= $1 AND transaction_date <= $2`
	var outputTax, inputTax float64
	err := r.db.QueryRowContext(ctx, query, startDate, endDate).Scan(&outputTax, &inputTax)
	if err != nil {
		return nil, err
	}
	result["output_tax"] = outputTax
	result["input_tax"] = inputTax
	result["net_vat"] = outputTax - inputTax
	return result, nil
}

func (r *TaxRepositoryImpl) GetWithholdingTaxReport(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.TaxTransaction, error) {
	return r.GetTransactionsByType(ctx, companyID, "WITHHOLDING")
}

// --- Batch Operations ---

func (r *TaxRepositoryImpl) CreateTransactionBatch(ctx context.Context, transactions []*entities.TaxTransaction) error {
	for _, tx := range transactions {
		if err := r.CreateTransaction(ctx, tx); err != nil {
			return err
		}
	}
	return nil
}

func (r *TaxRepositoryImpl) UpdateReturnTotals(ctx context.Context, returnID uuid.ID) error {
	return nil // Placeholder
}

func (r *TaxRepositoryImpl) ProcessPeriodicReturns(ctx context.Context, companyID string, period time.Time) error {
	return nil // Placeholder
}

// --- Integration Operations ---

func (r *TaxRepositoryImpl) SyncWithExternalSystem(ctx context.Context, companyID string) error {
	return nil // Placeholder
}

func (r *TaxRepositoryImpl) ValidateReturnData(ctx context.Context, returnID uuid.ID) ([]string, error) {
	return nil, nil // Placeholder
}

// --- Historical Operations ---

func (r *TaxRepositoryImpl) GetTaxHistory(ctx context.Context, companyID string, taxType entities.TaxType) ([]*entities.TaxReturn, error) {
	return r.GetReturnsByType(ctx, companyID, taxType)
}

func (r *TaxRepositoryImpl) GetTaxTrends(ctx context.Context, companyID string, taxType entities.TaxType, periods int) ([]float64, error) {
	return nil, nil // Placeholder
}
