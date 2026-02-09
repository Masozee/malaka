package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

type PerformanceReview struct {
	ID                     uuid.ID    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	EmployeeID             uuid.ID    `json:"employee_id" gorm:"type:uuid;not null"`
	ReviewCycleID          uuid.ID    `json:"review_cycle_id" gorm:"type:uuid;not null"`
	ReviewerID             uuid.ID    `json:"reviewer_id" gorm:"type:uuid;not null"`
	ReviewPeriod           string     `json:"review_period" gorm:"size:50;not null"`
	OverallScore           *float64   `json:"overall_score" gorm:"type:decimal(3,2)"`
	Status                 string     `json:"status" gorm:"size:20;not null;default:'draft'"`
	ReviewDate             *time.Time `json:"review_date" gorm:"type:date"`
	SubmissionDate         *time.Time `json:"submission_date" gorm:"type:timestamp"`
	CompletionDate         *time.Time `json:"completion_date" gorm:"type:timestamp"`
	Notes                  string     `json:"notes" gorm:"type:text"`
	SelfReviewCompleted    bool       `json:"self_review_completed" gorm:"default:false"`
	ManagerReviewCompleted bool       `json:"manager_review_completed" gorm:"default:false"`
	CreatedAt              time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt              time.Time  `json:"updated_at" gorm:"autoUpdateTime"`

	// Related entities
	Employee     Employee                          `json:"employee" gorm:"foreignKey:EmployeeID"`
	ReviewCycle  PerformanceReviewCycle            `json:"review_cycle" gorm:"foreignKey:ReviewCycleID"`
	Reviewer     Employee                          `json:"reviewer" gorm:"foreignKey:ReviewerID"`
	Goals        []PerformanceReviewGoal           `json:"goals" gorm:"foreignKey:PerformanceReviewID"`
	Competencies []PerformanceCompetencyEvaluation `json:"competencies" gorm:"foreignKey:PerformanceReviewID"`
}

type PerformanceReviewCycle struct {
	ID          uuid.ID   `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string    `json:"name" gorm:"size:100;not null"`
	ReviewType  string    `json:"review_type" gorm:"size:20;not null"`
	StartDate   time.Time `json:"start_date" gorm:"type:date;not null"`
	EndDate     time.Time `json:"end_date" gorm:"type:date;not null"`
	Description string    `json:"description" gorm:"type:text"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type PerformanceGoal struct {
	ID          uuid.ID   `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Title       string    `json:"title" gorm:"size:255;not null"`
	Description string    `json:"description" gorm:"type:text"`
	Category    string    `json:"category" gorm:"size:50"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type PerformanceReviewGoal struct {
	ID                    uuid.ID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	PerformanceReviewID   uuid.ID `json:"performance_review_id" gorm:"type:uuid;not null"`
	GoalID                uuid.ID `json:"goal_id" gorm:"type:uuid;not null"`
	TargetValue           string  `json:"target_value" gorm:"size:100"`
	ActualValue           string  `json:"actual_value" gorm:"size:100"`
	AchievementPercentage float64 `json:"achievement_percentage" gorm:"type:decimal(5,2);default:0.00"`
	IsAchieved            bool    `json:"is_achieved" gorm:"default:false"`
	Comments              string  `json:"comments" gorm:"type:text"`

	// Related entities
	PerformanceReview PerformanceReview `json:"performance_review" gorm:"foreignKey:PerformanceReviewID"`
	Goal              PerformanceGoal   `json:"goal" gorm:"foreignKey:GoalID"`
}

type Competency struct {
	ID          uuid.ID   `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string    `json:"name" gorm:"size:100;not null"`
	Description string    `json:"description" gorm:"type:text"`
	Category    string    `json:"category" gorm:"size:50"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type PerformanceCompetencyEvaluation struct {
	ID                  uuid.ID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	PerformanceReviewID uuid.ID `json:"performance_review_id" gorm:"type:uuid;not null"`
	CompetencyID        uuid.ID `json:"competency_id" gorm:"type:uuid;not null"`
	SelfScore           float64 `json:"self_score" gorm:"type:decimal(3,2);default:0.00"`
	ManagerScore        float64 `json:"manager_score" gorm:"type:decimal(3,2);default:0.00"`
	FinalScore          float64 `json:"final_score" gorm:"type:decimal(3,2);default:0.00"`
	SelfComments        string  `json:"self_comments" gorm:"type:text"`
	ManagerComments     string  `json:"manager_comments" gorm:"type:text"`

	// Related entities
	PerformanceReview PerformanceReview `json:"performance_review" gorm:"foreignKey:PerformanceReviewID"`
	Competency        Competency        `json:"competency" gorm:"foreignKey:CompetencyID"`
}
