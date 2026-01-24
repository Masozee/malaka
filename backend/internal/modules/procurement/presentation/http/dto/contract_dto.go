package dto

import "time"

// CreateContractRequest represents the request body for creating a contract.
type CreateContractRequest struct {
	Title           string    `json:"title" binding:"required"`
	Description     string    `json:"description"`
	SupplierID      string    `json:"supplier_id" binding:"required"`
	ContractType    string    `json:"contract_type" binding:"required"`
	StartDate       time.Time `json:"start_date" binding:"required"`
	EndDate         time.Time `json:"end_date" binding:"required"`
	Value           float64   `json:"value" binding:"required,gte=0"`
	Currency        string    `json:"currency"`
	PaymentTerms    string    `json:"payment_terms"`
	TermsConditions string    `json:"terms_conditions"`
	AutoRenewal     bool      `json:"auto_renewal"`
	RenewalPeriod   int       `json:"renewal_period"`
	NoticePeriod    int       `json:"notice_period"`
}

// UpdateContractRequest represents the request body for updating a contract.
type UpdateContractRequest struct {
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	ContractType    string    `json:"contract_type"`
	StartDate       time.Time `json:"start_date"`
	EndDate         time.Time `json:"end_date"`
	Value           float64   `json:"value"`
	Currency        string    `json:"currency"`
	PaymentTerms    string    `json:"payment_terms"`
	TermsConditions string    `json:"terms_conditions"`
	AutoRenewal     bool      `json:"auto_renewal"`
	RenewalPeriod   int       `json:"renewal_period"`
	NoticePeriod    int       `json:"notice_period"`
	SignedBy        string    `json:"signed_by"`
	SignedDate      *time.Time `json:"signed_date"`
}

// TerminateContractRequest represents the request body for terminating a contract.
type TerminateContractRequest struct {
	Reason string `json:"reason"`
}

// RenewContractRequest represents the request body for renewing a contract.
type RenewContractRequest struct {
	EndDate time.Time `json:"end_date" binding:"required"`
}

// ContractListResponse represents a paginated list of contracts.
type ContractListResponse struct {
	Data       interface{} `json:"data"`
	Pagination Pagination  `json:"pagination"`
}
