package repositories

import (
	"context"

	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/shared/uuid"
)

// TrainingRepository defines the interface for training program operations
type TrainingRepository interface {
	// Program operations
	CreateProgram(ctx context.Context, program *entities.TrainingProgram) error
	GetProgramByID(ctx context.Context, id uuid.ID) (*entities.TrainingProgram, error)
	GetAllPrograms(ctx context.Context, page, pageSize int) ([]*entities.TrainingProgram, int, error)
	UpdateProgram(ctx context.Context, program *entities.TrainingProgram) error
	DeleteProgram(ctx context.Context, id uuid.ID) error
	GetProgramsByStatus(ctx context.Context, status entities.ProgramStatus) ([]*entities.TrainingProgram, error)
	GetProgramsByCategory(ctx context.Context, category entities.TrainingCategory) ([]*entities.TrainingProgram, error)

	// Enrollment operations
	CreateEnrollment(ctx context.Context, enrollment *entities.TrainingEnrollment) error
	GetEnrollmentByID(ctx context.Context, id uuid.ID) (*entities.TrainingEnrollment, error)
	GetAllEnrollments(ctx context.Context, page, pageSize int) ([]*entities.TrainingEnrollment, int, error)
	GetEnrollmentsByProgramID(ctx context.Context, programID uuid.ID) ([]*entities.TrainingEnrollment, error)
	GetEnrollmentsByEmployeeID(ctx context.Context, employeeID uuid.ID) ([]*entities.TrainingEnrollment, error)
	UpdateEnrollment(ctx context.Context, enrollment *entities.TrainingEnrollment) error
	DeleteEnrollment(ctx context.Context, id uuid.ID) error

	// Statistics
	GetStatistics(ctx context.Context) (*entities.TrainingStatistics, error)

	// Counter updates
	IncrementEnrolledCount(ctx context.Context, programID uuid.ID) error
	IncrementCompletedCount(ctx context.Context, programID uuid.ID) error
	DecrementEnrolledCount(ctx context.Context, programID uuid.ID) error
}
