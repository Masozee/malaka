package persistence

import (
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/utils"
)

// CashOpeningBalanceRepositoryImpl implements the CashOpeningBalanceRepository interface.
type CashOpeningBalanceRepositoryImpl struct {
	db *sqlx.DB
}

// NewCashOpeningBalanceRepositoryImpl creates a new instance of CashOpeningBalanceRepositoryImpl.
func NewCashOpeningBalanceRepositoryImpl(db *sqlx.DB) repositories.CashOpeningBalanceRepository {
	return &CashOpeningBalanceRepositoryImpl{db: db}
}

// Create inserts a new cash opening balance into the database.
func (r *CashOpeningBalanceRepositoryImpl) Create(ctx context.Context, balance *entities.CashOpeningBalance) error {
	if balance.ID == "" {
		balance.ID = utils.RandomString(10)
	}

	query := `
		INSERT INTO cash_opening_balances (id, cash_bank_id, opening_date, opening_balance, currency, description, fiscal_year, is_active, created_at, updated_at)
		VALUES (:id, :cash_bank_id, :opening_date, :opening_balance, :currency, :description, :fiscal_year, :is_active, NOW(), NOW())
	`
	_, err := r.db.NamedExecContext(ctx, query, balance)
	return err
}

// GetByID retrieves a cash opening balance by its ID.
func (r *CashOpeningBalanceRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.CashOpeningBalance, error) {
	var balance entities.CashOpeningBalance
	query := "SELECT * FROM cash_opening_balances WHERE id = $1"
	err := r.db.GetContext(ctx, &balance, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &balance, err
}

// GetAll retrieves all cash opening balances.
func (r *CashOpeningBalanceRepositoryImpl) GetAll(ctx context.Context) ([]*entities.CashOpeningBalance, error) {
	var balances []*entities.CashOpeningBalance
	query := "SELECT * FROM cash_opening_balances ORDER BY opening_date DESC"
	err := r.db.SelectContext(ctx, &balances, query)
	return balances, err
}

// GetByCashBankID retrieves cash opening balances by cash bank ID.
func (r *CashOpeningBalanceRepositoryImpl) GetByCashBankID(ctx context.Context, cashBankID string) ([]*entities.CashOpeningBalance, error) {
	var balances []*entities.CashOpeningBalance
	query := "SELECT * FROM cash_opening_balances WHERE cash_bank_id = $1 ORDER BY opening_date DESC"
	err := r.db.SelectContext(ctx, &balances, query, cashBankID)
	return balances, err
}

// GetByFiscalYear retrieves cash opening balances by fiscal year.
func (r *CashOpeningBalanceRepositoryImpl) GetByFiscalYear(ctx context.Context, fiscalYear int) ([]*entities.CashOpeningBalance, error) {
	var balances []*entities.CashOpeningBalance
	query := "SELECT * FROM cash_opening_balances WHERE fiscal_year = $1 ORDER BY opening_date DESC"
	err := r.db.SelectContext(ctx, &balances, query, fiscalYear)
	return balances, err
}

// Update updates an existing cash opening balance.
func (r *CashOpeningBalanceRepositoryImpl) Update(ctx context.Context, balance *entities.CashOpeningBalance) error {
	query := `
		UPDATE cash_opening_balances 
		SET cash_bank_id = :cash_bank_id, opening_date = :opening_date, opening_balance = :opening_balance,
		    currency = :currency, description = :description, fiscal_year = :fiscal_year, 
		    is_active = :is_active, updated_at = NOW()
		WHERE id = :id
	`
	_, err := r.db.NamedExecContext(ctx, query, balance)
	return err
}

// Delete deletes a cash opening balance by its ID.
func (r *CashOpeningBalanceRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := "DELETE FROM cash_opening_balances WHERE id = $1"
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}