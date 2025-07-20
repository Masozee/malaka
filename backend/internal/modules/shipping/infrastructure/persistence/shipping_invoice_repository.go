package persistence

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"malaka/internal/modules/shipping/domain/entities"
	"malaka/internal/modules/shipping/domain/repositories"
)

// shippingInvoiceRepositoryImpl implements the ShippingInvoiceRepository interface.
type shippingInvoiceRepositoryImpl struct {
	db *sqlx.DB
}

// NewShippingInvoiceRepositoryImpl creates a new ShippingInvoiceRepository instance.
func NewShippingInvoiceRepositoryImpl(db *sqlx.DB) repositories.ShippingInvoiceRepository {
	return &shippingInvoiceRepositoryImpl{
		db: db,
	}
}

// CreateShippingInvoice creates a new shipping invoice.
func (r *shippingInvoiceRepositoryImpl) CreateShippingInvoice(ctx context.Context, invoice *entities.ShippingInvoice) error {
	query := `
		INSERT INTO shipping_invoices (
			id, invoice_number, shipment_id, courier_id, invoice_date, due_date,
			origin, destination, weight, base_rate, additional_fees, tax_amount,
			total_amount, status, notes, created_at, updated_at
		) VALUES (
			:id, :invoice_number, :shipment_id, :courier_id, :invoice_date, :due_date,
			:origin, :destination, :weight, :base_rate, :additional_fees, :tax_amount,
			:total_amount, :status, :notes, :created_at, :updated_at
		)`

	now := time.Now()
	invoice.CreatedAt = now
	invoice.UpdatedAt = now

	_, err := r.db.NamedExecContext(ctx, query, invoice)
	return err
}

// GetShippingInvoiceByID retrieves a shipping invoice by ID.
func (r *shippingInvoiceRepositoryImpl) GetShippingInvoiceByID(ctx context.Context, id uuid.UUID) (*entities.ShippingInvoice, error) {
	query := `
		SELECT id, invoice_number, shipment_id, courier_id, invoice_date, due_date,
			   origin, destination, weight, base_rate, additional_fees, tax_amount,
			   total_amount, status, paid_at, notes, created_at, updated_at
		FROM shipping_invoices
		WHERE id = $1`

	var invoice entities.ShippingInvoice
	err := r.db.GetContext(ctx, &invoice, query, id)
	if err != nil {
		return nil, err
	}

	return &invoice, nil
}

// GetShippingInvoiceByInvoiceNumber retrieves a shipping invoice by invoice number.
func (r *shippingInvoiceRepositoryImpl) GetShippingInvoiceByInvoiceNumber(ctx context.Context, invoiceNumber string) (*entities.ShippingInvoice, error) {
	query := `
		SELECT id, invoice_number, shipment_id, courier_id, invoice_date, due_date,
			   origin, destination, weight, base_rate, additional_fees, tax_amount,
			   total_amount, status, paid_at, notes, created_at, updated_at
		FROM shipping_invoices
		WHERE invoice_number = $1`

	var invoice entities.ShippingInvoice
	err := r.db.GetContext(ctx, &invoice, query, invoiceNumber)
	if err != nil {
		return nil, err
	}

	return &invoice, nil
}

// GetShippingInvoicesByShipmentID retrieves shipping invoices by shipment ID.
func (r *shippingInvoiceRepositoryImpl) GetShippingInvoicesByShipmentID(ctx context.Context, shipmentID uuid.UUID) ([]entities.ShippingInvoice, error) {
	query := `
		SELECT id, invoice_number, shipment_id, courier_id, invoice_date, due_date,
			   origin, destination, weight, base_rate, additional_fees, tax_amount,
			   total_amount, status, paid_at, notes, created_at, updated_at
		FROM shipping_invoices
		WHERE shipment_id = $1
		ORDER BY created_at DESC`

	var invoices []entities.ShippingInvoice
	err := r.db.SelectContext(ctx, &invoices, query, shipmentID)
	if err != nil {
		return nil, err
	}

	return invoices, nil
}

// GetShippingInvoicesByCourierID retrieves shipping invoices by courier ID.
func (r *shippingInvoiceRepositoryImpl) GetShippingInvoicesByCourierID(ctx context.Context, courierID uuid.UUID) ([]entities.ShippingInvoice, error) {
	query := `
		SELECT id, invoice_number, shipment_id, courier_id, invoice_date, due_date,
			   origin, destination, weight, base_rate, additional_fees, tax_amount,
			   total_amount, status, paid_at, notes, created_at, updated_at
		FROM shipping_invoices
		WHERE courier_id = $1
		ORDER BY created_at DESC`

	var invoices []entities.ShippingInvoice
	err := r.db.SelectContext(ctx, &invoices, query, courierID)
	if err != nil {
		return nil, err
	}

	return invoices, nil
}

// GetShippingInvoicesByStatus retrieves shipping invoices by status.
func (r *shippingInvoiceRepositoryImpl) GetShippingInvoicesByStatus(ctx context.Context, status string) ([]entities.ShippingInvoice, error) {
	query := `
		SELECT id, invoice_number, shipment_id, courier_id, invoice_date, due_date,
			   origin, destination, weight, base_rate, additional_fees, tax_amount,
			   total_amount, status, paid_at, notes, created_at, updated_at
		FROM shipping_invoices
		WHERE status = $1
		ORDER BY created_at DESC`

	var invoices []entities.ShippingInvoice
	err := r.db.SelectContext(ctx, &invoices, query, status)
	if err != nil {
		return nil, err
	}

	return invoices, nil
}

// GetAllShippingInvoices retrieves all shipping invoices with pagination.
func (r *shippingInvoiceRepositoryImpl) GetAllShippingInvoices(ctx context.Context, page, pageSize int) ([]entities.ShippingInvoice, int, error) {
	offset := (page - 1) * pageSize

	// Get total count
	countQuery := `SELECT COUNT(*) FROM shipping_invoices`
	var totalCount int
	err := r.db.GetContext(ctx, &totalCount, countQuery)
	if err != nil {
		return nil, 0, err
	}

	// Get paginated results
	query := `
		SELECT id, invoice_number, shipment_id, courier_id, invoice_date, due_date,
			   origin, destination, weight, base_rate, additional_fees, tax_amount,
			   total_amount, status, paid_at, notes, created_at, updated_at
		FROM shipping_invoices
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2`

	var invoices []entities.ShippingInvoice
	err = r.db.SelectContext(ctx, &invoices, query, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}

	return invoices, totalCount, nil
}

// UpdateShippingInvoice updates an existing shipping invoice.
func (r *shippingInvoiceRepositoryImpl) UpdateShippingInvoice(ctx context.Context, invoice *entities.ShippingInvoice) error {
	query := `
		UPDATE shipping_invoices SET
			invoice_date = :invoice_date,
			due_date = :due_date,
			origin = :origin,
			destination = :destination,
			weight = :weight,
			base_rate = :base_rate,
			additional_fees = :additional_fees,
			tax_amount = :tax_amount,
			total_amount = :total_amount,
			status = :status,
			paid_at = :paid_at,
			notes = :notes,
			updated_at = :updated_at
		WHERE id = :id`

	invoice.UpdatedAt = time.Now()

	_, err := r.db.NamedExecContext(ctx, query, invoice)
	return err
}

// DeleteShippingInvoice deletes a shipping invoice by ID.
func (r *shippingInvoiceRepositoryImpl) DeleteShippingInvoice(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM shipping_invoices WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetOverdueShippingInvoices retrieves overdue shipping invoices.
func (r *shippingInvoiceRepositoryImpl) GetOverdueShippingInvoices(ctx context.Context) ([]entities.ShippingInvoice, error) {
	query := `
		SELECT id, invoice_number, shipment_id, courier_id, invoice_date, due_date,
			   origin, destination, weight, base_rate, additional_fees, tax_amount,
			   total_amount, status, paid_at, notes, created_at, updated_at
		FROM shipping_invoices
		WHERE status = 'PENDING' AND due_date < NOW()
		ORDER BY due_date ASC`

	var invoices []entities.ShippingInvoice
	err := r.db.SelectContext(ctx, &invoices, query)
	if err != nil {
		return nil, err
	}

	return invoices, nil
}