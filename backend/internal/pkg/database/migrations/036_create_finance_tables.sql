-- +goose Up
-- Create additional finance module tables

-- Cash Books (Buku Kas Bank)
CREATE TABLE cash_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_code VARCHAR(50) UNIQUE NOT NULL,
    book_name VARCHAR(255) NOT NULL,
    book_type VARCHAR(20) NOT NULL CHECK (book_type IN ('CASH', 'BANK')),
    account_number VARCHAR(50),
    bank_name VARCHAR(255),
    opening_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Vouchers (Kontrabon)
CREATE TABLE purchase_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID NOT NULL,
    voucher_date DATE NOT NULL,
    due_date DATE,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenditure Requests (Pengajuan Pengeluaran Kas Bank)
CREATE TABLE expenditure_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    requestor_id UUID NOT NULL,
    department VARCHAR(100),
    request_date DATE NOT NULL,
    required_date DATE,
    purpose TEXT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    approved_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING',
    priority VARCHAR(20) DEFAULT 'NORMAL',
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID,
    processed_at TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check Clearance (Pencairan Giro/Cheque)
CREATE TABLE check_clearance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_number VARCHAR(50) UNIQUE NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50),
    check_date DATE NOT NULL,
    clearance_date DATE,
    amount DECIMAL(15,2) NOT NULL,
    payee_name VARCHAR(255) NOT NULL,
    memo TEXT,
    status VARCHAR(20) DEFAULT 'ISSUED',
    cleared_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly Closing (Closing Bulanan)
CREATE TABLE monthly_closing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL,
    closing_date DATE NOT NULL,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_expenses DECIMAL(15,2) DEFAULT 0,
    net_income DECIMAL(15,2) DEFAULT 0,
    cash_position DECIMAL(15,2) DEFAULT 0,
    bank_position DECIMAL(15,2) DEFAULT 0,
    accounts_receivable DECIMAL(15,2) DEFAULT 0,
    accounts_payable DECIMAL(15,2) DEFAULT 0,
    inventory_value DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'OPEN',
    closed_by UUID,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(period_year, period_month)
);

-- +goose Down
DROP TABLE IF EXISTS monthly_closing;
DROP TABLE IF EXISTS check_clearance;
DROP TABLE IF EXISTS expenditure_requests;
DROP TABLE IF EXISTS purchase_vouchers;
DROP TABLE IF EXISTS cash_books;