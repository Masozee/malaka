package entities

import (
	"time"

	"malaka/internal/shared/types"
)

// VendorEvaluation represents a vendor evaluation entity.
type VendorEvaluation struct {
	types.BaseModel
	EvaluationNumber      string    `json:"evaluation_number" db:"evaluation_number"`
	SupplierID            string    `json:"supplier_id" db:"supplier_id"`
	EvaluationPeriodStart time.Time `json:"evaluation_period_start" db:"evaluation_period_start"`
	EvaluationPeriodEnd   time.Time `json:"evaluation_period_end" db:"evaluation_period_end"`
	EvaluatorID           string    `json:"evaluator_id" db:"evaluator_id"`
	Status                string    `json:"status" db:"status"`

	// Scoring criteria (1-5 scale)
	QualityScore    int     `json:"quality_score" db:"quality_score"`
	DeliveryScore   int     `json:"delivery_score" db:"delivery_score"`
	PriceScore      int     `json:"price_score" db:"price_score"`
	ServiceScore    int     `json:"service_score" db:"service_score"`
	ComplianceScore int     `json:"compliance_score" db:"compliance_score"`
	OverallScore    float64 `json:"overall_score" db:"overall_score"`

	// Comments
	QualityComments    *string `json:"quality_comments,omitempty" db:"quality_comments"`
	DeliveryComments   *string `json:"delivery_comments,omitempty" db:"delivery_comments"`
	PriceComments      *string `json:"price_comments,omitempty" db:"price_comments"`
	ServiceComments    *string `json:"service_comments,omitempty" db:"service_comments"`
	ComplianceComments *string `json:"compliance_comments,omitempty" db:"compliance_comments"`
	OverallComments    *string `json:"overall_comments,omitempty" db:"overall_comments"`

	Recommendation string  `json:"recommendation" db:"recommendation"`
	ActionItems    *string `json:"action_items,omitempty" db:"action_items"`

	// Related data for API responses
	SupplierName  string `json:"supplier_name,omitempty" db:"supplier_name"`
	EvaluatorName string `json:"evaluator_name,omitempty" db:"evaluator_name"`
}

// VendorEvaluationStatus constants
const (
	VEStatusDraft     = "draft"
	VEStatusCompleted = "completed"
	VEStatusApproved  = "approved"
)

// VendorRecommendation constants
const (
	VERecommendationPreferred      = "preferred"
	VERecommendationApproved       = "approved"
	VERecommendationConditional    = "conditional"
	VERecommendationNotRecommended = "not_recommended"
)

// Score weights for calculating overall score
const (
	QualityWeight    = 0.25
	DeliveryWeight   = 0.25
	PriceWeight      = 0.20
	ServiceWeight    = 0.15
	ComplianceWeight = 0.15
)

// IsValidStatus checks if the given status is valid.
func (ve *VendorEvaluation) IsValidStatus() bool {
	switch ve.Status {
	case VEStatusDraft, VEStatusCompleted, VEStatusApproved:
		return true
	}
	return false
}

// IsValidRecommendation checks if the given recommendation is valid.
func (ve *VendorEvaluation) IsValidRecommendation() bool {
	switch ve.Recommendation {
	case VERecommendationPreferred, VERecommendationApproved, VERecommendationConditional, VERecommendationNotRecommended:
		return true
	}
	return false
}

// CanBeCompleted checks if the evaluation can be marked as completed.
func (ve *VendorEvaluation) CanBeCompleted() bool {
	return ve.Status == VEStatusDraft
}

// CanBeApproved checks if the evaluation can be approved.
func (ve *VendorEvaluation) CanBeApproved() bool {
	return ve.Status == VEStatusCompleted
}

// CalculateOverallScore calculates the weighted average overall score.
func (ve *VendorEvaluation) CalculateOverallScore() {
	ve.OverallScore = float64(ve.QualityScore)*QualityWeight +
		float64(ve.DeliveryScore)*DeliveryWeight +
		float64(ve.PriceScore)*PriceWeight +
		float64(ve.ServiceScore)*ServiceWeight +
		float64(ve.ComplianceScore)*ComplianceWeight
}

// DetermineRecommendation determines the recommendation based on overall score.
func (ve *VendorEvaluation) DetermineRecommendation() {
	switch {
	case ve.OverallScore >= 4.5:
		ve.Recommendation = VERecommendationPreferred
	case ve.OverallScore >= 3.5:
		ve.Recommendation = VERecommendationApproved
	case ve.OverallScore >= 2.5:
		ve.Recommendation = VERecommendationConditional
	default:
		ve.Recommendation = VERecommendationNotRecommended
	}
}

// ValidateScores checks if all scores are within valid range (1-5).
func (ve *VendorEvaluation) ValidateScores() bool {
	return ve.QualityScore >= 1 && ve.QualityScore <= 5 &&
		ve.DeliveryScore >= 1 && ve.DeliveryScore <= 5 &&
		ve.PriceScore >= 1 && ve.PriceScore <= 5 &&
		ve.ServiceScore >= 1 && ve.ServiceScore <= 5 &&
		ve.ComplianceScore >= 1 && ve.ComplianceScore <= 5
}
