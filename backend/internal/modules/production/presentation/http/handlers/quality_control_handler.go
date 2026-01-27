package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"malaka/internal/modules/production/domain/services"
	"malaka/internal/modules/production/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/types"
)

type QualityControlHandler struct {
	qcService services.QualityControlService
}

func NewQualityControlHandler(qcService services.QualityControlService) *QualityControlHandler {
	return &QualityControlHandler{
		qcService: qcService,
	}
}

// GetQualityControls handles GET /api/v1/production/quality-control
func (h *QualityControlHandler) GetQualityControls(c *gin.Context) {
	// Get pagination parameters
	page := 1
	limit := 10
	search := c.Query("search")
	status := c.Query("status")
	qcType := c.Query("type")

	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}

	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	offset := (page - 1) * limit

	qcList, total, err := h.qcService.GetAllQualityControls(
		c.Request.Context(),
		limit,
		offset,
		search,
		status,
		qcType,
	)
	if err != nil {
		response.BadRequest(c, "Failed to retrieve quality controls", err.Error())
		return
	}

	// Map to response DTOs
	var responseList []dto.QualityControlResponse
	for _, qc := range qcList {
		responseList = append(responseList, *dto.MapQualityControlEntityToResponse(qc))
	}

	// Calculate pagination info
	totalPages := (total + limit - 1) / limit

	responseData := map[string]interface{}{
		"data": responseList,
		"pagination": types.Pagination{
			Page:       page,
			Limit:      limit,
			TotalRows:  total,
			TotalPages: totalPages,
		},
	}

	response.OK(c, "Quality controls retrieved successfully", responseData)
}

// GetQualityControl handles GET /api/v1/production/quality-control/:id
func (h *QualityControlHandler) GetQualityControl(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid quality control ID", err.Error())
		return
	}

	qc, err := h.qcService.GetQualityControl(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "Quality control not found", err.Error())
		return
	}

	response.OK(c, "Quality control retrieved successfully", dto.MapQualityControlEntityToResponse(qc))
}

// CreateQualityControl handles POST /api/v1/production/quality-control
func (h *QualityControlHandler) CreateQualityControl(c *gin.Context) {
	var req dto.QualityControlRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	qc := dto.MapQualityControlRequestToEntity(&req)
	qc.ID = uuid.New()

	if err := h.qcService.CreateQualityControl(c.Request.Context(), qc); err != nil {
		response.InternalServerError(c, "Failed to create quality control", err.Error())
		return
	}

	// Fetch the created record to get the full response with related data
	createdQC, err := h.qcService.GetQualityControl(c.Request.Context(), qc.ID)
	if err != nil {
		response.InternalServerError(c, "Quality control created but failed to retrieve", err.Error())
		return
	}

	response.Created(c, "Quality control created successfully", dto.MapQualityControlEntityToResponse(createdQC))
}

// UpdateQualityControl handles PUT /api/v1/production/quality-control/:id
func (h *QualityControlHandler) UpdateQualityControl(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid quality control ID", err.Error())
		return
	}

	var req dto.QualityControlRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	qc := dto.MapQualityControlRequestToEntity(&req)
	qc.ID = id

	if err := h.qcService.UpdateQualityControl(c.Request.Context(), qc); err != nil {
		response.InternalServerError(c, "Failed to update quality control", err.Error())
		return
	}

	// Fetch the updated record
	updatedQC, err := h.qcService.GetQualityControl(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, "Quality control updated but failed to retrieve", err.Error())
		return
	}

	response.OK(c, "Quality control updated successfully", dto.MapQualityControlEntityToResponse(updatedQC))
}

// DeleteQualityControl handles DELETE /api/v1/production/quality-control/:id
func (h *QualityControlHandler) DeleteQualityControl(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid quality control ID", err.Error())
		return
	}

	if err := h.qcService.DeleteQualityControl(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, "Failed to delete quality control", err.Error())
		return
	}

	response.OK(c, "Quality control deleted successfully", nil)
}

// GetStatistics handles GET /api/v1/production/quality-control/statistics
func (h *QualityControlHandler) GetStatistics(c *gin.Context) {
	stats, err := h.qcService.GetStatistics(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve statistics", err.Error())
		return
	}

	response.OK(c, "Quality control statistics retrieved successfully", dto.MapStatisticsEntityToResponse(stats))
}

// StartTesting handles POST /api/v1/production/quality-control/:id/start-testing
func (h *QualityControlHandler) StartTesting(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid quality control ID", err.Error())
		return
	}

	if err := h.qcService.StartTesting(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, "Failed to start testing", err.Error())
		return
	}

	// Fetch the updated record
	qc, err := h.qcService.GetQualityControl(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, "Testing started but failed to retrieve", err.Error())
		return
	}

	response.OK(c, "Quality control testing started successfully", dto.MapQualityControlEntityToResponse(qc))
}

// CompleteQC handles POST /api/v1/production/quality-control/:id/complete
func (h *QualityControlHandler) CompleteQC(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid quality control ID", err.Error())
		return
	}

	var req struct {
		Passed bool `json:"passed"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	if err := h.qcService.CompleteQC(c.Request.Context(), id, req.Passed); err != nil {
		response.InternalServerError(c, "Failed to complete quality control", err.Error())
		return
	}

	// Fetch the updated record
	qc, err := h.qcService.GetQualityControl(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, "Quality control completed but failed to retrieve", err.Error())
		return
	}

	response.OK(c, "Quality control completed successfully", dto.MapQualityControlEntityToResponse(qc))
}

// AddTest handles POST /api/v1/production/quality-control/:id/tests
func (h *QualityControlHandler) AddTest(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid quality control ID", err.Error())
		return
	}

	var req dto.QualityTestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	test := dto.MapQualityTestRequestToEntity(&req)
	if err := h.qcService.AddTest(c.Request.Context(), id, &test); err != nil {
		response.InternalServerError(c, "Failed to add test", err.Error())
		return
	}

	response.Created(c, "Test added successfully", dto.MapQualityTestEntityToResponse(&test))
}

// UpdateTest handles PUT /api/v1/production/quality-control/:id/tests/:testId
func (h *QualityControlHandler) UpdateTest(c *gin.Context) {
	testIDStr := c.Param("testId")
	testID, err := uuid.Parse(testIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid test ID", err.Error())
		return
	}

	var req dto.QualityTestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	test := dto.MapQualityTestRequestToEntity(&req)
	test.ID = testID

	if err := h.qcService.UpdateTest(c.Request.Context(), &test); err != nil {
		response.InternalServerError(c, "Failed to update test", err.Error())
		return
	}

	response.OK(c, "Test updated successfully", dto.MapQualityTestEntityToResponse(&test))
}

// DeleteTest handles DELETE /api/v1/production/quality-control/:id/tests/:testId
func (h *QualityControlHandler) DeleteTest(c *gin.Context) {
	testIDStr := c.Param("testId")
	testID, err := uuid.Parse(testIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid test ID", err.Error())
		return
	}

	if err := h.qcService.DeleteTest(c.Request.Context(), testID); err != nil {
		response.InternalServerError(c, "Failed to delete test", err.Error())
		return
	}

	response.OK(c, "Test deleted successfully", nil)
}

// AddDefect handles POST /api/v1/production/quality-control/:id/defects
func (h *QualityControlHandler) AddDefect(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid quality control ID", err.Error())
		return
	}

	var req dto.QualityDefectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	defect := dto.MapQualityDefectRequestToEntity(&req)
	if err := h.qcService.AddDefect(c.Request.Context(), id, &defect); err != nil {
		response.InternalServerError(c, "Failed to add defect", err.Error())
		return
	}

	response.Created(c, "Defect added successfully", dto.MapQualityDefectEntityToResponse(&defect))
}

// UpdateDefect handles PUT /api/v1/production/quality-control/:id/defects/:defectId
func (h *QualityControlHandler) UpdateDefect(c *gin.Context) {
	defectIDStr := c.Param("defectId")
	defectID, err := uuid.Parse(defectIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid defect ID", err.Error())
		return
	}

	var req dto.QualityDefectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	defect := dto.MapQualityDefectRequestToEntity(&req)
	defect.ID = defectID

	if err := h.qcService.UpdateDefect(c.Request.Context(), &defect); err != nil {
		response.InternalServerError(c, "Failed to update defect", err.Error())
		return
	}

	response.OK(c, "Defect updated successfully", dto.MapQualityDefectEntityToResponse(&defect))
}

// DeleteDefect handles DELETE /api/v1/production/quality-control/:id/defects/:defectId
func (h *QualityControlHandler) DeleteDefect(c *gin.Context) {
	defectIDStr := c.Param("defectId")
	defectID, err := uuid.Parse(defectIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid defect ID", err.Error())
		return
	}

	if err := h.qcService.DeleteDefect(c.Request.Context(), defectID); err != nil {
		response.InternalServerError(c, "Failed to delete defect", err.Error())
		return
	}

	response.OK(c, "Defect deleted successfully", nil)
}

// AddAction handles POST /api/v1/production/quality-control/:id/actions
func (h *QualityControlHandler) AddAction(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid quality control ID", err.Error())
		return
	}

	var req dto.QualityActionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	action := dto.MapQualityActionRequestToEntity(&req)
	if err := h.qcService.AddAction(c.Request.Context(), id, &action); err != nil {
		response.InternalServerError(c, "Failed to add action", err.Error())
		return
	}

	response.Created(c, "Action added successfully", dto.MapQualityActionEntityToResponse(&action))
}

// UpdateAction handles PUT /api/v1/production/quality-control/:id/actions/:actionId
func (h *QualityControlHandler) UpdateAction(c *gin.Context) {
	actionIDStr := c.Param("actionId")
	actionID, err := uuid.Parse(actionIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid action ID", err.Error())
		return
	}

	var req dto.QualityActionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	action := dto.MapQualityActionRequestToEntity(&req)
	action.ID = actionID

	if err := h.qcService.UpdateAction(c.Request.Context(), &action); err != nil {
		response.InternalServerError(c, "Failed to update action", err.Error())
		return
	}

	response.OK(c, "Action updated successfully", dto.MapQualityActionEntityToResponse(&action))
}

// DeleteAction handles DELETE /api/v1/production/quality-control/:id/actions/:actionId
func (h *QualityControlHandler) DeleteAction(c *gin.Context) {
	actionIDStr := c.Param("actionId")
	actionID, err := uuid.Parse(actionIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid action ID", err.Error())
		return
	}

	if err := h.qcService.DeleteAction(c.Request.Context(), actionID); err != nil {
		response.InternalServerError(c, "Failed to delete action", err.Error())
		return
	}

	response.OK(c, "Action deleted successfully", nil)
}

// CompleteAction handles POST /api/v1/production/quality-control/:id/actions/:actionId/complete
func (h *QualityControlHandler) CompleteAction(c *gin.Context) {
	actionIDStr := c.Param("actionId")
	actionID, err := uuid.Parse(actionIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid action ID", err.Error())
		return
	}

	if err := h.qcService.CompleteAction(c.Request.Context(), actionID); err != nil {
		response.InternalServerError(c, "Failed to complete action", err.Error())
		return
	}

	response.OK(c, "Action completed successfully", nil)
}
