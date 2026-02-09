package services

import (
	"context"
	"fmt"
	"time"

	"malaka/internal/modules/production/domain/entities"
	"malaka/internal/modules/production/domain/repositories"
	"malaka/internal/shared/uuid"
)

// QualityControlService defines the interface for quality control business logic
type QualityControlService interface {
	// CRUD operations
	CreateQualityControl(ctx context.Context, qc *entities.QualityControl) error
	GetQualityControl(ctx context.Context, id uuid.ID) (*entities.QualityControl, error)
	GetQualityControlByNumber(ctx context.Context, qcNumber string) (*entities.QualityControl, error)
	UpdateQualityControl(ctx context.Context, qc *entities.QualityControl) error
	DeleteQualityControl(ctx context.Context, id uuid.ID) error

	// List operations
	GetAllQualityControls(ctx context.Context, limit, offset int, search, status, qcType string) ([]*entities.QualityControl, int, error)

	// Status management
	StartTesting(ctx context.Context, id uuid.ID) error
	CompleteQC(ctx context.Context, id uuid.ID, passed bool) error
	SetConditional(ctx context.Context, id uuid.ID, reason string) error

	// Test management
	AddTest(ctx context.Context, qcID uuid.ID, test *entities.QualityTest) error
	UpdateTest(ctx context.Context, test *entities.QualityTest) error
	DeleteTest(ctx context.Context, testID uuid.ID) error
	RecordTestResult(ctx context.Context, testID uuid.ID, actualValue string, result entities.TestResult, score float64) error

	// Defect management
	AddDefect(ctx context.Context, qcID uuid.ID, defect *entities.QualityDefect) error
	UpdateDefect(ctx context.Context, defect *entities.QualityDefect) error
	DeleteDefect(ctx context.Context, defectID uuid.ID) error

	// Action management
	AddAction(ctx context.Context, qcID uuid.ID, action *entities.QualityAction) error
	UpdateAction(ctx context.Context, action *entities.QualityAction) error
	DeleteAction(ctx context.Context, actionID uuid.ID) error
	CompleteAction(ctx context.Context, actionID uuid.ID) error

	// Analytics and reporting
	GetStatistics(ctx context.Context) (*entities.QualityControlStatistics, error)
	GetQCByReference(ctx context.Context, referenceID uuid.ID) ([]*entities.QualityControl, error)
	GetQCByInspector(ctx context.Context, inspector string) ([]*entities.QualityControl, error)
	GetQCByDateRange(ctx context.Context, startDate, endDate string) ([]*entities.QualityControl, error)

	// Utility
	GenerateQCNumber(ctx context.Context) (string, error)
	ValidateQC(ctx context.Context, qc *entities.QualityControl) error
}

// QualityControlServiceImpl provides business logic for quality control operations
type QualityControlServiceImpl struct {
	repo repositories.QualityControlRepository
}

// NewQualityControlService creates a new quality control service
func NewQualityControlService(repo repositories.QualityControlRepository) QualityControlService {
	return &QualityControlServiceImpl{
		repo: repo,
	}
}

// CreateQualityControl creates a new quality control record
func (s *QualityControlServiceImpl) CreateQualityControl(ctx context.Context, qc *entities.QualityControl) error {
	// Validate the QC
	if err := s.ValidateQC(ctx, qc); err != nil {
		return err
	}

	// Generate QC number if not provided
	if qc.QCNumber == "" {
		qcNumber, err := s.GenerateQCNumber(ctx)
		if err != nil {
			return fmt.Errorf("failed to generate QC number: %w", err)
		}
		qc.QCNumber = qcNumber
	}

	// Check if QC number already exists
	exists, err := s.repo.ExistsQCNumber(ctx, qc.QCNumber)
	if err != nil {
		return fmt.Errorf("failed to check QC number: %w", err)
	}
	if exists {
		return fmt.Errorf("QC number %s already exists", qc.QCNumber)
	}

	// Set initial status if not provided
	if qc.Status == "" {
		qc.Status = entities.QCStatusDraft
	}

	return s.repo.Create(ctx, qc)
}

// GetQualityControl retrieves a quality control by ID
func (s *QualityControlServiceImpl) GetQualityControl(ctx context.Context, id uuid.ID) (*entities.QualityControl, error) {
	return s.repo.GetByID(ctx, id)
}

// GetQualityControlByNumber retrieves a quality control by number
func (s *QualityControlServiceImpl) GetQualityControlByNumber(ctx context.Context, qcNumber string) (*entities.QualityControl, error) {
	return s.repo.GetByQCNumber(ctx, qcNumber)
}

// UpdateQualityControl updates an existing quality control
func (s *QualityControlServiceImpl) UpdateQualityControl(ctx context.Context, qc *entities.QualityControl) error {
	// Verify the QC exists
	existingQC, err := s.repo.GetByID(ctx, qc.ID)
	if err != nil {
		return err
	}
	if existingQC == nil {
		return fmt.Errorf("quality control with ID %s not found", qc.ID)
	}

	// Validate the QC
	if err := s.ValidateQC(ctx, qc); err != nil {
		return err
	}

	// Check if QC number changed and already exists
	if qc.QCNumber != existingQC.QCNumber {
		exists, err := s.repo.ExistsQCNumber(ctx, qc.QCNumber, qc.ID)
		if err != nil {
			return fmt.Errorf("failed to check QC number: %w", err)
		}
		if exists {
			return fmt.Errorf("QC number %s already exists", qc.QCNumber)
		}
	}

	return s.repo.Update(ctx, qc)
}

// DeleteQualityControl deletes a quality control
func (s *QualityControlServiceImpl) DeleteQualityControl(ctx context.Context, id uuid.ID) error {
	// Verify the QC exists
	existingQC, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existingQC == nil {
		return fmt.Errorf("quality control with ID %s not found", id)
	}

	// Only allow deleting draft or failed QC records
	if existingQC.Status != entities.QCStatusDraft && existingQC.Status != entities.QCStatusFailed {
		return fmt.Errorf("cannot delete quality control with status %s", existingQC.Status)
	}

	return s.repo.Delete(ctx, id)
}

// GetAllQualityControls retrieves all quality controls with pagination
func (s *QualityControlServiceImpl) GetAllQualityControls(ctx context.Context, limit, offset int, search, status, qcType string) ([]*entities.QualityControl, int, error) {
	return s.repo.GetAllWithPagination(ctx, limit, offset, search, status, qcType)
}

// StartTesting transitions QC to testing status
func (s *QualityControlServiceImpl) StartTesting(ctx context.Context, id uuid.ID) error {
	qc, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if qc.Status != entities.QCStatusDraft {
		return fmt.Errorf("can only start testing from draft status")
	}

	qc.Status = entities.QCStatusTesting
	return s.repo.Update(ctx, qc)
}

// CompleteQC marks QC as passed or failed
func (s *QualityControlServiceImpl) CompleteQC(ctx context.Context, id uuid.ID, passed bool) error {
	qc, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if qc.Status != entities.QCStatusTesting {
		return fmt.Errorf("can only complete QC that is in testing status")
	}

	if passed {
		qc.Status = entities.QCStatusPassed
	} else {
		qc.Status = entities.QCStatusFailed
	}

	// Calculate overall score
	qc.OverallScore = qc.CalculateOverallScore()

	return s.repo.Update(ctx, qc)
}

// SetConditional marks QC as conditionally accepted
func (s *QualityControlServiceImpl) SetConditional(ctx context.Context, id uuid.ID, reason string) error {
	qc, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	qc.Status = entities.QCStatusConditional
	qc.Notes = &reason

	return s.repo.Update(ctx, qc)
}

// Test management
func (s *QualityControlServiceImpl) AddTest(ctx context.Context, qcID uuid.ID, test *entities.QualityTest) error {
	// Verify the QC exists
	qc, err := s.repo.GetByID(ctx, qcID)
	if err != nil {
		return err
	}
	if qc == nil {
		return fmt.Errorf("quality control with ID %s not found", qcID)
	}

	test.QualityCtrlID = qcID
	return s.repo.AddTest(ctx, test)
}

func (s *QualityControlServiceImpl) UpdateTest(ctx context.Context, test *entities.QualityTest) error {
	return s.repo.UpdateTest(ctx, test)
}

func (s *QualityControlServiceImpl) DeleteTest(ctx context.Context, testID uuid.ID) error {
	return s.repo.DeleteTest(ctx, testID)
}

func (s *QualityControlServiceImpl) RecordTestResult(ctx context.Context, testID uuid.ID, actualValue string, result entities.TestResult, score float64) error {
	test := &entities.QualityTest{
		ID:          testID,
		ActualValue: actualValue,
		Result:      result,
		Score:       score,
	}
	return s.repo.UpdateTest(ctx, test)
}

// Defect management
func (s *QualityControlServiceImpl) AddDefect(ctx context.Context, qcID uuid.ID, defect *entities.QualityDefect) error {
	// Verify the QC exists
	qc, err := s.repo.GetByID(ctx, qcID)
	if err != nil {
		return err
	}
	if qc == nil {
		return fmt.Errorf("quality control with ID %s not found", qcID)
	}

	defect.QualityCtrlID = qcID
	return s.repo.AddDefect(ctx, defect)
}

func (s *QualityControlServiceImpl) UpdateDefect(ctx context.Context, defect *entities.QualityDefect) error {
	return s.repo.UpdateDefect(ctx, defect)
}

func (s *QualityControlServiceImpl) DeleteDefect(ctx context.Context, defectID uuid.ID) error {
	return s.repo.DeleteDefect(ctx, defectID)
}

// Action management
func (s *QualityControlServiceImpl) AddAction(ctx context.Context, qcID uuid.ID, action *entities.QualityAction) error {
	// Verify the QC exists
	qc, err := s.repo.GetByID(ctx, qcID)
	if err != nil {
		return err
	}
	if qc == nil {
		return fmt.Errorf("quality control with ID %s not found", qcID)
	}

	action.QualityCtrlID = qcID
	action.Status = entities.ActionStatusPending
	return s.repo.AddAction(ctx, action)
}

func (s *QualityControlServiceImpl) UpdateAction(ctx context.Context, action *entities.QualityAction) error {
	return s.repo.UpdateAction(ctx, action)
}

func (s *QualityControlServiceImpl) DeleteAction(ctx context.Context, actionID uuid.ID) error {
	return s.repo.DeleteAction(ctx, actionID)
}

func (s *QualityControlServiceImpl) CompleteAction(ctx context.Context, actionID uuid.ID) error {
	now := time.Now()
	action := &entities.QualityAction{
		ID:            actionID,
		Status:        entities.ActionStatusCompleted,
		CompletedDate: &now,
	}
	return s.repo.UpdateAction(ctx, action)
}

// Analytics
func (s *QualityControlServiceImpl) GetStatistics(ctx context.Context) (*entities.QualityControlStatistics, error) {
	return s.repo.GetStatistics(ctx)
}

func (s *QualityControlServiceImpl) GetQCByReference(ctx context.Context, referenceID uuid.ID) ([]*entities.QualityControl, error) {
	return s.repo.GetByReferenceID(ctx, referenceID)
}

func (s *QualityControlServiceImpl) GetQCByInspector(ctx context.Context, inspector string) ([]*entities.QualityControl, error) {
	return s.repo.GetByInspector(ctx, inspector)
}

func (s *QualityControlServiceImpl) GetQCByDateRange(ctx context.Context, startDate, endDate string) ([]*entities.QualityControl, error) {
	return s.repo.GetByDateRange(ctx, startDate, endDate)
}

// Utility
func (s *QualityControlServiceImpl) GenerateQCNumber(ctx context.Context) (string, error) {
	nextNum, err := s.repo.GetNextQCNumber(ctx)
	if err != nil {
		nextNum = 1
	}
	return fmt.Sprintf("QC-%06d", nextNum), nil
}

func (s *QualityControlServiceImpl) ValidateQC(ctx context.Context, qc *entities.QualityControl) error {
	return qc.Validate()
}
