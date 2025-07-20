package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
)

// CashBankHandler handles HTTP requests for cash/bank operations.
type CashBankHandler struct {
	service *services.CashBankService
}

// NewCashBankHandler creates a new CashBankHandler.
func NewCashBankHandler(service *services.CashBankService) *CashBankHandler {
	return &CashBankHandler{service: service}
}

// CreateCashBank handles the creation of a new cash/bank account.
func (h *CashBankHandler) CreateCashBank(c *gin.Context) {
	var req dto.CashBankCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	cashBank := req.ToCashBankEntity()
	if err := h.service.CreateCashBank(c.Request.Context(), cashBank); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create cash/bank account", err)
		return
	}

	resp := dto.FromCashBankEntity(cashBank)
	response.Success(c, http.StatusCreated, "Cash/bank account created successfully", resp)
}

// GetCashBankByID handles the retrieval of a cash/bank account by ID.
func (h *CashBankHandler) GetCashBankByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	cashBank, err := h.service.GetCashBankByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Cash/bank account not found", err)
		return
	}

	resp := dto.FromCashBankEntity(cashBank)
	response.Success(c, http.StatusOK, "Cash/bank account retrieved successfully", resp)
}

// UpdateCashBank handles the update of an existing cash/bank account.
func (h *CashBankHandler) UpdateCashBank(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	var req dto.CashBankUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	cashBank := req.ToCashBankEntity()
	cashBank.ID = id

	if err := h.service.UpdateCashBank(c.Request.Context(), cashBank); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update cash/bank account", err)
		return
	}

	resp := dto.FromCashBankEntity(cashBank)
	response.Success(c, http.StatusOK, "Cash/bank account updated successfully", resp)
}

// DeleteCashBank handles the deletion of a cash/bank account by ID.
func (h *CashBankHandler) DeleteCashBank(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	if err := h.service.DeleteCashBank(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete cash/bank account", err)
		return
	}

	response.Success(c, http.StatusOK, "Cash/bank account deleted successfully", nil)
}