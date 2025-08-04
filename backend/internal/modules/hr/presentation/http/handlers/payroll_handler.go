package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/modules/hr/domain/services"
	"malaka/internal/modules/hr/presentation/http/dto"
	"malaka/internal/shared/response"
)

// PayrollHandler handles HTTP requests for payroll operations
type PayrollHandler struct {
	payrollService services.PayrollService
}

// NewPayrollHandler creates a new payroll handler
func NewPayrollHandler(payrollService services.PayrollService) *PayrollHandler {
	return &PayrollHandler{
		payrollService: payrollService,
	}
}

// GetPayrollPeriods handles GET /payroll/periods
func (h *PayrollHandler) GetPayrollPeriods(c *gin.Context) {
	periods, err := h.payrollService.GetPayrollPeriods(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to get payroll periods", err.Error())
		return
	}

	var periodResponses []*dto.PayrollPeriodResponse
	for _, period := range periods {
		periodResponses = append(periodResponses, dto.ToPayrollPeriodResponse(period))
	}

	response.Success(c, http.StatusOK, "Payroll periods retrieved successfully", periodResponses)
}

// GetPayrollPeriodByID handles GET /payroll/periods/:id
func (h *PayrollHandler) GetPayrollPeriodByID(c *gin.Context) {
	id := c.Param("id")
	
	period, err := h.payrollService.GetPayrollPeriodByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Payroll period not found", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Payroll period retrieved successfully", dto.ToPayrollPeriodResponse(period))
}

// CreatePayrollPeriod handles POST /payroll/periods
func (h *PayrollHandler) CreatePayrollPeriod(c *gin.Context) {
	var req dto.PayrollPeriodRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	period := &entities.PayrollPeriod{
		ID:                  uuid.New(),
		PeriodYear:          req.Year,
		PeriodMonth:         req.Month,
		TotalEmployees:      req.TotalEmployees,
		Status:              entities.PayrollStatusDraft,
		TotalGrossSalary:    0,
		TotalNetSalary:      0,
		TotalDeductions:     0,
	}

	if req.Status != "" {
		period.Status = req.Status
	}

	err := h.payrollService.CreatePayrollPeriod(c.Request.Context(), period)
	if err != nil {
		response.BadRequest(c, "Failed to create payroll period", err.Error())
		return
	}

	response.Created(c, "Payroll period created successfully", dto.ToPayrollPeriodResponse(period))
}

// UpdatePayrollPeriod handles PUT /payroll/periods/:id
func (h *PayrollHandler) UpdatePayrollPeriod(c *gin.Context) {
	id := c.Param("id")
	
	var req dto.PayrollPeriodRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	// Get existing period
	existingPeriod, err := h.payrollService.GetPayrollPeriodByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Payroll period not found", err.Error())
		return
	}

	// Update fields
	existingPeriod.PeriodYear = req.Year
	existingPeriod.PeriodMonth = req.Month
	if req.TotalEmployees > 0 {
		existingPeriod.TotalEmployees = req.TotalEmployees
	}
	if req.Status != "" {
		existingPeriod.Status = req.Status
	}

	err = h.payrollService.UpdatePayrollPeriod(c.Request.Context(), existingPeriod)
	if err != nil {
		response.BadRequest(c, "Failed to update payroll period", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Payroll period updated successfully", dto.ToPayrollPeriodResponse(existingPeriod))
}

// DeletePayrollPeriod handles DELETE /payroll/periods/:id
func (h *PayrollHandler) DeletePayrollPeriod(c *gin.Context) {
	id := c.Param("id")
	
	err := h.payrollService.DeletePayrollPeriod(c.Request.Context(), id)
	if err != nil {
		response.BadRequest(c, "Failed to delete payroll period", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Payroll period deleted successfully", nil)
}

// GetSalaryCalculations handles GET /payroll/calculations
func (h *PayrollHandler) GetSalaryCalculations(c *gin.Context) {
	yearStr := c.Query("year")
	monthStr := c.Query("month")

	var calculations []*entities.SalaryCalculation
	var err error

	if yearStr != "" && monthStr != "" {
		year, err := strconv.Atoi(yearStr)
		if err != nil {
			response.BadRequest(c, "Invalid year parameter", err.Error())
			return
		}
		month, err := strconv.Atoi(monthStr)
		if err != nil {
			response.BadRequest(c, "Invalid month parameter", err.Error())
			return
		}
		calculations, err = h.payrollService.GetSalaryCalculationsByPeriod(c.Request.Context(), year, month)
	} else {
		calculations, err = h.payrollService.GetSalaryCalculations(c.Request.Context())
	}

	if err != nil {
		response.InternalServerError(c, "Failed to get salary calculations", err.Error())
		return
	}

	var calculationResponses []*dto.SalaryCalculationResponse
	for _, calc := range calculations {
		calculationResponses = append(calculationResponses, dto.ToSalaryCalculationResponse(calc))
	}

	response.Success(c, http.StatusOK, "Salary calculations retrieved successfully", calculationResponses)
}

// GetSalaryCalculationByID handles GET /payroll/calculations/:id
func (h *PayrollHandler) GetSalaryCalculationByID(c *gin.Context) {
	id := c.Param("id")
	
	calculation, err := h.payrollService.GetSalaryCalculationByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Salary calculation not found", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Salary calculation retrieved successfully", dto.ToSalaryCalculationResponse(calculation))
}

// ProcessPayroll handles POST /payroll/process
func (h *PayrollHandler) ProcessPayroll(c *gin.Context) {
	yearStr := c.Query("year")
	monthStr := c.Query("month")

	if yearStr == "" || monthStr == "" {
		response.BadRequest(c, "Year and month parameters are required", "")
		return
	}

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		response.BadRequest(c, "Invalid year parameter", err.Error())
		return
	}

	month, err := strconv.Atoi(monthStr)
	if err != nil {
		response.BadRequest(c, "Invalid month parameter", err.Error())
		return
	}

	err = h.payrollService.ProcessPayroll(c.Request.Context(), year, month)
	if err != nil {
		response.BadRequest(c, "Failed to process payroll", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Payroll processed successfully", nil)
}

// ApprovePayroll handles POST /payroll/approve/:id
func (h *PayrollHandler) ApprovePayroll(c *gin.Context) {
	id := c.Param("id")
	
	err := h.payrollService.ApprovePayroll(c.Request.Context(), id)
	if err != nil {
		response.BadRequest(c, "Failed to approve payroll", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Payroll approved successfully", nil)
}

// GetPayrollItems handles GET /payroll/items (for frontend compatibility)
func (h *PayrollHandler) GetPayrollItems(c *gin.Context) {
	yearStr := c.Query("year")
	monthStr := c.Query("month")

	if yearStr == "" || monthStr == "" {
		response.BadRequest(c, "Year and month parameters are required", "")
		return
	}

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		response.BadRequest(c, "Invalid year parameter", err.Error())
		return
	}

	month, err := strconv.Atoi(monthStr)
	if err != nil {
		response.BadRequest(c, "Invalid month parameter", err.Error())
		return
	}

	payrollItems, err := h.payrollService.GetPayrollItemsDTO(c.Request.Context(), year, month)
	if err != nil {
		response.InternalServerError(c, "Failed to get payroll items", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Payroll items retrieved successfully", payrollItems)
}