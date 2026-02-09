package repositories

import (
	"context"

	"malaka/internal/modules/production/domain/entities"
	"malaka/internal/shared/uuid"
)

// ProductionPlanRepository defines the interface for production plan data operations
type ProductionPlanRepository interface {
	// CRUD operations
	Create(ctx context.Context, plan *entities.ProductionPlan) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.ProductionPlan, error)
	GetByPlanNumber(ctx context.Context, planNumber string) (*entities.ProductionPlan, error)
	Update(ctx context.Context, plan *entities.ProductionPlan) error
	Delete(ctx context.Context, id uuid.ID) error

	// List operations with pagination and filtering
	GetAllWithPagination(ctx context.Context, limit, offset int, search, status, planType string) ([]*entities.ProductionPlan, int, error)

	// Analytics and reporting
	GetStatistics(ctx context.Context) (*entities.ProductionPlanStatistics, error)
	GetByStatus(ctx context.Context, status entities.PlanStatus) ([]*entities.ProductionPlan, error)
	GetByDateRange(ctx context.Context, startDate, endDate string) ([]*entities.ProductionPlan, error)
	GetActivePlans(ctx context.Context) ([]*entities.ProductionPlan, error)

	// Plan item operations
	AddItem(ctx context.Context, item *entities.ProductionPlanItem) error
	UpdateItem(ctx context.Context, item *entities.ProductionPlanItem) error
	DeleteItem(ctx context.Context, id uuid.ID) error
	GetItems(ctx context.Context, planID uuid.ID) ([]entities.ProductionPlanItem, error)
	GetItemByID(ctx context.Context, id uuid.ID) (*entities.ProductionPlanItem, error)
	UpdateItemProgress(ctx context.Context, itemID uuid.ID, producedQuantity int) error

	// Validation
	ExistsPlanNumber(ctx context.Context, planNumber string, excludeID ...uuid.ID) (bool, error)

	// Counter for generating plan numbers
	GetNextPlanNumber(ctx context.Context) (int, error)
}
