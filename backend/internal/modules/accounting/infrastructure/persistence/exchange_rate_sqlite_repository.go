package persistence

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"malaka/internal/modules/accounting/domain/entities"
)

// ExchangeRateSQLiteRepository handles SQLite operations for exchange rates
type ExchangeRateSQLiteRepository struct {
	db     *sql.DB
	dbPath string
}

// NewExchangeRateSQLiteRepository creates a new SQLite repository
func NewExchangeRateSQLiteRepository(dbPath string) (*ExchangeRateSQLiteRepository, error) {
	// Ensure directory exists
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create directory: %w", err)
	}

	// Open SQLite database
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open SQLite database: %w", err)
	}

	repo := &ExchangeRateSQLiteRepository{
		db:     db,
		dbPath: dbPath,
	}

	// Initialize database schema
	if err := repo.initSchema(); err != nil {
		return nil, fmt.Errorf("failed to initialize schema: %w", err)
	}

	log.Printf("Exchange rate SQLite database initialized: %s", dbPath)
	return repo, nil
}

// initSchema creates the necessary tables
func (r *ExchangeRateSQLiteRepository) initSchema() error {
	schema := `
	CREATE TABLE IF NOT EXISTS exchange_rates (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		currency TEXT NOT NULL,
		currency_name TEXT NOT NULL,
		buy_rate REAL NOT NULL,
		sell_rate REAL NOT NULL,
		middle_rate REAL NOT NULL,
		rate_date TEXT NOT NULL,
		last_updated TEXT NOT NULL,
		source TEXT NOT NULL DEFAULT 'Bank Indonesia',
		is_active INTEGER DEFAULT 1,
		created_at TEXT DEFAULT CURRENT_TIMESTAMP,
		updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(currency, rate_date)
	);

	CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_date 
	ON exchange_rates(currency, rate_date);

	CREATE INDEX IF NOT EXISTS idx_exchange_rates_date 
	ON exchange_rates(rate_date DESC);

	CREATE INDEX IF NOT EXISTS idx_exchange_rates_active 
	ON exchange_rates(is_active, currency, rate_date DESC);

	CREATE TABLE IF NOT EXISTS exchange_rate_settings (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		setting_key TEXT NOT NULL UNIQUE,
		setting_value TEXT NOT NULL,
		description TEXT,
		created_at TEXT DEFAULT CURRENT_TIMESTAMP,
		updated_at TEXT DEFAULT CURRENT_TIMESTAMP
	);

	INSERT OR IGNORE INTO exchange_rate_settings (setting_key, setting_value, description) VALUES
	('fetch_time', '09:30', 'Daily fetch time (HH:MM format)'),
	('primary_source', 'Bank Indonesia', 'Primary data source for exchange rates'),
	('backup_source', 'ExchangeRate-API', 'Backup data source when primary fails'),
	('supported_currencies', 'USD,EUR,SGD,JPY,GBP,AUD,CNY,MYR,THB,KRW', 'Comma-separated list of supported currencies'),
	('auto_fetch_enabled', 'true', 'Enable automatic daily fetching'),
	('retention_days', '365', 'Number of days to retain historical data'),
	('spread_percentage', '0.2', 'Default spread percentage for calculated rates');
	`

	_, err := r.db.Exec(schema)
	return err
}

// SaveExchangeRates saves exchange rates to SQLite database
func (r *ExchangeRateSQLiteRepository) SaveExchangeRates(rates []entities.ExchangeRateData) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
		INSERT OR REPLACE INTO exchange_rates 
		(currency, currency_name, buy_rate, sell_rate, middle_rate, rate_date, last_updated, source, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
	`)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for _, rate := range rates {
		_, err := stmt.Exec(
			rate.Currency,
			rate.CurrencyName,
			rate.BuyRate,
			rate.SellRate,
			rate.MiddleRate,
			rate.Date.Format("2006-01-02"),
			rate.LastUpdated.Format(time.RFC3339),
			rate.Source,
		)
		if err != nil {
			return fmt.Errorf("failed to insert rate for %s: %w", rate.Currency, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("Successfully saved %d exchange rates to SQLite", len(rates))
	return nil
}

// GetLatestRates retrieves the latest exchange rates
func (r *ExchangeRateSQLiteRepository) GetLatestRates() ([]entities.ExchangeRateData, error) {
	query := `
		SELECT DISTINCT
			currency, currency_name, buy_rate, sell_rate, middle_rate, 
			rate_date, last_updated, source
		FROM exchange_rates r1
		WHERE rate_date = (
			SELECT MAX(rate_date) 
			FROM exchange_rates r2 
			WHERE r2.currency = r1.currency AND is_active = 1
		)
		AND is_active = 1
		ORDER BY currency
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query latest rates: %w", err)
	}
	defer rows.Close()

	var rates []entities.ExchangeRateData
	for rows.Next() {
		var rate entities.ExchangeRateData
		var rateDateStr, lastUpdatedStr string

		err := rows.Scan(
			&rate.Currency,
			&rate.CurrencyName,
			&rate.BuyRate,
			&rate.SellRate,
			&rate.MiddleRate,
			&rateDateStr,
			&lastUpdatedStr,
			&rate.Source,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan rate: %w", err)
		}

		// Parse dates
		if rate.Date, err = time.Parse("2006-01-02", rateDateStr); err != nil {
			log.Printf("Failed to parse rate date %s: %v", rateDateStr, err)
		}
		if rate.LastUpdated, err = time.Parse(time.RFC3339, lastUpdatedStr); err != nil {
			log.Printf("Failed to parse last updated %s: %v", lastUpdatedStr, err)
		}

		rates = append(rates, rate)
	}

	return rates, nil
}

// GetRatesByDate retrieves exchange rates for a specific date
func (r *ExchangeRateSQLiteRepository) GetRatesByDate(date time.Time) ([]entities.ExchangeRateData, error) {
	query := `
		SELECT currency, currency_name, buy_rate, sell_rate, middle_rate, 
		       rate_date, last_updated, source
		FROM exchange_rates
		WHERE rate_date = ? AND is_active = 1
		ORDER BY currency
	`

	rows, err := r.db.Query(query, date.Format("2006-01-02"))
	if err != nil {
		return nil, fmt.Errorf("failed to query rates by date: %w", err)
	}
	defer rows.Close()

	var rates []entities.ExchangeRateData
	for rows.Next() {
		var rate entities.ExchangeRateData
		var rateDateStr, lastUpdatedStr string

		err := rows.Scan(
			&rate.Currency,
			&rate.CurrencyName,
			&rate.BuyRate,
			&rate.SellRate,
			&rate.MiddleRate,
			&rateDateStr,
			&lastUpdatedStr,
			&rate.Source,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan rate: %w", err)
		}

		// Parse dates
		if rate.Date, err = time.Parse("2006-01-02", rateDateStr); err != nil {
			log.Printf("Failed to parse rate date %s: %v", rateDateStr, err)
		}
		if rate.LastUpdated, err = time.Parse(time.RFC3339, lastUpdatedStr); err != nil {
			log.Printf("Failed to parse last updated %s: %v", lastUpdatedStr, err)
		}

		rates = append(rates, rate)
	}

	return rates, nil
}

// GetRateHistory retrieves historical rates for a specific currency
func (r *ExchangeRateSQLiteRepository) GetRateHistory(currency string, days int) ([]entities.ExchangeRateData, error) {
	query := `
		SELECT currency, currency_name, buy_rate, sell_rate, middle_rate, 
		       rate_date, last_updated, source
		FROM exchange_rates
		WHERE currency = ? AND is_active = 1 
		  AND rate_date >= date('now', '-' || ? || ' days')
		ORDER BY rate_date DESC
		LIMIT 100
	`

	rows, err := r.db.Query(query, currency, days)
	if err != nil {
		return nil, fmt.Errorf("failed to query rate history: %w", err)
	}
	defer rows.Close()

	var rates []entities.ExchangeRateData
	for rows.Next() {
		var rate entities.ExchangeRateData
		var rateDateStr, lastUpdatedStr string

		err := rows.Scan(
			&rate.Currency,
			&rate.CurrencyName,
			&rate.BuyRate,
			&rate.SellRate,
			&rate.MiddleRate,
			&rateDateStr,
			&lastUpdatedStr,
			&rate.Source,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan rate: %w", err)
		}

		// Parse dates
		if rate.Date, err = time.Parse("2006-01-02", rateDateStr); err != nil {
			log.Printf("Failed to parse rate date %s: %v", rateDateStr, err)
		}
		if rate.LastUpdated, err = time.Parse(time.RFC3339, lastUpdatedStr); err != nil {
			log.Printf("Failed to parse last updated %s: %v", lastUpdatedStr, err)
		}

		rates = append(rates, rate)
	}

	return rates, nil
}

// GetStats returns database statistics
func (r *ExchangeRateSQLiteRepository) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total records
	var totalRecords int
	err := r.db.QueryRow("SELECT COUNT(*) FROM exchange_rates WHERE is_active = 1").Scan(&totalRecords)
	if err != nil {
		return nil, fmt.Errorf("failed to get total records: %w", err)
	}
	stats["total_records"] = totalRecords

	// Unique currencies
	var currenciesCount int
	err = r.db.QueryRow("SELECT COUNT(DISTINCT currency) FROM exchange_rates WHERE is_active = 1").Scan(&currenciesCount)
	if err != nil {
		return nil, fmt.Errorf("failed to get currencies count: %w", err)
	}
	stats["currencies_count"] = currenciesCount

	// Latest date
	var latestDate sql.NullString
	err = r.db.QueryRow("SELECT MAX(rate_date) FROM exchange_rates WHERE is_active = 1").Scan(&latestDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get latest date: %w", err)
	}
	if latestDate.Valid {
		stats["latest_date"] = latestDate.String
	} else {
		stats["latest_date"] = nil
	}

	// Earliest date
	var earliestDate sql.NullString
	err = r.db.QueryRow("SELECT MIN(rate_date) FROM exchange_rates WHERE is_active = 1").Scan(&earliestDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get earliest date: %w", err)
	}
	if earliestDate.Valid {
		stats["earliest_date"] = earliestDate.String
	} else {
		stats["earliest_date"] = nil
	}

	stats["database_path"] = r.dbPath
	stats["database_size_mb"] = r.getDatabaseSize()

	return stats, nil
}

// getDatabaseSize returns the database file size in MB
func (r *ExchangeRateSQLiteRepository) getDatabaseSize() float64 {
	if info, err := os.Stat(r.dbPath); err == nil {
		return float64(info.Size()) / (1024 * 1024) // Convert to MB
	}
	return 0
}

// CleanupOldRates removes rates older than specified days
func (r *ExchangeRateSQLiteRepository) CleanupOldRates(retentionDays int) error {
	query := `
		UPDATE exchange_rates 
		SET is_active = 0, updated_at = CURRENT_TIMESTAMP
		WHERE rate_date < date('now', '-' || ? || ' days')
	`

	result, err := r.db.Exec(query, retentionDays)
	if err != nil {
		return fmt.Errorf("failed to cleanup old rates: %w", err)
	}

	affected, _ := result.RowsAffected()
	log.Printf("Deactivated %d old exchange rate records (older than %d days)", affected, retentionDays)

	return nil
}

// Close closes the database connection
func (r *ExchangeRateSQLiteRepository) Close() error {
	if r.db != nil {
		return r.db.Close()
	}
	return nil
}