package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"malaka/internal/modules/production/domain/entities"
	"malaka/internal/modules/production/domain/repositories"
)

// ProductionPlanService defines the interface for production plan business logic
type ProductionPlanService interface {
	// CRUD operations
	CreatePlan(ctx context.Context, plan *entities.ProductionPlan) error
	GetPlan(ctx context.Context, id uuid.UUID) (*entities.ProductionPlan, error)
	GetPlanByNumber(ctx context.Context, planNumber string) (*entities.ProductionPlan, error)
	UpdatePlan(ctx context.Context, plan *entities.ProductionPlan) error
	DeletePlan(ctx context.Context, id uuid.UUID) error

	// List operations
	GetAllPlans(ctx context.Context, limit, offset int, search, status, planType string) ([]*entities.ProductionPlan, int, error)

	// Status management
	ApprovePlan(ctx context.Context, id uuid.UUID, approverID string) error
	ActivatePlan(ctx context.Context, id uuid.UUID) error
	CompletePlan(ctx context.Context, id uuid.UUID) error
	CancelPlan(ctx context.Context, id uuid.UUID, reason string) error

	// Item management
	AddItem(ctx context.Context, planID uuid.UUID, item *entities.ProductionPlanItem) error
	UpdateItem(ctx context.Context, item *entities.ProductionPlanItem) error
	DeleteItem(ctx context.Context, itemID uuid.UUID) error
	UpdateItemProgress(ctx context.Context, itemID uuid.UUID, producedQuantity int) error

	// Analytics
	GetStatistics(ctx context.Context) (*entities.ProductionPlanStatistics, error)
	GetActivePlans(ctx context.Context) ([]*entities.ProductionPlan, error)
	GetPlansByDateRange(ctx context.Context, startDate, endDate string) ([]*entities.ProductionPlan, error)

	// Utility
	GeneratePlanNumber(ctx context.Context) (string, error)
	ValidatePlan(ctx context.Context, plan *entities.ProductionPlan) error
}

// ProductionPlanServiceImpl provides business logic for production plan operations
type ProductionPlanServiceImpl struct {
	repo repositories.ProductionPlanRepository
}

// NewProductionPlanService creates a new production plan service
func NewProductionPlanService(repo repositories.ProductionPlanRepository) ProductionPlanService {
	return &ProductionPlanServiceImpl{
		repo: repo,
	}
}

// CreatePlan creates a new production plan
func (s *ProductionPlanServiceImpl) CreatePlan(ctx context.Context, plan *entities.ProductionPlan) error {
	// Validate the plan
	if err := s.ValidatePlan(ctx, plan); err != nil {
		return err
	}

	// Generate plan number if not provided
	if plan.PlanNumber == "" {
		planNumber, err := s.GeneratePlanNumber(ctx)
		if err != nil {
			return fmt.Errorf("failed to generate plan number: %w", err)
		}
		plan.PlanNumber = planNumber
	}

	// Check if plan number already exists
	exists, err := s.repo.ExistsPlanNumber(ctx, plan.PlanNumber)
	if err != nil {
		return fmt.Errorf("failed to check plan number: %w", err)
	}
	if exists {
		return fmt.Errorf("plan number %s already exists", plan.PlanNumber)
	}

	// Set initial status if not provided
	if plan.Status == "" {
		plan.Status = entities.PlanStatusDraft
	}

	// Calculate totals from items
	plan.CalculateTotals()

	return s.repo.Create(ctx, plan)
}

// GetPlan retrieves a production plan by ID
func (s *ProductionPlanServiceImpl) GetPlan(ctx context.Context, id uuid.UUID) (*entities.ProductionPlan, error) {
	return s.repo.GetByID(ctx, id)
}

// GetPlanByNumber retrieves a production plan by number
func (s *ProductionPlanServiceImpl) GetPlanByNumber(ctx context.Context, planNumber string) (*entities.ProductionPlan, error) {
	return s.repo.GetByPlanNumber(ctx, planNumber)
}

// UpdatePlan updates an existing production plan
func (s *ProductionPlanServiceImpl) UpdatePlan(ctx context.Context, plan *entities.ProductionPlan) error {
	// Verify the plan exists
	existingPlan, err := s.repo.GetByID(ctx, plan.ID)
	if err != nil {
		return err
	}
	if existingPlan == nil {
		return fmt.Errorf("production plan with ID %s not found", plan.ID)
	}

	// Only allow updating draft plans
	if existingPlan.Status != entities.PlanStatusDraft {
		return fmt.Errorf("cannot update plan with status %s, only draft plans can be modified", existingPlan.Status)
	}

	// Validate the plan
	if err := s.ValidatePlan(ctx, plan); err != nil {
		return err
	}

	// Check if plan number changed and already exists
	if plan.PlanNumber != existingPlan.PlanNumber {
		exists, err := s.repo.ExistsPlanNumber(ctx, plan.PlanNumber, plan.ID)
		if err != nil {
			return fmt.Errorf("failed to check plan number: %w", err)
		}
		if exists {
			return fmt.Errorf("plan number %s already exists", plan.PlanNumber)
		}
	}

	// Recalculate totals
	plan.CalculateTotals()

	return s.repo.Update(ctx, plan)
}

// DeletePlan deletes a production plan
func (s *ProductionPlanServiceImpl) DeletePlan(ctx context.Context, id uuid.UUID) error {
	// Verify the plan exists
	existingPlan, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingPlan == nil {
		return fmt.Errorf("production plan with ID %s not found", id)
	}

	// Only allow deleting draft or cancelled plans
	if existingPlan.Status != entities.PlanStatusDraft && existingPlan.Status != entities.PlanStatusCancelled {
		return fmt.Errorf("cannot delete plan with status %s", existingPlan.Status)
	}

	return s.repo.Delete(ctx, id)
}

// GetAllPlans retrieves all production plans with pagination
func (s *ProductionPlanServiceImpl) GetAllPlans(ctx context.Context, limit, offset int, search, status, planType string) ([]*entities.ProductionPlan, int, error) {
	return s.repo.GetAllWithPagination(ctx, limit, offset, search, status, planType)
}

// ApprovePlan approves a production plan
func (s *ProductionPlanServiceImpl) ApprovePlan(ctx context.Context, id uuid.UUID, approverID string) error {
	plan, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if !plan.CanApprove() {
		return fmt.Errorf("plan cannot be approved: status is %s or has no items", plan.Status)
	}

	plan.Status = entities.PlanStatusApproved
	plan.ApprovedBy = &approverID
	now := time.Now()
	plan.ApprovedAt = &now

	return s.repo.Update(ctx, plan)
}

// ActivatePlan activates an approved production plan
func (s *ProductionPlanServiceImpl) ActivatePlan(ctx context.Context, id uuid.UUID) error {
	plan, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if !plan.CanActivate() {
		return fmt.Errorf("plan cannot be activated: status must be approved, current status is %s", plan.Status)
	}

	plan.Status = entities.PlanStatusActive

	// Set all items to pending if not already set
	for i := range plan.Items {
		if plan.Items[i].Status == "" {
			plan.Items[i].Status = entities.PlanItemStatusPending
		}
	}

	return s.repo.Update(ctx, plan)
}

// CompletePlan marks a production plan as completed
func (s *ProductionPlanServiceImpl) CompletePlan(ctx context.Context, id uuid.UUID) error {
	plan, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if !plan.CanComplete() {
		return fmt.Errorf("plan cannot be completed: not all items are completed or status is %s", plan.Status)
	}

	plan.Status = entities.PlanStatusCompleted

	return s.repo.Update(ctx, plan)
}

// CancelPlan cancels a production plan
func (s *ProductionPlanServiceImpl) CancelPlan(ctx context.Context, id uuid.UUID, reason string) error {
	plan, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// Cannot cancel completed plans
	if plan.Status == entities.PlanStatusCompleted {
		return fmt.Errorf("cannot cancel a completed plan")
	}

	plan.Status = entities.PlanStatusCancelled
	plan.Notes = &reason

	return s.repo.Update(ctx, plan)
}

// Item management
func (s *ProductionPlanServiceImpl) AddItem(ctx context.Context, planID uuid.UUID, item *entities.ProductionPlanItem) error {
	// Verify the plan exists
	plan, err := s.repo.GetByID(ctx, planID)
	if err != nil {
		return err
	}
	if plan == nil {
		return fmt.Errorf("production plan with ID %s not found", planID)
	}

	// Only allow adding items to draft plans
	if plan.Status != entities.PlanStatusDraft {
		return fmt.Errorf("cannot add items to plan with status %s", plan.Status)
	}

	item.PlanID = planID
	item.Status = entities.PlanItemStatusPending

	if err := s.repo.AddItem(ctx, item); err != nil {
		return err
	}

	// Update plan totals
	plan.Items = append(plan.Items, *item)
	plan.CalculateTotals()
	return s.repo.Update(ctx, plan)
}

func (s *ProductionPlanServiceImpl) UpdateItem(ctx context.Context, item *entities.ProductionPlanItem) error {
	// Get the existing item to find the plan
	existingItem, err := s.repo.GetItemByID(ctx, item.ID)
	if err != nil {
		return err
	}

	// Get the plan to check status
	plan, err := s.repo.GetByID(ctx, existingItem.PlanID)
	if err != nil {
		return err
	}

	// Only allow updating items on draft or active plans
	if plan.Status != entities.PlanStatusDraft && plan.Status != entities.PlanStatusActive {
		return fmt.Errorf("cannot update items on plan with status %s", plan.Status)
	}

	item.PlanID = existingItem.PlanID
	return s.repo.UpdateItem(ctx, item)
}

func (s *ProductionPlanServiceImpl) DeleteItem(ctx context.Context, itemID uuid.UUID) error {
	// Get the item to find the plan
	item, err := s.repo.GetItemByID(ctx, itemID)
	if err != nil {
		return err
	}

	// Get the plan to check status
	plan, err := s.repo.GetByID(ctx, item.PlanID)
	if err != nil {
		return err
	}

	// Only allow deleting items from draft plans
	if plan.Status != entities.PlanStatusDraft {
		return fmt.Errorf("cannot delete items from plan with status %s", plan.Status)
	}

	if err := s.repo.DeleteItem(ctx, itemID); err != nil {
		return err
	}

	// Update plan totals
	items, _ := s.repo.GetItems(ctx, plan.ID)
	plan.Items = items
	plan.CalculateTotals()
	return s.repo.Update(ctx, plan)
}

func (s *ProductionPlanServiceImpl) UpdateItemProgress(ctx context.Context, itemID uuid.UUID, producedQuantity int) error {
	// Get the item to find the plan
	item, err := s.repo.GetItemByID(ctx, itemID)
	if err != nil {
		return err
	}

	// Get the plan to check status
	plan, err := s.repo.GetByID(ctx, item.PlanID)
	if err != nil {
		return err
	}

	// Only allow updating progress on active plans
	if plan.Status != entities.PlanStatusActive {
		return fmt.Errorf("cannot update progress on plan with status %s", plan.Status)
	}

	return s.repo.UpdateItemProgress(ctx, itemID, producedQuantity)
}

// Analytics
func (s *ProductionPlanServiceImpl) GetStatistics(ctx context.Context) (*entities.ProductionPlanStatistics, error) {
	return s.repo.GetStatistics(ctx)
}

func (s *ProductionPlanServiceImpl) GetActivePlans(ctx context.Context) ([]*entities.ProductionPlan, error) {
	return s.repo.GetActivePlans(ctx)
}

func (s *ProductionPlanServiceImpl) GetPlansByDateRange(ctx context.Context, startDate, endDate string) ([]*entities.ProductionPlan, error) {
	return s.repo.GetByDateRange(ctx, startDate, endDate)
}

// Utility
func (s *ProductionPlanServiceImpl) GeneratePlanNumber(ctx context.Context) (string, error) {
	nextNum, err := s.repo.GetNextPlanNumber(ctx)
	if err != nil {
		nextNum = 1
	}
	return fmt.Sprintf("PP-%06d", nextNum), nil
}

func (s *ProductionPlanServiceImpl) ValidatePlan(ctx context.Context, plan *entities.ProductionPlan) error {
	return plan.Validate()
}
