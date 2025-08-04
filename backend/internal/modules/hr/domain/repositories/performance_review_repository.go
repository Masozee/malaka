package repositories

import (
	"context"
	"malaka/internal/modules/hr/domain/entities"
)

type PerformanceReviewRepository interface {
	// Performance Review CRUD
	CreatePerformanceReview(ctx context.Context, review *entities.PerformanceReview) error
	GetPerformanceReviewByID(ctx context.Context, id string) (*entities.PerformanceReview, error)
	GetAllPerformanceReviews(ctx context.Context, filters map[string]interface{}) ([]*entities.PerformanceReview, error)
	UpdatePerformanceReview(ctx context.Context, review *entities.PerformanceReview) error
	DeletePerformanceReview(ctx context.Context, id string) error

	// Performance Review with relationships
	GetPerformanceReviewWithDetails(ctx context.Context, id string) (*entities.PerformanceReview, error)
	GetPerformanceReviewsByEmployee(ctx context.Context, employeeID string) ([]*entities.PerformanceReview, error)
	GetPerformanceReviewsByPeriod(ctx context.Context, period string) ([]*entities.PerformanceReview, error)
	GetPerformanceReviewsByStatus(ctx context.Context, status string) ([]*entities.PerformanceReview, error)

	// Performance Review Cycles
	GetAllReviewCycles(ctx context.Context) ([]*entities.PerformanceReviewCycle, error)
	GetReviewCycleByID(ctx context.Context, id string) (*entities.PerformanceReviewCycle, error)

	// Performance Goals
	GetAllPerformanceGoals(ctx context.Context) ([]*entities.PerformanceGoal, error)
	GetPerformanceGoalByID(ctx context.Context, id string) (*entities.PerformanceGoal, error)
	GetReviewGoalsByReview(ctx context.Context, reviewID string) ([]*entities.PerformanceReviewGoal, error)

	// Competencies
	GetAllCompetencies(ctx context.Context) ([]*entities.Competency, error)
	GetCompetencyByID(ctx context.Context, id string) (*entities.Competency, error)
	GetCompetencyEvaluationsByReview(ctx context.Context, reviewID string) ([]*entities.PerformanceCompetencyEvaluation, error)

	// Statistics
	GetPerformanceStatistics(ctx context.Context, filters map[string]interface{}) (map[string]interface{}, error)
	CountReviewsByStatus(ctx context.Context, status string) (int64, error)
	GetAverageScore(ctx context.Context, filters map[string]interface{}) (float64, error)
}