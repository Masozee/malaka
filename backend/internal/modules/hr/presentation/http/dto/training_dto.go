package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"malaka/internal/modules/hr/domain/entities"
)

// TrainingProgramRequest represents the request payload for creating/updating a training program
type TrainingProgramRequest struct {
	ProgramTitle          string   `json:"program_title" binding:"required"`
	Description           string   `json:"description"`
	Category              string   `json:"category" binding:"required"`
	TrainingType          string   `json:"training_type" binding:"required"`
	DurationHours         int      `json:"duration_hours" binding:"required,gt=0"`
	MaxParticipants       int      `json:"max_participants" binding:"required,gt=0"`
	InstructorName        string   `json:"instructor_name"`
	TargetDepartments     []string `json:"target_departments"`
	ProgramStatus         string   `json:"program_status"`
	StartDate             string   `json:"start_date" binding:"required"`
	EndDate               string   `json:"end_date" binding:"required"`
	TrainingLocation      string   `json:"training_location"`
	CostPerParticipant    float64  `json:"cost_per_participant"`
	ProvidesCertification bool     `json:"provides_certification"`
	Prerequisites         []string `json:"prerequisites"`
	TrainingMaterials     []string `json:"training_materials"`
}

// TrainingProgramResponse represents the response payload for a training program
type TrainingProgramResponse struct {
	ID                    uuid.UUID `json:"id"`
	ProgramTitle          string    `json:"program_title"`
	Description           string    `json:"description"`
	Category              string    `json:"category"`
	TrainingType          string    `json:"training_type"`
	DurationHours         int       `json:"duration_hours"`
	MaxParticipants       int       `json:"max_participants"`
	EnrolledCount         int       `json:"enrolled_count"`
	CompletedCount        int       `json:"completed_count"`
	InstructorName        string    `json:"instructor_name"`
	TargetDepartments     []string  `json:"target_departments"`
	ProgramStatus         string    `json:"program_status"`
	StartDate             string    `json:"start_date"`
	EndDate               string    `json:"end_date"`
	TrainingLocation      string    `json:"training_location,omitempty"`
	CostPerParticipant    float64   `json:"cost_per_participant"`
	ProvidesCertification bool      `json:"provides_certification"`
	Prerequisites         []string  `json:"prerequisites,omitempty"`
	TrainingMaterials     []string  `json:"training_materials,omitempty"`
	CreatedAt             string    `json:"created_at"`
	UpdatedAt             string    `json:"updated_at"`
}

// TrainingEnrollmentRequest represents the request payload for enrolling in training
type TrainingEnrollmentRequest struct {
	ProgramID  string `json:"program_id" binding:"required"`
	EmployeeID string `json:"employee_id" binding:"required"`
}

// TrainingProgressRequest represents the request payload for updating training progress
type TrainingProgressRequest struct {
	ProgressPercentage float64  `json:"progress_percentage" binding:"required,gte=0,lte=100"`
	FinalScore         *float64 `json:"final_score,omitempty"`
}

// TrainingCompleteRequest represents the request payload for completing training
type TrainingCompleteRequest struct {
	FinalScore float64 `json:"final_score" binding:"required"`
}

// TrainingEnrollmentResponse represents the response payload for a training enrollment
type TrainingEnrollmentResponse struct {
	ID                 uuid.UUID `json:"id"`
	EmployeeID         uuid.UUID `json:"employee_id"`
	EmployeeName       string    `json:"employee_name"`
	Department         string    `json:"department"`
	ProgramID          uuid.UUID `json:"program_id"`
	ProgramTitle       string    `json:"program_title"`
	EnrollmentDate     string    `json:"enrollment_date"`
	CompletionDate     *string   `json:"completion_date,omitempty"`
	ProgressPercentage float64   `json:"progress_percentage"`
	EnrollmentStatus   string    `json:"enrollment_status"`
	FinalScore         *float64  `json:"final_score,omitempty"`
	CertificateIssued  bool      `json:"certificate_issued"`
	CreatedAt          string    `json:"created_at"`
	UpdatedAt          string    `json:"updated_at"`
}

// TrainingStatisticsResponse represents the response payload for training statistics
type TrainingStatisticsResponse struct {
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

// PaginatedProgramsResponse represents paginated training programs response
type PaginatedProgramsResponse struct {
	Data       []*TrainingProgramResponse `json:"data"`
	Total      int                        `json:"total"`
	Page       int                        `json:"page"`
	PageSize   int                        `json:"page_size"`
	TotalPages int                        `json:"total_pages"`
}

// MapTrainingProgramRequestToEntity maps request to entity
func MapTrainingProgramRequestToEntity(req *TrainingProgramRequest) (*entities.TrainingProgram, error) {
	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		return nil, err
	}
	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		return nil, err
	}

	status := entities.ProgramStatusActive
	if req.ProgramStatus != "" {
		status = entities.ProgramStatus(req.ProgramStatus)
	}

	return &entities.TrainingProgram{
		ProgramTitle:          req.ProgramTitle,
		Description:           req.Description,
		Category:              entities.TrainingCategory(req.Category),
		TrainingType:          entities.TrainingType(req.TrainingType),
		DurationHours:         req.DurationHours,
		MaxParticipants:       req.MaxParticipants,
		InstructorName:        req.InstructorName,
		TargetDepartments:     pq.StringArray(req.TargetDepartments),
		ProgramStatus:         status,
		StartDate:             startDate,
		EndDate:               endDate,
		TrainingLocation:      req.TrainingLocation,
		CostPerParticipant:    req.CostPerParticipant,
		ProvidesCertification: req.ProvidesCertification,
		Prerequisites:         pq.StringArray(req.Prerequisites),
		TrainingMaterials:     pq.StringArray(req.TrainingMaterials),
	}, nil
}

// MapTrainingProgramEntityToResponse maps entity to response
func MapTrainingProgramEntityToResponse(program *entities.TrainingProgram) *TrainingProgramResponse {
	if program == nil {
		return nil
	}

	targetDepts := []string{}
	if program.TargetDepartments != nil {
		targetDepts = program.TargetDepartments
	}

	prereqs := []string{}
	if program.Prerequisites != nil {
		prereqs = program.Prerequisites
	}

	materials := []string{}
	if program.TrainingMaterials != nil {
		materials = program.TrainingMaterials
	}

	return &TrainingProgramResponse{
		ID:                    program.ID,
		ProgramTitle:          program.ProgramTitle,
		Description:           program.Description,
		Category:              string(program.Category),
		TrainingType:          string(program.TrainingType),
		DurationHours:         program.DurationHours,
		MaxParticipants:       program.MaxParticipants,
		EnrolledCount:         program.EnrolledCount,
		CompletedCount:        program.CompletedCount,
		InstructorName:        program.InstructorName,
		TargetDepartments:     targetDepts,
		ProgramStatus:         string(program.ProgramStatus),
		StartDate:             program.StartDate.Format("2006-01-02"),
		EndDate:               program.EndDate.Format("2006-01-02"),
		TrainingLocation:      program.TrainingLocation,
		CostPerParticipant:    program.CostPerParticipant,
		ProvidesCertification: program.ProvidesCertification,
		Prerequisites:         prereqs,
		TrainingMaterials:     materials,
		CreatedAt:             program.CreatedAt.Format(time.RFC3339),
		UpdatedAt:             program.UpdatedAt.Format(time.RFC3339),
	}
}

// MapTrainingEnrollmentEntityToResponse maps enrollment entity to response
func MapTrainingEnrollmentEntityToResponse(enrollment *entities.TrainingEnrollment) *TrainingEnrollmentResponse {
	if enrollment == nil {
		return nil
	}

	resp := &TrainingEnrollmentResponse{
		ID:                 enrollment.ID,
		EmployeeID:         enrollment.EmployeeID,
		EmployeeName:       enrollment.EmployeeName,
		Department:         enrollment.Department,
		ProgramID:          enrollment.ProgramID,
		ProgramTitle:       enrollment.ProgramTitle,
		EnrollmentDate:     enrollment.EnrollmentDate.Format("2006-01-02"),
		ProgressPercentage: enrollment.ProgressPercentage,
		EnrollmentStatus:   string(enrollment.EnrollmentStatus),
		FinalScore:         enrollment.FinalScore,
		CertificateIssued:  enrollment.CertificateIssued,
		CreatedAt:          enrollment.CreatedAt.Format(time.RFC3339),
		UpdatedAt:          enrollment.UpdatedAt.Format(time.RFC3339),
	}

	if enrollment.CompletionDate != nil {
		completionDate := enrollment.CompletionDate.Format("2006-01-02")
		resp.CompletionDate = &completionDate
	}

	return resp
}

// MapTrainingStatisticsEntityToResponse maps statistics entity to response
func MapTrainingStatisticsEntityToResponse(stats *entities.TrainingStatistics) *TrainingStatisticsResponse {
	if stats == nil {
		return nil
	}

	return &TrainingStatisticsResponse{
		TotalPrograms:      stats.TotalPrograms,
		ActivePrograms:     stats.ActivePrograms,
		UpcomingPrograms:   stats.UpcomingPrograms,
		CompletedPrograms:  stats.CompletedPrograms,
		TotalEnrollments:   stats.TotalEnrollments,
		TotalCompleted:     stats.TotalCompleted,
		CompletionRate:     stats.CompletionRate,
		AverageCost:        stats.AverageCost,
		TotalTrainingHours: stats.TotalTrainingHours,
	}
}
