package services

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"malaka/internal/modules/procurement/domain/entities"
	"malaka/internal/modules/procurement/domain/repositories"
	"malaka/internal/shared/utils"
)

// RFQService handles RFQ business logic
type RFQService struct {
	repo   repositories.RFQRepository
	poRepo repositories.PurchaseOrderRepository
}

// NewRFQService creates a new RFQ service
func NewRFQService(repo repositories.RFQRepository) *RFQService {
	return &RFQService{
		repo: repo,
	}
}

// SetPurchaseOrderRepository sets the purchase order repository for RFQ to PO conversion
func (s *RFQService) SetPurchaseOrderRepository(poRepo repositories.PurchaseOrderRepository) {
	s.poRepo = poRepo
}

// Create creates a new RFQ with items and optional supplier invitations
func (s *RFQService) Create(ctx context.Context, rfq *entities.RFQ) error {
	// Validate request
	if rfq.Title == "" {
		return fmt.Errorf("title is required")
	}
	if rfq.CreatedBy == "" {
		return fmt.Errorf("created_by is required")
	}
	if rfq.Priority == "" {
		rfq.Priority = "medium"
	}

	// Generate RFQ number
	rfqNumber, err := s.repo.GenerateRFQNumber(ctx)
	if err != nil {
		return fmt.Errorf("failed to generate RFQ number: %w", err)
	}

	// Set defaults
	now := utils.Now()
	if rfq.ID == "" {
		rfq.ID = uuid.New().String()
	}
	rfq.RFQNumber = rfqNumber
	rfq.Status = "draft"
	rfq.CreatedAt = now
	rfq.UpdatedAt = now

	// Create the RFQ
	if err := s.repo.Create(ctx, rfq); err != nil {
		return fmt.Errorf("failed to create RFQ: %w", err)
	}

	// Create items
	for _, item := range rfq.Items {
		item.RFQID = rfq.ID
		if item.ID == "" {
			item.ID = uuid.New().String()
		}
		item.CreatedAt = now
		item.UpdatedAt = now

		if err := s.repo.CreateItem(ctx, item); err != nil {
			return fmt.Errorf("failed to create RFQ item: %w", err)
		}
	}

	// Invite suppliers if provided
	for _, supplier := range rfq.Suppliers {
		supplier.RFQID = rfq.ID
		if supplier.ID == "" {
			supplier.ID = uuid.New().String()
		}
		supplier.InvitedAt = now
		supplier.Status = "invited"
		supplier.CreatedAt = now
		supplier.UpdatedAt = now

		if err := s.repo.InviteSupplier(ctx, supplier); err != nil {
			return fmt.Errorf("failed to invite supplier: %w", err)
		}
	}

	return nil
}

// GetByID retrieves an RFQ by its ID
func (s *RFQService) GetByID(ctx context.Context, id string) (*entities.RFQ, error) {
	if id == "" {
		return nil, fmt.Errorf("RFQ ID is required")
	}

	rfq, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return nil, fmt.Errorf("RFQ not found")
	}

	return rfq, nil
}

// GetAll retrieves all RFQs with filters
func (s *RFQService) GetAll(ctx context.Context, filter *repositories.RFQFilter) ([]*entities.RFQ, int64, error) {
	return s.repo.GetAll(ctx, filter)
}

// Update updates an existing RFQ (only drafts)
func (s *RFQService) Update(ctx context.Context, rfq *entities.RFQ) error {
	existing, err := s.repo.GetByID(ctx, rfq.ID)
	if err != nil {
		return fmt.Errorf("failed to get RFQ: %w", err)
	}
	if existing == nil {
		return fmt.Errorf("RFQ not found")
	}

	// Only allow updates to draft RFQs
	if existing.Status != "draft" {
		return fmt.Errorf("can only update RFQs in draft status")
	}

	return s.repo.Update(ctx, rfq)
}

// Delete soft-deletes an RFQ
func (s *RFQService) Delete(ctx context.Context, id string) error {
	rfq, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return fmt.Errorf("RFQ not found")
	}

	// Only allow deleting draft or cancelled RFQs
	if rfq.Status != "draft" && rfq.Status != "cancelled" {
		return fmt.Errorf("can only delete draft or cancelled RFQs")
	}

	return s.repo.Delete(ctx, id)
}

// Publish publishes an RFQ to invited suppliers
func (s *RFQService) Publish(ctx context.Context, id string) (*entities.RFQ, error) {
	rfq, err := s.repo.GetByID(ctx, id)
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

	if err := s.repo.PublishRFQ(ctx, id); err != nil {
		return nil, fmt.Errorf("failed to publish RFQ: %w", err)
	}

	return s.repo.GetByID(ctx, id)
}

// Close closes an RFQ (typically after selecting a winner)
func (s *RFQService) Close(ctx context.Context, id string) (*entities.RFQ, error) {
	rfq, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return nil, fmt.Errorf("RFQ not found")
	}

	if rfq.Status != "published" {
		return nil, fmt.Errorf("can only close published RFQs")
	}

	if err := s.repo.CloseRFQ(ctx, id); err != nil {
		return nil, fmt.Errorf("failed to close RFQ: %w", err)
	}

	return s.repo.GetByID(ctx, id)
}

// Cancel cancels an RFQ
func (s *RFQService) Cancel(ctx context.Context, id string) (*entities.RFQ, error) {
	rfq, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return nil, fmt.Errorf("RFQ not found")
	}

	if rfq.Status == "closed" || rfq.Status == "cancelled" {
		return nil, fmt.Errorf("RFQ is already %s", rfq.Status)
	}

	if err := s.repo.CancelRFQ(ctx, id); err != nil {
		return nil, fmt.Errorf("failed to cancel RFQ: %w", err)
	}

	return s.repo.GetByID(ctx, id)
}

// AddItem adds an item to a draft RFQ
func (s *RFQService) AddItem(ctx context.Context, item *entities.RFQItem) error {
	rfq, err := s.repo.GetByID(ctx, item.RFQID)
	if err != nil {
		return fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return fmt.Errorf("RFQ not found")
	}

	if rfq.Status != "draft" {
		return fmt.Errorf("can only add items to draft RFQs")
	}

	now := utils.Now()
	if item.ID == "" {
		item.ID = uuid.New().String()
	}
	item.CreatedAt = now
	item.UpdatedAt = now

	return s.repo.CreateItem(ctx, item)
}

// UpdateItem updates an item in a draft RFQ
func (s *RFQService) UpdateItem(ctx context.Context, item *entities.RFQItem) error {
	rfq, err := s.repo.GetByID(ctx, item.RFQID)
	if err != nil {
		return fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return fmt.Errorf("RFQ not found")
	}

	if rfq.Status != "draft" {
		return fmt.Errorf("can only update items in draft RFQs")
	}

	return s.repo.UpdateItem(ctx, item)
}

// DeleteItem removes an item from a draft RFQ
func (s *RFQService) DeleteItem(ctx context.Context, rfqID, itemID string) error {
	rfq, err := s.repo.GetByID(ctx, rfqID)
	if err != nil {
		return fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return fmt.Errorf("RFQ not found")
	}

	if rfq.Status != "draft" {
		return fmt.Errorf("can only delete items from draft RFQs")
	}

	return s.repo.DeleteItem(ctx, itemID)
}

// InviteSupplier invites a supplier to an RFQ
func (s *RFQService) InviteSupplier(ctx context.Context, rfqID, supplierID string) error {
	rfq, err := s.repo.GetByID(ctx, rfqID)
	if err != nil {
		return fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return fmt.Errorf("RFQ not found")
	}

	if rfq.Status == "closed" || rfq.Status == "cancelled" {
		return fmt.Errorf("cannot invite suppliers to closed or cancelled RFQs")
	}

	// Check if supplier already invited
	for _, s := range rfq.Suppliers {
		if s.SupplierID == supplierID {
			return fmt.Errorf("supplier already invited to this RFQ")
		}
	}

	supplier := entities.NewRFQSupplier(rfqID, supplierID)
	return s.repo.InviteSupplier(ctx, supplier)
}

// RemoveSupplier removes a supplier from a draft RFQ
func (s *RFQService) RemoveSupplier(ctx context.Context, rfqID, supplierID string) error {
	rfq, err := s.repo.GetByID(ctx, rfqID)
	if err != nil {
		return fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return fmt.Errorf("RFQ not found")
	}

	if rfq.Status != "draft" {
		return fmt.Errorf("can only remove suppliers from draft RFQs")
	}

	return s.repo.RemoveSupplier(ctx, rfqID, supplierID)
}

// SubmitResponse submits a supplier's response to an RFQ
func (s *RFQService) SubmitResponse(ctx context.Context, response *entities.RFQResponse) error {
	rfq, err := s.repo.GetByID(ctx, response.RFQID)
	if err != nil {
		return fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return fmt.Errorf("RFQ not found")
	}

	if rfq.Status != "published" {
		return fmt.Errorf("can only submit responses to published RFQs")
	}

	// Check if supplier is invited
	supplierInvited := false
	for _, s := range rfq.Suppliers {
		if s.SupplierID == response.SupplierID {
			supplierInvited = true
			break
		}
	}
	if !supplierInvited {
		return fmt.Errorf("supplier is not invited to this RFQ")
	}

	// Check if supplier already responded
	existing, err := s.repo.GetResponseBySupplier(ctx, response.RFQID, response.SupplierID)
	if err != nil {
		return fmt.Errorf("failed to check existing response: %w", err)
	}
	if existing != nil {
		return fmt.Errorf("supplier has already submitted a response to this RFQ")
	}

	now := utils.Now()
	if response.ID == "" {
		response.ID = uuid.New().String()
	}
	response.ResponseDate = now
	response.Status = "submitted"
	response.CreatedAt = now
	response.UpdatedAt = now

	if err := s.repo.CreateResponse(ctx, response); err != nil {
		return fmt.Errorf("failed to create response: %w", err)
	}

	// Create response items
	for _, item := range response.ResponseItems {
		item.RFQResponseID = response.ID
		if item.ID == "" {
			item.ID = uuid.New().String()
		}
		item.CreatedAt = now
		item.UpdatedAt = now

		if err := s.repo.CreateResponseItem(ctx, item); err != nil {
			return fmt.Errorf("failed to create response item: %w", err)
		}
	}

	// Update supplier status to responded
	if err := s.repo.UpdateSupplierStatus(ctx, response.RFQID, response.SupplierID, "responded"); err != nil {
		return fmt.Errorf("failed to update supplier status: %w", err)
	}

	return nil
}

// GetResponse retrieves an RFQ response by ID
func (s *RFQService) GetResponse(ctx context.Context, responseID string) (*entities.RFQResponse, error) {
	return s.repo.GetResponseByID(ctx, responseID)
}

// AcceptResponse accepts an RFQ response (marks it as winner)
func (s *RFQService) AcceptResponse(ctx context.Context, responseID string) (*entities.RFQResponse, error) {
	response, err := s.repo.GetResponseByID(ctx, responseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get response: %w", err)
	}
	if response == nil {
		return nil, fmt.Errorf("response not found")
	}

	rfq, err := s.repo.GetByID(ctx, response.RFQID)
	if err != nil {
		return nil, fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return nil, fmt.Errorf("RFQ not found")
	}

	if rfq.Status != "published" {
		return nil, fmt.Errorf("can only accept responses for published RFQs")
	}

	if err := s.repo.AcceptResponse(ctx, responseID); err != nil {
		return nil, fmt.Errorf("failed to accept response: %w", err)
	}

	return s.repo.GetResponseByID(ctx, responseID)
}

// RejectResponse rejects an RFQ response
func (s *RFQService) RejectResponse(ctx context.Context, responseID, reason string) (*entities.RFQResponse, error) {
	response, err := s.repo.GetResponseByID(ctx, responseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get response: %w", err)
	}
	if response == nil {
		return nil, fmt.Errorf("response not found")
	}

	if err := s.repo.RejectResponse(ctx, responseID, reason); err != nil {
		return nil, fmt.Errorf("failed to reject response: %w", err)
	}

	return s.repo.GetResponseByID(ctx, responseID)
}

// ConvertToPO converts an accepted RFQ response to a Purchase Order
func (s *RFQService) ConvertToPO(ctx context.Context, responseID, createdBy, deliveryAddress, paymentTerms string) (*entities.PurchaseOrder, error) {
	if s.poRepo == nil {
		return nil, fmt.Errorf("purchase order repository not configured")
	}

	response, err := s.repo.GetResponseByID(ctx, responseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get response: %w", err)
	}
	if response == nil {
		return nil, fmt.Errorf("response not found")
	}

	if response.Status != "accepted" {
		return nil, fmt.Errorf("can only convert accepted responses to PO")
	}

	rfq, err := s.repo.GetByID(ctx, response.RFQID)
	if err != nil {
		return nil, fmt.Errorf("failed to get RFQ: %w", err)
	}
	if rfq == nil {
		return nil, fmt.Errorf("RFQ not found")
	}

	// Generate PO number
	poNumber, err := s.poRepo.GetNextPONumber(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to generate PO number: %w", err)
	}

	// Create Purchase Order from RFQ response
	po := entities.NewPurchaseOrder(response.SupplierID, createdBy)
	po.PONumber = poNumber
	po.TotalAmount = response.TotalAmount
	po.Currency = response.Currency
	po.DeliveryAddress = deliveryAddress
	po.PaymentTerms = paymentTerms

	// Create PO items from RFQ items
	// If response items have detailed pricing, use them
	// Otherwise, distribute the response total amount across items
	hasResponseItems := len(response.ResponseItems) > 0
	itemCount := len(rfq.Items)

	for i, rfqItem := range rfq.Items {
		// Find corresponding response item for pricing
		var unitPrice, lineTotal float64
		foundPricing := false

		if hasResponseItems {
			for _, respItem := range response.ResponseItems {
				if respItem.RFQItemID == rfqItem.ID {
					unitPrice = respItem.UnitPrice
					lineTotal = respItem.TotalPrice
					foundPricing = true
					break
				}
			}
		}

		// If no pricing found in response items but response has total,
		// distribute the total across items based on quantity
		if !foundPricing && response.TotalAmount > 0 && itemCount > 0 {
			// Simple distribution: equal share per item
			lineTotal = response.TotalAmount / float64(itemCount)
			if rfqItem.Quantity > 0 {
				unitPrice = lineTotal / float64(rfqItem.Quantity)
			} else {
				unitPrice = lineTotal
			}
			// Round to avoid floating point issues
			unitPrice = float64(int64(unitPrice*100)) / 100
			lineTotal = float64(int64(lineTotal*100)) / 100

			// Last item gets remainder to ensure total matches
			if i == itemCount-1 {
				var otherItemsTotal float64
				for j := 0; j < i; j++ {
					otherItemsTotal += po.Items[j].LineTotal
				}
				lineTotal = response.TotalAmount - otherItemsTotal
				if rfqItem.Quantity > 0 {
					unitPrice = lineTotal / float64(rfqItem.Quantity)
				}
			}
		}

		poItem := entities.NewPurchaseOrderItem(po.ID)
		poItem.ItemName = rfqItem.ItemName
		poItem.Description = rfqItem.Description
		poItem.Specification = rfqItem.Specification
		poItem.Quantity = rfqItem.Quantity
		poItem.Unit = rfqItem.Unit
		poItem.UnitPrice = unitPrice
		poItem.LineTotal = lineTotal
		poItem.Currency = response.Currency

		po.Items = append(po.Items, *poItem)
	}

	// Calculate totals from items
	po.CalculateTotals()

	// If calculated total is 0 but response had a total, use response total
	// This handles cases where response items didn't have individual pricing
	if po.TotalAmount == 0 && response.TotalAmount > 0 {
		po.Subtotal = response.TotalAmount
		po.TotalAmount = response.TotalAmount
	}

	// Create the PO
	if err := s.poRepo.Create(ctx, po); err != nil {
		return nil, fmt.Errorf("failed to create purchase order: %w", err)
	}

	return po, nil
}

// GetStats retrieves RFQ statistics
func (s *RFQService) GetStats(ctx context.Context) (map[string]interface{}, error) {
	return s.repo.GetRFQStats(ctx)
}
