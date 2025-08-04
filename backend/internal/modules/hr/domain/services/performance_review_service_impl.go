package services

import (
	"context"
	"math"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/modules/hr/domain/repositories"
	"malaka/internal/modules/hr/presentation/http/dto"
)

type performanceReviewService struct {
	performanceRepo repositories.PerformanceReviewRepository
}

func NewPerformanceReviewService(performanceRepo repositories.PerformanceReviewRepository) PerformanceReviewService {
	return &performanceReviewService{
		performanceRepo: performanceRepo,
	}
}

func (s *performanceReviewService) CreatePerformanceReview(ctx context.Context, req *dto.PerformanceReviewCreateRequest) (*dto.PerformanceReviewResponse, error) {
	review := &entities.PerformanceReview{
		EmployeeID:             req.EmployeeID,
		ReviewCycleID:          req.ReviewCycleID,
		ReviewerID:             req.ReviewerID,
		ReviewPeriod:           req.ReviewPeriod,
		OverallScore:           req.OverallScore,
		Status:                 req.Status,
		ReviewDate:             req.ReviewDate,
		Notes:                  req.Notes,
		SelfReviewCompleted:    false,
		ManagerReviewCompleted: false,
	}

	if review.Status == "" {
		review.Status = "draft"
	}

	err := s.performanceRepo.CreatePerformanceReview(ctx, review)
	if err != nil {
		return nil, err
	}

	// Get the created review with details
	return s.GetPerformanceReviewWithDetails(ctx, review.ID)
}

func (s *performanceReviewService) GetPerformanceReviewByID(ctx context.Context, id string) (*dto.PerformanceReviewResponse, error) {
	review, err := s.performanceRepo.GetPerformanceReviewByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return s.mapToResponse(review), nil
}

func (s *performanceReviewService) GetAllPerformanceReviews(ctx context.Context, filters map[string]interface{}) (*dto.PerformanceReviewListResponse, error) {
	reviews, err := s.performanceRepo.GetAllPerformanceReviews(ctx, filters)
	if err != nil {
		return nil, err
	}

	responses := make([]dto.PerformanceReviewResponse, len(reviews))
	for i, review := range reviews {
		responses[i] = *s.mapToResponseWithDetails(review)
	}

	// Calculate pagination (simplified version)
	total := len(responses)
	page := 1
	pageSize := 50
	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	if pageParam, exists := filters["page"]; exists {
		if p, ok := pageParam.(int); ok {
			page = p
		}
	}
	if sizeParam, exists := filters["page_size"]; exists {
		if size, ok := sizeParam.(int); ok {
			pageSize = size
		}
	}

	return &dto.PerformanceReviewListResponse{
		Data:       responses,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *performanceReviewService) UpdatePerformanceReview(ctx context.Context, id string, req *dto.PerformanceReviewUpdateRequest) (*dto.PerformanceReviewResponse, error) {
	review, err := s.performanceRepo.GetPerformanceReviewByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Update fields
	if req.OverallScore != nil {
		review.OverallScore = req.OverallScore
	}
	if req.Status != "" {
		review.Status = req.Status
	}
	if req.ReviewDate != nil {
		review.ReviewDate = req.ReviewDate
	}
	if req.CompletionDate != nil {
		review.CompletionDate = req.CompletionDate
	}
	if req.Notes != "" {
		review.Notes = req.Notes
	}
	if req.SelfReviewCompleted != nil {
		review.SelfReviewCompleted = *req.SelfReviewCompleted
	}
	if req.ManagerReviewCompleted != nil {
		review.ManagerReviewCompleted = *req.ManagerReviewCompleted
	}

	// Set completion date if status changes to completed
	if req.Status == "completed" && review.CompletionDate == nil {
		now := time.Now()
		review.CompletionDate = &now
	}

	err = s.performanceRepo.UpdatePerformanceReview(ctx, review)
	if err != nil {
		return nil, err
	}

	return s.GetPerformanceReviewWithDetails(ctx, id)
}

func (s *performanceReviewService) DeletePerformanceReview(ctx context.Context, id string) error {
	return s.performanceRepo.DeletePerformanceReview(ctx, id)
}

func (s *performanceReviewService) GetPerformanceReviewWithDetails(ctx context.Context, id string) (*dto.PerformanceReviewResponse, error) {
	review, err := s.performanceRepo.GetPerformanceReviewWithDetails(ctx, id)
	if err != nil {
		return nil, err
	}

	return s.mapToResponseWithDetails(review), nil
}

func (s *performanceReviewService) GetPerformanceReviewsByEmployee(ctx context.Context, employeeID string) ([]*dto.PerformanceReviewResponse, error) {
	reviews, err := s.performanceRepo.GetPerformanceReviewsByEmployee(ctx, employeeID)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.PerformanceReviewResponse, len(reviews))
	for i, review := range reviews {
		responses[i] = s.mapToResponse(review)
	}

	return responses, nil
}

func (s *performanceReviewService) GetPerformanceReviewsByPeriod(ctx context.Context, period string) ([]*dto.PerformanceReviewResponse, error) {
	reviews, err := s.performanceRepo.GetPerformanceReviewsByPeriod(ctx, period)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.PerformanceReviewResponse, len(reviews))
	for i, review := range reviews {
		responses[i] = s.mapToResponse(review)
	}

	return responses, nil
}

func (s *performanceReviewService) GetPerformanceReviewsByStatus(ctx context.Context, status string) ([]*dto.PerformanceReviewResponse, error) {
	reviews, err := s.performanceRepo.GetPerformanceReviewsByStatus(ctx, status)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.PerformanceReviewResponse, len(reviews))
	for i, review := range reviews {
		responses[i] = s.mapToResponse(review)
	}

	return responses, nil
}

func (s *performanceReviewService) GetPerformanceStatistics(ctx context.Context, filters map[string]interface{}) (*dto.PerformanceStatisticsResponse, error) {
	stats, err := s.performanceRepo.GetPerformanceStatistics(ctx, filters)
	if err != nil {
		return nil, err
	}

	response := &dto.PerformanceStatisticsResponse{
		TotalReviews:     int(stats["total_reviews"].(int64)),
		CompletedReviews: int(stats["completed_reviews"].(int64)),
		PendingReviews:   int(stats["pending_reviews"].(int64)),
		OverdueReviews:   int(stats["overdue_reviews"].(int64)),
		DraftReviews:     int(stats["draft_reviews"].(int64)),
		AverageScore:     stats["average_score"].(float64),
		HighPerformers:   int(stats["high_performers"].(int64)),
		CompletionRate:   stats["completion_rate"].(float64),
	}

	return response, nil
}

func (s *performanceReviewService) GetReviewCycles(ctx context.Context) ([]*entities.PerformanceReviewCycle, error) {
	return s.performanceRepo.GetAllReviewCycles(ctx)
}

func (s *performanceReviewService) GetPerformanceGoals(ctx context.Context) ([]*entities.PerformanceGoal, error) {
	return s.performanceRepo.GetAllPerformanceGoals(ctx)
}

func (s *performanceReviewService) GetCompetencies(ctx context.Context) ([]*entities.Competency, error) {
	return s.performanceRepo.GetAllCompetencies(ctx)
}

// Helper methods
func (s *performanceReviewService) mapToResponse(review *entities.PerformanceReview) *dto.PerformanceReviewResponse {
	response := &dto.PerformanceReviewResponse{
		ID:                     review.ID,
		EmployeeID:             review.EmployeeID,
		ReviewPeriod:           review.ReviewPeriod,
		OverallScore:           review.OverallScore,
		Status:                 review.Status,
		ReviewDate:             review.ReviewDate,
		SubmissionDate:         review.SubmissionDate,
		CompletionDate:         review.CompletionDate,
		Notes:                  review.Notes,
		SelfReviewCompleted:    review.SelfReviewCompleted,
		ManagerReviewCompleted: review.ManagerReviewCompleted,
		LastUpdated:            review.UpdatedAt,
	}

	// Set employee details
	if review.Employee.ID != uuid.Nil {
		response.EmployeeName = review.Employee.EmployeeName
		response.EmployeeCode = review.Employee.EmployeeCode
		response.Department = review.Employee.Department
		response.Position = review.Employee.Position
	}

	// Set reviewer name
	if review.Reviewer.ID != uuid.Nil {
		response.Reviewer = review.Reviewer.EmployeeName
	}

	// Set review type from cycle
	if review.ReviewCycle.ID != "" {
		response.ReviewType = review.ReviewCycle.ReviewType
	}

	return response
}

func (s *performanceReviewService) mapToResponseWithDetails(review *entities.PerformanceReview) *dto.PerformanceReviewResponse {
	response := s.mapToResponse(review)

	// Add goals summary and details
	response.Goals = dto.PerformanceGoalsSummary{
		Achieved: 0,
		Total:    len(review.Goals),
	}

	goalDetails := make([]dto.PerformanceReviewGoalResponse, len(review.Goals))
	for i, goal := range review.Goals {
		if goal.IsAchieved {
			response.Goals.Achieved++
		}

		goalDetails[i] = dto.PerformanceReviewGoalResponse{
			ID:                    goal.ID,
			GoalID:                goal.GoalID,
			TargetValue:           goal.TargetValue,
			ActualValue:           goal.ActualValue,
			AchievementPercentage: goal.AchievementPercentage,
			IsAchieved:            goal.IsAchieved,
			Comments:              goal.Comments,
		}

		if goal.Goal.ID != "" {
			goalDetails[i].GoalTitle = goal.Goal.Title
			goalDetails[i].GoalCategory = goal.Goal.Category
		}
	}
	response.GoalDetails = goalDetails

	// Add competencies summary and details
	response.Competencies = dto.PerformanceCompetenciesSummary{}
	competencyDetails := make([]dto.PerformanceCompetencyResponse, len(review.Competencies))

	for i, comp := range review.Competencies {
		competencyDetails[i] = dto.PerformanceCompetencyResponse{
			ID:              comp.ID,
			CompetencyID:    comp.CompetencyID,
			SelfScore:       comp.SelfScore,
			ManagerScore:    comp.ManagerScore,
			FinalScore:      comp.FinalScore,
			SelfComments:    comp.SelfComments,
			ManagerComments: comp.ManagerComments,
		}

		if comp.Competency.ID != "" {
			competencyDetails[i].CompetencyName = comp.Competency.Name
			competencyDetails[i].Category = comp.Competency.Category

			// Map competency scores to summary based on category
			switch comp.Competency.Category {
			case "Technical":
				response.Competencies.Technical = comp.FinalScore
			case "Communication":
				response.Competencies.Communication = comp.FinalScore
			case "Leadership":
				response.Competencies.Leadership = comp.FinalScore
			case "Teamwork":
				response.Competencies.Teamwork = comp.FinalScore
			case "Problem Solving":
				response.Competencies.ProblemSolving = comp.FinalScore
			}
		}
	}
	response.CompetencyDetails = competencyDetails

	return response
}