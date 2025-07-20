package entities

import (
	"malaka/internal/shared/types"
)

// Article represents an article entity.
type Article struct {
	types.BaseModel
	Name            string `json:"name"`
	Description     string `json:"description"`
	ClassificationID string `json:"classification_id"`
	ColorID         string `json:"color_id"`
	ModelID         string `json:"model_id"`
	SizeID          string `json:"size_id"`
	SupplierID      string `json:"supplier_id"`
	Barcode         string `json:"barcode"`
	Price           float64 `json:"price"`
}
