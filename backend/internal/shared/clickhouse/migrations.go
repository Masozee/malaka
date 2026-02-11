package clickhouse

import (
	"context"
	"fmt"
	"time"

	"go.uber.org/zap"
)

// RunMigrations creates all ClickHouse tables if they don't exist.
func RunMigrations(ch *ClickHouseDB, logger *zap.Logger) error {
	if ch == nil || ch.conn == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	logger.Info("Running ClickHouse schema migrations...")

	for _, ddl := range schemaDDL {
		if _, err := ch.conn.ExecContext(ctx, ddl); err != nil {
			return fmt.Errorf("ClickHouse migration failed: %w", err)
		}
	}

	// Populate dim_date if empty
	var count uint64
	if err := ch.conn.QueryRowContext(ctx, "SELECT count() FROM dim_date").Scan(&count); err == nil && count == 0 {
		logger.Info("Populating dim_date table...")
		if err := populateDimDate(ctx, ch); err != nil {
			return fmt.Errorf("failed to populate dim_date: %w", err)
		}
		logger.Info("dim_date populated successfully")
	}

	logger.Info("ClickHouse schema migrations completed")
	return nil
}

func populateDimDate(ctx context.Context, ch *ClickHouseDB) error {
	tx, err := ch.conn.Begin()
	if err != nil {
		return err
	}

	stmt, err := tx.PrepareContext(ctx,
		"INSERT INTO dim_date (date_key, year, quarter, month, month_name, week, day_of_month, day_of_week, day_name, is_weekend, fiscal_year, fiscal_quarter) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		tx.Rollback()
		return err
	}
	defer stmt.Close()

	start := time.Date(2020, 1, 1, 0, 0, 0, 0, time.UTC)
	end := time.Date(2031, 1, 1, 0, 0, 0, 0, time.UTC)

	for d := start; d.Before(end); d = d.AddDate(0, 0, 1) {
		weekday := int(d.Weekday())
		isWeekend := uint8(0)
		if weekday == 0 || weekday == 6 {
			isWeekend = 1
		}

		_, isoWeek := d.ISOWeek()

		// Fiscal year: April start (Indonesian fiscal year = calendar year, but some companies use April)
		fiscalYear := uint16(d.Year())
		fiscalQuarter := uint8((d.Month()-1)/3 + 1)

		_, err := stmt.ExecContext(ctx,
			d.Format("2006-01-02"),     // date_key
			uint16(d.Year()),           // year
			uint8((d.Month()-1)/3+1),   // quarter
			uint8(d.Month()),           // month
			d.Month().String(),         // month_name
			uint8(isoWeek),             // week
			uint8(d.Day()),             // day_of_month
			uint8(weekday),             // day_of_week
			d.Weekday().String(),       // day_name
			isWeekend,                  // is_weekend
			fiscalYear,                 // fiscal_year
			fiscalQuarter,              // fiscal_quarter
		)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit()
}

var schemaDDL = []string{
	// ===================== DIMENSION TABLES =====================

	`CREATE TABLE IF NOT EXISTS dim_date (
		date_key       Date,
		year           UInt16,
		quarter        UInt8,
		month          UInt8,
		month_name     String,
		week           UInt8,
		day_of_month   UInt8,
		day_of_week    UInt8,
		day_name       String,
		is_weekend     UInt8,
		fiscal_year    UInt16,
		fiscal_quarter UInt8
	) ENGINE = MergeTree()
	ORDER BY date_key`,

	`CREATE TABLE IF NOT EXISTS dim_customer (
		id            String,
		name          String,
		phone         String,
		email         String,
		address       String,
		city          String,
		customer_type String,
		is_active     UInt8 DEFAULT 1,
		updated_at    DateTime64(3, 'Asia/Jakarta'),
		_version      UInt64
	) ENGINE = ReplacingMergeTree(_version)
	ORDER BY id`,

	`CREATE TABLE IF NOT EXISTS dim_supplier (
		id             String,
		name           String,
		contact_person String,
		phone          String,
		email          String,
		address        String,
		city           String,
		supplier_type  String,
		is_active      UInt8 DEFAULT 1,
		updated_at     DateTime64(3, 'Asia/Jakarta'),
		_version       UInt64
	) ENGINE = ReplacingMergeTree(_version)
	ORDER BY id`,

	`CREATE TABLE IF NOT EXISTS dim_article (
		id                  String,
		code                String,
		name                String,
		description         String,
		classification_id   String,
		classification_name String,
		color_id            String,
		color_name          String,
		model_id            String,
		model_name          String,
		price               Float64,
		cost                Float64,
		category            String,
		is_active           UInt8 DEFAULT 1,
		updated_at          DateTime64(3, 'Asia/Jakarta'),
		_version            UInt64
	) ENGINE = ReplacingMergeTree(_version)
	ORDER BY id`,

	`CREATE TABLE IF NOT EXISTS dim_warehouse (
		id             String,
		code           String,
		name           String,
		location       String,
		warehouse_type String,
		is_active      UInt8 DEFAULT 1,
		updated_at     DateTime64(3, 'Asia/Jakarta'),
		_version       UInt64
	) ENGINE = ReplacingMergeTree(_version)
	ORDER BY id`,

	`CREATE TABLE IF NOT EXISTS dim_employee (
		id            String,
		employee_code String,
		full_name     String,
		department    String,
		position      String,
		hire_date     Date,
		is_active     UInt8 DEFAULT 1,
		updated_at    DateTime64(3, 'Asia/Jakarta'),
		_version      UInt64
	) ENGINE = ReplacingMergeTree(_version)
	ORDER BY id`,

	// ===================== FACT TABLES =====================

	`CREATE TABLE IF NOT EXISTS sales_fact (
		id                String,
		source_type       String,
		transaction_date  DateTime64(3, 'Asia/Jakarta'),
		date_key          Date MATERIALIZED toDate(transaction_date),
		customer_id       String,
		customer_name     String,
		article_id        String,
		article_code      String,
		article_name      String,
		warehouse_id      String,
		warehouse_name    String,
		cashier_id        String,
		quantity          Int32,
		unit_price        Float64,
		discount_amount   Float64,
		tax_amount        Float64,
		line_total        Float64,
		order_total       Float64,
		status            String,
		payment_method    String,
		payment_status    String,
		channel           String,
		created_at        DateTime64(3, 'Asia/Jakarta'),
		synced_at         DateTime64(3, 'Asia/Jakarta') DEFAULT now64(3)
	) ENGINE = MergeTree()
	PARTITION BY toYYYYMM(toDate(transaction_date))
	ORDER BY (toDate(transaction_date), customer_id, article_id)
	TTL toDate(transaction_date) + INTERVAL 5 YEAR`,

	`CREATE TABLE IF NOT EXISTS procurement_fact (
		id                   String,
		po_number            String,
		transaction_date     DateTime64(3, 'Asia/Jakarta'),
		date_key             Date MATERIALIZED toDate(transaction_date),
		supplier_id          String,
		supplier_name        String,
		article_id           String,
		article_name         String,
		created_by_id        String,
		quantity             Int32,
		unit_price           Float64,
		line_total           Float64,
		received_quantity    Int32,
		order_subtotal       Float64,
		order_discount       Float64,
		order_tax            Float64,
		order_total          Float64,
		status               String,
		payment_status       String,
		currency             String,
		payment_terms        String,
		purchase_request_id  String,
		created_at           DateTime64(3, 'Asia/Jakarta'),
		synced_at            DateTime64(3, 'Asia/Jakarta') DEFAULT now64(3)
	) ENGINE = MergeTree()
	PARTITION BY toYYYYMM(toDate(transaction_date))
	ORDER BY (toDate(transaction_date), supplier_id, status)`,

	`CREATE TABLE IF NOT EXISTS inventory_movement_fact (
		id               String,
		movement_date    DateTime64(3, 'Asia/Jakarta'),
		date_key         Date MATERIALIZED toDate(movement_date),
		article_id       String,
		article_code     String,
		article_name     String,
		warehouse_id     String,
		warehouse_name   String,
		quantity         Int32,
		unit_cost        Float64,
		total_value      Float64,
		movement_type    String,
		reference_id     String,
		reference_type   String,
		created_at       DateTime64(3, 'Asia/Jakarta'),
		synced_at        DateTime64(3, 'Asia/Jakarta') DEFAULT now64(3)
	) ENGINE = MergeTree()
	PARTITION BY toYYYYMM(toDate(movement_date))
	ORDER BY (toDate(movement_date), article_id, warehouse_id, movement_type)`,

	`CREATE TABLE IF NOT EXISTS financial_transaction_fact (
		id                String,
		journal_entry_id  String,
		entry_number      String,
		entry_date        Date,
		date_key          Date MATERIALIZED entry_date,
		account_id        String,
		account_code      String,
		account_name      String,
		company_id        String,
		debit_amount      Float64,
		credit_amount     Float64,
		status            String,
		source_module     String,
		source_id         String,
		description       String,
		currency_code     String,
		exchange_rate     Float64,
		created_at        DateTime64(3, 'Asia/Jakarta'),
		synced_at         DateTime64(3, 'Asia/Jakarta') DEFAULT now64(3)
	) ENGINE = MergeTree()
	PARTITION BY toYYYYMM(entry_date)
	ORDER BY (entry_date, account_id, source_module)`,

	`CREATE TABLE IF NOT EXISTS attendance_fact (
		id                String,
		attendance_date   Date,
		date_key          Date MATERIALIZED attendance_date,
		employee_id       String,
		employee_name     String,
		department        String,
		clock_in          DateTime64(3, 'Asia/Jakarta'),
		clock_out         DateTime64(3, 'Asia/Jakarta'),
		work_hours        Float64,
		overtime_hours    Float64,
		late_minutes      Int32,
		early_out_minutes Int32,
		status            String,
		source            String,
		location          String,
		created_at        DateTime64(3, 'Asia/Jakarta'),
		synced_at         DateTime64(3, 'Asia/Jakarta') DEFAULT now64(3)
	) ENGINE = MergeTree()
	PARTITION BY toYYYYMM(attendance_date)
	ORDER BY (attendance_date, employee_id, status)`,

	// ===================== SYNC TRACKING =====================

	`CREATE TABLE IF NOT EXISTS sync_watermarks (
		table_name     String,
		last_synced_at DateTime64(3, 'Asia/Jakarta'),
		rows_synced    UInt64,
		sync_type      String,
		updated_at     DateTime64(3, 'Asia/Jakarta') DEFAULT now64(3)
	) ENGINE = ReplacingMergeTree(updated_at)
	ORDER BY (table_name, sync_type)`,
}
