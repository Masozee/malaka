package dto

import (
	"time"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// CreatePriceRequest represents the request body for creating a new price.
type CreatePriceRequest struct {
	ArticleID     string  `json:"article_id" binding:"required"`
	CompanyID     string  `json:"company_id"`
	Amount        float64 `json:"amount" binding:"required,gt=0"`
	Currency      string  `json:"currency" binding:"required"`
	EffectiveDate string  `json:"effective_date" binding:"required"`
}

// ToEntity converts CreatePriceRequest to entities.Price.
func (r *CreatePriceRequest) ToEntity() (*entities.Price, error) {
	price := &entities.Price{
		Amount:    r.Amount,
		Currency:  r.Currency,
		CompanyID: r.CompanyID,
	}

	// Parse UUID field
	if r.ArticleID != "" {
		if id, err := uuid.Parse(r.ArticleID); err == nil {
			price.ArticleID = id
		}
	}

	// Parse effective date
	if r.EffectiveDate != "" {
		effectiveDate, err := time.Parse("2006-01-02", r.EffectiveDate)
		if err != nil {
			// Try RFC3339 format
			effectiveDate, err = time.Parse(time.RFC3339, r.EffectiveDate)
			if err != nil {
				return nil, err
			}
		}
		price.EffectiveDate = effectiveDate
	}

	return price, nil
}

// UpdatePriceRequest represents the request body for updating an existing price.
type UpdatePriceRequest struct {
	ArticleID     string  `json:"article_id" binding:"required"`
	Amount        float64 `json:"amount" binding:"required,gt=0"`
	Currency      string  `json:"currency" binding:"required"`
	EffectiveDate string  `json:"effective_date" binding:"required"`
}

// ApplyToEntity applies UpdatePriceRequest changes to an existing entities.Price.
func (r *UpdatePriceRequest) ApplyToEntity(price *entities.Price) error {
	if r.ArticleID != "" {
		if id, err := uuid.Parse(r.ArticleID); err == nil {
			price.ArticleID = id
		}
	}
	if r.Amount != 0 {
		price.Amount = r.Amount
	}
	if r.Currency != "" {
		price.Currency = r.Currency
	}
	if r.EffectiveDate != "" {
		effectiveDate, err := time.Parse("2006-01-02", r.EffectiveDate)
		if err != nil {
			// Try RFC3339 format
			effectiveDate, err = time.Parse(time.RFC3339, r.EffectiveDate)
			if err != nil {
				return err
			}
		}
		price.EffectiveDate = effectiveDate
	}
	return nil
}

// PriceResponse represents the response body for a price.
type PriceResponse struct {
	ID            string  `json:"id"`
	ArticleID     string  `json:"article_id"`
	CompanyID     string  `json:"company_id"`
	Amount        float64 `json:"amount"`
	Currency      string  `json:"currency"`
	EffectiveDate string  `json:"effective_date"`
	CreatedAt     string  `json:"created_at"`
	UpdatedAt     string  `json:"updated_at"`
}

// PriceResponseFromEntity converts entities.Price to PriceResponse.
func PriceResponseFromEntity(price *entities.Price) *PriceResponse {
	return &PriceResponse{
		ID:            price.ID.String(),
		ArticleID:     price.ArticleID.String(),
		CompanyID:     price.CompanyID,
		Amount:        price.Amount,
		Currency:      price.Currency,
		EffectiveDate: price.EffectiveDate.Format("2006-01-02"),
		CreatedAt:     price.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:     price.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
