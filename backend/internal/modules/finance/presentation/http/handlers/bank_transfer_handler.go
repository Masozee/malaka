package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
)

// BankTransferHandler handles HTTP requests for bank transfer operations.
type BankTransferHandler struct {
	service *services.BankTransferService
}

// NewBankTransferHandler creates a new BankTransferHandler.
func NewBankTransferHandler(service *services.BankTransferService) *BankTransferHandler {
	return &BankTransferHandler{service: service}
}

// CreateBankTransfer handles the creation of a new bank transfer.
func (h *BankTransferHandler) CreateBankTransfer(c *gin.Context) {
	var req dto.BankTransferCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	bankTransfer := req.ToBankTransferEntity()
	if err := h.service.CreateBankTransfer(c.Request.Context(), bankTransfer); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create bank transfer", err)
		return
	}

	resp := dto.FromBankTransferEntity(bankTransfer)
	response.Success(c, http.StatusCreated, "Bank transfer created successfully", resp)
}

// GetBankTransferByID handles the retrieval of a bank transfer by ID.
func (h *BankTransferHandler) GetBankTransferByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	bankTransfer, err := h.service.GetBankTransferByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Bank transfer not found", err)
		return
	}

	resp := dto.FromBankTransferEntity(bankTransfer)
	response.Success(c, http.StatusOK, "Bank transfer retrieved successfully", resp)
}

// UpdateBankTransfer handles the update of an existing bank transfer.
func (h *BankTransferHandler) UpdateBankTransfer(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	var req dto.BankTransferUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	bankTransfer := req.ToBankTransferEntity()
	bankTransfer.ID = id

	if err := h.service.UpdateBankTransfer(c.Request.Context(), bankTransfer); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update bank transfer", err)
		return
	}

	resp := dto.FromBankTransferEntity(bankTransfer)
	response.Success(c, http.StatusOK, "Bank transfer updated successfully", resp)
}

// DeleteBankTransfer handles the deletion of a bank transfer by ID.
func (h *BankTransferHandler) DeleteBankTransfer(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	if err := h.service.DeleteBankTransfer(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete bank transfer", err)
		return
	}

	response.Success(c, http.StatusOK, "Bank transfer deleted successfully", nil)
}