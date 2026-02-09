package persistence

import (
	"context"
	"database/sql"
	"time"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/repositories"
	"malaka/internal/shared/uuid"
)

// RFQRepositoryImpl implements the RFQRepository interface
type RFQRepositoryImpl struct {
	db *sql.DB
}

// NewRFQRepository creates a new RFQ repository
func NewRFQRepository(db *sql.DB) repositories.RFQRepository {
	return &RFQRepositoryImpl{db: db}
}

// Create creates a new RFQ
func (r *RFQRepositoryImpl) Create(ctx context.Context, rfq *entities.RFQ) error {
	query := `
		INSERT INTO rfqs (id, rfq_number, title, description, status, priority, created_by, due_date, published_at, closed_at, created_at, updated_at)
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
		SELECT id, rfq_number, title, description, status, priority, created_by, due_date, 
			   published_at, closed_at, created_at, updated_at
		FROM rfqs
		WHERE id = $1
	`
	
	rfq := &entities.RFQ{}
	row := r.db.QueryRowContext(ctx, query, id)
	
	err := row.Scan(
		&rfq.ID, &rfq.RFQNumber, &rfq.Title, &rfq.Description, &rfq.Status, &rfq.Priority,
		&rfq.CreatedBy, &rfq.DueDate, &rfq.PublishedAt, &rfq.ClosedAt, &rfq.CreatedAt, &rfq.UpdatedAt,
	)
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

// GetAll retrieves all RFQs with basic supplier information
func (r *RFQRepositoryImpl) GetAll(ctx context.Context) ([]*entities.RFQ, error) {
	query := `
		SELECT r.id, r.rfq_number, r.title, r.description, r.status, r.priority, r.created_by, 
			   r.due_date, r.published_at, r.closed_at, r.created_at, r.updated_at
		FROM rfqs r
		ORDER BY r.created_at DESC
	`
	
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var rfqs []*entities.RFQ
	for rows.Next() {
		rfq := &entities.RFQ{}
		err := rows.Scan(
			&rfq.ID, &rfq.RFQNumber, &rfq.Title, &rfq.Description, &rfq.Status, &rfq.Priority,
			&rfq.CreatedBy, &rfq.DueDate, &rfq.PublishedAt, &rfq.ClosedAt, &rfq.CreatedAt, &rfq.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		
		// Load basic item count and supplier count for list view
		rfq.Items, _ = r.GetRFQItems(ctx, rfq.ID.String())
		rfq.Suppliers, _ = r.GetRFQSuppliers(ctx, rfq.ID.String())

		rfqs = append(rfqs, rfq)
	}
	
	return rfqs, nil
}

// Update updates an existing RFQ
func (r *RFQRepositoryImpl) Update(ctx context.Context, rfq *entities.RFQ) error {
	query := `
		UPDATE rfqs 
		SET rfq_number = $2, title = $3, description = $4, status = $5, priority = $6,
			created_by = $7, due_date = $8, published_at = $9, closed_at = $10, updated_at = $11
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, query,
		rfq.ID, rfq.RFQNumber, rfq.Title, rfq.Description, rfq.Status, rfq.Priority,
		rfq.CreatedBy, rfq.DueDate, rfq.PublishedAt, rfq.ClosedAt, rfq.UpdatedAt,
	)
	return err
}

// Delete deletes an RFQ
func (r *RFQRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM rfqs WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetByRFQNumber retrieves an RFQ by its RFQ number
func (r *RFQRepositoryImpl) GetByRFQNumber(ctx context.Context, rfqNumber string) (*entities.RFQ, error) {
	query := `
		SELECT id, rfq_number, title, description, status, priority, created_by, due_date, 
			   published_at, closed_at, created_at, updated_at
		FROM rfqs
		WHERE rfq_number = $1
	`
	
	rfq := &entities.RFQ{}
	row := r.db.QueryRowContext(ctx, query, rfqNumber)
	
	err := row.Scan(
		&rfq.ID, &rfq.RFQNumber, &rfq.Title, &rfq.Description, &rfq.Status, &rfq.Priority,
		&rfq.CreatedBy, &rfq.DueDate, &rfq.PublishedAt, &rfq.ClosedAt, &rfq.CreatedAt, &rfq.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return rfq, err
}

// GetByStatus retrieves RFQs by status
func (r *RFQRepositoryImpl) GetByStatus(ctx context.Context, status string) ([]*entities.RFQ, error) {
	query := `
		SELECT id, rfq_number, title, description, status, priority, created_by, due_date, 
			   published_at, closed_at, created_at, updated_at
		FROM rfqs
		WHERE status = $1
		ORDER BY created_at DESC
	`
	
	rows, err := r.db.QueryContext(ctx, query, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var rfqs []*entities.RFQ
	for rows.Next() {
		rfq := &entities.RFQ{}
		err := rows.Scan(
			&rfq.ID, &rfq.RFQNumber, &rfq.Title, &rfq.Description, &rfq.Status, &rfq.Priority,
			&rfq.CreatedBy, &rfq.DueDate, &rfq.PublishedAt, &rfq.ClosedAt, &rfq.CreatedAt, &rfq.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		rfqs = append(rfqs, rfq)
	}
	
	return rfqs, nil
}

// GetByCreatedBy retrieves RFQs created by a specific user
func (r *RFQRepositoryImpl) GetByCreatedBy(ctx context.Context, createdBy string) ([]*entities.RFQ, error) {
	query := `
		SELECT id, rfq_number, title, description, status, priority, created_by, due_date, 
			   published_at, closed_at, created_at, updated_at
		FROM rfqs
		WHERE created_by = $1
		ORDER BY created_at DESC
	`
	
	rows, err := r.db.QueryContext(ctx, query, createdBy)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var rfqs []*entities.RFQ
	for rows.Next() {
		rfq := &entities.RFQ{}
		err := rows.Scan(
			&rfq.ID, &rfq.RFQNumber, &rfq.Title, &rfq.Description, &rfq.Status, &rfq.Priority,
			&rfq.CreatedBy, &rfq.DueDate, &rfq.PublishedAt, &rfq.ClosedAt, &rfq.CreatedAt, &rfq.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		rfqs = append(rfqs, rfq)
	}
	
	return rfqs, nil
}

// PublishRFQ publishes an RFQ
func (r *RFQRepositoryImpl) PublishRFQ(ctx context.Context, id string) error {
	query := `
		UPDATE rfqs 
		SET status = 'published', published_at = $2, updated_at = $3
		WHERE id = $1
	`
	now := time.Now()
	_, err := r.db.ExecContext(ctx, query, id, now, now)
	return err
}

// CloseRFQ closes an RFQ
func (r *RFQRepositoryImpl) CloseRFQ(ctx context.Context, id string) error {
	query := `
		UPDATE rfqs 
		SET status = 'closed', closed_at = $2, updated_at = $3
		WHERE id = $1
	`
	now := time.Now()
	_, err := r.db.ExecContext(ctx, query, id, now, now)
	return err
}

// GetRFQItems retrieves all items for an RFQ
func (r *RFQRepositoryImpl) GetRFQItems(ctx context.Context, rfqID string) ([]*entities.RFQItem, error) {
	query := `
		SELECT id, rfq_id, item_name, description, specification, quantity, unit, target_price, created_at, updated_at
		FROM rfq_items
		WHERE rfq_id = $1
		ORDER BY created_at ASC
	`
	
	rows, err := r.db.QueryContext(ctx, query, rfqID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var items []*entities.RFQItem
	for rows.Next() {
		item := &entities.RFQItem{}
		err := rows.Scan(
			&item.ID, &item.RFQID, &item.ItemName, &item.Description, &item.Specification,
			&item.Quantity, &item.Unit, &item.TargetPrice, &item.CreatedAt, &item.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	
	return items, nil
}

// GetRFQSuppliers retrieves all suppliers for an RFQ with supplier details
func (r *RFQRepositoryImpl) GetRFQSuppliers(ctx context.Context, rfqID string) ([]*entities.RFQSupplier, error) {
	query := `
		SELECT rs.id, rs.rfq_id, rs.supplier_id, rs.invited_at, rs.responded_at, rs.status, 
			   rs.created_at, rs.updated_at,
			   s.id, s.name, s.contact, s.address
		FROM rfq_suppliers rs
		LEFT JOIN suppliers s ON rs.supplier_id = s.id
		WHERE rs.rfq_id = $1
		ORDER BY rs.invited_at ASC
	`
	
	rows, err := r.db.QueryContext(ctx, query, rfqID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var rfqSuppliers []*entities.RFQSupplier
	for rows.Next() {
		rfqSupplier := &entities.RFQSupplier{}
		supplier := &entities.Supplier{}
		
		var supplierID, supplierName, supplierContact, supplierAddress sql.NullString
		
		err := rows.Scan(
			&rfqSupplier.ID, &rfqSupplier.RFQID, &rfqSupplier.SupplierID, &rfqSupplier.InvitedAt,
			&rfqSupplier.RespondedAt, &rfqSupplier.Status, &rfqSupplier.CreatedAt, &rfqSupplier.UpdatedAt,
			&supplierID, &supplierName, &supplierContact, &supplierAddress,
		)
		if err != nil {
			return nil, err
		}
		
		if supplierID.Valid {
			supplier.ID, _ = uuid.Parse(supplierID.String)
			supplier.Name = supplierName.String
			supplier.ContactPerson = supplierContact.String
			supplier.Address = supplierAddress.String
			rfqSupplier.Supplier = supplier
		}

		rfqSuppliers = append(rfqSuppliers, rfqSupplier)
	}

	return rfqSuppliers, nil
}

// GetRFQResponses retrieves all responses for an RFQ
func (r *RFQRepositoryImpl) GetRFQResponses(ctx context.Context, rfqID string) ([]*entities.RFQResponse, error) {
	query := `
		SELECT rr.id, rr.rfq_id, rr.supplier_id, rr.response_date, rr.total_amount, rr.currency,
			   rr.delivery_time, rr.validity_period, rr.terms_conditions, rr.notes, rr.status,
			   rr.created_at, rr.updated_at,
			   s.id, s.name, s.contact, s.address
		FROM rfq_responses rr
		LEFT JOIN suppliers s ON rr.supplier_id = s.id
		WHERE rr.rfq_id = $1
		ORDER BY rr.response_date DESC
	`
	
	rows, err := r.db.QueryContext(ctx, query, rfqID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var responses []*entities.RFQResponse
	for rows.Next() {
		response := &entities.RFQResponse{}
		supplier := &entities.Supplier{}
		
		var supplierID, supplierName, supplierContact, supplierAddress sql.NullString
		
		err := rows.Scan(
			&response.ID, &response.RFQID, &response.SupplierID, &response.ResponseDate,
			&response.TotalAmount, &response.Currency, &response.DeliveryTime, &response.ValidityPeriod,
			&response.TermsConditions, &response.Notes, &response.Status, &response.CreatedAt, &response.UpdatedAt,
			&supplierID, &supplierName, &supplierContact, &supplierAddress,
		)
		if err != nil {
			return nil, err
		}
		
		if supplierID.Valid {
			supplier.ID, _ = uuid.Parse(supplierID.String)
			supplier.Name = supplierName.String
			supplier.ContactPerson = supplierContact.String
			supplier.Address = supplierAddress.String
			response.Supplier = supplier
		}

		responses = append(responses, response)
	}

	return responses, nil
}

// CreateItem creates a new RFQ item
func (r *RFQRepositoryImpl) CreateItem(ctx context.Context, item *entities.RFQItem) error {
	query := `
		INSERT INTO rfq_items (id, rfq_id, item_name, description, specification, quantity, unit, target_price, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.ExecContext(ctx, query,
		item.ID, item.RFQID, item.ItemName, item.Description, item.Specification,
		item.Quantity, item.Unit, item.TargetPrice, item.CreatedAt, item.UpdatedAt,
	)
	return err
}

// UpdateItem updates an RFQ item
func (r *RFQRepositoryImpl) UpdateItem(ctx context.Context, item *entities.RFQItem) error {
	query := `
		UPDATE rfq_items 
		SET item_name = $2, description = $3, specification = $4, quantity = $5, unit = $6, target_price = $7, updated_at = $8
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, query,
		item.ID, item.ItemName, item.Description, item.Specification,
		item.Quantity, item.Unit, item.TargetPrice, item.UpdatedAt,
	)
	return err
}

// DeleteItem deletes an RFQ item
func (r *RFQRepositoryImpl) DeleteItem(ctx context.Context, id string) error {
	query := `DELETE FROM rfq_items WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// InviteSupplier invites a supplier to an RFQ
func (r *RFQRepositoryImpl) InviteSupplier(ctx context.Context, rfqSupplier *entities.RFQSupplier) error {
	query := `
		INSERT INTO rfq_suppliers (id, rfq_id, supplier_id, invited_at, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.ExecContext(ctx, query,
		rfqSupplier.ID, rfqSupplier.RFQID, rfqSupplier.SupplierID, rfqSupplier.InvitedAt,
		rfqSupplier.Status, rfqSupplier.CreatedAt, rfqSupplier.UpdatedAt,
	)
	return err
}

// RemoveSupplier removes a supplier from an RFQ
func (r *RFQRepositoryImpl) RemoveSupplier(ctx context.Context, rfqID, supplierID string) error {
	query := `DELETE FROM rfq_suppliers WHERE rfq_id = $1 AND supplier_id = $2`
	_, err := r.db.ExecContext(ctx, query, rfqID, supplierID)
	return err
}

// CreateResponse creates a new RFQ response
func (r *RFQRepositoryImpl) CreateResponse(ctx context.Context, response *entities.RFQResponse) error {
	query := `
		INSERT INTO rfq_responses (id, rfq_id, supplier_id, response_date, total_amount, currency, delivery_time, validity_period, terms_conditions, notes, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	`
	_, err := r.db.ExecContext(ctx, query,
		response.ID, response.RFQID, response.SupplierID, response.ResponseDate, response.TotalAmount,
		response.Currency, response.DeliveryTime, response.ValidityPeriod, response.TermsConditions,
		response.Notes, response.Status, response.CreatedAt, response.UpdatedAt,
	)
	return err
}

// GetResponseBySupplier retrieves a supplier's response to an RFQ
func (r *RFQRepositoryImpl) GetResponseBySupplier(ctx context.Context, rfqID, supplierID string) (*entities.RFQResponse, error) {
	query := `
		SELECT id, rfq_id, supplier_id, response_date, total_amount, currency, delivery_time, validity_period, terms_conditions, notes, status, created_at, updated_at
		FROM rfq_responses
		WHERE rfq_id = $1 AND supplier_id = $2
	`
	
	response := &entities.RFQResponse{}
	row := r.db.QueryRowContext(ctx, query, rfqID, supplierID)
	
	err := row.Scan(
		&response.ID, &response.RFQID, &response.SupplierID, &response.ResponseDate,
		&response.TotalAmount, &response.Currency, &response.DeliveryTime, &response.ValidityPeriod,
		&response.TermsConditions, &response.Notes, &response.Status, &response.CreatedAt, &response.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return response, err
}

// UpdateResponse updates an RFQ response
func (r *RFQRepositoryImpl) UpdateResponse(ctx context.Context, response *entities.RFQResponse) error {
	query := `
		UPDATE rfq_responses 
		SET total_amount = $3, currency = $4, delivery_time = $5, validity_period = $6, terms_conditions = $7, notes = $8, status = $9, updated_at = $10
		WHERE rfq_id = $1 AND supplier_id = $2
	`
	_, err := r.db.ExecContext(ctx, query,
		response.RFQID, response.SupplierID, response.TotalAmount, response.Currency,
		response.DeliveryTime, response.ValidityPeriod, response.TermsConditions, response.Notes,
		response.Status, response.UpdatedAt,
	)
	return err
}

// GetRFQStats retrieves RFQ statistics
func (r *RFQRepositoryImpl) GetRFQStats(ctx context.Context) (map[string]interface{}, error) {
	query := `
		SELECT 
			COUNT(*) as total_rfqs,
			COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_rfqs,
			COUNT(CASE WHEN status = 'published' THEN 1 END) as published_rfqs,
			COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_rfqs,
			COUNT(CASE WHEN due_date < NOW() AND status = 'published' THEN 1 END) as overdue_rfqs
		FROM rfqs
	`
	
	row := r.db.QueryRowContext(ctx, query)
	
	var totalRFQs, draftRFQs, publishedRFQs, closedRFQs, overdueRFQs int
	err := row.Scan(&totalRFQs, &draftRFQs, &publishedRFQs, &closedRFQs, &overdueRFQs)
	if err != nil {
		return nil, err
	}
	
	stats := map[string]interface{}{
		"total_rfqs":     totalRFQs,
		"draft_rfqs":     draftRFQs,
		"published_rfqs": publishedRFQs,
		"closed_rfqs":    closedRFQs,
		"overdue_rfqs":   overdueRFQs,
	}
	
	return stats, nil
}