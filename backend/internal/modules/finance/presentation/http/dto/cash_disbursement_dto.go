package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/types"
)

// CashDisbursementCreateRequest represents the request to create cash disbursement.
type CashDisbursementCreateRequest struct {
	DisbursementDate time.Time `json:"disbursement_date" binding:"required"`
	Amount           float64   `json:"amount" binding:"required"`
	Description      string    `json:"description" binding:"required"`
	CashBankID       string    `json:"cash_bank_id" binding:"required"`
}

// CashDisbursementUpdateRequest represents the request to update cash disbursement.
type CashDisbursementUpdateRequest struct {
	DisbursementDate time.Time `json:"disbursement_date"`
	Amount           float64   `json:"amount"`
	Description      string    `json:"description"`
	CashBankID       string    `json:"cash_bank_id"`
}

// CashDisbursementResponse represents the response for cash disbursement.
type CashDisbursementResponse struct {
	ID               string    `json:"id"`
	DisbursementDate time.Time `json:"disbursement_date"`
	Amount           float64   `json:"amount"`
	Description      string    `json:"description"`
	CashBankID       string    `json:"cash_bank_id"`
	CreatedAt        string    `json:"created_at"`
	UpdatedAt        string    `json:"updated_at"`
}

// ToCashDisbursementEntity converts CashDisbursementCreateRequest to entities.CashDisbursement.
func (req *CashDisbursementCreateRequest) ToCashDisbursementEntity() *entities.CashDisbursement {
	return &entities.CashDisbursement{
		BaseModel:        types.BaseModel{},
		DisbursementDate: req.DisbursementDate,
		Amount:           req.Amount,
		Description:      req.Description,
		CashBankID:       req.CashBankID,
	}
}

// ToCashDisbursementEntity converts CashDisbursementUpdateRequest to entities.CashDisbursement.
func (req *CashDisbursementUpdateRequest) ToCashDisbursementEntity() *entities.CashDisbursement {
	return &entities.CashDisbursement{
		BaseModel:        types.BaseModel{},
		DisbursementDate: req.DisbursementDate,
		Amount:           req.Amount,
		Description:      req.Description,
		CashBankID:       req.CashBankID,
	}
}

// FromCashDisbursementEntity converts entities.CashDisbursement to CashDisbursementResponse.
func FromCashDisbursementEntity(cd *entities.CashDisbursement) *CashDisbursementResponse {
	return &CashDisbursementResponse{
		ID:               cd.ID,
		DisbursementDate: cd.DisbursementDate,
		Amount:           cd.Amount,
		Description:      cd.Description,
		CashBankID:       cd.CashBankID,
		CreatedAt:        cd.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:        cd.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}