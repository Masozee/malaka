package entities

import (
	"time"

	"github.com/lib/pq"
	"malaka/internal/shared/uuid"
)

// QCType represents the type of quality control inspection
type QCType string

const (
	QCTypeIncoming  QCType = "incoming"
	QCTypeInProcess QCType = "in_process"
	QCTypeFinal     QCType = "final"
	QCTypeRandom    QCType = "random"
)

// QCReferenceType represents what the QC is checking
type QCReferenceType string

const (
	QCReferencePurchaseOrder QCReferenceType = "purchase_order"
	QCReferenceWorkOrder     QCReferenceType = "work_order"
	QCReferenceFinishedGoods QCReferenceType = "finished_goods"
)

// QCStatus represents the status of quality control
type QCStatus string

const (
	QCStatusDraft       QCStatus = "draft"
	QCStatusTesting     QCStatus = "testing"
	QCStatusPassed      QCStatus = "passed"
	QCStatusFailed      QCStatus = "failed"
	QCStatusConditional QCStatus = "conditional"
)

// TestType represents the type of quality test
type TestType string

const (
	TestTypeVisual      TestType = "visual"
	TestTypeMeasurement TestType = "measurement"
	TestTypeFunctional  TestType = "functional"
	TestTypeDurability  TestType = "durability"
	TestTypeChemical    TestType = "chemical"
)

// TestResult represents the result of a quality test
type TestResult string

const (
	TestResultPass     TestResult = "pass"
	TestResultFail     TestResult = "fail"
	TestResultMarginal TestResult = "marginal"
)

// DefectSeverity represents how severe a defect is
type DefectSeverity string

const (
	DefectSeverityMinor    DefectSeverity = "minor"
	DefectSeverityMajor    DefectSeverity = "major"
	DefectSeverityCritical DefectSeverity = "critical"
)

// ActionType represents the type of corrective action
type ActionType string

const (
	ActionTypeAccept            ActionType = "accept"
	ActionTypeReject            ActionType = "reject"
	ActionTypeRework            ActionType = "rework"
	ActionTypeQuarantine        ActionType = "quarantine"
	ActionTypeConditionalAccept ActionType = "conditional_accept"
)

// ActionStatus represents the status of a corrective action
type ActionStatus string

const (
	ActionStatusPending    ActionStatus = "pending"
	ActionStatusInProgress ActionStatus = "in_progress"
	ActionStatusCompleted  ActionStatus = "completed"
)

// QualityControl represents a quality control inspection record
type QualityControl struct {
	ID              uuid.ID         `json:"id" db:"id"`
	QCNumber        string          `json:"qc_number" db:"qc_number"`
	Type            QCType          `json:"type" db:"type"`
	ReferenceType   QCReferenceType `json:"reference_type" db:"reference_type"`
	ReferenceID     uuid.ID         `json:"reference_id" db:"reference_id"`
	ReferenceNumber string          `json:"reference_number" db:"reference_number"`
	ProductID       uuid.ID         `json:"product_id" db:"product_id"`
	ProductCode     string          `json:"product_code" db:"product_code"`
	ProductName     string          `json:"product_name" db:"product_name"`
	BatchNumber     string          `json:"batch_number" db:"batch_number"`
	QuantityTested  int             `json:"quantity_tested" db:"quantity_tested"`
	SampleSize      int             `json:"sample_size" db:"sample_size"`
	TestDate        time.Time       `json:"test_date" db:"test_date"`
	Inspector       string          `json:"inspector" db:"inspector"`
	Status          QCStatus        `json:"status" db:"status"`
	OverallScore    float64         `json:"overall_score" db:"overall_score"`
	Notes           *string         `json:"notes,omitempty" db:"notes"`
	CreatedAt       time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at" db:"updated_at"`

	// Related data (not stored in main table)
	Tests   []QualityTest   `json:"tests,omitempty"`
	Defects []QualityDefect `json:"defects,omitempty"`
	Actions []QualityAction `json:"actions,omitempty"`
}

// QualityTest represents a single test within a quality control inspection
type QualityTest struct {
	ID             uuid.ID    `json:"id" db:"id"`
	QualityCtrlID  uuid.ID    `json:"quality_ctrl_id" db:"quality_ctrl_id"`
	TestName       string     `json:"test_name" db:"test_name"`
	TestType       TestType   `json:"test_type" db:"test_type"`
	Specification  string     `json:"specification" db:"specification"`
	ActualValue    string     `json:"actual_value" db:"actual_value"`
	Result         TestResult `json:"result" db:"result"`
	Score          float64    `json:"score" db:"score"`
	Notes          *string    `json:"notes,omitempty" db:"notes"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at" db:"updated_at"`
}

// QualityDefect represents a defect found during quality control
type QualityDefect struct {
	ID            uuid.ID        `json:"id" db:"id"`
	QualityCtrlID uuid.ID        `json:"quality_ctrl_id" db:"quality_ctrl_id"`
	DefectType    string         `json:"defect_type" db:"defect_type"`
	Description   string         `json:"description" db:"description"`
	Severity      DefectSeverity `json:"severity" db:"severity"`
	Quantity      int            `json:"quantity" db:"quantity"`
	Location      *string        `json:"location,omitempty" db:"location"`
	Images        pq.StringArray `json:"images,omitempty" db:"images"`
	CreatedAt     time.Time      `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at" db:"updated_at"`
}

// QualityAction represents a corrective action for quality control
type QualityAction struct {
	ID            uuid.ID      `json:"id" db:"id"`
	QualityCtrlID uuid.ID      `json:"quality_ctrl_id" db:"quality_ctrl_id"`
	ActionType    ActionType   `json:"action_type" db:"action_type"`
	Description   string       `json:"description" db:"description"`
	AssignedTo    uuid.ID      `json:"assigned_to" db:"assigned_to"`
	DueDate       time.Time    `json:"due_date" db:"due_date"`
	Status        ActionStatus `json:"status" db:"status"`
	CompletedDate *time.Time   `json:"completed_date,omitempty" db:"completed_date"`
	CreatedAt     time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at" db:"updated_at"`
}

// QualityControlFilters represents filtering options for quality control records
type QualityControlFilters struct {
	Search        *string          `json:"search,omitempty"`
	Type          *QCType          `json:"type,omitempty"`
	Status        *QCStatus        `json:"status,omitempty"`
	ReferenceType *QCReferenceType `json:"reference_type,omitempty"`
	Inspector     *string          `json:"inspector,omitempty"`
	StartDate     *time.Time       `json:"start_date,omitempty"`
	EndDate       *time.Time       `json:"end_date,omitempty"`
	ScoreMin      *float64         `json:"score_min,omitempty"`
	ScoreMax      *float64         `json:"score_max,omitempty"`
}

// QualityControlStatistics represents aggregated statistics for quality control
type QualityControlStatistics struct {
	TotalInspections   int     `json:"total_inspections"`
	PassedInspections  int     `json:"passed_inspections"`
	FailedInspections  int     `json:"failed_inspections"`
	PendingInspections int     `json:"pending_inspections"`
	AverageScore       float64 `json:"average_score"`
	DefectRate         float64 `json:"defect_rate"`
}

// Validate validates the quality control record
func (qc *QualityControl) Validate() error {
	if qc.QCNumber == "" {
		return NewValidationError("qc_number", "QC number is required")
	}
	if qc.ProductID.IsNil() {
		return NewValidationError("product_id", "Product ID is required")
	}
	if qc.Inspector == "" {
		return NewValidationError("inspector", "Inspector is required")
	}
	if qc.QuantityTested <= 0 {
		return NewValidationError("quantity_tested", "Quantity tested must be positive")
	}
	if qc.SampleSize <= 0 {
		return NewValidationError("sample_size", "Sample size must be positive")
	}
	return nil
}

// CalculateOverallScore calculates the overall score based on tests
func (qc *QualityControl) CalculateOverallScore() float64 {
	if len(qc.Tests) == 0 {
		return 0
	}

	var totalScore float64
	for _, test := range qc.Tests {
		totalScore += test.Score
	}

	return totalScore / float64(len(qc.Tests))
}

// DetermineStatus determines the final status based on tests and defects
func (qc *QualityControl) DetermineStatus() QCStatus {
	if len(qc.Tests) == 0 {
		return QCStatusDraft
	}

	failedCount := 0
	marginalCount := 0
	for _, test := range qc.Tests {
		if test.Result == TestResultFail {
			failedCount++
		} else if test.Result == TestResultMarginal {
			marginalCount++
		}
	}

	// Check for critical defects
	for _, defect := range qc.Defects {
		if defect.Severity == DefectSeverityCritical {
			return QCStatusFailed
		}
	}

	if failedCount > 0 {
		return QCStatusFailed
	}
	if marginalCount > 0 {
		return QCStatusConditional
	}
	return QCStatusPassed
}
