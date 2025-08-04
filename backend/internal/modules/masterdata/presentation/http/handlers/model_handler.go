package handlers

import (
	"time"

	"github.com/gin-gonic/gin"

	"malaka/internal/modules/masterdata/domain/entities"
	"malaka/internal/modules/masterdata/domain/services"
	"malaka/internal/modules/masterdata/presentation/http/dto"
	"malaka/internal/shared/response"
	"malaka/internal/shared/types"
)

// ModelHandler handles HTTP requests for model operations.
type ModelHandler struct {
	service *services.ModelService
}

// NewModelHandler creates a new ModelHandler.
func NewModelHandler(service *services.ModelService) *ModelHandler {
	return &ModelHandler{service: service}
}

// CreateModel handles the creation of a new model.
func (h *ModelHandler) CreateModel(c *gin.Context) {
	var req dto.CreateModelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	now := time.Now()
	model := &entities.Model{
		Code:        req.Code,
		Name:        req.Name,
		Description: req.Description,
		ArticleID:   req.ArticleID,
		Status:      req.Status,
		BaseModel: types.BaseModel{
			CreatedAt: now,
			UpdatedAt: now,
		},
	}

	if err := h.service.CreateModel(c.Request.Context(), model); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Model created successfully", model)
}

// GetModelByID handles retrieving a model by its ID.
func (h *ModelHandler) GetModelByID(c *gin.Context) {
	id := c.Param("id")
	model, err := h.service.GetModelByID(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}
	if model == nil {
		response.NotFound(c, "Model not found", nil)
		return
	}

	response.OK(c, "Model retrieved successfully", model)
}

// GetAllModels handles retrieving all models.
func (h *ModelHandler) GetAllModels(c *gin.Context) {
	models, err := h.service.GetAllModels(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Models retrieved successfully", models)
}

// UpdateModel handles updating an existing model.
func (h *ModelHandler) UpdateModel(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateModelRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	model := &entities.Model{
		Code:        req.Code,
		Name:        req.Name,
		Description: req.Description,
		ArticleID:   req.ArticleID,
		Status:      req.Status,
		BaseModel: types.BaseModel{
			UpdatedAt: time.Now(),
		},
	}
	model.ID = id // Set the ID from the URL parameter

	if err := h.service.UpdateModel(c.Request.Context(), model); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Model updated successfully", model)
}

// DeleteModel handles deleting a model by its ID.
func (h *ModelHandler) DeleteModel(c *gin.Context) {
	id := c.Param("id")
	if err := h.service.DeleteModel(c.Request.Context(), id); err != nil {
		response.InternalServerError(c, err.Error(), nil)
		return
	}

	response.OK(c, "Model deleted successfully", nil)
}
