-- +goose Up
-- Migration: Add missing foreign key indexes for improved query performance
-- These indexes were identified as missing during UUID v7 migration analysis

-- ============================================================================
-- POS MODULE - Missing article_id index on pos_items
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_pos_items_article_id
    ON pos_items(article_id);

-- ============================================================================
-- INVENTORY MODULE - Missing indexes on purchase_order_items
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id
    ON purchase_order_items(purchase_order_id);

CREATE INDEX IF NOT EXISTS idx_purchase_order_items_article_id
    ON purchase_order_items(article_id);

-- Composite index for common join pattern
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_article
    ON purchase_order_items(purchase_order_id, article_id);

-- ============================================================================
-- LEAVE MANAGEMENT MODULE - Missing indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_leave_requests_leave_type_id
    ON leave_requests(leave_type_id);

CREATE INDEX IF NOT EXISTS idx_leave_requests_approved_by
    ON leave_requests(approved_by);

CREATE INDEX IF NOT EXISTS idx_leave_balances_leave_type_id
    ON leave_balances(leave_type_id);

-- Composite index for leave balance lookups
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee_type
    ON leave_balances(employee_id, leave_type_id);

CREATE INDEX IF NOT EXISTS idx_leave_policies_leave_type_id
    ON leave_policies(leave_type_id);

CREATE INDEX IF NOT EXISTS idx_leave_approval_history_approved_by
    ON leave_approval_history(approved_by);

-- ============================================================================
-- FIXED ASSETS MODULE - Missing journal_entry_id indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_fixed_asset_depreciations_journal_entry_id
    ON fixed_asset_depreciations(journal_entry_id);

CREATE INDEX IF NOT EXISTS idx_fixed_asset_disposals_journal_entry_id
    ON fixed_asset_disposals(journal_entry_id);

-- ============================================================================
-- PROCUREMENT MODULE - Missing user reference indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_purchase_requests_requester_id
    ON purchase_requests(requester_id);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_approved_by
    ON purchase_requests(approved_by);

CREATE INDEX IF NOT EXISTS idx_contracts_signed_by
    ON contracts(signed_by);

CREATE INDEX IF NOT EXISTS idx_procurement_po_approved_by
    ON procurement_purchase_orders(approved_by);

-- ============================================================================
-- ADDITIONAL COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================================================

-- POS transactions by date range and cashier (common reporting query)
CREATE INDEX IF NOT EXISTS idx_pos_transactions_cashier_date
    ON pos_transactions(cashier_id, transaction_date DESC);

-- Leave requests by employee and status (common HR query)
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_status
    ON leave_requests(employee_id, status);

-- Purchase requests by status and date (common procurement query)
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status_date
    ON purchase_requests(status, created_at DESC);

-- Fixed assets by status (for depreciation calculations)
CREATE INDEX IF NOT EXISTS idx_fixed_assets_status
    ON fixed_assets(status);

-- +goose Down
DROP INDEX IF EXISTS idx_pos_items_article_id;
DROP INDEX IF EXISTS idx_purchase_order_items_po_id;
DROP INDEX IF EXISTS idx_purchase_order_items_article_id;
DROP INDEX IF EXISTS idx_purchase_order_items_po_article;
DROP INDEX IF EXISTS idx_leave_requests_leave_type_id;
DROP INDEX IF EXISTS idx_leave_requests_approved_by;
DROP INDEX IF EXISTS idx_leave_balances_leave_type_id;
DROP INDEX IF EXISTS idx_leave_balances_employee_type;
DROP INDEX IF EXISTS idx_leave_policies_leave_type_id;
DROP INDEX IF EXISTS idx_leave_approval_history_approved_by;
DROP INDEX IF EXISTS idx_fixed_asset_depreciations_journal_entry_id;
DROP INDEX IF EXISTS idx_fixed_asset_disposals_journal_entry_id;
DROP INDEX IF EXISTS idx_purchase_requests_requester_id;
DROP INDEX IF EXISTS idx_purchase_requests_approved_by;
DROP INDEX IF EXISTS idx_contracts_signed_by;
DROP INDEX IF EXISTS idx_procurement_po_approved_by;
DROP INDEX IF EXISTS idx_pos_transactions_cashier_date;
DROP INDEX IF EXISTS idx_leave_requests_employee_status;
DROP INDEX IF EXISTS idx_purchase_requests_status_date;
DROP INDEX IF EXISTS idx_fixed_assets_status;
