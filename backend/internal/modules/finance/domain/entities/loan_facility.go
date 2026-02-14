package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// LoanFacility represents a loan facility entity.
type LoanFacility struct {
	types.BaseModel
	FacilityName      string  `json:"facility_name" db:"facility_name"`
	Lender            string  `json:"lender" db:"lender"`
	Type              string  `json:"type" db:"type"`
	PrincipalAmount   float64 `json:"principal_amount" db:"principal_amount"`
	OutstandingAmount float64 `json:"outstanding_amount" db:"outstanding_amount"`
	InterestRate      float64 `json:"interest_rate" db:"interest_rate"`
	MaturityDate      time.Time `json:"maturity_date" db:"maturity_date"`
	NextPaymentDate   time.Time `json:"next_payment_date" db:"next_payment_date"`
	NextPaymentAmount float64 `json:"next_payment_amount" db:"next_payment_amount"`
	Status            string  `json:"status" db:"status"`
	CompanyID         string  `json:"company_id" db:"company_id"`
}
