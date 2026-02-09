package repositories

import (
	"context"

	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/shared/uuid"
)

type LeaveRepository interface {
	// Leave Types
	CreateLeaveType(ctx context.Context, leaveType *entities.LeaveType) error
	GetLeaveTypeByID(ctx context.Context, id uuid.ID) (*entities.LeaveType, error)
	GetAllLeaveTypes(ctx context.Context) ([]*entities.LeaveType, error)
	UpdateLeaveType(ctx context.Context, leaveType *entities.LeaveType) error
	DeleteLeaveType(ctx context.Context, id uuid.ID) error

	// Leave Requests
	CreateLeaveRequest(ctx context.Context, request *entities.LeaveRequest) error
	GetLeaveRequestByID(ctx context.Context, id uuid.ID) (*entities.LeaveRequestWithDetails, error)
	GetAllLeaveRequests(ctx context.Context) ([]*entities.LeaveRequest, error)
	GetLeaveRequestsByEmployee(ctx context.Context, employeeID uuid.ID) ([]*entities.LeaveRequest, error)
	GetLeaveRequestsByStatus(ctx context.Context, status string) ([]*entities.LeaveRequest, error)
	UpdateLeaveRequest(ctx context.Context, request *entities.LeaveRequest) error
	DeleteLeaveRequest(ctx context.Context, id uuid.ID) error

	// Leave Balances
	CreateLeaveBalance(ctx context.Context, balance *entities.LeaveBalance) error
	GetLeaveBalanceByID(ctx context.Context, id uuid.ID) (*entities.LeaveBalance, error)
	GetLeaveBalancesByEmployee(ctx context.Context, employeeID uuid.ID, year int) ([]*entities.LeaveBalance, error)
	UpdateLeaveBalance(ctx context.Context, balance *entities.LeaveBalance) error
	DeleteLeaveBalance(ctx context.Context, id uuid.ID) error

	// Leave Policies
	CreateLeavePolicy(ctx context.Context, policy *entities.LeavePolicy) error
	GetLeavePolicyByID(ctx context.Context, id uuid.ID) (*entities.LeavePolicy, error)
	GetLeavePolicyByLeaveType(ctx context.Context, leaveTypeID uuid.ID) (*entities.LeavePolicy, error)
	GetAllLeavePolicies(ctx context.Context) ([]*entities.LeavePolicy, error)
	UpdateLeavePolicy(ctx context.Context, policy *entities.LeavePolicy) error
	DeleteLeavePolicy(ctx context.Context, id uuid.ID) error

	// Leave Attachments
	CreateLeaveAttachment(ctx context.Context, attachment *entities.LeaveAttachment) error
	GetLeaveAttachmentsByRequest(ctx context.Context, requestID uuid.ID) ([]*entities.LeaveAttachment, error)
	DeleteLeaveAttachment(ctx context.Context, id uuid.ID) error

	// Leave Approval History
	CreateLeaveApprovalHistory(ctx context.Context, history *entities.LeaveApprovalHistory) error
	GetLeaveApprovalHistoryByRequest(ctx context.Context, requestID uuid.ID) ([]*entities.LeaveApprovalHistory, error)

	// Business Logic Methods
	ApproveLeaveRequest(ctx context.Context, requestID uuid.ID, approvedBy uuid.ID, comments *string) error
	RejectLeaveRequest(ctx context.Context, requestID uuid.ID, rejectedBy uuid.ID, reason string) error
	CancelLeaveRequest(ctx context.Context, requestID uuid.ID, cancelledBy uuid.ID, reason string) error
}
