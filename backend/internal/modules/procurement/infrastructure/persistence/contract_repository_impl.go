package persistence

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/procurement/domain/entities"
	"malaka/internal/modules/procurement/domain/repositories"
)

// ContractRepositoryImpl implements repositories.ContractRepository.
type ContractRepositoryImpl struct {
	db *sqlx.DB
}

// NewContractRepositoryImpl creates a new ContractRepositoryImpl.
func NewContractRepositoryImpl(db *sqlx.DB) *ContractRepositoryImpl {
	return &ContractRepositoryImpl{db: db}
}

// Create creates a new contract in the database.
func (r *ContractRepositoryImpl) Create(ctx context.Context, contract *entities.Contract) error {
	// Convert attachments to JSON
	attachmentsJSON, err := json.Marshal(contract.Attachments)
	if err != nil {
		return err
	}

	query := `
		INSERT INTO contracts (
			id, contract_number, title, description, supplier_id, contract_type,
			status, start_date, end_date, value, currency, payment_terms,
			terms_conditions, auto_renewal, renewal_period, notice_period,
			signed_by, signed_date, attachments, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
	`
	_, err = r.db.ExecContext(ctx, query,
		contract.ID, contract.ContractNumber, contract.Title, contract.Description,
		contract.SupplierID, contract.ContractType, contract.Status, contract.StartDate,
		contract.EndDate, contract.Value, contract.Currency, contract.PaymentTerms,
		contract.TermsConditions, contract.AutoRenewal, contract.RenewalPeriod,
		contract.NoticePeriod, contract.SignedBy, contract.SignedDate, attachmentsJSON,
		contract.CreatedAt, contract.UpdatedAt,
	)
	return err
}

// GetByID retrieves a contract by its ID.
func (r *ContractRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.Contract, error) {
	query := `
		SELECT
			c.id, c.contract_number, c.title, c.description, c.supplier_id,
			c.contract_type, c.status, c.start_date, c.end_date, c.value,
			c.currency, c.payment_terms, c.terms_conditions, c.auto_renewal,
			c.renewal_period, c.notice_period, c.signed_by, c.signed_date,
			c.attachments, c.created_at, c.updated_at,
			COALESCE(s.name, '') as supplier_name
		FROM contracts c
		LEFT JOIN suppliers s ON c.supplier_id = s.id
		WHERE c.id = $1
	`

	contract := &entities.Contract{}
	var description, paymentTerms, termsConditions, signedBy sql.NullString
	var renewalPeriod, noticePeriod sql.NullInt64
	var signedDate sql.NullTime
	var attachmentsJSON []byte

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&contract.ID, &contract.ContractNumber, &contract.Title, &description,
		&contract.SupplierID, &contract.ContractType, &contract.Status,
		&contract.StartDate, &contract.EndDate, &contract.Value, &contract.Currency,
		&paymentTerms, &termsConditions, &contract.AutoRenewal, &renewalPeriod,
		&noticePeriod, &signedBy, &signedDate, &attachmentsJSON,
		&contract.CreatedAt, &contract.UpdatedAt, &contract.SupplierName,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	// Handle nullable fields
	if description.Valid {
		contract.Description = &description.String
	}
	if paymentTerms.Valid {
		contract.PaymentTerms = &paymentTerms.String
	}
	if termsConditions.Valid {
		contract.TermsConditions = &termsConditions.String
	}
	if signedBy.Valid {
		contract.SignedBy = &signedBy.String
	}
	if signedDate.Valid {
		contract.SignedDate = &signedDate.Time
	}
	if renewalPeriod.Valid {
		period := int(renewalPeriod.Int64)
		contract.RenewalPeriod = &period
	}
	if noticePeriod.Valid {
		period := int(noticePeriod.Int64)
		contract.NoticePeriod = &period
	}

	// Parse attachments JSON
	if len(attachmentsJSON) > 0 {
		if err := json.Unmarshal(attachmentsJSON, &contract.Attachments); err != nil {
			return nil, err
		}
	}

	return contract, nil
}

// GetAll retrieves all contracts with filters.
func (r *ContractRepositoryImpl) GetAll(ctx context.Context, filter *repositories.ContractFilter) ([]*entities.Contract, int, error) {
	var conditions []string
	var args []interface{}
	argNum := 1

	baseQuery := `
		SELECT
			c.id, c.contract_number, c.title, c.description, c.supplier_id,
			c.contract_type, c.status, c.start_date, c.end_date, c.value,
			c.currency, c.payment_terms, c.terms_conditions, c.auto_renewal,
			c.renewal_period, c.notice_period, c.signed_by, c.signed_date,
			c.attachments, c.created_at, c.updated_at,
			COALESCE(s.name, '') as supplier_name
		FROM contracts c
		LEFT JOIN suppliers s ON c.supplier_id = s.id
	`

	countQuery := `SELECT COUNT(*) FROM contracts c`

	if filter.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(c.title ILIKE $%d OR c.contract_number ILIKE $%d OR c.description ILIKE $%d)", argNum, argNum, argNum))
		args = append(args, "%"+filter.Search+"%")
		argNum++
	}
	if filter.Status != "" {
		conditions = append(conditions, fmt.Sprintf("c.status = $%d", argNum))
		args = append(args, filter.Status)
		argNum++
	}
	if filter.ContractType != "" {
		conditions = append(conditions, fmt.Sprintf("c.contract_type = $%d", argNum))
		args = append(args, filter.ContractType)
		argNum++
	}
	if filter.SupplierID != "" {
		conditions = append(conditions, fmt.Sprintf("c.supplier_id = $%d", argNum))
		args = append(args, filter.SupplierID)
		argNum++
	}
	if filter.ExpiringDays > 0 {
		conditions = append(conditions, fmt.Sprintf("c.end_date <= CURRENT_DATE + INTERVAL '%d days' AND c.status = 'active'", filter.ExpiringDays))
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = " WHERE " + strings.Join(conditions, " AND ")
	}

	// Get total count
	var total int
	err := r.db.QueryRowContext(ctx, countQuery+whereClause, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Build order clause
	orderBy := "c.start_date DESC, c.created_at DESC"
	if filter.SortBy != "" {
		order := "ASC"
		if strings.ToUpper(filter.SortOrder) == "DESC" {
			order = "DESC"
		}
		orderBy = fmt.Sprintf("c.%s %s", filter.SortBy, order)
	}

	// Add pagination
	offset := (filter.Page - 1) * filter.Limit
	query := fmt.Sprintf("%s%s ORDER BY %s LIMIT %d OFFSET %d",
		baseQuery, whereClause, orderBy, filter.Limit, offset)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var contracts []*entities.Contract
	for rows.Next() {
		contract := &entities.Contract{}
		var description, paymentTerms, termsConditions, signedBy sql.NullString
		var renewalPeriod, noticePeriod sql.NullInt64
		var signedDate sql.NullTime
		var attachmentsJSON []byte

		err := rows.Scan(
			&contract.ID, &contract.ContractNumber, &contract.Title, &description,
			&contract.SupplierID, &contract.ContractType, &contract.Status,
			&contract.StartDate, &contract.EndDate, &contract.Value, &contract.Currency,
			&paymentTerms, &termsConditions, &contract.AutoRenewal, &renewalPeriod,
			&noticePeriod, &signedBy, &signedDate, &attachmentsJSON,
			&contract.CreatedAt, &contract.UpdatedAt, &contract.SupplierName,
		)
		if err != nil {
			return nil, 0, err
		}

		if description.Valid {
			contract.Description = &description.String
		}
		if paymentTerms.Valid {
			contract.PaymentTerms = &paymentTerms.String
		}
		if termsConditions.Valid {
			contract.TermsConditions = &termsConditions.String
		}
		if signedBy.Valid {
			contract.SignedBy = &signedBy.String
		}
		if signedDate.Valid {
			contract.SignedDate = &signedDate.Time
		}
		if renewalPeriod.Valid {
			period := int(renewalPeriod.Int64)
			contract.RenewalPeriod = &period
		}
		if noticePeriod.Valid {
			period := int(noticePeriod.Int64)
			contract.NoticePeriod = &period
		}
		if len(attachmentsJSON) > 0 {
			json.Unmarshal(attachmentsJSON, &contract.Attachments)
		}

		contracts = append(contracts, contract)
	}

	return contracts, total, rows.Err()
}

// Update updates an existing contract.
func (r *ContractRepositoryImpl) Update(ctx context.Context, contract *entities.Contract) error {
	attachmentsJSON, err := json.Marshal(contract.Attachments)
	if err != nil {
		return err
	}

	query := `
		UPDATE contracts SET
			title = $2, description = $3, contract_type = $4, status = $5,
			start_date = $6, end_date = $7, value = $8, currency = $9,
			payment_terms = $10, terms_conditions = $11, auto_renewal = $12,
			renewal_period = $13, notice_period = $14, signed_by = $15,
			signed_date = $16, attachments = $17, updated_at = $18
		WHERE id = $1
	`
	_, err = r.db.ExecContext(ctx, query,
		contract.ID, contract.Title, contract.Description, contract.ContractType,
		contract.Status, contract.StartDate, contract.EndDate, contract.Value,
		contract.Currency, contract.PaymentTerms, contract.TermsConditions,
		contract.AutoRenewal, contract.RenewalPeriod, contract.NoticePeriod,
		contract.SignedBy, contract.SignedDate, attachmentsJSON, contract.UpdatedAt,
	)
	return err
}

// Delete deletes a contract.
func (r *ContractRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM contracts WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetExpiring retrieves contracts expiring within the specified days.
func (r *ContractRepositoryImpl) GetExpiring(ctx context.Context, days int) ([]*entities.Contract, error) {
	query := `
		SELECT
			c.id, c.contract_number, c.title, c.description, c.supplier_id,
			c.contract_type, c.status, c.start_date, c.end_date, c.value,
			c.currency, c.payment_terms, c.terms_conditions, c.auto_renewal,
			c.renewal_period, c.notice_period, c.signed_by, c.signed_date,
			c.attachments, c.created_at, c.updated_at,
			COALESCE(s.name, '') as supplier_name
		FROM contracts c
		LEFT JOIN suppliers s ON c.supplier_id = s.id
		WHERE c.status = 'active' AND c.end_date <= CURRENT_DATE + $1 * INTERVAL '1 day'
		ORDER BY c.end_date ASC
	`

	rows, err := r.db.QueryContext(ctx, query, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contracts []*entities.Contract
	for rows.Next() {
		contract := &entities.Contract{}
		var description, paymentTerms, termsConditions, signedBy sql.NullString
		var renewalPeriod, noticePeriod sql.NullInt64
		var signedDate sql.NullTime
		var attachmentsJSON []byte

		err := rows.Scan(
			&contract.ID, &contract.ContractNumber, &contract.Title, &description,
			&contract.SupplierID, &contract.ContractType, &contract.Status,
			&contract.StartDate, &contract.EndDate, &contract.Value, &contract.Currency,
			&paymentTerms, &termsConditions, &contract.AutoRenewal, &renewalPeriod,
			&noticePeriod, &signedBy, &signedDate, &attachmentsJSON,
			&contract.CreatedAt, &contract.UpdatedAt, &contract.SupplierName,
		)
		if err != nil {
			return nil, err
		}

		if description.Valid {
			contract.Description = &description.String
		}
		if paymentTerms.Valid {
			contract.PaymentTerms = &paymentTerms.String
		}
		if termsConditions.Valid {
			contract.TermsConditions = &termsConditions.String
		}
		if signedBy.Valid {
			contract.SignedBy = &signedBy.String
		}
		if signedDate.Valid {
			contract.SignedDate = &signedDate.Time
		}
		if renewalPeriod.Valid {
			period := int(renewalPeriod.Int64)
			contract.RenewalPeriod = &period
		}
		if noticePeriod.Valid {
			period := int(noticePeriod.Int64)
			contract.NoticePeriod = &period
		}
		if len(attachmentsJSON) > 0 {
			json.Unmarshal(attachmentsJSON, &contract.Attachments)
		}

		contracts = append(contracts, contract)
	}

	return contracts, rows.Err()
}

// GetBySupplierID retrieves all contracts for a supplier.
func (r *ContractRepositoryImpl) GetBySupplierID(ctx context.Context, supplierID string) ([]*entities.Contract, error) {
	filter := &repositories.ContractFilter{
		SupplierID: supplierID,
		Page:       1,
		Limit:      1000,
	}
	contracts, _, err := r.GetAll(ctx, filter)
	return contracts, err
}

// GetStats retrieves contract statistics.
func (r *ContractRepositoryImpl) GetStats(ctx context.Context) (*repositories.ContractStats, error) {
	query := `
		SELECT
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE status = 'draft') as draft,
			COUNT(*) FILTER (WHERE status = 'active') as active,
			COUNT(*) FILTER (WHERE status = 'expired') as expired,
			COUNT(*) FILTER (WHERE status = 'terminated') as terminated,
			COALESCE(SUM(value) FILTER (WHERE status = 'active'), 0) as total_value,
			COUNT(*) FILTER (WHERE status = 'active' AND end_date <= CURRENT_DATE + INTERVAL '30 days') as expiring
		FROM contracts
	`

	stats := &repositories.ContractStats{}
	err := r.db.QueryRowContext(ctx, query).Scan(
		&stats.Total, &stats.Draft, &stats.Active, &stats.Expired,
		&stats.Terminated, &stats.TotalValue, &stats.Expiring,
	)
	if err != nil {
		return nil, err
	}

	return stats, nil
}

// GetNextContractNumber generates the next contract number.
func (r *ContractRepositoryImpl) GetNextContractNumber(ctx context.Context) (string, error) {
	year := time.Now().Year()
	prefix := fmt.Sprintf("CTR-%d-", year)

	query := `
		SELECT COALESCE(MAX(CAST(SUBSTRING(contract_number FROM '\d+$') AS INTEGER)), 0) + 1
		FROM contracts
		WHERE contract_number LIKE $1
	`

	var nextNum int
	err := r.db.QueryRowContext(ctx, query, prefix+"%").Scan(&nextNum)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%s%05d", prefix, nextNum), nil
}
