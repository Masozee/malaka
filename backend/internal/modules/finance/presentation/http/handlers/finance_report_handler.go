package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// FinanceReportHandler handles HTTP requests for finance report operations.
type FinanceReportHandler struct {
	service *services.FinanceReportService
}

// NewFinanceReportHandler creates a new FinanceReportHandler.
func NewFinanceReportHandler(service *services.FinanceReportService) *FinanceReportHandler {
	return &FinanceReportHandler{service: service}
}

// CreateFinanceReport handles the creation of a new finance report.
func (h *FinanceReportHandler) CreateFinanceReport(c *gin.Context) {
	var req dto.FinanceReportCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	report := req.ToFinanceReportEntity()
	if err := h.service.CreateFinanceReport(c.Request.Context(), report); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create finance report", err)
		return
	}

	resp := dto.FromFinanceReportEntity(report)
	response.Success(c, http.StatusCreated, "Finance report created successfully", resp)
}

// GetFinanceReportByID handles the retrieval of a finance report by ID.
func (h *FinanceReportHandler) GetFinanceReportByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	report, err := h.service.GetFinanceReportByID(c.Request.Context(), parsedID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Finance report not found", err)
		return
	}

	resp := dto.FromFinanceReportEntity(report)
	response.Success(c, http.StatusOK, "Finance report retrieved successfully", resp)
}

// GetAllFinanceReports handles the retrieval of all finance reports.
func (h *FinanceReportHandler) GetAllFinanceReports(c *gin.Context) {
	reports, err := h.service.GetAllFinanceReports(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve finance reports", err)
		return
	}

	var responses []*dto.FinanceReportResponse
	for _, fr := range reports {
		responses = append(responses, dto.FromFinanceReportEntity(fr))
	}

	response.Success(c, http.StatusOK, "Finance reports retrieved successfully", responses)
}

// UpdateFinanceReport handles the update of an existing finance report.
func (h *FinanceReportHandler) UpdateFinanceReport(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	var req dto.FinanceReportUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	report := req.ToFinanceReportEntity()
	report.ID = parsedID

	if err := h.service.UpdateFinanceReport(c.Request.Context(), report); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update finance report", err)
		return
	}

	resp := dto.FromFinanceReportEntity(report)
	response.Success(c, http.StatusOK, "Finance report updated successfully", resp)
}

// DeleteFinanceReport handles the deletion of a finance report by ID.
func (h *FinanceReportHandler) DeleteFinanceReport(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	if err := h.service.DeleteFinanceReport(c.Request.Context(), parsedID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete finance report", err)
		return
	}

	response.Success(c, http.StatusOK, "Finance report deleted successfully", nil)
}
