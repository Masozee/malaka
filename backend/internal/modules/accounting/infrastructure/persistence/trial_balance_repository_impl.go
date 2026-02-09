package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"malaka/internal/shared/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
)

// TrialBalanceRepositoryImpl implements repositories.TrialBalanceRepository for PostgreSQL
type TrialBalanceRepositoryImpl struct {
	db *sql.DB
}

// NewTrialBalanceRepository creates a new TrialBalanceRepositoryImpl
func NewTrialBalanceRepository(db *sql.DB) repositories.TrialBalanceRepository {
	return &TrialBalanceRepositoryImpl{db: db}
}

// Create inserts a new trial balance into the database
func (r *TrialBalanceRepositoryImpl) Create(ctx context.Context, trialBalance *entities.TrialBalance) error {
	if err := trialBalance.Validate(); err != nil {
		return err
	}

	query := `
		INSERT INTO trial_balance (id, period_start, period_end, generated_at, 
			company_id, created_by, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	trialBalance.ID = uuid.New()
	trialBalance.GeneratedAt = time.Now()
	trialBalance.CreatedAt = time.Now()

	_, err := r.db.ExecContext(ctx, query,
		trialBalance.ID, trialBalance.PeriodStart, trialBalance.PeriodEnd,
		trialBalance.GeneratedAt, trialBalance.CompanyID, trialBalance.CreatedBy,
		trialBalance.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create trial balance: %w", err)
	}

	return nil
}

// GetByID retrieves a trial balance by its ID
func (r *TrialBalanceRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.TrialBalance, error) {
	query := `
		SELECT id, period_start, period_end, generated_at, company_id, 
			created_by, created_at
		FROM trial_balance WHERE id = $1
	`

	trialBalance := &entities.TrialBalance{}

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&trialBalance.ID, &trialBalance.PeriodStart, &trialBalance.PeriodEnd,
		&trialBalance.GeneratedAt, &trialBalance.CompanyID,
		&trialBalance.CreatedBy, &trialBalance.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("trial balance not found")
		}
		return nil, fmt.Errorf("failed to get trial balance: %w", err)
	}

	// Load account balances
	accounts, err := r.CalculateAccountBalances(ctx, trialBalance.CompanyID, trialBalance.PeriodStart, trialBalance.PeriodEnd)
	if err != nil {
		return nil, err
	}
	trialBalance.Accounts = accounts

	return trialBalance, nil
}

// GetAll retrieves all trial balances
func (r *TrialBalanceRepositoryImpl) GetAll(ctx context.Context) ([]*entities.TrialBalance, error) {
	query := `
		SELECT id, period_start, period_end, generated_at, company_id, 
			created_by, created_at
		FROM trial_balance ORDER BY generated_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get trial balances: %w", err)
	}
	defer rows.Close()

	var trialBalances []*entities.TrialBalance
	for rows.Next() {
		tb := &entities.TrialBalance{}
		err := rows.Scan(
			&tb.ID, &tb.PeriodStart, &tb.PeriodEnd,
			&tb.GeneratedAt, &tb.CompanyID,
			&tb.CreatedBy, &tb.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan trial balance: %w", err)
		}
		trialBalances = append(trialBalances, tb)
	}

	return trialBalances, nil
}

// Update updates an existing trial balance
func (r *TrialBalanceRepositoryImpl) Update(ctx context.Context, trialBalance *entities.TrialBalance) error {
	if err := trialBalance.Validate(); err != nil {
		return err
	}

	query := `
		UPDATE trial_balance SET 
			period_start = $2, period_end = $3, generated_at = $4,
			company_id = $5, created_by = $6
		WHERE id = $1
	`

	_, err := r.db.ExecContext(ctx, query,
		trialBalance.ID, trialBalance.PeriodStart, trialBalance.PeriodEnd,
		trialBalance.GeneratedAt, trialBalance.CompanyID, trialBalance.CreatedBy,
	)

	if err != nil {
		return fmt.Errorf("failed to update trial balance: %w", err)
	}

	return nil
}

// Delete removes a trial balance from the database
func (r *TrialBalanceRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM trial_balance WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete trial balance: %w", err)
	}
	return nil
}

// GetByCompanyID retrieves trial balances by company
func (r *TrialBalanceRepositoryImpl) GetByCompanyID(ctx context.Context, companyID string) ([]*entities.TrialBalance, error) {
	query := `
		SELECT id, period_start, period_end, generated_at, company_id, 
			created_by, created_at
		FROM trial_balance WHERE company_id = $1 ORDER BY generated_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID)
	if err != nil {
		return nil, fmt.Errorf("failed to get trial balances by company: %w", err)
	}
	defer rows.Close()

	var trialBalances []*entities.TrialBalance
	for rows.Next() {
		tb := &entities.TrialBalance{}
		err := rows.Scan(
			&tb.ID, &tb.PeriodStart, &tb.PeriodEnd,
			&tb.GeneratedAt, &tb.CompanyID,
			&tb.CreatedBy, &tb.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan trial balance: %w", err)
		}
		trialBalances = append(trialBalances, tb)
	}

	return trialBalances, nil
}

// GetByPeriod retrieves trial balance for a specific period
func (r *TrialBalanceRepositoryImpl) GetByPeriod(ctx context.Context, companyID string, periodStart, periodEnd time.Time) (*entities.TrialBalance, error) {
	query := `
		SELECT id, period_start, period_end, generated_at, company_id, 
			created_by, created_at
		FROM trial_balance 
		WHERE company_id = $1 AND period_start = $2 AND period_end = $3
		ORDER BY generated_at DESC LIMIT 1
	`

	trialBalance := &entities.TrialBalance{}

	err := r.db.QueryRowContext(ctx, query, companyID, periodStart, periodEnd).Scan(
		&trialBalance.ID, &trialBalance.PeriodStart, &trialBalance.PeriodEnd,
		&trialBalance.GeneratedAt, &trialBalance.CompanyID,
		&trialBalance.CreatedBy, &trialBalance.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("trial balance not found for period")
		}
		return nil, fmt.Errorf("failed to get trial balance by period: %w", err)
	}

	// Load account balances
	accounts, err := r.CalculateAccountBalances(ctx, companyID, periodStart, periodEnd)
	if err != nil {
		return nil, err
	}
	trialBalance.Accounts = accounts

	return trialBalance, nil
}

// GetLatest retrieves the latest trial balance for a company
func (r *TrialBalanceRepositoryImpl) GetLatest(ctx context.Context, companyID string) (*entities.TrialBalance, error) {
	query := `
		SELECT id, period_start, period_end, generated_at, company_id, 
			created_by, created_at
		FROM trial_balance 
		WHERE company_id = $1 
		ORDER BY generated_at DESC LIMIT 1
	`

	trialBalance := &entities.TrialBalance{}

	err := r.db.QueryRowContext(ctx, query, companyID).Scan(
		&trialBalance.ID, &trialBalance.PeriodStart, &trialBalance.PeriodEnd,
		&trialBalance.GeneratedAt, &trialBalance.CompanyID,
		&trialBalance.CreatedBy, &trialBalance.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("no trial balance found for company")
		}
		return nil, fmt.Errorf("failed to get latest trial balance: %w", err)
	}

	// Load account balances
	accounts, err := r.CalculateAccountBalances(ctx, companyID, trialBalance.PeriodStart, trialBalance.PeriodEnd)
	if err != nil {
		return nil, err
	}
	trialBalance.Accounts = accounts

	return trialBalance, nil
}

// GetByDateRange retrieves trial balances within a date range
func (r *TrialBalanceRepositoryImpl) GetByDateRange(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.TrialBalance, error) {
	query := `
		SELECT id, period_start, period_end, generated_at, company_id, 
			created_by, created_at
		FROM trial_balance 
		WHERE company_id = $1 AND generated_at >= $2 AND generated_at <= $3
		ORDER BY generated_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get trial balances by date range: %w", err)
	}
	defer rows.Close()

	var trialBalances []*entities.TrialBalance
	for rows.Next() {
		tb := &entities.TrialBalance{}
		err := rows.Scan(
			&tb.ID, &tb.PeriodStart, &tb.PeriodEnd,
			&tb.GeneratedAt, &tb.CompanyID,
			&tb.CreatedBy, &tb.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan trial balance: %w", err)
		}
		trialBalances = append(trialBalances, tb)
	}

	return trialBalances, nil
}

// GenerateTrialBalance generates a new trial balance for a period
func (r *TrialBalanceRepositoryImpl) GenerateTrialBalance(ctx context.Context, companyID string, periodStart, periodEnd time.Time) (*entities.TrialBalance, error) {
	// Calculate account balances
	accounts, err := r.CalculateAccountBalances(ctx, companyID, periodStart, periodEnd)
	if err != nil {
		return nil, err
	}

	// Create trial balance
	trialBalance := &entities.TrialBalance{
		PeriodStart: periodStart,
		PeriodEnd:   periodEnd,
		CompanyID:   companyID,
		CreatedBy:   "system", // This should come from context in a real implementation
		Accounts:    accounts,
	}

	// Save to database
	if err := r.Create(ctx, trialBalance); err != nil {
		return nil, err
	}

	return trialBalance, nil
}

// CalculateAccountBalances calculates account balances for trial balance
func (r *TrialBalanceRepositoryImpl) CalculateAccountBalances(ctx context.Context, companyID string, periodStart, periodEnd time.Time) ([]entities.TrialBalanceAccount, error) {
	query := `
		WITH account_balances AS (
			SELECT 
				coa.id as account_id,
				coa.account_code,
				coa.account_name,
				coa.account_type,
				-- Opening balance (transactions before period start)
				COALESCE(SUM(CASE 
					WHEN gl.transaction_date < $2 THEN gl.debit_amount - gl.credit_amount 
					ELSE 0 
				END), 0) as opening_balance,
				-- Period debits
				COALESCE(SUM(CASE 
					WHEN gl.transaction_date >= $2 AND gl.transaction_date <= $3 THEN gl.debit_amount 
					ELSE 0 
				END), 0) as debit_total,
				-- Period credits
				COALESCE(SUM(CASE 
					WHEN gl.transaction_date >= $2 AND gl.transaction_date <= $3 THEN gl.credit_amount 
					ELSE 0 
				END), 0) as credit_total,
				-- Base currency amounts
				COALESCE(SUM(CASE 
					WHEN gl.transaction_date < $2 THEN gl.base_debit_amount - gl.base_credit_amount 
					ELSE 0 
				END), 0) as base_opening_balance,
				COALESCE(SUM(CASE 
					WHEN gl.transaction_date >= $2 AND gl.transaction_date <= $3 THEN gl.base_debit_amount 
					ELSE 0 
				END), 0) as base_debit_total,
				COALESCE(SUM(CASE 
					WHEN gl.transaction_date >= $2 AND gl.transaction_date <= $3 THEN gl.base_credit_amount 
					ELSE 0 
				END), 0) as base_credit_total
			FROM chart_of_accounts coa
			LEFT JOIN general_ledger gl ON coa.id = gl.account_id AND gl.company_id = $1
			WHERE coa.is_active = true
			GROUP BY coa.id, coa.account_code, coa.account_name, coa.account_type
			ORDER BY coa.account_code
		)
		SELECT 
			account_id, account_code, account_name, account_type,
			opening_balance, debit_total, credit_total,
			base_opening_balance, base_debit_total, base_credit_total
		FROM account_balances
		WHERE opening_balance != 0 OR debit_total != 0 OR credit_total != 0
	`

	rows, err := r.db.QueryContext(ctx, query, companyID, periodStart, periodEnd)
	if err != nil {
		return nil, fmt.Errorf("failed to calculate account balances: %w", err)
	}
	defer rows.Close()

	var accounts []entities.TrialBalanceAccount
	for rows.Next() {
		account := entities.TrialBalanceAccount{}
		err := rows.Scan(
			&account.AccountID, &account.AccountCode, &account.AccountName, &account.AccountType,
			&account.OpeningBalance, &account.DebitTotal, &account.CreditTotal,
			&account.BaseOpeningBalance, &account.BaseDebitTotal, &account.BaseCreditTotal,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan account balance: %w", err)
		}

		// Calculate closing balance
		account.CalculateClosingBalance()
		accounts = append(accounts, account)
	}

	return accounts, nil
}

// GetAccountBalance retrieves balance for a specific account
func (r *TrialBalanceRepositoryImpl) GetAccountBalance(ctx context.Context, companyID string, accountID uuid.ID, asOfDate time.Time) (*entities.TrialBalanceAccount, error) {
	query := `
		SELECT 
			coa.id as account_id,
			coa.account_code,
			coa.account_name,
			coa.account_type,
			COALESCE(SUM(gl.debit_amount - gl.credit_amount), 0) as balance,
			COALESCE(SUM(gl.base_debit_amount - gl.base_credit_amount), 0) as base_balance
		FROM chart_of_accounts coa
		LEFT JOIN general_ledger gl ON coa.id = gl.account_id 
			AND gl.company_id = $1 AND gl.transaction_date <= $3
		WHERE coa.id = $2
		GROUP BY coa.id, coa.account_code, coa.account_name, coa.account_type
	`

	account := &entities.TrialBalanceAccount{}
	var balance, baseBalance float64

	err := r.db.QueryRowContext(ctx, query, companyID, accountID, asOfDate).Scan(
		&account.AccountID, &account.AccountCode, &account.AccountName, &account.AccountType,
		&balance, &baseBalance,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("account not found")
		}
		return nil, fmt.Errorf("failed to get account balance: %w", err)
	}

	account.ClosingBalance = balance
	account.BaseClosingBalance = baseBalance

	return account, nil
}

// GetAccountsByType retrieves accounts by type with balances
func (r *TrialBalanceRepositoryImpl) GetAccountsByType(ctx context.Context, companyID string, accountType string, asOfDate time.Time) ([]entities.TrialBalanceAccount, error) {
	query := `
		SELECT 
			coa.id as account_id,
			coa.account_code,
			coa.account_name,
			coa.account_type,
			COALESCE(SUM(gl.debit_amount - gl.credit_amount), 0) as balance,
			COALESCE(SUM(gl.base_debit_amount - gl.base_credit_amount), 0) as base_balance
		FROM chart_of_accounts coa
		LEFT JOIN general_ledger gl ON coa.id = gl.account_id 
			AND gl.company_id = $1 AND gl.transaction_date <= $3
		WHERE coa.account_type = $2 AND coa.is_active = true
		GROUP BY coa.id, coa.account_code, coa.account_name, coa.account_type
		ORDER BY coa.account_code
	`

	rows, err := r.db.QueryContext(ctx, query, companyID, accountType, asOfDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get accounts by type: %w", err)
	}
	defer rows.Close()

	var accounts []entities.TrialBalanceAccount
	for rows.Next() {
		account := entities.TrialBalanceAccount{}
		var balance, baseBalance float64

		err := rows.Scan(
			&account.AccountID, &account.AccountCode, &account.AccountName, &account.AccountType,
			&balance, &baseBalance,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan account: %w", err)
		}

		account.ClosingBalance = balance
		account.BaseClosingBalance = baseBalance
		accounts = append(accounts, account)
	}

	return accounts, nil
}

// GetTrialBalanceSummary retrieves trial balance summary
func (r *TrialBalanceRepositoryImpl) GetTrialBalanceSummary(ctx context.Context, companyID string, asOfDate time.Time) (*entities.TrialBalanceSummary, error) {
	// Calculate account balances for the period
	periodStart := time.Date(asOfDate.Year(), asOfDate.Month(), 1, 0, 0, 0, 0, asOfDate.Location())
	accounts, err := r.CalculateAccountBalances(ctx, companyID, periodStart, asOfDate)
	if err != nil {
		return nil, err
	}

	// Create a temporary trial balance to calculate summary
	tb := &entities.TrialBalance{
		Accounts: accounts,
	}

	summary := tb.CalculateSummary()
	return &summary, nil
}

// ValidateTrialBalance validates that a trial balance is balanced
func (r *TrialBalanceRepositoryImpl) ValidateTrialBalance(ctx context.Context, trialBalanceID uuid.ID) (bool, error) {
	trialBalance, err := r.GetByID(ctx, trialBalanceID)
	if err != nil {
		return false, err
	}

	return trialBalance.IsValid(), nil
}

// GetHistoricalTrialBalances retrieves historical trial balances
func (r *TrialBalanceRepositoryImpl) GetHistoricalTrialBalances(ctx context.Context, companyID string, fromDate, toDate time.Time) ([]*entities.TrialBalance, error) {
	query := `
		SELECT id, period_start, period_end, generated_at, company_id, 
			created_by, created_at
		FROM trial_balance 
		WHERE company_id = $1 AND period_start >= $2 AND period_end <= $3
		ORDER BY period_start ASC
	`

	rows, err := r.db.QueryContext(ctx, query, companyID, fromDate, toDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get historical trial balances: %w", err)
	}
	defer rows.Close()

	var trialBalances []*entities.TrialBalance
	for rows.Next() {
		tb := &entities.TrialBalance{}
		err := rows.Scan(
			&tb.ID, &tb.PeriodStart, &tb.PeriodEnd,
			&tb.GeneratedAt, &tb.CompanyID,
			&tb.CreatedBy, &tb.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan trial balance: %w", err)
		}

		// Load account balances
		accounts, err := r.CalculateAccountBalances(ctx, companyID, tb.PeriodStart, tb.PeriodEnd)
		if err != nil {
			continue // Skip failed calculations
		}
		tb.Accounts = accounts

		trialBalances = append(trialBalances, tb)
	}

	return trialBalances, nil
}

// GetMonthEndTrialBalances retrieves month-end trial balances for a year
func (r *TrialBalanceRepositoryImpl) GetMonthEndTrialBalances(ctx context.Context, companyID string, year int) ([]*entities.TrialBalance, error) {
	startDate := time.Date(year, 1, 1, 0, 0, 0, 0, time.UTC)
	// endDate is calculated dynamically for each month below

	// Get trial balances for each month end
	var trialBalances []*entities.TrialBalance

	for month := 1; month <= 12; month++ {
		monthEnd := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC).AddDate(0, 1, -1)
		
		// Generate trial balance for month end
		tb, err := r.GenerateTrialBalance(ctx, companyID, startDate, monthEnd)
		if err != nil {
			continue // Skip failed months
		}
		
		trialBalances = append(trialBalances, tb)
	}

	return trialBalances, nil
}

// CompareTrialBalances compares trial balances between two periods
func (r *TrialBalanceRepositoryImpl) CompareTrialBalances(ctx context.Context, companyID string, fromPeriod, toPeriod time.Time) ([]entities.TrialBalanceAccount, error) {
	// Get accounts for both periods
	fromAccounts, err := r.CalculateAccountBalances(ctx, companyID, fromPeriod.AddDate(0, -1, 0), fromPeriod)
	if err != nil {
		return nil, err
	}

	toAccounts, err := r.CalculateAccountBalances(ctx, companyID, toPeriod.AddDate(0, -1, 0), toPeriod)
	if err != nil {
		return nil, err
	}

	// Create map for quick lookup
	fromAccountMap := make(map[uuid.ID]entities.TrialBalanceAccount)
	for _, account := range fromAccounts {
		fromAccountMap[account.AccountID] = account
	}

	// Create comparison accounts
	var comparisonAccounts []entities.TrialBalanceAccount
	for _, toAccount := range toAccounts {
		fromAccount, exists := fromAccountMap[toAccount.AccountID]
		
		comparison := entities.TrialBalanceAccount{
			AccountID:          toAccount.AccountID,
			AccountCode:        toAccount.AccountCode,
			AccountName:        toAccount.AccountName,
			AccountType:        toAccount.AccountType,
			ClosingBalance:     toAccount.ClosingBalance,
			BaseClosingBalance: toAccount.BaseClosingBalance,
		}

		if exists {
			// Calculate variance
			comparison.OpeningBalance = toAccount.ClosingBalance - fromAccount.ClosingBalance
			comparison.BaseOpeningBalance = toAccount.BaseClosingBalance - fromAccount.BaseClosingBalance
		} else {
			// New account
			comparison.OpeningBalance = toAccount.ClosingBalance
			comparison.BaseOpeningBalance = toAccount.BaseClosingBalance
		}

		comparisonAccounts = append(comparisonAccounts, comparison)
	}

	return comparisonAccounts, nil
}