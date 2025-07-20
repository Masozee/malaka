package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/repositories"
)

// CurrencySettingService handles business logic for currency settings
type CurrencySettingService struct {
	currencyRepo     repositories.CurrencySettingRepository
	exchangeRateRepo repositories.CurrencyExchangeRateRepository
}

// NewCurrencySettingService creates a new instance of CurrencySettingService
func NewCurrencySettingService(
	currencyRepo repositories.CurrencySettingRepository,
	exchangeRateRepo repositories.CurrencyExchangeRateRepository,
) *CurrencySettingService {
	return &CurrencySettingService{
		currencyRepo:     currencyRepo,
		exchangeRateRepo: exchangeRateRepo,
	}
}

// CreateCurrencySetting creates a new currency setting
func (s *CurrencySettingService) CreateCurrencySetting(ctx context.Context, currency *entities.CurrencySetting) error {
	// Validate currency code uniqueness
	existing, err := s.currencyRepo.GetByCurrencyCode(ctx, currency.CurrencyCode)
	if err == nil && existing != nil {
		return errors.New("currency code already exists")
	}

	// If this is the first currency or marked as base, ensure only one base currency exists
	if currency.IsBaseCurrency {
		baseCurrency, _ := s.currencyRepo.GetBaseCurrency(ctx, currency.CompanyID)
		if baseCurrency != nil {
			return errors.New("base currency already exists for this company")
		}
	}

	// Set default values
	currency.CreatedAt = time.Now()
	currency.UpdatedAt = time.Now()
	currency.IsActive = true

	// Set default exchange rate for base currency
	if currency.IsBaseCurrency {
		currency.ExchangeRate = 1.0
	}

	return s.currencyRepo.Create(ctx, currency)
}

// GetCurrencySettingByID retrieves a currency setting by ID
func (s *CurrencySettingService) GetCurrencySettingByID(ctx context.Context, id string) (*entities.CurrencySetting, error) {
	return s.currencyRepo.GetByID(ctx, id)
}

// GetAllCurrencySettings retrieves all currency settings
func (s *CurrencySettingService) GetAllCurrencySettings(ctx context.Context) ([]*entities.CurrencySetting, error) {
	return s.currencyRepo.GetAll(ctx)
}

// GetCurrencySettingsByCompany retrieves currency settings for a specific company
func (s *CurrencySettingService) GetCurrencySettingsByCompany(ctx context.Context, companyID string) ([]*entities.CurrencySetting, error) {
	return s.currencyRepo.GetByCompanyID(ctx, companyID)
}

// GetActiveCurrencies retrieves active currencies for a company
func (s *CurrencySettingService) GetActiveCurrencies(ctx context.Context, companyID string) ([]*entities.CurrencySetting, error) {
	return s.currencyRepo.GetActiveCurrencies(ctx, companyID)
}

// GetBaseCurrency retrieves the base currency for a company
func (s *CurrencySettingService) GetBaseCurrency(ctx context.Context, companyID string) (*entities.CurrencySetting, error) {
	return s.currencyRepo.GetBaseCurrency(ctx, companyID)
}

// UpdateCurrencySetting updates an existing currency setting
func (s *CurrencySettingService) UpdateCurrencySetting(ctx context.Context, currency *entities.CurrencySetting) error {
	// Get existing currency
	existing, err := s.currencyRepo.GetByID(ctx, currency.ID)
	if err != nil {
		return err
	}

	// If changing to base currency, ensure only one base currency exists
	if currency.IsBaseCurrency && !existing.IsBaseCurrency {
		baseCurrency, _ := s.currencyRepo.GetBaseCurrency(ctx, currency.CompanyID)
		if baseCurrency != nil {
			return errors.New("base currency already exists for this company")
		}
		currency.ExchangeRate = 1.0
	}

	// Update timestamp
	currency.UpdatedAt = time.Now()

	return s.currencyRepo.Update(ctx, currency)
}

// DeleteCurrencySetting deletes a currency setting
func (s *CurrencySettingService) DeleteCurrencySetting(ctx context.Context, id string) error {
	// Check if it's the base currency
	currency, err := s.currencyRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if currency.IsBaseCurrency {
		return errors.New("cannot delete base currency")
	}

	return s.currencyRepo.Delete(ctx, id)
}

// SetBaseCurrency sets a currency as the base currency for a company
func (s *CurrencySettingService) SetBaseCurrency(ctx context.Context, companyID, currencyID string) error {
	return s.currencyRepo.SetBaseCurrency(ctx, companyID, currencyID)
}

// UpdateExchangeRate updates the exchange rate for a currency
func (s *CurrencySettingService) UpdateExchangeRate(ctx context.Context, currencyID string, rate float64, updatedBy string) error {
	if rate <= 0 {
		return errors.New("exchange rate must be positive")
	}

	// Update the current rate in currency settings
	err := s.currencyRepo.UpdateExchangeRate(ctx, currencyID, rate)
	if err != nil {
		return err
	}

	// Create historical exchange rate record
	exchangeRate := &entities.CurrencyExchangeRate{
		CurrencyID:    currencyID,
		ExchangeRate:  rate,
		EffectiveDate: time.Now(),
		CreatedBy:     updatedBy,
		CreatedAt:     time.Now(),
	}

	return s.exchangeRateRepo.Create(ctx, exchangeRate)
}

// ConvertAmount converts an amount from one currency to another
func (s *CurrencySettingService) ConvertAmount(ctx context.Context, amount float64, fromCurrencyID, toCurrencyID string) (float64, error) {
	// If same currency, no conversion needed
	if fromCurrencyID == toCurrencyID {
		return amount, nil
	}

	// Get source currency
	fromCurrency, err := s.currencyRepo.GetByID(ctx, fromCurrencyID)
	if err != nil {
		return 0, fmt.Errorf("source currency not found: %v", err)
	}

	// Get target currency
	toCurrency, err := s.currencyRepo.GetByID(ctx, toCurrencyID)
	if err != nil {
		return 0, fmt.Errorf("target currency not found: %v", err)
	}

	// Convert to base currency first, then to target currency
	baseAmount := fromCurrency.ConvertToBaseCurrency(amount)
	convertedAmount := toCurrency.ConvertFromBaseCurrency(baseAmount)

	return convertedAmount, nil
}

// GetExchangeRateHistory retrieves historical exchange rates for a currency
func (s *CurrencySettingService) GetExchangeRateHistory(ctx context.Context, currencyID string, fromDate, toDate string) ([]*entities.CurrencyExchangeRate, error) {
	return s.exchangeRateRepo.GetHistoricalRates(ctx, currencyID, fromDate, toDate)
}

// GetLatestExchangeRate retrieves the latest exchange rate for a currency
func (s *CurrencySettingService) GetLatestExchangeRate(ctx context.Context, currencyID string) (*entities.CurrencyExchangeRate, error) {
	return s.exchangeRateRepo.GetLatestRate(ctx, currencyID)
}