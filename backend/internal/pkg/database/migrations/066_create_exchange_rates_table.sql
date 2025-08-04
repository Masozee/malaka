-- +goose Up
-- +goose StatementBegin

-- Create exchange_rates table for daily Bank Indonesia rates
CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency VARCHAR(3) NOT NULL,
    currency_name VARCHAR(100) NOT NULL,
    buy_rate DECIMAL(15,4) NOT NULL,
    sell_rate DECIMAL(15,4) NOT NULL,
    middle_rate DECIMAL(15,4) NOT NULL,
    rate_date DATE NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50) NOT NULL DEFAULT 'Bank Indonesia',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index for currency and date combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_exchange_rates_currency_date 
ON exchange_rates(currency, rate_date);

-- Create index for faster querying by date
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date 
ON exchange_rates(rate_date DESC);

-- Create index for active rates
CREATE INDEX IF NOT EXISTS idx_exchange_rates_active 
ON exchange_rates(is_active, currency, rate_date DESC);

-- Create index for source
CREATE INDEX IF NOT EXISTS idx_exchange_rates_source 
ON exchange_rates(source);

-- Add comments
COMMENT ON TABLE exchange_rates IS 'Daily exchange rates from Bank Indonesia and backup sources';
COMMENT ON COLUMN exchange_rates.currency IS 'ISO 4217 currency code (USD, EUR, etc.)';
COMMENT ON COLUMN exchange_rates.currency_name IS 'Full currency name (US Dollar, Euro, etc.)';
COMMENT ON COLUMN exchange_rates.buy_rate IS 'Bank buying rate (IDR per 1 foreign currency)';
COMMENT ON COLUMN exchange_rates.sell_rate IS 'Bank selling rate (IDR per 1 foreign currency)';
COMMENT ON COLUMN exchange_rates.middle_rate IS 'Middle rate (average of buy and sell)';
COMMENT ON COLUMN exchange_rates.rate_date IS 'Date for which the rate is valid';
COMMENT ON COLUMN exchange_rates.source IS 'Data source (Bank Indonesia, ExchangeRate-API, etc.)';

-- Create exchange_rate_settings table for configuration
CREATE TABLE IF NOT EXISTS exchange_rate_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO exchange_rate_settings (setting_key, setting_value, description) VALUES
('fetch_time', '09:30', 'Daily fetch time (HH:MM format)'),
('primary_source', 'Bank Indonesia', 'Primary data source for exchange rates'),
('backup_source', 'ExchangeRate-API', 'Backup data source when primary fails'),
('supported_currencies', 'USD,EUR,SGD,JPY,GBP,AUD,CNY,MYR,THB,KRW', 'Comma-separated list of supported currencies'),
('auto_fetch_enabled', 'true', 'Enable automatic daily fetching'),
('retention_days', '365', 'Number of days to retain historical data'),
('spread_percentage', '0.2', 'Default spread percentage for calculated rates')
ON CONFLICT (setting_key) DO NOTHING;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Drop tables
DROP TABLE IF EXISTS exchange_rate_settings;
DROP TABLE IF EXISTS exchange_rates;

-- +goose StatementEnd