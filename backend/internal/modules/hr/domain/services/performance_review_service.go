package services

import (
	"context"

	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/modules/hr/presentation/http/dto"
	"malaka/internal/shared/uuid"
)

type PerformanceReviewService interface {
	// Performance Review CRUD
	CreatePerformanceReview(ctx context.Context, req *dto.PerformanceReviewCreateRequest) (*dto.PerformanceReviewResponse, error)
	GetPerformanceReviewByID(ctx context.Context, id uuid.ID) (*dto.PerformanceReviewResponse, error)
	GetAllPerformanceReviews(ctx context.Context, filters map[string]interface{}) (*dto.PerformanceReviewListResponse, error)
	UpdatePerformanceReview(ctx context.Context, id uuid.ID, req *dto.PerformanceReviewUpdateRequest) (*dto.PerformanceReviewResponse, error)
	DeletePerformanceReview(ctx context.Context, id uuid.ID) error

	// Performance Review with details
	GetPerformanceReviewWithDetails(ctx context.Context, id uuid.ID) (*dto.PerformanceReviewResponse, error)
	GetPerformanceReviewsByEmployee(ctx context.Context, employeeID uuid.ID) ([]*dto.PerformanceReviewResponse, error)
	GetPerformanceReviewsByPeriod(ctx context.Context, period string) ([]*dto.PerformanceReviewResponse, error)
	GetPerformanceReviewsByStatus(ctx context.Context, status string) ([]*dto.PerformanceReviewResponse, error)

	// Statistics
	GetPerformanceStatistics(ctx context.Context, filters map[string]interface{}) (*dto.PerformanceStatisticsResponse, error)

	// Supporting data
	GetReviewCycles(ctx context.Context) ([]*entities.PerformanceReviewCycle, error)
	GetPerformanceGoals(ctx context.Context) ([]*entities.PerformanceGoal, error)
	GetCompetencies(ctx context.Context) ([]*entities.Competency, error)
}