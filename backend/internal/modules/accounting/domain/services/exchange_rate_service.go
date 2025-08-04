package services

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"malaka/internal/modules/accounting/domain/entities"
)

// Use ExchangeRateData from entities package
type ExchangeRateData = entities.ExchangeRateData

// BIAPIResponse represents Bank Indonesia API response structure
type BIAPIResponse struct {
	Status string `json:"status"`
	Data   []struct {
		Currency   string  `json:"mata_uang"`
		BuyRate    float64 `json:"kurs_beli,string"`
		SellRate   float64 `json:"kurs_jual,string"`
		MiddleRate float64 `json:"kurs_tengah,string"`
		Date       string  `json:"tanggal"`
	} `json:"data"`
}

// ExchangeRateAPIResponse for backup API
type ExchangeRateAPIResponse struct {
	Base  string             `json:"base"`
	Date  string             `json:"date"`
	Rates map[string]float64 `json:"rates"`
}

// ExchangeRateRepository interface for database operations
type ExchangeRateRepository interface {
	SaveExchangeRates(rates []ExchangeRateData) error
	GetLatestRates() ([]ExchangeRateData, error)
	GetRatesByDate(date time.Time) ([]ExchangeRateData, error)
	GetRateHistory(currency string, days int) ([]ExchangeRateData, error)
	GetStats() (map[string]interface{}, error)
	CleanupOldRates(retentionDays int) error
	Close() error
}

// ExchangeRateService handles fetching and storing exchange rates
type ExchangeRateService struct {
	repository ExchangeRateRepository
}

// NewExchangeRateService creates a new instance of ExchangeRateService
func NewExchangeRateService(repository ExchangeRateRepository) *ExchangeRateService {
	return &ExchangeRateService{
		repository: repository,
	}
}

// FetchFromBankIndonesia fetches exchange rates from Bank Indonesia official API
func (s *ExchangeRateService) FetchFromBankIndonesia() ([]ExchangeRateData, error) {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Bank Indonesia API endpoint
	url := "https://api.bi.go.id/kurs"
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Add required headers
	req.Header.Set("User-Agent", "Malaka-ERP/1.0")
	req.Header.Set("Accept", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch from BI API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("BI API returned status: %d", resp.StatusCode)
	}

	var apiResp BIAPIResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
		return nil, fmt.Errorf("failed to decode BI API response: %w", err)
	}

	var rates []ExchangeRateData
	now := time.Now()

	for _, item := range apiResp.Data {
		date, err := time.Parse("2006-01-02", item.Date)
		if err != nil {
			log.Printf("Failed to parse date %s: %v", item.Date, err)
			date = now
		}

		rates = append(rates, ExchangeRateData{
			Currency:     item.Currency,
			CurrencyName: s.getCurrencyName(item.Currency),
			BuyRate:      item.BuyRate,
			SellRate:     item.SellRate,
			MiddleRate:   item.MiddleRate,
			Date:         date,
			LastUpdated:  now,
			Source:       "Bank Indonesia",
		})
	}

	return rates, nil
}

// FetchFromBackupAPI fetches from backup API when BI is unavailable
func (s *ExchangeRateService) FetchFromBackupAPI() ([]ExchangeRateData, error) {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	url := "https://api.exchangerate-api.com/v4/latest/IDR"
	
	resp, err := client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch from backup API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("backup API returned status: %d", resp.StatusCode)
	}

	var apiResp ExchangeRateAPIResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
		return nil, fmt.Errorf("failed to decode backup API response: %w", err)
	}

	var rates []ExchangeRateData
	now := time.Now()

	// Convert rates from IDR base to foreign currency base
	supportedCurrencies := []string{"USD", "EUR", "SGD", "JPY", "GBP", "AUD", "CNY", "MYR", "THB", "KRW"}

	for _, currency := range supportedCurrencies {
		if rate, exists := apiResp.Rates[currency]; exists && rate > 0 {
			// Convert from IDR-based rate to foreign currency rate
			exchangeRate := 1 / rate
			spread := exchangeRate * 0.002 // 0.2% spread

			rates = append(rates, ExchangeRateData{
				Currency:     currency,
				CurrencyName: s.getCurrencyName(currency),
				BuyRate:      exchangeRate - spread,
				SellRate:     exchangeRate + spread,
				MiddleRate:   exchangeRate,
				Date:         now,
				LastUpdated:  now,
				Source:       "ExchangeRate-API",
			})
		}
	}

	return rates, nil
}

// FetchDailyRates fetches exchange rates with fallback strategy
func (s *ExchangeRateService) FetchDailyRates() ([]ExchangeRateData, error) {
	log.Println("Starting daily exchange rate fetch...")

	// Try Bank Indonesia first
	rates, err := s.FetchFromBankIndonesia()
	if err != nil {
		log.Printf("Failed to fetch from Bank Indonesia: %v", err)
		log.Println("Falling back to backup API...")

		// Try backup API
		rates, err = s.FetchFromBackupAPI()
		if err != nil {
			return nil, fmt.Errorf("all APIs failed: %w", err)
		}
	}

	log.Printf("Successfully fetched %d exchange rates", len(rates))
	return rates, nil
}

// StoreDailyRates stores exchange rates in database
func (s *ExchangeRateService) StoreDailyRates(rates []ExchangeRateData) error {
	if s.repository == nil {
		log.Printf("No repository configured, logging rates only...")
		for _, rate := range rates {
			log.Printf("Rate: %s = %.4f (Buy: %.4f, Sell: %.4f) from %s", 
				rate.Currency, rate.MiddleRate, rate.BuyRate, rate.SellRate, rate.Source)
		}
		return nil
	}

	log.Printf("Storing %d exchange rates to database...", len(rates))

	if err := s.repository.SaveExchangeRates(rates); err != nil {
		return fmt.Errorf("failed to save rates to database: %w", err)
	}

	for _, rate := range rates {
		log.Printf("Stored: %s = %.4f (Buy: %.4f, Sell: %.4f) from %s", 
			rate.Currency, rate.MiddleRate, rate.BuyRate, rate.SellRate, rate.Source)
	}
	
	return nil
}

// GetLatestRates retrieves the latest exchange rates from database
func (s *ExchangeRateService) GetLatestRates() ([]ExchangeRateData, error) {
	if s.repository == nil {
		return nil, fmt.Errorf("no repository configured")
	}
	return s.repository.GetLatestRates()
}

// GetRatesByDate retrieves exchange rates for a specific date
func (s *ExchangeRateService) GetRatesByDate(date time.Time) ([]ExchangeRateData, error) {
	if s.repository == nil {
		return nil, fmt.Errorf("no repository configured")
	}
	return s.repository.GetRatesByDate(date)
}

// GetRateHistory retrieves historical rates for a currency
func (s *ExchangeRateService) GetRateHistory(currency string, days int) ([]ExchangeRateData, error) {
	if s.repository == nil {
		return nil, fmt.Errorf("no repository configured")
	}
	return s.repository.GetRateHistory(currency, days)
}

// GetStats returns database statistics
func (s *ExchangeRateService) GetStats() (map[string]interface{}, error) {
	if s.repository == nil {
		return nil, fmt.Errorf("no repository configured")
	}
	return s.repository.GetStats()
}

// RunDailyUpdate performs the daily exchange rate update
func (s *ExchangeRateService) RunDailyUpdate() error {
	log.Println("=== Starting Daily Exchange Rate Update ===")
	
	rates, err := s.FetchDailyRates()
	if err != nil {
		return fmt.Errorf("failed to fetch daily rates: %w", err)
	}

	if err := s.StoreDailyRates(rates); err != nil {
		return fmt.Errorf("failed to store daily rates: %w", err)
	}

	log.Println("=== Daily Exchange Rate Update Completed ===")
	return nil
}

// getCurrencyName returns the full name for a currency code
func (s *ExchangeRateService) getCurrencyName(code string) string {
	names := map[string]string{
		"USD": "US Dollar",
		"EUR": "Euro",
		"SGD": "Singapore Dollar",
		"JPY": "Japanese Yen",
		"GBP": "British Pound",
		"AUD": "Australian Dollar",
		"CNY": "Chinese Yuan",
		"MYR": "Malaysian Ringgit",
		"THB": "Thai Baht",
		"KRW": "Korean Won",
		"IDR": "Indonesian Rupiah",
	}
	
	if name, exists := names[code]; exists {
		return name
	}
	return code
}