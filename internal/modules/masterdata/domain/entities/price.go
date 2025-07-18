package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// Price represents a price entity.
type Price struct {
	types.BaseModel
	ArticleID string  `json:"article_id"`
	Amount    float64 `json:"amount"`
	Currency  string  `json:"currency"`
	EffectiveDate time.Time `json:"effective_date"`
}
