package workers

import (
	"context"

	"go.uber.org/zap"

	"malaka/internal/modules/inventory/domain/services"
)

// ValuationWorker performs inventory valuation calculations.
type ValuationWorker struct {
	logger                  *zap.Logger
	inventoryValuationService *services.InventoryValuationService
}

// NewValuationWorker creates a new ValuationWorker.
func NewValuationWorker(logger *zap.Logger, ivService *services.InventoryValuationService) *ValuationWorker {
	return &ValuationWorker{
		logger:                  logger,
		inventoryValuationService: ivService,
	}
}

// Run performs the inventory valuation task.
func (w *ValuationWorker) Run(ctx context.Context) {
	w.logger.Info("Running inventory valuation worker...")

	// In a real application, you would iterate through articles and calculate their values.
	// For now, we'll just log a message.

	// Example: Calculate FIFO value for a dummy article
	// value, err := w.inventoryValuationService.CalculateFIFOValue(ctx, "dummy_article_id")
	// if err != nil {
	// 	w.logger.Error("Failed to calculate FIFO value", zap.Error(err))
	// 	return
	// }
	// w.logger.Info(fmt.Sprintf("Dummy article FIFO value: %.2f", value))

	w.logger.Info("Inventory valuation worker finished.")
}
