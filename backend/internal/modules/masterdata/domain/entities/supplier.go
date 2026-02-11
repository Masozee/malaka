package entities

import (
	"malaka/internal/shared/types"
)

// Supplier represents a supplier entity.
type Supplier struct {
	types.BaseModel
	Code          string  `json:"code" db:"code"`
	Name          string  `json:"name" db:"name"`
	Address       string  `json:"address" db:"address"`
	Contact       string  `json:"contact" db:"contact"`
	ContactPerson string  `json:"contact_person" db:"contact_person"`
	Phone         string  `json:"phone" db:"phone"`
	Email         string  `json:"email" db:"email"`
	Website       string  `json:"website" db:"website"`
	TaxID         string  `json:"tax_id" db:"tax_id"`
	PaymentTerms  string  `json:"payment_terms" db:"payment_terms"`
	CreditLimit   float64 `json:"credit_limit" db:"credit_limit"`
	Status        string  `json:"status" db:"status"`
	CompanyID     string  `json:"company_id" db:"company_id"`
}
