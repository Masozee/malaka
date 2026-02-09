package handlers

import (
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
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
	request.ID = uuid.New()
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

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	request, err := h.service.GetExpenditureRequestByID(c.Request.Context(), parsedID)
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

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	var req dto.UpdateExpenditureRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	request, err := h.service.GetExpenditureRequestByID(c.Request.Context(), parsedID)
	if err != nil {
		response.NotFound(c, "Expenditure request not found", err.Error())
		return
	}

	parsedRequestedBy, err := uuid.Parse(req.RequestedBy)
	if err != nil {
		response.BadRequest(c, "Invalid RequestedBy", err.Error())
		return
	}

	parsedCashBankID, err := uuid.Parse(req.CashBankID)
	if err != nil {
		response.BadRequest(c, "Invalid CashBankID", err.Error())
		return
	}

	request.RequestNumber = req.RequestNumber
	request.RequestDate = req.RequestDate
	request.RequestedBy = parsedRequestedBy
	request.CashBankID = parsedCashBankID
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

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	if err := h.service.DeleteExpenditureRequest(c.Request.Context(), parsedID); err != nil {
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

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	var req dto.ApproveExpenditureRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	parsedApprovedBy, err := uuid.Parse(req.ApprovedBy)
	if err != nil {
		response.BadRequest(c, "Invalid ApprovedBy ID", err.Error())
		return
	}

	if err := h.service.ApproveExpenditureRequest(c.Request.Context(), parsedID, parsedApprovedBy); err != nil {
		response.InternalServerError(c, "Failed to approve expenditure request", err.Error())
		return
	}

	request, _ := h.service.GetExpenditureRequestByID(c.Request.Context(), parsedID)
	response.OK(c, "Expenditure request approved successfully", dto.ToExpenditureRequestResponse(request))
}

func (h *ExpenditureRequestHandler) RejectExpenditureRequest(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	var req dto.RejectExpenditureRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	if err := h.service.RejectExpenditureRequest(c.Request.Context(), parsedID, req.RejectedReason); err != nil {
		response.InternalServerError(c, "Failed to reject expenditure request", err.Error())
		return
	}

	request, _ := h.service.GetExpenditureRequestByID(c.Request.Context(), parsedID)
	response.OK(c, "Expenditure request rejected successfully", dto.ToExpenditureRequestResponse(request))
}

func (h *ExpenditureRequestHandler) DisburseExpenditureRequest(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	var req dto.DisburseExpenditureRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	parsedDisbursedBy, err := uuid.Parse(req.DisbursedBy)
	if err != nil {
		response.BadRequest(c, "Invalid DisbursedBy ID", err.Error())
		return
	}

	if err := h.service.DisburseExpenditureRequest(c.Request.Context(), parsedID, parsedDisbursedBy); err != nil {
		response.InternalServerError(c, "Failed to disburse expenditure request", err.Error())
		return
	}

	request, _ := h.service.GetExpenditureRequestByID(c.Request.Context(), parsedID)
	response.OK(c, "Expenditure request disbursed successfully", dto.ToExpenditureRequestResponse(request))
}