package entities

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

// TrainingCategory represents the category of a training program
type TrainingCategory string

const (
	TrainingCategoryTechnical  TrainingCategory = "technical"
	TrainingCategorySoftSkills TrainingCategory = "soft-skills"
	TrainingCategorySafety     TrainingCategory = "safety"
	TrainingCategoryCompliance TrainingCategory = "compliance"
	TrainingCategoryLeadership TrainingCategory = "leadership"
	TrainingCategoryProduct    TrainingCategory = "product"
)

// TrainingType represents the type/format of training
type TrainingType string

const (
	TrainingTypeOnline        TrainingType = "online"
	TrainingTypeClassroom     TrainingType = "classroom"
	TrainingTypeWorkshop      TrainingType = "workshop"
	TrainingTypeCertification TrainingType = "certification"
	TrainingTypeOnboarding    TrainingType = "onboarding"
)

// ProgramStatus represents the status of a training program
type ProgramStatus string

const (
	ProgramStatusActive    ProgramStatus = "active"
	ProgramStatusUpcoming  ProgramStatus = "upcoming"
	ProgramStatusCompleted ProgramStatus = "completed"
	ProgramStatusCancelled ProgramStatus = "cancelled"
)

// TrainingProgram represents a training program entity
type TrainingProgram struct {
	ID                    uuid.UUID        `json:"id" db:"id"`
	ProgramTitle          string           `json:"program_title" db:"program_title"`
	Description           string           `json:"description" db:"description"`
	Category              TrainingCategory `json:"category" db:"category"`
	TrainingType          TrainingType     `json:"training_type" db:"training_type"`
	DurationHours         int              `json:"duration_hours" db:"duration_hours"`
	MaxParticipants       int              `json:"max_participants" db:"max_participants"`
	EnrolledCount         int              `json:"enrolled_count" db:"enrolled_count"`
	CompletedCount        int              `json:"completed_count" db:"completed_count"`
	InstructorName        string           `json:"instructor_name" db:"instructor_name"`
	TargetDepartments     pq.StringArray   `json:"target_departments" db:"target_departments"`
	ProgramStatus         ProgramStatus    `json:"program_status" db:"program_status"`
	StartDate             time.Time        `json:"start_date" db:"start_date"`
	EndDate               time.Time        `json:"end_date" db:"end_date"`
	TrainingLocation      string           `json:"training_location,omitempty" db:"training_location"`
	CostPerParticipant    float64          `json:"cost_per_participant" db:"cost_per_participant"`
	ProvidesCertification bool             `json:"provides_certification" db:"provides_certification"`
	Prerequisites         pq.StringArray   `json:"prerequisites,omitempty" db:"prerequisites"`
	TrainingMaterials     pq.StringArray   `json:"training_materials,omitempty" db:"training_materials"`
	CreatedAt             time.Time        `json:"created_at" db:"created_at"`
	UpdatedAt             time.Time        `json:"updated_at" db:"updated_at"`
}

// TableName returns the table name for the TrainingProgram entity
func (TrainingProgram) TableName() string {
	return "training_programs"
}
