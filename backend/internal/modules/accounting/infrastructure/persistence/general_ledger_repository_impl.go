package persistence

import (
	"context"
	"database/sql"
	"time"

	"malaka/internal/shared/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
)

type generalLedgerRepositoryImpl struct {
	db *sql.DB
}

// NewGeneralLedgerRepository creates a new general ledger repository
func NewGeneralLedgerRepository(db *sql.DB) repositories.GeneralLedgerRepository {
	return &generalLedgerRepositoryImpl{db: db}
}

// Create creates a new general ledger entry
func (r *generalLedgerRepositoryImpl) Create(ctx context.Context, entry *entities.GeneralLedger) error {
	if entry.ID == uuid.Nil {
		entry.ID = uuid.New()
	}
	
	now := time.Now()
	entry.CreatedAt = now
	entry.UpdatedAt = now
	
	// Calculate base amounts
	entry.CalculateBaseAmounts()
	
	query := `
		INSERT INTO general_ledger (
			id, account_id, journal_entry_id, transaction_date, description, reference,
			debit_amount, credit_amount, balance, currency_code, exchange_rate,
			base_debit_amount, base_credit_amount, company_id, created_by, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`
	
	_, err := r.db.ExecContext(ctx, query,
		entry.ID, entry.AccountID, entry.JournalEntryID, entry.TransactionDate,
		entry.Description, entry.Reference, entry.DebitAmount, entry.CreditAmount,
		entry.Balance, entry.CurrencyCode, entry.ExchangeRate,
		entry.BaseDebitAmount, entry.BaseCreditAmount, entry.CompanyID,
		entry.CreatedBy, entry.CreatedAt, entry.UpdatedAt,
	)
	
	return err
}

// GetByID retrieves a general ledger entry by ID
func (r *generalLedgerRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.GeneralLedger, error) {
	entry := &entities.GeneralLedger{}

	query := `
		SELECT gl.id, gl.account_id, gl.journal_entry_id, gl.transaction_date, gl.description, gl.reference,
			   gl.debit_amount, gl.credit_amount, gl.balance, gl.currency_code, gl.exchange_rate,
			   gl.base_debit_amount, gl.base_credit_amount, gl.company_id, gl.created_by, gl.created_at, gl.updated_at,
			   COALESCE(coa.account_code, '') as account_code,
			   COALESCE(coa.account_name, '') as account_name,
			   COALESCE(coa.account_type, '') as account_type,
			   COALESCE(je.entry_number, '') as entry_number,
			   COALESCE(je.status, '') as entry_status,
			   COALESCE(jel.line_number, 0) as line_number
		FROM general_ledger gl
		LEFT JOIN chart_of_accounts coa ON gl.account_id = coa.id
		LEFT JOIN journal_entries je ON gl.journal_entry_id = je.id
		LEFT JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id AND jel.account_id = gl.account_id
			AND jel.debit_amount = gl.debit_amount AND jel.credit_amount = gl.credit_amount
		WHERE gl.id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&entry.ID, &entry.AccountID, &entry.JournalEntryID, &entry.TransactionDate,
		&entry.Description, &entry.Reference, &entry.DebitAmount, &entry.CreditAmount,
		&entry.Balance, &entry.CurrencyCode, &entry.ExchangeRate,
		&entry.BaseDebitAmount, &entry.BaseCreditAmount, &entry.CompanyID,
		&entry.CreatedBy, &entry.CreatedAt, &entry.UpdatedAt,
		&entry.AccountCode, &entry.AccountName, &entry.AccountType, &entry.EntryNumber, &entry.EntryStatus, &entry.LineNumber,
	)

	if err != nil {
		return nil, err
	}

	return entry, nil
}

// GetAll retrieves all general ledger entries
func (r *generalLedgerRepositoryImpl) GetAll(ctx context.Context) ([]*entities.GeneralLedger, error) {
	query := `
		SELECT gl.id, gl.account_id, gl.journal_entry_id, gl.transaction_date, gl.description, gl.reference,
			   gl.debit_amount, gl.credit_amount, gl.balance, gl.currency_code, gl.exchange_rate,
			   gl.base_debit_amount, gl.base_credit_amount, gl.company_id, gl.created_by, gl.created_at, gl.updated_at,
			   COALESCE(coa.account_code, '') as account_code,
			   COALESCE(coa.account_name, '') as account_name,
			   COALESCE(coa.account_type, '') as account_type,
			   COALESCE(je.entry_number, '') as entry_number,
			   COALESCE(je.status, '') as entry_status,
			   COALESCE(jel.line_number, 0) as line_number
		FROM general_ledger gl
		LEFT JOIN chart_of_accounts coa ON gl.account_id = coa.id
		LEFT JOIN journal_entries je ON gl.journal_entry_id = je.id
		LEFT JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id AND jel.account_id = gl.account_id
			AND jel.debit_amount = gl.debit_amount AND jel.credit_amount = gl.credit_amount
		ORDER BY gl.transaction_date DESC, gl.created_at DESC`

	return r.queryEntriesEnriched(ctx, query)
}

// Update updates a general ledger entry
func (r *generalLedgerRepositoryImpl) Update(ctx context.Context, entry *entities.GeneralLedger) error {
	entry.UpdatedAt = time.Now()
	entry.CalculateBaseAmounts()
	
	query := `
		UPDATE general_ledger SET
			account_id = $2, journal_entry_id = $3, transaction_date = $4, description = $5,
			reference = $6, debit_amount = $7, credit_amount = $8, balance = $9,
			currency_code = $10, exchange_rate = $11, base_debit_amount = $12,
			base_credit_amount = $13, updated_at = $14
		WHERE id = $1`
	
	_, err := r.db.ExecContext(ctx, query,
		entry.ID, entry.AccountID, entry.JournalEntryID, entry.TransactionDate,
		entry.Description, entry.Reference, entry.DebitAmount, entry.CreditAmount,
		entry.Balance, entry.CurrencyCode, entry.ExchangeRate,
		entry.BaseDebitAmount, entry.BaseCreditAmount, entry.UpdatedAt,
	)
	
	return err
}

// Delete deletes a general ledger entry
func (r *generalLedgerRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM general_ledger WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetByAccountID retrieves entries by account ID
func (r *generalLedgerRepositoryImpl) GetByAccountID(ctx context.Context, accountID uuid.ID) ([]*entities.GeneralLedger, error) {
	query := `
		SELECT gl.id, gl.account_id, gl.journal_entry_id, gl.transaction_date, gl.description, gl.reference,
			   gl.debit_amount, gl.credit_amount, gl.balance, gl.currency_code, gl.exchange_rate,
			   gl.base_debit_amount, gl.base_credit_amount, gl.company_id, gl.created_by, gl.created_at, gl.updated_at,
			   COALESCE(coa.account_code, '') as account_code,
			   COALESCE(coa.account_name, '') as account_name,
			   COALESCE(coa.account_type, '') as account_type,
			   COALESCE(je.entry_number, '') as entry_number,
			   COALESCE(je.status, '') as entry_status,
			   COALESCE(jel.line_number, 0) as line_number
		FROM general_ledger gl
		LEFT JOIN chart_of_accounts coa ON gl.account_id = coa.id
		LEFT JOIN journal_entries je ON gl.journal_entry_id = je.id
		LEFT JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id AND jel.account_id = gl.account_id
			AND jel.debit_amount = gl.debit_amount AND jel.credit_amount = gl.credit_amount
		WHERE gl.account_id = $1 ORDER BY gl.transaction_date, gl.created_at`

	return r.queryEntriesEnriched(ctx, query, accountID)
}

// GetByJournalEntryID retrieves entries by journal entry ID
func (r *generalLedgerRepositoryImpl) GetByJournalEntryID(ctx context.Context, journalEntryID uuid.ID) ([]*entities.GeneralLedger, error) {
	query := `
		SELECT gl.id, gl.account_id, gl.journal_entry_id, gl.transaction_date, gl.description, gl.reference,
			   gl.debit_amount, gl.credit_amount, gl.balance, gl.currency_code, gl.exchange_rate,
			   gl.base_debit_amount, gl.base_credit_amount, gl.company_id, gl.created_by, gl.created_at, gl.updated_at,
			   COALESCE(coa.account_code, '') as account_code,
			   COALESCE(coa.account_name, '') as account_name,
			   COALESCE(coa.account_type, '') as account_type,
			   COALESCE(je.entry_number, '') as entry_number,
			   COALESCE(je.status, '') as entry_status,
			   COALESCE(jel.line_number, 0) as line_number
		FROM general_ledger gl
		LEFT JOIN chart_of_accounts coa ON gl.account_id = coa.id
		LEFT JOIN journal_entries je ON gl.journal_entry_id = je.id
		LEFT JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id AND jel.account_id = gl.account_id
			AND jel.debit_amount = gl.debit_amount AND jel.credit_amount = gl.credit_amount
		WHERE gl.journal_entry_id = $1 ORDER BY gl.created_at`

	return r.queryEntriesEnriched(ctx, query, journalEntryID)
}

// GetByDateRange retrieves entries by date range
func (r *generalLedgerRepositoryImpl) GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*entities.GeneralLedger, error) {
	query := `
		SELECT gl.id, gl.account_id, gl.journal_entry_id, gl.transaction_date, gl.description, gl.reference,
			   gl.debit_amount, gl.credit_amount, gl.balance, gl.currency_code, gl.exchange_rate,
			   gl.base_debit_amount, gl.base_credit_amount, gl.company_id, gl.created_by, gl.created_at, gl.updated_at,
			   COALESCE(coa.account_code, '') as account_code,
			   COALESCE(coa.account_name, '') as account_name,
			   COALESCE(coa.account_type, '') as account_type,
			   COALESCE(je.entry_number, '') as entry_number,
			   COALESCE(je.status, '') as entry_status,
			   COALESCE(jel.line_number, 0) as line_number
		FROM general_ledger gl
		LEFT JOIN chart_of_accounts coa ON gl.account_id = coa.id
		LEFT JOIN journal_entries je ON gl.journal_entry_id = je.id
		LEFT JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id AND jel.account_id = gl.account_id
			AND jel.debit_amount = gl.debit_amount AND jel.credit_amount = gl.credit_amount
		WHERE gl.transaction_date BETWEEN $1 AND $2 ORDER BY gl.transaction_date, gl.created_at`

	return r.queryEntriesEnriched(ctx, query, startDate, endDate)
}

// GetByAccountAndDateRange retrieves entries by account and date range
func (r *generalLedgerRepositoryImpl) GetByAccountAndDateRange(ctx context.Context, accountID uuid.ID, startDate, endDate time.Time) ([]*entities.GeneralLedger, error) {
	query := `
		SELECT gl.id, gl.account_id, gl.journal_entry_id, gl.transaction_date, gl.description, gl.reference,
			   gl.debit_amount, gl.credit_amount, gl.balance, gl.currency_code, gl.exchange_rate,
			   gl.base_debit_amount, gl.base_credit_amount, gl.company_id, gl.created_by, gl.created_at, gl.updated_at,
			   COALESCE(coa.account_code, '') as account_code,
			   COALESCE(coa.account_name, '') as account_name,
			   COALESCE(coa.account_type, '') as account_type,
			   COALESCE(je.entry_number, '') as entry_number,
			   COALESCE(je.status, '') as entry_status,
			   COALESCE(jel.line_number, 0) as line_number
		FROM general_ledger gl
		LEFT JOIN chart_of_accounts coa ON gl.account_id = coa.id
		LEFT JOIN journal_entries je ON gl.journal_entry_id = je.id
		LEFT JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id AND jel.account_id = gl.account_id
			AND jel.debit_amount = gl.debit_amount AND jel.credit_amount = gl.credit_amount
		WHERE gl.account_id = $1 AND gl.transaction_date BETWEEN $2 AND $3
		ORDER BY gl.transaction_date, gl.created_at`

	return r.queryEntriesEnriched(ctx, query, accountID, startDate, endDate)
}

// GetByReference retrieves entries by reference
func (r *generalLedgerRepositoryImpl) GetByReference(ctx context.Context, reference string) ([]*entities.GeneralLedger, error) {
	query := `
		SELECT gl.id, gl.account_id, gl.journal_entry_id, gl.transaction_date, gl.description, gl.reference,
			   gl.debit_amount, gl.credit_amount, gl.balance, gl.currency_code, gl.exchange_rate,
			   gl.base_debit_amount, gl.base_credit_amount, gl.company_id, gl.created_by, gl.created_at, gl.updated_at,
			   COALESCE(coa.account_code, '') as account_code,
			   COALESCE(coa.account_name, '') as account_name,
			   COALESCE(coa.account_type, '') as account_type,
			   COALESCE(je.entry_number, '') as entry_number,
			   COALESCE(je.status, '') as entry_status,
			   COALESCE(jel.line_number, 0) as line_number
		FROM general_ledger gl
		LEFT JOIN chart_of_accounts coa ON gl.account_id = coa.id
		LEFT JOIN journal_entries je ON gl.journal_entry_id = je.id
		LEFT JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id AND jel.account_id = gl.account_id
			AND jel.debit_amount = gl.debit_amount AND jel.credit_amount = gl.credit_amount
		WHERE gl.reference = $1 ORDER BY gl.transaction_date, gl.created_at`

	return r.queryEntriesEnriched(ctx, query, reference)
}

// GetAccountBalance calculates account balance as of a specific date
func (r *generalLedgerRepositoryImpl) GetAccountBalance(ctx context.Context, accountID uuid.ID, asOfDate time.Time) (float64, error) {
	query := `
		SELECT COALESCE(SUM(debit_amount - credit_amount), 0)
		FROM general_ledger 
		WHERE account_id = $1 AND transaction_date <= $2`
	
	var balance float64
	err := r.db.QueryRowContext(ctx, query, accountID, asOfDate).Scan(&balance)
	return balance, err
}

// GetAccountBalanceRange calculates account balance for a date range
func (r *generalLedgerRepositoryImpl) GetAccountBalanceRange(ctx context.Context, accountID uuid.ID, startDate, endDate time.Time) (float64, error) {
	query := `
		SELECT COALESCE(SUM(debit_amount - credit_amount), 0)
		FROM general_ledger 
		WHERE account_id = $1 AND transaction_date BETWEEN $2 AND $3`
	
	var balance float64
	err := r.db.QueryRowContext(ctx, query, accountID, startDate, endDate).Scan(&balance)
	return balance, err
}

// GetTrialBalanceData retrieves data for trial balance
func (r *generalLedgerRepositoryImpl) GetTrialBalanceData(ctx context.Context, companyID string, asOfDate time.Time) ([]*entities.GeneralLedger, error) {
	query := `
		SELECT gl.id, gl.account_id, gl.journal_entry_id, gl.transaction_date, gl.description, gl.reference,
			   gl.debit_amount, gl.credit_amount, gl.balance, gl.currency_code, gl.exchange_rate,
			   gl.base_debit_amount, gl.base_credit_amount, gl.company_id, gl.created_by, gl.created_at, gl.updated_at,
			   COALESCE(coa.account_code, '') as account_code,
			   COALESCE(coa.account_name, '') as account_name,
			   COALESCE(coa.account_type, '') as account_type,
			   COALESCE(je.entry_number, '') as entry_number,
			   COALESCE(je.status, '') as entry_status,
			   COALESCE(jel.line_number, 0) as line_number
		FROM general_ledger gl
		LEFT JOIN chart_of_accounts coa ON gl.account_id = coa.id
		LEFT JOIN journal_entries je ON gl.journal_entry_id = je.id
		LEFT JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id AND jel.account_id = gl.account_id
			AND jel.debit_amount = gl.debit_amount AND jel.credit_amount = gl.credit_amount
		WHERE gl.company_id = $1 AND gl.transaction_date <= $2
		ORDER BY gl.account_id, gl.transaction_date`

	return r.queryEntriesEnriched(ctx, query, companyID, asOfDate)
}

// GetAccountMovements retrieves account movements for a period
func (r *generalLedgerRepositoryImpl) GetAccountMovements(ctx context.Context, accountID uuid.ID, startDate, endDate time.Time) ([]*entities.GeneralLedger, error) {
	return r.GetByAccountAndDateRange(ctx, accountID, startDate, endDate)
}

// GetByCompanyID retrieves entries by company ID
func (r *generalLedgerRepositoryImpl) GetByCompanyID(ctx context.Context, companyID string) ([]*entities.GeneralLedger, error) {
	query := `
		SELECT gl.id, gl.account_id, gl.journal_entry_id, gl.transaction_date, gl.description, gl.reference,
			   gl.debit_amount, gl.credit_amount, gl.balance, gl.currency_code, gl.exchange_rate,
			   gl.base_debit_amount, gl.base_credit_amount, gl.company_id, gl.created_by, gl.created_at, gl.updated_at,
			   COALESCE(coa.account_code, '') as account_code,
			   COALESCE(coa.account_name, '') as account_name,
			   COALESCE(coa.account_type, '') as account_type,
			   COALESCE(je.entry_number, '') as entry_number,
			   COALESCE(je.status, '') as entry_status,
			   COALESCE(jel.line_number, 0) as line_number
		FROM general_ledger gl
		LEFT JOIN chart_of_accounts coa ON gl.account_id = coa.id
		LEFT JOIN journal_entries je ON gl.journal_entry_id = je.id
		LEFT JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id AND jel.account_id = gl.account_id
			AND jel.debit_amount = gl.debit_amount AND jel.credit_amount = gl.credit_amount
		WHERE gl.company_id = $1 ORDER BY gl.transaction_date DESC, gl.created_at DESC`

	return r.queryEntriesEnriched(ctx, query, companyID)
}

// GetByCompanyAndDateRange retrieves entries by company and date range
func (r *generalLedgerRepositoryImpl) GetByCompanyAndDateRange(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.GeneralLedger, error) {
	query := `
		SELECT gl.id, gl.account_id, gl.journal_entry_id, gl.transaction_date, gl.description, gl.reference,
			   gl.debit_amount, gl.credit_amount, gl.balance, gl.currency_code, gl.exchange_rate,
			   gl.base_debit_amount, gl.base_credit_amount, gl.company_id, gl.created_by, gl.created_at, gl.updated_at,
			   COALESCE(coa.account_code, '') as account_code,
			   COALESCE(coa.account_name, '') as account_name,
			   COALESCE(coa.account_type, '') as account_type,
			   COALESCE(je.entry_number, '') as entry_number,
			   COALESCE(je.status, '') as entry_status,
			   COALESCE(jel.line_number, 0) as line_number
		FROM general_ledger gl
		LEFT JOIN chart_of_accounts coa ON gl.account_id = coa.id
		LEFT JOIN journal_entries je ON gl.journal_entry_id = je.id
		LEFT JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id AND jel.account_id = gl.account_id
			AND jel.debit_amount = gl.debit_amount AND jel.credit_amount = gl.credit_amount
		WHERE gl.company_id = $1 AND gl.transaction_date BETWEEN $2 AND $3
		ORDER BY gl.transaction_date, gl.created_at`

	return r.queryEntriesEnriched(ctx, query, companyID, startDate, endDate)
}

// CreateBatch creates multiple general ledger entries
func (r *generalLedgerRepositoryImpl) CreateBatch(ctx context.Context, entries []*entities.GeneralLedger) error {
	if len(entries) == 0 {
		return nil
	}
	
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	query := `
		INSERT INTO general_ledger (
			id, account_id, journal_entry_id, transaction_date, description, reference,
			debit_amount, credit_amount, balance, currency_code, exchange_rate,
			base_debit_amount, base_credit_amount, company_id, created_by, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`
	
	for _, entry := range entries {
		if entry.ID == uuid.Nil {
			entry.ID = uuid.New()
		}
		
		now := time.Now()
		entry.CreatedAt = now
		entry.UpdatedAt = now
		entry.CalculateBaseAmounts()
		
		_, err := tx.ExecContext(ctx, query,
			entry.ID, entry.AccountID, entry.JournalEntryID, entry.TransactionDate,
			entry.Description, entry.Reference, entry.DebitAmount, entry.CreditAmount,
			entry.Balance, entry.CurrencyCode, entry.ExchangeRate,
			entry.BaseDebitAmount, entry.BaseCreditAmount, entry.CompanyID,
			entry.CreatedBy, entry.CreatedAt, entry.UpdatedAt,
		)
		if err != nil {
			return err
		}
	}
	
	return tx.Commit()
}

// UpdateBalance updates the balance for an account
func (r *generalLedgerRepositoryImpl) UpdateBalance(ctx context.Context, accountID uuid.ID, balance float64) error {
	query := `
		UPDATE general_ledger SET balance = $2, updated_at = $3 
		WHERE account_id = $1 AND id = (
			SELECT id FROM general_ledger WHERE account_id = $1 
			ORDER BY transaction_date DESC, created_at DESC LIMIT 1
		)`
	
	_, err := r.db.ExecContext(ctx, query, accountID, balance, time.Now())
	return err
}

// RecalculateAccountBalances recalculates running balances for an account
func (r *generalLedgerRepositoryImpl) RecalculateAccountBalances(ctx context.Context, accountID uuid.ID) error {
	// Get all entries for the account in chronological order
	entries, err := r.GetByAccountID(ctx, accountID)
	if err != nil {
		return err
	}
	
	if len(entries) == 0 {
		return nil
	}
	
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	runningBalance := 0.0
	updateQuery := `UPDATE general_ledger SET balance = $2, updated_at = $3 WHERE id = $1`
	
	for _, entry := range entries {
		runningBalance += entry.DebitAmount - entry.CreditAmount
		
		_, err := tx.ExecContext(ctx, updateQuery, entry.ID, runningBalance, time.Now())
		if err != nil {
			return err
		}
	}
	
	return tx.Commit()
}

// queryEntriesEnriched is a helper method to query entries with JOINed denormalized fields
func (r *generalLedgerRepositoryImpl) queryEntriesEnriched(ctx context.Context, query string, args ...interface{}) ([]*entities.GeneralLedger, error) {
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []*entities.GeneralLedger
	for rows.Next() {
		entry := &entities.GeneralLedger{}
		err := rows.Scan(
			&entry.ID, &entry.AccountID, &entry.JournalEntryID, &entry.TransactionDate,
			&entry.Description, &entry.Reference, &entry.DebitAmount, &entry.CreditAmount,
			&entry.Balance, &entry.CurrencyCode, &entry.ExchangeRate,
			&entry.BaseDebitAmount, &entry.BaseCreditAmount, &entry.CompanyID,
			&entry.CreatedBy, &entry.CreatedAt, &entry.UpdatedAt,
			&entry.AccountCode, &entry.AccountName, &entry.AccountType, &entry.EntryNumber, &entry.EntryStatus, &entry.LineNumber,
		)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}

	return entries, rows.Err()
}