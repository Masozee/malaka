package handlers

import (
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

type CheckClearanceHandler struct {
	service services.CheckClearanceService
}

func NewCheckClearanceHandler(service services.CheckClearanceService) *CheckClearanceHandler {
	return &CheckClearanceHandler{
		service: service,
	}
}

func (h *CheckClearanceHandler) CreateCheckClearance(c *gin.Context) {
	var req dto.CreateCheckClearanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	check := dto.ToCheckClearanceEntity(&req)
	check.ID = uuid.New()
	check.CreatedAt = time.Now()
	check.UpdatedAt = time.Now()

	if err := h.service.CreateCheckClearance(c.Request.Context(), check); err != nil {
		response.InternalServerError(c, "Failed to create check clearance", err.Error())
		return
	}

	response.Created(c, "Check clearance created successfully", dto.ToCheckClearanceResponse(check))
}

func (h *CheckClearanceHandler) GetCheckClearanceByID(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	check, err := h.service.GetCheckClearanceByID(c.Request.Context(), parsedID)
	if err != nil {
		response.NotFound(c, "Check clearance not found", err.Error())
		return
	}

	response.OK(c, "Check clearance retrieved successfully", dto.ToCheckClearanceResponse(check))
}

func (h *CheckClearanceHandler) GetAllCheckClearances(c *gin.Context) {
	checks, err := h.service.GetAllCheckClearances(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve check clearances", err.Error())
		return
	}

	var responses []*dto.CheckClearanceResponse
	for _, check := range checks {
		responses = append(responses, dto.ToCheckClearanceResponse(check))
	}

	response.OK(c, "Check clearances retrieved successfully", responses)
}

func (h *CheckClearanceHandler) UpdateCheckClearance(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	var req dto.UpdateCheckClearanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	check, err := h.service.GetCheckClearanceByID(c.Request.Context(), parsedID)
	if err != nil {
		response.NotFound(c, "Check clearance not found", err.Error())
		return
	}

	check.CheckNumber = req.CheckNumber
	check.CheckDate = req.CheckDate
	check.BankName = req.BankName
	check.AccountNumber = req.AccountNumber
	check.Amount = req.Amount
	check.PayeeName = req.PayeeName
	check.ClearanceDate = req.ClearanceDate
	check.Status = req.Status
	check.Memo = req.Memo
	check.UpdatedAt = time.Now()

	if err := h.service.UpdateCheckClearance(c.Request.Context(), check); err != nil {
		response.InternalServerError(c, "Failed to update check clearance", err.Error())
		return
	}

	response.OK(c, "Check clearance updated successfully", dto.ToCheckClearanceResponse(check))
}

func (h *CheckClearanceHandler) DeleteCheckClearance(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	if err := h.service.DeleteCheckClearance(c.Request.Context(), parsedID); err != nil {
		response.InternalServerError(c, "Failed to delete check clearance", err.Error())
		return
	}

	response.OK(c, "Check clearance deleted successfully", nil)
}

func (h *CheckClearanceHandler) GetCheckClearancesByStatus(c *gin.Context) {
	status := c.Param("status")

	checks, err := h.service.GetCheckClearancesByStatus(c.Request.Context(), status)
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve check clearances by status", err.Error())
		return
	}

	var responses []*dto.CheckClearanceResponse
	for _, check := range checks {
		responses = append(responses, dto.ToCheckClearanceResponse(check))
	}

	response.OK(c, "Check clearances retrieved successfully", responses)
}

func (h *CheckClearanceHandler) ClearCheck(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	var req dto.ClearCheckRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	if err := h.service.ClearCheck(c.Request.Context(), parsedID, req.ClearanceDate); err != nil {
		response.InternalServerError(c, "Failed to clear check", err.Error())
		return
	}

	check, _ := h.service.GetCheckClearanceByID(c.Request.Context(), parsedID)
	response.OK(c, "Check cleared successfully", dto.ToCheckClearanceResponse(check))
}

func (h *CheckClearanceHandler) BounceCheck(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	if err := h.service.BounceCheck(c.Request.Context(), parsedID); err != nil {
		response.InternalServerError(c, "Failed to bounce check", err.Error())
		return
	}

	check, _ := h.service.GetCheckClearanceByID(c.Request.Context(), parsedID)
	response.OK(c, "Check bounced successfully", dto.ToCheckClearanceResponse(check))
}
