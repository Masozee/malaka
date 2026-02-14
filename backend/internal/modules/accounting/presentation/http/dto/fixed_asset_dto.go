package dto

import (
	"time"

	"malaka/internal/shared/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// FixedAssetRequest represents the request structure for creating/updating a FixedAsset
type FixedAssetRequest struct {
	CompanyID       string                  `json:"company_id" binding:"required"`
	AssetCode       string                  `json:"asset_code"`
	AssetName       string                  `json:"asset_name" binding:"required"`
	Description     string                  `json:"description"`
	Category        string                  `json:"category"`
	AcquisitionDate time.Time               `json:"acquisition_date" binding:"required"`
	Cost            float64                 `json:"cost" binding:"required"`
	SalvageValue    float64                 `json:"salvage_value"`
	UsefulLife      int                     `json:"useful_life"` // in years
	DepreciationMethod entities.DepreciationMethod `json:"depreciation_method"`
	CurrentLocation string                  `json:"current_location"`
	SerialNumber    string                  `json:"serial_number"`
	Status          entities.FixedAssetStatus `json:"status"`
}

// FixedAssetResponse represents the response structure for a FixedAsset
type FixedAssetResponse struct {
	ID              uuid.ID               `json:"id"`
	CompanyID       string                  `json:"company_id"`
	AssetCode       string                  `json:"asset_code"`
	AssetName       string                  `json:"asset_name"`
	Description     string                  `json:"description"`
	Category        string                  `json:"category"`
	AcquisitionDate time.Time               `json:"acquisition_date"`
	Cost            float64                 `json:"cost"`
	AccumulatedDepreciation float64           `json:"accumulated_depreciation"`
	BookValue       float64                 `json:"book_value"`
	SalvageValue    float64                 `json:"salvage_value"`
	UsefulLife      int                     `json:"useful_life"`
	DepreciationMethod entities.DepreciationMethod `json:"depreciation_method"`
	CurrentLocation string                  `json:"current_location"`
	SerialNumber    string                  `json:"serial_number"`
	Status          entities.FixedAssetStatus `json:"status"`
	CreatedAt       time.Time               `json:"created_at"`
	UpdatedAt       time.Time               `json:"updated_at"`
}

// DepreciationEntryResponse represents the response structure for a DepreciationEntry
type DepreciationEntryResponse struct {
	ID          uuid.ID `json:"id"`
	AssetID     uuid.ID `json:"asset_id"`
	Period      time.Time `json:"period"`
	Amount      float64   `json:"amount"`
	BookValue   float64   `json:"book_value"`
	CreatedAt   time.Time `json:"created_at"`
}

// FixedAssetSummaryResponse represents the response structure for a FixedAssetSummary
type FixedAssetSummaryResponse struct {
	TotalAssets      int     `json:"total_assets"`
	TotalCost        float64 `json:"total_cost"`
	TotalBookValue   float64 `json:"total_book_value"`
	TotalDepreciation float64 `json:"total_depreciation"`
}

// MapFixedAssetEntityToResponse maps a FixedAsset entity to its response DTO
func MapFixedAssetEntityToResponse(entity *entities.FixedAsset) *FixedAssetResponse {
	if entity == nil {
		return nil
	}
	return &FixedAssetResponse{
		ID:              entity.ID,
		CompanyID:       entity.CompanyID,
		AssetCode:       entity.AssetCode,
		AssetName:       entity.AssetName,
		Description:     entity.Notes,            // Using Notes as Description
		Category:        entity.AssetCategory,
		AcquisitionDate: entity.PurchaseDate,
		Cost:            entity.PurchasePrice,
		AccumulatedDepreciation: entity.AccumulatedDepreciation,
		BookValue:       entity.BookValue,
		SalvageValue:    entity.SalvageValue,
		UsefulLife:      entity.UsefulLife,
		DepreciationMethod: entity.DepreciationMethod,
		CurrentLocation: entity.LocationID,       // Using LocationID as CurrentLocation
		SerialNumber:    entity.SerialNumber,
		Status:          entity.Status,
		CreatedAt:       entity.CreatedAt,
		UpdatedAt:       entity.UpdatedAt,
	}
}

// MapFixedAssetRequestToEntity maps a FixedAssetRequest DTO to a FixedAsset entity
func MapFixedAssetRequestToEntity(request *FixedAssetRequest) *entities.FixedAsset {
	if request == nil {
		return nil
	}
	return &entities.FixedAsset{
		CompanyID:       request.CompanyID,
		AssetCode:       request.AssetCode,
		AssetName:       request.AssetName,
		Notes:           request.Description,     // Using Description as Notes
		AssetCategory:   request.Category,
		PurchaseDate:    request.AcquisitionDate,
		PurchasePrice:   request.Cost,
		SalvageValue:    request.SalvageValue,
		UsefulLife:      request.UsefulLife,
		DepreciationMethod: request.DepreciationMethod,
		LocationID:      request.CurrentLocation, // Using CurrentLocation as LocationID
		SerialNumber:    request.SerialNumber,
		Status:          request.Status,
	}
}

// MapDepreciationEntryEntityToResponse maps a FixedAssetDepreciation entity to its response DTO  
func MapDepreciationEntryEntityToResponse(entity *entities.FixedAssetDepreciation) *DepreciationEntryResponse {
	if entity == nil {
		return nil
	}
	return &DepreciationEntryResponse{
		ID:          entity.ID,
		AssetID:     entity.FixedAssetID,
		Period:      entity.DepreciationDate, // Using DepreciationDate as Period
		Amount:      entity.DepreciationAmount,
		BookValue:   entity.BookValue,
		CreatedAt:   entity.CreatedAt,
	}
}

// Note: FixedAssetSummary entity doesn't exist, so this mapping is commented out
// TODO: Implement FixedAssetSummary entity if needed for summary calculations
