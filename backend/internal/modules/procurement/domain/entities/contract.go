package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// Contract represents a procurement contract entity.
type Contract struct {
	types.BaseModel
	ContractNumber  string     `json:"contract_number" db:"contract_number"`
	Title           string     `json:"title" db:"title"`
	Description     *string    `json:"description,omitempty" db:"description"`
	SupplierID      string     `json:"supplier_id" db:"supplier_id"`
	ContractType    string     `json:"contract_type" db:"contract_type"`
	Status          string     `json:"status" db:"status"`
	StartDate       time.Time  `json:"start_date" db:"start_date"`
	EndDate         time.Time  `json:"end_date" db:"end_date"`
	Value           float64    `json:"value" db:"value"`
	Currency        string     `json:"currency" db:"currency"`
	PaymentTerms    *string    `json:"payment_terms,omitempty" db:"payment_terms"`
	TermsConditions *string    `json:"terms_conditions,omitempty" db:"terms_conditions"`
	AutoRenewal     bool       `json:"auto_renewal" db:"auto_renewal"`
	RenewalPeriod   *int       `json:"renewal_period,omitempty" db:"renewal_period"`
	NoticePeriod    *int       `json:"notice_period,omitempty" db:"notice_period"`
	SignedBy        *string    `json:"signed_by,omitempty" db:"signed_by"`
	SignedDate      *time.Time `json:"signed_date,omitempty" db:"signed_date"`
	Attachments     []string   `json:"attachments,omitempty" db:"attachments"`

	// Related data for API responses
	SupplierName string `json:"supplier_name,omitempty" db:"supplier_name"`
}

// ContractStatus constants
const (
	ContractStatusDraft      = "draft"
	ContractStatusActive     = "active"
	ContractStatusExpired    = "expired"
	ContractStatusTerminated = "terminated"
	ContractStatusRenewed    = "renewed"
)

// ContractType constants
const (
	ContractTypeService   = "service"
	ContractTypeSupply    = "supply"
	ContractTypeFramework = "framework"
	ContractTypeOneTime   = "one-time"
)

// IsValidStatus checks if the given status is valid.
func (c *Contract) IsValidStatus() bool {
	switch c.Status {
	case ContractStatusDraft, ContractStatusActive, ContractStatusExpired, ContractStatusTerminated, ContractStatusRenewed:
		return true
	}
	return false
}

// IsValidType checks if the given contract type is valid.
func (c *Contract) IsValidType() bool {
	switch c.ContractType {
	case ContractTypeService, ContractTypeSupply, ContractTypeFramework, ContractTypeOneTime:
		return true
	}
	return false
}

// CanBeActivated checks if the contract can be activated.
func (c *Contract) CanBeActivated() bool {
	return c.Status == ContractStatusDraft
}

// CanBeTerminated checks if the contract can be terminated.
func (c *Contract) CanBeTerminated() bool {
	return c.Status == ContractStatusActive
}

// CanBeRenewed checks if the contract can be renewed.
func (c *Contract) CanBeRenewed() bool {
	return c.Status == ContractStatusActive || c.Status == ContractStatusExpired
}

// IsExpired checks if the contract is past its end date.
func (c *Contract) IsExpired() bool {
	return time.Now().After(c.EndDate)
}

// DaysUntilExpiry returns the number of days until the contract expires.
func (c *Contract) DaysUntilExpiry() int {
	return int(time.Until(c.EndDate).Hours() / 24)
}

// IsExpiringSoon checks if the contract is expiring within the notice period.
func (c *Contract) IsExpiringSoon() bool {
	if c.NoticePeriod == nil {
		return false
	}
	return c.DaysUntilExpiry() <= *c.NoticePeriod
}
