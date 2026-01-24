package dto

import "time"

// CreateVendorEvaluationRequest represents the request body for creating a vendor evaluation.
type CreateVendorEvaluationRequest struct {
	SupplierID            string    `json:"supplier_id" binding:"required"`
	EvaluatorID           string    `json:"evaluator_id"`
	EvaluationPeriodStart time.Time `json:"evaluation_period_start" binding:"required"`
	EvaluationPeriodEnd   time.Time `json:"evaluation_period_end" binding:"required"`

	// Scoring criteria (1-5 scale)
	QualityScore    int `json:"quality_score" binding:"required,min=1,max=5"`
	DeliveryScore   int `json:"delivery_score" binding:"required,min=1,max=5"`
	PriceScore      int `json:"price_score" binding:"required,min=1,max=5"`
	ServiceScore    int `json:"service_score" binding:"required,min=1,max=5"`
	ComplianceScore int `json:"compliance_score" binding:"required,min=1,max=5"`

	// Comments
	QualityComments    string `json:"quality_comments"`
	DeliveryComments   string `json:"delivery_comments"`
	PriceComments      string `json:"price_comments"`
	ServiceComments    string `json:"service_comments"`
	ComplianceComments string `json:"compliance_comments"`
	OverallComments    string `json:"overall_comments"`

	ActionItems string `json:"action_items"`
}

// UpdateVendorEvaluationRequest represents the request body for updating a vendor evaluation.
type UpdateVendorEvaluationRequest struct {
	EvaluationPeriodStart *time.Time `json:"evaluation_period_start"`
	EvaluationPeriodEnd   *time.Time `json:"evaluation_period_end"`

	// Scoring criteria (1-5 scale)
	QualityScore    int `json:"quality_score" binding:"min=1,max=5"`
	DeliveryScore   int `json:"delivery_score" binding:"min=1,max=5"`
	PriceScore      int `json:"price_score" binding:"min=1,max=5"`
	ServiceScore    int `json:"service_score" binding:"min=1,max=5"`
	ComplianceScore int `json:"compliance_score" binding:"min=1,max=5"`

	// Comments
	QualityComments    string `json:"quality_comments"`
	DeliveryComments   string `json:"delivery_comments"`
	PriceComments      string `json:"price_comments"`
	ServiceComments    string `json:"service_comments"`
	ComplianceComments string `json:"compliance_comments"`
	OverallComments    string `json:"overall_comments"`

	ActionItems string `json:"action_items"`
}

// VendorEvaluationListResponse represents a paginated list of vendor evaluations.
type VendorEvaluationListResponse struct {
	Data       interface{} `json:"data"`
	Pagination Pagination  `json:"pagination"`
}
