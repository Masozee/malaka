package handlers

import (
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

type PurchaseVoucherHandler struct {
	service services.PurchaseVoucherService
}

func NewPurchaseVoucherHandler(service services.PurchaseVoucherService) *PurchaseVoucherHandler {
	return &PurchaseVoucherHandler{
		service: service,
	}
}

func (h *PurchaseVoucherHandler) CreatePurchaseVoucher(c *gin.Context) {
	var req dto.CreatePurchaseVoucherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	voucher := dto.ToPurchaseVoucherEntity(&req)
	voucher.ID = uuid.New()
	voucher.CreatedAt = time.Now()
	voucher.UpdatedAt = time.Now()

	if err := h.service.CreatePurchaseVoucher(c.Request.Context(), voucher); err != nil {
		response.InternalServerError(c, "Failed to create purchase voucher", err.Error())
		return
	}

	response.Created(c, "Purchase voucher created successfully", dto.ToPurchaseVoucherResponse(voucher))
}

func (h *PurchaseVoucherHandler) GetPurchaseVoucherByID(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	voucher, err := h.service.GetPurchaseVoucherByID(c.Request.Context(), parsedID)
	if err != nil {
		response.NotFound(c, "Purchase voucher not found", err.Error())
		return
	}

	response.OK(c, "Purchase voucher retrieved successfully", dto.ToPurchaseVoucherResponse(voucher))
}

func (h *PurchaseVoucherHandler) GetAllPurchaseVouchers(c *gin.Context) {
	vouchers, err := h.service.GetAllPurchaseVouchers(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve purchase vouchers", err.Error())
		return
	}

	var responses []*dto.PurchaseVoucherResponse
	for _, voucher := range vouchers {
		responses = append(responses, dto.ToPurchaseVoucherResponse(voucher))
	}

	response.OK(c, "Purchase vouchers retrieved successfully", responses)
}

func (h *PurchaseVoucherHandler) UpdatePurchaseVoucher(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	var req dto.UpdatePurchaseVoucherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	voucher, err := h.service.GetPurchaseVoucherByID(c.Request.Context(), parsedID)
	if err != nil {
		response.NotFound(c, "Purchase voucher not found", err.Error())
		return
	}

	parsedSupplierID, err := uuid.Parse(req.SupplierID)
	if err != nil {
		response.BadRequest(c, "Invalid SupplierID", err.Error())
		return
	}

	parsedInvoiceID, err := uuid.Parse(req.InvoiceID)
	if err != nil {
		response.BadRequest(c, "Invalid InvoiceID", err.Error())
		return
	}

	voucher.VoucherNumber = req.VoucherNumber
	voucher.VoucherDate = req.VoucherDate
	voucher.SupplierID = parsedSupplierID
	voucher.InvoiceID = parsedInvoiceID
	voucher.TotalAmount = req.TotalAmount
	voucher.TaxAmount = req.TaxAmount
	voucher.GrandTotal = req.GrandTotal
	voucher.DueDate = req.DueDate
	voucher.Status = req.Status
	voucher.Description = req.Description
	voucher.UpdatedAt = time.Now()

	if err := h.service.UpdatePurchaseVoucher(c.Request.Context(), voucher); err != nil {
		response.InternalServerError(c, "Failed to update purchase voucher", err.Error())
		return
	}

	response.OK(c, "Purchase voucher updated successfully", dto.ToPurchaseVoucherResponse(voucher))
}

func (h *PurchaseVoucherHandler) DeletePurchaseVoucher(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	if err := h.service.DeletePurchaseVoucher(c.Request.Context(), parsedID); err != nil {
		response.InternalServerError(c, "Failed to delete purchase voucher", err.Error())
		return
	}

	response.OK(c, "Purchase voucher deleted successfully", nil)
}

func (h *PurchaseVoucherHandler) GetPurchaseVouchersByStatus(c *gin.Context) {
	status := c.Param("status")

	vouchers, err := h.service.GetPurchaseVouchersByStatus(c.Request.Context(), status)
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve purchase vouchers by status", err.Error())
		return
	}

	var responses []*dto.PurchaseVoucherResponse
	for _, voucher := range vouchers {
		responses = append(responses, dto.ToPurchaseVoucherResponse(voucher))
	}

	response.OK(c, "Purchase vouchers retrieved successfully", responses)
}

func (h *PurchaseVoucherHandler) ApprovePurchaseVoucher(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	var req dto.ApprovePurchaseVoucherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	parsedApprovedBy, err := uuid.Parse(req.ApprovedBy)
	if err != nil {
		response.BadRequest(c, "Invalid ApprovedBy ID", err.Error())
		return
	}

	if err := h.service.ApprovePurchaseVoucher(c.Request.Context(), parsedID, parsedApprovedBy); err != nil {
		response.InternalServerError(c, "Failed to approve purchase voucher", err.Error())
		return
	}

	voucher, _ := h.service.GetPurchaseVoucherByID(c.Request.Context(), parsedID)
	response.OK(c, "Purchase voucher approved successfully", dto.ToPurchaseVoucherResponse(voucher))
}