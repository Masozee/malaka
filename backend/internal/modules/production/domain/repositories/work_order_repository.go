package repositories

import (
	"context"

	"malaka/internal/modules/production/domain/entities"
	"malaka/internal/shared/uuid"
)

type WorkOrderRepository interface {
	// CRUD operations
	Create(ctx context.Context, workOrder *entities.WorkOrder) error
	GetByID(ctx context.Context, id uuid.ID) (*entities.WorkOrder, error)
	GetByWorkOrderNumber(ctx context.Context, workOrderNumber string) (*entities.WorkOrder, error)
	Update(ctx context.Context, workOrder *entities.WorkOrder) error
	Delete(ctx context.Context, id uuid.ID) error

	// List operations with pagination and filtering
	GetAllWithPagination(ctx context.Context, limit, offset int, search, status string) ([]*entities.WorkOrder, int, error)

	// Bulk operations
	BulkUpdateStatus(ctx context.Context, ids []uuid.ID, status entities.WorkOrderStatus) error
	BulkAssignSupervisor(ctx context.Context, ids []uuid.ID, supervisor string) error

	// Search operations
	Search(ctx context.Context, query string, limit, offset int) ([]*entities.WorkOrder, int, error)
	SearchByProduct(ctx context.Context, productCode string) ([]entities.WorkOrder, error)

	// Analytics and reporting
	GetSummary(ctx context.Context) (*entities.WorkOrderSummary, error)
	GetByStatus(ctx context.Context, status entities.WorkOrderStatus) ([]entities.WorkOrder, error)
	GetOverdueWorkOrders(ctx context.Context) ([]entities.WorkOrder, error)
	GetWorkOrdersByDateRange(ctx context.Context, startDate, endDate string) ([]entities.WorkOrder, error)
	GetWorkOrdersByWarehouse(ctx context.Context, warehouseID uuid.ID) ([]entities.WorkOrder, error)

	// Statistics
	CountByStatus(ctx context.Context) (map[entities.WorkOrderStatus]int, error)
	CountByType(ctx context.Context) (map[entities.WorkOrderType]int, error)
	GetEfficiencyStats(ctx context.Context) (map[string]float64, error)

	// Material and operation operations
	AddMaterial(ctx context.Context, material *entities.WorkOrderMaterial) error
	UpdateMaterial(ctx context.Context, material *entities.WorkOrderMaterial) error
	RemoveMaterial(ctx context.Context, workOrderID, materialID uuid.ID) error
	GetMaterials(ctx context.Context, workOrderID uuid.ID) ([]entities.WorkOrderMaterial, error)

	AddOperation(ctx context.Context, operation *entities.WorkOrderOperation) error
	UpdateOperation(ctx context.Context, operation *entities.WorkOrderOperation) error
	RemoveOperation(ctx context.Context, workOrderID, operationID uuid.ID) error
	GetOperations(ctx context.Context, workOrderID uuid.ID) ([]entities.WorkOrderOperation, error)
	UpdateOperationStatus(ctx context.Context, operationID uuid.ID, status entities.OperationStatus) error

	// Assignment operations
	AssignEmployee(ctx context.Context, assignment *entities.WorkOrderAssignment) error
	UnassignEmployee(ctx context.Context, workOrderID uuid.ID, employeeID uuid.ID) error
	GetAssignments(ctx context.Context, workOrderID uuid.ID) ([]entities.WorkOrderAssignment, error)
	GetWorkOrdersByEmployee(ctx context.Context, employeeID uuid.ID) ([]entities.WorkOrder, error)

	// Validation
	ExistsWorkOrderNumber(ctx context.Context, workOrderNumber string, excludeID ...uuid.ID) (bool, error)
}