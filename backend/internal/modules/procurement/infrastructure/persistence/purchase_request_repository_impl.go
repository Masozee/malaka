package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/procurement/domain/entities"
	"malaka/internal/modules/procurement/domain/repositories"
	"malaka/internal/shared/uuid"
)

// PurchaseRequestRepositoryImpl implements repositories.PurchaseRequestRepository.
type PurchaseRequestRepositoryImpl struct {
	db *sqlx.DB
}

// NewPurchaseRequestRepositoryImpl creates a new PurchaseRequestRepositoryImpl.
func NewPurchaseRequestRepositoryImpl(db *sqlx.DB) *PurchaseRequestRepositoryImpl {
	return &PurchaseRequestRepositoryImpl{db: db}
}

// Create creates a new purchase request in the database.
func (r *PurchaseRequestRepositoryImpl) Create(ctx context.Context, pr *entities.PurchaseRequest) error {
	query := `
		INSERT INTO purchase_requests (
			id, request_number, title, description, requester_id, department,
			priority, status, requested_date, required_date, total_amount, currency, notes,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	`
	_, err := r.db.ExecContext(ctx, query,
		pr.ID, pr.RequestNumber, pr.Title, pr.Description, pr.RequesterID, pr.Department,
		pr.Priority, pr.Status, pr.RequestedDate, pr.RequiredDate, pr.TotalAmount, pr.Currency, pr.Notes,
		pr.CreatedAt, pr.UpdatedAt,
	)
	if err != nil {
		return err
	}

	// Create items if any
	for _, item := range pr.Items {
		item.PurchaseRequestID = pr.ID
		if err := r.CreateItem(ctx, item); err != nil {
			return err
		}
	}

	return nil
}

// GetByID retrieves a purchase request by its ID.
func (r *PurchaseRequestRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.PurchaseRequest, error) {
	query := `
		SELECT
			pr.id, pr.request_number, pr.title, pr.description, pr.requester_id,
			pr.department, pr.priority, pr.status, pr.requested_date, pr.required_date,
			pr.approved_by, pr.approved_date, pr.rejection_reason, pr.total_amount,
			pr.currency, pr.notes, pr.created_at, pr.updated_at,
			COALESCE(u.full_name, '') as requester_name
		FROM purchase_requests pr
		LEFT JOIN users u ON pr.requester_id = u.id
		WHERE pr.id = $1
	`

	pr := &entities.PurchaseRequest{}
	var description, notes, rejectionReason sql.NullString
	var requiredDate, approvedDate sql.NullTime
	var approvedBy uuid.NullableID

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&pr.ID, &pr.RequestNumber, &pr.Title, &description, &pr.RequesterID,
		&pr.Department, &pr.Priority, &pr.Status, &pr.RequestedDate, &requiredDate,
		&approvedBy, &approvedDate, &rejectionReason, &pr.TotalAmount,
		&pr.Currency, &notes, &pr.CreatedAt, &pr.UpdatedAt,
		&pr.RequesterName,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	// Handle nullable fields
	if description.Valid {
		pr.Description = description.String
	}
	if notes.Valid {
		pr.Notes = &notes.String
	}
	if rejectionReason.Valid {
		pr.RejectionReason = &rejectionReason.String
	}
	if requiredDate.Valid {
		pr.RequiredDate = &requiredDate.Time
	}
	if approvedDate.Valid {
		pr.ApprovedDate = &approvedDate.Time
	}
	if approvedBy.Valid {
		pr.ApprovedBy = &approvedBy.ID
	}

	// Load items
	items, err := r.GetItemsByRequestID(ctx, id)
	if err != nil {
		return nil, err
	}
	pr.Items = items

	return pr, nil
}

// GetAll retrieves all purchase requests with filters.
func (r *PurchaseRequestRepositoryImpl) GetAll(ctx context.Context, filter *repositories.PurchaseRequestFilter) ([]*entities.PurchaseRequest, int, error) {
	var conditions []string
	var args []interface{}
	argNum := 1

	baseQuery := `
		SELECT
			pr.id, pr.request_number, pr.title, pr.description, pr.requester_id,
			pr.department, pr.priority, pr.status, pr.requested_date, pr.required_date,
			pr.approved_by, pr.approved_date, pr.rejection_reason, pr.total_amount,
			pr.currency, pr.notes, pr.created_at, pr.updated_at,
			COALESCE(u.full_name, '') as requester_name
		FROM purchase_requests pr
		LEFT JOIN users u ON pr.requester_id = u.id
	`

	countQuery := `SELECT COUNT(*) FROM purchase_requests pr`

	if filter.Search != "" {
		conditions = append(conditions, fmt.Sprintf("(pr.title ILIKE $%d OR pr.request_number ILIKE $%d OR pr.description ILIKE $%d)", argNum, argNum, argNum))
		args = append(args, "%"+filter.Search+"%")
		argNum++
	}
	if filter.Status != "" {
		conditions = append(conditions, fmt.Sprintf("pr.status = $%d", argNum))
		args = append(args, filter.Status)
		argNum++
	}
	if filter.Priority != "" {
		conditions = append(conditions, fmt.Sprintf("pr.priority = $%d", argNum))
		args = append(args, filter.Priority)
		argNum++
	}
	if filter.Department != "" {
		conditions = append(conditions, fmt.Sprintf("pr.department = $%d", argNum))
		args = append(args, filter.Department)
		argNum++
	}
	if filter.RequesterID != "" {
		conditions = append(conditions, fmt.Sprintf("pr.requester_id = $%d", argNum))
		args = append(args, filter.RequesterID)
		argNum++
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
	orderBy := "pr.requested_date DESC, pr.created_at DESC"
	if filter.SortBy != "" {
		order := "ASC"
		if strings.ToUpper(filter.SortOrder) == "DESC" {
			order = "DESC"
		}
		orderBy = fmt.Sprintf("pr.%s %s", filter.SortBy, order)
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

	var purchaseRequests []*entities.PurchaseRequest
	for rows.Next() {
		pr := &entities.PurchaseRequest{}
		var description, notes, rejectionReason sql.NullString
		var requiredDate, approvedDate sql.NullTime
		var approvedBy uuid.NullableID

		err := rows.Scan(
			&pr.ID, &pr.RequestNumber, &pr.Title, &description, &pr.RequesterID,
			&pr.Department, &pr.Priority, &pr.Status, &pr.RequestedDate, &requiredDate,
			&approvedBy, &approvedDate, &rejectionReason, &pr.TotalAmount,
			&pr.Currency, &notes, &pr.CreatedAt, &pr.UpdatedAt,
			&pr.RequesterName,
		)
		if err != nil {
			return nil, 0, err
		}

		if description.Valid {
			pr.Description = description.String
		}
		if notes.Valid {
			pr.Notes = &notes.String
		}
		if rejectionReason.Valid {
			pr.RejectionReason = &rejectionReason.String
		}
		if requiredDate.Valid {
			pr.RequiredDate = &requiredDate.Time
		}
		if approvedDate.Valid {
			pr.ApprovedDate = &approvedDate.Time
		}
		if approvedBy.Valid {
			pr.ApprovedBy = &approvedBy.ID
		}

		purchaseRequests = append(purchaseRequests, pr)
	}

	return purchaseRequests, total, rows.Err()
}

// Update updates an existing purchase request.
func (r *PurchaseRequestRepositoryImpl) Update(ctx context.Context, pr *entities.PurchaseRequest) error {
	query := `
		UPDATE purchase_requests SET
			title = $2, description = $3, department = $4, priority = $5, status = $6,
			required_date = $7, approved_by = $8, approved_date = $9, rejection_reason = $10,
			total_amount = $11, currency = $12, notes = $13, updated_at = $14
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, query,
		pr.ID, pr.Title, pr.Description, pr.Department, pr.Priority, pr.Status,
		pr.RequiredDate, pr.ApprovedBy, pr.ApprovedDate, pr.RejectionReason,
		pr.TotalAmount, pr.Currency, pr.Notes, pr.UpdatedAt,
	)
	return err
}

// Delete deletes a purchase request.
func (r *PurchaseRequestRepositoryImpl) Delete(ctx context.Context, id string) error {
	// Items are deleted automatically due to ON DELETE CASCADE
	query := `DELETE FROM purchase_requests WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// CreateItem creates a new purchase request item.
func (r *PurchaseRequestRepositoryImpl) CreateItem(ctx context.Context, item *entities.PurchaseRequestItem) error {
	query := `
		INSERT INTO purchase_request_items (
			id, purchase_request_id, item_name, description, specification,
			quantity, unit, estimated_price, currency, supplier_id, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`
	_, err := r.db.ExecContext(ctx, query,
		item.ID, item.PurchaseRequestID, item.ItemName, item.Description, item.Specification,
		item.Quantity, item.Unit, item.EstimatedPrice, item.Currency, item.SupplierID,
		item.CreatedAt, item.UpdatedAt,
	)
	return err
}

// GetItemsByRequestID retrieves all items for a purchase request.
func (r *PurchaseRequestRepositoryImpl) GetItemsByRequestID(ctx context.Context, requestID string) ([]*entities.PurchaseRequestItem, error) {
	query := `
		SELECT
			pri.id, pri.purchase_request_id, pri.item_name, pri.description, pri.specification,
			pri.quantity, pri.unit, pri.estimated_price, pri.currency, pri.supplier_id,
			pri.created_at, pri.updated_at,
			COALESCE(s.name, '') as supplier_name
		FROM purchase_request_items pri
		LEFT JOIN suppliers s ON pri.supplier_id = s.id
		WHERE pri.purchase_request_id = $1
		ORDER BY pri.created_at ASC
	`

	rows, err := r.db.QueryContext(ctx, query, requestID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*entities.PurchaseRequestItem
	for rows.Next() {
		item := &entities.PurchaseRequestItem{}
		var description, specification, supplierName sql.NullString
		var supplierID uuid.NullableID

		err := rows.Scan(
			&item.ID, &item.PurchaseRequestID, &item.ItemName, &description, &specification,
			&item.Quantity, &item.Unit, &item.EstimatedPrice, &item.Currency, &supplierID,
			&item.CreatedAt, &item.UpdatedAt,
			&supplierName,
		)
		if err != nil {
			return nil, err
		}

		if description.Valid {
			item.Description = &description.String
		}
		if specification.Valid {
			item.Specification = &specification.String
		}
		if supplierID.Valid {
			item.SupplierID = &supplierID.ID
		}
		if supplierName.Valid {
			item.SupplierName = &supplierName.String
		}

		items = append(items, item)
	}

	return items, rows.Err()
}

// UpdateItem updates a purchase request item.
func (r *PurchaseRequestRepositoryImpl) UpdateItem(ctx context.Context, item *entities.PurchaseRequestItem) error {
	query := `
		UPDATE purchase_request_items SET
			item_name = $2, description = $3, specification = $4, quantity = $5,
			unit = $6, estimated_price = $7, currency = $8, supplier_id = $9, updated_at = $10
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, query,
		item.ID, item.ItemName, item.Description, item.Specification, item.Quantity,
		item.Unit, item.EstimatedPrice, item.Currency, item.SupplierID, item.UpdatedAt,
	)
	return err
}

// DeleteItem deletes a purchase request item.
func (r *PurchaseRequestRepositoryImpl) DeleteItem(ctx context.Context, id string) error {
	query := `DELETE FROM purchase_request_items WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// DeleteItemsByRequestID deletes all items for a purchase request.
func (r *PurchaseRequestRepositoryImpl) DeleteItemsByRequestID(ctx context.Context, requestID string) error {
	query := `DELETE FROM purchase_request_items WHERE purchase_request_id = $1`
	_, err := r.db.ExecContext(ctx, query, requestID)
	return err
}

// GetStats retrieves purchase request statistics.
func (r *PurchaseRequestRepositoryImpl) GetStats(ctx context.Context) (*repositories.PurchaseRequestStats, error) {
	query := `
		SELECT
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE status = 'draft') as draft,
			COUNT(*) FILTER (WHERE status = 'pending') as pending,
			COUNT(*) FILTER (WHERE status = 'approved') as approved,
			COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
			COALESCE(SUM(total_amount), 0) as total_amount
		FROM purchase_requests
	`

	stats := &repositories.PurchaseRequestStats{}
	err := r.db.QueryRowContext(ctx, query).Scan(
		&stats.Total, &stats.Draft, &stats.Pending, &stats.Approved, &stats.Rejected, &stats.TotalAmount,
	)
	if err != nil {
		return nil, err
	}

	return stats, nil
}

// GetNextRequestNumber generates the next request number.
func (r *PurchaseRequestRepositoryImpl) GetNextRequestNumber(ctx context.Context) (string, error) {
	year := time.Now().Year()
	prefix := fmt.Sprintf("PR-%d-", year)

	query := `
		SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM '\d+$') AS INTEGER)), 0) + 1
		FROM purchase_requests
		WHERE request_number LIKE $1
	`

	var nextNum int
	err := r.db.QueryRowContext(ctx, query, prefix+"%").Scan(&nextNum)
	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%s%05d", prefix, nextNum), nil
}
