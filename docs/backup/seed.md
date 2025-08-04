# Database Seeding and Data Check

This document outlines how to check for existing data in the PostgreSQL database and how to approach creating dummy seed data if tables are empty.

## Checking for Existing Data

To check if your database tables contain data, you'll need to connect to the PostgreSQL database. Assuming you have `psql` installed and your database is running (e.g., via Docker Compose), you can connect using a command similar to this (you may need to adjust the host, port, user, and database name based on your `docker-compose.yml` or `.env` configuration):

```bash
psql -h localhost -p 5432 -U your_user -d your_database_name
```

Once connected, you can list all tables and then check the row count for each table. Replace `your_table_name` with the actual table names.

**List all tables:**

```sql
\dt
```

**Check if a specific table has data (e.g., for `users` table in `masterdata` module):**

```sql
SELECT COUNT(*) FROM users;
```

Repeat the `SELECT COUNT(*)` query for relevant tables in each module to determine if they are empty.

## Seed Data Checklist by Module

Below is a checklist of potential tables for each backend module. A checked box indicates that a corresponding SQL seed file with `INSERT` statements exists in `backend/internal/pkg/database/seeds/` for that table. An unchecked box indicates that a Go entity model exists, but a direct corresponding SQL seed file was not found, or the naming convention might require manual verification.

### Accounting Module
- [ ] `budgets` (Go entity: `budget.go`)
- [x] `chart_of_accounts` (Go entity: `chart_of_account.go`)
- [x] `cost_centers` (Go entity: `cost_center.go`)
- [x] `currency_settings` (Go entity: `currency_setting.go`)
- [ ] `financial_statements` (Go entity: `financial_statement.go`)
- [x] `fixed_assets` (Go entity: `fixed_asset.go`)
- [ ] `general_ledgers` (Go entity: `general_ledger.go`)
- [ ] `journal_entries` (Go entity: `journal_entry.go`)
- [ ] `taxes` (Go entity: `tax.go`)
- [ ] `trial_balances` (Go entity: `trial_balance.go`)

### Finance Module
- [x] `accounts_payables` (Go entity: `accounts_payable.go`)
- [x] `accounts_receivables` (Go entity: `accounts_receivable.go`)
- [x] `bank_transfers` (Go entity: `bank_transfer.go`)
- [x] `cash_banks` (Go entity: `cash_bank.go`)
- [x] `cash_books` (Go entity: `cash_book.go`)
- [x] `cash_disbursements` (Go entity: `cash_disbursement.go`)
- [x] `cash_opening_balances` (Go entity: `cash_opening_balance.go`)
- [x] `cash_receipts` (Go entity: `cash_receipt.go`)
- [x] `check_clearance` (Go entity: `check_clearance.go`)
- [x] `expenditure_requests` (Go entity: `expenditure_request.go` - note: `expenditure_requests_fixed.sql` also exists)
- [x] `finance_invoices` (Go entity: `invoice.go` - table name inferred from `finance_invoices.sql`)
- [x] `monthly_closings` (Go entity: `monthly_closing.go`)
- [x] `payments` (Go entity: `payment.go`)
- [x] `purchase_vouchers` (Go entity: `purchase_voucher.go` - note: `purchase_vouchers_fixed.sql` also exists)

### Inventory Module
- [x] `current_stock` (Go entity: `stock_balance.go` - table name inferred from `current_stock.sql`)
- [x] `draft_order_items` (Go entity: `draft_order_item.go` - inferred)
- [x] `draft_orders` (Go entity: `draft_order.go`)
- [x] `goods_issue_items` (Go entity: `goods_issue_item.go`)
- [x] `goods_issues` (Go entity: `goods_issue.go`)
- [x] `goods_receipt_items` (Go entity: `goods_receipt_item.go`)
- [x] `goods_receipts` (Go entity: `goods_receipt.go`)
- [x] `materials` (Go entity: `material.go` - inferred)
- [x] `material_warehouses` (Go entity: `material_warehouse.go` - inferred)
- [x] `purchase_order_items` (Go entity: `purchase_order_item.go`)
- [x] `purchase_orders` (Go entity: `purchase_order.go`)
- [x] `return_suppliers` (Go entity: `return_supplier.go`)
- [x] `simple_goods_issues` (Go entity: `simple_goods_issue.go`)
- [x] `stock_adjustments` (Go entity: `stock_adjustment.go`)
- [x] `stock_balances` (Go entity: `stock_balance.go`)
- [x] `stock_movements` (Go entity: `stock_movement.go`)
- [x] `stock_opnames` (Go entity: `stock_opname.go`)
- [x] `transfer_items` (Go entity: `transfer_item.go`)
- [x] `transfer_orders` (Go entity: `transfer_order.go`)
- [x] `warehouses` (Go entity: `warehouse.go`)

### Masterdata Module
- [x] `articles` (Go entity: `article.go`)
- [x] `automatic_attendance_cards` (Go entity: `automatic_attendance_card.go` - inferred)
- [x] `barcodes` (Go entity: `barcode.go`)
- [x] `biometric_machines` (Go entity: `biometric_machine.go` - inferred)
- [x] `classifications` (Go entity: `classification.go`)
- [x] `colors` (Go entity: `color.go`)
- [x] `companies` (Go entity: `company.go`)
- [x] `couriers` (Go entity: `courier.go`)
- [x] `courier_rates` (Go entity: `courier_rate.go`)
- [x] `customers` (Go entity: `customer.go`)
- [x] `depstores` (Go entity: `depstore.go`)
- [x] `divisions` (Go entity: `division.go`)
- [x] `employees` (Go entity: `employee.go` - inferred)
- [x] `gallery_images` (Go entity: `gallery_image.go`)
- [x] `models` (Go entity: `model.go`)
- [x] `prices` (Go entity: `price.go`)
- [x] `sizes` (Go entity: `size.go`)
- [x] `spg_stores` (Go entity: `spg_store.go` - inferred)
- [x] `suppliers` (Go entity: `supplier.go`)
- [x] `users` (Go entity: `user.go`)

### Sales Module
- [x] `dynamic_olap_reports` (Go entity: `dynamic_olap_report.go` - inferred)
- [x] `matahari_mcp` (Go entity: `matahari_mcp.go` - inferred)
- [x] `pos_items` (Go entity: `pos_item.go`)
- [x] `pos_transactions` (Go entity: `pos_transaction.go`)
- [x] `promotions` (Go entity: `promotion.go`)
- [x] `proses_margins` (Go entity: `proses_margin.go`)
- [x] `ramayana_hierarchy` (Go entity: `ramayana_hierarchy.go` - inferred)
- [x] `sales_invoice_items` (Go entity: `sales_invoice_item.go`)
- [x] `sales_invoices` (Go entity: `sales_invoice.go`)
- [x] `sales_kompetitors` (Go entity: `sales_kompetitor.go`)
- [x] `sales_order_items` (Go entity: `sales_order_item.go`)
- [x] `sales_orders` (Go entity: `sales_order.go`)
- [x] `sales_rekonsiliasi` (Go entity: `sales_rekonsiliasi.go`)
- [ ] `sales_returns` (Go entity: `sales_return.go`)
- [x] `sales_targets` (Go entity: `sales_target.go`)
- [x] `static_reports` (Go entity: `static_report.go` - inferred)

### Shipping Module
- [x] `airwaybills` (Go entity: `airwaybill.go`)
- [x] `couriers` (Go entity: `courier.go`)
- [x] `manifests` (Go entity: `manifest.go`)
- [x] `outbound_scans` (Go entity: `outbound_scan.go`)
- [x] `shipment_items` (Go entity: `shipment_item.go`)
- [x] `shipments` (Go entity: `shipment.go`)
- [x] `shipping_invoices` (Go entity: `shipping_invoice.go`)
- [x] `trackings` (Go entity: `tracking.go`)

## Creating Dummy Seed Data

If you find that certain tables are empty and you need dummy data for development or testing, you can create SQL insert statements or use a data seeding tool. This project contains SQL seed files in `backend/internal/pkg/database/seeds/` that can be used for this purpose.

**To apply the SQL seed files:**

You can execute these SQL files directly against your PostgreSQL database using `psql`. For example, to apply `users.sql`:

```bash
psql -h localhost -p 5432 -U your_user -d your_database_name -f backend/internal/pkg/database/seeds/users.sql
```

**Example SQL INSERT statement (for manual insertion):**

```sql
INSERT INTO users (id, name, email, password_hash) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'John Doe', 'john.doe@example.com', 'hashed_password_here');
```

Alternatively, you can write Go scripts within the `backend/internal/pkg/database/seeds/` directory to programmatically insert data using the application's models and database connection. This is often preferred for more complex data relationships.

**Example (conceptual) Go seeding logic:**

```go
package seeds

import (
	"context"
	"log"
	"your_project/backend/internal/modules/masterdata/domain/entities"
	"your_project/backend/internal/shared/database"
)

func SeedUsers(ctx context.Context, db *database.DB) {
	// Check if users already exist to prevent duplicates
	var count int
	err := db.Client.QueryRow(ctx, "SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		log.Fatalf("Failed to check user count: %v", err)
	}

	if count == 0 {
		log.Println("Seeding dummy users...")
		user := entities.User{
			// ... populate user fields
		}
		// Logic to insert user into database
		// ...
		log.Println("Dummy users seeded.")
	} else {
		log.Println("Users already exist, skipping seeding.")
	}
}

// You would call this function from your main application or a dedicated seeding script.
```

Remember to replace placeholder values and adapt the examples to your specific database schema and Go application structure.