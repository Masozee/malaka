package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"malaka/internal/modules/procurement/domain/entities"
	"malaka/internal/modules/procurement/domain/repositories"
	"malaka/internal/shared/auth"
	"malaka/internal/shared/events"
	"malaka/internal/shared/integration"
	"malaka/internal/shared/uuid"
)

// PurchaseOrderService handles business logic for purchase orders
type PurchaseOrderService struct {
	repo         repositories.PurchaseOrderRepository
	rbac         *auth.RBACService
	budgetReader integration.BudgetReader  // Optional: for budget availability checks
	budgetWriter integration.BudgetWriter  // Optional: for budget commitments
	eventBus     events.EventBus           // Optional: for event-driven integration
}

// NewPurchaseOrderService creates a new purchase order service
func NewPurchaseOrderService(repo repositories.PurchaseOrderRepository, rbac *auth.RBACService) *PurchaseOrderService {
	return &PurchaseOrderService{repo: repo, rbac: rbac}
}

// WithBudgetIntegration adds budget integration to the service
func (s *PurchaseOrderService) WithBudgetIntegration(reader integration.BudgetReader, writer integration.BudgetWriter) *PurchaseOrderService {
	s.budgetReader = reader
	s.budgetWriter = writer
	return s
}

// WithEventBus adds event bus for cross-module communication
func (s *PurchaseOrderService) WithEventBus(bus events.EventBus) *PurchaseOrderService {
	s.eventBus = bus
	return s
}

// Create creates a new purchase order
func (s *PurchaseOrderService) Create(ctx context.Context, order *entities.PurchaseOrder) error {
	// Generate PO number
	poNumber, err := s.repo.GetNextPONumber(ctx)
	if err != nil {
		return err
	}
	order.PONumber = poNumber

	// Set defaults
	if order.ID.IsNil() {
		order.ID = uuid.New()
	}
	if order.Status == "" {
		order.Status = entities.PurchaseOrderStatusDraft
	}
	if order.PaymentStatus == "" {
		order.PaymentStatus = entities.PurchaseOrderPaymentUnpaid
	}
	if order.Currency == "" {
		order.Currency = "IDR"
	}

	now := time.Now()
	order.OrderDate = now
	order.CreatedAt = now
	order.UpdatedAt = now

	// Process items
	for i := range order.Items {
		if order.Items[i].ID.IsNil() {
			order.Items[i].ID = uuid.New()
		}
		order.Items[i].PurchaseOrderID = order.ID
		order.Items[i].CalculateLineTotal()
		order.Items[i].CreatedAt = now
		order.Items[i].UpdatedAt = now
		if order.Items[i].Currency == "" {
			order.Items[i].Currency = order.Currency
		}
	}

	// Calculate totals
	order.CalculateTotals()

	return s.repo.Create(ctx, order)
}

// GetByID retrieves a purchase order by ID
func (s *PurchaseOrderService) GetByID(ctx context.Context, id string) (*entities.PurchaseOrder, error) {
	return s.repo.GetByID(ctx, id)
}

// GetAll retrieves all purchase orders with filtering
func (s *PurchaseOrderService) GetAll(ctx context.Context, filter repositories.PurchaseOrderFilter) (*repositories.PurchaseOrderListResult, error) {
	return s.repo.GetAll(ctx, filter)
}

// Update updates a purchase order
func (s *PurchaseOrderService) Update(ctx context.Context, order *entities.PurchaseOrder) error {
	existing, err := s.repo.GetByID(ctx, order.ID.String())
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("purchase order not found")
	}

	// Only allow updates to draft orders
	if existing.Status != entities.PurchaseOrderStatusDraft {
		return errors.New("can only update draft orders")
	}

	// Recalculate totals
	order.CalculateTotals()
	order.UpdatedAt = time.Now()

	return s.repo.Update(ctx, order)
}

// Delete deletes a purchase order
func (s *PurchaseOrderService) Delete(ctx context.Context, id string) error {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("purchase order not found")
	}

	// Only allow deletion of draft orders
	if existing.Status != entities.PurchaseOrderStatusDraft {
		return errors.New("can only delete draft orders")
	}

	return s.repo.Delete(ctx, id)
}

// SubmitForApproval submits a purchase order for approval
func (s *PurchaseOrderService) SubmitForApproval(ctx context.Context, id string) (*entities.PurchaseOrder, error) {
	order, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("purchase order not found")
	}

	if order.Status != entities.PurchaseOrderStatusDraft {
		return nil, errors.New("can only submit draft orders")
	}

	now := time.Now()
	order.Status = entities.PurchaseOrderStatusPending
	order.UpdatedAt = now

	if err := s.repo.Update(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

// Approve approves a purchase order
func (s *PurchaseOrderService) Approve(ctx context.Context, id, approverID string) (*entities.PurchaseOrder, error) {
	order, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("purchase order not found")
	}

	if order.Status != entities.PurchaseOrderStatusPending {
		return nil, errors.New("can only approve pending orders")
	}

	// RBAC Check: Approver must be authorized
	// We check if approver has higher authority than the creator
	canApprove, err := s.rbac.CanApprove(ctx, approverID, order.CreatedBy.String())
	if err != nil {
		return nil, fmt.Errorf("rbac check failed: %w", err)
	}
	if !canApprove {
		return nil, errors.New("approver does not have sufficient authority")
	}

	// Budget Check: If budget integration is configured, check availability and commit
	if s.budgetReader != nil && order.ExpenseAccountID != nil {
		// Check budget availability
		result, err := s.budgetReader.CheckAvailability(ctx, order.ExpenseAccountID.String(), order.TotalAmount)
		if err != nil {
			return nil, fmt.Errorf("budget check failed: %w", err)
		}
		if !result.IsAvailable {
			return nil, fmt.Errorf("insufficient budget: requested %.2f, available %.2f (shortfall: %.2f)",
				order.TotalAmount, result.AvailableAmount, result.ShortfallAmount)
		}

		// Commit budget if writer is available
		if s.budgetWriter != nil {
			commitResult, err := s.budgetWriter.CommitBudget(ctx, &integration.BudgetCommitmentRequest{
				BudgetID:        result.BudgetID,
				AccountID:       order.ExpenseAccountID.String(),
				Amount:          order.TotalAmount,
				ReferenceType:   "PURCHASE_ORDER",
				ReferenceID:     order.ID.String(),
				ReferenceNumber: order.PONumber,
				Description:     fmt.Sprintf("Budget commitment for PO %s - %s", order.PONumber, order.SupplierName),
				CommittedBy:     approverID,
			})
			if err != nil {
				return nil, fmt.Errorf("budget commitment failed: %w", err)
			}
			commitmentID, _ := uuid.Parse(commitResult.CommitmentID)
			order.BudgetCommitmentID = &commitmentID
		}
	}

	now := time.Now()
	order.Status = entities.PurchaseOrderStatusApproved
	approverUUID, _ := uuid.Parse(approverID)
	order.ApprovedBy = &approverUUID
	order.ApprovedAt = &now
	order.UpdatedAt = now

	if err := s.repo.Update(ctx, order); err != nil {
		return nil, err
	}

	// Publish PO Approved event for cross-module integration
	if s.eventBus != nil {
		items := make([]events.POItemEventData, len(order.Items))
		for i, item := range order.Items {
			items[i] = events.POItemEventData{
				ItemID:    item.ID.String(),
				ItemName:  item.ItemName,
				Quantity:  item.Quantity,
				Unit:      item.Unit,
				UnitPrice: item.UnitPrice,
				LineTotal: item.LineTotal,
			}
		}

		var expenseAccountIDStr *string
		if order.ExpenseAccountID != nil {
			s := order.ExpenseAccountID.String()
			expenseAccountIDStr = &s
		}

		event := events.NewPurchaseOrderApprovedEvent(
			order.ID.String(),
			order.PONumber,
			order.SupplierID.String(),
			order.SupplierName,
			order.TotalAmount,
			order.Currency,
			integration.ProcurementType(order.ProcurementType),
			approverID,
			items,
		)
		event.ExpectedDelivery = order.ExpectedDeliveryDate
		event.DeliveryAddress = order.DeliveryAddress
		event.PaymentTerms = order.PaymentTerms
		event.ExpenseAccountID = expenseAccountIDStr

		// Publish asynchronously to avoid blocking
		s.eventBus.PublishAsync(ctx, event)
	}

	return order, nil
}

// Send marks a purchase order as sent to supplier
func (s *PurchaseOrderService) Send(ctx context.Context, id string) (*entities.PurchaseOrder, error) {
	order, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("purchase order not found")
	}

	// Start of Approval Workflow: Must be Approved before Sending
	if order.Status != entities.PurchaseOrderStatusApproved {
		return nil, errors.New("can only send approved orders")
	}

	now := time.Now()
	order.Status = entities.PurchaseOrderStatusSent
	order.SentAt = &now
	order.UpdatedAt = now

	if err := s.repo.Update(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

// Confirm marks a purchase order as confirmed by supplier
func (s *PurchaseOrderService) Confirm(ctx context.Context, id string) (*entities.PurchaseOrder, error) {
	order, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("purchase order not found")
	}

	if order.Status != entities.PurchaseOrderStatusSent {
		return nil, errors.New("can only confirm sent orders")
	}

	now := time.Now()
	order.Status = entities.PurchaseOrderStatusConfirmed
	order.ConfirmedAt = &now
	order.UpdatedAt = now

	if err := s.repo.Update(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

// Ship marks a purchase order as shipped
func (s *PurchaseOrderService) Ship(ctx context.Context, id string) (*entities.PurchaseOrder, error) {
	order, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("purchase order not found")
	}

	if order.Status != entities.PurchaseOrderStatusConfirmed {
		return nil, errors.New("can only ship confirmed orders")
	}

	now := time.Now()
	order.Status = entities.PurchaseOrderStatusShipped
	order.UpdatedAt = now

	if err := s.repo.Update(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

// Receive marks a purchase order as received
func (s *PurchaseOrderService) Receive(ctx context.Context, id string, receivedItems []struct {
	ItemID   string
	Quantity int
}) (*entities.PurchaseOrder, error) {
	order, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("purchase order not found")
	}

	if order.Status != entities.PurchaseOrderStatusShipped && order.Status != entities.PurchaseOrderStatusConfirmed {
		return nil, errors.New("can only receive shipped or confirmed orders")
	}

	// Update received quantities
	for _, received := range receivedItems {
		for i := range order.Items {
			if order.Items[i].ID.String() == received.ItemID {
				order.Items[i].ReceivedQuantity = received.Quantity
				if err := s.repo.UpdateItem(ctx, &order.Items[i]); err != nil {
					return nil, err
				}
				break
			}
		}
	}

	now := time.Now()
	order.Status = entities.PurchaseOrderStatusReceived
	order.ReceivedAt = &now
	order.UpdatedAt = now

	if err := s.repo.Update(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

// Cancel cancels a purchase order
func (s *PurchaseOrderService) Cancel(ctx context.Context, id, reason string) (*entities.PurchaseOrder, error) {
	order, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("purchase order not found")
	}

	if order.Status == entities.PurchaseOrderStatusReceived || order.Status == entities.PurchaseOrderStatusCancelled {
		return nil, errors.New("cannot cancel received or already cancelled orders")
	}

	now := time.Now()
	order.Status = entities.PurchaseOrderStatusCancelled
	order.CancelledAt = &now
	order.CancelReason = reason
	order.UpdatedAt = now

	if err := s.repo.Update(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

// GetStats retrieves purchase order statistics
func (s *PurchaseOrderService) GetStats(ctx context.Context) (*repositories.PurchaseOrderStats, error) {
	return s.repo.GetStats(ctx)
}

// AddItem adds an item to a purchase order
func (s *PurchaseOrderService) AddItem(ctx context.Context, orderID string, item *entities.PurchaseOrderItem) error {
	order, err := s.repo.GetByID(ctx, orderID)
	if err != nil {
		return err
	}
	if order == nil {
		return errors.New("purchase order not found")
	}

	if order.Status != entities.PurchaseOrderStatusDraft {
		return errors.New("can only add items to draft orders")
	}

	if item.ID.IsNil() {
		item.ID = uuid.New()
	}
	item.PurchaseOrderID = order.ID
	item.CalculateLineTotal()

	now := time.Now()
	item.CreatedAt = now
	item.UpdatedAt = now

	if err := s.repo.AddItem(ctx, item); err != nil {
		return err
	}

	// Recalculate order totals
	order.Items = append(order.Items, *item)
	order.CalculateTotals()

	return s.repo.Update(ctx, order)
}

// DeleteItem deletes an item from a purchase order
func (s *PurchaseOrderService) DeleteItem(ctx context.Context, orderID, itemID string) error {
	order, err := s.repo.GetByID(ctx, orderID)
	if err != nil {
		return err
	}
	if order == nil {
		return errors.New("purchase order not found")
	}

	if order.Status != entities.PurchaseOrderStatusDraft {
		return errors.New("can only delete items from draft orders")
	}

	if err := s.repo.DeleteItem(ctx, orderID, itemID); err != nil {
		return err
	}

	// Recalculate order totals
	var newItems []entities.PurchaseOrderItem
	for _, item := range order.Items {
		if item.ID.String() != itemID {
			newItems = append(newItems, item)
		}
	}
	order.Items = newItems
	order.CalculateTotals()

	return s.repo.Update(ctx, order)
}
