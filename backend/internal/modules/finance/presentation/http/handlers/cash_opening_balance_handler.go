package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
)

// CashOpeningBalanceHandler handles HTTP requests for cash opening balance operations.
type CashOpeningBalanceHandler struct {
	service *services.CashOpeningBalanceService
}

// NewCashOpeningBalanceHandler creates a new CashOpeningBalanceHandler.
func NewCashOpeningBalanceHandler(service *services.CashOpeningBalanceService) *CashOpeningBalanceHandler {
	return &CashOpeningBalanceHandler{service: service}
}

// CreateCashOpeningBalance handles the creation of a new cash opening balance.
func (h *CashOpeningBalanceHandler) CreateCashOpeningBalance(c *gin.Context) {
	var req dto.CashOpeningBalanceCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	balance := req.ToCashOpeningBalanceEntity()
	if err := h.service.CreateCashOpeningBalance(c.Request.Context(), balance); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create cash opening balance", err)
		return
	}

	resp := dto.FromCashOpeningBalanceEntity(balance)
	response.Success(c, http.StatusCreated, "Cash opening balance created successfully", resp)
}

// GetCashOpeningBalanceByID handles the retrieval of a cash opening balance by ID.
func (h *CashOpeningBalanceHandler) GetCashOpeningBalanceByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	balance, err := h.service.GetCashOpeningBalanceByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Cash opening balance not found", err)
		return
	}

	resp := dto.FromCashOpeningBalanceEntity(balance)
	response.Success(c, http.StatusOK, "Cash opening balance retrieved successfully", resp)
}

// GetAllCashOpeningBalances handles the retrieval of all cash opening balances.
func (h *CashOpeningBalanceHandler) GetAllCashOpeningBalances(c *gin.Context) {
	balances, err := h.service.GetAllCashOpeningBalances(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve cash opening balances", err)
		return
	}

	var responses []*dto.CashOpeningBalanceResponse
	for _, balance := range balances {
		responses = append(responses, dto.FromCashOpeningBalanceEntity(balance))
	}

	response.Success(c, http.StatusOK, "Cash opening balances retrieved successfully", responses)
}

// UpdateCashOpeningBalance handles the update of an existing cash opening balance.
func (h *CashOpeningBalanceHandler) UpdateCashOpeningBalance(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	var req dto.CashOpeningBalanceUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	balance := req.ToCashOpeningBalanceEntity()
	balance.ID = id

	if err := h.service.UpdateCashOpeningBalance(c.Request.Context(), balance); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update cash opening balance", err)
		return
	}

	resp := dto.FromCashOpeningBalanceEntity(balance)
	response.Success(c, http.StatusOK, "Cash opening balance updated successfully", resp)
}

// DeleteCashOpeningBalance handles the deletion of a cash opening balance by ID.
func (h *CashOpeningBalanceHandler) DeleteCashOpeningBalance(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	if err := h.service.DeleteCashOpeningBalance(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete cash opening balance", err)
		return
	}

	response.Success(c, http.StatusOK, "Cash opening balance deleted successfully", nil)
}