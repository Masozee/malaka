-- Currency Settings seed data
INSERT INTO currency_settings (currency_code, currency_name, exchange_rate, is_base_currency, is_active) VALUES
('IDR', 'Indonesian Rupiah', 1.0000, true, true),
('USD', 'US Dollar', 15250.0000, false, true),
('EUR', 'Euro', 16580.0000, false, true),
('SGD', 'Singapore Dollar', 11320.0000, false, true),
('MYR', 'Malaysian Ringgit', 3425.0000, false, true),
('JPY', 'Japanese Yen', 105.5000, false, true),
('CNY', 'Chinese Yuan', 2145.0000, false, true),
('KRW', 'South Korean Won', 11.8500, false, true),
('THB', 'Thai Baht', 435.2000, false, true),
('PHP', 'Philippine Peso', 270.5000, false, true);