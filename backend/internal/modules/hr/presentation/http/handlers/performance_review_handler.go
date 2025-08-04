package handlers

import (
	"net/http"
	"strconv"

	"malaka/internal/modules/hr/domain/services"
	"malaka/internal/modules/hr/presentation/http/dto"
	"malaka/internal/shared/response"

	"github.com/gin-gonic/gin"
)

type PerformanceReviewHandler struct {
	performanceService services.PerformanceReviewService
}

func NewPerformanceReviewHandler(performanceService services.PerformanceReviewService) *PerformanceReviewHandler {
	return &PerformanceReviewHandler{
		performanceService: performanceService,
	}
}

// GetAllPerformanceReviews handles GET /hr/performance/reviews
func (h *PerformanceReviewHandler) GetAllPerformanceReviews(c *gin.Context) {
	filters := make(map[string]interface{})

	// Extract query parameters
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	if employeeID := c.Query("employee_id"); employeeID != "" {
		filters["employee_id"] = employeeID
	}
	if period := c.Query("review_period"); period != "" {
		filters["review_period"] = period
	}
	if pageStr := c.Query("page"); pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err == nil {
			filters["page"] = page
		}
	}
	if sizeStr := c.Query("page_size"); sizeStr != "" {
		if size, err := strconv.Atoi(sizeStr); err == nil {
			filters["page_size"] = size
		}
	}

	result, err := h.performanceService.GetAllPerformanceReviews(c.Request.Context(), filters)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get performance reviews", err)
		return
	}

	response.Success(c, http.StatusOK, "Performance reviews retrieved successfully", result)
}

// GetPerformanceReviewByID handles GET /hr/performance/reviews/:id
func (h *PerformanceReviewHandler) GetPerformanceReviewByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "Review ID is required", nil)
		return
	}

	result, err := h.performanceService.GetPerformanceReviewWithDetails(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Performance review not found", err)
		return
	}

	response.Success(c, http.StatusOK, "Performance review retrieved successfully", result)
}

// CreatePerformanceReview handles POST /hr/performance/reviews
func (h *PerformanceReviewHandler) CreatePerformanceReview(c *gin.Context) {
	var req dto.PerformanceReviewCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload", err)
		return
	}

	result, err := h.performanceService.CreatePerformanceReview(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create performance review", err)
		return
	}

	response.Success(c, http.StatusCreated, "Performance review created successfully", result)
}

// UpdatePerformanceReview handles PUT /hr/performance/reviews/:id
func (h *PerformanceReviewHandler) UpdatePerformanceReview(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "Review ID is required", nil)
		return
	}

	var req dto.PerformanceReviewUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request payload", err)
		return
	}

	result, err := h.performanceService.UpdatePerformanceReview(c.Request.Context(), id, &req)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update performance review", err)
		return
	}

	response.Success(c, http.StatusOK, "Performance review updated successfully", result)
}

// DeletePerformanceReview handles DELETE /hr/performance/reviews/:id
func (h *PerformanceReviewHandler) DeletePerformanceReview(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "Review ID is required", nil)
		return
	}

	err := h.performanceService.DeletePerformanceReview(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete performance review", err)
		return
	}

	response.Success(c, http.StatusOK, "Performance review deleted successfully", nil)
}

// GetPerformanceReviewsByEmployee handles GET /hr/performance/reviews/employee/:employeeId
func (h *PerformanceReviewHandler) GetPerformanceReviewsByEmployee(c *gin.Context) {
	employeeID := c.Param("employeeId")
	if employeeID == "" {
		response.Error(c, http.StatusBadRequest, "Employee ID is required", nil)
		return
	}

	result, err := h.performanceService.GetPerformanceReviewsByEmployee(c.Request.Context(), employeeID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get performance reviews", err)
		return
	}

	response.Success(c, http.StatusOK, "Performance reviews retrieved successfully", result)
}

// GetPerformanceReviewsByPeriod handles GET /hr/performance/reviews/period/:period
func (h *PerformanceReviewHandler) GetPerformanceReviewsByPeriod(c *gin.Context) {
	period := c.Param("period")
	if period == "" {
		response.Error(c, http.StatusBadRequest, "Review period is required", nil)
		return
	}

	result, err := h.performanceService.GetPerformanceReviewsByPeriod(c.Request.Context(), period)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get performance reviews", err)
		return
	}

	response.Success(c, http.StatusOK, "Performance reviews retrieved successfully", result)
}

// GetPerformanceReviewsByStatus handles GET /hr/performance/reviews/status/:status
func (h *PerformanceReviewHandler) GetPerformanceReviewsByStatus(c *gin.Context) {
	status := c.Param("status")
	if status == "" {
		response.Error(c, http.StatusBadRequest, "Review status is required", nil)
		return
	}

	result, err := h.performanceService.GetPerformanceReviewsByStatus(c.Request.Context(), status)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get performance reviews", err)
		return
	}

	response.Success(c, http.StatusOK, "Performance reviews retrieved successfully", result)
}

// GetPerformanceStatistics handles GET /hr/performance/statistics
func (h *PerformanceReviewHandler) GetPerformanceStatistics(c *gin.Context) {
	filters := make(map[string]interface{})

	// Extract query parameters for filtering statistics
	if employeeID := c.Query("employee_id"); employeeID != "" {
		filters["employee_id"] = employeeID
	}
	if period := c.Query("review_period"); period != "" {
		filters["review_period"] = period
	}

	result, err := h.performanceService.GetPerformanceStatistics(c.Request.Context(), filters)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get performance statistics", err)
		return
	}

	response.Success(c, http.StatusOK, "Performance statistics retrieved successfully", result)
}

// GetReviewCycles handles GET /hr/performance/cycles
func (h *PerformanceReviewHandler) GetReviewCycles(c *gin.Context) {
	result, err := h.performanceService.GetReviewCycles(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get review cycles", err)
		return
	}

	response.Success(c, http.StatusOK, "Review cycles retrieved successfully", result)
}

// GetPerformanceGoals handles GET /hr/performance/goals
func (h *PerformanceReviewHandler) GetPerformanceGoals(c *gin.Context) {
	result, err := h.performanceService.GetPerformanceGoals(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get performance goals", err)
		return
	}

	response.Success(c, http.StatusOK, "Performance goals retrieved successfully", result)
}

// GetCompetencies handles GET /hr/performance/competencies
func (h *PerformanceReviewHandler) GetCompetencies(c *gin.Context) {
	result, err := h.performanceService.GetCompetencies(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to get competencies", err)
		return
	}

	response.Success(c, http.StatusOK, "Competencies retrieved successfully", result)
}