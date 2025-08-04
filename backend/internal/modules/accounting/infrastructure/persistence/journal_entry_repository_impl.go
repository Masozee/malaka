package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
)

type journalEntryRepositoryImpl struct {
	db *sql.DB
}

// NewJournalEntryRepository creates a new journal entry repository
func NewJournalEntryRepository(db *sql.DB) repositories.JournalEntryRepository {
	return &journalEntryRepositoryImpl{db: db}
}

// Create creates a new journal entry
func (r *journalEntryRepositoryImpl) Create(ctx context.Context, entry *entities.JournalEntry) error {
	if entry.ID == uuid.Nil {
		entry.ID = uuid.New()
	}
	
	now := time.Now()
	entry.CreatedAt = now
	entry.UpdatedAt = now
	
	// Calculate totals
	entry.CalculateTotals()
	
	query := `
		INSERT INTO journal_entries (
			id, entry_number, entry_date, description, reference, status,
			total_debit, total_credit, currency_code, exchange_rate,
			base_total_debit, base_total_credit, source_module, source_id,
			company_id, created_by, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`
	
	_, err := r.db.ExecContext(ctx, query,
		entry.ID, entry.EntryNumber, entry.EntryDate, entry.Description, entry.Reference,
		entry.Status, entry.TotalDebit, entry.TotalCredit, entry.CurrencyCode,
		entry.ExchangeRate, entry.BaseTotalDebit, entry.BaseTotalCredit,
		entry.SourceModule, entry.SourceID, entry.CompanyID, entry.CreatedBy,
		entry.CreatedAt, entry.UpdatedAt,
	)
	
	return err
}

// GetByID retrieves a journal entry by ID
func (r *journalEntryRepositoryImpl) GetByID(ctx context.Context, id uuid.UUID) (*entities.JournalEntry, error) {
	entry := &entities.JournalEntry{}
	
	query := `
		SELECT id, entry_number, entry_date, description, reference, status,
			   total_debit, total_credit, currency_code, exchange_rate,
			   base_total_debit, base_total_credit, source_module, source_id,
			   posted_by, posted_at, reversed_by, reversed_at,
			   company_id, created_by, created_at, updated_at
		FROM journal_entries WHERE id = $1`
	
	var postedBy, reversedBy sql.NullString
	var reference, sourceModule, sourceID sql.NullString
	
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&entry.ID, &entry.EntryNumber, &entry.EntryDate, &entry.Description,
		&reference, &entry.Status, &entry.TotalDebit, &entry.TotalCredit,
		&entry.CurrencyCode, &entry.ExchangeRate, &entry.BaseTotalDebit,
		&entry.BaseTotalCredit, &sourceModule, &sourceID,
		&postedBy, &entry.PostedAt, &reversedBy, &entry.ReversedAt,
		&entry.CompanyID, &entry.CreatedBy, &entry.CreatedAt, &entry.UpdatedAt,
	)
	
	if err == nil {
		entry.Reference = reference.String
		entry.SourceModule = sourceModule.String
		entry.SourceID = sourceID.String
		entry.PostedBy = postedBy.String
		entry.ReversedBy = reversedBy.String
	}
	
	if err != nil {
		return nil, err
	}
	
	// Load journal entry lines
	lines, err := r.GetLinesByEntryID(ctx, entry.ID)
	if err != nil {
		return nil, err
	}
	entry.Lines = lines
	
	return entry, nil
}

// GetAll retrieves all journal entries
func (r *journalEntryRepositoryImpl) GetAll(ctx context.Context) ([]*entities.JournalEntry, error) {
	query := `
		SELECT id, entry_number, entry_date, description, reference, status,
			   total_debit, total_credit, currency_code, exchange_rate,
			   base_total_debit, base_total_credit, source_module, source_id,
			   posted_by, posted_at, reversed_by, reversed_at,
			   company_id, created_by, created_at, updated_at
		FROM journal_entries ORDER BY entry_date DESC, created_at DESC`
	
	return r.queryEntries(ctx, query)
}

// Update updates a journal entry
func (r *journalEntryRepositoryImpl) Update(ctx context.Context, entry *entities.JournalEntry) error {
	entry.UpdatedAt = time.Now()
	entry.CalculateTotals()
	
	query := `
		UPDATE journal_entries SET
			entry_number = $2, entry_date = $3, description = $4, reference = $5,
			status = $6, total_debit = $7, total_credit = $8, currency_code = $9,
			exchange_rate = $10, base_total_debit = $11, base_total_credit = $12,
			source_module = $13, source_id = $14, posted_by = $15, posted_at = $16,
			reversed_by = $17, reversed_at = $18, updated_at = $19
		WHERE id = $1`
	
	_, err := r.db.ExecContext(ctx, query,
		entry.ID, entry.EntryNumber, entry.EntryDate, entry.Description,
		entry.Reference, entry.Status, entry.TotalDebit, entry.TotalCredit,
		entry.CurrencyCode, entry.ExchangeRate, entry.BaseTotalDebit,
		entry.BaseTotalCredit, entry.SourceModule, entry.SourceID,
		entry.PostedBy, entry.PostedAt, entry.ReversedBy, entry.ReversedAt,
		entry.UpdatedAt,
	)
	
	return err
}

// Delete deletes a journal entry
func (r *journalEntryRepositoryImpl) Delete(ctx context.Context, id uuid.UUID) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	// Delete journal entry lines first
	_, err = tx.ExecContext(ctx, `DELETE FROM journal_entry_lines WHERE journal_entry_id = $1`, id)
	if err != nil {
		return err
	}
	
	// Delete journal entry
	_, err = tx.ExecContext(ctx, `DELETE FROM journal_entries WHERE id = $1`, id)
	if err != nil {
		return err
	}
	
	return tx.Commit()
}

// CreateLine creates a journal entry line
func (r *journalEntryRepositoryImpl) CreateLine(ctx context.Context, line *entities.JournalEntryLine) error {
	if line.ID == uuid.Nil {
		line.ID = uuid.New()
	}
	
	now := time.Now()
	line.CreatedAt = now
	line.UpdatedAt = now
	
	query := `
		INSERT INTO journal_entry_lines (
			id, journal_entry_id, line_number, account_id, description,
			debit_amount, credit_amount, base_debit_amount, base_credit_amount,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
	
	_, err := r.db.ExecContext(ctx, query,
		line.ID, line.JournalEntryID, line.LineNumber, line.AccountID,
		line.Description, line.DebitAmount, line.CreditAmount,
		line.BaseDebitAmount, line.BaseCreditAmount, line.CreatedAt, line.UpdatedAt,
	)
	
	return err
}

// GetLinesByEntryID retrieves journal entry lines by entry ID
func (r *journalEntryRepositoryImpl) GetLinesByEntryID(ctx context.Context, entryID uuid.UUID) ([]*entities.JournalEntryLine, error) {
	query := `
		SELECT id, journal_entry_id, line_number, account_id, description,
			   debit_amount, credit_amount, base_debit_amount, base_credit_amount,
			   created_at, updated_at
		FROM journal_entry_lines WHERE journal_entry_id = $1 ORDER BY line_number`
	
	rows, err := r.db.QueryContext(ctx, query, entryID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var lines []*entities.JournalEntryLine
	for rows.Next() {
		line := &entities.JournalEntryLine{}
		err := rows.Scan(
			&line.ID, &line.JournalEntryID, &line.LineNumber, &line.AccountID,
			&line.Description, &line.DebitAmount, &line.CreditAmount,
			&line.BaseDebitAmount, &line.BaseCreditAmount, &line.CreatedAt, &line.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		lines = append(lines, line)
	}
	
	return lines, rows.Err()
}

// UpdateLine updates a journal entry line
func (r *journalEntryRepositoryImpl) UpdateLine(ctx context.Context, line *entities.JournalEntryLine) error {
	line.UpdatedAt = time.Now()
	
	query := `
		UPDATE journal_entry_lines SET
			line_number = $3, account_id = $4, description = $5,
			debit_amount = $6, credit_amount = $7, base_debit_amount = $8,
			base_credit_amount = $9, updated_at = $10
		WHERE id = $1 AND journal_entry_id = $2`
	
	_, err := r.db.ExecContext(ctx, query,
		line.ID, line.JournalEntryID, line.LineNumber, line.AccountID,
		line.Description, line.DebitAmount, line.CreditAmount,
		line.BaseDebitAmount, line.BaseCreditAmount, line.UpdatedAt,
	)
	
	return err
}

// DeleteLine deletes a journal entry line
func (r *journalEntryRepositoryImpl) DeleteLine(ctx context.Context, lineID uuid.UUID) error {
	query := `DELETE FROM journal_entry_lines WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, lineID)
	return err
}

// DeleteLinesByEntryID deletes all lines for a journal entry
func (r *journalEntryRepositoryImpl) DeleteLinesByEntryID(ctx context.Context, entryID uuid.UUID) error {
	query := `DELETE FROM journal_entry_lines WHERE journal_entry_id = $1`
	_, err := r.db.ExecContext(ctx, query, entryID)
	return err
}

// GetByEntryNumber retrieves a journal entry by entry number
func (r *journalEntryRepositoryImpl) GetByEntryNumber(ctx context.Context, entryNumber string) (*entities.JournalEntry, error) {
	query := `
		SELECT id, entry_number, entry_date, description, reference, status,
			   total_debit, total_credit, currency_code, exchange_rate,
			   base_total_debit, base_total_credit, source_module, source_id,
			   posted_by, posted_at, reversed_by, reversed_at,
			   company_id, created_by, created_at, updated_at
		FROM journal_entries WHERE entry_number = $1`
	
	entries, err := r.queryEntries(ctx, query, entryNumber)
	if err != nil {
		return nil, err
	}
	
	if len(entries) == 0 {
		return nil, sql.ErrNoRows
	}
	
	return entries[0], nil
}

// GetByStatus retrieves journal entries by status
func (r *journalEntryRepositoryImpl) GetByStatus(ctx context.Context, status entities.JournalEntryStatus) ([]*entities.JournalEntry, error) {
	query := `
		SELECT id, entry_number, entry_date, description, reference, status,
			   total_debit, total_credit, currency_code, exchange_rate,
			   base_total_debit, base_total_credit, source_module, source_id,
			   posted_by, posted_at, reversed_by, reversed_at,
			   company_id, created_by, created_at, updated_at
		FROM journal_entries WHERE status = $1 ORDER BY entry_date DESC`
	
	return r.queryEntries(ctx, query, status)
}

// GetByDateRange retrieves journal entries by date range
func (r *journalEntryRepositoryImpl) GetByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*entities.JournalEntry, error) {
	query := `
		SELECT id, entry_number, entry_date, description, reference, status,
			   total_debit, total_credit, currency_code, exchange_rate,
			   base_total_debit, base_total_credit, source_module, source_id,
			   posted_by, posted_at, reversed_by, reversed_at,
			   company_id, created_by, created_at, updated_at
		FROM journal_entries WHERE entry_date BETWEEN $1 AND $2 ORDER BY entry_date, created_at`
	
	return r.queryEntries(ctx, query, startDate, endDate)
}

// GetByReference retrieves journal entries by reference
func (r *journalEntryRepositoryImpl) GetByReference(ctx context.Context, reference string) ([]*entities.JournalEntry, error) {
	query := `
		SELECT id, entry_number, entry_date, description, reference, status,
			   total_debit, total_credit, currency_code, exchange_rate,
			   base_total_debit, base_total_credit, source_module, source_id,
			   posted_by, posted_at, reversed_by, reversed_at,
			   company_id, created_by, created_at, updated_at
		FROM journal_entries WHERE reference = $1 ORDER BY entry_date DESC`
	
	return r.queryEntries(ctx, query, reference)
}

// GetBySourceModule retrieves journal entries by source module
func (r *journalEntryRepositoryImpl) GetBySourceModule(ctx context.Context, sourceModule string) ([]*entities.JournalEntry, error) {
	query := `
		SELECT id, entry_number, entry_date, description, reference, status,
			   total_debit, total_credit, currency_code, exchange_rate,
			   base_total_debit, base_total_credit, source_module, source_id,
			   posted_by, posted_at, reversed_by, reversed_at,
			   company_id, created_by, created_at, updated_at
		FROM journal_entries WHERE source_module = $1 ORDER BY entry_date DESC`
	
	return r.queryEntries(ctx, query, sourceModule)
}

// GetBySourceID retrieves journal entry by source module and ID
func (r *journalEntryRepositoryImpl) GetBySourceID(ctx context.Context, sourceModule, sourceID string) (*entities.JournalEntry, error) {
	query := `
		SELECT id, entry_number, entry_date, description, reference, status,
			   total_debit, total_credit, currency_code, exchange_rate,
			   base_total_debit, base_total_credit, source_module, source_id,
			   posted_by, posted_at, reversed_by, reversed_at,
			   company_id, created_by, created_at, updated_at
		FROM journal_entries WHERE source_module = $1 AND source_id = $2`
	
	entries, err := r.queryEntries(ctx, query, sourceModule, sourceID)
	if err != nil {
		return nil, err
	}
	
	if len(entries) == 0 {
		return nil, sql.ErrNoRows
	}
	
	return entries[0], nil
}

// GetByCompanyID retrieves journal entries by company ID
func (r *journalEntryRepositoryImpl) GetByCompanyID(ctx context.Context, companyID string) ([]*entities.JournalEntry, error) {
	query := `
		SELECT id, entry_number, entry_date, description, reference, status,
			   total_debit, total_credit, currency_code, exchange_rate,
			   base_total_debit, base_total_credit, source_module, source_id,
			   posted_by, posted_at, reversed_by, reversed_at,
			   company_id, created_by, created_at, updated_at
		FROM journal_entries WHERE company_id = $1 ORDER BY entry_date DESC`
	
	return r.queryEntries(ctx, query, companyID)
}

// GetByCompanyAndStatus retrieves journal entries by company and status
func (r *journalEntryRepositoryImpl) GetByCompanyAndStatus(ctx context.Context, companyID string, status entities.JournalEntryStatus) ([]*entities.JournalEntry, error) {
	query := `
		SELECT id, entry_number, entry_date, description, reference, status,
			   total_debit, total_credit, currency_code, exchange_rate,
			   base_total_debit, base_total_credit, source_module, source_id,
			   posted_by, posted_at, reversed_by, reversed_at,
			   company_id, created_by, created_at, updated_at
		FROM journal_entries WHERE company_id = $1 AND status = $2 ORDER BY entry_date DESC`
	
	return r.queryEntries(ctx, query, companyID, status)
}

// GetByCompanyAndDateRange retrieves journal entries by company and date range
func (r *journalEntryRepositoryImpl) GetByCompanyAndDateRange(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.JournalEntry, error) {
	query := `
		SELECT id, entry_number, entry_date, description, reference, status,
			   total_debit, total_credit, currency_code, exchange_rate,
			   base_total_debit, base_total_credit, source_module, source_id,
			   posted_by, posted_at, reversed_by, reversed_at,
			   company_id, created_by, created_at, updated_at
		FROM journal_entries 
		WHERE company_id = $1 AND entry_date BETWEEN $2 AND $3 
		ORDER BY entry_date, created_at`
	
	return r.queryEntries(ctx, query, companyID, startDate, endDate)
}

// Post posts a journal entry
func (r *journalEntryRepositoryImpl) Post(ctx context.Context, entryID uuid.UUID, userID string) error {
	now := time.Now()
	query := `
		UPDATE journal_entries SET
			status = $2, posted_by = $3, posted_at = $4, updated_at = $5
		WHERE id = $1 AND status = $6`
	
	result, err := r.db.ExecContext(ctx, query, entryID, entities.JournalEntryStatusPosted, userID, now, now, entities.JournalEntryStatusDraft)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("journal entry not found or not in draft status")
	}
	
	return nil
}

// Reverse reverses a journal entry
func (r *journalEntryRepositoryImpl) Reverse(ctx context.Context, entryID uuid.UUID, userID string) error {
	now := time.Now()
	query := `
		UPDATE journal_entries SET
			status = $2, reversed_by = $3, reversed_at = $4, updated_at = $5
		WHERE id = $1 AND status = $6`
	
	result, err := r.db.ExecContext(ctx, query, entryID, entities.JournalEntryStatusReversed, userID, now, now, entities.JournalEntryStatusPosted)
	if err != nil {
		return err
	}
	
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	
	if rowsAffected == 0 {
		return fmt.Errorf("journal entry not found or not in posted status")
	}
	
	return nil
}

// GetNextEntryNumber generates the next entry number
func (r *journalEntryRepositoryImpl) GetNextEntryNumber(ctx context.Context, companyID string, entryDate time.Time) (string, error) {
	year := entryDate.Year()
	month := entryDate.Month()
	
	query := `
		SELECT COALESCE(MAX(CAST(SUBSTRING(entry_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
		FROM journal_entries 
		WHERE company_id = $1 AND EXTRACT(YEAR FROM entry_date) = $2 AND EXTRACT(MONTH FROM entry_date) = $3`
	
	var nextNumber int
	err := r.db.QueryRowContext(ctx, query, companyID, year, month).Scan(&nextNumber)
	if err != nil {
		return "", err
	}
	
	return fmt.Sprintf("JE%04d%02d%04d", year, month, nextNumber), nil
}

// CreateWithLines creates a journal entry with its lines in a transaction
func (r *journalEntryRepositoryImpl) CreateWithLines(ctx context.Context, entry *entities.JournalEntry) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	// Generate entry number if not provided
	if entry.EntryNumber == "" {
		entryNumber, err := r.GetNextEntryNumber(ctx, entry.CompanyID, entry.EntryDate)
		if err != nil {
			return err
		}
		entry.EntryNumber = entryNumber
	}
	
	// Create journal entry
	err = r.Create(ctx, entry)
	if err != nil {
		return err
	}
	
	// Create journal entry lines
	for i := range entry.Lines {
		entry.Lines[i].JournalEntryID = entry.ID
		if entry.Lines[i].LineNumber == 0 {
			entry.Lines[i].LineNumber = i + 1
		}
		
		err = r.CreateLine(ctx, entry.Lines[i])
		if err != nil {
			return err
		}
	}
	
	return tx.Commit()
}

// UpdateWithLines updates a journal entry with its lines in a transaction
func (r *journalEntryRepositoryImpl) UpdateWithLines(ctx context.Context, entry *entities.JournalEntry) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	
	// Update journal entry
	err = r.Update(ctx, entry)
	if err != nil {
		return err
	}
	
	// Delete existing lines
	err = r.DeleteLinesByEntryID(ctx, entry.ID)
	if err != nil {
		return err
	}
	
	// Create new lines
	for i := range entry.Lines {
		entry.Lines[i].ID = uuid.New()
		entry.Lines[i].JournalEntryID = entry.ID
		if entry.Lines[i].LineNumber == 0 {
			entry.Lines[i].LineNumber = i + 1
		}
		
		err = r.CreateLine(ctx, entry.Lines[i])
		if err != nil {
			return err
		}
	}
	
	return tx.Commit()
}

// GetUnpostedEntries retrieves unposted entries for a company
func (r *journalEntryRepositoryImpl) GetUnpostedEntries(ctx context.Context, companyID string) ([]*entities.JournalEntry, error) {
	return r.GetByCompanyAndStatus(ctx, companyID, entities.JournalEntryStatusDraft)
}

// GetEntriesForPeriod retrieves entries for a specific period
func (r *journalEntryRepositoryImpl) GetEntriesForPeriod(ctx context.Context, companyID string, startDate, endDate time.Time) ([]*entities.JournalEntry, error) {
	return r.GetByCompanyAndDateRange(ctx, companyID, startDate, endDate)
}

// GetEntriesByAccount retrieves entries affecting a specific account
func (r *journalEntryRepositoryImpl) GetEntriesByAccount(ctx context.Context, accountID uuid.UUID, startDate, endDate time.Time) ([]*entities.JournalEntry, error) {
	query := `
		SELECT DISTINCT je.id, je.entry_number, je.entry_date, je.description, je.reference, je.status,
			   je.total_debit, je.total_credit, je.currency_code, je.exchange_rate,
			   je.base_total_debit, je.base_total_credit, je.source_module, je.source_id,
			   je.posted_by, je.posted_at, je.reversed_by, je.reversed_at,
			   je.company_id, je.created_by, je.created_at, je.updated_at
		FROM journal_entries je
		INNER JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
		WHERE jel.account_id = $1 AND je.entry_date BETWEEN $2 AND $3
		ORDER BY je.entry_date, je.created_at`
	
	return r.queryEntries(ctx, query, accountID, startDate, endDate)
}

// queryEntries is a helper method to query multiple entries
func (r *journalEntryRepositoryImpl) queryEntries(ctx context.Context, query string, args ...interface{}) ([]*entities.JournalEntry, error) {
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var entries []*entities.JournalEntry
	for rows.Next() {
		entry := &entities.JournalEntry{}
		var postedBy, reversedBy sql.NullString
		var reference, sourceModule, sourceID sql.NullString
		
		err := rows.Scan(
			&entry.ID, &entry.EntryNumber, &entry.EntryDate, &entry.Description,
			&reference, &entry.Status, &entry.TotalDebit, &entry.TotalCredit,
			&entry.CurrencyCode, &entry.ExchangeRate, &entry.BaseTotalDebit,
			&entry.BaseTotalCredit, &sourceModule, &sourceID,
			&postedBy, &entry.PostedAt, &reversedBy, &entry.ReversedAt,
			&entry.CompanyID, &entry.CreatedBy, &entry.CreatedAt, &entry.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		
		entry.Reference = reference.String
		entry.SourceModule = sourceModule.String
		entry.SourceID = sourceID.String
		entry.PostedBy = postedBy.String
		entry.ReversedBy = reversedBy.String
		
		// Load lines for each entry
		lines, err := r.GetLinesByEntryID(ctx, entry.ID)
		if err != nil {
			return nil, err
		}
		entry.Lines = lines
		
		entries = append(entries, entry)
	}
	
	return entries, rows.Err()
}