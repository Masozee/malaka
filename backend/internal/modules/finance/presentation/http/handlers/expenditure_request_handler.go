package handlers

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
)

type ExpenditureRequestHandler struct {
	service services.ExpenditureRequestService
}

func NewExpenditureRequestHandler(service services.ExpenditureRequestService) *ExpenditureRequestHandler {
	return &ExpenditureRequestHandler{
		service: service,
	}
}

func (h *ExpenditureRequestHandler) CreateExpenditureRequest(c *gin.Context) {
	var req dto.CreateExpenditureRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	request := dto.ToExpenditureRequestEntity(&req)
	request.ID = uuid.New().String()
	request.CreatedAt = time.Now()
	request.UpdatedAt = time.Now()

	if err := h.service.CreateExpenditureRequest(c.Request.Context(), request); err != nil {
		response.InternalServerError(c, "Failed to create expenditure request", err.Error())
		return
	}

	response.Created(c, "Expenditure request created successfully", dto.ToExpenditureRequestResponse(request))
}

func (h *ExpenditureRequestHandler) GetExpenditureRequestByID(c *gin.Context) {
	id := c.Param("id")

	request, err := h.service.GetExpenditureRequestByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Expenditure request not found", err.Error())
		return
	}

	response.OK(c, "Expenditure request retrieved successfully", dto.ToExpenditureRequestResponse(request))
}

func (h *ExpenditureRequestHandler) GetAllExpenditureRequests(c *gin.Context) {
	requests, err := h.service.GetAllExpenditureRequests(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve expenditure requests", err.Error())
		return
	}

	var responses []*dto.ExpenditureRequestResponse
	for _, request := range requests {
		responses = append(responses, dto.ToExpenditureRequestResponse(request))
	}

	response.OK(c, "Expenditure requests retrieved successfully", responses)
}

func (h *ExpenditureRequestHandler) UpdateExpenditureRequest(c *gin.Context) {
	id := c.Param("id")

	var req dto.UpdateExpenditureRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	request, err := h.service.GetExpenditureRequestByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Expenditure request not found", err.Error())
		return
	}

	request.RequestNumber = req.RequestNumber
	request.RequestDate = req.RequestDate
	request.RequestedBy = req.RequestedBy
	request.CashBankID = req.CashBankID
	request.Amount = req.Amount
	request.Purpose = req.Purpose
	request.Description = req.Description
	request.Status = req.Status
	request.UpdatedAt = time.Now()

	if err := h.service.UpdateExpenditureRequest(c.Request.Context(), request); err != nil {
		response.InternalServerError(c, "Failed to update expenditure request", err.Error())
		return
	}

	response.OK(c, "Expenditure request updated successfully", dto.ToExpenditureRequestResponse(request))
}

func (h *ExpenditureRequestHandler) DeleteExpenditureRequest(c *gin.Context) {
	id := c.Param("id")

	if err := h.service.DeleteExpenditureRequest(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, "Failed to delete expenditure request", err.Error())
		return
	}

	response.OK(c, "Expenditure request deleted successfully", nil)
}

func (h *ExpenditureRequestHandler) GetExpenditureRequestsByStatus(c *gin.Context) {
	status := c.Param("status")

	requests, err := h.service.GetExpenditureRequestsByStatus(c.Request.Context(), status)
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve expenditure requests by status", err.Error())
		return
	}

	var responses []*dto.ExpenditureRequestResponse
	for _, request := range requests {
		responses = append(responses, dto.ToExpenditureRequestResponse(request))
	}

	response.OK(c, "Expenditure requests retrieved successfully", responses)
}

func (h *ExpenditureRequestHandler) ApproveExpenditureRequest(c *gin.Context) {
	id := c.Param("id")

	var req dto.ApproveExpenditureRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	if err := h.service.ApproveExpenditureRequest(c.Request.Context(), id, req.ApprovedBy); err != nil {
		response.InternalServerError(c, "Failed to approve expenditure request", err.Error())
		return
	}

	request, _ := h.service.GetExpenditureRequestByID(c.Request.Context(), id)
	response.OK(c, "Expenditure request approved successfully", dto.ToExpenditureRequestResponse(request))
}

func (h *ExpenditureRequestHandler) RejectExpenditureRequest(c *gin.Context) {
	id := c.Param("id")

	var req dto.RejectExpenditureRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	if err := h.service.RejectExpenditureRequest(c.Request.Context(), id, req.RejectedReason); err != nil {
		response.InternalServerError(c, "Failed to reject expenditure request", err.Error())
		return
	}

	request, _ := h.service.GetExpenditureRequestByID(c.Request.Context(), id)
	response.OK(c, "Expenditure request rejected successfully", dto.ToExpenditureRequestResponse(request))
}

func (h *ExpenditureRequestHandler) DisburseExpenditureRequest(c *gin.Context) {
	id := c.Param("id")

	var req dto.DisburseExpenditureRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	if err := h.service.DisburseExpenditureRequest(c.Request.Context(), id, req.DisbursedBy); err != nil {
		response.InternalServerError(c, "Failed to disburse expenditure request", err.Error())
		return
	}

	request, _ := h.service.GetExpenditureRequestByID(c.Request.Context(), id)
	response.OK(c, "Expenditure request disbursed successfully", dto.ToExpenditureRequestResponse(request))
}