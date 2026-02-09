package handlers

import (
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/uuid"
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

	classification := req.ToEntity()
	classification.CreatedAt = time.Now()
	classification.UpdatedAt = time.Now()

	if err := h.service.CreateClassification(c.Request.Context(), classification); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Classification created successfully", classification)
}

// GetClassificationByID handles retrieving a classification by its ID.
func (h *ClassificationHandler) GetClassificationByID(c *gin.Context) {
	id := c.Param("id")
	classification, err := h.service.GetClassificationByID(c.Request.Context(), uuid.MustParse(id))
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

	// First, retrieve the existing classification
	existingClassification, err := h.service.GetClassificationByID(c.Request.Context(), uuid.MustParse(id))
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if existingClassification == nil {
		response.NotFound(c, "Classification not found", nil)
		return
	}

	var req dto.UpdateClassificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	// Apply updates to existing classification
	req.ApplyToEntity(existingClassification)
	existingClassification.UpdatedAt = time.Now()

	if err := h.service.UpdateClassification(c.Request.Context(), existingClassification); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Classification updated successfully", existingClassification)
}

// DeleteClassification handles deleting a classification by its ID.
func (h *ClassificationHandler) DeleteClassification(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteClassification(c.Request.Context(), uuid.MustParse(id)); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Classification deleted successfully", nil)
}
