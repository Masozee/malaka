package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
)

// CashDisbursementHandler handles HTTP requests for cash disbursement operations.
type CashDisbursementHandler struct {
	service *services.CashDisbursementService
}

// NewCashDisbursementHandler creates a new CashDisbursementHandler.
func NewCashDisbursementHandler(service *services.CashDisbursementService) *CashDisbursementHandler {
	return &CashDisbursementHandler{service: service}
}

// CreateCashDisbursement handles the creation of a new cash disbursement.
func (h *CashDisbursementHandler) CreateCashDisbursement(c *gin.Context) {
	var req dto.CashDisbursementCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	cashDisbursement := req.ToCashDisbursementEntity()
	if err := h.service.CreateCashDisbursement(c.Request.Context(), cashDisbursement); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create cash disbursement", err)
		return
	}

	resp := dto.FromCashDisbursementEntity(cashDisbursement)
	response.Success(c, http.StatusCreated, "Cash disbursement created successfully", resp)
}

// GetCashDisbursementByID handles the retrieval of a cash disbursement by ID.
func (h *CashDisbursementHandler) GetCashDisbursementByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	cashDisbursement, err := h.service.GetCashDisbursementByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Cash disbursement not found", err)
		return
	}

	resp := dto.FromCashDisbursementEntity(cashDisbursement)
	response.Success(c, http.StatusOK, "Cash disbursement retrieved successfully", resp)
}

// UpdateCashDisbursement handles the update of an existing cash disbursement.
func (h *CashDisbursementHandler) UpdateCashDisbursement(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	var req dto.CashDisbursementUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	cashDisbursement := req.ToCashDisbursementEntity()
	cashDisbursement.ID = id

	if err := h.service.UpdateCashDisbursement(c.Request.Context(), cashDisbursement); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update cash disbursement", err)
		return
	}

	resp := dto.FromCashDisbursementEntity(cashDisbursement)
	response.Success(c, http.StatusOK, "Cash disbursement updated successfully", resp)
}

// DeleteCashDisbursement handles the deletion of a cash disbursement by ID.
func (h *CashDisbursementHandler) DeleteCashDisbursement(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	if err := h.service.DeleteCashDisbursement(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete cash disbursement", err)
		return
	}

	response.Success(c, http.StatusOK, "Cash disbursement deleted successfully", nil)
}