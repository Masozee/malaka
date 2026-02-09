package handlers

import (
	"database/sql"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/procurement/domain/repositories"
	"malaka/internal/modules/procurement/domain/services"
	"malaka/internal/modules/procurement/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// PurchaseOrderHandler handles HTTP requests for purchase order operations.
type PurchaseOrderHandler struct {
	service *services.PurchaseOrderService
	db      *sqlx.DB
}

// NewPurchaseOrderHandler creates a new PurchaseOrderHandler.
func NewPurchaseOrderHandler(service *services.PurchaseOrderService, db *sqlx.DB) *PurchaseOrderHandler {
	return &PurchaseOrderHandler{service: service, db: db}
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

	order, err := h.service.Receive(c.Request.Context(), id, receivedItems)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
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
