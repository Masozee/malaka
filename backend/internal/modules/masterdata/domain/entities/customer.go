package entities

import (
	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// Customer represents a customer entity.
type Customer struct {
	types.BaseModel
	Name          string  `json:"name" db:"name"`
	ContactPerson string  `json:"contact_person" db:"contact_person"`
	Email         string  `json:"email" db:"email"`
	Phone         string  `json:"phone" db:"phone"`
	CompanyID     uuid.ID `json:"company_id" db:"company_id"`
	Status        string  `json:"status" db:"status"`
}
