package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/repositories"
	"malaka/internal/shared/types"
)

// RFQService handles RFQ business logic
type RFQService struct {
	rfqRepo repositories.RFQRepository
}

// NewRFQService creates a new RFQ service
func NewRFQService(rfqRepo repositories.RFQRepository) *RFQService {
	return &RFQService{
		rfqRepo: rfqRepo,
	}
}

// CreateRFQ creates a new RFQ with validation
func (s *RFQService) CreateRFQ(ctx context.Context, req *CreateRFQRequest) (*entities.RFQ, error) {
	if err := s.validateCreateRFQRequest(req); err != nil {
		return nil, err
	}

	rfq := &entities.RFQ{
		BaseModel: types.BaseModel{
			ID:        uuid.New().String(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		RFQNumber:   s.generateRFQNumber(),
		Title:       req.Title,
		Description: req.Description,
		Status:      "draft",
		Priority:    req.Priority,
		CreatedBy:   req.CreatedBy,
		DueDate:     req.DueDate,
	}

	if err := s.rfqRepo.Create(ctx, rfq); err != nil {
		return nil, fmt.Errorf("failed to create RFQ: %w", err)
	}

	// Create RFQ items
	for _, itemReq := range req.Items {
		item := &entities.RFQItem{
			BaseModel: types.BaseModel{
				ID:        uuid.New().String(),
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			RFQID:         rfq.ID,
			ItemName:      itemReq.ItemName,
			Description:   itemReq.Description,
			Specification: itemReq.Specification,
			Quantity:      itemReq.Quantity,
			Unit:          itemReq.Unit,
			TargetPrice:   itemReq.TargetPrice,
		}

		if err := s.rfqRepo.CreateItem(ctx, item); err != nil {
			return nil, fmt.Errorf("failed to create RFQ item: %w", err)
		}
	}

	// Invite suppliers if provided
	for _, supplierID := range req.SupplierIDs {
		rfqSupplier := &entities.RFQSupplier{
			BaseModel: types.BaseModel{
				ID:        uuid.New().String(),
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			RFQID:      rfq.ID,
			SupplierID: supplierID,
			InvitedAt:  time.Now(),
			Status:     "invited",
		}

		if err := s.rfqRepo.InviteSupplier(ctx, rfqSupplier); err != nil {
			return nil, fmt.Errorf("failed to invite supplier: %w", err)
		}
	}

	// Return the created RFQ with related data
	return s.rfqRepo.GetByID(ctx, rfq.ID)
}

// GetRFQ retrieves an RFQ by ID
func (s *RFQService) GetRFQ(ctx context.Context, id string) (*entities.RFQ, error) {
	if id == "" {
		return nil, fmt.Errorf("RFQ ID is required")
	}

	rfq, err := s.rfqRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return nil, fmt.Errorf("RFQ not found")
	}

	return rfq, nil
}

// GetAllRFQs retrieves all RFQs with optional filtering
func (s *RFQService) GetAllRFQs(ctx context.Context, filter *RFQFilter) ([]*entities.RFQ, error) {
	if filter != nil && filter.Status != "" {
		return s.rfqRepo.GetByStatus(ctx, filter.Status)
	}
	if filter != nil && filter.CreatedBy != "" {
		return s.rfqRepo.GetByCreatedBy(ctx, filter.CreatedBy)
	}

	return s.rfqRepo.GetAll(ctx)
}

// UpdateRFQ updates an existing RFQ
func (s *RFQService) UpdateRFQ(ctx context.Context, id string, req *UpdateRFQRequest) (*entities.RFQ, error) {
	rfq, err := s.rfqRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return nil, fmt.Errorf("RFQ not found")
	}

	// Only allow updates to draft RFQs
	if rfq.Status != "draft" {
		return nil, fmt.Errorf("can only update RFQs in draft status")
	}

	// Update fields
	if req.Title != "" {
		rfq.Title = req.Title
	}
	if req.Description != "" {
		rfq.Description = req.Description
	}
	if req.Priority != "" {
		rfq.Priority = req.Priority
	}
	if req.DueDate != nil {
		rfq.DueDate = req.DueDate
	}
	rfq.UpdatedAt = time.Now()

	if err := s.rfqRepo.Update(ctx, rfq); err != nil {
		return nil, fmt.Errorf("failed to update RFQ: %w", err)
	}

	return s.rfqRepo.GetByID(ctx, id)
}

// PublishRFQ publishes an RFQ
func (s *RFQService) PublishRFQ(ctx context.Context, id string) (*entities.RFQ, error) {
	rfq, err := s.rfqRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return nil, fmt.Errorf("RFQ not found")
	}

	if rfq.Status != "draft" {
		return nil, fmt.Errorf("can only publish RFQs in draft status")
	}

	// Validate RFQ is ready for publishing
	if len(rfq.Items) == 0 {
		return nil, fmt.Errorf("RFQ must have at least one item to be published")
	}
	if len(rfq.Suppliers) == 0 {
		return nil, fmt.Errorf("RFQ must have at least one invited supplier to be published")
	}

	if err := s.rfqRepo.PublishRFQ(ctx, id); err != nil {
		return nil, fmt.Errorf("failed to publish RFQ: %w", err)
	}

	return s.rfqRepo.GetByID(ctx, id)
}

// CloseRFQ closes an RFQ
func (s *RFQService) CloseRFQ(ctx context.Context, id string) (*entities.RFQ, error) {
	rfq, err := s.rfqRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return nil, fmt.Errorf("RFQ not found")
	}

	if rfq.Status != "published" {
		return nil, fmt.Errorf("can only close published RFQs")
	}

	if err := s.rfqRepo.CloseRFQ(ctx, id); err != nil {
		return nil, fmt.Errorf("failed to close RFQ: %w", err)
	}

	return s.rfqRepo.GetByID(ctx, id)
}

// AddRFQItem adds an item to an RFQ
func (s *RFQService) AddRFQItem(ctx context.Context, rfqID string, req *CreateRFQItemRequest) (*entities.RFQItem, error) {
	rfq, err := s.rfqRepo.GetByID(ctx, rfqID)
	if err != nil {
		return nil, fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return nil, fmt.Errorf("RFQ not found")
	}

	if rfq.Status != "draft" {
		return nil, fmt.Errorf("can only add items to draft RFQs")
	}

	item := &entities.RFQItem{
		BaseModel: types.BaseModel{
			ID:        uuid.New().String(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		RFQID:         rfqID,
		ItemName:      req.ItemName,
		Description:   req.Description,
		Specification: req.Specification,
		Quantity:      req.Quantity,
		Unit:          req.Unit,
		TargetPrice:   req.TargetPrice,
	}

	if err := s.rfqRepo.CreateItem(ctx, item); err != nil {
		return nil, fmt.Errorf("failed to create RFQ item: %w", err)
	}

	return item, nil
}

// InviteSupplier invites a supplier to an RFQ
func (s *RFQService) InviteSupplier(ctx context.Context, rfqID, supplierID string) error {
	rfq, err := s.rfqRepo.GetByID(ctx, rfqID)
	if err != nil {
		return fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return fmt.Errorf("RFQ not found")
	}

	if rfq.Status == "closed" || rfq.Status == "cancelled" {
		return fmt.Errorf("cannot invite suppliers to closed or cancelled RFQs")
	}

	rfqSupplier := &entities.RFQSupplier{
		BaseModel: types.BaseModel{
			ID:        uuid.New().String(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		RFQID:      rfqID,
		SupplierID: supplierID,
		InvitedAt:  time.Now(),
		Status:     "invited",
	}

	if err := s.rfqRepo.InviteSupplier(ctx, rfqSupplier); err != nil {
		return fmt.Errorf("failed to invite supplier: %w", err)
	}

	return nil
}

// GetRFQStats retrieves RFQ statistics
func (s *RFQService) GetRFQStats(ctx context.Context) (map[string]interface{}, error) {
	return s.rfqRepo.GetRFQStats(ctx)
}

// generateRFQNumber generates a unique RFQ number
func (s *RFQService) generateRFQNumber() string {
	now := time.Now()
	return fmt.Sprintf("RFQ-%d-%03d", now.Year(), now.YearDay())
}

// validateCreateRFQRequest validates create RFQ request
func (s *RFQService) validateCreateRFQRequest(req *CreateRFQRequest) error {
	if req.Title == "" {
		return fmt.Errorf("title is required")
	}
	if req.CreatedBy == "" {
		return fmt.Errorf("created_by is required")
	}
	if req.Priority == "" {
		req.Priority = "medium"
	}
	if req.Priority != "low" && req.Priority != "medium" && req.Priority != "high" && req.Priority != "urgent" {
		return fmt.Errorf("priority must be one of: low, medium, high, urgent")
	}
	if len(req.Items) == 0 {
		return fmt.Errorf("at least one item is required")
	}

	for i, item := range req.Items {
		if item.ItemName == "" {
			return fmt.Errorf("item %d: item_name is required", i+1)
		}
		if item.Quantity <= 0 {
			return fmt.Errorf("item %d: quantity must be greater than 0", i+1)
		}
		if item.Unit == "" {
			item.Unit = "pcs"
		}
	}

	return nil
}

// Request DTOs
type CreateRFQRequest struct {
	Title       string                  `json:"title"`
	Description string                  `json:"description"`
	Priority    string                  `json:"priority"`
	CreatedBy   string                  `json:"created_by"`
	DueDate     *time.Time              `json:"due_date"`
	Items       []*CreateRFQItemRequest `json:"items"`
	SupplierIDs []string                `json:"supplier_ids"`
}

type CreateRFQItemRequest struct {
	ItemName      string  `json:"item_name"`
	Description   string  `json:"description"`
	Specification string  `json:"specification"`
	Quantity      int     `json:"quantity"`
	Unit          string  `json:"unit"`
	TargetPrice   float64 `json:"target_price"`
}

type UpdateRFQRequest struct {
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Priority    string     `json:"priority"`
	DueDate     *time.Time `json:"due_date"`
}

type RFQFilter struct {
	Status    string `json:"status"`
	CreatedBy string `json:"created_by"`
}