package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/services"
	"malaka/internal/modules/sales/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/utils"
)

// PosTransactionHandler handles HTTP requests for POS transaction operations.
type PosTransactionHandler struct {
	service *services.PosTransactionService
}

// NewPosTransactionHandler creates a new PosTransactionHandler.
func NewPosTransactionHandler(service *services.PosTransactionService) *PosTransactionHandler {
	return &PosTransactionHandler{service: service}
}

// CreatePosTransaction handles the creation of a new POS transaction.
func (h *PosTransactionHandler) CreatePosTransaction(c *gin.Context) {
	var req dto.CreatePosTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	pt := &entities.PosTransaction{
		TransactionDate: utils.Now(),
		TotalAmount:     req.TotalAmount,
		PaymentMethod:   req.PaymentMethod,
		CashierID:       req.CashierID,
	}

	var items []*entities.PosItem
	for _, itemReq := range req.Items {
		items = append(items, &entities.PosItem{
			ArticleID: itemReq.ArticleID,
			Quantity:  itemReq.Quantity,
			UnitPrice: itemReq.UnitPrice,
			TotalPrice: itemReq.TotalPrice,
		})
	}

	if err := h.service.CreatePosTransaction(c.Request.Context(), pt, items); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "POS transaction created successfully", pt)
}

// GetAllPosTransactions handles retrieving all POS transactions.
func (h *PosTransactionHandler) GetAllPosTransactions(c *gin.Context) {
	transactions, err := h.service.GetAllPosTransactions(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales orders retrieved successfully", transactions)
}

// GetPosTransactionByID handles retrieving a POS transaction by its ID.
func (h *PosTransactionHandler) GetPosTransactionByID(c *gin.Context) {
	id := c.Param("id")
	pt, err := h.service.GetPosTransactionByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if pt == nil {
		response.NotFound(c, "POS transaction not found", nil)
		return
	}

	response.OK(c, "POS transaction retrieved successfully", pt)
}

// UpdatePosTransaction handles updating an existing POS transaction.
func (h *PosTransactionHandler) UpdatePosTransaction(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdatePosTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	pt := &entities.PosTransaction{
		TransactionDate: utils.Now(),
		TotalAmount:     req.TotalAmount,
		PaymentMethod:   req.PaymentMethod,
		CashierID:       req.CashierID,
	}
	pt.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdatePosTransaction(c.Request.Context(), pt); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "POS transaction updated successfully", pt)
}

// DeletePosTransaction handles deleting a POS transaction by its ID.
func (h *PosTransactionHandler) DeletePosTransaction(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeletePosTransaction(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "POS transaction deleted successfully", nil)
}
