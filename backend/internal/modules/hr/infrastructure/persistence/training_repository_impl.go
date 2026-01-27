package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/modules/hr/domain/repositories"
)

// trainingRepository implements TrainingRepository
type trainingRepository struct {
	db *sqlx.DB
}

// NewTrainingRepository creates a new training repository
func NewTrainingRepository(db *sqlx.DB) repositories.TrainingRepository {
	return &trainingRepository{db: db}
}

// CreateProgram creates a new training program
func (r *trainingRepository) CreateProgram(ctx context.Context, program *entities.TrainingProgram) error {
	query := `
		INSERT INTO training_programs (
			id, program_title, description, category, training_type, duration_hours,
			max_participants, enrolled_count, completed_count, instructor_name,
			target_departments, program_status, start_date, end_date, training_location,
			cost_per_participant, provides_certification, prerequisites, training_materials,
			created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
		)`

	_, err := r.db.ExecContext(ctx, query,
		program.ID, program.ProgramTitle, program.Description, program.Category,
		program.TrainingType, program.DurationHours, program.MaxParticipants,
		program.EnrolledCount, program.CompletedCount, program.InstructorName,
		program.TargetDepartments, program.ProgramStatus, program.StartDate,
		program.EndDate, program.TrainingLocation, program.CostPerParticipant,
		program.ProvidesCertification, program.Prerequisites, program.TrainingMaterials,
		program.CreatedAt, program.UpdatedAt,
	)

	return err
}

// GetProgramByID retrieves a training program by ID
func (r *trainingRepository) GetProgramByID(ctx context.Context, id uuid.UUID) (*entities.TrainingProgram, error) {
	query := `
		SELECT id, program_title, description, category, training_type, duration_hours,
			max_participants, enrolled_count, completed_count, instructor_name,
			target_departments, program_status, start_date, end_date,
			COALESCE(training_location, '') as training_location,
			cost_per_participant, provides_certification, prerequisites, training_materials,
			created_at, updated_at
		FROM training_programs WHERE id = $1`

	var program entities.TrainingProgram
	err := r.db.GetContext(ctx, &program, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &program, nil
}

// GetAllPrograms retrieves all training programs with pagination
func (r *trainingRepository) GetAllPrograms(ctx context.Context, page, pageSize int) ([]*entities.TrainingProgram, int, error) {
	offset := (page - 1) * pageSize

	// Get total count
	var total int
	countQuery := `SELECT COUNT(*) FROM training_programs`
	err := r.db.GetContext(ctx, &total, countQuery)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, program_title, description, category, training_type, duration_hours,
			max_participants, enrolled_count, completed_count, instructor_name,
			target_departments, program_status, start_date, end_date,
			COALESCE(training_location, '') as training_location,
			cost_per_participant, provides_certification, prerequisites, training_materials,
			created_at, updated_at
		FROM training_programs
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2`

	var programs []*entities.TrainingProgram
	err = r.db.SelectContext(ctx, &programs, query, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}

	return programs, total, nil
}

// UpdateProgram updates a training program
func (r *trainingRepository) UpdateProgram(ctx context.Context, program *entities.TrainingProgram) error {
	query := `
		UPDATE training_programs SET
			program_title = $2, description = $3, category = $4, training_type = $5,
			duration_hours = $6, max_participants = $7, instructor_name = $8,
			target_departments = $9, program_status = $10, start_date = $11,
			end_date = $12, training_location = $13, cost_per_participant = $14,
			provides_certification = $15, prerequisites = $16, training_materials = $17,
			updated_at = $18
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		program.ID, program.ProgramTitle, program.Description, program.Category,
		program.TrainingType, program.DurationHours, program.MaxParticipants,
		program.InstructorName, program.TargetDepartments, program.ProgramStatus,
		program.StartDate, program.EndDate, program.TrainingLocation,
		program.CostPerParticipant, program.ProvidesCertification,
		program.Prerequisites, program.TrainingMaterials, program.UpdatedAt,
	)

	return err
}

// DeleteProgram deletes a training program
func (r *trainingRepository) DeleteProgram(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM training_programs WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetProgramsByStatus retrieves programs by status
func (r *trainingRepository) GetProgramsByStatus(ctx context.Context, status entities.ProgramStatus) ([]*entities.TrainingProgram, error) {
	query := `
		SELECT id, program_title, description, category, training_type, duration_hours,
			max_participants, enrolled_count, completed_count, instructor_name,
			target_departments, program_status, start_date, end_date,
			COALESCE(training_location, '') as training_location,
			cost_per_participant, provides_certification, prerequisites, training_materials,
			created_at, updated_at
		FROM training_programs WHERE program_status = $1
		ORDER BY created_at DESC`

	var programs []*entities.TrainingProgram
	err := r.db.SelectContext(ctx, &programs, query, status)
	return programs, err
}

// GetProgramsByCategory retrieves programs by category
func (r *trainingRepository) GetProgramsByCategory(ctx context.Context, category entities.TrainingCategory) ([]*entities.TrainingProgram, error) {
	query := `
		SELECT id, program_title, description, category, training_type, duration_hours,
			max_participants, enrolled_count, completed_count, instructor_name,
			target_departments, program_status, start_date, end_date,
			COALESCE(training_location, '') as training_location,
			cost_per_participant, provides_certification, prerequisites, training_materials,
			created_at, updated_at
		FROM training_programs WHERE category = $1
		ORDER BY created_at DESC`

	var programs []*entities.TrainingProgram
	err := r.db.SelectContext(ctx, &programs, query, category)
	return programs, err
}

// CreateEnrollment creates a new training enrollment
func (r *trainingRepository) CreateEnrollment(ctx context.Context, enrollment *entities.TrainingEnrollment) error {
	query := `
		INSERT INTO training_enrollments (
			id, employee_id, employee_name, department, program_id, program_title,
			enrollment_date, completion_date, progress_percentage, enrollment_status,
			final_score, certificate_issued, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
		)`

	_, err := r.db.ExecContext(ctx, query,
		enrollment.ID, enrollment.EmployeeID, enrollment.EmployeeName, enrollment.Department,
		enrollment.ProgramID, enrollment.ProgramTitle, enrollment.EnrollmentDate,
		enrollment.CompletionDate, enrollment.ProgressPercentage, enrollment.EnrollmentStatus,
		enrollment.FinalScore, enrollment.CertificateIssued, enrollment.CreatedAt, enrollment.UpdatedAt,
	)

	return err
}

// GetEnrollmentByID retrieves an enrollment by ID
func (r *trainingRepository) GetEnrollmentByID(ctx context.Context, id uuid.UUID) (*entities.TrainingEnrollment, error) {
	query := `
		SELECT id, employee_id, employee_name, department, program_id, program_title,
			enrollment_date, completion_date, progress_percentage, enrollment_status,
			final_score, certificate_issued, created_at, updated_at
		FROM training_enrollments WHERE id = $1`

	var enrollment entities.TrainingEnrollment
	err := r.db.GetContext(ctx, &enrollment, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &enrollment, nil
}

// GetAllEnrollments retrieves all enrollments with pagination
func (r *trainingRepository) GetAllEnrollments(ctx context.Context, page, pageSize int) ([]*entities.TrainingEnrollment, int, error) {
	offset := (page - 1) * pageSize

	var total int
	countQuery := `SELECT COUNT(*) FROM training_enrollments`
	err := r.db.GetContext(ctx, &total, countQuery)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, employee_id, employee_name, department, program_id, program_title,
			enrollment_date, completion_date, progress_percentage, enrollment_status,
			final_score, certificate_issued, created_at, updated_at
		FROM training_enrollments
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2`

	var enrollments []*entities.TrainingEnrollment
	err = r.db.SelectContext(ctx, &enrollments, query, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}

	return enrollments, total, nil
}

// GetEnrollmentsByProgramID retrieves enrollments by program ID
func (r *trainingRepository) GetEnrollmentsByProgramID(ctx context.Context, programID uuid.UUID) ([]*entities.TrainingEnrollment, error) {
	query := `
		SELECT id, employee_id, employee_name, department, program_id, program_title,
			enrollment_date, completion_date, progress_percentage, enrollment_status,
			final_score, certificate_issued, created_at, updated_at
		FROM training_enrollments WHERE program_id = $1
		ORDER BY enrollment_date DESC`

	var enrollments []*entities.TrainingEnrollment
	err := r.db.SelectContext(ctx, &enrollments, query, programID)
	return enrollments, err
}

// GetEnrollmentsByEmployeeID retrieves enrollments by employee ID
func (r *trainingRepository) GetEnrollmentsByEmployeeID(ctx context.Context, employeeID uuid.UUID) ([]*entities.TrainingEnrollment, error) {
	query := `
		SELECT id, employee_id, employee_name, department, program_id, program_title,
			enrollment_date, completion_date, progress_percentage, enrollment_status,
			final_score, certificate_issued, created_at, updated_at
		FROM training_enrollments WHERE employee_id = $1
		ORDER BY enrollment_date DESC`

	var enrollments []*entities.TrainingEnrollment
	err := r.db.SelectContext(ctx, &enrollments, query, employeeID)
	return enrollments, err
}

// UpdateEnrollment updates an enrollment
func (r *trainingRepository) UpdateEnrollment(ctx context.Context, enrollment *entities.TrainingEnrollment) error {
	query := `
		UPDATE training_enrollments SET
			completion_date = $2, progress_percentage = $3, enrollment_status = $4,
			final_score = $5, certificate_issued = $6, updated_at = $7
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		enrollment.ID, enrollment.CompletionDate, enrollment.ProgressPercentage,
		enrollment.EnrollmentStatus, enrollment.FinalScore, enrollment.CertificateIssued,
		enrollment.UpdatedAt,
	)

	return err
}

// DeleteEnrollment deletes an enrollment
func (r *trainingRepository) DeleteEnrollment(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM training_enrollments WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

// GetStatistics retrieves training statistics
func (r *trainingRepository) GetStatistics(ctx context.Context) (*entities.TrainingStatistics, error) {
	stats := &entities.TrainingStatistics{}

	// Get program counts
	programQuery := `
		SELECT
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE program_status = 'active') as active,
			COUNT(*) FILTER (WHERE program_status = 'upcoming') as upcoming,
			COUNT(*) FILTER (WHERE program_status = 'completed') as completed,
			COALESCE(AVG(cost_per_participant), 0) as avg_cost,
			COALESCE(SUM(duration_hours), 0) as total_hours
		FROM training_programs`

	var programStats struct {
		Total      int     `db:"total"`
		Active     int     `db:"active"`
		Upcoming   int     `db:"upcoming"`
		Completed  int     `db:"completed"`
		AvgCost    float64 `db:"avg_cost"`
		TotalHours int     `db:"total_hours"`
	}

	err := r.db.GetContext(ctx, &programStats, programQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to get program stats: %w", err)
	}

	stats.TotalPrograms = programStats.Total
	stats.ActivePrograms = programStats.Active
	stats.UpcomingPrograms = programStats.Upcoming
	stats.CompletedPrograms = programStats.Completed
	stats.AverageCost = programStats.AvgCost
	stats.TotalTrainingHours = programStats.TotalHours

	// Get enrollment counts
	enrollmentQuery := `
		SELECT
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE enrollment_status = 'completed') as completed
		FROM training_enrollments`

	var enrollmentStats struct {
		Total     int `db:"total"`
		Completed int `db:"completed"`
	}

	err = r.db.GetContext(ctx, &enrollmentStats, enrollmentQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to get enrollment stats: %w", err)
	}

	stats.TotalEnrollments = enrollmentStats.Total
	stats.TotalCompleted = enrollmentStats.Completed

	if stats.TotalEnrollments > 0 {
		stats.CompletionRate = float64(stats.TotalCompleted) / float64(stats.TotalEnrollments) * 100
	}

	return stats, nil
}

// IncrementEnrolledCount increments the enrolled count for a program
func (r *trainingRepository) IncrementEnrolledCount(ctx context.Context, programID uuid.UUID) error {
	query := `UPDATE training_programs SET enrolled_count = enrolled_count + 1, updated_at = $2 WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, programID, time.Now())
	return err
}

// IncrementCompletedCount increments the completed count for a program
func (r *trainingRepository) IncrementCompletedCount(ctx context.Context, programID uuid.UUID) error {
	query := `UPDATE training_programs SET completed_count = completed_count + 1, updated_at = $2 WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, programID, time.Now())
	return err
}

// DecrementEnrolledCount decrements the enrolled count for a program
func (r *trainingRepository) DecrementEnrolledCount(ctx context.Context, programID uuid.UUID) error {
	query := `UPDATE training_programs SET enrolled_count = GREATEST(enrolled_count - 1, 0), updated_at = $2 WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, programID, time.Now())
	return err
}

// Ensure pq is used
var _ = pq.Array
