package handlers

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/inventory/domain/entities"
	"malaka/internal/modules/inventory/domain/services"
	"malaka/internal/modules/inventory/presentation/http/dto"
	notification_services "malaka/internal/modules/notifications/domain/services"
	"malaka/internal/shared/response"
	"malaka/internal/shared/types"
	"malaka/internal/shared/uuid"
)

// TransferHandler handles HTTP requests for stock transfer operations.
type TransferHandler struct {
	service             *services.TransferService
	db                  *sqlx.DB
	notificationService *notification_services.NotificationService
}

// NewTransferHandler creates a new TransferHandler.
func NewTransferHandler(service *services.TransferService, notificationService *notification_services.NotificationService) *TransferHandler {
	return &TransferHandler{
		service:             service,
		notificationService: notificationService,
	}
}

// SetDB sets the database connection for enriched queries.
func (h *TransferHandler) SetDB(db *sqlx.DB) {
	h.db = db
}

// getUsersWithPermission finds all users with a specific RBAC permission.
func (h *TransferHandler) getUsersWithPermission(permissionCode string) []uuid.ID {
	query := `
		SELECT DISTINCT u.id FROM users u
		JOIN user_roles ur ON ur.user_id = u.id
		JOIN role_permissions rp ON rp.role_id = ur.role_id
		JOIN permissions p ON p.id = rp.permission_id
		WHERE p.code = $1
		UNION
		SELECT DISTINCT u.id FROM users u
		JOIN user_permissions up ON up.user_id = u.id
		JOIN permissions p ON p.id = up.permission_id
		WHERE p.code = $1`
	var ids []uuid.ID
	_ = h.db.Select(&ids, query, permissionCode)
	return ids
}

// getUserName retrieves a user's display name.
func (h *TransferHandler) getUserName(userID string) string {
	var name string
	_ = h.db.QueryRow(`SELECT COALESCE(username, email) FROM users WHERE id = $1`, userID).Scan(&name)
	return name
}

// getDefaultUserID returns a fallback user ID for development.
func (h *TransferHandler) getDefaultUserID() (string, error) {
	var userID string
	err := h.db.QueryRow(`SELECT id FROM users WHERE status = 'active' LIMIT 1`).Scan(&userID)
	if err != nil {
		return "", fmt.Errorf("no active user found: %w", err)
	}
	return userID, nil
}

// getUserID extracts user ID from auth context with fallback.
func (h *TransferHandler) getUserID(c *gin.Context) string {
	userID := c.GetString("user_id")
	if userID == "" {
		defaultID, err := h.getDefaultUserID()
		if err != nil {
			return ""
		}
		userID = defaultID
	}
	return userID
}

// transferNumber generates a transfer number from the ID.
func transferNumber(id string) string {
	if len(id) >= 8 {
		return fmt.Sprintf("TRF-%s", id[len(id)-8:])
	}
	return fmt.Sprintf("TRF-%s", id)
}

// transferRow is used for scanning enriched list queries.
type transferRow struct {
	ID              string     `db:"id"`
	FromWarehouseID string     `db:"from_warehouse_id"`
	FromWarehouse   string     `db:"from_warehouse_name"`
	FromCode        string     `db:"from_warehouse_code"`
	ToWarehouseID   string     `db:"to_warehouse_id"`
	ToWarehouse     string     `db:"to_warehouse_name"`
	ToCode          string     `db:"to_warehouse_code"`
	OrderDate       time.Time  `db:"order_date"`
	Status          string     `db:"status"`
	Notes           string     `db:"notes"`
	TotalItems      int        `db:"total_items"`
	TotalQuantity   int        `db:"total_quantity"`
	ShippedDate     *time.Time `db:"shipped_date"`
	ReceivedDate    *time.Time `db:"received_date"`
	ApprovedDate    *time.Time `db:"approved_date"`
	CancelledDate   *time.Time `db:"cancelled_date"`
	ShippedBy       *string    `db:"shipped_by"`
	ReceivedBy      *string    `db:"received_by"`
	ApprovedBy      *string    `db:"approved_by"`
	CancelledBy     *string    `db:"cancelled_by"`
	CreatedBy       *string    `db:"created_by"`
	CancelReason    string     `db:"cancel_reason"`
	CreatedAt       time.Time  `db:"created_at"`
	UpdatedAt       time.Time  `db:"updated_at"`
	ShippedByName   string     `db:"shipped_by_name"`
	ReceivedByName  string     `db:"received_by_name"`
	ApprovedByName  string     `db:"approved_by_name"`
	CancelledByName string     `db:"cancelled_by_name"`
	CreatedByName   string     `db:"created_by_name"`
}

func formatTimePtr(t *time.Time) *string {
	if t == nil {
		return nil
	}
	s := t.Format(time.RFC3339)
	return &s
}

func toTransferResponse(r transferRow) dto.TransferOrderResponse {
	return dto.TransferOrderResponse{
		ID:              r.ID,
		TransferNumber:  transferNumber(r.ID),
		FromWarehouseID: r.FromWarehouseID,
		FromWarehouse:   r.FromWarehouse,
		FromCode:        r.FromCode,
		ToWarehouseID:   r.ToWarehouseID,
		ToWarehouse:     r.ToWarehouse,
		ToCode:          r.ToCode,
		OrderDate:       r.OrderDate.Format(time.RFC3339),
		Status:          r.Status,
		Notes:           r.Notes,
		TotalItems:      r.TotalItems,
		TotalQuantity:   r.TotalQuantity,
		ShippedDate:     formatTimePtr(r.ShippedDate),
		ReceivedDate:    formatTimePtr(r.ReceivedDate),
		ApprovedDate:    formatTimePtr(r.ApprovedDate),
		CancelledDate:   formatTimePtr(r.CancelledDate),
		ShippedBy:       r.ShippedBy,
		ReceivedBy:      r.ReceivedBy,
		ApprovedBy:      r.ApprovedBy,
		CancelledBy:     r.CancelledBy,
		CreatedBy:       r.CreatedBy,
		ShippedByName:   r.ShippedByName,
		ReceivedByName:  r.ReceivedByName,
		ApprovedByName:  r.ApprovedByName,
		CancelledByName: r.CancelledByName,
		CreatedByName:   r.CreatedByName,
		CancelReason:    r.CancelReason,
		CreatedAt:       r.CreatedAt.Format(time.RFC3339),
		UpdatedAt:       r.UpdatedAt.Format(time.RFC3339),
	}
}

const listTransfersSQL = `
SELECT
    t.id, t.from_warehouse_id, t.to_warehouse_id,
    t.order_date, t.status,
    COALESCE(t.notes, '') as notes,
    t.shipped_date, t.received_date, t.approved_date, t.cancelled_date,
    t.shipped_by, t.received_by, t.approved_by, t.cancelled_by, t.created_by,
    COALESCE(t.cancel_reason, '') as cancel_reason,
    t.created_at, t.updated_at,
    COALESCE(fw.name, '') as from_warehouse_name,
    COALESCE(fw.code, '') as from_warehouse_code,
    COALESCE(tw.name, '') as to_warehouse_name,
    COALESCE(tw.code, '') as to_warehouse_code,
    COALESCE(item_stats.total_items, 0) as total_items,
    COALESCE(item_stats.total_quantity, 0) as total_quantity,
    COALESCE(u_shipped.username, '') as shipped_by_name,
    COALESCE(u_received.username, '') as received_by_name,
    COALESCE(u_approved.username, '') as approved_by_name,
    COALESCE(u_cancelled.username, '') as cancelled_by_name,
    COALESCE(u_created.username, '') as created_by_name
FROM transfer_orders t
LEFT JOIN warehouses fw ON t.from_warehouse_id = fw.id
LEFT JOIN warehouses tw ON t.to_warehouse_id = tw.id
LEFT JOIN users u_shipped ON t.shipped_by = u_shipped.id
LEFT JOIN users u_received ON t.received_by = u_received.id
LEFT JOIN users u_approved ON t.approved_by = u_approved.id
LEFT JOIN users u_cancelled ON t.cancelled_by = u_cancelled.id
LEFT JOIN users u_created ON t.created_by = u_created.id
LEFT JOIN (
    SELECT transfer_order_id, COUNT(*) as total_items, COALESCE(SUM(quantity), 0) as total_quantity
    FROM transfer_items
    GROUP BY transfer_order_id
) item_stats ON t.id = item_stats.transfer_order_id
ORDER BY t.order_date DESC, t.created_at DESC
`

// GetAllTransferOrders handles retrieving all transfer orders with enriched data.
func (h *TransferHandler) GetAllTransferOrders(c *gin.Context) {
	if h.db != nil {
		ctx := c.Request.Context()
		var rows []transferRow
		if err := h.db.SelectContext(ctx, &rows, listTransfersSQL); err != nil {
			response.InternalServerError(c, "Failed to fetch transfers: "+err.Error(), nil)
			return
		}
		result := make([]dto.TransferOrderResponse, 0, len(rows))
		for _, r := range rows {
			result = append(result, toTransferResponse(r))
		}
		response.OK(c, "Transfer orders retrieved successfully", result)
		return
	}

	tos, err := h.service.GetAllTransferOrders(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	response.OK(c, "Transfer orders retrieved successfully", tos)
}

const getTransferByIDSQL = `
SELECT
    t.id, t.from_warehouse_id, t.to_warehouse_id,
    t.order_date, t.status,
    COALESCE(t.notes, '') as notes,
    t.shipped_date, t.received_date, t.approved_date, t.cancelled_date,
    t.shipped_by, t.received_by, t.approved_by, t.cancelled_by, t.created_by,
    COALESCE(t.cancel_reason, '') as cancel_reason,
    t.created_at, t.updated_at,
    COALESCE(fw.name, '') as from_warehouse_name,
    COALESCE(fw.code, '') as from_warehouse_code,
    COALESCE(tw.name, '') as to_warehouse_name,
    COALESCE(tw.code, '') as to_warehouse_code,
    COALESCE(item_stats.total_items, 0) as total_items,
    COALESCE(item_stats.total_quantity, 0) as total_quantity,
    COALESCE(u_shipped.username, '') as shipped_by_name,
    COALESCE(u_received.username, '') as received_by_name,
    COALESCE(u_approved.username, '') as approved_by_name,
    COALESCE(u_cancelled.username, '') as cancelled_by_name,
    COALESCE(u_created.username, '') as created_by_name
FROM transfer_orders t
LEFT JOIN warehouses fw ON t.from_warehouse_id = fw.id
LEFT JOIN warehouses tw ON t.to_warehouse_id = tw.id
LEFT JOIN users u_shipped ON t.shipped_by = u_shipped.id
LEFT JOIN users u_received ON t.received_by = u_received.id
LEFT JOIN users u_approved ON t.approved_by = u_approved.id
LEFT JOIN users u_cancelled ON t.cancelled_by = u_cancelled.id
LEFT JOIN users u_created ON t.created_by = u_created.id
LEFT JOIN (
    SELECT transfer_order_id, COUNT(*) as total_items, COALESCE(SUM(quantity), 0) as total_quantity
    FROM transfer_items
    GROUP BY transfer_order_id
) item_stats ON t.id = item_stats.transfer_order_id
WHERE t.id = $1
`

// transferItemRow is used for scanning transfer item queries.
type transferItemRow struct {
	ID               string `db:"id"`
	ArticleID        string `db:"article_id"`
	ArticleName      string `db:"article_name"`
	ArticleCode      string `db:"article_code"`
	Quantity         int    `db:"quantity"`
	ReceivedQuantity int    `db:"received_quantity"`
	HasDiscrepancy   bool   `db:"has_discrepancy"`
}

const getTransferItemsSQL = `
SELECT
    ti.id, ti.article_id, ti.quantity,
    ti.received_quantity, ti.has_discrepancy,
    COALESCE(a.name, '') as article_name,
    COALESCE(a.barcode, '') as article_code
FROM transfer_items ti
LEFT JOIN articles a ON ti.article_id = a.id
WHERE ti.transfer_order_id = $1
ORDER BY ti.created_at ASC
`

// GetTransferOrderByID handles retrieving a transfer order by its ID with enriched data.
func (h *TransferHandler) GetTransferOrderByID(c *gin.Context) {
	id := c.Param("id")

	if h.db != nil {
		ctx := c.Request.Context()
		var row transferRow
		if err := h.db.GetContext(ctx, &row, getTransferByIDSQL, id); err != nil {
			if err == sql.ErrNoRows {
				response.NotFound(c, "Transfer order not found", nil)
				return
			}
			response.InternalServerError(c, "Failed to fetch transfer: "+err.Error(), nil)
			return
		}

		detail := dto.TransferOrderDetailResponse{
			TransferOrderResponse: toTransferResponse(row),
		}

		var itemRows []transferItemRow
		if err := h.db.SelectContext(ctx, &itemRows, getTransferItemsSQL, id); err == nil {
			for _, ir := range itemRows {
				detail.Items = append(detail.Items, dto.TransferItemResponse{
					ID:               ir.ID,
					ArticleID:        ir.ArticleID,
					ArticleName:      ir.ArticleName,
					ArticleCode:      ir.ArticleCode,
					Quantity:         ir.Quantity,
					ReceivedQuantity: ir.ReceivedQuantity,
					HasDiscrepancy:   ir.HasDiscrepancy,
				})
			}
		}
		if detail.Items == nil {
			detail.Items = []dto.TransferItemResponse{}
		}

		response.OK(c, "Transfer order retrieved successfully", detail)
		return
	}

	to, err := h.service.GetTransferOrderByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if to == nil {
		response.NotFound(c, "Transfer order not found", nil)
		return
	}
	response.OK(c, "Transfer order retrieved successfully", to)
}

// CreateTransferOrder handles the creation of a new transfer order (draft status, no stock movement).
func (h *TransferHandler) CreateTransferOrder(c *gin.Context) {
	var req dto.CreateTransferOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	fromWarehouseID, err := uuid.Parse(req.FromWarehouseID)
	if err != nil {
		response.BadRequest(c, "Invalid from_warehouse_id format", nil)
		return
	}

	toWarehouseID, err := uuid.Parse(req.ToWarehouseID)
	if err != nil {
		response.BadRequest(c, "Invalid to_warehouse_id format", nil)
		return
	}

	userID := h.getUserID(c)

	to := &entities.TransferOrder{
		BaseModel:       types.NewBaseModel(),
		FromWarehouseID: fromWarehouseID,
		ToWarehouseID:   toWarehouseID,
		OrderDate:       time.Now(),
		Status:          entities.TransferStatusDraft,
		Notes:           req.Notes,
	}
	if userID != "" {
		to.CreatedBy = &userID
	}

	var items []*entities.TransferItem
	for _, itemReq := range req.Items {
		items = append(items, &entities.TransferItem{
			ArticleID: itemReq.ArticleID,
			Quantity:  itemReq.Quantity,
		})
	}

	if err := h.service.CreateTransferOrder(c.Request.Context(), to, items); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Transfer order created successfully", to)
}

// ApproveTransferOrder handles approving a transfer order.
func (h *TransferHandler) ApproveTransferOrder(c *gin.Context) {
	id := c.Param("id")
	approverID := h.getUserID(c)

	order, err := h.service.ApproveTransferOrder(c.Request.Context(), id, approverID)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Notify transfer creator
	if h.notificationService != nil && order.CreatedBy != nil {
		go func() {
			creatorID, err := uuid.Parse(*order.CreatedBy)
			if err != nil {
				return
			}
			approverName := h.getUserName(approverID)
			tNum := transferNumber(order.ID.String())
			if err := h.notificationService.NotifyTransferApproved(
				context.Background(), creatorID, order.ID.String(), tNum, approverName,
			); err != nil {
				log.Printf("Failed to send transfer approved notification: %v", err)
			}
		}()
	}

	response.OK(c, "Transfer order approved successfully", order)
}

// ShipTransferOrder handles shipping a transfer order (stock deducted from source).
func (h *TransferHandler) ShipTransferOrder(c *gin.Context) {
	id := c.Param("id")
	shipperID := h.getUserID(c)

	order, err := h.service.ShipTransferOrder(c.Request.Context(), id, shipperID)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Notify destination warehouse staff
	if h.notificationService != nil {
		go func() {
			shipperName := h.getUserName(shipperID)
			tNum := transferNumber(order.ID.String())
			// Notify users with transfer receive permission
			receiverIDs := h.getUsersWithPermission("inventory.transfer.update")
			if len(receiverIDs) > 0 {
				if err := h.notificationService.NotifyTransferShipped(
					context.Background(), receiverIDs, order.ID.String(), tNum, shipperName,
				); err != nil {
					log.Printf("Failed to send transfer shipped notification: %v", err)
				}
			}
		}()
	}

	response.OK(c, "Transfer order shipped successfully", order)
}

// ReceiveTransferOrder handles receiving goods at the destination warehouse.
func (h *TransferHandler) ReceiveTransferOrder(c *gin.Context) {
	id := c.Param("id")
	var req dto.ReceiveTransferRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	receiverID := h.getUserID(c)

	receivedItems := make([]services.ReceivedTransferItem, len(req.Items))
	for i, item := range req.Items {
		receivedItems[i] = services.ReceivedTransferItem{
			ItemID:           item.ItemID,
			ReceivedQuantity: item.ReceivedQuantity,
		}
	}

	order, err := h.service.ReceiveTransferOrder(c.Request.Context(), id, receiverID, receivedItems)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Check for discrepancies
	hasDiscrepancy := false
	for _, item := range req.Items {
		// Simple check - detailed check is done in service
		if item.ReceivedQuantity < 0 {
			hasDiscrepancy = true
			break
		}
	}
	// Check notes for discrepancy flag
	if len(order.Notes) > 0 {
		hasDiscrepancy = true
	}

	// Notify creator and shipper
	if h.notificationService != nil {
		go func() {
			receiverName := h.getUserName(receiverID)
			tNum := transferNumber(order.ID.String())
			var notifyIDs []uuid.ID
			if order.CreatedBy != nil {
				if uid, err := uuid.Parse(*order.CreatedBy); err == nil {
					notifyIDs = append(notifyIDs, uid)
				}
			}
			if order.ShippedBy != nil {
				if uid, err := uuid.Parse(*order.ShippedBy); err == nil {
					notifyIDs = append(notifyIDs, uid)
				}
			}
			if len(notifyIDs) > 0 {
				if err := h.notificationService.NotifyTransferReceived(
					context.Background(), notifyIDs, order.ID.String(), tNum, receiverName, hasDiscrepancy,
				); err != nil {
					log.Printf("Failed to send transfer received notification: %v", err)
				}
			}
		}()
	}

	response.OK(c, "Transfer order received successfully", order)
}

// CancelTransferOrder handles cancelling a transfer order.
func (h *TransferHandler) CancelTransferOrderWorkflow(c *gin.Context) {
	id := c.Param("id")
	var req dto.CancelTransferRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		// Allow empty body (reason is optional)
		req.Reason = ""
	}

	cancellerID := h.getUserID(c)

	order, err := h.service.CancelTransferOrder(c.Request.Context(), id, cancellerID, req.Reason)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Notify creator
	if h.notificationService != nil && order.CreatedBy != nil {
		go func() {
			creatorID, err := uuid.Parse(*order.CreatedBy)
			if err != nil {
				return
			}
			cancellerName := h.getUserName(cancellerID)
			tNum := transferNumber(order.ID.String())
			if err := h.notificationService.NotifyTransferCancelled(
				context.Background(), creatorID, order.ID.String(), tNum, cancellerName, req.Reason,
			); err != nil {
				log.Printf("Failed to send transfer cancelled notification: %v", err)
			}
		}()
	}

	response.OK(c, "Transfer order cancelled successfully", order)
}

// UpdateTransferOrder handles updating an existing transfer order.
func (h *TransferHandler) UpdateTransferOrder(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateTransferOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}

	fromWarehouseID, err := uuid.Parse(req.FromWarehouseID)
	if err != nil {
		response.BadRequest(c, "Invalid from_warehouse_id format", nil)
		return
	}

	toWarehouseID, err := uuid.Parse(req.ToWarehouseID)
	if err != nil {
		response.BadRequest(c, "Invalid to_warehouse_id format", nil)
		return
	}

	// Fetch existing order to preserve original data
	existing, err := h.service.GetTransferOrderByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if existing == nil {
		response.NotFound(c, "Transfer order not found", nil)
		return
	}

	to := &entities.TransferOrder{
		FromWarehouseID: fromWarehouseID,
		ToWarehouseID:   toWarehouseID,
		OrderDate:       existing.OrderDate,
		Status:          req.Status,
		Notes:           existing.Notes,
	}
	to.ID = parsedID
	to.UpdatedAt = time.Now()

	if err := h.service.UpdateTransferOrder(c.Request.Context(), to); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Transfer order updated successfully", to)
}

// DeleteTransferOrder handles deleting a transfer order by its ID.
func (h *TransferHandler) DeleteTransferOrder(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteTransferOrder(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Transfer order deleted successfully", nil)
}
