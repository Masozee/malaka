package dto

import (
	"time"

	"malaka/internal/shared/uuid"
)

type PerformanceReviewResponse struct {
	ID                     uuid.ID                           `json:"id"`
	EmployeeID             uuid.ID                           `json:"employee_id"`
	EmployeeName           string                            `json:"employee_name"`
	EmployeeCode           string                            `json:"employee_code"`
	Department             string                            `json:"department"`
	Position               string                            `json:"position"`
	ReviewPeriod           string                            `json:"review_period"`
	ReviewType             string                            `json:"review_type"`
	OverallScore           *float64                          `json:"overall_score"`
	Status                 string                            `json:"status"`
	ReviewDate             *time.Time                        `json:"review_date"`
	SubmissionDate         *time.Time                        `json:"submission_date"`
	CompletionDate         *time.Time                        `json:"completion_date"`
	Notes                  string                            `json:"notes"`
	SelfReviewCompleted    bool                              `json:"self_review_completed"`
	ManagerReviewCompleted bool                              `json:"manager_review_completed"`
	Reviewer               string                            `json:"reviewer"`
	Goals                  PerformanceGoalsSummary           `json:"goals"`
	Competencies           PerformanceCompetenciesSummary    `json:"competencies"`
	LastUpdated            time.Time                         `json:"last_updated"`
	GoalDetails            []PerformanceReviewGoalResponse   `json:"goal_details,omitempty"`
	CompetencyDetails      []PerformanceCompetencyResponse   `json:"competency_details,omitempty"`
}

type PerformanceGoalsSummary struct {
	Achieved int `json:"achieved"`
	Total    int `json:"total"`
}

type PerformanceCompetenciesSummary struct {
	Technical      float64 `json:"technical"`
	Communication  float64 `json:"communication"`
	Leadership     float64 `json:"leadership"`
	Teamwork       float64 `json:"teamwork"`
	ProblemSolving float64 `json:"problem_solving"`
}

type PerformanceReviewGoalResponse struct {
	ID                    uuid.ID `json:"id"`
	GoalID                uuid.ID `json:"goal_id"`
	GoalTitle             string  `json:"goal_title"`
	GoalCategory          string  `json:"goal_category"`
	TargetValue           string  `json:"target_value"`
	ActualValue           string  `json:"actual_value"`
	AchievementPercentage float64 `json:"achievement_percentage"`
	IsAchieved            bool    `json:"is_achieved"`
	Comments              string  `json:"comments"`
}

type PerformanceCompetencyResponse struct {
	ID              uuid.ID `json:"id"`
	CompetencyID    uuid.ID `json:"competency_id"`
	CompetencyName  string  `json:"competency_name"`
	Category        string  `json:"category"`
	SelfScore       float64 `json:"self_score"`
	ManagerScore    float64 `json:"manager_score"`
	FinalScore      float64 `json:"final_score"`
	SelfComments    string  `json:"self_comments"`
	ManagerComments string  `json:"manager_comments"`
}

type PerformanceReviewCreateRequest struct {
	EmployeeID    uuid.ID    `json:"employee_id" binding:"required"`
	ReviewCycleID uuid.ID    `json:"review_cycle_id" binding:"required"`
	ReviewerID    uuid.ID    `json:"reviewer_id" binding:"required"`
	ReviewPeriod  string     `json:"review_period" binding:"required"`
	OverallScore  *float64   `json:"overall_score"`
	Status        string     `json:"status"`
	ReviewDate    *time.Time `json:"review_date"`
	Notes         string     `json:"notes"`
}

type PerformanceReviewUpdateRequest struct {
	OverallScore           *float64   `json:"overall_score"`
	Status                 string     `json:"status"`
	ReviewDate             *time.Time `json:"review_date"`
	CompletionDate         *time.Time `json:"completion_date"`
	Notes                  string     `json:"notes"`
	SelfReviewCompleted    *bool      `json:"self_review_completed"`
	ManagerReviewCompleted *bool      `json:"manager_review_completed"`
}

type PerformanceReviewListResponse struct {
	Data       []PerformanceReviewResponse `json:"data"`
	Total      int                         `json:"total"`
	Page       int                         `json:"page"`
	PageSize   int                         `json:"page_size"`
	TotalPages int                         `json:"total_pages"`
}

type PerformanceStatisticsResponse struct {
	TotalReviews     int     `json:"total_reviews"`
	CompletedReviews int     `json:"completed_reviews"`
	PendingReviews   int     `json:"pending_reviews"`
	OverdueReviews   int     `json:"overdue_reviews"`
	DraftReviews     int     `json:"draft_reviews"`
	AverageScore     float64 `json:"average_score"`
	HighPerformers   int     `json:"high_performers"`
	CompletionRate   float64 `json:"completion_rate"`
}
