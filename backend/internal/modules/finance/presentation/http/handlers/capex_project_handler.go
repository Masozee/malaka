package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/finance/domain/services"
	"malaka/internal/modules/finance/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
)

// CapexProjectHandler handles HTTP requests for capex project operations.
type CapexProjectHandler struct {
	service *services.CapexProjectService
}

// NewCapexProjectHandler creates a new CapexProjectHandler.
func NewCapexProjectHandler(service *services.CapexProjectService) *CapexProjectHandler {
	return &CapexProjectHandler{service: service}
}

// CreateCapexProject handles the creation of a new capex project.
func (h *CapexProjectHandler) CreateCapexProject(c *gin.Context) {
	var req dto.CapexProjectCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	capexProject := req.ToCapexProjectEntity()
	if err := h.service.CreateCapexProject(c.Request.Context(), capexProject); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to create capex project", err)
		return
	}

	resp := dto.FromCapexProjectEntity(capexProject)
	response.Success(c, http.StatusCreated, "Capex project created successfully", resp)
}

// GetCapexProjectByID handles the retrieval of a capex project by ID.
func (h *CapexProjectHandler) GetCapexProjectByID(c *gin.Context) {
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

	capexProject, err := h.service.GetCapexProjectByID(c.Request.Context(), parsedID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Capex project not found", err)
		return
	}

	resp := dto.FromCapexProjectEntity(capexProject)
	response.Success(c, http.StatusOK, "Capex project retrieved successfully", resp)
}

// GetAllCapexProjects handles the retrieval of all capex projects.
func (h *CapexProjectHandler) GetAllCapexProjects(c *gin.Context) {
	capexProjects, err := h.service.GetAllCapexProjects(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve capex projects", err)
		return
	}

	var responses []*dto.CapexProjectResponse
	for _, cp := range capexProjects {
		responses = append(responses, dto.FromCapexProjectEntity(cp))
	}

	response.Success(c, http.StatusOK, "Capex projects retrieved successfully", responses)
}

// UpdateCapexProject handles the update of an existing capex project.
func (h *CapexProjectHandler) UpdateCapexProject(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.Error(c, http.StatusBadRequest, "ID parameter is required", nil)
		return
	}

	var req dto.CapexProjectUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	parsedID, err := uuid.Parse(id)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "Invalid ID", err)
		return
	}

	capexProject := req.ToCapexProjectEntity()
	capexProject.ID = parsedID

	if err := h.service.UpdateCapexProject(c.Request.Context(), capexProject); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update capex project", err)
		return
	}

	resp := dto.FromCapexProjectEntity(capexProject)
	response.Success(c, http.StatusOK, "Capex project updated successfully", resp)
}

// DeleteCapexProject handles the deletion of a capex project by ID.
func (h *CapexProjectHandler) DeleteCapexProject(c *gin.Context) {
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

	if err := h.service.DeleteCapexProject(c.Request.Context(), parsedID); err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to delete capex project", err)
		return
	}

	response.Success(c, http.StatusOK, "Capex project deleted successfully", nil)
}
