package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/procurement/domain/entities"
	"malaka/internal/modules/procurement/domain/repositories"
	"malaka/internal/shared/utils"
)

// RFQRepositoryImpl implements the RFQRepository interface using sqlx
type RFQRepositoryImpl struct {
	db *sqlx.DB
}

// NewRFQRepository creates a new RFQ repository
func NewRFQRepository(db *sqlx.DB) repositories.RFQRepository {
	return &RFQRepositoryImpl{db: db}
}

// Create creates a new RFQ
func (r *RFQRepositoryImpl) Create(ctx context.Context, rfq *entities.RFQ) error {
	query := `
		INSERT INTO procurement_rfqs (
			id, rfq_number, title, description, status, priority,
			created_by, due_date, published_at, closed_at, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`
	_, err := r.db.ExecContext(ctx, query,
		rfq.ID, rfq.RFQNumber, rfq.Title, rfq.Description, rfq.Status, rfq.Priority,
		rfq.CreatedBy, rfq.DueDate, rfq.PublishedAt, rfq.ClosedAt, rfq.CreatedAt, rfq.UpdatedAt,
	)
	return err
}

// GetByID retrieves an RFQ by its ID with related data
func (r *RFQRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.RFQ, error) {
	query := `
		SELECT id, rfq_number, title, COALESCE(description, '') as description,
			   status, priority, created_by, due_date,
			   published_at, closed_at, created_at, updated_at
		FROM procurement_rfqs
		WHERE id = $1 AND deleted_at IS NULL
	`

	rfq := &entities.RFQ{}
	err := r.db.QueryRowxContext(ctx, query, id).StructScan(rfq)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	// Load related items
	items, err := r.GetRFQItems(ctx, rfq.ID.String())
	if err != nil {
		return nil, err
	}
	rfq.Items = items

	// Load related suppliers
	suppliers, err := r.GetRFQSuppliers(ctx, rfq.ID.String())
	if err != nil {
		return nil, err
	}
	rfq.Suppliers = suppliers

	// Load responses
	responses, err := r.GetRFQResponses(ctx, rfq.ID.String())
	if err != nil {
		return nil, err
	}
	rfq.Responses = responses

	return rfq, nil
}

// GetAll retrieves all RFQs with filters and pagination
func (r *RFQRepositoryImpl) GetAll(ctx context.Context, filter *repositories.RFQFilter) ([]*entities.RFQ, int64, error) {
	baseQuery := `
		FROM procurement_rfqs r
		WHERE r.deleted_at IS NULL
	`
	args := []interface{}{}
	argIndex := 1

	if filter != nil {
		if filter.Search != "" {
			baseQuery += fmt.Sprintf(` AND (r.title ILIKE $%d OR r.rfq_number ILIKE $%d OR r.description ILIKE $%d)`, argIndex, argIndex, argIndex)
			args = append(args, "%"+filter.Search+"%")
			argIndex++
		}
		if filter.Status != "" {
			baseQuery += fmt.Sprintf(` AND r.status = $%d`, argIndex)
			args = append(args, filter.Status)
			argIndex++
		}
		if filter.Priority != "" {
			baseQuery += fmt.Sprintf(` AND r.priority = $%d`, argIndex)
			args = append(args, filter.Priority)
			argIndex++
		}
		if filter.CreatedBy != "" {
			baseQuery += fmt.Sprintf(` AND r.created_by = $%d`, argIndex)
			args = append(args, filter.CreatedBy)
			argIndex++
		}
	}

	// Count total
	countQuery := "SELECT COUNT(*) " + baseQuery
	var total int64
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, err
	}

	// Get records
	selectQuery := `
		SELECT r.id, r.rfq_number, r.title, COALESCE(r.description, '') as description,
			   r.status, r.priority, r.created_by, r.due_date,
			   r.published_at, r.closed_at, r.created_at, r.updated_at
	` + baseQuery

	// Sorting
	sortBy := "r.due_date"
	sortOrder := "DESC"
	if filter != nil {
		if filter.SortBy != "" {
			switch filter.SortBy {
			case "title", "rfq_number", "status", "priority", "due_date", "created_at":
				sortBy = "r." + filter.SortBy
			}
		}
		if filter.SortOrder == "asc" || filter.SortOrder == "ASC" {
			sortOrder = "ASC"
		}
	}
	selectQuery += fmt.Sprintf(" ORDER BY %s %s", sortBy, sortOrder)

	// Pagination
	if filter != nil && filter.Limit > 0 {
		offset := 0
		if filter.Page > 1 {
			offset = (filter.Page - 1) * filter.Limit
		}
		selectQuery += fmt.Sprintf(" LIMIT %d OFFSET %d", filter.Limit, offset)
	}

	rows, err := r.db.QueryxContext(ctx, selectQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var rfqs []*entities.RFQ
	for rows.Next() {
		rfq := &entities.RFQ{}
		if err := rows.StructScan(rfq); err != nil {
			return nil, 0, err
		}

		// Load related items count and suppliers count for list view
		rfq.Items, _ = r.GetRFQItems(ctx, rfq.ID.String())
		rfq.Suppliers, _ = r.GetRFQSuppliers(ctx, rfq.ID.String())

		rfqs = append(rfqs, rfq)
	}

	return rfqs, total, nil
}

// Update updates an existing RFQ
func (r *RFQRepositoryImpl) Update(ctx context.Context, rfq *entities.RFQ) error {
	query := `
		UPDATE procurement_rfqs
		SET title = $2, description = $3, priority = $4, due_date = $5, updated_at = $6
		WHERE id = $1 AND deleted_at IS NULL
	`
	rfq.UpdatedAt = utils.Now()
	_, err := r.db.ExecContext(ctx, query,
		rfq.ID, rfq.Title, rfq.Description, rfq.Priority, rfq.DueDate, rfq.UpdatedAt,
	)
	return err
}

// Delete soft-deletes an RFQ
func (r *RFQRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `UPDATE procurement_rfqs SET deleted_at = $2 WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id, utils.Now())
	return err
}

// GetByRFQNumber retrieves an RFQ by its RFQ number
func (r *RFQRepositoryImpl) GetByRFQNumber(ctx context.Context, rfqNumber string) (*entities.RFQ, error) {
	query := `
		SELECT id, rfq_number, title, COALESCE(description, '') as description,
			   status, priority, created_by, due_date,
			   published_at, closed_at, created_at, updated_at
		FROM procurement_rfqs
		WHERE rfq_number = $1 AND deleted_at IS NULL
	`

	rfq := &entities.RFQ{}
	err := r.db.QueryRowxContext(ctx, query, rfqNumber).StructScan(rfq)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return rfq, err
}

// PublishRFQ publishes an RFQ
func (r *RFQRepositoryImpl) PublishRFQ(ctx context.Context, id string) error {
	query := `
		UPDATE procurement_rfqs
		SET status = 'published', published_at = $2, updated_at = $3
		WHERE id = $1 AND deleted_at IS NULL
	`
	now := utils.Now()
	_, err := r.db.ExecContext(ctx, query, id, now, now)
	return err
}

// CloseRFQ closes an RFQ
func (r *RFQRepositoryImpl) CloseRFQ(ctx context.Context, id string) error {
	query := `
		UPDATE procurement_rfqs
		SET status = 'closed', closed_at = $2, updated_at = $3
		WHERE id = $1 AND deleted_at IS NULL
	`
	now := utils.Now()
	_, err := r.db.ExecContext(ctx, query, id, now, now)
	return err
}

// CancelRFQ cancels an RFQ
func (r *RFQRepositoryImpl) CancelRFQ(ctx context.Context, id string) error {
	query := `
		UPDATE procurement_rfqs
		SET status = 'cancelled', updated_at = $2
		WHERE id = $1 AND deleted_at IS NULL
	`
	_, err := r.db.ExecContext(ctx, query, id, utils.Now())
	return err
}

// GenerateRFQNumber generates a unique RFQ number
func (r *RFQRepositoryImpl) GenerateRFQNumber(ctx context.Context) (string, error) {
	now := time.Now()
	year := now.Year()
	month := int(now.Month())
	day := now.Day()

	// Get the count of RFQs created today
	var count int
	query := `
		SELECT COUNT(*) FROM procurement_rfqs
		WHERE DATE(created_at) = CURRENT_DATE
	`
	err := r.db.GetContext(ctx, &count, query)
	if err != nil {
		return "", err
	}

	// Format: RFQ-YYYYMMDD-XXXX
	return fmt.Sprintf("RFQ-%04d%02d%02d-%04d", year, month, day, count+1), nil
}

// CreateItem creates a new RFQ item
func (r *RFQRepositoryImpl) CreateItem(ctx context.Context, item *entities.RFQItem) error {
	query := `
		INSERT INTO procurement_rfq_items (
			id, rfq_id, item_name, description, specification,
			quantity, unit, target_price, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.ExecContext(ctx, query,
		item.ID, item.RFQID, item.ItemName, item.Description, item.Specification,
		item.Quantity, item.Unit, item.TargetPrice, item.CreatedAt, item.UpdatedAt,
	)
	return err
}

// GetRFQItems retrieves all items for an RFQ
func (r *RFQRepositoryImpl) GetRFQItems(ctx context.Context, rfqID string) ([]*entities.RFQItem, error) {
	query := `
		SELECT id, rfq_id, item_name, COALESCE(description, '') as description,
			   COALESCE(specification, '') as specification, quantity, unit,
			   target_price, created_at, updated_at
		FROM procurement_rfq_items
		WHERE rfq_id = $1
		ORDER BY created_at ASC
	`

	var items []*entities.RFQItem
	err := r.db.SelectContext(ctx, &items, query, rfqID)
	if err != nil {
		return nil, err
	}

	return items, nil
}

// UpdateItem updates an RFQ item
func (r *RFQRepositoryImpl) UpdateItem(ctx context.Context, item *entities.RFQItem) error {
	query := `
		UPDATE procurement_rfq_items
		SET item_name = $2, description = $3, specification = $4,
			quantity = $5, unit = $6, target_price = $7, updated_at = $8
		WHERE id = $1
	`
	item.UpdatedAt = utils.Now()
	_, err := r.db.ExecContext(ctx, query,
		item.ID, item.ItemName, item.Description, item.Specification,
		item.Quantity, item.Unit, item.TargetPrice, item.UpdatedAt,
	)
	return err
}

// DeleteItem deletes an RFQ item
func (r *RFQRepositoryImpl) DeleteItem(ctx context.Context, id string) error {
	query := `DELETE FROM procurement_rfq_items WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// InviteSupplier invites a supplier to an RFQ
func (r *RFQRepositoryImpl) InviteSupplier(ctx context.Context, rfqSupplier *entities.RFQSupplier) error {
	query := `
		INSERT INTO procurement_rfq_suppliers (
			id, rfq_id, supplier_id, invited_at, status, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.ExecContext(ctx, query,
		rfqSupplier.ID, rfqSupplier.RFQID, rfqSupplier.SupplierID, rfqSupplier.InvitedAt,
		rfqSupplier.Status, rfqSupplier.CreatedAt, rfqSupplier.UpdatedAt,
	)
	return err
}

// GetRFQSuppliers retrieves all suppliers for an RFQ with supplier details
func (r *RFQRepositoryImpl) GetRFQSuppliers(ctx context.Context, rfqID string) ([]*entities.RFQSupplier, error) {
	query := `
		SELECT rs.id, rs.rfq_id, rs.supplier_id, rs.invited_at, rs.responded_at, rs.status,
			   rs.created_at, rs.updated_at,
			   COALESCE(s.name, '') as supplier_name
		FROM procurement_rfq_suppliers rs
		LEFT JOIN suppliers s ON rs.supplier_id = s.id
		WHERE rs.rfq_id = $1
		ORDER BY rs.invited_at ASC
	`

	var suppliers []*entities.RFQSupplier
	err := r.db.SelectContext(ctx, &suppliers, query, rfqID)
	if err != nil {
		return nil, err
	}

	return suppliers, nil
}

// RemoveSupplier removes a supplier from an RFQ
func (r *RFQRepositoryImpl) RemoveSupplier(ctx context.Context, rfqID, supplierID string) error {
	query := `DELETE FROM procurement_rfq_suppliers WHERE rfq_id = $1 AND supplier_id = $2`
	_, err := r.db.ExecContext(ctx, query, rfqID, supplierID)
	return err
}

// UpdateSupplierStatus updates supplier status for an RFQ
func (r *RFQRepositoryImpl) UpdateSupplierStatus(ctx context.Context, rfqID, supplierID, status string) error {
	now := utils.Now()
	query := `
		UPDATE procurement_rfq_suppliers
		SET status = $3, responded_at = $4, updated_at = $5
		WHERE rfq_id = $1 AND supplier_id = $2
	`
	_, err := r.db.ExecContext(ctx, query, rfqID, supplierID, status, now, now)
	return err
}

// CreateResponse creates a new RFQ response
func (r *RFQRepositoryImpl) CreateResponse(ctx context.Context, response *entities.RFQResponse) error {
	query := `
		INSERT INTO procurement_rfq_responses (
			id, rfq_id, supplier_id, response_date, total_amount, currency,
			delivery_time, validity_period, terms_conditions, notes, status,
			created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	`
	_, err := r.db.ExecContext(ctx, query,
		response.ID, response.RFQID, response.SupplierID, response.ResponseDate, response.TotalAmount,
		response.Currency, response.DeliveryTime, response.ValidityPeriod, response.TermsConditions,
		response.Notes, response.Status, response.CreatedAt, response.UpdatedAt,
	)
	return err
}

// GetRFQResponses retrieves all responses for an RFQ
func (r *RFQRepositoryImpl) GetRFQResponses(ctx context.Context, rfqID string) ([]*entities.RFQResponse, error) {
	query := `
		SELECT rr.id, rr.rfq_id, rr.supplier_id, rr.response_date, rr.total_amount, rr.currency,
			   rr.delivery_time, rr.validity_period, COALESCE(rr.terms_conditions, '') as terms_conditions,
			   COALESCE(rr.notes, '') as notes, rr.status, rr.created_at, rr.updated_at,
			   COALESCE(s.name, '') as supplier_name
		FROM procurement_rfq_responses rr
		LEFT JOIN suppliers s ON rr.supplier_id = s.id
		WHERE rr.rfq_id = $1
		ORDER BY rr.response_date DESC
	`

	var responses []*entities.RFQResponse
	err := r.db.SelectContext(ctx, &responses, query, rfqID)
	if err != nil {
		return nil, err
	}

	// Load response items for each response
	for _, resp := range responses {
		items, err := r.GetResponseItems(ctx, resp.ID.String())
		if err != nil {
			return nil, err
		}
		resp.ResponseItems = items
	}

	return responses, nil
}

// GetResponseBySupplier retrieves a supplier's response to an RFQ
func (r *RFQRepositoryImpl) GetResponseBySupplier(ctx context.Context, rfqID, supplierID string) (*entities.RFQResponse, error) {
	query := `
		SELECT id, rfq_id, supplier_id, response_date, total_amount, currency,
			   delivery_time, validity_period, COALESCE(terms_conditions, '') as terms_conditions,
			   COALESCE(notes, '') as notes, status, created_at, updated_at
		FROM procurement_rfq_responses
		WHERE rfq_id = $1 AND supplier_id = $2
	`

	response := &entities.RFQResponse{}
	err := r.db.QueryRowxContext(ctx, query, rfqID, supplierID).StructScan(response)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	// Load response items
	items, err := r.GetResponseItems(ctx, response.ID.String())
	if err != nil {
		return nil, err
	}
	response.ResponseItems = items

	return response, err
}

// GetResponseByID retrieves an RFQ response by its ID
func (r *RFQRepositoryImpl) GetResponseByID(ctx context.Context, id string) (*entities.RFQResponse, error) {
	query := `
		SELECT rr.id, rr.rfq_id, rr.supplier_id, rr.response_date, rr.total_amount, rr.currency,
			   rr.delivery_time, rr.validity_period, COALESCE(rr.terms_conditions, '') as terms_conditions,
			   COALESCE(rr.notes, '') as notes, rr.status, rr.created_at, rr.updated_at,
			   COALESCE(s.name, '') as supplier_name
		FROM procurement_rfq_responses rr
		LEFT JOIN suppliers s ON rr.supplier_id = s.id
		WHERE rr.id = $1
	`

	response := &entities.RFQResponse{}
	err := r.db.QueryRowxContext(ctx, query, id).StructScan(response)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	// Load response items
	items, err := r.GetResponseItems(ctx, response.ID.String())
	if err != nil {
		return nil, err
	}
	response.ResponseItems = items

	return response, nil
}

// UpdateResponse updates an RFQ response
func (r *RFQRepositoryImpl) UpdateResponse(ctx context.Context, response *entities.RFQResponse) error {
	query := `
		UPDATE procurement_rfq_responses
		SET total_amount = $2, currency = $3, delivery_time = $4, validity_period = $5,
			terms_conditions = $6, notes = $7, status = $8, updated_at = $9
		WHERE id = $1
	`
	response.UpdatedAt = utils.Now()
	_, err := r.db.ExecContext(ctx, query,
		response.ID, response.TotalAmount, response.Currency, response.DeliveryTime,
		response.ValidityPeriod, response.TermsConditions, response.Notes, response.Status, response.UpdatedAt,
	)
	return err
}

// AcceptResponse accepts an RFQ response
func (r *RFQRepositoryImpl) AcceptResponse(ctx context.Context, responseID string) error {
	query := `
		UPDATE procurement_rfq_responses
		SET status = 'accepted', updated_at = $2
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, query, responseID, utils.Now())
	return err
}

// RejectResponse rejects an RFQ response
func (r *RFQRepositoryImpl) RejectResponse(ctx context.Context, responseID, reason string) error {
	query := `
		UPDATE procurement_rfq_responses
		SET status = 'rejected', notes = CONCAT(COALESCE(notes, ''), ' [Rejection reason: ', $2, ']'), updated_at = $3
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, query, responseID, reason, utils.Now())
	return err
}

// CreateResponseItem creates a new RFQ response item
func (r *RFQRepositoryImpl) CreateResponseItem(ctx context.Context, item *entities.RFQResponseItem) error {
	query := `
		INSERT INTO procurement_rfq_response_items (
			id, rfq_response_id, rfq_item_id, unit_price, total_price,
			delivery_time, notes, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.db.ExecContext(ctx, query,
		item.ID, item.RFQResponseID, item.RFQItemID, item.UnitPrice, item.TotalPrice,
		item.DeliveryTime, item.Notes, item.CreatedAt, item.UpdatedAt,
	)
	return err
}

// GetResponseItems retrieves all items for an RFQ response
func (r *RFQRepositoryImpl) GetResponseItems(ctx context.Context, responseID string) ([]*entities.RFQResponseItem, error) {
	query := `
		SELECT ri.id, ri.rfq_response_id, ri.rfq_item_id, ri.unit_price, ri.total_price,
			   ri.delivery_time, COALESCE(ri.notes, '') as notes, ri.created_at, ri.updated_at
		FROM procurement_rfq_response_items ri
		WHERE ri.rfq_response_id = $1
		ORDER BY ri.created_at ASC
	`

	var items []*entities.RFQResponseItem
	err := r.db.SelectContext(ctx, &items, query, responseID)
	return items, err
}

// GetRFQStats retrieves RFQ statistics
func (r *RFQRepositoryImpl) GetRFQStats(ctx context.Context) (map[string]interface{}, error) {
	query := `
		SELECT
			COUNT(*) as total_rfqs,
			COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_rfqs,
			COUNT(CASE WHEN status = 'published' THEN 1 END) as published_rfqs,
			COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_rfqs,
			COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_rfqs,
			COUNT(CASE WHEN due_date < NOW() AND status = 'published' THEN 1 END) as overdue_rfqs
		FROM procurement_rfqs
		WHERE deleted_at IS NULL
	`

	var result struct {
		TotalRFQs     int `db:"total_rfqs"`
		DraftRFQs     int `db:"draft_rfqs"`
		PublishedRFQs int `db:"published_rfqs"`
		ClosedRFQs    int `db:"closed_rfqs"`
		CancelledRFQs int `db:"cancelled_rfqs"`
		OverdueRFQs   int `db:"overdue_rfqs"`
	}

	err := r.db.GetContext(ctx, &result, query)
	if err != nil {
		return nil, err
	}

	stats := map[string]interface{}{
		"total_rfqs":     result.TotalRFQs,
		"draft_rfqs":     result.DraftRFQs,
		"published_rfqs": result.PublishedRFQs,
		"closed_rfqs":    result.ClosedRFQs,
		"cancelled_rfqs": result.CancelledRFQs,
		"overdue_rfqs":   result.OverdueRFQs,
	}

	return stats, nil
}
