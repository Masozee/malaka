-- +goose Up
-- Performance Indexes - Based on repository query pattern analysis
-- Created: 2026-01-23

-- ============================================
-- PHASE 1: HIGH PRIORITY - N+1 Query Prevention
-- ============================================

-- Procurement Purchase Orders
CREATE INDEX IF NOT EXISTS idx_proc_po_supplier_status
    ON procurement_purchase_orders(supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_proc_po_supplier_order_date
    ON procurement_purchase_orders(supplier_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_proc_po_created_by_status
    ON procurement_purchase_orders(created_by, status);

-- Purchase Requests
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status_priority
    ON purchase_requests(status, priority);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_requester_status
    ON purchase_requests(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_department_status
    ON purchase_requests(department, status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_required_date_status
    ON purchase_requests(required_date, status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_request_number
    ON purchase_requests(request_number);

-- Stock Movements (Critical for inventory operations)
CREATE INDEX IF NOT EXISTS idx_stock_movements_article_warehouse
    ON stock_movements(article_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_article_date
    ON stock_movements(article_id, movement_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse_type
    ON stock_movements(warehouse_id, movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type_date
    ON stock_movements(movement_type, movement_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference_id
    ON stock_movements(reference_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_movement_date
    ON stock_movements(movement_date DESC);

-- Goods Receipts
CREATE INDEX IF NOT EXISTS idx_goods_receipts_purchase_order_id
    ON goods_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_warehouse_id
    ON goods_receipts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_receipt_date
    ON goods_receipts(receipt_date DESC);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_po_warehouse
    ON goods_receipts(purchase_order_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_receipt_id
    ON goods_receipt_items(goods_receipt_id);

-- Sales Orders
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id
    ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status_date
    ON sales_orders(status, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_orders_order_date
    ON sales_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_status
    ON sales_orders(customer_id, status);

-- Note: sales_order_items and sales_invoices tables don't exist yet
-- Indexes will be added when those tables are created

-- ============================================
-- PHASE 2: MEDIUM PRIORITY - Common Operations
-- ============================================

-- Contracts
CREATE INDEX IF NOT EXISTS idx_contracts_status_end_date
    ON contracts(status, end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_status_supplier
    ON contracts(status, supplier_id);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_type_status
    ON contracts(contract_type, status);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_number
    ON contracts(contract_number);

-- Vendor Evaluations
CREATE INDEX IF NOT EXISTS idx_vendor_evaluations_supplier_status
    ON vendor_evaluations(supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_vendor_evaluations_overall_score
    ON vendor_evaluations(overall_score);
CREATE INDEX IF NOT EXISTS idx_vendor_evaluations_evaluation_number
    ON vendor_evaluations(evaluation_number);
CREATE INDEX IF NOT EXISTS idx_vendor_evaluations_supplier_period
    ON vendor_evaluations(supplier_id, evaluation_period_start, evaluation_period_end);

-- Transfer Orders
CREATE INDEX IF NOT EXISTS idx_transfer_orders_status_date
    ON transfer_orders(status, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_transfer_orders_from_warehouse
    ON transfer_orders(from_warehouse_id, status);
CREATE INDEX IF NOT EXISTS idx_transfer_orders_to_warehouse
    ON transfer_orders(to_warehouse_id, status);
CREATE INDEX IF NOT EXISTS idx_transfer_orders_order_date
    ON transfer_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_transfer_items_order_id
    ON transfer_items(transfer_order_id);

-- Stock Adjustments
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_article_warehouse
    ON stock_adjustments(article_id, warehouse_id);
-- Note: status column doesn't exist in stock_adjustments table
-- CREATE INDEX IF NOT EXISTS idx_stock_adjustments_status_date
--     ON stock_adjustments(status, adjustment_date DESC);

-- POS Transactions
-- Note: pos_transactions table structure doesn't match expected schema
-- These columns don't exist: status, employee_id
-- CREATE INDEX IF NOT EXISTS idx_pos_transactions_date
--     ON pos_transactions(transaction_date DESC);
-- CREATE INDEX IF NOT EXISTS idx_pos_transactions_status
--     ON pos_transactions(status);
-- CREATE INDEX IF NOT EXISTS idx_pos_transactions_employee_id
--     ON pos_transactions(employee_id);

-- ============================================
-- PHASE 3: ACCOUNTING MODULE
-- ============================================

-- Journal Entries
CREATE INDEX IF NOT EXISTS idx_journal_entries_date_status
    ON journal_entries(entry_date DESC, status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_company_date
    ON journal_entries(company_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status_date
    ON journal_entries(status, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_source
    ON journal_entries(source_module, source_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_number
    ON journal_entries(entry_number);

-- Journal Entry Lines (uses account_id not account_code)
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry_id
    ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account_id
    ON journal_entry_lines(account_id);

-- General Ledger (uses account_id and transaction_date, not account_code/period)
CREATE INDEX IF NOT EXISTS idx_general_ledger_account_date
    ON general_ledger(account_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_general_ledger_company_account
    ON general_ledger(company_id, account_id);
CREATE INDEX IF NOT EXISTS idx_general_ledger_transaction_date
    ON general_ledger(transaction_date DESC);

-- ============================================
-- PHASE 4: MASTER DATA ENHANCEMENTS
-- ============================================

-- Articles (additional indexes - no status column exists)
CREATE INDEX IF NOT EXISTS idx_articles_barcode
    ON articles(barcode);
CREATE INDEX IF NOT EXISTS idx_articles_supplier_classification
    ON articles(supplier_id, classification_id);

-- Customers (additional indexes)
CREATE INDEX IF NOT EXISTS idx_customers_status
    ON customers(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_company_status
    ON customers(company_id, status);
CREATE INDEX IF NOT EXISTS idx_customers_email
    ON customers(email);

-- Barcodes (column is 'code' not 'barcode_number')
CREATE INDEX IF NOT EXISTS idx_barcodes_code
    ON barcodes(code);
CREATE INDEX IF NOT EXISTS idx_barcodes_article_id
    ON barcodes(article_id);

-- Employees (no status or company_id columns exist)
CREATE INDEX IF NOT EXISTS idx_employees_department
    ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_position
    ON employees(position);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date
    ON employees(hire_date DESC);

-- ============================================
-- PHASE 5: TEXT SEARCH (requires pg_trgm)
-- ============================================

-- Enable trigram extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram indexes for ILIKE searches
CREATE INDEX IF NOT EXISTS idx_articles_name_trgm
    ON articles USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_customers_name_trgm
    ON customers USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_suppliers_name_trgm
    ON suppliers USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_contracts_title_trgm
    ON contracts USING gin(title gin_trgm_ops);


-- +goose Down
-- Drop all indexes in reverse order

-- Text search indexes
DROP INDEX IF EXISTS idx_contracts_title_trgm;
DROP INDEX IF EXISTS idx_suppliers_name_trgm;
DROP INDEX IF EXISTS idx_customers_name_trgm;
DROP INDEX IF EXISTS idx_articles_name_trgm;

-- Employees
DROP INDEX IF EXISTS idx_employees_hire_date;
DROP INDEX IF EXISTS idx_employees_position;
DROP INDEX IF EXISTS idx_employees_department;

-- Barcodes
DROP INDEX IF EXISTS idx_barcodes_article_id;
DROP INDEX IF EXISTS idx_barcodes_code;

-- Customers
DROP INDEX IF EXISTS idx_customers_email;
DROP INDEX IF EXISTS idx_customers_company_status;
DROP INDEX IF EXISTS idx_customers_status;

-- Articles
DROP INDEX IF EXISTS idx_articles_supplier_classification;
DROP INDEX IF EXISTS idx_articles_barcode;

-- General Ledger
DROP INDEX IF EXISTS idx_general_ledger_transaction_date;
DROP INDEX IF EXISTS idx_general_ledger_company_account;
DROP INDEX IF EXISTS idx_general_ledger_account_date;

-- Journal Entry Lines
DROP INDEX IF EXISTS idx_journal_entry_lines_account_id;
DROP INDEX IF EXISTS idx_journal_entry_lines_entry_id;

-- Journal Entries
DROP INDEX IF EXISTS idx_journal_entries_entry_number;
DROP INDEX IF EXISTS idx_journal_entries_source;
DROP INDEX IF EXISTS idx_journal_entries_status_date;
DROP INDEX IF EXISTS idx_journal_entries_company_date;
DROP INDEX IF EXISTS idx_journal_entries_date_status;

-- POS Transactions (commented out - columns don't exist)
-- DROP INDEX IF EXISTS idx_pos_transactions_employee_id;
-- DROP INDEX IF EXISTS idx_pos_transactions_status;
-- DROP INDEX IF EXISTS idx_pos_transactions_date;

-- Stock Adjustments
DROP INDEX IF EXISTS idx_stock_adjustments_status_date;
DROP INDEX IF EXISTS idx_stock_adjustments_article_warehouse;

-- Transfer Orders
DROP INDEX IF EXISTS idx_transfer_items_order_id;
DROP INDEX IF EXISTS idx_transfer_orders_order_date;
DROP INDEX IF EXISTS idx_transfer_orders_to_warehouse;
DROP INDEX IF EXISTS idx_transfer_orders_from_warehouse;
DROP INDEX IF EXISTS idx_transfer_orders_status_date;

-- Vendor Evaluations
DROP INDEX IF EXISTS idx_vendor_evaluations_supplier_period;
DROP INDEX IF EXISTS idx_vendor_evaluations_evaluation_number;
DROP INDEX IF EXISTS idx_vendor_evaluations_overall_score;
DROP INDEX IF EXISTS idx_vendor_evaluations_supplier_status;

-- Contracts
DROP INDEX IF EXISTS idx_contracts_contract_number;
DROP INDEX IF EXISTS idx_contracts_contract_type_status;
DROP INDEX IF EXISTS idx_contracts_status_supplier;
DROP INDEX IF EXISTS idx_contracts_status_end_date;

-- Note: sales_order_items and sales_invoices indexes removed (tables don't exist)

-- Sales Orders
DROP INDEX IF EXISTS idx_sales_orders_customer_status;
DROP INDEX IF EXISTS idx_sales_orders_order_date;
DROP INDEX IF EXISTS idx_sales_orders_status_date;
DROP INDEX IF EXISTS idx_sales_orders_customer_id;

-- Goods Receipts
DROP INDEX IF EXISTS idx_goods_receipt_items_receipt_id;
DROP INDEX IF EXISTS idx_goods_receipts_po_warehouse;
DROP INDEX IF EXISTS idx_goods_receipts_receipt_date;
DROP INDEX IF EXISTS idx_goods_receipts_warehouse_id;
DROP INDEX IF EXISTS idx_goods_receipts_purchase_order_id;

-- Stock Movements
DROP INDEX IF EXISTS idx_stock_movements_movement_date;
DROP INDEX IF EXISTS idx_stock_movements_reference_id;
DROP INDEX IF EXISTS idx_stock_movements_type_date;
DROP INDEX IF EXISTS idx_stock_movements_warehouse_type;
DROP INDEX IF EXISTS idx_stock_movements_article_date;
DROP INDEX IF EXISTS idx_stock_movements_article_warehouse;

-- Purchase Requests
DROP INDEX IF EXISTS idx_purchase_requests_request_number;
DROP INDEX IF EXISTS idx_purchase_requests_required_date_status;
DROP INDEX IF EXISTS idx_purchase_requests_department_status;
DROP INDEX IF EXISTS idx_purchase_requests_requester_status;
DROP INDEX IF EXISTS idx_purchase_requests_status_priority;

-- Procurement Purchase Orders
DROP INDEX IF EXISTS idx_proc_po_created_by_status;
DROP INDEX IF EXISTS idx_proc_po_supplier_order_date;
DROP INDEX IF EXISTS idx_proc_po_supplier_status;
