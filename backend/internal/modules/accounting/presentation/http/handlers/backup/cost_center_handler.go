package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"malaka/internal/modules/accounting/domain/entities"
	"malaka/internal/modules/accounting/domain/services"
	"malaka/internal/modules/accounting/presentation/http/dto"
	"malaka/internal/shared/response"
)

// CostCenterHandler handles HTTP requests for cost centers
type CostCenterHandler struct {
	service services.CostCenterService
}

// NewCostCenterHandler creates a new CostCenterHandler
func NewCostCenterHandler(service services.CostCenterService) *CostCenterHandler {
	return &CostCenterHandler{service: service}
}

// CreateCostCenter creates a new cost center
func (h *CostCenterHandler) CreateCostCenter(c *gin.Context) {
	var req dto.CostCenterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	costCenter := dto.MapCostCenterRequestToEntity(&req)
	costCenter.ID = uuid.New()

	if err := h.service.CreateCostCenter(c.Request.Context(), costCenter); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusCreated, dto.MapCostCenterEntityToResponse(costCenter))
}

// GetCostCenterByID retrieves a cost center by its ID
func (h *CostCenterHandler) GetCostCenterByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}

	costCenter, err := h.service.GetCostCenterByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error())
		return
	}

	response.Success(c, http.StatusOK, dto.MapCostCenterEntityToResponse(costCenter))
}

// GetAllCostCenters retrieves all cost centers
func (h *CostCenterHandler) GetAllCostCenters(c *gin.Context) {
	costCenters, err := h.service.GetAllCostCenters(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	var dtos []dto.CostCenterResponse
	for _, cc := range costCenters {
		dtos = append(dtos, *dto.MapCostCenterEntityToResponse(cc))
	}
	response.Success(c, http.StatusOK, dtos)
}

// UpdateCostCenter updates an existing cost center
func (h *CostCenterHandler) UpdateCostCenter(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}

	var req dto.CostCenterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	costCenter := dto.MapCostCenterRequestToEntity(&req)
	costCenter.ID = id

	if err := h.service.UpdateCostCenter(c.Request.Context(), costCenter); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusOK, dto.MapCostCenterEntityToResponse(costCenter))
}

// DeleteCostCenter deletes a cost center
func (h *CostCenterHandler) DeleteCostCenter(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}

	if err := h.service.DeleteCostCenter(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusNoContent, nil)
}

// CreateAllocation creates a new cost center allocation
func (h *CostCenterHandler) CreateAllocation(c *gin.Context) {
	var req dto.CostCenterAllocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	allocation := dto.MapCostCenterAllocationRequestToEntity(&req)
	allocation.ID = uuid.New()

	if err := h.service.CreateAllocation(c.Request.Context(), allocation); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusCreated, dto.MapCostCenterAllocationEntityToResponse(allocation))
}

// GetAllocationByID retrieves a cost center allocation by ID
func (h *CostCenterHandler) GetAllocationByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}

	allocation, err := h.service.GetAllocationByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error())
		return
	}

	response.Success(c, http.StatusOK, dto.MapCostCenterAllocationEntityToResponse(allocation))
}

// GetAllocationsByCostCenter retrieves allocations for a given cost center
func (h *CostCenterHandler) GetAllocationsByCostCenter(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}

	allocations, err := h.service.GetAllocationsByCostCenter(c.Request.Context(), costCenterID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	var dtos []dto.CostCenterAllocationResponse
	for _, alloc := range allocations {
		dtos = append(dtos, *dto.MapCostCenterAllocationEntityToResponse(alloc))
	}
	response.Success(c, http.StatusOK, dtos)
}

// UpdateAllocation updates an existing cost center allocation
func (h *CostCenterHandler) UpdateAllocation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}

	var req dto.CostCenterAllocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	allocation := dto.MapCostCenterAllocationRequestToEntity(&req)
	allocation.ID = id

	if err := h.service.UpdateAllocation(c.Request.Context(), allocation); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusOK, dto.MapCostCenterAllocationEntityToResponse(allocation))
}

// DeleteAllocation deletes a cost center allocation
func (h *CostCenterHandler) DeleteAllocation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}

	if err := h.service.DeleteAllocation(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(c, http.StatusNoContent, nil)
}

// GetCostCenterByCode retrieves a cost center by its code
func (h *CostCenterHandler) GetCostCenterByCode(c *gin.Context) {
	code := c.Param("code")
	costCenter, err := h.service.GetCostCenterByCode(c.Request.Context(), code)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error())
		return
	}
	response.Success(c, http.StatusOK, dto.MapCostCenterEntityToResponse(costCenter))
}

// GetCostCentersByType retrieves cost centers by type
func (h *CostCenterHandler) GetCostCentersByType(c *gin.Context) {
	typeStr := c.Param("type")
	costCenters, err := h.service.GetCostCentersByType(c.Request.Context(), entities.CostCenterType(typeStr))
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.CostCenterResponse
	for _, cc := range costCenters {
		dtos = append(dtos, *dto.MapCostCenterEntityToResponse(cc))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetCostCentersByManager retrieves cost centers by manager
func (h *CostCenterHandler) GetCostCentersByManager(c *gin.Context) {
	managerID := c.Param("manager_id")
	costCenters, err := h.service.GetCostCentersByManager(c.Request.Context(), managerID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.CostCenterResponse
	for _, cc := range costCenters {
		dtos = append(dtos, *dto.MapCostCenterEntityToResponse(cc))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetCostCentersByParent retrieves cost centers by parent
func (h *CostCenterHandler) GetCostCentersByParent(c *gin.Context) {
	parentIDStr := c.Param("parent_id")
	parentID, err := uuid.Parse(parentIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Parent ID format.")
		return
	}
	costCenters, err := h.service.GetCostCentersByParent(c.Request.Context(), parentID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.CostCenterResponse
	for _, cc := range costCenters {
		dtos = append(dtos, *dto.MapCostCenterEntityToResponse(cc))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetRootCostCenters retrieves root cost centers
func (h *CostCenterHandler) GetRootCostCenters(c *gin.Context) {
	companyID := c.Param("company_id")
	costCenters, err := h.service.GetRootCostCenters(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.CostCenterResponse
	for _, cc := range costCenters {
		dtos = append(dtos, *dto.MapCostCenterEntityToResponse(cc))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetCostCentersByCompany retrieves cost centers by company
func (h *CostCenterHandler) GetCostCentersByCompany(c *gin.Context) {
	companyID := c.Param("company_id")
	costCenters, err := h.service.GetCostCentersByCompany(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.CostCenterResponse
	for _, cc := range costCenters {
		dtos = append(dtos, *dto.MapCostCenterEntityToResponse(cc))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetActiveCostCentersByCompany retrieves active cost centers by company
func (h *CostCenterHandler) GetActiveCostCentersByCompany(c *gin.Context) {
	companyID := c.Param("company_id")
	costCenters, err := h.service.GetActiveCostCentersByCompany(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.CostCenterResponse
	for _, cc := range costCenters {
		dtos = append(dtos, *dto.MapCostCenterEntityToResponse(cc))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetCostCenterHierarchy retrieves cost center hierarchy
func (h *CostCenterHandler) GetCostCenterHierarchy(c *gin.Context) {
	companyID := c.Param("company_id")
	costCenters, err := h.service.GetCostCenterHierarchy(c.Request.Context(), companyID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.CostCenterResponse
	for _, cc := range costCenters {
		dtos = append(dtos, *dto.MapCostCenterEntityToResponse(cc))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetActiveCostCenters retrieves active cost centers
func (h *CostCenterHandler) GetActiveCostCenters(c *gin.Context) {
	companyID := c.Param("company_id")
	dateStr := c.Param("date")
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid date format. Use YYYY-MM-DD.")
		return
	}
	costCenters, err := h.service.GetActiveCostCenters(c.Request.Context(), companyID, date)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.CostCenterResponse
	for _, cc := range costCenters {
		dtos = append(dtos, *dto.MapCostCenterEntityToResponse(cc))
	}
	response.Success(c, http.StatusOK, dtos)
}

// DeactivateCostCenter deactivates a cost center
func (h *CostCenterHandler) DeactivateCostCenter(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}
	if err := h.service.DeactivateCostCenter(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "Cost center deactivated successfully"})
}

// ReactivateCostCenter reactivates a cost center
func (h *CostCenterHandler) ReactivateCostCenter(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format.")
		return
	}
	if err := h.service.ReactivateCostCenter(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "Cost center reactivated successfully"})
}

// GetActiveAllocations retrieves active allocations
func (h *CostCenterHandler) GetActiveAllocations(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	dateStr := c.Param("date")
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid date format. Use YYYY-MM-DD.")
		return
	}
	allocations, err := h.service.GetActiveAllocations(c.Request.Context(), costCenterID, date)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.CostCenterAllocationResponse
	for _, alloc := range allocations {
		dtos = append(dtos, *dto.MapCostCenterAllocationEntityToResponse(alloc))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetAllocationsByPeriod retrieves allocations by period
func (h *CostCenterHandler) GetAllocationsByPeriod(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	startDateStr := c.Param("start_date")
	endDateStr := c.Param("end_date")

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid start date format. Use YYYY-MM-DD.")
		return
	}
	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid end date format. Use YYYY-MM-DD.")
		return
	}

	allocations, err := h.service.GetAllocationsByPeriod(c.Request.Context(), costCenterID, startDate, endDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	var dtos []dto.CostCenterAllocationResponse
	for _, alloc := range allocations {
		dtos = append(dtos, *dto.MapCostCenterAllocationEntityToResponse(alloc))
	}
	response.Success(c, http.StatusOK, dtos)
}

// ProcessAllAllocations processes all allocations
func (h *CostCenterHandler) ProcessAllAllocations(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	periodStr := c.Param("period")
	period, err := time.Parse("2006-01-02", periodStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid period format. Use YYYY-MM-DD.")
		return
	}
	if err := h.service.ProcessAllAllocations(c.Request.Context(), costCenterID, period); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "All allocations processed successfully"})
}

// GetCostCenterReport retrieves cost center report
func (h *CostCenterHandler) GetCostCenterReport(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	startDateStr := c.Param("start_date")
	endDateStr := c.Param("end_date")

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid start date format. Use YYYY-MM-DD.")
		return
	}
	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid end date format. Use YYYY-MM-DD.")
		return
	}

	report, err := h.service.GetCostCenterReport(c.Request.Context(), costCenterID, startDate, endDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, report)
}

// GetCostCenterPerformance retrieves cost center performance
func (h *CostCenterHandler) GetCostCenterPerformance(c *gin.Context) {
	companyID := c.Param("company_id")
	startDateStr := c.Param("start_date")
	endDateStr := c.Param("end_date")

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid start date format. Use YYYY-MM-DD.")
		return
	}
	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid end date format. Use YYYY-MM-DD.")
		return
	}

	performance, err := h.service.GetCostCenterPerformance(c.Request.Context(), companyID, startDate, endDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.CostCenterReportResponse
	for _, p := range performance {
		dtos = append(dtos, *dto.MapCostCenterReportEntityToResponse(p))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetVarianceReport retrieves variance report
func (h *CostCenterHandler) GetVarianceReport(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	periodStr := c.Param("period")
	period, err := time.Parse("2006-01-02", periodStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid period format. Use YYYY-MM-DD.")
		return
	}
	report, err := h.service.GetVarianceReport(c.Request.Context(), costCenterID, period)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, report)
}

// UpdateBudgetAmounts updates budget amounts
func (h *CostCenterHandler) UpdateBudgetAmounts(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	var req struct { BudgetAmount float64 `json:"budget_amount" binding:"required"` }
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.service.UpdateBudgetAmounts(c.Request.Context(), costCenterID, req.BudgetAmount); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "Budget amounts updated successfully"})
}

// UpdateActualAmounts updates actual amounts
func (h *CostCenterHandler) UpdateActualAmounts(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	periodStartStr := c.Param("period_start")
	periodEndStr := c.Param("period_end")

	periodStart, err := time.Parse("2006-01-02", periodStartStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid start date format. Use YYYY-MM-DD.")
		return
	}
	periodEnd, err := time.Parse("2006-01-02", periodEndStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid end date format. Use YYYY-MM-DD.")
		return
	}

	if err := h.service.UpdateActualAmounts(c.Request.Context(), costCenterID, periodStart, periodEnd); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "Actual amounts updated successfully"})
}

// GetBudgetVsActual retrieves budget vs actual
func (h *CostCenterHandler) GetBudgetVsActual(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	periodStr := c.Param("period")
	period, err := time.Parse("2006-01-02", periodStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid period format. Use YYYY-MM-DD.")
		return
	}
	budgetVsActual, err := h.service.GetBudgetVsActual(c.Request.Context(), costCenterID, period)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, budgetVsActual)
}

// CalculateAllocatedCosts calculates allocated costs
func (h *CostCenterHandler) CalculateAllocatedCosts(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	periodStr := c.Param("period")
	period, err := time.Parse("2006-01-02", periodStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid period format. Use YYYY-MM-DD.")
		return
	}
	allocatedCosts, err := h.service.CalculateAllocatedCosts(c.Request.Context(), costCenterID, period)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"allocated_costs": allocatedCosts})
}

// GetDirectCosts retrieves direct costs
func (h *CostCenterHandler) GetDirectCosts(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	startDateStr := c.Param("start_date")
	endDateStr := c.Param("end_date")

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid start date format. Use YYYY-MM-DD.")
		return
	}
	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid end date format. Use YYYY-MM-DD.")
		return
	}

	directCosts, err := h.service.GetDirectCosts(c.Request.Context(), costCenterID, startDate, endDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"direct_costs": directCosts})
}

// GetIndirectCosts retrieves indirect costs
func (h *CostCenterHandler) GetIndirectCosts(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	startDateStr := c.Param("start_date")
	endDateStr := c.Param("end_date")

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid start date format. Use YYYY-MM-DD.")
		return
	}
	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid end date format. Use YYYY-MM-DD.")
		return
	}

	indirectCosts, err := h.service.GetIndirectCosts(c.Request.Context(), costCenterID, startDate, endDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"indirect_costs": indirectCosts})
}

// GetTotalCosts retrieves total costs
func (h *CostCenterHandler) GetTotalCosts(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	startDateStr := c.Param("start_date")
	endDateStr := c.Param("end_date")

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid start date format. Use YYYY-MM-DD.")
		return
	}
	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid end date format. Use YYYY-MM-DD.")
		return
	}

	totalCosts, err := h.service.GetTotalCosts(c.Request.Context(), costCenterID, startDate, endDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, totalCosts)
}

// GetCostCenterChildren retrieves cost center children
func (h *CostCenterHandler) GetCostCenterChildren(c *gin.Context) {
	parentIDStr := c.Param("parent_id")
	parentID, err := uuid.Parse(parentIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Parent ID format.")
		return
	}
	children, err := h.service.GetCostCenterChildren(c.Request.Context(), parentID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.CostCenterResponse
	for _, child := range children {
		dtos = append(dtos, *dto.MapCostCenterEntityToResponse(child))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetCostCenterDescendants retrieves cost center descendants
func (h *CostCenterHandler) GetCostCenterDescendants(c *gin.Context) {
	parentIDStr := c.Param("parent_id")
	parentID, err := uuid.Parse(parentIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Parent ID format.")
		return
	}
	descendants, err := h.service.GetCostCenterDescendants(c.Request.Context(), parentID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.CostCenterResponse
	for _, descendant := range descendants {
		dtos = append(dtos, *dto.MapCostCenterEntityToResponse(descendant))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetCostCenterPath retrieves cost center path
func (h *CostCenterHandler) GetCostCenterPath(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	path, err := h.service.GetCostCenterPath(c.Request.Context(), costCenterID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.CostCenterResponse
	for _, p := range path {
		dtos = append(dtos, *dto.MapCostCenterEntityToResponse(p))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetCostCenterLevel retrieves cost center level
func (h *CostCenterHandler) GetCostCenterLevel(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	level, err := h.service.GetCostCenterLevel(c.Request.Context(), costCenterID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"level": level})
}

// ValidateHierarchy validates hierarchy
func (h *CostCenterHandler) ValidateHierarchy(c *gin.Context) {
	var req dto.CostCenterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	costCenter := dto.MapCostCenterRequestToEntity(&req)
	if err := h.service.ValidateHierarchy(c.Request.Context(), costCenter); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "Hierarchy validated successfully"})
}

// ValidateAllocation validates allocation
func (h *CostCenterHandler) ValidateAllocation(c *gin.Context) {
	var req dto.CostCenterAllocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	allocation := dto.MapCostCenterAllocationRequestToEntity(&req)
	if err := h.service.ValidateAllocation(c.Request.Context(), allocation); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "Allocation validated successfully"})
}

// CheckCircularReference checks for circular reference
func (h *CostCenterHandler) CheckCircularReference(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	parentIDStr := c.Param("parent_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	parentID, err := uuid.Parse(parentIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Parent ID format.")
		return
	}
	if err := h.service.CheckCircularReference(c.Request.Context(), costCenterID, parentID); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "No circular reference found"})
}

// GetCostCenterEfficiency retrieves cost center efficiency
func (h *CostCenterHandler) GetCostCenterEfficiency(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	periodStr := c.Param("period")
	period, err := time.Parse("2006-01-02", periodStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid period format. Use YYYY-MM-DD.")
		return
	}
	efficiency, err := h.service.GetCostCenterEfficiency(c.Request.Context(), costCenterID, period)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, efficiency)
}

// CompareCostCenters compares cost centers
func (h *CostCenterHandler) CompareCostCenters(c *gin.Context) {
	var req struct { CostCenterIDs []string `json:"cost_center_ids" binding:"required"` }
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	var costCenterIDs []uuid.UUID
	for _, idStr := range req.CostCenterIDs {
		id, err := uuid.Parse(idStr)
		if err != nil {
			response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format in list.")
			return
		}
		costCenterIDs = append(costCenterIDs, id)
	}
	startDateStr := c.Param("start_date")
	endDateStr := c.Param("end_date")

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid start date format. Use YYYY-MM-DD.")
		return
	}
	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid end date format. Use YYYY-MM-DD.")
		return
	}

	comparison, err := h.service.CompareCostCenters(c.Request.Context(), costCenterIDs, startDate, endDate)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, comparison)
}

// GetTopPerformingCostCenters retrieves top performing cost centers
func (h *CostCenterHandler) GetTopPerformingCostCenters(c *gin.Context) {
	companyID := c.Param("company_id")
	periodStr := c.Param("period")
	period, err := time.Parse("2006-01-02", periodStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid period format. Use YYYY-MM-DD.")
		return
	}
	limitStr := c.DefaultQuery("limit", "5")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid limit format.")
		return
	}
	topPerformers, err := h.service.GetTopPerformingCostCenters(c.Request.Context(), companyID, period, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.CostCenterReportResponse
	for _, p := range topPerformers {
		dtos = append(dtos, *dto.MapCostCenterReportEntityToResponse(p))
	}
	response.Success(c, http.StatusOK, dtos)
}

// GetUnderperformingCostCenters retrieves underperforming cost centers
func (h *CostCenterHandler) GetUnderperformingCostCenters(c *gin.Context) {
	companyID := c.Param("company_id")
	periodStr := c.Param("period")
	period, err := time.Parse("2006-01-02", periodStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid period format. Use YYYY-MM-DD.")
		return
	}
	limitStr := c.DefaultQuery("limit", "5")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid limit format.")
		return
	}
	underPerformers, err := h.service.GetUnderperformingCostCenters(c.Request.Context(), companyID, period, limit)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	var dtos []dto.CostCenterReportResponse
	for _, p := range underPerformers {
		dtos = append(dtos, *dto.MapCostCenterReportEntityToResponse(p))
	}
	response.Success(c, http.StatusOK, dtos)
}

// ValidateAllocationPercentages validates allocation percentages
func (h *CostCenterHandler) ValidateAllocationPercentages(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	periodStr := c.Param("period")
	period, err := time.Parse("2006-01-02", periodStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid period format. Use YYYY-MM-DD.")
		return
	}
	if err := h.service.ValidateAllocationPercentages(c.Request.Context(), costCenterID, period); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "Allocation percentages validated successfully"})
}

// ProcessMonthlyAllocations processes monthly allocations
func (h *CostCenterHandler) ProcessMonthlyAllocations(c *gin.Context) {
	companyID := c.Param("company_id")
	periodStr := c.Param("period")
	period, err := time.Parse("2006-01-02", periodStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid period format. Use YYYY-MM-DD.")
		return
	}
	if err := h.service.ProcessMonthlyAllocations(c.Request.Context(), companyID, period); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "Monthly allocations processed successfully"})
}

// RecalculateAllocations recalculates allocations
func (h *CostCenterHandler) RecalculateAllocations(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	periodStr := c.Param("period")
	period, err := time.Parse("2006-01-02", periodStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid period format. Use YYYY-MM-DD.")
		return
	}
	if err := h.service.RecalculateAllocations(c.Request.Context(), costCenterID, period); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "Allocations recalculated successfully"})
}

// CreateCostCenterHierarchy creates cost center hierarchy
func (h *CostCenterHandler) CreateCostCenterHierarchy(c *gin.Context) {
	var req struct { Hierarchy []dto.CostCenterRequest `json:"hierarchy" binding:"required"` }
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	var hierarchy []*entities.CostCenter
	for _, ccReq := range req.Hierarchy {
		hierarchy = append(hierarchy, dto.MapCostCenterRequestToEntity(&ccReq))
	}
	if err := h.service.CreateCostCenterHierarchy(c.Request.Context(), hierarchy); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusCreated, gin.H{"message": "Cost center hierarchy created successfully"})
}

// MoveCostCenter moves cost center
func (h *CostCenterHandler) MoveCostCenter(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	newParentIDStr := c.Param("new_parent_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	newParentID, err := uuid.Parse(newParentIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid New Parent ID format.")
		return
	}
	if err := h.service.MoveCostCenter(c.Request.Context(), costCenterID, newParentID); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "Cost center moved successfully"})
}

// MergeCostCenters merges cost centers
func (h *CostCenterHandler) MergeCostCenters(c *gin.Context) {
	sourceCostCenterIDStr := c.Param("source_cost_center_id")
	targetCostCenterIDStr := c.Param("target_cost_center_id")
	sourceCostCenterID, err := uuid.Parse(sourceCostCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Source Cost Center ID format.")
		return
	}
	targetCostCenterID, err := uuid.Parse(targetCostCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Target Cost Center ID format.")
		return
	}
	if err := h.service.MergeCostCenters(c.Request.Context(), sourceCostCenterID, targetCostCenterID); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "Cost centers merged successfully"})
}

// SplitCostCenter splits cost center
func (h *CostCenterHandler) SplitCostCenter(c *gin.Context) {
	costCenterIDStr := c.Param("cost_center_id")
	costCenterID, err := uuid.Parse(costCenterIDStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid Cost Center ID format.")
		return
	}
	var req struct { NewCostCenters []dto.CostCenterRequest `json:"new_cost_centers" binding:"required"` }
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	var newCostCenters []*entities.CostCenter
	for _, ccReq := range req.NewCostCenters {
		newCostCenters = append(newCostCenters, dto.MapCostCenterRequestToEntity(&ccReq))
	}
	if err := h.service.SplitCostCenter(c.Request.Context(), costCenterID, newCostCenters); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, http.StatusOK, gin.H{"message": "Cost center split successfully"})
}
