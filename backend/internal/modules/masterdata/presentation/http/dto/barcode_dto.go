package dto

import (
	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/shared/uuid"
)

// CreateBarcodeRequest represents the request body for creating a new barcode.
type CreateBarcodeRequest struct {
	ArticleID string `json:"article_id" binding:"required"`
	Code      string `json:"code" binding:"required"`
	CompanyID string `json:"company_id"`
}

// ToEntity converts CreateBarcodeRequest to entities.Barcode.
func (r *CreateBarcodeRequest) ToEntity() *entities.Barcode {
	barcode := &entities.Barcode{
		Code:      r.Code,
		CompanyID: r.CompanyID,
	}

	// Parse UUID field
	if r.ArticleID != "" {
		if id, err := uuid.Parse(r.ArticleID); err == nil {
			barcode.ArticleID = id
		}
	}

	return barcode
}

// UpdateBarcodeRequest represents the request body for updating an existing barcode.
type UpdateBarcodeRequest struct {
	ArticleID string `json:"article_id" binding:"required"`
	Code      string `json:"code" binding:"required"`
}

// ApplyToEntity applies UpdateBarcodeRequest changes to an existing entities.Barcode.
func (r *UpdateBarcodeRequest) ApplyToEntity(barcode *entities.Barcode) {
	if r.Code != "" {
		barcode.Code = r.Code
	}
	if r.ArticleID != "" {
		if id, err := uuid.Parse(r.ArticleID); err == nil {
			barcode.ArticleID = id
		}
	}
}

// BarcodeResponse represents the response body for a barcode.
type BarcodeResponse struct {
	ID        string `json:"id"`
	ArticleID string `json:"article_id"`
	Code      string `json:"code"`
	CompanyID string `json:"company_id"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

// BarcodeResponseFromEntity converts entities.Barcode to BarcodeResponse.
func BarcodeResponseFromEntity(barcode *entities.Barcode) *BarcodeResponse {
	return &BarcodeResponse{
		ID:        barcode.ID.String(),
		ArticleID: barcode.ArticleID.String(),
		Code:      barcode.Code,
		CompanyID: barcode.CompanyID,
		CreatedAt: barcode.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: barcode.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
