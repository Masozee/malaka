package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// CashReceiptHandler handles HTTP requests for cash receipt operations.
type CashReceiptHandler struct {
	service *services.CashReceiptService
}

// NewCashReceiptHandler creates a new CashReceiptHandler.
func NewCashReceiptHandler(service *services.CashReceiptService) *CashReceiptHandler {
	return &CashReceiptHandler{service: service}
}

// CreateCashReceipt handles the creation of a new cash receipt.
func (h *CashReceiptHandler) CreateCashReceipt(c *gin.Context) {
	var req dto.CashReceiptCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	cashReceipt := req.ToCashReceiptEntity()
	if err := h.service.CreateCashReceipt(c.Request.Context(), cashReceipt); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create cash receipt", err)
		return
	}

	resp := dto.FromCashReceiptEntity(cashReceipt)
	response.Success(c, http.StatusCreated, "Cash receipt created successfully", resp)
}

// GetCashReceiptByID handles the retrieval of a cash receipt by ID.
func (h *CashReceiptHandler) GetCashReceiptByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	cashReceipt, err := h.service.GetCashReceiptByID(c.Request.Context(), parsedID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Cash receipt not found", err)
		return
	}

	resp := dto.FromCashReceiptEntity(cashReceipt)
	response.Success(c, http.StatusOK, "Cash receipt retrieved successfully", resp)
}

// UpdateCashReceipt handles the update of an existing cash receipt.
func (h *CashReceiptHandler) UpdateCashReceipt(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	var req dto.CashReceiptUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	cashReceipt := req.ToCashReceiptEntity()
	cashReceipt.ID = parsedID

	if err := h.service.UpdateCashReceipt(c.Request.Context(), cashReceipt); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update cash receipt", err)
		return
	}

	resp := dto.FromCashReceiptEntity(cashReceipt)
	response.Success(c, http.StatusOK, "Cash receipt updated successfully", resp)
}

// DeleteCashReceipt handles the deletion of a cash receipt by ID.
func (h *CashReceiptHandler) DeleteCashReceipt(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	if err := h.service.DeleteCashReceipt(c.Request.Context(), parsedID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete cash receipt", err)
		return
	}

	response.Success(c, http.StatusOK, "Cash receipt deleted successfully", nil)
}