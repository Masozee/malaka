package sync

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

// FactSync handles syncing fact tables from PostgreSQL to ClickHouse.
type FactSync struct {
	pgDB   *sqlx.DB
	chDB   *sql.DB
	logger *zap.Logger
}

// NewFactSync creates a new fact sync.
func NewFactSync(pgDB *sqlx.DB, chDB *sql.DB, logger *zap.Logger) *FactSync {
	return &FactSync{pgDB: pgDB, chDB: chDB, logger: logger}
}

// SyncSalesFact syncs sales data (sales orders + POS transactions) into sales_fact.
func (f *FactSync) SyncSalesFact(ctx context.Context, since *time.Time) (int64, error) {
	// Sales orders (no items table — each order is one row)
	soRows, err := f.syncSalesOrders(ctx, since)
	if err != nil {
		return 0, fmt.Errorf("sales orders: %w", err)
	}

	// POS items (line-level detail)
	posRows, err := f.syncPOSItems(ctx, since)
	if err != nil {
		return soRows, fmt.Errorf("pos items: %w", err)
	}

	return soRows + posRows, nil
}

func (f *FactSync) syncSalesOrders(ctx context.Context, since *time.Time) (int64, error) {
	type row struct {
		ID            string         `db:"id"`
		TransDate     time.Time      `db:"transaction_date"`
		CustomerID    sql.NullString `db:"customer_id"`
		CustomerName  sql.NullString `db:"customer_name"`
		TotalAmount   float64        `db:"total_amount"`
		Status        string         `db:"status"`
		CreatedAt     time.Time      `db:"created_at"`
	}

	query := `SELECT
		so.id,
		COALESCE(so.order_date, so.created_at) as transaction_date,
		so.customer_id::text as customer_id,
		COALESCE(c.name, '') as customer_name,
		COALESCE(so.total_amount, 0) as total_amount,
		COALESCE(so.status, '') as status,
		so.created_at
	FROM sales_orders so
	LEFT JOIN customers c ON so.customer_id = c.id`

	if since != nil {
		query += ` WHERE so.updated_at > $1`
	}
	query += ` ORDER BY so.id`

	var rows []row
	if since != nil {
		if err := f.pgDB.SelectContext(ctx, &rows, query, *since); err != nil {
			return 0, fmt.Errorf("fetch sales orders: %w", err)
		}
	} else {
		if err := f.pgDB.SelectContext(ctx, &rows, query); err != nil {
			return 0, fmt.Errorf("fetch sales orders: %w", err)
		}
	}

	if len(rows) == 0 {
		return 0, nil
	}

	tx, err := f.chDB.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}

	stmt, err := tx.PrepareContext(ctx,
		`INSERT INTO sales_fact (id, source_type, transaction_date, customer_id, customer_name,
		 article_id, article_code, article_name, warehouse_id, warehouse_name, cashier_id,
		 quantity, unit_price, discount_amount, tax_amount, line_total, order_total,
		 status, payment_method, payment_status, channel, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		return 0, err
	}
	defer stmt.Close()

	var count int64
	for _, r := range rows {
		_, err := stmt.ExecContext(ctx,
			r.ID, "sales_order", r.TransDate,
			nullStr(r.CustomerID), nullStr(r.CustomerName),
			"", "", "", "", "", "",
			1, r.TotalAmount, 0.0, 0.0, r.TotalAmount, r.TotalAmount,
			r.Status, "", "", "sales_order", r.CreatedAt)
		if err != nil {
			tx.Rollback()
			return 0, fmt.Errorf("insert sales_fact (so): %w", err)
		}
		count++
	}

	return count, tx.Commit()
}

func (f *FactSync) syncPOSItems(ctx context.Context, since *time.Time) (int64, error) {
	type row struct {
		ID            string         `db:"id"`
		TransDate     time.Time      `db:"transaction_date"`
		CustomerName  string         `db:"customer_name"`
		ArticleID     sql.NullString `db:"article_id"`
		ProductCode   sql.NullString `db:"product_code"`
		ProductName   sql.NullString `db:"product_name"`
		CashierID     sql.NullString `db:"cashier_id"`
		Quantity      int64          `db:"quantity"`
		UnitPrice     float64        `db:"unit_price"`
		DiscountPct   float64        `db:"discount_pct"`
		TaxAmount     float64        `db:"tax_amount"`
		LineTotal     float64        `db:"line_total"`
		OrderTotal    float64        `db:"order_total"`
		PaymentMethod string         `db:"payment_method"`
		PaymentStatus string         `db:"payment_status"`
		CreatedAt     time.Time      `db:"created_at"`
	}

	query := `SELECT
		pi.id,
		COALESCE(pt.transaction_date, pt.created_at) as transaction_date,
		COALESCE(pt.customer_name, '') as customer_name,
		pi.article_id::text as article_id,
		pi.product_code, pi.product_name,
		pt.cashier_id::text as cashier_id,
		COALESCE(pi.quantity, 0) as quantity,
		COALESCE(pi.unit_price, 0) as unit_price,
		COALESCE(pi.discount_percentage, 0) as discount_pct,
		COALESCE(pt.tax_amount, 0) as tax_amount,
		COALESCE(pi.line_total, 0) as line_total,
		COALESCE(pt.total_amount, 0) as order_total,
		COALESCE(pt.payment_method, '') as payment_method,
		COALESCE(pt.payment_status, '') as payment_status,
		COALESCE(pi.created_at, pt.created_at) as created_at
	FROM pos_items pi
	JOIN pos_transactions pt ON pi.pos_transaction_id = pt.id`

	if since != nil {
		query += ` WHERE pi.updated_at > $1 OR pt.updated_at > $1`
	}
	query += ` ORDER BY pi.id`

	var rows []row
	if since != nil {
		if err := f.pgDB.SelectContext(ctx, &rows, query, *since); err != nil {
			return 0, fmt.Errorf("fetch pos items: %w", err)
		}
	} else {
		if err := f.pgDB.SelectContext(ctx, &rows, query); err != nil {
			return 0, fmt.Errorf("fetch pos items: %w", err)
		}
	}

	if len(rows) == 0 {
		return 0, nil
	}

	tx, err := f.chDB.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}

	stmt, err := tx.PrepareContext(ctx,
		`INSERT INTO sales_fact (id, source_type, transaction_date, customer_id, customer_name,
		 article_id, article_code, article_name, warehouse_id, warehouse_name, cashier_id,
		 quantity, unit_price, discount_amount, tax_amount, line_total, order_total,
		 status, payment_method, payment_status, channel, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		return 0, err
	}
	defer stmt.Close()

	var count int64
	for _, r := range rows {
		_, err := stmt.ExecContext(ctx,
			r.ID, "pos", r.TransDate,
			"", r.CustomerName,
			nullStr(r.ArticleID), nullStr(r.ProductCode), nullStr(r.ProductName),
			"", "", nullStr(r.CashierID),
			r.Quantity, r.UnitPrice, r.DiscountPct, r.TaxAmount,
			r.LineTotal, r.OrderTotal,
			"completed", r.PaymentMethod, r.PaymentStatus, "pos", r.CreatedAt)
		if err != nil {
			tx.Rollback()
			return 0, fmt.Errorf("insert sales_fact (pos): %w", err)
		}
		count++
	}

	return count, tx.Commit()
}

// SyncProcurementFact syncs procurement purchase orders into procurement_fact.
func (f *FactSync) SyncProcurementFact(ctx context.Context, since *time.Time) (int64, error) {
	type row struct {
		ID                string         `db:"id"`
		PONumber          string         `db:"po_number"`
		TransDate         time.Time      `db:"transaction_date"`
		SupplierID        sql.NullString `db:"supplier_id"`
		SupplierName      sql.NullString `db:"supplier_name"`
		ItemName          string         `db:"item_name"`
		CreatedByID       sql.NullString `db:"created_by_id"`
		Quantity          int64          `db:"quantity"`
		UnitPrice         float64        `db:"unit_price"`
		LineTotal         float64        `db:"line_total"`
		ReceivedQty       int64          `db:"received_quantity"`
		OrderSubtotal     float64        `db:"order_subtotal"`
		OrderDiscount     float64        `db:"order_discount"`
		OrderTax          float64        `db:"order_tax"`
		OrderTotal        float64        `db:"order_total"`
		Status            string         `db:"status"`
		PaymentStatus     string         `db:"payment_status"`
		Currency          string         `db:"currency"`
		PaymentTerms      string         `db:"payment_terms"`
		PurchaseRequestID sql.NullString `db:"purchase_request_id"`
		CreatedAt         time.Time      `db:"created_at"`
	}

	query := `SELECT
		ppoi.id,
		COALESCE(ppo.po_number, '') as po_number,
		COALESCE(ppo.order_date, ppo.created_at) as transaction_date,
		ppo.supplier_id::text as supplier_id,
		COALESCE(s.name, '') as supplier_name,
		COALESCE(ppoi.item_name, '') as item_name,
		ppo.created_by::text as created_by_id,
		COALESCE(ppoi.quantity, 0) as quantity,
		COALESCE(ppoi.unit_price, 0) as unit_price,
		COALESCE(ppoi.line_total, 0) as line_total,
		COALESCE(ppoi.received_quantity, 0) as received_quantity,
		COALESCE(ppo.subtotal, 0) as order_subtotal,
		COALESCE(ppo.discount_amount, 0) as order_discount,
		COALESCE(ppo.tax_amount, 0) as order_tax,
		COALESCE(ppo.total_amount, 0) as order_total,
		COALESCE(ppo.status, '') as status,
		COALESCE(ppo.payment_status, '') as payment_status,
		COALESCE(ppo.currency, 'IDR') as currency,
		COALESCE(ppo.payment_terms, '') as payment_terms,
		ppo.purchase_request_id::text as purchase_request_id,
		COALESCE(ppoi.created_at, ppo.created_at) as created_at
	FROM procurement_purchase_order_items ppoi
	JOIN procurement_purchase_orders ppo ON ppoi.purchase_order_id = ppo.id
	LEFT JOIN suppliers s ON ppo.supplier_id = s.id`

	if since != nil {
		query += ` WHERE ppoi.updated_at > $1 OR ppo.updated_at > $1`
	}
	query += ` ORDER BY ppoi.id`

	var rows []row
	if since != nil {
		if err := f.pgDB.SelectContext(ctx, &rows, query, *since); err != nil {
			return 0, fmt.Errorf("fetch procurement items: %w", err)
		}
	} else {
		if err := f.pgDB.SelectContext(ctx, &rows, query); err != nil {
			return 0, fmt.Errorf("fetch procurement items: %w", err)
		}
	}

	if len(rows) == 0 {
		return 0, nil
	}

	tx, err := f.chDB.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}

	stmt, err := tx.PrepareContext(ctx,
		`INSERT INTO procurement_fact (id, po_number, transaction_date,
		 supplier_id, supplier_name, article_id, article_name, created_by_id,
		 quantity, unit_price, line_total, received_quantity,
		 order_subtotal, order_discount, order_tax, order_total,
		 status, payment_status, currency, payment_terms, purchase_request_id, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		return 0, err
	}
	defer stmt.Close()

	var count int64
	for _, r := range rows {
		_, err := stmt.ExecContext(ctx,
			r.ID, r.PONumber, r.TransDate,
			nullStr(r.SupplierID), nullStr(r.SupplierName),
			"", r.ItemName, nullStr(r.CreatedByID),
			r.Quantity, r.UnitPrice, r.LineTotal, r.ReceivedQty,
			r.OrderSubtotal, r.OrderDiscount, r.OrderTax, r.OrderTotal,
			r.Status, r.PaymentStatus, r.Currency, r.PaymentTerms,
			nullStr(r.PurchaseRequestID), r.CreatedAt)
		if err != nil {
			tx.Rollback()
			return 0, fmt.Errorf("insert procurement_fact %s: %w", r.ID, err)
		}
		count++
	}

	return count, tx.Commit()
}

// SyncInventoryMovementFact syncs stock movements into inventory_movement_fact.
func (f *FactSync) SyncInventoryMovementFact(ctx context.Context, since *time.Time) (int64, error) {
	type row struct {
		ID            string         `db:"id"`
		MovementDate  time.Time      `db:"movement_date"`
		ArticleID     sql.NullString `db:"article_id"`
		ArticleName   sql.NullString `db:"article_name"`
		WarehouseID   sql.NullString `db:"warehouse_id"`
		WarehouseName sql.NullString `db:"warehouse_name"`
		MovementType  string         `db:"movement_type"`
		Quantity      int64          `db:"quantity"`
		ReferenceID   string         `db:"reference_id"`
		CreatedAt     time.Time      `db:"created_at"`
	}

	query := `SELECT
		sm.id,
		COALESCE(sm.movement_date, sm.created_at) as movement_date,
		sm.article_id::text as article_id,
		COALESCE(a.name, '') as article_name,
		sm.warehouse_id::text as warehouse_id,
		COALESCE(w.name, '') as warehouse_name,
		COALESCE(sm.movement_type, '') as movement_type,
		COALESCE(sm.quantity, 0) as quantity,
		COALESCE(sm.reference_id, '') as reference_id,
		sm.created_at
	FROM stock_movements sm
	LEFT JOIN articles a ON sm.article_id = a.id
	LEFT JOIN warehouses w ON sm.warehouse_id = w.id`

	if since != nil {
		query += ` WHERE sm.updated_at > $1`
	}
	query += ` ORDER BY sm.id`

	var rows []row
	if since != nil {
		if err := f.pgDB.SelectContext(ctx, &rows, query, *since); err != nil {
			return 0, fmt.Errorf("fetch stock movements: %w", err)
		}
	} else {
		if err := f.pgDB.SelectContext(ctx, &rows, query); err != nil {
			return 0, fmt.Errorf("fetch stock movements: %w", err)
		}
	}

	if len(rows) == 0 {
		return 0, nil
	}

	tx, err := f.chDB.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}

	stmt, err := tx.PrepareContext(ctx,
		`INSERT INTO inventory_movement_fact (id, movement_date, article_id, article_code, article_name,
		 warehouse_id, warehouse_name, quantity, unit_cost, total_value,
		 movement_type, reference_id, reference_type, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		return 0, err
	}
	defer stmt.Close()

	var count int64
	for _, r := range rows {
		_, err := stmt.ExecContext(ctx,
			r.ID, r.MovementDate,
			nullStr(r.ArticleID), "", nullStr(r.ArticleName),
			nullStr(r.WarehouseID), nullStr(r.WarehouseName),
			r.Quantity, 0.0, 0.0,
			r.MovementType, r.ReferenceID, r.MovementType,
			r.CreatedAt)
		if err != nil {
			tx.Rollback()
			return 0, fmt.Errorf("insert inventory_movement_fact %s: %w", r.ID, err)
		}
		count++
	}

	return count, tx.Commit()
}

// SyncFinancialTransactionFact syncs journal entries into financial_transaction_fact.
func (f *FactSync) SyncFinancialTransactionFact(ctx context.Context, since *time.Time) (int64, error) {
	type row struct {
		ID           string         `db:"id"`
		EntryID      string         `db:"journal_entry_id"`
		EntryNumber  string         `db:"entry_number"`
		EntryDate    time.Time      `db:"entry_date"`
		AccountID    sql.NullString `db:"account_id"`
		AccountCode  string         `db:"account_code"`
		AccountName  string         `db:"account_name"`
		CompanyID    string         `db:"company_id"`
		Description  string         `db:"description"`
		DebitAmount  float64        `db:"debit_amount"`
		CreditAmount float64        `db:"credit_amount"`
		CurrencyCode string         `db:"currency_code"`
		ExchangeRate float64        `db:"exchange_rate"`
		SourceModule string         `db:"source_module"`
		SourceID     string         `db:"source_id"`
		Status       string         `db:"status"`
		CreatedAt    time.Time      `db:"created_at"`
	}

	query := `SELECT
		jel.id, je.id as journal_entry_id,
		COALESCE(je.entry_number, '') as entry_number,
		je.entry_date,
		jel.account_id::text as account_id,
		COALESCE(coa.account_code, '') as account_code,
		COALESCE(coa.account_name, '') as account_name,
		COALESCE(je.company_id, '') as company_id,
		COALESCE(jel.description, je.description, '') as description,
		COALESCE(jel.debit_amount, 0) as debit_amount,
		COALESCE(jel.credit_amount, 0) as credit_amount,
		COALESCE(je.currency_code, 'IDR') as currency_code,
		COALESCE(je.exchange_rate, 1) as exchange_rate,
		COALESCE(je.source_module, '') as source_module,
		COALESCE(je.source_id, '') as source_id,
		COALESCE(je.status, '') as status,
		COALESCE(jel.created_at, je.created_at) as created_at
	FROM journal_entry_lines jel
	JOIN journal_entries je ON jel.journal_entry_id = je.id
	LEFT JOIN chart_of_accounts coa ON jel.account_id = coa.id`

	if since != nil {
		query += ` WHERE jel.updated_at > $1 OR je.updated_at > $1`
	}
	query += ` ORDER BY jel.id`

	var rows []row
	if since != nil {
		if err := f.pgDB.SelectContext(ctx, &rows, query, *since); err != nil {
			return 0, fmt.Errorf("fetch journal lines: %w", err)
		}
	} else {
		if err := f.pgDB.SelectContext(ctx, &rows, query); err != nil {
			return 0, fmt.Errorf("fetch journal lines: %w", err)
		}
	}

	if len(rows) == 0 {
		return 0, nil
	}

	tx, err := f.chDB.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}

	stmt, err := tx.PrepareContext(ctx,
		`INSERT INTO financial_transaction_fact (id, journal_entry_id, entry_number, entry_date,
		 account_id, account_code, account_name, company_id,
		 debit_amount, credit_amount, status,
		 source_module, source_id, description, currency_code, exchange_rate, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		return 0, err
	}
	defer stmt.Close()

	var count int64
	for _, r := range rows {
		_, err := stmt.ExecContext(ctx,
			r.ID, r.EntryID, r.EntryNumber, r.EntryDate.Format("2006-01-02"),
			nullStr(r.AccountID), r.AccountCode, r.AccountName, r.CompanyID,
			r.DebitAmount, r.CreditAmount, r.Status,
			r.SourceModule, r.SourceID, r.Description,
			r.CurrencyCode, r.ExchangeRate, r.CreatedAt)
		if err != nil {
			tx.Rollback()
			return 0, fmt.Errorf("insert financial_transaction_fact %s: %w", r.ID, err)
		}
		count++
	}

	return count, tx.Commit()
}

// SyncAttendanceFact syncs attendance records into attendance_fact.
func (f *FactSync) SyncAttendanceFact(ctx context.Context, since *time.Time) (int64, error) {
	type row struct {
		ID            string         `db:"id"`
		AttendDate    time.Time      `db:"attendance_date"`
		EmployeeID    sql.NullString `db:"employee_id"`
		EmployeeName  sql.NullString `db:"employee_name"`
		Department    string         `db:"department"`
		ClockIn       sql.NullTime   `db:"clock_in"`
		ClockOut      sql.NullTime   `db:"clock_out"`
		WorkHours     float64        `db:"work_hours"`
		OvertimeHours float64        `db:"overtime_hours"`
		LateMinutes   int64          `db:"late_minutes"`
		EarlyOutMin   int64          `db:"early_out_minutes"`
		Status        string         `db:"status"`
		CreatedAt     time.Time      `db:"created_at"`
	}

	query := `SELECT
		dat.id,
		dat.attendance_date,
		dat.employee_id::text as employee_id,
		COALESCE(e.employee_name, '') as employee_name,
		COALESCE(e.department, '') as department,
		dat.actual_in as clock_in,
		dat.actual_out as clock_out,
		COALESCE(dat.work_hours, 0) as work_hours,
		COALESCE(dat.overtime_hours, 0) as overtime_hours,
		COALESCE(dat.late_minutes, 0) as late_minutes,
		COALESCE(dat.early_out_minutes, 0) as early_out_minutes,
		COALESCE(dat.status, '') as status,
		COALESCE(dat.created_at, now()) as created_at
	FROM daily_attendance_tracking dat
	LEFT JOIN employees e ON dat.employee_id = e.id`

	if since != nil {
		query += ` WHERE dat.updated_at > $1`
	}
	query += ` ORDER BY dat.id`

	var rows []row
	if since != nil {
		if err := f.pgDB.SelectContext(ctx, &rows, query, *since); err != nil {
			return 0, fmt.Errorf("fetch attendance: %w", err)
		}
	} else {
		if err := f.pgDB.SelectContext(ctx, &rows, query); err != nil {
			return 0, fmt.Errorf("fetch attendance: %w", err)
		}
	}

	if len(rows) == 0 {
		return 0, nil
	}

	tx, err := f.chDB.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}

	stmt, err := tx.PrepareContext(ctx,
		`INSERT INTO attendance_fact (id, attendance_date, employee_id, employee_name, department,
		 clock_in, clock_out, work_hours, overtime_hours,
		 late_minutes, early_out_minutes, status, source, location, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
	if err != nil {
		tx.Rollback()
		return 0, err
	}
	defer stmt.Close()

	var count int64
	zeroTime := time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)
	for _, r := range rows {
		clockIn := zeroTime
		if r.ClockIn.Valid {
			clockIn = r.ClockIn.Time
		}
		clockOut := zeroTime
		if r.ClockOut.Valid {
			clockOut = r.ClockOut.Time
		}
		_, err := stmt.ExecContext(ctx,
			r.ID, r.AttendDate.Format("2006-01-02"),
			nullStr(r.EmployeeID), nullStr(r.EmployeeName), r.Department,
			clockIn, clockOut,
			r.WorkHours, r.OvertimeHours,
			r.LateMinutes, r.EarlyOutMin,
			r.Status, "system", "", r.CreatedAt)
		if err != nil {
			tx.Rollback()
			return 0, fmt.Errorf("insert attendance_fact %s: %w", r.ID, err)
		}
		count++
	}

	return count, tx.Commit()
}
