package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"malaka/internal/modules/procurement/domain/entities"
	"malaka/internal/modules/procurement/domain/repositories"
	"malaka/internal/shared/utils"
	"malaka/internal/shared/uuid"
)

// PurchaseRequestService provides business logic for purchase request operations.
type PurchaseRequestService struct {
	repo   repositories.PurchaseRequestRepository
	poRepo repositories.PurchaseOrderRepository
}

// NewPurchaseRequestService creates a new PurchaseRequestService.
func NewPurchaseRequestService(repo repositories.PurchaseRequestRepository) *PurchaseRequestService {
	return &PurchaseRequestService{repo: repo}
}

// SetPurchaseOrderRepository sets the purchase order repository for conversion functionality.
func (s *PurchaseRequestService) SetPurchaseOrderRepository(poRepo repositories.PurchaseOrderRepository) {
	s.poRepo = poRepo
}

// Create creates a new purchase request.
func (s *PurchaseRequestService) Create(ctx context.Context, pr *entities.PurchaseRequest) error {
	if pr.ID.IsNil() {
		pr.ID = uuid.New()
	}

	// Generate request number
	if pr.RequestNumber == "" {
		number, err := s.repo.GetNextRequestNumber(ctx)
		if err != nil {
			return fmt.Errorf("failed to generate request number: %w", err)
		}
		pr.RequestNumber = number
	}

	// Set defaults
	if pr.Status == "" {
		pr.Status = entities.PRStatusDraft
	}
	if pr.Priority == "" {
		pr.Priority = entities.PRPriorityMedium
	}
	if pr.Currency == "" {
		pr.Currency = "IDR"
	}
	pr.RequestedDate = utils.Now()
	pr.CreatedAt = utils.Now()
	pr.UpdatedAt = utils.Now()

	// Calculate total from items
	pr.CalculateTotalAmount()

	return s.repo.Create(ctx, pr)
}

// GetByID retrieves a purchase request by its ID.
func (s *PurchaseRequestService) GetByID(ctx context.Context, id string) (*entities.PurchaseRequest, error) {
	pr, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if pr == nil {
		return nil, errors.New("purchase request not found")
	}

	// Load items
	items, err := s.repo.GetItemsByRequestID(ctx, id)
	if err != nil {
		return nil, err
	}
	pr.Items = items

	return pr, nil
}

// GetAll retrieves all purchase requests with filters.
func (s *PurchaseRequestService) GetAll(ctx context.Context, filter *repositories.PurchaseRequestFilter) ([]*entities.PurchaseRequest, int, error) {
	if filter == nil {
		filter = &repositories.PurchaseRequestFilter{}
	}
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Limit <= 0 {
		filter.Limit = 10
	}
	return s.repo.GetAll(ctx, filter)
}

// Update updates an existing purchase request.
func (s *PurchaseRequestService) Update(ctx context.Context, pr *entities.PurchaseRequest) error {
	existing, err := s.repo.GetByID(ctx, pr.ID.String())
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("purchase request not found")
	}

	// Can only update draft or rejected PRs
	if existing.Status != entities.PRStatusDraft && existing.Status != entities.PRStatusRejected {
		return errors.New("can only update purchase requests in draft or rejected status")
	}

	pr.UpdatedAt = utils.Now()
	pr.CalculateTotalAmount()

	return s.repo.Update(ctx, pr)
}

// Delete deletes a purchase request.
func (s *PurchaseRequestService) Delete(ctx context.Context, id string) error {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("purchase request not found")
	}

	// Can only delete draft PRs
	if existing.Status != entities.PRStatusDraft {
		return errors.New("can only delete purchase requests in draft status")
	}

	return s.repo.Delete(ctx, id)
}

// Submit submits a purchase request for approval.
func (s *PurchaseRequestService) Submit(ctx context.Context, id string) (*entities.PurchaseRequest, error) {
	pr, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if pr == nil {
		return nil, errors.New("purchase request not found")
	}

	if pr.Status != entities.PRStatusDraft {
		return nil, errors.New("can only submit purchase requests in draft status")
	}

	pr.Status = entities.PRStatusPending
	pr.UpdatedAt = utils.Now()

	if err := s.repo.Update(ctx, pr); err != nil {
		return nil, err
	}

	return pr, nil
}

// Approve approves a purchase request.
func (s *PurchaseRequestService) Approve(ctx context.Context, id string, approverID string) (*entities.PurchaseRequest, error) {
	pr, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if pr == nil {
		return nil, errors.New("purchase request not found")
	}

	if !pr.CanBeApproved() {
		return nil, errors.New("purchase request cannot be approved in current status")
	}

	now := utils.Now()
	pr.Status = entities.PRStatusApproved
	approverUUID, _ := uuid.Parse(approverID)
	pr.ApprovedBy = &approverUUID
	pr.ApprovedDate = &now
	pr.UpdatedAt = now

	if err := s.repo.Update(ctx, pr); err != nil {
		return nil, err
	}

	return pr, nil
}

// Reject rejects a purchase request.
func (s *PurchaseRequestService) Reject(ctx context.Context, id string, reason string) (*entities.PurchaseRequest, error) {
	pr, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if pr == nil {
		return nil, errors.New("purchase request not found")
	}

	if !pr.CanBeRejected() {
		return nil, errors.New("purchase request cannot be rejected in current status")
	}

	pr.Status = entities.PRStatusRejected
	pr.RejectionReason = &reason
	pr.UpdatedAt = utils.Now()

	if err := s.repo.Update(ctx, pr); err != nil {
		return nil, err
	}

	return pr, nil
}

// Cancel cancels a purchase request.
func (s *PurchaseRequestService) Cancel(ctx context.Context, id string) (*entities.PurchaseRequest, error) {
	pr, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if pr == nil {
		return nil, errors.New("purchase request not found")
	}

	if pr.Status == entities.PRStatusCancelled {
		return nil, errors.New("purchase request is already cancelled")
	}

	pr.Status = entities.PRStatusCancelled
	pr.UpdatedAt = utils.Now()

	if err := s.repo.Update(ctx, pr); err != nil {
		return nil, err
	}

	return pr, nil
}

// GetStats retrieves purchase request statistics.
func (s *PurchaseRequestService) GetStats(ctx context.Context) (*repositories.PurchaseRequestStats, error) {
	return s.repo.GetStats(ctx)
}

// AddItem adds an item to a purchase request.
func (s *PurchaseRequestService) AddItem(ctx context.Context, item *entities.PurchaseRequestItem) error {
	// Verify PR exists and is in draft status
	pr, err := s.repo.GetByID(ctx, item.PurchaseRequestID.String())
	if err != nil {
		return err
	}
	if pr == nil {
		return errors.New("purchase request not found")
	}
	if pr.Status != entities.PRStatusDraft {
		return errors.New("can only add items to draft purchase requests")
	}

	if item.ID.IsNil() {
		item.ID = uuid.New()
	}
	item.CreatedAt = utils.Now()
	item.UpdatedAt = utils.Now()

	if err := s.repo.CreateItem(ctx, item); err != nil {
		return err
	}

	// Recalculate total and update PR
	items, err := s.repo.GetItemsByRequestID(ctx, item.PurchaseRequestID.String())
	if err != nil {
		return err
	}
	pr.Items = items
	pr.CalculateTotalAmount()
	pr.UpdatedAt = utils.Now()

	return s.repo.Update(ctx, pr)
}

// UpdateItem updates an item in a purchase request.
func (s *PurchaseRequestService) UpdateItem(ctx context.Context, item *entities.PurchaseRequestItem) error {
	// Verify PR exists and is in draft status
	pr, err := s.repo.GetByID(ctx, item.PurchaseRequestID.String())
	if err != nil {
		return err
	}
	if pr == nil {
		return errors.New("purchase request not found")
	}
	if pr.Status != entities.PRStatusDraft {
		return errors.New("can only update items in draft purchase requests")
	}

	item.UpdatedAt = utils.Now()

	if err := s.repo.UpdateItem(ctx, item); err != nil {
		return err
	}

	// Recalculate total and update PR
	items, err := s.repo.GetItemsByRequestID(ctx, item.PurchaseRequestID.String())
	if err != nil {
		return err
	}
	pr.Items = items
	pr.CalculateTotalAmount()
	pr.UpdatedAt = utils.Now()

	return s.repo.Update(ctx, pr)
}

// DeleteItem deletes an item from a purchase request.
func (s *PurchaseRequestService) DeleteItem(ctx context.Context, prID, itemID string) error {
	// Verify PR exists and is in draft status
	pr, err := s.repo.GetByID(ctx, prID)
	if err != nil {
		return err
	}
	if pr == nil {
		return errors.New("purchase request not found")
	}
	if pr.Status != entities.PRStatusDraft {
		return errors.New("can only delete items from draft purchase requests")
	}

	if err := s.repo.DeleteItem(ctx, itemID); err != nil {
		return err
	}

	// Recalculate total and update PR
	items, err := s.repo.GetItemsByRequestID(ctx, prID)
	if err != nil {
		return err
	}
	pr.Items = items
	pr.CalculateTotalAmount()
	pr.UpdatedAt = time.Now().UTC()

	return s.repo.Update(ctx, pr)
}

// ConvertToPO converts an approved purchase request to a purchase order.
func (s *PurchaseRequestService) ConvertToPO(ctx context.Context, prID string, supplierID string, createdBy string, deliveryAddress string, paymentTerms string) (*entities.PurchaseOrder, error) {
	if s.poRepo == nil {
		return nil, errors.New("purchase order repository not configured")
	}

	// Get the purchase request with items
	pr, err := s.GetByID(ctx, prID)
	if err != nil {
		return nil, err
	}

	// Verify it can be converted
	if !pr.CanBeConverted() {
		return nil, errors.New("only approved purchase requests can be converted to purchase orders")
	}

	// Generate PO number
	poNumber, err := s.poRepo.GetNextPONumber(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to generate PO number: %w", err)
	}

	// Parse IDs
	supplierUUID, _ := uuid.Parse(supplierID)
	createdByUUID, _ := uuid.Parse(createdBy)
	prUUID := pr.ID

	// Create the purchase order
	now := utils.Now()
	po := &entities.PurchaseOrder{
		ID:                uuid.New(),
		PONumber:          poNumber,
		SupplierID:        supplierUUID,
		PurchaseRequestID: &prUUID,
		OrderDate:         now,
		DeliveryAddress:   deliveryAddress,
		PaymentTerms:      paymentTerms,
		Currency:          pr.Currency,
		Status:            entities.PurchaseOrderStatusDraft,
		PaymentStatus:     entities.PurchaseOrderPaymentUnpaid,
		CreatedBy:         createdByUUID,
		CreatedAt:         now,
		UpdatedAt:         now,
	}

	// Set expected delivery date from PR required date
	if pr.RequiredDate != nil {
		po.ExpectedDeliveryDate = pr.RequiredDate
	}

	// Convert PR items to PO items
	for _, prItem := range pr.Items {
		poItem := entities.PurchaseOrderItem{
			ID:              uuid.New(),
			PurchaseOrderID: po.ID,
			ItemName:        prItem.ItemName,
			Quantity:        prItem.Quantity,
			Unit:            prItem.Unit,
			UnitPrice:       prItem.EstimatedPrice,
			Currency:        prItem.Currency,
			CreatedAt:       now,
			UpdatedAt:       now,
		}
		if prItem.Description != nil {
			poItem.Description = *prItem.Description
		}
		if prItem.Specification != nil {
			poItem.Specification = *prItem.Specification
		}
		poItem.CalculateLineTotal()
		po.Items = append(po.Items, poItem)
	}

	// Calculate PO totals
	po.CalculateTotals()

	// Create the purchase order
	if err := s.poRepo.Create(ctx, po); err != nil {
		return nil, fmt.Errorf("failed to create purchase order: %w", err)
	}

	return po, nil
}
