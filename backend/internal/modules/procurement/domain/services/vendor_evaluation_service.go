package services

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"malaka/internal/modules/procurement/domain/entities"
	"malaka/internal/modules/procurement/domain/repositories"
	"malaka/internal/shared/utils"
)

// VendorEvaluationService provides business logic for vendor evaluation operations.
type VendorEvaluationService struct {
	repo repositories.VendorEvaluationRepository
}

// NewVendorEvaluationService creates a new VendorEvaluationService.
func NewVendorEvaluationService(repo repositories.VendorEvaluationRepository) *VendorEvaluationService {
	return &VendorEvaluationService{repo: repo}
}

// Create creates a new vendor evaluation.
func (s *VendorEvaluationService) Create(ctx context.Context, evaluation *entities.VendorEvaluation) error {
	if evaluation.ID == "" {
		evaluation.ID = uuid.New().String()
	}

	// Generate evaluation number
	if evaluation.EvaluationNumber == "" {
		number, err := s.repo.GetNextEvaluationNumber(ctx)
		if err != nil {
			return fmt.Errorf("failed to generate evaluation number: %w", err)
		}
		evaluation.EvaluationNumber = number
	}

	// Validate scores
	if !evaluation.ValidateScores() {
		return errors.New("all scores must be between 1 and 5")
	}

	// Calculate overall score and determine recommendation
	evaluation.CalculateOverallScore()
	evaluation.DetermineRecommendation()

	// Set defaults
	if evaluation.Status == "" {
		evaluation.Status = entities.VEStatusDraft
	}
	evaluation.CreatedAt = utils.Now()
	evaluation.UpdatedAt = utils.Now()

	return s.repo.Create(ctx, evaluation)
}

// GetByID retrieves a vendor evaluation by its ID.
func (s *VendorEvaluationService) GetByID(ctx context.Context, id string) (*entities.VendorEvaluation, error) {
	evaluation, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if evaluation == nil {
		return nil, errors.New("vendor evaluation not found")
	}
	return evaluation, nil
}

// GetAll retrieves all vendor evaluations with filters.
func (s *VendorEvaluationService) GetAll(ctx context.Context, filter *repositories.VendorEvaluationFilter) ([]*entities.VendorEvaluation, int, error) {
	if filter == nil {
		filter = &repositories.VendorEvaluationFilter{}
	}
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Limit <= 0 {
		filter.Limit = 10
	}
	return s.repo.GetAll(ctx, filter)
}

// Update updates an existing vendor evaluation.
func (s *VendorEvaluationService) Update(ctx context.Context, evaluation *entities.VendorEvaluation) error {
	existing, err := s.repo.GetByID(ctx, evaluation.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("vendor evaluation not found")
	}

	// Can only update draft evaluations
	if existing.Status != entities.VEStatusDraft {
		return errors.New("can only update evaluations in draft status")
	}

	// Validate scores
	if !evaluation.ValidateScores() {
		return errors.New("all scores must be between 1 and 5")
	}

	// Recalculate overall score and recommendation
	evaluation.CalculateOverallScore()
	evaluation.DetermineRecommendation()

	evaluation.UpdatedAt = utils.Now()

	return s.repo.Update(ctx, evaluation)
}

// Delete deletes a vendor evaluation.
func (s *VendorEvaluationService) Delete(ctx context.Context, id string) error {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("vendor evaluation not found")
	}

	// Can only delete draft evaluations
	if existing.Status != entities.VEStatusDraft {
		return errors.New("can only delete evaluations in draft status")
	}

	return s.repo.Delete(ctx, id)
}

// Complete marks a draft evaluation as completed.
func (s *VendorEvaluationService) Complete(ctx context.Context, id string) (*entities.VendorEvaluation, error) {
	evaluation, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if evaluation == nil {
		return nil, errors.New("vendor evaluation not found")
	}

	if !evaluation.CanBeCompleted() {
		return nil, errors.New("evaluation cannot be completed in current status")
	}

	// Recalculate final scores
	evaluation.CalculateOverallScore()
	evaluation.DetermineRecommendation()

	evaluation.Status = entities.VEStatusCompleted
	evaluation.UpdatedAt = utils.Now()

	if err := s.repo.Update(ctx, evaluation); err != nil {
		return nil, err
	}

	return evaluation, nil
}

// Approve approves a completed evaluation.
func (s *VendorEvaluationService) Approve(ctx context.Context, id string) (*entities.VendorEvaluation, error) {
	evaluation, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if evaluation == nil {
		return nil, errors.New("vendor evaluation not found")
	}

	if !evaluation.CanBeApproved() {
		return nil, errors.New("evaluation cannot be approved in current status")
	}

	evaluation.Status = entities.VEStatusApproved
	evaluation.UpdatedAt = utils.Now()

	if err := s.repo.Update(ctx, evaluation); err != nil {
		return nil, err
	}

	return evaluation, nil
}

// GetBySupplierID retrieves all evaluations for a supplier.
func (s *VendorEvaluationService) GetBySupplierID(ctx context.Context, supplierID string) ([]*entities.VendorEvaluation, error) {
	return s.repo.GetBySupplierID(ctx, supplierID)
}

// GetSupplierAverageScore retrieves the average overall score for a supplier.
func (s *VendorEvaluationService) GetSupplierAverageScore(ctx context.Context, supplierID string) (float64, error) {
	return s.repo.GetSupplierAverageScore(ctx, supplierID)
}

// GetStats retrieves vendor evaluation statistics.
func (s *VendorEvaluationService) GetStats(ctx context.Context) (*repositories.VendorEvaluationStats, error) {
	return s.repo.GetStats(ctx)
}
