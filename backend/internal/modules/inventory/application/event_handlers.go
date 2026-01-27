package application

import (
	"context"
	"fmt"
	"log"

	"malaka/internal/shared/events"
)

// InventoryEventHandler handles events from other modules that affect Inventory
type InventoryEventHandler struct {
	// Add service dependencies here as needed
	// stockService *services.StockService
	// grService    *services.GoodsReceiptService
}

// NewInventoryEventHandler creates a new inventory event handler
func NewInventoryEventHandler() *InventoryEventHandler {
	return &InventoryEventHandler{}
}

// RegisterHandlers registers all event handlers with the event bus
func (h *InventoryEventHandler) RegisterHandlers(bus events.EventBus) {
	// Subscribe to Procurement events
	bus.Subscribe(events.EventTypePOApproved, h.HandlePOApproved)
	bus.Subscribe(events.EventTypePOCancelled, h.HandlePOCancelled)

	// Subscribe to Finance events
	bus.Subscribe(events.EventTypeAPCreated, h.HandleAPCreated)

	log.Println("Inventory event handlers registered")
}

// HandlePOApproved handles the PO approved event from Procurement
// This creates an expected incoming stock record for the warehouse
func (h *InventoryEventHandler) HandlePOApproved(ctx context.Context, event events.Event) error {
	poEvent, ok := event.(*events.PurchaseOrderApprovedEvent)
	if !ok {
		return fmt.Errorf("invalid event type for PO approved handler")
	}

	log.Printf("[Inventory] PO Approved: %s from %s, expecting %d items, total: %.2f %s",
		poEvent.PONumber,
		poEvent.SupplierName,
		len(poEvent.Items),
		poEvent.TotalAmount,
		poEvent.Currency,
	)

	// TODO: Implement expected incoming stock tracking
	// This could involve:
	// 1. Creating a "pending receipt" record
	// 2. Updating inventory forecasting
	// 3. Notifying warehouse staff

	// For now, just log the event
	for _, item := range poEvent.Items {
		log.Printf("[Inventory]   - Item: %s, Qty: %d %s, Price: %.2f",
			item.ItemName, item.Quantity, item.Unit, item.UnitPrice)
	}

	return nil
}

// HandlePOCancelled handles the PO cancelled event from Procurement
// This removes any expected incoming stock records
func (h *InventoryEventHandler) HandlePOCancelled(ctx context.Context, event events.Event) error {
	poEvent, ok := event.(*events.PurchaseOrderCancelledEvent)
	if !ok {
		return fmt.Errorf("invalid event type for PO cancelled handler")
	}

	log.Printf("[Inventory] PO Cancelled: %s, reason: %s",
		poEvent.PONumber,
		poEvent.CancelReason,
	)

	// TODO: Implement expected stock cancellation
	// 1. Remove pending receipt records
	// 2. Update inventory forecasting
	// 3. Notify warehouse staff

	return nil
}

// HandleAPCreated handles the AP created event from Finance
// This links the GR to the AP for tracking
func (h *InventoryEventHandler) HandleAPCreated(ctx context.Context, event events.Event) error {
	apEvent, ok := event.(*events.APCreatedEvent)
	if !ok {
		return fmt.Errorf("invalid event type for AP created handler")
	}

	log.Printf("[Inventory] AP Created: %s for GR: %s, PO: %s, amount: %.2f",
		apEvent.APNumber,
		apEvent.GRNumber,
		apEvent.PONumber,
		apEvent.Amount,
	)

	// TODO: Update GR to mark AP as created
	// This confirms the financial side is complete

	return nil
}
