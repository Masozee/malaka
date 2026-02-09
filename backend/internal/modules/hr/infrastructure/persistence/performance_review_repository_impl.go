package persistence

import (
	"context"

	"gorm.io/gorm"
	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/modules/hr/domain/repositories"
	"malaka/internal/shared/uuid"
)

type performanceReviewRepository struct {
	db *gorm.DB
}

func NewPerformanceReviewRepository(db *gorm.DB) repositories.PerformanceReviewRepository {
	return &performanceReviewRepository{db: db}
}

// Performance Review CRUD
func (r *performanceReviewRepository) CreatePerformanceReview(ctx context.Context, review *entities.PerformanceReview) error {
	return r.db.WithContext(ctx).Create(review).Error
}

func (r *performanceReviewRepository) GetPerformanceReviewByID(ctx context.Context, id uuid.ID) (*entities.PerformanceReview, error) {
	var review entities.PerformanceReview
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&review).Error
	if err != nil {
		return nil, err
	}
	return &review, nil
}

func (r *performanceReviewRepository) GetAllPerformanceReviews(ctx context.Context, filters map[string]interface{}) ([]*entities.PerformanceReview, error) {
	var reviews []*entities.PerformanceReview
	query := r.db.WithContext(ctx)

	// Apply filters
	if status, exists := filters["status"]; exists {
		query = query.Where("status = ?", status)
	}
	if employeeID, exists := filters["employee_id"]; exists {
		query = query.Where("employee_id = ?", employeeID)
	}
	if period, exists := filters["review_period"]; exists {
		query = query.Where("review_period = ?", period)
	}

	// Join with employee data
	err := query.Preload("Employee").
		Preload("ReviewCycle").
		Preload("Reviewer").
		Preload("Goals").
		Preload("Goals.Goal").
		Preload("Competencies").
		Preload("Competencies.Competency").
		Order("completion_date DESC NULLS LAST").
		Find(&reviews).Error

	return reviews, err
}

func (r *performanceReviewRepository) UpdatePerformanceReview(ctx context.Context, review *entities.PerformanceReview) error {
	return r.db.WithContext(ctx).Save(review).Error
}

func (r *performanceReviewRepository) DeletePerformanceReview(ctx context.Context, id uuid.ID) error {
	return r.db.WithContext(ctx).Delete(&entities.PerformanceReview{}, "id = ?", id).Error
}

// Performance Review with relationships
func (r *performanceReviewRepository) GetPerformanceReviewWithDetails(ctx context.Context, id uuid.ID) (*entities.PerformanceReview, error) {
	var review entities.PerformanceReview
	err := r.db.WithContext(ctx).
		Preload("Employee").
		Preload("ReviewCycle").
		Preload("Reviewer").
		Preload("Goals").
		Preload("Goals.Goal").
		Preload("Competencies").
		Preload("Competencies.Competency").
		Where("id = ?", id).
		First(&review).Error

	if err != nil {
		return nil, err
	}
	return &review, nil
}

func (r *performanceReviewRepository) GetPerformanceReviewsByEmployee(ctx context.Context, employeeID uuid.ID) ([]*entities.PerformanceReview, error) {
	var reviews []*entities.PerformanceReview
	err := r.db.WithContext(ctx).
		Preload("Employee").
		Preload("ReviewCycle").
		Preload("Reviewer").
		Where("employee_id = ?", employeeID).
		Order("completion_date DESC NULLS LAST").
		Find(&reviews).Error

	return reviews, err
}

func (r *performanceReviewRepository) GetPerformanceReviewsByPeriod(ctx context.Context, period string) ([]*entities.PerformanceReview, error) {
	var reviews []*entities.PerformanceReview
	err := r.db.WithContext(ctx).
		Preload("Employee").
		Preload("ReviewCycle").
		Preload("Reviewer").
		Where("review_period = ?", period).
		Order("completion_date DESC NULLS LAST").
		Find(&reviews).Error

	return reviews, err
}

func (r *performanceReviewRepository) GetPerformanceReviewsByStatus(ctx context.Context, status string) ([]*entities.PerformanceReview, error) {
	var reviews []*entities.PerformanceReview
	err := r.db.WithContext(ctx).
		Preload("Employee").
		Preload("ReviewCycle").
		Preload("Reviewer").
		Where("status = ?", status).
		Order("completion_date DESC NULLS LAST").
		Find(&reviews).Error

	return reviews, err
}

// Performance Review Cycles
func (r *performanceReviewRepository) GetAllReviewCycles(ctx context.Context) ([]*entities.PerformanceReviewCycle, error) {
	var cycles []*entities.PerformanceReviewCycle
	err := r.db.WithContext(ctx).
		Where("is_active = ?", true).
		Order("start_date DESC").
		Find(&cycles).Error

	return cycles, err
}

func (r *performanceReviewRepository) GetReviewCycleByID(ctx context.Context, id uuid.ID) (*entities.PerformanceReviewCycle, error) {
	var cycle entities.PerformanceReviewCycle
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&cycle).Error
	if err != nil {
		return nil, err
	}
	return &cycle, nil
}

// Performance Goals
func (r *performanceReviewRepository) GetAllPerformanceGoals(ctx context.Context) ([]*entities.PerformanceGoal, error) {
	var goals []*entities.PerformanceGoal
	err := r.db.WithContext(ctx).
		Where("is_active = ?", true).
		Order("category, title").
		Find(&goals).Error

	return goals, err
}

func (r *performanceReviewRepository) GetPerformanceGoalByID(ctx context.Context, id uuid.ID) (*entities.PerformanceGoal, error) {
	var goal entities.PerformanceGoal
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&goal).Error
	if err != nil {
		return nil, err
	}
	return &goal, nil
}

func (r *performanceReviewRepository) GetReviewGoalsByReview(ctx context.Context, reviewID uuid.ID) ([]*entities.PerformanceReviewGoal, error) {
	var reviewGoals []*entities.PerformanceReviewGoal
	err := r.db.WithContext(ctx).
		Preload("Goal").
		Where("performance_review_id = ?", reviewID).
		Find(&reviewGoals).Error

	return reviewGoals, err
}

// Competencies
func (r *performanceReviewRepository) GetAllCompetencies(ctx context.Context) ([]*entities.Competency, error) {
	var competencies []*entities.Competency
	err := r.db.WithContext(ctx).
		Where("is_active = ?", true).
		Order("category, name").
		Find(&competencies).Error

	return competencies, err
}

func (r *performanceReviewRepository) GetCompetencyByID(ctx context.Context, id uuid.ID) (*entities.Competency, error) {
	var competency entities.Competency
	err := r.db.WithContext(ctx).Where("id = ?", id).First(&competency).Error
	if err != nil {
		return nil, err
	}
	return &competency, nil
}

func (r *performanceReviewRepository) GetCompetencyEvaluationsByReview(ctx context.Context, reviewID uuid.ID) ([]*entities.PerformanceCompetencyEvaluation, error) {
	var evaluations []*entities.PerformanceCompetencyEvaluation
	err := r.db.WithContext(ctx).
		Preload("Competency").
		Where("performance_review_id = ?", reviewID).
		Find(&evaluations).Error

	return evaluations, err
}

// Statistics
func (r *performanceReviewRepository) GetPerformanceStatistics(ctx context.Context, filters map[string]interface{}) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	query := r.db.WithContext(ctx).Model(&entities.PerformanceReview{})

	// Apply filters
	if employeeID, exists := filters["employee_id"]; exists {
		query = query.Where("employee_id = ?", employeeID)
	}
	if period, exists := filters["review_period"]; exists {
		query = query.Where("review_period = ?", period)
	}

	// Total reviews
	var totalReviews int64
	query.Count(&totalReviews)
	stats["total_reviews"] = totalReviews

	// Reviews by status
	statusCounts := make(map[string]int64)
	rows, err := query.Select("status, COUNT(*) as count").Group("status").Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var status string
		var count int64
		rows.Scan(&status, &count)
		statusCounts[status] = count
	}

	stats["completed_reviews"] = statusCounts["completed"]
	stats["pending_reviews"] = statusCounts["pending"]
	stats["overdue_reviews"] = statusCounts["overdue"]
	stats["draft_reviews"] = statusCounts["draft"]

	// Average score
	var avgScore float64
	query.Select("AVG(overall_score)").Where("overall_score IS NOT NULL").Row().Scan(&avgScore)
	stats["average_score"] = avgScore

	// High performers (score >= 4.5)
	var highPerformers int64
	query.Where("overall_score >= ?", 4.5).Count(&highPerformers)
	stats["high_performers"] = highPerformers

	// Completion rate
	completedCount := statusCounts["completed"]
	completionRate := float64(0)
	if totalReviews > 0 {
		completionRate = float64(completedCount) / float64(totalReviews) * 100
	}
	stats["completion_rate"] = completionRate

	return stats, nil
}

func (r *performanceReviewRepository) CountReviewsByStatus(ctx context.Context, status string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.PerformanceReview{}).Where("status = ?", status).Count(&count).Error
	return count, err
}

func (r *performanceReviewRepository) GetAverageScore(ctx context.Context, filters map[string]interface{}) (float64, error) {
	var avgScore float64
	query := r.db.WithContext(ctx).Model(&entities.PerformanceReview{}).Where("overall_score IS NOT NULL")

	// Apply filters
	if employeeID, exists := filters["employee_id"]; exists {
		query = query.Where("employee_id = ?", employeeID)
	}
	if period, exists := filters["review_period"]; exists {
		query = query.Where("review_period = ?", period)
	}

	err := query.Select("AVG(overall_score)").Row().Scan(&avgScore)
	return avgScore, err
}