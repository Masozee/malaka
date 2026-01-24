package repositories

import (
	"context"

	"malaka/internal/modules/procurement/domain/entities"
)

// VendorEvaluationFilter defines filter options for listing vendor evaluations.
type VendorEvaluationFilter struct {
	Search           string
	Status           string
	SupplierID       string
	EvaluatorID      string
	Recommendation   string
	MinOverallScore  float64
	MaxOverallScore  float64
	Page             int
	Limit            int
	SortBy           string
	SortOrder        string
}

// VendorEvaluationRepository defines the interface for vendor evaluation data operations.
type VendorEvaluationRepository interface {
	Create(ctx context.Context, evaluation *entities.VendorEvaluation) error
	GetByID(ctx context.Context, id string) (*entities.VendorEvaluation, error)
	GetAll(ctx context.Context, filter *VendorEvaluationFilter) ([]*entities.VendorEvaluation, int, error)
	Update(ctx context.Context, evaluation *entities.VendorEvaluation) error
	Delete(ctx context.Context, id string) error

	// Special queries
	GetBySupplierID(ctx context.Context, supplierID string) ([]*entities.VendorEvaluation, error)
	GetSupplierAverageScore(ctx context.Context, supplierID string) (float64, error)

	// Statistics
	GetStats(ctx context.Context) (*VendorEvaluationStats, error)

	// Number generation
	GetNextEvaluationNumber(ctx context.Context) (string, error)
}

// VendorEvaluationStats holds statistics for vendor evaluations.
type VendorEvaluationStats struct {
	Total               int     `json:"total"`
	Draft               int     `json:"draft"`
	Completed           int     `json:"completed"`
	Approved            int     `json:"approved"`
	AverageOverallScore float64 `json:"average_overall_score"`
	PreferredCount      int     `json:"preferred_count"`
	ApprovedCount       int     `json:"approved_count"`
	ConditionalCount    int     `json:"conditional_count"`
	NotRecommendedCount int     `json:"not_recommended_count"`
}
