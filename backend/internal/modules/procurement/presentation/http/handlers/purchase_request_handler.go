package handlers

import (
	"context"
	"database/sql"
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"

	"malaka/internal/modules/notifications/domain/services"
	"malaka/internal/modules/procurement/domain/entities"
	"malaka/internal/modules/procurement/domain/repositories"
	procurement_services "malaka/internal/modules/procurement/domain/services"
	"malaka/internal/modules/procurement/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/utils"
	"malaka/internal/shared/uuid"
)

// PurchaseRequestHandler handles HTTP requests for purchase request operations.
type PurchaseRequestHandler struct {
	service             *procurement_services.PurchaseRequestService
	db                  *sqlx.DB
	notificationService *services.NotificationService
}

// NewPurchaseRequestHandler creates a new PurchaseRequestHandler.
func NewPurchaseRequestHandler(service *procurement_services.PurchaseRequestService, db *sqlx.DB, notificationService *services.NotificationService) *PurchaseRequestHandler {
	return &PurchaseRequestHandler{service: service, db: db, notificationService: notificationService}
}

// getUsersWithPermission looks up user IDs that have a specific RBAC permission
func (h *PurchaseRequestHandler) getUsersWithPermission(permissionCode string) []uuid.ID {
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
func (h *PurchaseRequestHandler) getUserName(userID string) string {
	var name string
	_ = h.db.QueryRow(`SELECT COALESCE(username, email) FROM users WHERE id = $1`, userID).Scan(&name)
	return name
}

// getDefaultUserID retrieves a default admin user ID from the database for development/testing.
func (h *PurchaseRequestHandler) getDefaultUserID() (string, error) {
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

// Create handles the creation of a new purchase request.
func (h *PurchaseRequestHandler) Create(c *gin.Context) {
	var req dto.CreatePurchaseRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get requester ID from request or auth context
	requesterID := req.RequesterID
	if requesterID == "" {
		requesterID = c.GetString("user_id")
	}

	// If still empty, get default user for development/testing
	if requesterID == "" {
		defaultUserID, err := h.getDefaultUserID()
		if err != nil {
			response.InternalServerError(c, "Failed to get default user: "+err.Error(), nil)
			return
		}
		if defaultUserID == "" {
			response.BadRequest(c, "requester_id is required and no default user found", nil)
			return
		}
		requesterID = defaultUserID
	}

	// Convert DTO to entity
	requesterUUID, _ := uuid.Parse(requesterID)
	pr := &entities.PurchaseRequest{
		Title:        req.Title,
		Description:  req.Description,
		RequesterID:  requesterUUID,
		Department:   req.Department,
		Priority:     req.Priority,
		RequiredDate: req.RequiredDate,
		Currency:     req.Currency,
	}
	if req.Notes != "" {
		pr.Notes = &req.Notes
	}

	// Convert items
	for _, itemDTO := range req.Items {
		item := &entities.PurchaseRequestItem{
			ItemName:       itemDTO.ItemName,
			Quantity:       itemDTO.Quantity,
			Unit:           itemDTO.Unit,
			EstimatedPrice: itemDTO.EstimatedPrice,
			Currency:       itemDTO.Currency,
		}
		if itemDTO.Description != "" {
			item.Description = &itemDTO.Description
		}
		if itemDTO.Specification != "" {
			item.Specification = &itemDTO.Specification
		}
		if itemDTO.SupplierID != "" {
			supplierUUID, _ := uuid.Parse(itemDTO.SupplierID)
			item.SupplierID = &supplierUUID
		}
		if item.Unit == "" {
			item.Unit = "pcs"
		}
		if item.Currency == "" {
			item.Currency = "IDR"
		}
		item.ID = uuid.New()
		item.CreatedAt = utils.Now()
		item.UpdatedAt = utils.Now()
		pr.Items = append(pr.Items, item)
	}

	if err := h.service.Create(c.Request.Context(), pr); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.Created(c, "Purchase request created successfully", pr)
}

// GetByID handles retrieving a purchase request by its ID.
func (h *PurchaseRequestHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	pr, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, err.Error(), nil)
		return
	}

	response.OK(c, "Purchase request retrieved successfully", pr)
}

// GetAll handles retrieving all purchase requests with filters.
func (h *PurchaseRequestHandler) GetAll(c *gin.Context) {
	filter := &repositories.PurchaseRequestFilter{
		Search:      c.Query("search"),
		Status:      c.Query("status"),
		Priority:    c.Query("priority"),
		Department:  c.Query("department"),
		RequesterID: c.Query("requester_id"),
		SortBy:      c.Query("sortBy"),
		SortOrder:   c.Query("sortOrder"),
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	filter.Page = page
	filter.Limit = limit

	purchaseRequests, total, err := h.service.GetAll(c.Request.Context(), filter)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	result := dto.PurchaseRequestListResponse{
		Data: purchaseRequests,
		Pagination: dto.Pagination{
			Page:      page,
			Limit:     limit,
			TotalRows: total,
		},
	}

	response.OK(c, "Purchase requests retrieved successfully", result)
}

// Update handles updating an existing purchase request.
func (h *PurchaseRequestHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdatePurchaseRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get existing PR
	existing, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, err.Error(), nil)
		return
	}

	// Update fields
	if req.Title != "" {
		existing.Title = req.Title
	}
	existing.Description = req.Description
	if req.Department != "" {
		existing.Department = req.Department
	}
	if req.Priority != "" {
		existing.Priority = req.Priority
	}
	if req.RequiredDate != nil {
		existing.RequiredDate = req.RequiredDate
	}
	if req.Currency != "" {
		existing.Currency = req.Currency
	}
	if req.Notes != "" {
		existing.Notes = &req.Notes
	}

	if err := h.service.Update(c.Request.Context(), existing); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Purchase request updated successfully", existing)
}

// Delete handles deleting a purchase request.
func (h *PurchaseRequestHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Purchase request deleted successfully", nil)
}

// Submit handles submitting a purchase request for approval.
func (h *PurchaseRequestHandler) Submit(c *gin.Context) {
	id := c.Param("id")
	pr, err := h.service.Submit(c.Request.Context(), id)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Notify approvers asynchronously
	if h.notificationService != nil {
		go func() {
			approverIDs := h.getUsersWithPermission("procurement.purchase-request.approve")
			if len(approverIDs) > 0 {
				requesterName := h.getUserName(pr.RequesterID.String())
				if err := h.notificationService.NotifyPurchaseRequestSubmitted(
					context.Background(), approverIDs, pr.ID.String(), pr.RequestNumber, requesterName,
				); err != nil {
					log.Printf("Failed to send PR submitted notification: %v", err)
				}
			}
		}()
	}

	response.OK(c, "Purchase request submitted successfully", pr)
}

// Approve handles approving a purchase request.
func (h *PurchaseRequestHandler) Approve(c *gin.Context) {
	id := c.Param("id")

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

	pr, err := h.service.Approve(c.Request.Context(), id, approverID)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Notify requester asynchronously
	if h.notificationService != nil {
		go func() {
			approverName := h.getUserName(approverID)
			if err := h.notificationService.NotifyPurchaseRequestApproved(
				context.Background(), pr.RequesterID, pr.RequestNumber, approverName,
			); err != nil {
				log.Printf("Failed to send PR approved notification: %v", err)
			}
		}()
	}

	response.OK(c, "Purchase request approved successfully", pr)
}

// Reject handles rejecting a purchase request.
func (h *PurchaseRequestHandler) Reject(c *gin.Context) {
	id := c.Param("id")
	var req dto.RejectPurchaseRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	rejectorID := c.GetString("user_id")
	pr, err := h.service.Reject(c.Request.Context(), id, req.Reason)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Notify requester asynchronously
	if h.notificationService != nil {
		go func() {
			rejectorName := h.getUserName(rejectorID)
			if err := h.notificationService.NotifyPurchaseRequestRejected(
				context.Background(), pr.RequesterID, pr.RequestNumber, rejectorName, req.Reason,
			); err != nil {
				log.Printf("Failed to send PR rejected notification: %v", err)
			}
		}()
	}

	response.OK(c, "Purchase request rejected successfully", pr)
}

// Cancel handles cancelling a purchase request.
func (h *PurchaseRequestHandler) Cancel(c *gin.Context) {
	id := c.Param("id")
	pr, err := h.service.Cancel(c.Request.Context(), id)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Purchase request cancelled successfully", pr)
}

// GetStats handles retrieving purchase request statistics.
func (h *PurchaseRequestHandler) GetStats(c *gin.Context) {
	stats, err := h.service.GetStats(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Purchase request statistics retrieved successfully", stats)
}

// AddItem handles adding an item to a purchase request.
func (h *PurchaseRequestHandler) AddItem(c *gin.Context) {
	prID := c.Param("id")
	var req dto.AddPurchaseRequestItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	prUUID, _ := uuid.Parse(prID)
	item := &entities.PurchaseRequestItem{
		PurchaseRequestID: prUUID,
		ItemName:          req.ItemName,
		Quantity:          req.Quantity,
		Unit:              req.Unit,
		EstimatedPrice:    req.EstimatedPrice,
		Currency:          req.Currency,
	}
	if req.Description != "" {
		item.Description = &req.Description
	}
	if req.Specification != "" {
		item.Specification = &req.Specification
	}
	if req.SupplierID != "" {
		supplierUUID, _ := uuid.Parse(req.SupplierID)
		item.SupplierID = &supplierUUID
	}
	if item.Unit == "" {
		item.Unit = "pcs"
	}
	if item.Currency == "" {
		item.Currency = "IDR"
	}

	if err := h.service.AddItem(c.Request.Context(), item); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.Created(c, "Item added to purchase request successfully", item)
}

// DeleteItem handles deleting an item from a purchase request.
func (h *PurchaseRequestHandler) DeleteItem(c *gin.Context) {
	prID := c.Param("id")
	itemID := c.Param("itemId")

	if err := h.service.DeleteItem(c.Request.Context(), prID, itemID); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Item deleted from purchase request successfully", nil)
}

// ConvertToPO handles converting an approved purchase request to a purchase order.
func (h *PurchaseRequestHandler) ConvertToPO(c *gin.Context) {
	prID := c.Param("id")

	var req dto.ConvertToPORequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Get user ID from auth context
	createdBy := c.GetString("user_id")
	if createdBy == "" {
		var err error
		createdBy, err = h.getDefaultUserID()
		if err != nil {
			response.InternalServerError(c, "Failed to determine user: "+err.Error(), nil)
			return
		}
		if createdBy == "" {
			response.BadRequest(c, "Authentication required", nil)
			return
		}
	}

	po, err := h.service.ConvertToPO(c.Request.Context(), prID, req.SupplierID, createdBy, req.DeliveryAddress, req.PaymentTerms)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Created(c, "Purchase request converted to purchase order successfully", po)
}
