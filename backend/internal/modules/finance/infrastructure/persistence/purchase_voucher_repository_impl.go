package persistence

import (
	"context"
	"database/sql"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
)

type purchaseVoucherRepositoryImpl struct {
	db *sql.DB
}

func NewPurchaseVoucherRepository(db *sql.DB) repositories.PurchaseVoucherRepository {
	return &purchaseVoucherRepositoryImpl{
		db: db,
	}
}

func (r *purchaseVoucherRepositoryImpl) Create(ctx context.Context, voucher *entities.PurchaseVoucher) error {
	query := `
		INSERT INTO purchase_vouchers (
			id, voucher_number, voucher_date, supplier_id, invoice_id,
			total_amount, tax_amount, grand_total, due_date, status,
			description, approved_by, approved_at, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`

	_, err := r.db.ExecContext(ctx, query,
		voucher.ID, voucher.VoucherNumber, voucher.VoucherDate, voucher.SupplierID, voucher.InvoiceID,
		voucher.TotalAmount, voucher.TaxAmount, voucher.GrandTotal, voucher.DueDate, voucher.Status,
		voucher.Description, voucher.ApprovedBy, voucher.ApprovedAt, voucher.CreatedAt, voucher.UpdatedAt,
	)

	return err
}

func (r *purchaseVoucherRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.PurchaseVoucher, error) {
	voucher := &entities.PurchaseVoucher{}
	query := `
		SELECT id, voucher_number, voucher_date, supplier_id, invoice_id,
			   total_amount, tax_amount, grand_total, due_date, status,
			   description, approved_by, approved_at, created_at, updated_at
		FROM purchase_vouchers WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&voucher.ID, &voucher.VoucherNumber, &voucher.VoucherDate, &voucher.SupplierID, &voucher.InvoiceID,
		&voucher.TotalAmount, &voucher.TaxAmount, &voucher.GrandTotal, &voucher.DueDate, &voucher.Status,
		&voucher.Description, &voucher.ApprovedBy, &voucher.ApprovedAt, &voucher.CreatedAt, &voucher.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return voucher, nil
}

func (r *purchaseVoucherRepositoryImpl) GetAll(ctx context.Context) ([]*entities.PurchaseVoucher, error) {
	query := `
		SELECT id, voucher_number, voucher_date, supplier_id, invoice_id,
			   total_amount, tax_amount, grand_total, due_date, status,
			   description, approved_by, approved_at, created_at, updated_at
		FROM purchase_vouchers ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var vouchers []*entities.PurchaseVoucher
	for rows.Next() {
		voucher := &entities.PurchaseVoucher{}
		err := rows.Scan(
			&voucher.ID, &voucher.VoucherNumber, &voucher.VoucherDate, &voucher.SupplierID, &voucher.InvoiceID,
			&voucher.TotalAmount, &voucher.TaxAmount, &voucher.GrandTotal, &voucher.DueDate, &voucher.Status,
			&voucher.Description, &voucher.ApprovedBy, &voucher.ApprovedAt, &voucher.CreatedAt, &voucher.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		vouchers = append(vouchers, voucher)
	}

	return vouchers, nil
}

func (r *purchaseVoucherRepositoryImpl) Update(ctx context.Context, voucher *entities.PurchaseVoucher) error {
	query := `
		UPDATE purchase_vouchers SET
			voucher_number = $2, voucher_date = $3, supplier_id = $4, invoice_id = $5,
			total_amount = $6, tax_amount = $7, grand_total = $8, due_date = $9, status = $10,
			description = $11, approved_by = $12, approved_at = $13, updated_at = $14
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		voucher.ID, voucher.VoucherNumber, voucher.VoucherDate, voucher.SupplierID, voucher.InvoiceID,
		voucher.TotalAmount, voucher.TaxAmount, voucher.GrandTotal, voucher.DueDate, voucher.Status,
		voucher.Description, voucher.ApprovedBy, voucher.ApprovedAt, voucher.UpdatedAt,
	)

	return err
}

func (r *purchaseVoucherRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM purchase_vouchers WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *purchaseVoucherRepositoryImpl) GetByStatus(ctx context.Context, status string) ([]*entities.PurchaseVoucher, error) {
	query := `
		SELECT id, voucher_number, voucher_date, supplier_id, invoice_id,
			   total_amount, tax_amount, grand_total, due_date, status,
			   description, approved_by, approved_at, created_at, updated_at
		FROM purchase_vouchers WHERE status = $1 ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var vouchers []*entities.PurchaseVoucher
	for rows.Next() {
		voucher := &entities.PurchaseVoucher{}
		err := rows.Scan(
			&voucher.ID, &voucher.VoucherNumber, &voucher.VoucherDate, &voucher.SupplierID, &voucher.InvoiceID,
			&voucher.TotalAmount, &voucher.TaxAmount, &voucher.GrandTotal, &voucher.DueDate, &voucher.Status,
			&voucher.Description, &voucher.ApprovedBy, &voucher.ApprovedAt, &voucher.CreatedAt, &voucher.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		vouchers = append(vouchers, voucher)
	}

	return vouchers, nil
}

func (r *purchaseVoucherRepositoryImpl) GetBySupplierID(ctx context.Context, supplierID string) ([]*entities.PurchaseVoucher, error) {
	query := `
		SELECT id, voucher_number, voucher_date, supplier_id, invoice_id,
			   total_amount, tax_amount, grand_total, due_date, status,
			   description, approved_by, approved_at, created_at, updated_at
		FROM purchase_vouchers WHERE supplier_id = $1 ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, supplierID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var vouchers []*entities.PurchaseVoucher
	for rows.Next() {
		voucher := &entities.PurchaseVoucher{}
		err := rows.Scan(
			&voucher.ID, &voucher.VoucherNumber, &voucher.VoucherDate, &voucher.SupplierID, &voucher.InvoiceID,
			&voucher.TotalAmount, &voucher.TaxAmount, &voucher.GrandTotal, &voucher.DueDate, &voucher.Status,
			&voucher.Description, &voucher.ApprovedBy, &voucher.ApprovedAt, &voucher.CreatedAt, &voucher.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		vouchers = append(vouchers, voucher)
	}

	return vouchers, nil
}

func (r *purchaseVoucherRepositoryImpl) GetByVoucherNumber(ctx context.Context, voucherNumber string) (*entities.PurchaseVoucher, error) {
	voucher := &entities.PurchaseVoucher{}
	query := `
		SELECT id, voucher_number, voucher_date, supplier_id, invoice_id,
			   total_amount, tax_amount, grand_total, due_date, status,
			   description, approved_by, approved_at, created_at, updated_at
		FROM purchase_vouchers WHERE voucher_number = $1`

	err := r.db.QueryRowContext(ctx, query, voucherNumber).Scan(
		&voucher.ID, &voucher.VoucherNumber, &voucher.VoucherDate, &voucher.SupplierID, &voucher.InvoiceID,
		&voucher.TotalAmount, &voucher.TaxAmount, &voucher.GrandTotal, &voucher.DueDate, &voucher.Status,
		&voucher.Description, &voucher.ApprovedBy, &voucher.ApprovedAt, &voucher.CreatedAt, &voucher.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return voucher, nil
}