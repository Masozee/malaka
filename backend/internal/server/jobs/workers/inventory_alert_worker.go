package workers

import (
	"context"

	"go.uber.org/zap"

	"malaka/internal/modules/inventory/domain/services"
	"malaka/internal/modules/inventory/infrastructure/external"
)

// InventoryAlertWorker sends low stock alerts.
type InventoryAlertWorker struct {
	logger             *zap.Logger
	stockService       *services.StockService
	emailService       external.EmailNotificationService
	lowStockThreshold int
}

// NewInventoryAlertWorker creates a new InventoryAlertWorker.
func NewInventoryAlertWorker(logger *zap.Logger, stockService *services.StockService, emailService external.EmailNotificationService, threshold int) *InventoryAlertWorker {
	return &InventoryAlertWorker{
		logger:             logger,
		stockService:       stockService,
		emailService:       emailService,
		lowStockThreshold: threshold,
	}
}

// Run performs the inventory alert task.
func (w *InventoryAlertWorker) Run(ctx context.Context) {
	w.logger.Info("Running inventory alert worker...")

	// In a real application, you would fetch all articles and their stock balances
	// across warehouses, then check against the lowStockThreshold.
	// For now, we'll simulate an alert.

	// Example: Check a dummy article's stock
	// articleID := "dummy_article_id"
	// warehouseID := "dummy_warehouse_id"
	// balance, err := w.stockService.GetStockBalance(ctx, articleID, warehouseID)
	// if err != nil {
	// 	w.logger.Error("Failed to get stock balance for alert", zap.Error(err))
	// 	return
	// }

	// if balance != nil && balance.Quantity < w.lowStockThreshold {
	// 	// Simulate sending an email alert
	// 	subject := fmt.Sprintf("Low Stock Alert for Article %s in Warehouse %s", articleID, warehouseID)
	// 	body := fmt.Sprintf("Current stock is %d, which is below the threshold of %d.", balance.Quantity, w.lowStockThreshold)
	// 	if err := w.emailService.SendEmail(ctx, "admin@example.com", subject, body); err != nil {
	// 		w.logger.Error("Failed to send low stock alert email", zap.Error(err))
	// 	}
	// 	w.logger.Warn(fmt.Sprintf("Low stock alert sent for article %s", articleID))
	// }

	w.logger.Info("Inventory alert worker finished.")
}
