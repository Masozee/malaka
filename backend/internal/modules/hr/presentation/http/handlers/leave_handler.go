package handlers

import (
	"strconv"
	"time"

	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/modules/hr/domain/services"
	"malaka/internal/modules/hr/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"

	"github.com/gin-gonic/gin"
)

type LeaveHandler struct {
	leaveService services.LeaveService
}

func NewLeaveHandler(leaveService services.LeaveService) *LeaveHandler {
	return &LeaveHandler{
		leaveService: leaveService,
	}
}

// Leave Types

func (h *LeaveHandler) CreateLeaveType(c *gin.Context) {
	var req dto.CreateLeaveTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	leaveType := &entities.LeaveType{
		Name:             req.Name,
		Code:             req.Code,
		Description:      req.Description,
		MaxDaysPerYear:   req.MaxDaysPerYear,
		RequiresApproval: req.RequiresApproval,
		IsPaid:           req.IsPaid,
		IsActive:         req.IsActive,
	}

	if err := h.leaveService.CreateLeaveType(c.Request.Context(), leaveType); err != nil {
		response.InternalServerError(c, "Failed to create leave type", err.Error())
		return
	}

	response.Created(c, "Leave type created successfully", dto.ToLeaveTypeResponse(leaveType))
}

func (h *LeaveHandler) GetAllLeaveTypes(c *gin.Context) {
	leaveTypes, err := h.leaveService.GetAllLeaveTypes(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to get leave types", err.Error())
		return
	}

	var responses []*dto.LeaveTypeResponse
	for _, leaveType := range leaveTypes {
		responses = append(responses, dto.ToLeaveTypeResponse(leaveType))
	}

	response.OK(c, "Leave types retrieved successfully", responses)
}

func (h *LeaveHandler) GetLeaveTypeByID(c *gin.Context) {
	id := c.Param("id")
	leaveType, err := h.leaveService.GetLeaveTypeByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Leave type not found", err.Error())
		return
	}

	response.OK(c, "Leave type retrieved successfully", dto.ToLeaveTypeResponse(leaveType))
}

func (h *LeaveHandler) UpdateLeaveType(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateLeaveTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid leave type ID format", err.Error())
		return
	}

	leaveType := &entities.LeaveType{
		ID:               parsedID,
		Name:             req.Name,
		Code:             req.Code,
		Description:      req.Description,
		MaxDaysPerYear:   req.MaxDaysPerYear,
		RequiresApproval: req.RequiresApproval,
		IsPaid:           req.IsPaid,
		IsActive:         req.IsActive,
	}

	if err := h.leaveService.UpdateLeaveType(c.Request.Context(), leaveType); err != nil {
		response.InternalServerError(c, "Failed to update leave type", err.Error())
		return
	}

	response.OK(c, "Leave type updated successfully", dto.ToLeaveTypeResponse(leaveType))
}

func (h *LeaveHandler) DeleteLeaveType(c *gin.Context) {
	id := c.Param("id")
	if err := h.leaveService.DeleteLeaveType(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, "Failed to delete leave type", err.Error())
		return
	}

	response.OK(c, "Leave type deleted successfully", nil)
}

// Leave Requests

func (h *LeaveHandler) CreateLeaveRequest(c *gin.Context) {
	var req dto.CreateLeaveRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	leaveRequest := dto.ToLeaveTypeEntity(&req)

	if err := h.leaveService.CreateLeaveRequest(c.Request.Context(), leaveRequest); err != nil {
		response.InternalServerError(c, "Failed to create leave request", err.Error())
		return
	}

	response.Created(c, "Leave request created successfully", dto.ToLeaveRequestResponse(leaveRequest))
}

func (h *LeaveHandler) GetAllLeaveRequests(c *gin.Context) {
	// Check for query parameters
	status := c.Query("status")
	employeeID := c.Query("employee_id")

	var leaveRequests []*entities.LeaveRequest
	var err error

	if status != "" {
		leaveRequests, err = h.leaveService.GetLeaveRequestsByStatus(c.Request.Context(), status)
	} else if employeeID != "" {
		leaveRequests, err = h.leaveService.GetLeaveRequestsByEmployee(c.Request.Context(), employeeID)
	} else {
		leaveRequests, err = h.leaveService.GetAllLeaveRequests(c.Request.Context())
	}

	if err != nil {
		response.InternalServerError(c, "Failed to get leave requests", err.Error())
		return
	}

	var responses []*dto.LeaveRequestResponse
	for _, leaveRequest := range leaveRequests {
		responses = append(responses, dto.ToLeaveRequestResponse(leaveRequest))
	}

	response.OK(c, "Leave requests retrieved successfully", responses)
}

func (h *LeaveHandler) GetLeaveRequestByID(c *gin.Context) {
	id := c.Param("id")
	leaveRequest, err := h.leaveService.GetLeaveRequestByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Leave request not found", err.Error())
		return
	}

	response.OK(c, "Leave request retrieved successfully", dto.ToLeaveRequestDetailResponse(leaveRequest))
}

func (h *LeaveHandler) UpdateLeaveRequest(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateLeaveRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		response.BadRequest(c, "Invalid start date format", err.Error())
		return
	}

	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		response.BadRequest(c, "Invalid end date format", err.Error())
		return
	}

	requestID, err := uuid.Parse(id)
	if err != nil {
		response.BadRequest(c, "Invalid leave request ID format", err.Error())
		return
	}

	employeeID, err := uuid.Parse(req.EmployeeID)
	if err != nil {
		response.BadRequest(c, "Invalid employee ID format", err.Error())
		return
	}

	leaveTypeID, err := uuid.Parse(req.LeaveTypeID)
	if err != nil {
		response.BadRequest(c, "Invalid leave type ID format", err.Error())
		return
	}

	leaveRequest := &entities.LeaveRequest{
		ID:          requestID,
		EmployeeID:  employeeID,
		LeaveTypeID: leaveTypeID,
		StartDate:        startDate,
		EndDate:          endDate,
		Reason:           req.Reason,
		EmergencyContact: req.EmergencyContact,
		Status:           req.Status,
		Notes:            req.Notes,
	}

	if err := h.leaveService.UpdateLeaveRequest(c.Request.Context(), leaveRequest); err != nil {
		response.InternalServerError(c, "Failed to update leave request", err.Error())
		return
	}

	response.OK(c, "Leave request updated successfully", dto.ToLeaveRequestResponse(leaveRequest))
}

func (h *LeaveHandler) DeleteLeaveRequest(c *gin.Context) {
	id := c.Param("id")
	if err := h.leaveService.DeleteLeaveRequest(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, "Failed to delete leave request", err.Error())
		return
	}

	response.OK(c, "Leave request deleted successfully", nil)
}

// Leave Request Actions

func (h *LeaveHandler) ApproveLeaveRequest(c *gin.Context) {
	id := c.Param("id")
	var req dto.ApproveLeaveRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	// In a real application, you would get the approver ID from the authenticated user context
	approverID := c.GetHeader("X-User-ID") // Temporary solution
	if approverID == "" {
		response.BadRequest(c, "User not authenticated", "Missing user context")
		return
	}

	if err := h.leaveService.ApproveLeaveRequest(c.Request.Context(), id, approverID, req.Comments); err != nil {
		response.InternalServerError(c, "Failed to approve leave request", err.Error())
		return
	}

	response.OK(c, "Leave request approved successfully", nil)
}

func (h *LeaveHandler) RejectLeaveRequest(c *gin.Context) {
	id := c.Param("id")
	var req dto.RejectLeaveRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	// In a real application, you would get the rejector ID from the authenticated user context
	rejectorID := c.GetHeader("X-User-ID") // Temporary solution
	if rejectorID == "" {
		response.BadRequest(c, "User not authenticated", "Missing user context")
		return
	}

	if err := h.leaveService.RejectLeaveRequest(c.Request.Context(), id, rejectorID, req.Reason); err != nil {
		response.InternalServerError(c, "Failed to reject leave request", err.Error())
		return
	}

	response.OK(c, "Leave request rejected successfully", nil)
}

func (h *LeaveHandler) CancelLeaveRequest(c *gin.Context) {
	id := c.Param("id")
	var req dto.CancelLeaveRequestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	// In a real application, you would get the canceller ID from the authenticated user context
	cancellerID := c.GetHeader("X-User-ID") // Temporary solution
	if cancellerID == "" {
		response.BadRequest(c, "User not authenticated", "Missing user context")
		return
	}

	if err := h.leaveService.CancelLeaveRequest(c.Request.Context(), id, cancellerID, req.Reason); err != nil {
		response.InternalServerError(c, "Failed to cancel leave request", err.Error())
		return
	}

	response.OK(c, "Leave request cancelled successfully", nil)
}

// Leave Balances

func (h *LeaveHandler) GetLeaveBalancesByEmployee(c *gin.Context) {
	employeeID := c.Param("employee_id")
	yearStr := c.Query("year")
	
	year := time.Now().Year() // Default to current year
	if yearStr != "" {
		if parsedYear, err := strconv.Atoi(yearStr); err == nil {
			year = parsedYear
		}
	}

	balances, err := h.leaveService.GetLeaveBalancesByEmployee(c.Request.Context(), employeeID, year)
	if err != nil {
		response.InternalServerError(c, "Failed to get leave balances", err.Error())
		return
	}

	var responses []*dto.LeaveBalanceResponse
	for _, balance := range balances {
		responses = append(responses, dto.ToLeaveBalanceResponse(balance))
	}

	response.OK(c, "Leave balances retrieved successfully", responses)
}

// Statistics endpoint for dashboard
func (h *LeaveHandler) GetLeaveStatistics(c *gin.Context) {
	// Get all leave requests
	leaveRequests, err := h.leaveService.GetAllLeaveRequests(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to get leave statistics", err.Error())
		return
	}

	// Calculate statistics
	totalRequests := len(leaveRequests)
	pendingRequests := 0
	approvedRequests := 0
	rejectedRequests := 0
	totalDaysRequested := 0

	for _, request := range leaveRequests {
		switch request.Status {
		case "pending":
			pendingRequests++
		case "approved":
			approvedRequests++
			totalDaysRequested += request.TotalDays
		case "rejected":
			rejectedRequests++
		}
	}

	// Calculate approval rate
	processedRequests := approvedRequests + rejectedRequests
	approvalRate := 0.0
	if processedRequests > 0 {
		approvalRate = float64(approvedRequests) / float64(processedRequests) * 100
	}

	statistics := map[string]interface{}{
		"total_requests":     totalRequests,
		"pending_requests":   pendingRequests,
		"approved_requests":  approvedRequests,
		"rejected_requests":  rejectedRequests,
		"total_days_requested": totalDaysRequested,
		"approval_rate":      approvalRate,
		"avg_processing_time": 2.5, // Mock data for now
	}

	response.OK(c, "Leave statistics retrieved successfully", statistics)
}