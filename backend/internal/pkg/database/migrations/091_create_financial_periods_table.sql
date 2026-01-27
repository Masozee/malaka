-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS financial_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id VARCHAR(100) NOT NULL DEFAULT 'default',
    period_name VARCHAR(100) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL CHECK (period_month >= 1 AND period_month <= 12),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    is_closed BOOLEAN NOT NULL DEFAULT false,
    closed_by VARCHAR(100),
    closed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, fiscal_year, period_month)
);

-- Create indexes for common queries
CREATE INDEX idx_financial_periods_company_id ON financial_periods(company_id);
CREATE INDEX idx_financial_periods_fiscal_year ON financial_periods(fiscal_year);
CREATE INDEX idx_financial_periods_status ON financial_periods(status);
CREATE INDEX idx_financial_periods_is_closed ON financial_periods(is_closed);
CREATE INDEX idx_financial_periods_dates ON financial_periods(start_date, end_date);

-- Insert default financial periods for current year
INSERT INTO financial_periods (company_id, period_name, fiscal_year, period_month, start_date, end_date, status, is_closed)
VALUES
    ('default', 'January 2026', 2026, 1, '2026-01-01', '2026-01-31 23:59:59', 'open', false),
    ('default', 'February 2026', 2026, 2, '2026-02-01', '2026-02-28 23:59:59', 'open', false),
    ('default', 'March 2026', 2026, 3, '2026-03-01', '2026-03-31 23:59:59', 'open', false),
    ('default', 'April 2026', 2026, 4, '2026-04-01', '2026-04-30 23:59:59', 'open', false),
    ('default', 'May 2026', 2026, 5, '2026-05-01', '2026-05-31 23:59:59', 'open', false),
    ('default', 'June 2026', 2026, 6, '2026-06-01', '2026-06-30 23:59:59', 'open', false),
    ('default', 'July 2026', 2026, 7, '2026-07-01', '2026-07-31 23:59:59', 'open', false),
    ('default', 'August 2026', 2026, 8, '2026-08-01', '2026-08-31 23:59:59', 'open', false),
    ('default', 'September 2026', 2026, 9, '2026-09-01', '2026-09-30 23:59:59', 'open', false),
    ('default', 'October 2026', 2026, 10, '2026-10-01', '2026-10-31 23:59:59', 'open', false),
    ('default', 'November 2026', 2026, 11, '2026-11-01', '2026-11-30 23:59:59', 'open', false),
    ('default', 'December 2026', 2026, 12, '2026-12-01', '2026-12-31 23:59:59', 'open', false);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_financial_periods_dates;
DROP INDEX IF EXISTS idx_financial_periods_is_closed;
DROP INDEX IF EXISTS idx_financial_periods_status;
DROP INDEX IF EXISTS idx_financial_periods_fiscal_year;
DROP INDEX IF EXISTS idx_financial_periods_company_id;
DROP TABLE IF EXISTS financial_periods;
-- +goose StatementEnd
