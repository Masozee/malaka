package persistence

import (
	"context"
	"database/sql"

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
			id, book_code, book_name, book_type, account_number, bank_name,
			opening_balance, current_balance, is_active, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`

	_, err := r.db.ExecContext(ctx, query,
		entry.ID, entry.BookCode, entry.BookName, entry.BookType, entry.AccountNumber, entry.BankName,
		entry.OpeningBalance, entry.CurrentBalance, entry.IsActive, entry.CreatedAt, entry.UpdatedAt,
	)

	return err
}

func (r *cashBookRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.CashBook, error) {
	entry := &entities.CashBook{}
	query := `
		SELECT id, book_code, book_name, book_type, COALESCE(account_number, ''), COALESCE(bank_name, ''),
			   COALESCE(opening_balance, 0), COALESCE(current_balance, 0), COALESCE(is_active, true), created_at, updated_at
		FROM cash_books WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&entry.ID, &entry.BookCode, &entry.BookName, &entry.BookType, &entry.AccountNumber, &entry.BankName,
		&entry.OpeningBalance, &entry.CurrentBalance, &entry.IsActive, &entry.CreatedAt, &entry.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return entry, nil
}

func (r *cashBookRepositoryImpl) GetAll(ctx context.Context) ([]*entities.CashBook, error) {
	query := `
		SELECT id, book_code, book_name, book_type, COALESCE(account_number, ''), COALESCE(bank_name, ''),
			   COALESCE(opening_balance, 0), COALESCE(current_balance, 0), COALESCE(is_active, true), created_at, updated_at
		FROM cash_books ORDER BY book_code ASC LIMIT 500`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []*entities.CashBook
	for rows.Next() {
		entry := &entities.CashBook{}
		err := rows.Scan(
			&entry.ID, &entry.BookCode, &entry.BookName, &entry.BookType, &entry.AccountNumber, &entry.BankName,
			&entry.OpeningBalance, &entry.CurrentBalance, &entry.IsActive, &entry.CreatedAt, &entry.UpdatedAt,
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
			book_code = $2, book_name = $3, book_type = $4, account_number = $5, bank_name = $6,
			opening_balance = $7, current_balance = $8, is_active = $9, updated_at = $10
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		entry.ID, entry.BookCode, entry.BookName, entry.BookType, entry.AccountNumber, entry.BankName,
		entry.OpeningBalance, entry.CurrentBalance, entry.IsActive, entry.UpdatedAt,
	)

	return err
}

func (r *cashBookRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM cash_books WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *cashBookRepositoryImpl) GetByBookCode(ctx context.Context, bookCode string) (*entities.CashBook, error) {
	entry := &entities.CashBook{}
	query := `
		SELECT id, book_code, book_name, book_type, COALESCE(account_number, ''), COALESCE(bank_name, ''),
			   COALESCE(opening_balance, 0), COALESCE(current_balance, 0), COALESCE(is_active, true), created_at, updated_at
		FROM cash_books WHERE book_code = $1`

	err := r.db.QueryRowContext(ctx, query, bookCode).Scan(
		&entry.ID, &entry.BookCode, &entry.BookName, &entry.BookType, &entry.AccountNumber, &entry.BankName,
		&entry.OpeningBalance, &entry.CurrentBalance, &entry.IsActive, &entry.CreatedAt, &entry.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return entry, nil
}

func (r *cashBookRepositoryImpl) GetByBookType(ctx context.Context, bookType string) ([]*entities.CashBook, error) {
	query := `
		SELECT id, book_code, book_name, book_type, COALESCE(account_number, ''), COALESCE(bank_name, ''),
			   COALESCE(opening_balance, 0), COALESCE(current_balance, 0), COALESCE(is_active, true), created_at, updated_at
		FROM cash_books WHERE book_type = $1 ORDER BY book_code ASC`

	rows, err := r.db.QueryContext(ctx, query, bookType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []*entities.CashBook
	for rows.Next() {
		entry := &entities.CashBook{}
		err := rows.Scan(
			&entry.ID, &entry.BookCode, &entry.BookName, &entry.BookType, &entry.AccountNumber, &entry.BankName,
			&entry.OpeningBalance, &entry.CurrentBalance, &entry.IsActive, &entry.CreatedAt, &entry.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}

	return entries, nil
}
