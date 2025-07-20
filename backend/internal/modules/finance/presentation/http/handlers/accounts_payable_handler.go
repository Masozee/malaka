package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
)

// AccountsPayableHandler handles HTTP requests for accounts payable operations.
type AccountsPayableHandler struct {
	service *services.AccountsPayableService
}

// NewAccountsPayableHandler creates a new AccountsPayableHandler.
func NewAccountsPayableHandler(service *services.AccountsPayableService) *AccountsPayableHandler {
	return &AccountsPayableHandler{service: service}
}

// CreateAccountsPayable handles the creation of a new accounts payable.
func (h *AccountsPayableHandler) CreateAccountsPayable(c *gin.Context) {
	var req dto.AccountsPayableCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	accountsPayable := req.ToAccountsPayableEntity()
	if err := h.service.CreateAccountsPayable(c.Request.Context(), accountsPayable); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create accounts payable", err)
		return
	}

	resp := dto.FromAccountsPayableEntity(accountsPayable)
	response.Success(c, http.StatusCreated, "Accounts payable created successfully", resp)
}

// GetAccountsPayableByID handles the retrieval of accounts payable by ID.
func (h *AccountsPayableHandler) GetAccountsPayableByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	accountsPayable, err := h.service.GetAccountsPayableByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Accounts payable not found", err)
		return
	}

	resp := dto.FromAccountsPayableEntity(accountsPayable)
	response.Success(c, http.StatusOK, "Accounts payable retrieved successfully", resp)
}

// UpdateAccountsPayable handles the update of an existing accounts payable.
func (h *AccountsPayableHandler) UpdateAccountsPayable(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	var req dto.AccountsPayableUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	accountsPayable := req.ToAccountsPayableEntity()
	accountsPayable.ID = id

	if err := h.service.UpdateAccountsPayable(c.Request.Context(), accountsPayable); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update accounts payable", err)
		return
	}

	resp := dto.FromAccountsPayableEntity(accountsPayable)
	response.Success(c, http.StatusOK, "Accounts payable updated successfully", resp)
}

// DeleteAccountsPayable handles the deletion of accounts payable by ID.
func (h *AccountsPayableHandler) DeleteAccountsPayable(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	if err := h.service.DeleteAccountsPayable(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete accounts payable", err)
		return
	}

	response.Success(c, http.StatusOK, "Accounts payable deleted successfully", nil)
}