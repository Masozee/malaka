package services

import (
	"context"
	"errors"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/repositories"
	"malaka/internal/shared/uuid"
)

// GoodsReceiptService provides business logic for goods receipt operations.
type GoodsReceiptService struct {
	repo repositories.GoodsReceiptRepository
}

// NewGoodsReceiptService creates a new GoodsReceiptService.
func NewGoodsReceiptService(repo repositories.GoodsReceiptRepository) *GoodsReceiptService {
	return &GoodsReceiptService{repo: repo}
}

// PostGoodsReceiptResult contains the result of posting a GR
type PostGoodsReceiptResult struct {
	GoodsReceipt *entities.GoodsReceipt
	// JournalEntryID will be set by the handler after creating the journal entry
}

// CreateGoodsReceipt creates a new goods receipt.
func (s *GoodsReceiptService) CreateGoodsReceipt(ctx context.Context, gr *entities.GoodsReceipt) error {
	if gr.ID.IsNil() {
		gr.ID = uuid.New()
	}
	return s.repo.Create(ctx, gr)
}

// GetGoodsReceiptByID retrieves a goods receipt by its ID.
func (s *GoodsReceiptService) GetGoodsReceiptByID(ctx context.Context, id string) (*entities.GoodsReceipt, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAllGoodsReceipts retrieves all goods receipts.
func (s *GoodsReceiptService) GetAllGoodsReceipts(ctx context.Context) ([]*entities.GoodsReceipt, error) {
	return s.repo.GetAll(ctx)
}

// UpdateGoodsReceipt updates an existing goods receipt.
func (s *GoodsReceiptService) UpdateGoodsReceipt(ctx context.Context, gr *entities.GoodsReceipt) error {
	// Ensure the goods receipt exists before updating
	existingGR, err := s.repo.GetByID(ctx, gr.ID.String())
	if err != nil {
		return err
	}
	if existingGR == nil {
		return errors.New("goods receipt not found")
	}
	return s.repo.Update(ctx, gr)
}

// DeleteGoodsReceipt deletes a goods receipt by its ID.
func (s *GoodsReceiptService) DeleteGoodsReceipt(ctx context.Context, id string) error {
	// Ensure the goods receipt exists before deleting
	existingGR, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingGR == nil {
		return errors.New("goods receipt not found")
	}
	return s.repo.Delete(ctx, id)
}

// GetAllGoodsReceiptsWithDetails retrieves all goods receipts with complete related information
func (s *GoodsReceiptService) GetAllGoodsReceiptsWithDetails(ctx context.Context) ([]map[string]interface{}, error) {
	return s.repo.GetAllWithDetails(ctx)
}

// GetGoodsReceiptByIDWithDetails retrieves a goods receipt by ID with complete related information
func (s *GoodsReceiptService) GetGoodsReceiptByIDWithDetails(ctx context.Context, id string) (map[string]interface{}, error) {
	return s.repo.GetByIDWithDetails(ctx, id)
}

// PostGoodsReceipt posts a goods receipt and marks it as POSTED
// Returns the updated GR that needs to have a journal entry created
func (s *GoodsReceiptService) PostGoodsReceipt(ctx context.Context, id string, userID string) (*entities.GoodsReceipt, error) {
	// Get the goods receipt
	gr, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if gr == nil {
		return nil, errors.New("goods receipt not found")
	}

	// Validate it can be posted
	if gr.Status != entities.GoodsReceiptStatusDraft {
		return nil, errors.New("only draft goods receipts can be posted")
	}

	// Mark as posted
	gr.Post(userID)

	// Update in database
	if err := s.repo.Update(ctx, gr); err != nil {
		return nil, err
	}

	return gr, nil
}

// SetJournalEntryID updates the GR with the created journal entry ID
func (s *GoodsReceiptService) SetJournalEntryID(ctx context.Context, grID string, journalEntryID string) error {
	gr, err := s.repo.GetByID(ctx, grID)
	if err != nil {
		return err
	}
	if gr == nil {
		return errors.New("goods receipt not found")
	}

	gr.JournalEntryID = &journalEntryID
	return s.repo.Update(ctx, gr)
}
