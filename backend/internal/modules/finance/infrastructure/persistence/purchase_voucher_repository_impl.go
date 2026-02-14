package persistence

import (
	"context"
	"database/sql"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/modules/finance/domain/repositories"
	"malaka/internal/shared/uuid"
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
	if voucher.ID.IsNil() {
		voucher.ID = uuid.New()
	}

	query := `
		INSERT INTO purchase_vouchers (
			id, voucher_number, supplier_id, voucher_date, due_date,
			total_amount, paid_amount, remaining_amount, discount_amount, tax_amount,
			description, status, approved_by, approved_at, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`

	_, err := r.db.ExecContext(ctx, query,
		voucher.ID, voucher.VoucherNumber, voucher.SupplierID, voucher.VoucherDate, voucher.DueDate,
		voucher.TotalAmount, voucher.PaidAmount, voucher.RemainingAmount, voucher.DiscountAmount, voucher.TaxAmount,
		voucher.Description, voucher.Status, voucher.ApprovedBy, voucher.ApprovedAt, voucher.CreatedAt, voucher.UpdatedAt,
	)

	return err
}

func (r *purchaseVoucherRepositoryImpl) GetByID(ctx context.Context, id uuid.ID) (*entities.PurchaseVoucher, error) {
	voucher := &entities.PurchaseVoucher{}
	query := `
		SELECT id, voucher_number, supplier_id, voucher_date, COALESCE(due_date, '0001-01-01'),
			   total_amount, COALESCE(paid_amount, 0), remaining_amount, COALESCE(discount_amount, 0), COALESCE(tax_amount, 0),
			   COALESCE(description, ''), COALESCE(status, ''), approved_by, approved_at, created_at, updated_at
		FROM purchase_vouchers WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&voucher.ID, &voucher.VoucherNumber, &voucher.SupplierID, &voucher.VoucherDate, &voucher.DueDate,
		&voucher.TotalAmount, &voucher.PaidAmount, &voucher.RemainingAmount, &voucher.DiscountAmount, &voucher.TaxAmount,
		&voucher.Description, &voucher.Status, &voucher.ApprovedBy, &voucher.ApprovedAt, &voucher.CreatedAt, &voucher.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return voucher, nil
}

func (r *purchaseVoucherRepositoryImpl) GetAll(ctx context.Context) ([]*entities.PurchaseVoucher, error) {
	query := `
		SELECT id, voucher_number, supplier_id, voucher_date, COALESCE(due_date, '0001-01-01'),
			   total_amount, COALESCE(paid_amount, 0), remaining_amount, COALESCE(discount_amount, 0), COALESCE(tax_amount, 0),
			   COALESCE(description, ''), COALESCE(status, ''), approved_by, approved_at, created_at, updated_at
		FROM purchase_vouchers ORDER BY created_at DESC LIMIT 500`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var vouchers []*entities.PurchaseVoucher
	for rows.Next() {
		voucher := &entities.PurchaseVoucher{}
		err := rows.Scan(
			&voucher.ID, &voucher.VoucherNumber, &voucher.SupplierID, &voucher.VoucherDate, &voucher.DueDate,
			&voucher.TotalAmount, &voucher.PaidAmount, &voucher.RemainingAmount, &voucher.DiscountAmount, &voucher.TaxAmount,
			&voucher.Description, &voucher.Status, &voucher.ApprovedBy, &voucher.ApprovedAt, &voucher.CreatedAt, &voucher.UpdatedAt,
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
			voucher_number = $2, supplier_id = $3, voucher_date = $4, due_date = $5,
			total_amount = $6, paid_amount = $7, remaining_amount = $8, discount_amount = $9, tax_amount = $10,
			description = $11, status = $12, approved_by = $13, approved_at = $14, updated_at = $15
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		voucher.ID, voucher.VoucherNumber, voucher.SupplierID, voucher.VoucherDate, voucher.DueDate,
		voucher.TotalAmount, voucher.PaidAmount, voucher.RemainingAmount, voucher.DiscountAmount, voucher.TaxAmount,
		voucher.Description, voucher.Status, voucher.ApprovedBy, voucher.ApprovedAt, voucher.UpdatedAt,
	)

	return err
}

func (r *purchaseVoucherRepositoryImpl) Delete(ctx context.Context, id uuid.ID) error {
	query := `DELETE FROM purchase_vouchers WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *purchaseVoucherRepositoryImpl) GetByStatus(ctx context.Context, status string) ([]*entities.PurchaseVoucher, error) {
	query := `
		SELECT id, voucher_number, supplier_id, voucher_date, COALESCE(due_date, '0001-01-01'),
			   total_amount, COALESCE(paid_amount, 0), remaining_amount, COALESCE(discount_amount, 0), COALESCE(tax_amount, 0),
			   COALESCE(description, ''), COALESCE(status, ''), approved_by, approved_at, created_at, updated_at
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
			&voucher.ID, &voucher.VoucherNumber, &voucher.SupplierID, &voucher.VoucherDate, &voucher.DueDate,
			&voucher.TotalAmount, &voucher.PaidAmount, &voucher.RemainingAmount, &voucher.DiscountAmount, &voucher.TaxAmount,
			&voucher.Description, &voucher.Status, &voucher.ApprovedBy, &voucher.ApprovedAt, &voucher.CreatedAt, &voucher.UpdatedAt,
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
		SELECT id, voucher_number, supplier_id, voucher_date, COALESCE(due_date, '0001-01-01'),
			   total_amount, COALESCE(paid_amount, 0), remaining_amount, COALESCE(discount_amount, 0), COALESCE(tax_amount, 0),
			   COALESCE(description, ''), COALESCE(status, ''), approved_by, approved_at, created_at, updated_at
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
			&voucher.ID, &voucher.VoucherNumber, &voucher.SupplierID, &voucher.VoucherDate, &voucher.DueDate,
			&voucher.TotalAmount, &voucher.PaidAmount, &voucher.RemainingAmount, &voucher.DiscountAmount, &voucher.TaxAmount,
			&voucher.Description, &voucher.Status, &voucher.ApprovedBy, &voucher.ApprovedAt, &voucher.CreatedAt, &voucher.UpdatedAt,
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
		SELECT id, voucher_number, supplier_id, voucher_date, COALESCE(due_date, '0001-01-01'),
			   total_amount, COALESCE(paid_amount, 0), remaining_amount, COALESCE(discount_amount, 0), COALESCE(tax_amount, 0),
			   COALESCE(description, ''), COALESCE(status, ''), approved_by, approved_at, created_at, updated_at
		FROM purchase_vouchers WHERE voucher_number = $1`

	err := r.db.QueryRowContext(ctx, query, voucherNumber).Scan(
		&voucher.ID, &voucher.VoucherNumber, &voucher.SupplierID, &voucher.VoucherDate, &voucher.DueDate,
		&voucher.TotalAmount, &voucher.PaidAmount, &voucher.RemainingAmount, &voucher.DiscountAmount, &voucher.TaxAmount,
		&voucher.Description, &voucher.Status, &voucher.ApprovedBy, &voucher.ApprovedAt, &voucher.CreatedAt, &voucher.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return voucher, nil
}
