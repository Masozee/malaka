package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"malaka/internal/modules/production/domain/entities"
)

// QualityControlRequest represents the request body for creating/updating quality control
type QualityControlRequest struct {
	QCNumber        string                `json:"qc_number"`
	Type            string                `json:"type" binding:"required,oneof=incoming in_process final random"`
	ReferenceType   string                `json:"reference_type" binding:"required,oneof=purchase_order work_order finished_goods"`
	ReferenceID     string                `json:"reference_id" binding:"required"`
	ReferenceNumber string                `json:"reference_number"`
	ProductID       string                `json:"product_id" binding:"required"`
	ProductCode     string                `json:"product_code"`
	ProductName     string                `json:"product_name"`
	BatchNumber     string                `json:"batch_number" binding:"required"`
	QuantityTested  int                   `json:"quantity_tested" binding:"required,gt=0"`
	SampleSize      int                   `json:"sample_size" binding:"required,gt=0"`
	TestDate        string                `json:"test_date" binding:"required"`
	Inspector       string                `json:"inspector" binding:"required"`
	Status          string                `json:"status"`
	OverallScore    float64               `json:"overall_score"`
	Notes           *string               `json:"notes"`
	Tests           []QualityTestRequest  `json:"tests"`
	Defects         []QualityDefectRequest `json:"defects"`
	Actions         []QualityActionRequest `json:"actions"`
}

// QualityTestRequest represents a test in a quality control request
type QualityTestRequest struct {
	ID            *string `json:"id"`
	TestName      string  `json:"test_name" binding:"required"`
	TestType      string  `json:"test_type" binding:"required,oneof=visual measurement functional durability chemical"`
	Specification string  `json:"specification" binding:"required"`
	ActualValue   string  `json:"actual_value"`
	Result        string  `json:"result" binding:"omitempty,oneof=pass fail marginal"`
	Score         float64 `json:"score"`
	Notes         *string `json:"notes"`
}

// QualityDefectRequest represents a defect in a quality control request
type QualityDefectRequest struct {
	ID          *string  `json:"id"`
	DefectType  string   `json:"defect_type" binding:"required"`
	Description string   `json:"description" binding:"required"`
	Severity    string   `json:"severity" binding:"required,oneof=minor major critical"`
	Quantity    int      `json:"quantity" binding:"required,gt=0"`
	Location    *string  `json:"location"`
	Images      []string `json:"images"`
}

// QualityActionRequest represents an action in a quality control request
type QualityActionRequest struct {
	ID          *string `json:"id"`
	ActionType  string  `json:"action_type" binding:"required,oneof=accept reject rework quarantine conditional_accept"`
	Description string  `json:"description" binding:"required"`
	AssignedTo  string  `json:"assigned_to" binding:"required"`
	DueDate     string  `json:"due_date" binding:"required"`
	Status      string  `json:"status" binding:"omitempty,oneof=pending in_progress completed"`
}

// QualityControlResponse represents the response for quality control
type QualityControlResponse struct {
	ID              string                  `json:"id"`
	QCNumber        string                  `json:"qc_number"`
	Type            string                  `json:"type"`
	ReferenceType   string                  `json:"reference_type"`
	ReferenceID     string                  `json:"reference_id"`
	ReferenceNumber string                  `json:"reference_number"`
	ProductID       string                  `json:"product_id"`
	ProductCode     string                  `json:"product_code"`
	ProductName     string                  `json:"product_name"`
	BatchNumber     string                  `json:"batch_number"`
	QuantityTested  int                     `json:"quantity_tested"`
	SampleSize      int                     `json:"sample_size"`
	TestDate        string                  `json:"test_date"`
	Inspector       string                  `json:"inspector"`
	Status          string                  `json:"status"`
	OverallScore    float64                 `json:"overall_score"`
	Notes           *string                 `json:"notes,omitempty"`
	Tests           []QualityTestResponse   `json:"tests"`
	Defects         []QualityDefectResponse `json:"defects"`
	Actions         []QualityActionResponse `json:"actions"`
	CreatedAt       string                  `json:"created_at"`
	UpdatedAt       string                  `json:"updated_at"`
}

// QualityTestResponse represents a test in a quality control response
type QualityTestResponse struct {
	ID            string  `json:"id"`
	TestName      string  `json:"test_name"`
	TestType      string  `json:"test_type"`
	Specification string  `json:"specification"`
	ActualValue   string  `json:"actual_value"`
	Result        string  `json:"result"`
	Score         float64 `json:"score"`
	Notes         *string `json:"notes,omitempty"`
}

// QualityDefectResponse represents a defect in a quality control response
type QualityDefectResponse struct {
	ID          string   `json:"id"`
	DefectType  string   `json:"defect_type"`
	Description string   `json:"description"`
	Severity    string   `json:"severity"`
	Quantity    int      `json:"quantity"`
	Location    *string  `json:"location,omitempty"`
	Images      []string `json:"images,omitempty"`
}

// QualityActionResponse represents an action in a quality control response
type QualityActionResponse struct {
	ID            string  `json:"id"`
	ActionType    string  `json:"action_type"`
	Description   string  `json:"description"`
	AssignedTo    string  `json:"assigned_to"`
	DueDate       string  `json:"due_date"`
	Status        string  `json:"status"`
	CompletedDate *string `json:"completed_date,omitempty"`
}

// QualityControlStatisticsResponse represents the statistics response
type QualityControlStatisticsResponse struct {
	TotalInspections   int     `json:"total_inspections"`
	PassedInspections  int     `json:"passed_inspections"`
	FailedInspections  int     `json:"failed_inspections"`
	PendingInspections int     `json:"pending_inspections"`
	AverageScore       float64 `json:"average_score"`
	DefectRate         float64 `json:"defect_rate"`
}

// Mapping functions

// MapQualityControlRequestToEntity maps request to entity
func MapQualityControlRequestToEntity(req *QualityControlRequest) *entities.QualityControl {
	testDate, _ := time.Parse("2006-01-02", req.TestDate)

	qc := &entities.QualityControl{
		QCNumber:        req.QCNumber,
		Type:            entities.QCType(req.Type),
		ReferenceType:   entities.QCReferenceType(req.ReferenceType),
		ReferenceID:     req.ReferenceID,
		ReferenceNumber: req.ReferenceNumber,
		ProductID:       req.ProductID,
		ProductCode:     req.ProductCode,
		ProductName:     req.ProductName,
		BatchNumber:     req.BatchNumber,
		QuantityTested:  req.QuantityTested,
		SampleSize:      req.SampleSize,
		TestDate:        testDate,
		Inspector:       req.Inspector,
		Status:          entities.QCStatus(req.Status),
		OverallScore:    req.OverallScore,
		Notes:           req.Notes,
	}

	// Map tests
	for _, test := range req.Tests {
		qc.Tests = append(qc.Tests, MapQualityTestRequestToEntity(&test))
	}

	// Map defects
	for _, defect := range req.Defects {
		qc.Defects = append(qc.Defects, MapQualityDefectRequestToEntity(&defect))
	}

	// Map actions
	for _, action := range req.Actions {
		qc.Actions = append(qc.Actions, MapQualityActionRequestToEntity(&action))
	}

	return qc
}

// MapQualityTestRequestToEntity maps test request to entity
func MapQualityTestRequestToEntity(req *QualityTestRequest) entities.QualityTest {
	test := entities.QualityTest{
		TestName:      req.TestName,
		TestType:      entities.TestType(req.TestType),
		Specification: req.Specification,
		ActualValue:   req.ActualValue,
		Result:        entities.TestResult(req.Result),
		Score:         req.Score,
		Notes:         req.Notes,
	}

	if req.ID != nil && *req.ID != "" {
		test.ID, _ = uuid.Parse(*req.ID)
	}

	return test
}

// MapQualityDefectRequestToEntity maps defect request to entity
func MapQualityDefectRequestToEntity(req *QualityDefectRequest) entities.QualityDefect {
	defect := entities.QualityDefect{
		DefectType:  req.DefectType,
		Description: req.Description,
		Severity:    entities.DefectSeverity(req.Severity),
		Quantity:    req.Quantity,
		Location:    req.Location,
		Images:      pq.StringArray(req.Images),
	}

	if req.ID != nil && *req.ID != "" {
		defect.ID, _ = uuid.Parse(*req.ID)
	}

	return defect
}

// MapQualityActionRequestToEntity maps action request to entity
func MapQualityActionRequestToEntity(req *QualityActionRequest) entities.QualityAction {
	dueDate, _ := time.Parse("2006-01-02", req.DueDate)

	action := entities.QualityAction{
		ActionType:  entities.ActionType(req.ActionType),
		Description: req.Description,
		AssignedTo:  req.AssignedTo,
		DueDate:     dueDate,
		Status:      entities.ActionStatus(req.Status),
	}

	if req.ID != nil && *req.ID != "" {
		action.ID, _ = uuid.Parse(*req.ID)
	}

	return action
}

// MapQualityControlEntityToResponse maps entity to response
func MapQualityControlEntityToResponse(qc *entities.QualityControl) *QualityControlResponse {
	resp := &QualityControlResponse{
		ID:              qc.ID.String(),
		QCNumber:        qc.QCNumber,
		Type:            string(qc.Type),
		ReferenceType:   string(qc.ReferenceType),
		ReferenceID:     qc.ReferenceID,
		ReferenceNumber: qc.ReferenceNumber,
		ProductID:       qc.ProductID,
		ProductCode:     qc.ProductCode,
		ProductName:     qc.ProductName,
		BatchNumber:     qc.BatchNumber,
		QuantityTested:  qc.QuantityTested,
		SampleSize:      qc.SampleSize,
		TestDate:        qc.TestDate.Format("2006-01-02"),
		Inspector:       qc.Inspector,
		Status:          string(qc.Status),
		OverallScore:    qc.OverallScore,
		Notes:           qc.Notes,
		Tests:           make([]QualityTestResponse, 0),
		Defects:         make([]QualityDefectResponse, 0),
		Actions:         make([]QualityActionResponse, 0),
		CreatedAt:       qc.CreatedAt.Format(time.RFC3339),
		UpdatedAt:       qc.UpdatedAt.Format(time.RFC3339),
	}

	// Map tests
	for _, test := range qc.Tests {
		resp.Tests = append(resp.Tests, MapQualityTestEntityToResponse(&test))
	}

	// Map defects
	for _, defect := range qc.Defects {
		resp.Defects = append(resp.Defects, MapQualityDefectEntityToResponse(&defect))
	}

	// Map actions
	for _, action := range qc.Actions {
		resp.Actions = append(resp.Actions, MapQualityActionEntityToResponse(&action))
	}

	return resp
}

// MapQualityTestEntityToResponse maps test entity to response
func MapQualityTestEntityToResponse(test *entities.QualityTest) QualityTestResponse {
	return QualityTestResponse{
		ID:            test.ID.String(),
		TestName:      test.TestName,
		TestType:      string(test.TestType),
		Specification: test.Specification,
		ActualValue:   test.ActualValue,
		Result:        string(test.Result),
		Score:         test.Score,
		Notes:         test.Notes,
	}
}

// MapQualityDefectEntityToResponse maps defect entity to response
func MapQualityDefectEntityToResponse(defect *entities.QualityDefect) QualityDefectResponse {
	return QualityDefectResponse{
		ID:          defect.ID.String(),
		DefectType:  defect.DefectType,
		Description: defect.Description,
		Severity:    string(defect.Severity),
		Quantity:    defect.Quantity,
		Location:    defect.Location,
		Images:      defect.Images,
	}
}

// MapQualityActionEntityToResponse maps action entity to response
func MapQualityActionEntityToResponse(action *entities.QualityAction) QualityActionResponse {
	resp := QualityActionResponse{
		ID:          action.ID.String(),
		ActionType:  string(action.ActionType),
		Description: action.Description,
		AssignedTo:  action.AssignedTo,
		DueDate:     action.DueDate.Format("2006-01-02"),
		Status:      string(action.Status),
	}

	if action.CompletedDate != nil {
		completedDate := action.CompletedDate.Format("2006-01-02")
		resp.CompletedDate = &completedDate
	}

	return resp
}

// MapStatisticsEntityToResponse maps statistics entity to response
func MapStatisticsEntityToResponse(stats *entities.QualityControlStatistics) *QualityControlStatisticsResponse {
	return &QualityControlStatisticsResponse{
		TotalInspections:   stats.TotalInspections,
		PassedInspections:  stats.PassedInspections,
		FailedInspections:  stats.FailedInspections,
		PendingInspections: stats.PendingInspections,
		AverageScore:       stats.AverageScore,
		DefectRate:         stats.DefectRate,
	}
}
