package entities

import (
	"time"

	"malaka/internal/shared/uuid"
)

type LeaveRequest struct {
	ID               uuid.ID    `json:"id" db:"id"`
	EmployeeID       uuid.ID    `json:"employee_id" db:"employee_id"`
	LeaveTypeID      uuid.ID    `json:"leave_type_id" db:"leave_type_id"`
	StartDate        time.Time  `json:"start_date" db:"start_date"`
	EndDate          time.Time  `json:"end_date" db:"end_date"`
	TotalDays        int        `json:"total_days" db:"total_days"`
	Reason           string     `json:"reason" db:"reason"`
	EmergencyContact *string    `json:"emergency_contact,omitempty" db:"emergency_contact"`
	Status           string     `json:"status" db:"status"` // pending, approved, rejected, cancelled
	AppliedDate      time.Time  `json:"applied_date" db:"applied_date"`
	ApprovedBy       *uuid.ID   `json:"approved_by,omitempty" db:"approved_by"`
	ApprovedDate     *time.Time `json:"approved_date,omitempty" db:"approved_date"`
	RejectedReason   *string    `json:"rejected_reason,omitempty" db:"rejected_reason"`
	Notes            *string    `json:"notes,omitempty" db:"notes"`
	CreatedAt        time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at" db:"updated_at"`

	// Joined fields
	Employee           *Employee  `json:"employee,omitempty"`
	LeaveType          *LeaveType `json:"leave_type,omitempty"`
	ApprovedByEmployee *Employee  `json:"approved_by_employee,omitempty"`
}

type LeaveType struct {
	ID               uuid.ID   `json:"id" db:"id"`
	Name             string    `json:"name" db:"name"`
	Code             string    `json:"code" db:"code"`
	Description      *string   `json:"description,omitempty" db:"description"`
	MaxDaysPerYear   int       `json:"max_days_per_year" db:"max_days_per_year"`
	RequiresApproval bool      `json:"requires_approval" db:"requires_approval"`
	IsPaid           bool      `json:"is_paid" db:"is_paid"`
	IsActive         bool      `json:"is_active" db:"is_active"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

type LeaveBalance struct {
	ID                 uuid.ID   `json:"id" db:"id"`
	EmployeeID         uuid.ID   `json:"employee_id" db:"employee_id"`
	LeaveTypeID        uuid.ID   `json:"leave_type_id" db:"leave_type_id"`
	Year               int       `json:"year" db:"year"`
	AllocatedDays      int       `json:"allocated_days" db:"allocated_days"`
	UsedDays           int       `json:"used_days" db:"used_days"`
	RemainingDays      int       `json:"remaining_days" db:"remaining_days"`
	CarriedForwardDays int       `json:"carried_forward_days" db:"carried_forward_days"`
	CreatedAt          time.Time `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time `json:"updated_at" db:"updated_at"`

	// Joined fields
	Employee  *Employee  `json:"employee,omitempty"`
	LeaveType *LeaveType `json:"leave_type,omitempty"`
}

type LeavePolicy struct {
	ID                   uuid.ID   `json:"id" db:"id"`
	LeaveTypeID          uuid.ID   `json:"leave_type_id" db:"leave_type_id"`
	MinimumServiceMonths int       `json:"minimum_service_months" db:"minimum_service_months"`
	MaxConsecutiveDays   *int      `json:"max_consecutive_days,omitempty" db:"max_consecutive_days"`
	AdvanceNoticeDays    int       `json:"advance_notice_days" db:"advance_notice_days"`
	CanCarryForward      bool      `json:"can_carry_forward" db:"can_carry_forward"`
	MaxCarryForwardDays  int       `json:"max_carry_forward_days" db:"max_carry_forward_days"`
	RequiresDocuments    bool      `json:"requires_documents" db:"requires_documents"`
	AutoDeductWeekends   bool      `json:"auto_deduct_weekends" db:"auto_deduct_weekends"`
	AutoDeductHolidays   bool      `json:"auto_deduct_holidays" db:"auto_deduct_holidays"`
	CreatedAt            time.Time `json:"created_at" db:"created_at"`
	UpdatedAt            time.Time `json:"updated_at" db:"updated_at"`

	// Joined fields
	LeaveType *LeaveType `json:"leave_type,omitempty"`
}

type LeaveAttachment struct {
	ID             uuid.ID   `json:"id" db:"id"`
	LeaveRequestID uuid.ID   `json:"leave_request_id" db:"leave_request_id"`
	FileName       string    `json:"file_name" db:"file_name"`
	FilePath       string    `json:"file_path" db:"file_path"`
	FileSize       *int      `json:"file_size,omitempty" db:"file_size"`
	FileType       *string   `json:"file_type,omitempty" db:"file_type"`
	UploadedAt     time.Time `json:"uploaded_at" db:"uploaded_at"`
}

type LeaveApprovalHistory struct {
	ID             uuid.ID   `json:"id" db:"id"`
	LeaveRequestID uuid.ID   `json:"leave_request_id" db:"leave_request_id"`
	ApprovedBy     uuid.ID   `json:"approved_by" db:"approved_by"`
	Action         string    `json:"action" db:"action"` // approved, rejected, cancelled
	Comments       *string   `json:"comments,omitempty" db:"comments"`
	ActionDate     time.Time `json:"action_date" db:"action_date"`

	// Joined fields
	ApproverEmployee *Employee `json:"approver_employee,omitempty"`
}

// LeaveRequestWithDetails includes all related information
type LeaveRequestWithDetails struct {
	*LeaveRequest
	Attachments     []LeaveAttachment      `json:"attachments,omitempty"`
	ApprovalHistory []LeaveApprovalHistory `json:"approval_history,omitempty"`
}
