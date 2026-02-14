-- +goose Up
-- Finance extended tables for budgeting, capex, loans, forecasts, reports

CREATE TABLE IF NOT EXISTS department_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department VARCHAR(100) NOT NULL,
    category VARCHAR(200) NOT NULL,
    fiscal_year VARCHAR(10) NOT NULL,
    allocated NUMERIC(18,2) NOT NULL DEFAULT 0,
    spent NUMERIC(18,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'on_track',
    company_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS capex_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    category VARCHAR(50) NOT NULL,
    est_budget NUMERIC(18,2) NOT NULL DEFAULT 0,
    actual_spent NUMERIC(18,2) NOT NULL DEFAULT 0,
    expected_roi NUMERIC(8,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'planning',
    priority VARCHAR(10) NOT NULL DEFAULT 'medium',
    start_date TIMESTAMPTZ,
    completion_date TIMESTAMPTZ,
    company_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loan_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_name VARCHAR(255) NOT NULL,
    lender VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    principal_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    outstanding_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    interest_rate NUMERIC(8,4) NOT NULL DEFAULT 0,
    maturity_date TIMESTAMPTZ NOT NULL,
    next_payment_date TIMESTAMPTZ,
    next_payment_amount NUMERIC(18,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    company_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    fiscal_year VARCHAR(10) NOT NULL,
    projected_revenue NUMERIC(18,2) DEFAULT 0,
    projected_ebitda NUMERIC(18,2) DEFAULT 0,
    growth_rate NUMERIC(8,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    company_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    period VARCHAR(50) NOT NULL,
    generated_by VARCHAR(100) DEFAULT '',
    file_size VARCHAR(20) DEFAULT '',
    file_path TEXT DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'processing',
    company_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS finance_reports;
DROP TABLE IF EXISTS financial_forecasts;
DROP TABLE IF EXISTS loan_facilities;
DROP TABLE IF EXISTS capex_projects;
DROP TABLE IF EXISTS department_budgets;
