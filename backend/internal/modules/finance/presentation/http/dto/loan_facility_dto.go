package dto

import (
	"time"

	"malaka/internal/modules/finance/domain/entities"
	"malaka/internal/shared/types"
)

// LoanFacilityCreateRequest represents the request to create a loan facility.
type LoanFacilityCreateRequest struct {
	FacilityName      string  `json:"facility_name" binding:"required"`
	Lender            string  `json:"lender" binding:"required"`
	Type              string  `json:"type" binding:"required"`
	PrincipalAmount   float64 `json:"principal_amount" binding:"required"`
	OutstandingAmount float64 `json:"outstanding_amount"`
	InterestRate      float64 `json:"interest_rate"`
	MaturityDate      string  `json:"maturity_date" binding:"required"`
	NextPaymentDate   string  `json:"next_payment_date"`
	NextPaymentAmount float64 `json:"next_payment_amount"`
	Status            string  `json:"status" binding:"required"`
	CompanyID         string  `json:"company_id"`
}

// LoanFacilityUpdateRequest represents the request to update a loan facility.
type LoanFacilityUpdateRequest struct {
	FacilityName      string  `json:"facility_name"`
	Lender            string  `json:"lender"`
	Type              string  `json:"type"`
	PrincipalAmount   float64 `json:"principal_amount"`
	OutstandingAmount float64 `json:"outstanding_amount"`
	InterestRate      float64 `json:"interest_rate"`
	MaturityDate      string  `json:"maturity_date"`
	NextPaymentDate   string  `json:"next_payment_date"`
	NextPaymentAmount float64 `json:"next_payment_amount"`
	Status            string  `json:"status"`
	CompanyID         string  `json:"company_id"`
}

// LoanFacilityResponse represents the response for a loan facility.
type LoanFacilityResponse struct {
	ID                string  `json:"id"`
	FacilityName      string  `json:"facility_name"`
	Lender            string  `json:"lender"`
	Type              string  `json:"type"`
	PrincipalAmount   float64 `json:"principal_amount"`
	OutstandingAmount float64 `json:"outstanding_amount"`
	InterestRate      float64 `json:"interest_rate"`
	MaturityDate      string  `json:"maturity_date"`
	NextPaymentDate   string  `json:"next_payment_date"`
	NextPaymentAmount float64 `json:"next_payment_amount"`
	Status            string  `json:"status"`
	CompanyID         string  `json:"company_id"`
	CreatedAt         string  `json:"created_at"`
	UpdatedAt         string  `json:"updated_at"`
}

// ToLoanFacilityEntity converts LoanFacilityCreateRequest to entities.LoanFacility.
func (req *LoanFacilityCreateRequest) ToLoanFacilityEntity() *entities.LoanFacility {
	maturityDate, _ := time.Parse("2006-01-02T15:04:05Z", req.MaturityDate)
	nextPaymentDate, _ := time.Parse("2006-01-02T15:04:05Z", req.NextPaymentDate)

	return &entities.LoanFacility{
		BaseModel:         types.BaseModel{},
		FacilityName:      req.FacilityName,
		Lender:            req.Lender,
		Type:              req.Type,
		PrincipalAmount:   req.PrincipalAmount,
		OutstandingAmount: req.OutstandingAmount,
		InterestRate:      req.InterestRate,
		MaturityDate:      maturityDate,
		NextPaymentDate:   nextPaymentDate,
		NextPaymentAmount: req.NextPaymentAmount,
		Status:            req.Status,
		CompanyID:         req.CompanyID,
	}
}

// ToLoanFacilityEntity converts LoanFacilityUpdateRequest to entities.LoanFacility.
func (req *LoanFacilityUpdateRequest) ToLoanFacilityEntity() *entities.LoanFacility {
	maturityDate, _ := time.Parse("2006-01-02T15:04:05Z", req.MaturityDate)
	nextPaymentDate, _ := time.Parse("2006-01-02T15:04:05Z", req.NextPaymentDate)

	return &entities.LoanFacility{
		BaseModel:         types.BaseModel{},
		FacilityName:      req.FacilityName,
		Lender:            req.Lender,
		Type:              req.Type,
		PrincipalAmount:   req.PrincipalAmount,
		OutstandingAmount: req.OutstandingAmount,
		InterestRate:      req.InterestRate,
		MaturityDate:      maturityDate,
		NextPaymentDate:   nextPaymentDate,
		NextPaymentAmount: req.NextPaymentAmount,
		Status:            req.Status,
		CompanyID:         req.CompanyID,
	}
}

// FromLoanFacilityEntity converts entities.LoanFacility to LoanFacilityResponse.
func FromLoanFacilityEntity(lf *entities.LoanFacility) *LoanFacilityResponse {
	return &LoanFacilityResponse{
		ID:                lf.ID.String(),
		FacilityName:      lf.FacilityName,
		Lender:            lf.Lender,
		Type:              lf.Type,
		PrincipalAmount:   lf.PrincipalAmount,
		OutstandingAmount: lf.OutstandingAmount,
		InterestRate:      lf.InterestRate,
		MaturityDate:      lf.MaturityDate.Format("2006-01-02T15:04:05Z"),
		NextPaymentDate:   lf.NextPaymentDate.Format("2006-01-02T15:04:05Z"),
		NextPaymentAmount: lf.NextPaymentAmount,
		Status:            lf.Status,
		CompanyID:         lf.CompanyID,
		CreatedAt:         lf.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:         lf.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
}
