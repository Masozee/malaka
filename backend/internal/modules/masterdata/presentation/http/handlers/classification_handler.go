package handlers

import (
	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
)

// ClassificationHandler handles HTTP requests for classification operations.
type ClassificationHandler struct {
	service *services.ClassificationService
}

// NewClassificationHandler creates a new ClassificationHandler.
func NewClassificationHandler(service *services.ClassificationService) *ClassificationHandler {
	return &ClassificationHandler{service: service}
}

// CreateClassification handles the creation of a new classification.
func (h *ClassificationHandler) CreateClassification(c *gin.Context) {
	var req dto.CreateClassificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	classification := &entities.Classification{
		Name: req.Name,
	}

	if err := h.service.CreateClassification(c.Request.Context(), classification); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Classification created successfully", classification)
}

// GetClassificationByID handles retrieving a classification by its ID.
func (h *ClassificationHandler) GetClassificationByID(c *gin.Context) {
	id := c.Param("id")
	classification, err := h.service.GetClassificationByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if classification == nil {
		response.NotFound(c, "Classification not found", nil)
		return
	}

	response.OK(c, "Classification retrieved successfully", classification)
}

// GetAllClassifications handles retrieving all classifications.
func (h *ClassificationHandler) GetAllClassifications(c *gin.Context) {
	classifications, err := h.service.GetAllClassifications(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Classifications retrieved successfully", classifications)
}

// UpdateClassification handles updating an existing classification.
func (h *ClassificationHandler) UpdateClassification(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateClassificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	classification := &entities.Classification{
		Name: req.Name,
	}
	classification.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateClassification(c.Request.Context(), classification); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Classification updated successfully", classification)
}

// DeleteClassification handles deleting a classification by its ID.
func (h *ClassificationHandler) DeleteClassification(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteClassification(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Classification deleted successfully", nil)
}
