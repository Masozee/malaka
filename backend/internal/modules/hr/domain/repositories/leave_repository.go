package repositories

import (
	"context"
	"malaka/internal/modules/hr/domain/entities"
	"github.com/google/uuid"
)

type LeaveRepository interface {
	// Leave Types
	CreateLeaveType(ctx context.Context, leaveType *entities.LeaveType) error
	GetLeaveTypeByID(ctx context.Context, id uuid.UUID) (*entities.LeaveType, error)
	GetAllLeaveTypes(ctx context.Context) ([]*entities.LeaveType, error)
	UpdateLeaveType(ctx context.Context, leaveType *entities.LeaveType) error
	DeleteLeaveType(ctx context.Context, id uuid.UUID) error

	// Leave Requests
	CreateLeaveRequest(ctx context.Context, request *entities.LeaveRequest) error
	GetLeaveRequestByID(ctx context.Context, id uuid.UUID) (*entities.LeaveRequestWithDetails, error)
	GetAllLeaveRequests(ctx context.Context) ([]*entities.LeaveRequest, error)
	GetLeaveRequestsByEmployee(ctx context.Context, employeeID uuid.UUID) ([]*entities.LeaveRequest, error)
	GetLeaveRequestsByStatus(ctx context.Context, status string) ([]*entities.LeaveRequest, error)
	UpdateLeaveRequest(ctx context.Context, request *entities.LeaveRequest) error
	DeleteLeaveRequest(ctx context.Context, id uuid.UUID) error

	// Leave Balances
	CreateLeaveBalance(ctx context.Context, balance *entities.LeaveBalance) error
	GetLeaveBalanceByID(ctx context.Context, id uuid.UUID) (*entities.LeaveBalance, error)
	GetLeaveBalancesByEmployee(ctx context.Context, employeeID uuid.UUID, year int) ([]*entities.LeaveBalance, error)
	UpdateLeaveBalance(ctx context.Context, balance *entities.LeaveBalance) error
	DeleteLeaveBalance(ctx context.Context, id uuid.UUID) error

	// Leave Policies
	CreateLeavePolicy(ctx context.Context, policy *entities.LeavePolicy) error
	GetLeavePolicyByID(ctx context.Context, id uuid.UUID) (*entities.LeavePolicy, error)
	GetLeavePolicyByLeaveType(ctx context.Context, leaveTypeID uuid.UUID) (*entities.LeavePolicy, error)
	GetAllLeavePolicies(ctx context.Context) ([]*entities.LeavePolicy, error)
	UpdateLeavePolicy(ctx context.Context, policy *entities.LeavePolicy) error
	DeleteLeavePolicy(ctx context.Context, id uuid.UUID) error

	// Leave Attachments
	CreateLeaveAttachment(ctx context.Context, attachment *entities.LeaveAttachment) error
	GetLeaveAttachmentsByRequest(ctx context.Context, requestID uuid.UUID) ([]*entities.LeaveAttachment, error)
	DeleteLeaveAttachment(ctx context.Context, id uuid.UUID) error

	// Leave Approval History
	CreateLeaveApprovalHistory(ctx context.Context, history *entities.LeaveApprovalHistory) error
	GetLeaveApprovalHistoryByRequest(ctx context.Context, requestID uuid.UUID) ([]*entities.LeaveApprovalHistory, error)

	// Business Logic Methods
	ApproveLeaveRequest(ctx context.Context, requestID uuid.UUID, approvedBy uuid.UUID, comments *string) error
	RejectLeaveRequest(ctx context.Context, requestID uuid.UUID, rejectedBy uuid.UUID, reason string) error
	CancelLeaveRequest(ctx context.Context, requestID uuid.UUID, cancelledBy uuid.UUID, reason string) error
}