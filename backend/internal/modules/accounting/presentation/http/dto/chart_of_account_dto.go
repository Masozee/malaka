package dto

import (
	"time"

	"malaka/internal/shared/uuid"
	"malaka/internal/modules/accounting/domain/entities"
)

// ChartOfAccountRequest represents the request structure for creating/updating a ChartOfAccount
type ChartOfAccountRequest struct {
	ParentID      *string `json:"parent_id"`
	AccountCode   string  `json:"account_code" binding:"required"`
	AccountName   string  `json:"account_name" binding:"required"`
	AccountType   string  `json:"account_type" binding:"required"`
	NormalBalance string  `json:"normal_balance" binding:"required"`
	Description   string  `json:"description"`
	IsActive      bool    `json:"is_active"`
}

// ChartOfAccountResponse represents the response structure for a ChartOfAccount
type ChartOfAccountResponse struct {
	ID            string    `json:"id"`
	ParentID      *string   `json:"parent_id,omitempty"`
	AccountCode   string    `json:"account_code"`
	AccountName   string    `json:"account_name"`
	AccountType   string    `json:"account_type"`
	NormalBalance string    `json:"normal_balance"`
	Description   string    `json:"description"`
	IsActive      bool      `json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// MapChartOfAccountEntityToResponse maps a ChartOfAccount entity to its response DTO
func MapChartOfAccountEntityToResponse(entity *entities.ChartOfAccount) *ChartOfAccountResponse {
	if entity == nil {
		return nil
	}

	resp := &ChartOfAccountResponse{
		ID:            entity.ID.String(),
		AccountCode:   entity.AccountCode,
		AccountName:   entity.AccountName,
		AccountType:   entity.AccountType,
		NormalBalance: entity.NormalBalance,
		Description:   entity.Description,
		IsActive:      entity.IsActive,
		CreatedAt:     entity.CreatedAt,
		UpdatedAt:     entity.UpdatedAt,
	}

	if entity.ParentID != nil {
		parentIDStr := entity.ParentID.String()
		resp.ParentID = &parentIDStr
	}

	return resp
}

// MapChartOfAccountRequestToEntity maps a ChartOfAccountRequest DTO to a ChartOfAccount entity
func MapChartOfAccountRequestToEntity(request *ChartOfAccountRequest) *entities.ChartOfAccount {
	if request == nil {
		return nil
	}

	entity := &entities.ChartOfAccount{
		AccountCode:   request.AccountCode,
		AccountName:   request.AccountName,
		AccountType:   request.AccountType,
		NormalBalance: request.NormalBalance,
		Description:   request.Description,
		IsActive:      request.IsActive,
	}

	if request.ParentID != nil && *request.ParentID != "" {
		parentID, err := uuid.Parse(*request.ParentID)
		if err == nil {
			entity.ParentID = &parentID
		}
	}

	return entity
}
