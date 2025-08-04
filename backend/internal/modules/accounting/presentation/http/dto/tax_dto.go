package dto

import (
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// TaxRequest represents the request structure for creating/updating a Tax
type TaxRequest struct {
	CompanyID string          `json:"company_id" binding:"required"`
	Name      string          `json:"name" binding:"required"`
	TaxType   entities.TaxType `json:"tax_type" binding:"required"`
	Description string        `json:"description"`
	IsActive  bool            `json:"is_active"`
}

// TaxResponse represents the response structure for a Tax
type TaxResponse struct {
	ID        uuid.UUID       `json:"id"`
	CompanyID string          `json:"company_id"`
	Name      string          `json:"name"`
	TaxType   entities.TaxType `json:"tax_type"`
	Description string        `json:"description"`
	IsActive  bool            `json:"is_active"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}

// TaxRateRequest represents the request structure for creating/updating a TaxRate
type TaxRateRequest struct {
	TaxID         uuid.UUID `json:"tax_id" binding:"required"`
	Rate          float64   `json:"rate" binding:"required"`
	EffectiveDate time.Time `json:"effective_date" binding:"required"`
	IsActive      bool      `json:"is_active"`
}

// TaxRateResponse represents the response structure for a TaxRate
type TaxRateResponse struct {
	ID            uuid.UUID `json:"id"`
	TaxID         uuid.UUID `json:"tax_id"`
	Rate          float64   `json:"rate"`
	EffectiveDate time.Time `json:"effective_date"`
	IsActive      bool      `json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// TaxTransactionRequest represents the request structure for recording a TaxTransaction
type TaxTransactionRequest struct {
	CompanyID     string    `json:"company_id" binding:"required"`
	TaxID         uuid.UUID `json:"tax_id" binding:"required"`
	TransactionDate time.Time `json:"transaction_date" binding:"required"`
	BaseAmount    float64   `json:"base_amount" binding:"required"`
	TaxAmount     float64   `json:"tax_amount" binding:"required"`
	Description   string    `json:"description"`
	ReferenceID   uuid.UUID `json:"reference_id"`
	ReferenceType string    `json:"reference_type"`
}

// TaxTransactionResponse represents the response structure for a TaxTransaction
type TaxTransactionResponse struct {
	ID            uuid.UUID `json:"id"`
	CompanyID     string    `json:"company_id"`
	TaxID         uuid.UUID `json:"tax_id"`
	TransactionDate time.Time `json:"transaction_date"`
	BaseAmount    float64   `json:"base_amount"`
	TaxAmount     float64   `json:"tax_amount"`
	Description   string    `json:"description"`
	ReferenceID   uuid.UUID `json:"reference_id"`
	ReferenceType string    `json:"reference_type"`
	CreatedAt     time.Time `json:"created_at"`
}

// TaxReportResponse represents the response structure for a TaxReport
type TaxReportResponse struct {
	CompanyID   string    `json:"company_id"`
	PeriodStart time.Time `json:"period_start"`
	PeriodEnd   time.Time `json:"period_end"`
	TotalTaxCollected float64 `json:"total_tax_collected"`
	TotalTaxPaid      float64 `json:"total_tax_paid"`
	NetTaxPayable     float64 `json:"net_tax_payable"`
	// Add detailed breakdown by tax type or category if needed
}

// MapTaxEntityToResponse maps a Tax entity to its response DTO
func MapTaxEntityToResponse(entity *entities.Tax) *TaxResponse {
	if entity == nil {
		return nil
	}
	return &TaxResponse{
		ID:        entity.ID,
		CompanyID: entity.CompanyID,
		Name:      entity.TaxName,
		TaxType:   entity.TaxType,
		Description: entity.Description,
		IsActive:  entity.IsActive,
		CreatedAt: entity.CreatedAt,
		UpdatedAt: entity.UpdatedAt,
	}
}

// MapTaxRequestToEntity maps a TaxRequest DTO to a Tax entity
func MapTaxRequestToEntity(request *TaxRequest) *entities.Tax {
	if request == nil {
		return nil
	}
	return &entities.Tax{
		CompanyID: request.CompanyID,
		TaxName:   request.Name,
		TaxType:   request.TaxType,
		Description: request.Description,
		IsActive:  request.IsActive,
	}
}

// Note: TaxRate entity doesn't exist - tax rates are embedded in Tax entity
// MapTaxEntityToTaxRateResponse maps a Tax entity to a TaxRateResponse DTO  
func MapTaxEntityToTaxRateResponse(entity *entities.Tax) *TaxRateResponse {
	if entity == nil {
		return nil
	}
	return &TaxRateResponse{
		ID:            entity.ID,
		TaxID:         entity.ID, // Same as ID since rate is embedded
		Rate:          entity.TaxRate,
		EffectiveDate: entity.EffectiveDate,
		IsActive:      entity.IsActive,
		CreatedAt:     entity.CreatedAt,
		UpdatedAt:     entity.UpdatedAt,
	}
}

// Note: TaxRate entity doesn't exist - commenting out this mapping
// TODO: Implement separate TaxRate entity if needed for historical rate tracking  
// func MapTaxRateRequestToEntity(request *TaxRateRequest) *entities.TaxRate {
//	if request == nil {
//		return nil  
//	}
//	return &entities.TaxRate{
//		TaxID:         request.TaxID,
//		Rate:          request.Rate,
//		EffectiveDate: request.EffectiveDate,
//		IsActive:      request.IsActive,
//	}
// }

// MapTaxTransactionEntityToResponse maps a TaxTransaction entity to its response DTO
func MapTaxTransactionEntityToResponse(entity *entities.TaxTransaction) *TaxTransactionResponse {
	if entity == nil {
		return nil
	}
	return &TaxTransactionResponse{
		ID:            entity.ID,
		CompanyID:     entity.CompanyID,
		TaxID:         entity.TaxID,
		TransactionDate: entity.TransactionDate,
		BaseAmount:    entity.BaseAmount,
		TaxAmount:     entity.TaxAmount,
		Description:   entity.ReferenceNumber, // Using ReferenceNumber as Description
		ReferenceID:   uuid.MustParse(entity.ReferenceID), // Converting string to UUID
		ReferenceType: entity.ReferenceType,
		CreatedAt:     entity.CreatedAt,
	}
}

// MapTaxTransactionRequestToEntity maps a TaxTransactionRequest DTO to a TaxTransaction entity
func MapTaxTransactionRequestToEntity(request *TaxTransactionRequest) *entities.TaxTransaction {
	if request == nil {
		return nil
	}
	return &entities.TaxTransaction{
		CompanyID:     request.CompanyID,
		TaxID:         request.TaxID,
		TransactionDate: request.TransactionDate,
		BaseAmount:    request.BaseAmount,
		TaxAmount:     request.TaxAmount,
		ReferenceNumber: request.Description, // Using Description as ReferenceNumber
		ReferenceID:   request.ReferenceID.String(), // Converting UUID to string
		ReferenceType: request.ReferenceType,
	}
}

// MapTaxReportEntityToResponse maps a TaxReport entity to its response DTO
func MapTaxReportEntityToResponse(entity *entities.TaxReport) *TaxReportResponse {
	if entity == nil {
		return nil
	}
	return &TaxReportResponse{
		CompanyID:   "",  // TaxReport entity doesn't have CompanyID
		PeriodStart: entity.PeriodStart,
		PeriodEnd:   entity.PeriodEnd,
		TotalTaxCollected: entity.TaxCollected,
		TotalTaxPaid:      entity.TaxPaid,
		NetTaxPayable:     entity.NetTaxPosition,
	}
}
