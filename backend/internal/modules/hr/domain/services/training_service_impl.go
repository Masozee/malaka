package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/modules/hr/domain/repositories"
	"malaka/internal/shared/uuid"
)

// trainingService implements TrainingService
type trainingService struct {
	repo         repositories.TrainingRepository
	employeeRepo repositories.EmployeeRepository
}

// NewTrainingService creates a new training service
func NewTrainingService(repo repositories.TrainingRepository, employeeRepo repositories.EmployeeRepository) TrainingService {
	return &trainingService{
		repo:         repo,
		employeeRepo: employeeRepo,
	}
}

// CreateProgram creates a new training program
func (s *trainingService) CreateProgram(ctx context.Context, program *entities.TrainingProgram) error {
	if program.ProgramTitle == "" {
		return errors.New("program title is required")
	}
	if program.DurationHours <= 0 {
		return errors.New("duration hours must be greater than 0")
	}
	if program.MaxParticipants <= 0 {
		return errors.New("max participants must be greater than 0")
	}
	if program.StartDate.IsZero() || program.EndDate.IsZero() {
		return errors.New("start date and end date are required")
	}
	if program.EndDate.Before(program.StartDate) {
		return errors.New("end date must be after start date")
	}

	program.ID = uuid.New()
	program.EnrolledCount = 0
	program.CompletedCount = 0
	program.CreatedAt = time.Now()
	program.UpdatedAt = time.Now()

	return s.repo.CreateProgram(ctx, program)
}

// GetProgramByID retrieves a training program by ID
func (s *trainingService) GetProgramByID(ctx context.Context, id uuid.ID) (*entities.TrainingProgram, error) {
	return s.repo.GetProgramByID(ctx, id)
}

// GetAllPrograms retrieves all training programs with pagination
func (s *trainingService) GetAllPrograms(ctx context.Context, page, pageSize int) ([]*entities.TrainingProgram, int, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 50
	}
	return s.repo.GetAllPrograms(ctx, page, pageSize)
}

// UpdateProgram updates a training program
func (s *trainingService) UpdateProgram(ctx context.Context, program *entities.TrainingProgram) error {
	existing, err := s.repo.GetProgramByID(ctx, program.ID)
	if err != nil {
		return fmt.Errorf("failed to get existing program: %w", err)
	}
	if existing == nil {
		return fmt.Errorf("program with ID %s not found", program.ID)
	}

	program.UpdatedAt = time.Now()
	return s.repo.UpdateProgram(ctx, program)
}

// DeleteProgram deletes a training program
func (s *trainingService) DeleteProgram(ctx context.Context, id uuid.ID) error {
	existing, err := s.repo.GetProgramByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get existing program: %w", err)
	}
	if existing == nil {
		return fmt.Errorf("program with ID %s not found", id)
	}

	return s.repo.DeleteProgram(ctx, id)
}

// GetProgramsByStatus retrieves programs by status
func (s *trainingService) GetProgramsByStatus(ctx context.Context, status entities.ProgramStatus) ([]*entities.TrainingProgram, error) {
	return s.repo.GetProgramsByStatus(ctx, status)
}

// GetProgramsByCategory retrieves programs by category
func (s *trainingService) GetProgramsByCategory(ctx context.Context, category entities.TrainingCategory) ([]*entities.TrainingProgram, error) {
	return s.repo.GetProgramsByCategory(ctx, category)
}

// EnrollEmployee enrolls an employee in a training program
func (s *trainingService) EnrollEmployee(ctx context.Context, programID, employeeID uuid.ID) (*entities.TrainingEnrollment, error) {
	// Get program
	program, err := s.repo.GetProgramByID(ctx, programID)
	if err != nil {
		return nil, fmt.Errorf("failed to get program: %w", err)
	}
	if program == nil {
		return nil, fmt.Errorf("program with ID %s not found", programID)
	}

	// Check capacity
	if program.EnrolledCount >= program.MaxParticipants {
		return nil, errors.New("program is at maximum capacity")
	}

	// Get employee details
	employee, err := s.employeeRepo.GetByID(ctx, employeeID)
	if err != nil {
		return nil, fmt.Errorf("failed to get employee: %w", err)
	}
	if employee == nil {
		return nil, fmt.Errorf("employee with ID %s not found", employeeID.String())
	}

	// Check for existing enrollment
	existingEnrollments, err := s.repo.GetEnrollmentsByEmployeeID(ctx, employeeID)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing enrollments: %w", err)
	}
	for _, e := range existingEnrollments {
		if e.ProgramID == programID && e.EnrollmentStatus != entities.EnrollmentStatusDropped && e.EnrollmentStatus != entities.EnrollmentStatusFailed {
			return nil, errors.New("employee is already enrolled in this program")
		}
	}

	// Create enrollment
	enrollment := &entities.TrainingEnrollment{
		ID:                 uuid.New(),
		EmployeeID:         employeeID,
		EmployeeName:       employee.EmployeeName,
		Department:         employee.Department,
		ProgramID:          programID,
		ProgramTitle:       program.ProgramTitle,
		EnrollmentDate:     time.Now(),
		ProgressPercentage: 0,
		EnrollmentStatus:   entities.EnrollmentStatusEnrolled,
		CertificateIssued:  false,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	if err := s.repo.CreateEnrollment(ctx, enrollment); err != nil {
		return nil, fmt.Errorf("failed to create enrollment: %w", err)
	}

	// Increment enrolled count
	if err := s.repo.IncrementEnrolledCount(ctx, programID); err != nil {
		return nil, fmt.Errorf("failed to update program enrolled count: %w", err)
	}

	return enrollment, nil
}

// GetEnrollmentByID retrieves an enrollment by ID
func (s *trainingService) GetEnrollmentByID(ctx context.Context, id uuid.ID) (*entities.TrainingEnrollment, error) {
	return s.repo.GetEnrollmentByID(ctx, id)
}

// GetAllEnrollments retrieves all enrollments with optional filters
func (s *trainingService) GetAllEnrollments(ctx context.Context, page, pageSize int, programID, employeeID *uuid.ID) ([]*entities.TrainingEnrollment, int, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 50
	}

	if programID != nil {
		enrollments, err := s.repo.GetEnrollmentsByProgramID(ctx, *programID)
		return enrollments, len(enrollments), err
	}

	if employeeID != nil {
		enrollments, err := s.repo.GetEnrollmentsByEmployeeID(ctx, *employeeID)
		return enrollments, len(enrollments), err
	}

	return s.repo.GetAllEnrollments(ctx, page, pageSize)
}

// UpdateProgress updates the progress of an enrollment
func (s *trainingService) UpdateProgress(ctx context.Context, enrollmentID uuid.ID, progress float64, score *float64) error {
	enrollment, err := s.repo.GetEnrollmentByID(ctx, enrollmentID)
	if err != nil {
		return fmt.Errorf("failed to get enrollment: %w", err)
	}
	if enrollment == nil {
		return fmt.Errorf("enrollment with ID %s not found", enrollmentID)
	}

	if progress < 0 || progress > 100 {
		return errors.New("progress must be between 0 and 100")
	}

	enrollment.ProgressPercentage = progress
	if score != nil {
		enrollment.FinalScore = score
	}

	// Update status based on progress
	if progress > 0 && progress < 100 {
		enrollment.EnrollmentStatus = entities.EnrollmentStatusInProgress
	}

	enrollment.UpdatedAt = time.Now()

	return s.repo.UpdateEnrollment(ctx, enrollment)
}

// CompleteTraining marks a training as completed
func (s *trainingService) CompleteTraining(ctx context.Context, enrollmentID uuid.ID, score float64) error {
	enrollment, err := s.repo.GetEnrollmentByID(ctx, enrollmentID)
	if err != nil {
		return fmt.Errorf("failed to get enrollment: %w", err)
	}
	if enrollment == nil {
		return fmt.Errorf("enrollment with ID %s not found", enrollmentID)
	}

	// Get program to check if it provides certification
	program, err := s.repo.GetProgramByID(ctx, enrollment.ProgramID)
	if err != nil {
		return fmt.Errorf("failed to get program: %w", err)
	}

	now := time.Now()
	enrollment.ProgressPercentage = 100
	enrollment.EnrollmentStatus = entities.EnrollmentStatusCompleted
	enrollment.FinalScore = &score
	enrollment.CompletionDate = &now
	enrollment.UpdatedAt = now

	// Issue certificate if program provides one and score is passing
	if program != nil && program.ProvidesCertification && score >= 70 {
		enrollment.CertificateIssued = true
	}

	if err := s.repo.UpdateEnrollment(ctx, enrollment); err != nil {
		return fmt.Errorf("failed to update enrollment: %w", err)
	}

	// Increment completed count
	if err := s.repo.IncrementCompletedCount(ctx, enrollment.ProgramID); err != nil {
		return fmt.Errorf("failed to update program completed count: %w", err)
	}

	return nil
}

// DropEnrollment drops an enrollment
func (s *trainingService) DropEnrollment(ctx context.Context, enrollmentID uuid.ID) error {
	enrollment, err := s.repo.GetEnrollmentByID(ctx, enrollmentID)
	if err != nil {
		return fmt.Errorf("failed to get enrollment: %w", err)
	}
	if enrollment == nil {
		return fmt.Errorf("enrollment with ID %s not found", enrollmentID)
	}

	enrollment.EnrollmentStatus = entities.EnrollmentStatusDropped
	enrollment.UpdatedAt = time.Now()

	if err := s.repo.UpdateEnrollment(ctx, enrollment); err != nil {
		return fmt.Errorf("failed to update enrollment: %w", err)
	}

	// Decrement enrolled count
	if err := s.repo.DecrementEnrolledCount(ctx, enrollment.ProgramID); err != nil {
		return fmt.Errorf("failed to update program enrolled count: %w", err)
	}

	return nil
}

// GetStatistics retrieves training statistics
func (s *trainingService) GetStatistics(ctx context.Context) (*entities.TrainingStatistics, error) {
	return s.repo.GetStatistics(ctx)
}
