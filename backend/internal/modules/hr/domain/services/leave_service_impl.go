package services

import (
	"context"
	"errors"
	"fmt"
	"malaka/internal/modules/hr/domain/entities"
	"malaka/internal/modules/hr/domain/repositories"
	"malaka/internal/shared/uuid"
	"time"
)

type leaveServiceImpl struct {
	leaveRepo repositories.LeaveRepository
}

func NewLeaveService(leaveRepo repositories.LeaveRepository) LeaveService {
	return &leaveServiceImpl{
		leaveRepo: leaveRepo,
	}
}

// Leave Types
func (s *leaveServiceImpl) CreateLeaveType(ctx context.Context, leaveType *entities.LeaveType) error {
	if leaveType.Name == "" {
		return errors.New("leave type name is required")
	}
	if leaveType.Code == "" {
		return errors.New("leave type code is required")
	}
	return s.leaveRepo.CreateLeaveType(ctx, leaveType)
}

func (s *leaveServiceImpl) GetLeaveTypeByID(ctx context.Context, id string) (*entities.LeaveType, error) {
	if id == "" {
		return nil, errors.New("leave type ID is required")
	}
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid leave type ID format")
	}
	return s.leaveRepo.GetLeaveTypeByID(ctx, parsedID)
}

func (s *leaveServiceImpl) GetAllLeaveTypes(ctx context.Context) ([]*entities.LeaveType, error) {
	return s.leaveRepo.GetAllLeaveTypes(ctx)
}

func (s *leaveServiceImpl) UpdateLeaveType(ctx context.Context, leaveType *entities.LeaveType) error {
	if leaveType.ID.IsNil() {
		return errors.New("leave type ID is required")
	}
	if leaveType.Name == "" {
		return errors.New("leave type name is required")
	}
	if leaveType.Code == "" {
		return errors.New("leave type code is required")
	}
	return s.leaveRepo.UpdateLeaveType(ctx, leaveType)
}

func (s *leaveServiceImpl) DeleteLeaveType(ctx context.Context, id string) error {
	if id == "" {
		return errors.New("leave type ID is required")
	}
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid leave type ID format")
	}
	return s.leaveRepo.DeleteLeaveType(ctx, parsedID)
}

// Leave Requests
func (s *leaveServiceImpl) CreateLeaveRequest(ctx context.Context, request *entities.LeaveRequest) error {
	// Validate request
	if err := s.ValidateLeaveRequest(ctx, request); err != nil {
		return err
	}

	// Calculate total days
	totalDays, err := s.CalculateLeaveDays(ctx, request.StartDate.Format("2006-01-02"), request.EndDate.Format("2006-01-02"), true, true)
	if err != nil {
		return fmt.Errorf("failed to calculate leave days: %w", err)
	}
	request.TotalDays = totalDays

	// Check leave balance
	year := request.StartDate.Year()
	hasBalance, err := s.CheckLeaveBalance(ctx, request.EmployeeID.String(), request.LeaveTypeID.String(), totalDays, year)
	if err != nil {
		return fmt.Errorf("failed to check leave balance: %w", err)
	}
	if !hasBalance {
		return errors.New("insufficient leave balance")
	}

	return s.leaveRepo.CreateLeaveRequest(ctx, request)
}

func (s *leaveServiceImpl) GetLeaveRequestByID(ctx context.Context, id string) (*entities.LeaveRequestWithDetails, error) {
	if id == "" {
		return nil, errors.New("leave request ID is required")
	}
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid leave request ID format")
	}
	return s.leaveRepo.GetLeaveRequestByID(ctx, parsedID)
}

func (s *leaveServiceImpl) GetAllLeaveRequests(ctx context.Context) ([]*entities.LeaveRequest, error) {
	return s.leaveRepo.GetAllLeaveRequests(ctx)
}

func (s *leaveServiceImpl) GetLeaveRequestsByEmployee(ctx context.Context, employeeID string) ([]*entities.LeaveRequest, error) {
	if employeeID == "" {
		return nil, errors.New("employee ID is required")
	}
	parsedID, err := uuid.Parse(employeeID)
	if err != nil {
		return nil, errors.New("invalid employee ID format")
	}
	return s.leaveRepo.GetLeaveRequestsByEmployee(ctx, parsedID)
}

func (s *leaveServiceImpl) GetLeaveRequestsByStatus(ctx context.Context, status string) ([]*entities.LeaveRequest, error) {
	if status == "" {
		return nil, errors.New("status is required")
	}
	return s.leaveRepo.GetLeaveRequestsByStatus(ctx, status)
}

func (s *leaveServiceImpl) UpdateLeaveRequest(ctx context.Context, request *entities.LeaveRequest) error {
	if request.ID.IsNil() {
		return errors.New("leave request ID is required")
	}
	if err := s.ValidateLeaveRequest(ctx, request); err != nil {
		return err
	}
	return s.leaveRepo.UpdateLeaveRequest(ctx, request)
}

func (s *leaveServiceImpl) DeleteLeaveRequest(ctx context.Context, id string) error {
	if id == "" {
		return errors.New("leave request ID is required")
	}
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return errors.New("invalid leave request ID format")
	}
	return s.leaveRepo.DeleteLeaveRequest(ctx, parsedID)
}

// Leave Balances
func (s *leaveServiceImpl) GetLeaveBalancesByEmployee(ctx context.Context, employeeID string, year int) ([]*entities.LeaveBalance, error) {
	if employeeID == "" {
		return nil, errors.New("employee ID is required")
	}
	if year == 0 {
		year = time.Now().Year()
	}
	parsedID, err := uuid.Parse(employeeID)
	if err != nil {
		return nil, errors.New("invalid employee ID format")
	}
	return s.leaveRepo.GetLeaveBalancesByEmployee(ctx, parsedID, year)
}

func (s *leaveServiceImpl) UpdateLeaveBalance(ctx context.Context, balance *entities.LeaveBalance) error {
	if balance.ID.IsNil() {
		return errors.New("leave balance ID is required")
	}
	return s.leaveRepo.UpdateLeaveBalance(ctx, balance)
}

// Leave Approval Actions
func (s *leaveServiceImpl) ApproveLeaveRequest(ctx context.Context, requestID string, approvedBy string, comments *string) error {
	if requestID == "" {
		return errors.New("leave request ID is required")
	}
	if approvedBy == "" {
		return errors.New("approver ID is required")
	}
	requestUUID, err := uuid.Parse(requestID)
	if err != nil {
		return errors.New("invalid leave request ID format")
	}
	approverUUID, err := uuid.Parse(approvedBy)
	if err != nil {
		return errors.New("invalid approver ID format")
	}
	return s.leaveRepo.ApproveLeaveRequest(ctx, requestUUID, approverUUID, comments)
}

func (s *leaveServiceImpl) RejectLeaveRequest(ctx context.Context, requestID string, rejectedBy string, reason string) error {
	if requestID == "" {
		return errors.New("leave request ID is required")
	}
	if rejectedBy == "" {
		return errors.New("rejector ID is required")
	}
	if reason == "" {
		return errors.New("rejection reason is required")
	}
	requestUUID, err := uuid.Parse(requestID)
	if err != nil {
		return errors.New("invalid leave request ID format")
	}
	rejectorUUID, err := uuid.Parse(rejectedBy)
	if err != nil {
		return errors.New("invalid rejector ID format")
	}
	return s.leaveRepo.RejectLeaveRequest(ctx, requestUUID, rejectorUUID, reason)
}

func (s *leaveServiceImpl) CancelLeaveRequest(ctx context.Context, requestID string, cancelledBy string, reason string) error {
	if requestID == "" {
		return errors.New("leave request ID is required")
	}
	if cancelledBy == "" {
		return errors.New("canceller ID is required")
	}
	if reason == "" {
		return errors.New("cancellation reason is required")
	}
	requestUUID, err := uuid.Parse(requestID)
	if err != nil {
		return errors.New("invalid leave request ID format")
	}
	cancellerUUID, err := uuid.Parse(cancelledBy)
	if err != nil {
		return errors.New("invalid canceller ID format")
	}
	return s.leaveRepo.CancelLeaveRequest(ctx, requestUUID, cancellerUUID, reason)
}

// Business Logic
func (s *leaveServiceImpl) CalculateLeaveDays(ctx context.Context, startDate, endDate string, autoDeductWeekends, autoDeductHolidays bool) (int, error) {
	start, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		return 0, fmt.Errorf("invalid start date format: %w", err)
	}

	end, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		return 0, fmt.Errorf("invalid end date format: %w", err)
	}

	if end.Before(start) {
		return 0, errors.New("end date cannot be before start date")
	}

	totalDays := 0
	for d := start; !d.After(end); d = d.AddDate(0, 0, 1) {
		// Skip weekends if auto deduction is enabled
		if autoDeductWeekends && (d.Weekday() == time.Saturday || d.Weekday() == time.Sunday) {
			continue
		}

		// Skip holidays if auto deduction is enabled (for now, just skip Indonesian public holidays)
		if autoDeductHolidays && s.isPublicHoliday(d) {
			continue
		}

		totalDays++
	}

	return totalDays, nil
}

func (s *leaveServiceImpl) ValidateLeaveRequest(ctx context.Context, request *entities.LeaveRequest) error {
	if request.EmployeeID.IsNil() {
		return errors.New("employee ID is required")
	}
	if request.LeaveTypeID.IsNil() {
		return errors.New("leave type ID is required")
	}
	if request.StartDate.IsZero() {
		return errors.New("start date is required")
	}
	if request.EndDate.IsZero() {
		return errors.New("end date is required")
	}
	if request.EndDate.Before(request.StartDate) {
		return errors.New("end date cannot be before start date")
	}
	if request.Reason == "" {
		return errors.New("reason is required")
	}

	// Validate status
	validStatuses := []string{"pending", "approved", "rejected", "cancelled"}
	isValidStatus := false
	for _, status := range validStatuses {
		if request.Status == status {
			isValidStatus = true
			break
		}
	}
	if !isValidStatus {
		return errors.New("invalid status")
	}

	return nil
}

func (s *leaveServiceImpl) CheckLeaveBalance(ctx context.Context, employeeID, leaveTypeID string, requestedDays int, year int) (bool, error) {
	employeeUUID, err := uuid.Parse(employeeID)
	if err != nil {
		return false, errors.New("invalid employee ID format")
	}
	leaveTypeUUID, err := uuid.Parse(leaveTypeID)
	if err != nil {
		return false, errors.New("invalid leave type ID format")
	}

	balances, err := s.leaveRepo.GetLeaveBalancesByEmployee(ctx, employeeUUID, year)
	if err != nil {
		return false, err
	}

	for _, balance := range balances {
		if balance.LeaveTypeID == leaveTypeUUID {
			return balance.RemainingDays >= requestedDays, nil
		}
	}

	// If no balance record found, return false (insufficient balance)
	return false, nil
}

// Helper function to check Indonesian public holidays (simplified version)
func (s *leaveServiceImpl) isPublicHoliday(date time.Time) bool {
	// This is a simplified version. In a real application, you would
	// check against a database of public holidays
	month := int(date.Month())
	day := date.Day()

	// Some fixed Indonesian holidays
	holidays := map[string]bool{
		"01-01": true, // New Year
		"08-17": true, // Independence Day
		"12-25": true, // Christmas
	}

	key := fmt.Sprintf("%02d-%02d", month, day)
	return holidays[key]
}
