package entities

import (
	"time"

	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// Price represents a price entity.
type Price struct {
	types.BaseModel
	ArticleID     uuid.ID   `json:"article_id" db:"article_id"`
	CompanyID     string    `json:"company_id" db:"company_id"`
	Amount        float64   `json:"amount" db:"amount"`
	Currency      string    `json:"currency" db:"currency"`
	EffectiveDate time.Time `json:"effective_date" db:"effective_date"`
}
