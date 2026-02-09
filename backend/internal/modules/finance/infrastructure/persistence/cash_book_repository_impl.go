package persistence

import (
	"context"
	"database/sql"
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
)

type cashBookRepositoryImpl struct {
	db *sql.DB
}

func NewCashBookRepository(db *sql.DB) repositories.CashBookRepository {
	return &cashBookRepositoryImpl{
		db: db,
	}
}

func (r *cashBookRepositoryImpl) Create(ctx context.Context, entry *entities.CashBook) error {
	if entry.ID.IsNil() {
		entry.ID = uuid.New()
	}

	query := `
		INSERT INTO cash_books (
			id, cash_bank_id, transaction_date, reference_number, description,
			debit_amount, credit_amount, balance, transaction_type, source_module,
			source_id, created_by, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`

	_, err := r.db.ExecContext(ctx, query,
		entry.ID, entry.CashBankID, entry.TransactionDate, entry.ReferenceNumber, entry.Description,
		entry.DebitAmount, entry.CreditAmount, entry.Balance, entry.TransactionType, entry.SourceModule,
		entry.SourceID, entry.CreatedBy, entry.CreatedAt, entry.UpdatedAt,
	)

	return err
}

func (r *cashBookRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.CashBook, error) {
	entry := &entities.CashBook{}
	query := `
		SELECT id, cash_bank_id, transaction_date, reference_number, description,
			   debit_amount, credit_amount, balance, transaction_type, source_module,
			   source_id, created_by, created_at, updated_at
		FROM cash_books WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&entry.ID, &entry.CashBankID, &entry.TransactionDate, &entry.ReferenceNumber, &entry.Description,
		&entry.DebitAmount, &entry.CreditAmount, &entry.Balance, &entry.TransactionType, &entry.SourceModule,
		&entry.SourceID, &entry.CreatedBy, &entry.CreatedAt, &entry.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return entry, nil
}

func (r *cashBookRepositoryImpl) GetAll(ctx context.Context) ([]*entities.CashBook, error) {
	query := `
		SELECT id, cash_bank_id, transaction_date, reference_number, description,
			   debit_amount, credit_amount, balance, transaction_type, source_module,
			   source_id, created_by, created_at, updated_at
		FROM cash_books ORDER BY transaction_date ASC, created_at ASC`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []*entities.CashBook
	for rows.Next() {
		entry := &entities.CashBook{}
		err := rows.Scan(
			&entry.ID, &entry.CashBankID, &entry.TransactionDate, &entry.ReferenceNumber, &entry.Description,
			&entry.DebitAmount, &entry.CreditAmount, &entry.Balance, &entry.TransactionType, &entry.SourceModule,
			&entry.SourceID, &entry.CreatedBy, &entry.CreatedAt, &entry.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}

	return entries, nil
}

func (r *cashBookRepositoryImpl) Update(ctx context.Context, entry *entities.CashBook) error {
	query := `
		UPDATE cash_books SET
			cash_bank_id = $2, transaction_date = $3, reference_number = $4, description = $5,
			debit_amount = $6, credit_amount = $7, balance = $8, transaction_type = $9, source_module = $10,
			source_id = $11, created_by = $12, updated_at = $13
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		entry.ID, entry.CashBankID, entry.TransactionDate, entry.ReferenceNumber, entry.Description,
		entry.DebitAmount, entry.CreditAmount, entry.Balance, entry.TransactionType, entry.SourceModule,
		entry.SourceID, entry.CreatedBy, entry.UpdatedAt,
	)

	return err
}

func (r *cashBookRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM cash_books WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *cashBookRepositoryImpl) GetByCashBankID(ctx context.Context, cashBankID uuid.ID) ([]*entities.CashBook, error) {
	query := `
		SELECT id, cash_bank_id, transaction_date, reference_number, description,
			   debit_amount, credit_amount, balance, transaction_type, source_module,
			   source_id, created_by, created_at, updated_at
		FROM cash_books WHERE cash_bank_id = $1 ORDER BY transaction_date ASC, created_at ASC`

	rows, err := r.db.QueryContext(ctx, query, cashBankID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []*entities.CashBook
	for rows.Next() {
		entry := &entities.CashBook{}
		err := rows.Scan(
			&entry.ID, &entry.CashBankID, &entry.TransactionDate, &entry.ReferenceNumber, &entry.Description,
			&entry.DebitAmount, &entry.CreditAmount, &entry.Balance, &entry.TransactionType, &entry.SourceModule,
			&entry.SourceID, &entry.CreatedBy, &entry.CreatedAt, &entry.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}

	return entries, nil
}

func (r *cashBookRepositoryImpl) GetByDateRange(ctx context.Context, cashBankID uuid.ID, startDate, endDate time.Time) ([]*entities.CashBook, error) {
	query := `
		SELECT id, cash_bank_id, transaction_date, reference_number, description,
			   debit_amount, credit_amount, balance, transaction_type, source_module,
			   source_id, created_by, created_at, updated_at
		FROM cash_books
		WHERE cash_bank_id = $1 AND transaction_date >= $2 AND transaction_date <= $3
		ORDER BY transaction_date ASC, created_at ASC`

	rows, err := r.db.QueryContext(ctx, query, cashBankID, startDate, endDate)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []*entities.CashBook
	for rows.Next() {
		entry := &entities.CashBook{}
		err := rows.Scan(
			&entry.ID, &entry.CashBankID, &entry.TransactionDate, &entry.ReferenceNumber, &entry.Description,
			&entry.DebitAmount, &entry.CreditAmount, &entry.Balance, &entry.TransactionType, &entry.SourceModule,
			&entry.SourceID, &entry.CreatedBy, &entry.CreatedAt, &entry.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}

	return entries, nil
}

func (r *cashBookRepositoryImpl) GetByTransactionType(ctx context.Context, transactionType string) ([]*entities.CashBook, error) {
	query := `
		SELECT id, cash_bank_id, transaction_date, reference_number, description,
			   debit_amount, credit_amount, balance, transaction_type, source_module,
			   source_id, created_by, created_at, updated_at
		FROM cash_books WHERE transaction_type = $1 ORDER BY transaction_date ASC, created_at ASC`

	rows, err := r.db.QueryContext(ctx, query, transactionType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []*entities.CashBook
	for rows.Next() {
		entry := &entities.CashBook{}
		err := rows.Scan(
			&entry.ID, &entry.CashBankID, &entry.TransactionDate, &entry.ReferenceNumber, &entry.Description,
			&entry.DebitAmount, &entry.CreditAmount, &entry.Balance, &entry.TransactionType, &entry.SourceModule,
			&entry.SourceID, &entry.CreatedBy, &entry.CreatedAt, &entry.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}

	return entries, nil
}

func (r *cashBookRepositoryImpl) GetByReferenceNumber(ctx context.Context, referenceNumber string) (*entities.CashBook, error) {
	entry := &entities.CashBook{}
	query := `
		SELECT id, cash_bank_id, transaction_date, reference_number, description,
			   debit_amount, credit_amount, balance, transaction_type, source_module,
			   source_id, created_by, created_at, updated_at
		FROM cash_books WHERE reference_number = $1`

	err := r.db.QueryRowContext(ctx, query, referenceNumber).Scan(
		&entry.ID, &entry.CashBankID, &entry.TransactionDate, &entry.ReferenceNumber, &entry.Description,
		&entry.DebitAmount, &entry.CreditAmount, &entry.Balance, &entry.TransactionType, &entry.SourceModule,
		&entry.SourceID, &entry.CreatedBy, &entry.CreatedAt, &entry.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return entry, nil
}
