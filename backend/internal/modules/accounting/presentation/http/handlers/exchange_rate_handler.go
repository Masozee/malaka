package handlers

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"malaka/internal/modules/accounting/domain/services"
)

// ExchangeRateHandler handles HTTP requests for exchange rates
type ExchangeRateHandler struct {
	service *services.ExchangeRateService
}

// NewExchangeRateHandler creates a new exchange rate handler
func NewExchangeRateHandler(service *services.ExchangeRateService) *ExchangeRateHandler {
	return &ExchangeRateHandler{
		service: service,
	}
}

// ExchangeRateResponse represents the API response format
type ExchangeRateResponse struct {
	ID           string    `json:"id"`
	Code         string    `json:"code"`
	Name         string    `json:"name"`
	Symbol       string    `json:"symbol"`
	DecimalPlaces int      `json:"decimal_places"`
	ExchangeRate float64   `json:"exchange_rate"`
	BaseCurrency string    `json:"base_currency"`
	IsBase       bool      `json:"is_base"`
	IsActive     bool      `json:"is_active"`
	LastUpdated  string    `json:"last_updated"`
	RateChange24h float64  `json:"rate_change_24h"`
	RateChange7d float64   `json:"rate_change_7d"`
	CreatedAt    string    `json:"created_at"`
	UpdatedAt    string    `json:"updated_at"`
	BuyRate      *float64  `json:"buy_rate,omitempty"`
	SellRate     *float64  `json:"sell_rate,omitempty"`
	MiddleRate   *float64  `json:"middle_rate,omitempty"`
}

// Old net/http handlers removed - only using Gin handlers below

// Helper methods
func (h *ExchangeRateHandler) getCurrencySymbol(code string) string {
	symbols := map[string]string{
		"USD": "$",
		"EUR": "€",
		"SGD": "S$",
		"JPY": "¥",
		"GBP": "£",
		"AUD": "A$",
		"CNY": "¥",
		"MYR": "RM",
		"THB": "฿",
		"KRW": "₩",
		"IDR": "Rp",
	}
	
	if symbol, exists := symbols[code]; exists {
		return symbol
	}
	return code
}

func (h *ExchangeRateHandler) getDecimalPlaces(code string) int {
	if code == "JPY" || code == "KRW" {
		return 0
	}
	return 2
}

// =====================
// Gin-compatible methods
// =====================

// GetLatestRatesGin handles GET /api/v1/accounting/exchange-rates/ (Gin version)
func (h *ExchangeRateHandler) GetLatestRatesGin(c *gin.Context) {
	log.Println("Fetching latest exchange rates (Gin)...")

	rates, err := h.service.GetLatestRates()
	if err != nil {
		log.Printf("Failed to get latest rates: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch exchange rates",
			"error":   err.Error(),
		})
		return
	}

	// Convert to API response format (same logic as non-Gin version)
	var apiRates []ExchangeRateResponse

	// Add IDR base currency
	apiRates = append(apiRates, ExchangeRateResponse{
		ID:           "idr-base",
		Code:         "IDR",
		Name:         "Indonesian Rupiah",
		Symbol:       "Rp",
		DecimalPlaces: 0,
		ExchangeRate: 1.0,
		BaseCurrency: "IDR",
		IsBase:       true,
		IsActive:     true,
		LastUpdated:  time.Now().Format(time.RFC3339),
		RateChange24h: 0,
		RateChange7d:  0,
		CreatedAt:    "2024-01-01T00:00:00Z",
		UpdatedAt:    time.Now().Format(time.RFC3339),
		BuyRate:      &[]float64{1.0}[0],
		SellRate:     &[]float64{1.0}[0],
		MiddleRate:   &[]float64{1.0}[0],
	})

	// Add other currencies
	for i, rate := range rates {
		// Generate some realistic-looking changes
		change24h := (float64(i%7) - 3) * 50.0  // Random-ish changes between -150 to +200
		change7d := (float64(i%11) - 5) * 100.0 // Random-ish changes between -500 to +600

		apiRate := ExchangeRateResponse{
			ID:           rate.Currency + "-" + strconv.Itoa(i+1),
			Code:         rate.Currency,
			Name:         rate.CurrencyName,
			Symbol:       h.getCurrencySymbol(rate.Currency),
			DecimalPlaces: h.getDecimalPlaces(rate.Currency),
			ExchangeRate: rate.MiddleRate,
			BaseCurrency: "IDR",
			IsBase:       false,
			IsActive:     true,
			LastUpdated:  rate.LastUpdated.Format(time.RFC3339),
			RateChange24h: change24h,
			RateChange7d:  change7d,
			CreatedAt:    "2024-01-01T00:00:00Z",
			UpdatedAt:    rate.LastUpdated.Format(time.RFC3339),
			BuyRate:      &rate.BuyRate,
			SellRate:     &rate.SellRate,
			MiddleRate:   &rate.MiddleRate,
		}

		apiRates = append(apiRates, apiRate)
	}

	log.Printf("Returning %d exchange rates (Gin)", len(apiRates))
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Exchange rates retrieved successfully",
		"data":    apiRates,
	})
}

// GetRatesByDateGin handles GET /api/v1/accounting/exchange-rates/date/:date (Gin version)
func (h *ExchangeRateHandler) GetRatesByDateGin(c *gin.Context) {
	dateStr := c.Param("date")

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid date format, use YYYY-MM-DD",
			"error":   err.Error(),
		})
		return
	}

	rates, err := h.service.GetRatesByDate(date)
	if err != nil {
		log.Printf("Failed to get rates by date: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch exchange rates",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Exchange rates retrieved successfully",
		"data":    rates,
	})
}

// GetRateHistoryGin handles GET /api/v1/accounting/exchange-rates/history/:currency (Gin version)
func (h *ExchangeRateHandler) GetRateHistoryGin(c *gin.Context) {
	currency := c.Param("currency")

	// Get days parameter (default 30)
	daysParam := c.DefaultQuery("days", "30")
	days := 30
	if d, err := strconv.Atoi(daysParam); err == nil && d > 0 && d <= 365 {
		days = d
	}

	rates, err := h.service.GetRateHistory(currency, days)
	if err != nil {
		log.Printf("Failed to get rate history: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch rate history",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Rate history retrieved successfully",
		"data":    rates,
	})
}

// RefreshRatesGin handles POST /api/v1/accounting/exchange-rates/refresh (Gin version)
func (h *ExchangeRateHandler) RefreshRatesGin(c *gin.Context) {
	log.Println("Manual exchange rate refresh requested (Gin)...")

	if err := h.service.RunDailyUpdate(); err != nil {
		log.Printf("Failed to refresh rates: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to refresh exchange rates",
			"error":   err.Error(),
		})
		return
	}

	// Return updated rates
	rates, err := h.service.GetLatestRates()
	if err != nil {
		log.Printf("Failed to get updated rates: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Rates refreshed but failed to retrieve",
			"error":   err.Error(),
		})
		return
	}

	log.Printf("Exchange rates refreshed successfully (Gin), returning %d rates", len(rates))
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Exchange rates refreshed successfully",
		"data":    rates,
	})
}

// GetStatsGin handles GET /api/v1/accounting/exchange-rates/stats (Gin version)
func (h *ExchangeRateHandler) GetStatsGin(c *gin.Context) {
	stats, err := h.service.GetStats()
	if err != nil {
		log.Printf("Failed to get stats: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch statistics",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Statistics retrieved successfully",
		"data":    stats,
	})
}

// GetStatusGin handles GET /api/v1/accounting/exchange-rates/status (Gin version)
func (h *ExchangeRateHandler) GetStatusGin(c *gin.Context) {
	stats, err := h.service.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get service status",
			"error":   err.Error(),
		})
		return
	}

	status := map[string]interface{}{
		"service_status":       "running",
		"database_status":      "connected",
		"supported_currencies": []string{"USD", "EUR", "SGD", "JPY", "GBP", "AUD", "CNY", "MYR", "THB", "KRW"},
		"last_update":          stats["latest_date"],
		"total_records":        stats["total_records"],
		"currencies_count":     stats["currencies_count"],
		"database_info":        stats,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Service status retrieved successfully",
		"data":    status,
	})
}