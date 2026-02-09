package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

// EnrollmentStatus represents the status of a training enrollment
type EnrollmentStatus string

const (
	EnrollmentStatusEnrolled   EnrollmentStatus = "enrolled"
	EnrollmentStatusInProgress EnrollmentStatus = "in-progress"
	EnrollmentStatusCompleted  EnrollmentStatus = "completed"
	EnrollmentStatusFailed     EnrollmentStatus = "failed"
	EnrollmentStatusDropped    EnrollmentStatus = "dropped"
)

// TrainingEnrollment represents an employee's enrollment in a training program
type TrainingEnrollment struct {
	ID                 uuid.ID          `json:"id" db:"id"`
	EmployeeID         uuid.ID          `json:"employee_id" db:"employee_id"`
	EmployeeName       string           `json:"employee_name" db:"employee_name"`
	Department         string           `json:"department" db:"department"`
	ProgramID          uuid.ID          `json:"program_id" db:"program_id"`
	ProgramTitle       string           `json:"program_title" db:"program_title"`
	EnrollmentDate     time.Time        `json:"enrollment_date" db:"enrollment_date"`
	CompletionDate     *time.Time       `json:"completion_date,omitempty" db:"completion_date"`
	ProgressPercentage float64          `json:"progress_percentage" db:"progress_percentage"`
	EnrollmentStatus   EnrollmentStatus `json:"enrollment_status" db:"enrollment_status"`
	FinalScore         *float64         `json:"final_score,omitempty" db:"final_score"`
	CertificateIssued  bool             `json:"certificate_issued" db:"certificate_issued"`
	CreatedAt          time.Time        `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time        `json:"updated_at" db:"updated_at"`
}

// TableName returns the table name for the TrainingEnrollment entity
func (TrainingEnrollment) TableName() string {
	return "training_enrollments"
}

// TrainingStatistics represents training statistics
type TrainingStatistics struct {
	TotalPrograms      int     `json:"total_programs"`
	ActivePrograms     int     `json:"active_programs"`
	UpcomingPrograms   int     `json:"upcoming_programs"`
	CompletedPrograms  int     `json:"completed_programs"`
	TotalEnrollments   int     `json:"total_enrollments"`
	TotalCompleted     int     `json:"total_completed"`
	CompletionRate     float64 `json:"completion_rate"`
	AverageCost        float64 `json:"average_cost"`
	TotalTrainingHours int     `json:"total_training_hours"`
}
