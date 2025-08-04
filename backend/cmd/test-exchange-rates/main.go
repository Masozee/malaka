package main

import (
	"log"
	"path/filepath"
	"time"

	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/services"
	"malaka/internal/modules/accounting/infrastructure/persistence"
)

func main() {
	// Initialize SQLite repository
	dbPath := filepath.Join("data", "exchange_rates.db")
	repository, err := persistence.NewExchangeRateSQLiteRepository(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize repository: %v", err)
	}

	// Create some test data
	testRates := []entities.ExchangeRateData{
		{
			Currency:     "USD",
			CurrencyName: "US Dollar",
			BuyRate:      15380.0,
			SellRate:     15420.0,
			MiddleRate:   15400.0,
			Date:         time.Now(),
			LastUpdated:  time.Now(),
			Source:       "Test Data",
		},
		{
			Currency:     "EUR",
			CurrencyName: "Euro",
			BuyRate:      16750.0,
			SellRate:     16800.0,
			MiddleRate:   16775.0,
			Date:         time.Now(),
			LastUpdated:  time.Now(),
			Source:       "Test Data",
		},
		{
			Currency:     "SGD",
			CurrencyName: "Singapore Dollar",
			BuyRate:      11420.0,
			SellRate:     11460.0,
			MiddleRate:   11440.0,
			Date:         time.Now(),
			LastUpdated:  time.Now(),
			Source:       "Test Data",
		},
	}

	// Save test data
	if err := repository.SaveExchangeRates(testRates); err != nil {
		log.Fatalf("Failed to save test rates: %v", err)
	}

	log.Printf("Saved %d test exchange rates", len(testRates))

	// Test retrieval
	service := services.NewExchangeRateService(repository)
	
	rates, err := service.GetLatestRates()
	if err != nil {
		log.Fatalf("Failed to get latest rates: %v", err)
	}

	log.Printf("Retrieved %d exchange rates:", len(rates))
	for _, rate := range rates {
		log.Printf("  %s (%s): Buy=%.2f, Sell=%.2f, Middle=%.2f", 
			rate.Currency, rate.CurrencyName, rate.BuyRate, rate.SellRate, rate.MiddleRate)
	}

	// Test stats
	stats, err := service.GetStats()
	if err != nil {
		log.Printf("Failed to get stats: %v", err)
	} else {
		log.Printf("Database stats: %+v", stats)
	}

	log.Println("Test completed successfully!")
}