package handlers

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	googleuuid "github.com/google/uuid"
	"github.com/jmoiron/sqlx"

	accounting_entities "malaka/internal/modules/accounting/domain/entities"
	accounting_services "malaka/internal/modules/accounting/domain/services"
	inventory_entities "malaka/internal/modules/inventory/domain/entities"
	inventory_services "malaka/internal/modules/inventory/domain/services"
	notification_services "malaka/internal/modules/notifications/domain/services"
	procurement_entities "malaka/internal/modules/procurement/domain/entities"
	"malaka/internal/modules/procurement/domain/repositories"
	"malaka/internal/modules/procurement/domain/services"
	"malaka/internal/modules/procurement/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// PurchaseOrderHandler handles HTTP requests for purchase order operations.
type PurchaseOrderHandler struct {
	service             *services.PurchaseOrderService
	db                  *sqlx.DB
	notificationService *notification_services.NotificationService
	goodsReceiptService *inventory_services.GoodsReceiptService
	journalEntryService accounting_services.JournalEntryService
	stockService        *inventory_services.StockService
	budgetService       accounting_services.BudgetService
}

// NewPurchaseOrderHandler creates a new PurchaseOrderHandler.
func NewPurchaseOrderHandler(
	service *services.PurchaseOrderService,
	db *sqlx.DB,
	notificationService *notification_services.NotificationService,
	goodsReceiptService *inventory_services.GoodsReceiptService,
	journalEntryService accounting_services.JournalEntryService,
	stockService *inventory_services.StockService,
	budgetService accounting_services.BudgetService,
) *PurchaseOrderHandler {
	return &PurchaseOrderHandler{
		service:             service,
		db:                  db,
		notificationService: notificationService,
		goodsReceiptService: goodsReceiptService,
		journalEntryService: journalEntryService,
		stockService:        stockService,
		budgetService:       budgetService,
	}
}

// getUsersWithPermission looks up user IDs that have a specific RBAC permission
func (h *PurchaseOrderHandler) getUsersWithPermission(permissionCode string) []uuid.ID {
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

// getUserName looks up a username by user ID
func (h *PurchaseOrderHandler) getUserName(userID string) string {
	var name string
	_ = h.db.QueryRow(`SELECT COALESCE(username, email) FROM users WHERE id = $1`, userID).Scan(&name)
	return name
}

// getDefaultUserID retrieves a default admin user ID from the database for development/testing.
func (h *PurchaseOrderHandler) getDefaultUserID() (string, error) {
	var userID string
	err := h.db.QueryRow(`SELECT id FROM users WHERE role = 'admin' AND status = 'active' LIMIT 1`).Scan(&userID)
	if err != nil && err != sql.ErrNoRows {
		return "", err
	}
	if userID == "" {
		// Fallback to any active user
		err = h.db.QueryRow(`SELECT id FROM users WHERE status = 'active' LIMIT 1`).Scan(&userID)
		if err != nil {
			return "", err
		}
	}
	return userID, nil
}

// Create handles the creation of a new purchase order.
func (h *PurchaseOrderHandler) Create(c *gin.Context) {
	var req dto.CreatePurchaseOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get user ID from auth context
	createdBy := c.GetString("user_id")
	if createdBy == "" {
		defaultUserID, err := h.getDefaultUserID()
		if err != nil {
			response.InternalServerError(c, "Failed to get default user: "+err.Error(), nil)
			return
		}
		if defaultUserID == "" {
			response.BadRequest(c, "user authentication required", nil)
			return
		}
		createdBy = defaultUserID
	}

	// Convert DTO to entity
	order := req.ToEntity(createdBy)

	// Create purchase order
	if err := h.service.Create(c.Request.Context(), order); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.Created(c, "Purchase order created successfully", dto.ToPurchaseOrderResponse(order))
}

// GetByID handles retrieving a purchase order by ID.
func (h *PurchaseOrderHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "ID is required", nil)
		return
	}

	order, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if order == nil {
		response.NotFound(c, "Purchase order not found", nil)
		return
	}

	response.OK(c, "Purchase order retrieved successfully", dto.ToPurchaseOrderResponse(order))
}

// GetAll handles retrieving all purchase orders with filtering.
func (h *PurchaseOrderHandler) GetAll(c *gin.Context) {
	filter := repositories.PurchaseOrderFilter{
		Search:        c.Query("search"),
		Status:        c.Query("status"),
		PaymentStatus: c.Query("payment_status"),
		SupplierID:    c.Query("supplier_id"),
		StartDate:     c.Query("start_date"),
		EndDate:       c.Query("end_date"),
		SortBy:        c.Query("sort_by"),
		SortOrder:     c.Query("sort_order"),
	}

	if page, err := strconv.Atoi(c.Query("page")); err == nil {
		filter.Page = page
	} else {
		filter.Page = 1
	}

	if limit, err := strconv.Atoi(c.Query("limit")); err == nil {
		filter.Limit = limit
	} else {
		filter.Limit = 10
	}

	result, err := h.service.GetAll(c.Request.Context(), filter)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Convert to response
	var orders []*dto.PurchaseOrderResponse
	for _, order := range result.Data {
		orders = append(orders, dto.ToPurchaseOrderResponse(order))
	}

	response.OK(c, "Purchase orders retrieved successfully", gin.H{
		"data": orders,
		"pagination": gin.H{
			"page":        result.Page,
			"limit":       result.Limit,
			"total_rows":  result.TotalRows,
			"total_pages": result.TotalPages,
		},
	})
}

// Update handles updating a purchase order.
func (h *PurchaseOrderHandler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "ID is required", nil)
		return
	}

	var req dto.UpdatePurchaseOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get existing order
	order, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if order == nil {
		response.NotFound(c, "Purchase order not found", nil)
		return
	}

	// Update fields
	if req.SupplierID != "" {
		supplierUUID, _ := uuid.Parse(req.SupplierID)
		order.SupplierID = supplierUUID
	}
	if req.PurchaseRequestID != nil {
		// Only set if not empty string, otherwise set to nil
		if *req.PurchaseRequestID != "" {
			prUUID, _ := uuid.Parse(*req.PurchaseRequestID)
			order.PurchaseRequestID = &prUUID
		} else {
			order.PurchaseRequestID = nil
		}
	}
	if req.ExpectedDeliveryDate != nil {
		order.ExpectedDeliveryDate = req.ExpectedDeliveryDate
	}
	if req.DeliveryAddress != "" {
		order.DeliveryAddress = req.DeliveryAddress
	}
	if req.PaymentTerms != "" {
		order.PaymentTerms = req.PaymentTerms
	}
	if req.Currency != "" {
		order.Currency = req.Currency
	}
	order.ShippingCost = req.ShippingCost
	order.Notes = req.Notes

	// Update the order
	if err := h.service.Update(c.Request.Context(), order); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Purchase order updated successfully", dto.ToPurchaseOrderResponse(order))
}

// Delete handles deleting a purchase order.
func (h *PurchaseOrderHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "ID is required", nil)
		return
	}

	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Purchase order deleted successfully", nil)
}

// Submit handles submitting a purchase order for approval.
func (h *PurchaseOrderHandler) Submit(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "ID is required", nil)
		return
	}

	order, err := h.service.SubmitForApproval(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Notify approvers asynchronously
	if h.notificationService != nil {
		go func() {
			approverIDs := h.getUsersWithPermission("procurement.purchase-order.approve")
			if len(approverIDs) > 0 {
				requesterName := h.getUserName(order.CreatedBy.String())
				if err := h.notificationService.NotifyPurchaseOrderSubmitted(
					context.Background(), approverIDs, order.ID.String(), order.PONumber, requesterName,
				); err != nil {
					log.Printf("Failed to send PO submitted notification: %v", err)
				}
			}
		}()
	}

	response.OK(c, "Purchase order submitted for approval", dto.ToPurchaseOrderResponse(order))
}

// Approve handles approving a purchase order.
func (h *PurchaseOrderHandler) Approve(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "ID is required", nil)
		return
	}

	// Get approver ID from auth context
	approverID := c.GetString("user_id")
	if approverID == "" {
		var err error
		approverID, err = h.getDefaultUserID()
		if err != nil {
			response.InternalServerError(c, "Failed to determine approver: "+err.Error(), nil)
			return
		}
		if approverID == "" {
			response.BadRequest(c, "Authentication required for approval", nil)
			return
		}
	}

	order, err := h.service.Approve(c.Request.Context(), id, approverID)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Notify PO creator asynchronously
	if h.notificationService != nil {
		go func() {
			approverName := h.getUserName(approverID)
			if err := h.notificationService.NotifyPurchaseOrderApproved(
				context.Background(), order.CreatedBy, order.ID.String(), order.PONumber, approverName,
			); err != nil {
				log.Printf("Failed to send PO approved notification: %v", err)
			}
		}()
	}

	response.OK(c, "Purchase order approved successfully", dto.ToPurchaseOrderResponse(order))
}

// Send handles sending a purchase order to supplier.
func (h *PurchaseOrderHandler) Send(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "ID is required", nil)
		return
	}

	order, err := h.service.Send(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Notify PO creator asynchronously
	if h.notificationService != nil {
		go func() {
			if err := h.notificationService.NotifyPurchaseOrderSent(
				context.Background(), order.CreatedBy, order.ID.String(), order.PONumber,
			); err != nil {
				log.Printf("Failed to send PO sent notification: %v", err)
			}
		}()
	}

	response.OK(c, "Purchase order sent successfully", dto.ToPurchaseOrderResponse(order))
}

// Confirm handles confirming a purchase order.
func (h *PurchaseOrderHandler) Confirm(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "ID is required", nil)
		return
	}

	order, err := h.service.Confirm(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Purchase order confirmed successfully", dto.ToPurchaseOrderResponse(order))
}

// Ship handles marking a purchase order as shipped.
func (h *PurchaseOrderHandler) Ship(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "ID is required", nil)
		return
	}

	order, err := h.service.Ship(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Purchase order marked as shipped", dto.ToPurchaseOrderResponse(order))
}

// Receive handles receiving a purchase order.
func (h *PurchaseOrderHandler) Receive(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "ID is required", nil)
		return
	}

	var req dto.ReceivePurchaseOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Convert to service format
	receivedItems := make([]struct {
		ItemID   string
		Quantity int
	}, len(req.Items))
	for i, item := range req.Items {
		receivedItems[i].ItemID = item.ItemID
		receivedItems[i].Quantity = item.Quantity
	}

	// Get user ID from auth context
	receiverID := c.GetString("user_id")
	if receiverID == "" {
		var defaultErr error
		receiverID, defaultErr = h.getDefaultUserID()
		if defaultErr != nil || receiverID == "" {
			receiverID = "system"
		}
	}

	order, err := h.service.Receive(c.Request.Context(), id, receivedItems)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Auto-create and post Goods Receipt asynchronously
	if h.goodsReceiptService != nil {
		go func() {
			h.createGoodsReceiptFromPO(context.Background(), order, receiverID)
		}()
	}

	// Notify PO creator asynchronously
	if h.notificationService != nil {
		go func() {
			if err := h.notificationService.NotifyPurchaseOrderReceived(
				context.Background(), order.CreatedBy, order.ID.String(), order.PONumber,
			); err != nil {
				log.Printf("Failed to send PO received notification: %v", err)
			}
		}()
	}

	response.OK(c, "Purchase order received successfully", dto.ToPurchaseOrderResponse(order))
}

// Cancel handles cancelling a purchase order.
func (h *PurchaseOrderHandler) Cancel(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.BadRequest(c, "ID is required", nil)
		return
	}

	var req dto.CancelPurchaseOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		// Allow empty body
		req.Reason = ""
	}

	order, err := h.service.Cancel(c.Request.Context(), id, req.Reason)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Notify PO creator asynchronously
	if h.notificationService != nil {
		go func() {
			if err := h.notificationService.NotifyPurchaseOrderCancelled(
				context.Background(), order.CreatedBy, order.ID.String(), order.PONumber, req.Reason,
			); err != nil {
				log.Printf("Failed to send PO cancelled notification: %v", err)
			}
		}()
	}

	response.OK(c, "Purchase order cancelled successfully", dto.ToPurchaseOrderResponse(order))
}

// GetStats handles retrieving purchase order statistics.
func (h *PurchaseOrderHandler) GetStats(c *gin.Context) {
	stats, err := h.service.GetStats(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Purchase order statistics retrieved successfully", stats)
}

// AddItem handles adding an item to a purchase order.
func (h *PurchaseOrderHandler) AddItem(c *gin.Context) {
	orderID := c.Param("id")
	if orderID == "" {
		response.BadRequest(c, "Order ID is required", nil)
		return
	}

	var req dto.CreatePurchaseOrderItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get existing order to get currency
	order, err := h.service.GetByID(c.Request.Context(), orderID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if order == nil {
		response.NotFound(c, "Purchase order not found", nil)
		return
	}

	// Convert DTO to entity
	item := &dto.PurchaseOrderItemEntity{
		ItemName:           req.ItemName,
		Description:        req.Description,
		Specification:      req.Specification,
		Quantity:           req.Quantity,
		Unit:               req.Unit,
		UnitPrice:          req.UnitPrice,
		DiscountPercentage: req.DiscountPercentage,
		TaxPercentage:      req.TaxPercentage,
		Currency:           req.Currency,
	}
	if item.Currency == "" {
		item.Currency = order.Currency
	}

	entityItem := item.ToEntity()
	if err := h.service.AddItem(c.Request.Context(), orderID, entityItem); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Return updated order
	updatedOrder, err := h.service.GetByID(c.Request.Context(), orderID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.Created(c, "Item added successfully", dto.ToPurchaseOrderResponse(updatedOrder))
}

// DeleteItem handles deleting an item from a purchase order.
func (h *PurchaseOrderHandler) DeleteItem(c *gin.Context) {
	orderID := c.Param("id")
	itemID := c.Param("itemId")

	if orderID == "" {
		response.BadRequest(c, "Order ID is required", nil)
		return
	}
	if itemID == "" {
		response.BadRequest(c, "Item ID is required", nil)
		return
	}

	if err := h.service.DeleteItem(c.Request.Context(), orderID, itemID); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	// Return updated order
	updatedOrder, err := h.service.GetByID(c.Request.Context(), orderID)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Item deleted successfully", dto.ToPurchaseOrderResponse(updatedOrder))
}

// createGoodsReceiptFromPO auto-creates and posts a Goods Receipt when a PO is received.
// This triggers downstream accounting: journal entries, stock movements, and budget realization.
func (h *PurchaseOrderHandler) createGoodsReceiptFromPO(ctx context.Context, order *procurement_entities.PurchaseOrder, receiverID string) {
	// Generate GR number using DB function
	var grNumber string
	if err := h.db.QueryRow("SELECT generate_gr_number()").Scan(&grNumber); err != nil {
		grNumber = fmt.Sprintf("GR-%s-%s", time.Now().Format("20060102"), order.ID.String()[:8])
		log.Printf("Warning: Failed to generate GR number, using fallback: %v", err)
	}

	// Look up default warehouse
	var warehouseID, warehouseName string
	if err := h.db.QueryRow("SELECT id, name FROM warehouses ORDER BY created_at ASC LIMIT 1").Scan(&warehouseID, &warehouseName); err != nil {
		log.Printf("Failed to find default warehouse for GR creation: %v", err)
		return
	}

	// Map procurement type
	procType := inventory_entities.ProcurementType(order.ProcurementType)
	if procType == "" {
		procType = inventory_entities.ProcurementTypeRawMaterial
	}

	now := time.Now()
	gr := &inventory_entities.GoodsReceipt{
		GRNumber:        grNumber,
		PurchaseOrderID: order.ID.String(),
		PONumber:        order.PONumber,
		SupplierID:      order.SupplierID.String(),
		SupplierName:    order.SupplierName,
		WarehouseID:     warehouseID,
		WarehouseName:   warehouseName,
		ReceiptDate:     now,
		Status:          inventory_entities.GoodsReceiptStatusDraft,
		TotalAmount:     order.TotalAmount,
		Currency:        order.Currency,
		ProcurementType: procType,
		PaymentTerms:    order.PaymentTerms,
		Notes:           fmt.Sprintf("Auto-generated from PO %s", order.PONumber),
		ReceivedBy:      receiverID,
	}
	gr.CreatedAt = now
	gr.UpdatedAt = now

	// Create the GR
	if err := h.goodsReceiptService.CreateGoodsReceipt(ctx, gr); err != nil {
		log.Printf("Failed to create goods receipt for PO %s: %v", order.PONumber, err)
		return
	}
	log.Printf("Created Goods Receipt %s for PO %s", grNumber, order.PONumber)

	// Insert GR items from PO items
	for _, item := range order.Items {
		grItemID := uuid.New()
		_, err := h.db.ExecContext(ctx,
			`INSERT INTO goods_receipt_items (id, goods_receipt_id, item_name, description, quantity, unit, unit_price, line_total, po_item_id, created_at, updated_at)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
			grItemID, gr.ID, item.ItemName, item.Description, item.ReceivedQuantity, item.Unit,
			item.UnitPrice, float64(item.ReceivedQuantity)*item.UnitPrice, item.ID, now, now,
		)
		if err != nil {
			log.Printf("Warning: Failed to insert GR item for %s: %v", item.ItemName, err)
		}
	}

	// Auto-post the GR (changes status to POSTED)
	postedGR, err := h.goodsReceiptService.PostGoodsReceipt(ctx, gr.ID.String(), receiverID)
	if err != nil {
		log.Printf("Failed to post goods receipt %s: %v", grNumber, err)
		return
	}
	log.Printf("Posted Goods Receipt %s", grNumber)

	// Create journal entry
	var debitAccountID googleuuid.UUID
	if h.journalEntryService != nil && postedGR.TotalAmount > 0 {
		je, accountID, err := h.createJournalEntryForGR(ctx, postedGR, receiverID)
		if err != nil {
			log.Printf("Warning: Failed to create journal entry for GR %s: %v", grNumber, err)
		} else if je != nil {
			debitAccountID = accountID
			// Link journal entry to GR
			if err := h.goodsReceiptService.SetJournalEntryID(ctx, gr.ID.String(), je.ID.String()); err != nil {
				log.Printf("Warning: Failed to link journal entry to GR: %v", err)
			}
			log.Printf("Created journal entry for GR %s", grNumber)
		}
	}

	// Create budget realization
	if h.budgetService != nil && postedGR.TotalAmount > 0 {
		userUUID, _ := uuid.Parse(receiverID)
		poUUID := order.ID
		poUUIDPtr := &poUUID

		var accountIDForBudget uuid.ID
		if debitAccountID == googleuuid.Nil {
			accountIDForBudget, _ = uuid.Parse("52222222-0000-0000-0000-000000000000") // 5200 Biaya Operasional
		} else {
			accountIDForBudget = uuid.FromUUID(debitAccountID)
		}

		if err := h.budgetService.CreateRealizationFromGR(
			ctx, gr.ID, gr.GRNumber, gr.TotalAmount, accountIDForBudget,
			time.Now(), userUUID, poUUIDPtr,
		); err != nil {
			log.Printf("Warning: Failed to create budget realization for GR %s: %v", grNumber, err)
		} else {
			log.Printf("Created budget realization for GR %s", grNumber)
		}
	}
}

// createJournalEntryForGR creates accounting journal entries for a posted Goods Receipt
func (h *PurchaseOrderHandler) createJournalEntryForGR(ctx context.Context, gr *inventory_entities.GoodsReceipt, userID string) (*accounting_entities.JournalEntry, googleuuid.UUID, error) {
	var debitAccountID, creditAccountID googleuuid.UUID
	var debitDesc, creditDesc string

	// Account IDs from chart_of_accounts
	apAccountID := googleuuid.MustParse("55555555-5555-5555-5555-555555555555") // 2101 Utang Dagang

	switch gr.GetAccountingTreatment() {
	case "COGS":
		debitAccountID = googleuuid.MustParse("13111111-1111-1111-1111-111111111111") // 1302 Persediaan Bahan Baku
		creditAccountID = apAccountID
		debitDesc = "Inventory - Raw Material Receipt"
		creditDesc = "Accounts Payable - Supplier"
	case "OPEX":
		debitAccountID = googleuuid.MustParse("52222222-0000-0000-0000-000000000000") // 5200 Biaya Operasional
		creditAccountID = apAccountID
		debitDesc = "Operating Expense - " + string(gr.ProcurementType)
		creditDesc = "Accounts Payable - Supplier"
	case "CAPITALIZE":
		debitAccountID = googleuuid.MustParse("14444444-1111-1111-1111-111111111111") // 1404 Peralatan Kantor
		creditAccountID = apAccountID
		debitDesc = "Fixed Asset - Capital Purchase"
		creditDesc = "Accounts Payable - Supplier"
	default:
		debitAccountID = googleuuid.MustParse("52222222-0000-0000-0000-000000000000") // 5200 Biaya Operasional
		creditAccountID = apAccountID
		debitDesc = "Expense - Goods Receipt"
		creditDesc = "Accounts Payable"
	}

	entryID := uuid.New()
	entry := &accounting_entities.JournalEntry{
		EntryDate:    time.Now(),
		Description:  fmt.Sprintf("Goods Receipt %s - %s", gr.GRNumber, gr.SupplierName),
		Reference:    gr.GRNumber,
		Status:       accounting_entities.JournalEntryStatusDraft,
		CurrencyCode: gr.Currency,
		ExchangeRate: 1.0,
		SourceModule: "PROCUREMENT",
		SourceID:     gr.ID.String(),
		CompanyID:    "1",
		CreatedBy:    userID,
		Lines: []*accounting_entities.JournalEntryLine{
			{
				JournalEntryID: entryID,
				LineNumber:     1,
				AccountID:      uuid.FromUUID(debitAccountID),
				DebitAmount:    gr.TotalAmount,
				CreditAmount:   0,
				Description:    debitDesc,
			},
			{
				JournalEntryID: entryID,
				LineNumber:     2,
				AccountID:      uuid.FromUUID(creditAccountID),
				DebitAmount:    0,
				CreditAmount:   gr.TotalAmount,
				Description:    creditDesc,
			},
		},
	}
	entry.ID = entryID

	if err := h.journalEntryService.CreateJournalEntry(ctx, entry); err != nil {
		return nil, googleuuid.Nil, fmt.Errorf("failed to create journal entry: %w", err)
	}

	// Auto-post the journal entry
	if err := h.journalEntryService.PostJournalEntry(ctx, entry.ID, userID); err != nil {
		log.Printf("Warning: Failed to auto-post journal entry: %v", err)
	}

	return entry, debitAccountID, nil
}
