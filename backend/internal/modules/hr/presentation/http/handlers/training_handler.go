package handlers

import (
	"math"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"malaka/internal/modules/hr/domain/services"
	"malaka/internal/modules/hr/presentation/http/dto"
	"malaka/internal/shared/response"
)

// TrainingHandler handles HTTP requests for training operations
type TrainingHandler struct {
	service services.TrainingService
}

// NewTrainingHandler creates a new TrainingHandler
func NewTrainingHandler(service services.TrainingService) *TrainingHandler {
	return &TrainingHandler{service: service}
}

// CreateProgram creates a new training program
func (h *TrainingHandler) CreateProgram(c *gin.Context) {
	var req dto.TrainingProgramRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	program, err := dto.MapTrainingProgramRequestToEntity(&req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid date format: "+err.Error(), nil)
		return
	}

	if err := h.service.CreateProgram(c.Request.Context(), program); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "Training program created successfully", dto.MapTrainingProgramEntityToResponse(program))
}

// GetProgramByID retrieves a training program by ID
func (h *TrainingHandler) GetProgramByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	program, err := h.service.GetProgramByID(c.Request.Context(), id)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	if program == nil {
		response.Error(c, http.StatusNotFound, "Training program not found", nil)
		return
	}

	response.Success(c, http.StatusOK, "Training program retrieved successfully", dto.MapTrainingProgramEntityToResponse(program))
}

// GetAllPrograms retrieves all training programs
func (h *TrainingHandler) GetAllPrograms(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "50"))

	programs, total, err := h.service.GetAllPrograms(c.Request.Context(), page, pageSize)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var programResponses []*dto.TrainingProgramResponse
	for _, program := range programs {
		programResponses = append(programResponses, dto.MapTrainingProgramEntityToResponse(program))
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	result := dto.PaginatedProgramsResponse{
		Data:       programResponses,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}

	response.Success(c, http.StatusOK, "Training programs retrieved successfully", result)
}

// UpdateProgram updates a training program
func (h *TrainingHandler) UpdateProgram(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	var req dto.TrainingProgramRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	program, err := dto.MapTrainingProgramRequestToEntity(&req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid date format: "+err.Error(), nil)
		return
	}
	program.ID = id

	if err := h.service.UpdateProgram(c.Request.Context(), program); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Training program updated successfully", dto.MapTrainingProgramEntityToResponse(program))
}

// DeleteProgram deletes a training program
func (h *TrainingHandler) DeleteProgram(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	if err := h.service.DeleteProgram(c.Request.Context(), id); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Training program deleted successfully", nil)
}

// EnrollEmployee enrolls an employee in a training program
func (h *TrainingHandler) EnrollEmployee(c *gin.Context) {
	var req dto.TrainingEnrollmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	programID, err := uuid.Parse(req.ProgramID)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid program ID format", nil)
		return
	}

	employeeID, err := uuid.Parse(req.EmployeeID)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid employee ID format", nil)
		return
	}

	enrollment, err := h.service.EnrollEmployee(c.Request.Context(), programID, employeeID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "Employee enrolled successfully", dto.MapTrainingEnrollmentEntityToResponse(enrollment))
}

// GetAllEnrollments retrieves all enrollments
func (h *TrainingHandler) GetAllEnrollments(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "50"))

	var programID, employeeID *uuid.UUID

	if pidStr := c.Query("program_id"); pidStr != "" {
		pid, err := uuid.Parse(pidStr)
		if err == nil {
			programID = &pid
		}
	}

	if eidStr := c.Query("employee_id"); eidStr != "" {
		eid, err := uuid.Parse(eidStr)
		if err == nil {
			employeeID = &eid
		}
	}

	enrollments, total, err := h.service.GetAllEnrollments(c.Request.Context(), page, pageSize, programID, employeeID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	var enrollmentResponses []*dto.TrainingEnrollmentResponse
	for _, enrollment := range enrollments {
		enrollmentResponses = append(enrollmentResponses, dto.MapTrainingEnrollmentEntityToResponse(enrollment))
	}

	response.Success(c, http.StatusOK, "Enrollments retrieved successfully", enrollmentResponses)
	_ = total // Could be used for pagination
}

// UpdateProgress updates the progress of an enrollment
func (h *TrainingHandler) UpdateProgress(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	var req dto.TrainingProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	if err := h.service.UpdateProgress(c.Request.Context(), id, req.ProgressPercentage, req.FinalScore); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	enrollment, _ := h.service.GetEnrollmentByID(c.Request.Context(), id)
	response.Success(c, http.StatusOK, "Progress updated successfully", dto.MapTrainingEnrollmentEntityToResponse(enrollment))
}

// CompleteTraining marks a training as completed
func (h *TrainingHandler) CompleteTraining(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID format", nil)
		return
	}

	var req dto.TrainingCompleteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	if err := h.service.CompleteTraining(c.Request.Context(), id, req.FinalScore); err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	enrollment, _ := h.service.GetEnrollmentByID(c.Request.Context(), id)
	response.Success(c, http.StatusOK, "Training completed successfully", dto.MapTrainingEnrollmentEntityToResponse(enrollment))
}

// GetStatistics retrieves training statistics
func (h *TrainingHandler) GetStatistics(c *gin.Context) {
	stats, err := h.service.GetStatistics(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Statistics retrieved successfully", dto.MapTrainingStatisticsEntityToResponse(stats))
}
