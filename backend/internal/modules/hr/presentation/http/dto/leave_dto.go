package dto

import (
	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/shared/uuid"
	"time"
)

// Leave Type DTOs
type CreateLeaveTypeRequest struct {
	Name             string  `json:"name" binding:"required"`
	Code             string  `json:"code" binding:"required"`
	Description      *string `json:"description,omitempty"`
	MaxDaysPerYear   int     `json:"max_days_per_year"`
	RequiresApproval bool    `json:"requires_approval"`
	IsPaid           bool    `json:"is_paid"`
	IsActive         bool    `json:"is_active"`
}

type UpdateLeaveTypeRequest struct {
	Name             string  `json:"name" binding:"required"`
	Code             string  `json:"code" binding:"required"`
	Description      *string `json:"description,omitempty"`
	MaxDaysPerYear   int     `json:"max_days_per_year"`
	RequiresApproval bool    `json:"requires_approval"`
	IsPaid           bool    `json:"is_paid"`
	IsActive         bool    `json:"is_active"`
}

type LeaveTypeResponse struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	Code             string    `json:"code"`
	Description      *string   `json:"description,omitempty"`
	MaxDaysPerYear   int       `json:"max_days_per_year"`
	RequiresApproval bool      `json:"requires_approval"`
	IsPaid           bool      `json:"is_paid"`
	IsActive         bool      `json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// Leave Request DTOs
type CreateLeaveRequestRequest struct {
	EmployeeID       string  `json:"employee_id" binding:"required"`
	LeaveTypeID      string  `json:"leave_type_id" binding:"required"`
	StartDate        string  `json:"start_date" binding:"required"` // Format: "2006-01-02"
	EndDate          string  `json:"end_date" binding:"required"`   // Format: "2006-01-02"
	Reason           string  `json:"reason" binding:"required"`
	EmergencyContact *string `json:"emergency_contact,omitempty"`
}

type UpdateLeaveRequestRequest struct {
	EmployeeID       string  `json:"employee_id" binding:"required"`
	LeaveTypeID      string  `json:"leave_type_id" binding:"required"`
	StartDate        string  `json:"start_date" binding:"required"`
	EndDate          string  `json:"end_date" binding:"required"`
	Reason           string  `json:"reason" binding:"required"`
	EmergencyContact *string `json:"emergency_contact,omitempty"`
	Status           string  `json:"status" binding:"required"`
	Notes            *string `json:"notes,omitempty"`
}

type LeaveRequestResponse struct {
	ID               string                   `json:"id"`
	EmployeeID       string                   `json:"employee_id"`
	EmployeeName     string                   `json:"employee_name"`
	Department       string                   `json:"department"`
	LeaveType        string                   `json:"leave_type"`
	StartDate        string                   `json:"start_date"`
	EndDate          string                   `json:"end_date"`
	TotalDays        int                      `json:"total_days"`
	Reason           string                   `json:"reason"`
	EmergencyContact *string                  `json:"emergency_contact,omitempty"`
	Status           string                   `json:"status"`
	AppliedDate      string                   `json:"applied_date"`
	ApprovedBy       *string                  `json:"approved_by,omitempty"`
	ApprovedDate     *string                  `json:"approved_date,omitempty"`
	RejectedReason   *string                  `json:"rejected_reason,omitempty"`
	Notes            *string                  `json:"notes,omitempty"`
	CreatedAt        time.Time                `json:"created_at"`
	UpdatedAt        time.Time                `json:"updated_at"`
}

type LeaveRequestDetailResponse struct {
	LeaveRequestResponse
	Attachments     []LeaveAttachmentResponse     `json:"attachments,omitempty"`
	ApprovalHistory []LeaveApprovalHistoryResponse `json:"approval_history,omitempty"`
}

// Leave Balance DTOs
type LeaveBalanceResponse struct {
	ID                 string `json:"id"`
	EmployeeID         string `json:"employee_id"`
	EmployeeName       string `json:"employee_name"`
	LeaveTypeID        string `json:"leave_type_id"`
	LeaveTypeName      string `json:"leave_type_name"`
	Year               int    `json:"year"`
	AllocatedDays      int    `json:"allocated_days"`
	UsedDays           int    `json:"used_days"`
	RemainingDays      int    `json:"remaining_days"`
	CarriedForwardDays int    `json:"carried_forward_days"`
}

// Leave Attachment DTOs
type LeaveAttachmentResponse struct {
	ID             string    `json:"id"`
	LeaveRequestID string    `json:"leave_request_id"`
	FileName       string    `json:"file_name"`
	FilePath       string    `json:"file_path"`
	FileSize       *int      `json:"file_size,omitempty"`
	FileType       *string   `json:"file_type,omitempty"`
	UploadedAt     time.Time `json:"uploaded_at"`
}

// Leave Approval History DTOs
type LeaveApprovalHistoryResponse struct {
	ID              string    `json:"id"`
	LeaveRequestID  string    `json:"leave_request_id"`
	ApprovedBy      string    `json:"approved_by"`
	ApproverName    string    `json:"approver_name"`
	Action          string    `json:"action"`
	Comments        *string   `json:"comments,omitempty"`
	ActionDate      time.Time `json:"action_date"`
}

// Action DTOs
type ApproveLeaveRequestRequest struct {
	Comments *string `json:"comments,omitempty"`
}

type RejectLeaveRequestRequest struct {
	Reason string `json:"reason" binding:"required"`
}

type CancelLeaveRequestRequest struct {
	Reason string `json:"reason" binding:"required"`
}

// Conversion functions
func ToLeaveTypeEntity(req *CreateLeaveRequestRequest) *entities.LeaveRequest {
	startDate, _ := time.Parse("2006-01-02", req.StartDate)
	endDate, _ := time.Parse("2006-01-02", req.EndDate)
	employeeID, _ := uuid.Parse(req.EmployeeID)
	leaveTypeID, _ := uuid.Parse(req.LeaveTypeID)

	return &entities.LeaveRequest{
		EmployeeID:       employeeID,
		LeaveTypeID:      leaveTypeID,
		StartDate:        startDate,
		EndDate:          endDate,
		Reason:           req.Reason,
		EmergencyContact: req.EmergencyContact,
		Status:           "pending",
	}
}

func ToLeaveRequestResponse(entity *entities.LeaveRequest) *LeaveRequestResponse {
	response := &LeaveRequestResponse{
		ID:               entity.ID.String(),
		EmployeeID:       entity.EmployeeID.String(),
		StartDate:        entity.StartDate.Format("2006-01-02"),
		EndDate:          entity.EndDate.Format("2006-01-02"),
		TotalDays:        entity.TotalDays,
		Reason:           entity.Reason,
		EmergencyContact: entity.EmergencyContact,
		Status:           entity.Status,
		AppliedDate:      entity.AppliedDate.Format("2006-01-02"),
		ApprovedBy:       func() *string { if entity.ApprovedBy != nil { s := entity.ApprovedBy.String(); return &s }; return nil }(),
		RejectedReason:   entity.RejectedReason,
		Notes:            entity.Notes,
		CreatedAt:        entity.CreatedAt,
		UpdatedAt:        entity.UpdatedAt,
	}

	// Set employee information if available
	if entity.Employee != nil {
		response.EmployeeName = entity.Employee.EmployeeName
		response.Department = entity.Employee.Department
	}

	// Set leave type information if available
	if entity.LeaveType != nil {
		response.LeaveType = entity.LeaveType.Name
	}

	// Set approved date if available
	if entity.ApprovedDate != nil {
		approvedDate := entity.ApprovedDate.Format("2006-01-02")
		response.ApprovedDate = &approvedDate
	}

	return response
}

func ToLeaveRequestDetailResponse(entity *entities.LeaveRequestWithDetails) *LeaveRequestDetailResponse {
	response := &LeaveRequestDetailResponse{
		LeaveRequestResponse: *ToLeaveRequestResponse(entity.LeaveRequest),
	}

	// Convert attachments
	for _, attachment := range entity.Attachments {
		response.Attachments = append(response.Attachments, LeaveAttachmentResponse{
			ID:             attachment.ID.String(),
			LeaveRequestID: attachment.LeaveRequestID.String(),
			FileName:       attachment.FileName,
			FilePath:       attachment.FilePath,
			FileSize:       attachment.FileSize,
			FileType:       attachment.FileType,
			UploadedAt:     attachment.UploadedAt,
		})
	}

	// Convert approval history
	for _, history := range entity.ApprovalHistory {
		historyResponse := LeaveApprovalHistoryResponse{
			ID:             history.ID.String(),
			LeaveRequestID: history.LeaveRequestID.String(),
			ApprovedBy:     history.ApprovedBy.String(),
			Action:         history.Action,
			Comments:       history.Comments,
			ActionDate:     history.ActionDate,
		}

		if history.ApproverEmployee != nil {
			historyResponse.ApproverName = history.ApproverEmployee.EmployeeName
		}

		response.ApprovalHistory = append(response.ApprovalHistory, historyResponse)
	}

	return response
}

func ToLeaveBalanceResponse(entity *entities.LeaveBalance) *LeaveBalanceResponse {
	response := &LeaveBalanceResponse{
		ID:                 entity.ID.String(),
		EmployeeID:         entity.EmployeeID.String(),
		LeaveTypeID:        entity.LeaveTypeID.String(),
		Year:               entity.Year,
		AllocatedDays:      entity.AllocatedDays,
		UsedDays:           entity.UsedDays,
		RemainingDays:      entity.RemainingDays,
		CarriedForwardDays: entity.CarriedForwardDays,
	}

	// Set employee information if available
	if entity.Employee != nil {
		response.EmployeeName = entity.Employee.EmployeeName
	}

	// Set leave type information if available
	if entity.LeaveType != nil {
		response.LeaveTypeName = entity.LeaveType.Name
	}

	return response
}

func ToLeaveTypeResponse(entity *entities.LeaveType) *LeaveTypeResponse {
	return &LeaveTypeResponse{
		ID:               entity.ID.String(),
		Name:             entity.Name,
		Code:             entity.Code,
		Description:      entity.Description,
		MaxDaysPerYear:   entity.MaxDaysPerYear,
		RequiresApproval: entity.RequiresApproval,
		IsPaid:           entity.IsPaid,
		IsActive:         entity.IsActive,
		CreatedAt:        entity.CreatedAt,
		UpdatedAt:        entity.UpdatedAt,
	}
}