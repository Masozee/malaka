package repositories

import (
	"context"

	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/shared/uuid"
)

type PerformanceReviewRepository interface {
	// Performance Review CRUD
	CreatePerformanceReview(ctx context.Context, review *entities.PerformanceReview) error
	GetPerformanceReviewByID(ctx context.Context, id uuid.ID) (*entities.PerformanceReview, error)
	GetAllPerformanceReviews(ctx context.Context, filters map[string]interface{}) ([]*entities.PerformanceReview, error)
	UpdatePerformanceReview(ctx context.Context, review *entities.PerformanceReview) error
	DeletePerformanceReview(ctx context.Context, id uuid.ID) error

	// Performance Review with relationships
	GetPerformanceReviewWithDetails(ctx context.Context, id uuid.ID) (*entities.PerformanceReview, error)
	GetPerformanceReviewsByEmployee(ctx context.Context, employeeID uuid.ID) ([]*entities.PerformanceReview, error)
	GetPerformanceReviewsByPeriod(ctx context.Context, period string) ([]*entities.PerformanceReview, error)
	GetPerformanceReviewsByStatus(ctx context.Context, status string) ([]*entities.PerformanceReview, error)

	// Performance Review Cycles
	GetAllReviewCycles(ctx context.Context) ([]*entities.PerformanceReviewCycle, error)
	GetReviewCycleByID(ctx context.Context, id uuid.ID) (*entities.PerformanceReviewCycle, error)

	// Performance Goals
	GetAllPerformanceGoals(ctx context.Context) ([]*entities.PerformanceGoal, error)
	GetPerformanceGoalByID(ctx context.Context, id uuid.ID) (*entities.PerformanceGoal, error)
	GetReviewGoalsByReview(ctx context.Context, reviewID uuid.ID) ([]*entities.PerformanceReviewGoal, error)

	// Competencies
	GetAllCompetencies(ctx context.Context) ([]*entities.Competency, error)
	GetCompetencyByID(ctx context.Context, id uuid.ID) (*entities.Competency, error)
	GetCompetencyEvaluationsByReview(ctx context.Context, reviewID uuid.ID) ([]*entities.PerformanceCompetencyEvaluation, error)

	// Statistics
	GetPerformanceStatistics(ctx context.Context, filters map[string]interface{}) (map[string]interface{}, error)
	CountReviewsByStatus(ctx context.Context, status string) (int64, error)
	GetAverageScore(ctx context.Context, filters map[string]interface{}) (float64, error)
}