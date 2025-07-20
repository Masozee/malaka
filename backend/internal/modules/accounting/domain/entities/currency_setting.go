package entities

import (
	"time"
)

// CurrencySetting represents currency configuration in the system
type CurrencySetting struct {
	ID               string    `json:"id" db:"id"`
	CurrencyCode     string    `json:"currency_code" db:"currency_code"`         // ISO 4217 currency code (e.g., IDR, USD)
	CurrencyName     string    `json:"currency_name" db:"currency_name"`         // Full currency name (e.g., Indonesian Rupiah)
	Symbol           string    `json:"symbol" db:"symbol"`                       // Currency symbol (e.g., Rp, $)
	DecimalPlaces    int       `json:"decimal_places" db:"decimal_places"`       // Number of decimal places
	ThousandsSep     string    `json:"thousands_sep" db:"thousands_sep"`         // Thousands separator
	DecimalSep       string    `json:"decimal_sep" db:"decimal_sep"`             // Decimal separator
	SymbolPosition   string    `json:"symbol_position" db:"symbol_position"`     // before, after
	IsBaseCurrency   bool      `json:"is_base_currency" db:"is_base_currency"`   // Primary currency for the company
	ExchangeRate     float64   `json:"exchange_rate" db:"exchange_rate"`         // Exchange rate to base currency
	IsActive         bool      `json:"is_active" db:"is_active"`                 // Whether currency is active
	CompanyID        string    `json:"company_id" db:"company_id"`               // Foreign key to companies
	CreatedBy        string    `json:"created_by" db:"created_by"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

// CurrencyExchangeRate represents historical exchange rates
type CurrencyExchangeRate struct {
	ID           string    `json:"id" db:"id"`
	CurrencyID   string    `json:"currency_id" db:"currency_id"`     // Foreign key to currency_settings
	ExchangeRate float64   `json:"exchange_rate" db:"exchange_rate"` // Rate to base currency
	EffectiveDate time.Time `json:"effective_date" db:"effective_date"`
	CreatedBy    string    `json:"created_by" db:"created_by"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

// FormatAmount formats an amount according to currency settings
func (c *CurrencySetting) FormatAmount(amount float64) string {
	// Implementation for formatting amounts with proper separators and symbols
	// This is a simplified version - in production, you'd use a proper formatting library
	if c.SymbolPosition == "before" {
		return c.Symbol + " " + formatNumber(amount, c.DecimalPlaces, c.ThousandsSep, c.DecimalSep)
	}
	return formatNumber(amount, c.DecimalPlaces, c.ThousandsSep, c.DecimalSep) + " " + c.Symbol
}

// formatNumber is a helper function to format numbers with separators
func formatNumber(amount float64, decimalPlaces int, thousandsSep, decimalSep string) string {
	// Simplified implementation - in production, use a proper number formatting library
	return "formatted_amount" // Placeholder
}

// ConvertToBaseCurrency converts amount to base currency
func (c *CurrencySetting) ConvertToBaseCurrency(amount float64) float64 {
	if c.IsBaseCurrency {
		return amount
	}
	return amount / c.ExchangeRate
}

// ConvertFromBaseCurrency converts amount from base currency to this currency
func (c *CurrencySetting) ConvertFromBaseCurrency(baseAmount float64) float64 {
	if c.IsBaseCurrency {
		return baseAmount
	}
	return baseAmount * c.ExchangeRate
}