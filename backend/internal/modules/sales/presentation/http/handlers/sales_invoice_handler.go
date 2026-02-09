package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/sales/domain/entities"
	"malaka/internal/modules/sales/domain/services"
	"malaka/internal/modules/sales/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/utils"
	"malaka/internal/shared/uuid"
)

// SalesInvoiceHandler handles HTTP requests for sales invoice operations.
type SalesInvoiceHandler struct {
	service services.SalesInvoiceService
}

// NewSalesInvoiceHandler creates a new SalesInvoiceHandler.
func NewSalesInvoiceHandler(service services.SalesInvoiceService) *SalesInvoiceHandler {
	return &SalesInvoiceHandler{service: service}
}

// CreateSalesInvoice handles the creation of a new sales invoice.
func (h *SalesInvoiceHandler) CreateSalesInvoice(c *gin.Context) {
	var req dto.CreateSalesInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	invoice := &entities.SalesInvoice{
		SalesOrderID: req.SalesOrderID,
		InvoiceDate:  utils.Now(),
		TotalAmount:  req.TotalAmount,
	}

	var items []*entities.SalesInvoiceItem
	for _, itemReq := range req.Items {
		items = append(items, &entities.SalesInvoiceItem{
			ArticleID: itemReq.ArticleID,
			Quantity:  itemReq.Quantity,
			UnitPrice: itemReq.UnitPrice,
			TotalPrice: itemReq.TotalPrice,
		})
	}

	if err := h.service.CreateSalesInvoice(c.Request.Context(), invoice, items); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales invoice created successfully", invoice)
}

// GetAllSalesInvoices handles retrieving all sales invoices.
func (h *SalesInvoiceHandler) GetAllSalesInvoices(c *gin.Context) {
	salesInvoices, err := h.service.GetAllSalesInvoices(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	response.OK(c, "Sales invoices retrieved successfully", salesInvoices)
}

// GetSalesInvoiceByID handles retrieving a sales invoice by its ID.
func (h *SalesInvoiceHandler) GetSalesInvoiceByID(c *gin.Context) {
	id := c.Param("id")
	invoice, err := h.service.GetSalesInvoiceByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if invoice == nil {
		response.NotFound(c, "Sales invoice not found", nil)
		return
	}

	response.OK(c, "Sales invoice retrieved successfully", invoice)
}

// UpdateSalesInvoice handles updating an existing sales invoice.
func (h *SalesInvoiceHandler) UpdateSalesInvoice(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateSalesInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", nil)
		return
	}

	invoice := &entities.SalesInvoice{
		SalesOrderID: req.SalesOrderID,
		InvoiceDate:  utils.Now(),
		TotalAmount:  req.TotalAmount,
	}
	invoice.ID = parsedID // Set the ID from the URL parameter

	if err := h.service.UpdateSalesInvoice(c.Request.Context(), invoice); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales invoice updated successfully", invoice)
}

// DeleteSalesInvoice handles deleting a sales invoice by its ID.
func (h *SalesInvoiceHandler) DeleteSalesInvoice(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteSalesInvoice(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Sales invoice deleted successfully", nil)
}
