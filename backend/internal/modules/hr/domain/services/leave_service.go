package services

import (
	"context"
	"malaka/internal/modules/hr/domain/entities"
)

type LeaveService interface {
	// Leave Types
	CreateLeaveType(ctx context.Context, leaveType *entities.LeaveType) error
	GetLeaveTypeByID(ctx context.Context, id string) (*entities.LeaveType, error)
	GetAllLeaveTypes(ctx context.Context) ([]*entities.LeaveType, error)
	UpdateLeaveType(ctx context.Context, leaveType *entities.LeaveType) error
	DeleteLeaveType(ctx context.Context, id string) error

	// Leave Requests
	CreateLeaveRequest(ctx context.Context, request *entities.LeaveRequest) error
	GetLeaveRequestByID(ctx context.Context, id string) (*entities.LeaveRequestWithDetails, error)
	GetAllLeaveRequests(ctx context.Context) ([]*entities.LeaveRequest, error)
	GetLeaveRequestsByEmployee(ctx context.Context, employeeID string) ([]*entities.LeaveRequest, error)
	GetLeaveRequestsByStatus(ctx context.Context, status string) ([]*entities.LeaveRequest, error)
	UpdateLeaveRequest(ctx context.Context, request *entities.LeaveRequest) error
	DeleteLeaveRequest(ctx context.Context, id string) error

	// Leave Balances
	GetLeaveBalancesByEmployee(ctx context.Context, employeeID string, year int) ([]*entities.LeaveBalance, error)
	UpdateLeaveBalance(ctx context.Context, balance *entities.LeaveBalance) error

	// Leave Approval Actions
	ApproveLeaveRequest(ctx context.Context, requestID string, approvedBy string, comments *string) error
	RejectLeaveRequest(ctx context.Context, requestID string, rejectedBy string, reason string) error
	CancelLeaveRequest(ctx context.Context, requestID string, cancelledBy string, reason string) error

	// Business Logic
	CalculateLeaveDays(ctx context.Context, startDate, endDate string, autoDeductWeekends, autoDeductHolidays bool) (int, error)
	ValidateLeaveRequest(ctx context.Context, request *entities.LeaveRequest) error
	CheckLeaveBalance(ctx context.Context, employeeID, leaveTypeID string, requestedDays int, year int) (bool, error)
}