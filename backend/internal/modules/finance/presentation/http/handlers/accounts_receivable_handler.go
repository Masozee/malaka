package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// AccountsReceivableHandler handles HTTP requests for accounts receivable operations.
type AccountsReceivableHandler struct {
	service *services.AccountsReceivableService
}

// NewAccountsReceivableHandler creates a new AccountsReceivableHandler.
func NewAccountsReceivableHandler(service *services.AccountsReceivableService) *AccountsReceivableHandler {
	return &AccountsReceivableHandler{service: service}
}

// CreateAccountsReceivable handles the creation of a new accounts receivable.
func (h *AccountsReceivableHandler) CreateAccountsReceivable(c *gin.Context) {
	var req dto.AccountsReceivableCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	accountsReceivable := req.ToAccountsReceivableEntity()
	if err := h.service.CreateAccountsReceivable(c.Request.Context(), accountsReceivable); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create accounts receivable", err)
		return
	}

	resp := dto.FromAccountsReceivableEntity(accountsReceivable)
	response.Success(c, http.StatusCreated, "Accounts receivable created successfully", resp)
}

// GetAccountsReceivableByID handles the retrieval of accounts receivable by ID.
func (h *AccountsReceivableHandler) GetAccountsReceivableByID(c *gin.Context) {
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

	accountsReceivable, err := h.service.GetAccountsReceivableByID(c.Request.Context(), parsedID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Accounts receivable not found", err)
		return
	}

	resp := dto.FromAccountsReceivableEntity(accountsReceivable)
	response.Success(c, http.StatusOK, "Accounts receivable retrieved successfully", resp)
}

// UpdateAccountsReceivable handles the update of an existing accounts receivable.
func (h *AccountsReceivableHandler) UpdateAccountsReceivable(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	var req dto.AccountsReceivableUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	accountsReceivable := req.ToAccountsReceivableEntity()
	accountsReceivable.ID = parsedID

	if err := h.service.UpdateAccountsReceivable(c.Request.Context(), accountsReceivable); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update accounts receivable", err)
		return
	}

	resp := dto.FromAccountsReceivableEntity(accountsReceivable)
	response.Success(c, http.StatusOK, "Accounts receivable updated successfully", resp)
}

// DeleteAccountsReceivable handles the deletion of accounts receivable by ID.
func (h *AccountsReceivableHandler) DeleteAccountsReceivable(c *gin.Context) {
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

	if err := h.service.DeleteAccountsReceivable(c.Request.Context(), parsedID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete accounts receivable", err)
		return
	}

	response.Success(c, http.StatusOK, "Accounts receivable deleted successfully", nil)
}