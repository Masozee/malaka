package entities

import "time"

// ExchangeRateData represents the structure for exchange rate information
type ExchangeRateData struct {
	Currency     string    `json:"currency" db:"currency"`
	CurrencyName string    `json:"currency_name" db:"currency_name"`
	BuyRate      float64   `json:"buy_rate" db:"buy_rate"`
	SellRate     float64   `json:"sell_rate" db:"sell_rate"`
	MiddleRate   float64   `json:"middle_rate" db:"middle_rate"`
	Date         time.Time `json:"date" db:"date"`
	LastUpdated  time.Time `json:"last_updated" db:"last_updated"`
	Source       string    `json:"source" db:"source"`
}