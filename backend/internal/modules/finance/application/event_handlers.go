package application

import (
	"context"
	"fmt"
	"log"
	"time"

	"malaka/internal/shared/events"
	"malaka/internal/shared/integration"
)

// FinanceEventHandler handles events from other modules that affect Finance
type FinanceEventHandler struct {
	budgetService integration.BudgetWriter
	eventBus      events.EventBus
	// apService *services.AccountsPayableService // Add when available
}

// NewFinanceEventHandler creates a new finance event handler
func NewFinanceEventHandler(budgetService integration.BudgetWriter, eventBus events.EventBus) *FinanceEventHandler {
	return &FinanceEventHandler{
		budgetService: budgetService,
		eventBus:      eventBus,
	}
}

// RegisterHandlers registers all event handlers with the event bus
func (h *FinanceEventHandler) RegisterHandlers(bus events.EventBus) {
	// Subscribe to Procurement events
	bus.Subscribe(events.EventTypePOApproved, h.HandlePOApproved)
	bus.Subscribe(events.EventTypePOCancelled, h.HandlePOCancelled)

	// Subscribe to Inventory events
	bus.Subscribe(events.EventTypeGRPosted, h.HandleGRPosted)
	bus.Subscribe(events.EventTypeGRCancelled, h.HandleGRCancelled)

	log.Println("Finance event handlers registered")
}

// HandlePOApproved handles the PO approved event from Procurement
// This is handled by Procurement service itself (budget commitment)
// Finance just logs for audit trail
func (h *FinanceEventHandler) HandlePOApproved(ctx context.Context, event events.Event) error {
	poEvent, ok := event.(*events.PurchaseOrderApprovedEvent)
	if !ok {
		return fmt.Errorf("invalid event type for PO approved handler")
	}

	log.Printf("[Finance] PO Approved received: %s, amount: %.2f %s, type: %s",
		poEvent.PONumber,
		poEvent.TotalAmount,
		poEvent.Currency,
		poEvent.ProcurementType,
	)

	// Budget commitment is handled by Procurement service
	// This is just for audit/logging purposes

	return nil
}

// HandlePOCancelled handles the PO cancelled event from Procurement
// This releases any budget commitment
func (h *FinanceEventHandler) HandlePOCancelled(ctx context.Context, event events.Event) error {
	poEvent, ok := event.(*events.PurchaseOrderCancelledEvent)
	if !ok {
		return fmt.Errorf("invalid event type for PO cancelled handler")
	}

	log.Printf("[Finance] PO Cancelled: %s, releasing budget commitment",
		poEvent.PONumber,
	)

	// Note: Budget release is typically handled by Procurement service
	// when it calls BudgetWriter.ReleaseCommitment

	return nil
}

// HandleGRPosted handles the Goods Receipt posted event from Inventory
// This triggers AP creation and budget realization
func (h *FinanceEventHandler) HandleGRPosted(ctx context.Context, event events.Event) error {
	grEvent, ok := event.(*events.GoodsReceiptPostedEvent)
	if !ok {
		return fmt.Errorf("invalid event type for GR posted handler")
	}

	log.Printf("[Finance] GR Posted: %s for PO: %s, supplier: %s, amount: %.2f %s",
		grEvent.GRNumber,
		grEvent.PONumber,
		grEvent.SupplierName,
		grEvent.TotalAmount,
		grEvent.Currency,
	)

	// 1. Create Accounts Payable
	apID, apNumber, err := h.createAccountsPayable(ctx, grEvent)
	if err != nil {
		log.Printf("[Finance] Failed to create AP for GR %s: %v", grEvent.GRNumber, err)
		// Don't fail the event - log and continue
	} else {
		log.Printf("[Finance] AP Created: %s for GR: %s", apNumber, grEvent.GRNumber)

		// Publish AP Created event
		if h.eventBus != nil {
			dueDate := h.calculateDueDate(grEvent.ReceiptDate, grEvent.PaymentTerms)
			apCreatedEvent := events.NewAPCreatedEvent(
				apID, apNumber,
				grEvent.GoodsReceiptID, grEvent.GRNumber,
				grEvent.PurchaseOrderID, grEvent.PONumber,
				grEvent.SupplierID, grEvent.SupplierName,
				grEvent.TotalAmount, grEvent.Currency,
				dueDate, grEvent.PostedBy,
			)
			h.eventBus.PublishAsync(ctx, apCreatedEvent)
		}
	}

	// 2. Realize budget (convert commitment to actual spending)
	// This requires knowing the budget and account from the PO
	// For now, just log
	log.Printf("[Finance] Budget realization pending for GR: %s, procurement type: %s",
		grEvent.GRNumber, grEvent.ProcurementType)

	return nil
}

// HandleGRCancelled handles the Goods Receipt cancelled event from Inventory
// This may require reversing AP if already created
func (h *FinanceEventHandler) HandleGRCancelled(ctx context.Context, event events.Event) error {
	grEvent, ok := event.(*events.GoodsReceiptCancelledEvent)
	if !ok {
		return fmt.Errorf("invalid event type for GR cancelled handler")
	}

	log.Printf("[Finance] GR Cancelled: %s for PO: %s, reason: %s",
		grEvent.GRNumber,
		grEvent.PurchaseOrderID,
		grEvent.Reason,
	)

	// TODO: Cancel/reverse AP if already created
	// TODO: Reverse budget realization if already done

	return nil
}

// createAccountsPayable creates an AP record for a goods receipt
func (h *FinanceEventHandler) createAccountsPayable(ctx context.Context, grEvent *events.GoodsReceiptPostedEvent) (string, string, error) {
	// TODO: Implement actual AP creation via AccountsPayableService
	// For now, return placeholder values

	apID := fmt.Sprintf("ap-%s", grEvent.GoodsReceiptID[:8])
	apNumber := fmt.Sprintf("AP-%s", time.Now().Format("20060102-150405"))

	log.Printf("[Finance] Would create AP: %s for GR: %s, amount: %.2f",
		apNumber, grEvent.GRNumber, grEvent.TotalAmount)

	return apID, apNumber, nil
}

// calculateDueDate calculates the AP due date based on payment terms
func (h *FinanceEventHandler) calculateDueDate(receiptDate time.Time, paymentTerms string) time.Time {
	// Parse payment terms (e.g., "NET30", "NET60", "COD")
	days := 30 // Default to NET30

	switch paymentTerms {
	case "COD", "Cash on Delivery":
		days = 0
	case "NET15":
		days = 15
	case "NET30":
		days = 30
	case "NET45":
		days = 45
	case "NET60":
		days = 60
	case "NET90":
		days = 90
	}

	return receiptDate.AddDate(0, 0, days)
}
