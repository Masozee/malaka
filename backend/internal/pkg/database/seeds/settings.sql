-- Settings Seed Data
-- This populates the settings table with default configuration values

-- General Settings
INSERT INTO settings (category, setting_key, setting_value, data_type, is_public, default_value, description) VALUES
('general', 'company_name', 'PT Malaka Sepatu Indonesia', 'string', true, 'PT Malaka Sepatu Indonesia', 'Company name'),
('general', 'company_address', 'Jl. Sudirman No. 123, Jakarta Pusat 10270', 'string', true, '', 'Company address'),
('general', 'company_phone', '021-5555-1234', 'string', true, '', 'Company phone number'),
('general', 'company_email', 'info@malaka.co.id', 'string', true, '', 'Company email address'),
('general', 'company_website', 'https://malaka.co.id', 'string', true, '', 'Company website URL'),
('general', 'timezone', 'Asia/Jakarta', 'string', true, 'Asia/Jakarta', 'System timezone'),
('general', 'date_format', 'dd/MM/yyyy', 'string', true, 'dd/MM/yyyy', 'Date display format'),
('general', 'time_format', '24', 'string', true, '24', 'Time format (12 or 24 hour)'),

-- Currency Settings
('currency', 'base_currency', 'IDR', 'string', true, 'IDR', 'Base currency code'),
('currency', 'currency_symbol', 'Rp', 'string', true, 'Rp', 'Currency symbol'),
('currency', 'currency_position', 'before', 'string', true, 'before', 'Currency symbol position'),
('currency', 'thousand_separator', '.', 'string', true, '.', 'Thousand separator'),
('currency', 'decimal_separator', ',', 'string', true, ',', 'Decimal separator'),
('currency', 'decimal_places', '2', 'number', true, '2', 'Number of decimal places'),

-- Tax Settings
('tax', 'default_tax_rate', '11', 'number', true, '11', 'Default tax rate percentage'),
('tax', 'tax_name', 'PPN', 'string', true, 'PPN', 'Tax name/type'),
('tax', 'tax_number', '12.345.678.9-123.000', 'string', false, '', 'Tax registration number'),
('tax', 'enable_tax_inclusive', 'false', 'boolean', true, 'false', 'Enable tax inclusive pricing'),

-- Main API Settings (Non-sensitive)
('api', 'main_api_url', 'http://localhost:8084', 'string', true, 'http://localhost:8084', 'Main API base URL'),
('api', 'api_timeout', '30', 'number', true, '30', 'API request timeout in seconds'),
('api', 'enable_api_logging', 'true', 'boolean', true, 'true', 'Enable API request logging'),
('api', 'api_rate_limit', '1000', 'number', true, '1000', 'API rate limit per hour'),

-- Ramayana API Settings
('api', 'ramayana_enabled', 'true', 'boolean', false, 'false', 'Enable Ramayana integration'),
('api', 'ramayana_name', 'APLIKASI RAMAYANA (HIERARKI)', 'string', true, 'APLIKASI RAMAYANA (HIERARKI)', 'Ramayana application name'),
('api', 'ramayana_api_url', 'https://api.ramayana.co.id/hierarki', 'string', false, '', 'Ramayana API endpoint'),
('api', 'ramayana_api_key', '', 'encrypted', false, '', 'Ramayana API key'),
('api', 'ramayana_timeout', '30', 'number', false, '30', 'Ramayana API timeout'),
('api', 'ramayana_retry_attempts', '3', 'number', false, '3', 'Ramayana retry attempts'),
('api', 'ramayana_enable_sync', 'true', 'boolean', false, 'false', 'Enable Ramayana auto sync'),
('api', 'ramayana_sync_interval', '60', 'number', false, '60', 'Ramayana sync interval in minutes'),

-- Matahari API Settings
('api', 'matahari_enabled', 'true', 'boolean', false, 'false', 'Enable Matahari integration'),
('api', 'matahari_name', 'APLIKASI MATAHARI (MCP)', 'string', true, 'APLIKASI MATAHARI (MCP)', 'Matahari application name'),
('api', 'matahari_api_url', 'https://api.matahari.co.id/mcp', 'string', false, '', 'Matahari API endpoint'),
('api', 'matahari_api_key', '', 'encrypted', false, '', 'Matahari API key'),
('api', 'matahari_timeout', '30', 'number', false, '30', 'Matahari API timeout'),
('api', 'matahari_retry_attempts', '3', 'number', false, '3', 'Matahari retry attempts'),
('api', 'matahari_enable_sync', 'true', 'boolean', false, 'false', 'Enable Matahari auto sync'),
('api', 'matahari_sync_interval', '45', 'number', false, '45', 'Matahari sync interval in minutes'),

-- Yogya API Settings
('api', 'yogya_enabled', 'false', 'boolean', false, 'false', 'Enable Yogya integration'),
('api', 'yogya_name', 'APLIKASI YOGYA (YOBON)', 'string', true, 'APLIKASI YOGYA (YOBON)', 'Yogya application name'),
('api', 'yogya_api_url', 'https://api.yogya.co.id/yobon', 'string', false, '', 'Yogya API endpoint'),
('api', 'yogya_api_key', '', 'encrypted', false, '', 'Yogya API key'),
('api', 'yogya_timeout', '30', 'number', false, '30', 'Yogya API timeout'),
('api', 'yogya_retry_attempts', '3', 'number', false, '3', 'Yogya retry attempts'),
('api', 'yogya_enable_sync', 'false', 'boolean', false, 'false', 'Enable Yogya auto sync'),
('api', 'yogya_sync_interval', '30', 'number', false, '30', 'Yogya sync interval in minutes'),

-- Star API Settings
('api', 'star_enabled', 'false', 'boolean', false, 'false', 'Enable Star integration'),
('api', 'star_name', 'APLIKASI STAR (RAMBLA)', 'string', true, 'APLIKASI STAR (RAMBLA)', 'Star application name'),
('api', 'star_api_url', 'https://api.star.co.id/rambla', 'string', false, '', 'Star API endpoint'),
('api', 'star_api_key', '', 'encrypted', false, '', 'Star API key'),
('api', 'star_timeout', '30', 'number', false, '30', 'Star API timeout'),
('api', 'star_retry_attempts', '3', 'number', false, '3', 'Star retry attempts'),
('api', 'star_enable_sync', 'false', 'boolean', false, 'false', 'Enable Star auto sync'),
('api', 'star_sync_interval', '90', 'number', false, '90', 'Star sync interval in minutes'),

-- Email Settings (Sensitive)
('email', 'smtp_host', 'smtp.gmail.com', 'string', false, 'smtp.gmail.com', 'SMTP server host'),
('email', 'smtp_port', '587', 'number', false, '587', 'SMTP server port'),
('email', 'smtp_username', '', 'string', false, '', 'SMTP username'),
('email', 'smtp_password', '', 'encrypted', false, '', 'SMTP password'),
('email', 'smtp_security', 'tls', 'string', false, 'tls', 'SMTP security method'),
('email', 'from_email', 'noreply@malaka.co.id', 'string', false, '', 'From email address'),
('email', 'from_name', 'Malaka ERP System', 'string', false, '', 'From name'),

-- Security Settings
('security', 'session_timeout', '480', 'number', false, '480', 'Session timeout in minutes'),
('security', 'password_min_length', '8', 'number', true, '8', 'Minimum password length'),
('security', 'require_password_numbers', 'true', 'boolean', true, 'true', 'Require numbers in passwords'),
('security', 'require_password_symbols', 'true', 'boolean', true, 'true', 'Require symbols in passwords'),
('security', 'enable_two_factor', 'false', 'boolean', false, 'false', 'Enable two-factor authentication'),
('security', 'max_login_attempts', '5', 'number', false, '5', 'Maximum login attempts'),

-- Database Settings (Sensitive)
('database', 'db_host', 'localhost', 'string', false, 'localhost', 'Database host'),
('database', 'db_port', '5432', 'number', false, '5432', 'Database port'),
('database', 'db_name', 'malaka', 'string', false, 'malaka', 'Database name'),
('database', 'db_backup_interval', 'daily', 'string', false, 'daily', 'Database backup interval'),
('database', 'enable_auto_backup', 'true', 'boolean', false, 'true', 'Enable automatic backups'),

-- Notification Settings
('notifications', 'enable_email_notifications', 'true', 'boolean', true, 'true', 'Enable email notifications'),
('notifications', 'enable_stock_alerts', 'true', 'boolean', true, 'true', 'Enable stock level alerts'),
('notifications', 'enable_order_notifications', 'true', 'boolean', true, 'true', 'Enable order notifications'),
('notifications', 'low_stock_threshold', '10', 'number', true, '10', 'Low stock alert threshold'),

-- Appearance Settings
('appearance', 'theme', 'system', 'string', true, 'system', 'UI theme preference'),
('appearance', 'primary_color', 'blue', 'string', true, 'blue', 'Primary color scheme'),
('appearance', 'sidebar_collapsed', 'false', 'boolean', true, 'false', 'Default sidebar state'),

-- Localization Settings
('localization', 'language', 'id-ID', 'string', true, 'id-ID', 'System language'),
('localization', 'currency_locale', 'IDR', 'string', true, 'IDR', 'Currency locale'),
('localization', 'number_format', 'id-ID', 'string', true, 'id-ID', 'Number format locale');

-- Default permissions for admin role
INSERT INTO settings_permissions (role, category, can_read, can_write) VALUES
('admin', 'general', true, true),
('admin', 'currency', true, true),
('admin', 'tax', true, true),
('admin', 'api', true, true),
('admin', 'email', true, true),
('admin', 'security', true, true),
('admin', 'database', true, true),
('admin', 'notifications', true, true),
('admin', 'appearance', true, true),
('admin', 'localization', true, true);

-- Default permissions for manager role
INSERT INTO settings_permissions (role, category, can_read, can_write) VALUES
('manager', 'general', true, false),
('manager', 'currency', true, true),
('manager', 'tax', true, true),
('manager', 'api', true, false),
('manager', 'email', false, false),
('manager', 'security', false, false),
('manager', 'database', false, false),
('manager', 'notifications', true, true),
('manager', 'appearance', true, true),
('manager', 'localization', true, true);

-- Default permissions for user role
INSERT INTO settings_permissions (role, category, can_read, can_write) VALUES
('user', 'general', true, false),
('user', 'currency', true, false),
('user', 'tax', true, false),
('user', 'api', false, false),
('user', 'email', false, false),
('user', 'security', false, false),
('user', 'database', false, false),
('user', 'notifications', true, true),
('user', 'appearance', true, true),
('user', 'localization', true, true);