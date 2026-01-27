package repositories

import (
	"context"

	"github.com/google/uuid"
	"malaka/internal/modules/production/domain/entities"
)

// QualityControlRepository defines the interface for quality control data operations
type QualityControlRepository interface {
	// CRUD operations
	Create(ctx context.Context, qc *entities.QualityControl) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.QualityControl, error)
	GetByQCNumber(ctx context.Context, qcNumber string) (*entities.QualityControl, error)
	Update(ctx context.Context, qc *entities.QualityControl) error
	Delete(ctx context.Context, id uuid.UUID) error

	// List operations with pagination and filtering
	GetAllWithPagination(ctx context.Context, limit, offset int, search, status, qcType string) ([]*entities.QualityControl, int, error)

	// Analytics and reporting
	GetStatistics(ctx context.Context) (*entities.QualityControlStatistics, error)
	GetByStatus(ctx context.Context, status entities.QCStatus) ([]*entities.QualityControl, error)
	GetByReferenceID(ctx context.Context, referenceID string) ([]*entities.QualityControl, error)
	GetByDateRange(ctx context.Context, startDate, endDate string) ([]*entities.QualityControl, error)
	GetByInspector(ctx context.Context, inspector string) ([]*entities.QualityControl, error)

	// Test operations
	AddTest(ctx context.Context, test *entities.QualityTest) error
	UpdateTest(ctx context.Context, test *entities.QualityTest) error
	DeleteTest(ctx context.Context, id uuid.UUID) error
	GetTests(ctx context.Context, qcID uuid.UUID) ([]entities.QualityTest, error)

	// Defect operations
	AddDefect(ctx context.Context, defect *entities.QualityDefect) error
	UpdateDefect(ctx context.Context, defect *entities.QualityDefect) error
	DeleteDefect(ctx context.Context, id uuid.UUID) error
	GetDefects(ctx context.Context, qcID uuid.UUID) ([]entities.QualityDefect, error)

	// Action operations
	AddAction(ctx context.Context, action *entities.QualityAction) error
	UpdateAction(ctx context.Context, action *entities.QualityAction) error
	DeleteAction(ctx context.Context, id uuid.UUID) error
	GetActions(ctx context.Context, qcID uuid.UUID) ([]entities.QualityAction, error)

	// Validation
	ExistsQCNumber(ctx context.Context, qcNumber string, excludeID ...uuid.UUID) (bool, error)

	// Counter for generating QC numbers
	GetNextQCNumber(ctx context.Context) (int, error)
}
