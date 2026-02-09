package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"malaka/internal/modules/shipping/domain"
	"malaka/internal/modules/shipping/domain/dtos"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// ShippingInvoiceHandler handles HTTP requests for shipping invoices.
type ShippingInvoiceHandler struct {
	service domain.ShippingInvoiceService
}

// NewShippingInvoiceHandler creates a new ShippingInvoiceHandler instance.
func NewShippingInvoiceHandler(service domain.ShippingInvoiceService) *ShippingInvoiceHandler {
	return &ShippingInvoiceHandler{
		service: service,
	}
}

// CreateShippingInvoice handles the creation of a new shipping invoice.
func (h *ShippingInvoiceHandler) CreateShippingInvoice(c *gin.Context) {
	var request dtos.CreateShippingInvoiceRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	invoice, err := h.service.CreateShippingInvoice(c.Request.Context(), &request)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create shipping invoice", nil)
		return
	}

	response.Created(c, "Shipping invoice created successfully", invoice)
}

// GetShippingInvoiceByID handles retrieving a shipping invoice by ID.
func (h *ShippingInvoiceHandler) GetShippingInvoiceByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	invoice, err := h.service.GetShippingInvoiceByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Shipping invoice not found", nil)
		return
	}

	response.OK(c, "Shipping invoice retrieved successfully", invoice)
}

// GetShippingInvoiceByInvoiceNumber handles retrieving a shipping invoice by invoice number.
func (h *ShippingInvoiceHandler) GetShippingInvoiceByInvoiceNumber(c *gin.Context) {
	invoiceNumber := c.Param("invoice_number")
	if invoiceNumber == "" {
		response.Error(c, http.StatusBadRequest, "Invoice number is required", nil)
		return
	}

	invoice, err := h.service.GetShippingInvoiceByInvoiceNumber(c.Request.Context(), invoiceNumber)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Shipping invoice not found", nil)
		return
	}

	response.OK(c, "Shipping invoice retrieved successfully", invoice)
}

// GetShippingInvoicesByShipmentID handles retrieving shipping invoices by shipment ID.
func (h *ShippingInvoiceHandler) GetShippingInvoicesByShipmentID(c *gin.Context) {
	idStr := c.Param("shipment_id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid shipment ID format", nil)
		return
	}

	invoices, err := h.service.GetShippingInvoicesByShipmentID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve shipping invoices", nil)
		return
	}

	response.OK(c, "Shipping invoices retrieved successfully", invoices)
}

// GetShippingInvoicesByCourierID handles retrieving shipping invoices by courier ID.
func (h *ShippingInvoiceHandler) GetShippingInvoicesByCourierID(c *gin.Context) {
	idStr := c.Param("courier_id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid courier ID format", nil)
		return
	}

	invoices, err := h.service.GetShippingInvoicesByCourierID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve shipping invoices", nil)
		return
	}

	response.OK(c, "Shipping invoices retrieved successfully", invoices)
}

// GetShippingInvoicesByStatus handles retrieving shipping invoices by status.
func (h *ShippingInvoiceHandler) GetShippingInvoicesByStatus(c *gin.Context) {
	status := c.Param("status")
	if status == "" {
		response.Error(c, http.StatusBadRequest, "Status is required", nil)
		return
	}

	invoices, err := h.service.GetShippingInvoicesByStatus(c.Request.Context(), status)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve shipping invoices", nil)
		return
	}

	response.OK(c, "Shipping invoices retrieved successfully", invoices)
}

// GetAllShippingInvoices handles retrieving all shipping invoices with pagination.
func (h *ShippingInvoiceHandler) GetAllShippingInvoices(c *gin.Context) {
	page := 1
	pageSize := 10

	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if pageSizeStr := c.Query("page_size"); pageSizeStr != "" {
		if ps, err := strconv.Atoi(pageSizeStr); err == nil && ps > 0 && ps <= 100 {
			pageSize = ps
		}
	}

	invoices, totalCount, err := h.service.GetAllShippingInvoices(c.Request.Context(), page, pageSize)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve shipping invoices", nil)
		return
	}

	responseData := dtos.ShippingInvoiceListResponse{
		Data:       []dtos.ShippingInvoiceResponse{},
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
	}

	// Convert entities to response DTOs
	for _, invoice := range invoices {
		responseData.Data = append(responseData.Data, dtos.ShippingInvoiceResponse{
			ID:             invoice.ID,
			InvoiceNumber:  invoice.InvoiceNumber,
			ShipmentID:     invoice.ShipmentID,
			CourierID:      invoice.CourierID,
			InvoiceDate:    invoice.InvoiceDate,
			DueDate:        invoice.DueDate,
			Origin:         invoice.Origin,
			Destination:    invoice.Destination,
			Weight:         invoice.Weight,
			BaseRate:       invoice.BaseRate,
			AdditionalFees: invoice.AdditionalFees,
			TaxAmount:      invoice.TaxAmount,
			TotalAmount:    invoice.TotalAmount,
			Status:         invoice.Status,
			PaidAt:         invoice.PaidAt,
			Notes:          invoice.Notes,
			CreatedAt:      invoice.CreatedAt,
			UpdatedAt:      invoice.UpdatedAt,
		})
	}

	response.OK(c, "Shipping invoices retrieved successfully", responseData)
}

// UpdateShippingInvoice handles updating an existing shipping invoice.
func (h *ShippingInvoiceHandler) UpdateShippingInvoice(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	var request dtos.UpdateShippingInvoiceRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	invoice, err := h.service.UpdateShippingInvoice(c.Request.Context(), id, &request)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update shipping invoice", nil)
		return
	}

	response.OK(c, "Shipping invoice updated successfully", invoice)
}

// DeleteShippingInvoice handles deleting a shipping invoice by ID.
func (h *ShippingInvoiceHandler) DeleteShippingInvoice(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	if err := h.service.DeleteShippingInvoice(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete shipping invoice", nil)
		return
	}

	response.OK(c, "Shipping invoice deleted successfully", nil)
}

// PayShippingInvoice handles marking a shipping invoice as paid.
func (h *ShippingInvoiceHandler) PayShippingInvoice(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	var request dtos.PayShippingInvoiceRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	invoice, err := h.service.PayShippingInvoice(c.Request.Context(), id, &request)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to pay shipping invoice", nil)
		return
	}

	response.OK(c, "Shipping invoice paid successfully", invoice)
}

// GetOverdueShippingInvoices handles retrieving overdue shipping invoices.
func (h *ShippingInvoiceHandler) GetOverdueShippingInvoices(c *gin.Context) {
	invoices, err := h.service.GetOverdueShippingInvoices(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve overdue shipping invoices", nil)
		return
	}

	response.OK(c, "Overdue shipping invoices retrieved successfully", invoices)
}
