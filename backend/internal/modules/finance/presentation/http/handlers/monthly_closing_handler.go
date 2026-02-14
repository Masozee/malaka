package handlers

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

type MonthlyClosingHandler struct {
	service services.MonthlyClosingService
}

func NewMonthlyClosingHandler(service services.MonthlyClosingService) *MonthlyClosingHandler {
	return &MonthlyClosingHandler{
		service: service,
	}
}

func (h *MonthlyClosingHandler) CreateMonthlyClosing(c *gin.Context) {
	var req dto.CreateMonthlyClosingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	closing := dto.ToMonthlyClosingEntity(&req)
	closing.ID = uuid.New()
	closing.CreatedAt = time.Now()

	if err := h.service.CreateMonthlyClosing(c.Request.Context(), closing); err != nil {
		response.InternalServerError(c, "Failed to create monthly closing", err.Error())
		return
	}

	response.Created(c, "Monthly closing created successfully", dto.ToMonthlyClosingResponse(closing))
}

func (h *MonthlyClosingHandler) GetMonthlyClosingByID(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	closing, err := h.service.GetMonthlyClosingByID(c.Request.Context(), parsedID)
	if err != nil {
		response.NotFound(c, "Monthly closing not found", err.Error())
		return
	}

	response.OK(c, "Monthly closing retrieved successfully", dto.ToMonthlyClosingResponse(closing))
}

func (h *MonthlyClosingHandler) GetAllMonthlyClosings(c *gin.Context) {
	closings, err := h.service.GetAllMonthlyClosings(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve monthly closings", err.Error())
		return
	}

	var responses []*dto.MonthlyClosingResponse
	for _, closing := range closings {
		responses = append(responses, dto.ToMonthlyClosingResponse(closing))
	}

	response.OK(c, "Monthly closings retrieved successfully", responses)
}

func (h *MonthlyClosingHandler) UpdateMonthlyClosing(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	var req dto.UpdateMonthlyClosingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	closing, err := h.service.GetMonthlyClosingByID(c.Request.Context(), parsedID)
	if err != nil {
		response.NotFound(c, "Monthly closing not found", err.Error())
		return
	}

	closingDate, _ := time.Parse("2006-01-02", req.ClosingDate)
	if closingDate.IsZero() {
		closingDate, _ = time.Parse(time.RFC3339, req.ClosingDate)
	}

	closing.PeriodYear = req.PeriodYear
	closing.PeriodMonth = req.PeriodMonth
	closing.ClosingDate = closingDate
	closing.TotalRevenue = req.TotalRevenue
	closing.TotalExpenses = req.TotalExpenses
	closing.CashPosition = req.CashPosition
	closing.BankPosition = req.BankPosition
	closing.AccountsReceivable = req.AccountsReceivable
	closing.AccountsPayable = req.AccountsPayable
	closing.InventoryValue = req.InventoryValue
	closing.Status = req.Status

	if err := h.service.UpdateMonthlyClosing(c.Request.Context(), closing); err != nil {
		response.InternalServerError(c, "Failed to update monthly closing", err.Error())
		return
	}

	response.OK(c, "Monthly closing updated successfully", dto.ToMonthlyClosingResponse(closing))
}

func (h *MonthlyClosingHandler) DeleteMonthlyClosing(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	if err := h.service.DeleteMonthlyClosing(c.Request.Context(), parsedID); err != nil {
		response.InternalServerError(c, "Failed to delete monthly closing", err.Error())
		return
	}

	response.OK(c, "Monthly closing deleted successfully", nil)
}

func (h *MonthlyClosingHandler) GetMonthlyClosingByPeriod(c *gin.Context) {
	monthStr := c.Param("month")
	yearStr := c.Param("year")

	month, err := strconv.Atoi(monthStr)
	if err != nil {
		response.BadRequest(c, "Invalid month parameter", err.Error())
		return
	}

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		response.BadRequest(c, "Invalid year parameter", err.Error())
		return
	}

	closing, err := h.service.GetMonthlyClosingByPeriod(c.Request.Context(), month, year)
	if err != nil {
		response.NotFound(c, "Monthly closing not found", err.Error())
		return
	}

	response.OK(c, "Monthly closing retrieved successfully", dto.ToMonthlyClosingResponse(closing))
}

func (h *MonthlyClosingHandler) CloseMonth(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	var req dto.CloseMonthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request", err.Error())
		return
	}

	parsedClosedBy, err := uuid.Parse(req.ClosedBy)
	if err != nil {
		response.BadRequest(c, "Invalid ClosedBy ID", err.Error())
		return
	}

	if err := h.service.CloseMonth(c.Request.Context(), parsedID, parsedClosedBy); err != nil {
		response.InternalServerError(c, "Failed to close month", err.Error())
		return
	}

	closing, _ := h.service.GetMonthlyClosingByID(c.Request.Context(), parsedID)
	response.OK(c, "Month closed successfully", dto.ToMonthlyClosingResponse(closing))
}

func (h *MonthlyClosingHandler) LockClosing(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	if err := h.service.LockClosing(c.Request.Context(), parsedID); err != nil {
		response.InternalServerError(c, "Failed to lock closing", err.Error())
		return
	}

	closing, _ := h.service.GetMonthlyClosingByID(c.Request.Context(), parsedID)
	response.OK(c, "Closing locked successfully", dto.ToMonthlyClosingResponse(closing))
}

func (h *MonthlyClosingHandler) UnlockClosing(c *gin.Context) {
	id := c.Param("id")

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid ID", err.Error())
		return
	}

	if err := h.service.UnlockClosing(c.Request.Context(), parsedID); err != nil {
		response.InternalServerError(c, "Failed to unlock closing", err.Error())
		return
	}

	closing, _ := h.service.GetMonthlyClosingByID(c.Request.Context(), parsedID)
	response.OK(c, "Closing unlocked successfully", dto.ToMonthlyClosingResponse(closing))
}

func (h *MonthlyClosingHandler) GetOpenPeriods(c *gin.Context) {
	closings, err := h.service.GetOpenPeriods(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve open periods", err.Error())
		return
	}

	var responses []*dto.MonthlyClosingResponse
	for _, closing := range closings {
		responses = append(responses, dto.ToMonthlyClosingResponse(closing))
	}

	response.OK(c, "Open periods retrieved successfully", responses)
}
