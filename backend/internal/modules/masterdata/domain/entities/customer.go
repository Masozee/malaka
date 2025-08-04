package entities

import (
	"malaka/internal/shared/types"
)

// Customer represents a customer entity.
type Customer struct {
	types.BaseModel
	Name        string `json:"name"`
	ContactPerson string `json:"contact_person"`
	Email       string `json:"email"`
	Phone       string `json:"phone"`
	CompanyID   string `json:"company_id"`
	Status      string `json:"status"`
}
