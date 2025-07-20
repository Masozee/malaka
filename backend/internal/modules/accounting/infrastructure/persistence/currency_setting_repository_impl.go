package persistence

import (
	"context"
	"database/sql"
	"time"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
)

type currencySettingRepositoryImpl struct {
	db *sql.DB
}

// NewCurrencySettingRepository creates a new instance of currency setting repository
func NewCurrencySettingRepository(db *sql.DB) repositories.CurrencySettingRepository {
	return &currencySettingRepositoryImpl{db: db}
}

// Create creates a new currency setting
func (r *currencySettingRepositoryImpl) Create(ctx context.Context, currency *entities.CurrencySetting) error {
	query := `
		INSERT INTO currency_settings (
			id, currency_code, currency_name, symbol, decimal_places,
			thousands_sep, decimal_sep, symbol_position, is_base_currency,
			exchange_rate, is_active, company_id, created_by, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`

	_, err := r.db.ExecContext(ctx, query,
		currency.ID, currency.CurrencyCode, currency.CurrencyName, currency.Symbol,
		currency.DecimalPlaces, currency.ThousandsSep, currency.DecimalSep,
		currency.SymbolPosition, currency.IsBaseCurrency, currency.ExchangeRate,
		currency.IsActive, currency.CompanyID, currency.CreatedBy,
		currency.CreatedAt, currency.UpdatedAt)

	return err
}

// GetByID retrieves a currency setting by ID
func (r *currencySettingRepositoryImpl) GetByID(ctx context.Context, id string) (*entities.CurrencySetting, error) {
	currency := &entities.CurrencySetting{}
	query := `
		SELECT id, currency_code, currency_name, symbol, decimal_places,
			   thousands_sep, decimal_sep, symbol_position, is_base_currency,
			   exchange_rate, is_active, company_id, created_by, created_at, updated_at
		FROM currency_settings WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&currency.ID, &currency.CurrencyCode, &currency.CurrencyName, &currency.Symbol,
		&currency.DecimalPlaces, &currency.ThousandsSep, &currency.DecimalSep,
		&currency.SymbolPosition, &currency.IsBaseCurrency, &currency.ExchangeRate,
		&currency.IsActive, &currency.CompanyID, &currency.CreatedBy,
		&currency.CreatedAt, &currency.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return currency, nil
}

// GetAll retrieves all currency settings
func (r *currencySettingRepositoryImpl) GetAll(ctx context.Context) ([]*entities.CurrencySetting, error) {
	query := `
		SELECT id, currency_code, currency_name, symbol, decimal_places,
			   thousands_sep, decimal_sep, symbol_position, is_base_currency,
			   exchange_rate, is_active, company_id, created_by, created_at, updated_at
		FROM currency_settings ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var currencies []*entities.CurrencySetting
	for rows.Next() {
		currency := &entities.CurrencySetting{}
		err := rows.Scan(
			&currency.ID, &currency.CurrencyCode, &currency.CurrencyName, &currency.Symbol,
			&currency.DecimalPlaces, &currency.ThousandsSep, &currency.DecimalSep,
			&currency.SymbolPosition, &currency.IsBaseCurrency, &currency.ExchangeRate,
			&currency.IsActive, &currency.CompanyID, &currency.CreatedBy,
			&currency.CreatedAt, &currency.UpdatedAt)
		if err != nil {
			return nil, err
		}
		currencies = append(currencies, currency)
	}

	return currencies, nil
}

// Update updates an existing currency setting
func (r *currencySettingRepositoryImpl) Update(ctx context.Context, currency *entities.CurrencySetting) error {
	query := `
		UPDATE currency_settings SET
			currency_code = $2, currency_name = $3, symbol = $4, decimal_places = $5,
			thousands_sep = $6, decimal_sep = $7, symbol_position = $8,
			is_base_currency = $9, exchange_rate = $10, is_active = $11,
			updated_at = $12
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		currency.ID, currency.CurrencyCode, currency.CurrencyName, currency.Symbol,
		currency.DecimalPlaces, currency.ThousandsSep, currency.DecimalSep,
		currency.SymbolPosition, currency.IsBaseCurrency, currency.ExchangeRate,
		currency.IsActive, currency.UpdatedAt)

	return err
}

// Delete deletes a currency setting
func (r *currencySettingRepositoryImpl) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM currency_settings WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetByCurrencyCode retrieves a currency setting by currency code
func (r *currencySettingRepositoryImpl) GetByCurrencyCode(ctx context.Context, code string) (*entities.CurrencySetting, error) {
	currency := &entities.CurrencySetting{}
	query := `
		SELECT id, currency_code, currency_name, symbol, decimal_places,
			   thousands_sep, decimal_sep, symbol_position, is_base_currency,
			   exchange_rate, is_active, company_id, created_by, created_at, updated_at
		FROM currency_settings WHERE currency_code = $1`

	err := r.db.QueryRowContext(ctx, query, code).Scan(
		&currency.ID, &currency.CurrencyCode, &currency.CurrencyName, &currency.Symbol,
		&currency.DecimalPlaces, &currency.ThousandsSep, &currency.DecimalSep,
		&currency.SymbolPosition, &currency.IsBaseCurrency, &currency.ExchangeRate,
		&currency.IsActive, &currency.CompanyID, &currency.CreatedBy,
		&currency.CreatedAt, &currency.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return currency, nil
}

// GetByCompanyID retrieves currency settings by company ID
func (r *currencySettingRepositoryImpl) GetByCompanyID(ctx context.Context, companyID string) ([]*entities.CurrencySetting, error) {
	query := `
		SELECT id, currency_code, currency_name, symbol, decimal_places,
			   thousands_sep, decimal_sep, symbol_position, is_base_currency,
			   exchange_rate, is_active, company_id, created_by, created_at, updated_at
		FROM currency_settings WHERE company_id = $1 ORDER BY is_base_currency DESC, currency_code`

	rows, err := r.db.QueryContext(ctx, query, companyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var currencies []*entities.CurrencySetting
	for rows.Next() {
		currency := &entities.CurrencySetting{}
		err := rows.Scan(
			&currency.ID, &currency.CurrencyCode, &currency.CurrencyName, &currency.Symbol,
			&currency.DecimalPlaces, &currency.ThousandsSep, &currency.DecimalSep,
			&currency.SymbolPosition, &currency.IsBaseCurrency, &currency.ExchangeRate,
			&currency.IsActive, &currency.CompanyID, &currency.CreatedBy,
			&currency.CreatedAt, &currency.UpdatedAt)
		if err != nil {
			return nil, err
		}
		currencies = append(currencies, currency)
	}

	return currencies, nil
}

// GetBaseCurrency retrieves the base currency for a company
func (r *currencySettingRepositoryImpl) GetBaseCurrency(ctx context.Context, companyID string) (*entities.CurrencySetting, error) {
	currency := &entities.CurrencySetting{}
	query := `
		SELECT id, currency_code, currency_name, symbol, decimal_places,
			   thousands_sep, decimal_sep, symbol_position, is_base_currency,
			   exchange_rate, is_active, company_id, created_by, created_at, updated_at
		FROM currency_settings WHERE company_id = $1 AND is_base_currency = true`

	err := r.db.QueryRowContext(ctx, query, companyID).Scan(
		&currency.ID, &currency.CurrencyCode, &currency.CurrencyName, &currency.Symbol,
		&currency.DecimalPlaces, &currency.ThousandsSep, &currency.DecimalSep,
		&currency.SymbolPosition, &currency.IsBaseCurrency, &currency.ExchangeRate,
		&currency.IsActive, &currency.CompanyID, &currency.CreatedBy,
		&currency.CreatedAt, &currency.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return currency, nil
}

// GetActiveCurrencies retrieves active currencies for a company
func (r *currencySettingRepositoryImpl) GetActiveCurrencies(ctx context.Context, companyID string) ([]*entities.CurrencySetting, error) {
	query := `
		SELECT id, currency_code, currency_name, symbol, decimal_places,
			   thousands_sep, decimal_sep, symbol_position, is_base_currency,
			   exchange_rate, is_active, company_id, created_by, created_at, updated_at
		FROM currency_settings WHERE company_id = $1 AND is_active = true 
		ORDER BY is_base_currency DESC, currency_code`

	rows, err := r.db.QueryContext(ctx, query, companyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var currencies []*entities.CurrencySetting
	for rows.Next() {
		currency := &entities.CurrencySetting{}
		err := rows.Scan(
			&currency.ID, &currency.CurrencyCode, &currency.CurrencyName, &currency.Symbol,
			&currency.DecimalPlaces, &currency.ThousandsSep, &currency.DecimalSep,
			&currency.SymbolPosition, &currency.IsBaseCurrency, &currency.ExchangeRate,
			&currency.IsActive, &currency.CompanyID, &currency.CreatedBy,
			&currency.CreatedAt, &currency.UpdatedAt)
		if err != nil {
			return nil, err
		}
		currencies = append(currencies, currency)
	}

	return currencies, nil
}

// SetBaseCurrency sets a currency as the base currency for a company
func (r *currencySettingRepositoryImpl) SetBaseCurrency(ctx context.Context, companyID, currencyID string) error {
	// Start transaction
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// First, unset all base currencies for the company
	_, err = tx.ExecContext(ctx, `
		UPDATE currency_settings 
		SET is_base_currency = false, exchange_rate = 1.0, updated_at = $1
		WHERE company_id = $2 AND is_base_currency = true`,
		time.Now(), companyID)
	if err != nil {
		return err
	}

	// Set the new base currency
	_, err = tx.ExecContext(ctx, `
		UPDATE currency_settings 
		SET is_base_currency = true, exchange_rate = 1.0, updated_at = $1
		WHERE id = $2 AND company_id = $3`,
		time.Now(), currencyID, companyID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// UpdateExchangeRate updates the exchange rate for a currency
func (r *currencySettingRepositoryImpl) UpdateExchangeRate(ctx context.Context, currencyID string, rate float64) error {
	query := `
		UPDATE currency_settings 
		SET exchange_rate = $2, updated_at = $3
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query, currencyID, rate, time.Now())
	return err
}