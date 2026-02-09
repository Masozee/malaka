package services

import (
	"context"

	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/shared/uuid"
)

// TrainingService defines the interface for training operations
type TrainingService interface {
	// Program operations
	CreateProgram(ctx context.Context, program *entities.TrainingProgram) error
	GetProgramByID(ctx context.Context, id uuid.ID) (*entities.TrainingProgram, error)
	GetAllPrograms(ctx context.Context, page, pageSize int) ([]*entities.TrainingProgram, int, error)
	UpdateProgram(ctx context.Context, program *entities.TrainingProgram) error
	DeleteProgram(ctx context.Context, id uuid.ID) error
	GetProgramsByStatus(ctx context.Context, status entities.ProgramStatus) ([]*entities.TrainingProgram, error)
	GetProgramsByCategory(ctx context.Context, category entities.TrainingCategory) ([]*entities.TrainingProgram, error)

	// Enrollment operations
	EnrollEmployee(ctx context.Context, programID, employeeID uuid.ID) (*entities.TrainingEnrollment, error)
	GetEnrollmentByID(ctx context.Context, id uuid.ID) (*entities.TrainingEnrollment, error)
	GetAllEnrollments(ctx context.Context, page, pageSize int, programID, employeeID *uuid.ID) ([]*entities.TrainingEnrollment, int, error)
	UpdateProgress(ctx context.Context, enrollmentID uuid.ID, progress float64, score *float64) error
	CompleteTraining(ctx context.Context, enrollmentID uuid.ID, score float64) error
	DropEnrollment(ctx context.Context, enrollmentID uuid.ID) error

	// Statistics
	GetStatistics(ctx context.Context) (*entities.TrainingStatistics, error)
}
