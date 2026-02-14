package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// InvoiceHandler handles HTTP requests for invoice operations.
type InvoiceHandler struct {
	service *services.InvoiceService
}

// NewInvoiceHandler creates a new InvoiceHandler.
func NewInvoiceHandler(service *services.InvoiceService) *InvoiceHandler {
	return &InvoiceHandler{service: service}
}

// CreateInvoice handles the creation of a new invoice.
func (h *InvoiceHandler) CreateInvoice(c *gin.Context) {
	var req dto.InvoiceCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	invoice := req.ToInvoiceEntity()
	if err := h.service.CreateInvoice(c.Request.Context(), invoice); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create invoice", err)
		return
	}

	resp := dto.FromInvoiceEntity(invoice)
	response.Success(c, http.StatusCreated, "Invoice created successfully", resp)
}

// GetInvoiceByID handles the retrieval of an invoice by ID.
func (h *InvoiceHandler) GetInvoiceByID(c *gin.Context) {
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

	invoice, err := h.service.GetInvoiceByID(c.Request.Context(), parsedID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Invoice not found", err)
		return
	}

	resp := dto.FromInvoiceEntity(invoice)
	response.Success(c, http.StatusOK, "Invoice retrieved successfully", resp)
}

// GetAllInvoices handles the retrieval of all invoices.
func (h *InvoiceHandler) GetAllInvoices(c *gin.Context) {
	invoices, err := h.service.GetAllInvoices(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve invoices", err)
		return
	}

	var responses []*dto.InvoiceResponse
	for _, inv := range invoices {
		responses = append(responses, dto.FromInvoiceEntity(inv))
	}

	response.Success(c, http.StatusOK, "Invoices retrieved successfully", responses)
}

// UpdateInvoice handles the update of an existing invoice.
func (h *InvoiceHandler) UpdateInvoice(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	var req dto.InvoiceUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	invoice := req.ToInvoiceEntity()
	invoice.ID = parsedID

	if err := h.service.UpdateInvoice(c.Request.Context(), invoice); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update invoice", err)
		return
	}

	resp := dto.FromInvoiceEntity(invoice)
	response.Success(c, http.StatusOK, "Invoice updated successfully", resp)
}

// DeleteInvoice handles the deletion of an invoice by ID.
func (h *InvoiceHandler) DeleteInvoice(c *gin.Context) {
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

	if err := h.service.DeleteInvoice(c.Request.Context(), parsedID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete invoice", err)
		return
	}

	response.Success(c, http.StatusOK, "Invoice deleted successfully", nil)
}