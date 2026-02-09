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

// PostgresChartOfAccountRepository implements repositories.ChartOfAccountRepository for PostgreSQL.
type PostgresChartOfAccountRepository struct {
	db *sql.DB
}

// NewPostgresChartOfAccountRepository creates a new PostgresChartOfAccountRepository.
func NewPostgresChartOfAccountRepository(db *sql.DB) repositories.ChartOfAccountRepository {
	return &PostgresChartOfAccountRepository{db: db}
}

// Create inserts a new ChartOfAccount into the database.
func (r *PostgresChartOfAccountRepository) Create(ctx context.Context, coa *entities.ChartOfAccount) error {
	query := `
		INSERT INTO chart_of_accounts (id, parent_id, account_code, account_name, account_type, normal_balance, description, is_active, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	coa.ID = uuid.New()
	coa.CreatedAt = time.Now()
	coa.UpdatedAt = time.Now()

	_, err := r.db.ExecContext(ctx, query,
		coa.ID,
		coa.ParentID,
		coa.AccountCode,
		coa.AccountName,
		coa.AccountType,
		coa.NormalBalance,
		coa.Description,
		coa.IsActive,
		coa.CreatedAt,
		coa.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create chart of account: %w", err)
	}
	return nil
}

// GetByID retrieves a ChartOfAccount by its ID.
func (r *PostgresChartOfAccountRepository) GetByID(ctx context.Context, id uuid.ID) (*entities.ChartOfAccount, error) {
	query := `
		SELECT id, parent_id, account_code, account_name, account_type, normal_balance, description, is_active, created_at, updated_at
		FROM chart_of_accounts
		WHERE id = $1
	`
	row := r.db.QueryRowContext(ctx, query, id)
	coa := &entities.ChartOfAccount{}
	var parentID sql.NullString // Use sql.NullString for nullable UUID
	err := row.Scan(
		&coa.ID,
		&parentID,
		&coa.AccountCode,
		&coa.AccountName,
		&coa.AccountType,
		&coa.NormalBalance,
		&coa.Description,
		&coa.IsActive,
		&coa.CreatedAt,
		&coa.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Not found
		}
		return nil, fmt.Errorf("failed to get chart of account by ID: %w", err)
	}

	if parentID.Valid {
		parsedParentID, err := uuid.Parse(parentID.String)
		if err != nil {
			return nil, fmt.Errorf("failed to parse parent_id: %w", err)
		}
		coa.ParentID = &parsedParentID
	} else {
		coa.ParentID = nil
	}

	return coa, nil
}

// GetByCode retrieves a ChartOfAccount by its account code.
func (r *PostgresChartOfAccountRepository) GetByCode(ctx context.Context, code string) (*entities.ChartOfAccount, error) {
	query := `
		SELECT id, parent_id, account_code, account_name, account_type, normal_balance, description, is_active, created_at, updated_at
		FROM chart_of_accounts
		WHERE account_code = $1
	`
	row := r.db.QueryRowContext(ctx, query, code)
	coa := &entities.ChartOfAccount{}
	var parentID sql.NullString
	err := row.Scan(
		&coa.ID,
		&parentID,
		&coa.AccountCode,
		&coa.AccountName,
		&coa.AccountType,
		&coa.NormalBalance,
		&coa.Description,
		&coa.IsActive,
		&coa.CreatedAt,
		&coa.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Not found
		}
		return nil, fmt.Errorf("failed to get chart of account by code: %w", err)
	}

	if parentID.Valid {
		parsedParentID, err := uuid.Parse(parentID.String)
		if err != nil {
			return nil, fmt.Errorf("failed to parse parent_id: %w", err)
		}
		coa.ParentID = &parsedParentID
	} else {
		coa.ParentID = nil
	}

	return coa, nil
}

// GetAll retrieves all ChartOfAccounts from the database.
func (r *PostgresChartOfAccountRepository) GetAll(ctx context.Context) ([]*entities.ChartOfAccount, error) {
	query := `
		SELECT id, parent_id, account_code, account_name, account_type, normal_balance, description, is_active, created_at, updated_at
		FROM chart_of_accounts
		ORDER BY account_code
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get all chart of accounts: %w", err)
	}
	defer rows.Close()

	var coas []*entities.ChartOfAccount
	for rows.Next() {
		coa := &entities.ChartOfAccount{}
		var parentID sql.NullString
		err := rows.Scan(
			&coa.ID,
			&parentID,
			&coa.AccountCode,
			&coa.AccountName,
			&coa.AccountType,
			&coa.NormalBalance,
			&coa.Description,
			&coa.IsActive,
			&coa.CreatedAt,
			&coa.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan chart of account row: %w", err)
		}

		if parentID.Valid {
			parsedParentID, err := uuid.Parse(parentID.String)
			if err != nil {
				return nil, fmt.Errorf("failed to parse parent_id: %w", err)
			}
			coa.ParentID = &parsedParentID
		} else {
			coa.ParentID = nil
		}
		coas = append(coas, coa)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating chart of account rows: %w", err)
	}

	return coas, nil
}

// Update updates an existing ChartOfAccount in the database.
func (r *PostgresChartOfAccountRepository) Update(ctx context.Context, coa *entities.ChartOfAccount) error {
	query := `
		UPDATE chart_of_accounts
		SET parent_id = $2, account_code = $3, account_name = $4, account_type = $5, normal_balance = $6, description = $7, is_active = $8, updated_at = $9
		WHERE id = $1
	`
	coa.UpdatedAt = time.Now()

	_, err := r.db.ExecContext(ctx, query,
		coa.ID,
		coa.ParentID,
		coa.AccountCode,
		coa.AccountName,
		coa.AccountType,
		coa.NormalBalance,
		coa.Description,
		coa.IsActive,
		coa.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to update chart of account: %w", err)
	}
	return nil
}

// Delete deletes a ChartOfAccount from the database by its ID.
func (r *PostgresChartOfAccountRepository) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM chart_of_accounts WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete chart of account: %w", err)
	}
	return nil
}
