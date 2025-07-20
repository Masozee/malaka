package repositories

import (
	"context"
	"malaka/internal/modules/accounting/domain/entities"
)

// CurrencySettingRepository defines the contract for currency setting data operations
type CurrencySettingRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, currency *entities.CurrencySetting) error
	GetByID(ctx context.Context, id string) (*entities.CurrencySetting, error)
	GetAll(ctx context.Context) ([]*entities.CurrencySetting, error)
	Update(ctx context.Context, currency *entities.CurrencySetting) error
	Delete(ctx context.Context, id string) error

	// Business-specific operations
	GetByCurrencyCode(ctx context.Context, code string) (*entities.CurrencySetting, error)
	GetByCompanyID(ctx context.Context, companyID string) ([]*entities.CurrencySetting, error)
	GetBaseCurrency(ctx context.Context, companyID string) (*entities.CurrencySetting, error)
	GetActiveCurrencies(ctx context.Context, companyID string) ([]*entities.CurrencySetting, error)
	SetBaseCurrency(ctx context.Context, companyID, currencyID string) error
	UpdateExchangeRate(ctx context.Context, currencyID string, rate float64) error
}

// CurrencyExchangeRateRepository defines the contract for exchange rate data operations
type CurrencyExchangeRateRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, rate *entities.CurrencyExchangeRate) error
	GetByID(ctx context.Context, id string) (*entities.CurrencyExchangeRate, error)
	GetAll(ctx context.Context) ([]*entities.CurrencyExchangeRate, error)
	Update(ctx context.Context, rate *entities.CurrencyExchangeRate) error
	Delete(ctx context.Context, id string) error

	// Business-specific operations
	GetByCurrencyID(ctx context.Context, currencyID string) ([]*entities.CurrencyExchangeRate, error)
	GetLatestRate(ctx context.Context, currencyID string) (*entities.CurrencyExchangeRate, error)
	GetRateByDate(ctx context.Context, currencyID string, date string) (*entities.CurrencyExchangeRate, error)
	GetHistoricalRates(ctx context.Context, currencyID string, fromDate, toDate string) ([]*entities.CurrencyExchangeRate, error)
}