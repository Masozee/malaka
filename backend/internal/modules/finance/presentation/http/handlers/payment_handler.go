package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// PaymentHandler handles HTTP requests for payment operations.
type PaymentHandler struct {
	service *services.PaymentService
}

// NewPaymentHandler creates a new PaymentHandler.
func NewPaymentHandler(service *services.PaymentService) *PaymentHandler {
	return &PaymentHandler{service: service}
}

// CreatePayment handles the creation of a new payment.
func (h *PaymentHandler) CreatePayment(c *gin.Context) {
	var req dto.PaymentCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	payment := req.ToPaymentEntity()
	if err := h.service.CreatePayment(c.Request.Context(), payment); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create payment", err)
		return
	}

	resp := dto.FromPaymentEntity(payment)
	response.Success(c, http.StatusCreated, "Payment created successfully", resp)
}

// GetPaymentByID handles the retrieval of a payment by ID.
func (h *PaymentHandler) GetPaymentByID(c *gin.Context) {
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

	payment, err := h.service.GetPaymentByID(c.Request.Context(), parsedID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Payment not found", err)
		return
	}

	resp := dto.FromPaymentEntity(payment)
	response.Success(c, http.StatusOK, "Payment retrieved successfully", resp)
}

// GetAllPayments handles the retrieval of all payments.
func (h *PaymentHandler) GetAllPayments(c *gin.Context) {
	payments, err := h.service.GetAllPayments(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve payments", err)
		return
	}

	var responses []*dto.PaymentResponse
	for _, p := range payments {
		responses = append(responses, dto.FromPaymentEntity(p))
	}

	response.Success(c, http.StatusOK, "Payments retrieved successfully", responses)
}

// UpdatePayment handles the update of an existing payment.
func (h *PaymentHandler) UpdatePayment(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	var req dto.PaymentUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	payment := req.ToPaymentEntity()
	payment.ID = parsedID

	if err := h.service.UpdatePayment(c.Request.Context(), payment); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update payment", err)
		return
	}

	resp := dto.FromPaymentEntity(payment)
	response.Success(c, http.StatusOK, "Payment updated successfully", resp)
}

// DeletePayment handles the deletion of a payment by ID.
func (h *PaymentHandler) DeletePayment(c *gin.Context) {
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

	if err := h.service.DeletePayment(c.Request.Context(), parsedID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete payment", err)
		return
	}

	response.Success(c, http.StatusOK, "Payment deleted successfully", nil)
}